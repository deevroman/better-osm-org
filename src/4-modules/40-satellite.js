//<editor-fold desc="satellite switching">
const OSMPrefix = "https://tile.openstreetmap.org/"
let BaseLayerPrefix = OSMPrefix

const ESRIPrefix = "https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/"
let ESRITemplate = ESRIPrefix + "{z}/{y}/{x}"
const ESRIBetaPrefix = "https://clarity.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/"
let ESRIBetaTemplate = ESRIBetaPrefix + "{z}/{y}/{x}"

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

const r2d = 180 / Math.PI

function tile2lon(x, z) {
    return (x / Math.pow(2, z)) * 360 - 180
}

function tile2lat(y, z) {
    const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, z)
    return r2d * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)))
}

function tileToBBOX(tile) {
    const e = tile2lon(tile[0] + 1, tile[2])
    const w = tile2lon(tile[0], tile[2])
    const s = tile2lat(tile[1] + 1, tile[2])
    const n = tile2lat(tile[1], tile[2])
    return [w, s, e, n]
}

function coord4326To3857(lon, lat) {
    const X = 20037508.34
    let long3857 = (lon * X) / 180
    let lat3857 = parseFloat(lat) + 90
    lat3857 = lat3857 * (Math.PI / 360)
    lat3857 = Math.tan(lat3857)
    lat3857 = Math.log(lat3857)
    lat3857 = lat3857 / (Math.PI / 180)
    lat3857 = (lat3857 * X) / 180
    return [long3857, lat3857]
}

