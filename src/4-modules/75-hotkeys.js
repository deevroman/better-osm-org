//<editor-fold desc="hotkeys">
let hotkeysConfigured = false
//TODO extract load functions
/**
 * @param {number|null=} changeset_id
 * @return {Promise<ChangesetMetadata>}
 */
async function loadChangesetMetadata(changeset_id = null) {
    console.debug(`Loading changeset metadata`)
    if (!changeset_id) {
        const match = location.pathname.match(/changeset\/(\d+)/)
        if (!match) {
            // console.trace("loadChangesetMetadata called without changeset_id and on not /changeset page")
            return
        }
        changeset_id = parseInt(match[1])
    }
    console.debug(`Loading metadata of changeset #${changeset_id}`)
    if (changesetMetadatas[changeset_id] && changesetMetadatas[changeset_id].id === changeset_id) {
        return changesetMetadatas[changeset_id]
    }
    // prevChangesetMetadata = changesetMetadatas[changeset_id]
    const jsonRes = await fetchJSONWithCache(osm_server.apiBase + "changeset" + "/" + changeset_id + ".json")
    if (jsonRes.changeset) {
        return (changesetMetadatas[changeset_id] = jsonRes.changeset)
    }
    changesetMetadatas[changeset_id] = jsonRes.elements[0]
    changesetMetadatas[changeset_id].min_lat = changesetMetadatas[changeset_id].minlat
    changesetMetadatas[changeset_id].min_lon = changesetMetadatas[changeset_id].minlon
    changesetMetadatas[changeset_id].max_lat = changesetMetadatas[changeset_id].maxlat
    changesetMetadatas[changeset_id].max_lon = changesetMetadatas[changeset_id].maxlon
    return changesetMetadatas[changeset_id]
}

/**
 * @param {number[]} changeset_ids
 */
async function loadChangesetMetadatas(changeset_ids) {
    if (!changeset_ids.length) {
        return
    }
    const batchSize = 100
    for (let i = 0; i < changeset_ids.length; i += batchSize) {
        const res = await fetchRetry(osm_server.apiBase + "changesets.json?changesets=" + changeset_ids.slice(i, i + batchSize).join(","))
        const jsonRes = await res.json()
        jsonRes["changesets"].forEach(i => {
            changesetMetadatas[i.id] = i
        })
    }
}

let noteMetadata = null

async function loadNoteMetadata() {
    const match = location.pathname.match(/note\/(\d+)/)
    if (!match) {
        return
    }
    const note_id = parseInt(match[1])
    if (noteMetadata !== null && noteMetadata.id === note_id) {
        return
    }
    const res = await fetchRetry(osm_server.apiBase + "notes" + "/" + note_id + ".json", { signal: getAbortController().signal })
    noteMetadata = await res.json()
}

let nodeMetadata = null

async function loadNodeMetadata() {
    const match = location.pathname.match(/node\/(\d+)/)
    if (!match) {
        return
    }
    const node_id = parseInt(match[1])
    const jsonRes = await fetchJSONWithCache(osm_server.apiBase + "node" + "/" + node_id + ".json", {}, res => {
        if (res.status === 410) {
            console.warn(`node ${node_id} was deleted`)
        } else {
            return true
        }
    })
    if (!jsonRes) return
    nodeMetadata = jsonRes.elements[0]
    return jsonRes
}

let wayMetadata = null

/**
 * @param {number|null=} way_id
 * @return {Promise<void|{elements: (NodeVersion|WayVersion)[]}>}
 */
async function loadWayMetadata(way_id = null) {
    console.log(`Loading way metadata`)
    if (!way_id) {
        const match = location.pathname.match(/way\/(\d+)/)
        if (!match) {
            return
        }
        way_id = parseInt(match[1])
    }
    /*** @type {{elements: (NodeVersion|WayVersion)[]}|undefined}*/
    const jsonRes = await fetchJSONWithCache(osm_server.apiBase + "way" + "/" + way_id + "/full.json", {}, res => {
        if (res.status === 410) {
            console.warn(`way ${way_id} was deleted`)
        } else {
            return true
        }
    })
    if (!jsonRes) return
    wayMetadata = jsonRes.elements.filter(i => i.type === "node")
    wayMetadata.bbox = {
        min_lat: Math.min(...wayMetadata.map(i => i.lat)),
        min_lon: Math.min(...wayMetadata.map(i => i.lon)),
        max_lat: Math.max(...wayMetadata.map(i => i.lat)),
        max_lon: Math.max(...wayMetadata.map(i => i.lon)),
    }
    return jsonRes
}

