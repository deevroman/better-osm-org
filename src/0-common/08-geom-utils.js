//<editor-fold desc="geom utils" defaultstate="collapsed">

/**
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 */
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    function deg2rad(deg) {
        return deg * (Math.PI / 180)
    }

    const R = 6371
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

/**
 * @param {number} lat
 * @param {number} lng
 * @returns {{x: number, y: number}}
 */
function toMercator(lat, lng) {
    const x = (earthRadius * lng * Math.PI) / 180
    const y = earthRadius * Math.log(Math.tan((lat * Math.PI) / 180 / 2 + Math.PI / 4))
    return { x, y }
}

/**
 * @param {number} x
 * @param {number} y
 * @returns {{lat: number, lng: number}}
 */
function fromMercator(x, y) {
    const lat = ((2 * Math.atan(Math.exp(y / earthRadius)) - Math.PI / 2) * 180) / Math.PI
    const lng = ((x / earthRadius) * 180) / Math.PI
    return { lat, lng }
}

/**
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @param {number} angleDeg
 * @param {number} lengthMeters
 * @returns {{lat: number, lon: number}}
 */
function rotateSegment(lat1, lon1, lat2, lon2, angleDeg, lengthMeters) {
    const { x: x1, y: y1 } = toMercator(lat1, lon1)
    const { x: x2, y: y2 } = toMercator(lat2, lon2)

    const angleRad = (angleDeg * Math.PI) / 180

    const dx = y2 - y1
    const dy = x2 - x1

    const segmentLength = Math.sqrt(dx * dx + dy * dy)

    const ndx = dx / segmentLength
    const ndy = dy / segmentLength

    const scaledDx = ndx * lengthMeters
    const scaledDy = ndy * lengthMeters

    const rotatedDx = scaledDx * Math.cos(angleRad) - scaledDy * Math.sin(angleRad)
    const rotatedDy = scaledDx * Math.sin(angleRad) + scaledDy * Math.cos(angleRad)

    const { lat: lat, lng: lon } = fromMercator(x1 + rotatedDy, y1 + rotatedDx)
    return { lat: lat, lon: lon }
}

// based on https://github.com/eatgrass/geo-area
function ringArea(points) {
    const RADIUS = 6378137
    const rad = coord => (coord * Math.PI) / 180

    let p1
    let p2
    let p3
    let lowerIndex
    let middleIndex
    let upperIndex
    let area = 0

    if (points.length > 2) {
        for (let i = 0; i < points.length; i++) {
            if (i === points.length - 2) {
                lowerIndex = points.length - 2
                middleIndex = points.length - 1
                upperIndex = 0
            } else if (i === points.length - 1) {
                lowerIndex = points.length - 1
                middleIndex = 0
                upperIndex = 1
            } else {
                lowerIndex = i
                middleIndex = i + 1
                upperIndex = i + 2
            }
            p1 = points[lowerIndex]
            p2 = points[middleIndex]
            p3 = points[upperIndex]
            area += (rad(p3.lon) - rad(p1.lon)) * Math.sin(rad(p2.lat))
        }
        area = (area * RADIUS * RADIUS) / 2
    }

    return area
}

//</editor-fold>
