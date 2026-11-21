//<editor-fold desc="id-editor-setup" defaultstate="collapsed">

/*
let _iD_Context = null

function getCoreContext() {
    return _iD_Context
}

function setCoreContext(c) {
    _iD_Context = c
}

if (isOsmServer() || isIdeditorInstance()) {
    try {
        let value = getWindow().iD
        Object.defineProperty(getWindow(), "iD", {
            configurable: true,
            enumerable: true,
            get() {
                return value
            },
            set(newValue) {
                const cc = newValue.coreContext
                value = {
                    ...newValue,
                    coreContext: () => {
                        const context = cc()
                        const originalInit = context.init

                        context.init = () => {
                            originalInit()
                            setCoreContext(context)
                            return context
                        }
                        return context
                    },
                }
            },
        })
    } catch (e) {
        console.error(e)
    }
}
*/
function setupIDframe() {
    if (GM_config.get("DarkModeForID")) {
        injectCSSIntoOSMPage(`
            @media ${mediaQueryForWebsiteTheme} {
                ${GM_getResourceText("DARK_THEME_FOR_ID_CSS")}
            }`)
    }
    GM_registerMenuCommand("Show iD OAuth token", function () {
        const token = extractOauthToken()
        if (!token) {
            alert(t("idEditor.focusIframeAlert"))
            return
        }
        alert(token)
    })
    // GM_registerMenuCommand("Create point with coordinates", function () {
    //     console.log(getCoreContext())
    //     debugger
    // })
    setupBetterTagsPaste()
    if (isDebug()) {
        setupImageryOffsetsDB()
    }
    setupResolveNotesButtonInId()
}

//</editor-fold>
