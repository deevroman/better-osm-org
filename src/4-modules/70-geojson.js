//<editor-fold desc="geojson" defaultstate="collapsed">

let tracksCounter = 0
let trackMetadata = null

const trackColors = ["rgb(255,0,47)", "rgb(0,34,255)", "rgb(64,255,0)", "#000000", "#ff00e3", "#00ffce", "#ff4d00", "#a1a1a1"]

/**
 * @param {string|Document} xml
 * @param {string|null} color
 */
function displayGPXTrack(xml, color = null) {
    const doc = typeof xml === "string" ? new DOMParser().parseFromString(xml, "application/xml") : xml

    const popup = document.createElement("span")

    const name = doc.querySelector("gpx name")?.textContent
    const nameSpan = document.createElement("p")
    nameSpan.textContent = name

    const desc = doc.querySelector("gpx desc")?.textContent
    const descSpan = document.createElement("p")
    descSpan.textContent = desc

    const link = doc.querySelector("gpx link")?.getAttribute("href")
    const linkA = document.createElement("a")
    linkA.href = link
    linkA.textContent = link

    popup.appendChild(nameSpan)
    popup.appendChild(descSpan)
    popup.appendChild(linkA)

    console.time("start gpx track render")
    const min = Math.min
    const max = Math.max
    const trackColor = color ?? trackColors[tracksCounter % trackColors.length]
    tracksCounter++
    trackMetadata = {
        min_lat: 10000000,
        min_lon: 10000000,
        max_lat: -10000000,
        max_lon: -100000000,
    }
    doc.querySelectorAll("gpx trk").forEach(trk => {
        const nodesList = []
        trk.querySelectorAll("trkseg trkpt").forEach(i => {
            const lat = parseFloat(i.getAttribute("lat"))
            const lon = parseFloat(i.getAttribute("lon"))
            nodesList.push([lat, lon])

            trackMetadata.min_lat = min(trackMetadata.min_lat, lat)
            trackMetadata.min_lon = min(trackMetadata.min_lon, lon)
            trackMetadata.max_lat = max(trackMetadata.max_lat, lat)
            trackMetadata.max_lon = max(trackMetadata.max_lon, lon)
        })
        displayWay(nodesList, false, trackColor, 5, null, "customObjects", null, popup.outerHTML)
    })
    doc.querySelectorAll("gpx wpt").forEach(wpt => {
        const lat = wpt.getAttribute("lat")
        const lon = wpt.getAttribute("lon")
        const marker = showNodeMarker(lat, lon, trackColor, null, "customObjects", 3)
        const name = wpt.querySelector("name")
        const desc = wpt.querySelector("desc")
        if (name || desc) {
            const popup = document.createElement("span")
            if (name) {
                popup.textContent = name.textContent
            }
            if (desc) {
                popup.appendChild(document.createElement("br"))
                popup.appendChild(document.createTextNode(desc.textContent))
            }
            marker.bindTooltip(popup.outerHTML)
            marker.bindPopup(popup.outerHTML)
        }

        trackMetadata.min_lat = min(trackMetadata.min_lat, lat)
        trackMetadata.min_lon = min(trackMetadata.min_lon, lon)
        trackMetadata.max_lat = max(trackMetadata.max_lat, lat)
        trackMetadata.max_lon = max(trackMetadata.max_lon, lon)
    })
    console.timeEnd("start gpx track render")
}

/**
 * @param {string} xml
 */
