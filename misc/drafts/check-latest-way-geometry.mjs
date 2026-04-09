#!/usr/bin/env node

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, "../..")
const validatorPath = path.resolve(projectRoot, "src/0-common/11-geometry-validator.js")
const validatorSource = fs.readFileSync(validatorPath, "utf8")
const { validateWayGeometry } = new Function(
    "Math",
    "const { abs, min, max } = Math;\n" + validatorSource + "\nreturn { validateWayGeometry }",
)(Math)

const args = parseArgs(process.argv.slice(2))
if (args.help === "true") {
    printHelp()
    process.exit(0)
}
const apiBase = normalizeApiBase(args.apiBase ?? "https://api.openstreetmap.org/api/0.6")
const windowMinutes = parseIntOrDefault(args.minutes, 60)
const maxChangesets = parseIntOrDefault(args.changesets, 100)
const maxWays = parseIntOrDefault(args.ways, 5000)
const downloadConcurrency = parseIntOrDefault(args.downloadConcurrency, 4)
const validateConcurrency = parseIntOrDefault(args.validateConcurrency, 8)
const outputPath = args.out ? path.resolve(process.cwd(), args.out) : null

main().catch(error => {
    console.error(error?.stack ?? error)
    process.exit(1)
})

async function main() {
    const end = new Date()
    const start = new Date(end.getTime() - windowMinutes * 60 * 1000)

    console.log(`API: ${apiBase}`)
    console.log(`Window: ${start.toISOString()} .. ${end.toISOString()}`)
    console.log(`Limits: changesets=${maxChangesets}, ways=${maxWays}`)

    const changesets = await fetchLatestChangesets({ apiBase, start, end, maxChangesets })
    console.log(`Loaded changesets: ${changesets.length}`)
    if (changesets.length === 0) {
        console.log("No changesets in selected window")
        return
    }

    const wayIds = await collectWayIdsFromChangesets({ apiBase, changesets, maxWays, concurrency: downloadConcurrency })
    console.log(`Collected way IDs: ${wayIds.length}`)
    if (wayIds.length === 0) {
        console.log("No way IDs found in recent changesets")
        return
    }

    const validationResults = await mapLimit(wayIds, validateConcurrency, wayId =>
        validateCurrentWayGeometry({ apiBase, wayId }),
    )
    const checked = validationResults.filter(i => i.status === "ok")
    const withIssues = checked.filter(i => i.issues.length > 0)
    const skipped = validationResults.filter(i => i.status !== "ok")

    const issuesByCode = {}
    withIssues.forEach(result => {
        result.issues.forEach(issue => {
            issuesByCode[issue.code] = (issuesByCode[issue.code] ?? 0) + 1
        })
    })

    const report = {
        apiBase,
        start: start.toISOString(),
        end: end.toISOString(),
        stats: {
            changesets: changesets.length,
            wayIds: wayIds.length,
            checkedWays: checked.length,
            waysWithIssues: withIssues.length,
            skippedWays: skipped.length,
            issuesByCode,
        },
        skippedWays: skipped.map(i => ({
            wayId: i.wayId,
            status: i.status,
            reason: i.reason,
        })),
        waysWithIssues: withIssues.map(i => ({
            wayId: i.wayId,
            issueCount: i.issues.length,
            issues: i.issues.map(issue => ({
                code: issue.code,
                description: issue.description,
                points: issue.points?.map(p => p.id) ?? [],
                pointGroups: issue.pointGroups?.map(group => group.map(p => p.id)) ?? [],
            })),
            url: `https://www.openstreetmap.org/way/${i.wayId}`,
        })),
    }

    console.log("Summary:")
    console.log(JSON.stringify(report.stats, null, 2))
    if (report.waysWithIssues.length > 0) {
        console.log("Sample ways with issues:")
        report.waysWithIssues.slice(0, 20).forEach(item => {
            const codes = item.issues.map(i => i.code).join(", ")
            console.log(`- way/${item.wayId}: ${codes}`)
        })
    }
    if (outputPath) {
        fs.writeFileSync(outputPath, JSON.stringify(report, null, 2) + "\n", "utf8")
        console.log(`Report written: ${outputPath}`)
    }
}

/**
 * @param {{
 *   apiBase: string
 *   start: Date
 *   end: Date
 *   maxChangesets: number
 * }} input
 * @return {Promise<Array<{id:number, created_at:string}>>}
 */
async function fetchLatestChangesets(input) {
    const { apiBase, start, end, maxChangesets } = input
    const url = `${apiBase}/changesets.json?time=${encodeURIComponent(start.toISOString())},${encodeURIComponent(end.toISOString())}`
    const json = await fetchJSON(url)
    const list = Array.isArray(json?.changesets) ? json.changesets : Array.isArray(json?.elements) ? json.elements : []
    return list
        .map(i => ({ ...i, id: typeof i?.id === "string" ? Number.parseInt(i.id, 10) : i?.id }))
        .filter(i => i && Number.isFinite(i.id))
        .sort((a, b) => Date.parse(b.created_at ?? 0) - Date.parse(a.created_at ?? 0))
        .slice(0, maxChangesets)
}

/**
 * @param {{
 *   apiBase: string
 *   changesets: Array<{id:number}>
 *   maxWays: number
 *   concurrency: number
 * }} input
 * @return {Promise<number[]>}
 */
