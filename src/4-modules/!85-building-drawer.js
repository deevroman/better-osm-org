//<editor-fold desc="building-drawer" defaultstate="collapsed">

let drawingBuildings = false

function makeEmptyBuildingTools() {
    return {
        state: "start",
        way: [],
        wayLine: null,
        tempLine: null,
    }
}

let firstBuilding = null
let buildings = []
let currentBuildingTools = makeEmptyBuildingTools()

/**
 * Вычисляет координаты 4 углов прямоугольника, учитывая проекцию Меркатора.
 * @param {Object} A Первая точка одной стороны прямоугольника (lat, lng)
 * @param {Object} B Вторая точка той же стороны прямоугольника (lat, lng)
 * @param {Object} P Точка на противоположной стороне (lat, lng)
 * @returns {[Object, Object, Object, Object]} Массив точек: [A, B, C, D] — углы прямоугольника (lat, lng)
 */
function findRectangle(A, B, P) {
    const A_mercator = toMercator(A.lat, A.lng)
    const B_mercator = toMercator(B.lat, B.lng)
    const P_mercator = toMercator(P.lat, P.lng)

    const AB = { x: B_mercator.x - A_mercator.x, y: B_mercator.y - A_mercator.y }

    const normal = { x: -AB.y, y: AB.x }

    const AP = { x: P_mercator.x - A_mercator.x, y: P_mercator.y - A_mercator.y }

    const normalLengthSquared = normal.x ** 2 + normal.y ** 2
    const projectionScale = (AP.x * normal.x + AP.y * normal.y) / normalLengthSquared

    const AD = { x: normal.x * projectionScale, y: normal.y * projectionScale }

    const D_mercator = { x: A_mercator.x + AD.x, y: A_mercator.y + AD.y }
    const C_mercator = { x: B_mercator.x + AD.x, y: B_mercator.y + AD.y }

    const D = fromMercator(D_mercator.x, D_mercator.y)
    const C = fromMercator(C_mercator.x, C_mercator.y)

    return [A, B, C, D]
}

/**
 * Построение прямоугольника по двум противоположным углам и направлению
 * @param {Object} A первая вершина (lat, lng)
 * @param {Object} C противоположная вершина (lat, lng)
 * @param {Object} D1 начальная точка направления (lat, lng)
 * @param {Object} D2 конечная точка направления (lat, lng)
 * @returns {[Object, Object, Object, Object]} Вершины прямоугольника [A, B, C, D] по часовой стрелке
 */
function orientedRectangle(A, C, D1, D2) {
    const A_ = toMercator(A.lat, A.lng)
    const C_ = toMercator(C.lat, C.lng)
    const D1_ = toMercator(D1.lat, D1.lng)
    const D2_ = toMercator(D2.lat, D2.lng)

    const center = {
        x: (A_.x + C_.x) / 2,
        y: (A_.y + C_.y) / 2,
    }

    const diag = {
        x: C_.x - A_.x,
        y: C_.y - A_.y,
    }

    const dir = {
        x: D2_.x - D1_.x,
        y: D2_.y - D1_.y,
    }
    const dirLen = Math.hypot(dir.x, dir.y)
    dir.x /= dirLen
    dir.y /= dirLen

    const perp = {
        x: -dir.y,
        y: dir.x,
    }

    const halfWidth = 0.5 * (diag.x * dir.x + diag.y * dir.y)
    const halfHeight = 0.5 * (diag.x * perp.x + diag.y * perp.y)

    const dx = {
        x: dir.x * halfWidth,
        y: dir.y * halfWidth,
    }
    const dy = {
        x: perp.x * halfHeight,
        y: perp.y * halfHeight,
    }
    // prettier-ignore
    return [
        fromMercator(center.x - dx.x - dy.x, center.y - dx.y - dy.y),
        fromMercator(center.x + dx.x - dy.x, center.y + dx.y - dy.y),
        fromMercator(center.x + dx.x + dy.x, center.y + dx.y + dy.y),
        fromMercator(center.x - dx.x + dy.x, center.y - dx.y + dy.y)
    ]
}

