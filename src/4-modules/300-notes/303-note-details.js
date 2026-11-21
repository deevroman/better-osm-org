//<editor-fold desc="note-details" defaultstate="collapsed">

function tryReloadSidebar() {
    try {
        getWindow().OSM.router.route(location.pathname)
    } catch (e) {
        console.error(e)
        window.location.reload()
    }
}

function addTimebackButton(timestamp) {
    try {
        let timeSource = "note creation date"
        const noteText = document.querySelector(".overflow-hidden")?.textContent
        const mapsmeDate = noteText?.match(/OSM data version: (\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z)/)
        if (mapsmeDate) {
            timestamp = mapsmeDate[1]
            timeSource = "MAPS.ME snapshot date"
        }
        const organicmapsDate = noteText?.match(/OSM snapshot date: (\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z)/)
        if (organicmapsDate) {
            timestamp = organicmapsDate[1]
            const appName = noteText.includes("CoMaps") ? "CoMaps" : "OrganicMaps"
            timeSource = appName + " snapshot date"
        }
        const lat = document.querySelector("#sidebar_content .latitude").textContent.replace(",", ".")
        const lon = document.querySelector("#sidebar_content .longitude").textContent.replace(",", ".")
        const zoom = 18
        const tooltipText = noteText
            .trim()
            .slice(0, 50)
            .replaceAll('"', "")
            .replaceAll("\n", " ")
            .replace(/The place has gone.*$/, "")
            .trim()
        const styleSuffix = `

make way ::geom = lstr(pt(${lat}, ${lon})), ::id=0;
out center;

{{style:
node[@id=0] {
  symbol-size: 2;
  fill-opacity: 1;
  color: red;
  fill-color: red;
  text: eval("'${tooltipText}'");
}
}}
`
        const query = `// via ${timeSource}
[date:"${timestamp}"][maxsize:32Mi];
(
  node({{bbox}});
  way({{bbox}});
  //relation({{bbox}});
);
(._;>;);
out meta;
${styleSuffix}`
        const btn = document.createElement("a")
        btn.id = "timeback-btn"
        if (organicmapsDate || mapsmeDate) {
            btn.title = t("notes.openMapStateSnapshot")
        } else {
            btn.title = t("notes.openMapStateNoteCreation")
        }
        btn.textContent = " 🕰"
        btn.style.cursor = "pointer"
        document.querySelector("#sidebar_content time").after(btn)
        btn.onclick = e => {
            e.preventDefault()
            const params = new URLSearchParams({
                Q: query,
                C: `${lat};${lon};${zoom}`,
            })
            window.open(`${overpass_server.url}?${params}&R`)
        }
    } catch (e) {
        console.error("setup timeback button fail", e)
    }
}

function processAttachedGpsTracks() {
    document.querySelectorAll("#sidebar_content div:has(h4) a:not(.gpx-displayed)").forEach(i => {
        i.classList.add("gpx-displayed")
        const m = i.href.match(new RegExp(`${osm_server.url}/user/.+/traces/(\\d+)`))
        if (m) {
            externalFetchRetry({
                url: `${osm_server.url}/traces/${m[1]}/data`,
            }).then(res => displayGPXTrack(res.response))
        }
    })
}

function addStreetCompletePhotos(isClosedNote) {
    document.querySelectorAll("#sidebar_content div:has(h4) a").forEach(i => {
        if (i.href?.match(streetCompletePhotoUrlRegex)) {
            const imgSrc = i.href
            if (isSafari) {
                fetchImageWithCache(imgSrc).then(async imgData => {
                    const img = document.createElement("img")
                    img.src = imgData
                    if (!isClosedNote) {
                        img.style.width = "100%"
                    }
                    img.onerror = () => {
                        img.style.display = "none"
                    }
                    img.onload = () => {
                        img.style.width = "100%"
                    }
                    i.after(img)
                })
            } else {
                const img = GM_addElement("img", {
                    src: imgSrc,
                    // crossorigin: "anonymous"
                })
                if (!isClosedNote) {
                    img.style.width = "100%"
                }
                img.onerror = () => {
                    img.style.display = "none"
                }
                img.onload = () => {
                    img.style.width = "100%"
                }
                i.after(img)
            }
            document.querySelector("#sidebar").style.resize = "horizontal"
            makeSidebarWider()
            // hideSearchForm()
        }
    })
}

function addRelatedChangesetsSearch() {
    if (true || !isDebug()) {
        return
    }
    const lastCommentTime = Array.from(document.querySelectorAll("#sidebar_content article time")).at(-1)
    const findChangesetsBtn = document.createElement("span")
    findChangesetsBtn.textContent = " 🔍"
    findChangesetsBtn.style.cursor = "pointer"
    findChangesetsBtn.onclick = async e => {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
        findChangesetsBtn.style.cursor = "progress"
        const closeTime = new Date(lastCommentTime.getAttribute("datetime"))
        const prevDay = new Date(closeTime.getTime() - 24 * 60 * 60 * 1000)
        const nextDay = new Date(closeTime.getTime() + 24 * 60 * 60 * 1000)
        const username = lastCommentTime.previousElementSibling.getAttribute("href").match(/user\/(.+)$/)[1]
        const changesetsPrev = await loadChangesetsBetween(username, prevDay, closeTime)
        const changesetsNext = await loadChangesetsBetween(username, closeTime, nextDay)

        const menu = makeContextMenuElem(e)
        const ul = document.createElement("ul")
        const li = document.createElement("li")
        li.textContent = "test"
        ul.appendChild(li)
        menu.appendChild(ul)
        document.body.appendChild(menu)
        console.log(changesetsPrev)
        console.log(changesetsNext)

        findChangesetsBtn.style.cursor = "pointer"
    }
    lastCommentTime.after(findChangesetsBtn)
}

//</editor-fold>
