//<editor-fold desc="copy-coordinates" defaultstate="collapsed">

let copyCoordinatesMenuItem

function removeCopyCoordinatesMenuItem() {
    copyCoordinatesMenuItem?.remove()
    copyCoordinatesMenuItem = null
}

let contextMenuStylesAdded = false

function addContextMenuStyles() {
    if (contextMenuStylesAdded) return
    contextMenuStylesAdded = true
    injectCSSIntoOSMPage(`
        .copy-coordinates-btn:not(:hover) {
            color: gray;
        }
    `)
}

function addCopyCoordinatesMenuItem(prevItem) {
    addContextMenuStyles()
    removeCopyCoordinatesMenuItem()
    if (!measurerAdded) {
        return
    }
    const clickLat = parseFloat(getMap().osm_contextmenu._$element.data("lat"))
    const clickLon = parseFloat(getMap().osm_contextmenu._$element.data("lng"))
    const coordinatesFormatters = makeCoordinatesFormatters(clickLat, clickLon)
    let text = coordinatesFormatters[coordinatesFormat]['getter']()

    copyCoordinatesMenuItem = document.createElement("li")
    copyCoordinatesMenuItem.classList.add("copy-li")
    copyCoordinatesMenuItem.style.cursor = "pointer"

    const a = document.createElement("a")
    a.classList.add("dropdown-item", "d-flex", "align-items-center", "gap-3")
    const textSpan = document.createElement("span")
    textSpan.textContent = text
    a.appendChild(textSpan)

    const i = document.createElement("i")
    i.classList.add("bi", "bi-copy")
    a.prepend(i)
    copyCoordinatesMenuItem.appendChild(a)
    prevItem.after(copyCoordinatesMenuItem)

    a.onclick = async function moveNode(e) {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
        navigator.clipboard.writeText(text).catch(e => alert(`failed to copy:\n${text}`))
        getMap().osm_contextmenu.hide()
    }


    const formatSwitch = document.createElement("span")
    formatSwitch.classList.add("bi", "bi-arrow-left-right", "copy-coordinates-btn")
    formatSwitch.style.marginLeft = "auto"
    formatSwitch.title = `Change coordinates format\nCurrent: ${coordinatesFormat}`

    formatSwitch.onclick = async e => {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()

        const formats = [...Object.keys(coordinatesFormatters), ...Object.keys(coordinatesFormatters)]
        const nextFormat = formats.indexOf(coordinatesFormat) + 1
        coordinatesFormat = formats[nextFormat]
        await GM.setValue("CoordinatesFormat", coordinatesFormat)
        text = coordinatesFormatters[coordinatesFormat]
        textSpan.textContent = text
    }
    a.appendChild(formatSwitch)
}

//</editor-fold>
