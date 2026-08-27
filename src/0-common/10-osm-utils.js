//<editor-fold desc="osm-utils" defaultstate="collapsed">

function extractOauthToken() {
    return (
        document.querySelector("#id-container")?.getAttribute("data-token") ??
        document.querySelector("#id-embed")?.getAttribute("data-key") ??
        localStorage.getItem(`${osm_server.url}oauth2_access_token`) ??
        document.head?.getAttribute("data-oauth-token")
    )
}

/**
 * @param {string} url
 * @param {{
 * [method]: "GET"|"POST"|"PUT"|"DELETE",
 * [body]: string,
 * [headers]: Record.<string, *>
 * }=} params
 */
async function osmAuthFetch(url, params = {}) {
    const token = extractOauthToken()
    if (!token) {
        throw "Failed to get token"
    }
    if (!params.headers) {
        params.headers = {}
    }
    params.headers.Authorization = "Bearer " + token
    return await fetch(url, params)
}

/**
 * @param {string} comment
 * @returns {Promise<string>} changesetId
 */
async function openOsmChangeset(comment) {
    const changesetTags = {
        created_by: `better osm.org v${GM_info.script.version}`,
        comment: comment,
    }

    const changesetPayload = document.implementation.createDocument(null, "osm")
    const cs = changesetPayload.createElement("changeset")
    changesetPayload.documentElement.appendChild(cs)
    tagsToXml(changesetPayload, cs, changesetTags)
    const chPayloadStr = new XMLSerializer().serializeToString(changesetPayload)

    const changesetId = await osmAuthFetch(osm_server.apiBase + "changeset/create", {
        method: "PUT",
        body: chPayloadStr,
    }).then(res => {
        if (res.ok) return res.text()
        throw new Error(res)
    })
    console.log("Open changeset", changesetId)
    return changesetId
}

async function closeOsmChangeset(changesetId) {
    const res = await osmAuthFetch(osm_server.apiBase + "changeset/" + changesetId + "/close", {
        method: "PUT",
    })
    if (!res.ok) {
        console.warn(await res.text())
    }
}

/**
 * @param object_type
 * @param object_id
 * @return {Promise<Document>}
 */
async function getOsmObjectInfo(object_type, object_id) {
    const rawObjectInfo = await (await fetch(osm_server.apiBase + object_type + "/" + object_id)).text()
    const res = new DOMParser().parseFromString(rawObjectInfo, "text/xml")
    const error = res.querySelector("parsererror")
    if (error) {
        throw new Error("getOsmObjectInfo: Parsing failed: " + error.textContent)
    }
    return res
}

async function getOsmObjectHistory(object_type, object_id) {
    const rawObjectInfo = await (await osmAuthFetch(osm_server.apiBase + object_type + "/" + object_id + "/history")).text()
    const res = new DOMParser().parseFromString(rawObjectInfo, "text/xml")
    const error = res.querySelector("parsererror")
    if (error) {
        throw new Error("getOsmObjectInfo: Parsing failed: " + error.textContent)
    }
    return res
}

/**
 * @param body {string}
 * @return {Promise<void>}
 */
async function createOsmNodes(body) {
    const res = await osmAuthFetch(osm_server.apiBase + "nodes", {
        method: "POST",
        body: body,
        headers: { "Content-Type": "application/xml; charset=utf-8" },
    })
    if (!res.ok) {
        throw new Error(await res.text())
    }
}

async function deleteOsmObjectByInfo(object_type, object_id, objectInfo) {
    const res = await osmAuthFetch(osm_server.apiBase + object_type + "/" + object_id, {
        method: "DELETE",
        body: new XMLSerializer().serializeToString(objectInfo),
        headers: { "Content-Type": "application/xml; charset=utf-8" },
    })
    if (!res.ok) {
        throw new Error(await res.text())
    }
}

async function closeNote(note_id, text) {
    const path = `${osm_server.apiBase}notes/${note_id}/close.json?${new URLSearchParams({
        text: text,
    }).toString()}`
    const res = await osmAuthFetch(path, {
        method: "POST",
    })
    if (!res.ok) {
        throw new Error(await res.text())
    }
}

//</editor-fold>
