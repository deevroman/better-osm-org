import fs from "fs"
import path from "path"
import http from "http"
import { execSync } from "child_process"

const outPath = path.resolve("../better-osm-org.user.js")
const args = new Set(process.argv.slice(2))

function readJsFilesRecursively(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    let result = []

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()) {
            result = result.concat(readJsFilesRecursively(fullPath))
        } else if (/^\d+.+\.js$/.test(entry.name)) {
            result.push(fullPath)
        }
    }

    return result
}

function buildOnce() {
    const sources = readJsFilesRecursively(".").map(file => fs.readFileSync(file, "utf8"))

    const oldFile = fs.existsSync(outPath) ? fs.readFileSync(outPath, "utf8") : ""
    const newFile = sources.join("\n")
    if (oldFile !== newFile) {
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
            if (url.searchParams.has("master_user_js")) {
                out = execSync("git show master:better-osm-org.user.js", { encoding: "utf8" })
            } else {
                out = fs.readFileSync(outPath, "utf8")
            }

            res.writeHead(200, { "content-type": "text/javascript; charset=utf-8" })
            res.end(out)
        } catch (error) {
            res.writeHead(500, { "content-type": "text/plain; charset=utf-8" })
            res.end(`Server error: ${error.message}`)
        }
    })

    server.listen(port, host, () => {
        console.log(`http://${host}:${port}/server.php?head.user.js`)
    })
}
