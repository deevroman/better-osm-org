//<editor-fold desc="taginfo" defaultstate="collapsed">

async function saveCurrentRegionalInstance(value, name) {
    const history = JSON.parse(await GM.getValue("last-regional-taginfo-instances", "[]")).filter(i => i.value !== value)
    history.push({
        value,
        name,
    })
    if (history.length > 10) {
        history.shift()
    }
    await GM.setValue("last-regional-taginfo-instances", JSON.stringify(history))
}

function addRegionalTaginfoSelector() {
    if (location.origin !== "https://taginfo.openstreetmap.org") {
        const instance_select = document.querySelector("#instance_select")
        if (!instance_select) {
            return
        }
        if (location.pathname.includes(instance_select.value)) {
            void saveCurrentRegionalInstance(instance_select.value, instance_select.selectedOptions[0].textContent)
        }
        if (!document.querySelector(".global-taginfo-link")) {
            const globalHref = "https://taginfo.openstreetmap.org/" + location.pathname.replace(/^.+?(\/|$)/, "") + location.hash
            const tools = document.querySelector("#tools ul")
            if (tools) {
                const li = document.createElement("li")
                li.classList.add("button")
                tools.prepend(li)

                const a = document.createElement("a")
                a.classList.add("global-taginfo-link")
                a.textContent = "global"
                a.target = "_blank"
                a.href = globalHref
                li.appendChild(a)
            }
            const dataDate = document.querySelector(".header-date")
            dataDate.style.display = "flex"
            const newTitle = "Go to global Taginfo"
            dataDate.setAttribute("title", newTitle)
            dataDate.setAttribute("data-tooltip-text", newTitle)
            const globalLink = document.createElement("a")
            globalLink.classList.add("global-taginfo-link")
            globalLink.style.marginRight = "auto"
            globalLink.textContent = "🌐"
            globalLink.href = globalHref
            dataDate.prepend(globalLink)
        }
        return
    }
    if (document.querySelector("#instance_select")) {
        return
    }
    const locale_select = document.querySelector("#locale")
    const instance_select = locale_select.cloneNode()
    instance_select.id = "instance_select"
    locale_select.before(instance_select)

    instance_select.appendChild(document.createElement("option"))

    const page = new DOMParser().parseFromString(GM_getResourceText("REGIONAL_TAGINFOS"), "text/html")
    page.querySelectorAll("option").forEach(i => {
        const opt = document.createElement("option")
        opt.value = i.value
        opt.textContent = i.textContent.replace(/^   /, "")
        instance_select.appendChild(opt)
    })
    queueMicrotask(async () => {
        const history = JSON.parse(await GM.getValue("last-regional-taginfo-instances", "[]"))
        const hr = document.createElement("hr")
        instance_select.firstChild.after(hr)
        history.forEach(({ value, name }) => {
            const opt = document.createElement("option")
            opt.value = value
            opt.textContent = name
            instance_select.firstChild.after(opt)
        })
    })
    instance_select.onchange = async e => {
        const instance = instance_select.value
        void saveCurrentRegionalInstance(instance, instance_select.selectedOptions[0].textContent)
        location.href = "https://taginfo.geofabrik.de/" + instance + location.pathname + location.search + location.hash
    }
}

function setupTaginfo() {
    if (!GM_config.get("BetterTaginfo")) return

    const instance_text = document.querySelector("#instance")?.textContent
    const instance = instance_text?.replace(/ \(.*\)/, "")

    addRegionalTaginfoSelector()

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

    function makeOverpassLink() {
        const a = document.createElement("a")
        a.classList.add("overpass-link")
        a.textContent = "🔍"
        a.target = "_blank"
        return a
    }

    if (location.pathname.match(/reports\/key_lengths$/)) {
        document.querySelectorAll(".dt-body[data-col='1']").forEach(i => {
            if (i.querySelector(".overpass-link")) return
            const overpassLink = makeOverpassLink()
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
            const overpassLink = makeOverpassLink()
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
            const overpassLink = makeOverpassLink()
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
    } else if (location.hash === "#combinations") {
        if (location.pathname.includes("/keys/")) {
            const key = escapeTaginfoString(document.querySelector("h1").textContent)
            document.querySelectorAll("#combinations .dt-body[data-col='1']").forEach(i => {
                if (i.querySelector(".overpass-link")) return
                const overpassLink = makeOverpassLink()
                const count = parseInt(i.nextElementSibling.querySelector(".value").textContent.replace(/\s/g, ""))
                const key2 = i.querySelector(".empty") ? "" : escapeTaginfoString(i.querySelector("a").textContent)
                overpassLink.href =
                    `${overpass_server.url}?` +
                    (count > 10000
                        ? new URLSearchParams({
                              w: `"${key}"=* and "${key2}"=*`,
                          }).toString()
                        : new URLSearchParams({
                              w: instance ? `"${key}"=* and "${key2}"=* in "${instance}"` : `"${key}"=* and "${key2}"=* global`,
                              R: "",
                          }).toString())
                i.prepend(document.createTextNode("\xA0"))
                i.prepend(overpassLink)
            })
        } else if (location.pathname.includes("/tags/")) {
            const rawKeyValue = escapeTaginfoString(document.querySelector("h1").textContent)
            const [key, ...tail] = rawKeyValue.split("=")
            const tagValue = `${key}="${tail.join("=")}"`
            document.querySelectorAll("#combinations .dt-body[data-col='1']").forEach(i => {
                if (i.querySelector(".overpass-link")) return
                const overpassLink = makeOverpassLink()
                const count = parseInt(i.nextElementSibling.querySelector(".value").textContent.replace(/\s/g, ""))
                const [keyLink, valueLink] = Array.from(i.querySelectorAll("a"))
                const rawKey2 = `"${escapeTaginfoString(keyLink.textContent)}"`
                const rawValue2 = valueLink === undefined ? "*" : `"${escapeTaginfoString(valueLink.textContent)}"`
                const tag2Value = `${rawKey2}=${rawValue2}`
                overpassLink.href =
                    `${overpass_server.url}?` +
                    (count > 10000
                        ? new URLSearchParams({
                              w: `${tagValue} and ${tag2Value}`,
                          }).toString()
                        : new URLSearchParams({
                              w: instance ? `${tagValue} and ${tag2Value} in "${instance}"` : `${tagValue} and ${tag2Value} global`,
                              R: "",
                          }).toString())
                i.prepend(document.createTextNode("\xA0"))
                i.prepend(overpassLink)
            })
        }
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
            overpassLink.title = t("taginfo.searchWithOverpass")
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
