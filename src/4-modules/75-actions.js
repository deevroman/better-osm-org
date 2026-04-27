//<editor-fold desc="actions">

function updateCurrentObjectMetadata() {
    setTimeout(loadChangesetMetadata, 0)
    setTimeout(loadNoteMetadata, 0)
    setTimeout(loadNodeMetadata, 0)
    setTimeout(loadWayMetadata, 0)
    setTimeout(loadRelationMetadata, 0)
}

const mapPositionsHistory = []
const mapPositionsNextHistory = []

function runPositionTracker() {
    if (isMobile) {
        console.log("skip position tracker on mobile device")
        return
    }
    if (!getMap || !getMap()?.getBounds) {
        console.error("Please, reload page, if something doesn't work")
    }
    setInterval(() => {
        if (!getMap || !getMap()?.getBounds) return
        const bound = get4Bounds(getMap())
        if (JSON.stringify(mapPositionsHistory[mapPositionsHistory.length - 1]) === JSON.stringify(bound)) {
            return
        }
        // in case of a transition between positions
        // via timeout?
        if (JSON.stringify(mapPositionsNextHistory[mapPositionsNextHistory.length - 1]) === JSON.stringify(bound)) {
            return
        }
        mapPositionsNextHistory.length = 0
        mapPositionsHistory.push(bound)
        if (mapPositionsHistory.length > 100) {
            mapPositionsHistory.shift()
            mapPositionsHistory.shift()
        }
    }, 1000)
}

let newNotePlaceholder = null

let overzoomObserver = null
const blankSuffix = "?blankTile=false"

function enableOverzoom() {
    if (!GM_config.get("OverzoomForDataLayer")) {
        return
    }
    if (customLayerInfo.url === ESRITemplate) {
        customLayerInfo.url = ESRIPrefix + "{z}/{y}/{x}" + blankSuffix
    } else if (customLayerInfo.url === ESRIBetaTemplate) {
        customLayerInfo.url = ESRIBetaPrefix + "{z}/{y}/{x}" + blankSuffix
    }
    ESRITemplate = ESRIPrefix + "{z}/{y}/{x}" + blankSuffix
    ESRIBetaTemplate = ESRIBetaPrefix + "{z}/{y}/{x}" + blankSuffix
    console.log("Enabling overzoom for map layer")
    overzoomObserver?.disconnect()

    injectJSIntoPage(`
    (function () {
        if (map && map.options) {
            map.options.maxZoom = 22
            const layers = [];
            map.eachLayer(i => layers.push(i))
            layers[0].options.maxZoom = 22
        } else {
            console.warn("overzoom not enabled")
        }
    })()
    `)

    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeName !== "IMG") {
                    return
                }
                getWindow().L.DomEvent.off(node, "error")
            })
        })
    })
    overzoomObserver = observer
    observer.observe(document.body, { childList: true, subtree: true })

    // it's unstable
    console.log("Overzoom enabled")
}

function disableOverzoom() {
    if (!GM_config.get("OverzoomForDataLayer")) {
        return
    }
    if (customLayerInfo.url === ESRITemplate) {
        customLayerInfo.url = ESRIPrefix + "{z}/{y}/{x}"
    } else if (customLayerInfo.url === ESRIBetaTemplate) {
        customLayerInfo.url = ESRIBetaPrefix + "{z}/{y}/{x}"
    }
    ESRITemplate = ESRIPrefix + "{z}/{y}/{x}"
    ESRIBetaTemplate = ESRIBetaPrefix + "{z}/{y}/{x}"
    injectJSIntoPage(`
    (function () {
        map.options.maxZoom = 19
        const layers = [];
        map.eachLayer(i => layers.push(i))
        layers[0].options.maxZoom = 19
    })()
    `)
    console.log("Overzoom disabled")
}

const ABORT_ERROR_PREV = "Abort requests for moving to prev changeset"
const ABORT_ERROR_NEXT = "Abort requests for moving to next changeset"
const ABORT_ERROR_USER_CHANGESETS = "Abort requests for moving to user changesets"
const ABORT_ERROR_WHEN_PAGE_CHANGED = "Abort requests. Reason: page changed"

let layersHidden = false

let needPreloadChangesets = false

function getPrevChangesetLink(doc = document) {
    const navigationLinks = doc.querySelectorAll("div.secondary-actions")[1]?.querySelectorAll("a")
    if (navigationLinks && navigationLinks[0].href.includes("/changeset/")) {
        return navigationLinks[0]
    }
}

function getNextChangesetLink(doc = document) {
    const navigationLinks = doc.querySelectorAll("div.secondary-actions")[1]?.querySelectorAll("a")
    if (navigationLinks && Array.from(navigationLinks).at(-1).href.includes("/changeset/")) {
        return Array.from(navigationLinks).at(-1)
    }
}

let repeatedEvent = false
let trustedEvent = true
const smoothScroll = "auto"

function goToPrevChangesetObject(e) {
    repeatedEvent = e.repeat
    if (!document.querySelector("ul .active-object")) {
        return
    }
    if (document.querySelector("#sidebar").matches(":hover")) {
        preventHoverEvents()
    }

    const prev = document.querySelector("ul .active-object")
    for (let i = 0; i < 10000; i++) {
        const cur = document.querySelector("ul .active-object")
        if (cur.previousElementSibling) {
            cur.previousElementSibling.classList.add("active-object")
            cur.classList.remove("active-object")
            // prettier-ignore
            if (!cur.previousElementSibling.classList.contains('tags-non-modified')
                || cur.previousElementSibling.classList.contains('location-modified')
                || cur.previousElementSibling.querySelector('.nodes-changed, .members-changed')
                || e.altKey
                || !location.search.includes("changesets=")) {
                trustedEvent = false
                cur.previousElementSibling.click()
                if (changesetObjectsSelectionModeEnabled) {
                    cur.previousElementSibling.querySelector("input")?.focus()
                }
                trustedEvent = true
                cur.previousElementSibling.scrollIntoView({ block: "center", behavior: smoothScroll })
                resetMapHover()
                cur.previousElementSibling.classList.add("map-hover")
                if (cur.previousElementSibling.querySelector(".load-relation-version")) {
                    cur.previousElementSibling.querySelector(".load-relation-version").focus()
                }
                return
            }
        } else {
            const curFrame = cur.parentElement.parentElement
            // prettier-ignore
            if (curFrame.id === "changeset_nodes" && ["changeset_ways", "changeset_relations"].includes(curFrame.previousElementSibling?.id)
                || curFrame.id === "changeset_relations" && ["changeset_ways"].includes(curFrame.previousElementSibling?.id)) {
                cur.classList.remove("active-object")
                curFrame.previousElementSibling.querySelector("#changeset_ways li:last-of-type, #changeset_relations li:last-of-type").classList.add("active-object")
                // prettier-ignore
                if (!curFrame.previousElementSibling.querySelector(".active-object").classList.contains('tags-non-modified')
                    || curFrame.previousElementSibling.querySelector(".active-object").classList.contains('location-modified')
                    || curFrame.previousElementSibling.querySelector(".active-object").querySelector('.nodes-changed, .members-changed')
                    || e.altKey
                    || !location.search.includes("changesets=")) {
                    trustedEvent = false
                    curFrame.previousElementSibling.querySelector(".active-object").click()
                    if (changesetObjectsSelectionModeEnabled) {
                        curFrame.previousElementSibling.querySelector(".active-object input")?.focus()
                    }
                    trustedEvent = true
                    curFrame.previousElementSibling.querySelector(".active-object").scrollIntoView({
                        block: "center",
                        behavior: smoothScroll,
                    })
                    resetMapHover()
                    curFrame.previousElementSibling.querySelector(".active-object").classList.add("map-hover")
                    if (curFrame.previousElementSibling?.querySelector(".load-relation-version")) {
                        curFrame.previousElementSibling.querySelector(".load-relation-version").focus()
                    }
                    if (curFrame.id === "changeset_relations") {
                        document.activeElement.blur()
                    }
                    return
                }
            } else {
                let prev = curFrame?.previousElementSibling?.previousElementSibling
                if (prev?.nodeName !== "TURBO-FRAME" && prev?.previousElementSibling?.nodeName === "TURBO-FRAME") {
                    prev = prev.previousElementSibling
                }
                if (prev?.nodeName === "TURBO-FRAME") {
                    cur.classList.remove("active-object")
                    prev.querySelector("li:last-of-type").classList.add("active-object")
                    // prettier-ignore
                    if (!prev.querySelector("li:last-of-type").classList.contains('tags-non-modified')
                        || prev.querySelector("li:last-of-type").classList.contains('location-modified')
                        || prev.querySelector("li:last-of-type")?.querySelector('.nodes-changed, .members-changed')
                        || e.altKey
                        || !location.search.includes("changesets=")) {
                        trustedEvent = false
                        prev.querySelector("li:last-of-type").click()
                        if (changesetObjectsSelectionModeEnabled) {
                            prev.querySelector("li:last-of-type input")?.focus()
                        }
                        trustedEvent = true
                        prev.querySelector("li:last-of-type").scrollIntoView({
                            block: "center",
                            behavior: smoothScroll,
                        })
                        resetMapHover()
                        prev.querySelector("li:last-of-type").classList.add("map-hover")
                        if (prev.querySelector("li:last-of-type").querySelector(".load-relation-version")) {
                            prev.querySelector("li:last-of-type").querySelector(".load-relation-version").focus()
                        }
                        return
                    }
                }
            }
        }

        if (cur === document.querySelector("ul .active-object")) {
            cur.classList.remove("active-object")
            prev.classList.add("active-object")
            return
        }
    }
}