function displayKMLTrack(xml) {
    const doc = new DOMParser().parseFromString(xml, "application/xml")
    const error = doc.querySelector("parsererror")
    if (error) {
        console.error("Parsing failed:", error.textContent)
    }

    const popup = document.createElement("span")

    const name = doc.querySelector("Document name")?.textContent
    const nameSpan = document.createElement("p")
    nameSpan.textContent = name

    const desc = doc.querySelector("Document description")?.textContent
    const descSpan = document.createElement("p")
    descSpan.textContent = desc

    const link = doc.querySelector("Document link")?.getAttribute("href")
    const linkA = document.createElement("a")
    linkA.href = link
    linkA.textContent = link

    popup.appendChild(nameSpan)
    popup.appendChild(descSpan)
    popup.appendChild(linkA)

    console.time("start kml track render")
    const min = Math.min
    const max = Math.max
    const trackColor = trackColors[tracksCounter % trackColors.length]
    tracksCounter++
    trackMetadata = {
        min_lat: 10000000,
        min_lon: 10000000,
        max_lat: -10000000,
        max_lon: -100000000,
    }
    doc.querySelectorAll("Document Placemark:has(LineString)").forEach(trk => {
        const nodesList = []
        trk.querySelectorAll("LineString coordinates").forEach(i => {
            i.firstChild.textContent
                .trim()
                .split(/\s+/)
                .map(i => i.split(","))
                .forEach(coord => {
                    const lat = parseFloat(coord[1])
                    const lon = parseFloat(coord[0])
                    nodesList.push([lat, lon])

                    trackMetadata.min_lat = min(trackMetadata.min_lat, lat)
                    trackMetadata.min_lon = min(trackMetadata.min_lon, lon)
                    trackMetadata.max_lat = max(trackMetadata.max_lat, lat)
                    trackMetadata.max_lon = max(trackMetadata.max_lon, lon)
                })
        })
        displayWay(nodesList, false, trackColor, 5, null, "customObjects", null, popup.outerHTML)
    })
    doc.querySelectorAll("Document Placemark:has(LinearRing)").forEach(trk => {
        const nodesList = []
        trk.querySelectorAll("LinearRing coordinates").forEach(i => {
            i.firstChild.textContent
                .trim()
                .split(/\s+/)
                .map(i => i.split(","))
                .forEach(coord => {
                    const lat = parseFloat(coord[1])
                    const lon = parseFloat(coord[0])
                    nodesList.push([lat, lon])

                    trackMetadata.min_lat = min(trackMetadata.min_lat, lat)
                    trackMetadata.min_lon = min(trackMetadata.min_lon, lon)
                    trackMetadata.max_lat = max(trackMetadata.max_lat, lat)
                    trackMetadata.max_lon = max(trackMetadata.max_lon, lon)
                })
        })
        displayWay(nodesList, false, trackColor, 5, null, "customObjects", null, popup.outerHTML)
    })
    doc.querySelectorAll("Document Placemark:has(Point)").forEach(pointXml => {
        const [lon, lat] = pointXml.querySelector("coordinates").firstChild.textContent.trim().split(",").map(parseFloat).slice(0, 2)
        const marker = showNodeMarker(lat, lon, trackColor, null, "customObjects", 3)
        const name = pointXml.querySelector("name")
        const desc = pointXml.querySelector("description")
        if (name || desc) {
            const popup = document.createElement("span")
            if (name) {
                popup.textContent = name.textContent
            }
            if (desc) {
                popup.appendChild(document.createElement("br"))
                popup.appendChild(document.createTextNode(desc.textContent))
            }
            marker.bindTooltip(popup.outerHTML)
            marker.bindPopup(popup.outerHTML)
        }

        trackMetadata.min_lat = min(trackMetadata.min_lat, lat)
        trackMetadata.min_lon = min(trackMetadata.min_lon, lon)
        trackMetadata.max_lat = max(trackMetadata.max_lat, lat)
        trackMetadata.max_lon = max(trackMetadata.max_lon, lon)
    })
    console.timeEnd("start kml track render")
}

function renderGeoJSONwrapper(geojson) {
    injectJSIntoPage(`
    var jsonLayer = null;
    // noinspection JSUnusedLocalSymbols
    function renderGeoJSON(data) {
        function onEachFeature(feature, layer) {
            if (feature.properties) {
                const table = document.createElement("table")
                table.style.overflow = "scroll"
                table.classList.add("geojson-props-table")
                table.classList.add("zebra_colors")
                const tbody = document.createElement("tbody")
                table.appendChild(tbody)
                Object.entries(feature.properties).forEach(([key, value]) => {
                    if (Array.isArray(value) && value.length === 0) {
                        value = "[]"
                    } else if (value === null) {
                        value = "null"
                    } else if (typeof value === 'object' && Object.entries(value).length === 0) {
                        value = "{}"
                    }
                    const th = document.createElement("th")
                    th.textContent = key
                    const td = document.createElement("td")
                    if (key === "id" && typeof value === "string" && (value.startsWith("node/") || value.startsWith("way/") || value.startsWith("relation/"))) {
                        const a = document.createElement("a")
                        a.textContent = value
                        a.href = "/" + value
                        td.appendChild(a)
                    } else {
                        td.textContent = value
                    }

                    const tr = document.createElement("tr")
                    tr.appendChild(th)
                    tr.appendChild(td)
                    tbody.appendChild(tr)
                })
                layer.on("click", e => {
                    if (e.originalEvent.altKey) {
                        layer.remove()
                        e.originalEvent.stopPropagation()
                        e.originalEvent.stopImmediatePropagation()
                    }
                })
                layer.bindPopup(table.outerHTML)
            }
        }

        jsonLayer = L.geoJSON(data, {
            onEachFeature: onEachFeature,
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng)
            }
        });
        jsonLayer.addTo(map);
    }
    `)
    getWindow().renderGeoJSON(intoPage(geojson))
}

