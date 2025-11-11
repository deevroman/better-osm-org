//<editor-fold desc="editors-links" defaultstate="collapsed">

/** @typedef {null | {
 *  name: string,
 *  template: string,
 *  description: string,
 *  warn: string|undefined,
 *  onlyMobile: boolean|undefined,
 *  default: boolean|undefined,
 *  } } externalLink
 *  */

/** @type {null | externalLink[]}*/
let externalLinks = null
/** @type {null | externalLink[]}*/
let externalLinksDatabase = null
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

function addSafeNameForExternalLinks(links) {
    links.forEach(i => {
        i.safeName = makeSafeForCSS(i.name)
    })
}

async function loadAndMakeExternalLinksDatabase() {
    const raw_data = (
        await externalFetchRetry({
            url: externalLinksURL,
            responseType: "json",
        })
    ).response
    if (!raw_data) {
        throw "External link not downloaded"
    }
    console.log("external links database updated")
    externalLinksDatabase = raw_data.links.filter(l => l.disabled !== true)
    addSafeNameForExternalLinks(externalLinksDatabase)
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
    if (isDebug()) {
        await loadAndMakeExternalLinksDatabase()
    }
    const cache = await GM.getValue("external-links", "")
    if (externalLinksDatabase) return
    if (cache) {
        console.log("external links cached")
        const json = JSON.parse(cache)
        const cacheTime = new Date(json["cacheTime"])
        const threeDaysLater = new Date(cacheTime.getTime() + 6 * 60 * 60 * 1000)
        if (threeDaysLater < new Date()) {
            console.log("but cache outdated")
            setTimeout(loadAndMakeExternalLinksDatabase, 0)
        }
        externalLinksDatabase = JSON.parse(cache)["raw_data"].links.filter(l => l.disabled !== true)
        addSafeNameForExternalLinks(externalLinksDatabase)
        return
    }
    console.log("loading external links")
    try {
        await loadAndMakeExternalLinksDatabase()
    } catch (e) {
        console.log("loading external links list failed", e)
    }
}

let urlTemplateContext = {}

function updateUrlTemplateContext() {
    const [x, y, z] = getCurrentXYZ()
    urlTemplateContext.latitude = urlTemplateContext.lat = urlTemplateContext.x = x
    urlTemplateContext.longitude = urlTemplateContext.lon = urlTemplateContext.y = y
    urlTemplateContext.zoom = urlTemplateContext.z = z
    const osm_m = location.pathname.match(/\/(node|way|relation|changeset|note)\/([0-9]+)/)
    urlTemplateContext.osm_type = osm_m?.[1]
    urlTemplateContext.osm_type_first_letter = urlTemplateContext.osm_type?.[0]
    urlTemplateContext.osm_id = parseInt(osm_m?.[2])
    urlTemplateContext[`osm_${urlTemplateContext.osm_type}_id`] = urlTemplateContext.osm_id
    // todo как мониторить изменения выделения?
    // urlTemplateContext.raw_selected_text = window.getSelection().toString()
    // urlTemplateContext.selected_text = encodeURI(urlTemplateContext.raw_selected_text)
    urlTemplateContext.random_param = Math.random().toString()
}

let coordinatesObserver = null
let dropdownStyleAdded = false