function goToNextChangesetObject(e) {
    repeatedEvent = e.repeat
    if (document.querySelector("#sidebar").matches(":hover")) {
        preventHoverEvents()
    }
    if (!document.querySelector("ul .active-object")) {
        document
            .querySelector("#changeset_nodes li:not(.page-item), #changeset_ways li:not(.page-item), #changeset_relations li:not(.page-item)")
            .classList.add("active-object")
        trustedEvent = false
        document.querySelector("ul .active-object").click()
        if (changesetObjectsSelectionModeEnabled) {
            document.querySelector("ul .active-object input")?.focus()
        }
        trustedEvent = true
        resetMapHover()
        document.querySelector("ul .active-object").classList.add("map-hover")
        return
    }
    const prev = document.querySelector("ul .active-object")
    for (let i = 0; i < 10000; i++) {
        const cur = document.querySelector("ul .active-object")
        if (cur.nextElementSibling) {
            cur.nextElementSibling.classList.add("active-object")
            cur.classList.remove("active-object")
            // prettier-ignore
            if (!cur.nextElementSibling.classList.contains('tags-non-modified')
                || cur.nextElementSibling.classList.contains('location-modified')
                || cur.nextElementSibling.querySelector('.nodes-changed, .members-changed')
                || e.altKey
                || !location.search.includes("changesets=")) {
                trustedEvent = false
                cur.nextElementSibling.click()
                if (changesetObjectsSelectionModeEnabled) {
                    cur.nextElementSibling.querySelector("input")?.focus()
                }
                trustedEvent = true
                cur.nextElementSibling.scrollIntoView({ block: "center", behavior: smoothScroll })
                resetMapHover()
                cur.nextElementSibling.classList.add("map-hover")
                if (cur.nextElementSibling.querySelector(".load-relation-version")) {
                    cur.nextElementSibling.querySelector(".load-relation-version").focus()
                }
                return
            }
        } else {
            const curFrame = cur.parentElement.parentElement
            if (
                // prettier-ignore
                (curFrame.id === "changeset_ways" && ["changeset_nodes", "changeset_relations"].includes(curFrame.nextElementSibling?.id))
                || (curFrame.id === "changeset_relations" && ["changeset_nodes"].includes(curFrame.nextElementSibling?.id))
            ) {
                cur.classList.remove("active-object")
                curFrame.nextElementSibling.querySelector("#changeset_nodes li, #changeset_relations li").classList.add("active-object")
                // prettier-ignore
                if (!curFrame.nextElementSibling.querySelector(".active-object").classList.contains('tags-non-modified')
                    || curFrame.nextElementSibling.querySelector(".active-object").classList.contains('location-modified')
                    || curFrame.nextElementSibling.querySelector(".active-object").querySelector('.nodes-changed, .members-changed')
                    || e.altKey
                    || !location.search.includes("changesets=")) {
                    trustedEvent = false
                    curFrame.nextElementSibling.querySelector(".active-object").click()
                    if (changesetObjectsSelectionModeEnabled) {
                        curFrame.nextElementSibling.querySelector(".active-object input")?.focus()
                    }
                    trustedEvent = true
                    curFrame.nextElementSibling.querySelector(".active-object").scrollIntoView({
                        block: "center",
                        behavior: smoothScroll,
                    })

                    resetMapHover()
                    curFrame.nextElementSibling.querySelector(".active-object").classList.add("map-hover")
                    if (curFrame.nextElementSibling?.querySelector(".load-relation-version")) {
                        curFrame.nextElementSibling.querySelector(".load-relation-version").focus()
                    }
                    if (curFrame.id === "changeset_relations") {
                        document.activeElement.blur()
                    }
                    return
                }
            } else {
                let next = curFrame?.nextElementSibling?.nextElementSibling
                if (next?.nodeName !== "TURBO-FRAME" && next?.nextElementSibling?.nodeName === "TURBO-FRAME") {
                    next = next.nextElementSibling
                }
                if (next?.nodeName === "TURBO-FRAME") {
                    cur.classList.remove("active-object")
                    next.querySelector("li").classList.add("active-object")
                    // prettier-ignore
                    if (!next.querySelector("li").classList.contains('tags-non-modified')
                        || next.querySelector("li").classList.contains('location-modified')
                        || next.querySelector("li")?.querySelector('.nodes-changed, .members-changed')
                        || e.altKey
                        || !location.search.includes("changesets=")) {
                        trustedEvent = false
                        next.querySelector("li").click()
                        if (changesetObjectsSelectionModeEnabled) {
                            next.querySelector("li input")?.focus()
                        }
                        trustedEvent = true
                        next.querySelector("li").scrollIntoView({ block: "center", behavior: smoothScroll })
                        resetMapHover()
                        next.querySelector("li").classList.add("map-hover")
                        if (next.querySelector("li").querySelector(".load-relation-version")) {
                            next.querySelector("li").querySelector(".load-relation-version").focus()
                        }
                        return
                    }
                }
            }
        }

        if (cur === document.querySelector("ul .active-object")) {
            cur.classList.remove("active-object")
            prev.classList.add("active-object")
            return
        }
    }
    console.log("KeyL not found next elem")
}

function extractBboxFromElem(elem) {
    const bbox = JSON.parse(elem.getAttribute("data-changeset")).bbox
    bbox.min_lon = bbox.minlon
    bbox.min_lat = bbox.minlat
    bbox.max_lon = bbox.maxlon
    bbox.max_lat = bbox.maxlat
    return bbox
}

function preventHoverEvents() {
    if (document.querySelector("#mouse-trap")) return

    console.log("add mouse trap")
    const trap = document.createElement("div")
    trap.id = "mouse-trap"
    document.body.appendChild(trap)

    window.addEventListener(
        "mousemove",
        () => {
            trap.remove()
            console.log("remove mouse trap")
        },
        { once: true },
    )
}

function goToPrevChangeset() {
    if (!document.querySelector("ol .active-object")) {
        return
    }
    preventHoverEvents()

    const cur = document.querySelector("ol .active-object")
    let prev = cur.previousElementSibling
    while (true) {
        if (!prev) break
        if (prev.getAttribute("hidden") === "true") {
            prev = prev.previousElementSibling
        } else {
            break
        }
    }

    if (prev) {
        prev.classList.add("active-object")
        cur.classList.remove("active-object")
        let focused = prev.querySelector("a")
        focused.focus()
        if (massModeForUserChangesetsActive) {
            focused = prev.querySelector("input")
            focused?.focus()
        }
        resetSelectedChangesets()
        prev.classList.add("selected")
        prev.scrollIntoView({ block: "center", behavior: "instant" })
        cleanObjectsByKey("changesetBounds")

        setTimeout(() => {
            const bound = drawBBox(extractBboxFromElem(prev), { color: "#000000", weight: 4, fillOpacity: 0 })
            bound.bringToFront()
            focused.addEventListener(
                "focusout",
                () => {
                    bound.remove()
                },
                { once: true },
            )
            setTimeout(() => {
                bound.bringToFront()
            }, 20)
        })
    } else {
        document.querySelector('.changeset_more a[href*="after"]')?.click()
    }
}

function goToNextChangeset() {
    preventHoverEvents()
    if (!document.querySelector("ol .active-object")) {
        let next = document.querySelector("ol li")
        while (true) {
            if (next?.getAttribute("hidden") === "true") {
                next = next.nextElementSibling
            } else {
                break
            }
        }
        if (!next) {
            document.querySelector('.changeset_more a[href*="before"]')?.click()
            return
        }
        next.classList.add("active-object")
        document.querySelector("ol .active-object a").tabIndex = 0
        let focused = document.querySelector("ol .active-object a")
        focused.focus()
        if (massModeForUserChangesetsActive) {
            focused = document.querySelector("ol .active-object input")
            focused?.focus()
        }
        resetSelectedChangesets()
        document.querySelector("ol .active-object").classList.add("selected")
        cleanObjectsByKey("changesetBounds")
        const bound = drawBBox(extractBboxFromElem(document.querySelector("ol .active-object")), {
            color: "#000000",
            weight: 4,
            fillOpacity: 0,
        })
        bound.bringToFront()
        focused.addEventListener(
            "focusout",
            () => {
                bound.remove()
            },
            { once: true },
        )
        return
    }
    const cur = document.querySelector("ol .active-object")
    let next = cur.nextElementSibling
    while (true) {
        if (!next) break
        if (next.getAttribute("hidden") === "true") {
            next = next.nextElementSibling
        } else {
            break
        }
    }
    if (next) {
        next.classList.add("active-object")
        cur.classList.remove("active-object")
        let focused = next.querySelector("a")
        focused.focus()
        if (massModeForUserChangesetsActive) {
            focused = next.querySelector("input")
            focused?.focus()
        }
        resetSelectedChangesets()
        next.classList.add("selected")
        next.scrollIntoView({ block: "center", behavior: "instant" })
        cleanObjectsByKey("changesetBounds")

        setTimeout(() => {
            const bound = drawBBox(extractBboxFromElem(next), { color: "#000000", weight: 4, fillOpacity: 0 })
            bound.bringToFront()
            focused.addEventListener(
                "focusout",
                () => {
                    bound.remove()
                },
                { once: true },
            )
            setTimeout(() => {
                bound.bringToFront()
            }, 20)
        })
    } else {
        document.querySelector('.changeset_more a[href*="before"]')?.click()
    }
}

function extractLatLonFromElem(elem) {
    return [elem.getAttribute("data-lat"), elem.getAttribute("data-lon")]
}

function goToPrevSearchResult() {
    if (!document.querySelector("#sidebar_content ul .active-object")) {
        return
    }
    preventHoverEvents()

    const cur = document.querySelector("#sidebar_content ul .active-object")
    let prev = cur.previousElementSibling
    while (true) {
        if (!prev) break
        if (prev.getAttribute("hidden") === "true") {
            prev = prev.previousElementSibling
        } else {
            break
        }
    }
    if (!prev) {
        if (cur.parentElement.previousElementSibling.tagName === "UL") {
            prev = cur.parentElement.previousElementSibling?.querySelector("li:last-of-type")
        }
    }
    if (prev) {
        prev.classList.add("active-object")
        cur.classList.remove("active-object")
        const focused = prev.querySelector("a")
        focused.focus()
        prev.scrollIntoView({ block: "center", behavior: "instant" })

        const [lat, lon] = extractLatLonFromElem(document.querySelector("#sidebar_content ul .active-object a"))
        const marker = showNodeMarker(lat, lon)
        panTo(lat, lon)
        focused.addEventListener(
            "focusout",
            () => {
                marker.remove()
            },
            { once: true },
        )
    }
}

