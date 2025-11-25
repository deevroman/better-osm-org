//<editor-fold desc="object-version-page" defaultstate="collapsed">

async function addHoverForNodesParents() {
    if (!location.pathname.match(/^\/node\/(\d+)\/?$/)) {
        return
    }
    document.querySelectorAll(`details [href^="/way/"]:not(.hover-added)`).forEach(elem => {
        elem.classList.add("hover-added")
        setTimeout(async () => {
            const wayID = parseInt(elem.href.match(/way\/(\d+)/)[1])
            const wayData = await loadWayMetadata(wayID)
            const wayInfo = wayData.elements.find(i => i.id === wayID)
            /*** @type {Map<string, NodeVersion>}*/
            const nodesMap = new Map(
                Object.entries(
                    Object.groupBy(
                        wayData.elements.filter(i => i.type === "node"),
                        i => i.id,
                    ),
                ).map(([k, v]) => [k, v[0]]),
            )
            const wayLi = elem?.parentElement?.parentElement?.parentElement
            wayLi.classList.add("node-last-version-parent")
            wayLi.onmouseenter = () => {
                const currentNodesList = wayInfo.nodes.map(i => [nodesMap.get(i.toString()).lat, nodesMap.get(i.toString()).lon])
                const color = darkModeForMap || isDarkTiles() ? c("#ff00e3") : "#000000"
                showActiveWay(cloneInto(currentNodesList, unsafeWindow), color)
            }
            wayLi.onclick = e => {
                if (e.altKey) return
                if (e.target.tagName === "A") return
                const currentNodesList = wayInfo.nodes.map(i => [nodesMap.get(i.toString()).lat, nodesMap.get(i.toString()).lon])
                const color = darkModeForMap || isDarkTiles() ? c("#ff00e3") : "#000000"
                showActiveWay(cloneInto(currentNodesList, unsafeWindow), color, true)
            }
            wayLi.ondblclick = zoomToCurrentObject
            if (wayInfo.tags) {
                Object.entries(wayInfo.tags).forEach(([k, v]) => {
                    wayLi.title += `\n${k}=${v}`
                })
                wayLi.title = wayLi.title.trim()
            }
        })
    })
    // prettier-ignore
    document.querySelector(".node-last-version-parent")?.parentElement?.parentElement?.querySelector("summary")?.addEventListener("mouseenter", () => {
        cleanObjectsByKey("activeObjects")
    })
    document.querySelector(".secondary-actions")?.addEventListener("mouseenter", () => {
        cleanObjectsByKey("activeObjects")
    })
    console.log("addHoverForWayNodes finished")
}

/**
 * @param {number[]} nodesIds
 * @param {Map} nodesMap
 * @param {"way"|"relation"} osm_type
 * @return {HTMLDivElement}
 */
