//<editor-fold desc="map-utils" defaultstate="collapsed">

function getMapCenter() {
    try {
        return getMap().getCenter()
    } catch {
        console.warn("Couldn't get the map center through the map object. Trying a workaround")

        const curURL = document.querySelector("#edit_tab ul")?.querySelector("li a")?.href
        const match = curURL.match(/map=(\d+)\/([-\d.]+)\/([-\d.]+)(&|$)/)
        console.log("Parsed coordinates link:", match)
        return { lng: match[3], lat: match[2] }
    }
}

async function getMapBounds() {
    try {
        return getMap().getBounds()
    } catch {
        console.warn("Couldn't get the map bound through the map object. Trying a workaround")

        document.querySelector("#sidebar").style.display = "none"
        document.querySelector("#sidebar").style.width = "0px"
        try {
            document.querySelector('nav a[href="/export"]').click()
            for (let i = 0; i < 10; i++) {
                await sleep(500)
                if (document.querySelector("#minlat")) {
                    break
                }
            }
            const res = {
                getNorthWest: () => ({
                    lat: document.querySelector("#maxlat").value,
                    lng: document.querySelector("#minlon").value,
                }),
                getSouthEast: () => ({
                    lat: document.querySelector("#minlat").value,
                    lng: document.querySelector("#maxlon").value,
                }),
            }
            console.log(res.getNorthWest())
            console.log(res.getSouthEast())
            // console.log(getMap().getBounds().getNorthWest())
            document.querySelectorAll("#sidebar .sidebar-close-controls .btn-close").forEach(i => i?.click())

            return res
        } finally {
            document.querySelector("#sidebar").style.display = ""
            document.querySelector("#sidebar").style.width = ""
        }
    }
}

function getCurrentXYZ() {
    try {
        const [, z, x, y] = new URL(document.querySelector("#editanchor").href).hash.match(/map=([0-9]+)\/([0-9.-]+)\/([0-9.-]+)/)
        return [x, y, z]
    } catch (e) {
        // for iD
        const [, z, x, y] = location.hash.match(/map=([0-9.]+)\/([0-9.-]+)\/([0-9.-]+)/)
        return [x, y, z]
    }
}

/**
 * @name getZoom
 * @return {number}
 */
function getZoom() {
    try {
        return getMap().getZoom()
    } catch {
        console.warn("Couldn't get the map zoom through the map object. Trying a workaround")

        const curURL = document.querySelector("#edit_tab ul")?.querySelector("li a")?.href
        const match = curURL.match(/map=(\d+)\/([-\d.]+)\/([-\d.]+)(&|$)/)
        console.log("Parsed coordinates link:", match)
        return parseFloat(match[1])
    }
}

/**
 * @name setZoom
 * @param {number} zoomLevel
 */
