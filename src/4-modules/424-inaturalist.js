//<editor-fold desc="inaturalist" defaultstate="collapsed">

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