function addDropdownStyle() {
    if (dropdownStyleAdded) {
        return
    }
    dropdownStyleAdded = true
    injectCSSIntoOSMPage(`
        /* make attribution panel compact */
        @media (max-width: 500px) {

        .leaflet-control-attribution {
            padding: 0 2px
        }
        
        .leaflet-control-attribution a[href="https://wiki.osmfoundation.org/wiki/Terms_of_Use"] {
            display: none;
        }
        
        }

        #edit_tab > .dropdown-menu {
            overflow-y: scroll;
            overflow-x: hidden;
            max-height: min(85vh, 100vh - 160px);
            max-width: 100vw;
            padding-bottom: 0px !important;
        }
        
        @media (max-width: 767.910px) {
        
        .open-dropdown {
            display: block !important;
            top: -100px !important;
            max-height: min(85vh, 100vh - 55px) !important;
        }
        
        }
        
        @media (min-width: 768px) {

        .off-hover > #change-list-btn {
            width: 80vw !important;
        }
        
        }
        
        .off-hover:hover {
            background: initial !important;
        }
        
        ul:not(.editing) .invalid-external-link {
            display: none !important;
        }
        
        ul:not(.editing) .result-box {
            display: none !important;
        }
        
        ul:not(.editing) .edit-link-btn {
            display: none !important;
        }
        
        ul:not(.editing) .add-link-btn {
            display: none !important;
        }
        
        .edit-link-btn {
            margin-right: 8px !important;
            border-right: solid gray 1px !important;
            padding-right: 8px !important;
        }
        
        .edit-link-btn:hover {
            color: black !important;
        }
        
        .edit-link-btn {
            margin-right: 8px !important;
            border-right: solid gray 1px !important;
            padding-right: 8px !important;
        }
        
        .delete-link-btn:hover {
            color: black !important;
        }
        
        .add-link-btn {
            margin-right: 8px !important;
            border-right: solid gray 1px !important;
            padding-right: 8px !important;
        }
        
        .add-link-btn:hover {
            color: black !important;
        }
        
        ul:not(.editing) .dropdown-item#change-list-btn {
            color: gray !important;
        }
        
        .dropdown-item:has(#change-list-btn):not(:has(.create-link-btn)):hover {
            color: black !important;
        }

        @media (max-width: 767.910px) {

        ul.editing > li > :where(span,a) {
            padding-left: 8px !important;
        }
        
        ul.editing > li > #change-list-btn{
            padding-right: 0px !important;
        }
    
        }        
        
        .add-item-a {
            display: flex;
            alignItems: center;
            gap: 5px;
        }
        
        /* #edit_tab > .dropdown-menu > li > a {
            padding-left: 30px !important;
        }
        */
    `)
}

let dropdownObserver = null

async function loadCurrentLinksList() {
    const raw_data = await GM.getValue("user-external-links")
    if (!raw_data) {
        externalLinks = externalLinksDatabase.filter(link => {
            if (!link.default) {
                return false
            }
            if (link.onlyMobile) {
                return isMobile
            }
            return true
        })
        await GM.setValue("user-external-links", JSON.stringify(externalLinks))
    } else {
        externalLinks = JSON.parse(raw_data)
    }
    addSafeNameForExternalLinks(externalLinks)
    externalLinks.forEach(link => {
        if (link.template.includes("$")) {
            console.warn("$ in template. Possible error", link)
        }
    })
}

function makeUrlFromTemplate(template) {
    return template.replaceAll(/\{([a-z_]+)}/g, (match, m1) => {
        const res = urlTemplateContext[m1]
        if (res !== undefined) {
            return res
        }
        throw `failed to substitute "${m1}" on current page`
    })
}