var jsonLayer = null
let bannedVersions = null

function currentVersionBanned(module) {
    if (!bannedVersions) return false
    if (bannedVersions[GM_info.script.version]) {
        if (bannedVersions[GM_info.script.version][module]) {
            return bannedVersions[GM_info.script.version][module]
        }
    }
    return false
}

function insertOverlaysStyles() {
    const mapWidth = getComputedStyle(document.querySelector("#map")).width
    const mapHeight = getComputedStyle(document.querySelector("#map")).height

    injectCSSIntoOSMPage(`
            .leaflet-popup-content, .leaflet-tooltip {
                white-space: pre;
            }

            .leaflet-popup-content:has(.geojson-props-table) {
                overflow: scroll;
            }

            .leaflet-popup-content:has(.geojson-editor) {
                    /*max-width: calc(${mapWidth} / 3) !important;
                        min-width: calc(${mapWidth} / 3) !important;
                        max-height: calc(${mapHeight} / 2);
                        min-height: calc(${mapHeight} / 2);*/
                overflow-y: scroll;
                font-size: larger;
            }

            .geojson-editor {
                margin-left: 5px;
            }

            table.tags-table {
                margin-top: 5px;
                margin-left: 5px;
            }

            table.metainfo-table {
                margin-top: 5px;
                margin-left: 5px;
            }

            table.tags-table th:not(.tag-flag) {
                border: solid 2px transparent;
                min-width: 50px;
            }

            table.tags-table td:not(.tag-flag) {
                border: solid 2px transparent;
                min-width: 150px;
            }

            table.editable.tags-table th:not(.tag-flag) {
                border: solid 2px black;
                min-width: 50px;
            }

            table.editable.tags-table td:not(.tag-flag) {
                border: solid 2px black;
                min-width: 150px;
            }

            table:not(.editable).tags-table tr.add-tag-row {
                display: none;
                min-width: 150px;
            }

            table.editable.tags-table tr.add-tag-row th {
                text-align: center;
                cursor: pointer;
                min-width: 294px;
                resize: both !important;
            }

            table.tags-table textarea {
                min-width: 280px;
            }

            .mode-btn:not(.visible) {
                display: none;
            }

            .map-img-preview-popup {
                width: initial;
            }

            .zebra_colors tr:nth-child(even) td, .zebra_colors tr:nth-child(even) th {
                background-color: color-mix(in srgb, var(--bs-body-bg), black 10%);
            }

            @media ${mediaQueryForWebsiteTheme} {

                .mode-btn.visible img {
                    filter: invert(0.9);
                }

                .zebra_colors tr:nth-child(even) td, .zebra_colors tr:nth-child(even) th {
                    background-color: color-mix(in srgb, var(--bs-body-bg), white 7%);
                }

            }

            .leaflet-popup-content:has(.geotagged-img) {
                max-width: calc(${mapWidth} / 2) !important;
                min-width: calc(${mapWidth} / 2) !important;
                max-height: calc(${mapHeight} / 2);
                min-height: calc(${mapHeight} / 2);
                width: auto;
                height: auto;
                overflow-y: scroll;
            }
        `)
}

// todo inline
const rawEditIcon = "https://raw.githubusercontent.com/openstreetmap/iD/671e9f00699c3b2602b82b291c5cd776445032aa/svg/fontawesome/fas-i-cursor.svg"
const tableEditIcon = "https://raw.githubusercontent.com/openstreetmap/iD/671e9f00699c3b2602b82b291c5cd776445032aa/svg/fontawesome/fas-th-list.svg"

// const lastVersionsCache = {}

