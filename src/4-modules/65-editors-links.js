//<editor-fold desc="editors-links" defaultstate="collapsed">

/** @type {null | {name: string, template: string, usage: string}[]}*/
let externalLinks = null
// const externalLinksURL = "http://localhost:7777/misc/assets/external-links.json"
const externalLinksURL = `https://raw.githubusercontent.com/deevroman/better-osm-org/refs/heads/dev/misc/assets/external-links.json?bypasscache=${Math.random()}`

function makeSafeForCSS(name) {
    return name.replace(/[^a-z0-9]/g, function (s) {
        const c = s.charCodeAt(0)
        if (c === 32) return "-"
        if (c >= 65 && c <= 90) return "_" + s.toLowerCase()
        return "__" + ("000" + c.toString(16)).slice(-4)
    })
}

function addSafeNameForExternalLinks() {
    externalLinks.forEach(i => {
        i.safeName = makeSafeForCSS(i.name)
    })
}

async function loadAndMakeExternalLinksList() {
    const raw_data = (
        await externalFetchRetry({
            url: externalLinksURL,
            responseType: "json",
        })
    ).response
    if (!raw_data) {
        throw "External link not downloaded"
    }
    externalLinks = raw_data.links
    addSafeNameForExternalLinks()
    await GM.setValue(
        "external-links",
        JSON.stringify({
            raw_data: raw_data,
            cacheTime: new Date(),
        }),
    )
}

async function initExternalLinksList() {
    if (externalLinks) return
    const cache = await GM.getValue("external-links", "")
    if (externalLinks) return
    if (!isDebug() && cache) {
        // TODO
        console.log("external links cached")
        const json = JSON.parse(cache)
        const cacheTime = new Date(json["cacheTime"])
        const threeDaysLater = new Date(cacheTime.getTime() + 3 * 24 * 60 * 60 * 1000)
        if (threeDaysLater < new Date()) {
            console.log("but cache outdated")
            setTimeout(loadAndMakeExternalLinksList, 0)
        }
        externalLinks = JSON.parse(cache)["raw_data"].links
        addSafeNameForExternalLinks()
        return
    }
    console.log("loading external links")
    try {
        await loadAndMakeExternalLinksList()
    } catch (e) {
        console.log("loading external links list failed", e)
    }
}

let coordinatesObserver = null
let dropdownStyleAdded = false

function addDropdownStyle() {
    if (dropdownStyleAdded) {
        return
    }
    dropdownStyleAdded = true
    injectCSSIntoOSMPage(`
        .open-dropdown {
            display: block !important;
            top: -100px !important;
        }
        #edit_tab > .dropdown-menu {
            overflow-y: scroll;
            height: 90vh;
        }
    `)
}

