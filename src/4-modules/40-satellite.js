//<editor-fold desc="satellite switching">
const OSMPrefix = "https://tile.openstreetmap.org/"
let BaseLayerPrefix = OSMPrefix
const ESRIPrefix = "https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/"
const ESRIBetaPrefix = "https://clarity.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/"
let SatellitePrefix = ESRIPrefix
const SAT_MODE = "🛰"
const MAPNIK_MODE = "🗺️"
let currentTilesMode = MAPNIK_MODE
let tilesObserver = undefined

const OSMGPSPrefix = "https://gps.tile.openstreetmap.org/lines/"
const StravaPrefix = "https://content-a.strava.com/identified/globalheat/all/blue/"
let currentOverlayModeIsStrava = false
let overlayTilesObserver = undefined

function invertTilesMode(mode) {
    return mode === "🛰" ? "🗺️" : "🛰"
}

function invertOverlayMode(mode) {
    // fixme
    return (currentOverlayModeIsStrava = !currentOverlayModeIsStrava)
}

function parseOSMTileURL(url) {
    const match = url.match(new RegExp(`${OSMPrefix}(\\d+)\\/(\\d+)\\/(\\d+)\\.png`))
    if (!match) {
        return false
    }
    return {
        x: match[2],
        y: match[3],
        z: match[1],
    }
}

function parseOSMGPSTileURL(url) {
    const match = url.match(new RegExp(`${OSMGPSPrefix}(\\d+)\\/(\\d+)\\/(\\d+)\\.png`))
    if (!match) {
        return false
    }
    return {
        x: match[2],
        y: match[3],
        z: match[1],
    }
}

function parseESRITileURL(url) {
    const match = url.match(new RegExp(`${SatellitePrefix}(\\d+)\\/(\\d+)\\/(\\d+)`))
    if (!match) {
        return false
    }
    return {
        x: match[3],
        y: match[2],
        z: match[1],
    }
}

function parseStravaTileURL(url) {
    const match = url.match(new RegExp(`${StravaPrefix}(\\d+)\\/(\\d+)\\/(\\d+)`))
    if (!match) {
        return false
    }
    return {
        x: match[3],
        y: match[2],
        z: match[1],
    }
}

let needStravaAuth = false

async function bypassCSPForImagesSrc(imgElem, url, isStrava = true) {
    const res = await fetchBlobWithCache(url)
    if (res.status !== 200) {
        if (!GM_config.get("OverzoomForDataLayer")) {
            return
        }
        if (isStrava && res.status === 403) {
            if (!needStravaAuth) {
                needStravaAuth = true
                alert("Need login in Strava for access to heatmap")
                const [x, y, z] = getCurrentXYZ()
                const hash = `#${z}/${x}/${y}`
                window.open("https://www.strava.com/maps/global-heatmap" + hash, "_blank")
            }
            return
        }
        if (getZoom() >= 18) {
            const zoomStr = url.match(/(tile|org)\/([0-9]+)/)[2]
            if (zoomStr) {
                const tileZoom = parseInt(zoomStr)
                console.log(tileZoom)
                setZoom(Math.min(19, Math.min(getZoom(), tileZoom - 1)))
            }
        }
        tileErrorHandler({ currentTarget: imgElem }, url)
        imgElem.src = "/dev/null"
        return
    }

    const blob = res.response

    const satTile = await new Promise(resolve => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.readAsDataURL(blob)
    })
    if (currentTilesMode === SAT_MODE || currentOverlayModeIsStrava) {
        imgElem.src = satTile
        imgElem.setAttribute("custom-tile-url", url)
    }
}

let blankSuffix = ""
let lastEsriZoom = 0
let lastEsriDate = ""

function updateShotEsriDateNeeded() {
    return lastEsriZoom !== parseInt(getCurrentXYZ()[2]) && SatellitePrefix === ESRIPrefix
}

