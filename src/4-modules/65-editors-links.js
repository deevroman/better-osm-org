//<editor-fold desc="editors-links" defaultstate="collapsed">

/** @typedef {null | {
 *  name: string,
 *  template: string,
 *  description: string,
 *  onlyMobile: boolean,
 *  onlyAndroid: boolean,
 *  default: boolean,
 *  } } externalLink
 *  */

/** @type {null | externalLink[]}*/
let externalLinks = null
/** @type {null | externalLink[]}*/
let externalLinksDatabase = null
const externalLinksURL = "http://localhost:7777/misc/assets/external-links.json"
// const externalLinksURL = `https://raw.githubusercontent.com/deevroman/better-osm-org/refs/heads/dev/misc/assets/external-links.json?bypasscache=${Math.random()}`

function makeSafeForCSS(name) {
    return name.replace(/[^a-z0-9]/g, function (s) {
        const c = s.charCodeAt(0)
        if (c === 32) return "-"
        if (c >= 65 && c <= 90) return "_" + s.toLowerCase()
        return "__" + ("000" + c.toString(16)).slice(-4)
    })
}

function addSafeNameForExternalLinks() {
    externalLinksDatabase.forEach(i => {
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
    externalLinksDatabase = raw_data.links
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
    if (externalLinksDatabase) return
    const cache = await GM.getValue("external-links", "")
    if (externalLinksDatabase) return
    if (!isDebug() && cache) {
        // TODO
        console.log("external links cached")
        const json = JSON.parse(cache)
        const cacheTime = new Date(json["cacheTime"])
        const threeDaysLater = new Date(cacheTime.getTime() + 6 * 60 * 60 * 1000)
        if (threeDaysLater < new Date()) {
            console.log("but cache outdated")
            setTimeout(loadAndMakeExternalLinksList, 0)
        }
        externalLinksDatabase = JSON.parse(cache)["raw_data"].links
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
        @media (max-width: 767.98px) {
        
        .open-dropdown {
            display: block !important;
            top: -100px !important;
        }
        
        }
        #edit_tab > .dropdown-menu {
            overflow-y: scroll;
            max-height: 90dvh;
            max-width: 100vw;
            padding-bottom: 0px !important;
        }
        
        /* #edit_tab > .dropdown-menu > li > a {
            padding-left: 30px !important;
        }
        */
    `)
}

let dropdownObserver = null

async function loadCurrentLinksList() {
    const raw_data = await GM.getValue("externalLinks")
    // if (!raw_data) {
    externalLinks = externalLinksDatabase.filter(link => {
        debugger
        if (!link.default) {
            return false
        }
        if (link.onlyAndroid) {
            return !isSafari
        }
        if (link.onlyMobile) {
            return !isMobile && !isDebug()
        }
        return true
    })
    await GM.setValue("externalLinks", JSON.stringify(externalLinks))
    return
    // }
    externalLinks = JSON.parse(raw_data)
}

async function setupNewEditorsLinks(mutationsList) {
    // little optimization for scroll
    if (mutationsList.length === 1 && mutationsList[0].type === "attributes" && mutationsList[0].attributeName === "data-popper-placement") {
        return
    }
    if (mutationsList.length === 1 && mutationsList[0].type === "attributes" && mutationsList[0].attributeName === "aria-describedby") {
        document.querySelector("#" + mutationsList[0].target.getAttribute("aria-describedby"))?.remove()
    }
    if (isDebug() || isMobile) {
        addDropdownStyle()
        document.querySelectorAll('button[data-bs-target="#select_language_dialog"]:not(.with-link-before)').forEach(langSwitchBtn => {
            langSwitchBtn.classList.add("with-link-before")
            const linksBtn = langSwitchBtn.cloneNode()
            linksBtn.removeAttribute("data-bs-target")
            linksBtn.removeAttribute("data-bs-toggle")
            linksBtn.title = "Open place in external website"
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
        document.querySelectorAll("#menu-icon:not(.listen-click)").forEach(i => {
            i.classList.add("listen-click")
            i.addEventListener("click", e => {
                if (!e.isTrusted) {
                    return
                }
                document.querySelectorAll(".open-dropdown").forEach(d => {
                    d.classList.remove("open-dropdown")
                })
            })
        })
        const dropdown = document.querySelector("#edit_tab > .dropdown-menu")
        dropdownObserver?.disconnect()
        dropdownObserver = new MutationObserver((mutations, observer) => {
            if (!dropdown.classList.contains("show") && dropdown.classList.contains("open-dropdown")) {
                observer.disconnect()
                dropdown.classList.remove("open-dropdown")
                document.querySelector("#menu-icon").click()
            }
        })
        try {
            dropdownObserver.observe(dropdown, { attributes: true })
        } catch (e) {}
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
        if (firstRun) {
            const hr = document.createElement("hr")
            hr.style.margin = "0px"
            editorsList.appendChild(hr)
        }
        if (isMobile || isDebug()) {
            const editJosmBtn = editorsList.querySelector('[href*="/edit?editor=remote"]')
            if (editJosmBtn) {
                editJosmBtn.textContent = editJosmBtn.textContent.replace("(JOSM, Potlatch, Merkaartor)", "")
            }
        }
        if (!isDebug()) {
            return
        }
        if (firstRun) {
            const hr = document.createElement("hr")
            hr.style.margin = "0px"
            editorsList.appendChild(hr)
        }
        if (!externalLinksDatabase) {
            // await — bad idea in MutationObserver callback
            await initExternalLinksList()
        }
        if (!externalLinks) {
            await loadCurrentLinksList()
        }
        const context = {}
        {
            const [x, y, z] = getCurrentXYZ()
            context.latitude = context.lat = context.x = x
            context.longitude = context.lon = context.y = y
            context.zoom = context.z = z
            const osm_m = location.pathname.match(/\/(node|way|relation|changeset|note)\/([0-9]+)/)
            context.osm_type = osm_m?.[1]
            context.osm_type_first_letter = context.osm_type?.[0]
            context.osm_id = parseInt(osm_m?.[2])
            context[`osm_${context.osm_type}_id`] = context.osm_id
            context.selected_text = encodeURI(window.getSelection().toString())
            context.raw_selected_text = window.getSelection().toString()
            context.random_param = Math.random().toString()
        }

        function makeUrl(template) {
            return template.replaceAll(/\{([a-z_]+)}/g, (match, m1) => {
                const res = context[m1]
                if (res !== undefined) {
                    return res
                }
                throw `unsupported "${m1}" substitution or page url`
            })
        }

        externalLinks.forEach(link => {
            if (link.template === "-" && firstRun) {
                const hr = document.createElement("hr")
                hr.style.margin = "0px"
                editorsList.appendChild(hr)
                return
            }

            let newElem = editorsList.querySelector("#custom-editor-" + link.safeName)
            if (firstRun || !newElem) {
                newElem = editorsList.querySelector("li").cloneNode(true)
                newElem.classList.add("custom_editors")
                newElem.id = "custom-editor-" + link.safeName
                const a = newElem.querySelector("a")
                a.textContent = link.name
                a.setAttribute("target", "_blank")
                a.setAttribute("rel", "noreferrer")
                // const host = new URL(link.template).host
                // const favicon = GM_addElement("img", {
                    // src: `https://icons.duckduckgo.com/ip3/${host}.ico`,
                    // src: `https://www.google.com/s2/favicons?domain=${host}&sz=64`,
                    // src: `https://favicon.yandex.net/favicon/${host}`,
                    // height: "16",
                // })
                // favicon.onerror = () => {
                //     favicon.style.display = "none"
                // }
                // favicon.style.position = "absolute"
                // favicon.style.transform = "translateX(-120%)"
                // a.style.alignItems = "center"
                // a.style.position = "relative"
                // a.style.display = "inline-flex"
                // a.style.paddingLeft = "24px"
                // newElem.querySelector("a").prepend(document.createTextNode("\xA0"))
                // a.prepend(favicon)
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
        editorsList.querySelectorAll("a").forEach(a => {
            a?.classList?.remove("disabled")
        })

        if (!editorsList.querySelector("#change-list")) {
            const hr = document.createElement("hr")
            hr.style.margin = "0px"
            editorsList.appendChild(hr)

            const editListBtn = editorsList.querySelector("li").cloneNode()
            editListBtn.classList.add("dropdown-item")
            const span = document.createElement("span")
            span.textContent = ["ru-RU", "ru"].includes(navigator.language) ? "больше ссылок" : "more links"
            span.style.color = "gray"
            span.style.cursor = "pointer"
            span.id = "change-list"
            editListBtn.appendChild(span)
            editListBtn.onclick = e => {
                e.preventDefault()
                e.stopPropagation()
                e.stopImmediatePropagation()
                externalLinksDatabase.forEach(link => {
                    let newElem = editorsList.querySelector("#custom-editor-" + link.safeName)
                    if (newElem) {
                        return
                    }
                    newElem = editorsList.querySelector("li").cloneNode(true)
                    newElem.classList.add("custom_editors")
                    newElem.id = "custom-editor-" + link.safeName
                    const a = newElem.querySelector("a")
                    a.textContent = link.name
                    a.setAttribute("target", "_blank")
                    a.setAttribute("rel", "noreferrer")
                    let actualHref
                    try {
                        actualHref = makeUrl(link.template)
                    } catch (e) {
                        newElem?.remove()
                        return
                    }
                    editorsList.appendChild(newElem)
                })
            }
            editorsList.appendChild(editListBtn)
        }
    } finally {
        coordinatesObserver?.disconnect()
        coordinatesObserver = new MutationObserver(setupNewEditorsLinks)
        coordinatesObserver.observe(document.querySelector("#edit_tab"), { subtree: true, childList: true, attributes: true })
    }
}

//</editor-fold>
