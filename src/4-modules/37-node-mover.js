//<editor-fold desc="node-mover" defaultstate="collapsed">

let nodeMoverMenuItem

function removePOIMoverMenu() {
    nodeMoverMenuItem?.remove()
    nodeMoverMenuItem = null
}

function addPOIMoverItem(measuringMenuItem) {
    const object_type = location.pathname.startsWith("/node") ? "node" : ""
    if (object_type !== "node") return
    removePOIMoverMenu()
    nodeMoverMenuItem = document.createElement("li")
    nodeMoverMenuItem.classList.add("mover-li")
    nodeMoverMenuItem.style.cursor = "pointer"
    const a = document.createElement("a")
    a.classList.add("dropdown-item", "d-flex", "align-items-center", "gap-3")
    a.textContent = "Move node to here"

    const i = document.createElement("i")
    i.classList.add("bi", "bi-arrow-down")
    a.prepend(i)
    nodeMoverMenuItem.appendChild(a)
    measuringMenuItem.after(nodeMoverMenuItem)

    a.onclick = async function moveNode(e) {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
        const match = location.pathname.match(/(node)\/(\d+)/)
        if (!match) return
        const object_type = match[1]
        const object_id = match[2]
        const auth = makeAuth()
        if (!confirm("⚠️ move node?")) {
            return
        }
        const newLat = getMap().osm_contextmenu._$element.data("lat")
        const newLon = getMap().osm_contextmenu._$element.data("lng")
        console.log("Opening changeset")
        const rawObjectInfo = await (
            await auth.fetch(osm_server.apiBase + object_type + "/" + object_id, {
                method: "GET",
                prefix: false,
            })
        ).text()
        const objectInfo = new DOMParser().parseFromString(rawObjectInfo, "text/xml")
        // prettier-ignore
        const dist = Math.round(getDistanceFromLatLonInKm(
            parseFloat(objectInfo.querySelector("node").getAttribute("lat")),
            parseFloat(objectInfo.querySelector("node").getAttribute("lon")),
            newLat,
            newLon
        ) * 1000) / 1000
        if (dist > 50) {
            if (!confirm(`⚠️ ${dist} kilometers.\n\nARE YOU SURE?`)) {
                getMap().osm_contextmenu.hide()
                return
            }
            getMap().osm_contextmenu.hide()
        }
        objectInfo.querySelector("node").setAttribute("lat", newLat)
        objectInfo.querySelector("node").setAttribute("lon", newLon)

        const changesetTags = {
            created_by: `better osm.org v${GM_info.script.version}`,
            comment: "Moving node",
        }

        const changesetPayload = document.implementation.createDocument(null, "osm")
        const cs = changesetPayload.createElement("changeset")
        changesetPayload.documentElement.appendChild(cs)
        tagsToXml(changesetPayload, cs, changesetTags)
        const chPayloadStr = new XMLSerializer().serializeToString(changesetPayload)

        const changesetId = await auth
            .fetch(osm_server.apiBase + "changeset/create", {
                method: "PUT",
                prefix: false,
                body: chPayloadStr,
            })
            .then(res => {
                if (res.ok) return res.text()
                throw new Error(res)
            })
        console.log(changesetId)

        try {
            objectInfo.children[0].children[0].setAttribute("changeset", changesetId)

            const objectInfoStr = new XMLSerializer().serializeToString(objectInfo).replace(/xmlns="[^"]+"/, "")
            console.log(objectInfoStr)
            await auth
                .fetch(osm_server.apiBase + object_type + "/" + object_id, {
                    method: "PUT",
                    prefix: false,
                    body: objectInfoStr,
                })
                .then(async res => {
                    const text = await res.text()
                    if (res.ok) return text
                    alert(text)
                    throw new Error(text)
                })
        } finally {
            await auth.fetch(osm_server.apiBase + "changeset/" + changesetId + "/close", {
                method: "PUT",
                prefix: false,
            })
            window.location.reload()
        }
    }
}

//</editor-fold>