/**
 * @type {{
 *     relation: RelationVersion,
 *     bbox: {
 *         min_lat: number,
 *         min_lon: number,
 *         max_lat: number,
 *         max_lon: number,
 *     }
 * } | null}
 */
let relationMetadata = null

/**
 * @param {number|null=} relation_id
 * @return {Promise<{elements: (NodeVersion|WayVersion|RelationVersion)[]}| undefined>}
 */
async function loadRelationMetadata(relation_id = null) {
    console.log(`Loading relation metadata`)
    if (!relation_id) {
        const match = location.pathname.match(/relation\/(\d+)/)
        if (!match) {
            return
        }
        relation_id = parseInt(match[1])
    }
    const jsonRes = await fetchJSONWithCache(osm_server.apiBase + "relation" + "/" + relation_id + "/full.json", {}, res => {
        if (res.status === 410) {
            console.warn(`relation ${relation_id} was deleted`)
        } else {
            return true
        }
    })
    if (!jsonRes) return
    const nodes = /** @type {NodeVersion[]} */ jsonRes.elements.filter(i => i.type === "node")
    relationMetadata = {
        relation: jsonRes.elements.find(i => i.type === "relation" && i.id === relation_id),
        bbox: {
            min_lat: Math.min(...nodes.map(i => i.lat)),
            min_lon: Math.min(...nodes.map(i => i.lon)),
            max_lat: Math.max(...nodes.map(i => i.lat)),
            max_lon: Math.max(...nodes.map(i => i.lon)),
        },
    }
    return jsonRes
}

function updateCurrentObjectMetadata() {
    setTimeout(loadChangesetMetadata, 0)
    setTimeout(loadNoteMetadata, 0)
    setTimeout(loadNodeMetadata, 0)
    setTimeout(loadWayMetadata, 0)
    setTimeout(loadRelationMetadata, 0)
}

async function loadFriends() {
    console.debug("Loading friends list")
    const res = await (await fetch(osm_server.url + "/dashboard")).text()
    const parser = new DOMParser()
    const doc = parser.parseFromString(res, "text/html")
    const friends = []
    doc.querySelectorAll('a[data-method="delete"][href*="/follow"]').forEach(a => {
        const username = a.getAttribute("href").match(/\/user\/(.+)\/follow/)[1]
        friends.push(decodeURI(username))
    })
    await GM.setValue("friends", JSON.stringify(friends))
    console.debug("Friends list updated")
    return friends
}

let friendsLoadingLock = false

