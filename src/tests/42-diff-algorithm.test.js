import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import test from "node:test"
import {fileURLToPath} from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const diffAlgorithmPath = path.resolve(__dirname, "../4-modules/42-diff-algorithm.js")

function loadArraysDiff() {
    const source = fs.readFileSync(diffAlgorithmPath, "utf8")
    return new Function(source + "\nreturn arraysDiff")()
}

const arraysDiff = loadArraysDiff()

test("empty diff for two empty arrays", () => {
    assert.deepStrictEqual(arraysDiff([], []), [])
})

test("identical arrays", () => {
    assert.deepStrictEqual(arraysDiff([1, 2, 3], [1, 2, 3]), [
        [1, 1],
        [2, 2],
        [3, 3]
    ])
})

test("marks insertions with null on the left side", () => {
    assert.deepStrictEqual(arraysDiff([1, 3], [1, 2, 3]), [
        [1, 1],
        [null, 2],
        [3, 3]
    ])
})

test("marks deletions with null on the right side", () => {
    assert.deepStrictEqual(arraysDiff([1, 2, 3], [1, 3]), [
        [1, 1],
        [2, null],
        [3, 3]
    ])
})

test("prefers delete+insert when replacement cost is default (2)", () => {
    assert.deepStrictEqual(arraysDiff([1], [2]), [
        [null, 2],
        [1, null]
    ])
})

test("uses replacement when one_replace_cost is 1", () => {
    assert.deepStrictEqual(arraysDiff([1], [2], 1), [[1, 2]])
})

test("for relation-like members, matches by type+ref even when role changes", () => {
    assert.deepStrictEqual(
        arraysDiff(
            [{type: "node", ref: 1, role: "outer"}],
            [{type: "node", ref: 1, role: "inner"}]
        ),
        [[{type: "node", ref: 1, role: "outer"}, {type: "node", ref: 1, role: "inner"}]]
    )
})

test("string diff greek -> greek;kebab inserts ;kebab", () => {
    assert.deepStrictEqual(arraysDiff(Array.from("greek"), Array.from("greek;kebab")), [
        ["g", "g"],
        ["r", "r"],
        ["e", "e"],
        ["e", "e"],
        ["k", "k"],
        [null, ";"],
        [null, "k"],
        [null, "e"],
        [null, "b"],
        [null, "a"],
        [null, "b"]
    ])
})

test("string diff domain -> full https URL with trailing slash", () => {
    assert.deepStrictEqual(arraysDiff(Array.from("thebluewater.com.au"), Array.from("https://thebluewater.com.au/")), [
        [null, "h"],
        [null, "t"],
        [null, "t"],
        [null, "p"],
        [null, "s"],
        [null, ":"],
        [null, "/"],
        [null, "/"],
        ["t", "t"],
        ["h", "h"],
        ["e", "e"],
        ["b", "b"],
        ["l", "l"],
        ["u", "u"],
        ["e", "e"],
        ["w", "w"],
        ["a", "a"],
        ["t", "t"],
        ["e", "e"],
        ["r", "r"],
        [".", "."],
        ["c", "c"],
        ["o", "o"],
        ["m", "m"],
        [".", "."],
        ["a", "a"],
        ["u", "u"],
        [null, "/"],
    ])
})

test("string diff domain -> full http URL with trailing slash", () => {
    assert.deepStrictEqual(arraysDiff(Array.from("thebluewater.com.au"), Array.from("http://thebluewater.com.au/")), [
        [null, "h"],
        [null, "t"],
        [null, "t"],
        [null, "p"],
        [null, ":"],
        [null, "/"],
        [null, "/"],
        ["t", "t"],
        ["h", "h"],
        ["e", "e"],
        ["b", "b"],
        ["l", "l"],
        ["u", "u"],
        ["e", "e"],
        ["w", "w"],
        ["a", "a"],
        ["t", "t"],
        ["e", "e"],
        ["r", "r"],
        [".", "."],
        ["c", "c"],
        ["o", "o"],
        ["m", "m"],
        [".", "."],
        ["a", "a"],
        ["u", "u"],
        [null, "/"],
    ])
})

test("string diff groups token as space + next symbol", () => {
    assert.deepStrictEqual(arraysDiff(Array.from("name"), Array.from("name 1")), [
        ["n", "n"],
        ["a", "a"],
        ["m", "m"],
        ["e", "e"],
        [null, " "],
        [null, "1"]
    ])
})
