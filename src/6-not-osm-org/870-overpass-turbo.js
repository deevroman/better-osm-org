//<editor-fold desc="overpass-turbo" defaultstate="collapsed">

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
        return q.replace("[out:json]", "[out:xml]").replace("\nout ", "\n(._;>;);\nout meta ")
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
    l0reborn.onclick = async function (event) {
        let query = JSON.parse(localStorage.getItem("overpass-ide_code"))["overpass"]

        if (query.includes("{{bbox}}")) {
            document.querySelector("#export-map-state").click()
            const bbox = Array.from(document.querySelectorAll(".modal.is-active .modal-card-body p:has(small)")).at(-1).firstChild.data
            query = query.replaceAll("{{bbox}}", bbox.replaceAll(" ", ""))
        }

        Array.from(document.querySelectorAll(".modal.is-active .modal-card-head .delete")).at(-1).click()

        const areas = [...query.matchAll(/\{\{geocodeArea:([^}]+)}}/g)]
        if (areas.length) {
            event.preventDefault()
            const target = window.open("about:blank", "_blank")
            if (!target) return

            try {
                const resolvedAreas = new Map()
                for (const [, name] of areas) {
                    if (resolvedAreas.has(name)) continue
                    const url = new URL("https://nominatim.openstreetmap.org/search")
                    url.searchParams.set("format", "json")
                    url.searchParams.set("q", name)
                    const response = await fetch(url)
                    if (!response.ok) throw new Error(`Nominatim: ${response.status}`)
                    const results = await response.json()
                    const result = results.find(item => item.osm_id && (item.osm_type === "way" || item.osm_type === "relation"))
                    if (!result) throw new Error(`Area not found: ${name}`)
                    const id = Number(result.osm_id)
                    const areaId = result.osm_type === "way" ? `${id + 2400000000},${id}` : id + 3600000000
                    resolvedAreas.set(name, `area(id:${areaId})`)
                }
                query = query.replace(/\{\{geocodeArea:([^}]+)}}/g, (_, name) => resolvedAreas.get(name))
                target.location.href = makeLevel0Url(query)
            } catch (error) {
                target.close()
                alert(error.message)
            }
            return
        }

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
        if (query.includes("{{bbox}}")) {
            query = query.replaceAll("{{bbox}}", bbox.replaceAll(" ", ""))
        }
        l0rebornBbox.setAttribute("href", makeLevel0Url(query))
    }
    l0reborn.after(l0rebornBbox)
    l0reborn.after(document.createTextNode("\xA0"))
    /*
    const vespucci = l0export.cloneNode(true)
    vespucci.id = "export-editors-vespucci"
    vespucci.textContent = "Vespucci"
    vespucci.setAttribute("href", "")
    vespucci.onclick = function () {
        function extractIds() {
            const text = document.querySelector("#dataviewer .CodeMirror-lines").textContent
            try {
                const json = JSON.parse(text)
                return {
                    nodes: json.elements.filter(i => i.type === "node").map(i => i.id),
                    ways: json.elements.filter(i => i.type === "way").map(i => i.id),
                    relations: json.elements.filter(i => i.type === "relation").map(i => i.id),
                }
            } catch (e) {
                const xml = new DOMParser().parseFromString(text, "text/xml")
                return {
                    nodes: Array.from(xml.querySelectorAll("node")).map(i => i.getAttribute("id")),
                    ways: Array.from(xml.querySelectorAll("way")).map(i => i.getAttribute("id")),
                    relations: Array.from(xml.querySelectorAll("relation")).map(i => i.getAttribute("id")),
                }
            }
        }
        const { nodes, ways, relations } = extractIds()
        vespucci.setAttribute("href", makeVespucciMultiUrl(nodes, ways, relations))
    }
    l0rebornBbox.after(vespucci)
    l0rebornBbox.after(document.createTextNode("\xA0"))
*/
}

function setupOverpass() {
    if (!isDebug()) {
        return
    }
    const obs = new MutationObserver(addLevel0Reborn)
    obs.observe(document.querySelector("#export-dialog"), { attributes: true })
}

//</editor-fold>
