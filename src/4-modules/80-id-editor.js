//<editor-fold desc="id-editor" defaultstate="collapsed">

function addImageryOffsetsDB() {
    console.log("addImageryOffsetsDB")
    const offsetSelectionSection = document.querySelector(".disclosure-wrap-background_offset")
    if (!offsetSelectionSection) {
        return false
    }
    const loadBtn = document.createElement("button")
    loadBtn.textContent = "Find offsets"
    loadBtn.title = "better-osm-org experimental feature"
    loadBtn.onclick = async () => {
        loadBtn.style.cursor = "progress"
        try {
            const [x, y, z] = getCurrentXYZ()
            const offsets = (await externalFetchRetry({
                url: `https://offsets.textual.ru/get?lat=${x}&lon=${y}&format=json&radius=2`,
                responseType: "json"
            })).response.filter(i => i.type === "offset")
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
                    offsetSelectionSection.querySelector("input").dispatchEvent(new Event('change'))
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
    const timerId = setInterval(() => {
        if (addImageryOffsetsDB()) clearInterval(timerId)
    }, 2000)
    setTimeout(() => {
        clearInterval(timerId)
        console.debug("stop try add imagery offset")
    }, 10000)
    addImageryOffsetsDB()
}

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
    if (isDebug()) {
        setupImageryOffsetsDB()
    }
}

//</editor-fold>
