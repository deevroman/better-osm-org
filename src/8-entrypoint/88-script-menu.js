//<editor-fold desc="script-menu" defaultstate="collapsed">

function makeCommandsMenu() {
    try {
        GM_registerMenuCommand(t("scriptMenu.settings"), function () {
            if (!inFrame()) {
                actionOpenSettings()
            }
        })
        if (isMobile || isDebug()) {
            GM_registerMenuCommand(t("scriptMenu.checkScriptUpdates"), actionOpenScriptUpdateUrl)
        }
        if (isDebug()) {
            GM_registerMenuCommand(t("scriptMenu.checkDevScriptUpdates"), actionOpenDevScriptUpdateUrl)
        }

        // New Year Easter egg
        const curDate = new Date()
        if ((curDate.getMonth() === 11 && curDate.getDate() >= 18) || (curDate.getMonth() === 0 && curDate.getDate() < 10)) {
            GM_registerMenuCommand("☃️", runSnowAnimation)
        }

        GM_registerMenuCommand(t("scriptMenu.listOfHotkeys"), actionShowHotkeysHelp)
        // GM_registerMenuCommand("Ask question on forum", function () {
        //     window.open("https://community.openstreetmap.org/t/better-osm-org-a-script-that-adds-useful-little-things-to-osm-org/121670")
        // });
    } catch (e) {
        console.error(e)
    }
}

//</editor-fold>