async function setupNewEditorsLinks() {
    if (isDebug() || isMobile) {
        addDropdownStyle()
        document.querySelectorAll('button[data-bs-target="#select_language_dialog"]:not(.with-link-before)').forEach(langSwitchBtn => {
            langSwitchBtn.classList.add("with-link-before")
            const linksBtn = langSwitchBtn.cloneNode()
            linksBtn.removeAttribute("data-bs-target")
            linksBtn.removeAttribute("data-bs-toggle")
            linksBtn.innerHTML = externalLinkSvg
            const svg = linksBtn.querySelector("svg")
            svg.setAttribute("width", 20)
            svg.setAttribute("height", 20)
            langSwitchBtn.before(linksBtn)

            linksBtn.addEventListener("click", e => {
                e.preventDefault()
                e.stopPropagation()
                document.querySelector("#edit_tab > ul").classList.toggle("open-dropdown")
                document.querySelector("#menu-icon").click()
                document.querySelector("#edit_tab > button").click()
            })
        })
    }
    const firstRun = document.getElementsByClassName("custom_editors").length === 0
    const editorsList = document.querySelector("#edit_tab ul")
    if (!editorsList) {
        return
    }
    const curURL = editorsList.querySelector("li a").href
    const match = curURL.match(/map=(\d+)\/([-\d.]+)\/([-\d.]+)(&|$)/)
    if (!match && !curURL.includes("edit?editor=id")) {
        return
    }
    try {
        coordinatesObserver?.disconnect()
        if (!curURL.includes("edit?editor=id") || !match) {
            return
        }
        const zoom = match[1]
        const lat = match[2]
        const lon = match[3]
        {
            const rapidLink = "https://mapwith.ai/rapid#poweruser=true&map="
            let newElem
            if (firstRun) {
                newElem = editorsList.querySelector("li").cloneNode(true)
                newElem.classList.add("custom_editors", "rapid_btn")
                newElem.querySelector("a").textContent = "Edit with Rapid"
            } else {
                newElem = document.querySelector(".rapid_btn")
            }
            const actualHref = `${rapidLink}${zoom}/${lat}/${lon}`
            if (newElem.querySelector("a").href !== actualHref) {
                newElem.querySelector("a").href = actualHref
            }
            if (firstRun) {
                editorsList.appendChild(newElem)
            }
        }
        if (!isMobile) {
            // https://osmpie.org/app/?pos=30.434481&pos=59.933311&zoom=18.91
            const osmpieLink = "https://osmpie.org/app/"
            let newElem
            if (firstRun) {
                newElem = editorsList.querySelector("li").cloneNode(true)
                newElem.classList.add("custom_editors", "osmpie_btn")
                newElem.querySelector("a").textContent = "Edit with OSM Perfect Intersection Editor"
                newElem.querySelector("a").setAttribute("target", "_blank")
                newElem.title = "OSM Perfect Intersection Editor"
            } else {
                newElem = document.querySelector(".osmpie_btn")
            }
            const actualHref = `${osmpieLink}?pos=${lon}&pos=${lat}&zoom=${parseInt(zoom)}`
            if (newElem.querySelector("a").href !== actualHref) {
                newElem.querySelector("a").href = actualHref
            }
            if (firstRun) {
                editorsList.appendChild(newElem)
            }
        }
        if (isMobile || isDebug()) {
            const editJosmBtn = editorsList.querySelector('[href*="/edit?editor=remote"]')
            if (editJosmBtn) {
                editJosmBtn.textContent = editJosmBtn.textContent.replace("JOSM, Potlatch, Merkaartor", "JOSM")
            }
        }
        if (!isDebug()) {
            return
        }
        if (!externalLinks) {
            // await — bad idea in MutationObserver callback
            await initExternalLinksList()
        }
        if (firstRun) {
            const hr = document.createElement("hr")
            hr.style.margin = "0px"
            editorsList.appendChild(hr)
        }
        const context = {}
        {
            const [x, y, z] = getCurrentXYZ()
            context.latitude = context.lat = context.x = x
            context.longitude = context.lon = y
            context.zoom = context.z = z
            const osm_m = location.pathname.match(/\/(node|way|relation|changeset|note)\/([0-9]+)/)
            context.osm_type = osm_m?.[1]
            context.osm_id = parseInt(osm_m?.[2])
            context[`osm_${context.osm_type}_id`] = context.osm_id
            context.selected_text = encodeURI(window.getSelection().toString())
            context.raw_selected_text = window.getSelection().toString()
            context.random_param = Math.random().toString()
        }
        externalLinks.forEach(link => {
            function makeUrl(template) {
                return template.replaceAll(/\{([a-z_]+)}/g, (match, m1) => {
                    const res = context[m1]
                    if (res !== undefined) {
                        return res
                    }
                    throw `unsupported "${m1}" substitution or page url`
                })
            }

            let newElem = editorsList.querySelector(".custom-editor-" + link.safeName)
            if (firstRun || !newElem) {
                newElem = editorsList.querySelector("li").cloneNode(true)
                newElem.classList.add("custom_editors", "custom-editor-" + link.safeName)
                newElem.querySelector("a").textContent = link.name
                newElem.querySelector("a").setAttribute("target", "_blank")
            }
            let actualHref
            try {
                actualHref = makeUrl(link.template)
            } catch (e) {
                newElem?.remove()
                return
            }
            if (newElem.querySelector("a").href !== actualHref) {
                newElem.querySelector("a").href = actualHref
            }
            if (firstRun) {
                editorsList.appendChild(newElem)
            }
        })
    } finally {
        coordinatesObserver?.disconnect()
        coordinatesObserver = new MutationObserver(setupNewEditorsLinks)
        coordinatesObserver.observe(editorsList, { subtree: true, childList: true, attributes: true })
    }
}

//</editor-fold>
