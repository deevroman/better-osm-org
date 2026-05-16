//<editor-fold desc="object-editor" defaultstate="collapsed">

async function deleteObject(object_type, object_id) {
    const objectInfo = await getOsmObjectInfo(object_type, object_id)

    let tagsHint = ""
    const tags = Array.from(objectInfo.children[0].children[0]?.children)
    for (const i of tags) {
        if (mainTags.includes(i.getAttribute("k"))) {
            tagsHint = tagsHint + ` ${i.getAttribute("k")}=${i.getAttribute("v")}`
            break
        }
    }
    for (const i of tags) {
        if (i.getAttribute("k") === "type") {
            tagsHint = tagsHint + ` ${i.getAttribute("k")}=${i.getAttribute("v")}`
        }
    }
    for (const i of tags) {
        if (i.getAttribute("k") === "restriction") {
            tagsHint = tagsHint + ` ${i.getAttribute("k")}=${i.getAttribute("v")}`
        }
    }
    for (const i of tags) {
        if (i.getAttribute("k") === "name") {
            tagsHint = tagsHint + ` ${i.getAttribute("k")}=${i.getAttribute("v")}`
            break
        }
    }
    const comment = tagsHint !== "" ? `Delete${tagsHint}` : `Delete ${object_type} ${object_id}`

    if (object_type === "relation" && !prompt("⚠️ Delete relation?\n\nChangeset comment:", comment)) {
        return
    }

    const changesetId = await openOsmChangeset(comment)
    objectInfo.children[0].children[0].setAttribute("changeset", changesetId)
    try {
        await deleteOsmObjectByInfo(object_type, object_id, objectInfo)
    } finally {
        try {
            await closeOsmChangeset(changesetId)
        } finally {
            if (location.hash.includes("D") || Object.keys(getMap?.()?.dataLayer?._layers ?? {}).length) {
                window.location.reload()
            } else {
                tryReloadSidebar()
            }
        }
    }
}

function addDeleteButton() {
    if (!location.pathname.startsWith("/node/") && !location.pathname.startsWith("/relation/")) return
    if (location.pathname.includes("/history")) return

    if (document.querySelector(".delete_object_button_class")) return true

    const match = location.pathname.match(/(node|relation)\/(\d+)/)
    if (!match) return
    const object_type = match[1]
    const object_id = match[2]

    initOsmAuth()
    const link = document.createElement("a")
    link.text = t("objectEditor.delete")
    link.href = ""
    link.classList.add("delete_object_button_class")
    // skip deleted
    if (object_type === "node") {
        if (
            document.querySelectorAll("#sidebar_content > div:first-of-type h4").length < 2 &&
            document.querySelector("#sidebar_content > div .latitude") === null
        ) {
            return
        }
    } else if (object_type === "way") {
    } else if (object_type === "relation") {
        if (document.querySelectorAll("#sidebar_content > div:first-of-type h4").length < 2) {
            return
        }
    }
    // skip having a parent
    if (object_type === "node" && document.querySelectorAll("#sidebar_content > div:first-of-type details").length !== 0) {
        return
    } else if (object_type === "relation") {
        if (document.querySelectorAll("#sidebar_content > div:first-of-type details").length > 1) {
            return
        }
        if (Array.from(document.querySelectorAll(".browse-tag-list th")).some(i => i.textContent === "wikidata")) {
            return
        }
        const dangerousType = Array.from(document.querySelectorAll(".browse-tag-list td"))
            .map(i => i.textContent)
            .find(i => ["route_master", "route", "multipolygon", "public_transport"].includes(i))
        if (dangerousType) {
            if (dangerousType === "multipolygon") {
                if (document.querySelectorAll("#sidebar_content > div:first-of-type details li").length > 1) {
                    return
                }
            } else {
                return
            }
        }
    }

    if (!document.querySelector(".secondary-actions")) return
    document.querySelector(".secondary-actions").appendChild(link)
    link.after(document.createTextNode("\xA0"))
    link.before(document.createTextNode("\xA0· "))

    if (!document.querySelector(".secondary-actions .edit_tags_class")) {
        const tagsEditorExtensionWaiter = new MutationObserver(() => {
            if (document.querySelector(".secondary-actions .edit_tags_class")) {
                tagsEditorExtensionWaiter.disconnect()

                const tmp = document.createComment("")
                const node1 = document.querySelector(".delete_object_button_class")
                const node2 = document.querySelector(".edit_tags_class")

                node2.replaceWith(tmp)
                node1.replaceWith(node2)
                tmp.replaceWith(node1)

                console.log("Delete button replaced for Tags editor extension capability")
            }
        })
        tagsEditorExtensionWaiter.observe(document.querySelector(".secondary-actions"), {
            childList: true,
            subtree: true,
        })
        setTimeout(() => tagsEditorExtensionWaiter.disconnect(), 3000)
    }

    async function deleteObjectHandler(e) {
        e.preventDefault()
        link.classList.add("dbclicked")

        console.log("Delete clicked. Getting info")

        await deleteObject(object_type, object_id)
    }
    if (GM_config.get("OneClickDeletor") || object_type === "relation") {
        link.onclick = deleteObjectHandler
    } else {
        link.onclick = e => {
            e.preventDefault()
            setTimeout(() => {
                if (!link.classList.contains("dbclicked")) {
                    link.text = "Double click please"
                }
            }, 200)
        }
        link.ondblclick = deleteObjectHandler
    }
}

function setupDeletor() {
    if (!location.pathname.startsWith("/node/") && /*!location.pathname.startsWith("/way/") &&*/ location.pathname.startsWith("/relation/"))
        return
    tryApplyModule(addDeleteButton, 100, 3000)
}

//</editor-fold>
