//<editor-fold desc="context-menu-items" defaultstate="collapsed">

let contextMenuObserver = null

async function setupNewContextMenuItems() {
    await interceptMapManually()
    if (!getMap) {
        await sleep(1000)
    }
    if (!getMap) {
        console.error("Ruler can't be configured: map object not available")
        return
    }
    const menu = document.getElementById("map-context-menu")
    makeMeasureMouseHandlers()
    contextMenuObserver = new MutationObserver((mutationList, observer) => {
        observer.disconnect()
        const customSeparator = addMenuSeparator(menu)
        addMeasureMenuItem(customSeparator)
        addPOIMoverItem(measuringCleanMenuItem ?? measuringMenuItem)

        contextMenuObserver.observe(menu, { childList: true, subtree: true, attributes: true })
    })
    contextMenuObserver.observe(menu, { childList: true, subtree: true, attributes: true })
}

//</editor-fold>
