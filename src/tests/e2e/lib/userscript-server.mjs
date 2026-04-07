import fs from "node:fs/promises"
import http from "node:http"
import { log } from "./runtime-utils.mjs"

export async function startUserscriptServer({
    userscriptUrlFromEnv,
    userscriptPath,
    scriptServerHost,
    scriptServerPort,
    logFn = log,
}) {
    if (userscriptUrlFromEnv) {
        logFn(`Using userscript URL from env: ${userscriptUrlFromEnv}`)
        return { server: null, userscriptUrl: userscriptUrlFromEnv }
    }

    const scriptSource = await fs.readFile(userscriptPath, "utf8")

    const server = http.createServer((req, res) => {
        const reqUrl = new URL(req.url || "/", `http://${scriptServerHost}:${scriptServerPort}`)

        if (reqUrl.pathname === "/better-osm-org.user.js") {
            res.writeHead(200, {
                "content-type": "text/plain; charset=utf-8",
                "cache-control": "no-store",
            })
            res.end(scriptSource)
            return
        }

        if (reqUrl.pathname === "/healthz") {
            res.writeHead(200, { "content-type": "text/plain; charset=utf-8" })
            res.end("ok")
            return
        }

        res.writeHead(404, { "content-type": "text/plain; charset=utf-8" })
        res.end("Not found")
    })

    await new Promise((resolve, reject) => {
        server.once("error", reject)
        server.listen(scriptServerPort, scriptServerHost, resolve)
    })

    const userscriptUrl = `http://${scriptServerHost}:${scriptServerPort}/better-osm-org.user.js`
    logFn(`Userscript server is running: ${userscriptUrl}`)
    return { server, userscriptUrl }
}
