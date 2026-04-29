//<editor-fold desc="photos-gallery" defaultstate="collapsed">

let panoramaxHoverZoomToken = 0

function hidePanoramaxHoverZoomPopup() {
    const hoverZoomPopup = document.getElementById("panoramax-hover-zoom-popup")
    if (!hoverZoomPopup) {
        return
    }
    hoverZoomPopup.style.display = "none"
    hoverZoomPopup.style.visibility = "visible"
}

function getOrCreatePanoramaxHoverZoomPopup() {
    let hoverZoomPopup = document.getElementById("panoramax-hover-zoom-popup")
    if (!hoverZoomPopup) {
        hoverZoomPopup = document.createElement("div")
        hoverZoomPopup.id = "panoramax-hover-zoom-popup"
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

function placePanoramaxHoverZoomPopup(previewEl, hoverZoomPopup) {
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

function attachPanoramaxCarouselHoverZoom(previewEl) {
    if (previewEl.getAttribute("data-hover-zoom-bound")) {
        return
    }
    previewEl.setAttribute("data-hover-zoom-bound", "1")

    const hoverZoomPopup = getOrCreatePanoramaxHoverZoomPopup()
    const hideHoverZoom = () => {
        hidePanoramaxHoverZoomPopup()
    }

    previewEl.addEventListener("mouseenter", () => {
        const hoverToken = ++panoramaxHoverZoomToken
        hoverZoomPopup.style.display = "none"
        hoverZoomPopup.replaceChildren()
        if (hoverToken !== panoramaxHoverZoomToken) {
            return
        }
        if (!document.body.contains(previewEl)) {
            return
        }
        const zoomImgSrc = previewEl.getAttribute("data-panoramax-zoom-src")
        if (!zoomImgSrc) {
            return
        }
        const thumbImgSrc = previewEl.getAttribute("data-panoramax-thumb-src")
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
            if (hoverToken !== panoramaxHoverZoomToken) {
                return
            }
            zoomImg.style.opacity = "1"
        }
        zoomWrapper.append(thumbImg)
        zoomWrapper.append(zoomImg)
        hoverZoomPopup.append(zoomWrapper)
        hoverZoomPopup.style.visibility = "hidden"
        hoverZoomPopup.style.display = "block"
        placePanoramaxHoverZoomPopup(previewEl, hoverZoomPopup)
        hoverZoomPopup.style.visibility = "visible"
    })
    previewEl.addEventListener("mousemove", () => {
        if (hoverZoomPopup.style.display !== "none") {
            placePanoramaxHoverZoomPopup(previewEl, hoverZoomPopup)
        }
    })
    previewEl.addEventListener("mouseleave", e => {
        const nextEl = e.relatedTarget
        if (nextEl && nextEl.closest?.("#photos-preview-gallery")) {
            return
        }
        panoramaxHoverZoomToken += 1
        hideHoverZoom()
    })
    previewEl.addEventListener("click", hideHoverZoom)
}

/**
 * @param {{tags, type, id}[]} withPhotos
 */
function renderPanoramaxPhotosPreview(withPhotos) {
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
            hidePanoramaxHoverZoomPopup()
        })
        mapEl.append(photosPreviewGallery)
    }

    photosPreviewGallery.replaceChildren()
    withPhotos.forEach(photoObj => {
        const placeholder = document.createElement("div")
        placeholder.classList.add("panoramax-preview")
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
        const panoramaxTagValue = Object.entries(photoObj.tags || {}).find(([k, _]) => k.startsWith("panoramax"))?.[1]
        const panoramaxUuid = panoramaxTagValue?.match?.(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)?.[0]
        if (panoramaxUuid) {
            placeholder.setAttribute("data-panoramax-uuid", panoramaxUuid.toLowerCase())
        }
        if (photoObj.type && photoObj.id) {
            placeholder.setAttribute("data-osm-path", "/" + photoObj.type + "/" + photoObj.id)
        }
        photosPreviewGallery.append(placeholder)
    })

    document.querySelectorAll("#photos-preview-gallery .panoramax-preview[data-panoramax-uuid]").forEach(previewEl => {
        const uuid = previewEl.getAttribute("data-panoramax-uuid")
        if (!uuid) {
            return
        }
        previewEl.setAttribute("data-panoramax-zoom-src", `${panoramaxDiscoveryServer}/api/pictures/${uuid}/sd.jpg`)
        previewEl.setAttribute("data-panoramax-thumb-src", `${panoramaxDiscoveryServer}/api/pictures/${uuid}/thumb.jpg`)
        const osmPath = previewEl.getAttribute("data-osm-path")
        if (osmPath && !previewEl.getAttribute("data-route-bound")) {
            previewEl.setAttribute("data-route-bound", "1")
            previewEl.onclick = e => {
                e.stopPropagation()
                getWindow().OSM.router.route(osmPath)
            }
        }
        attachPanoramaxCarouselHoverZoom(previewEl)
        if (previewEl.querySelector("img")) {
            return
        }
        const imgSrc = `${panoramaxDiscoveryServer}/api/pictures/${uuid}/thumb.jpg`
        const img = GM_addElement("img", {
            src: imgSrc,
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
        void attachPanoramaxHoverCaptureHandler(previewEl, uuid, panoramaxDiscoveryServer)
    })
}

//</editor-fold>
