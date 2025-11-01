//<editor-fold desc="measurer" defaultstate="collapsed">

let measurerAdded = false
let measuring = false

function makeEmptyMeasuring() {
    return {
        way: [],
        nodes: [],
        wayLine: null,
        tempLine: null,
    }
}

let currentMeasuring = makeEmptyMeasuring()

let lastLatLng = null
let movingTooltip = null

function getMeasureDistance(way, floatingCoord) {
    const [res] = way.reduce(
        ([dist, prev], cur) => {
            if (prev === null) {
                return [0.0, cur]
            }
            // prettier-ignore
            return [dist + getDistanceFromLatLonInKm(
                prev.lat,
                prev.lng,
                cur.lat,
                cur.lng
            ), cur]
        },
        [0.0, null],
    )
    // prettier-ignore
    return (Math.round((res + getDistanceFromLatLonInKm(
        way[way.length - 1].lat,
        way[way.length - 1].lng,
        floatingCoord.lat,
        floatingCoord.lng
    )) * 100000) / 100.0)
}

function formatMeasureDistance(distInMeters) {
    return distInMeters < 2500 ? distInMeters.toString() + "m" : (Math.round(distInMeters) / 1000).toString() + "km"
}

let measuringMouseDownHandler = null
let measuringMouseUpHandler = null
let measuringMouseMoveHandler = null
let measuringMenuItem = null

function endMeasuring() {
    document.querySelector("#map").style.cursor = "drag"
    measuringMenuItem.querySelector("a").textContent = "Measure from here"
    measuring = false

    getMap().off("mousedown", measuringMouseDownHandler)
    getMap().off("mouseup", measuringMouseUpHandler)
    getMap().off("mousemove", measuringMouseMoveHandler)
    movingTooltip?.remove()
    const lastNode = currentMeasuring.nodes[currentMeasuring.nodes.length - 1]
    const distInMeters = getMeasureDistance(currentMeasuring.way, lastNode.getLatLng())
    const text = formatMeasureDistance(distInMeters)
    currentMeasuring.nodes[currentMeasuring.nodes.length - 1]
        .bindTooltip(
            text,
            intoPage({
                content: text,
                sticky: true,
                permanent: true,
                offset: getWindow().L.point(10, 0),
            }),
        )
        .openTooltip()
    currentMeasuring.tempLine?.remove()
    currentMeasuring = makeEmptyMeasuring()
}

function addMenuSeparator(menu) {
    let customSeparator = menu.querySelector(".custom-separator")
    if (!customSeparator) {
        customSeparator = document.createElement("li")
        customSeparator.classList.add("custom-separator")
        const separatorHr = document.createElement("hr")
        separatorHr.classList.add("dropdown-divider")
        customSeparator.appendChild(separatorHr)
        menu.querySelector("ul").appendChild(customSeparator)
    }
    return customSeparator
}

function addMeasureMenuItem(customSeparator) {
    measuringMenuItem = document.querySelector(".measurer-li")
    if (measuringMenuItem) {
        return
    }
    measuringMenuItem = document.createElement("li")
    measuringMenuItem.classList.add("measurer-li")
    const a = document.createElement("a")
    a.classList.add("dropdown-item", "d-flex", "align-items-center", "gap-3")
    a.textContent = "Measure from here"

    const i = document.createElement("i")
    i.classList.add("bi", "bi-rulers")
    a.prepend(i)

    a.onclick = async function startMeasuring(e) {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
        if (measuring) {
            endMeasuring()
            return
        }
        currentMeasuring = makeEmptyMeasuring()
        const initLat = getMap().osm_contextmenu._$element.data("lat")
        const initLng = getMap().osm_contextmenu._$element.data("lng")
        currentMeasuring.way.push({ lat: initLat, lng: initLng })
        currentMeasuring.nodes.push(showNodeMarker(initLat, initLng, "#000000"))
        if (currentMeasuring.way.length > 1) {
            currentMeasuring.wayLine?.remove()
            currentMeasuring.wayLine = displayWay(currentMeasuring.way)
        } else {
            document.querySelector("#map").style.cursor = "pointer"
            measuring = true
            measuringMenuItem.querySelector("a").textContent = "End measure"

            getMap().on("mousedown", measuringMouseDownHandler)
            getMap().on("mouseup", measuringMouseUpHandler)
            getMap().on("mousemove", measuringMouseMoveHandler)
        }
        getMap().osm_contextmenu.hide()
    }

    measuringMenuItem.appendChild(a)
    customSeparator.after(measuringMenuItem)
    measurerAdded = true
}

