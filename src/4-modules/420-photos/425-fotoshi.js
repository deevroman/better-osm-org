//<editor-fold desc="fotoshi" defaultstate="collapsed">

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

//</editor-fold>
