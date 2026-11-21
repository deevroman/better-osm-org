//<editor-fold desc="drop-osm" defaultstate="collapsed">

async function displayDroppedOsm(file) {
    const doc = new DOMParser().parseFromString(await file.text(), "application/xml")
    void loadBannedVersions()
    jsonLayer = renderOSMGeoJSON(doc, true)
}

async function displayDroppedOsc(file) {
    const doc = new DOMParser().parseFromString(await file.text(), "application/xml")
    displayOsc(doc)
}

//</editor-fold>
