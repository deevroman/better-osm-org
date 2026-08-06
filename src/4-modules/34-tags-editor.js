//<editor-fold desc="tags-editor" defaultstate="collapsed">

/**
 * @param {"node"|"way"|"relation"} object_type
 * @param {number} object_id
 * @param {Map<string, string>} prevTags
 * @param {Map<string, string>} newTags
 * @return {string}
 */
function makeComment(object_type, object_id, prevTags, newTags) {
    const removedKeys = prevTags
        .entries()
        .map(([k]) => k)
        .filter(k => newTags.get(k) === undefined)
        .toArray()
    const addedKeys = newTags
        .entries()
        .map(([k]) => k)
        .filter(k => prevTags.get(k) === undefined)
        .toArray()
    const modifiedKeys = prevTags
        .entries()
        .filter(([k, v]) => newTags.get(k) !== undefined && newTags.get(k) !== v)
        .map(([k]) => k)
        .toArray()

    let tagsHint = ""
    if (addedKeys.length) {
        tagsHint += "Add " + addedKeys.map(k => `${k}=${newTags.get(k)}`).join(", ") + "; "
    }

    if (modifiedKeys.length) {
        tagsHint += "Changed " + modifiedKeys.map(k => `${k}=${prevTags.get(k)}\u200b→\u200b${newTags.get(k)}`).join(", ") + "; "
    }

    if (removedKeys.length) {
        tagsHint += "Removed " + removedKeys.map(k => `${k}=${prevTags.get(k)}`).join(", ") + "; "
    }

    if (tagsHint.length > 200 || modifiedKeys.length > 1) {
        tagsHint = ""
        if (addedKeys.length) {
            tagsHint += "Add " + addedKeys.join(", ") + "; "
        }

        if (modifiedKeys.length) {
            tagsHint += "Changed " + modifiedKeys.join(", ") + "; "
        }

        if (removedKeys.length) {
            tagsHint += "Removed " + removedKeys.join(", ") + "; "
        }
    }

    tagsHint = tagsHint.match(/(.*); /)[1]

    let mainTagsHint = ""

    for (const i of prevTags.entries()) {
        if (mainTags.includes(i[0]) && !removedKeys.includes(i[0]) && !modifiedKeys.includes(i[0])) {
            mainTagsHint += ` ${i[0]}=${i[1]}`
            break
        }
    }
    for (const i of prevTags.entries()) {
        if (i[0] === "name" && !removedKeys.includes("name") && !modifiedKeys.includes("name")) {
            mainTagsHint += ` ${i[0]}=${i[1]}`
            break
        }
    }

    if (mainTagsHint !== "") {
        if (removedKeys.length) {
            tagsHint += " from" + mainTagsHint
        } else if (modifiedKeys.length) {
            tagsHint += " of" + mainTagsHint
        } else if (addedKeys.length) {
            tagsHint += " to" + mainTagsHint
        }
    } else {
        tagsHint += ` for ${object_type} ${object_id}`
    }

    return tagsHint !== "" ? tagsHint.slice(0, 255) : `Update tags of ${object_type} ${object_id}`
}

/**
 *
 * @param {"node"|"way"|"relation"}object_type
 * @param {number} object_id
 * @param {number} object_version
 * @param {Map<string, string>} newTags
 * @return {Promise<string>}
 */
async function uploadChanges(object_type, object_id, object_version, newTags) {
    const rawObjectInfo = await (await fetch(osm_server.apiBase + object_type + "/" + object_id)).text()
    const objectInfo = new DOMParser().parseFromString(rawObjectInfo, "text/xml")
    const lastVersion = parseInt(objectInfo.querySelector("[version]:not(osm)").getAttribute("version"))
    if (lastVersion !== object_version) {
        throw "Conflict"
    }

    const objectXML = objectInfo.querySelector("node,way,relation")
    /** @type {Map<string, string>} */
    const prevTags = new Map()
    objectXML.querySelectorAll("tag").forEach(i => {
        prevTags.set(i.getAttribute("k"), i.getAttribute("v"))
        i.remove()
    })
    newTags.entries().forEach(([k, v]) => {
        const tag = objectInfo.createElement("tag")
        tag.setAttribute("k", k)
        tag.setAttribute("v", v)
        objectXML.appendChild(tag)
    })

    const changesetId = await openOsmChangeset(makeComment(object_type, object_id, prevTags, newTags))
    try {
        objectInfo.children[0].children[0].setAttribute("changeset", changesetId)

        const objectInfoStr = new XMLSerializer().serializeToString(objectInfo).replace(/xmlns="[^"]+"/, "")
        console.log(objectInfoStr)
        await osmAuthFetch(osm_server.apiBase + object_type + "/" + object_id, {
            method: "PUT",
            body: objectInfoStr,
        }).then(async res => {
            const text = await res.text()
            if (res.ok) return text
            alert(`HTTP ${res.status}\n${text}`)
            throw new Error(text)
        })
    } finally {
        await closeOsmChangeset(changesetId)
    }
    return changesetId
}

