//<editor-fold desc="drag-and-drop" defaultstate="collapsed">

function handleDroppedFiles(files) {
    const mapWidth = getComputedStyle(document.querySelector("#map")).width
    const mapHeight = getComputedStyle(document.querySelector("#map")).height
    insertOverlaysStyles()

    files.forEach(async file => {
        if (file.type.startsWith("image/jpeg") || file.name.endsWith(".jpg") || file.name.endsWith(".jpeg")) {
            await displayDroppedJpeg(file)
        } else if (
            file.type === "application/json" ||
            file.type === "application/geo+json" ||
            file.name.endsWith(".geojson") ||
            file.name.endsWith(".json")
        ) {
            await displayDroppedJson(file)
        } else if (file.type === "application/gpx+xml" || file.name.endsWith(".gpx")) {
            await displayDroppedGpx(file)
        } else if (file.type === "application/vnd.openstreetmap.data+xml" || file.name.endsWith(".osm")) {
            await displayDroppedOsm(file)
        } else if (file.type === "application/vnd.google-earth.kml+xml" || file.name.endsWith(".kml")) {
            await displayDroppedKml(file)
        } else if (file.type === "application/vnd.google-earth.kmz+xml" || file.name.endsWith(".kmz")) {
            await displayDroppedKmz(file)
        } else if (file.type === "text/csv" || file.name.endsWith(".csv")) {
            displayCsv(await file.text())
        } else if (file.name.endsWith(".osc") && isDebug()) {
            await displayDroppedOsc(file)
        } else {
            console.log(file.type)
        }
    })
}

async function setupDragAndDropViewers() {
    document.querySelector("#map")?.addEventListener("drop", e => {
        if (location.pathname.includes("/directions") || location.pathname.includes("/note/new")) {
            return
        }
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()

        e.target.style.cursor = "progress"
        try {
            handleDroppedFiles([...e.dataTransfer.items].filter(i => i.kind === "file").map(i => i.getAsFile()))
            stopClick = true
        } finally {
            e.target.style.cursor = "grab"
        }
    })
    document.querySelector("#map")?.addEventListener("dragover", e => {
        if (!location.pathname.includes("/directions") && !location.pathname.includes("/note/new")) {
            e.preventDefault()
        }
    })

    if (location.pathname.includes("/traces")) {
        addGpxTrackDisplayLinks()
    } else if (location.search.includes("&display-gpx=")) {
        await displayGpxTrackFromUrl()
    }

    // todo refactor
    const createNoteButton = document.querySelector(".control-note.leaflet-control a")
    if (createNoteButton && !createNoteButton.getAttribute("data-bs-original-title").includes(" (shift + N)")) {
        createNoteButton.setAttribute("data-bs-original-title", createNoteButton.getAttribute("data-bs-original-title") + " (shift + N)")
    }
}

//</editor-fold>