function goToNextSearchResult() {
    preventHoverEvents()
    if (!document.querySelector("#sidebar_content ul .active-object")) {
        document.querySelector("#sidebar_content ul li").classList.add("active-object")
        document.querySelector("#sidebar_content ul .active-object a").tabIndex = 0
        const focused = document.querySelector("#sidebar_content .active-object a")
        focused.focus()
        const [lat, lon] = extractLatLonFromElem(document.querySelector("#sidebar_content ul .active-object a"))
        const marker = showNodeMarker(lat, lon)
        panTo(lat, lon)
        focused.addEventListener(
            "focusout",
            () => {
                marker.remove()
            },
            { once: true },
        )
        return
    }
    const cur = document.querySelector("#sidebar_content ul .active-object")
    let next = cur.nextElementSibling
    while (true) {
        if (!next) break
        if (next.getAttribute("hidden") === "true") {
            next = next.nextElementSibling
        } else {
            break
        }
    }
    if (!next) {
        if (cur.parentElement.nextElementSibling.tagName === "UL") {
            next = cur.parentElement.nextElementSibling?.querySelector("li")
        }
    }
    if (next) {
        next.classList.add("active-object")
        cur.classList.remove("active-object")
        const focused = next.querySelector("a")
        focused.focus()
        resetSelectedChangesets()
        next.scrollIntoView({ block: "center", behavior: "instant" })

        const [lat, lon] = extractLatLonFromElem(document.querySelector("#sidebar_content ul .active-object a"))
        const marker = showNodeMarker(lat, lon)
        panTo(lat, lon)

        focused.addEventListener(
            "focusout",
            () => {
                marker.remove()
            },
            { once: true },
        )
    } else {
        document.querySelector(".search_more a")?.click()
    }
}

function goToPrevObjectVersion() {
    if (document.querySelector("#sidebar").matches(":hover")) {
        preventHoverEvents()
    }
    if (!document.querySelector("#sidebar_content .active-object")) {
        getMap()?.invalidateSize()
        document.querySelector("#element_versions_list > div:not(.hidden-version)").classList.add("active-object")
        document.querySelector("#element_versions_list > div:not(.hidden-version)").click()
        resetMapHover()
        document.querySelector("#element_versions_list > div:not(.hidden-version)").classList.add("map-hover")
    } else {
        const old = document.querySelector("#element_versions_list > div.active-object")
        let cur = old?.previousElementSibling
        while (cur && (!cur.classList.contains("browse-section") || cur.classList.contains("hidden-version"))) {
            cur = cur.previousElementSibling
        }
        if (cur) {
            cur.classList.add("active-object")
            old.classList.remove("active-object")
            cur.click()
            cur.scrollIntoView()
            resetMapHover()
            cur.classList.add("map-hover")
        }
    }
}

function goToNextObjectVersion() {
    if (document.querySelector("#sidebar").matches(":hover")) {
        preventHoverEvents()
    }
    if (!document.querySelector("#sidebar_content .active-object")) {
        getMap()?.invalidateSize()
        document.querySelector("#element_versions_list > div").classList.add("active-object")
        document.querySelector("#element_versions_list > div.active-object").click()
        resetMapHover()
        document.querySelector("#element_versions_list > div.active-object").classList.add("map-hover")
    } else {
        const old = document.querySelector("#element_versions_list > div.active-object")
        let cur = old?.nextElementSibling
        while (cur && (!cur.classList.contains("browse-section") || cur.classList.contains("hidden-version"))) {
            cur = cur.nextElementSibling
        }
        if (cur) {
            cur.classList.add("active-object")
            old.classList.remove("active-object")
            cur.click()
            cur.scrollIntoView()
            resetMapHover()
            cur.classList.add("map-hover")
        }
    }
}

function combineBBOXes(bboxes) {
    const bbox = {
        min_lat: 10000000,
        min_lon: 10000000,
        max_lat: -10000000,
        max_lon: -100000000,
    }
    for (const i of bboxes) {
        if (i?.min_lat) {
            bbox.min_lat = min(bbox.min_lat, i.min_lat)
            bbox.min_lon = min(bbox.min_lon, i.min_lon)
            bbox.max_lat = max(bbox.max_lat, i.max_lat)
            bbox.max_lon = max(bbox.max_lon, i.max_lon)
        }
    }
    return bbox
}

async function zoomToChangesets() {
    const params = new URLSearchParams(location.search)
    const changesetIDs = params.get("changesets")?.split(",")
    if (!changesetIDs) {
        return
    }

    for (const i of changesetIDs) {
        await loadChangesetMetadata(parseInt(i))
    }
    getMap()?.invalidateSize()
    const bbox = combineBBOXes(changesetIDs.map(i => changesetMetadatas[i]))
    fitBounds([
        [bbox.min_lat, bbox.min_lon],
        [bbox.max_lat, bbox.max_lon],
    ])
}

let shiftKeyZClicks = 0
let ZoomToObjectClicks = 0

function resetZoomClicks() {
    ZoomToObjectClicks = 0
}

function setupZKeysReseter() {
    window.addEventListener("mousemove", resetZoomClicks, { once: true })
}

function zoomToCurrentObject(e) {
    if (new URLSearchParams(location.search).has("changesets")) {
        void zoomToChangesets()
    } else if (location.pathname.startsWith("/changeset")) {
        const changesetMetadata = changesetMetadatas[location.pathname.match(/changeset\/(\d+)/)[1]]
        if (e.shiftKey && changesetMetadata) {
            setTimeout(async () => {
                // todo changesetID => merged BBOX
                const changesetID = parseInt(location.pathname.match(/changeset\/(\d+)/)[1])
                const nodesBag = []
                for (const node of Array.from((await getChangeset(changesetID)).data.querySelectorAll("node"))) {
                    if (node.getAttribute("visible") !== "false") {
                        nodesBag.push({
                            lat: parseFloat(node.getAttribute("lat")),
                            lon: parseFloat(node.getAttribute("lon")),
                        })
                    } else {
                        const version = searchVersionByTimestamp(
                            await getNodeHistory(node.getAttribute("id")),
                            new Date(new Date(changesetMetadata.created_at).getTime() - 1).toISOString(),
                        )
                        if (version && version.visible !== false) {
                            nodesBag.push({
                                lat: version.lat,
                                lon: version.lon,
                            })
                        }
                    }
                }
                if ((await getChangeset(changesetID)).data.querySelectorAll("relation").length && shiftKeyZClicks % 2 === 1) {
                    for (const way of (await getChangeset(changesetID)).data.querySelectorAll("way")) {
                        const targetTime =
                            way.getAttribute("visible") === "false"
                                ? new Date(new Date(changesetMetadata.created_at).getTime() - 1).toISOString()
                                : changesetMetadata.closed_at
                        try {
                            const [, currentNodesList] = await getWayNodesByTimestamp(targetTime, way.getAttribute("id"))
                            currentNodesList.forEach(coords => {
                                nodesBag.push({
                                    lat: coords[0],
                                    lon: coords[1],
                                })
                            })
                        } catch (e) {
                            console.error(e)
                        }
                    }
                }
                getMap()?.invalidateSize()
                if (nodesBag.length) {
                    const bbox = {
                        min_lat: Math.min(...nodesBag.map(i => i.lat)),
                        min_lon: Math.min(...nodesBag.map(i => i.lon)),
                        max_lat: Math.max(...nodesBag.map(i => i.lat)),
                        max_lon: Math.max(...nodesBag.map(i => i.lon)),
                    }
                    fitBounds([
                        [bbox.min_lat, bbox.min_lon],
                        [bbox.max_lat, bbox.max_lon],
                    ]) // todo max zoom
                } else {
                    fitBounds([
                        [changesetMetadata.min_lat, changesetMetadata.min_lon],
                        [changesetMetadata.max_lat, changesetMetadata.max_lon],
                    ])
                }
            })
        } else {
            getMap()?.invalidateSize()
            if (changesetMetadata) {
                fitBounds([
                    [changesetMetadata.min_lat, changesetMetadata.min_lon],
                    [changesetMetadata.max_lat, changesetMetadata.max_lon],
                ])
            } else {
                console.warn("Changeset metadata not downloaded")
            }
        }
    } else if (location.pathname.match(/(node|way|relation|note)\/\d+/)) {
        if (location.pathname.includes("node")) {
            if (nodeMetadata) {
                panTo(nodeMetadata.lat, nodeMetadata.lon, 18 + ZoomToObjectClicks++, ZoomToObjectClicks !== 1)
                setupZKeysReseter()
            } else {
                if (location.pathname.includes("history")) {
                    // panTo last visible version
                    // prettier-ignore
                    panTo(
                        document.querySelector("#element_versions_list > div span.latitude").textContent.replace(",", "."),
                        document.querySelector("#element_versions_list > div span.longitude").textContent.replace(",", "."),
                        18 + ZoomToObjectClicks++
                    )
                }
                setupZKeysReseter()
            }
        } else if (location.pathname.includes("note")) {
            if (!document.querySelector('#sidebar_content a[href*="/traces/"]') || !trackMetadata) {
                if (noteMetadata) {
                    const zoom = getZoom()
                    ZoomToObjectClicks++
                    if (zoom + ZoomToObjectClicks > 19) {
                        enableOverzoom()
                    }
                    if (ZoomToObjectClicks === 1) {
                        // prettier-ignore
                        panTo(
                            noteMetadata.geometry.coordinates[1],
                            noteMetadata.geometry.coordinates[0],
                            max(17, zoom),
                        )
                    } else {
                        // prettier-ignore
                        panTo(
                            noteMetadata.geometry.coordinates[1],
                            noteMetadata.geometry.coordinates[0],
                            max(min(overzoomObserver ? 22 : 19, max(zoom + 1, 17 + ZoomToObjectClicks - 1)), zoom),
                            true,
                        )
                    }
                    setupZKeysReseter()
                }
            } else if (trackMetadata) {
                fitBounds([
                    [trackMetadata.min_lat, trackMetadata.min_lon],
                    [trackMetadata.max_lat, trackMetadata.max_lon],
                ])
            }
        } else if (location.pathname.includes("way")) {
            if (wayMetadata) {
                fitBounds([
                    [wayMetadata.bbox.min_lat, wayMetadata.bbox.min_lon],
                    [wayMetadata.bbox.max_lat, wayMetadata.bbox.max_lon],
                ])
            }
        } else if (location.pathname.includes("relation")) {
            if (relationMetadata) {
                const viaNodes = relationMetadata.relation.members
                    .filter(m => m.role === "via")
                    .flatMap(m => {
                        if (m.type === "node") {
                            return m
                        } else {
                            return m.geometry
                        }
                    })
                if (e.code === "KeyZ" && e.shiftKey) {
                    fitBounds([
                        [Math.min(...viaNodes.map(i => i.lat)), Math.min(...viaNodes.map(i => i.lon))],
                        [Math.max(...viaNodes.map(i => i.lat)), Math.max(...viaNodes.map(i => i.lon))],
                    ])
                } else {
                    fitBounds([
                        [relationMetadata.bbox.min_lat, relationMetadata.bbox.min_lon],
                        [relationMetadata.bbox.max_lat, relationMetadata.bbox.max_lon],
                    ])
                }
            }
        }
    } else if (location.search.includes("&display-gpx=")) {
        if (trackMetadata) {
            fitBounds([
                [trackMetadata.min_lat, trackMetadata.min_lon],
                [trackMetadata.max_lat, trackMetadata.max_lon],
            ])
        }
    } else if (searchResultBBOX) {
        fitBounds([
            [searchResultBBOX.min_lat, searchResultBBOX.min_lon],
            [searchResultBBOX.max_lat, searchResultBBOX.max_lon],
        ])
    } else if (trackMetadata) {
        fitBounds([
            [trackMetadata.min_lat, trackMetadata.min_lon],
            [trackMetadata.max_lat, trackMetadata.max_lon],
        ])
    }
}

