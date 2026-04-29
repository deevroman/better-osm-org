//<editor-fold desc="" defaultstate="collapsed">
function makeElementHistoryCompact(forceState = null) {
    const shouldBeCompact = forceState !== null ? forceState : document.querySelector(".compact-toggle-btn").getAttribute("value") === "><"
    const forToggle = Array.from(document.querySelectorAll("table.browse-tag-list"))
    // workaround for https://github.com/deevroman/better-osm-org/pull/273#issuecomment-2830047660
    forToggle.slice(0, 8).forEach(el => {
        el.classList.toggle("hide-non-modified-tags", shouldBeCompact)
    })
    setTimeout(() => {
        forToggle.slice(8).forEach(el => {
            el.classList.toggle("hide-non-modified-tags", shouldBeCompact)
        })
    })
    document.querySelectorAll(".empty-version").forEach(el => {
        el.classList.toggle("d-none", shouldBeCompact)
    })
    document.querySelectorAll(".preview-img-link img").forEach(i => {
        i.classList.toggle("d-none", shouldBeCompact)
    })
    document.querySelector(".compact-toggle-btn").setAttribute("value", shouldBeCompact ? "<>" : "><")
    document.querySelector(".compact-toggle-btn").innerHTML = shouldBeCompact ? expandModeSvg : compactModeSvg
}

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
        if (a.title && a.title?.length !== 0) {
            a.title += "\n"
        }
        a.title += "Photo by " + author
        if (artist && artist !== author) {
            a.title += " / " + artist
        }
    }
    const date = res["features"][0]?.properties?.exif?.["Exif.Image.DateTime"]
    if (date) {
        a.title += "\n" + date
    }
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
    elem.innerHTML = elem.innerHTML.replaceAll(
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
    fields: "id,geometry,computed_geometry,compass_angle,computed_compass_angle,thumb_1024_url",
})

