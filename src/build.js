import fs from "fs"
import path from "path"
import http from "http"
import vm from "vm"
import { execSync } from "child_process"

const outPath = path.resolve("../better-osm-org.user.js")
const args = new Set(process.argv.slice(2))
let lastSkippedWriteReason = ""
const localMatchLine = "// @match        http://localhost:3000/*"

function resolveGitPath(gitPath) {
    try {
        return path.resolve(execSync(`git rev-parse --git-path ${gitPath}`, { encoding: "utf8" }).trim())
    } catch {
        return null
    }
}

const gitBusyMarkers = [
    ["index.lock", "git index is locked"],
    ["HEAD.lock", "git HEAD is locked"],
    ["packed-refs.lock", "git refs are locked"],
    ["MERGE_HEAD", "git merge is in progress"],
    ["CHERRY_PICK_HEAD", "git cherry-pick is in progress"],
    ["REVERT_HEAD", "git revert is in progress"],
    ["BISECT_LOG", "git bisect is in progress"],
    ["rebase-merge", "git rebase is in progress"],
    ["rebase-apply", "git am/rebase is in progress"],
]

const resolvedGitBusyMarkers = gitBusyMarkers
    .map(([gitPath, reason]) => {
        const resolvedPath = resolveGitPath(gitPath)
        return resolvedPath ? { path: resolvedPath, reason } : null
    })
    .filter(Boolean)

function getGitBusyReason() {
    for (const marker of resolvedGitBusyMarkers) {
        if (fs.existsSync(marker.path)) {
            return marker.reason
        }
    }
    return ""
}

function readJsFilesRecursively(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    let result = []

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        if (fullPath.includes("tests")) {
            continue
        }
        if (entry.isDirectory()) {
            result = result.concat(readJsFilesRecursively(fullPath))
        } else if (/^\d+.+\.js$/.test(entry.name)) {
            result.push(fullPath)
        }
    }

    return result
}

function stripLocalhostMatch(script) {
    return script
        .split("\n")
        .filter(line => line !== localMatchLine)
        .join("\n")
}

function injectLocalhostMatch(script) {
    if (script.includes(localMatchLine)) {
        return script
    }

    return script.replace(
        "// @match        https://taginfo.openstreetmap.org/*",
        `${localMatchLine}\n// @match        https://taginfo.openstreetmap.org/*`,
    )
}

function buildOnce() {
    const sources = readJsFilesRecursively(".").map(file => fs.readFileSync(file, "utf8"))

    const oldFile = fs.existsSync(outPath) ? fs.readFileSync(outPath, "utf8") : ""
    const newFile = stripLocalhostMatch(sources.join("\n"))
    if (oldFile !== newFile) {
        try {
            new vm.Script(newFile, { filename: outPath })
        } catch (error) {
            console.error(`Syntax check failed, not writing: ${error.message}`)
            return
        }

        const gitBusyReason = getGitBusyReason()
        if (gitBusyReason) {
            if (lastSkippedWriteReason !== gitBusyReason) {
                console.log(`Skip writing ${path.basename(outPath)}: ${gitBusyReason}`)
            }
            lastSkippedWriteReason = gitBusyReason
            return
        }

        lastSkippedWriteReason = ""
        fs.writeFileSync(outPath, newFile)
        console.log(new Date())
    }
}

const shouldWatch = args.has("--watch")
const shouldServe = args.has("--serve")

buildOnce()
if (shouldWatch) {
    setInterval(buildOnce, 500)
}

const port = Number(process.env.PORT) || 7777
const host = process.env.HOST || "127.0.0.1"

if (shouldServe) {
    const server = http.createServer((req, res) => {
        try {
            const url = new URL(req.url || "/", `http://${host}:${port}`)

            let out
            if (url.searchParams.has("master.user.js")) {
                out = execSync("git show master:better-osm-org.user.js", { encoding: "utf8" })
            } else {
                out = fs.readFileSync(outPath, "utf8")
            }

            res.writeHead(200, { "content-type": "text/javascript; charset=utf-8" })
            res.end(injectLocalhostMatch(out))
        } catch (error) {
            res.writeHead(500, { "content-type": "text/plain; charset=utf-8" })
            res.end(`Server error: ${error.message}`)
        }
    })

    server.listen(port, host, () => {
        console.log(`http://${host}:${port}/server.php?head.user.js`)
    })
}
