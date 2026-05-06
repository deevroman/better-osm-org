//<editor-fold desc="photos-gallery" defaultstate="collapsed">

let photosHoverZoomToken = 0

function hidePhotosHoverZoomPopup() {
    const hoverZoomPopup = document.getElementById("photos-hover-zoom-popup")
    if (!hoverZoomPopup) {
        return
    }
    hoverZoomPopup.style.display = "none"
    hoverZoomPopup.style.visibility = "visible"
}

function getOrCreatePhotosHoverZoomPopup() {
    let hoverZoomPopup = document.getElementById("photos-hover-zoom-popup")
    if (!hoverZoomPopup) {
        hoverZoomPopup = document.createElement("div")
        hoverZoomPopup.id = "photos-hover-zoom-popup"
        Object.assign(hoverZoomPopup.style, {
            position: "fixed",
            display: "none",
            zIndex: "100000",
            pointerEvents: "auto",
            padding: "6px",
            background: "var(--bs-body-bg)",
            borderRadius: "10px",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)",
            maxWidth: "calc(100vw - 16px)",
            overflowX: "auto",
            overflowY: "hidden",
            touchAction: "pan-x",
            overscrollBehaviorX: "contain",
            WebkitOverflowScrolling: "touch",
        })
        hoverZoomPopup.addEventListener("pointerdown", e => {
            e.stopPropagation()
        })
        hoverZoomPopup.addEventListener(
            "touchstart",
            e => {
                e.stopPropagation()
            },
            { passive: true },
        )
        hoverZoomPopup.addEventListener(
            "touchmove",
            e => {
                e.stopPropagation()
            },
            { passive: true },
        )
        hoverZoomPopup.addEventListener(
            "touchend",
            e => {
                e.stopPropagation()
            },
            { passive: true },
        )
        hoverZoomPopup.addEventListener(
            "touchcancel",
            e => {
                e.stopPropagation()
            },
            { passive: true },
        )
        hoverZoomPopup.addEventListener("contextmenu", e => {
            e.stopPropagation()
            e.preventDefault()
        })
        document.body.append(hoverZoomPopup)
    }
    return hoverZoomPopup
}

function placePhotosHoverZoomPopup(previewEl, hoverZoomPopup) {
    const previewRect = previewEl.getBoundingClientRect()
    const popupRect = hoverZoomPopup.getBoundingClientRect()
    const popupWidth = popupRect.width || 494
    const popupHeight = popupRect.height || 374
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const edgePadding = 8
    const gap = 10

    let left = previewRect.left + previewRect.width / 2 - popupWidth / 2
    left = Math.max(edgePadding, Math.min(left, viewportWidth - popupWidth - edgePadding))

    let top = previewRect.top - gap - popupHeight
    if (top < edgePadding) {
        top = previewRect.bottom + gap
    }
    if (top + popupHeight > viewportHeight - edgePadding) {
        top = Math.max(edgePadding, viewportHeight - popupHeight - edgePadding)
    }

    hoverZoomPopup.style.left = `${left}px`
    hoverZoomPopup.style.top = `${top}px`
    hoverZoomPopup.style.transform = "none"
}

