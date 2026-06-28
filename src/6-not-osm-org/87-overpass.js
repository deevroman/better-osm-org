//<editor-fold desc="overpass" defaultstate="collapsed">

function addLevel0Reborn() {
    if (!document.querySelector("#export-dialog.is-active")) {
        return
    }
    if (document.querySelector("#export-editors-level0-reborn")) {
        document.querySelector("#export-editors-level0-reborn").remove()
    }
    const l0export = document.querySelector("#export-editors-level0")

    const l0reborn = l0export.cloneNode(true)
    l0reborn.id = "export-editors-level0-reborn"
    l0reborn.textContent += "Reborn β"
    l0reborn.setAttribute(
        "href",
        l0reborn.getAttribute("href").replace("https://level0.osmz.ru", "https://deevroman.github.io/level0-reborn"),
    )
    l0export.after(l0reborn)
}

function setupOverpass() {
    if (!isDebug()) {
        return
    }
    const obs = new MutationObserver(addLevel0Reborn)
    obs.observe(document.querySelector("#export-dialog"), { attributes: true })
}

//</editor-fold>