function addEsriDate() {
    if (vectorLayerEnabled()) {
        return
    }
    console.debug("Updating imagery date")
    const [x, y, z] = getCurrentXYZ()
    const zoom = min(19, parseInt(z))
    lastEsriZoom = zoom
    const centerPoint = y + "," + x
    externalFetch({
        url: `https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/4/query?returnGeometry=false&geometry='${centerPoint}'&inSR=4326&geometryType=esriGeometryPoint&outFields=*&f=json`,
        responseType: "json",
    }).then(res => {
        if (currentTilesMode !== SAT_MODE || SatellitePrefix !== ESRIPrefix) {
            return
        }
        console.debug(res.response)
        const result = res.response.features.map(f => f.attributes).filter(a => a.MinMapLevel <= zoom && a.MaxMapLevel >= zoom)[0]
        console.debug(result)
        if (result && result.SRC_DATE2) {
            const date = new Date(result.SRC_DATE2)
            const strDate = `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, "0")}-${date.getUTCDate().toString().padStart(2, "0")}`
            lastEsriDate = strDate
            getMap()?.attributionControl?.setPrefix(strDate + " ESRI")
        } else if (result && !result.SRC_DATE2) {
            lastEsriDate = ""
            getMap()?.attributionControl?.setPrefix("ESRI")
        }
    })
}

function addEsriPrefix() {
    if (document.querySelector("#map canvas")) {
        return
    }
    getMap()?.attributionControl?.setPrefix("ESRI")
    if (SatellitePrefix === ESRIPrefix) {
        addEsriDate()
    }
}

function switchESRIbeta() {
    SatellitePrefix = SatellitePrefix === ESRIPrefix ? ESRIBetaPrefix : ESRIPrefix
    customLayerUrl = SatellitePrefix + "{z}/{y}/{x}" + blankSuffix
    document.querySelectorAll(".leaflet-tile").forEach(i => {
        if (i.nodeName !== "IMG") {
            return
        }
        const xyz = xyzFromTileElem(i)
        if (!xyz) return
        const newUrl = makeCustomTileUrl(customLayerUrl, xyz)
        if (!needBypassSatellite) {
            i.src = newUrl
        } else {
            bypassCSPForImagesSrc(i, newUrl)
        }
    })
    addEsriPrefix()
}

const needBypassSatellite = !isFirefox || GM_info.scriptHandler === "Violentmonkey"

function tileErrorHandler(e, url = null) {
    if (!GM_config.get("OverzoomForDataLayer")) {
        return
    }
    if (getZoom() >= 18) {
        if (e?.currentTarget?.src?.endsWith("/dev/null") && !url) {
            return
        }
        let tileURL = e?.currentTarget?.src?.match(/(tile|org)\/([0-9]+)/)
        if (!tileURL) {
            tileURL = e.currentTarget.getAttribute("custom-tile-url").match(/(tile|org)\/([0-9]+)/)
            console.log(e.currentTarget.getAttribute("custom-tile-url"))
        }
        const zoomStr = tileURL[2]
        if (zoomStr) {
            const tileZoom = parseInt(zoomStr)
            console.log(tileZoom)
            setZoom(Math.min(19, Math.min(getZoom(), tileZoom - 1)))
        }
    }
}

function makeCustomTileUrl(template, xyz) {
    return template.replaceAll("{x}", xyz.x).replaceAll("{y}", xyz.y).replaceAll("{z}", xyz.z)
}

function makeSatelliteURL(x, y, z) {
    return makeCustomTileUrl(SatellitePrefix + "{z}/{y}/{x}" + blankSuffix, { x, y, z })
    // return SatellitePrefix + z + "/" + y + "/" + x + blankSuffix
}

const retina = window.retina || window.devicePixelRatio > 1

function makeStravaURL(x, y, z) {
    return StravaPrefix + z + "/" + x + "/" + y + (retina ? "@2x" : "") + ".png"
}

function makeOSMURL(x, y, z) {
    return OSMPrefix + z + "/" + x + "/" + y + ".png"
}

function makeBaseLayerURL(x, y, z) {
    return makeOSMURL(x, y, z)
}

