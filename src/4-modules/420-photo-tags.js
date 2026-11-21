//<editor-fold desc="photo-tags" defaultstate="collapsed">

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

function appendTitleLine(elem, text) {
    if (!text) {
        return
    }
    if (elem.title && elem.title.length !== 0) {
        elem.title += "\n"
    }
    elem.title += text
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

function attachWikimediaHoverCaptureHandler(a, res) {
    a.onmouseenter = () => wikimediaMouseEnter(res)
    try {
        const author = res["query"]["pages"]["-1"]["imageinfo"][0]["extmetadata"]["Artist"]["value"]
        if (author) {
            // отдавать HTML придумал гений, блять
            const fixedAuthor = author.endsWith("</a>") ? (author.match(/">(.*)<\/a>$/)[1] ?? author) : author
            appendTitleLine(a, t("objectPage.photoBy", { author: fixedAuthor }))
        }
    } catch (err) {
        console.error(err)
    }
    try {
        const date = res["query"]["pages"]["-1"]["imageinfo"][0]["extmetadata"]["DateTimeOriginal"]["value"]
        if (date) {
            appendTitleLine(a, date)
        }
    } catch (err) {
        console.error(err)
    }
    const license = res["query"]["pages"]["-1"]["imageinfo"][0]["extmetadata"]["LicenseShortName"]["value"]
    if (license) {
        appendTitleLine(a, license)
    }
}

function getInaturalistPhotoUrls(observation) {
    const photo = observation?.observation_photos?.[0]?.photo ?? observation?.photos?.[0]
    return {
        photo,
        thumbSrc: photo?.url,
        zoomSrc: photo?.url?.replace("/square.", "/medium."),
    }
}

function attachInaturalistHoverCaptureHandler(a, observation) {
    a.onmouseenter = () => inaturalistMouseEnter(observation)
    const titleLines = []
    const { photo } = getInaturalistPhotoUrls(observation)
    const commonName = observation?.taxon?.preferred_common_name
    const scientificName = observation?.taxon?.name
    const speciesGuess = observation?.species_guess
    if (commonName && scientificName) {
        titleLines.push(`${commonName} (${scientificName})`)
    } else if (commonName || scientificName || speciesGuess) {
        titleLines.push(commonName ?? scientificName ?? speciesGuess)
    }
    if (observation?.user?.login) {
        titleLines.push(t("objectPage.observedBy", { user: observation.user.login }))
    }
    if (observation?.observed_on) {
        titleLines.push(observation.observed_on)
    }
    if (photo?.attribution) {
        titleLines.push(photo.attribution)
    }
    a.title += titleLines.join("\n")
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

function wikimediaMouseEnter(info) {
    try {
        const lat = info["query"]["pages"]["-1"]["imageinfo"][0]["extmetadata"]["GPSLatitude"]["value"]
        const lon = info["query"]["pages"]["-1"]["imageinfo"][0]["extmetadata"]["GPSLongitude"]["value"]

        showActiveNodeMarker(lat, lon, "#0022ff", true)
    } catch (err) {
        console.log(err)
    }
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

async function downloadWikimediaInfo(filename) {
    const response = (
        await externalFetchRetry({
            url:
                `https://commons.wikimedia.org/w/api.php?` +
                new URLSearchParams({
                    action: "query",
                    iiprop: "url|extmetadata",
                    iiurlwidth: "300",
                    prop: "imageinfo",
                    titles: filename,
                    format: "json",
                }).toString(),
            responseType: "json",
        })
    ).response
    const firstPage = Object.values(response?.query?.pages ?? {})?.[0]
    if (!firstPage) {
        return response
    }
    return { query: { pages: { "-1": firstPage } } }
}

async function downloadWikimediaCategoryInfo(categoryName, limit = 8) {
    return (
        await externalFetchRetry({
            url:
                `https://commons.wikimedia.org/w/api.php?` +
                new URLSearchParams({
                    action: "query",
                    list: "categorymembers",
                    cmtitle: categoryName,
                    cmtype: "file",
                    cmlimit: limit,
                    format: "json",
                }).toString(),
            responseType: "json",
        })
    ).response
}

function makeWikimediaCommonsValue(elem, isVersionPage) {
    if (!GM_config.get("ImagesAndLinksInTags")) return
    const items = isVersionPage ? elem.querySelectorAll('a[href^="https://commons.wikimedia.org/wiki/"]:not(.preview-img-link)') : [elem]
    items.forEach(a => {
        if (a.classList.contains("preview-img-link")) {
            return
        }
        a.classList.add("preview-img-link")
        setTimeout(async () => {
            for (let item of a.textContent.split(";")) {
                if (item.startsWith("Category:")) {
                    const categoryResponse = await downloadWikimediaCategoryInfo(item)
                    const fileTitles = categoryResponse?.query?.categorymembers?.map(file => file.title) ?? []
                    if (fileTitles.length === 0) {
                        return
                    }
                    const previewsWrap = document.createElement("div")
                    Object.assign(previewsWrap.style, {
                        display: "grid",
                        gridTemplateColumns: "repeat(1, 1fr)",
                        gap: "2px",
                    })
                    a.after(previewsWrap)
                    for (const fileTitle of fileTitles) {
                        const wikimediaResponse = await downloadWikimediaInfo(fileTitle)
                        const imageInfo = wikimediaResponse?.query?.pages?.["-1"]?.imageinfo?.[0]
                        if (!imageInfo?.thumburl) {
                            continue
                        }
                        const previewLink = document.createElement("a")
                        previewLink.href = `https://commons.wikimedia.org/wiki/${fileTitle.replaceAll(" ", "_")}`
                        previewLink.target = "_blank"
                        previewLink.rel = "noreferrer"
                        previewLink.classList.add("preview-img-link")
                        previewLink.style.display = "block"
                        const img = GM_addElement("img", {
                            src: imageInfo["thumburl"],
                            // crossorigin: "anonymous"
                        })
                        Object.assign(img.style, {
                            width: "100%",
                            aspectRatio: "1 / 1",
                            objectFit: "cover",
                        })
                        previewLink.appendChild(img)
                        previewsWrap.appendChild(previewLink)
                        attachWikimediaHoverCaptureHandler(previewLink, wikimediaResponse)
                    }
                    return
                }
                const wikimediaResponse = await downloadWikimediaInfo(item)
                const img = GM_addElement("img", {
                    src: wikimediaResponse["query"]["pages"]["-1"]["imageinfo"][0]["thumburl"],
                    // crossorigin: "anonymous"
                })
                img.style.width = "100%"
                a.appendChild(img)
                attachWikimediaHoverCaptureHandler(img, wikimediaResponse)
            }
        })
    })
}

const fotoshiPhotoCache = new Map()
const pendingFotoshiPhotos = new Map()
let fotoshiBatchScheduled = false

function downloadFotoshiPhoto(id) {
    if (!fotoshiPhotoCache.has(id)) {
        const request = new Promise((resolve, reject) => {
            pendingFotoshiPhotos.set(id, { resolve, reject })
        })
        fotoshiPhotoCache.set(id, request)
        request.catch(() => fotoshiPhotoCache.delete(id))
        if (!fotoshiBatchScheduled) {
            fotoshiBatchScheduled = true
            queueMicrotask(flushFotoshiPhotoRequests)
        }
    }
    return fotoshiPhotoCache.get(id)
}

function flushFotoshiPhotoRequests() {
    fotoshiBatchScheduled = false
    const pending = [...pendingFotoshiPhotos.entries()]
    pendingFotoshiPhotos.clear()

    for (let i = 0; i < pending.length; i += 20) {
        const batch = pending.slice(i, i + 20)
        const params = new URLSearchParams({
            ids: batch.map(([id]) => id).join(","),
            collections: "fotoshi-photos",
            limit: `${batch.length}`,
        })
        void externalFetch({ url: `https://api.fotoshi.com/v1/stac/search?${params}`, responseType: "json" })
            .then(res => {
                if (res.status !== 200 || !Array.isArray(res.response?.features)) {
                    throw new Error(`Fotoshi STAC request failed: HTTP ${res.status}`)
                }
                const photos = new Map(res.response.features.map(photo => [photo.id, photo]))
                batch.forEach(([id, { resolve }]) => resolve(photos.get(id) ?? null))
            })
            .catch(error => batch.forEach(([, { reject }]) => reject(error)))
    }
}

function getFotoshiAttribution(photo) {
    const properties = photo?.properties ?? {}
    const author = properties.creator_name || properties.username
    const license = properties.image_license ?? photo?.assets?.thumbnail?.license
    const licenseUrl = photo?.links?.find(link => link.rel === "license")?.href
    return ["Fotoshi", author, properties.source_organization, license, licenseUrl].filter(Boolean).join(" · ")
}

function attachFotoshiHoverCaptureHandler(elem, photo) {
    const coordinates = photo?.geometry?.type === "Point" ? photo.geometry.coordinates : null
    if (Number.isFinite(coordinates?.[0]) && Number.isFinite(coordinates?.[1])) {
        elem.addEventListener("mouseenter", () => showActiveNodeMarker(coordinates[1], coordinates[0], "#0022ff", true))
    }
    appendTitleLine(elem, getFotoshiAttribution(photo))
    appendTitleLine(elem, photo?.properties?.capture_date)
}

function makeFotoshiValue(elem) {
    if (!GM_config.get("ImagesAndLinksInTags") || elem.classList.contains("fotoshied")) return
    const ids = elem.textContent.split(";").map(id => id.trim())
    if (ids.length === 0 || !ids.every(id => /^[a-zA-Z0-9_-]+$/.test(id))) return
    elem.classList.add("fotoshied")
    elem.replaceChildren()
    ids.forEach((id, index) => {
        if (index) elem.append("; ")
        const wrapper = document.createElement("span")
        const link = document.createElement("a")
        link.textContent = id
        link.target = "_blank"
        link.rel = "noreferrer"
        link.classList.add("preview-img-link")
        wrapper.append(link)
        elem.append(wrapper)
        void downloadFotoshiPhoto(id)
            .then(async photo => {
                if (!photo) {
                    link.classList.add("warn-tag")
                    return
                }
                const imgSrc = photo.assets?.["image-1280"]?.href ?? photo.assets?.thumbnail?.href
                if (!imgSrc) return
                const coords = photo.geometry?.type === "Point" ? photo.geometry.coordinates : null
                const params = new URLSearchParams({ photo: id, panel: "gallery", view: "photos", drawer: "open" })
                if (Number.isFinite(coords?.[0]) && Number.isFinite(coords?.[1])) {
                    params.set("lng", coords[0])
                    params.set("lat", coords[1])
                    params.set("z", "18")
                }
                link.href = `https://fotoshi.com/explore?${params}`
                const img = isSafari
                    ? document.createElement("img")
                    : GM_addElement("img", { src: imgSrc, alt: "Image from Fotoshi", width: "100%" })
                img.alt = "Image from Fotoshi"
                img.style.width = "100%"
                img.onerror = () => (img.style.display = "none")
                if (isSafari) img.src = await fetchImageWithCache(imgSrc)
                link.append(img)
                attachFotoshiHoverCaptureHandler(link, photo)
            })
            .catch(error => console.error("Failed to load Fotoshi photo", id, error))
    })
    elem.onclick = e => e.stopImmediatePropagation()
}

async function downloadInaturalistInfo(id) {
    const ids = (Array.isArray(id) ? id : `${id}`.split(";")).map(i => i.trim()).filter(Boolean)
    if (ids.length === 0) {
        return { results: [] }
    }
    return (
        await externalFetchRetry({
            url:
                `https://api.inaturalist.org/v1/observations?` +
                new URLSearchParams({
                    id: ids.join(","),
                    per_page: ids.length,
                    verifiable: "any",
                }).toString(),
            responseType: "json",
        })
    ).response
}

function inaturalistMouseEnter(info) {
    const lat = parseFloat(info?.geojson?.coordinates?.[1] ?? info?.latitude ?? info?.location?.split(",")?.[0])
    const lon = parseFloat(info?.geojson?.coordinates?.[0] ?? info?.longitude ?? info?.location?.split(",")?.[1])
    if (Number.isNaN(lat) || Number.isNaN(lon)) {
        return
    }
    showActiveNodeMarker(lat, lon, "#0022ff", true)
}

function makeRefInaturalistValue(elem) {
    if (!GM_config.get("ImagesAndLinksInTags")) return
    if (elem.classList.contains("inaturalisted")) {
        return
    }
    elem.classList.add("inaturalisted")
    if (!elem.querySelector("a") && elem.textContent.trim().match(/^[0-9;\s]+$/)) {
        const ids = elem.textContent.split(";")
        if (ids.length !== 0 && ids.every(i => i.match(/^[0-9]+$/))) {
            elem.replaceChildren()
            ids.forEach((id, index) => {
                if (index !== 0) {
                    elem.append(";")
                }
                const a = document.createElement("a")
                a.href = `https://www.inaturalist.org/observations/${id}`
                a.target = "_blank"
                a.rel = "noreferrer"
                a.textContent = id
                elem.appendChild(a)
            })
        }
    }
    setTimeout(async () => {
        const anchors = Array.from(elem.querySelectorAll('a[href^="https://www.inaturalist.org/observations/"]:not(.preview-img-link)'))
        if (anchors.length === 0) {
            return
        }
        anchors.forEach(a => a.classList.add("preview-img-link"))
        const response = await downloadInaturalistInfo(anchors.map(a => a.textContent))
        if (response["error"]) {
            console.error(response)
            return
        }
        const observationsById = new Map(response?.results?.map(observation => [`${observation.id}`, observation]) ?? [])
        for (const a of anchors) {
            const observation = observationsById.get(a.textContent)
            if (!observation) {
                a.classList.add("warn-tag")
                a.title = t("objectPage.observationNotFound")
                continue
            }
            const { zoomSrc: imgSrc } = getInaturalistPhotoUrls(observation)
            if (imgSrc) {
                if (isSafari) {
                    fetchImageWithCache(imgSrc).then(async imgData => {
                        const img = document.createElement("img")
                        img.src = imgData
                        img.alt = "image from iNaturalist"
                        img.style.width = "100%"
                        a.appendChild(img)
                    })
                } else {
                    const img = GM_addElement("img", {
                        src: imgSrc,
                        alt: "image from iNaturalist",
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
            }
            attachInaturalistHoverCaptureHandler(a, observation)
        }
    })
    elem.onclick = e => {
        e.stopImmediatePropagation()
    }
}

//</editor-fold>
