import fs from "node:fs"
import path from "node:path"
import { parse } from "@babel/parser"
import { generate } from "@babel/generator"

const propertyNames = new Set(["innerHTML", "outerHTML"])
const sourceExtensions = new Set([".js", ".mjs", ".cjs"])
const defaultInput = "src"

const args = process.argv.slice(2)
if (args.includes("--help") || args.includes("-h")) {
    console.log("Usage: node misc/drafts/list-html-property-usages.js [file-or-directory ...]")
    console.log(`Defaults to ${defaultInput}; directories are searched recursively.`)
    process.exit(0)
}

function getFiles(inputPath) {
    const absolutePath = path.resolve(inputPath)
    const stat = fs.statSync(absolutePath)

    if (stat.isFile()) {
        return sourceExtensions.has(path.extname(absolutePath)) ? [absolutePath] : []
    }

    if (!stat.isDirectory()) {
        return []
    }

    return fs
        .readdirSync(absolutePath, { withFileTypes: true })
        .sort((a, b) => a.name.localeCompare(b.name))
        .flatMap(entry => {
            if (
                entry.name === "node_modules" ||
                entry.name === ".git" ||
                entry.name === "tests" ||
                entry.name === "artifacts"
            ) {
                return []
            }

            return getFiles(path.join(absolutePath, entry.name))
        })
}

function getPropertyName(node) {
    if (!node) return null

    if (!node.computed && node.property?.type === "Identifier") {
        return node.property.name
    }

    if (node.computed && node.property?.type === "StringLiteral") {
        return node.property.value
    }

    return null
}

function getObjectPropertyName(node) {
    if (!node) return null

    if (!node.computed && node.key?.type === "Identifier") {
        return node.key.name
    }

    if (node.computed && node.key?.type === "StringLiteral") {
        return node.key.value
    }

    return null
}

function walk(node, parent, callback) {
    if (!node || typeof node !== "object") return

    callback(node, parent)

    for (const [key, value] of Object.entries(node)) {
        if (
            key === "loc" ||
            key === "start" ||
            key === "end" ||
            key === "leadingComments" ||
            key === "innerComments" ||
            key === "trailingComments"
        ) {
            continue
        }

        if (Array.isArray(value)) {
            value.forEach(child => walk(child, node, callback))
        } else if (value && typeof value === "object" && typeof value.type === "string") {
            walk(value, node, callback)
        }
    }
}

function getUsageKind(node, parent) {
    if (node.type === "MemberExpression" || node.type === "OptionalMemberExpression") {
        const propertyName = getPropertyName(node)
        if (!propertyNames.has(propertyName)) return null

        if (parent?.type === "AssignmentExpression" && parent.left === node) {
            return `${propertyName} / write (${parent.operator})`
        }

        if (parent?.type === "UpdateExpression" && parent.argument === node) {
            return `${propertyName} / update (${parent.operator})`
        }

        return `${propertyName} / read`
    }

    if (node.type === "ObjectProperty") {
        const propertyName = getObjectPropertyName(node)
        if (!propertyNames.has(propertyName)) return null

        if (parent?.type === "ObjectPattern") {
            return `${propertyName} / destructuring`
        }

        return `${propertyName} / object property`
    }

    return null
}

function getDisplayedCode(node, parent) {
    if (parent?.type === "AssignmentExpression" && parent.left === node) {
        return generate(parent).code
    }

    if (parent?.type === "UpdateExpression" && parent.argument === node) {
        return generate(parent).code
    }

    return generate(node).code
}

function isInRange(position, ranges) {
    return ranges.some(range => position >= range.start && position < range.end)
}

function getLineLocation(code, position) {
    const lineStart = code.lastIndexOf("\n", position - 1) + 1
    const line = code.slice(0, position).split("\n").length
    const column = position - lineStart + 1
    const lineEnd = code.indexOf("\n", position)

    return {
        line,
        column,
        text: code.slice(lineStart, lineEnd === -1 ? code.length : lineEnd).trim(),
    }
}

function getEmbeddedUsageKind(propertyName, code, position, matchEnd) {
    const restOfLine = code.slice(
        matchEnd,
        code.indexOf("\n", matchEnd) === -1 ? code.length : code.indexOf("\n", matchEnd),
    )
    const operator = restOfLine.match(/^\s*(\+=|=)/)?.[1]

    if (operator) {
        return `${propertyName} / embedded string write (${operator})`
    }

    return `${propertyName} / embedded string read`
}

const inputPaths = args.length > 0 ? args : [defaultInput]
const files = inputPaths.flatMap(getFiles)
const usagesByKind = new Map()
const parseErrors = []

for (const file of files) {
    const code = fs.readFileSync(file, "utf8")
    let ast

    try {
        ast = parse(code, {
            sourceType: "unambiguous",
            attachComment: false,
            comments: true,
        })
    } catch (error) {
        parseErrors.push(`${path.relative(process.cwd(), file)}: ${error.message}`)
        continue
    }

    const usageRanges = []
    const stringRanges = []

    walk(ast, null, (node, parent) => {
        if (["StringLiteral", "DirectiveLiteral", "TemplateElement"].includes(node.type)) {
            stringRanges.push({ start: node.start, end: node.end })
        }

        const kind = getUsageKind(node, parent)
        if (!kind) return

        usageRanges.push({ start: node.start, end: node.end })
        const usages = usagesByKind.get(kind) ?? []
        usages.push({
            file,
            line: node.loc.start.line,
            column: node.loc.start.column + 1,
            code: getDisplayedCode(node, parent),
        })
        usagesByKind.set(kind, usages)
    })

    for (const match of code.matchAll(/\b(innerHTML|outerHTML)\b/g)) {
        const position = match.index
        if (
            position === undefined ||
            !isInRange(position, stringRanges) ||
            isInRange(position, usageRanges) ||
            isInRange(position, ast.comments ?? [])
        ) {
            continue
        }

        const location = getLineLocation(code, position)
        const kind = getEmbeddedUsageKind(match[1], code, position, position + match[0].length)
        const usages = usagesByKind.get(kind) ?? []
        usages.push({
            file,
            line: location.line,
            column: location.column,
            code: location.text,
        })
        usagesByKind.set(kind, usages)
    }
}

const usages = [...usagesByKind.entries()].sort(([a], [b]) => a.localeCompare(b))
const total = usages.reduce((sum, [, entries]) => sum + entries.length, 0)

console.log(`Found ${total} usages in ${files.length} file${files.length === 1 ? "" : "s"}.`)
for (const [kind, entries] of usages) {
    console.log(`  ${kind}: ${entries.length}`)
}

for (const [kind, entries] of usages) {
    entries.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.column - b.column)
    console.log(`\n--- ${kind} (${entries.length}) ---`)

    for (const entry of entries) {
        const location = `${path.relative(process.cwd(), entry.file)}:${entry.line}:${entry.column}`
        console.log(`${location}:`)
        entry.code.split("\n").forEach(line => console.log(`    ${line}`))
    }
}

if (parseErrors.length > 0) {
    console.error("\nCould not parse files:")
    parseErrors.forEach(error => console.error(`  ${error}`))
    process.exitCode = 1
}
