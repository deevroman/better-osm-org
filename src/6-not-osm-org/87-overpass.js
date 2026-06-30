//<editor-fold desc="overpass" defaultstate="collapsed">

function addLevel0Reborn() {
    if (!document.querySelector("#export-dialog.is-active")) {
        return
    }
    if (document.querySelector("#export-editors-level0-reborn")) {
        document.querySelector("#export-editors-level0-reborn").remove()
        document.querySelector("#export-editors-level0-reborn-bbox")?.remove()
    }
    const l0export = document.querySelector("#export-editors-level0")

    const l0reborn = l0export.cloneNode(true)
    l0reborn.id = "export-editors-level0-reborn"
    l0reborn.textContent += "Reborn β"
    l0reborn.setAttribute("href", "")
    l0reborn.onclick = function () {
        const originalHref = l0export.getAttribute("href")
        const newHref = originalHref.replace(MAIN_LEVEL0_INSTANCE, REBORN_LEVEL0_INSTANCE)
        Array.from(document.querySelectorAll(".modal.is-active .modal-card-head .delete")).at(-1).click()
        l0reborn.setAttribute("href", newHref)
    }

    l0export.after(l0reborn)

    const l0rebornBboox = l0export.cloneNode(true)
    l0rebornBboox.id = "export-editors-level0-reborn-bbox"
    l0rebornBboox.textContent = "only bbox"
    l0rebornBboox.setAttribute("href", "")
    l0rebornBboox.onclick = function () {
        document.querySelector("#export-map-state").click()
        const bbox = Array.from(document.querySelectorAll(".modal.is-active .modal-card-body p:has(small)")).at(-1).firstChild.data

        const originalHref = l0export.getAttribute("href")
        const originalURL = new URL(originalHref)
        const params = new URLSearchParams(originalURL.search)
        const overpassURL = new URL(params.get("url"))

        const bboxedParams = new URLSearchParams(overpassURL.search)
        if (!bboxedParams.get("data").includes("[bbox:")) {
            bboxedParams.set("data", `[bbox:${bbox.replaceAll(" ", "")}]` + bboxedParams.get("data"))
        }
        bboxedParams.toString()

        overpassURL.search = bboxedParams.toString()
        params.set("url", overpassURL.toString())
        originalURL.search = params.toString()

        const newHref = originalURL.toString().replace(MAIN_LEVEL0_INSTANCE, REBORN_LEVEL0_INSTANCE)
        Array.from(document.querySelectorAll(".modal.is-active .modal-card-head .delete")).at(-1).click()
        l0rebornBboox.setAttribute("href", newHref)
    }
    l0reborn.after(l0rebornBboox)
    l0reborn.after(document.createTextNode("\xA0"))
}

function setupOverpass() {
    if (!isDebug()) {
        return
    }
    const obs = new MutationObserver(addLevel0Reborn)
    obs.observe(document.querySelector("#export-dialog"), { attributes: true })
}

//</editor-fold>