function makePolygonMeasureButtons(nodesIds, nodesMap, osm_type) {
    const nodes = nodesIds.map(i => nodesMap.get(i.toString()))
    const bbox = {
        min_lat: Math.min(...nodes.map(i => i.lat)),
        min_lon: Math.min(...nodes.map(i => i.lon)),
        max_lat: Math.max(...nodes.map(i => i.lat)),
        max_lon: Math.max(...nodes.map(i => i.lon)),
    }

    let wayLength = 0.0
    for (let i = 1; i < nodes.length; i++) {
        wayLength += getDistanceFromLatLonInKm(nodes[i - 1].lat, nodes[i - 1].lon, nodes[i].lat, nodes[i].lon)
    }
    wayLength *= 1000

    let wayArea = null
    if (nodesIds.length > 2 && nodesIds[0] === nodesIds.at(-1)) {
        wayArea = Math.abs(ringArea(nodes))
    }

    const center = { lat: (bbox.max_lat + bbox.min_lat) / 2, lng: (bbox.max_lon + bbox.min_lon) / 2 }
    // TODO
    // geojson

    const infos = document.createElement("div")
    infos.style.display = "none"
    infos.style.paddingBottom = "5px"

    if (osm_type === "way") {
        const lengthElem = document.createElement("span")
        const lengthText = wayLength < 1000 ? wayLength.toFixed(2) + " m" : wayLength.toFixed(0) + " m"
        lengthElem.textContent = "Length: " + lengthText
        infos.appendChild(lengthElem)

        if (wayArea !== null) {
            infos.appendChild(document.createTextNode(",\xA0"))
            const areaElem = document.createElement("span")
            const areaText = wayLength < 1000 ? wayArea.toFixed(2) + " m²" : wayArea.toFixed(0) + " m²"
            areaElem.textContent = "Area: " + areaText
            infos.appendChild(areaElem)
        }
    }

    const svg1 =
        '<svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" fill="none" stroke-width="1">\n' +
        "  <!-- Внешний квадрат -->\n" +
        '  <rect x="4" y="4" width="16" height="16" stroke-width="1"/>\n' +
        "  <!-- Центральные линии -->\n" +
        '  <line x1="12" y1="4" x2="12" y2="20" stroke="currentColor" stroke-width="1"/>\n' +
        '  <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" stroke-width="1"/>\n' +
        "  <!-- Толстые верхняя и левая стороны -->\n" +
        '  <line x1="3" y1="4" x2="20.5" y2="4" stroke="red" stroke-width="2"/>\n' +
        '  <line x1="4" y1="3" x2="4" y2="20.5" stroke="red" stroke-width="2"/>\n' +
        "</svg>\n"
    const icon1 = document.createElement("span")
    icon1.innerHTML = svg1
    icon1.style.cursor = "pointer"
    const text1 = `${bbox.max_lat.toString()} ${bbox.min_lon.toString()}`
    icon1.title = "Click to copy TopLeft: " + text1
    icon1.onmouseenter = () => {
        showActiveNodeMarker(bbox.max_lat.toString(), bbox.min_lon.toString(), "red", true)
        showActiveNodeIconMarker(bbox.max_lat.toString(), bbox.min_lon.toString(), null, false)
    }
    icon1.onclick = e => {
        navigator.clipboard.writeText(text1).then(() => copyAnimation(e, text1))
    }

    const svg2 =
        '<svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" fill="none" stroke-width="1">\n' +
        "  <!-- Внешний квадрат -->\n" +
        '  <rect x="4" y="4" width="16" height="16" stroke-width="1"/>\n' +
        "  <!-- Центральные линии -->\n" +
        '  <line x1="12" y1="4" x2="12" y2="20" stroke="currentColor" stroke-width="1"/>\n' +
        '  <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" stroke-width="1"/>\n' +
        "  <!-- Жирная точка в центре -->\n" +
        '  <circle cx="12" cy="12" r="2" fill="red" stroke="red"/>\n' +
        "</svg>\n"
    const icon2 = document.createElement("span")
    icon2.innerHTML = svg2
    icon2.style.cursor = "pointer"
    const text2 = `${center.lat.toFixed(6)} ${center.lng.toFixed(6)}`
    icon2.title = "Click to copy center: " + text2
    icon2.onmouseenter = () => {
        showActiveNodeMarker(center.lat.toString(), center.lng.toString(), "red")
        showActiveNodeIconMarker(center.lat.toString(), center.lng.toString(), null, false)
    }
    icon2.onclick = e => {
        navigator.clipboard.writeText(text2).then(() => copyAnimation(e, text2))
    }

    const svg3 =
        '<svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" fill="none" stroke-width="1">\n' +
        "  <!-- Внешний квадрат -->\n" +
        '  <rect x="4" y="4" width="16" height="16" stroke-width="1"/>\n' +
        "  <!-- Центральные линии -->\n" +
        '  <line x1="12" y1="4" x2="12" y2="20" stroke="currentColor" stroke-width="1"/>\n' +
        '  <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" stroke-width="1"/>\n' +
        "  <!-- Толстые правая и нижняя стороны -->\n" +
        '  <line x1="3.5" y1="20" x2="21" y2="20" stroke="red" stroke-width="2"/>\n' +
        '  <line x1="20" y1="3.5" x2="20" y2="20.5" stroke="red" stroke-width="2"/>\n' +
        "</svg>\n"
    const icon3 = document.createElement("span")
    icon3.innerHTML = svg3
    icon3.style.cursor = "pointer"
    const text3 = `${bbox.min_lat.toString()} ${bbox.max_lon.toString()}`
    icon3.title = "Click to copy RightBottom: " + text3
    icon3.onmouseenter = () => {
        showActiveNodeMarker(bbox.min_lat.toString(), bbox.max_lon.toString(), "red")
        showActiveNodeIconMarker(bbox.min_lat.toString(), bbox.max_lon.toString(), null, false)
    }
    icon3.onclick = e => {
        navigator.clipboard.writeText(text3).then(() => copyAnimation(e, text3))
    }
    // prettier-ignore
    const svg4 = '<svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" fill="none">\n' +
        '  <!-- Внешний прямоугольник жирный -->\n' +
        '  <!-- Центральные линии -->\n' +
        '  <line x1="12" y1="4" x2="12" y2="20" stroke="currentColor" stroke-width="1"/>\n' +
        '  <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" stroke-width="1"/>\n' +
        '  <rect x="4" y="4" width="16" height="16" stroke="red" stroke-width="2"/>\n' +
        '</svg>\n';
    const icon4 = document.createElement("span")
    icon4.innerHTML = svg4
    icon4.style.cursor = "pointer"
    const text4 = `${bbox.min_lat.toString()} ${bbox.min_lon.toString()} ${bbox.max_lat.toString()} ${bbox.max_lon.toString()}`
    icon4.title = "Click to copy bbox: " + text4
    icon4.onmouseenter = () => {
        cleanObjectsByKey("activeObjects")
        const rect = getWindow()
            .L.rectangle(
                intoPage([
                    [bbox.max_lat, bbox.max_lon],
                    [bbox.min_lat, bbox.min_lon],
                ]),
                intoPage({ color: "red", weight: 3, fillOpacity: 0 }),
            )
            .addTo(getMap())
        layers["activeObjects"].push(rect)
    }
    icon4.onclick = e => {
        navigator.clipboard.writeText(text4).then(() => copyAnimation(e, text4))
    }
    // todo нужно больше форматов bbox
    const icons = document.createElement("div")
    icons.style.paddingTop = "5px"
    infos.appendChild(icons)

    icons.appendChild(icon1)
    icons.appendChild(icon2)
    icons.appendChild(icon3)
    icons.appendChild(icon4)

    document.querySelector("#sidebar_content h4:last-of-type").after(infos)

    infos.onmouseleave = () => {
        cleanAllObjects()
    }

    return infos
}

