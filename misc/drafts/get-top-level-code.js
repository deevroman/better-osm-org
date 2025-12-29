import fs from "node:fs"
import { parse } from "@babel/parser"
import { generate } from "@babel/generator"
const code = fs.readFileSync("better-osm-org.user.js", "utf8")

const ast = parse(code, {
    sourceType: "unambiguous",
    attachComment: false,
    comments: false,
})

function isTrivial(node) {
    if (!node) return true

    if (
        node.type === "NumericLiteral" ||
        node.type === "StringLiteral" ||
        node.type === "BooleanLiteral" ||
        node.type === "NullLiteral"
    ) {
        return true
    }
    if (node.type === "Identifier") {
        return true
    }

    if (node.type === "BinaryExpression") {
        return isTrivial(node.left) && isTrivial(node.right)
    }

    if (node.type === "ArrayExpression") {
        return node.elements.every(el => isTrivial(el))
    }

    if (node.type === "ObjectExpression") {
        return node.properties.every(prop => {
            if (prop.type === "SpreadElement") {
                return false
            }

            if (prop.kind && prop.kind !== "init") {
                return false
            }

            if (prop.computed) {
                return false
            }

            const keyOk =
                prop.key.type === "Identifier" ||
                prop.key.type === "StringLiteral" ||
                prop.key.type === "NumericLiteral"

            if (!keyOk) {
                return false
            }

            return isTrivial(prop.value)
        })
    }

    if (node.type === "NewExpression") {
        const callee = node.callee
        const trivialCallee =
            callee.type === "Identifier" && ["Set", "Map", "Date", "URLSearchParams"].includes(callee.name)

        if (trivialCallee) {
            if (!node.arguments || node.arguments.length === 0) {
                return true
            }
            if (node.arguments.length === 1) {
                return isTrivial(node.arguments[0])
            }
        }
    }

    if (node.type === "FunctionExpression" || node.type === "ArrowFunctionExpression") {
        return true
    }

    return false
}

const executable = ast.program.body.filter(node => {
    if (node.type === "FunctionDeclaration" || node.type === "ClassDeclaration" || node.type === "ImportDeclaration") {
        return false
    }

    if (node.type === "VariableDeclaration") {
        return false
        const allTrivial = node.declarations.every(d => !d.init || isTrivial(d.init))
        return !allTrivial
    }

    return true
})

for (const node of executable) {
    const { code } = generate(node)
    console.log("----")
    console.log(code)
}
