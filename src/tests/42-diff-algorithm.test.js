import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"
import { isDeepStrictEqual } from "node:util"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const diffAlgorithmPath = path.resolve(__dirname, "../4-modules/42-diff-algorithm.js")
const diffSource = fs.readFileSync(diffAlgorithmPath, "utf8")

function toBlocks(pairs) {
    const blocks = []
    for (const [a, b] of pairs) {
        const op = a === null ? "+" : b === null ? "-" : a === b ? "=" : "~"
        const ch = op === "+" ? b : a
        const last = blocks[blocks.length - 1]
        if (last && last.op === op) {
            last.text += ch
        } else {
            blocks.push({ op, text: ch })
        }
    }
    return blocks
}

function showBlocks(blocks) {
    return blocks.map(b => `${b.op} "${b.text}"`).join("\n")
}

function assertDiffBlocks(actualPairs, expectedBlocks) {
    const actualBlocks = toBlocks(actualPairs)
    if (!isDeepStrictEqual(actualBlocks, expectedBlocks)) {
        assert.fail(`Diff mismatch\n\nExpected:\n${showBlocks(expectedBlocks)}\n\nActual:\n${showBlocks(actualBlocks)}`)
    }
}

function assertStringDiffBlocks(from, to, expectedBlocks, oneReplaceCost = 2) {
    let actualPairs
    try {
        actualPairs = stringsDiff(from, to, oneReplaceCost)
    } catch (error) {
        assert.fail(`stringsDiff threw for "${from}" -> "${to}":\n${error instanceof Error ? error.stack : String(error)}`)
    }
    assertDiffBlocks(actualPairs, expectedBlocks)
}

const { arraysDiff, stringsDiff } = new Function(diffSource + "\nreturn {arraysDiff, stringsDiff}")()

test("empty diff for two empty arrays", () => {
    assert.deepStrictEqual(arraysDiff([], []), [])
})

test("identical arrays", () => {
    assert.deepStrictEqual(arraysDiff([1, 2, 3], [1, 2, 3]), [
        [1, 1],
        [2, 2],
        [3, 3],
    ])
})

test("marks insertions with null on the left side", () => {
    assert.deepStrictEqual(arraysDiff([1, 3], [1, 2, 3]), [
        [1, 1],
        [null, 2],
        [3, 3],
    ])
})

test("marks deletions with null on the right side", () => {
    assert.deepStrictEqual(arraysDiff([1, 2, 3], [1, 3]), [
        [1, 1],
        [2, null],
        [3, 3],
    ])
})

test("prefers delete+insert when replacement cost is default (2)", () => {
    assert.deepStrictEqual(arraysDiff([1], [2]), [
        [null, 2],
        [1, null],
    ])
})

test("uses replacement when one_replace_cost is 1", () => {
    assert.deepStrictEqual(arraysDiff([1], [2], 1), [[1, 2]])
})

test("for relation-like members, matches by type+ref even when role changes", () => {
    assert.deepStrictEqual(arraysDiff([{ type: "node", ref: 1, role: "outer" }], [{ type: "node", ref: 1, role: "inner" }]), [
        [
            { type: "node", ref: 1, role: "outer" },
            { type: "node", ref: 1, role: "inner" },
        ],
    ])
})

test("string diff greek -> greek;kebab inserts ;kebab", () => {
    assertStringDiffBlocks("greek", "greek;kebab", [
        { op: "=", text: "greek" },
        { op: "+", text: ";kebab" },
    ])
})

test("string diff domain -> full https URL with trailing slash", () => {
    assertStringDiffBlocks("thebluewater.com.au", "https://thebluewater.com.au/", [
        { op: "+", text: "https://" },
        { op: "=", text: "thebluewater.com.au" },
        { op: "+", text: "/" },
    ])
})

test("string diff Distrito de Baoshan -> Baoshan", () => {
    assertStringDiffBlocks("Distrito de Baoshan", "Baoshan", [
        { op: "-", text: "Distrito de " },
        { op: "=", text: "Baoshan" },
    ])
})

test("string diff Jinshan District;Jin Shan -> Jin Shan", () => {
    assertStringDiffBlocks("Jinshan District;Jin Shan", "Jin Shan", [
        { op: "-", text: "Jinshan District;" },
        { op: "=", text: "Jin Shan" },
    ])
})

test("string diff VTB -> VTB Bank", () => {
    assertStringDiffBlocks("VTB", "VTB Bank", [
        { op: "=", text: "VTB" },
        { op: "+", text: " Bank" },
    ])
})

test("string diff example.com -> example.com/about-company", () => {
    assertStringDiffBlocks("example.com", "example.com/about-company", [
        { op: "=", text: "example.com" },
        { op: "+", text: "/about-company" },
    ])
})

test("string diff Красносельско-Калининская линия (Путиловская - Юго-Западная) -> Красносельско-Калининская линия", () => {
    assertStringDiffBlocks("Красносельско-Калининская линия (Путиловская - Юго-Западная)", "Красносельско-Калининская линия", [
        { op: "=", text: "Красносельско-Калининская линия" },
        { op: "-", text: " (Путиловская - Юго-Западная)" },
    ])
})

test("string diff 08:00-22:00 -> 08:00-13:00; 14:00-22:00", () => {
    assertStringDiffBlocks("08:00-22:00", "08:00-13:00; 14:00-22:00", [
        { op: "=", text: "08:00-" },
        { op: "+", text: "13:00; 14:00-" },
        { op: "=", text: "22:00" },
    ])
})