function processExternalLink(link, firstRun, editorsListUl, isUserLink) {
    if (link.name === "-" && firstRun) {
        const hr = document.createElement("hr")
        hr.style.margin = "0px"
        editorsListUl.appendChild(hr)
        return
    }

    let newElem = editorsListUl.querySelector("#custom-editor-" + link.safeName)
    let warnBox = newElem?.querySelector(".warn-box")
    let resultBox = newElem?.querySelector(".result-box")
    const alreadyAdded = !!newElem
    if (!newElem) {
        newElem = editorsListUl.querySelector("li").cloneNode(true)
    }
    if (!alreadyAdded || newElem.classList.contains("need-repair")) {
        newElem.classList.remove("need-repair")
        newElem.classList.add("custom_editors")
        if (isUserLink) {
            newElem.classList.add("user-external-link")
        }
        newElem.id = "custom-editor-" + link.safeName
        const a = newElem.querySelector("a")
        a.removeAttribute("href")
        a.textContent = link.name
        a.setAttribute("target", "_blank")
        a.setAttribute("rel", "noreferrer")

        warnBox = document.createElement("span")
        warnBox.classList.add("warn-box")
        warnBox.style.color = "gray"
        if (!isUserLink && link.warn) {
            warnBox.textContent += ` (${link.warn})`
        }
        a.appendChild(warnBox)

        resultBox = document.createElement("span")
        resultBox.classList.add("result-box")
        resultBox.style.color = "gray"
        a.appendChild(resultBox)

        newElem.style.display = "flex"
        if (isUserLink) {
            const editBtn = document.createElement("button")
            editBtn.classList.add("edit-link-btn", "bi", "bi-pencil")
            editBtn.style.all = "unset"
            editBtn.title = "edit link"
            a.prepend(editBtn)
            editBtn.onclick = async e => {
                e.preventDefault()
                e.stopPropagation()

                makeExternalLinkEditable(newElem, editorsListUl, link.name, link.template)
                newElem.remove()
            }
        } else {
            const addBtn = document.createElement("button")
            addBtn.classList.add("add-link-btn", "bi", "bi-plus-lg")
            addBtn.style.all = "unset"
            addBtn.title = "pin this link"
            a.prepend(addBtn)
            addBtn.onclick = async e => {
                e.preventDefault()
                e.stopPropagation()

                newElem.remove()
                externalLinks.push(link)
                await GM.setValue("user-external-links", JSON.stringify(externalLinks))
                addUserExternalLinks(false, editorsListUl)
                editorsListUl.querySelectorAll(".edit-link-btn").forEach(i => (i.style.display = ""))
            }
        }
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
        // a.style.paddingLeft = "210px"
        // newElem.querySelector("a").prepend(document.createTextNode("\xA0"))
        // a.prepend(favicon)
    }
    let actualHref
    try {
        actualHref = makeUrlFromTemplate(link.template)
    } catch (e) {
        if (newElem) {
            newElem.classList.add("invalid-external-link")
        }
        if (isMobile) {
            newElem.style.overflowY = "scroll"
        }
        resultBox.textContent = ` (${e})`
        return
    } finally {
        if (!alreadyAdded) {
            if (isUserLink) {
                const lastLink = Array.from(editorsListUl.querySelectorAll(".user-external-link")).at(-1)
                if (lastLink) {
                    lastLink.after(newElem)
                } else {
                    editorsListUl.appendChild(newElem)
                }
            } else {
                editorsListUl.appendChild(newElem)
            }
        }
    }
    newElem.classList.remove("invalid-external-link")
    const a = newElem.querySelector("a")
    if (a.href !== actualHref) {
        a.href = actualHref
        a.title = link.template
    }
}

function addUserExternalLinks(firstRun, editorsListUl) {
    externalLinks.forEach(link => processExternalLink(link, firstRun, editorsListUl, true))
}

function addOtherExternalLinks(editorsListUl) {
    if (!document.querySelector("#change-list-btn") || document.querySelector("#change-list-btn").classList.contains("closed")) {
        return
    }
    externalLinksDatabase.forEach(link => {
        if (link.onlyMobile && !isMobile) {
            return
        }
        processExternalLink(link, false, editorsListUl, false)
    })
}

