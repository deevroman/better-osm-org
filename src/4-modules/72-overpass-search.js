//<editor-fold desc="overpass search" defaultstate="collapsed">

function yetAnotherWizard(s) {
    // const [k, v] = s.split("=")
    if (s[0] === "[") {
        return `nwr${s};`
    } else if (s.match(/^(node|way|rel|nwr|nw|nr|wr)/)) {
        return `${s}` + (s.slice(-1) === ";" ? "" : ";")
    } else {
        return `nwr[${s}];`
    }
}

let searchResultBBOX = null

async function processOverpassQuery(query) {
    if (!query.length) return
    query = query.trim()
    await GM.setValue("lastOverpassQuery", query)
    const bound = getMap().getBounds()
    const bboxString = [bound.getSouthWest().wrap().lat, bound.getSouthWest().wrap().lng, bound.getNorthEast().wrap().lat, bound.getNorthEast().wrap().lng]
    const bboxExpr = query[query.length - 1] !== "!" ? "[bbox:" + bboxString + "]" : ""
    if (query[query.length - 1] === "!") {
        query = query.slice(0, -1)
    }
    const prevTitle = document.title
    const newTitle = "◴" + prevTitle
    document.title = newTitle

    try {
        const overpassQuery = `[out:xml]${bboxExpr};
${yetAnotherWizard(query)}
//(._;>;);
out geom;
`
        console.log(overpassQuery)

        console.time("download overpass data " + query)
        const res = await externalFetchRetry({
            // todo switcher
            url:
                overpass_server.apiUrl +
                "/interpreter?" +
                new URLSearchParams({
                    data: overpassQuery,
                }),
            responseType: "xml",
        })
        console.timeEnd("download overpass data " + query)

        const xml = new DOMParser().parseFromString(res.response, "text/xml")
        const data_age = new Date(xml.querySelector("meta").getAttribute("osm_base"))
        console.log(data_age)

        getMap()?.invalidateSize()
        const bbox = (searchResultBBOX = combineBBOXes(
            Array.from(xml.querySelectorAll("bounds")).map(i => {
                return {
                    min_lat: i.getAttribute("minlat"),
                    min_lon: i.getAttribute("minlon"),
                    max_lat: i.getAttribute("maxlat"),
                    max_lon: i.getAttribute("maxlon"),
                }
            }),
        ))
        // const points = []
        Array.from(xml.querySelectorAll("node")).forEach(n => {
            const lat = parseFloat(n.getAttribute("lat"))
            const lon = parseFloat(n.getAttribute("lon"))
            // points.push([lon, lat])

            bbox.min_lat = min(bbox.min_lat, lat)
            bbox.min_lon = min(bbox.min_lon, lon)
            bbox.max_lat = max(bbox.max_lat, lat)
            bbox.max_lon = max(bbox.max_lon, lon)
        })
        console.log(bbox)
        if (bbox.min_lon === 10000000) {
            alert("invalid query")
        } else {
            console.time("render overpass response")
            fitBounds([
                [bbox.min_lat, bbox.min_lon],
                [bbox.max_lat, bbox.max_lon],
            ])
            loadBannedVersions()
            preloadEditIcons()
            cleanAllObjects()
            getWindow().jsonLayer?.remove()
            jsonLayer?.remove()
            jsonLayer = renderOSMGeoJSON(xml, true)
            console.timeEnd("render overpass response")

            let statusPrefix = ""
            if (!xml.querySelector("node,way,relation")) {
                statusPrefix += "Empty result"
            }

            if ((new Date().getTime() - data_age.getTime()) / 1000 / 60 > 5) {
                if (statusPrefix === "") {
                    statusPrefix += "Currentless of the data: " + data_age.toLocaleDateString() + " " + data_age.toLocaleTimeString()
                } else {
                    statusPrefix += " | " + "Currentless of the data: " + data_age.toLocaleDateString() + " " + data_age.toLocaleTimeString()
                }
            }

            getMap()?.attributionControl?.setPrefix(statusPrefix)

            /*
            const centroid = [...points.map(i => turf.point(i)), ...Array.from(xml.querySelectorAll("way")).map(w => {
                return turf.center(
                    turf.polygon([Array.from(w.querySelectorAll("nd")).map(n => {
                        return [
                            parseFloat(n.getAttribute("lon")),
                            parseFloat(n.getAttribute("lat")),
                        ]
                    })])
                )
            })]
            const voronoiPolygons = turf.voronoi(turf.featureCollection(centroid),
                {
                    bbox: [bbox.min_lon, bbox.min_lat, bbox.max_lon, bbox.max_lat]
                }
            );
            renderGeoJSONwrapper(voronoiPolygons)
            getWindow().jsonLayer.bringToBack()
            */
        }
    } finally {
        if (document.title === newTitle) {
            document.title = prevTitle
        }
    }
}

//</editor-fold>