function makeOSMGPSURL(x, y, z) {
    return OSMGPSPrefix + z + "/" + x + "/" + y + ".png"
}

async function loadExternalVectorStyle(url) {
    try {
        const res = await externalFetchRetry({
            url: url,
            responseType: "json",
            headers: {
                Origin: "https://www.openstreetmap.org",
                Referer: "https://www.openstreetmap.org/",
            },
        })
        console.debug((getWindow().vectorStyle = await res.response))
    } catch (e) {}
}

let customLayerUrl = null
let lastCustomLayerUrl = null
let lastCustomLayerUrlOrigin = null
GM.getValue("lastCustomLayerUrl").then(res => (lastCustomLayerUrl = res))

let vectorLayerStyleUrl = null
let lastVectorLayerStyleUrl = null
let lastVectorLayerStyleUrlOrigin = null
GM.getValue("lastVectorLayerStyleUrl").then(res => (lastVectorLayerStyleUrl = res))

function findVectorMap() {
    for (const i of getWindow().mapGL) {
        if (i && i.getMaplibreMap?.()) {
            return i.getMaplibreMap()
        }
    }
}

/**
 * @return {string}
 */
function getCurrentLayers() {
    return `; ${document.cookie}`.split(`; _osm_location=`).pop().split(";").shift().split("|").at(-1)
}

function vectorLayerEnabled() {
    const layers = getCurrentLayers()
    return layers.includes("S") || layers.includes("V")
}

function askCustomTileUrl() {
    customLayerUrl = prompt(
        `Enter tile URL template for maplibre.js. Examples:

https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}?blankTile=false` +
            (!isMobile
                ? `

https://geoscribble.osmz.ru/wms?FORMAT=image/png&TRANSPARENT=TRUE&VERSION=1.1.1&SERVICE=WMS&REQUEST=GetMap&LAYERS=scribbles&STYLES=&SRS=EPSG:3857&WIDTH=512&HEIGHT=512&BBOX={bbox-epsg-3857}

https://geoportal.dgu.hr/services/inspire/orthophoto_2021_2022/ows?FORMAT=image/png&TRANSPARENT=TRUE&VERSION=1.3.0&SERVICE=WMS&REQUEST=GetMap&LAYERS=OI.OrthoimageCoverage&STYLES=&CRS=EPSG:3857&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}`
                : ""),
        lastCustomLayerUrl ?? "",
    )
    if (customLayerUrl) {
        lastCustomLayerUrl = customLayerUrl
        void GM.setValue("lastCustomLayerUrl", lastCustomLayerUrl)
    } else {
        return
    }
    getWindow().customLayer = lastCustomLayerUrlOrigin = new URL(customLayerUrl).origin
}

function vectorSwitch() {
    if (!vectorLayerEnabled()) {
        return
    }
    const vectorMap = findVectorMap()
    if (currentTilesMode === SAT_MODE) {
        askCustomTileUrl()
        function addLayer() {
            vectorMap.addSource(
                "satellite",
                intoPage({
                    type: "raster",
                    tiles: [customLayerUrl],
                    tileSize: 256,
                    attribution: "",
                }),
            )
            vectorMap.addLayer(
                intoPage({
                    id: "satellite-layer",
                    type: "raster",
                    source: "satellite",
                }),
            )
        }

        try {
            addLayer()
        } catch (e) {
            console.error(e)
            // dirty hack for wait styles downloading
            setTimeout(addLayer, 1000)
        }
    } else {
        vectorMap.removeLayer("satellite-layer")
        vectorMap.removeSource("satellite")
    }
}

let moveAndZoomForEsriDateObserverEnabled = false

function addEsriShotDateCollector() {
    if (moveAndZoomForEsriDateObserverEnabled) {
        return
    }
    moveAndZoomForEsriDateObserverEnabled = true
    try {
        getMap().on(
            "moveend zoomend",
            intoPageWithFun(function () {
                if (updateShotEsriDateNeeded()) {
                    addEsriDate()
                }
            }),
        )
    } catch (e) {
        console.error(e)
    }
}