function isDarkTiles() {
    const layers = new URLSearchParams(location.hash).get("layers")
    return layers && (layers.includes("S") || layers.includes("T")) && isDarkMode()
}

async function addHoverForWayNodes() {
    if (!location.pathname.match(/^\/way\/(\d+)\/?$/)) {
        return
    }
    // todo relations
    let infoBtn
    if (!document.querySelector(".way-info-btn") && document.querySelector("#sidebar_content h4:last-of-type")) {
        infoBtn = document.createElement("span")
        infoBtn.textContent = "📐"
        infoBtn.classList.add("way-info-btn")
        infoBtn.classList.add("completed")
        infoBtn.style.fontSize = "large"
        infoBtn.style.cursor = "pointer"

        document.querySelector("#sidebar_content h4:last-of-type").appendChild(document.createTextNode("\xA0"))
        document.querySelector("#sidebar_content h4:last-of-type").appendChild(infoBtn)
    }

    const wayData = await loadWayMetadata().catch(() => {
        if (infoBtn) {
            infoBtn.style.display = "none"
        }
    })
    if (!wayData) {
        if (infoBtn) {
            infoBtn.style.display = "none"
        }
        return
    }
    /*** @type {Map<string, NodeVersion>}*/
    const nodesMap = new Map(
        Object.entries(
            Object.groupBy(
                wayData.elements.filter(i => i.type === "node"),
                i => i.id,
            ),
        ).map(([k, v]) => [k, v[0]]),
    )
    document.querySelectorAll(`details [href^="/node/"]:not(.hover-added)`).forEach(elem => {
        elem.classList.add("hover-added")
        const nodeInfo = nodesMap.get(elem.href.match(/node\/(\d+)/)[1])
        const nodeLi = elem?.parentElement?.parentElement?.parentElement
        nodeLi.classList.add("way-last-version-node")
        nodeLi.onmouseenter = () => {
            const color = darkModeForMap || isDarkTiles() ? c("#ff00e3") : "#000000"
            showActiveNodeMarker(nodeInfo.lat.toString(), nodeInfo.lon.toString(), color, true, 6, 3)
        }
        nodeLi.onclick = e => {
            if (e.altKey) return
            panTo(nodeInfo.lat.toString(), nodeInfo.lon.toString())
            const color = darkModeForMap || isDarkTiles() ? c("#ff00e3") : "#000000"
            showActiveNodeMarker(nodeInfo.lat.toString(), nodeInfo.lon.toString(), color, true, 6, 3)
        }
        nodeLi.ondblclick = zoomToCurrentObject
        if (nodeInfo.tags) {
            Object.entries(nodeInfo.tags).forEach(([k, v]) => {
                nodeLi.title += `\n${k}=${v}`
            })
            nodeLi.title = nodeLi.title.trim()
        }
    })
    // prettier-ignore
    document.querySelector(".way-last-version-node")?.parentElement?.parentElement?.querySelector("summary")?.addEventListener("mouseenter", () => {
        cleanObjectsByKey("activeObjects")
    })
    document.querySelector(".secondary-actions")?.addEventListener("mouseenter", () => {
        cleanObjectsByKey("activeObjects")
    })

    if (infoBtn) {
        const nodesIds = wayData.elements.find(i => i.type === "way").nodes
        const infos = makePolygonMeasureButtons(nodesIds, nodesMap, "way")
        document.querySelector("#sidebar_content h4:last-of-type").after(infos)

        infoBtn.onclick = () => {
            infos.style.display = infos.style.display === "none" ? "" : "none"
        }
    }
    console.log("addHoverForWayNodes finished")
}

/**
 * @param {string[]} restrictionRelationErrors
 * @param {HTMLElement} targetElem
 */
function showRestrictionValidationStatus(restrictionRelationErrors, targetElem) {
    if (restrictionRelationErrors.length === 0) {
        return
    }
    if (!targetElem.querySelector(".validation-status")) {
        const validationStatus = document.createElement("span")
        validationStatus.classList.add("validation-status")
        validationStatus.textContent = " ⚠️"
        validationStatus.title = restrictionRelationErrors.join("\n")
        targetElem.appendChild(validationStatus)
    }
}