function attachPhotosCarouselHoverZoom(previewEl) {
    if (previewEl.getAttribute("data-hover-zoom-bound")) {
        return
    }
    previewEl.setAttribute("data-hover-zoom-bound", "1")

    const hoverZoomPopup = getOrCreatePhotosHoverZoomPopup()
    const hideHoverZoom = () => {
        hidePhotosHoverZoomPopup()
    }

    previewEl.addEventListener("mouseenter", () => {
        const hoverToken = ++photosHoverZoomToken
        hoverZoomPopup.style.display = "none"
        hoverZoomPopup.replaceChildren()
        if (hoverToken !== photosHoverZoomToken) {
            return
        }
        if (!document.body.contains(previewEl)) {
            return
        }
        const zoomImgSrc = previewEl.getAttribute("data-photo-zoom-src")
        if (!zoomImgSrc) {
            return
        }
        const thumbImgSrc = previewEl.getAttribute("data-photo-thumb-src")
        if (!thumbImgSrc) {
            return
        }
        hoverZoomPopup.replaceChildren()
        const zoomWrapper = document.createElement("div")
        Object.assign(zoomWrapper.style, {
            position: "relative",
            width: "480px",
            height: "360px",
            borderRadius: "6px",
            overflow: "hidden",
            background: "var(--bs-body-bg)",
        })
        const thumbImg = GM_addElement("img", {
            src: thumbImgSrc,
            width: "480",
        })
        Object.assign(thumbImg.style, {
            display: "block",
            width: "480px",
            height: "360px",
            objectFit: "cover",
            borderRadius: "6px",
        })
        const zoomImg = GM_addElement("img", {
            src: zoomImgSrc,
            width: "480",
        })
        Object.assign(zoomImg.style, {
            display: "block",
            position: "absolute",
            inset: "0",
            opacity: "0",
            width: "480px",
            height: "360px",
            objectFit: "cover",
            borderRadius: "6px",
        })
        zoomImg.onerror = () => {
            zoomImg.style.display = "none"
        }
        zoomImg.onload = () => {
            if (hoverToken !== photosHoverZoomToken) {
                return
            }
            zoomImg.style.opacity = "1"
        }
        zoomWrapper.append(thumbImg)
        zoomWrapper.append(zoomImg)
        hoverZoomPopup.append(zoomWrapper)
        hoverZoomPopup.style.visibility = "hidden"
        hoverZoomPopup.style.display = "block"
        placePhotosHoverZoomPopup(previewEl, hoverZoomPopup)
        hoverZoomPopup.style.visibility = "visible"
    })
    previewEl.addEventListener("mousemove", () => {
        if (hoverZoomPopup.style.display !== "none") {
            placePhotosHoverZoomPopup(previewEl, hoverZoomPopup)
        }
    })
    previewEl.addEventListener("mouseleave", e => {
        const nextEl = e.relatedTarget
        if (nextEl && nextEl.closest?.("#photos-preview-gallery")) {
            return
        }
        photosHoverZoomToken += 1
        hideHoverZoom()
    })
    previewEl.addEventListener("click", hideHoverZoom)
}

/**
 * @param {{tags, type, id}[]} withPhotos
 */