function loadBannedVersions() {
    externalFetchRetry({
        url: "https://raw.githubusercontent.com/deevroman/better-osm-org/refs/heads/master/misc/assets/banned_versions.json",
        responseType: "json",
    }).then(async res => {
        bannedVersions = await res.response
    })
}

function preloadEditIcons() {
    GM_addElement("img", {
        src: rawEditIcon,
        height: "14px",
        width: "14px",
    })
    GM_addElement("img", {
        src: tableEditIcon,
        height: "14px",
        width: "14px",
    })
}

let osmEditAuth = null

function renderOSMGeoJSON(xml, options = {}) {
    if (osmEditAuth === null) {
        osmEditAuth = makeAuth()
    }
    /**
     * @param {Object.<string, string>} tags
     * @return {HTMLTableSectionElement}
     */
    function makeTBody(tags) {
        const tbody = document.createElement("tbody")
        Object.entries(tags).forEach(([key, value]) => {
            const th = document.createElement("th")
            th.textContent = key
            const td = document.createElement("td")
            td.textContent = value
            const tr = document.createElement("tr")
            th.tabIndex = 0
            td.tabIndex = 0
            tr.appendChild(th)
            tr.appendChild(td)
            tbody.appendChild(tr)
        })
        const tr = document.createElement("tr")
        tr.classList.add("add-tag-row")
        const th = document.createElement("th")
        th.textContent = "+"
        th.colSpan = 2
        th.tabIndex = 0
        th.setAttribute("contenteditable", false)
        tr.appendChild(th)
        th.onclick = () => {
            tbody.lastElementChild.before(makeRow("", "", true))
        }
        tbody.appendChild(tr)
        return tbody
    }

    function makePopupHTML(feature) {
        // debugger
        // const cachedObjectInfo = lastVersionsCache[`${feature.type}_${feature.id}`]
        // if (cachedObjectInfo && feature.properties.meta.version
        //     && parseInt(cachedObjectInfo.querySelector("node,way,relation").getAttribute("version")) > feature.properties.meta.version) {
        //     feature.properties.tags = {}
        //     lastVersionsCache[`${feature.type}_${feature.id}`].querySelectorAll("tag").forEach(i => {
        //         feature.properties.tags[i.getAttribute("k")] = i.getAttribute("v")
        //     })
        //     feature.properties.meta = {}
        //     Array.from(cachedObjectInfo.querySelector("node,way,relation").attributes).map(i => [i.name, i.value]).forEach(([key, value]) => {
        //         if (key === "visible" || key === "nodes" || key === "members" || key === "id") return
        //         feature.properties.meta[key] = value
        //     })
        // }

        const popupBody = document.createElement("span")
        popupBody.classList.add("geojson-editor")

        const objLink = document.createElement("a")
        objLink.textContent = feature.properties.type + "/" + feature.properties.id
        objLink.href = "/" + feature.properties.type + "/" + feature.properties.id
        popupBody.appendChild(objLink)

        popupBody.appendChild(document.createTextNode(", "))

        const versionLink = document.createElement("a")
        versionLink.classList.add("version-link")
        versionLink.textContent = feature.properties.meta.version ? "v" + feature.properties.meta.version : ""
        versionLink.href = "/" + feature.type + "/" + feature.id + "history/" + feature.properties.meta.version
        popupBody.appendChild(versionLink)

        const editButton = document.createElement("button")
        editButton.id = feature.properties.type + "-" + feature.properties.id + "-" + feature.properties.meta.version
        editButton.classList.add("edit-tags-btn")
        editButton.textContent = "🖊"

        popupBody.appendChild(document.createTextNode("\xA0"))
        popupBody.appendChild(editButton)

        const modeBtn = document.createElement("button")
        modeBtn.classList.add("mode-btn")
        modeBtn.title = "Switch between table and raw editor"

        popupBody.appendChild(document.createTextNode("\xA0"))
        popupBody.appendChild(modeBtn)

        const table = document.createElement("table")
        popupBody.appendChild(table)
        table.style.overflow = "scroll"
        table.classList.add("geojson-props-table")
        table.classList.add("zebra_colors")
        table.classList.add("tags-table")

        const details = document.createElement("details")
        details.style.color = "gray"

        const summary = document.createElement("summary")
        summary.textContent = "metainfo"
        details.appendChild(summary)
        popupBody.appendChild(details)

        const metaTable = document.createElement("table")
        details.appendChild(metaTable)
        metaTable.style.overflow = "scroll"
        metaTable.classList.add("geojson-props-table")
        metaTable.classList.add("zebra_colors")
        metaTable.classList.add("metainfo-table")

        const metaTBody = document.createElement("tbody")
        metaTable.appendChild(metaTBody)
        Object.entries(feature.properties?.meta).forEach(([key, value]) => {
            const th = document.createElement("th")
            th.textContent = key
            const td = document.createElement("td")
            if (key === "id" && typeof value === "string" && (value.startsWith("node/") || value.startsWith("way/") || value.startsWith("relation/"))) {
                const a = document.createElement("a")
                a.textContent = value
                a.href = "/" + value
                td.appendChild(a)
            } else {
                td.textContent = value
            }

            const tr = document.createElement("tr")
            tr.appendChild(th)
            tr.appendChild(td)
            metaTBody.appendChild(tr)
        })

        return popupBody
    }

    function onEachFeature(feature, layer) {
        if (!feature.properties) {
            return
        }

        getWindow().L.DomEvent.on(
            layer,
            "click",
            intoPageWithFun(e => {
                const layer = getMap()._layers[e.target._leaflet_id]
                if (e.originalEvent.altKey) {
                    layer.remove()
                    e.originalEvent.stopPropagation()
                    e.originalEvent.stopImmediatePropagation()
                } else {
                    if (!layer.getPopup()) {
                        layer.bindPopup(makePopupHTML(feature).outerHTML, intoPage({ minWidth: 300 })).openPopup()
                    }
                }
            }),
        )

        const startEdit = intoPageWithFun(async startEditEvent => {
            let lastEditMode = await GM.getValue("lastEditMode", "table")

            const table = startEditEvent.target.parentElement.querySelector("table.tags-table")
            const metaTable = startEditEvent.target.parentElement.querySelector("table.metainfo-table")
            /** @type {Object.<string, string>}*/
            let oldTags = {}
            if (lastEditMode === "table") {
                table.querySelectorAll("tr:not(.add-tag-row)").forEach(i => {
                    oldTags[i.querySelector("th").textContent] = i.querySelector("td").textContent
                })
            } else {
                oldTags = buildTags(table.querySelector("textarea").value)
            }

            const modeBtn = startEditEvent.target.parentElement.querySelector(".mode-btn")
            modeBtn.classList.add("visible")

            const tableModeBtnImg = GM_addElement("img", {
                src: tableEditIcon,
                height: "14px",
                width: "14px",
            })
            tableModeBtnImg.style.marginTop = "-3px"
            const rawModeBtnImg = GM_addElement("img", {
                src: rawEditIcon,
                height: "14px",
                width: "14px",
            })
            rawModeBtnImg.style.marginTop = "-3px"

            if (lastEditMode === "table") {
                modeBtn.appendChild(rawModeBtnImg)
            } else {
                modeBtn.appendChild(tableModeBtnImg)
                const textarea = table.querySelector("textarea")
                textarea.setAttribute("disabled", "true")
                textarea.value = ""
                textarea.rows = 5
                Object.entries(feature.properties?.tags).forEach(([k, v]) => {
                    textarea.value += `${k}=${v.replaceAll("\\\\", "\n")}\n`
                })
                textarea.value = textarea.value.trim()
                table.appendChild(textarea)
            }

            modeBtn.onclick = async e => {
                e.stopPropagation()
                modeBtn.querySelector("img").remove()
                if (lastEditMode === "table") {
                    modeBtn.appendChild(tableModeBtnImg)
                    lastEditMode = "raw"
                    await GM.setValue("lastEditMode", lastEditMode)

                    table.appendChild(makeTextareaFromTagsTable(table))
                    table.querySelector("tbody")?.remove()
                } else {
                    modeBtn.appendChild(rawModeBtnImg)
                    lastEditMode = "table"
                    await GM.setValue("lastEditMode", lastEditMode)

                    table.appendChild(makeTBody(buildTags(table.querySelector("textarea").value)))
                    table.querySelectorAll("tr:not(.add-tag-row)").forEach(i => {
                        i.querySelector("th").setAttribute("contenteditable", true)
                        i.querySelector("td").setAttribute("contenteditable", true)
                    })
                    table.querySelector("textarea")?.remove()
                }
            }

            const object_type = feature.properties.type
            const object_id = parseInt(feature.properties.id)
            let object_version = parseInt(feature.properties.meta.version)

            async function syncTags() {
                const rawObjectInfo = await (
                    await osmEditAuth.fetch(osm_server.apiBase + object_type + "/" + object_id, {
                        method: "GET",
                        prefix: false,
                    })
                ).text()
                const objectInfo = new DOMParser().parseFromString(rawObjectInfo, "text/xml")
                // lastVersionsCache[`${object_type}_${object_id}`] = objectInfo
                const lastTags = {}
                objectInfo.querySelectorAll("tag").forEach(i => {
                    lastTags[i.getAttribute("k")] = i.getAttribute("v")
                })
                const new_object_version = parseInt(objectInfo.querySelector("[version]:not(osm)").getAttribute("version"))
                if (JSON.stringify(lastTags) !== JSON.stringify(oldTags) || (object_version && object_version + 1 !== new_object_version)) {
                    console.log("applying new tags")
                    if (lastEditMode === "table") {
                        table.querySelector("tbody").remove()
                        table.appendChild(makeTBody(lastTags))
                    } else {
                        table.querySelector("textarea")?.remove()
                        const textarea = document.createElement("textarea")
                        textarea.value = ""
                        textarea.rows = 5
                        Object.entries(lastTags).forEach(([k, v]) => {
                            textarea.value += `${k}=${v.replaceAll("\\\\", "\n")}\n`
                        })
                        textarea.value = textarea.value.trim()
                        table.appendChild(textarea)
                    }
                }
                object_version = new_object_version
                startEditEvent.target.parentElement.querySelector(".version-link").textContent = object_version ? "v" + object_version : ""
                startEditEvent.target.parentElement.querySelector(".version-link").href = `/${object_type}/${object_id}/history/${object_version}`

                metaTable.querySelector("tbody")?.remove()

                const metaTBody = document.createElement("tbody")
                metaTable.appendChild(metaTBody)
                Array.from(objectInfo.querySelector("node,way,relation").attributes)
                    .map(i => [i.name, i.value])
                    .forEach(([key, value]) => {
                        if (key === "visible" || key === "nodes" || key === "members" || key === "id") return
                        const th = document.createElement("th")
                        th.textContent = key
                        const td = document.createElement("td")
                        td.textContent = value

                        const tr = document.createElement("tr")
                        tr.appendChild(th)
                        tr.appendChild(td)
                        metaTBody.appendChild(tr)
                    })
            }

            await syncTags()

            table.classList.add("editable")
            table.querySelectorAll("tr:not(.add-tag-row)").forEach(i => {
                i.querySelector("th").setAttribute("contenteditable", true)
                i.querySelector("td").setAttribute("contenteditable", true)
            })
            table.querySelector("textarea")?.removeAttribute("disabled")
            table.addEventListener("input", () => {
                startEditEvent.target.removeAttribute("disabled")
            })
            startEditEvent.target.textContent = "📤"
            startEditEvent.target.setAttribute("disabled", true)
            startEditEvent.target.addEventListener(
                "click",
                async function upload() {
                    startEditEvent.target.style.cursor = "progress"
                    /** @type {Object.<string, string>}*/
                    let newTags = {}
                    const lastEditMode = await GM.getValue("lastEditMode", "table")
                    if (lastEditMode === "table") {
                        table.querySelectorAll("tr:not(.add-tag-row)").forEach(i => {
                            const key = i.querySelector("th").textContent.trim()
                            const value = i.querySelector("td").textContent.trim()
                            if (key === "" || value === "") {
                                // todo notify about error
                                return
                            }
                            newTags[key] = value
                        })
                    } else {
                        newTags = buildTags(table.querySelector("textarea").value)
                    }

                    console.log("Opening changeset")
                    const rawObjectInfo = await (
                        await osmEditAuth.fetch(osm_server.apiBase + object_type + "/" + object_id, {
                            method: "GET",
                            prefix: false,
                        })
                    ).text()
                    const objectInfo = new DOMParser().parseFromString(rawObjectInfo, "text/xml")
                    const lastVersion = parseInt(objectInfo.querySelector("[version]:not(osm)").getAttribute("version"))
                    if (lastVersion !== object_version) {
                        startEditEvent.target.textContent = "🔄"
                        alert("Conflict")
                        throw ""
                    }

                    const objectXML = objectInfo.querySelector("node,way,relation")
                    const prevTags = {}
                    objectXML.querySelectorAll("tag").forEach(i => {
                        prevTags[i.getAttribute("k")] = i.getAttribute("v")
                        i.remove()
                    })
                    Object.entries(newTags).forEach(([k, v]) => {
                        const tag = objectInfo.createElement("tag")
                        tag.setAttribute("k", k)
                        tag.setAttribute("v", v)
                        objectXML.appendChild(tag)
                    })

                    function makeComment(object_type, object_id, prevTags, newTags) {
                        const removedKeys = Object.entries(prevTags)
                            .map(([k]) => k)
                            .filter(k => newTags[k] === undefined)
                        const addedKeys = Object.entries(newTags)
                            .map(([k]) => k)
                            .filter(k => prevTags[k] === undefined)
                        const modifiedKeys = Object.entries(prevTags)
                            .filter(([k, v]) => newTags[k] !== undefined && newTags[k] !== v)
                            .map(([k]) => k)

                        let tagsHint = ""
                        if (addedKeys.length) {
                            tagsHint += "Add " + addedKeys.map(k => `${k}=${newTags[k]}`).join(", ") + "; "
                        }

                        if (modifiedKeys.length) {
                            tagsHint += "Changed " + modifiedKeys.map(k => `${k}=${prevTags[k]}\u200b→\u200b${newTags[k]}`).join(", ") + "; "
                        }

                        if (removedKeys.length) {
                            tagsHint += "Removed " + removedKeys.map(k => `${k}=${prevTags[k]}`).join(", ") + "; "
                        }

                        if (tagsHint.length > 200 || modifiedKeys.length > 1) {
                            tagsHint = ""
                            if (addedKeys.length) {
                                tagsHint += "Add " + addedKeys.join(", ") + "; "
                            }

                            if (modifiedKeys.length) {
                                tagsHint += "Changed " + modifiedKeys.join(", ") + "; "
                            }

                            if (removedKeys.length) {
                                tagsHint += "Removed " + removedKeys.join(", ") + "; "
                            }
                        }

                        tagsHint = tagsHint.match(/(.*); /)[1]

                        let mainTagsHint = ""

                        for (const i of Object.entries(prevTags)) {
                            if (mainTags.includes(i[0]) && !removedKeys.includes(i[0]) && !modifiedKeys.includes(i[0])) {
                                mainTagsHint += ` ${i[0]}=${i[1]}`
                                break
                            }
                        }
                        for (const i of Object.entries(prevTags)) {
                            if (i[0] === "name" && !removedKeys.includes("name") && !modifiedKeys.includes("name")) {
                                mainTagsHint += ` ${i[0]}=${i[1]}`
                                break
                            }
                        }

                        if (mainTagsHint !== "") {
                            if (removedKeys.length) {
                                tagsHint += " from" + mainTagsHint
                            } else if (modifiedKeys.length) {
                                tagsHint += " of" + mainTagsHint
                            } else if (addedKeys.length) {
                                tagsHint += " to" + mainTagsHint
                            }
                        } else {
                            tagsHint += ` for ${object_type} ${object_id}`
                        }

                        return tagsHint !== "" ? tagsHint.slice(0, 255) : `Update tags of ${object_type} ${object_id}`
                    }

                    const changesetTags = {
                        created_by: `better osm.org v${GM_info.script.version}`,
                        comment: makeComment(object_type, object_id, prevTags, newTags),
                    }

                    const changesetPayload = document.implementation.createDocument(null, "osm")
                    const cs = changesetPayload.createElement("changeset")
                    changesetPayload.documentElement.appendChild(cs)
                    tagsToXml(changesetPayload, cs, changesetTags)
                    const chPayloadStr = new XMLSerializer().serializeToString(changesetPayload)

                    const changesetId = await osmEditAuth
                        .fetch(osm_server.apiBase + "changeset/create", {
                            method: "PUT",
                            prefix: false,
                            body: chPayloadStr,
                        })
                        .then(res => {
                            if (res.ok) return res.text()
                            throw new Error(res)
                        })
                    console.log(changesetId)

                    try {
                        objectInfo.children[0].children[0].setAttribute("changeset", changesetId)

                        const objectInfoStr = new XMLSerializer().serializeToString(objectInfo).replace(/xmlns="[^"]+"/, "")
                        console.log(objectInfoStr)
                        await osmEditAuth
                            .fetch(osm_server.apiBase + object_type + "/" + object_id, {
                                method: "PUT",
                                prefix: false,
                                body: objectInfoStr,
                            })
                            .then(async res => {
                                const text = await res.text()
                                if (res.ok) return text
                                alert(text)
                                throw new Error(text)
                            })
                    } finally {
                        startEditEvent.target.style.cursor = ""
                        await osmEditAuth.fetch(osm_server.apiBase + "changeset/" + changesetId + "/close", {
                            method: "PUT",
                            prefix: false,
                        })
                    }

                    startEditEvent.target.textContent = "#" + changesetId
                    startEditEvent.target.style.color = "green"

                    startEditEvent.target.onclick = () => {
                        window.open("/changeset/" + changesetId, "_blank")
                    }

                    table.addEventListener(
                        "input",
                        () => {
                            startEditEvent.target.removeAttribute("disabled")
                            startEditEvent.target.textContent = "📤"
                            startEditEvent.target.onclick = null
                        },
                        { once: true },
                    )

                    oldTags = {}
                    objectInfo.querySelectorAll("tag").forEach(i => {
                        oldTags[i.getAttribute("k")] = i.getAttribute("v")
                    })
                    await syncTags()

                    console.log(objectInfo)
                },
                { once: true },
            )
            table.addEventListener(
                "keydown",
                e => {
                    if (e.code === "Enter" && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault()
                        const tr = document.createElement("tr")
                        const th = document.createElement("th")
                        const td = document.createElement("td")
                        tr.appendChild(th)
                        tr.appendChild(td)
                        tr.style.height = "1rem"
                        tr.tabIndex = 0
                        e.target.after(tr)
                        tr.focus()
                    }
                },
                false,
            )
        })
        getWindow().L.DomEvent.on(
            layer,
            "popupopen",
            intoPageWithFun(
                async openEvent => {
                    const layer = getMap()._layers[openEvent.target._leaflet_id]
                    const editButton = layer.getPopup().getElement().querySelector(".edit-tags-btn")
                    if (currentVersionBanned("overpass_tags_editor")) {
                        editButton.classList.add("banned-feature")
                        editButton.textContent = "Need update better-osm-org"
                        editButton.title = "Please click for update better-osm-org script.\nThe current version contains a bug that may corrupt OSM data."
                        editButton.addEventListener(
                            "click",
                            intoPageWithFun(() => {
                                window.open(SCRIPT_UPDATE_URL, "_blank")
                            }),
                            intoPage({ once: true }),
                        )
                    } else {
                        editButton.addEventListener("click", startEdit, intoPage({ once: true }))

                        if ((await GM.getValue("lastEditMode", "table")) === "raw") {
                            const textarea = document.createElement("textarea")
                            textarea.setAttribute("disabled", "true")
                            Object.entries(feature.properties?.tags).forEach(([k, v]) => {
                                if (k === "" && v === "") return
                                textarea.value += `${k}=${v.replaceAll("\\\\", "\n")}\n`
                            })
                            textarea.value = textarea.value.trim()
                            textarea.rows = 5
                            layer.getPopup().getElement().querySelector(".tags-table").appendChild(textarea)
                        } else {
                            layer.getPopup().getElement().querySelector(".tags-table").appendChild(makeTBody(feature.properties?.tags))
                        }
                    }
                },
                intoPage({ once: true }),
            ),
        )
    }
    xml.querySelectorAll("[action=delete]").forEach(i => i.remove())
    /** @type import('geojson').GeoJSON */
    const geojson = osmtogeojson(xml, { flatProperties: false })
    if (options["skip_tainted"]) {
        geojson.features = geojson.features.filter(f => !f.properties["tainted"])
    }
    const pointOptions = intoPage(options["point_options"] ?? {})
    const jsonLayer = getWindow().L.geoJSON(
        intoPage(geojson),
        intoPageWithFun({
            style: options["style"],
            onEachFeature: intoPageWithFun(onEachFeature),
            pointToLayer: intoPageWithFun(function (feature, latlng) {
                return getWindow().L.circleMarker(latlng, pointOptions)
            }),
        }),
    )
    jsonLayer.addTo(getMap())
    return jsonLayer
}

//</editor-fold>
