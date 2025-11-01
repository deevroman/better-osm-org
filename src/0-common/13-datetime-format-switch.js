//<editor-fold desc="datetime-format-switch" defaultstate="collapsed">

let timestampMode = "natural_text"

function makeTimesSwitchable() {
    document.querySelectorAll("time:not([natural_text])").forEach(j => {
        j.setAttribute("natural_text", j.textContent)
        if (timestampMode !== "natural_text") {
            j.textContent = j.getAttribute("datetime")
        }
    })

    function switchTimestamp() {
        if (window.getSelection().type === "Range") {
            return
        }
        document.querySelectorAll("time:not([natural_text])").forEach(j => {
            j.setAttribute("natural_text", j.textContent)
        })

        function switchElement(j) {
            if (j.childNodes[0].textContent === j.getAttribute("natural_text")) {
                j.childNodes[0].textContent = j.getAttribute("datetime")
                timestampMode = "datetime"
            } else {
                j.childNodes[0].textContent = j.getAttribute("natural_text")
                timestampMode = "natural_text"
            }
            if (j.querySelector(".timeback-btn") && j.nextElementSibling?.id !== "timeback-btn") {
                j.querySelector(".timeback-btn").style.display = ""
            }
        }

        document.querySelectorAll("time").forEach(switchElement)
    }

    const isObjectPage = location.pathname.includes("node") || location.pathname.includes("way") || location.pathname.includes("relation")
    const isNotePage = location.pathname.includes("note")

    function openMapStateInOverpass(elem, adiff = false) {
        const { lng: lon, lat: lat } = getMapCenter()
        const zoom = getZoom()
        const query = `// via changeset closing time
[${adiff ? "adiff" : "date"}:"${elem.getAttribute("datetime")}"];
(
  node({{bbox}});
  way({{bbox}});
  //relation({{bbox}});
);
(._;>;);
out meta;
`
        window.open(`${overpass_server.url}?Q=${encodeURI(query)}&C=${lat};${lon};${zoom}${zoom > 15 ? "&R" : ""}`, "_blank")
    }

    document.querySelectorAll("time:not([switchable])").forEach(i => {
        if (i.title !== "") {
            i.title += `\n\n`
        }
        i.title += `Click for change time format`
        i.title += `\nClick with ctrl for open the map state at the time of ${isObjectPage ? "version was created" : isNotePage ? "note was created" : "changeset was closed"}\nClick with Alt for view adiff`

        function clickEvent(e) {
            if (e.metaKey || e.ctrlKey || e.altKey) {
                if (window.getSelection().type === "Range") {
                    return
                }
                openMapStateInOverpass(i, e.altKey)
            } else {
                switchTimestamp()
            }
        }

        i.addEventListener("click", clickEvent)
    })
    document.querySelectorAll("time:not([switchable])").forEach(i => {
        i.setAttribute("switchable", "true")
        const btn = document.createElement("a")
        btn.classList.add("timeback-btn")
        btn.title = `Open the map state at the time of ${isObjectPage ? "version was created" : "changeset was closed"}`
        btn.textContent = " 🕰"
        btn.style.cursor = "pointer"
        btn.style.display = "none"
        btn.style.userSelect = "none"
        btn.onclick = e => {
            e.preventDefault()
            e.stopPropagation()
            openMapStateInOverpass(i, e.altKey)
        }
        i.appendChild(btn)
    })
}

//</editor-fold>
