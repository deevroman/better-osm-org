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
    insertSvg(document.querySelector(".compact-toggle-btn"), shouldBeCompact ? "expandMode" : "compactMode")
}

function makeRoofOrientationValue(elem) {
    if (elem.textContent !== "across" && elem.textContent !== "along") {
        elem.classList.add("fixme-tag")
        elem.title = t("objectPage.roofOrientationAcrossAlong")
    }
}

function makeContactValue(elem, key) {
    try {
        if (!elem.textContent.includes(".")) {
            return
        }
        const urlParams = new URL(elem.textContent).searchParams
        const warns = []
        ;[
            "cm_mmc",
            "cmpid",
            "fbclid",
            "gad_source",
            "gclid",
            "gclsrc",
            "igsh",
            "igshid",
            "mc_id",
            "mibextid",
            "si",
            "srsltid",
            "utm_campaign",
            "utm_content",
            "utm_medium",
            "utm_source",
            "utm_term",
            "yclid",
            "ysclid",
        ].forEach(param => {
            if (urlParams.has(param)) {
                warns.push(param)
            }
        })
        if (warns.length > 0) {
            elem.classList.add("warn-tag")
            elem.querySelectorAll("a").forEach(a => a.classList.add("warn-tag"))
            elem.title = warns.map(param => t("objectPage.trackingParamInUrl", { param })).join("\n")
        }
    } catch (e) {
        // todo report about invalid URL
        console.error(e)
    }
    if (key === "website" || key === "contact:website") {
        if (!elem.textContent.startsWith("https://") && !elem.textContent.startsWith("http://")) {
            elem.classList.add("warn-tag")
            elem.querySelectorAll("a").forEach(a => a.classList.add("warn-tag"))
            elem.title = t("objectPage.urlShouldStartWithHttp")
        }
    }
}

function makeConditionalValue(elem) {
    if (!elem.textContent.includes("@")) {
        elem.classList.add("fixme-tag")
        elem.title = t("objectPage.conditionalMustContainAt")
    }
    if (elem.textContent.match(/@\s*$/)) {
        elem.classList.add("fixme-tag")
        elem.title = t("objectPage.emptyPartAfterAt")
    }
    if (elem.textContent.match(/^\s*@/)) {
        elem.classList.add("fixme-tag")
        elem.title = t("objectPage.emptyPartBeforeAt")
    }
    if (elem.textContent.match(/@\s*@/)) {
        elem.classList.add("fixme-tag")
        elem.title = t("objectPage.emptyPartBetweenAt")
    }
}

function makeRefBelpostValue(elem) {
    if (!GM_config.get("ImagesAndLinksInTags")) return
    if (elem.innerHTML.match(/^[0-9]+$/)) {
        const a = document.createElement("a")
        a.href = "https://belpost.by/Pochtovyyeyashchiki/" + elem.textContent
        a.rel = "noreferrer"
        a.textContent = elem.textContent
        elem.setHTML(a.outerHTML)
    }
}

function makeOpeningHoursValue(valueCell, key, isVersionPage) {
    try {
        new opening_hours(valueCell.textContent, null, { tag_key: key })
        if (isVersionPage) {
            valueCell.title = t("objectPage.noErrorsOpeningHours")
        }
        if (isObjectPage()) {
            valueCell.querySelectorAll('a[href^="https://openingh.openstreetmap.de/evaluation_tool/"]:not(.with-lat-lon)').forEach(a => {
                a.classList.add("with-lat-lon")
                updateCurrentObjectMetadata().then(r => {
                    const href = a.getAttribute("href")
                    const node = r.elements.find(i => i.lat !== undefined)
                    if (node) {
                        a.setAttribute("href", href + `&lat=${node.lat}&lon=${node.lon}`)
                    }
                })
            })
        }
    } catch (e) {
        valueCell.title = e
        valueCell.classList.add("fixme-tag")
        if (isVersionPage) {
            valueCell.querySelectorAll("a").forEach(i => i.classList.add("fixme-tag"))
        }
    }
}