async function collectWayIdsFromChangesets(input) {
    const { apiBase, changesets, maxWays, concurrency } = input
    const wayIds = new Set()

    await mapLimit(changesets, concurrency, async changeset => {
        if (wayIds.size >= maxWays) {
            return
        }
        const url = `${apiBase}/changeset/${changeset.id}/download`
        let xml
        try {
            xml = await fetchText(url)
        } catch (error) {
            console.warn(`Skip changeset/${changeset.id}: ${error?.message ?? error}`)
            return
        }
        for (const wayId of extractWayIdsFromOsmChange(xml)) {
            wayIds.add(wayId)
            if (wayIds.size >= maxWays) {
                break
            }
        }
    })

    return Array.from(wayIds)
}

/**
 * @param {{apiBase: string, wayId: number}} input
 * @return {Promise<{
 *  wayId: number,
 *  status: "ok"|"missing"|"deleted"|"error",
 *  reason?: string,
 *  issues?: any[]
 * }>}
 */
async function validateCurrentWayGeometry(input) {
    const { apiBase, wayId } = input
    const url = `${apiBase}/way/${wayId}/full.json`
    try {
        const json = await fetchJSON(url)
        const elements = Array.isArray(json?.elements) ? json.elements : []
        const way = elements.find(i => i.type === "way" && i.id === wayId) ?? elements.find(i => i.type === "way")
        if (!way) {
            return { wayId, status: "missing", reason: "way element not found in full.json" }
        }
        const nodesMap = new Map(elements.filter(i => i.type === "node").map(node => [node.id.toString(), node]))
        const issues = validateWayGeometry(way, nodesMap)
        return { wayId, status: "ok", issues }
    } catch (error) {
        const message = error?.message ?? String(error)
        if (message.includes("HTTP 410")) {
            return { wayId, status: "deleted", reason: "HTTP 410" }
        }
        if (message.includes("HTTP 404")) {
            return { wayId, status: "missing", reason: "HTTP 404" }
        }
        return { wayId, status: "error", reason: message }
    }
}

/**
 * @param {string} xml
 * @return {number[]}
 */
function extractWayIdsFromOsmChange(xml) {
    const ids = new Set()
    const regex = /<way\b[^>]*\bid="(-?\d+)"/g
    let match
    while ((match = regex.exec(xml)) !== null) {
        const id = parseInt(match[1], 10)
        if (Number.isFinite(id) && id > 0) {
            ids.add(id)
        }
    }
    return Array.from(ids)
}

/**
 * @param {string} url
 * @return {Promise<any>}
 */
async function fetchJSON(url) {
    const text = await fetchText(url, "application/json")
    return JSON.parse(text)
}

/**
 * @param {string} url
 * @param {string=} accept
 * @return {Promise<string>}
 */
async function fetchText(url, accept) {
    const maxAttempts = 4
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const response = await fetch(url, {
            headers: accept ? { Accept: accept } : undefined,
        })
        if (response.ok) {
            return await response.text()
        }
        if ((response.status === 429 || response.status >= 500) && attempt < maxAttempts) {
            await sleep(300 * 2 ** (attempt - 1))
            continue
        }
        throw new Error(`HTTP ${response.status} for ${url}`)
    }
    throw new Error(`Failed to fetch ${url}`)
}

/**
 * @template T,U
 * @param {T[]} items
 * @param {number} limit
 * @param {(item:T, index:number)=>Promise<U>} worker
 * @return {Promise<U[]>}
 */
async function mapLimit(items, limit, worker) {
    if (limit <= 1) {
        const out = []
        for (let i = 0; i < items.length; i++) {
            out.push(await worker(items[i], i))
        }
        return out
    }
    const out = new Array(items.length)
    let cursor = 0
    async function runOne() {
        while (true) {
            const index = cursor++
            if (index >= items.length) {
                return
            }
            out[index] = await worker(items[index], index)
        }
    }
    const workers = Array.from({ length: Math.min(limit, items.length) }, () => runOne())
    await Promise.all(workers)
    return out
}

/**
 * @param {string[]} argv
 * @return {Record<string, string>}
 */
function parseArgs(argv) {
    const out = {}
    for (let i = 0; i < argv.length; i++) {
        const token = argv[i]
        if (!token.startsWith("--")) {
            continue
        }
        const key = token.slice(2)
        const next = argv[i + 1]
        if (!next || next.startsWith("--")) {
            out[key] = "true"
            continue
        }
        out[key] = next
        i++
    }
    return out
}

function printHelp() {
    console.log(`Usage:
  node misc/drafts/check-latest-way-geometry.mjs [options]

Options:
  --apiBase <url>               OSM API base, default: https://api.openstreetmap.org/api/0.6
  --minutes <n>                 Time window in minutes, default: 60
  --changesets <n>              Max latest changesets to inspect, default: 30
  --ways <n>                    Max unique ways to validate, default: 500
  --downloadConcurrency <n>     Changeset-download concurrency, default: 4
  --validateConcurrency <n>     Way-validation concurrency, default: 8
  --out <path>                  Save full JSON report to file
  --help                        Show this help
`)
}

/**
 * @param {string|undefined} value
 * @param {number} fallback
 * @return {number}
 */
function parseIntOrDefault(value, fallback) {
    const parsed = Number.parseInt(value ?? "", 10)
    return Number.isFinite(parsed) ? parsed : fallback
}

/**
 * @param {string} apiBase
 * @return {string}
 */
function normalizeApiBase(apiBase) {
    return apiBase.endsWith("/") ? apiBase.slice(0, -1) : apiBase
}

/**
 * @param {number} ms
 * @return {Promise<void>}
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
