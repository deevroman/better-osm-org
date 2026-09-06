//<editor-fold desc="id-editor" defaultstate="collapsed">

function addImageryOffsetsDB() {
    console.log("addImageryOffsetsDB")
    const offsetSelectionSection = document.querySelector(".disclosure-wrap-background_offset")
    if (!offsetSelectionSection) {
        return false
    }
    if (document.querySelector(".find-offsets-btn")) {
        return true
    }
    const loadBtn = document.createElement("button")
    loadBtn.textContent = t("idEditor.findOffsets")
    loadBtn.classList.add("find-offsets-btn")
    loadBtn.title = t("betterOsmOrg.experimentalFeature")
    loadBtn.onclick = async () => {
        loadBtn.style.cursor = "progress"
        try {
            const [x, y, z] = getCurrentXYZ()
            const offsets = (
                await externalFetchRetry({
                    url: `https://offsets.textual.ru/get?lat=${x}&lon=${y}&format=json&radius=2`,
                    responseType: "json",
                })
            ).response.filter(i => i.type === "offset")
            console.log(offsets)
            document.querySelectorAll(".offsets-item").forEach(i => i.remove())
            offsets.forEach(i => {
                const lat = i.lat
                const lon = i.lon
                const imlat = i.imlat
                const imlon = i.imlon
                const latDiff = -getDistanceFromLatLonInKm(lat, lon, imlat, lon) * 1000
                const lonDiff = getDistanceFromLatLonInKm(lat, lon, lat, imlon) * 1000

                debugger
                const item = document.createElement("div")
                item.classList.add("offsets-item")
                const btn = document.createElement("button")
                btn.style.cursor = "pointer"
                btn.style.textAlign = "left"
                btn.style.width = "100%"
                btn.style.marginTop = "2px"
                btn.style.marginBottom = "2px"
                btn.style.whiteSpace = "pre"
                btn.textContent = `${latDiff.toFixed(2)} ${lonDiff.toFixed(2)} ${i.date} ${i.author}\n${i.imagery} ${i.description}`
                btn.onclick = () => {
                    offsetSelectionSection.querySelector("input").value = `${lonDiff.toFixed(2)}, ${latDiff.toFixed(2)}`
                    offsetSelectionSection.querySelector("input").dispatchEvent(new Event("change"))
                }
                item.appendChild(btn)
                loadBtn.after(item)
            })
        } finally {
            loadBtn.style.cursor = "pointer"
        }
    }
    offsetSelectionSection.appendChild(loadBtn)
    return true
}

function setupImageryOffsetsDB() {
    tryApplyModule(addImageryOffsetsDB, 2000, 10000)
}

let idSidebarObserver = null

function initIdSidebarObserver() {
    if (idSidebarObserver) {
        return
    }
    const sidebar = document.querySelector(".sidebar")
    idSidebarObserver = new MutationObserver((mutations, obs) => {
        obs.disconnect()
        if (document.querySelector(".sidebar-component") && !document.querySelector(".notes-buttons-wrapper")) {
            addResolveNotesButtonInId()
        }
        obs.observe(sidebar, { childList: true })
    })
    idSidebarObserver.observe(sidebar, { childList: true })
}

function addResolveNotesButtonInId() {
    /** @type {string} */
    const resolveButtonsText = GM_config.get("ResolveNotesButton")
    if (!resolveButtonsText) {
        return true
    }
    const parsedResolveButtonsText = JSON.parse(resolveButtonsText)
    if (parsedResolveButtonsText.length === 0) {
        return
    }
    if (!document.querySelector(".sidebar")) {
        return
    }
    try {
        initIdSidebarObserver()
    } catch (e) {
        console.error(e)
    }
    const saveSection = document.querySelector(".note-save.save-section")
    if (!saveSection) {
        return
    }
    if (document.querySelector(".save-button")) {
        return
    }
    if (document.querySelector(".notes-buttons-wrapper")) {
        return true
    }

    const buttonsWrapper = document.createElement("span")
    buttonsWrapper.classList.add("notes-buttons-wrapper")
    buttonsWrapper.style.display = "flex"
    buttonsWrapper.style.flexWrap = "wrap"
    buttonsWrapper.style.gap = "4px"
    buttonsWrapper.style.rowGap = "4px"
    buttonsWrapper.style.paddingBottom = "30px"
    buttonsWrapper.style.margin = "10px"
    buttonsWrapper.style.marginTop = "5px"
    buttonsWrapper.style.fontSize = "14px"
    saveSection.querySelector(".buttons").after(buttonsWrapper)

    parsedResolveButtonsText.forEach(row => {
        const label = row["label"]
        let text = label
        if (row["text"] !== "") {
            text = row["text"]
        }
        const b = document.createElement("button")
        b.classList.add("resolve-note-done", "btn", "btn-primary", "button", "action")
        b.textContent = label
        b.style.padding = "10px 15px"
        b.title = t("notes.resolveButtonTitle", { text })
        buttonsWrapper.appendChild(b)
        b.onclick = async e => {
            const textarea = saveSection.querySelector("textarea.new-comment-input")
            const prev = textarea.value
            const cursor = textarea.selectionEnd
            textarea.value = prev.substring(0, cursor) + text + prev.substring(cursor)

            const ev = new InputEvent("input", {
                bubbles: true,
                cancelable: false,
                data: textarea.value,
                inputType: "insertFromPaste",
            })
            textarea.dispatchEvent(ev)
            if (!GM_config.get("AutoResolveNote") || e.altKey) {
                return
            }
            saveSection.querySelector(".buttons > .status-button.action").click()
        }
    })
}

function setupResolveNotesButtonInId() {
    tryApplyModule(addResolveNotesButtonInId, 2000, 10000)
}

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