function nextVectorLayer() {
    const currentLayersIsVector = vectorLayerEnabled()
    const hashParams = new URLSearchParams(location.hash)
    if (currentLayersIsVector) {
        if (getCurrentLayers().includes("S")) {
            hashParams.set("layers", (hashParams.get("layers") ?? "").replace("S", "").replace("V", "") + "M")
        } else {
            hashParams.set("layers", (hashParams.get("layers") ?? "").replace("V", "") + "S")
        }
    } else {
        hashParams.set("layers", (hashParams.get("layers") ?? "") + "V")
    }
    location.hash = hashParams.toString()
}

async function openObjectInJosmOrLevel0(e) {
    const m = location.pathname.match(/\/(node|way|relation)\/([0-9]+)/)
    if (!m) return
    const [, type, id] = m
    const shortType = type === "node" ? "n" : type === "way" ? "w" : "r"
    if (e.altKey) {
        if (osm_server !== prod_server) {
            alert("level0 works only with osm.org")
            return
        }
        window.open(
            "https://level0.osmz.ru/?" +
                new URLSearchParams({
                    url: shortType + id + "!",
                }).toString(),
        )
    } else {
        if (!(await validateOsmServerInJOSM())) {
            return
        }
        window.open(
            "http://localhost:8111/load_object?" +
                new URLSearchParams({
                    objects: [shortType + id],
                    relation_members: true,
                }).toString(),
        )
    }
}

async function openSelectedObjectsOnChangesetPage(e) {
    const nodes = new Set()
    const ways = new Set()
    const relations = new Set()

    const changesetID = parseInt(location.pathname.match(/changeset\/(\d+)/)[1])
    const changesetData = (await getChangeset(changesetID)).data

    function processChangeset(data) {
        if (changesetObjectsSelectionModeEnabled) {
            document.querySelectorAll("#changeset_nodes input[type=checkbox]:checked").forEach(n => {
                nodes.add(parseInt(n.parentElement.nextElementSibling.id.match(/[0-9]+n([0-9]+)/)[1]))
            })
            document.querySelectorAll("#changeset_ways input[type=checkbox]:checked").forEach(w => {
                ways.add(parseInt(w.parentElement.nextElementSibling.id.match(/[0-9]+w([0-9]+)/)[1]))
            })
            document.querySelectorAll("#changeset_relations input[type=checkbox]:checked").forEach(r => {
                relations.add(parseInt(r.parentElement.nextElementSibling.id.match(/[0-9]+r([0-9]+)/)[1]))
            })
        } else {
            Array.from(data.querySelectorAll("node")).map(i => nodes.add(parseInt(i.getAttribute("id"))))
            Array.from(data.querySelectorAll("way")).map(i => ways.add(parseInt(i.getAttribute("id"))))
            Array.from(data.querySelectorAll("relation")).map(i => relations.add(parseInt(i.getAttribute("id"))))
        }
    }

    processChangeset(changesetData)

    if (location.search.includes("changesets=")) {
        const params = new URLSearchParams(location.search)
        const changesetIDs =
            params
                .get("changesets")
                ?.split(",")
                ?.filter(i => i !== changesetID) ?? []
        await Promise.all(
            changesetIDs.map(async i => {
                if (i === changesetID) return
                processChangeset((await getChangeset(i)).data)
            }),
        )
    }

    if (e.altKey) {
        if (osm_server !== prod_server) {
            alert("level0 works only with osm.org")
            return
        }
        // prettier-ignore
        window.open("https://level0.osmz.ru/?" + new URLSearchParams({
            url: [
                Array.from(nodes).map(i => "n" + i).join(","),
                Array.from(ways).map(i => "w" + i + (e.shiftKey ? "!" : "")).join(","),
                Array.from(relations).map(i => "r" + i).join(",")
            ].join(",").replace(/,,/, ",").replace(/,$/, "").replace(/^,/, "")
        }).toString())
    } else {
        const prefix = isMobile ? "josm:/load_object?" : "http://localhost:8111/load_object?"
        if (!isMobile && !(await validateOsmServerInJOSM())) {
            return
        }
        // prettier-ignore
        const params = {
            objects: [
                Array.from(nodes).map(i => "n" + i).join(","),
                Array.from(ways).map(i => "w" + i).join(","),
                Array.from(relations).map(i => "r" + i).join(",")
            ].join(",")
        }
        if (!isMobile) {
            params.new_layer = "true"
        }
        window.open(prefix + new URLSearchParams(params).toString())
    }
}

let defaultZoomKeysBehaviour = false

function shouldSkipHotkeyForActiveElement(e) {
    if (document.activeElement?.name === "text") return true
    if (document.activeElement?.nodeName === "INPUT" && ["input", "text"].includes(document.activeElement.getAttribute("type"))) {
        if (e.code === "Escape") {
            document.activeElement.blur()
        }
        return true
    }
    if (document.activeElement?.nodeName === "TEXTAREA" && e.code === "Enter") {
        if (document.activeElement.parentElement?.parentElement?.querySelector(".btn-wrapper")) {
            if (e.metaKey || e.ctrlKey) {
                document.activeElement.parentElement.parentElement.querySelector(".btn-wrapper .btn-primary").click()
                return true
            }
        }
    }
    if (
        ["TEXTAREA", "INPUT", "SELECT"].includes(document.activeElement?.nodeName) &&
        document.activeElement?.getAttribute("type") !== "checkbox" &&
        document.activeElement?.getAttribute("type") !== "radio"
    ) {
        return true
    }
    if (document.activeElement?.getAttribute("contenteditable")) {
        return true
    }
    // prettier-ignore
    if (["TH", "TD"].includes(document.activeElement?.nodeName)
        && document.activeElement?.parentElement?.parentElement?.parentElement?.hasAttribute("contenteditable")) {
        return true
    }
    // prettier-ignore
    if (["TR"].includes(document.activeElement?.nodeName)
        && document.activeElement?.parentElement?.parentElement?.hasAttribute("contenteditable")) {
        return true
    }
    return false
}

function handleMeasuringHotkeys(e) {
    if (measuring) {
        if (((e.ctrlKey || e.metaKey) && e.code === "KeyZ") || e.code === "Backspace" || e.code === "Delete") {
            if (currentMeasuring.way.length) {
                currentMeasuring.way.pop()
                currentMeasuring.nodes.pop()?.remove()
                currentMeasuring.tempLine?.remove()
                currentMeasuring.wayLine?.remove()
                if (currentMeasuring.way.length) {
                    currentMeasuring.wayLine = displayWay(currentMeasuring.way, false, "#000000", 1)
                    currentMeasuring.tempLine = displayWay(
                        [currentMeasuring.way[currentMeasuring.way.length - 1], lastLatLng],
                        false,
                        "#000000",
                        1,
                    )
                }
            }
            return true
        } else if (e.code === "Escape") {
            endMeasuring()
            return true
        }
        return false
    } else if (prevMeasurements.length && e.code === "Escape") {
        if (confirm("Clean measurements?")) {
            cleanMeasurements(e)
        }
        return true
    }
    return false
}

function handleRelationViewerHotkeys(e) {
    if (!document.activeElement?.classList?.contains("relation-viewer-a")) {
        return false
    }
    if (e.code !== "ArrowDown" && e.code !== "ArrowUp") {
        return false
    }
    e.preventDefault()
    e.stopPropagation()
    e.stopImmediatePropagation()
    if (e.code === "ArrowDown") {
        e.target.parentElement.nextElementSibling?.querySelector("a")?.focus()
    } else if (e.code === "ArrowUp") {
        e.target.parentElement.previousElementSibling?.querySelector("a")?.focus()
    }
    return true
}

function actionOpenYandexPanoramas() {
    const [x, y, z] = getCurrentXYZ()
    window.open(`https://yandex.ru/maps/?l=stv,sta&ll=${y},${x}&z=${z}`, "_blank", "noreferrer")
}

