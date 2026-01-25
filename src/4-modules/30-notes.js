//<editor-fold desc="notes" defaultstate="collapsed">

/**
 *
 * @param {string} text
 * @param {boolean} strict
 * @return {Object.<string, string>}
 */
function buildTags(text, strict = false) {
    const lines = text.split("\n")
    const json = {}
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        let eqPos = line.indexOf("=")
        if (eqPos <= 0 || eqPos === line.length - 1) {
            eqPos = line.indexOf("\t")
            if (eqPos <= 0 || eqPos === line.length - 1) {
                if (strict && line.trim() !== "") {
                    throw `Empty key or value in line №${i}: ${line}`
                }
                continue
            }
        }
        const k = line.substring(0, eqPos).trim()
        const v = line.substring(eqPos + 1).trim()
        if (v === "" || k === "") {
            if (strict && line.trim() !== "") {
                throw `Empty key or value in line №${i + 1}: ${line}`
            }
            continue
        }
        json[k] = v.replaceAll("\\\\", "\n")
    }
    return json
}

function makeTextareaFromTagsTable(table) {
    const textarea = document.createElement("textarea")
    table.querySelectorAll("tr:not(.add-tag-row)").forEach(i => {
        if (i.querySelector("th").textContent.trim() === "" || i.querySelector("td").textContent.trim() === "") return
        textarea.value += `${i.querySelector("th").textContent}=${i.querySelector("td").textContent.replaceAll("\\\\", "\n")}\n`
    })
    textarea.value = textarea.value.trim()
    textarea.rows = 5
    return textarea
}

function addCreateNewPOIButton() {
    if (!document.querySelector("#sidebar_content form")) {
        return
    }
    if (newNotePlaceholder && document.querySelector(".note form textarea")) {
        document.querySelector(".note form textarea").textContent = newNotePlaceholder
        document.querySelector(".note form textarea").selectionEnd = 0
        newNotePlaceholder = null
    }
    if (document.querySelector(".add-new-object-btn")) return
    const b = document.createElement("span")
    b.classList.add("add-new-object-btn", "btn", "btn-primary")
    b.textContent = "➕"
    if (!getMap()?.getZoom) {
        b.style.display = "none"
        interceptMapManually().then(() => {
            b.style.display = ""
        })
    }
    b.title = `Add new object on map\nPaste tags in textarea\nkey=value\nkey2=value2\n...`
    document.querySelector("#sidebar_content form div:has(input)").appendChild(b)
    b.before(document.createTextNode("\xA0"))
    b.onclick = e => {
        e.stopImmediatePropagation()
        const auth = makeAuth()

        console.log("Opening changeset")

        let tagsHint = ""
        let tags
        try {
            tags = buildTags(document.querySelector("#sidebar_content form textarea").value, true)
        } catch (e) {
            alert(e)
            return
        }
        if (Object.entries(tags).length === 0) {
            alert("Textarea not contains any tag")
            return
        }

        for (const i of Object.entries(tags)) {
            if (mainTags.includes(i[0])) {
                tagsHint = tagsHint + ` ${i[0]}=${i[1]}`
                break
            }
        }
        for (const i of Object.entries(tags)) {
            if (i[0] === "name") {
                tagsHint = tagsHint + ` ${i[0]}=${i[1]}`
                break
            }
        }
        const changesetTags = {
            created_by: `better osm.org v${GM_info.script.version}`,
            comment: tagsHint !== "" ? `Create${tagsHint}` : `Create node`,
        }

        const changesetPayload = document.implementation.createDocument(null, "osm")
        const cs = changesetPayload.createElement("changeset")
        changesetPayload.documentElement.appendChild(cs)
        tagsToXml(changesetPayload, cs, changesetTags)
        const chPayloadStr = new XMLSerializer().serializeToString(changesetPayload)

        auth.xhr(
            {
                method: "PUT",
                path: osm_server.apiBase + "changeset/create",
                prefix: false,
                content: chPayloadStr,
            },
            function (err1, result) {
                const changesetId = result
                console.log(changesetId)

                const nodePayload = document.createElement("osm")
                const node = document.createElement("node")
                nodePayload.appendChild(node)
                node.setAttribute("changeset", changesetId)

                const l = []
                getMap().eachLayer(intoPageWithFun(i => l.push(i)))
                const { lat: lat, lng: lng } = l.find(i => !!i._icon && i._icon.classList.contains("leaflet-marker-draggable"))._latlng
                node.setAttribute("lat", lat)
                node.setAttribute("lon", lng)

                for (const tag of Object.entries(tags)) {
                    const tagElem = document.createElement("tag")
                    tagElem.setAttribute("k", tag[0])
                    tagElem.setAttribute("v", tag[1])
                    node.appendChild(tagElem)
                }
                const nodeStr = new XMLSerializer().serializeToString(nodePayload).replace(/xmlns="[^"]+"/, "")
                auth.xhr(
                    {
                        method: "POST",
                        path: osm_server.apiBase + "nodes",
                        prefix: false,
                        content: nodeStr,
                        headers: { "Content-Type": "application/xml; charset=utf-8" },
                    },
                    function (err2) {
                        if (err2) {
                            console.log({ changesetError: err2 })
                        }
                        auth.xhr(
                            {
                                method: "PUT",
                                path: osm_server.apiBase + "changeset/" + changesetId + "/close",
                                prefix: false,
                            },
                            function (err3) {
                                if (!err3) {
                                    window.location = osm_server.url + "/changeset/" + changesetId
                                }
                            },
                        )
                    },
                )
            },
        )
    }
}

