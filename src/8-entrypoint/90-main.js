//<editor-fold desc="main" defaultstate="collapsed">
// TODO сначала проверить сайт, а после инициализировать GM_config и вызывать main
function _main() {
    "use strict"
    if (GM_config.get("DebugMode")) {
        _isDebug = true
    }
    if (location.origin === ogf_prod_server.origin && !isDebug()) {
        return
    }
    if (GM_config.get("ColorblindFriendlyPalette")) {
        setColorblindFriendlyPalette()
    }
    if (location.origin === "https://www.hdyc.neis-one.org" || location.origin === "https://hdyc.neis-one.org") {
        simplifyHDCYIframe()
        return
    }
    if (location.origin === "https://osmcha.org") {
        let token = localStorage.getItem("token")
        if (!token) {
            token = JSON.parse(localStorage.getItem("auth"))["state"]["token"]
        }
        setTimeout(async () => {
            await GM.setValue("OSMCHA_TOKEN", token)
        }, 1000)
        return
    }
    if (location.origin === "https://osmcha.openhistoricalmap.org") {
        setTimeout(async () => {
            let token = localStorage.getItem("token")
            if (!token) {
                token = JSON.parse(localStorage.getItem("auth"))["state"]["token"]
            }
            await GM.setValue("OHM_OSMCHA_TOKEN", token)
        }, 1000)
        return
    }
    makeCommandsMenu()
    if (location.origin === "https://taginfo.openstreetmap.org" || location.origin === "https://taginfo.geofabrik.de") {
        new MutationObserver(
            (function fn() {
                setTimeout(setupTaginfo, 0)
                return fn
            })(),
        ).observe(document, { subtree: true, childList: true })
        return
    }
    if (isOsmServer()) {
        setupOSMWebsite()
    }
    if (location.origin === "https://wiki.openstreetmap.org") {
        setupWiki()
    }
}

function main() {
    performance.mark("BETTER_OSM_MAIN_CALL")
    runOnDOMContentLoaded(_main)
}
//</editor-fold>
