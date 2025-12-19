//<editor-fold desc="spy-glass" defaultstate="collapsed">

function addSpyGlassButtons() {
    if (getWindow().fetchIntercepterScriptInited !== true) {
        return
    }
    if (document.getElementById("spy-glass")) {
        return
    }
    const mapDataLabel = Array.from(document.querySelectorAll(".overlay-layers label"))[1]
    if (!mapDataLabel) {
        return
    }
    injectCSSIntoOSMPage(`
    path.spy-glass-stroke-polyline {
        filter: drop-shadow(2px 2px 0 yellow) drop-shadow(-2px -2px 0 yellow) drop-shadow(2px -2px 0 yellow) drop-shadow(-2px 2px 0 yellow);
    }
    
    table.spy-glass tr > td:first-of-type {
        width: 200px;
    }
    
    #map.spy-glass {
        cursor: pointer;
    }
    `)
    const spyGlassBtn = document.createElement("span")
    spyGlassBtn.id = "spy-glass"
    spyGlassBtn.style.cursor = "pointer"
    spyGlassBtn.style.marginLeft = "3px"
    spyGlassBtn.classList.add("bi", "bi-eye-slash-fill")
    spyGlassBtn.title = "Activate SpyGlass imitation mode (better-osm-org experiment)"

    spyGlassBtn.onclick = async () => {
        getWindow().spyGlassMode = !getWindow().spyGlassMode
        if (getWindow().spyGlassMode) {
            spyGlassBtn.classList.remove("bi-eye-slash-fill")
            spyGlassBtn.classList.add("bi-eye-fill")
            document.getElementById("map").classList.add("spy-glass")
            if (!location.hash.includes("D")) {
                Array.from(document.querySelectorAll(".overlay-layers label"))[1].click()
            } else {
                const b = getMap().getBounds()
                const c = getMap().getCenter()
                getMap().setView({lat: c.lat, lng: c.lng + 0.000005})
            }
        } else {
            spyGlassBtn.classList.remove("bi-eye-fill")
            spyGlassBtn.classList.add("bi-eye-slash-fill")
            document.getElementById("map").classList.remove("spy-glass")
        }
    }
    mapDataLabel.after(spyGlassBtn)
}

function setupSpyGlassButtons() {
    if (isDebug()) {
        const timerId = setInterval(addSpyGlassButtons, 500)
        setTimeout(() => {
            clearInterval(timerId)
            console.debug("stop try add SpyGlass buttons")
        }, 5000)
        addSpyGlassButtons()
    }
}

//</editor-fold>