function setZoom(zoomLevel) {
    try {
        getMap().setZoom(zoomLevel)
    } catch {
        console.warn("Couldn't set the map zoom through the map object. Trying a workaround")

        const curURL = document.querySelector("#edit_tab ul")?.querySelector("li a")?.href
        const match = curURL.match(/map=(\d+)\/([-\d.]+)\/([-\d.]+)(&|$)/)
        if (match) {
            location.hash = location.hash.replace(/map=(\d+)\//, `map=${zoomLevel}/`)
        } else {
            const [x, y] = getCurrentXYZ()
            location.hash = `map=${zoomLevel}/${x}/${y}`
        }
    }
}

function resetMapHover() {
    document.querySelectorAll(".map-hover").forEach(el => {
        el.classList.remove("map-hover")
    })
}

function resetSelectedChangesets() {
    document.querySelectorAll(".selected").forEach(el => {
        el.classList.remove("selected")
    })
}

/**
 * @type {{
 *  customObjects: (import('leaflet').Path)[],
 *  activeObjects: (import('leaflet').Path)[],
 *  changesetBounds: (import('leaflet').Path)[]
 * }}
 */
const layers = {
    customObjects: [],
    activeObjects: [],
    changesetBounds: [],
}

function cleanAllObjects() {
    for (let member in layers) {
        layers[member].forEach(i => {
            i.remove()
        })
        layers[member] = []
    }
}

/**
 * @name cleanObjectsByKey
 * @param {string} key
 */
function cleanObjectsByKey(key) {
    if (layers[key]) {
        layers[key]?.forEach(i => i.remove())
        layers[key] = []
    }
}

/**
 * @name cleanCustomObjects
 */
function cleanCustomObjects() {
    layers["customObjects"].forEach(i => i.remove())
    layers["customObjects"] = []
}

/**
 * @name showWay
 * @param {[]} nodesList
 * @param {string=} color
 * @param {boolean} needFly
 * @param {boolean} addStroke
 */
function showWay(nodesList, color = "#000000", needFly = false, addStroke = false) {
    cleanCustomObjects()
    const line = getWindow()
        .L.polyline(
            intoPage(nodesList.map(elem => getWindow().L.latLng(intoPage(elem)))),
            intoPage({
                color: color,
                weight: 4,
                clickable: false,
                opacity: 1,
                fillOpacity: 1,
            }),
        )
        .addTo(getMap())
    if (addStroke) {
        line._path.classList.add("stroke-polyline")
    }
    layers["customObjects"].push(line)
    if (needFly) {
        if (nodesList.length) {
            fitBounds(get4Bounds(line))
        }
    }
}

/**
 * @name showWays
 * @param {[][]} ListOfNodesList
 * @param {string=} layerName
 * @param {string=} color
 */
function showWays(ListOfNodesList, layerName = "customObjects", color = "#000000") {
    cleanObjectsByKey(layerName)
    ListOfNodesList.forEach(nodesList => {
        const line = getWindow()
            .L.polyline(
                intoPage(nodesList.map(elem => getWindow().L.latLng(intoPage(elem)))),
                intoPage({
                    color: color,
                    weight: 4,
                    clickable: false,
                    opacity: 1,
                    fillOpacity: 1,
                }),
            )
            .addTo(getMap())
        layers[layerName].push(line)
    })
}

/**
 * @name displayWay
 * @param {any[]} nodesList
 * @param {boolean=} needFly
 * @param {string=} color
 * @param {number=} width
 * @param {string|null=} infoElemID
 * @param {string=} layerName
 * @param {string|null=} dashArray
 * @param {string|null=} popupContent
 * @param {boolean|null=} addStroke
 * @param {boolean=} geometryCached
 */
function displayWay(nodesList, needFly = false, color = "#000000", width = 4, infoElemID = null, layerName = "customObjects", dashArray = null, popupContent = null, addStroke = null, geometryCached = false) {
    if (!layers[layerName]) {
        layers[layerName] = []
    }

    function bindPopup(line, popup) {
        if (popup) return line.bindPopup(popup)
        return line
    }

    const line = bindPopup(
        getWindow().L.polyline(
            geometryCached ? nodesList : intoPage(nodesList),
            intoPage({
                color: color,
                weight: width,
                clickable: false,
                opacity: 1,
                fillOpacity: 1,
                dashArray: dashArray,
            }),
        ),
        popupContent,
    ).addTo(getMap())
    layers[layerName].push(line)
    if (needFly) {
        getMap().flyTo(
            intoPage(line.getBounds().getCenter()),
            18,
            intoPage({
                animate: false,
                duration: 0.5,
            }),
        )
    }
    if (infoElemID) {
        layers[layerName][layers[layerName].length - 1].on(
            "click",
            cloneInto(
                function () {
                    const elementById = document.getElementById(infoElemID)
                    elementById?.scrollIntoView()
                    resetMapHover()
                    elementById?.parentElement?.parentElement?.classList.add("map-hover")
                    cleanObjectsByKey("activeObjects")
                },
                getWindow(),
                { cloneFunctions: true },
            ),
        )
    }
    if (addStroke) {
        line._path.classList.add("stroke-polyline")
    }
    return line
}

/**
 * @name showNodeMarker
 * @param {string|number} a
 * @param {string|number} b
 * @param {string=} color
 * @param {string|null=} infoElemID
 * @param {string=} layerName
 * @param {number=} radius
 */
function showNodeMarker(a, b, color = "#00a500", infoElemID = null, layerName = "customObjects", radius = 5) {
    const haloStyle = {
        weight: 2.5,
        radius: radius,
        fillOpacity: 0,
        color: color,
    }
    const marker = getWindow().L.circleMarker(getWindow().L.latLng(a, b), intoPage(haloStyle)).addTo(getMap())
    layers[layerName].push(marker)
    if (infoElemID) {
        marker.on(
            "click",
            cloneInto(
                function () {
                    const elementById = document.getElementById(infoElemID)
                    elementById?.scrollIntoView()
                    resetMapHover()
                    elementById?.parentElement?.parentElement.classList?.add("map-hover")
                },
                getWindow(),
                { cloneFunctions: true },
            ),
        )
    }
    return marker
}

/**
 * @name showActiveNodeMarker
 * @param {string} lat
 * @param {string} lon
 * @param {string} color
 * @param {boolean=} removeActiveObjects
 * @param {number} radius
 * @param {number=} weight
 */
function showActiveNodeMarker(lat, lon, color, removeActiveObjects = true, radius = 5, weight = 2.5) {
    const haloStyle = {
        weight: weight,
        radius: radius,
        fillOpacity: 0,
        color: color,
    }
    if (removeActiveObjects) {
        cleanObjectsByKey("activeObjects")
    }
    layers["activeObjects"].push(getWindow().L.circleMarker(getWindow().L.latLng(lat, lon), intoPage(haloStyle)).addTo(getMap()))
}

/**
 * @name showActiveNodeIconMarker
 * @param {string} lat
 * @param {string} lon
 * @param {string|null=} color
 * @param {boolean=} removeActiveObjects
 */
function showActiveNodeIconMarker(lat, lon, color = null, removeActiveObjects = true) {
    if (removeActiveObjects) {
        cleanObjectsByKey("activeObjects")
    }
    const marker = getWindow().L.marker(intoPage([lat, lon]), intoPage({ draggable: false, icon: getWindow().OSM.getMarker({ color: color ?? "var(--marker-blue)" }) }))
    layers["activeObjects"].push(marker.addTo(getMap()))
}

/**
 * @name showActiveWay
 * @param {any[]} nodesList
 * @param {string=} color
 * @param {boolean=} needFly
 * @param {string|null=} infoElemID
 * @param {boolean=} removeActiveObjects
 * @param {number=} weight
 * @param {string=} dashArray
 */
function showActiveWay(nodesList, color = c("#ff00e3"), needFly = false, infoElemID = null, removeActiveObjects = true, weight = 4, dashArray = null) {
    const line = getWindow()
        .L.polyline(
            intoPage(nodesList.map(elem => intoPage(getWindow().L.latLng(intoPage(elem))))),
            intoPage({
                color: color,
                weight: weight,
                clickable: false,
                opacity: 1,
                fillOpacity: 1,
                dashArray: dashArray,
            }),
        )
        .addTo(getMap())
    if (removeActiveObjects) {
        cleanObjectsByKey("activeObjects")
    }
    layers["activeObjects"].push(line)
    if (needFly) {
        fitBounds(get4Bounds(line))
    }
    if (infoElemID) {
        layers["activeObjects"][layers["activeObjects"].length - 1].on(
            "click",
            cloneInto(
                function () {
                    const elementById = document.getElementById(infoElemID)
                    elementById?.scrollIntoView()
                    resetMapHover()
                    elementById.classList.add("map-hover")
                },
                getWindow(),
                { cloneFunctions: true },
            ),
        )
    }
}

/**
 * @name panTo
 * @param {string} lat
 * @param {string} lon
 * @param {number=} zoom
 * @param {boolean=} animate
 */
function panTo(lat, lon, zoom = 18, animate = false) {
    if (!getMap()?.flyTo) {
        // todo initial implementation
        const maxZoom = 19
        console.log("try workaround. TODO")
        const curURL = document.querySelector("#edit_tab ul")?.querySelector("li a")?.href
        const match = curURL.match(/map=(\d+)\/([-\d.]+)\/([-\d.]+)(&|$)/)
        if (match) {
            const zoomLevel = parseInt(match[1])
            let newHash = location.hash.replace(/map=(\d+)\//, `map=${min(zoomLevel + 1, maxZoom)}/`)
            newHash = newHash.replace(/map=(\d+)\/(\d+)\/(\d+)/, `map=$1/${lat}/${lon}`)
            location.hash = newHash
        } else {
            const [x, y, z] = getCurrentXYZ()
            location.hash = `map=${min(parseInt(z) + 1, maxZoom)}/${x}/${y}`
        }
    } else {
        getMap().flyTo(intoPage([lat, lon]), zoom, intoPage({ animate: animate }))
    }
}

/**
 * @name panInside
 * @param {string} lat
 * @param {string} lon
 * @param {boolean=} animate
 * @param {[number, number]=} padding
 */
function panInside(lat, lon, animate = false, padding = [0, 0]) {
    getMap().panInside(intoPage([lat, lon]), intoPage({ animate: animate, padding: padding }))
}

function get4Bounds(b) {
    try {
        return [
            [b.getBounds().getSouth(), b.getBounds().getWest()],
            [b.getBounds().getNorth(), b.getBounds().getEast()],
        ]
    } catch {
        console.error("Please, reload page")
    }
}

/**
 * @name fitBounds
 * @param {import('leaflet').LatLngBoundsExpression} bound
 * @param {number} maxZoom
 */
function fitBounds(bound, maxZoom = 19) {
    fitBoundsWithPadding(bound, 0, maxZoom)
}

/**
 * @name fitBoundsWithPadding
 * @param {import('leaflet').LatLngBoundsExpression} bound
 * @param {number} padding
 * @param {number} maxZoom
 */
function fitBoundsWithPadding(bound, padding, maxZoom = 19) {
    if (!getMap()?.fitBounds) {
        // todo initial implementation
        console.log("try workaround. TODO")
        const curURL = document.querySelector("#edit_tab ul")?.querySelector("li a")?.href
        const match = curURL.match(/map=(\d+)\/([-\d.]+)\/([-\d.]+)(&|$)/)
        if (match) {
            const [lat, lon] = bound[0]
            const zoomLevel = parseInt(match[1])
            let newHash = location.hash.replace(/map=(\d+)\//, `map=${min(zoomLevel + 1, maxZoom)}/`)
            newHash = newHash.replace(/map=(\d+)\/(\d+)\/(\d+)/, `map=$1/${lat}/${lon}`)
            location.hash = newHash
        } else {
            const [x, y, z] = getCurrentXYZ()
            location.hash = `map=${min(parseInt(z) + 1, maxZoom)}/${x}/${y}`
        }
    } else {
        getMap().fitBounds(intoPageWithFun(bound), intoPage({ padding: [padding, padding], maxZoom: maxZoom }))
    }
}

const earthRadius = 6378137

function drawRay(lat, lon, angle, color) {
    const rad = (angle * Math.PI) / 180
    const length = 7
    const latOffset = (length * Math.cos(rad)) / earthRadius
    const lonOffset = (length * Math.sin(rad)) / (earthRadius * Math.cos((lat * Math.PI) / 180))
    showActiveWay(
        [
            [lat, lon],
            [lat + (latOffset * 180) / Math.PI, lon + (lonOffset * 180) / Math.PI],
        ],
        color,
        false,
        null,
        false,
    )
}

//</editor-fold>
