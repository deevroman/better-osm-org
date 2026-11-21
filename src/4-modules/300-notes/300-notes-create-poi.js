//<editor-fold desc="notes-create-poi" defaultstate="collapsed">

function makeTextareaFromTagsTable(table) {
    const textarea = document.createElement("textarea")
    table.querySelectorAll("tr:not(.add-tag-row)").forEach(i => {
        if (i.querySelector("th").textContent.trim() === "" || i.querySelector("td").textContent.trim() === "") return
        textarea.value += `${i.querySelector("th").textContent}=${i.querySelector("td").textContent.replaceAll("\\\\", "\n")}\n`
    })
    textarea.value = textarea.value.trim()
    textarea.rows = 5
    return textarea
}

function addCreateNewPOIButton() {
    if (!document.querySelector("#sidebar_content form")) {
        return
    }
    if (newNotePlaceholder && document.querySelector(".note form textarea")) {
        document.querySelector(".note form textarea").textContent = newNotePlaceholder
        document.querySelector(".note form textarea").selectionEnd = 0
        newNotePlaceholder = null
    }
    if (document.querySelector(".add-new-object-btn")) return
    const b = document.createElement("span")
    b.classList.add("add-new-object-btn", "btn", "btn-primary")
    b.textContent = "➕"
    b.style.marginLeft = "auto"
    if (!getMap()?.getZoom) {
        b.style.display = "none"
        interceptMapManually().then(() => {
            b.style.display = ""
        })
    }
    b.title = t("notes.addNewObjectOnMap")
    document.querySelector("#sidebar_content form div:has(input)").appendChild(b)
    b.parentElement.style.display = "flex"
    b.before(document.createTextNode("\xA0"))
    b.onclick = async e => {
        e.stopImmediatePropagation()
        console.log("Begin creating node")

        let tagsHint = ""
        /** @type {Map<string, string>} */
        let tags
        try {
            tags = buildTags(document.querySelector("#sidebar_content form textarea").value, true)
        } catch (e) {
            alert(e)
            return
        }
        if (tags.size === 0) {
            alert(t("notes.textareaWithoutTagsAlert"))
            return
        }

        for (const i of tags.entries()) {
            if (mainTags.includes(i[0])) {
                tagsHint = tagsHint + ` ${i[0]}=${i[1]}`
                break
            }
        }
        for (const i of tags.entries()) {
            if (i[0] === "name") {
                if (i[0].includes(" ")) {
                    tagsHint = tagsHint + ` ${i[0]} = ${i[1]}`
                } else {
                    tagsHint = tagsHint + ` ${i[0]}=${i[1]}`
                }
                break
            }
        }
        const comment = tagsHint !== "" ? `Create${tagsHint}` : `Create node`
        const changesetId = await openOsmChangeset(comment)

        const nodePayload = document.createElement("osm")
        const node = document.createElement("node")
        nodePayload.appendChild(node)
        node.setAttribute("changeset", changesetId)

        const l = []
        getMap().eachLayer(intoPageWithFun(i => l.push(i)))
        const { lat: lat, lng: lng } = l.find(i => !!i._icon && i._icon.classList.contains("leaflet-marker-draggable"))._latlng
        node.setAttribute("lat", lat)
        node.setAttribute("lon", lng)

        for (const tag of tags.entries()) {
            const tagElem = document.createElement("tag")
            tagElem.setAttribute("k", tag[0])
            tagElem.setAttribute("v", tag[1])
            node.appendChild(tagElem)
        }
        const nodeStr = new XMLSerializer().serializeToString(nodePayload).replace(/xmlns="[^"]+"/, "")
        await createOsmNodes(nodeStr)
        await closeOsmChangeset(changesetId)
        window.location = osm_server.url + "/changeset/" + changesetId
    }
}

//</editor-fold>
