#!/usr/bin/env node

import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const TAGINFO_URL = "https://taginfo.openstreetmap.org/api/4/relations/all?sortname=count&sortorder=desc"
const MIN_COUNT = 42
const SKIPPED_PREFIXES = ["was:", "disused:", "abandoned:"];
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, "..")
const targetFilePath = path.resolve(projectRoot, "src/4-modules/43-object-page.js")

main().catch(error => {
    console.error(error?.stack ?? error)
    process.exit(1)
})

async function main() {
    console.log(`Fetching relation types from: ${TAGINFO_URL}`)
    const apiResponse = await fetchTaginfo(TAGINFO_URL)
    const typesWithHighCount = extractTypesWithHighCount(apiResponse, MIN_COUNT)
    let failed = false

    try {
        const sourceCode = await fs.readFile(targetFilePath, "utf8")
        const allowedRelationTypes = extractAllowedRelationTypes(sourceCode)
        const missingTypes = typesWithHighCount.filter(type => !allowedRelationTypes.has(type))

        console.log(`Found relation types with count > ${MIN_COUNT}: ${typesWithHighCount.length}`)
        console.log(`Found allowedRelationTypes in ${path.relative(projectRoot, targetFilePath)}: ${allowedRelationTypes.size}`)

        if (missingTypes.length > 0) {
            failed = true
            console.error(`\nMissing relation types in allowedRelationTypes (${missingTypes.length}):`)
            missingTypes.forEach(type => console.error(`- ${type}`))
        } else {
            console.log(`\nallowedRelationTypes contains all relation types with count > ${MIN_COUNT}.`)
        }
    } catch (error) {
        failed = true
        console.error(error?.stack ?? error)
    } finally {
        printCopyPasteList(typesWithHighCount, MIN_COUNT)
    }

    if (failed) {
        process.exit(1)
    }
}

/**
 * @param {string} url
 * @return {Promise<any>}
 */
async function fetchTaginfo(url) {
    const response = await fetch(url, {
        headers: { Accept: "application/json" },
    })
    if (!response.ok) {
        throw new Error(`Failed to fetch taginfo data: HTTP ${response.status}`)
    }
    return await response.json()
}

/**
 * @param {any} apiResponse
 * @param {number} minCount
 * @return {string[]}
 */
function extractTypesWithHighCount(apiResponse, minCount) {
    const rows = Array.isArray(apiResponse?.data) ? apiResponse.data : []
    return rows
        .filter(item => Number(item?.count) > minCount && typeof item?.rtype === "string")
        .filter(item => !SKIPPED_PREFIXES.some(prefix => item.rtype.startsWith(prefix)))
        .map(item => item.rtype)
}

/**
 * @param {string} sourceCode
 * @return {Set<string>}
 */
function extractAllowedRelationTypes(sourceCode) {
    // Execute source in an isolated function and read the local constant directly.
    const extracted = new Function(
        sourceCode +
            '\nreturn typeof allowedRelationTypes !== "undefined" ? allowedRelationTypes : undefined;',
    )()
    if (!(extracted instanceof Set)) {
        throw new Error("Could not read allowedRelationTypes as a Set from src/4-modules/43-object-page.js")
    }
    for (const value of extracted) {
        if (typeof value !== "string") {
            throw new Error("allowedRelationTypes contains a non-string value")
        }
    }
    return extracted
}

/**
 * @param {string[]} relationTypes
 * @param {number} minCount
 * @return {void}
 */
function printCopyPasteList(relationTypes, minCount) {
    console.log(`\nRelation types with count > ${minCount} (copy-paste list):`)
    console.log(relationTypes.map(type => `"${type}"`).join(",\n"))
}
