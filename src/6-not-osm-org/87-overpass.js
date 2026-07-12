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

    function repairQuery(q) {
        return q.replace("[out:json]", "[out:xml]").replace("\nout ", "\n(._;>;);\nout ")
    }

    function makeLevel0Url(query) {
        const server = localStorage.getItem("overpass-ide_server")

        const overpassParams = new URLSearchParams()
        overpassParams.set("data", repairQuery(query))
        const level0Params = new URLSearchParams()
        level0Params.set("url", server + "interpreter?" + overpassParams.toString())
        return REBORN_LEVEL0_INSTANCE + "?" + level0Params.toString()
    }

    const l0reborn = l0export.cloneNode(true)
    l0reborn.id = "export-editors-level0-reborn"
    l0reborn.textContent += "Reborn β"
    l0reborn.setAttribute("href", "")
    l0reborn.onclick = function () {
        Array.from(document.querySelectorAll(".modal.is-active .modal-card-head .delete")).at(-1).click()

        const query = JSON.parse(localStorage.getItem("overpass-ide_code"))["overpass"]
        l0reborn.setAttribute("href", makeLevel0Url(query))
    }

    l0export.after(l0reborn)

    const l0rebornBbox = l0export.cloneNode(true)
    l0rebornBbox.id = "export-editors-level0-reborn-bbox"
    l0rebornBbox.textContent = "only bbox"
    l0rebornBbox.setAttribute("href", "")
    l0rebornBbox.onclick = function () {
        document.querySelector("#export-map-state").click()
        const bbox = Array.from(document.querySelectorAll(".modal.is-active .modal-card-body p:has(small)")).at(-1).firstChild.data
        Array.from(document.querySelectorAll(".modal.is-active .modal-card-head .delete")).at(-1).click()

        let query = JSON.parse(localStorage.getItem("overpass-ide_code"))["overpass"]
        if (!query.includes("[bbox:")) {
            query = `[bbox:${bbox.replaceAll(" ", "")}]` + query
        }
        l0rebornBbox.setAttribute("href", makeLevel0Url(query))
    }
    l0reborn.after(l0rebornBbox)
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