function renderPhotosPreview(withPhotos) {
    const mapEl = document.getElementById("map")
    if (!mapEl) {
        return
    }
    Object.assign(mapEl.style, {
        position: "relative",
    })

    let photosPreviewGallery = document.getElementById("photos-preview-gallery")
    if (!photosPreviewGallery) {
        photosPreviewGallery = document.createElement("div")
        photosPreviewGallery.id = "photos-preview-gallery"
        Object.assign(photosPreviewGallery.style, {
            position: "absolute",
            left: "0",
            transform: "none",
            bottom: "0",
            width: "100%",
            maxWidth: "100%",
            height: "96px",
            padding: "10px 12px",
            boxSizing: "border-box",
            display: "flex",
            gap: "8px",
            overflowX: "auto",
            overflowY: "hidden",
            zIndex: "99999",
            background: "transparent",
            touchAction: "pan-x",
            overscrollBehaviorX: "contain",
            WebkitOverflowScrolling: "touch",
        })
        photosPreviewGallery.addEventListener(
            "wheel",
            e => {
                e.stopPropagation()
                if (e.deltaX !== 0 || e.deltaY !== 0) {
                    photosPreviewGallery.scrollLeft += e.deltaX + e.deltaY
                    e.preventDefault()
                }
            },
            { passive: false },
        )
        photosPreviewGallery.addEventListener("pointerdown", e => {
            e.stopPropagation()
        })
        photosPreviewGallery.addEventListener(
            "touchstart",
            e => {
                e.stopPropagation()
            },
            { passive: true },
        )
        photosPreviewGallery.addEventListener(
            "touchmove",
            e => {
                e.stopPropagation()
            },
            { passive: true },
        )
        photosPreviewGallery.addEventListener(
            "touchend",
            e => {
                e.stopPropagation()
            },
            { passive: true },
        )
        photosPreviewGallery.addEventListener(
            "touchcancel",
            e => {
                e.stopPropagation()
            },
            { passive: true },
        )
        photosPreviewGallery.addEventListener("contextmenu", e => {
            e.stopPropagation()
            e.preventDefault()
        })
        photosPreviewGallery.addEventListener("mouseleave", () => {
            hidePhotosHoverZoomPopup()
        })
        mapEl.append(photosPreviewGallery)
    }

    photosPreviewGallery.replaceChildren()
    function makePlaceholder() {
        const placeholder = document.createElement("div")
        placeholder.classList.add("photo-preview")
        Object.assign(placeholder.style, {
            flex: "0 0 72px",
            height: "72px",
            border: "1px solid #c7c7c7",
            borderRadius: "8px",
            background: "#f3f3f3",
            overflow: "hidden",
            pointerEvents: "auto",
            cursor: "pointer",
        })
        return placeholder
    }
    withPhotos.forEach(photoObj => {
        Object.entries(photoObj.tags ?? {}).forEach(([k, v]) => {
            if (k.startsWith("panoramax")) {
                v.split(";").forEach(i => {
                    const uuid = i?.match?.(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)?.[0]
                    const placeholder = makePlaceholder()
                    if (uuid) {
                        placeholder.setAttribute("data-panoramax-uuid", uuid.toLowerCase())
                    }
                    placeholder.setAttribute("data-osm-path", "/" + photoObj.type + "/" + photoObj.id)
                    photosPreviewGallery.append(placeholder)
                })
            } else if (k.startsWith("mapillary")) {
                v.split(";").forEach(i => {
                    const id = i?.match?.(/[0-9]+/)?.[0]
                    const placeholder = makePlaceholder()
                    if (id) {
                        placeholder.setAttribute("data-mapillary-id", id)
                    }
                    placeholder.setAttribute("data-osm-path", "/" + photoObj.type + "/" + photoObj.id)
                    photosPreviewGallery.append(placeholder)
                })
            } else if (k.startsWith("wikimedia_commons")) {
                v.split(";").forEach(i => {
                    const placeholder = makePlaceholder()
                    placeholder.setAttribute("data-wikimedia-id", i)
                    placeholder.setAttribute("data-osm-path", "/" + photoObj.type + "/" + photoObj.id)
                    photosPreviewGallery.append(placeholder)
                })
            } else if (k.startsWith("ref:inaturalist.org")) {
                v.split(";").forEach(i => {
                    const placeholder = makePlaceholder()
                    placeholder.setAttribute("data-inaturalist-id", i)
                    placeholder.setAttribute("data-osm-path", "/" + photoObj.type + "/" + photoObj.id)
                    photosPreviewGallery.append(placeholder)
                })
            }
        })
    })

    function addClick(elem) {
        const osmPath = elem.getAttribute("data-osm-path")
        if (osmPath && !elem.getAttribute("data-route-bound")) {
            elem.setAttribute("data-route-bound", "1")
            elem.onclick = e => {
                e.stopPropagation()
                getWindow().OSM.router.route(osmPath)
            }
        }
    }

    function addImg(thumbSrc, previewEl) {
        const img = GM_addElement("img", {
            src: thumbSrc,
            width: "100%",
        })
        Object.assign(img.style, {
            height: "100%",
            objectFit: "cover",
        })
        img.onerror = () => {
            img.style.display = "none"
        }
        previewEl.append(img)
    }

    document.querySelectorAll("#photos-preview-gallery .photo-preview[data-panoramax-uuid]").forEach(previewEl => {
        addClick(previewEl)
        const uuid = previewEl.getAttribute("data-panoramax-uuid")
        if (!uuid) {
            return
        }
        const thumbSrc = `${panoramaxDiscoveryServer}/api/pictures/${uuid}/thumb.jpg`
        previewEl.setAttribute("data-photo-thumb-src", thumbSrc)
        previewEl.setAttribute("data-photo-zoom-src", `${panoramaxDiscoveryServer}/api/pictures/${uuid}/sd.jpg`)
        attachPhotosCarouselHoverZoom(previewEl)
        if (previewEl.querySelector("img")) {
            return
        }
        addImg(thumbSrc, previewEl)
        void attachPanoramaxHoverCaptureHandler(previewEl, uuid, panoramaxDiscoveryServer)
    })

    document.querySelectorAll("#photos-preview-gallery .photo-preview[data-mapillary-id]").forEach(previewEl => {
        addClick(previewEl)
        setTimeout(async () => {
            const id = previewEl.getAttribute("data-mapillary-id")
            const res = await downloadMapillaryPhotoInfo(id)
            if (res["error"]) {
                return
            }
            const thumbSrc = res["thumb_256_url"]
            previewEl.setAttribute("data-photo-thumb-src", thumbSrc)
            previewEl.setAttribute("data-photo-zoom-src", res["thumb_1024_url"])
            attachPhotosCarouselHoverZoom(previewEl)
            if (previewEl.querySelector("img")) {
                return
            }
            addImg(thumbSrc, previewEl)
            attachMapillaryHoverCaptureHandler(previewEl, res)
        })
    })

    document.querySelectorAll("#photos-preview-gallery .photo-preview[data-wikimedia-id]").forEach(previewEl => {
        addClick(previewEl)
        setTimeout(async () => {
            const id = previewEl.getAttribute("data-wikimedia-id")
            let resolvedId = id
            if (id?.startsWith("Category:")) {
                const categoryResponse = await downloadWikimediaCategoryInfo(id, 1)
                resolvedId = categoryResponse?.query?.categorymembers?.[0]?.title
            }
            if (!resolvedId) {
                return
            }
            const res = await downloadWikimediaInfo(resolvedId)
            const thumbSrc = res["query"]["pages"]["-1"]["imageinfo"][0]["thumburl"]

            previewEl.setAttribute("data-photo-thumb-src", thumbSrc)
            previewEl.setAttribute("data-photo-zoom-src", res["query"]["pages"]["-1"]["imageinfo"][0]["url"])
            attachPhotosCarouselHoverZoom(previewEl)
            if (previewEl.querySelector("img")) {
                return
            }
            addImg(thumbSrc, previewEl)
            attachWikimediaHoverCaptureHandler(previewEl, res)
        })
    })

    document.querySelectorAll("#photos-preview-gallery .photo-preview[data-inaturalist-id]").forEach(previewEl => {
        addClick(previewEl)
        setTimeout(async () => {
            const id = previewEl.getAttribute("data-inaturalist-id")
            const response = await downloadInaturalistInfo(id)
            if (response["error"]) {
                return
            }
            const observation = response?.results?.[0]
            if (!observation) {
                return
            }
            const { thumbSrc, zoomSrc } = getInaturalistPhotoUrls(observation)
            if (!thumbSrc || !zoomSrc) {
                return
            }

            previewEl.setAttribute("data-photo-thumb-src", thumbSrc)
            previewEl.setAttribute("data-photo-zoom-src", zoomSrc)
            attachPhotosCarouselHoverZoom(previewEl)
            if (previewEl.querySelector("img")) {
                return
            }
            addImg(thumbSrc, previewEl)
            attachInaturalistHoverCaptureHandler(previewEl, observation)
        })
    })
}

//</editor-fold>
