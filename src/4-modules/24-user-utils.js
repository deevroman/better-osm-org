//<editor-fold desc="user-utils" defaultstate="collapsed">
function osmXmlToJson(xmlString) {
    const doc = new DOMParser().parseFromString(xmlString, "application/xml")

    if (doc.querySelector("parsererror")) {
        throw new Error("Invalid XML")
    }

    const osm = doc.querySelector("osm")
    if (!osm) {
        throw new Error("No <osm> root element found")
    }

    const toValue = v => {
        if (v === "true") return true
        if (v === "false") return false
        if (/^-?\d+$/.test(v)) return Number(v) // int
        if (/^-?\d*\.\d+$/.test(v)) return Number(v) // float
        return v // string
    }

    const result = {}

    for (const attr of osm.attributes) {
        result[attr.name] = attr.value
    }

    result.changesets = Array.from(osm.querySelectorAll("changeset")).map(cs => {
        const obj = {}

        for (const attr of cs.attributes) {
            obj[attr.name] = toValue(attr.value)
        }

        const tags = {}
        for (const tag of cs.querySelectorAll("tag")) {
            const k = tag.getAttribute("k")
            const v = tag.getAttribute("v")
            if (k != null && v != null) tags[k] = v
        }
        if (Object.keys(tags).length) obj.tags = tags

        return obj
    })

    return result
}

/**
 * @param username {string}
 * @return {Promise<Object|*>}
 */
async function getFirstUserChangeset(username) {
    /*if (isOGFServer()) {
        return await fetchTextWithCache(
            osm_server.apiBase +
                "changesets?" +
                new URLSearchParams({
                    display_name: username,
                    limit: 1,
                    order: "oldest", // это не работает
                }).toString(),
        ).then(osmXmlToJson)
    }*/
    return await fetchJSONWithCache(
        osm_server.apiBase +
            "changesets.json?" +
            new URLSearchParams({
                display_name: username,
                limit: 1,
                order: "oldest",
            }).toString(),
    )
}

async function updateUserInfo(username) {
    void initCorporateMappersList()
    const res = await getFirstUserChangeset(username)
    let uid
    let firstObjectCreationTime
    let firstChangesetID
    if (res["changesets"].length === 0) {
        const res = await fetchJSONWithCache(
            osm_server.apiBase +
                "notes/search.json?" +
                new URLSearchParams({
                    display_name: username,
                    limit: 1,
                    closed: -1,
                    order: "oldest",
                }).toString(),
        )
        uid = res["features"][0]["properties"]["comments"].find(i => i["user"] === username)["uid"]
        firstObjectCreationTime = res["features"][0]["properties"]["comments"].find(i => i["user"] === username)["date"]
    } else {
        uid = res["changesets"][0]["uid"]
        firstObjectCreationTime = res["changesets"][0]["created_at"]
        firstChangesetID = res["changesets"][0]["id"]
    }

    // FireMonkey compatibility https://github.com/erosman/firemonkey/issues/8
    const userInfo = structuredClone((await fetchJSONWithCache(osm_server.apiBase + "user/" + uid + ".json")).user)
    userInfo["description"] = ""
    userInfo["cacheTime"] = new Date().toISOString()
    if (firstObjectCreationTime) {
        userInfo["firstChangesetCreationTime"] = new Date(firstObjectCreationTime).toISOString()
    }
    if (firstChangesetID) {
        userInfo["firstChangesetID"] = firstChangesetID
    }
    await GM.setValue(storagePrefix + "userinfo-" + username, JSON.stringify(userInfo))
    return userInfo
}

/**
 * @param {string} username
 * @return {Promise<*>}
 */
async function getCachedUserInfo(username) {
    if (!username) {
        console.trace("invalid username")
        return
    }
    const localUserInfo = await GM.getValue(storagePrefix + "userinfo-" + username, "")
    if (localUserInfo) {
        const json = JSON.parse(localUserInfo)
        const cacheTime = new Date(json["cacheTime"])
        const threeDaysLater = new Date(cacheTime.getTime() + 24 * 60 * 60 * 1000)
        if (threeDaysLater < new Date()) {
            setTimeout(updateUserInfo, 0, username)
        }
        return json
    }
    return await updateUserInfo(username)
}

//</editor-fold>