function actionCopyCurrentShortLink() {
    navigator.clipboard.writeText(shortOsmOrgLinksInText(location.origin + location.pathname))
}

function actionCloseUi() {
    buildingViewerIframe?.remove()
    buildingViewerIframe = null
    if (document.querySelector("#osm_alert_modal")?.checkVisibility()) {
        document.querySelector("#osm_alert_modal .btn-close").click()
    } else {
        document.querySelectorAll(".sidebar-close-controls .btn-close").forEach(i => i?.click())
        document.querySelector(".welcome .btn-close")?.click()
        document.querySelector("#banner .btn-close")?.click()
        document.querySelector(".better-btn-close")?.click()
    }
}

function actionClearActiveObjectsAndContextMenus() {
    cleanObjectsByKey("activeObjects")
    document.querySelectorAll(".betterOsmContextMenu").forEach(i => i.remove())
}

function actionGoToUserLocation() {
    document.querySelector(".control-locate .control-button").click()
}

function actionToggleSwitchableTime() {
    document.querySelector("time[switchable]")?.click()
}

function actionHandleKeyT() {
    if (location.pathname.includes("/user/") && !location.pathname.includes("/history")) {
        document.querySelector('a[href="/traces/mine"], a[href$="/traces"]:not(.nav-link):not(.dropdown-item)')?.click()
    } else {
        document.querySelector(".quick-look-compact-toggle-btn")?.click()
        document.querySelector(".compact-toggle-btn")?.click()
        actionToggleSwitchableTime()
    }
}

function actionOpenOverpassSearch() {
    setTimeout(async () => {
        getMap().getBounds()
        let message = `Type overpass selector:
\tkey
\tkey=value
\tkey~val,i`
        const currentUser = decodeURI(
            document
                .querySelector('.user-menu [href^="/user/"]')
                ?.getAttribute("href")
                ?.match(/\/user\/(.*)$/)?.[1] ?? "",
        )
        if (currentUser) {
            message += currentUser.match(/^[a-zA-Z0-9_]+$/) ? `\n\tnode(user:${currentUser})` : `\n\tnode(user:"${currentUser}")`
        }
        message += `
\tway[footway=crossing](if: length() > 150)
End with ! for global search
⚠this is a simple prototype of search`
        const query = prompt(message, await GM.getValue("lastOverpassQuery", ""))
        if (query) {
            insertOverlaysStyles()
            processOverpassQuery(query)
        }
    }, 0)
}

function isUserPageWithoutHistory() {
    return location.pathname.includes("/user/") && !location.pathname.includes("/history")
}

function isChangesetPage() {
    return location.pathname.startsWith("/changeset") && !location.pathname.includes("/changeset_comments")
}

function isObjectPage() {
    return /^\/(node|way|relation)\/\d+/.test(location.pathname)
}

function isObjectHistoryPage() {
    return /^\/(node|way|relation)\/\d+\/history/.test(location.pathname)
}

function isSearchPage() {
    return location.pathname === "/search"
}

function isHistoryPage() {
    return location.pathname.includes("/history")
}

function isFilteredHistoryPage() {
    return isHistoryPage() && (location.search.includes("after") || location.search.includes("before"))
}

function isHomeOrNotePage() {
    return location.pathname === "/" || location.pathname.includes("/note")
}

function isMainHotkeyPage() {
    return isHomeOrNotePage() || isSearchPage() || isChangesetPage() || isObjectPage() || isHistoryPage()
}

const hotkeyHelpContextsOrder = [
    "All pages",
    "Main pages",
    "User pages",
    "Changeset pages",
    "Object pages",
    "History pages",
    "Search page",
    "Debug",
]

const hotkeyCommandsPopupId = "better-osm-hotkey-commands-popup"
const hotkeyCommandsPopupStyleId = "better-osm-hotkey-commands-popup-styles"
const recentHotkeyActionsStorageKey = "recentHotkeyActions"
const recentHotkeyActionsLimit = 3

function getCurrentHotkeyContexts() {
    const contexts = new Set(["All pages"])

    if (isMainHotkeyPage()) {
        contexts.add("Main pages")
    }
    if (location.pathname.startsWith("/changeset")) {
        contexts.add("Changeset pages")
    }
    if (isObjectPage()) {
        contexts.add("Object pages")
    }
    if (isHistoryPage()) {
        contexts.add("History pages")
    }
    if (isSearchPage()) {
        contexts.add("Search page")
    }
    if (
        location.pathname.includes("/user/") ||
        /^\/user_blocks($|\/)/.test(location.pathname) ||
        /^\/blocks_by\/?$/.test(location.pathname)
    ) {
        contexts.add("User pages")
    }
    if (isDebug()) {
        contexts.add("Debug")
    }
    if (contexts.size === 1 || (contexts.size === 2 && contexts.has("Debug"))) {
        contexts.add("Main pages")
    }

    return hotkeyHelpContextsOrder.filter(context => contexts.has(context))
}

function actionShowHotkeysHelp() {
    void showHotkeyCommandsPopup()
}

function getHotkeyKeyByBaseCode(baseCode, shiftKey = false) {
    if (/^Key[A-Z]$/.test(baseCode)) {
        const letter = baseCode.slice(3)
        return shiftKey ? letter : letter.toLowerCase()
    }
    if (/^Digit\d$/.test(baseCode)) {
        return baseCode.slice(5)
    }

    return (
        {
            Escape: "Escape",
            F1: "F1",
            Slash: shiftKey ? "?" : "/",
            Backquote: shiftKey ? "~" : "`",
            Minus: shiftKey ? "_" : "-",
            Equal: shiftKey ? "+" : "=",
            Comma: shiftKey ? "<" : ",",
            Period: shiftKey ? ">" : ".",
        }[baseCode] ?? baseCode
    )
}

function formatHotkeyBinding(binding) {
    if (!binding) {
        return ""
    }

    const parts = binding.split("+")
    const baseCode = parts[parts.length - 1]
    const modifiers = parts.slice(0, -1)

    const displayBaseCode = /^Key[A-Z]$/.test(baseCode)
        ? baseCode.slice(3)
        : /^Digit\d$/.test(baseCode)
          ? baseCode.slice(5)
          : getHotkeyKeyByBaseCode(baseCode)

    return [...modifiers, displayBaseCode].join(" + ")
}

function createSyntheticHotkeyEvent(binding) {
    const parts = binding.split("+")
    const baseCode = parts[parts.length - 1]
    const modifiers = new Set(parts.slice(0, -1))
    const shiftKey = modifiers.has("Shift")

    return {
        code: baseCode,
        key: getHotkeyKeyByBaseCode(baseCode, shiftKey),
        ctrlKey: modifiers.has("Ctrl"),
        altKey: modifiers.has("Alt"),
        shiftKey,
        metaKey: modifiers.has("Meta"),
        repeat: false,
        preventDefault() {},
        stopPropagation() {},
        stopImmediatePropagation() {},
    }
}

function getAvailableHotkeyCommandsForCurrentPage() {
    const currentContexts = getCurrentHotkeyContexts()

    return Object.entries(hotkeyActions)
        .flatMap(([actionId, action]) => {
            if (isMobile && action.hideOnMobile) {
                return []
            }
            if (!action.contexts.some(context => currentContexts.includes(context))) {
                return []
            }

            const bindings = action.defaultBindings.length ? action.defaultBindings : [""]

            return bindings.flatMap(binding => {
                const event = binding ? createSyntheticHotkeyEvent(binding) : undefined
                if (action.when && !action.when(event)) {
                    return []
                }
                return [
                    {
                        actionId,
                        title: action.title,
                        binding,
                        event,
                        contexts: action.contexts.filter(context => currentContexts.includes(context)),
                    },
                ]
            })
        })
        .sort((a, b) => {
            const aContextIndex = hotkeyHelpContextsOrder.findIndex(context => a.contexts.includes(context))
            const bContextIndex = hotkeyHelpContextsOrder.findIndex(context => b.contexts.includes(context))
            return aContextIndex - bContextIndex || a.title.localeCompare(b.title) || (a.binding || "").localeCompare(b.binding || "")
        })
}

async function getRecentHotkeyActionIds() {
    const stored = await GM.getValue(recentHotkeyActionsStorageKey, ["openOverpassSearch"])
    return stored.filter(actionId => typeof actionId === "string")
}

async function rememberRecentHotkeyAction(actionId) {
    const current = await getRecentHotkeyActionIds()
    const next = [actionId, ...current.filter(currentActionId => currentActionId !== actionId)].slice(0, recentHotkeyActionsLimit)
    await GM.setValue(recentHotkeyActionsStorageKey, next)
}

function actionClearRecentHotkeyActions() {
    setTimeout(() => {
        void GM.setValue(recentHotkeyActionsStorageKey, [])
    })
}

