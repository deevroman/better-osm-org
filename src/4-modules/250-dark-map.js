//<editor-fold desc="dark-map" defaultstate="collapsed">

let darkModeForMap = false
let darkMapStyleElement = null

function injectDarkMapStyle() {
    darkMapStyleElement = injectCSSIntoOSMPage(`
    @media (prefers-color-scheme: dark) {
        .leaflet-tile-container, .mapkey-table-entry td:first-child > * {
            filter: none !important;
        }

        .leaflet-tile-container * {
            filter: none !important;
        }

        .leaflet-tile-container .leaflet-tile:not(.no-invert), .mapkey-table-entry td:first-child > * {
            filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%) !important;
        }
    }
    `)
}

function setupDarkModeForMap() {
    if (!GM_config.get("DarkModeForMap") || darkModeForMap) {
        return
    }
    injectDarkMapStyle()
    darkModeForMap = true
}
//</editor-fold>