function makeMeasureMouseHandlers() {
    // sometime click don't fire when move 1px
    let lastMouseDownX = 0
    let lastMouseDownY = 0
    measuringMouseDownHandler = intoPageWithFun(e => {
        lastMouseDownX = e.originalEvent.clientX
        lastMouseDownY = e.originalEvent.clientY
    })
    measuringMouseUpHandler = intoPageWithFun(e => {
        if (!measuring) {
            return
        }
        if (e.originalEvent.button === 2) {
            return
        }
        if (e.originalEvent.altKey) {
            currentMeasuring = makeEmptyMeasuring()
        }

        const { lat: lat, lng: lng } = e.latlng
        // prettier-ignore
        if (lastMouseDownX - e.originalEvent.clientX > 1 || lastMouseDownY - e.originalEvent.clientY > 1 ||
            lastMouseDownX - e.originalEvent.clientX < -1 || lastMouseDownY - e.originalEvent.clientY < -1) {
            console.log("skipped click");
            console.log(lastMouseDownX - e.originalEvent.clientX);
            console.log(lastMouseDownY - e.originalEvent.clientY);
            return
        }
        currentMeasuring.way.push({ lat: lat, lng: lng })
        currentMeasuring.nodes.push(showNodeMarker(lat, lng, "#000000"))
        currentMeasuring.wayLine?.remove()

        const distInMeters = getMeasureDistance(currentMeasuring.way, { lat: lat, lng: lng })
        const text = formatMeasureDistance(distInMeters)
        currentMeasuring.wayLine = displayWay(currentMeasuring.way, false, "#000000", 1)
        movingTooltip?.remove()
        movingTooltip = getWindow()
            .L.tooltip(
                getWindow().L.latLng(intoPage({ lat: lat, lng: lng })),
                intoPage({
                    content: text,
                    sticky: true,
                    offset: getWindow().L.point(10, 0),
                }),
            )
            .addTo(getMap())
        currentMeasuring.wayLine
            .bindTooltip(
                text,
                intoPage({
                    content: text,
                    sticky: true,
                    offset: getWindow().L.point(10, 0),
                }),
            )
            .openTooltip()
    })
    measuringMouseMoveHandler = intoPageWithFun(e => {
        if (!measuring) {
            return
        }

        lastLatLng = e.latlng
        const { lat: lat, lng: lng } = e.latlng

        currentMeasuring.tempLine?.remove()
        if (!currentMeasuring.way.length) return
        const distInMeters = getMeasureDistance(currentMeasuring.way, { lat: lat, lng: lng })
        const text = formatMeasureDistance(distInMeters)
        if (!e.originalEvent.altKey) {
            cleanObjectsByKey("activeObjects")
            currentMeasuring.tempLine = displayWay(
                [
                    currentMeasuring.way[currentMeasuring.way.length - 1],
                    {
                        lat: lat,
                        lng: lng,
                    },
                ],
                false,
                "#000000",
                1,
            )
            movingTooltip?.remove()
            movingTooltip = getWindow()
                .L.tooltip(
                    getWindow().L.latLng(intoPage({ lat: lat, lng: lng })),
                    intoPage({
                        content: text,
                        sticky: true,
                        offset: getWindow().L.point(10, 0),
                    }),
                )
                .addTo(getMap())
        } else {
            showActiveNodeMarker(e.latlng.lat, e.latlng.lng, "#000000")
        }
    })
}

//</editor-fold>
