import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const validatorPath = path.resolve(__dirname, "../0-common/11-geometry-validator.js")
const validatorSource = fs.readFileSync(validatorPath, "utf8")

const { validateWayGeometry } = new Function(
    "const max = Math.max; const min = Math.min; const abs = Math.abs;" +
        validatorSource +
        "\nreturn { validateWayGeometry }",
)()

function getWayGeometryValidationMessages(issues) {
    return issues.map(i => i.description)
}

function makeNodesMap(points) {
    return new Map(points.map(i => [i.id.toString(), i]))
}

test("line should contain at least two unique points", () => {
    const issues = validateWayGeometry(
        { nodes: [1] },
        makeNodesMap([
            {
                id: 1,
                lat: 10,
                lon: 20,
            },
        ]),
    )
    assert.equal(issues.length, 1)
    assert.equal(issues[0].code, "too_few_points")
})

test("polygon should contain at least three unique points", () => {
    const issues = validateWayGeometry(
        { nodes: [1, 2, 1] },
        makeNodesMap([
            {
                id: 1,
                lat: 10,
                lon: 20,
            },
            {
                id: 2,
                lat: 11,
                lon: 21,
            },
        ]),
    )
    assert.equal(issues.length, 1)
    assert.equal(issues[0].code, "too_few_points")
})

test("line duplicate by the same node should be reported", () => {
    const issues = validateWayGeometry(
        { nodes: [1, 2, 1, 3] },
        makeNodesMap([
            {
                id: 1,
                lat: 10,
                lon: 20,
            },
            {
                id: 2,
                lat: 11,
                lon: 21,
            },
            {
                id: 3,
                lat: 12,
                lon: 30,
            },
        ]),
    )
    assert.equal(issues.length, 1)
    assert.equal(issues[0].code, "duplicate_points")
    assert.deepEqual(
        issues[0].points.map(i => i.index),
        [0, 2],
    )
})

test("line duplicate by coordinates should be reported even for different node ids", () => {
    const issues = validateWayGeometry(
        { nodes: [1, 2, 3] },
        makeNodesMap([
            {
                id: 1,
                lat: 10,
                lon: 20,
            },
            {
                id: 2,
                lat: 11,
                lon: 21,
            },
            {
                id: 3,
                lat: 10,
                lon: 20,
            },
        ]),
    )
    assert.equal(issues.length, 1)
    assert.equal(issues[0].code, "duplicate_points")
})

test("closed polygon endpoint should not be reported as duplicate", () => {
    const issues = validateWayGeometry(
        { nodes: [1, 2, 3, 1] },
        makeNodesMap([
            {
                id: 1,
                lat: 10,
                lon: 20,
            },
            {
                id: 2,
                lat: 11,
                lon: 21,
            },
            {
                id: 3,
                lat: 12,
                lon: 23,
            },
        ]),
    )
    assert.deepEqual(issues, [])
})

test("line with crossing non-adjacent segments should report self-intersection", () => {
    const issues = validateWayGeometry(
        { nodes: [1, 2, 3, 4] },
        makeNodesMap([
            {
                id: 1,
                lat: 0,
                lon: 0,
            },
            {
                id: 2,
                lat: 2,
                lon: 2,
            },
            {
                id: 3,
                lat: 0,
                lon: 2,
            },
            {
                id: 4,
                lat: 2,
                lon: 0,
            },
        ]),
    )
    assert.equal(issues.length, 1)
    assert.equal(issues[0].code, "self_intersection")
    assert.deepEqual(
        issues[0].pointGroups.map(group => group.map(point => point.index)),
        [
            [0, 1],
            [2, 3],
        ],
    )
})

test("bow-tie polygon should report self-intersection", () => {
    const issues = validateWayGeometry(
        { nodes: [1, 2, 3, 4, 1] },
        makeNodesMap([
            {
                id: 1,
                lat: 0,
                lon: 0,
            },
            {
                id: 2,
                lat: 2,
                lon: 2,
            },
            {
                id: 3,
                lat: 0,
                lon: 2,
            },
            {
                id: 4,
                lat: 2,
                lon: 0,
            },
        ]),
    )
    assert.equal(issues.length, 1)
    assert.equal(issues[0].code, "self_intersection")
})

test("point lying on another segment should be reported", () => {
    const issues = validateWayGeometry(
        { nodes: [1, 2, 3, 4] },
        makeNodesMap([
            {
                id: 1,
                lat: 0,
                lon: 0,
            },
            {
                id: 2,
                lat: 2,
                lon: 0,
            },
            {
                id: 3,
                lat: 1,
                lon: 0,
            },
            {
                id: 4,
                lat: 1,
                lon: 1,
            },
        ]),
    )
    assert.ok(issues.some(i => i.code === "point_on_segment"))
    const issue = issues.find(i => i.code === "point_on_segment")
    assert.equal(issue.description, "Point 3 lies on segment 1-2")
})

test("regression: way/1497981444 should have no geometry validation issues", () => {
    const issues = validateWayGeometry(
        {
            nodes: [1, 2, 3, 4, 5, 6, 7, 8, 1],
        },
        makeNodesMap([
            { id: 1, lat: -32.7705641, lon: 151.5898129 },
            { id: 2, lat: -32.7705766, lon: 151.5899001 },
            { id: 3, lat: -32.7705815, lon: 151.5898991 },
            { id: 4, lat: -32.7705899, lon: 151.5899578 },
            { id: 5, lat: -32.770396, lon: 151.5899968 },
            { id: 6, lat: -32.7703805, lon: 151.5898884 },
            { id: 7, lat: -32.7704833, lon: 151.5898677 },
            { id: 8, lat: -32.770478, lon: 151.5898302 },
        ]),
    )
    assert.deepEqual(issues, [])
})

test("issues should be converted to plain text messages", () => {
    const messages = getWayGeometryValidationMessages([
        { code: "too_few_points", description: "Line should contain at least 2 unique points" },
        { code: "duplicate_points", description: "Duplicate point in geometry at positions 1, 3" },
        { code: "self_intersection", description: "Self-intersection between segments 1-2 and 3-4" },
        { code: "point_on_segment", description: "Point 3 lies on segment 1-2" },
    ])
    assert.deepEqual(messages, [
        "Line should contain at least 2 unique points",
        "Duplicate point in geometry at positions 1, 3",
        "Self-intersection between segments 1-2 and 3-4",
        "Point 3 lies on segment 1-2",
    ])
})
