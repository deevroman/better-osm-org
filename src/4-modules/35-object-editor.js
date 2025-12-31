//<editor-fold desc="object-editor" defaultstate="collapsed">

function addDeleteButton() {
    if (!location.pathname.startsWith("/node/") && !location.pathname.startsWith("/relation/")) return
    if (location.pathname.includes("/history")) return

    if (document.querySelector(".delete_object_button_class")) return true

    const match = location.pathname.match(/(node|relation)\/(\d+)/)
    if (!match) return
    const object_type = match[1]
    const object_id = match[2]

    const auth = makeAuth()
    const link = document.createElement("a")
    link.text = ["ru-RU", "ru"].includes(navigator.language) ? "Выпилить!" : "Delete"
    link.href = ""
    link.classList.add("delete_object_button_class")
    // skip deleted
    if (object_type === "node") {
        if (document.querySelectorAll("#sidebar_content > div:first-of-type h4").length < 2 && document.querySelector("#sidebar_content > div .latitude") === null) {
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

    function deleteObject(e) {
        e.preventDefault()
        link.classList.add("dbclicked")

        console.log("Delete clicked. Getting info")

        auth.xhr(
            {
                method: "GET",
                path: osm_server.apiBase + object_type + "/" + object_id,
                prefix: false,
            },
            function (err, objectInfo) {
                if (err) {
                    console.log(err)
                    return
                }

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
                const changesetTags = {
                    created_by: `better osm.org v${GM_info.script.version}`,
                    comment: tagsHint !== "" ? `Delete${tagsHint}` : `Delete ${object_type} ${object_id}`,
                }

                if (object_type === "relation" && !prompt("⚠️ Delete relation?\n\nChangeset comment:", changesetTags["comment"])) {
                    return
                }

                const changesetPayload = document.implementation.createDocument(null, "osm")
                const cs = changesetPayload.createElement("changeset")
                changesetPayload.documentElement.appendChild(cs)
                tagsToXml(changesetPayload, cs, changesetTags)
                const chPayloadStr = new XMLSerializer().serializeToString(changesetPayload)

                console.log("Opening changeset")

                auth.xhr(
                    {
                        method: "PUT",
                        path: osm_server.apiBase + "changeset/create",
                        prefix: false,
                        content: chPayloadStr,
                        headers: { "Content-Type": "application/xml; charset=utf-8" },
                    },
                    function (err1, result) {
                        if (err1) {
                            console.log({ changesetError: err1 })
                            return
                        }
                        const changesetId = result
                        console.log(changesetId)
                        objectInfo.children[0].children[0].setAttribute("changeset", changesetId)
                        auth.xhr(
                            {
                                method: "DELETE",
                                path: osm_server.apiBase + object_type + "/" + object_id,
                                prefix: false,
                                content: objectInfo,
                                headers: { "Content-Type": "application/xml; charset=utf-8" },
                            },
                            function (err2) {
                                if (err2) {
                                    console.log({ changesetError: err2 })
                                }
                                auth.xhr(
                                    {
                                        method: "PUT",
                                        path: osm_server.apiBase + "changeset/" + changesetId + "/close",
                                        prefix: false,
                                    },
                                    function (err3) {
                                        if (!err3) {
                                            window.location.reload()
                                        }
                                    },
                                )
                            },
                        )
                    },
                )
            },
        )
    }
    if (GM_config.get("OneClickDeletor") || object_type === "relation") {
        link.onclick = deleteObject
    } else {
        link.onclick = e => {
            e.preventDefault()
            setTimeout(() => {
                if (!link.classList.contains("dbclicked")) {
                    link.text = "Double click please"
                }
            }, 200)
        }
        link.ondblclick = deleteObject
    }
}

function setupDeletor(path) {
    if (!path.startsWith("/node/") && /*!path.startsWith("/way/") &&*/ path.startsWith("/relation/")) return
    const timerId = setInterval(addDeleteButton, 100)
    setTimeout(() => {
        clearInterval(timerId)
        console.debug("stop try add delete button")
    }, 3000)
    addDeleteButton()
}

//</editor-fold>
