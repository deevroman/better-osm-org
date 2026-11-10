//<editor-fold desc="main" defaultstate="collapsed">
// TODO сначала проверить сайт, а после инициализировать GM_config и вызывать main
function _main() {
    "use strict"
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
    if (isIdeditorInstance()) {
        setupIDframe()
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
    if (isOsmRevertServer()) {
        if (!GM_config.get("RetriesForOsmRevert")) {
            getWindow().disableRetriesForOsmRevert = true
        }
    }
}

function main() {
    performance.mark("BETTER_OSM_MAIN_CALL")
    if (GM_config.get("DebugMode")) {
        _isDebug = true
    }
    if (GM_config.get("ColorblindFriendlyPalette")) {
        setColorblindFriendlyPalette()
    }
    setCustomPalette()

    if (!isDebug && isOGFServer()) {
        return
    }

    if (isOsmServer()) {
        registerCopyAnimationStyles()
        registerCopyCoordinatesStyles()
        registerContextMenuStyles()
        registerHotkeyCommandsPopupStyles()
        registerQuickLookStyles()
        registerNotesFiltersStyles()
        if (isDebug()) {
            registerSpyGlassStyles()
        }
        if (GM_config.get("VersionsDiff")) {
            registerHistoryDiffStyles()
        }
        if (GM_config.get("SatelliteLayers")) {
            registerCustomStylePopupStyles()
        }
        if (GM_config.get("NewEditorsLinks")) {
            registerDropdownStyles()
        }
        if (GM_config.get("CompactChangesetsHistory")) {
            registerCompactSidebarStyles()
            if (location.pathname !== "/") {
                try {
                    const sidebar = document.querySelector("#sidebar")
                    if (sidebar && !sidebar.classList.contains("wider")) {
                        sidebar.classList.add("wider")
                        getMap()?.invalidateSize(intoPage({ pan: false }))
                    }
                } catch (err) {}
            }
        }
        injectRegisteredOSMStyles()
    }

    runOnDOMContentLoaded(_main)
}
//</editor-fold>
