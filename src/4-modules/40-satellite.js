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

async function bypassChromeCSPForImagesSrc(imgElem, url, isStrava = true) {
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
    }
}

let blankSuffix = ""

function switchESRIbeta() {
    const NewSatellitePrefix = SatellitePrefix === ESRIPrefix ? ESRIBetaPrefix : ESRIPrefix
    document.querySelectorAll(".leaflet-tile").forEach(i => {
        if (i.nodeName !== "IMG") {
            return
        }
        const xyz = parseESRITileURL(!needBypassSatellite ? i.src : i.getAttribute("real-url") ?? "")
        if (!xyz) return
        const newUrl = NewSatellitePrefix + xyz.z + "/" + xyz.y + "/" + xyz.x + blankSuffix
        if (!needBypassSatellite) {
            i.src = newUrl
        } else {
            bypassChromeCSPForImagesSrc(i, newUrl)
        }
    })
    SatellitePrefix = NewSatellitePrefix
    if (SatellitePrefix === ESRIBetaPrefix) {
        getMap()?.attributionControl?.setPrefix("ESRI Beta")
    } else {
        getMap()?.attributionControl?.setPrefix("ESRI")
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
            tileURL = e.currentTarget.getAttribute("real-url").match(/(tile|org)\/([0-9]+)/)
            console.log(e.currentTarget.getAttribute("real-url"))
        }
        const zoomStr = tileURL[2]
        if (zoomStr) {
            const tileZoom = parseInt(zoomStr)
            console.log(tileZoom)
            setZoom(Math.min(19, Math.min(getZoom(), tileZoom - 1)))
        }
    }
}

function makeSatelliteURL(x, y, z) {
    return SatellitePrefix + z + "/" + y + "/" + x + blankSuffix
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

function switchTiles() {
    if (tilesObserver) {
        tilesObserver?.disconnect()
    }
    currentTilesMode = invertTilesMode(currentTilesMode)
    if (currentTilesMode === SAT_MODE) {
        if (SatellitePrefix === ESRIBetaPrefix) {
            getMap()?.attributionControl?.setPrefix("ESRI Beta")
        } else {
            getMap()?.attributionControl?.setPrefix("ESRI")
        }
    } else {
        getMap()?.attributionControl?.setPrefix("")
    }
    document.querySelectorAll(".leaflet-tile").forEach(i => {
        if (i.nodeName !== "IMG") {
            return
        }
        if (currentTilesMode === SAT_MODE) {
            const xyz = parseOSMTileURL(i.src)
            if (!xyz) return
            // unsafeWindow.L.DomEvent.off(i, "error") // todo добавить перехватчик 404
            try {
                i.onerror = tileErrorHandler
            } catch {
                /* empty */
            }
            const newUrl = makeSatelliteURL(xyz.x, xyz.y, xyz.z)
            if (!needBypassSatellite) {
                i.src = newUrl
            } else {
                i.setAttribute("real-url", newUrl)
            }
            if (needBypassSatellite) {
                bypassChromeCSPForImagesSrc(i, newUrl)
            }
            if (i.complete && !needBypassSatellite) {
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
            const xyz = parseESRITileURL(!needBypassSatellite ? i.src : i.getAttribute("real-url") ?? "")
            if (!xyz) return
            i.src = makeBaseLayerURL(xyz.x, xyz.y, xyz.z)
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
                if (currentTilesMode === SAT_MODE) {
                    const xyz = parseOSMTileURL(node.src)
                    if (!xyz) return
                    // unsafeWindow.L.DomEvent.off(node, "error")
                    try {
                        node.onerror = tileErrorHandler
                    } catch {
                        /* empty */
                    }
                    const newURL = makeSatelliteURL(xyz.x, xyz.y, xyz.z)
                    if (!needBypassSatellite) {
                        node.src = newURL
                    } else {
                        node.src = "/dev/null"
                    }
                    node.setAttribute("real-url", newURL)
                    if (needBypassSatellite) {
                        bypassChromeCSPForImagesSrc(node, newURL)
                    }
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
                    const xyz = parseESRITileURL(!needBypassSatellite ? node.src : node.getAttribute("real-url"))
                    if (!xyz) return
                    node.src = makeBaseLayerURL(xyz.x, xyz.y, xyz.z)
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
    tilesObserver = observer
    observer.observe(document.body, { childList: true, subtree: true })
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
            i.setAttribute("real-url", newUrl)
            bypassChromeCSPForImagesSrc(i, newUrl, true)
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
            const xyz = parseStravaTileURL(i.getAttribute("real-url") ?? "")
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
                    node.setAttribute("real-url", newURL)
                    bypassChromeCSPForImagesSrc(node, newURL, true)
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
                    const xyz = parseStravaTileURL(node.getAttribute("real-url"))
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
    switchTiles()
    if (document.querySelector(".turn-on-satellite")) {
        document.querySelector(".turn-on-satellite").textContent = invertTilesMode(currentTilesMode)
    }
    if (document.querySelector(".turn-on-satellite-from-pane")) {
        document.querySelector(".turn-on-satellite-from-pane").textContent = invertTilesMode(currentTilesMode)
    }
}

function addSatelliteLayers() {
    const btnOnPane = document.createElement("span")
    const btnOnNotePage = document.createElement("span")
    if (!document.querySelector(".turn-on-satellite-from-pane")) {
        const mapnikBtn = document.querySelector(".layers-ui label span")
        if (mapnikBtn) {
            if (!tilesObserver) {
                btnOnPane.textContent = "🛰"
            } else {
                btnOnPane.textContent = invertTilesMode(currentTilesMode)
            }
            btnOnPane.style.cursor = "pointer"
            btnOnPane.classList.add("turn-on-satellite-from-pane")
            btnOnPane.title = "Switch between map and satellite images (S key)\nPress (Shift+S) for ESRI beta"
            mapnikBtn.appendChild(document.createTextNode("\xA0"))
            mapnikBtn.appendChild(btnOnPane)

            btnOnPane.onclick = e => {
                e.stopImmediatePropagation()
                enableOverzoom()
                if (e.shiftKey) {
                    switchESRIbeta()
                    return
                }
                switchTiles()
                btnOnNotePage.textContent = invertTilesMode(currentTilesMode)
                btnOnPane.textContent = invertTilesMode(currentTilesMode)
            }
        }
    }
    if (!location.pathname.includes("/note")) return
    if (document.querySelector(".turn-on-satellite")) return true
    if (!document.querySelector("#sidebar_content h4")) {
        return
    }
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
        switchTiles()
        btnOnNotePage.textContent = invertTilesMode(currentTilesMode)
        btnOnPane.textContent = invertTilesMode(currentTilesMode)
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
