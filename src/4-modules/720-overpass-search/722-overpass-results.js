let searchResultBBOX = null

async function processOverpassQuery(query, date = "", raw = false) {
    if (!query.length) return
    query = query.trim()
    await GM.setValue("lastOverpassQuery", query)
    await GM.setValue("lastOverpassQueryIsRaw", raw)
    const overpassQuery = buildOverpassSearchQuery(query, getMap().getBounds(), date, raw)
    const prevTitle = document.title
    const newTitle = "◴" + prevTitle
    document.title = newTitle

    try {
        const res = await overpassRequest(overpassQuery, "xml", false)
        const xml = new DOMParser().parseFromString(res.response, "text/xml")
        if (res.status !== 200) {
            if (xml.querySelector("parsererror")) {
                alert(t("overpassSearch.httpError", { status: res.status }))
            } else {
                let errorMessage = t("overpassSearch.httpErrorWithQuery", { status: res.status, query: overpassQuery }) + "\n"

                xml.querySelectorAll("p").forEach(i => {
                    const lineText = i.textContent
                    if (lineText.includes("Error")) {
                        errorMessage += lineText + "\n"
                    }
                })
                alert(errorMessage)
            }
            return
        }

        const data_age = new Date(xml.querySelector("meta").getAttribute("osm_base"))
        console.log("osm_base from Overpass response", data_age)

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
        if (bbox.min_lon === _defaultBboxValue) {
            alert(t("overpassSearch.invalidQuery"))
            return
        }
        console.time("render overpass response")
        fitBounds([
            [bbox.min_lat, bbox.min_lon],
            [bbox.max_lat, bbox.max_lon],
        ])
        void loadBannedVersions()
        cleanAllObjects()
        getWindow().jsonLayer?.remove()
        jsonLayer?.remove()
        jsonLayer = renderOSMGeoJSON(xml, {
            style: {
                color: c("#ff0000", ".overpass-search"),
            },
        })
        // TODO
        jsonLayer.bringToFront()
        startPhotosRender(xml)
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

        setAttributionPrefix(statusPrefix)
    } finally {
        if (document.title === newTitle) {
            document.title = prevTitle
        }
    }
}