async function addHoverForRelationMembers() {
    // todo make async safe
    const match = location.pathname.match(/^\/relation\/(\d+)\/?$/)
    if (!match) {
        return
    }
    const relation_id = parseInt(match[1])
    let infoBtn
    // eslint-disable-next-line no-constant-condition no-constant-binary-expression
    if (!document.querySelector(".relation-info-btn")) {
        infoBtn = document.createElement("span")
        infoBtn.textContent = "📐"
        infoBtn.classList.add("relation-info-btn")
        infoBtn.classList.add("completed")
        infoBtn.style.fontSize = "large"
        infoBtn.style.cursor = "pointer"

        document.querySelector("#sidebar_content h4:last-of-type").appendChild(document.createTextNode("\xA0"))
        document.querySelector("#sidebar_content h4:last-of-type").appendChild(infoBtn)
    }
    const relationData = await loadRelationMetadata(relation_id)
    if (!relationData) return
    while (document.querySelector("details turbo-frame .spinner-border")) {
        console.log("wait members list loading")
        await sleep(1000)
    }
    /*** @type {Map<string, NodeVersion>}*/
    const nodesMap = new Map(
        Object.entries(
            Object.groupBy(
                relationData.elements.filter(i => i.type === "node"),
                i => i.id,
            ),
        ).map(([k, v]) => [k, v[0]]),
    )
    /*** @type {Map<string, WayVersion>}*/
    const waysMap = new Map(
        Object.entries(
            Object.groupBy(
                relationData.elements.filter(i => i.type === "way"),
                i => i.id,
            ),
        ).map(([k, v]) => [k, v[0]]),
    )
    /*** @type {Map<string, RelationVersion>}*/
    const relationsMap = new Map(
        Object.entries(
            Object.groupBy(
                relationData.elements.filter(i => i.type === "relation"),
                i => i.id,
            ),
        ).map(([k, v]) => [k, v[0]]),
    )
    let restrictionArrows = []
    const pinSign = document.createElement("span")

    function bringRestrictionArrowsToFront() {
        restrictionArrows.forEach(i => i.bringToFront())
    }

    let isRestriction = false
    document.querySelectorAll(`details [href^="/node/"]:not(.hover-added)`).forEach(elem => {
        elem.classList.add("hover-added")
        const nodeInfo = nodesMap.get(elem.href.match(/node\/(\d+)/)[1])
        const nodeLi = elem?.parentElement?.parentElement?.parentElement
        nodeLi.classList.add("relation-last-version-member")
        nodeLi.onmouseenter = () => {
            const color = darkModeForMap || isDarkTiles() ? c("#ff00e3") : "#000000"
            showActiveNodeMarker(nodeInfo.lat.toString(), nodeInfo.lon.toString(), color, true, 6, 3)
            bringRestrictionArrowsToFront()
            if (isRestriction && pinSign.classList.contains("pinned")) {
                // https://github.com/deevroman/better-osm-org/pull/324#issuecomment-2993733516
                injectJSIntoPage(`
                (() => {
                    let tmp = document.createElement("span")
                    tmp.innerHTML = '<svg id="kek" width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="6" stroke="black" stroke-width="3" fill="none" /></svg>'
                    window.prevdo = {
                        maxWidth: 10,
                        maxHeight: 10,
                        className: "restriction-via-node-workaround",
                        icon: L.icon({
                            iconUrl: "data:image/svg+xml;base64," + btoa(tmp.innerHTML),
                            iconSize: [100, 100],
                            iconAnchor: [50, 50]
                        })
                    };
                })()
                `)
                const m = getWindow().L.marker(getWindow().L.latLng(nodeInfo.lat, nodeInfo.lon), getWindow().prevdo)
                layers["activeObjects"].push(m)
                m.addTo(getMap())
            }
        }
        nodeLi.onclick = e => {
            if (e.altKey) return
            panTo(nodeInfo.lat.toString(), nodeInfo.lon.toString())
            const color = darkModeForMap || isDarkTiles() ? c("#ff00e3") : "#000000"
            showActiveNodeMarker(nodeInfo.lat.toString(), nodeInfo.lon.toString(), color, true, 6, 3)
            bringRestrictionArrowsToFront()
        }
        nodeLi.ondblclick = zoomToCurrentObject
        if (nodeInfo.tags) {
            Object.entries(nodeInfo.tags).forEach(([k, v]) => {
                nodeLi.title += `\n${k}=${v}`
            })
            nodeLi.title = nodeLi.title.trim()
        }
    })
    document.querySelectorAll(`details [href^="/way/"]:not(.hover-added)`).forEach(elem => {
        elem.classList.add("hover-added")
        const wayInfo = waysMap.get(elem.href.match(/way\/(\d+)/)[1])
        const wayLi = elem?.parentElement?.parentElement?.parentElement
        wayLi.classList.add("relation-last-version-member")
        wayLi.onmouseenter = () => {
            const currentNodesList = wayInfo.nodes.map(i => [nodesMap.get(i.toString()).lat, nodesMap.get(i.toString()).lon])
            const color = darkModeForMap || isDarkTiles() ? c("#ff00e3") : "#000000"
            showActiveWay(cloneInto(currentNodesList, unsafeWindow), color)
            bringRestrictionArrowsToFront()
        }
        wayLi.onclick = e => {
            if (e.altKey) return
            if (e.target.tagName === "A") return
            const currentNodesList = wayInfo.nodes.map(i => [nodesMap.get(i.toString()).lat, nodesMap.get(i.toString()).lon])
            const color = darkModeForMap || isDarkTiles() ? c("#ff00e3") : "#000000"
            showActiveWay(cloneInto(currentNodesList, unsafeWindow), color, true)
            bringRestrictionArrowsToFront()
        }
        wayLi.ondblclick = zoomToCurrentObject
        if (wayInfo.tags) {
            Object.entries(wayInfo.tags).forEach(([k, v]) => {
                wayLi.title += `\n${k}=${v}`
            })
            wayLi.title = wayLi.title.trim()
        }
    })
    document.querySelectorAll(`details:last-of-type [href^="/relation/"]:not(.hover-added)`).forEach(elem => {
        elem.classList.add("hover-added")
        const relationInfo = relationsMap.get(elem.href.match(/relation\/(\d+)/)[1])
        const relationLi = elem?.parentElement?.parentElement?.parentElement
        relationLi.classList.add("relation-last-version-member")
        relationLi.onmouseenter = () => {
            relationInfo.members.forEach(i => {
                const color = darkModeForMap || isDarkTiles() ? c("#ff00e3") : "#000000"
                if (i.type === "node") {
                    showActiveNodeMarker(nodesMap[i.id].lat.toString(), nodesMap[i.id].lon.toString(), color, true, 6, 3)
                } else if (i.type === "way") {
                    const currentNodesList = waysMap[i.id].nodes.map(i => [nodesMap.get(i.toString()).lat, nodesMap.get(i.toString()).lon])
                    showActiveWay(cloneInto(currentNodesList, unsafeWindow), color)
                } else {
                    // todo
                }
            })
            bringRestrictionArrowsToFront()
        }
        relationLi.onclick = e => {
            if (e.altKey) return
            if (e.target.tagName === "A") return
            relationInfo.members.forEach(i => {
                const color = darkModeForMap || isDarkTiles() ? c("#ff00e3") : "#000000"
                if (i.type === "node") {
                    if (e.altKey) return
                    panTo(nodesMap[i.id].lat.toString(), nodesMap[i.id].lon.toString())
                    showActiveNodeMarker(nodesMap[i.id].lat.toString(), nodesMap[i.id].lon.toString(), color, true, 6, 3)
                } else if (i.type === "way") {
                    const currentNodesList = waysMap[i.id].nodes.map(i => [nodesMap.get(i.toString()).lat, nodesMap.get(i.toString()).lon])
                    showActiveWay(cloneInto(currentNodesList, unsafeWindow), color, true)
                } else {
                    // todo
                }
            })
            bringRestrictionArrowsToFront()
        }
        relationLi.ondblclick = zoomToCurrentObject
        if (relationInfo.tags) {
            Object.entries(relationInfo.tags).forEach(([k, v]) => {
                relationLi.title += `\n${k}=${v}`
            })
            relationLi.title = relationLi.title.trim()
        }
    })
    // prettier-ignore
    document.querySelector(".relation-last-version-member")?.parentElement?.parentElement?.querySelector("summary")?.addEventListener("mouseenter", () => {
        cleanObjectsByKey("activeObjects")
    })
    document.querySelector(".secondary-actions")?.addEventListener("mouseenter", () => {
        cleanObjectsByKey("activeObjects")
    })
    if (document.querySelector("#sidebar_content h2:not(.restriction-rendered)") && isRestrictionObj(relationsMap.get(relation_id.toString()).tags ?? {})) {
        isRestriction = true
        document.querySelector("#sidebar_content h2").classList.add("restriction-rendered")
        const extendedRelationVersion = relationsMap.get(relation_id.toString())
        extendedRelationVersion.members = extendedRelationVersion.members.map(mem => {
            if (mem.type === "node") {
                mem["lat"] = nodesMap.get(mem.ref.toString()).lat
                mem["lon"] = nodesMap.get(mem.ref.toString()).lon
                return /** @type {ExtendedRelationNodeMember} */ mem
            } else if (mem.type === "way") {
                mem["geometry"] = waysMap.get(mem.ref.toString()).nodes.map(n => ({
                    lat: nodesMap.get(n.toString()).lat,
                    lon: nodesMap.get(n.toString()).lon,
                }))
                return /** @type {ExtendedRelationWayMember} */ mem
            } else if (mem.type === "relation") {
                // todo
                return /** @type {ExtendedRelationMember} */ mem
            }
        })
        const errors = validateRestriction(/** @type {ExtendedRelationVersion} */ extendedRelationVersion)
        if (errors.length) {
            showRestrictionValidationStatus(errors, document.querySelector("#sidebar_content > div:first-of-type details:last-of-type summary"))
        } else {
            restrictionArrows = renderRestriction(/** @type {ExtendedRelationVersion} */ extendedRelationVersion, restrictionColors[extendedRelationVersion.tags["restriction"]] ?? "#000", "customObjects")
            pinSign.classList.add("pinned")
            pinSign.textContent = "📌"
            pinSign.tabIndex = 0
            pinSign.title = "Pin restriction sign on map.\nYou can hide all the objects that better-osm-org adds by pressing ` or ~"
            pinSign.style.cursor = "pointer"
            pinSign.onkeypress = pinSign.onclick = async e => {
                e.preventDefault()
                e.stopImmediatePropagation()
                if (pinSign.classList.contains("pinned")) {
                    pinSign.style.cursor = "pointer"
                    pinSign.classList.remove("pinned")
                    pinSign.style.filter = "grayscale(1)"
                    pinSign.title = "Hide restriction sign"
                    restrictionArrows.forEach(i => (i.getElement().style.display = "none"))
                } else {
                    pinSign.title = "Hide restriction sign"
                    pinSign.classList.add("pinned")
                    pinSign.style.filter = ""
                    restrictionArrows.forEach(i => (i.getElement().style.display = ""))
                }
            }
            document.querySelector("#sidebar_content > div:first-of-type details:last-of-type summary").appendChild(document.createTextNode(" "))
            document.querySelector("#sidebar_content > div:first-of-type details:last-of-type summary").appendChild(pinSign)
        }
    }

    if (infoBtn) {
        const nodesIds = relationData.elements.filter(i => i.type === "way").flatMap(i => i.nodes)
        const infos = makePolygonMeasureButtons(nodesIds, nodesMap, "relation")
        document.querySelector("#sidebar_content h4:last-of-type").after(infos)

        infoBtn.onclick = () => {
            infos.style.display = infos.style.display === "none" ? "" : "none"
        }
    }
    console.log("addHoverForRelationMembers finished")
}