function makeExternalLinkEditable(targetLi, editorsListUl, nameValue = "", templateValue = "") {
    const addItemLi = targetLi.cloneNode()
    const addItemA = targetLi.querySelector(":where(a, span)").cloneNode()
    addItemA.classList.add("add-item-a")
    addItemA.onclick = e => {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
    }
    addItemA.href = ""
    addItemLi.appendChild(addItemA)

    const createLikBtn = document.createElement("button")
    createLikBtn.classList.add("create-link-btn", "bi", "bi-plus-lg")
    createLikBtn.style.all = "unset"
    createLikBtn.style.cursor = "pointer"
    createLikBtn.title = "save link"
    addItemA.appendChild(createLikBtn)

    const deleteBtn = document.createElement("button")
    deleteBtn.classList.add("delete-link-btn", "bi", "bi-trash")
    deleteBtn.style.all = "unset"
    deleteBtn.style.display = "none"
    deleteBtn.title = "remove link"
    addItemA.prepend(deleteBtn)
    deleteBtn.onclick = async e => {
        e.preventDefault()
        e.stopPropagation()

        addItemLi.remove()
        externalLinks = externalLinks.filter(i => i.name !== nameValue)
        await GM.setValue("user-external-links", JSON.stringify(externalLinks))
    }

    const title = document.createElement("input")
    title.placeholder = "Link name"
    title.value = nameValue
    if (isMobile) {
        title.size = 9
    }
    title.style.flex = "1"
    title.style.marginLeft = "5px"
    addItemA.appendChild(title)

    const template = document.createElement("input")
    template.placeholder = (isMobile ? "" : "URL example: ") + "https://osm.org/{osm_type}/{osm_id}/#map={zoom}/{lon}/{lat}"
    template.style.flex = "3"
    template.name = "custom-link-template"
    template.value = templateValue
    addItemA.appendChild(template)

    targetLi.replaceWith(addItemLi)
    addItemLi.classList.add("off-hover")

    editorsListUl.querySelectorAll(".edit-link-btn").forEach(i => (i.style.display = ""))
    editorsListUl.querySelectorAll(".add-link-btn").forEach(i => (i.style.display = ""))

    const inputHandler = () => {
        if (title.value.trim() === "" || template.value.trim() === "") {
            deleteBtn.style.display = ""
            createLikBtn.style.display = "none"
        } else {
            deleteBtn.style.display = "none"
            createLikBtn.style.display = ""
        }
    }

    title.oninput = inputHandler
    template.oninput = inputHandler

    createLikBtn.onclick = async e => {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
        /** @type {externalLink} */
        const newLink = {
            name: title.value,
            safeName: makeSafeForCSS(title.value),
            template: template.value,
            description: "",
        }
        if (newLink.name.trim().length === 0) {
            title.setCustomValidity("Set name")
            title.reportValidity()
            return
        }
        if (newLink.template.trim().length === 0 || !newLink.template.includes(":")) {
            template.setCustomValidity("Set valid URL template")
            template.reportValidity()
            return
        }
        if (externalLinks.some(l => l.name === newLink.name) && nameValue === "") {
            title.setCustomValidity("Name already used")
            title.reportValidity()
            return
        }
        console.log(newLink)
        if (nameValue === "") {
            externalLinks.push(newLink)
        } else {
            externalLinks = externalLinks.map(i => {
                if (i.name === nameValue) {
                    return newLink
                } else {
                    return i
                }
            })
        }
        addSafeNameForExternalLinks(externalLinks)
        await GM.setValue("user-external-links", JSON.stringify(externalLinks))
        if (nameValue !== "") {
            title.remove()
            template.remove()
            createLikBtn.remove()
            addItemLi.id = "custom-editor-" + newLink.safeName
            addItemA.classList.remove("add-item-a")
            addItemA.href = ""
            addItemLi.classList.add("need-repair")
            processExternalLink(newLink, false, editorsListUl, true)
        }
        addUserExternalLinks(false, editorsListUl)
        editorsListUl.querySelectorAll(".edit-link-btn").forEach(i => (i.style.display = ""))
    }
}