function xyzFromTileElem(elem) {
    if (elem.hasAttribute("x")) {
        return {
            x: elem.getAttribute("x"),
            y: elem.getAttribute("y"),
            z: elem.getAttribute("z"),
        }
    }
}

function replaceToSatTile(imgElem, xyz) {
    const newUrl = makeCustomTileUrl(customLayerUrl, xyz)
    if (imgElem.getAttribute("custom-tile-url") === newUrl) {
        return
    }
    // unsafeWindow.L.DomEvent.off(i, "error") // todo добавить перехватчик 404
    try {
        imgElem.onerror = tileErrorHandler
    } catch {
        /* empty */
    }
    if (!needBypassSatellite) {
        imgElem.src = newUrl
    } else {
        imgElem.setAttribute("custom-tile-url", newUrl)
    }
    if (needBypassSatellite) {
        bypassCSPForImagesSrc(imgElem, newUrl)
    }
    if (imgElem.complete && !needBypassSatellite) {
        imgElem.classList.add("no-invert")
    } else {
        imgElem.addEventListener(
            "load",
            e => {
                e.target.classList.add("no-invert")
            },
            { once: true },
        )
    }
}

function replaceToBaseTile(imgElem, xyz) {
    const newUrl = makeBaseLayerURL(xyz.x, xyz.y, xyz.z)
    if (!imgElem.getAttribute("custom-tile-url")) {
        return
    }
    imgElem.removeAttribute("custom-tile-url")
    imgElem.src = newUrl
    if (imgElem.complete) {
        imgElem.classList.remove("no-invert")
    } else {
        imgElem.addEventListener(
            "load",
            e => {
                e.target.classList.remove("no-invert")
            },
            { once: true },
        )
    }
}

function replaceTileSrc(imgElem) {
    if (!imgElem.hasAttribute("x")) {
        const xyz = parseOSMTileURL(imgElem.src)
        if (!xyz) {
            return
        }
        imgElem.setAttribute("x", xyz.x)
        imgElem.setAttribute("y", xyz.y)
        imgElem.setAttribute("z", xyz.z)
    }
    const xyz = xyzFromTileElem(imgElem)
    if (currentTilesMode === SAT_MODE) {
        replaceToSatTile(imgElem, xyz)
    } else {
        replaceToBaseTile(imgElem, xyz)
    }
}

function switchTiles() {
    if (tilesObserver) {
        tilesObserver?.disconnect()
    }
    addEsriShotDateCollector()
    currentTilesMode = invertTilesMode(currentTilesMode)
    if (currentTilesMode === SAT_MODE) {
        if (!customLayerUrl) {
            customLayerUrl = SatellitePrefix + "{z}/{y}/{x}" + blankSuffix
        }
        addEsriPrefix()
    } else {
        getMap()?.attributionControl?.setPrefix("")
    }
    document.querySelectorAll(".leaflet-tile").forEach(i => {
        if (i.nodeName !== "IMG") {
            return
        }
        replaceTileSrc(i)
    })
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeName !== "IMG") {
                    return
                }
                replaceTileSrc(node)
                if (currentTilesMode === SAT_MODE) {
                    setTimeout(() => {
                        if (updateShotEsriDateNeeded()) {
                            addEsriDate()
                        }
                    })
                }
            })
        })
    })
    tilesObserver = observer
    observer.observe(document.body, { childList: true, subtree: true })
    vectorSwitch()
}

function switchTilesAndButtons() {
    switchTiles()
    document.querySelectorAll(".turn-on-satellite").forEach(btn => (btn.textContent = invertTilesMode(currentTilesMode)))
    document.querySelectorAll(".turn-on-satellite-from-pane").forEach(btn => (btn.textContent = invertTilesMode(currentTilesMode)))
}

let osmTilesObserver = undefined

