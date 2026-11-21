//<editor-fold desc="panoramax" defaultstate="collapsed">

function drawPanoramaxCapturePlace(feature) {
    const lat = feature.geometry?.coordinates?.[1]
    const lon = feature.geometry?.coordinates?.[0]
    if (lat === undefined || lon === undefined) {
        return
    }
    const rawAngle = feature.properties?.exif?.["Exif.GPSInfo.GPSImgDirection"]
    if (rawAngle === undefined) {
        console.warn("no angle in feature", feature)
        return
    }
    const angle = rawAngle?.includes("/") ? rawAngle.split("/")[0] / rawAngle.split("/")[1] : parseFloat(rawAngle)

    showActiveNodeMarker(lat, lon, "#0022ff", true)
    if (angle) {
        drawRay(lat, lon, angle - 30, "#0022ff")
        drawRay(lat, lon, angle + 30, "#0022ff")
    }
}

async function attachPanoramaxHoverCaptureHandler(a, uuid, panoramaxServer) {
    const res = (
        await externalFetchRetry({
            url: `${panoramaxServer}/api/search?limit=1&ids=${uuid}`,
            responseType: "json",
        })
    ).response
    if (res["error"] || res["features"].length === 0) {
        console.error(res)
        return
    }
    a.onmouseenter = () => drawPanoramaxCapturePlace(res["features"][0])
    const author = res["features"][0]?.properties?.["geovisio:producer"]
    const artist = res["features"][0]?.properties?.exif?.["Exif.Image.Artist"]
    if (author) {
        appendTitleLine(a, t("objectPage.photoBy", { author: artist && artist !== author ? `${author} / ${artist}` : author }))
    }
    const date = res["features"][0]?.properties?.exif?.["Exif.Image.DateTime"]
    if (date) {
        appendTitleLine(a, date)
    }
}

function addPanoramaxPicIntoA(uuid, a, panoramaxServer) {
    const imgSrc = `${panoramaxServer}/api/pictures/${uuid}/sd.jpg`
    if (isSafari) {
        fetchImageWithCache(imgSrc).then(async imgData => {
            const img = document.createElement("img")
            img.src = imgData
            img.style.width = "100%"
            a.appendChild(img)
        })
    } else {
        const img = GM_addElement("img", {
            src: imgSrc,
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
    setTimeout(() => attachPanoramaxHoverCaptureHandler(a, uuid, panoramaxServer))
}

// https://osm.org/node/12559772251
// https://osm.org/node/10588878341
// https://osm.org/way/1264114016
function makePanoramaxValue(elem) {
    if (!GM_config.get("ImagesAndLinksInTags")) return
    // extracting uuid
    if (elem.classList.contains("panoramaxed")) {
        return
    }
    elem.classList.add("panoramaxed")
    elem.setHTML(
        elem.innerHTML.replaceAll(
            /(?<=(^|;))([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(&amp;xyz=-?[0-9]+(\.[0-9]+)?\/-?[0-9]+(\.[0-9]+)?\/-?[0-9]+(\.[0-9]+)?)?/gi,
            function (match) {
                const a = document.createElement("a")
                a.textContent = match.replaceAll("&amp;", "&")
                a.classList.add("preview-img-link")
                a.target = "_blank"
                const browseSection = elem?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement
                const lat = browseSection?.querySelector(".latitude")?.textContent?.replace(",", ".")
                const lon = browseSection?.querySelector(".longitude")?.textContent?.replace(",", ".")
                a.href = `${panoramaxDiscoveryServer}/#focus=pic&pic=` + match.replaceAll("&amp;", "&") + (lat ? `&map=16/${lat}/${lon}` : "")
                return a.outerHTML
            },
        ),
    )
    elem.querySelectorAll(`a:not(.added-preview-img)[href^="${MAIN_PANORAMAX_DISCOVERY_SERVER}/"]`).forEach(a => {
        a.classList.add("added-preview-img")
        const uuid = a.textContent.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/)?.[0]
        if (!uuid) {
            return
        }
        if (lastUploadedPanoramaxPicture?.uuid === uuid) {
            console.log(lastUploadedPanoramaxPicture)
            addPanoramaxPicIntoA(uuid, a, lastUploadedPanoramaxPicture.instance)
        } else {
            addPanoramaxPicIntoA(uuid, a, panoramaxDiscoveryServer)
        }
    })
    elem.onclick = e => {
        e.stopImmediatePropagation()
    }
}

//</editor-fold>