let preloadTimer = null
let preloadCache = new Map()

function preloadObjectForEditTags() {
    if (preloadTimer) {
        return
    }
    preloadTimer = setTimeout(async () => {
        preloadTimer = null
        const { type, id } = parseCurrentOsmObjectUrl()
        console.log(`preloading ${type}/${id}`)
        preloadCache.set(`${type}/${id}`, fetch(`${osm_server.apiBase + type}/${id}`))
        setTimeout(() => preloadCache.delete(`${type}/${id}`), 5000)
    }, 50)
}

function abortPreloadObjectForEditTags() {
    clearTimeout(preloadTimer)
    preloadTimer = null
}

function getFetchObjectPromise(type, id) {
    if (preloadCache.has(`${type}/${id}`)) {
        console.log("preload hit!")
        return preloadCache.get(`${type}/${id}`)
    } else {
        console.log("not preloaded :(")
        return fetch(`${osm_server.apiBase + type}/${id}`)
    }
}

async function editTagsHandler(e) {
    e.preventDefault()
    if (document.querySelector(".better-osm-org-tags-editor-wrapper")) {
        return
    }
    const { type, id } = parseCurrentOsmObjectUrl()
    if (!type) {
        return
    }
    const rawObjectInfo = await (await getFetchObjectPromise(type, id)).text()
    const objectInfo = new DOMParser().parseFromString(rawObjectInfo, "text/xml")
    const version = parseInt(objectInfo.querySelector(":is(node,way,relation)[version]").getAttribute("version"))

    let taValue = ""
    objectInfo.querySelectorAll("tag").forEach(i => {
        taValue += i.getAttribute("k") + " = " + i.getAttribute("v").replaceAll("\\\\", "\n") + "\n"
    })

    const wrapper = document.createElement("div")
    wrapper.classList.add("better-osm-tags-editor-wrapper")
    document.querySelector("#sidebar_content h2 + div").setAttribute("hidden", "true")
    document.querySelector("#sidebar_content h2").after(wrapper)

    const ta = document.createElement("textarea")
    ta.classList.add("form-control")
    ta.style.fontFamily = "monospace"
    ta.cols = 40
    ta.rows = 10
    ta.value = taValue.trimEnd()

    wrapper.appendChild(ta)

    const errorPane = document.createElement("div")
    errorPane.style.color = "darkred"
    errorPane.style.paddingBottom = "20px"
    wrapper.appendChild(errorPane)

    ta.focus()

    const btnWrapper = document.createElement("span")
    btnWrapper.classList.add("btn-wrapper")
    btnWrapper.style.display = "flex"
    wrapper.appendChild(btnWrapper)

    const saveButton = document.createElement("button")
    saveButton.classList.add("btn", "btn-primary")
    saveButton.textContent = "Save"
    saveButton.onclick = async () => {
        try {
            await uploadChanges(type, id, version, buildTags(ta.value))
            tryReloadSidebar()
        } catch (e) {
            errorPane.textContent = e
        }
    }
    btnWrapper.appendChild(saveButton)

    btnWrapper.appendChild(document.createTextNode("\xA0"))

    const cancelButton = document.createElement("button")
    cancelButton.classList.add("btn", "btn-danger")
    cancelButton.textContent = "Cancel"
    cancelButton.onclick = () => {
        wrapper.remove()
        document.querySelector("#sidebar_content h2 + div[hidden]").removeAttribute("hidden")
    }

    btnWrapper.appendChild(cancelButton)

    const info = document.createElement("span")
    info.classList.add("bi", "bi-info-circle")
    info.style.cursor = "help"
    info.style.marginLeft = "auto"
    info.style.alignSelf = "center"
    info.style.color = "gray"
    info.title = "better-osm-org implementation of tags editor"

    btnWrapper.appendChild(info)
}

function addTagsEditorButton() {
    if (!location.pathname.startsWith("/node/") && !location.pathname.startsWith("/way/") && !location.pathname.startsWith("/relation/")) {
        return
    }
    if (document.querySelector(".better_edit_tags_class")) return
    if (document.querySelector(".btn.btn-danger") !== null) return
    if (!document.querySelector(".secondary-actions")) return

    const link = document.createElement("a")
    link.text = "Edit Tags"
    link.title = "better-osm-org implementation. You can disable it in settings"
    link.href = ""
    link.classList.add("better_edit_tags_class")

    document.querySelector(".secondary-actions").appendChild(link)
    link.after(document.createTextNode("\xA0"))
    link.before(document.createTextNode("\xA0· "))

    link.onclick = editTagsHandler
    link.onmouseenter = preloadObjectForEditTags
    link.onmouseleave = abortPreloadObjectForEditTags
}

function setupTagsEditor() {
    if (!location.pathname.startsWith("/node/") && !location.pathname.startsWith("/way/") && !location.pathname.startsWith("/relation/")) {
        return
    }
    tryApplyModule(addTagsEditorButton, 100, 3000)
}

//</editor-fold>