function bypassCaches() {
    if (osmTilesObserver) {
        osmTilesObserver.disconnect()
    }
    document.querySelectorAll(".leaflet-tile").forEach(i => {
        if (i.nodeName !== "IMG") {
            return
        }
        // todo support multiple press
        const xyz = parseOSMTileURL(i.src)
        if (!xyz) return
        const newUrl = makeOSMURL(xyz.x, xyz.y, xyz.z) // + "?bypassCache=" + new Date().getUTCSeconds();
        externalFetchRetry({
            method: "GET",
            url: newUrl,
            headers: {
                "Cache-Control": "no-cache",
                Pragma: "no-cache",
                Referer: "https://www.openstreetmap.org/",
            },
            responseType: "blob",
            nocache: true,
            revalidate: true,
        }).then(async response => {
            i.src = await new Promise(resolve => {
                const reader = new FileReader()
                reader.onload = () => resolve(reader.result)
                reader.readAsDataURL(response.response)
            })
        })
    })
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeName !== "IMG") {
                    return
                }
                const xyz = parseOSMTileURL(node.src)
                if (!xyz) return
                const newUrl = makeOSMURL(xyz.x, xyz.y, xyz.z) // + "?bypassCache=" + new Date().getUTCSeconds();
                externalFetchRetry({
                    method: "GET",
                    url: newUrl,
                    headers: {
                        "Cache-Control": "no-cache",
                        Pragma: "no-cache",
                        Referer: "https://www.openstreetmap.org/",
                    },
                    responseType: "blob",
                    nocache: true,
                    revalidate: true,
                }).then(async response => {
                    node.src = await new Promise(resolve => {
                        const reader = new FileReader()
                        reader.onload = () => resolve(reader.result)
                        reader.readAsDataURL(response.response)
                    })
                })
            })
        })
    })
    osmTilesObserver = observer
    observer.observe(document.body, { childList: true, subtree: true })
}

function switchOverlayTiles() {
    if (overlayTilesObserver) {
        overlayTilesObserver.disconnect()
    }
    currentOverlayModeIsStrava = invertOverlayMode(currentOverlayModeIsStrava)
    if (currentOverlayModeIsStrava) {
        getMap()?.attributionControl?.setPrefix("Strava")
    } else {
        getMap()?.attributionControl?.setPrefix("")
    }
    document.querySelectorAll(".leaflet-tile").forEach(i => {
        if (i.nodeName !== "IMG") {
            return
        }
        if (currentOverlayModeIsStrava) {
            const xyz = parseOSMGPSTileURL(i.src)
            if (!xyz) return
            // unsafeWindow.L.DomEvent.off(i, "error") // todo добавить перехватчик 404
            try {
                i.onerror = tileErrorHandler
            } catch {
                /* empty */
            }
            const newUrl = makeStravaURL(xyz.x, xyz.y, xyz.z)
            i.setAttribute("custom-tile-url", newUrl)
            bypassCSPForImagesSrc(i, newUrl, true)
            if (i.complete) {
                i.classList.add("no-invert")
            } else {
                i.addEventListener(
                    "load",
                    e => {
                        e.target.classList.add("no-invert")
                    },
                    { once: true },
                )
            }
        } else {
            const xyz = parseStravaTileURL(i.getAttribute("custom-tile-url") ?? "")
            if (!xyz) return
            i.src = makeOSMGPSURL(xyz.x, xyz.y, xyz.z)
            if (i.complete) {
                i.classList.remove("no-invert")
            } else {
                i.addEventListener(
                    "load",
                    e => {
                        e.target.classList.remove("no-invert")
                    },
                    { once: true },
                )
            }
        }
    })
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeName !== "IMG") {
                    return
                }
                if (currentOverlayModeIsStrava) {
                    const xyz = parseOSMGPSTileURL(node.src)
                    if (!xyz) return
                    // unsafeWindow.L.DomEvent.off(node, "error")
                    try {
                        node.onerror = tileErrorHandler
                    } catch {
                        /* empty */
                    }
                    const newURL = makeStravaURL(xyz.x, xyz.y, xyz.z)
                    node.src = "/dev/null"
                    node.setAttribute("custom-tile-url", newURL)
                    bypassCSPForImagesSrc(node, newURL, true)
                    if (node.complete) {
                        node.classList.add("no-invert")
                    } else {
                        node.addEventListener(
                            "load",
                            e => {
                                e.target.classList.add("no-invert")
                            },
                            { once: true },
                        )
                    }
                } else {
                    const xyz = parseStravaTileURL(node.getAttribute("custom-tile-url"))
                    if (!xyz) return
                    node.src = makeOSMGPSURL(xyz.x, xyz.y, xyz.z)
                    if (node.complete) {
                        node.classList.remove("no-invert")
                    } else {
                        node.addEventListener(
                            "load",
                            e => {
                                e.target.classList.remove("no-invert")
                            },
                            { once: true },
                        )
                    }
                }
            })
        })
    })
    overlayTilesObserver = observer
    observer.observe(document.body, { childList: true, subtree: true })
}

