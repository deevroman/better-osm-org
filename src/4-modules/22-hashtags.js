//<editor-fold desc="hashtags" defaultstate="collapsed">

function makeHashtagsClickable() {
    if (!GM_config.get("ImagesAndLinksInTags")) return

    const comment = document.querySelector("#element_versions_list > div p") ?? document.querySelector(".browse_section > div p") ?? document.querySelector("#sidebar_content h2 + div > div > p")
    comment?.childNodes?.forEach(node => {
        if (node.nodeType !== Node.TEXT_NODE) return
        const span = document.createElement("span")
        span.textContent = node.textContent
        span.innerHTML = span.innerHTML.replaceAll(/\B(#[\p{L}\d_-]+)\b/gu, function (match) {
            const osmchaFilter = { comment: [{ label: match, value: match }] }
            const osmchaLink = `${osmcha_server_origin}?` + new URLSearchParams({ filters: JSON.stringify(osmchaFilter) }).toString()
            const a = document.createElement("a")
            a.href = osmchaLink
            a.target = "_blank"
            a.title = "Search this hashtags in OSMCha"
            a.textContent = match
            return a.outerHTML
        })
        node.replaceWith(span)
    })
}

function makeHashtagsInNotesClickable() {
    if (!GM_config.get("ImagesAndLinksInTags")) return

    const notesParagraphs = Array.from(document.querySelectorAll("#sidebar_content h4 ~ div:first-of-type > p"))
    const commentsParagraphs = Array.from(document.querySelectorAll("#sidebar_content article p"))
    ;[...commentsParagraphs, ...notesParagraphs].forEach(p => {
        p?.childNodes?.forEach(node => {
            if (node.nodeType !== Node.TEXT_NODE) return
            const span = document.createElement("span")
            span.textContent = node.textContent
            span.innerHTML = span.innerHTML
                .replaceAll(/(^|\B)(#[\p{L}\d_-]+)(\b|$)/gu, function (match) {
                    if (match.match(/^#[0-9]+$/)) {
                        return match
                    }
                    // const notesReviewLink = "https://ent8r.github.io/NotesReview/?" + new URLSearchParams({
                    //     view: "map",
                    //     status: "open",
                    //     area: "view",
                    //     limit: 30,
                    //     query: match
                    // }).toString()

                    const a = document.createElement("a")
                    a.id = "note-link-" + Math.random()
                    a.href = ""
                    a.target = "_blank"
                    a.title = "Click for filter notes by this hashtag.\nClick with CTLR or Shift for search this hashtags in osm-note-viewer"
                    a.textContent = match

                    function fixLink() {
                        const center = getMapCenter()
                        const zoom = getZoom()
                        // prettier-ignore
                        const notesReviewLink =
                            "https://antonkhorev.github.io/osm-note-viewer/#" +
                            new URLSearchParams({
                                mode: "search",
                                q: match,
                                bbox: [
                                    Math.round(getMap().getBounds().getWest() * 10000) / 10000,
                                    Math.round(getMap().getBounds().getSouth() * 10000) / 10000,
                                    Math.round(getMap().getBounds().getEast() * 10000) / 10000,
                                    Math.round(getMap().getBounds().getNorth() * 10000) / 10000
                                ].join(","),
                                sort: "created_at",
                                order: "newest",
                                closed: "0",
                                map: `${zoom}/${center.lat}/${center.lng}`,
                            }).toString()
                        const link = document.getElementById(a.id)
                        link.href = notesReviewLink
                        link.onclick = e => {
                            if (e.shiftKey || e.ctrlKey || e.metaKey) {
                                return
                            }
                            e.preventDefault()
                            if (document.querySelector(".layers-ui").style.display === "none") {
                                document.querySelector(".control-layers a").click()
                            }
                            Array.from(document.querySelectorAll(".overlay-layers label"))[0].scrollIntoView({ block: "center" })
                            document.querySelector("#filter-notes-by-string").value = match
                            e.target?.classList?.add("wait-fetch")
                            updateNotesLayer()
                        }
                        console.log("search link in note was fixed")
                    }

                    setTimeout(() => {
                        interceptMapManually().then(fixLink)
                    })
                    setTimeout(fixLink, 1000)
                    return a.outerHTML
                })
                .replaceAll(/(?<=(POI name: ))(.+)/gu, function (match) {
                    const span = document.createElement("span")
                    span.classList.add("poi-name-in-note")
                    span.title = "Click to copy name"
                    span.setAttribute("data-name", match)
                    span.textContent = match
                    return span.outerHTML
                })
                .replaceAll(/(?<=(POI types: ))(.+)/gu, function (match) {
                    injectCSSIntoOSMPage(copyAnimationStyles)
                    const span = document.createElement("span")
                    span.classList.add("poi-name-in-note")
                    span.title = "Click to copy type"
                    span.setAttribute("data-name", match)
                    span.textContent = match
                    return span.outerHTML
                })
            document.querySelectorAll(".poi-name-in-note").forEach(elem => {
                elem.style.cursor = "pointer"
                elem.addEventListener("click", e => {
                    const name = e.target.getAttribute("data-name")
                    navigator.clipboard.writeText(name).then(() => copyAnimation(e, name))
                })
            })
            node.replaceWith(span)
        })
    })
}

//</editor-fold>