function distanceToSegment(p, a, b) {
    const dx = b.x - a.x
    const dy = b.y - a.y

    if (dx === 0 && dy === 0) {
        const dpx = p.x - a.x
        const dpy = p.y - a.y
        return Math.hypot(dpx, dpy)
    }

    const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy)))
    const proj = { x: a.x + t * dx, y: a.y + t * dy }

    return Math.hypot(p.x - proj.x, p.y - proj.y)
}

/**
 * Находит ближайшую сторону многоугольника к заданной точке
 * @param {Array<{lat: number, lng: number}>} polygon — массив точек
 * @param {{lat: number, lng: number}} point — точка
 * @returns {[{lat: number, lng: number}, {lat: number, lng: number}]} — ближайшая сторона
 */
function closestPolygonSideIndex(polygon, point) {
    const p_ = toMercator(point.lat, point.lng)
    let minDist = Infinity
    let closestIndex = -1

    for (let i = 0; i < polygon.length; i++) {
        const j = (i + 1) % polygon.length
        const a_ = toMercator(polygon[i].lat, polygon[i].lng)
        const b_ = toMercator(polygon[j].lat, polygon[j].lng)

        const dist = distanceToSegment(p_, a_, b_)
        if (dist < minDist) {
            minDist = dist
            closestIndex = i
        }
    }

    return closestIndex
}

/**
 * Опускает перпендикуляр из точки P на отрезок AB
 * @param {{lat: number, lng: number}} p — исходная точка
 * @param {{lat: number, lng: number}} a — начало отрезка
 * @param {{lat: number, lng: number}} b — конец отрезка
 * @returns {{lat: number, lng: number}} — точка проекции
 */
function projectPointOntoSegment(p, a, b) {
    const P = toMercator(p.lat, p.lng)
    const A = toMercator(a.lat, a.lng)
    const B = toMercator(b.lat, b.lng)

    const dx = B.x - A.x
    const dy = B.y - A.y

    const lengthSq = dx * dx + dy * dy
    if (lengthSq === 0) {
        return a
    }

    let t = ((P.x - A.x) * dx + (P.y - A.y) * dy) / lengthSq
    t = Math.max(0, Math.min(1, t))

    const projX = A.x + t * dx
    const projY = A.y + t * dy

    return fromMercator(projX, projY)
}

