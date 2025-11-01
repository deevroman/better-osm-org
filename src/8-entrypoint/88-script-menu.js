//<editor-fold desc="script-menu" defaultstate="collapsed">

function makeCommandsMenu() {
    try {
        GM_registerMenuCommand("Settings", function () {
            if (!inFrame()) {
                GM_config.open()
            }
        })
        if (isMobile || isDebug()) {
            GM_registerMenuCommand("Check script updates", function () {
                window.open(`${SCRIPT_UPDATE_URL}?bypasscache=${Math.random()}`, "_blank")
            })
        }
        if (isDebug()) {
            GM_registerMenuCommand("Check dev script updates", function () {
                window.open(`${DEV_SCRIPT_UPDATE_URL}?bypasscache=${Math.random()}`, "_blank")
            })
        }

        // New Year Easter egg
        const curDate = new Date()
        if ((curDate.getMonth() === 11 && curDate.getDate() >= 18) || (curDate.getMonth() === 0 && curDate.getDate() < 10)) {
            GM_registerMenuCommand("☃️", runSnowAnimation)
        }
        // todo hotkeys
        GM_registerMenuCommand("List of hotkeys", function () {
            window.open("https://github.com/deevroman/better-osm-org/#hotkeys", "_blank")
        })
        // GM_registerMenuCommand("Ask question on forum", function () {
        //     window.open("https://community.openstreetmap.org/t/better-osm-org-a-script-that-adds-useful-little-things-to-osm-org/121670")
        // });
    } catch (e) {
        console.error(e)
    }
}

//</editor-fold>
