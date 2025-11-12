//<editor-fold desc="overpass search" defaultstate="collapsed">

function yetAnotherWizard(s) {
    // const [k, v] = s.split("=")
    if (s[0] === "[") {
        return `nwr${s};`
    } else if (s.match(/^(node|way|rel|nwr|nw|nr|wr)/)) {
        return `${s}` + (s.slice(-1) === ";" ? "" : ";")
    } else {
        // name ~ пятёрочка, i
        // https://github.com/drolbr/Overpass-API/issues/751
        const kv_match = s.match(/^(?<prefix>[~!]?)(?<key>[a-zA-Z0-9_\p{L}^$.*+]+)\s*(?<op>(=|~|!=|!~))\s*(?<value>[a-zA-Z0-9_\p{L}^$.*+]+)(?<suffix>\s*,\s*i)?$/u)?.groups
        if (kv_match) {
            return `nwr[${kv_match["prefix"] ?? ""}"${kv_match["key"]}"${kv_match["op"]}"${kv_match["value"]}"${kv_match["suffix"] ?? ""}];`
        } else {
            return `nwr[${s}];`
        }
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
            _retryCallback: context => {
                if (context.httpCode) {
                    getMap()?.attributionControl?.setPrefix(`Overpass HTTP Code: ${context.httpCode}. Retry after ${(context.sleepTime / 1000).toFixed()}s. Your can select other server in script settings`)
                }
            },
            _postSleepCallback: context => {
                if (context.httpCode) {
                    getMap()?.attributionControl?.setPrefix("")
                }
            },
        })
        console.timeEnd("download overpass data " + query)
        const xml = new DOMParser().parseFromString(res.response, "text/xml")
        if (res.status !== 200) {
            if (xml.querySelector("parsererror")) {
                alert(`Error. HTTP Code: ${res.status}`)
            } else {
                let errorMessage = `Error. HTTP Code: ${res.status}\nSubmitted request:\n\n${overpassQuery}\n`

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
        }
    } finally {
        if (document.title === newTitle) {
            document.title = prevTitle
        }
    }
}

//</editor-fold>