function makeHeaderPartsClickable() {
    function makeElemCopyable(elem, url = "") {
        if (/^\d+$/.test(elem.textContent)) {
            elem.title = `Click to copy ID\n${CtrlKeyName} + click to copy URL`
        } else {
            elem.title = "Click to copy"
        }
        elem.style.cursor = "pointer"
        elem.classList.add("copyable")
        elem.addEventListener("click", e => {
            if (e.altKey) return
            if (window.getSelection().type === "Range") return
            if ((e.ctrlKey || e.metaKey) && url !== "") {
                navigator.clipboard.writeText(url).then(() => copyAnimation(e, url))
            } else {
                navigator.clipboard.writeText(elem.textContent).then(() => copyAnimation(e, elem.textContent))
            }
        })
    }

    document.querySelectorAll("#sidebar_content h2 bdi:not(.copyable)").forEach(i => {
        if (i.textContent.match(/^\d+$/)) {
            const url = shortOsmOrgLinksInText(location.origin + location.pathname)
            if (url.startsWith("http")) {
                makeElemCopyable(i, url)
            } else {
                makeElemCopyable(i, "https://" + url)
            }
        } else {
            makeElemCopyable(i)
        }
    })
    document.querySelectorAll("#sidebar_content h2:not(:has(.copyable))").forEach(i => {
        if (i.childNodes.length >= 1 && i.childNodes[0].nodeName === "#text") {
            const match = /\d+/g.exec(i.childNodes[0].textContent)
            if (!match) return
            i.childNodes[0].splitText(match.index + match[0].length)
            i.childNodes[0].splitText(match.index)
            const span = document.createElement("bdi")
            span.textContent = i.childNodes[1].textContent
            i.childNodes[1].replaceWith(span)
            const url = shortOsmOrgLinksInText(location.origin + location.pathname)
            if (url.startsWith("http")) {
                makeElemCopyable(span, url)
            } else {
                makeElemCopyable(span, "https://" + url)
            }
        }
    })
}

