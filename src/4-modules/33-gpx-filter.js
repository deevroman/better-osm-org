//<editor-fold desc="gpx-filter" defaultstate="collapsed">

function addGPXFiltersButtons() {
    if (document.getElementById("gpx-filter")) {
        return
    }
    const gpxLabel = Array.from(document.querySelectorAll(".overlay-layers label"))[2]
    if (!gpxLabel) {
        return
    }
    const filters = document.createElement("span")
    filters.id = "gpx-filter"
    filters.style.cursor = "pointer"

    let bbox

    filters.onclick = async () => {
        const prevTracksList = document.getElementById("tracks-list")

        const bounds = await getMapBounds()
        const lat1 = bounds.getNorthWest().lat
        const lng1 = bounds.getNorthWest().lng
        const lat2 = bounds.getSouthEast().lat
        const lng2 = bounds.getSouthEast().lng

        const tracksList = document.createElement("div")
        tracksList.id = "tracks-list"
        filters.after(tracksList)

        try {
            for (let page = 0; page < 100; page++) {
                console.log("Tracks page #" + page)
                filters.style.cursor = "progress"
                filters.setAttribute("disabled", true)
                const response = await externalFetchRetry({
                    url:
                        osm_server.url +
                        "/api/0.6/trackpoints?" +
                        new URLSearchParams({
                            bbox: [lng1, lat2, lng2, lat1].join(","),
                            page: page,
                        }),
                })
                if (response.status !== 200) {
                    alert("download failed: " + response.responseText)
                    throw response.responseText
                }
                if (page === 0) {
                    prevTracksList?.remove()
                }
                try {
                    bbox?.remove()
                    bbox = getWindow()
                        .L.rectangle(
                            intoPage([
                                [lat1, lng1],
                                [lat2, lng2],
                            ]),
                            intoPage({ color: "red", weight: 2, fillOpacity: 0, dashArray: "10, 10" }),
                        )
                        .addTo(getMap())
                } catch (e) {
                    console.error(e)
                }

                const tracks = new DOMParser().parseFromString(response.responseText, "text/html")

                const countAllTrackPoints = tracks.querySelectorAll("trkpt").length
                console.log(`Tracks points: ${countAllTrackPoints}`)

                const goodTracks = tracks.querySelectorAll("trk:has(url)")
                console.log(`Tracks with URL: ${goodTracks.length}`)

                goodTracks.forEach(trk => {
                    const trackInfo = document.createElement("a")
                    const name = trk.querySelector("name").textContent
                    const desc = trk.querySelector("desc").textContent
                    const url = trk.querySelector("url").textContent
                    const [, username, trackID] = url.match(/\/user\/([^/]+)\/traces\/([0-9]+)/)
                    trackInfo.setAttribute("href", url)
                    trackInfo.setAttribute("target", "_blank")
                    trackInfo.style.display = "block"
                    trackInfo.textContent = decodeURI(username) + "#" + trackID
                    trackInfo.title = `${name}\n\n${desc}`
                    trackInfo.onmouseenter = () => {
                        bbox?.remove()
                        bbox = getWindow()
                            .L.rectangle(
                                intoPage([
                                    [lat1, lng1],
                                    [lat2, lng2],
                                ]),
                                intoPage({ color: "red", weight: 2, fillOpacity: 0, dashArray: "10, 10" }),
                            )
                            .addTo(getMap())

                        const trackForDisplay = document.implementation.createDocument(null, "gpx")
                        trackForDisplay.documentElement.appendChild(trk)
                        cleanAllObjects()
                        displayGPXTrack(trackForDisplay, "rgb(255,0,47)")
                    }
                    trackInfo.onclick = e => {
                        if (!e.altKey) {
                            return
                        }
                        fitBounds([
                            [trackMetadata.min_lat, trackMetadata.min_lon],
                            [trackMetadata.max_lat, trackMetadata.max_lon],
                        ])
                    }
                    tracksList.appendChild(trackInfo)

                    const downloadBtn = document.createElement("span")
                    downloadBtn.textContent = "📥"
                    downloadBtn.style.position = "absolute"
                    downloadBtn.style.marginLeft = "-1.5em"
                    downloadBtn.style.filter = "grayscale(1)"
                    downloadBtn.addEventListener(
                        "mouseenter",
                        async () => {
                            downloadBtn.style.cursor = "progress"
                            downloadBtn.style.filter = ""

                            const res = await externalFetchRetry({
                                url: `${osm_server.url}/traces/${trackID}/data`,
                                responseType: "blob",
                            })
                            if (res.status !== 200) {
                                console.error(`Track #${trackID} not download:`, res.status)
                                return
                            }
                            const contentType = res.response.type
                            let xml
                            if (contentType === "application/gpx+xml") {
                                xml = new DOMParser().parseFromString(await res.response.text(), "application/xml")
                            } else if (contentType === "application/gzip") {
                                xml = new DOMParser().parseFromString(await (await decompressBlob(res.response)).text(), "application/xml")
                            } else if (contentType === "application/x-bzip2") {
                                // fuck Tampermonkey, structuredClone for TM
                                xml = new DOMParser().parseFromString(new TextDecoder().decode(bz2.decompress(structuredClone(await res.response.bytes()))), "application/xml")
                            } else {
                                throw `Unknown track #${trackID} format: ` + contentType
                            }
                            cleanAllObjects()
                            displayGPXTrack(xml, "rgb(255,0,47)")

                            function hoverHandler() {
                                bbox?.remove()
                                bbox = getWindow()
                                    .L.rectangle(
                                        intoPage([
                                            [lat1, lng1],
                                            [lat2, lng2],
                                        ]),
                                        intoPage({ color: "red", weight: 2, fillOpacity: 0, dashArray: "10, 10" }),
                                    )
                                    .addTo(getMap())

                                cleanAllObjects()
                                displayGPXTrack(xml, "rgb(255,0,47)")
                            }
                            trackInfo.onmouseenter = hoverHandler
                            downloadBtn.onmouseenter = hoverHandler

                            downloadBtn.textContent = "⧈"
                            downloadBtn.innerHTML = fitToObjectSvg
                            downloadBtn.style.cursor = "pointer"
                            downloadBtn.title = "click to zoom\nTip: press 8-9 to navigate between previous/next map position"
                            downloadBtn.onclick = () => {
                                fitBounds([
                                    [trackMetadata.min_lat, trackMetadata.min_lon],
                                    [trackMetadata.max_lat, trackMetadata.max_lon],
                                ])
                            }
                        },
                        { once: true },
                    )
                    trackInfo.before(downloadBtn)
                })

                const hr = document.createElement("hr")
                hr.style.margin = "unset"
                tracksList.appendChild(hr)
                if (countAllTrackPoints === 0) {
                    break
                }
            }
        } finally {
            filters.style.cursor = "pointer"
            filters.removeAttribute("disabled")
        }
        bbox?.remove()
        bbox = getWindow()
            .L.rectangle(
                intoPage([
                    [lat1, lng1],
                    [lat2, lng2],
                ]),
                intoPage({ color: "red", weight: 2, fillOpacity: 0, dashArray: "10, 10" }),
            )
            .addTo(getMap())
    }

    filters.textContent = " 🔍"
    filters.title = "Show GPX tracks in current map view"
    gpxLabel.after(filters)
}

function setupGPXFiltersButtons() {
    if (document.getElementById("map")) {
        tryApplyModule(addGPXFiltersButtons, 100, 3000)
    }
}

//</editor-fold>
