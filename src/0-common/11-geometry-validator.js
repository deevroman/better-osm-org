//<editor-fold desc="way-geometry-validator" defaultstate="collapsed">

/**
 * @typedef {{
 *     index: number,
 *     id: number
 *     lat: number,
 *     lon: number,
 * }} WayGeometryPoint
 */

/**
 * @typedef {Object} WayGeometryValidationIssue
 * @property {"too_few_points"|"duplicate_points"|"self_intersection"|"point_on_segment"} code
 * @property {string} description
 * @property {WayGeometryPoint[]=} points
 * @property {WayGeometryPoint[][]=} pointGroups
 */

/**
 * @param {WayGeometryPoint[]} points
 * @return {WayGeometryValidationIssue[]}
 */
function findDuplicatesPoints(points) {
    const issues = []

    const isPolygon = isClosedWay(points)
    if (!isPolygon) {
        for (let i = 2; i < points.length; i++) {
            const point = points[i]
            if (points[i - 2].id === point.id || areSamePointCoordinates(points[i - 2], point)) {
                const prevDup = points[i - 2]
                issues.push({
                    code: "duplicate_points",
                    description: `Duplicate point in geometry at positions ${prevDup.index + 1} and ${point.index + 1}`,
                    points: [prevDup, point],
                })
            }
            if (points[i - 1].id === point.id || areSamePointCoordinates(points[i - 1], point)) {
                const prevDup = points[i - 1]
                issues.push({
                    code: "duplicate_points",
                    description: `Duplicate point in geometry at positions ${prevDup.index + 1} and ${point.index + 1}`,
                    points: [prevDup, point],
                })
            }
        }
        return issues
    }

    /** @type {Map<string, WayGeometryPoint[]>} */
    const duplicateGroupsMap = new Map()
    points.forEach(point => {
        const key = makePointKey(point)
        if (!duplicateGroupsMap.has(key)) {
            duplicateGroupsMap.set(key, [])
        }
        duplicateGroupsMap.get(key).push(point)
    })

    duplicateGroupsMap.forEach(group => {
        if (group.length < 2) {
            return
        }
        issues.push({
            code: "duplicate_points",
            description: `Duplicate point in geometry at positions ${group.map(i => i.index + 1).join(", ")}`,
            points: group,
        })
    })
    return issues
}

/**
 * @param {WayGeometryPoint[]} points
 * @param {boolean} isPolygon
 * @return {WayGeometryValidationIssue[]}
 */
function findSelfIntersections(points, isPolygon) {
    const issues = []
    const segmentsCount = points.length - 1
    for (let i = 0; i < segmentsCount; i++) {
        const a = points[i]
        const b = points[i + 1]
        if (areSamePointCoordinates(a, b)) {
            continue
        }
        for (let j = i + 2; j < segmentsCount; j++) {
            if (isPolygon && i === 0 && j === segmentsCount - 1) {
                continue
            }
            const c = points[j]
            const d = points[j + 1]
            if (a.id === c.id || b.id === c.id || a.id === d.id || b.id === d.id) {
                continue
            }
            if (areSamePointCoordinates(c, d)) {
                continue
            }
            if (!segmentsCrossOrOverlap(a, b, c, d)) {
                continue
            }
            issues.push({
                code: "self_intersection",
                description: `Self-intersection between segments ${i + 1}-${i + 2} and ${j + 1}-${j + 2}`,
                pointGroups: [
                    [a, b],
                    [c, d],
                ],
            })
        }
    }
    return issues
}

/**
 * @param {WayGeometryPoint[]} points
 * @return {WayGeometryValidationIssue[]}
 */
function findPointsOnSegments(points) {
    const issues = []
    const segmentsCount = points.length - 1

    for (let pointIndex = 0; pointIndex < points.length; pointIndex++) {
        const point = points[pointIndex]
        for (let segmentIndex = 0; segmentIndex < segmentsCount; segmentIndex++) {
            if (pointIndex === segmentIndex || pointIndex === segmentIndex + 1) {
                continue
            }
            const segmentStart = points[segmentIndex]
            const segmentEnd = points[segmentIndex + 1]
            if (areSamePointCoordinates(segmentStart, segmentEnd)) {
                continue
            }
            if (areSamePointCoordinates(point, segmentStart) || areSamePointCoordinates(point, segmentEnd)) {
                continue
            }
            if (abs(area(segmentStart, segmentEnd, point)) >= EPS) {
                continue
            }
            if (!isPointInBbox(point, segmentStart, segmentEnd)) {
                continue
            }
            issues.push({
                code: "point_on_segment",
                description: `Point ${pointIndex + 1} lies on segment ${segmentIndex + 1}-${segmentIndex + 2}`,
                pointGroups: [[point], [segmentStart, segmentEnd]],
            })
        }
    }
    return issues
}

