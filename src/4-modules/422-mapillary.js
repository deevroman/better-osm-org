//<editor-fold desc="mapillary" defaultstate="collapsed">

function attachMapillaryHoverCaptureHandler(a, res) {
    a.onmouseenter = () => mapillaryMouseEnter(res)
    const author = res["creator"]["username"]
    if (author) {
        appendTitleLine(a, t("objectPage.photoBy", { author }))
    }
    const date = res["captured_at"]
    if (date) {
        const d = new Date()
        d.setTime(date)
        appendTitleLine(a, d.toISOString())
    }
}

// https://www.mapillary.com/dashboard/developers
const MAPILLARY_CLIENT_KEY = "MLY|23980706878196295|56711819158553348b8159429530d931"
const MAPILLARY_URL_PARAMS = new URLSearchParams({
    access_token: MAPILLARY_CLIENT_KEY,
    fields: "id,geometry,computed_geometry,compass_angle,computed_compass_angle,thumb_256_url,thumb_1024_url,creator,captured_at",
})

async function downloadMapillaryPhotoInfo(id) {
    return (
        await externalFetchRetry({
            url: `https://graph.mapillary.com/${id}?${MAPILLARY_URL_PARAMS.toString()}`,
            responseType: "json",
        })
    ).response
}

function mapillaryMouseEnter(info) {
    const lat = info["geometry"]["coordinates"][1]
    const lon = info["geometry"]["coordinates"][0]
    const angle = info["compass_angle"]

    const computed_lat = info["computed_geometry"]["coordinates"][1]
    const computed_lon = info["computed_geometry"]["coordinates"][0]
    const computed_angle = info["computed_compass_angle"]

    showActiveNodeMarker(lat, lon, "#0022ff", true)
    showActiveNodeMarker(computed_lat, computed_lon, "#ee9209", false)

    drawRay(lat, lon, angle - 30, "#0022ff")
    drawRay(computed_lat, computed_lon, computed_angle - 25, "#ee9209")

    drawRay(lat, lon, angle + 30, "#0022ff")
    drawRay(computed_lat, computed_lon, computed_angle + 25, "#ee9209")
}

// https://osm.org/node/7417065297
// https://osm.org/node/6257534611
// https://osm.org/way/682528624/history/3
function makeMapillaryValue(elem) {
    if (!GM_config.get("ImagesAndLinksInTags")) return
    if (elem.classList.contains("mapillared")) {
        return
    }
    elem.classList.add("mapillared")
    elem.setHTML(
        elem.innerHTML.replaceAll(
            /(?<=(^|;))([0-9]+)(?=(;|&|$))(&amp;x=-?[0-9]+(\.[0-9]+)?&amp;y=-?[0-9]+(\.[0-9]+)?&amp;zoom=-?[0-9]+(\.[0-9]+)?)?/g,
            function (match) {
                const a = document.createElement("a")
                a.textContent = match.replaceAll("&amp;", "&")
                a.classList.add("preview-mapillary-img-link")
                a.target = "_blank"
                const browseSection = elem?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement
                const lat = browseSection?.querySelector(".latitude")?.textContent?.replace(",", ".")
                const lon = browseSection?.querySelector(".longitude")?.textContent?.replace(",", ".")
                a.href =
                    `https://www.mapillary.com/app/?focus=photo${lat ? "&lat=" + lat + "&lng=" + lon + "&z=16" : ""}&pKey=` +
                    arguments[0].replaceAll("&amp;", "&")
                return a.outerHTML
            },
        ),
    )
    setTimeout(async () => {
        for (const a of elem.querySelectorAll('a:not(.added-preview-mapillary-img-link)[href^="https://www.mapillary.com/app/"]')) {
            a.classList.add("added-preview-mapillary-img-link")
            const res = await downloadMapillaryPhotoInfo(a.textContent.match(/[0-9]+/))
            if (res["error"]) {
                a.classList.add("broken-mapillary-link")
                continue
            }
            const imgSrc = res["thumb_1024_url"]
            if (isSafari) {
                fetchImageWithCache(imgSrc).then(async imgData => {
                    const img = document.createElement("img")
                    img.src = imgData
                    img.alt = "image from Mapillary"
                    img.title = t("objectPage.gpsTrackerPosition")
                    img.style.width = "100%"
                    a.appendChild(img)
                })
            } else {
                const img = GM_addElement("img", {
                    src: imgSrc,
                    alt: "image from Mapillary",
                    title: t("objectPage.gpsTrackerPosition"),
                    width: "100%",
                    // crossorigin: "anonymous"
                })
                img.onerror = () => {
                    img.style.display = "none"
                }
                img.onload = () => {
                    img.style.width = "100%"
                }
                a.appendChild(img)
            }
            a.onmouseenter = () => mapillaryMouseEnter(res)
        }
    })
    elem.onclick = e => {
        e.stopImmediatePropagation()
    }
}

//</editor-fold>
