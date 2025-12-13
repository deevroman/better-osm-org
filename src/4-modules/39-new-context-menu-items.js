//<editor-fold desc="context-menu-items" defaultstate="collapsed">

let contextMenuObserver = null
let coordinatesFormat = "Lat Lon"

async function setupNewContextMenuItems() {
    coordinatesFormat = await GM.getValue("CoordinatesFormat") ?? "Lat Lon"
    await interceptMapManually()
    if (!getMap) {
        await sleep(1000)
    }
    if (!getMap) {
        console.error("Ruler can't be configured: map object not available")
        return
    }
    const menu = document.getElementById("map-context-menu")
    if (!menu) {
        console.error("context menu not found on page")
        return
    }
    makeMeasureMouseHandlers()
    contextMenuObserver = new MutationObserver((mutationList, observer) => {
        observer.disconnect()
        const customSeparator = addMenuSeparator(menu)
        addMeasureMenuItem(customSeparator)
        addCopyCoordinatesMenuItem(measuringCleanMenuItem ?? measuringMenuItem);
        addPOIMoverItem(copyCoordinatesMenuItem ?? measuringCleanMenuItem ?? measuringMenuItem)

        contextMenuObserver.observe(menu, { childList: true, subtree: true, attributes: true })
    })
    contextMenuObserver.observe(menu, { childList: true, subtree: true, attributes: true })
}

//</editor-fold>