function expandWikidata() {
    const links = Array.from(document.querySelectorAll(".wdt-preview:not([disabled])"))
    // fuck Bootstrap. When page contains many HTML elements, him querySelector iterates over all elements
    // This is especially noticeable on the relationship pages.
    if (links.length > 50) {
        return
    }
    console.debug("Wikilinks count:", links.length)
    ;(links.find(i => i.parentElement.classList.contains("history-diff-new-tag") || i.parentElement.classList.contains("history-diff-modified-tag")) ?? links?.[0])?.click()
    setTimeout(() => {
        links.slice(0, 3).forEach(i => i.click())
    }, 100)
    setTimeout(() => {
        links.slice(3).forEach(i => i.click())
    }, 1000)
}

function makeContextMenuElem(e) {
    const x = e.pageX ? e.pageX : e.target.getBoundingClientRect().right
    const y = e.pageY ? e.pageY : e.target.getBoundingClientRect().bottom
    const menu = document.createElement("div")
    menu.classList.add("betterOsmContextMenu")
    menu.style.left = `${max(5, x - 30)}px`
    menu.style.top = `${y}px`
    return menu
}

/**
 * @param {number} lat
 * @param {number} lon
 * @return {Object.<string, {getter: function(): string}>}
 */
function makeCoordinatesFormatters(lat, lon) {
    return {
        "Lat Lon": { getter: () => `${lat.toFixed(6)} ${lon.toFixed(6)}` },
        "Lon Lat": { getter: () => `${lon.toFixed(6)} ${lat.toFixed(6)}` },
        "geo:": { getter: () => `geo:${lat.toFixed(6)},${lon.toFixed(6)}` },
        "osm.org": { getter: () => `osm.org#map=${getZoom()}/${lat.toFixed(6)}/${lon.toFixed(6)}` },
    }
}

