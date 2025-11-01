//<editor-fold desc="taginfo" defaultstate="collapsed">

function setupTaginfo() {
    if (!GM_config.get("BetterTaginfo")) return

    const instance_text = document.querySelector("#instance")?.textContent
    const instance = instance_text?.replace(/ \(.*\)/, "")

    // fix overpass links on regional taginfo
    if (instance_text?.includes(" ")) {
        const turboLink = document.querySelector("#turbo_button:not(.fixed-link)")
        if (turboLink && (turboLink.href.includes("%22+in") || turboLink.href.includes("*+in") || turboLink.href.includes("relation+in"))) {
            turboLink.href = turboLink.href.replace(/(%22|\*|relation)\+in\+(.*)&/, `$1+in+"${instance}"&`)
            turboLink.classList?.add("fixed-link")
        }
    }

    function escapeTaginfoString(s) {
        return s.replaceAll("\\", "\\\\").replaceAll('"', '\\"').replaceAll("␣", " ")
    }

    if (location.pathname.match(/reports\/key_lengths$/)) {
        document.querySelectorAll(".dt-body[data-col='1']").forEach(i => {
            if (i.querySelector(".overpass-link")) return
            const overpassLink = document.createElement("a")
            overpassLink.classList.add("overpass-link")
            overpassLink.textContent = "🔍"
            overpassLink.target = "_blank"
            const count = parseInt(i.nextElementSibling.querySelector(".value").textContent.replace(/\s/g, ""))
            const key = i.querySelector(".empty") ? "" : escapeTaginfoString(i.querySelector("a").textContent)
            overpassLink.href =
                `${overpass_server.url}?` +
                (count > 100000
                    ? new URLSearchParams({
                          w: instance ? `"${key}"=* in "${instance}"` : `"${key}"=*`,
                      }).toString()
                    : new URLSearchParams({
                          w: instance ? `"${key}"=* in "${instance}"` : `"${key}"=* global`,
                          R: "",
                      }).toString())
            i.prepend(document.createTextNode("\xA0"))
            i.prepend(overpassLink)
        })
    } else if (location.pathname.match(/relations\//)) {
        if (location.hash !== "#roles") {
            return
        }
        if (!document.querySelector(".value")) {
            console.log("Table not loaded")
            return
        }
        document.querySelectorAll("#roles .dt-body[data-col='0']").forEach(i => {
            if (i.querySelector(".overpass-link")) return
            const overpassLink = document.createElement("a")
            overpassLink.classList.add("overpass-link")
            overpassLink.textContent = "🔍"
            overpassLink.target = "_blank"
            overpassLink.style.cursor = "progress"
            const role = i.querySelector(".empty") ? "" : escapeTaginfoString(i.textContent)
            const type = location.pathname.match(/relations\/(.*$)/)[1]
            const count = parseInt(i.nextElementSibling.querySelector(".value").textContent.replace(/\s/g, ""))
            if (instance) {
                fetchJSONWithCache(
                    "https://nominatim.openstreetmap.org/search?" +
                        new URLSearchParams({
                            format: "json",
                            q: instance,
                        }).toString(),
                ).then(r => {
                    if (r[0]["osm_id"]) {
                        const query = `// ${instance}
area(id:${3600000000 + parseInt(r[0]["osm_id"])})->.a;
rel[type=${type}](if:count_by_role("${role}") > 0)(area.a);
out geom;
`
                        // prettier-ignore
                        overpassLink.href = `${overpass_server.url}?` + (count > 1000
                            ? new URLSearchParams({Q: query})
                            : new URLSearchParams({Q: query, R: ""})).toString()
                        overpassLink.style.cursor = "pointer"
                    } else {
                        overpassLink.remove()
                    }
                })
            } else {
                const query = `rel[type=${type}](if:count_by_role("${role}") > 0)${count > 1000 ? "({{bbox}})" : ""};\nout geom;`
                // prettier-ignore
                overpassLink.href = `${overpass_server.url}?` + (count > 1000
                    ? new URLSearchParams({Q: query})
                    : new URLSearchParams({Q: query, R: ""})).toString()
                overpassLink.style.cursor = "pointer"
            }
            i.prepend(document.createTextNode("\xA0"))
            i.prepend(overpassLink)
        })
    } else if (location.hash === "#values") {
        const key = escapeTaginfoString(document.querySelector("h1").textContent)
        document.querySelectorAll("#values .dt-body[data-col='0']").forEach(i => {
            if (i.querySelector(".overpass-link")) return
            const overpassLink = document.createElement("a")
            overpassLink.classList.add("overpass-link")
            overpassLink.textContent = "🔍"
            overpassLink.target = "_blank"
            const count = parseInt(i.nextElementSibling.querySelector(".value").textContent.replace(/\s/g, ""))
            const value = i.querySelector(".empty") ? "" : escapeTaginfoString(i.querySelector("a").textContent)
            overpassLink.href =
                `${overpass_server.url}?` +
                (count > 10000
                    ? new URLSearchParams({
                          w: instance ? `"${key}"="${value}" in "${instance}"` : `"${key}"="${value}"`,
                      }).toString()
                    : new URLSearchParams({
                          w: instance ? `"${key}"="${value}" in "${instance}"` : `"${key}"="${value}" global`,
                          R: "",
                      }).toString())
            i.prepend(document.createTextNode("\xA0"))
            i.prepend(overpassLink)
        })
    } else if (location.pathname.includes("/tags/") && document.querySelector(".overview-container")) {
        // overpass links for tag by OSM type
        const rawKeyValue = escapeTaginfoString(document.querySelector("h1").textContent)
        const [key, ...tail] = rawKeyValue.split("=")
        const keyValue = `${key}="${tail.join("=")}"`
        document.querySelectorAll("#grid-overview .dt-body[data-col='0']").forEach(i => {
            if (i.querySelector(".overpass-link")) return
            const icon = i.querySelector("img")
            const type = icon.src.match(/\/types\/(.+)\.svg$/)[1]
            const overpassTypeSelector = type === "all" ? "" : `type:${type} and`
            const overpassLink = document.createElement("a")
            overpassLink.classList.add("overpass-link")
            overpassLink.textContent = i.lastChild.textContent.trim()
            overpassLink.title = "search with Overpass"
            overpassLink.target = "_blank"
            const count = parseInt(i.nextElementSibling.querySelector(".value").textContent.replace(/\s/g, ""))
            overpassLink.href =
                `${overpass_server.url}?` +
                (count > 10000
                    ? new URLSearchParams({
                          w: instance ? `${overpassTypeSelector} ${keyValue} in "${instance}"` : `${overpassTypeSelector} ${keyValue}`,
                      }).toString()
                    : new URLSearchParams({
                          w: instance ? `${overpassTypeSelector} ${keyValue} in "${instance}"` : `${overpassTypeSelector} ${keyValue} global`,
                          R: "",
                      }).toString())
            i.lastChild.replaceWith(overpassLink)
            overpassLink.before(document.createTextNode("\xA0"))
        })
    }
}

//</editor-fold>
