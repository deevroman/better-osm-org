//<editor-fold desc="main" defaultstate="collapsed">

function main() {
    "use strict"
    if (GM_config.get("DebugMode")) {
        _isDebug = true
    }
    if (GM_config.get("ColorblindFriendlyPalette")) {
        setColorblindFriendlyPalette()
    }
    if (location.origin === "https://www.hdyc.neis-one.org" || location.origin === "https://hdyc.neis-one.org") {
        simplifyHDCYIframe()
        return
    }
    if (location.origin === "https://osmcha.org") {
        setTimeout(async () => {
            await GM.setValue("OSMCHA_TOKEN", localStorage.getItem("token"))
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

//</editor-fold>