/**
 * @param {WayVersion} wayInfo
 * @param {Map<string, NodeVersion>} nodesMap
 * @return {WayGeometryValidationIssue[]}
 */
function validateWayGeometry(wayInfo, nodesMap) {
    /** @type {number[]} */
    const nodeIDs = wayInfo?.nodes ?? []
    /** @type {WayGeometryPoint[]} */
    const points = nodeIDs.map((nodeID, index) => {
        const node = nodesMap.get(nodeID.toString()) ?? nodesMap.get(nodeID)
        return {
            index,
            id: nodeID,
            lat: node?.lat,
            lon: node?.lon,
        }
    })

    if (points.length === 0) {
        return [
            {
                code: "too_few_points",
                description: "Geometry has no points",
            },
        ]
    }

    const isPolygon = isClosedWay(points)
    const pointsForValidation = isPolygon ? points.slice(0, -1) : points
    const uniquePointKeys = new Set(pointsForValidation.map(makePointKey))
    const minPointsRequired = isPolygon ? 3 : 2
    /** @type {WayGeometryValidationIssue[]} */
    const issues = []

    if (uniquePointKeys.size < minPointsRequired) {
        issues.push({
            code: "too_few_points",
            description: isPolygon ? `Polygon should contain at least ${minPointsRequired} unique points` : `Line should contain at least ${minPointsRequired} unique points`,
            points: pointsForValidation,
        })
        return issues
    }

    issues.push(...findDuplicatesPoints(pointsForValidation))
    issues.push(...findSelfIntersections(points, isPolygon))
    issues.push(...findPointsOnSegments(points))

    return issues
}

/**
 * @param {WayGeometryValidationIssue[]} issues
 * @return {Set<number>}
 */
function collectWayGeometryAffectedNodeIds(issues) {
    const ids = new Set()
    issues.forEach(issue => {
        issue.points?.forEach(point => ids.add(point.id))
        issue.pointGroups?.forEach(group => group.forEach(point => ids.add(point.id)))
    })
    return ids
}

/**
 * @param {{id: number}[]} points
 * @return {boolean}
 */
function isClosedWay(points) {
    if (points.length < 2) {
        return false
    }
    return points[0].id === points[points.length - 1].id
}

/**
 * @param {LatLon} point
 * @return {string}
 */
function makePointKey(point) {
    return `${point.lat}|${point.lon}`
}

/**
 * @param {LatLon} p1
 * @param {LatLon} p2
 * @return {boolean}
 */
function areSamePointCoordinates(p1, p2) {
    return p1.lat === p2.lat && p1.lon === p2.lon
}

/**
 * @param {LatLon} a
 * @param {LatLon} b
 * @param {LatLon} c
 * @return {number}
 */
function area(a, b, c) {
    return (b.lon - a.lon) * (c.lat - a.lat) - (b.lat - a.lat) * (c.lon - a.lon)
}

/**
 * @param {LatLon} a
 * @param {LatLon} b
 * @param {LatLon} c
 * @return {-1|0|1}
 */
function orientation(a, b, c) {
    const ar = area(a, b, c)
    return ar > 0 ? 1 : ar < 0 ? -1 : 0
}

/**
 * @param {LatLon} a
 * @param {LatLon} b
 * @param {LatLon} c
 * @param {LatLon} d
 * @return {boolean}
 */
function segmentsCrossOrOverlap(a, b, c, d) {
    function intersect(a, b, c, d) {
        if (a > b) {
            ;[a, b] = [b, a]
        }
        if (c > d) {
            ;[c, d] = [d, c]
        }
        return max(a, c) <= min(b, d)
    }

    // prettier-ignore
    return intersect(a.lat, b.lat, c.lat, d.lat)
        && intersect(a.lon, b.lon, c.lon, d.lon)
        && area(a, b, c) * area(a, b, d) <= 0
        && area(c, d, a) * area(c, d, b) <= 0
}

const EPS = 1e-10

/**
 * @param {LatLon} p
 * @param {LatLon} a
 * @param {LatLon} b
 * @return {boolean}
 */
function isPointInBbox(p, a, b) {
    // prettier-ignore
    return p.lon <= max(a.lon, b.lon) + EPS
         && p.lon + EPS >= min(a.lon, b.lon)
         && p.lat <= max(a.lat, b.lat) + EPS
         && p.lat + EPS >= min(a.lat, b.lat)
}

//</editor-fold>
