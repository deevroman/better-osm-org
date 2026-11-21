//<editor-fold desc="drop-json" defaultstate="collapsed">

async function displayDroppedJson(file) {
    const geojson = JSON.parse(await file.text())
    if (Array.isArray(geojson)) {
        displayJsonArray(geojson)
    } else {
        renderGeoJSONwrapper(geojson)
    }
}

function displayJsonArray(json) {
    /** @type {import("geojson").GeoJSON} */
    const geojson = {
        type: "FeatureCollection",
        features: [],
    }
    for (const i of json) {
        /** @type {import("geojson").Feature} */
        const feature = {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [null, null],
            },
            properties: {},
        }
        for (let [k, v] of Object.entries(i)) {
            if (k === "lon" || k === "longitude") {
                feature.geometry.coordinates[0] = v
            } else if (k === "lat" || k === "latitude") {
                feature.geometry.coordinates[1] = v
            }
            feature.properties[k] = v
        }
        geojson.features.push(feature)
    }
    debugger
    renderGeoJSONwrapper(geojson)
}

//</editor-fold>
