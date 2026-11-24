import assert from "node:assert/strict"
import fs from "node:fs"
import test from "node:test"

const source = fs.readFileSync(
    new URL("../4-modules/720-overpass-search/720-overpass-search.js", import.meta.url),
    "utf8",
)
const buildQuery = new Function(source + "\nreturn buildOverpassSearchQuery")()
const bounds = {
    getSouthWest: () => ({ wrap: () => ({ lat: 1.23456789, lng: -2.5 }) }),
    getNorthEast: () => ({ wrap: () => ({ lat: 3, lng: 4 }) }),
}

test("builds a selector with the current map bounds", () => {
    assert.equal(
        buildQuery(" amenity=cafe ", bounds),
        '[out:xml][maxsize:64Mi][bbox:1.2345679,-2.5000000,3.0000000,4.0000000];\nnwr["amenity"="cafe"];\n//(._;>;);\nout geom;\n',
    )
})

test("shows a placeholder selector for an empty query", () => {
    assert.equal(
        buildQuery(" ", bounds),
        '[out:xml][maxsize:64Mi][bbox:1.2345679,-2.5000000,3.0000000,4.0000000];\nnwr[""];\n//(._;>;);\nout geom;\n',
    )
})

test("selects all objects for the wildcard selector", () => {
    assert.equal(
        buildQuery("*", bounds),
        "[out:xml][maxsize:64Mi][bbox:1.2345679,-2.5000000,3.0000000,4.0000000];\nnwr;\n//(._;>;);\nout geom;\n",
    )
})

test("adds a UTC snapshot date to the query", () => {
    assert.match(buildQuery("amenity=cafe", bounds, "2020-01-02"), /^\[date:"2020-01-02T00:00:00Z"\]\[out:xml\]/)
})

test("supports global search and explicit bbox substitution", () => {
    const query = buildQuery("node({{bbox}})!", bounds)
    assert.equal(
        query,
        "[out:xml][maxsize:64Mi];\nnode(1.2345679,-2.5000000,3.0000000,4.0000000);\n//(._;>;);\nout geom;\n",
    )
})

test("keeps an edited full query intact", () => {
    const query = '[out:xml];\nnwr["amenity"="cafe"];\nout geom;'
    assert.equal(buildQuery(query, bounds, "2020-01-02", true), query)
})