if (isOsmServer() && new URLSearchParams(location.search).has("sat-tiles")) {
    switchTilesAndButtons()
}

function addSwitchTilesBtnOnNotePage() {
    if (document.querySelector(".turn-on-satellite")) return true
    if (!document.querySelector("#sidebar_content h4")) {
        return
    }
    const btnOnNotePage = document.createElement("span")
    if (!tilesObserver) {
        btnOnNotePage.textContent = "🛰"
    } else {
        btnOnNotePage.textContent = invertTilesMode(currentTilesMode)
    }
    btnOnNotePage.style.cursor = "pointer"
    btnOnNotePage.classList.add("turn-on-satellite")
    btnOnNotePage.title = "Switch between map and satellite images"

    document.querySelectorAll("h4")[0].appendChild(document.createTextNode("\xA0"))
    document.querySelectorAll("h4")[0].appendChild(btnOnNotePage)

    btnOnNotePage.onclick = () => {
        enableOverzoom()
        switchTilesAndButtons()
    }
}

function createSwitchTilesBtn() {
    const btnOnPane = document.createElement("span")
    if (!tilesObserver) {
        btnOnPane.textContent = "🛰"
    } else {
        btnOnPane.textContent = invertTilesMode(currentTilesMode)
    }
    btnOnPane.style.cursor = "pointer"
    btnOnPane.classList.add("turn-on-satellite-from-pane")
    btnOnPane.title = "Switch between map and satellite images (S key)\nPress (Shift+S) for ESRI beta"
    btnOnPane.onclick = e => {
        e.stopImmediatePropagation()
        enableOverzoom()
        if (e.shiftKey) {
            switchESRIbeta()
            return
        }
        setTimeout(() => {
            switchTilesAndButtons()
        })
    }
    return btnOnPane
}

function addSwitchTilesButtonsOnPane() {
    if (document.querySelector(".turn-on-satellite-from-pane")) {
        return
    }
    const layers = Array.from(document.querySelectorAll(".layers-ui .base-layers label span"))
    const mapnikBtn = layers[0]
    if (mapnikBtn) {
        const btnOnPane = createSwitchTilesBtn()
        mapnikBtn.appendChild(document.createTextNode("\xA0"))
        mapnikBtn.appendChild(btnOnPane)
    }
    const omtBtn = layers.at(-1)
    if (omtBtn) {
        const btnOnPane = createSwitchTilesBtn()
        omtBtn.appendChild(document.createTextNode("\xA0"))
        omtBtn.appendChild(btnOnPane)
    }
}

function addSatelliteLayers() {
    addSwitchTilesButtonsOnPane()
    if (location.pathname.includes("/note")) {
        addSwitchTilesBtnOnNotePage()
    }
}

function setupSatelliteLayers() {
    const timerId = setInterval(addSatelliteLayers, 100)
    setTimeout(() => {
        clearInterval(timerId)
        console.debug("stop try add resolve note button")
    }, 3000)
    addSatelliteLayers()
}

//</editor-fold>
