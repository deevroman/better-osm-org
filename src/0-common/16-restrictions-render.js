//<editor-fold desc="restriction-render" defaultstate="collapsed">

/**
 * @param {{lat: number, lon: number}} latLon1
 * @param {{lat: number, lon: number}} latLon2
 * @return {boolean}
 */
function isEqualCoordinates(latLon1, latLon2) {
    return latLon1.lat === latLon2.lat && latLon1.lon === latLon2.lon
}

/**
 * @param {ExtendedRelationVersion} rel
 * @return {string[]}
 */
function validateRestriction(rel) {
    /** @type {ExtendedRelationWayMember[]} */
    const from = []
    /** @type {ExtendedRelationNodeMember[]} */
    const viaNodes = []
    /** @type {ExtendedRelationWayMember[]} */
    const viaWays = []
    /** @type {ExtendedRelationWayMember[]} */
    const to = []
    const errors = []
    const { value: restrictionValue } = getRestrictionKeyValue(rel.tags)
    rel.members?.forEach(i => {
        if (i.type === "way" && i.role === "from") {
            from.push(i)
        } else if (i.type === "way" && i.role === "to") {
            to.push(i)
        } else if (i.type === "node" && i.role === "via") {
            viaNodes.push(i)
        } else if (i.type === "way" && i.role === "via") {
            viaWays.push(i)
        } else {
            errors.push(`Incorrect member: ${i.type}/${i.ref} with "${i.role}" role`)
        }
    })
    if (viaNodes.length + viaWays.length === 0) {
        errors.push('Missing member with "via" role')
    }
    if (from.length === 0) {
        errors.push('Missing member with "from" role')
    }
    if (to.length === 0) {
        errors.push('Missing member with "to" role')
    }

    ;[...from, ...to].forEach(i => {
        if (i.geometry?.length < 2) {
            errors.push(`${i.type}/${i.ref} (${i.role}) way contains < 2 nodes`)
        }
    })
    if (restrictionValue !== "no_exit" && restrictionValue !== "no_entry") {
        if (from.length > 1) {
            errors.push('Multiple "from" role')
        }
        if (to.length > 1) {
            errors.push('Multiple "to" role')
        }
    }
    if (errors.length) return errors

    if (viaNodes.length && viaWays.length) {
        errors.push(`Mixed "node" and "way" types for via role`)
    } else if (viaNodes.length > 1) {
        errors.push(`multiple "via" nodes`)
    } else if (viaWays.length > 0) {
        let lastNode = from[0].geometry[0]
        if (isEqualCoordinates(from[0].geometry[0], lastNode)) {
            lastNode = viaWays[0].geometry[viaWays[0].geometry.length - 1]
        } else if (isEqualCoordinates(from[0].geometry[from[0].geometry.length - 1], lastNode)) {
            lastNode = viaWays[0].geometry[0]
        } else {
            errors.push(`"from" -> "via" are arranged in the wrong order or torn`)
        }
        viaWays.slice(1).forEach(w => {
            if (isEqualCoordinates(w.geometry[0], lastNode)) {
                lastNode = w.geometry[w.geometry.length - 1]
            } else if (isEqualCoordinates(w.geometry[w.geometry.length - 1], lastNode)) {
                lastNode = w.geometry[0]
            } else {
                errors.push(`"via" -> "via" are arranged in the wrong order or torn`)
            }
        })
        if (!isEqualCoordinates(to[0].geometry[0], lastNode) && isEqualCoordinates(to[0].geometry[to[0].geometry.length - 1], lastNode)) {
            errors.push(`"via" -> "to" are arranged in the wrong order or torn`)
        }
    }
    if (errors.length) return errors

    return errors
}

// prettier-ignore
const restrictionColors = {
    no_left_turn:       "#ff0000",
    no_right_turn:      "#ff0000",
    no_straight_on:     "#ff0000",
    no_u_turn:          "#ff0000",
    only_right_turn:    "#0000ff",
    only_left_turn:     "#0000ff",
    only_straight_on:   "#0000ff",
    no_entry:           "#ff0000",
    no_exit:            "#ff0000",
}

const restrictionsImagesPrefix = "https://raw.githubusercontent.com/deevroman/better-osm-org/ad552f9f3a3d7a11a1448686fc0ccc164905bf62/misc/assets/icons/restrictions/"
// prettier-ignore
const restrictionsSignImages = {
    no_left_turn:       restrictionsImagesPrefix + "France_road_sign_B2a.svg",
    no_right_turn:      restrictionsImagesPrefix + "France_road_sign_B2b.svg",
    no_straight_on:     restrictionsImagesPrefix + "MUTCD_R3-27.svg",
    no_u_turn:          restrictionsImagesPrefix + "France_road_sign_B2c.svg",
    only_right_turn:    restrictionsImagesPrefix + "France_road_sign_B21c1.svg",
    only_left_turn:     restrictionsImagesPrefix + "France_road_sign_B21c2.svg",
    only_straight_on:   restrictionsImagesPrefix + "France_road_sign_B21b.svg",
    no_entry:           restrictionsImagesPrefix + "RU_road_sign_3.1.svg",
    no_exit:            restrictionsImagesPrefix + "RU_road_sign_3.1.svg",
}

function azimuth(lat1, lon1, lat2, lon2) {
    const p1 = toMercator(lat1, lon1)
    const p2 = toMercator(lat2, lon2)

    const dx = p2.x - p1.x
    const dy = p2.y - p1.y

    const angleRad = Math.atan2(dx, dy)
    const angleDeg = (angleRad * 180) / Math.PI

    return (angleDeg + 360) % 360
}

function getRestrictionKeyValue(tags) {
    const key = Object.keys(tags).find(k => k === "restriction" || k === "was:restriction" || k.startsWith("restriction:"))
    return {
        key: key,
        value: tags[key],
    }
}

