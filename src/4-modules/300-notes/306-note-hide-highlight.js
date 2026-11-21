//<editor-fold desc="note-hide-highlight" defaultstate="collapsed">

let mapDataSwitcherUnderSupervision = false

function hideNoteHighlight() {
    const g = document.querySelector("#map g")
    if (!g || g.childElementCount === 0) return
    const mapDataCheckbox = document.querySelector(".layers-ui #label-layers-data input")
    if (mapDataCheckbox && !mapDataCheckbox.checked) {
        if (mapDataSwitcherUnderSupervision) return
        mapDataSwitcherUnderSupervision = true
        mapDataCheckbox.addEventListener(
            "click",
            () => {
                mapDataSwitcherUnderSupervision = false
                hideNoteHighlight()
            },
            { once: true },
        )
        return
    }
    console.log("hide halo around note")
    if (
        g.childNodes[g.childElementCount - 1].getAttribute("stroke") === "#FF6200" &&
        g.childNodes[g.childElementCount - 1].getAttribute("d").includes("a20,20 0 1,0 -40,0 ")
    ) {
        g.childNodes[g.childElementCount - 1].remove()
        document.querySelector("div.leaflet-marker-icon:last-child").style.filter = "contrast(120%)"
    }
    // getMap().dataLayer.on('click', intoPageWithFun((e) => {
    //     if (!e.originalEvent.altKey) {
    //         return
    //     }
    //     debugger
    //     getWindow().mapDataIDsFilter.add(e.layer.id);
    //     e.propagatedFrom.getElement().style.display = "none";
    //     getMap().fire("moveend");
    // }))
}

function setupHideNoteHighlight() {
    if (!location.pathname.startsWith("/note/")) return
    tryApplyModule(hideNoteHighlight, 1000, 5000)
}

//</editor-fold>
