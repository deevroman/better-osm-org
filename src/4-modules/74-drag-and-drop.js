//<editor-fold desc="drag-and-drop" defaultstate="collapsed">

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
            const mapWidth = getComputedStyle(document.querySelector("#map")).width
            const mapHeight = getComputedStyle(document.querySelector("#map")).height
            insertOverlaysStyles()
            ;[...e.dataTransfer.items].forEach(async (item, _) => {
                if (item.kind === "file") {
                    const file = item.getAsFile()
                    if (file.type.startsWith("image/jpeg")) {
                        const metadata = EXIF.readFromBinaryFile(await file.arrayBuffer())
                        console.log(metadata)
                        console.log(metadata.GPSLatitude, metadata.GPSLongitude)
                        let lat = parseFloat(metadata.GPSLatitude[0]) + parseFloat(metadata.GPSLatitude[1]) / 60 + parseFloat(metadata.GPSLatitude[2]) / 3600
                        let lon = parseFloat(metadata.GPSLongitude[0]) + parseFloat(metadata.GPSLongitude[1]) / 60 + parseFloat(metadata.GPSLongitude[2]) / 3600

                        if (metadata.GPSLatitudeRef === "S") {
                            lat = parseFloat(lat) * -1
                        }

                        if (metadata.GPSLongitudeRef === "W") {
                            lon = parseFloat(lon) * -1
                        }

                        const marker = getWindow().L.circleMarker(
                            getWindow().L.latLng(lat, lon),
                            // intoPage({
                            //     maxWidth: mapWidth,
                            //     maxHeight: mapHeight,
                            //     className: "map-img-preview-popup",
                            // }),
                        )
                        const img = document.createElement("img")
                        img.classList.add("geotagged-img")
                        img.setAttribute("width", "100%")
                        const fr = new FileReader()
                        fr.onload = function () {
                            img.src = fr.result
                            marker.bindPopup(img.outerHTML)
                        }
                        fr.readAsDataURL(file)
                        marker.addTo(getMap())
                    } else if (file.type === "application/json" || file.type === "application/geo+json") {
                        const geojson = JSON.parse(await file.text())
                        renderGeoJSONwrapper(geojson)
                    } else if (file.type === "application/gpx+xml") {
                        displayGPXTrack(await file.text())
                    } else if (file.type === "application/vnd.openstreetmap.data+xml") {
                        const doc = new DOMParser().parseFromString(await file.text(), "application/xml")
                        loadBannedVersions()
                        preloadEditIcons()
                        jsonLayer = renderOSMGeoJSON(doc, true)
                    } else if (file.type === "application/vnd.google-earth.kml+xml") {
                        displayKMLTrack(await file.text())
                    } else if (file.type === "application/vnd.google-earth.kmz+xml") {
                        const { entries } = await unzipit.unzip(await file.arrayBuffer())
                        displayKMLTrack(
                            await Object.entries(entries)
                                .find(i => i[0].endsWith(".kml"))[1]
                                .text(),
                        )
                    } else {
                        console.log(file.type)
                    }
                }
            })
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
        document.querySelectorAll('a[href*="edit?gpx="]').forEach(i => {
            const trackID = i.getAttribute("href").match(/edit\?gpx=(\d+)/)[1]
            const editLink = i.parentElement.parentElement.querySelector('a:not([href*="display-gpx"])')
            const url = new URL(editLink.href)
            url.search += "&display-gpx=" + trackID
            editLink.href = url.toString()
        })
    } else if (location.search.includes("&display-gpx=")) {
        const trackID = location.search.match(/&display-gpx=(\d+)/)[1]
        const res = await externalFetchRetry({
            url: `${osm_server.url}/traces/${trackID}/data`,
            responseType: "blob",
        })
        const contentType = res.response.type
        if (contentType === "application/gpx+xml") {
            displayGPXTrack(await res.response.text())
        } else if (contentType === "application/gzip") {
            displayGPXTrack(await (await decompressBlob(res.response)).text())
        } else if (contentType === "application/x-bzip2") {
            // fuck Tampermonkey, structuredClone for TM
            displayGPXTrack(new DOMParser().parseFromString(new TextDecoder().decode(bz2.decompress(structuredClone(await res.response.bytes()))), "application/xml"))
        } else {
            throw `Unknown track #${trackID} format: ` + contentType
        }
        if (trackMetadata) {
            fitBounds([
                [trackMetadata.min_lat, trackMetadata.min_lon],
                [trackMetadata.max_lat, trackMetadata.max_lon],
            ])
        }
    }

    // todo refactor
    const createNoteButton = document.querySelector(".control-note.leaflet-control a")
    if (createNoteButton && !createNoteButton.getAttribute("data-bs-original-title").includes(" (shift + N)")) {
        createNoteButton.setAttribute("data-bs-original-title", createNoteButton.getAttribute("data-bs-original-title") + " (shift + N)")
    }
}

//</editor-fold>