function addCopyCoordinatesButtons() {
    const m = location.pathname.match(/^\/(node|way)\/(\d+)/)
    if (!m) {
        return
    }
    const type = m[1]
    if (type === "way") {
        return
    }

    function addCopyButton(coordsElem, lat, lon) {
        const coordinatesFormatters = makeCoordinatesFormatters(parseFloat(lat), parseFloat(lon))

        coordsElem.onclick = async e => {
            e.preventDefault()
            e.stopPropagation()
            e.stopImmediatePropagation()

            const coordinatesFormat = (await GM.getValue("CoordinatesFormat")) ?? "Lat Lon"
            const text = coordinatesFormatters[coordinatesFormat]["getter"]()
            navigator.clipboard.writeText(text).then(() => copyAnimation({ target: coordsElem }, text))
        }
        setTimeout(async () => {
            const coordinatesFormat = (await GM.getValue("CoordinatesFormat")) ?? "Lat Lon"
            coordsElem.title = "Click to copy " + coordinatesFormatters[coordinatesFormat]["getter"]()
        })
        coordsElem.classList.add("copyable")
        const copyButton = document.createElement("span")
        copyButton.classList.add("copy-coords-btn")
        copyButton.textContent = "📄"
        copyButton.title = "Select coordinates format for copy.\nTo copy just click by coordinates"
        copyButton.innerHTML = copyBtnSvg
        copyButton.style.height = "0.9rem"
        copyButton.style.position = "relative"
        if (location.pathname.endsWith("/history")) {
            copyButton.style.top = "-2px"
        } else {
            copyButton.style.top = "-1px"
        }
        copyButton.style.left = "-1px"
        copyButton.style.color = "gray"
        copyButton.style.cursor = "pointer"

        async function contextMenuHandler(e) {
            const coordinatesFormat = (await GM.getValue("CoordinatesFormat")) ?? "Lat Lon"
            e.preventDefault()
            e.stopPropagation()
            e.stopImmediatePropagation()

            injectContextMenuCSS()
            document.querySelectorAll(".betterOsmContextMenu").forEach(i => i.remove())
            const menu = makeContextMenuElem(e)
            Object.entries(coordinatesFormatters).forEach(([format, formatter], ind) => {
                const listItem = document.createElement("div")
                const text = formatter.getter()
                const a = document.createElement("a")
                a.textContent = text
                a.title = "Click to copy " + text
                a.style.width = "100%"
                a.onclick = e => {
                    e.preventDefault()
                    navigator.clipboard.writeText(text)
                }

                const pin = document.createElement("input")
                pin.id = "CoordFormat_" + ind
                pin.type = "radio"
                pin.classList.add("pin")
                pin.setAttribute("name", "viewer-selector")
                const pinLabel = document.createElement("label")
                pinLabel.setAttribute("for", "CoordFormat_" + ind)
                pinLabel.classList.add("pin-label")
                pinLabel.textContent = "📌"
                pinLabel.title = "Set as default for copy, when you click by coordinates"
                if (format === coordinatesFormat) {
                    pin.checked = true
                    pinLabel.title = "It's default format, when your click by coordinates"
                }
                pin.onchange = async () => {
                    if (pin.checked) {
                        await GM.setValue("CoordinatesFormat", format)
                        coordsElem.title = "Click to copy " + coordinatesFormatters[format]["getter"]()
                    }
                }
                listItem.appendChild(pin)
                listItem.appendChild(pinLabel)
                listItem.appendChild(a)
                document.addEventListener(
                    "click",
                    function fn(e) {
                        if (!e.isTrusted) {
                            document.addEventListener("click", fn, { once: true })
                            return
                        }
                        if (e.target.classList.contains("pin-label") || e.target.classList.contains("pin")) {
                            document.addEventListener("click", fn, { once: true })
                            return
                        }
                        menu.remove()
                    },
                    { once: true },
                )
                menu.appendChild(listItem)
            })
            document.body.appendChild(menu)
        }

        copyButton.addEventListener("click", contextMenuHandler)
        coordsElem.after(copyButton)
        coordsElem.after(document.createTextNode("\xA0"))
    }

    document.querySelectorAll("#sidebar_content a:has(.longitude):not(.copyable)").forEach(coordsElem => {
        const lat = coordsElem.querySelector(".latitude").textContent.replace(",", ".")
        const lon = coordsElem.querySelector(".longitude").textContent.replace(",", ".")
        addCopyButton(coordsElem, lat, lon)
    })
    if (type === "way") {
    }
    // try {
    //     const wrapper = document.createElement("span")
    //     document.querySelector(".share-geo-uri h4:not(.copyable)")?.appendChild(wrapper)
    //     document.querySelector(".share-geo-uri h4").classList.add("copyable")
    //
    //     const lat = getMap().getCenter().lat.toFixed(6)
    //     const lon = getMap().getCenter().lat.toFixed(6)
    //     addCopyButton(wrapper, lat, lon)
    // } catch (e) {
    //     console.error(e)
    // }
}