function makePhoneValue(valueCell, key) {
    try {
        if (valueCell.textContent[0] !== "+") {
            valueCell.title = t("objectPage.phoneMustStartPlus")
            valueCell.classList.add("fixme-tag")
            valueCell.querySelectorAll("a").forEach(i => i.classList.add("fixme-tag"))
        } else if (!valueCell.textContent.split(";").every(i => libphonenumber.isPossiblePhoneNumber(i.trim()))) {
            valueCell.title = t("objectPage.invalidPhone", { value: valueCell.textContent })
            valueCell.classList.add("warn-tag")
            valueCell.querySelectorAll("a").forEach(i => i.classList.add("warn-tag"))
        }
    } catch (e) {
        console.error(e)
    }
}

function makeEmailValue(valueCell, key) {
    const email_regex = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i

    if (!valueCell.textContent.split(";").every(i => i.trim().match(email_regex))) {
        valueCell.title = t("objectPage.invalidEmail", { value: valueCell.textContent })
        valueCell.classList.add("warn-tag")
        valueCell.querySelectorAll("a").forEach(i => i.classList.add("warn-tag"))
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
            snowBtn.title = t("objectPage.easterEgg")
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

let viewerIframe = null

const contextMenuCSS = `
    #building-3d-view,
    #building-indoor-view {
        height: 120% !important;
        z-index: 9999 !important;
    }

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

function registerContextMenuStyles() {
    registerOSMStyle("context-menu", () => contextMenuCSS)
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
    "label", "defaults", "lanelet", "traffic separation scheme", "station", "kit", "golf", "sport", "controlled_parking_zone"
])

function makeTypeValue(elem, objType) {
    if (objType !== "relation") {
        const hint = t("objectPage.typeOnlyForRelations")
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
        const hint = t("objectPage.suspiciousRelationType", { value })
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

function needValidatePhoneKey(key) {
    return (
        key === "contact:phone" || key === "contact:mobile" || key === "contact:fax" || key === "phone" || key === "mobile" || key === "fax"
    )
}

function needValidateEmailKey(key) {
    return key === "contact:email" || key === "email" || key === "brand:email"
}

function needValidateTrackingParamsInContact(key) {
    // TODO any https:// ?
    return (
        key === "website" ||
        key.startsWith("website:") ||
        key.endsWith(":website") ||
        key === "contact:vk" ||
        key === "contact:instagram" ||
        key === "contact:facebook" ||
        key === "source" ||
        key === "image"
    )
}

function makeRoofDirectionValue(valueCell, row, isVersionPage) {
    if (valueCell.textContent === "across" || valueCell.textContent === "along") {
        // todo more
        valueCell.classList.add("fixme-tag")
        valueCell.title = t("objectPage.needRoofOrientation")
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

function makeViewerValue(valueCell, key) {
    const isIndoorViewer = key === "indoor" || (key === "shop" && valueCell.textContent === "mall")
    const viewerConfig = isIndoorViewer
        ? {
              viewers: instancesOfIndoorViewers,
              storageKey: "IndoorViewer",
              defaultViewer: "OSM Simple 3D editor",
              linkClass: "view-indoor-link",
              buttonText: "indoor",
              title: "objectPage.clickShowEmbeddedIndoor",
              iframeId: "building-indoor-view",
              openInNewTabConfig: null,
          }
        : {
              viewers: instancesOf3DViewers,
              storageKey: "3DViewer",
              defaultViewer: "OSM Building Viewer",
              linkClass: "view-3d-link",
              buttonText: "3D",
              title: "objectPage.clickShowEmbedded3d",
              iframeId: "building-3d-view",
              openInNewTabConfig: "3DViewerInNewTab",
          }

    if (location.pathname.includes("/history") || document.querySelector(`.${viewerConfig.linkClass}`)) {
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
    if (!isIndoorViewer && type === "way" && ["building", "building:part"].includes(key)) {
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
    const parent = document.querySelector(".browse-tag-list").parentElement.previousElementSibling
    parent.style.display = "flex"

    let wrapper = parent.querySelector(".btn-group")
    if (!wrapper) {
        wrapper = document.createElement("span")
        wrapper.classList.add("btn-group")
        wrapper.style.marginLeft = "auto"
        parent.appendChild(wrapper)
    }

    const viewInViewer = document.createElement("span")
    viewInViewer.classList.add(viewerConfig.linkClass, "btn", "btn-outline-primary")
    viewInViewer.textContent = viewerConfig.buttonText
    viewInViewer.style.cursor = "pointer"
    viewInViewer.style.paddingTop = "3px"
    viewInViewer.style.paddingBottom = "3px"
    viewInViewer.style.marginLeft = "5px"
    viewInViewer.style.borderTopLeftRadius = "var(--bs-border-radius)"
    viewInViewer.style.borderBottomLeftRadius = "var(--bs-border-radius)"
    viewInViewer.title = t(viewerConfig.title)

    async function contextMenuHandler(e) {
        if (document.querySelector(".betterOsmContextMenu")) {
            document.querySelector(".betterOsmContextMenu").remove()
            return
        }
        const selectedViewer = (await GM.getValue(viewerConfig.storageKey)) ?? viewerConfig.defaultViewer
        e.preventDefault()
        e.stopPropagation()

        const menu = makeContextMenuElem({
            ...e,
            pageX: e.target.getBoundingClientRect().right,
            pageY: e.target.getBoundingClientRect().bottom,
        })
        viewerConfig.viewers.forEach(i => {
            const listItem = document.createElement("div")
            const a = document.createElement("a")
            const [x, y, z] = getCurrentXYZ()
            a.href = i.makeURL({ x, y, z, type, id, osm_type_first_letter: type[0] })
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
            pinLabel.title = t("objectPage.setAsDefaultForClick")
            if (i.name === selectedViewer) {
                pin.checked = true
                pinLabel.title = t("objectPage.defaultViewer")
            }
            pin.onchange = async () => {
                if (pin.checked) {
                    await GM.setValue(viewerConfig.storageKey, i.name)
                    if (viewInViewer.classList.contains("active")) {
                        viewInViewer.click()
                        viewInViewer.click()
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

    viewInViewer.addEventListener("contextmenu", contextMenuHandler)

    async function clickHandler(e) {
        if (viewerIframe) {
            viewerIframe.remove()
            viewerIframe = null
            viewInViewer.classList.toggle("active")
            return
        }
        const [x, y, z] = getCurrentXYZ()
        const selectedViewer = (await GM.getValue(viewerConfig.storageKey)) ?? viewerConfig.defaultViewer
        const viewer = viewerConfig.viewers.find(i => i.name === selectedViewer)
        const url = viewer.makeURL({ x, y, z, type, id, osm_type_first_letter: type[0] })
        if (
            isMobile ||
            e.ctrlKey ||
            e.metaKey ||
            e.which === 2 ||
            (viewerConfig.openInNewTabConfig && GM_config.get(viewerConfig.openInNewTabConfig))
        ) {
            window.open(url, "_blank")
            return
        }
        viewInViewer.classList.toggle("active")

        viewerIframe = GM_addElement("iframe", {
            src: url,
            width: document.querySelector("#map").clientWidth,
            height: "100%",
            id: viewerConfig.iframeId,
        })
        document.querySelector("#map").before(viewerIframe)
    }

    viewInViewer.addEventListener("click", clickHandler)
    viewInViewer.addEventListener("auxclick", e => {
        if (e.which !== 2) return
        clickHandler(e)
    })
    wrapper.appendChild(viewInViewer)

    const expand = document.createElement("span")
    expand.classList.add("dropdown-toggle", "dropdown-toggle-split", "btn", "btn-outline-primary")
    expand.style.cursor = "pointer"
    expand.style.paddingTop = "3px"
    expand.style.paddingBottom = "3px"
    wrapper.appendChild(expand)
    expand.onclick = contextMenuHandler
}

// example https://osm.org/node/6506618057
function makeLinksInVersionTagClickable(row, objType) {
    const keyCell = row.querySelector("th")
    if (!keyCell) return
    const rawKey = keyCell.textContent
    const key = rawKey.toLowerCase()
    const valueCell = row.querySelector("td .current-value-span") ? row.querySelector("td .current-value-span") : row.querySelector("td")
    if (key.startsWith("fixme")) {
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
        makeWikimediaCommonsValue(valueCell, true)
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
    } else if (needValidatePhoneKey(key)) {
        makePhoneValue(valueCell)
    } else if (needValidateEmailKey(key)) {
        makeEmailValue(valueCell)
    } else if (needValidateTrackingParamsInContact(key)) {
        makeContactValue(valueCell, key)
    } else if (needValidateConditionalAccessKey(key)) {
        makeConditionalValue(valueCell)
    } else if (needValidateOpeningHoursKey(key)) {
        makeOpeningHoursValue(valueCell, key, true)
    } else if (key === "indoor" || (key === "shop" && valueCell.textContent === "mall")) {
        makeViewerValue(valueCell, key)
    } else if (["building", "building:part"].includes(key) || (key === "type" && valueCell.textContent === "building")) {
        makeViewerValue(valueCell, key)
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
        insertSvg(relationViewer, "externalLink")
        relationViewer.classList.add("route-viewer-link")
        relationViewer.style.cursor = "pointer"
        relationViewer.style.paddingLeft = "5px"
        relationViewer.style.paddingRight = "10px"
        relationViewer.title = t("objectPage.openWebsite", { host: `${waymarkedtrails_type}.waymarkedtrails.org` }) // `\nRight click for select viewer`

        const [x, y, z] = getCurrentXYZ()
        relationViewer.href = waymarkedtrailsLink.makeURL({ x, y, z, type, id, waymarkedtrails_type })
        relationViewer.target = "_blank"
        relationViewer.rel = "noreferrer"

        document.querySelector(".browse-tag-list").parentElement.previousElementSibling.appendChild(relationViewer)
    } else if (key.startsWith("building:")) {
        if (key === "building:min_level") {
            if (!Number.isFinite(Number(valueCell.textContent))) {
                valueCell.classList.add("fixme-tag")
                valueCell.title = t("objectPage.minLevelIsNotNumber")
            }
        }
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
        insertSvg(relationViewer, "externalLink")
        relationViewer.classList.add("route-viewer-link")
        relationViewer.style.cursor = "pointer"
        relationViewer.style.paddingLeft = "8px"
        relationViewer.style.paddingRight = "5px"
        relationViewer.title = t("objectPage.openWebsite", { host: "ptna.openstreetmap.de" })

        relationViewer.href = publicTransportNetworkAnalysisLink.makeURL({ id })
        relationViewer.target = "_blank"
        relationViewer.rel = "noreferrer"

        const relationEditor = document.createElement("a")
        insertSvg(relationEditor, "pencilLink")
        relationEditor.classList.add("route-viewer-link")
        relationEditor.style.cursor = "pointer"
        relationEditor.style.paddingLeft = "5px"
        relationEditor.style.paddingRight = "5px"
        relationEditor.title = t("objectPage.editWithWebsite", { host: "relatify.monicz.dev" })

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
    } else if (key === "ref:inaturalist.org") {
        makeRefInaturalistValue(valueCell)
    } else if (key === "image:fotoshi" || key === "fotoshi") {
        makeFotoshiValue(valueCell)
    } else if (key.startsWith("was:") || key.startsWith("disused:") || key.startsWith("old_")) {
        if (GM_config.get("ReorderOldTags") && !location.pathname.endsWith("/history")) {
            keyCell.classList.add("old-tags-key")
            valueCell.classList.add("old-tags-value")
        }
    } else if (key.length <= 2 && key !== "to" && key !== "tv" && key !== "it") {
        keyCell.classList.add("fixme-tag")
        keyCell.title = t("objectPage.keyTooShort")
    } else if (key.length >= 2 && rawKey[0] >= "A" && rawKey[0] <= "Z" && rawKey[1] >= "a" && rawKey[1] <= "z") {
        keyCell.classList.add("fixme-tag")
        keyCell.title = t("objectPage.suspiciousCapitalKey")
    }
}

function makeLinksInVersionTagsClickable() {
    document
        .querySelectorAll(".browse-tag-list tr")
        .forEach(row => makeLinksInVersionTagClickable(row, location.pathname.match(/\/(node|way|relation)\/(\d+)/)?.[1]))
    const tagsTable = document.querySelector(".browse-tag-list")
    if (tagsTable) {
        tagsTable.parentElement.previousElementSibling.title = t("historyDiff.tagsCount", {
            count: tagsTable.querySelectorAll("tr th").length,
        })
    }
    if (GM_config.get("ReorderOldTags") && !location.pathname.endsWith("/history")) {
        // move old tags to end list
        Array.from(document.querySelectorAll(".browse-tag-list tr")).forEach(row => {
            const keyCell = row.querySelector("th")
            if (!keyCell) return
            const rawKey = keyCell.textContent
            const key = rawKey.toLowerCase()
            if (key.startsWith("was:") || key.startsWith("disused:") || key.startsWith("old_")) {
                row.parentElement.appendChild(row)
            }
        })
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
    a.title = t("objectPage.openObjectHistory")
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
