//<editor-fold desc="id-editor" defaultstate="collapsed">

function setupIDframe() {
    if (GM_config.get("DarkModeForID")) {
        injectCSSIntoOSMPage(`
                @media ${mediaQueryForWebsiteTheme} {
                    ${GM_getResourceText("DARK_THEME_FOR_ID_CSS")}
                }`)
    }
    GM_registerMenuCommand("Show iD OAuth token", function () {
        let token = document.querySelector("#id-container")?.getAttribute("data-token")
        if (!token) {
            token = localStorage.getItem(`${osm_server.url}oauth2_access_token`)
            if (!token) {
                alert("Please switch the focus to the Iframe iD.\nJust click anywhere in the editor.")
                return
            }
        }
        alert(token)
    })
    setupBetterTagsPaste()
}

//</editor-fold>