function addRelationHistoryViewerLinks() {
    if (!location.pathname.match(/\/relation\/[0-9]+\/history\/?$/)) {
        return
    }
    if (document.querySelector(".relation-viewer-link")) {
        return
    }
    const id = parseInt(location.pathname.match(/\/relation\/(\d+)/)[1])
    const type = "relation"
    injectCSSIntoOSMPage(contextMenuCSS)
    const viewInExternal = document.createElement("a")
    viewInExternal.classList.add("relation-viewer-link")
    viewInExternal.innerHTML = externalLinkSvg
    viewInExternal.style.cursor = "pointer"
    viewInExternal.style.position = "relative"
    viewInExternal.style.top = "-2px"
    viewInExternal.style.paddingLeft = "5px"
    viewInExternal.title = "Click for open external relation viewer.\nOr use key O"
    viewInExternal.querySelector("svg").tabIndex = 0

    async function contextMenuHandler(e) {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
        const relationViewer = (await GM.getValue("relationHistoryViewer")) ?? mapkiLink.name

        const menu = makeContextMenuElem(e)
        instancesOfRelationViewers.forEach(i => {
            const listItem = document.createElement("div")
            const a = document.createElement("a")
            const [x, y, z] = getCurrentXYZ()
            a.href = i.makeURL({ x, y, z, type, id })
            a.textContent = i.name
            a.target = "_blank"
            a.classList.add("relation-viewer-a")

            const pin = document.createElement("input")
            pin.id = i.name
            pin.type = "radio"
            pin.classList.add("pin")
            pin.setAttribute("name", "viewer-selector")
            const pinLabel = document.createElement("label")
            pinLabel.setAttribute("for", i.name)
            pinLabel.classList.add("pin-label")
            pinLabel.textContent = "📌"
            pinLabel.title = "Set as default for click"
            if (i.name === relationViewer) {
                pin.checked = true
                pinLabel.title = "It's default viewer"
            }
            pin.onchange = async () => {
                if (pin.checked) {
                    await GM.setValue("relationHistoryViewer", i.name)
                }
            }
            listItem.appendChild(pin)
            listItem.appendChild(pinLabel)
            listItem.appendChild(a)
            document.addEventListener(
                "click",
                function fn(e) {
                    if (!e.isTrusted) {
                        document.addEventListener("click", fn, { once: true })
                        return
                    }
                    if (e.target.classList.contains("pin-label") || e.target.classList.contains("pin")) {
                        document.addEventListener("click", fn, { once: true })
                        return
                    }
                    menu.remove()
                },
                { once: true },
            )
            menu.appendChild(listItem)
        })
        document.body.appendChild(menu)
        if (e.type === "keypress" || (e.type === "click" && !e.isTrusted)) {
            menu.querySelector("input:checked ~ a").focus()
        }
    }

    viewInExternal.addEventListener("click", contextMenuHandler)
    viewInExternal.addEventListener("keypress", contextMenuHandler)
    viewInExternal.addEventListener("contextmenu", contextMenuHandler)
    document.querySelector("#sidebar_content h2").appendChild(viewInExternal)
}

function makeVersionPageBetter() {
    const match = location.pathname.match(/(node|way|relation)\/(\d+)(\/history\/(\d+)\/?$|\/?$)/)
    if (!match) {
        return
    }
    addCompactSidebarStyle()
    externalizeLinks(document.querySelectorAll("#sidebar_content p a"))
    externalizeLinks(document.querySelectorAll("#sidebar_content table a"))
    const browseSectionSelector = document.querySelector("#element_versions_list")
        ? '#element_versions_list > div:not(:has(a[href*="/redactions/"]:not([rel]):not(.unredacted)))'
        : "#sidebar_content > div:first-of-type"
    if (!document.querySelector(".find-user-btn")) {
        try {
            const ver = document.querySelector(browseSectionSelector)
            const tagsCount = ver.querySelectorAll("#sidebar_content tr:has(th):has(td)").length
            if (tagsCount > 5) {
                ver.title = makeTitleForTagsCount(tagsCount)
            }

            const metainfoHTML = ver?.querySelector(":scope > div > div")
            if (metainfoHTML && !metainfoHTML.querySelector('a[href*="/user/"]:not([rel])')) {
                const time = metainfoHTML.querySelector("time")
                const changesetID = ver.querySelector(':scope div a[href^="/changeset/"]:not([rel])').textContent

                metainfoHTML.lastChild.remove()
                const findBtn = document.createElement("span")
                findBtn.classList.add("find-user-btn")
                findBtn.title = "Try find deleted user"
                findBtn.textContent = " 🔍 "
                findBtn.value = changesetID
                findBtn.datetime = time.dateTime
                findBtn.style.cursor = "pointer"
                findBtn.onclick = findChangesetInDiff
                metainfoHTML.appendChild(findBtn)
            }
        } catch {
            /* empty */
        }
    }
    makeHeaderPartsClickable()
    addHistoryLink()
    makeLinksInVersionTagsClickable()
    makeHashtagsClickable()
    makeTimesSwitchable()
    document.querySelectorAll(`${browseSectionSelector} p`).forEach(shortOsmOrgLinks)
    addCommentsCount()
    expandWikidata()
    addCopyCoordinatesButtons()
    void addHoverForNodesParents()
    void addHoverForWayNodes()
    void addHoverForRelationMembers()
    // костыль для KeyK/L и OSM tags editor
    document.querySelector("#sidebar_content > div:first-of-type")?.classList?.add("browse-section")
    document.querySelectorAll("#element_versions_list > div").forEach(i => i.classList.add("browse-section"))
}

function setupMakeVersionPageBetter() {
    const match = location.pathname.match(/(node|way|relation)\/(\d+)(\/history\/(\d+)\/?$|\/?$)/)
    if (!match) {
        return
    }
    const timerId = setInterval(makeVersionPageBetter, 500)
    setTimeout(() => {
        clearInterval(timerId)
        console.debug("stop adding MakeVersionPageBetter")
    }, 3000)
    makeVersionPageBetter()
}

//</editor-fold>
