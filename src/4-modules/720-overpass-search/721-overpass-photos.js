const panoramaxVectorMapSourceId = "panoramax-photos-source"
const panoramaxVectorMapLayerId = "panoramax-photos-layer"
let panoramaxVectorMapImageIds = []

function extractPanoramaxUuidFromTags(tags) {
    const panoramaxTagValue = Object.entries(tags || {}).find(([k, _]) => k.startsWith("panoramax"))?.[1]
    return panoramaxTagValue?.match?.(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)?.[0]?.toLowerCase() ?? null
}

async function addBase64ImageToVectorMap(map, imageId, base64DataUrl) {
    const image = document.createElement("img")
    await new Promise((resolve, reject) => {
        image.onload = resolve
        image.onerror = reject
        image.src = base64DataUrl
    })
    if (map.hasImage(imageId)) {
        map.removeImage(imageId)
    }
    map.addImage(imageId, image)
}

async function renderPanoramaxPhotoPointOnVectorMap(withPhotos) {
    const map = findVectorMap()
    if (!map) {
        return
    }
    if (!map.isStyleLoaded?.()) {
        return
    }

    if (map.getLayer(panoramaxVectorMapLayerId)) {
        map.removeLayer(panoramaxVectorMapLayerId)
    }
    if (map.getSource(panoramaxVectorMapSourceId)) {
        map.removeSource(panoramaxVectorMapSourceId)
    }
    panoramaxVectorMapImageIds.forEach(imageId => {
        if (map.hasImage(imageId)) {
            map.removeImage(imageId)
        }
    })
    panoramaxVectorMapImageIds = []

    /** @type {import("geojson").Feature[]} */
    const features = []
    const loadedImageIds = new Set()

    for (const photoObj of withPhotos) {
        const uuid = extractPanoramaxUuidFromTags(photoObj.tags)
        if (!uuid || !Number.isFinite(photoObj.lat) || !Number.isFinite(photoObj.lon)) {
            continue
        }
        const imageId = `panoramax-thumb-${uuid}`
        if (!loadedImageIds.has(imageId)) {
            const imgSrc = `${panoramaxDiscoveryServer}/api/pictures/${uuid}/thumb.jpg`
            try {
                const base64DataUrl = await fetchImageWithCache(imgSrc)
                await addBase64ImageToVectorMap(map, imageId, base64DataUrl)
                panoramaxVectorMapImageIds.push(imageId)
                loadedImageIds.add(imageId)
            } catch (e) {
                console.error("failed to load panoramax image", uuid, e)
                continue
            }
        }
        features.push({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [photoObj.lon, photoObj.lat],
            },
            properties: {
                iconId: imageId,
            },
        })
    }
    if (!features.length) {
        return
    }

    map.addSource(panoramaxVectorMapSourceId, {
        type: "geojson",
        data: {
            type: "FeatureCollection",
            features: features,
        },
    })
    map.addLayer({
        id: panoramaxVectorMapLayerId,
        type: "symbol",
        source: panoramaxVectorMapSourceId,
        layout: {
            "icon-image": ["get", "iconId"],
            "icon-size": 0.25,
            "icon-allow-overlap": true,
            "icon-ignore-placement": true,
        },
    })
}

function startPhotosRender(xml) {
    setTimeout(async () => {
        const withPhotos = Array.from(
            xml.querySelectorAll(
                ':has(>:is([k^=panoramax],[k^=mapillary],[k^=wikimedia_commons],[k^="ref:inaturalist.org"],[k="image:fotoshi"],[k="fotoshi"]))',
            ),
        ).map(i => {
            const res = {
                id: parseInt(i.getAttribute("id")),
                type: i.nodeName,
                tags: Object.fromEntries(Array.from(i.querySelectorAll("tag")).map(j => [j.getAttribute("k"), j.getAttribute("v")])),
            }
            if (res.type === "node") {
                res.lat = parseFloat(i.getAttribute("lat"))
                res.lon = parseFloat(i.getAttribute("lon"))
            }
            return res
        })
        renderPhotosPreview(withPhotos)
        // await renderPanoramaxPhotoPointOnVectorMap(withPhotos)
    })
}