function ensureHotkeyCommandsPopupStyles() {
    if (
        document.querySelector(`#${hotkeyCommandsPopupStyleId}`) ||
        document.documentElement.dataset.hotkeyCommandsPopupStylesInjected === "true"
    ) {
        return
    }
    const style = injectCSSIntoOSMPage(`
        #${hotkeyCommandsPopupId} {
            position: fixed;
            inset: 0;
            z-index: 9999;
            display: flex;
            justify-content: center;
            padding: 8px;
            box-sizing: border-box;

            .better-osm-hotkey-commands-panel {
                width: max-content;
                max-width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                background: var(--bs-body-bg);
                color: var(--bs-body-color);
                border: 1px solid rgba(204, 204, 204, 0.5);
                border-radius: 8px;
                padding: 16px;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
                font-family: sans-serif;
                box-sizing: border-box;
            }

            .better-osm-hotkey-commands-header {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                margin-bottom: 8px;
            }

            .better-osm-hotkey-commands-title {
                margin: 0;
                font-size: 1rem;
            }

            .better-osm-hotkey-commands-subtitle {
                margin: 2px 0 0;
                font-size: 0.875rem;
                opacity: 0.75;
            }

            .better-osm-hotkey-commands-search {
                display: block;
                width: 100%;
                margin-bottom: 12px;
                border: 1px solid rgba(127, 127, 127, 0.35);
                border-radius: 6px;
                background: var(--bs-body-bg);
                color: inherit;
                padding: 8px 10px;
                box-sizing: border-box;
            }

            .better-osm-hotkey-commands-search::placeholder {
                opacity: 0.7;
            }

            .better-osm-hotkey-commands-search:focus {
                outline: 2px solid rgba(13, 110, 253, 0.35);
                outline-offset: 1px;
            }

            .better-osm-hotkey-commands-close {
                all: unset;
                cursor: pointer;
                margin-left: auto;
                line-height: 1;
            }

            .better-osm-hotkey-commands-group {
                margin-top: 12px;
            }

            .better-osm-hotkey-commands-content {
                flex: 1 1 auto;
                overflow-y: auto;
                min-height: 0;
            }

            .better-osm-hotkey-commands-group-title {
                margin: 0 0 6px;
                font-size: 0.875rem;
                text-transform: uppercase;
                letter-spacing: 0.04em;
                opacity: 0.7;
            }

            .better-osm-hotkey-commands-list {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }

            .better-osm-hotkey-command-btn {
                display: grid;
                grid-template-columns: 1fr${isMobile ? "" : " minmax(90px, 120px)"};
                align-items: baseline;
                gap: 10px;
                width: 100%;
                border: 0;
                border-radius: 6px;
                background: transparent;
                color: inherit;
                padding: 6px 8px;
                text-align: left;
                cursor: pointer;

                &:hover,
                &:focus-visible {
                    background: rgba(127, 127, 127, 0.14);
                    outline: none;
                }

                &.is-active {
                    background: rgba(13, 110, 253, 0.16);
                }
            }

            .better-osm-hotkey-command-binding {
                font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
                font-size: 0.875rem;
                white-space: nowrap;
                line-height: 1.3;
                opacity: 0.65;
            }

            .better-osm-hotkey-command-title {
                font-size: 0.925rem;
                line-height: 1.3;
                white-space: nowrap;
            }

            .better-osm-hotkey-commands-empty {
                margin: 8px 0 0;
                opacity: 0.75;
            }
        }
    `)
    document.documentElement.dataset.hotkeyCommandsPopupStylesInjected = "true"
    style?.setAttribute("id", hotkeyCommandsPopupStyleId)
}

function closeHotkeyCommandsPopup() {
    document.querySelector(`#${hotkeyCommandsPopupId}`)?.remove()
}

async function showHotkeyCommandsPopup() {
    const existingPopup = document.querySelector(`#${hotkeyCommandsPopupId}`)
    if (existingPopup) {
        existingPopup.remove()
        return
    }

    ensureHotkeyCommandsPopupStyles()

    const currentContexts = getCurrentHotkeyContexts()
    const availableCommands = getAvailableHotkeyCommandsForCurrentPage()
    const recentActionIds = await getRecentHotkeyActionIds()
    const recentCommands = recentActionIds.map(actionId => availableCommands.find(command => command.actionId === actionId)).filter(Boolean)

    const overlay = document.createElement("div")
    overlay.id = hotkeyCommandsPopupId
    overlay.addEventListener("click", e => {
        if (e.target === overlay) {
            closeHotkeyCommandsPopup()
        }
    })

    const panel = document.createElement("div")
    panel.classList.add("better-osm-hotkey-commands-panel")
    panel.addEventListener("click", e => e.stopPropagation())

    const header = document.createElement("div")
    header.classList.add("better-osm-hotkey-commands-header")

    const headerText = document.createElement("div")
    const title = document.createElement("h3")
    title.classList.add("better-osm-hotkey-commands-title")
    title.textContent = "Available commands"
    const subtitle = document.createElement("p")
    subtitle.classList.add("better-osm-hotkey-commands-subtitle")
    // subtitle.textContent = `Current contexts: ${currentContexts.join(", ")}`
    headerText.append(title, subtitle)

    const closeBtn = document.createElement("button")
    closeBtn.classList.add("better-btn-close", "better-osm-hotkey-commands-close")
    closeBtn.type = "button"
    closeBtn.setAttribute("aria-label", "Close commands popup")
    closeBtn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">' +
        '  <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>' +
        "</svg>"
    closeBtn.querySelector("svg").style.height = "1.25rem"
    closeBtn.onclick = closeHotkeyCommandsPopup

    header.append(headerText, closeBtn)
    panel.append(header)

    const searchInput = document.createElement("input")
    searchInput.classList.add("better-osm-hotkey-commands-search")
    searchInput.type = "search"
    searchInput.placeholder = "Search by hotkey name"
    searchInput.setAttribute("aria-label", "Search hotkeys by name")
    panel.append(searchInput)

    const content = document.createElement("div")
    content.classList.add("better-osm-hotkey-commands-content")
    panel.append(content)
    let activeCommandIndex = -1

    function getCommandButtons() {
        return Array.from(content.querySelectorAll(".better-osm-hotkey-command-btn"))
    }

    function setActiveCommandButton(nextIndex) {
        const buttons = getCommandButtons()
        buttons.forEach(button => button.classList.remove("is-active"))

        if (!buttons.length) {
            activeCommandIndex = -1
            return
        }

        activeCommandIndex = ((nextIndex % buttons.length) + buttons.length) % buttons.length
        const activeButton = buttons[activeCommandIndex]
        activeButton.classList.add("is-active")
        activeButton.scrollIntoView({ block: "nearest" })
    }

    function renderCommandsList(query = "") {
        content.replaceChildren()
        activeCommandIndex = -1

        function appendCommandButton(list, command) {
            const button = document.createElement("button")
            button.classList.add("better-osm-hotkey-command-btn")
            button.type = "button"
            button.dataset.actionId = command.actionId
            button.dataset.binding = command.binding

            const binding = document.createElement("span")
            binding.classList.add("better-osm-hotkey-command-binding")
            binding.textContent = formatHotkeyBinding(command.binding)

            const label = document.createElement("span")
            label.classList.add("better-osm-hotkey-command-title")
            label.textContent = command.title

            if (isMobile) {
                button.append(label)
            } else {
                button.append(label, binding)
            }
            button.addEventListener("click", () => {
                closeHotkeyCommandsPopup()
                setTimeout(() => {
                    void rememberRecentHotkeyAction(command.actionId)
                    runHotkeyAction(command.actionId, command.event)
                }, 0)
            })
            list.append(button)
        }

        const normalizedQuery = query.trim().toLowerCase()
        const filteredCommands = normalizedQuery
            ? availableCommands.filter(command => command.title.toLowerCase().includes(normalizedQuery))
            : availableCommands
        const filteredRecentCommands = recentCommands.filter(command => filteredCommands.includes(command))
        const recentCommandKeys = new Set(filteredRecentCommands.map(command => `${command.actionId}::${command.binding}`))
        const remainingCommands = filteredCommands.filter(command => !recentCommandKeys.has(`${command.actionId}::${command.binding}`))

        if (!filteredCommands.length) {
            const emptyState = document.createElement("p")
            emptyState.classList.add("better-osm-hotkey-commands-empty")
            emptyState.textContent = normalizedQuery ? "No hotkeys match this search." : "No cataloged commands match this page."
            content.append(emptyState)
            return
        }

        if (filteredRecentCommands.length) {
            const group = document.createElement("section")
            group.classList.add("better-osm-hotkey-commands-group")

            const heading = document.createElement("h4")
            heading.classList.add("better-osm-hotkey-commands-group-title")
            heading.textContent = "Recent"
            group.append(heading)

            const list = document.createElement("div")
            list.classList.add("better-osm-hotkey-commands-list")

            filteredRecentCommands.forEach(command => {
                appendCommandButton(list, command)
            })

            group.append(list)
            content.append(group)
        }

        const filteredGroupedCommands = remainingCommands.reduce((groups, command) => {
            const primaryContext =
                hotkeyHelpContextsOrder.find(context => command.contexts.includes(context) && currentContexts.includes(context)) ??
                "All pages"
            if (!groups[primaryContext]) {
                groups[primaryContext] = []
            }
            groups[primaryContext].push(command)
            return groups
        }, {})

        hotkeyHelpContextsOrder
            .filter(context => filteredGroupedCommands[context]?.length)
            .forEach(context => {
                const group = document.createElement("section")
                group.classList.add("better-osm-hotkey-commands-group")

                const heading = document.createElement("h4")
                heading.classList.add("better-osm-hotkey-commands-group-title")
                heading.textContent = context
                group.append(heading)

                const list = document.createElement("div")
                list.classList.add("better-osm-hotkey-commands-list")

                filteredGroupedCommands[context].forEach(command => {
                    appendCommandButton(list, command)
                })

                group.append(list)
                content.append(group)
            })

        setActiveCommandButton(0)
    }

    searchInput.addEventListener("input", () => renderCommandsList(searchInput.value))
    searchInput.addEventListener("keydown", e => {
        if (e.key === "Escape") {
            e.preventDefault()
            e.stopPropagation()
            closeHotkeyCommandsPopup()
            return
        }
        if (e.key === "ArrowDown") {
            e.preventDefault()
            setActiveCommandButton(activeCommandIndex + 1)
            return
        }
        if (e.key === "ArrowUp") {
            e.preventDefault()
            setActiveCommandButton(activeCommandIndex - 1)
            return
        }
        if (e.key === "Enter") {
            const activeButton = getCommandButtons()[activeCommandIndex]
            if (activeButton) {
                e.preventDefault()
                activeButton.click()
            }
        }
    })
    panel.addEventListener("keydown", e => {
        if (e.key === "Escape") {
            e.preventDefault()
            e.stopPropagation()
            closeHotkeyCommandsPopup()
        }
    })

    overlay.append(panel)
    document.body.append(overlay)
    renderCommandsList()
    panel.style.width = `${Math.min(panel.scrollWidth, window.innerWidth - 16)}px`
    searchInput.focus()
}

function hotkeyCommandsPopupClickHandler(e) {
    e.preventDefault()
    e.stopPropagation()
    void showHotkeyCommandsPopup()
}

