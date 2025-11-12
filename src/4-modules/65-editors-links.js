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
// const localExternalLinksURL = "http://localhost:7777/misc/assets/external-links.json"
const githubExternalLinksURL = `https://raw.githubusercontent.com/deevroman/better-osm-org/refs/heads/dev/misc/assets/external-links.json?bypasscache=${Math.random()}`
const externalLinksURL = githubExternalLinksURL

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
    const cache = await GM.getValue("external-links", "")
    // if (isDebug()) {
    //     await loadAndMakeExternalLinksDatabase()
    // }
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
const randomParam = Math.random().toString()

function updateUrlTemplateContext() {
    const [x, y, z] = getCurrentXYZ()
    urlTemplateContext.latitude = urlTemplateContext.lat = urlTemplateContext.x = x
    urlTemplateContext.longitude = urlTemplateContext.lon = urlTemplateContext.y = y
    urlTemplateContext.zoom = urlTemplateContext.z = z
    const osm_m = location.pathname.match(/\/(node|way|relation|changeset|note)\/([0-9]+)/)
    urlTemplateContext.osm_type = osm_m?.[1]
    urlTemplateContext.osm_type_first_letter = urlTemplateContext.osm_type?.[0]
    urlTemplateContext.osm_id = parseInt(osm_m?.[2])
    ;["node", "way", "relation", "changeset", "note", "undefined"].forEach(i => {
        delete urlTemplateContext[`osm_${i}_id`]
    })
    urlTemplateContext[`osm_${urlTemplateContext.osm_type}_id`] = urlTemplateContext.osm_id
    // todo как мониторить изменения выделения?
    // todo как быть с iD, который в iframe?
    // urlTemplateContext.raw_selected_text = window.getSelection().toString()
    // urlTemplateContext.selected_text = encodeURI(urlTemplateContext.raw_selected_text)
    // if (urlTemplateContext.raw_selected_text === "") {
    //     urlTemplateContext.raw_selected_text = undefined
    //     urlTemplateContext.selected_text = undefined
    // }
    urlTemplateContext.random_param = randomParam
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
        overflow-x: hidden;
        max-height: min(85vh, 100vh - 75px);
        max-width: 100vw;
        padding-bottom: 0px !important;
        overscroll-behavior: none;
    }
    
    
    @media (max-width: 767.910px) {
    
    #edit_tab > .dropdown-menu {
        max-height: min(85vh, 100vh - 170px);
    }
    
    .open-dropdown {
        display: block !important;
        top: -100px !important;
        max-height: min(85vh, 100vh - 75px) !important;
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
    
    ul:not(.editing) .delete-link-btn {
        display: none !important;
    }
    
    .edit-link-btn {
        margin-right: 8px !important;
        border-right: solid gray 1px !important;
        padding-right: 8px !important;
        cursor: pointer;
    }
    
    .edit-link-btn:hover {
        color: var(--bs-body-color) !important;
    }
    
    .delete-link-btn {
        all: unset;
        cursor: pointer;
        margin-left: 4px;
        margin-right: 12px;
    }
    
    .in-editing .delete-link-btn {
        margin-right: 4px;
    }
    
    .in-editing {
        padding-top: 1px;
        padding-bottom: 1px;
    }
    
    #edit-link-btn {
        cursor: pointer;
    }
    
    #change-list-btn .delete-link-btn {
        display: none;
    }
      
    .add-link-btn {
        margin-right: 8px !important;
        border-right: solid gray 1px !important;
        padding-right: 8px !important;
        cursor: pointer;
    }
    
    .add-link-btn:hover {
        color: var(--bs-body-color) !important;
    }
    
    .create-link-btn:hover {
        color: var(--bs-body-color) !important;
    }
    
    ul:not(.editing) .dropdown-item#change-list-btn {
        cursor: pointer;
    }

    ul:not(.editing) .dropdown-item#change-list-btn:not(:hover) {
        color: gray !important;
    }

    #edit_tab li:has(.dropdown-item):not(.off-hover):hover {
        background-color: #7ebc6f;
    }
    
    @media (max-width: 767.910px) {
    
    li > .dropdown-item#change-list-btn:not(:has(.create-link-btn)):hover {
        color: gray !important;
    }
    
    }
    

    ul.editing > li > :where(span,a) {
        padding-left: 8px !important;
        padding-right: 8px !important;
    }
    
    .add-item-a {
        display: flex;
        alignItems: center;
        gap: 5px;
    }
    
    .add-item-a:hover {
        color: var(--bs-body-color) !important;
    }
    
    .add-item-a.in-editing:hover {
        background: initial !important;
    }
    
    .add-item-a.in-editing > span {
        width: 100%
    }
    
    .inputs-wrapper {
        display: flex;
        margin-left: 5px;
        gap: 5px;
    }
    
    .inputs-wrapper .title-input {
        flex: 1;
        width: 100%;
    }
    
    .inputs-wrapper .template-input {
        flex: 3;
        width: 100%;
    }
    
    @media (max-width: 767.910px) {
    
    .in-editing {
        align-items: center !important;
    }
    
    .inputs-wrapper {
        flex-direction: column;
        row-gap: 10px;
    }
    
    .in-editing > .create-link-btn {
        padding-top: 10px !important;
        padding-bottom: 10px !important;
    }
    
    .add-item-a.in-editing input {
        margin-left: 0px !important;
    }
    
    }
        
    `)
}

let dropdownObserver = null

async function loadCurrentLinksList() {
    const raw_data = await GM.getValue("user-external-links")
    if (!raw_data/* || isDebug()*/) {
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
            const deleteBtn = makeDeleteLinkBtn(link.name, newElem)
            deleteBtn.style.marginLeft = "auto"
            a.after(deleteBtn)
            a.style.display = "flex"
            a.style.alignItems = "baseline"
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
        const errorText = ` (${e})`
        if (resultBox && resultBox.textContent !== errorText) {
            resultBox.textContent = ` (${e})`
        }
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
        resultBox.textContent = ""
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

function makeDeleteLinkBtn(nameValue, addItemLi) {
    const deleteBtn = document.createElement("button")
    deleteBtn.classList.add("delete-link-btn", "bi", "bi-trash")
    deleteBtn.title = "remove link"
    deleteBtn.onclick = async e => {
        e.preventDefault()
        e.stopPropagation()
        if (!confirm(`Delete ${nameValue}?`)) {
            return
        }
        addItemLi.remove()
        externalLinks = externalLinks.filter(i => i.name !== nameValue)
        await GM.setValue("user-external-links", JSON.stringify(externalLinks))
    }
    return deleteBtn
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

    const deleteBtn = makeDeleteLinkBtn(nameValue, addItemLi)

    const title = document.createElement("input")
    title.classList.add("title-input")
    title.placeholder = "Link name"
    title.value = nameValue

    const createLikBtn = document.createElement("button")
    createLikBtn.classList.add("create-link-btn", "bi", nameValue === "" ? "bi-plus-lg" : "bi-floppy")
    createLikBtn.style.all = "unset"
    createLikBtn.title = "save link"

    const template = document.createElement("input")
    template.classList.add("template-input")
    template.placeholder = (isMobile ? "" : "URL example: ") + "https://osm.org/{osm_type}/{osm_id}/#map={zoom}/{lon}/{lat}"
    template.name = "custom-link-template"
    template.value = templateValue

    addItemA.classList.add("in-editing")
    addItemA.prepend(createLikBtn)

    const inputWrapper = document.createElement("span")
    inputWrapper.classList.add("inputs-wrapper")
    inputWrapper.appendChild(title)
    inputWrapper.appendChild(template)
    addItemA.appendChild(inputWrapper)

    addItemA.appendChild(deleteBtn)

    targetLi.replaceWith(addItemLi)
    addItemLi.classList.add("off-hover")

    editorsListUl.querySelectorAll(".edit-link-btn").forEach(i => (i.style.display = ""))
    editorsListUl.querySelectorAll(".add-link-btn").forEach(i => (i.style.display = ""))

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
            addItemA.classList.remove("in-editing")
            addItemLi.classList.remove("off-hover")
            addItemLi.classList.add("need-repair")
            processExternalLink(newLink, false, editorsListUl, true)
        }
        addUserExternalLinks(false, editorsListUl)
        editorsListUl.querySelectorAll(".edit-link-btn").forEach(i => (i.style.display = ""))
        addItemLi.classList.remove("in-editing")
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
    if (isMobile && document.querySelector("#map")) {
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

            function linksMenuClickHandler(e) {
                e.preventDefault()
                e.stopPropagation()
                if (document.querySelector("header").classList.contains("closed")) {
                    document.querySelector("#edit_tab > ul").classList.add("open-dropdown")
                    document.querySelector("#menu-icon").click()
                    document.querySelector("#edit_tab > button").click()
                } else if (document.querySelector("#edit_tab > .dropdown-menu").classList.contains("show")) {
                    document.querySelector("#edit_tab > ul").classList.remove("open-dropdown")
                    document.querySelector("#edit_tab > button").click()
                    document.querySelector("#menu-icon").click()
                } else {
                    document.querySelector("#edit_tab > ul").classList.add("open-dropdown")
                    document.querySelector("#edit_tab > button").click()
                }
            }

            linksBtn.addEventListener("click", linksMenuClickHandler)

            if (isDebug() && !document.querySelector("#open-external-panel-btn")) {
                setTimeout(async () => {
                    for (let i = 0; i < 40; i++) {
                        await sleep(30)
                        if (document.querySelector("#open-external-panel-btn")) {
                            break
                        }
                        const linksBtn2 = document.querySelector(".control-query").cloneNode(true)
                        linksBtn2.id = "open-external-panel-btn"
                        linksBtn2.querySelector("a").innerHTML = svg.outerHTML
                        linksBtn2.querySelector("svg").setAttribute("stroke-width", "1.75")
                        linksBtn2.addEventListener("click", linksMenuClickHandler)
                        document.querySelector(".control-query").after(linksBtn2)
                    }
                })
            }
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
            if (editJosmBtn && isMobile) {
                editJosmBtn.style.overflowY = "scroll"
                editJosmBtn.style.scrollbarWidth = "none"
            }
            const editIdBtn = editorsListUl.querySelector('[href*="/edit?editor=id"]')
            if (editIdBtn && isMobile) {
                editIdBtn.style.overflowY = "scroll"
                editIdBtn.style.scrollbarWidth = "none"
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
            span.id = "change-list-btn"
            span.classList.add("closed", "dropdown-item")
            if (isMobile) {
                span.classList.add("off-hover")
            }
            editListLi.appendChild(span)

            // hack for preload bootstrap font
            const dummy = document.createElement("span")
            dummy.classList.add("bi", "bi-pencil")
            dummy.style.opacity = "0"
            span.appendChild(dummy)

            editListLi.addEventListener(
                "click",
                e => {
                    e.preventDefault()
                    e.stopPropagation()
                    e.stopImmediatePropagation()
                    span.classList.remove("closed")
                    addOtherExternalLinks(editorsListUl)

                    span.textContent = ["ru-RU", "ru"].includes(navigator.language) ? "редактировать список" : "edit links list"
                    editorsListUl.scrollIntoView()
                    editListLi.onclick = e => {
                        e.preventDefault()
                        e.stopPropagation()
                        e.stopImmediatePropagation()

                        editorsListUl.classList.add("editing")
                        makeExternalLinkEditable(editListLi, editorsListUl)
                        editorsListUl.scrollIntoView()
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