function renderArrowHead(startPoint, endPoint, angle, len, arrows, layer, color) {
    const { lat: p1_lat, lon: p1_lon } = startPoint
    const { lat: p2_lat, lon: p2_lon } = endPoint
    const rotated1 = rotateSegment(p1_lat, p1_lon, p2_lat, p2_lon, -angle, len)
    const rotated2 = rotateSegment(p1_lat, p1_lon, p2_lat, p2_lon, angle, len)
    arrows.push(displayWay([startPoint, rotated1], false, "white", 7, null, layer))
    arrows.push(displayWay([startPoint, rotated2], false, "white", 7, null, layer))
    arrows.push(displayWay([startPoint, rotated1], false, color, 4, null, layer))
    arrows.push(displayWay([startPoint, rotated2], false, color, 4, null, layer))
}

/**
 * @param {ExtendedRelationVersion} rel
 * @param {string} color
 * @param {string} layer
 * @return {[]}
 */
function renderRestriction(rel, color, layer) {
    /** @type {ExtendedRelationWayMember[]} */
    const from = []
    /** @type {ExtendedRelationNodeMember[]} */
    const viaNodes = []
    /** @type {ExtendedRelationWayMember[]} */
    const viaWays = []
    /** @type {ExtendedRelationWayMember[]} */
    const to = []
    rel.members?.forEach(i => {
        if (i.type === "way" && i.role === "from") {
            from.push(i)
        } else if (i.type === "way" && i.role === "to") {
            to.push(i)
        } else if (i.type === "node" && i.role === "via") {
            viaNodes.push(i)
        } else if (i.type === "way" && i.role === "via") {
            viaWays.push(i)
        }
    })
    let via = viaNodes?.[0]
    if (!via) {
        if (isEqualCoordinates(from[0].geometry[0], viaWays[0].geometry[0]) || isEqualCoordinates(from[0].geometry[from[0].geometry.length - 1], viaWays[0].geometry[0])) {
            via = viaWays[0].geometry[0]
        } else if (
            isEqualCoordinates(from[0].geometry[0], viaWays[0].geometry[viaWays[0].geometry.length - 1]) ||
            isEqualCoordinates(from[0].geometry[from[0].geometry.length - 1], viaWays[0].geometry[viaWays[0].geometry.length - 1])
        ) {
            via = viaWays[0].geometry[viaWays[0].geometry.length - 1]
        } else {
            console.error("Restriction validation error")
            debug_alert("Restriction validation error")
        }
    }
    const { value: restrictionValue } = getRestrictionKeyValue(rel.tags)
    const angle = 25
    const len = 7
    const arrows = []
    let signAngle = 0.0
    from.forEach(f => {
        let startPoint = f.geometry[0]
        let endPoint = f.geometry[1]
        // оверпас не даёт айдишники точек геометрии
        if (isEqualCoordinates(f.geometry[f.geometry.length - 1], via)) {
            startPoint = f.geometry[f.geometry.length - 1]
            endPoint = f.geometry[f.geometry.length - 2]
        }
        signAngle = 360 - azimuth(endPoint.lat, endPoint.lon, startPoint.lat, startPoint.lon)
        console.debug(signAngle)
        // renderArrowHead(startPoint, endPoint, angle, len, arrows, layer, color)
    })
    to.forEach(t => {
        let startPoint = t.geometry[0]
        let endPoint = t.geometry[1]
        if (t.geometry[0].lat === via.lat && t.geometry[0].lon === via.lon) {
            if (from.length > 1) {
                signAngle = 360 - azimuth(endPoint.lat, endPoint.lon, startPoint.lat, startPoint.lon)
            }
            startPoint = t.geometry[t.geometry.length - 1]
            endPoint = t.geometry[t.geometry.length - 2]
        } else {
            if (from.length > 1) {
                signAngle = 360 - azimuth(t.geometry[t.geometry.length - 2].lat, t.geometry[t.geometry.length - 2].lon, t.geometry[t.geometry.length - 1].lat, t.geometry[t.geometry.length - 1].lon)
            }
        }
        if (restrictionValue === "no_exit" || restrictionValue === "no_entry") {
            renderArrowHead(startPoint, endPoint, angle, len, arrows, layer, color)
        }
    })
    ;[100, 250, 500, 1000].forEach(t => {
        setTimeout(() => {
            arrows.forEach(i => i.bringToFront())
        }, t)
    })

    queueMicrotask(async () => {
        const imageUrl = restrictionsSignImages[restrictionValue]
        if (!imageUrl) {
            return
        }
        let img = await fetchTextWithCache(imageUrl)
        img = img.replace('version="1.1"', `style="rotate: -${Math.round(signAngle)}deg" version="1.1"`)

        function getSquareBounds(center) {
            const { x, y } = toMercator(center.lat, center.lon)
            // prettier-ignore
            return [
                [...Object.values(fromMercator(x - 10, y - 10))],
                [...Object.values(fromMercator(x + 10, y + 10))]
            ];
        }

        const imgLayer = getWindow()
            .L.imageOverlay(
                "data:image/svg+xml;base64," + btoa(img),
                intoPage(getSquareBounds(via, 0.0002)),
                intoPage({
                    interactive: true,
                    zIndex: 99999,
                    className: "restriction-img",
                }),
            )
            .addTo(getMap())
        arrows.push(imgLayer)
        arrows.forEach(l => layers[layer].push(l))
        imgLayer.bringToFront()
    })
    return arrows
}

function isRestrictionObj(tags) {
    return Object.entries(tags).some(([k]) => k === "restriction" || k === "was:restriction" || k.startsWith("restriction:"))
}

//</editor-fold>