// https://osm.org/node/7417065297
// https://osm.org/node/6257534611
// https://osm.org/way/682528624/history/3
function makeMapillaryValue(elem) {
    if (!GM_config.get("ImagesAndLinksInTags")) return
    if (elem.classList.contains("mapillared")) {
        return
    }
    elem.classList.add("mapillared")
    elem.innerHTML = elem.innerHTML.replaceAll(
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
    )
    setTimeout(async () => {
        for (const a of elem.querySelectorAll('a:not(.added-preview-mapillary-img-link)[href^="https://www.mapillary.com/app/"]')) {
            a.classList.add("added-preview-mapillary-img-link")
            const res = (
                await externalFetchRetry({
                    url: `https://graph.mapillary.com/${a.textContent.match(/[0-9]+/)}?${MAPILLARY_URL_PARAMS.toString()}`,
                    responseType: "json",
                })
            ).response
            if (!res["error"]) {
                const imgSrc = res["thumb_1024_url"]
                if (isSafari) {
                    fetchImageWithCache(imgSrc).then(async imgData => {
                        const img = document.createElement("img")
                        img.src = imgData
                        img.alt = "image from Mapillary"
                        img.title = "Blue — position from GPS tracker\nOrange — estimated real position"
                        img.style.width = "100%"
                        a.appendChild(img)
                    })
                } else {
                    const img = GM_addElement("img", {
                        src: imgSrc,
                        alt: "image from Mapillary",
                        title: "Blue — position from GPS tracker\nOrange — estimated real position",
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
                a.onmouseenter = () => {
                    const lat = res["geometry"]["coordinates"][1]
                    const lon = res["geometry"]["coordinates"][0]
                    const angle = res["compass_angle"]

                    const computed_lat = res["computed_geometry"]["coordinates"][1]
                    const computed_lon = res["computed_geometry"]["coordinates"][0]
                    const computed_angle = res["computed_compass_angle"]

                    showActiveNodeMarker(lat, lon, "#0022ff", true)
                    showActiveNodeMarker(computed_lat, computed_lon, "#ee9209", false)

                    drawRay(lat, lon, angle - 30, "#0022ff")
                    drawRay(computed_lat, computed_lon, computed_angle - 25, "#ee9209")

                    drawRay(lat, lon, angle + 30, "#0022ff")
                    drawRay(computed_lat, computed_lon, computed_angle + 25, "#ee9209")
                }
            } else {
                a.classList.add("broken-mapillary-link")
            }
        }
    })
    elem.onclick = e => {
        e.stopImmediatePropagation()
    }
}

function makeWikimediaCommonsValue(elem) {
    if (!GM_config.get("ImagesAndLinksInTags")) return
    elem.querySelectorAll('a[href^="//commons.wikimedia.org/wiki/"]:not(.preview-img-link)').forEach(a => {
        a.classList.add("preview-img-link")
        setTimeout(async () => {
            const wikimediaResponse = (
                await externalFetchRetry({
                    url:
                        `https://en.wikipedia.org/w/api.php?` +
                        new URLSearchParams({
                            action: "query",
                            iiprop: "url",
                            prop: "imageinfo",
                            titles: a.textContent,
                            format: "json",
                        }).toString(),
                    responseType: "json",
                })
            ).response
            const img = GM_addElement("img", {
                src: wikimediaResponse["query"]["pages"]["-1"]["imageinfo"][0]["url"],
                // crossorigin: "anonymous"
            })
            img.style.width = "100%"
            a.appendChild(img)
        })
    })
}

function makeRoofOrientationValue(elem) {
    if (elem.textContent !== "across" && elem.textContent !== "along") {
        elem.classList.add("fixme-tag")
        elem.title = 'roof:orientation must be either "across" or "along"'
    }
}

function makeConditionalValue(elem) {
    if (!elem.textContent.includes("@")) {
        elem.classList.add("fixme-tag")
        elem.title = ":conditional tag value must be contain @"
    }
    if (elem.textContent.match(/@\s*$/)) {
        elem.classList.add("fixme-tag")
        elem.title = "empty part after @"
    }
    if (elem.textContent.match(/^\s*@/)) {
        elem.classList.add("fixme-tag")
        elem.title = "empty part before @"
    }
    if (elem.textContent.match(/@\s*@/)) {
        elem.classList.add("fixme-tag")
        elem.title = "empty part between @"
    }
}

function makeRefBelpostValue(elem) {
    if (!GM_config.get("ImagesAndLinksInTags")) return
    if (elem.innerHTML.match(/^[0-9]+$/)) {
        const a = document.createElement("a")
        a.href = "https://belpost.by/Pochtovyyeyashchiki/" + elem.textContent
        a.rel = "noreferrer"
        a.textContent = elem.textContent
        elem.innerHTML = a.outerHTML
    }
}

function makeOpeningHoursValue(valueCell, key, isVersionPage) {
    try {
        new opening_hours(valueCell.textContent, null, { tag_key: key })
        if (isVersionPage) {
            valueCell.title = "no errors were found by opening_hours.js 👍"
        }
    } catch (e) {
        valueCell.title = e
        valueCell.classList.add("fixme-tag")
        if (isVersionPage) {
            valueCell.querySelectorAll("a").forEach(i => i.classList.add("fixme-tag"))
        }
    }
}

function makeXmasFeatureEasterEgg() {
    const curDate = new Date()
    if ((curDate.getMonth() === 11 && curDate.getDate() >= 18) || (curDate.getMonth() === 0 && curDate.getDate() < 10)) {
        if (!document.querySelector(".egg-snow-tag")) {
            const snowBtn = document.createElement("span")
            snowBtn.classList.add("egg-snow-tag")
            snowBtn.textContent = " ❄️"
            snowBtn.style.cursor = "pointer"
            snowBtn.title = "better-osm-org easter egg"
            snowBtn.addEventListener(
                "click",
                e => {
                    e.target.style.display = "none"
                    runSnowAnimation()
                },
                {
                    once: true,
                },
            )
            document.querySelector(".browse-tag-list").parentElement.previousElementSibling.appendChild(snowBtn)
        }
    }
}

let buildingViewerIframe = null

let contextMenuCSSInjected = false

const contextMenuCSS = `
    .betterOsmContextMenu {
        position: absolute;
        display: "block";
        background: var(--bs-body-bg);
        border: 1px solid var(--bs-border-color);
        box-shadow: 0 2px 5px var(--bs-body-bg);
        z-index: 10000;
        padding: 5px 0;
        border-radius: 4px;
        min-width: 150px;
    }
    .betterOsmContextMenu div {
        cursor: pointer;
        display: flex;
    }
    .betterOsmContextMenu div:hover {
        cursor: pointer;
        background: var(--bs-secondary-bg);
    }
    .betterOsmContextMenu div a {
        display: block;
        padding-top: 6px;
        padding-right: 12px;
        padding-bottom: 6px;
        padding-left: 6px;
    }
    .betterOsmContextMenu div .pin {
        align-content: center;
        padding-right: 8px;
    }
    .betterOsmContextMenu div .pin:hover {
        cursor: pointer;
        background: var(--bs-secondary-bg);
    }
    .betterOsmContextMenu div .pin {
        display: none;
    }
    .betterOsmContextMenu div .pin + label {
        align-self: center;
        padding-left: 6px;
    }
    .betterOsmContextMenu div .pin:not(:checked) + label {
        filter: grayscale(100%);
        opacity: 20%;
        cursor: pointer;
    }
    .betterOsmContextMenu div .pin:not(:checked) + label:hover {
        filter: initial;
        opacity: initial;
    }
`

function injectContextMenuCSS() {
    if (contextMenuCSSInjected) return
    contextMenuCSSInjected = true
    injectCSSIntoOSMPage(contextMenuCSS)
}

// prettier-ignore
const allowedRelationTypes = new Set([
    "multipolygon", "restriction", "route", "boundary", "associatedStreet", "public_transport", "site", "destination_sign",
    "waterway", "route_master", "building", "enforcement", "street", "power", "connectivity", "provides_feature",
    "turnlanes:turns", "bridge", "TMC", "network", "person", "superroute", "watershed", "collection", "tmc", "junction",
    "tmc:point", "tunnel", "node", "associated_address", "turnlanes:lengths", "dual_carriageway", "level", "railway",
    "tmc:link", "group", "traffic_signals_set", "multilinestring", "pipeline", "stop", "associated_entrance", "traffic_mirror",
    "traffic_control", "manoeuvre", "tracks", "election", "destinationsign", "ridge", "surveillance", "region", "cluster",
    "health", "roadAccess", "canal", "disc_golf_course", "circuit", "restriction:hgv", "give_way", "residential", "link",
    "super-relation", "carriageway", "restriction:on_red", "area", "relation", "gallery", "through_route", "right_of_way",
    "linestring", "unposted_route", "water", "operator", "land_area", "navigation", "golf_course", "traffic_signals_group",
    "proposed", "segmented_tag", "road", "man_made", "transit", "construction", "access", "guidepost_destination", "fixme",
    "label", "defaults", "lanelet", "traffic separation scheme", "station",
])

function makeTypeValue(elem, objType) {
    if (objType !== "relation") {
        const hint = "type=* only for relations"
        elem.querySelectorAll("a:not(.warn-tag)").forEach(a => {
            a.classList.add("warn-tag")
            a.title = hint + "\n\n" + a.title
        })
        elem.classList.add("warn-tag")
        elem.title = hint
        return
    }
    const value = elem.textContent.replace(/(^was:|^disused:|^abandoned:)/, "")
    if (!allowedRelationTypes.has(value)) {
        const hint = `type=${value} used < 50 times. This is probably a mistake.`
        elem.querySelectorAll("a:not(.warn-tag)").forEach(a => {
            a.classList.add("warn-tag")
            a.title = hint + "\n\n" + a.title
        })
        elem.classList.add("warn-tag")
        elem.title = hint
    }
}

function needValidateOpeningHoursKey(key) {
    return (
        (key.startsWith("opening_hours") || // https://github.com/opening-hours/opening_hours.js/blob/master/scripts/related_tags.txt
            key.startsWith("happy_hours") ||
            ["delivery_hours", "smoking_hours", "collection_times", "service_times"].includes(key)) &&
        key !== "opening_hours:signed" &&
        key !== "opening_hours:url" &&
        key !== "opening_hours:description" &&
        key !== "opening_hours:note" &&
        typeof opening_hours !== "undefined" // todo log this
    )
}

function needValidateConditionalAccessKey(key) {
    return (
        key.endsWith(":conditional") &&
        !key.startsWith("fixme:") &&
        !key.startsWith("note:") &&
        !key.startsWith("source:") &&
        !key.startsWith("check_date:") &&
        !key.startsWith("description:")
    )
}

function makeRoofDirectionValue(valueCell, row, isVersionPage) {
    if (valueCell.textContent === "across" || valueCell.textContent === "along") {
        // todo more
        valueCell.classList.add("fixme-tag")
        valueCell.title = "it seems to need to be changed to roof:orientation"
        return
    }
    if (!isVersionPage) {
        return
    }
    setTimeout(async () => {
        // todo
        const metadata = await loadWayMetadata()
        const nodes = metadata.elements.filter(i => i.type === "node")
        let lat = 0.0
        let lon = 0.0
        nodes.forEach(i => {
            lat += i.lat
            lon += i.lon
        })
        lat /= nodes.length
        lon /= nodes.length
        row.onmouseenter = () => {
            cleanObjectsByKey("activeObjects")
            renderDirectionTag(lat, lon, valueCell.textContent, c("#ff00e3"))
        }
        row.onmouseleave = () => {
            cleanObjectsByKey("activeObjects")
        }
    })
}

// example https://osm.org/node/6506618057
function makeLinksInVersionTagClickable(row, objType) {
    const keyCell = row.querySelector("th")
    if (!keyCell) return
    const key = keyCell.textContent.toLowerCase()
    const valueCell = row.querySelector("td .current-value-span") ? row.querySelector("td .current-value-span") : row.querySelector("td")
    if (key === "fixme") {
        valueCell.classList.add("fixme-tag")
    } else if (key === "note") {
        valueCell.classList.add("note-tag")
    } else if (key.startsWith("panoramax")) {
        makePanoramaxValue(valueCell)
    } else if (key.startsWith("mapillary")) {
        makeMapillaryValue(valueCell)
    } else if ((key === "xmas:feature" && !document.querySelector(".egg-snow-tag")) || valueCell.textContent.includes("snow")) {
        makeXmasFeatureEasterEgg()
    } else if (key === "wikimedia_commons") {
        makeWikimediaCommonsValue(valueCell)
    } else if (key === "direction" || key === "camera:direction" || key === "light:direction") {
        const coords = row.parentElement.parentElement.parentElement.parentElement.querySelector("span.latitude")
        if (coords) {
            const lat = coords.textContent.replace(",", ".")
            const lon = coords.nextElementSibling.textContent.replace(",", ".")
            const match = location.pathname.match(/(node|way|relation)\/(\d+)\/history\/(\d+)\/?$/)
            if (match || document.querySelector(".browse-tag-list") === row.parentElement.parentElement) {
                cleanObjectsByKey("activeObjects")
                renderDirectionTag(parseFloat(lat), parseFloat(lon), valueCell.textContent, c("#ff00e3"))
            }
            row.onmouseenter = () => {
                cleanObjectsByKey("activeObjects")
                renderDirectionTag(parseFloat(lat), parseFloat(lon), valueCell.textContent, c("#ff00e3"))
            }
        }
    } else if (key === "roof:direction") {
        makeRoofDirectionValue(valueCell, row, true)
    } else if (key === "roof:orientation") {
        makeRoofOrientationValue(valueCell)
    } else if (needValidateConditionalAccessKey(key)) {
        makeConditionalValue(valueCell)
    } else if (needValidateOpeningHoursKey(key)) {
        makeOpeningHoursValue(valueCell, key, true)
    } else if (["building", "building:part"].includes(key) || (key === "type" && valueCell.textContent === "building")) {
        if (location.pathname.includes("/history") || document.querySelector(".view-3d-link")) {
            return
        }
        const m = location.pathname.match(/\/(way|relation)\/(\d+)/)
        if (!m) {
            return
        }
        const [, type, id] = m
        if (!type) {
            return
        }
        if (type === "way" && ["building", "building:part"].includes(key)) {
            const has3DTags = !Array.from(document.querySelectorAll(".browse-tag-list tr th")).some(i => {
                return (
                    i.textContent.includes("level") ||
                    i.textContent.includes("height") ||
                    i.textContent.includes("roof") ||
                    i.textContent.includes("wikidata")
                )
            })
            if (has3DTags) {
                if (document.querySelectorAll('a[href^="/node/"]').length <= 5) {
                    return
                }
            }
        }
        injectCSSIntoOSMPage(
            `
                    #building-3d-view {
                        position: absolute !important;
                        height: 120% !important;
                        z-index: 9999 !important;
                    }
            ` + contextMenuCSS,
        )
        const parent = document.querySelector(".browse-tag-list").parentElement.previousElementSibling
        parent.style.display = "flex"

        const wrapper = document.createElement("span")
        wrapper.classList.add("btn-group")
        wrapper.style.marginLeft = "auto"
        parent.appendChild(wrapper)

        const viewIn3D = document.createElement("span")
        viewIn3D.classList.add("view-3d-link", "btn", "btn-outline-primary")
        viewIn3D.textContent = "3D"
        viewIn3D.style.cursor = "pointer"
        viewIn3D.style.paddingTop = "3px"
        viewIn3D.style.paddingBottom = "3px"
        viewIn3D.title = "Click for show embedded 3D Viewer.\nIn userscript setting you can set open in OSM page by default"

        async function contextMenuHandler(e) {
            const buildingViewer = (await GM.getValue("3DViewer")) ?? "OSM Building Viewer"
            e.preventDefault()
            e.stopPropagation()

            const menu = makeContextMenuElem({
                ...e,
                pageX: e.target.getBoundingClientRect().right,
                pageY: e.target.getBoundingClientRect().bottom,
            })
            instancesOf3DViewers.forEach(i => {
                const listItem = document.createElement("div")
                const a = document.createElement("a")
                const [x, y, z] = getCurrentXYZ()
                a.href = i.makeURL({ x, y, z, type, id })
                a.textContent = i.name
                a.target = "_blank"
                a.style.width = "100%"

                const pin = document.createElement("input")
                pin.id = i.name
                pin.type = "radio"
                pin.classList.add("pin")
                pin.setAttribute("name", "viewer-selector")
                const pinLabel = document.createElement("label")
                pinLabel.setAttribute("for", i.name)
                pinLabel.classList.add("pin-label")
                pinLabel.textContent = "📌"
                pinLabel.title = "Set as default for click"
                if (i.name === buildingViewer) {
                    pin.checked = true
                    pinLabel.title = "It's default viewer"
                }
                pin.onchange = async () => {
                    if (pin.checked) {
                        await GM.setValue("3DViewer", i.name)
                        if (viewIn3D.classList.contains("active")) {
                            viewIn3D.click()
                            viewIn3D.click()
                        }
                    }
                }
                listItem.appendChild(pin)
                listItem.appendChild(pinLabel)
                listItem.appendChild(a)
                document.addEventListener(
                    "click",
                    function fn(e) {
                        if (!e.isTrusted) {
                            document.addEventListener("click", fn, { once: true })
                            return
                        }
                        if (e.target.classList.contains("pin-label") || e.target.classList.contains("pin")) {
                            document.addEventListener("click", fn, { once: true })
                            return
                        }
                        menu.remove()
                    },
                    { once: true },
                )
                menu.appendChild(listItem)
            })
            document.body.appendChild(menu)
        }

        viewIn3D.addEventListener("contextmenu", contextMenuHandler)

        async function clickHandler(e) {
            if (buildingViewerIframe) {
                buildingViewerIframe.remove()
                buildingViewerIframe = null
                viewIn3D.classList.toggle("active")
                return
            }
            const [x, y, z] = getCurrentXYZ()
            const buildingViewer = (await GM.getValue("3DViewer")) ?? "OSM Building Viewer"
            const viewer = instancesOf3DViewers.find(i => i.name === buildingViewer)
            const url = viewer.makeURL({ x, y, z, type, id })
            if (isMobile || e.ctrlKey || e.metaKey || e.which === 2 || GM_config.get("3DViewerInNewTab")) {
                window.open(url, "_blank")
                return
            }
            viewIn3D.classList.toggle("active")

            buildingViewerIframe = GM_addElement("iframe", {
                src: url,
                width: document.querySelector("#map").clientWidth,
                height: "100%",
                id: "building-3d-view",
            })
            document.querySelector("#map").before(buildingViewerIframe)
        }

        viewIn3D.addEventListener("click", clickHandler)
        viewIn3D.addEventListener("auxclick", e => {
            if (e.which !== 2) return
            clickHandler(e)
        })
        wrapper.appendChild(viewIn3D)

        const expand = document.createElement("span")
        expand.classList.add("dropdown-toggle", "dropdown-toggle-split", "btn", "btn-outline-primary")
        expand.style.cursor = "pointer"
        expand.style.paddingTop = "3px"
        expand.style.paddingBottom = "3px"
        wrapper.appendChild(expand)
        expand.onclick = contextMenuHandler
    } else if (
        // prettier-ignore
        (key === "route" || key === "superroute") &&
        ["hiking", "foot", "bicycle", "mtb", "horse", "inline_skates", "ski", "piste"].includes(valueCell.textContent)
    ) {
        if (document.querySelector(".route-viewer-link")) {
            return
        }
        const value = valueCell.textContent
        const m = location.pathname.match(/\/(relation)\/(\d+)/)
        if (!m) {
            return
        }
        const [, type, id] = m
        if (!type) {
            return
        }
        const waymarkedtrails_type = {
            hiking: "hiking",
            foot: "hiking",
            bicycle: "cycling",
            mtb: "mtb",
            horse: "riding",
            inline_skates: "skating",
            ski: "slopes",
            piste: "slopes",
        }[value]
        const relationViewer = document.createElement("a")
        relationViewer.innerHTML = externalLinkSvg
        relationViewer.classList.add("route-viewer-link")
        relationViewer.style.cursor = "pointer"
        relationViewer.style.paddingLeft = "5px"
        relationViewer.style.paddingRight = "10px"
        relationViewer.title = `Open ${waymarkedtrails_type}.waymarkedtrails.org` // `\nRight click for select viewer`

        const [x, y, z] = getCurrentXYZ()
        relationViewer.href = waymarkedtrailsLink.makeURL({ x, y, z, type, id, waymarkedtrails_type })
        relationViewer.target = "_blank"
        relationViewer.rel = "noreferrer"

        document.querySelector(".browse-tag-list").parentElement.previousElementSibling.appendChild(relationViewer)
    } else if (
        key === "route" /*|| key === "route_master"*/ &&
        ["bus", "trolleybus", "minibus", "share_taxi", /*"train",*/ "light_rail", "subway", "tram", "ferry"].includes(valueCell.textContent)
    ) {
        if (document.querySelector(".route-viewer-link")) {
            return
        }
        const m = location.pathname.match(/\/(relation)\/(\d+)/)
        if (!m) {
            return
        }
        const [, type, id] = m
        if (!type) {
            return
        }
        const relationViewer = document.createElement("a")
        relationViewer.innerHTML = externalLinkSvg
        relationViewer.classList.add("route-viewer-link")
        relationViewer.style.cursor = "pointer"
        relationViewer.style.paddingLeft = "8px"
        relationViewer.style.paddingRight = "5px"
        relationViewer.title = `Open ptna.openstreetmap.de`

        relationViewer.href = publicTransportNetworkAnalysisLink.makeURL({ id })
        relationViewer.target = "_blank"
        relationViewer.rel = "noreferrer"

        const relationEditor = document.createElement("a")
        relationEditor.innerHTML = pencilLinkSvg
        relationEditor.classList.add("route-viewer-link")
        relationEditor.style.cursor = "pointer"
        relationEditor.style.paddingLeft = "5px"
        relationEditor.style.paddingRight = "5px"
        relationEditor.title = `Edit with relatify.monicz.dev`

        relationEditor.href = relatifyLink.makeURL({ id })
        relationEditor.target = "_blank"
        relationEditor.rel = "noreferrer"

        document.querySelector(".browse-tag-list").parentElement.previousElementSibling.appendChild(relationViewer)
        document.querySelector(".browse-tag-list").parentElement.previousElementSibling.appendChild(relationEditor)
    } else if (key === "type") {
        makeTypeValue(valueCell, objType)
    } else if (key === "ref:belpost") {
        if (!valueCell.querySelector("a")) {
            makeRefBelpostValue(valueCell)
        }
    } else if (key.length <= 2 && key !== "to" && key !== "tv" && key !== "it") {
        keyCell.classList.add("fixme-tag")
        keyCell.title = "The key is too short"
    }
}

function makeLinksInVersionTagsClickable() {
    document
        .querySelectorAll(".browse-tag-list tr")
        .forEach(row => makeLinksInVersionTagClickable(row, location.pathname.match(/\/(node|way|relation)\/(\d+)/)?.[1]))
    const tagsTable = document.querySelector(".browse-tag-list")
    if (tagsTable) {
        tagsTable.parentElement.previousElementSibling.title = tagsTable.querySelectorAll("tr th").length + " tags"
    }
}

function addHistoryLink() {
    if (
        (!location.pathname.startsWith("/node") && !location.pathname.startsWith("/way") && !location.pathname.startsWith("/relation")) ||
        location.pathname.includes("/history")
    )
        return
    if (document.querySelector(".history_button_class")) return true
    const versionInSidebar = document.querySelector("#sidebar_content h4 a")
    if (!versionInSidebar) {
        return
    }
    const a = document.createElement("a")
    const curHref = document.querySelector("#sidebar_content h4 a").href.match(/(.*)\/(\d+)$/)
    a.href = curHref[1]
    a.textContent = "🕒"
    a.title = "Click for open object history page\nOr press key H"
    a.classList.add("history_button_class")
    if (curHref[2] !== "1") {
        versionInSidebar.after(a)
        versionInSidebar.after(document.createTextNode("\xA0"))
    }
    resetSearchFormFocus()
    makeTimesSwitchable()
    if (GM_config.get("ResizableSidebar")) {
        document.querySelector("#sidebar").style.resize = "horizontal"
    }
    makeLinksInVersionTagsClickable()
    makeHashtagsClickable()
    document.querySelectorAll("#element_versions_list > div p").forEach(shortOsmOrgLinks)
    injectCSSIntoOSMPage(`
    table.browse-tag-list tr td[colspan="2"] {
        background: var(--bs-body-bg) !important;
    }
    `)
}
//</editor-fold>
