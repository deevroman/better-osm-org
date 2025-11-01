import fs from "fs"
import path from "path"

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

const sources = readJsFilesRecursively(".").map(file => fs.readFileSync(file, "utf8"))

const outPath = "../better-osm-org.user.js"
const oldFile = fs.readFileSync(outPath, "utf8")
const newFile = sources.join("\n")
if (oldFile !== newFile) {
    fs.writeFileSync(outPath, newFile)
}
