//<editor-fold desc="drop-csv" defaultstate="collapsed">

function displayCsv(text) {
    const [header, ...lines] = text.split("\n")
    console.log("lines count", lines.length)
    if (lines.length > 20000) {
        alert(t("dragAndDrop.tooManyCsvLines"))
    }
    let sep = header.includes(";") ? ";" : ","
    const columns = header
        .trim()
        .split(sep)
        .map(i => i.replace(/^"/g, "").replace(/"$/, ""))
    let latColumIndex = -1
    let lonColumIndex = -1
    columns.forEach((col, i) => {
        if (col.match(/(lat|широта)/i)) {
            latColumIndex = i
        } else if (col.match(/(lon|долгота)/i)) {
            lonColumIndex = i
        }
    })
    if (latColumIndex === -1 || lonColumIndex === -1) {
        throw "Can't find lat/lon columns in CSV file"
    }

    /** @type {import("geojson").GeoJSON} */
    const geojson = {
        type: "FeatureCollection",
        features: [],
    }
    console.time("csv filtering")
    const prevTitle = document.title
    const newTitle = "◴" + prevTitle
    document.title = newTitle

    try {
        const bounds = getMap().getBounds()
        for (const line of lines) {
            const values = line
                .trim()
                .split(sep)
                .map(i => {
                    if (i[0] === '"') {
                        if (i.at(-1) === '"') {
                            return i.slice(1, -1)
                        }
                        return i.slice(1)
                    }
                    if (i.at(-1) === '"') {
                        return i.slice(0, -1)
                    }
                    return i
                })

            const lat = parseFloat(values[latColumIndex])
            const lon = parseFloat(values[lonColumIndex])
            if (isNaN(lat) || isNaN(lon)) {
                console.warn("Invalid lat/lon in CSV file:", values)
                continue
            }
            if (lines.length > 20000 && !bounds.contains(getWindow().L.latLng(lat, lon))) {
                continue
            }
            geojson.features.push({
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [lon, lat],
                },
                properties: Object.fromEntries(columns.map((col, i) => [col, values[i]])),
            })
        }
        console.timeEnd("csv filtering")
        renderGeoJSONwrapper(geojson)
    } finally {
        if (document.title === newTitle) {
            document.title = prevTitle
        }
    }
}

//</editor-fold>