async function setupNewEditorsLinks(mutationsList) {
    // little optimization for scroll
    if (mutationsList.length === 1 && mutationsList[0].type === "attributes" && mutationsList[0].attributeName === "data-popper-placement") {
        return
    }
    console.debug("setupNewEditorsLinks call")
    if (mutationsList.length === 1 && mutationsList[0].type === "attributes" && mutationsList[0].attributeName === "aria-describedby") {
        document.querySelector("#" + mutationsList[0].target.getAttribute("aria-describedby"))?.remove()
    }
    addDropdownStyle()
    if (isMobile) {
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
    const editorsListUl = document.querySelector("#edit_tab ul")
    if (!editorsListUl) {
        return
    }
    const curURL = editorsListUl.querySelector("li a").href
    const match = curURL.match(/map=(\d+)\/([-\d.]+)\/([-\d.]+)(&|$)/)
    if (!match && !curURL.includes("edit?editor=id")) {
        return
    }
    try {
        coordinatesObserver?.disconnect()
        if (!curURL.includes("edit?editor=id") || !match) {
            return
        }
        if (isMobile) {
            const editJosmBtn = editorsListUl.querySelector('[href*="/edit?editor=remote"]')
            if (editJosmBtn) {
                if (isMobile) {
                    // editJosmBtn.textContent = editJosmBtn.textContent.replace("Редактировать с помощью", "")
                    editJosmBtn.style.overflowY = "scroll"
                    editJosmBtn.style.scrollbarWidth = "none";
                }
                // editJosmBtn.textContent = editJosmBtn.textContent.replace("(JOSM, Potlatch, Merkaartor)", "")
            }
            const editIdBtn = editorsListUl.querySelector('[href*="/edit?editor=id"]')
            if (editIdBtn) {
                if (isMobile) {
                    editIdBtn.style.overflowY = "scroll"
                    editIdBtn.style.scrollbarWidth = "none";
                    // editIdBtn.textContent = editIdBtn.textContent.replace("Редактировать с помощью", "")
                }
            }
        }
        if (firstRun) {
            const hr = document.createElement("hr")
            hr.style.margin = "0px"
            editorsListUl.appendChild(hr)
        }
        if (!externalLinksDatabase) {
            await initExternalLinksList()
        }
        if (!externalLinks) {
            await loadCurrentLinksList()
        }
        updateUrlTemplateContext()

        addUserExternalLinks(firstRun, editorsListUl)
        addOtherExternalLinks(editorsListUl)
        editorsListUl.querySelectorAll("a").forEach(a => {
            a?.classList?.remove("disabled")
        })

        if (!editorsListUl.querySelector("#change-list-btn") && !editorsListUl.querySelector(".create-link-btn")) {
            const hr = document.createElement("hr")
            hr.style.margin = "0px"
            editorsListUl.appendChild(hr)

            const editListLi = editorsListUl.querySelector("li").cloneNode()
            const span = document.createElement("span")
            span.textContent = ["ru-RU", "ru"].includes(navigator.language) ? "больше ссылок" : "more links"
            span.style.cursor = "pointer"
            span.id = "change-list-btn"
            span.classList.add("closed", "dropdown-item")
            if (isMobile) {
                span.classList.add("off-hover")
            }
            editListLi.appendChild(span)
            editListLi.addEventListener(
                "click",
                e => {
                    e.preventDefault()
                    e.stopPropagation()
                    e.stopImmediatePropagation()
                    span.classList.remove("closed")
                    addOtherExternalLinks(editorsListUl)

                    span.textContent = ["ru-RU", "ru"].includes(navigator.language) ? "редактировать список" : "edit links list"
                    editListLi.onclick = e => {
                        e.preventDefault()
                        e.stopPropagation()
                        e.stopImmediatePropagation()

                        editorsListUl.classList.add("editing")
                        makeExternalLinkEditable(editListLi, editorsListUl)
                    }
                },
                { once: true },
            )
            editorsListUl.appendChild(editListLi)
        }
    } finally {
        coordinatesObserver?.disconnect()
        coordinatesObserver = new MutationObserver(setupNewEditorsLinks)
        coordinatesObserver.observe(document.querySelector("#edit_tab"), { subtree: true, childList: true, attributes: true })
    }
}

//</editor-fold>
