//<editor-fold desc="osm-utils" defaultstate="collapsed">

/** @type {import("osm-auth").OSMAuth|null}*/
let osmEditAuth = null

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

    const changesetId = await osmEditAuth
        .fetch(osm_server.apiBase + "changeset/create", {
            method: "PUT",
            prefix: false,
            body: chPayloadStr,
        })
        .then(res => {
            if (res.ok) return res.text()
            throw new Error(res)
        })
    console.log("Open changeset", changesetId)
    return changesetId
}

async function closeOsmChangeset(changesetId) {
    await osmEditAuth.fetch(osm_server.apiBase + "changeset/" + changesetId + "/close", {
        method: "PUT",
        prefix: false,
    })
}

async function getOsmObjectInfo(object_type, object_id) {
    const rawObjectInfo = await (
        await osmEditAuth.fetch(osm_server.apiBase + object_type + "/" + object_id, {
            method: "GET",
            prefix: false,
        })
    ).text()
    const res = new DOMParser().parseFromString(rawObjectInfo, "text/xml")
    const error = res.querySelector("parsererror")
    if (error) {
        throw new Error("getOsmObjectInfo: Parsing failed: " + error.textContent)
    }
    return res
}

async function deleteOsmObjectByInfo(object_type, object_id, objectInfo) {
    const res = await osmEditAuth.fetch(osm_server.apiBase + object_type + "/" + object_id, {
        method: "DELETE",
        prefix: false,
        body: new XMLSerializer().serializeToString(objectInfo),
        headers: { "Content-Type": "application/xml; charset=utf-8" },
    })
    if (!res.ok) {
        throw new Error(await res.text())
    }
}

//</editor-fold>