async function setupBuildingTools() {
    injectCSSIntoOSMPage(`
        .crosshair-cursor {
            cursor: crosshair;
        }
    `)
    await interceptMapManually()
    // sometime click don't fire when move 1px
    let lastMouseDownX = 0
    let lastMouseDownY = 0
    const mouseDownHandler = intoPageWithFun(e => {
        lastMouseDownX = e.originalEvent.clientX
        lastMouseDownY = e.originalEvent.clientY
    })
    const mouseUpHandler = intoPageWithFun(e => {
        if (!drawingBuildings) {
            return
        }
        if (e.originalEvent.button === 2) {
            return
        }
        if (e.originalEvent.altKey) {
            currentBuildingTools = makeEmptyBuildingTools()
        }
        const { lat: lat, lng: lng } = e.latlng
        if (lastMouseDownX - e.originalEvent.clientX > 1 || lastMouseDownY - e.originalEvent.clientY > 1 || lastMouseDownX - e.originalEvent.clientX < -1 || lastMouseDownY - e.originalEvent.clientY < -1) {
            console.log("skipped click")
            console.log(lastMouseDownX - e.originalEvent.clientX)
            console.log(lastMouseDownY - e.originalEvent.clientY)
            return
        }
        if (e.originalEvent.altKey && buildings.length) {
        } else {
            if (currentBuildingTools.way.length === 1 && firstBuilding) {
                currentBuildingTools.way = orientedRectangle(
                    currentBuildingTools.way[0],
                    {
                        lat: lat,
                        lng: lng,
                    },
                    firstBuilding.way[0],
                    firstBuilding.way[1],
                )
                currentBuildingTools.way.push(currentBuildingTools.way[0])
                currentBuildingTools.wayLine?.remove()

                currentBuildingTools.wayLine = displayWay(currentBuildingTools.way, false, "#ff002f", 2)
                currentBuildingTools.wayLine._path.classList.add("crosshair-cursor")

                buildings.push(currentBuildingTools)
                currentBuildingTools = makeEmptyBuildingTools()
            } else if (currentBuildingTools.way.length === 2) {
                currentBuildingTools.way = findRectangle(currentBuildingTools.way[0], currentBuildingTools.way[1], {
                    lat: lat,
                    lng: lng,
                })
                currentBuildingTools.way.push(currentBuildingTools.way[0])
                currentBuildingTools.wayLine?.remove()

                currentBuildingTools.wayLine = displayWay(currentBuildingTools.way, false, "#ff002f", 2)
                currentBuildingTools.wayLine._path.classList.add("crosshair-cursor")

                if (firstBuilding === null) {
                    firstBuilding = currentBuildingTools
                }
                buildings.push(currentBuildingTools)
                currentBuildingTools = makeEmptyBuildingTools()
            } else {
                currentBuildingTools.way.push({ lat: lat, lng: lng })
                currentBuildingTools.wayLine?.remove()

                currentBuildingTools.wayLine = displayWay(currentBuildingTools.way, false, "#ff002f", 2)
                currentBuildingTools.wayLine._path.classList.add("crosshair-cursor")
            }
        }
    })
    const mouseMoveHandler = intoPageWithFun(e => {
        if (!drawingBuildings) {
            return
        }
        lastLatLng = { lat: getMap().osm_contextmenu._$element.data("lat"), lng: getMap().osm_contextmenu._$element.data("lng") }
        const { lat: lat, lng: lng } = lastLatLng
        if (e.originalEvent.altKey && buildings.length) {
            const lastBuildingTools = buildings[buildings.length - 1]
            let index = closestPolygonSideIndex(lastBuildingTools.way, {
                lat: lat,
                lng: lng,
            })
            index = index === lastBuildingTools.way.length - 1 ? 0 : index
            const proj = projectPointOntoSegment({ lat: lat, lng: lng }, lastBuildingTools.way[index], lastBuildingTools.way[index + 1])
            const rect = findRectangle(lastBuildingTools.way[index], proj, { lat: lat, lng: lng })
            lastBuildingTools.tempLine?.remove()
            lastBuildingTools.tempLine = displayWay([...rect, rect[0]], false, "#ff002f", 1, null, "customObjects", "4 4")
        } else {
            currentBuildingTools.tempLine?.remove()
            if (!currentBuildingTools.way.length) return
            if (currentBuildingTools.way.length === 1 && firstBuilding) {
                const rect = orientedRectangle(
                    currentBuildingTools.way[0],
                    {
                        lat: lat,
                        lng: lng,
                    },
                    firstBuilding.way[0],
                    firstBuilding.way[1],
                )
                currentBuildingTools.tempLine = displayWay([...rect, rect[0]], false, "#ff002f", 2)
            } else if (currentBuildingTools.way.length === 2) {
                const rect = findRectangle(currentBuildingTools.way[0], currentBuildingTools.way[1], {
                    lat: lat,
                    lng: lng,
                })
                currentBuildingTools.tempLine = displayWay([...rect, rect[0]], false, "#ff002f", 2)
            } else {
                currentBuildingTools.tempLine = displayWay(
                    [
                        currentBuildingTools.way[currentBuildingTools.way.length - 1],
                        {
                            lat: lat,
                            lng: lng,
                        },
                    ],
                    false,
                    "#ff002f",
                    2,
                )
            }
        }
    })

    if (drawingBuildings) {
        document.querySelector("#map").style.cursor = "drag"
        drawingBuildings = false

        getMap().off("mousedown", mouseDownHandler)
        getMap().off("mouseup", mouseUpHandler)
        getMap().off("mousemove", mouseMoveHandler)
        currentBuildingTools.tempLine?.remove()
        currentBuildingTools = makeEmptyMeasuring()
        return
    }

    currentBuildingTools = makeEmptyMeasuring()
    document.querySelector("#map").style.cursor = "crosshair"
    drawingBuildings = true

    getMap().on("mousedown", mouseDownHandler)
    getMap().on("mouseup", mouseUpHandler)
    getMap().on("mousemove", mouseMoveHandler)
}

//</editor-fold>