async function getFriends() {
    const friendsStr = await GM.getValue("friends")
    if (friendsStr) {
        return JSON.parse(friendsStr)
    } else {
        while (friendsLoadingLock) {
            await sleep(500)
        }
        friendsLoadingLock = true
        const res = await loadFriends()
        friendsLoadingLock = false
        return res
    }
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
    if (customLayerUrl === ESRITemplate) {
        customLayerUrl = ESRIPrefix + "{z}/{y}/{x}" + blankSuffix
    } else if (customLayerUrl === ESRIBetaTemplate) {
        customLayerUrl = ESRIBetaPrefix + "{z}/{y}/{x}" + blankSuffix
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
    if (customLayerUrl === ESRITemplate) {
        customLayerUrl = ESRIPrefix + "{z}/{y}/{x}"
    } else if (customLayerUrl === ESRIBetaTemplate) {
        customLayerUrl = ESRIBetaPrefix + "{z}/{y}/{x}"
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
        document.querySelector("#changeset_nodes li:not(.page-item), #changeset_ways li:not(.page-item), #changeset_relations li:not(.page-item)").classList.add("active-object")
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

function gotNextObjectVersion() {
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
                        const version = searchVersionByTimestamp(await getNodeHistory(node.getAttribute("id")), new Date(new Date(changesetMetadata.created_at).getTime() - 1).toISOString())
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
                        const targetTime = way.getAttribute("visible") === "false" ? new Date(new Date(changesetMetadata.created_at).getTime() - 1).toISOString() : changesetMetadata.closed_at
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

function setupNavigationViaHotkeys() {
    if ("/id" === location.pathname || document.querySelector("#id-embed")) return
    updateCurrentObjectMetadata()
    // if (!location.pathname.startsWith("/changeset")) return;
    if (hotkeysConfigured) return
    hotkeysConfigured = true

    runPositionTracker()

    const defaultZoomKeysBehaviour = GM_config.get("DefaultZoomKeysBehaviour")

    function keydownHandler(e) {
        if (e.repeat && !["KeyK", "KeyL"].includes(e.code)) return
        if (document.activeElement?.name === "text") return
        if (document.activeElement?.nodeName === "INPUT" && ["input", "text"].includes(document.activeElement.getAttribute("type"))) {
            if (e.code === "Escape") {
                document.activeElement.blur()
            }
            return
        }
        if (document.activeElement?.nodeName === "TEXTAREA" && e.code === "Enter") {
            if (document.activeElement.parentElement?.parentElement?.querySelector(".btn-wrapper")) {
                if (e.metaKey || e.ctrlKey) {
                    document.activeElement.parentElement.parentElement.querySelector(".btn-wrapper .btn-primary").click()
                    return
                }
            }
        }
        if (["TEXTAREA", "INPUT", "SELECT"].includes(document.activeElement?.nodeName) && document.activeElement?.getAttribute("type") !== "checkbox" && document.activeElement?.getAttribute("type") !== "radio") {
            return
        }
        if (document.activeElement?.getAttribute("contenteditable")) {
            return
        }
        // prettier-ignore
        if (["TH", "TD"].includes(document.activeElement?.nodeName)
            && document.activeElement?.parentElement?.parentElement?.parentElement?.hasAttribute("contenteditable")) {
            return
        }
        // prettier-ignore
        if (["TR"].includes(document.activeElement?.nodeName)
            && document.activeElement?.parentElement?.parentElement?.hasAttribute("contenteditable")) {
            return
        }
        if (document.activeElement?.classList?.contains("relation-viewer-a")) {
            if (e.code === "ArrowDown" || e.code === "ArrowUp") {
                e.preventDefault()
                e.stopPropagation()
                e.stopImmediatePropagation()
                if (e.code === "ArrowDown") {
                    e.target.parentElement.nextElementSibling?.querySelector("a")?.focus()
                } else if (e.code === "ArrowUp") {
                    e.target.parentElement.previousElementSibling?.querySelector("a")?.focus()
                }
                return
            }
        }
        if (measuring) {
            if (((e.ctrlKey || e.metaKey) && e.code === "KeyZ") || e.code === "Backspace" || e.code === "Delete") {
                if (currentMeasuring.way.length) {
                    currentMeasuring.way.pop()
                    currentMeasuring.nodes.pop()?.remove()
                    currentMeasuring.tempLine?.remove()
                    currentMeasuring.wayLine?.remove()
                    if (currentMeasuring.way.length) {
                        currentMeasuring.wayLine = displayWay(currentMeasuring.way, false, "#000000", 1)
                        currentMeasuring.tempLine = displayWay([currentMeasuring.way[currentMeasuring.way.length - 1], lastLatLng], false, "#000000", 1)
                    }
                }
            } else if (e.code === "Escape") {
                endMeasuring()
            }
        } else if (prevMeasurements.length) {
            if (e.code === "Escape") {
                if (confirm("Clean measurements?")) {
                    cleanMeasurements(e)
                }
            }
        }
        // if (drawingBuildings) {
        //     if (e.code === "Escape") {
        //         firstBuilding = null
        //     }
        // }
        if (e.metaKey || e.ctrlKey) {
            return
        }
        console.log("Key: ", e.key)
        console.log("Key code: ", e.code)
        if (e.code !== "KeyZ" && e.code !== "KeyD" && e.code !== "KeyS" && e.code !== "KeyS") {
            resetZoomClicks()
        }
        if (e.code === "KeyN") {
            if (location.pathname.includes("/user/") && !location.pathname.includes("/history")) {
                document.querySelector('a[href^="/user/"][href$="/notes"]')?.click()
                addAltClickHandlerForNotes()
            } else if (e.altKey && location.pathname.match(/note\/[0-9]+/)) {
                window.open(document.querySelector('#sidebar_content a[href^="/user/"]').getAttribute("href") + "/notes", "_blank")
            } else {
                // notes
                if (e.shiftKey) {
                    if (location.pathname.includes("/node") || location.pathname.includes("/way") || location.pathname.includes("/relation")) {
                        newNotePlaceholder = "\n \n" + location.href
                    }
                    document.querySelector(".control-note .control-button").click()
                } else {
                    Array.from(document.querySelectorAll(".overlay-layers label input"))[0].removeAttribute("disabled")
                    Array.from(document.querySelectorAll(".overlay-layers label"))[0].click()
                }
            }
        } else if (e.code === "KeyD") {
            if (e.altKey && e.shiftKey) {
                location.search += "&kek"
                return
            } else if (e.altKey) {
                // eslint-disable-next-line no-debugger
                debugger
                throw "debug"
            }
            if (e.shiftKey) {
                try {
                    document.getElementById("spy-glass").click()
                } catch (e) {
                    debug_alert("script not injected :(")
                }
                return
            }
            if (e.altKey || e.shiftKey) {
                return
            }
            if (location.pathname.includes("/user/") && !location.pathname.includes("/history")) {
                document.querySelector('a[href^="/user/"][href$="/diary"]')?.click()
            } else {
                // map data
                Array.from(document.querySelectorAll(".overlay-layers label input"))[1].removeAttribute("disabled")
                Array.from(document.querySelectorAll(".overlay-layers label"))[1].click()
                if (!location.hash.includes("D")) {
                    disableOverzoom()
                } else {
                    enableOverzoom()
                }
            }
        } else if (e.code === "KeyG") {
            // gps tracks
            if (e.shiftKey || e.altKey) {
                enableOverzoom()
                setZoom(Math.min(14, getZoom()))
                if (!document.querySelectorAll(".overlay-layers label")[2].querySelector("input").checked) {
                    Array.from(document.querySelectorAll(".overlay-layers label"))[2].click()
                }
                switchOverlayTiles()
            } else {
                Array.from(document.querySelectorAll(".overlay-layers label"))[2].click()
            }
        } else if (e.code === "KeyS") {
            enableOverzoom()
            if (e.shiftKey) {
                askCustomTileUrl()
                return
            } else if (e.altKey) {
                bypassCaches()
            } else {
                switchTilesAndButtons()
            }
        } else if (e.code === "KeyE") {
            if (e.altKey) {
                if (location.pathname.startsWith("/changeset/")) {
                    const activeObjectUrl = document.querySelector(".active-object").querySelector("a").getAttribute("href")
                    window.open(activeObjectUrl, "_blank")
                } else {
                    document.querySelector(".edit_tags_class").click()
                }
            } else if (!location.pathname.match(/^\/user\/([^/]+)\/?$/)) {
                if (e.shiftKey) {
                    if (document.querySelector("#editanchor").getAttribute("data-editor") === "id") {
                        document.querySelectorAll("#edit_tab .dropdown-menu .editlink")[1]?.click()
                    } else {
                        document.querySelectorAll("#edit_tab .dropdown-menu .editlink")[0]?.click()
                    }
                } else if (e.altKey && isDebug()) {
                    document.querySelectorAll("table.quick-look, table.geojson-props-table:not(.metainfo-table)").forEach(i => {
                        i.setAttribute("contenteditable", "true")
                    })
                } else {
                    document.querySelector("#editanchor")?.click()
                }
            } else {
                document.querySelector('a[href^="/user/"][href$="/history"]')?.click()
            }
        } else if (e.code === "KeyR") {
            if (location.pathname.includes("/user/") && !location.pathname.includes("/history")) {
                document.querySelector('a[href*="/reports/new"]')?.click()
                return
            }
            if (changesetObjectsSelectionModeEnabled || e.altKey) {
                document.querySelector("#revert_button_class").click()
                return
            }
            changesetObjectsSelectionModeEnabled = true
            document.querySelectorAll("#changeset_nodes, #changeset_ways, #changeset_relations").forEach(i => {
                i.querySelectorAll("button, input, a, textarea, select, [tabindex]").forEach(el => {
                    el.setAttribute("tabindex", "-1")
                })
            })
            ;["#changeset_nodes", "#changeset_ways", "#changeset_relations"].forEach(selector => {
                document.querySelectorAll(`${selector} .browse-element-list li`).forEach(obj => {
                    const checkbox = document.createElement("input")
                    checkbox.type = "checkbox"
                    checkbox.title = `Click with Shift for select range
Press R for revert via ${osm_revert_name}
Press J for open objects in JOSM
Press alt + J for open objects in Level0`
                    checkbox.tabIndex = 0
                    checkbox.style.width = "18px"
                    checkbox.style.height = "18px"
                    checkbox.style.margin = "1px"
                    checkbox.classList.add("align-bottom", "object-fit-none", "browse-icon")

                    function selectRange() {
                        let currentCheckboxFound = false
                        const checkboxes = Array.from(document.querySelectorAll(`#changeset_nodes li input[type=checkbox], #changeset_ways li input[type=checkbox], #changeset_relations li input[type=checkbox]`))
                        for (const cBox of checkboxes.toReversed()) {
                            if (!currentCheckboxFound) {
                                if (cBox === checkbox) {
                                    currentCheckboxFound = true
                                }
                            } else {
                                if (cBox.checked) {
                                    break
                                }
                                cBox.checked = true
                            }
                        }
                    }

                    checkbox.onclick = e => {
                        e.stopPropagation()
                        e.stopImmediatePropagation()
                        if (e.shiftKey) {
                            selectRange()
                        }
                    }
                    checkbox.onkeydown = e => {
                        if (e.shiftKey && e.code === "Space") {
                            selectRange()
                        } else if (e.code === "Enter") {
                            e.target.click()
                            if (e.shiftKey) {
                                selectRange()
                            }
                        }
                    }
                    const icon = obj.querySelector("img")
                    icon.style.display = "none"
                    const label = document.createElement("label")
                    label.appendChild(checkbox)
                    label.onclick = e => {
                        e.stopPropagation()
                        e.stopImmediatePropagation()
                    }
                    icon.after(label)
                })
            })
            document.querySelector("#changeset_nodes input[type=checkbox], #changeset_ways input[type=checkbox], #changeset_relations input[type=checkbox]").focus()
        } else if (e.code === "KeyJ") {
            setTimeout(async () => {
                if (!location.pathname.includes("changeset")) {
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
                    return
                }

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
                    if (!(await validateOsmServerInJOSM())) {
                        return
                    }
                    // prettier-ignore
                    window.open("http://localhost:8111/load_object?" + new URLSearchParams({
                        new_layer: "true",
                        objects: [
                            Array.from(nodes).map(i => "n" + i).join(","),
                            Array.from(ways).map(i => "w" + i).join(","),
                            Array.from(relations).map(i => "r" + i).join(",")
                        ].join(",")
                    }).toString())
                }
            })
        } else if (e.code === "KeyH") {
            if (e.shiftKey) {
                const targetURL = document.querySelector('.dropdown-item[href^="/user/"]').getAttribute("href") + "/history"
                if (targetURL !== location.pathname) {
                    try {
                        getWindow().OSM.router.route(targetURL)
                    } catch {
                        window.location.pathname = targetURL
                    }
                }
            } else {
                if (location.pathname.match(/(node|way|relation)\/\d+/)) {
                    if (location.pathname.match(/(node|way|relation)\/\d+\/?$/)) {
                        getWindow().OSM.router.route(window.location.pathname + "/history")
                    } else if (location.pathname.match(/(node|way|relation)\/\d+\/history\/\d+\/?$/)) {
                        const historyPath = window.location.pathname.match(/(\/(node|way|relation)\/\d+\/history)\/\d+/)[1]
                        getWindow().OSM.router.route(historyPath)
                    } else {
                        console.debug("skip H")
                    }
                } else if (location.pathname === "/" || location.pathname.includes("/note")) {
                    // document.querySelector("#history_tab")?.click()
                    addCompactSidebarStyle()
                    document.querySelector('.nav-link[href^="/history"]')?.click()
                } else if (location.pathname.includes("/user/")) {
                    document.querySelector('a[href^="/user/"][href$="/history"]')?.click()
                }
            }
        } else if (e.code === "KeyY") {
            const [x, y, z] = getCurrentXYZ()
            window.open(`https://yandex.ru/maps/?l=stv,sta&ll=${y},${x}&z=${z}`, "_blank", "noreferrer")
        } else if (e.key === "1") {
            if (location.pathname.match(/\/(node|way|relation)\/\d+/)) {
                if (location.pathname.match(/\/(node|way|relation)\/\d+/)) {
                    getWindow().OSM.router.route(location.pathname.match(/\/(node|way|relation)\/\d+/)[0] + "/history/1")
                } else {
                    console.debug("skip 1")
                }
            } else if (location.pathname.startsWith("/changeset")) {
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
            } else if (location.pathname.match(/\/user\/[^\\]+\/history\/?/)) {
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
        } else if (e.key === "0") {
            const center = getMapCenter()
            setZoom(2)
            fetch(`https://nominatim.openstreetmap.org/reverse.php?lon=${center.lng}&lat=${center.lat}&format=jsonv2`).then(res => {
                res.json().then(r => {
                    if (r?.address?.state) {
                        getMap().attributionControl?.setPrefix(`${r.address.state}`)
                    }
                })
            })
        } else if (e.code === "KeyZ") {
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
        } else if (e.key === "8") {
            if (mapPositionsHistory.length > 1) {
                mapPositionsNextHistory.push(mapPositionsHistory[mapPositionsHistory.length - 1])
                mapPositionsHistory.pop()
                fitBounds(mapPositionsHistory[mapPositionsHistory.length - 1])
            }
        } else if (e.key === "9") {
            if (mapPositionsNextHistory.length) {
                mapPositionsHistory.push(mapPositionsNextHistory.pop())
                fitBounds(mapPositionsHistory[mapPositionsHistory.length - 1])
            }
        } else if (e.code === "Minus" && !defaultZoomKeysBehaviour) {
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
        } else if (e.code === "Equal" && !defaultZoomKeysBehaviour) {
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
        } else if (e.code === "KeyO") {
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
        } else if (e.code === "Escape") {
            cleanObjectsByKey("activeObjects")
            document.querySelectorAll(".betterOsmContextMenu").forEach(i => i.remove())
        } else if (e.code === "KeyL" && e.shiftKey) {
            document.querySelector(".control-locate .control-button").click()
        } else if (e.code === "KeyK" && location.pathname.match(/^(\/user\/.+)?\/history\/?$/)) {
            goToPrevChangeset(e)
        } else if (e.code === "KeyL" && location.pathname.match(/^(\/user\/.+)?\/history\/?$/)) {
            goToNextChangeset(e)
        } else if (e.code === "KeyK" && location.pathname === "/search") {
            goToPrevSearchResult(e)
        } else if (e.code === "KeyL" && location.pathname === "/search") {
            goToNextSearchResult(e)
        } else if (e.code === "KeyC") {
            if (location.pathname.includes("/user/") && !location.pathname.includes("/history")) {
                if (location.pathname.includes("/diary_comments")) {
                    document.querySelector('a[href^="/user/"][href$="changeset_comments"]')?.click()
                } else {
                    document.querySelector('a[href^="/user/"][href$="_comments"]')?.click()
                }
            } else {
                if (e.altKey) {
                    setTimeout(async () => {
                        const center = getMapCenter()
                        const format = (await GM.getValue("CoordinatesFormat")) ?? "Lat Lon"
                        if (format === "Lon Lat") {
                            navigator.clipboard.writeText(`${center.lng} ${center.lat}`)
                        } else {
                            navigator.clipboard.writeText(`${center.lat} ${center.lng}`)
                        }
                    })
                } else {
                    const activeObject = document.querySelector("#element_versions_list > div.active-object")
                    if (activeObject) {
                        if (e.shiftKey) {
                            window.open(activeObject.querySelector('a[href^="/changeset/"]').href, "_blank")
                        } else {
                            activeObject.querySelector('a[href^="/changeset/"]')?.click()
                        }
                    } else {
                        const changesetsLinks = document.querySelectorAll('a[href^="/changeset/"]:not([href*="?locale="])')
                        if (e.shiftKey) {
                            if (changesetsLinks?.[0]?.href) {
                                window.open(changesetsLinks?.[0]?.href, "_blank")
                            }
                        } else {
                            changesetsLinks?.[0]?.click()
                        }
                    }
                }
            }
        } else if (e.code === "KeyQ" && !e.altKey && !e.metaKey && !e.shiftKey && !e.ctrlKey) {
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
        } else if (e.code === "KeyT" && !e.altKey && !e.metaKey && !e.shiftKey && !e.ctrlKey) {
            if (location.pathname.includes("/user/") && !location.pathname.includes("/history")) {
                document.querySelector('a[href="/traces/mine"], a[href$="/traces"]:not(.nav-link):not(.dropdown-item)')?.click()
            } else {
                document.querySelector(".quick-look-compact-toggle-btn")?.click()
                document.querySelector(".compact-toggle-btn")?.click()
                document.querySelector("time[switchable]").click()
            }
        } else if (e.code === "KeyT" && (e.altKey || e.shiftKey)) {
            document.querySelector("time[switchable]").click()
        } else if (e.code === "KeyM" && !e.altKey && !e.metaKey && !e.ctrlKey) {
            if (e.shiftKey) {
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
            } else if (location.pathname.includes("/user/") && !location.pathname.includes("/history")) {
                document.querySelector('a[href^="/messages/new/"]')?.click()
            }
        } else if (e.code === "KeyU" && !e.altKey && !e.metaKey && !e.ctrlKey) {
            if (e.shiftKey) {
                window.location.pathname = document.querySelector('.dropdown-item[href^="/user/"]').getAttribute("href")
            } else {
                const user_link = document.querySelector('#sidebar_content a[href^="/user/"]')
                if (user_link) {
                    if (user_link.checkVisibility()) {
                        user_link?.click()
                    } else {
                        document.querySelector('#sidebar_content li:not([hidden-data-changeset]) a[href^="/user/"]')?.click()
                    }
                    // todo fixme on changesets page with filter
                } else {
                    document.querySelector('#content a[href^="/user/"]:not([href$=rss]):not([href*="/diary"]):not([href*="/traces"])')?.click()
                }
            }
        } else if ((e.code === "Backquote" || e.code === "Quote" || e.key === "`" || e.key === "~") && !e.altKey && !e.metaKey && !e.ctrlKey) {
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
        } else if (e.code === "KeyF" && !e.altKey && !e.metaKey && !e.ctrlKey) {
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
        } else if (isDebug() && e.code === "KeyP" && e.altKey) {
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
                                // debugger
                                // showNodeMarker(object.getAttribute("lat"), object.getAttribute("lon"), "rgb(0,34,255)", null, 'customObjects')
                                // await sleep(300)
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
        } else if ((e.code === "Slash" || e.code === "Backslash" || e.code === "NumpadDivide" || e.key === "/") && e.shiftKey) {
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
        } else if (e.altKey && e.code === "Backquote") {
            darkModeForMap = !darkModeForMap
            if (darkModeForMap) {
                injectDarkMapStyle()
            } else {
                darkMapStyleElement?.remove()
            }
        } else if (e.code === "KeyP") {
            navigator.clipboard.writeText(shortOsmOrgLinksInText(location.origin + location.pathname))
        } else if (e.code === "KeyB") {
            if (location.pathname.includes("/user/") && !location.pathname.includes("/history")) {
                document.querySelector('a[href^="/user/"][href$="/blocks"]')?.click()
            }
            //setupBuildingTools()
        } else if (e.code === "KeyX") {
            document.querySelector("#edit_tab ul").tabIndex = -1
            if (document.querySelector("header").classList.contains("closed")) {
                document.querySelector("#menu-icon").click()
                document.querySelector("#edit_tab > button").click()
            } else if (document.querySelector("#edit_tab > .dropdown-menu").classList.contains("show")) {
                document.querySelector("#change-list-btn.closed")?.click()
            } else {
                document.querySelector("#edit_tab button").click()
            }
        } else if (e.code === "KeyV") {
            if (e.shiftKey) {
                if (!document.querySelector("#map canvas")) {
                    Array.from(document.querySelectorAll(".layers-ui .base-layers label")).at(-2)?.click()
                }
                void askCustomStyleUrl()
            } else {
                nextVectorLayer()
            }
        } else {
            // console.log(e.key, e.code)
        }
        if (location.pathname.startsWith("/changeset") && !location.pathname.includes("/changeset_comments")) {
            if (e.code === "Comma") {
                const link = getPrevChangesetLink()
                if (link) {
                    getAbortController().abort(ABORT_ERROR_PREV)
                    needPreloadChangesets = true
                    link.focus()
                    link.click()
                }
            } else if (e.code === "Period") {
                const link = getNextChangesetLink()
                if (link) {
                    getAbortController().abort(ABORT_ERROR_NEXT)
                    needPreloadChangesets = true
                    link.focus()
                    link.click()
                }
            } else if (e.code === "KeyH") {
                const userChangesetsLink = document.querySelectorAll("div.secondary-actions")[1]?.querySelector('a[href^="/user/"]')
                if (userChangesetsLink) {
                    getAbortController().abort(ABORT_ERROR_USER_CHANGESETS)
                    userChangesetsLink.focus()
                    userChangesetsLink.click()
                }
            } else if (e.code === "KeyK") {
                goToPrevChangesetObject(e)
            } else if (e.code === "KeyL" && !e.shiftKey) {
                goToNextChangesetObject(e)
            }
        } else if (location.pathname.match(/^\/(node|way|relation)\/\d+/)) {
            if (e.code === "Comma") {
                const links = Array.from(document.querySelectorAll("#sidebar_content nav div ul a"))
                for (let i = 0; i < links.length; i++) {
                    if (links[i].parentElement.classList.contains("active")) {
                        links[i - 1]?.click()
                        break
                    }
                }
            } else if (e.code === "Period") {
                const links = Array.from(document.querySelectorAll("#sidebar_content nav div ul a"))
                for (let i = 0; i < links.length; i++) {
                    if (links[i].parentElement.classList.contains("active")) {
                        links[i + 1]?.click()
                        break
                    }
                }
            }
            if (location.pathname.match(/\/history$/)) {
                if (e.code === "KeyK") {
                    goToPrevObjectVersion()
                } else if (e.code === "KeyL" && !e.shiftKey) {
                    gotNextObjectVersion()
                }
            }
        } else if (
            // prettier-ignore
            location.pathname.match(/user\/.+\/(traces|diary_comments|changeset_comments)/)
            || location.pathname.match(/\/user_blocks($|\/)/)
            || location.pathname.match(/\/blocks_by$/)
        ) {
            if (e.code === "Comma") {
                document.querySelector('.pagination a[href*="after"]')?.click()
            } else if (e.code === "Period") {
                document.querySelector('.pagination a[href*="before"]')?.click()
            }
        } else if (location.pathname.match(/user\/.+\/(notes)/)) {
            if (e.code === "Comma") {
                document.querySelectorAll(".pagination li a")[0]?.click()
            } else if (e.code === "Period") {
                document.querySelectorAll(".pagination li a")[1]?.click()
            }
        } else if (e.code === "KeyH" && location.pathname.includes("/history") && (location.search.includes("after") || location.search.includes("before"))) {
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
    }

    document.addEventListener("keydown", keydownHandler, false)
}

function setupOverzoomForDataLayer() {
    if (location.hash.includes("D") && location.hash.includes("layers")) {
        enableOverzoom()
    }
}

//</editor-fold>