function actionToggleMapLayersVisibility(e) {
    if (!getWindow().mapIntercepted) return
    e.preventDefault()
    for (let member in layers) {
        layers[member].forEach(i => {
            if (layersHidden) {
                i.getElement().style.visibility = ""
            } else {
                i.getElement().style.visibility = "hidden"
            }
        })
    }
    if (getWindow()?.jsonLayer) {
        if (layersHidden) {
            injectJSIntoPage(`jsonLayer.eachLayer(i => i.getElement().style.visibility = "")`)
        } else {
            injectJSIntoPage(`jsonLayer.eachLayer(i => i.getElement().style.visibility = "hidden")`)
        }
    } else if (jsonLayer) {
        if (layersHidden) {
            jsonLayer.eachLayer(intoPageWithFun(i => (getMap()._layers[i._leaflet_id].getElement().style.visibility = "")))
        } else {
            jsonLayer.eachLayer(intoPageWithFun(i => (getMap()._layers[i._leaflet_id].getElement().style.visibility = "hidden")))
        }
    }
    layersHidden = !layersHidden
}

function actionToggleDarkMapStyle() {
    darkModeForMap = !darkModeForMap
    if (darkModeForMap) {
        injectDarkMapStyle()
    } else {
        darkMapStyleElement?.remove()
    }
}

function actionOpenUserBlocks() {
    if (isUserPageWithoutHistory()) {
        document.querySelector('a[href^="/user/"][href$="/blocks"]')?.click()
    }
}

function actionToggleEditMenu() {
    document.querySelector("#edit_tab ul").tabIndex = -1
    if (document.querySelector("header").classList.contains("closed")) {
        document.querySelector("#menu-icon").click()
        document.querySelector("#edit_tab > button").click()
    } else if (document.querySelector("#edit_tab > .dropdown-menu").classList.contains("show")) {
        document.querySelector("#change-list-btn.closed")?.click()
    } else {
        document.querySelector("#edit_tab button").click()
    }
}

function actionNextVectorLayer() {
    nextVectorLayer()
}

function actionSetCustomVectorStyle() {
    if (!document.querySelector("#map canvas")) {
        Array.from(document.querySelectorAll(".layers-ui .base-layers label")).at(-2)?.click()
    }
    void askCustomStyleUrl()
}

function actionOpenMessageComposer() {
    if (isUserPageWithoutHistory()) {
        document.querySelector('a[href^="/messages/new/"]')?.click()
    }
}

function actionOpenMessageComposerForCurrentUser() {
    if (location.pathname.includes("/user/")) {
        const username = location.pathname.match(/^\/user\/([^/]+)/)[1]
        window.open("/messages/new/" + decodeURI(username))
    } else {
        const username = document
            .querySelector("#sidebar_content a[href^='/user/']")
            .getAttribute("href")
            .match(/^\/user\/([^/]+)/)[1]
        window.open("/messages/new/" + decodeURI(username))
    }
}

function actionOpenCurrentPageUserProfile() {
    const user_link = document.querySelector('#sidebar_content a[href^="/user/"]')
    if (user_link) {
        if (user_link.checkVisibility()) {
            user_link?.click()
        } else {
            document.querySelector('#sidebar_content li:not([hidden-data-changeset]) a[href^="/user/"]')?.click()
        }
        return
    }
    document.querySelector('#content a[href^="/user/"]:not([href$=rss]):not([href*="/diary"]):not([href*="/traces"])')?.click()
}

function actionOpenOwnUserProfile() {
    window.location.pathname = document.querySelector('.dropdown-item[href^="/user/"]').getAttribute("href")
}

