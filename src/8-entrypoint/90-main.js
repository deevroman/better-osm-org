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
    setCustomPalette()
    if (location.origin === "https://www.hdyc.neis-one.org" || location.origin === "https://hdyc.neis-one.org") {
        simplifyHDCYIframe()
        return
    }

    if (location.origin === "https://osmcha.org") {
        setupOsmcha()
        return
    }
    if (location.origin === "https://osmcha.openhistoricalmap.org") {
        setupOhmOsmcha()
        return
    }
    makeCommandsMenu()
    if (location.origin === "https://taginfo.openstreetmap.org" || location.origin === "https://taginfo.geofabrik.de") {
        new MutationObserver(
            (function fn() {
                queueMicrotask(setupTaginfo)
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
    if (
        location.origin === "https://overpass-turbo.eu" ||
        (location.origin === "https://maps.mail.ru" && location.pathname === "/osm/tools/overpass/")
    ) {
        setupOverpass()
    }
}

function main() {
    performance.mark("BETTER_OSM_MAIN_CALL")
    runOnDOMContentLoaded(_main)
}
//</editor-fold>