async function bypassCSPForImagesSrc(imgElem, url) {
    const opt = {}
    if (url.startsWith("https://tiles.openrailwaymap.org")) {
        opt.headers = { Referer: "https://www.openrailwaymap.org/" }
    }
    console.log("bypassCSPForImagesSrc", url)
    const res = await fetchBlobWithCache(url, opt)
    if (res.status !== 200) {
        console.log("bypassCSPForImagesSrc", url, res.status)
        if (!GM_config.get("OverzoomForDataLayer")) {
            return
        }
        if (res.status === 403 && url.includes("strava")) {
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
    console.log("bypassCSPForImagesSrc", url, res.status)

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

let lastEsriZoom = 0
let lastEsriDate = ""

function updateShotEsriDateNeeded() {
    return lastEsriZoom !== parseInt(getCurrentXYZ()[2]) && customLayerUrl === ESRITemplate
}

function addEsriDate() {
    console.debug("Updating imagery date")
    const [x, y, z] = getCurrentXYZ()
    const zoom = min(19, parseInt(z))
    lastEsriZoom = zoom
    const centerPoint = y + "," + x
    externalFetch({
        url: `https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/4/query?returnGeometry=false&geometry='${centerPoint}'&inSR=4326&geometryType=esriGeometryPoint&outFields=*&f=json`,
        responseType: "json",
    }).then(res => {
        if (currentTilesMode !== SAT_MODE || customLayerUrl !== ESRITemplate) {
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
    if (customLayerUrl === ESRIBetaTemplate) {
        getMap()?.attributionControl?.setPrefix("ESRI beta")
    } else {
        getMap()?.attributionControl?.setPrefix("ESRI")
    }
    if (customLayerUrl === ESRITemplate) {
        addEsriDate()
    }
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
    if (!customLayerUrlIsWms) {
        return template.replaceAll("{x}", xyz.x).replaceAll("{y}", xyz.y).replaceAll("{z}", xyz.z)
    }
    const bbox = tileToBBOX([parseInt(xyz.x), parseInt(xyz.y), parseInt(xyz.z)])
    const a = coord4326To3857(bbox[0], bbox[1])
    const b = coord4326To3857(bbox[2], bbox[3])
    return template.replaceAll("{bbox-epsg-3857}", [...a, ...b].join(","))
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

/** @type {string|null} */
let customLayerUrl = null
/** @type {boolean} */
let customLayerUrlIsWms = false
let lastCustomLayerUrl = null
let customLayerUrlOrigin = null
GM.getValue("lastCustomLayerUrl").then(res => (lastCustomLayerUrl = res))

let lastVectorLayerStyleUrl = null
let vectorLayerStyleUrlOrigin = null
GM.getValue("lastVectorLayerStyleUrl").then(res => (lastVectorLayerStyleUrl = res))

function findVectorMap() {
    for (const i of getWindow().mapGL) {
        if (i && i.getMaplibreMap?.()) {
            return i.getMaplibreMap()
        }
    }
}

async function applyCustomVectorMapStyle(styleUrl, updateUrlInStorage = false) {
    if (updateUrlInStorage) {
        void GM.setValue("lastVectorLayerStyleUrl", (lastVectorLayerStyleUrl = styleUrl))
    }
    getWindow().customVectorStyleLayerOrigin = vectorLayerStyleUrlOrigin = new URL(styleUrl).origin
    initCustomFetch()
    findVectorMap().setStyle(styleUrl)
}

function applyCustomLayer(layerUrl, updateUrlInStorage = false) {
    customLayerUrl = layerUrl
    customLayerUrlIsWms = customLayerUrl.includes("{bbox-epsg-3857}")
    if (updateUrlInStorage) {
        void GM.setValue("lastCustomLayerUrl", (lastCustomLayerUrl = customLayerUrl))
    }
    getWindow().customLayerOrigin = customLayerUrlOrigin = new URL(customLayerUrl).origin
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

// const localMapStylesURL = "http://localhost:7777/misc/assets/vector-map-styles.json"
const githubMapStylesURL = `https://raw.githubusercontent.com/deevroman/better-osm-org/refs/heads/dev/misc/assets/vector-map-styles.json?bypasscache=${Math.random()}`

const mapStylesDatabase = resourceCacher(githubMapStylesURL, "custom-vector-map-styles", "vector map styles list", 6 * 60 * 60 * 1000, "json")

async function askCustomStyleUrl() {
    if (!initCustomFetch) {
        alert(
            "Try reload page page without cache Ctrl + F5.\n" +
                "Or:\n" +
                "1. In TamperMonkey settings enable Advanced Config Mode\n" +
                '2. In TamperMonkey settings change "Content Script API" to "UserScript API Dynamic"\n' +
                "More info: https://c.osm.org/t/121670/208\n" +
                "\n" +
                "Or use Firefox with ViolentMonkey ;-)",
        )
        return
    }
    if (document.querySelector(".vector-tiles-selector-popup")) {
        document.querySelector(".vector-tiles-selector-popup").remove()
        return
    }
    await mapStylesDatabase.init()
    const options = mapStylesDatabase.get()?.styles ?? [
        { label: "SomeoneElse's vector map style", value: "https://map.atownsend.org.uk/vector/style_svwd03.json", about: "https://github.com/SomeoneElseOSM/SomeoneElse-vector-web-display" },
        {
            label: "StreetComplete map style",
            value: "https://raw.githubusercontent.com/streetcomplete/maplibre-streetcomplete-style/refs/heads/master/demo/streetcomplete.json",
            about: "https://github.com/streetcomplete/maplibre-streetcomplete-style",
        },
        { label: "OpenFreeMap Positron", value: "https://tiles.openfreemap.org/styles/positron" },
        { label: "VersaTiles Colorful (Shortbread)", value: "https://vector.openstreetmap.org/styles/shortbread/colorful.json", about: "https://github.com/versatiles-org/versatiles-style" },
        { label: "VersaTiles Shadow", value: "https://vector.openstreetmap.org/styles/shortbread/shadow.json", about: "https://github.com/versatiles-org/versatiles-style" },
        { label: "VersaTiles Graybeard", value: "https://vector.openstreetmap.org/styles/shortbread/graybeard.json", about: "https://github.com/versatiles-org/versatiles-style" },
    ]
    const popup = document.createElement("div")
    popup.classList.add("vector-tiles-selector-popup")
    const radioContainer = document.createElement("div")

    injectCSSIntoOSMPage(`
    .vector-tiles-selector-popup {
        position: relative;
        width: fit-content;
        background: var(--bs-body-bg);
        border: 1px solid rgba(204,204,204,0.5);
        padding: 12px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,.2);
        font-family: sans-serif;
        z-index: 9999;
    }
    .vector-tiles-selector-popup label:hover {
        background: light-dark("gray", "gray");
    }
`)

    const h = document.createElement("h3")
    h.style.display = "flex"
    h.style.gap = "25px"
    h.style.marginLeft = "auto"
    h.textContent = "Setup custom style.json for MapLibre.js"
    popup.appendChild(h)

    const closeBtn = document.createElement("button")
    closeBtn.classList.add("better-btn-close")
    closeBtn.style.all = "unset"
    closeBtn.style.cursor = "pointer"
    closeBtn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">' +
        '  <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>' +
        "</svg>"
    closeBtn.querySelector("svg").style.height = "1.5rem"
    closeBtn.onclick = () => popup.remove()
    h.append(closeBtn)

    popup.appendChild(radioContainer)

    const radiosName = `vector-styles-url`

    function makeWrapper() {
        const wrapper = document.createElement("label")
        wrapper.style.display = "flex"
        wrapper.style.paddingTop = "2px"
        wrapper.style.paddingBottom = "2px"
        wrapper.style.margin = "2px"
        wrapper.style.gap = "4px"
        return wrapper
    }

    function addRadio({ label, value, about }) {
        const wrapper = makeWrapper()

        const input = document.createElement("input")
        input.type = "radio"
        input.name = radiosName
        wrapper.title = input.value = value

        input.addEventListener("change", async () => {
            if (input.checked) {
                await applyCustomVectorMapStyle(value)
                getMap()?.attributionControl?.setPrefix(label)
            }
        })

        const externalLink = document.createElement("a")
        externalLink.title = "Open map style home page"
        externalLink.setAttribute("href", about)
        externalLink.setAttribute("target", "_blank")
        externalLink.innerHTML = externalLinkSvg
        externalLink.style.marginLeft = "auto"
        externalLink.style.marginRight = "2px"
        externalLink.style.color = "gray"
        externalLink.tabIndex = -1

        const labelSpan = document.createElement("span")
        labelSpan.textContent = label
        wrapper.append(input, labelSpan, externalLink)
        radioContainer.appendChild(wrapper)
    }

    options.forEach(addRadio)
    {
        const wrapper = makeWrapper()

        const input = document.createElement("input")
        input.type = "radio"
        input.name = radiosName
        input.value = ""

        wrapper.append(input)
        const urlInput = document.createElement("input")
        urlInput.type = "text"
        urlInput.placeholder = "example: https://vector.openstreetmap.org/styles/shortbread/neutrino.json"
        urlInput.style.width = "100%"
        if (lastVectorLayerStyleUrl) {
            urlInput.value = lastVectorLayerStyleUrl
        }
        wrapper.append(urlInput)

        input.onchange = async e => {
            if (!e.isTrusted) return
            if (input.checked && urlInput.value.trim() !== "") {
                await applyCustomVectorMapStyle(urlInput.value, true)
            }
        }

        urlInput.onkeydown = async e => {
            if (!e.isTrusted) return
            if (e.key === "Enter" && urlInput.value.trim() !== "") {
                input.click()
                await applyCustomVectorMapStyle(urlInput.value, true)
                getMap()?.attributionControl?.setPrefix("Custom map style from " + escapeHtml(new URL(urlInput.value).host))
            }
        }

        radioContainer.appendChild(wrapper)
    }

    const note = document.createElement("span")
    note.style.color = "gray"
    note.innerHTML =
        "You can <a target='_blank' href='https://github.com/deevroman/better-osm-org/issues/new'>suggest</a> other styles. One of styles <a target='_blank' href='https://github.com/pnorman/maplibre-styles'>collection</a>"
    popup.appendChild(note)
    document.body.appendChild(popup)
    popup.querySelector('label:has([href^="https://github.com/versatiles-org/versatiles-style"])')?.querySelector("input")?.focus()
}

async function askCustomTileUrl() {
    if (document.querySelector(".map-layers-selector-popup")) {
        document.querySelector(".map-layers-selector-popup").remove()
        return
    }
    const options = [
        {
            label: "ESRI",
            value: "https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}?blankTile=false",
            about: "https://osm.wiki/Esri",
        },
        {
            label: "ESRI beta (slow layer)",
            value: "https://clarity.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}?blankTile=false",
            about: "https://osm.wiki/Esri",
        },
        {
            label: "ESRI Wayback 2014",
            value: "https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/WMTS/1.0.0/default028mm/MapServer/tile/10/{z}/{y}/{x}?blankTile=false",
            about: "https://osm.wiki/Esri",
        },
        {
            label: "OpenAerialMap Mosaic, by Kontur.io",
            value: "https://apps.kontur.io/raster-tiler/oam/mosaic/{z}/{x}/{y}.png",
            about: "https://www.kontur.io/solutions/global-orthomosaic-layer/",
        },
        // {
        //     label: "GeoScribbles",
        //     value: "https://geoscribble.osmz.ru/wms?FORMAT=image/png&TRANSPARENT=TRUE&VERSION=1.1.1&SERVICE=WMS&REQUEST=GetMap&LAYERS=scribbles&STYLES=&SRS=EPSG:3857&WIDTH=512&HEIGHT=512&BBOX={bbox-epsg-3857}",
        //     about: "https://osm.wiki/GeoScribble",
        //     forceVector: true,
        // },
        {
            label: "OpenRailwayMap",
            value: "https://tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png",
            about: "https://www.openrailwaymap.org",
            forceVector: true,
        },
        // {
        //     label: "F4map",
        //     value: "https://tile.f4map.com/tiles/f4_3d/{z}/{x}/{y}.png",
        //     about: "https://demo.f4map.com",
        // },
        {
            label: "Hrvatska GeoPortal",
            value: "https://geoportal.dgu.hr/services/inspire/orthophoto_2021_2022/ows?FORMAT=image/png&TRANSPARENT=TRUE&VERSION=1.3.0&SERVICE=WMS&REQUEST=GetMap&LAYERS=OI.OrthoimageCoverage&STYLES=&CRS=EPSG:3857&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}",
            about: "https://osm.wiki/GeoScribble",
        },
        // {
        //     label: "OsmAnd HD tiles",
        //     value: "https://tile.osmand.net/hd/{z}/{x}/{y}.png",
        //     about: "https://osmand.net/map",
        // },
    ]
    const popup = document.createElement("div")
    popup.classList.add("map-layers-selector-popup")
    const radioContainer = document.createElement("div")

    injectCSSIntoOSMPage(`
    .map-layers-selector-popup {
        position: relative;
        width: fit-content;
        background: var(--bs-body-bg);
        border: 1px solid rgba(204,204,204,0.5);
        padding: 12px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,.2);
        font-family: sans-serif;
        z-index: 9999;
    }
    .map-layers-selector-popup label:hover {
        background: light-dark("gray", "gray");
    }
`)

    const h = document.createElement("h3")
    h.style.display = "flex"
    h.style.gap = "25px"
    h.style.marginLeft = "auto"
    h.textContent = "Setup custom map layers"
    popup.appendChild(h)

    const closeBtn = document.createElement("button")
    closeBtn.classList.add("better-btn-close")
    closeBtn.style.all = "unset"
    closeBtn.style.cursor = "pointer"
    closeBtn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">' +
        '  <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>' +
        "</svg>"
    closeBtn.querySelector("svg").style.height = "1.5rem"
    closeBtn.onclick = () => popup.remove()
    h.append(closeBtn)

    popup.appendChild(radioContainer)

    const radiosName = `map-layer-url`

    function makeWrapper() {
        const wrapper = document.createElement("label")
        wrapper.style.display = "flex"
        wrapper.style.paddingTop = "2px"
        wrapper.style.paddingBottom = "2px"
        wrapper.style.margin = "2px"
        wrapper.style.gap = "4px"
        return wrapper
    }

    function addRadio({ label, value, about, forceVector }) {
        const wrapper = makeWrapper()

        const input = document.createElement("input")
        input.type = "radio"
        input.name = radiosName
        wrapper.title = input.value = value

        async function onChange() {
            if (input.checked) {
                if (forceVector && !vectorLayerEnabled()) {
                    nextVectorLayer()
                    await sleep(100)
                }
                applyCustomLayer(input.value)
                switchTiles(currentTilesMode === MAPNIK_MODE)
                getMap()?.attributionControl?.setPrefix(label)
            }
        }
        input.addEventListener("change", onChange)
        input.addEventListener("click", onChange)

        const externalLink = document.createElement("a")
        externalLink.title = "Open map layer home page"
        externalLink.setAttribute("href", about)
        externalLink.innerHTML = externalLinkSvg
        externalLink.style.marginLeft = "auto"
        externalLink.style.marginRight = "2px"
        externalLink.style.color = "gray"
        externalLink.tabIndex = -1

        const labelSpan = document.createElement("span")
        labelSpan.textContent = label
        wrapper.append(input, labelSpan, externalLink)
        radioContainer.appendChild(wrapper)
    }

    options.forEach(addRadio)
    {
        const wrapper = makeWrapper()

        const input = document.createElement("input")
        input.type = "radio"
        input.name = radiosName
        input.value = ""

        wrapper.append(input)
        const urlInput = document.createElement("input")
        urlInput.type = "text"
        urlInput.placeholder = "example: https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        urlInput.style.width = "100%"
        if (lastCustomLayerUrl) {
            urlInput.value = lastCustomLayerUrl
        }
        wrapper.append(urlInput)

        input.onchange = async e => {
            if (!e.isTrusted) return
            if (input.checked && urlInput.value.trim() !== "") {
                applyCustomLayer(urlInput.value, true)
                switchTiles(currentTilesMode === MAPNIK_MODE)
            }
        }

        urlInput.onkeydown = async e => {
            if (!e.isTrusted) return
            if (e.key === "Enter" && urlInput.value.trim() !== "") {
                input.click()
                applyCustomLayer(urlInput.value, true)
                switchTiles(currentTilesMode === MAPNIK_MODE)
                getMap()?.attributionControl?.setPrefix("Custom map style from " + escapeHtml(new URL(urlInput.value).host))
            }
        }

        radioContainer.appendChild(wrapper)
    }

    const note = document.createElement("span")
    note.style.color = "gray"
    note.innerHTML =
        "You can <a target='_blank' href='https://github.com/deevroman/better-osm-org/issues/new'>suggest</a> other layer. " + "One of <a href='https://github.com/osmlab/editor-layer-index'>layers collection</a>"
    popup.appendChild(note)
    document.body.appendChild(popup)
    popup.querySelector('label:has([href^="https://osm.wiki/Esri"])')?.querySelector("input")?.focus()
}

function vectorSwitch() {
    if (!vectorLayerEnabled()) {
        return
    }
    const vectorMap = findVectorMap()
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
    function removeLayer() {
        try {
            vectorMap.removeLayer("satellite-layer")
            vectorMap.removeSource("satellite")
        } catch (e) {}
    }
    if (currentTilesMode === SAT_MODE) {
        try {
            removeLayer()
            addLayer()
        } catch (e) {
            console.error(e)
            // dirty hack for wait styles downloading
            setTimeout(addLayer, 1000)
        }
    } else {
        removeLayer()
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
                if (customLayerUrl.includes(ESRIPrefix) && updateShotEsriDateNeeded()) {
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
    imgElem.setAttribute("custom-tile-url", newUrl)
    if (!needBypassSatellite && !customLayerUrlIsWms) {
        imgElem.src = newUrl
    } else {
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

function addXyzToTile(imgElem) {
    const xyz = parseOSMTileURL(imgElem.src)
    if (!xyz) {
        return
    }
    imgElem.setAttribute("x", xyz.x)
    imgElem.setAttribute("y", xyz.y)
    imgElem.setAttribute("z", xyz.z)
}

function replaceTileSrc(imgElem) {
    if (!imgElem.hasAttribute("x")) {
        addXyzToTile(imgElem)
    }
    const xyz = xyzFromTileElem(imgElem)
    if (!xyz) {
        return
    }
    if (currentTilesMode === SAT_MODE) {
        replaceToSatTile(imgElem, xyz)
    } else {
        replaceToBaseTile(imgElem, xyz)
    }
}

function rasterSwitch() {
    if (currentTilesMode === SAT_MODE) {
        if (!customLayerUrl) {
            applyCustomLayer(ESRITemplate)
            addEsriPrefix()
        }
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
}

function switchTiles(invertMode = true) {
    if (tilesObserver) {
        tilesObserver?.disconnect()
    }
    addEsriShotDateCollector()
    if (invertMode) {
        currentTilesMode = invertTilesMode(currentTilesMode)
        console.log("Current tiles mode", currentTilesMode)
    }
    rasterSwitch()
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
            bypassCSPForImagesSrc(i, newUrl)
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
                    bypassCSPForImagesSrc(node, newURL)
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
    btnOnNotePage.oncontextmenu = async e => {
        e.preventDefault()
        enableOverzoom()
        await askCustomTileUrl()
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
    btnOnPane.title = "Switch between map and satellite images (S key)\nPress Shift+S or click with Shift for set custom imagery\nOn mobile use long tap"
    btnOnPane.onclick = async e => {
        e.stopImmediatePropagation()
        enableOverzoom()
        if (e.shiftKey) {
            await askCustomTileUrl()
            return
        }
        switchTilesAndButtons()
    }
    btnOnPane.oncontextmenu = async e => {
        e.preventDefault()
        e.stopImmediatePropagation()
        enableOverzoom()
        await askCustomTileUrl()
    }
    return btnOnPane
}

function createCustomLayerBtn() {
    const btn = document.createElement("span")
    btn.classList.add("set-custom-layer-btn")
    btn.textContent = " ⚙️"
    btn.style.cursor = "pointer"
    btn.title = "Set custom layer (Shift + S)\nbetter-osm-org feature"
    btn.onclick = async () => {
        enableOverzoom()
        await askCustomTileUrl()
    }
    return btn
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
    const h2 = document.querySelector(".layers-ui h2")
    if (h2 && !document.querySelector(".set-custom-layer-btn")) {
        h2.appendChild(createCustomLayerBtn())
    }
    const omtBtn = layers.at(-1)
    if (omtBtn) {
        const btnOnPane = document.createElement("span")
        btnOnPane.style.cursor = "pointer"
        btnOnPane.textContent = "🎨"
        btnOnPane.title = "Set custom vector style (Shift + V)"
        btnOnPane.onmouseover = async () => {
            await mapStylesDatabase.init()
        }
        btnOnPane.onclick = async e => {
            await askCustomStyleUrl()
        }
        btnOnPane.oncontextmenu = async e => {
            e.preventDefault()
            await askCustomStyleUrl()
        }
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
    if (document.getElementById("map")) {
        tryApplyModule(addSatelliteLayers, 100, 3000)
    }
}

//</editor-fold>