const noteHashtags = ["#added", "#fixed", "#irrelevant", "#alreadyfixed", "#needmoreinfo", "#surveyme", "#tooold", "#notonortophoto", "#notenoughinfo", "#inacurratelocation", "#needconfirmation"]

function addAutoComplete() {
    const container = document.querySelector("#sidebar")
    const ta = document.querySelector("form.mb-3 .form-control")
    let anchorPos = null // { left, top }
    let anchorStart = null

    const box = document.createElement("div")
    box.style.position = "absolute"
    box.style.border = "1px solid var(--bs-border-color)"
    box.style.background = "var(--bs-body-bg)"
    box.style.fontSize = "1rem"
    box.style.display = "none"
    box.style.zIndex = 1000
    container.appendChild(box)

    let items = []
    let index = 0
    let match = null

    function findMatch(value, pos) {
        const left = value.slice(0, pos)
        const m = left.match(/(^|\s)(#\w*)$/)
        if (!m) return null
        return { start: pos - m[2].length, text: m[2] }
    }

    function caretCoords(ta, pos, container) {
        const taRect = ta.getBoundingClientRect()
        const cRect = container.getBoundingClientRect()

        const div = document.createElement("div")
        div.style.padding = getComputedStyle(ta).padding

        div.style.position = "absolute"
        div.style.visibility = "hidden"
        div.style.top = taRect.top - cRect.top + container.scrollTop + "px"
        div.style.left = taRect.left - cRect.left + container.scrollLeft + "px"

        div.textContent = ta.value.slice(0, pos)

        const span = document.createElement("span")
        span.textContent = "\u200b"
        div.appendChild(span)

        container.appendChild(div)
        const r = span.getBoundingClientRect()
        container.removeChild(div)

        return {
            left: r.left - cRect.left + container.scrollLeft - ta.scrollLeft,
            top: r.top - cRect.top + container.scrollTop - ta.scrollTop,
            bottom: r.bottom - cRect.top + container.scrollTop - ta.scrollTop,
        }
    }

    function render() {
        box.innerHTML = ""
        items.forEach((t, i) => {
            const d = document.createElement("div")
            d.textContent = t
            d.style.padding = "0px 4px"
            d.style.cursor = "pointer"
            if (i === index) {
                d.style.background = "var(--bs-border-color-translucent)"
            }
            d.onmousedown = e => {
                e.preventDefault()
                index = i
                apply()
            }
            box.appendChild(d)
        })
        box.style.display = items.length ? "block" : "none"
    }

    function apply() {
        if (!items.length || !match) {
            return
        }
        ta.value = ta.value.slice(0, match.start) + items[index] + " " + ta.value.slice(match.start + match.text.length)
        box.style.display = "none"
    }

    ta.addEventListener("input", () => {
        const m = findMatch(ta.value, ta.selectionStart)
        if (!m) {
            box.style.display = "none"
            anchorPos = null
            anchorStart = null
            return
        }

        if (anchorStart !== m.start) {
            anchorStart = m.start
            const r = caretCoords(ta, m.start, container)
            anchorPos = { left: r.left - 4, top: r.bottom + 4 }
        }

        box.style.left = anchorPos.left + "px"
        box.style.top = anchorPos.top + "px"

        match = m
        items = noteHashtags.filter(t => t.startsWith(match.text))
        index = 0

        if (!items.length) {
            box.style.display = "none"
            return
        }

        box.style.left = anchorPos.left + "px"
        box.style.top = anchorPos.top + "px"
        render()
    })

    ta.addEventListener("keydown", e => {
        if (box.style.display === "none") {
            return
        }
        if (e.key === "Tab" || e.key === "Enter") {
            e.preventDefault()
            apply()
        } else if (e.key === "ArrowDown") {
            e.preventDefault()
            index = (index + 1) % items.length
            render()
        } else if (e.key === "ArrowUp") {
            e.preventDefault()
            index = (index - 1 + items.length) % items.length
            render()
        } else if (e.key === "Escape") {
            box.style.display = "none"
        }
    })
}

function addResolveNotesButton() {
    if (!location.pathname.includes("/note")) return
    if (location.pathname.includes("/note/new")) {
        addCreateNewPOIButton()
        return
    }
    if (document.querySelector(".resolve-note-done")) return true
    if (document.querySelector("#timeback-btn")) return true
    resetSearchFormFocus()
    void geocodeCurrentView()

    document.querySelectorAll('#sidebar_content a[href^="/user/"]').forEach(elem => {
        getCachedUserInfo(elem.textContent).then(info => {
            elem.before(makeBadge(info, new Date(elem.parentElement.querySelector("time")?.getAttribute("datetime") ?? new Date())))
            elem.title = makeUsernameTitle(info)
        })
    })
    externalizeLinks(document.querySelectorAll(".overflow-hidden a"))

    makeTimesSwitchable()

    try {
        // timeback button
        let timestamp = document.querySelector("#sidebar_content time")?.dateTime
        if (!timestamp) {
            return
        }
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
        const query = `// via ${timeSource}
[date:"${timestamp}"];
(
  node({{bbox}});
  way({{bbox}});
  //relation({{bbox}});
);
(._;>;);
out meta;
`
        const btn = document.createElement("a")
        btn.id = "timeback-btn"
        if (organicmapsDate || mapsmeDate) {
            btn.title = "Open the map state at the time of map snapshot"
        } else {
            btn.title = "Open the map state at the time of note creation"
        }
        btn.textContent = " 🕰"
        btn.style.cursor = "pointer"
        document.querySelector("#sidebar_content time").after(btn)
        btn.onclick = e => {
            e.preventDefault()
            window.open(`${overpass_server.url}?Q=${encodeURI(query)}&C=${lat};${lon};${zoom}&R`)
        }
    } catch (e) {
        console.error("setup timeback button fail", e)
    }

    try {
        makeHashtagsInNotesClickable()
        makeUsernameInNotesFilterable()
    } catch {
        console.error("fail when setuping filterable links in note")
    }

    document.querySelectorAll("#sidebar_content div:has(h4) a:not(.gpx-displayed)").forEach(i => {
        i.classList.add("gpx-displayed")
        const m = i.href.match(new RegExp(`${osm_server.url}/user/.+/traces/(\\d+)`))
        if (m) {
            externalFetchRetry({
                url: `${osm_server.url}/traces/${m[1]}/data`,
            }).then(res => displayGPXTrack(res.response))
        }
    })
    try {
        addAltClickHandlerForNotes()
    } catch (err) {
        console.error(err, "fail add alt clicks handlers for note layer")
    }

    function isClosedNote() {
        return !document.querySelector("#sidebar_content textarea.form-control")
    }

    document.querySelectorAll("#sidebar_content div:has(h4) a").forEach(i => {
        if (i.href?.match(/^(https:\/\/streetcomplete\.app\/|https:\/\/westnordost\.de\/).+\.jpg$/)) {
            const imgSrc = i.href
            if (isSafari) {
                fetchImageWithCache(imgSrc).then(async imgData => {
                    const img = document.createElement("img")
                    img.src = imgData
                    if (!isClosedNote()) {
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
                if (!isClosedNote()) {
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
            document.querySelector("#sidebar").style.width = "450px"
            // hideSearchForm()
        }
    })

    if (isClosedNote()) {
        if (false && isDebug()) {
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
        return
    }
    const auth = makeAuth()
    const note_id = location.pathname.match(/note\/(\d+)/)[1]
    /** @type {string} */
    const resolveButtonsText = GM_config.get("ResolveNotesButton")
    if (resolveButtonsText) {
        JSON.parse(resolveButtonsText).forEach(row => {
            const label = row["label"]
            let text = label
            if (row["text"] !== "") {
                text = row["text"]
            }
            const b = document.createElement("button")
            b.classList.add("resolve-note-done", "btn", "btn-primary")
            b.textContent = label
            b.title = `Add to the comment "${text}" and close the note.\nYou can change emoji in userscript settings`
            document.querySelectorAll("form.mb-3")[0].before(b)
            b.after(document.createTextNode("\xA0"))
            b.onclick = () => {
                try {
                    getWindow().OSM.router.stateChange(getWindow().OSM.parseHash(getWindow().OSM.formatHash(getMap())))
                } catch (e) {
                    console.error(e)
                }
                auth.xhr(
                    {
                        method: "POST",
                        path:
                            osm_server.apiBase +
                            "notes/" +
                            note_id +
                            "/close.json?" +
                            new URLSearchParams({
                                text: text,
                            }).toString(),
                        prefix: false,
                    },
                    err => {
                        if (err) {
                            alert(err)
                        }
                        window.location.reload()
                    },
                )
            }
        })
        document.querySelectorAll("form.mb-3")[0].before(document.createElement("p"))
        document.querySelector("form.mb-3 .form-control").rows = 3
        if (isDebug()) {
            addAutoComplete()
        }
    }
}

function setupResolveNotesButton() {
    if (!location.pathname.startsWith("/note")) return
    tryApplyModule(addResolveNotesButton, 100, 3000)
}

let updateNotesLayer = null

function addAltClickHandlerForNotes() {
    getMap()?.noteLayer?.on(
        "click",
        intoPageWithFun(e => {
            if (!e.originalEvent.altKey) {
                return
            }
            console.log("removing current note", e.layer.id)
            getWindow().notesIDsFilter.add(e.layer.id)
            try {
                e.propagatedFrom.getElement().style.display = "none"
            } catch (err) {
                console.error(err, "when e.propagatedFrom.getElement()")
            }
            getMap().fire("moveend")
            const match = location.pathname.match(/note\/(\d+)/)
            if (match && parseInt(match[1]) === e.layer.id) {
                console.log("removing also current note layer")
                getMap()._objectLayer.remove()
            }
        }),
    )
    getMap()?._objectLayer?.on(
        "click",
        intoPageWithFun(e => {
            if (!e.originalEvent.altKey) {
                return
            }
            console.log("removing current note", getMap()._object.id)
            e.originalEvent.stopPropagation()
            e.originalEvent.stopImmediatePropagation()
            getWindow().notesIDsFilter.add(getMap()._object.id)
            try {
                getMap()._objectLayer.remove()
                getMap().noteLayer?.eachLayer(l => {
                    if (l.id === getMap()._object.id) {
                        l.remove()
                    }
                })
            } catch (err) {
                console.error(err, "when click for _objectLayer ")
            }
            getMap().fire("moveend")
        }),
    )
}

function addNotesFiltersButtons() {
    if (document.getElementById("notes-filter")) {
        return
    }
    const noteLabel = Array.from(document.querySelectorAll(".overlay-layers label"))[0]
    if (!noteLabel) {
        return
    }
    if (!getWindow().fetchIntercepterScriptInited) {
        return
    }
    injectCSSIntoOSMPage(`
        .wait-fetch {
            cursor: progress !important;
        }
    `)
    const checkbox = noteLabel.querySelector("input")
    const filters = document.createElement("div")

    function updateNotesFilters() {
        if (checkbox.checked) {
            filters.style.display = ""
            getWindow().notesDisplayName = filterByUsername.value
            getWindow().invertDisplayName = inverterForFilterByUsername.checked
            getWindow().notesQFilter = filterByString.value
            getWindow().invertQ = inverterForFilterByString.checked
            getWindow().notesClosedFilter = filterByClosed.value
            getWindow().notesCommentsFilter = filterByComment.value
        } else {
            filters.style.display = "none"
            getWindow().notesDisplayName = ""
            getWindow().invertDisplayName = ""
            getWindow().notesQFilter = ""
            getWindow().invertQ = ""
            getWindow().notesClosedFilter = ""
            getWindow().notesCommentsFilter = ""
        }
        if (filterByComment.value === "") {
            filterByComment.style.color = "gray"
        } else {
            filterByComment.style.removeProperty("color")
        }
    }

    updateNotesLayer = function () {
        updateNotesFilters()
        getMap().fire("moveend")
    }

    checkbox.onchange = updateNotesFilters
    filters.id = "notes-filter"
    filters.style.display = "none"
    filters.style.paddingTop = "4px"

    const filterByString = document.createElement("input")
    const inverterForFilterByString = document.createElement("span")

    function makeFilterByStringWrapper() {
        filterByString.type = "input"
        filterByString.id = "filter-notes-by-string"
        filterByString.style.width = "100%"
        filterByString.placeholder = "word in notes"
        filterByString.title = "comma-separated substrings\nfilter also works by comments"
        filterByString.addEventListener("keypress", function (event) {
            if (event.key === "Enter") {
                filterByString.classList?.add("wait-fetch")
                updateNotesLayer()
            }
        })

        inverterForFilterByString.textContent = "🚫"
        const hideWithWordTitle = "Click to hide notes with this word"
        const onlyWithWordTitle = "Click to show notes only with this word"
        inverterForFilterByString.title = hideWithWordTitle
        inverterForFilterByString.style.filter = "grayscale(1)"
        inverterForFilterByString.style.position = "absolute"
        inverterForFilterByString.style.cursor = "pointer"
        inverterForFilterByString.style.marginLeft = "-1.5em"
        inverterForFilterByString.onclick = () => {
            inverterForFilterByString.checked = !inverterForFilterByString.checked
            if (inverterForFilterByString.checked) {
                inverterForFilterByString.style.filter = ""
                inverterForFilterByString.title = onlyWithWordTitle
            } else {
                inverterForFilterByString.style.filter = "grayscale(1)"
                inverterForFilterByString.title = hideWithWordTitle
            }
            inverterForFilterByString.classList?.add("wait-fetch")
            updateNotesLayer()
        }

        const resetFilter = document.createElement("button")
        resetFilter.style.all = "unset"
        resetFilter.textContent = "✖"
        resetFilter.style.position = "absolute"
        resetFilter.style.right = "20px"
        resetFilter.style.cursor = "pointer"
        resetFilter.tabIndex = -1
        resetFilter.onclick = () => {
            filterByString.value = ""
            updateNotesLayer()
        }

        const datalistInstances = document.createElement("datalist")
        datalistInstances.id = "words-in-notes-filter"
        ;[
            // prettier-ignore
            "StreetComplete",
            "never exist",
            "photo",
            "#EveryDoor",
        ].forEach(i => {
            const opt = document.createElement("option")
            opt.value = i
            datalistInstances.appendChild(opt)
        })
        filterByString.setAttribute("list", "words-in-notes-filter")

        const wrapper = document.createElement("div")
        wrapper.style.display = "flex"
        wrapper.style.alignItems = "center"
        wrapper.style.marginBottom = "2px"
        wrapper.appendChild(inverterForFilterByString)
        wrapper.appendChild(filterByString)
        wrapper.appendChild(resetFilter)
        // wrapper.appendChild(datalistInstances) // TODO

        return wrapper
    }

    const filterByUsername = document.createElement("input")
    const inverterForFilterByUsername = document.createElement("span")

    function makeFilterByUsernameWrapper() {
        filterByUsername.type = "input"
        filterByUsername.placeholder = "username"
        filterByString.title = "comma-separated usernames"
        filterByUsername.id = "filter-notes-by-username"
        filterByUsername.style.width = "100%"
        filterByUsername.addEventListener("keypress", function (event) {
            if (event.key === "Enter") {
                filterByUsername.classList?.add("wait-fetch")
                updateNotesLayer()
            }
        })

        inverterForFilterByUsername.textContent = "🚫"
        const hideFromUserTitle = "Click to hide notes from this user"
        const onlyFromUserTitle = "Click to show notes only from this user"
        inverterForFilterByUsername.title = hideFromUserTitle
        inverterForFilterByUsername.style.filter = "grayscale(1)"
        inverterForFilterByUsername.style.position = "absolute"
        inverterForFilterByUsername.style.cursor = "pointer"
        inverterForFilterByUsername.style.marginLeft = "-1.5em"
        inverterForFilterByUsername.checked = false
        inverterForFilterByUsername.onclick = () => {
            inverterForFilterByUsername.checked = !inverterForFilterByUsername.checked
            if (inverterForFilterByUsername.checked) {
                inverterForFilterByUsername.style.filter = ""
                inverterForFilterByUsername.title = onlyFromUserTitle
            } else {
                inverterForFilterByUsername.style.filter = "grayscale(1)"
                inverterForFilterByUsername.title = hideFromUserTitle
            }
            inverterForFilterByUsername?.classList?.add("wait-fetch")
            updateNotesLayer()
        }

        const resetFilter = document.createElement("button")
        resetFilter.textContent = "✖"
        resetFilter.style.all = "unset"
        resetFilter.style.position = "absolute"
        resetFilter.style.right = "20px"
        resetFilter.style.cursor = "pointer"
        resetFilter.tabIndex = -1
        resetFilter.onclick = () => {
            filterByUsername.value = ""
            updateNotesLayer()
        }

        const wrapper = document.createElement("div")
        wrapper.style.display = "flex"
        wrapper.style.alignItems = "center"
        wrapper.style.marginBottom = "2px"
        wrapper.appendChild(inverterForFilterByUsername)
        wrapper.appendChild(filterByUsername)
        wrapper.appendChild(resetFilter)

        return wrapper
    }

    const filterByClosed = document.createElement("select")

    function makeFilterByClosedWrapper() {
        filterByClosed.id = "filter-notes-by-comments"
        filterByClosed.style.width = "100%"
        filterByClosed.addEventListener("input", function () {
            filterByClosed.classList?.add("wait-fetch")
            updateNotesLayer()
        })
        ;[
            ["❌ + ✅ at 1 days ago", 1],
            ["❌ + ✅ at 7 days ago", 7],
            ["❌ + ✅ at 30 days ago", 30],
            ["❌ + ✅ at 365 days ago", 365],
            ["created 7 days ago", -7],
            ["created 30 days ago", -30],
            ["created > 3 years ago", -365 * 3],
            ["only opened", 0],
            ["all notes", -1],
        ].forEach(([title, value]) => {
            const option = document.createElement("option")
            option.textContent = title
            option.value = value
            if (value === 7) {
                option.selected = "selected"
            }
            filterByClosed.appendChild(option)
        })

        const wrapper = document.createElement("div")
        wrapper.style.marginBottom = "2px"
        wrapper.appendChild(filterByClosed)

        return wrapper
    }

    const filterByComment = document.createElement("select")

    function makeFilterByCommentsWrapper() {
        filterByComment.id = "filter-notes-by-closed"
        filterByComment.placeholder = "word in comments"
        filterByComment.style.width = "100%"
        filterByComment.style.color = "gray"
        filterByComment.setAttribute("list", "comments-filters")
        filterByComment.addEventListener("click", function (e) {
            if (e.isTrusted) {
                filterByComment.click()
            }
        })
        filterByComment.addEventListener("input", function () {
            filterByComment.classList?.add("wait-fetch")
            updateNotesLayer()
        })
        ;[
            ["comments filters", ""],
            ["only with comments", "only with comments"],
            ["only with my comments", "only with my comments"],
            ["without comments", "without comments"],
            ["without my comments", "without my comments"],
            ["commented by other users", "commented by other users"],
        ].forEach(([title, value]) => {
            const option = document.createElement("option")
            option.textContent = title
            option.value = value
            filterByComment.appendChild(option)
        })

        const wrapperForFilterByClosed = document.createElement("div")
        wrapperForFilterByClosed.appendChild(filterByComment)

        return wrapperForFilterByClosed
    }

    filters.appendChild(makeFilterByStringWrapper())
    filters.appendChild(makeFilterByUsernameWrapper())
    filters.appendChild(makeFilterByClosedWrapper())
    filters.appendChild(makeFilterByCommentsWrapper())

    noteLabel.after(filters)
    updateNotesFilters()
    addAltClickHandlerForNotes()
    document.querySelector(".overlay-layers p").style.display = "none"
    document.querySelector(".layers-ui h2").style.fontSize = "20px"
}

function setupNotesFiltersButtons() {
    if (document.getElementById("map")) {
        tryApplyModule(addNotesFiltersButtons, 200, 5000)
    }
}

let mapDataSwitcherUnderSupervision = false

function hideNoteHighlight() {
    const g = document.querySelector("#map g")
    if (!g || g.childElementCount === 0) return
    const mapDataCheckbox = document.querySelector(".layers-ui #label-layers-data input")
    if (mapDataCheckbox && !mapDataCheckbox.checked) {
        if (mapDataSwitcherUnderSupervision) return
        mapDataSwitcherUnderSupervision = true
        mapDataCheckbox.addEventListener(
            "click",
            () => {
                mapDataSwitcherUnderSupervision = false
                hideNoteHighlight()
            },
            { once: true },
        )
        return
    }
    console.log("hide halo around note")
    if (g.childNodes[g.childElementCount - 1].getAttribute("stroke") === "#FF6200" && g.childNodes[g.childElementCount - 1].getAttribute("d").includes("a20,20 0 1,0 -40,0 ")) {
        g.childNodes[g.childElementCount - 1].remove()
        document.querySelector("div.leaflet-marker-icon:last-child").style.filter = "contrast(120%)"
    }
    // getMap().dataLayer.on('click', intoPageWithFun((e) => {
    //     if (!e.originalEvent.altKey) {
    //         return
    //     }
    //     debugger
    //     getWindow().mapDataIDsFilter.add(e.layer.id);
    //     e.propagatedFrom.getElement().style.display = "none";
    //     getMap().fire("moveend");
    // }))
}

function setupHideNoteHighlight() {
    if (!location.pathname.startsWith("/note/")) return
    tryApplyModule(hideNoteHighlight, 1000, 5000)
}

//</editor-fold>
