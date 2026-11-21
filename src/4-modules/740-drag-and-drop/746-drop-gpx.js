//<editor-fold desc="drop-gpx" defaultstate="collapsed">

async function displayDroppedGpx(file) {
    displayGPXTrack(await file.text())
}

function addGpxTrackDisplayLinks() {
    document.querySelectorAll('a[href*="edit?gpx="]').forEach(i => {
        const trackID = i.getAttribute("href").match(/edit\?gpx=(\d+)/)[1]
        const editLink = i.parentElement.parentElement.querySelector('a:not([href*="display-gpx"])')
        const url = new URL(editLink.href)
        url.search += "&display-gpx=" + trackID
        editLink.href = url.toString()
    })
}

async function displayGpxTrackFromUrl() {
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
        displayGPXTrack(
            new DOMParser().parseFromString(
                new TextDecoder().decode(bz2.decompress(structuredClone(await res.response.bytes()))),
                "application/xml",
            ),
        )
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

//</editor-fold>
