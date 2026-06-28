//<editor-fold desc="click" defaultstate="collapsed">

function getWaynodesCentroid(wayNodes) {
    // simple impl
    let latSum = 0.0
    let lonSum = 0.0
    wayNodes.forEach(i => {
        latSum += i.lat
        lonSum += i.lon
    })
    return {
        lat: latSum / wayNodes.length,
        lon: lonSum / wayNodes.length,
    }
}

function getBooxAroundPoint(lat, lng, halfSizeMeters) {
    const dLat = halfSizeMeters / 111320
    const dLng = halfSizeMeters / (111320 * Math.cos((lat * Math.PI) / 180))
    return [lng - dLng, lat - dLat, lng + dLng, lat + dLat].join(",")
}

async function getElementsAroundNode(lat, lng) {
    for (const radius of [15, 70, 300, 750, 2000, 5000]) {
        console.time(`/map call radius=${radius}`)
        const response = await fetch(`${osm_server.apiBase}map.json?bbox=${getBooxAroundPoint(lat, lng, radius)}`)
        console.timeEnd(`/map call radius=${radius}`)
        if (!response.ok) {
            throw new Error(`OSM API error: ${response.status}`)
        }
        const data = await response.json()
        if (data.elements.length === 0) {
            continue
        }
        return data.elements
    }
    throw "empty region"
}

async function mapClickHandler(e) {
    if (skipClick) {
        return
    }
    const z = getZoom()
    if (z < 13) {
        return
    }
    if (location.hash.includes("D") /* || Object.keys(getMap?.()?.dataLayer?._layers ?? {}).length*/) {
        return
    }
    if (jsonLayer) {
        return
    }
    if (stopClick) {
        return
    }
    if (document.querySelector(".control-query.active")) {
        return
    }
    if (location.pathname === "/export" || location.pathname === "/note/new" || location.pathname.startsWith("/changeset")) {
        return
    }
    if (e.originalEvent.explicitOriginalTarget.id !== "map") {
        if (e.originalEvent.explicitOriginalTarget.nodeName !== "path") {
            return
        }
    }
    const { lat: lat, lng: lng } = e.latlng

    /** @type {(NodeVersion|WayVersion|RelationVersion)[]} */
    const elements = await getElementsAroundNode(lat, lng)
    if (stopClick) {
        return
    }

    /** @type {Map<number, NodeVersion>} */
    const nodes = new Map()
    /** @type {Map<number, WayVersion>} */
    const downloadedWays = new Map()
    elements.forEach(i => {
        if (i.type === "node") {
            nodes.set(i.id, i)
        } else if (i.type === "way") {
            downloadedWays.set(i.id, i)
        }
    })

    let bestObj = elements.find(i => i.type === "node")
    let bestDist = bestObj ? getDistanceFromLatLonInKm(lat, lng, bestObj.lat, bestObj.lon) * 1000 : 1e9
    for (const i of elements) {
        if (!i.tags) {
            continue
        }
        if (i.type === "node") {
            const dist = getDistanceFromLatLonInKm(lat, lng, i.lat, i.lon) * 1000
            if (dist < bestDist) {
                bestDist = dist
                bestObj = i
            }
        } else if (i.type === "way") {
            const wayNodes = i.nodes.map(id => nodes.get(id))
            if (wayNodes[0].id === wayNodes.at(-1).id) {
                // polygon
                const centroid = getWaynodesCentroid(wayNodes)
                const dist = getDistanceFromLatLonInKm(lat, lng, centroid.lat, centroid.lon) * 1000
                if (dist < bestDist) {
                    bestDist = dist
                    bestObj = i
                }
            }
            for (let j = 0; j < wayNodes.length - 1; j++) {
                const a = toMercator(wayNodes[j].lat, wayNodes[j].lon)
                const b = toMercator(wayNodes[j + 1].lat, wayNodes[j + 1].lon)

                const dist = distanceToSegmentInMeters(toMercator(lat, lng), a, b, lat)
                if (dist < bestDist) {
                    bestDist = dist
                    bestObj = i
                }
            }
        } else if (i.type === "relation") {
            const relationChildNodes = []
            for (let member of i.members) {
                if (member.type !== "way") {
                    continue
                }
                if (downloadedWays.has(member.ref)) {
                    const way = downloadedWays.get(member.ref)
                    way.nodes.forEach(id => {
                        if (nodes.has(id)) {
                            relationChildNodes.push(nodes.get(id))
                        }
                    })
                    for (let j = 0; j < way.nodes.length - 1; j++) {
                        const _a = nodes.get(way.nodes[j])
                        const _b = nodes.get(way.nodes[j + 1])
                        if (!_a || !_b) {
                            continue
                        }
                        const a = toMercator(_a.lat, _a.lon)
                        const b = toMercator(_b.lat, _b.lon)

                        const dist = distanceToSegmentInMeters(toMercator(lat, lng), a, b, lat)
                        if (dist < bestDist) {
                            bestDist = dist
                            bestObj = i
                        }
                    }
                }
            }
            const centroid = getWaynodesCentroid(relationChildNodes)
            const dist = getDistanceFromLatLonInKm(lat, lng, centroid.lat, centroid.lon) * 1000
            if (dist < bestDist) {
                bestDist = dist
                bestObj = i
            }
        }
    }
    getWindow().OSM.router.route(`/${bestObj.type}/${bestObj.id}`)
    console.log(elements)
}

let clickableMapSetuped = false
let stopClick = false
let skipClick = false

async function setupClickableMap() {
    if (!isDebug() && !GM_config.get("ClickableMap")) {
        return
    }
    await interceptMapManually()
    if (clickableMapSetuped) {
        return
    }
    clickableMapSetuped = true
    getMap().on("click", intoPageWithFun(mapClickHandler))
    getMap().on(
        "dblclick",
        intoPageWithFun(() => {
            stopClick = true
            setTimeout(() => {
                stopClick = false
            }, 1200)
        }),
    )
    getMap().on(
        "mousedown",
        intoPageWithFun(() => {
            skipClick = document.querySelector("#map-context-menu").checkVisibility() || document.querySelector(".dropdown-menu.show")
        }),
    )

    injectCSSIntoOSMPage(`
    #map.leaflet-grab:not(.leaflet-drag-target) {
        cursor: revert;
    }
    `)
}

//</editor-fold>