function actionOpenFiltersOrLayers(e) {
    if (location.pathname.match(/^\/note\//) || location.pathname === "/") {
        document.querySelector(".control-layers a").click()
        if (document.querySelector(".layers-ui").style.display !== "none") {
            Array.from(document.querySelectorAll(".overlay-layers label"))[0].scrollIntoView({ block: "center" })
            e.preventDefault()
            document.querySelector("#filter-notes-by-string").focus()
        }
    } else {
        if (!document.querySelector("#changesets-filter-btn") && !document.querySelector("#mass-action-btn")) {
            document.querySelector(".control-layers a").click()
            Array.from(document.querySelectorAll(".overlay-layers label"))[0].scrollIntoView({ block: "center" })
        } else {
            document.querySelector("#changesets-filter-btn")?.click()
            document.querySelector("#mass-action-btn")?.click()
        }
    }
}

function actionOpenExternalService(e) {
    if (e.shiftKey) {
        window.open("https://overpass-api.de/achavi/?changeset=" + location.pathname.match(/\/changeset\/(\d+)/)[1])
    } else if (!e.altKey) {
        const usernameMatch = location.pathname.match(/^\/user\/([^/]+)\/?$/)
        if (usernameMatch) {
            window.open(makeOsmchaLinkForUsername(decodeURI(usernameMatch[1])))
        } else {
            const osmchaLink = document.querySelector("#osmcha_link")
            if (osmchaLink) {
                osmchaLink?.click()
            } else {
                document.querySelector(".relation-viewer-link")?.click()
            }
        }
    }
}

function actionOpenUserComments() {
    if (location.pathname.includes("/diary_comments")) {
        document.querySelector('a[href^="/user/"][href$="changeset_comments"]')?.click()
    } else {
        document.querySelector('a[href^="/user/"][href$="_comments"]')?.click()
    }
}

function actionCopyMapCenterCoordinates() {
    setTimeout(async () => {
        const center = getMapCenter()
        const format = (await GM.getValue("CoordinatesFormat")) ?? "Lat Lon"
        if (format === "Lon Lat") {
            navigator.clipboard.writeText(`${center.lng} ${center.lat}`)
        } else {
            navigator.clipboard.writeText(`${center.lat} ${center.lng}`)
        }
    })
}

function getPrimaryChangesetLink() {
    const activeObject = document.querySelector("#element_versions_list > div.active-object")
    if (activeObject) {
        return activeObject.querySelector('a[href^="/changeset/"]')
    }
    return document.querySelectorAll('a[href^="/changeset/"]:not([href*="?locale="])')?.[0] ?? null
}

function actionOpenPrimaryChangeset() {
    getPrimaryChangesetLink()?.click()
}

function actionOpenPrimaryChangesetInNewTab() {
    const changesetLink = getPrimaryChangesetLink()
    if (changesetLink?.href) {
        window.open(changesetLink.href, "_blank")
    }
}

function actionToggleNotesLayer() {
    Array.from(document.querySelectorAll(".overlay-layers label input"))[0].removeAttribute("disabled")
    Array.from(document.querySelectorAll(".overlay-layers label"))[0].click()
}

function actionToggleMapDataLayer() {
    Array.from(document.querySelectorAll(".overlay-layers label input"))[1].removeAttribute("disabled")
    Array.from(document.querySelectorAll(".overlay-layers label"))[1].click()
    if (!location.hash.includes("D")) {
        disableOverzoom()
    } else {
        enableOverzoom()
    }
}

function actionToggleGpsTracksLayer() {
    Array.from(document.querySelectorAll(".overlay-layers label"))[2].click()
}

function actionSwitchToSatelliteImagery() {
    enableOverzoom()
    switchTilesAndButtons()
}

function actionOpenUserNotesPage() {
    document.querySelector('a[href^="/user/"][href$="/notes"]')?.click()
    addAltClickHandlerForNotes()
}

function actionOpenNoteAuthorNotesInNewTab() {
    window.open(document.querySelector('#sidebar_content a[href^="/user/"]').getAttribute("href") + "/notes", "_blank")
}

function actionCreateNote() {
    if (location.pathname.includes("/node") || location.pathname.includes("/way") || location.pathname.includes("/relation")) {
        newNotePlaceholder = "\n \n" + location.href
    }
    document.querySelector(".control-note .control-button").click()
}

function actionOpenUserDiary() {
    document.querySelector('a[href^="/user/"][href$="/diary"]')?.click()
}

function actionAppendDebugQueryFlag() {
    location.search += "&kek"
}

function actionTriggerDebugger() {
    // eslint-disable-next-line no-debugger
    debugger
    throw "debug"
}

function actionOpenSpyGlass() {
    try {
        document.getElementById("spy-glass").click()
    } catch (e) {
        debug_alert("script not injected :(")
    }
}

function actionShowGpsTracksOverlay() {
    enableOverzoom()
    setZoom(Math.min(14, getZoom()))
    if (!document.querySelectorAll(".overlay-layers label")[2].querySelector("input").checked) {
        Array.from(document.querySelectorAll(".overlay-layers label"))[2].click()
    }
    switchOverlayTiles()
}

function actionSetCustomTileUrl() {
    enableOverzoom()
    askCustomTileUrl()
}

function actionBypassTileCaches() {
    enableOverzoom()
    bypassCaches()
}

function actionOpenSelectedObjectEditTarget() {
    if (location.pathname.startsWith("/changeset/")) {
        if (document.querySelector(".active-object")) {
            const activeObjectUrl = document.querySelector(".active-object").querySelector("a").getAttribute("href")
            window.open(activeObjectUrl, "_blank")
        } else {
            const firstObjectUrl = document
                .querySelector("turbo-frame:is(#changeset_nodes, #changeset_ways, #changeset_relations)")
                .querySelector("ul a")
                .getAttribute("href")
            window.open(firstObjectUrl, "_blank")
        }
    } else {
        document.querySelector(".edit_tags_class").click()
    }
}

function actionOpenAlternateEditor() {
    if (document.querySelector("#editanchor").getAttribute("data-editor") === "id") {
        document.querySelectorAll("#edit_tab .dropdown-menu .editlink")[1]?.click()
    } else {
        document.querySelectorAll("#edit_tab .dropdown-menu .editlink")[0]?.click()
    }
}

function actionOpenEditMenuPrimary() {
    document.querySelector("#editanchor")?.click()
}

function actionOpenUserHistoryFromProfile() {
    document.querySelector('a[href^="/user/"][href$="/history"]')?.click()
}

function actionOpenUserReportForm() {
    document.querySelector('a[href*="/reports/new"]')?.click()
}

function actionRevertCurrentChangesetSelection() {
    document.querySelector("#revert_button_class").click()
}

function actionToggleChangesetObjectSelection() {
    if (document.querySelector(".select-objects-btn")) {
        document.querySelector(".select-objects-btn").click()
    } else {
        addCheckboxesForChangesetObjects()
    }
}

function actionOpenInJosmOrLevel0(e) {
    setTimeout(async () => {
        if (location.pathname.includes("changeset")) {
            await openSelectedObjectsOnChangesetPage(e)
        } else {
            await openObjectInJosmOrLevel0(e)
        }
    })
}

function actionOpenOwnHistoryPage() {
    const targetURL = document.querySelector('.dropdown-item[href^="/user/"]').getAttribute("href") + "/history"
    if (targetURL !== location.pathname) {
        try {
            getWindow().OSM.router.route(targetURL)
        } catch {
            window.location.pathname = targetURL
        }
    }
}

function actionOpenRelevantHistoryPage() {
    if (isObjectPage()) {
        if (/^\/(node|way|relation)\/\d+\/?$/.test(location.pathname)) {
            getWindow().OSM.router.route(window.location.pathname + "/history")
        } else if (/^\/(node|way|relation)\/\d+\/history\/\d+\/?$/.test(location.pathname)) {
            const historyPath = window.location.pathname.match(/(\/(node|way|relation)\/\d+\/history)\/\d+/)[1]
            getWindow().OSM.router.route(historyPath)
        }
    } else if (isHomeOrNotePage()) {
        addCompactSidebarStyle()
        document.querySelector('.nav-link[href^="/history"]')?.click()
    } else if (location.pathname.includes("/user/")) {
        document.querySelector('a[href^="/user/"][href$="/history"]')?.click()
    }
}

function actionOpenChangesetAuthorHistory() {
    const userChangesetsLink = document.querySelectorAll("div.secondary-actions")[1]?.querySelector('a[href^="/user/"]')
    if (userChangesetsLink) {
        getAbortController().abort(ABORT_ERROR_USER_CHANGESETS)
        userChangesetsLink.focus()
        userChangesetsLink.click()
    }
}

function actionResetFilteredHistoryPage() {
    try {
        getWindow().OSM.router.route(location.pathname)
        setupCompactChangesetsHistory()
    } catch {
        if (isSafari) {
            window.location.search = ""
        } else {
            window.location = location.pathname
        }
    }
}

function actionOpenFirstObjectVersion() {
    getWindow().OSM.router.route(location.pathname.match(/\/(node|way|relation)\/\d+/)[0] + "/history/1")
}

function actionOpenFirstChangesetForCurrentPageUser() {
    const user_link = document.querySelector('#sidebar_content a[href^="/user/"]')
    if (user_link) {
        const username = decodeURI(user_link.getAttribute("href").match(/\/user\/([^/]+)/)[1])
        getCachedUserInfo(username).then(res => {
            if (res["firstChangesetID"]) {
                getWindow().OSM.router.route(`/changeset/${res["firstChangesetID"]}`)
            } else {
                console.warn("not found first changeset for " + username)
            }
        })
    }
}

function actionOpenFirstChangesetPageForCurrentUserHistory() {
    const user_link = document.querySelector('#sidebar_content a[href^="/user/"]')
    if (user_link) {
        const username = decodeURI(user_link.getAttribute("href").match(/\/user\/([^/]+)/)[1])
        getCachedUserInfo(username).then(res => {
            if (res["firstChangesetID"]) {
                getWindow().OSM.router.route(`${location.pathname}?after=${res["firstChangesetID"] - 1}`)
            } else {
                console.warn("not found first changeset for " + username)
            }
        })
    }
}

function actionZoomOutToWorld() {
    const center = getMapCenter()
    setZoom(2)
    fetch(`https://nominatim.openstreetmap.org/reverse.php?lon=${center.lng}&lat=${center.lat}&format=jsonv2`).then(res => {
        res.json().then(r => {
            if (r?.address?.state) {
                getMap().attributionControl?.setPrefix(`${r.address.state}`)
            }
        })
    })
}

function actionZoomToCurrentObjectHotkey(e) {
    if (e.shiftKey) {
        shiftKeyZClicks += 1
        document.addEventListener(
            "mousemove",
            () => {
                shiftKeyZClicks = 0
            },
            { once: true },
        )
    } else {
        shiftKeyZClicks = 0
    }
    zoomToCurrentObject(e)
}

function actionMapPositionBack() {
    if (mapPositionsHistory.length > 1) {
        mapPositionsNextHistory.push(mapPositionsHistory[mapPositionsHistory.length - 1])
        mapPositionsHistory.pop()
        fitBounds(mapPositionsHistory[mapPositionsHistory.length - 1])
    }
}

function actionMapPositionForward() {
    if (mapPositionsNextHistory.length) {
        mapPositionsHistory.push(mapPositionsNextHistory.pop())
        fitBounds(mapPositionsHistory[mapPositionsHistory.length - 1])
    }
}

function actionZoomOutHotkey(e) {
    if (document.activeElement?.id === "map") {
        e.preventDefault()
        e.stopImmediatePropagation()
        e.stopPropagation()
    }
    if (!e.altKey) {
        setZoom(getZoom() - 2)
    } else {
        setZoom(getZoom() - 1)
    }
    document.querySelector("#map").focus()
}

function actionZoomInHotkey(e) {
    if (document.activeElement?.id === "map") {
        e.preventDefault()
        e.stopImmediatePropagation()
        e.stopPropagation()
    }
    if (!e.altKey) {
        setZoom(getZoom() + 2)
    } else {
        setZoom(getZoom() + 1)
    }
    document.querySelector("#map").focus()
}

function actionGoToPrevChangesetPage(e) {
    goToPrevChangeset(e)
}

function actionGoToNextChangesetPage(e) {
    goToNextChangeset(e)
}

function actionGoToPrevSearchResultPage(e) {
    goToPrevSearchResult(e)
}

function actionGoToNextSearchResultPage(e) {
    goToNextSearchResult(e)
}

function actionChangesetObjectsTimeTrack() {
    if (location.pathname.startsWith("/changeset")) {
        const params = new URLSearchParams(location.search)
        const changesetIDs = params.get("changesets")?.split(",") ?? [parseInt(location.pathname.match(/changeset\/(\d+)/)[1])]
        const objects = []
        if (changesetIDs) {
            setTimeout(async () => {
                for (const i of changesetIDs) {
                    ;(await getChangeset(i)).data.querySelectorAll("node,way,relation").forEach(obj => {
                        objects.push(obj)
                    })
                }
                objects.sort((a, b) => {
                    const A = new Date(a.getAttribute("timestamp"))
                    const B = new Date(b.getAttribute("timestamp"))
                    if (A < B) return -1
                    if (A > B) return 1
                    return 0
                })
                const nodesList = []
                for (let object of objects) {
                    if (object.nodeName === "node" && object.getAttribute("visible") === "true") {
                        nodesList.push([object.getAttribute("lat"), object.getAttribute("lon")])
                    } else if (object.nodeName === "way") {
                        // TODO
                    }
                }
                showNodeMarker(nodesList[0][0], nodesList[0][1], "#ff0000", null, "customObjects", 8)
                showNodeMarker(nodesList.at(-1)[0], nodesList.at(-1)[1], "#00ff04", null, "customObjects", 8)
                showActiveWay(nodesList, c("#0022ff"), false, null, true, 2)
            })
        }
    }
}

function actionGoToPrevChangesetObjectHotkey(e) {
    goToPrevChangesetObject(e)
}

function actionGoToNextChangesetObjectHotkey(e) {
    goToNextChangesetObject(e)
}

function actionGoToPrevObjectVersionHotkey() {
    goToPrevObjectVersion()
}

function actionGoToNextObjectVersionHotkey() {
    goToNextObjectVersion()
}

function actionGoToPrevSidebarTab() {
    const links = Array.from(document.querySelectorAll("#sidebar_content nav div ul a"))
    for (let i = 0; i < links.length; i++) {
        if (links[i].parentElement.classList.contains("active")) {
            links[i - 1]?.click()
            break
        }
    }
}

function actionGoToNextSidebarTab() {
    const links = Array.from(document.querySelectorAll("#sidebar_content nav div ul a"))
    for (let i = 0; i < links.length; i++) {
        if (links[i].parentElement.classList.contains("active")) {
            links[i + 1]?.click()
            break
        }
    }
}

function actionGoToPrevPaginationPage(selector) {
    document.querySelector(selector)?.click()
}

function actionGoToPrevUserNotesPage() {
    document.querySelectorAll(".pagination li a")[0]?.click()
}

function actionGoToNextUserNotesPage() {
    document.querySelectorAll(".pagination li a")[1]?.click()
}

function actionGoToPrevChangesetListPage() {
    const link = getPrevChangesetLink()
    if (link) {
        getAbortController().abort(ABORT_ERROR_PREV)
        needPreloadChangesets = true
        link.focus()
        link.click()
    }
}

function actionGoToNextChangesetListPage() {
    const link = getNextChangesetLink()
    if (link) {
        getAbortController().abort(ABORT_ERROR_NEXT)
        needPreloadChangesets = true
        link.focus()
        link.click()
    }
}

function actionOpenScriptUpdateUrl() {
    window.open(`${SCRIPT_UPDATE_URL}?bypasscache=${Math.random()}`, "_blank")
}

function actionOpenDevScriptUpdateUrl() {
    window.open(`${DEV_SCRIPT_UPDATE_URL}?bypasscache=${Math.random()}`, "_blank")
}

function actionOpenLocalFilePicker() {
    const input = document.createElement("input")
    input.type = "file"
    input.multiple = true
    input.addEventListener("change", () => {
        void handleDroppedFiles(Array.from(input.files ?? []))
    })
    input.click()
}

//</editor-fold>
