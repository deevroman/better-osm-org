//<editor-fold desc="history-diff" defaultstate="collapsed">
/**
 * @typedef {Object} ObjectVersion
 * @property {number} version
 * @property {number} id
 * @property {boolean} visible
 * @property {string} timestamp
 */
/**
 * @typedef {Object} NodeVersion
 * @extends ObjectVersion
 * @property {number} version
 * @property {number} id
 * @property {number} changeset
 * @property {number} uid
 * @property {string} user
 * @property {boolean} visible
 * @property {string} timestamp
 * @property {'node'} type
 * @property {number} lat
 * @property {number} lon
 * @property {Object.<string, string>=} tags
 */

/**
 * @type {Object.<string, NodeHistory>}
 */
const nodesHistories = {}

/**
 * @type {Object.<string, WayVersion[]>}
 */
const waysRedactedVersions = {}

/**
 * @type {Object.<string, WayHistory>}
 */
const waysHistories = {}

/**
 * @type {Object.<string, RelationHistory>}
 */
const relationsHistories = {}

const histories = {
    node: nodesHistories,
    way: waysHistories,
    relation: relationsHistories,
}

/**
 *
 * @type {Object.<number, {
 * data: XMLDocument,
 * nodesWithParentWays: Set<number>,
 * nodesWithOldParentWays: Set<number>
 * }>}
 */
const changesetsCache = {}

/**
 * @param {string|number} id
 */
async function getChangeset(id) {
    if (changesetsCache[id]) {
        return changesetsCache[id]
    }
    const text = await originalFetchTextWithCache(osm_server.apiBase + "changeset" + "/" + id + "/download", {
        signal: getAbortController().signal,
    })
    const parser = new DOMParser()
    const data = /** @type {XMLDocument} **/ parser.parseFromString(text, "application/xml")
    return (changesetsCache[id] = {
        data: data,
        nodesWithParentWays: new Set(Array.from(data.querySelectorAll("way > nd")).map(i => parseInt(i.getAttribute("ref")))),
        nodesWithOldParentWays: new Set(Array.from(data.querySelectorAll("way:not([version='1']) > nd")).map(i => parseInt(i.getAttribute("ref")))),
    })
}

function setupNodeVersionView() {
    const match = location.pathname.match(/\/node\/(\d+)\//)
    if (match === null) return
    const nodeHistoryPath = []
    document.querySelectorAll("#element_versions_list > div span.latitude").forEach(i => {
        const lat = i.textContent.replace(",", ".")
        const lon = i.nextElementSibling.textContent.replace(",", ".")
        nodeHistoryPath.push([lat, lon])
        const versionDiv = i.parentElement.parentElement.parentElement.parentElement
        versionDiv.onmouseenter = async () => {
            await interceptMapManually()
            showActiveNodeMarker(lat, lon, c("#ff00e3"))
            versionDiv.querySelectorAll(".browse-tag-list tr").forEach(row => {
                const key = row.querySelector("th")?.textContent?.toLowerCase()
                if (!key) return
                if (key === "direction" || key === "camera:direction") {
                    renderDirectionTag(parseFloat(lat), parseFloat(lon), row.querySelector("td").textContent, c("#ff00e3"))
                    row.onmouseenter = () => {
                        renderDirectionTag(parseFloat(lat), parseFloat(lon), row.querySelector("td").textContent, c("#ff00e3"))
                    }
                }
            })
        }
        versionDiv.onclick = e => {
            if (e.altKey) return
            if (e.target.tagName === "A" || e.target.tagName === "TIME" || e.target.tagName === "SUMMARY" || e.target.tagName === "BUTTON") {
                return
            }
            panTo(lat, lon)
            showActiveNodeMarker(lat, lon, c("#ff00e3"))
        }
    })
    interceptMapManually().then(() => {
        displayWay(nodeHistoryPath, false, "rgba(251,156,112,0.86)", 2)
    })
    document.querySelectorAll("#element_versions_list > div h4:nth-of-type(1):not(:has(.relation-version-view)) a:nth-of-type(1)").forEach(i => {
        const version = i.href.match(/\/(\d+)$/)[1]
        i.parentElement.parentElement.setAttribute("node-version", version)
    })
}

/**
 * @param {number[]} nodes
 * @return {Promise<NodeVersion[][]>}
 */
async function loadNodesViaHistoryCalls(nodes) {
    async function _do(nodes) {
        const targetNodesHistory = []
        for (const nodeID of nodes) {
            targetNodesHistory.push(await getNodeHistory(nodeID))
        }
        return targetNodesHistory
    }

    return (await Promise.all(arraySplit(nodes, 5).map(_do))).flat()
}

/**
 * @typedef {NodeVersion[]} NodeHistory
 * @property {unique symbol} brand_node_history
 */

/**
 * @param {number|string} nodeID
 * @return {Promise<NodeHistory>}
 */
async function getNodeHistory(nodeID) {
    if (nodesHistories[nodeID]) {
        return nodesHistories[nodeID]
    } else {
        const res = await fetchRetry(osm_server.apiBase + "node" + "/" + nodeID + "/history.json", { signal: getAbortController().signal })
        const apiHistory = (await res.json()).elements
        // todo it's dirty
        if (apiHistory[0].version === 1 && !apiHistory.every(n => n.visible === false)) {
            return (nodesHistories[nodeID] = apiHistory)
        }
        return (nodesHistories[nodeID] = await tryToRichObjHistory(apiHistory, "node", nodeID))
    }
}

/**
 * @typedef {WayVersion[]} WayHistory
 */

const enrichedHistories = new Set()

/**
 * @template T
 * @param apiHistory T[]
 * @param objType
 * @param id {string|number}
 * @return {Promise<T[]>}
 */
async function tryToRichObjHistory(apiHistory, objType, id) {
    if (enrichedHistories.has(`${objType}${id}`)) {
        return histories[objType][id]
    }
    console.debug(`tryToRichObjHistory ${objType}, ${id}`)
    const versionNumbers = new Set()
    const mergedHistory = []
    apiHistory.forEach(v => {
        versionNumbers.add(v.version)
        mergedHistory.push(v)
    })

    const oldVersions = Array.from((await downloadVersionsOfObjectWithRedactionBefore2012(objType, id)) ?? []).map(convertXmlVersionToObject)
    // .visible can be missed
    oldVersions.forEach(v => {
        if (versionNumbers.has(v.version)) {
            return
        }
        versionNumbers.add(v.version)
        mergedHistory.push(v)
    })
    mergedHistory.sort((a, b) => {
        if (a.version < b.version) return -1
        if (a.version > b.version) return 1
        return 0
    })
    enrichedHistories.add(`${objType}${id}`)
    return mergedHistory
}

/**
 * @typedef {Object} WayVersion
 * @property {number} id
 * @property {number} changeset
 * @property {number} uid
 * @property {string} user
 * @property {number[]=} [nodes]
 * @property {number} version
 * @property {boolean} visible
 * @property {string} timestamp
 * @property {'way'} type
 * @property {Object.<string, string>=} [tags]
 */
/**
 * @param {number|string} wayID
 * @return {Promise<WayHistory>}
 */
async function getWayHistory(wayID) {
    if (waysHistories[wayID]) {
        return waysHistories[wayID]
    } else {
        const res = await fetchRetry(osm_server.apiBase + "way" + "/" + wayID + "/history.json", { signal: getAbortController().signal })
        const apiHistory = (await res.json()).elements
        // todo it's dirty
        if (apiHistory[0].version === 1 && !apiHistory.every(w => w.visible === false)) {
            return (waysHistories[wayID] = apiHistory)
        }
        return (waysHistories[wayID] = await tryToRichObjHistory(apiHistory, "way", wayID))
    }
}

const overpassVersionsCache = new Map()

async function loadHiddenWayVersionViaOverpass(wayID, version) {
    if (osm_server !== prod_server) {
        console.warn("Overpass works only for main OSM server")
        return
    }
    if (parseInt(version) < 1) {
        return
    }
    if (overpassVersionsCache.has(`${wayID}${version}`)) {
        return overpassVersionsCache.get(`${wayID}${version}`)
    }
    const query = `
[out:json];
timeline(way, ${wayID}, ${version});
for (t["created"])
{
  retro (_.val)
  {
    way(${wayID});
    out meta;
  }
}
`
    console.time(`download overpass data for way ${wayID} v${version}`)
    await globalRateLimitByKey("overpass", 500)
    const res = await externalFetchRetry({
        url:
            overpass_server.apiUrl +
            "/interpreter?" +
            new URLSearchParams({
                data: query,
            }),
        responseType: "json",
    })
    console.timeEnd(`download overpass data for way ${wayID} v${version}`)
    if (!res.response.elements[0]) {
        console.log("version not found via overpass. There may be a version created before 2012")
    }
    overpassVersionsCache.set(`${wayID}${version}`, res.response.elements[0])
    return res.response.elements[0]
}

function convertXmlVersionToObject(xmlVersion) {
    if (!xmlVersion) {
        return
    }
    /** @type {NodeVersion|WayVersion|RelationVersion} */
    const resultObj = {
        type: xmlVersion.nodeName,
        id: parseInt(xmlVersion.getAttribute("id")),
        changeset: parseInt(xmlVersion.getAttribute("changeset")),
        uid: parseInt(xmlVersion.getAttribute("uid")),
        user: xmlVersion.getAttribute("user"),
        version: parseInt(xmlVersion.getAttribute("version")),
        timestamp: xmlVersion.getAttribute("timestamp"),
    }
    const tagsInXml = Array.from(xmlVersion.querySelectorAll("tag"))
    const tags = Object.fromEntries(
        tagsInXml.map(tag => {
            const k = tag.getAttribute("k")
            const v = tag.getAttribute("v")
            return [k, v]
        }),
    )
    if (tagsInXml.length) {
        resultObj.tags = tags
    }
    const nodes = Array.from(xmlVersion.querySelectorAll("nd")).map(i => parseInt(i.getAttribute("ref")))
    if (nodes.length) {
        resultObj.nodes = nodes
    }
    if (xmlVersion.getAttribute("visible") === "false") {
        resultObj.visible = false
    }
    if (xmlVersion.getAttribute("lat") !== null) {
        resultObj.lat = parseFloat(xmlVersion.getAttribute("lat"))
        resultObj.lon = parseFloat(xmlVersion.getAttribute("lon"))
    }
    const members = Array.from(xmlVersion.querySelectorAll("member")).map(i => {
        return {
            ref: i.getAttribute("ref"),
            type: i.getAttribute("type"),
            role: i.getAttribute("role"),
        }
    })
    if (members.length) {
        resultObj.members = members
    }
    return resultObj
}

/**
 * @param wayID {number|string}
 * @param version {number|string}
 * @return {Promise<WayVersion>|undefined}
 */
async function loadHiddenWayVersionViaGithub(wayID, version) {
    if (parseInt(version) < 1) {
        return
    }
    const data = await downloadVersionsOfObjectWithRedactionBefore2012("way", wayID)
    const xmlVersion = Array.from(data).find(i => parseInt(i.getAttribute("version")) === parseInt(version))
    return convertXmlVersionToObject(xmlVersion)
}

/**
 * @param {string|number} wayID
 * @param {number} version
 * @param {string|number|null=} changesetID
 * @return {Promise<[WayVersion, NodeHistory[]]>}
 */
async function loadWayVersionNodes(wayID, version, changesetID = null) {
    if (parseInt(version) < 1) {
        throw `invalid version for loadWayVersionNodes failed ${wayID}. Version: ${version}`
    }
    console.debug("Loading way", wayID, version)
    const wayHistory = await getWayHistory(wayID)

    const targetVersion = wayHistory.find(v => v.version === version) ?? (await loadHiddenWayVersionViaOverpass(wayID, version)) ?? (await loadHiddenWayVersionViaGithub(wayID, version))
    if (!targetVersion) {
        throw `loadWayVersionNodes failed ${wayID}, ${version}`
    }
    if (!targetVersion.nodes || targetVersion.nodes.length === 0) {
        return [targetVersion, []]
    }
    const notCached = targetVersion.nodes.filter(nodeID => !nodesHistories[nodeID])
    // console.debug("Not cached nodes histories for download:", notCached.length, "/", targetVersion.nodes)
    if (notCached.length < 2 || osm_server === local_server) {
        // https://github.com/openstreetmap/openstreetmap-website/issues/5183
        return [targetVersion, await loadNodesViaHistoryCalls(targetVersion.nodes)]
    }
    // todo batchSize должен быть динамический
    // Максимальная длина урла 8213 символов.
    // 400 взято с запасом, что для точки нужно 20 символов
    // пример точки: 123456789012v1234,
    const batchSize = 410
    const lastVersions = []
    const batches = []
    for (let i = 0; i < notCached.length; i += batchSize) {
        console.debug(`Batch #${i}/${notCached.length}`)
        batches.push(notCached.slice(i, i + batchSize))
    }
    await Promise.all(
        batches.map(async batch => {
            const res = await fetchRetry(osm_server.apiBase + "nodes.json?nodes=" + batch.join(","), { signal: getAbortController().signal })
            if (!res.ok) {
                console.trace(res)
            }
            const nodes = (await res.json()).elements
            lastVersions.push(...nodes)
            nodes.forEach(n => {
                if (n.version === 1) {
                    nodesHistories[n.id] = [n]
                }
            })
        }),
    )

    const longHistoryNodes = lastVersions.filter(n => n?.version !== 1)
    const lastVersionsMap = Object.groupBy(lastVersions, ({ id }) => id)

    console.debug("Nodes with multiple versions: ", longHistoryNodes.length)
    if (longHistoryNodes.length === 0) {
        return [targetVersion, targetVersion.nodes.map(nodeID => nodesHistories[nodeID])]
    }

    const queryArgs = [""]
    const maxQueryArgLen = 8213 - (osm_server.apiBase.length + "nodes.json?nodes=".length)
    for (const lastVersion of longHistoryNodes) {
        for (let v = 1; v < lastVersion.version; v++) {
            // todo не нужно загружать версию, которая в текущем пакете правок (если уже успели его загрузить)
            const arg = lastVersion.id + "v" + v
            if (queryArgs[queryArgs.length - 1].length + arg.length + 1 < maxQueryArgLen) {
                if (queryArgs[queryArgs.length - 1] === "") {
                    queryArgs[queryArgs.length - 1] += arg
                } else {
                    queryArgs[queryArgs.length - 1] += "," + arg
                }
            } else {
                queryArgs.push(arg)
            }
        }
    }

    // https://github.com/openstreetmap/openstreetmap-website/issues/5005

    /**
     * @type {NodeVersion[]}
     */
    let versions = []
    // console.debug(`w${wayID}v${version}`)
    // console.groupCollapsed(`w${wayID}v${version}`)
    await Promise.all(
        queryArgs.map(async args => {
            const res = await fetchRetry(osm_server.apiBase + "nodes.json?nodes=" + args, { signal: getAbortController().signal })
            if (res.status === 404) {
                console.log("%c Some nodes was hidden. Start slow fetching :(", "background: #222; color: #bada55")
                const newArgs = args.split(",").map(i => parseInt(i.match(/(\d+)v(\d+)/)[1]))
                // это нарушает инвариант, что versions не содержит последней версии
                // важно также сохранять отсортированность,
                // иначе loadNodesViaHistoryCalls сделает внутри несколько вызовов для одной и той же точки
                ;(await loadNodesViaHistoryCalls(newArgs)).forEach(i => {
                    versions.push(...i)
                })
            } else if (res.status === 414) {
                console.error("hmm, the maximum length of the URI is incorrectly calculated")
                console.trace()
            } else {
                if (!res.ok) {
                    console.trace(res)
                }
                versions.push(...(await res.json()).elements)
            }
        }),
    )
    // console.debug(`end w${wayID}v${version}`)
    // console.groupEnd()
    // из-за возможной ручной докачки историй, нужна дедупликация
    const seen = {}
    versions = versions.filter(function ({ id: id, version: version }) {
        return Object.prototype.hasOwnProperty.call(seen, [id, version]) ? false : (seen[[id, version]] = true)
    })

    Object.entries(Object.groupBy(versions, ({ id }) => id)).forEach(([id, history]) => {
        history.sort((a, b) => {
            if (a.version < b.version) return -1
            if (a.version > b.version) return 1
            return 0
        })
        if (history.length && history[history.length - 1].version !== lastVersionsMap[id][0].version) {
            history.push(lastVersionsMap[id][0])
        }
        nodesHistories[id] = history
    })
    return [targetVersion, targetVersion.nodes.map(nodeID => nodesHistories[nodeID])]
}

/**
 * @template {NodeVersion|WayVersion|RelationVersion} T
 * @param {T[]} history
 * @param {string} timestamp
 * @param {boolean=} alwaysReturn
 * @return {T|null}
 */
function searchVersionByTimestamp(history, timestamp, alwaysReturn = false) {
    const targetTime = new Date(timestamp)
    let cur = history[0]
    if (targetTime < new Date(cur.timestamp) && !alwaysReturn) {
        return null
    }
    for (const v of history) {
        if (new Date(v.timestamp) <= targetTime) {
            cur = v
        }
    }
    return cur
}

/**
 * @template T
 * @param {T[][]} objectList
 * @param {string} timestamp
 * @param {boolean=} alwaysReturn
 * @return {T[]}
 */
function filterObjectListByTimestamp(objectList, timestamp, alwaysReturn = false) {
    return objectList.map(i => searchVersionByTimestamp(i, timestamp, alwaysReturn))
}

async function sortWayNodesByTimestamp(wayID) {
    /** @type {(NodeVersion|WayVersion)[]} */
    const objectsBag = []
    /** @type {Set<string>} */
    const objectsSet = new Set()
    for (const i of document.querySelectorAll(`.way-version-view`)) {
        const versionNum = parseInt(i.getAttribute("way-version"))
        const [targetVersion, nodesHistory] = await loadWayVersionNodes(wayID, versionNum)
        objectsBag.push(targetVersion)
        nodesHistory.forEach(v => {
            if (v.length === 0) {
                console.error(`${wayID}, v${versionNum} has node with empty history`)
            }
            const uniq_key = `${v[0].type} ${v[0].id}`
            if (!objectsSet.has(uniq_key)) {
                objectsBag.push(...v)
                objectsSet.add(uniq_key)
            }
        })
    }
    objectsBag.sort((a, b) => {
        if (a.timestamp < b.timestamp) return -1
        if (a.timestamp > b.timestamp) return 1
        if (a.type === "node" && b.type === "way") return -1
        if (a.type === "way" && b.type === "node") return 1
        return 0
    })
    return objectsBag
}

/**
 * @template T
 * @param {T[]} history
 * @return {Object.<number, T>}
 */
function makeObjectVersionsIndex(history) {
    const wayVersionsIndex = {}
    history.forEach(i => {
        wayVersionsIndex[i.version] = i
    })
    return wayVersionsIndex
}

/**
 * @param {NodeVersion} v1
 * @param {NodeVersion} v2
 * @return {boolean}
 */
function locationChanged(v1, v2) {
    return v1.lat !== v2.lat || v1.lon !== v2.lon
}

/**
 * @param {WayVersion} v1
 * @param {WayVersion} v2
 * @return {boolean}
 */
function nodesChanged(v1, v2) {
    return JSON.stringify(v1.nodes) !== JSON.stringify(v2.nodes)
}

/**
 * @param {RelationVersion} v1
 * @param {RelationVersion} v2
 * @return {boolean}
 */
function membersChanged(v1, v2) {
    return JSON.stringify(v1.members) !== JSON.stringify(v2.members)
}

/**
 * @param {NodeVersion|WayVersion} v1
 * @param {NodeVersion|WayVersion} v2
 * @return {boolean}
 */
function tagsChanged(v1, v2) {
    return JSON.stringify(v1.tags) !== JSON.stringify(v2.tags)
}

/**
 * @param relationID {number}
 * @return {Promise<(NodeVersion|WayVersion|RelationVersion)[]>}
 */
async function sortRelationMembersByTimestamp(relationID) {
    /** @type {(NodeVersion|WayVersion|RelationVersion)[]} */
    const objectsBag = []
    /** @type {Set<string>} */
    const objectsSet = new Set()
    for (const i of document.querySelectorAll(`.relation-version-view`)) {
        const versionNum = parseInt(i.getAttribute("relation-version"))
        const { targetVersion: targetVersion, membersHistory: membersHistory } = await loadRelationVersionMembers(relationID, versionNum)
        objectsBag.push(targetVersion)
        membersHistory.nodes.forEach(nodeHistory => {
            const uniq_key = `${nodeHistory[0].type} ${nodeHistory[0].id}`
            if (!objectsSet.has(uniq_key)) {
                objectsBag.push(...nodeHistory)
                objectsSet.add(uniq_key)
            }
        })
        membersHistory.ways.forEach(([wayVersion, wayHistory, nodesHistories]) => {
            const uniq_key = `${wayVersion.type} ${wayVersion.id}`
            if (!objectsSet.has(uniq_key)) {
                objectsBag.push(...wayHistory)
                objectsSet.add(uniq_key)
            }
            nodesHistories.forEach(history => {
                const uniq_key = `${history[0].type} ${history[0].id}`
                if (!objectsSet.has(uniq_key)) {
                    objectsBag.push(...history)
                    objectsSet.add(uniq_key)
                }
            })
        })
        membersHistory.relations.forEach(([relationVersion, history]) => {
            // todo
            const uniq_key = `${history[0].type} ${history[0].id}`
            if (!objectsSet.has(uniq_key)) {
                objectsBag.push(...history)
                objectsSet.add(uniq_key)
            }
        })
    }
    const lastMembers = await loadRelationMetadata(relationID)
    for (let element of lastMembers.elements) {
        if (element.type === "node") {
            const uniq_key = `${element.type} ${element.id}`
            if (!objectsSet.has(uniq_key)) {
                objectsBag.push(...(await getNodeHistory(element.id)))
                objectsSet.add(uniq_key)
            }
        } else if (element.type === "way") {
            const uniq_key = `${element.type} ${element.id}`
            if (!objectsSet.has(uniq_key)) {
                objectsBag.push(...(await getWayHistory(element.id)))
                objectsSet.add(uniq_key)
            }
        } else if (element.type === "relation") {
            // todo
            await getRelationHistory(element.id)
        }
    }
    objectsBag.sort((a, b) => {
        if (a.timestamp < b.timestamp) return -1
        if (a.timestamp > b.timestamp) return 1
        if (a.type === "node" && b.type !== "node") return -1
        if (a.type === "way" && b.type === "relation") return -1
        if (a.type !== "node" && b.type === "node") return 1
        if (a.type === "relation" && b.type === "way") return 1
        return 0
    })
    return objectsBag
}

function makeVersionUl(timestamp, username, changesetID) {
    const ul = document.createElement("ul")
    ul.classList.add("list-unstyled")
    const li = document.createElement("li")
    ul.appendChild(li)

    const time = document.createElement("time")
    time.setAttribute("datetime", timestamp)
    time.setAttribute("natural_text", timestamp) // it should server side string :(
    time.setAttribute("title", timestamp) // it should server side string :(
    time.textContent = new Date(timestamp).toISOString().slice(0, -5) + "Z"
    li.appendChild(time)
    li.appendChild(document.createTextNode("\xA0"))

    const user_link = document.createElement("a")
    user_link.href = location.origin + "/user/" + username
    user_link.textContent = username
    li.appendChild(user_link)
    li.appendChild(document.createTextNode("\xA0"))

    const changeset_link = document.createElement("a")
    changeset_link.href = location.origin + "/changeset/" + changesetID
    changeset_link.textContent = "#" + changesetID
    li.appendChild(changeset_link)
    return ul
}

async function replaceDownloadWayButton(btn, wayID) {
    const objectsBag = await sortWayNodesByTimestamp(wayID)

    /** @type {Object<number, WayVersion>} */
    const wayVersionsIndex = makeObjectVersionsIndex(await getWayHistory(wayID))
    /** @type {Object.<string, NodeVersion|WayVersion>}*/
    const objectStates = {}
    /** @type {Object.<string, [string, NodeVersion|WayVersion, NodeVersion|WayVersion]>} */
    let currentChanges = {}

    /**
     * @param {string} key
     * @param {NodeVersion|WayVersion} newVersion
     */
    function storeChanges(key, newVersion) {
        const prev = objectStates[key]
        if (prev === undefined) {
            currentChanges[key] = ["new", prev, newVersion]
        } else {
            if (locationChanged(prev, newVersion) && tagsChanged(prev, newVersion)) {
                currentChanges[key] = ["new", prev, newVersion]
            } else if (locationChanged(prev, newVersion)) {
                currentChanges[key] = ["location", prev, newVersion]
            } else if (tagsChanged(prev, newVersion)) {
                currentChanges[key] = ["tags", prev, newVersion]
            } else {
                currentChanges[key] = ["", prev, newVersion]
            }
        }
    }

    /** @type {number|null} */
    let currentChangeset = null
    /** @type {string|null} */
    let currentUser = null
    /** @type {string|null} */
    let currentTimestamp = null
    /** @type {WayVersion}*/
    let currentWayVersion = { version: 0, nodes: [] }
    let currentWayNodesSet = new Set()

    function makeInterWayVersionHeader() {
        const interVersionDivHeader = document.createElement("h4")
        const interVersionDivAbbr = document.createElement("abbr")
        interVersionDivAbbr.textContent = ["ru-RU", "ru"].includes(navigator.language) ? "Промежуточная версия" : "Intermediate version"
        // prettier-ignore
        interVersionDivAbbr.title = ["ru-RU", "ru"].includes(navigator.language)
            ? "Произошли изменения тегов или координат точек в линии,\nкоторые не увеличили версию линии"
            : "There have been changes to the tags or coordinates of nodes in the way that have not increased the way version"
        interVersionDivHeader.appendChild(interVersionDivAbbr)
        return interVersionDivHeader
    }

    function renderInterVersion() {
        const currentNodes = []
        wayVersionsIndex[currentWayVersion.version].nodes.forEach(nodeID => {
            const uniq_key = `node ${nodeID}`
            currentNodes.push(objectStates[uniq_key])
            if (currentChanges[uniq_key] !== undefined) return
            const curV = objectStates[uniq_key]
            if (curV) {
                currentChanges[uniq_key] = ["", curV, curV]
            } else {
                console.warn(`${uniq_key} not found in states`)
            }
        })

        const interVersionDiv = document.createElement("div")
        interVersionDiv.setAttribute("way-version", "inter")
        interVersionDiv.classList.add("mb-3", "border-bottom", "border-secondary-subtle", "pb-3", "browse-section")

        const interVersionDivHeader = makeInterWayVersionHeader()
        interVersionDiv.appendChild(interVersionDivHeader)

        const p = document.createElement("p")
        interVersionDiv.appendChild(p)
        loadChangesetMetadata(currentChangeset).then(ch => {
            p.textContent = ch.tags["comment"]
        })

        interVersionDiv.appendChild(makeVersionUl(currentTimestamp, currentUser, currentChangeset))

        const nodesDetails = document.createElement("details")
        nodesDetails.classList.add("way-version-nodes")
        nodesDetails.onclick = e => {
            e.stopImmediatePropagation()
        }
        const summary = document.createElement("summary")
        summary.textContent = currentNodes.length
        summary.classList.add("history-diff-modified-tag")
        nodesDetails.appendChild(summary)
        const ulNodes = document.createElement("ul")
        ulNodes.classList.add("list-unstyled")
        currentNodes.forEach(i => {
            if (i === undefined) {
                console.trace()
                console.log(currentNodes)
                btn.style.background = "yellow"
                btn.title = "Some nodes was hidden by moderators"
                return
            }
            const nodeLi = document.createElement("li")
            const div = document.createElement("div")
            div.classList.add("d-flex", "gap-1")
            const div2 = document.createElement("div")
            div2.classList.add("align-self-center")
            div.appendChild(div2)

            const aHistory = document.createElement("a")
            aHistory.classList.add("node")
            aHistory.href = "/node/" + i.id + "/history"
            aHistory.textContent = i.id
            div2.appendChild(aHistory)

            div2.appendChild(document.createTextNode(", "))

            const aVersion = document.createElement("a")
            aVersion.classList.add("node")
            aVersion.href = "/node/" + i.id + "/history/" + i.version
            aVersion.textContent = "v" + i.version
            div2.appendChild(aVersion)
            nodeLi.appendChild(div)

            const curChange = currentChanges[`node ${i.id}`]
            const nodesHistory = nodesHistories[i.id]
            const tagsTable = processObject(div2, "node", curChange[1] ?? curChange[2], curChange[2], nodesHistory[nodesHistory.length - 1], nodesHistory)
            setTimeout(async () => {
                await processObjectInteractions("", "node", { nodes: [] }, div2, ...getPrevTargetLastVersions(...(await getHistoryAndVersionByElem(div2))))
            }, 0)
            tagsTable.then(table => {
                if (nodeLi.classList.contains("tags-non-modified")) {
                    div2.appendChild(table)
                }
                // table.style.borderColor = "var(--bs-body-color)";
                // table.style.borderStyle = "solid";
                // table.style.borderWidth = "1px";
            })
            ulNodes.appendChild(nodeLi)
        })
        nodesDetails.appendChild(ulNodes)
        interVersionDiv.appendChild(nodesDetails)

        const tmpChangedNodes = Object.values(currentChanges).filter(i => i[2].type === "node")
        if (tmpChangedNodes.every(i => i[0] === "tags")) {
            interVersionDiv.classList.add("only-tags-changed")
        }
        const changedNodes = tmpChangedNodes.filter(i => i[0] !== "location")
        interVersionDiv.onmouseenter = () => {
            resetMapHover()
            cleanAllObjects()
            showWay(currentNodes, "#000000", false, darkModeForMap && isDarkMode())
            currentNodes.forEach(node => {
                if (node.tags && Object.keys(node.tags).filter(k => k !== "created_by" && k !== "source").length > 0) {
                    showNodeMarker(node.lat.toString(), node.lon.toString(), "rgb(161,161,161)", null, "customObjects", 3)
                }
            })
            changedNodes.forEach(i => {
                if (i[0] === "") return
                if (i[2].visible === false) {
                    if (i[1].visible !== false) {
                        showNodeMarker(i[1].lat.toString(), i[1].lon.toString(), "#ff0000", null, "customObjects", 3)
                    }
                } else if (i[0] === "new") {
                    if (i[2].tags && Object.keys(i[2].tags).filter(k => k !== "created_by" && k !== "source").length > 0) {
                        showNodeMarker(i[2].lat.toString(), i[2].lon.toString(), "#00a500", null, "customObjects", 3)
                    }
                    showNodeMarker(i[2].lat.toString(), i[2].lon.toString(), "#00a500", null, "customObjects", 3)
                } else {
                    showNodeMarker(i[2].lat.toString(), i[2].lon.toString(), "rgb(255,245,41)", null, "customObjects", 3)
                }
            })
        }
        interVersionDiv.onclick = e => {
            resetMapHover()
            cleanAllObjects()
            showWay(cloneInto(currentNodes, unsafeWindow), "#000000", e.isTrusted, darkModeForMap && isDarkMode())
            currentNodes.forEach(node => {
                if (node.tags && Object.keys(node.tags).filter(k => k !== "created_by" && k !== "source").length > 0) {
                    showNodeMarker(node.lat.toString(), node.lon.toString(), "rgb(161,161,161)", null, "customObjects", 3)
                }
            })
            changedNodes.forEach(i => {
                if (i[0] === "") return
                if (i[2].visible === false) {
                    if (i[1].visible !== false) {
                        showNodeMarker(i[1].lat.toString(), i[1].lon.toString(), "#ff0000", null, "customObjects", 3)
                    }
                } else if (i[0] === "new") {
                    if (i[2].tags && Object.keys(i[2].tags).filter(k => k !== "created_by" && k !== "source").length > 0) {
                        showNodeMarker(i[2].lat.toString(), i[2].lon.toString(), "#00a500", null, "customObjects", 3)
                    }
                    showNodeMarker(i[2].lat.toString(), i[2].lon.toString(), "#00a500", null, "customObjects", 3)
                } else {
                    showNodeMarker(i[2].lat.toString(), i[2].lon.toString(), "rgb(255,245,41)", null, "customObjects", 3)
                }
            })
        }
        let insertBeforeThat = document.querySelector(`#element_versions_list > :where(div, details)[way-version="${currentWayVersion.version}"]`)
        while (insertBeforeThat.previousElementSibling?.getAttribute("way-version") === "inter") {
            // fixme O(n^2)
            insertBeforeThat = insertBeforeThat.previousElementSibling
        }
        insertBeforeThat.before(interVersionDiv)
    }

    function replaceWayVersion(it) {
        let divForNodesReplace = document.querySelector(`#element_versions_list > :where(div, details)[way-version="${it.version}"]`)
        if (Object.keys(currentChanges).length > 1 && divForNodesReplace.classList?.contains("empty-version")) {
            divForNodesReplace.querySelector("summary")?.remove()
            const div = document.createElement("div")
            div.innerHTML = divForNodesReplace.innerHTML
            div.setAttribute("way-version", divForNodesReplace.getAttribute("way-version"))
            divForNodesReplace.replaceWith(div)
            divForNodesReplace = div
        }
        currentWayVersion = it
        currentWayNodesSet = new Set()
        currentWayVersion.nodes?.forEach(nodeID => {
            currentWayNodesSet.add(nodeID)
            const uniq_key = `node ${nodeID}`
            if (currentChanges[uniq_key] === undefined) {
                const curV = objectStates[uniq_key]
                if (curV) {
                    if (curV.version === 1 && currentWayVersion.changeset === curV.changeset) {
                        currentChanges[uniq_key] = ["new", emptyVersion, curV]
                    } else {
                        currentChanges[uniq_key] = ["", curV, curV]
                    }
                } else {
                    console.warn(`${uniq_key} not found in states`)
                }
            }
        })
        if (divForNodesReplace && currentWayVersion.nodes) {
            const currentNodes = []
            const ulNodes = divForNodesReplace.querySelector("details:not(.empty-version) ul")
            ulNodes.parentElement.classList.add("way-version-nodes")
            ulNodes.querySelectorAll("li").forEach(li => {
                li.style.display = "none"
                const id = li.querySelector("div div a").href.match(/node\/(\d+)/)[1]
                currentNodes.push([li.querySelector("img"), objectStates[`node ${id}`]])
            })
            if (it.version !== 1) {
                const changedNodes = Object.values(currentChanges).filter(i => i[2].type === "node" && i[0] !== "location" && i[0] !== "")
                document.querySelector(`#element_versions_list > div[way-version="${it.version}"]`)?.addEventListener("mouseenter", () => {
                    changedNodes.forEach(i => {
                        if (i[2].visible === false) {
                            if (i[1].visible !== false) {
                                showNodeMarker(i[1].lat.toString(), i[1].lon.toString(), "#ff0000", null, "customObjects", 3)
                            }
                        } else if (i[0] === "new") {
                            if (i[2].tags && Object.keys(i[2].tags).filter(k => k !== "created_by" && k !== "source").length > 0) {
                                showNodeMarker(i[2].lat.toString(), i[2].lon.toString(), "#00a500", null, "customObjects", 3)
                            }
                            showNodeMarker(i[2].lat.toString(), i[2].lon.toString(), "#00a500", null, "customObjects", 3)
                        } else {
                            showNodeMarker(i[2].lat.toString(), i[2].lon.toString(), "rgb(255,245,41)", null, "customObjects", 3)
                        }
                    })
                })
                document.querySelector(`#element_versions_list > div[way-version="${it.version}"]`)?.addEventListener("click", () => {
                    changedNodes.forEach(i => {
                        if (i[2].visible === false) {
                            if (i[1].visible !== false) {
                                showNodeMarker(i[1].lat.toString(), i[1].lon.toString(), "#ff0000", null, "customObjects", 3)
                            }
                        } else if (i[0] === "new") {
                            if (i[2].tags && Object.keys(i[2].tags).filter(k => k !== "created_by" && k !== "source").length > 0) {
                                showNodeMarker(i[2].lat.toString(), i[2].lon.toString(), "#00a500", null, "customObjects", 3)
                            }
                            showNodeMarker(i[2].lat.toString(), i[2].lon.toString(), "#00a500", null, "customObjects", 3)
                        } else {
                            showNodeMarker(i[2].lat.toString(), i[2].lon.toString(), "rgb(255,245,41)", null, "customObjects", 3)
                        }
                    })
                })
            }
            currentNodes.forEach(([img, i]) => {
                if (i === undefined) {
                    console.trace()
                    console.log(currentNodes)
                    btn.style.background = "yellow"
                    btn.title = "Please try reload page.\nIf the error persists, a message about it in the better-osm-org repository"
                    divForNodesReplace.classList.add("broken-version")
                    divForNodesReplace.title = "Some nodes was hidden by moderators :\\"
                    divForNodesReplace.style.cursor = "auto"
                    return
                }
                const nodeLi = document.createElement("li")
                const div = document.createElement("div")
                div.classList.add("d-flex", "gap-1")
                const div2 = document.createElement("div")
                div2.classList.add("align-self-center")
                div.appendChild(div2)

                div2.before(img.cloneNode(true))

                const aHistory = document.createElement("a")
                aHistory.classList.add("node")
                aHistory.href = "/node/" + i.id + "/history"
                aHistory.textContent = i.id
                div2.appendChild(aHistory)
                nodeLi.appendChild(div)

                div2.appendChild(document.createTextNode(", "))

                const aVersion = document.createElement("a")
                aVersion.classList.add("node")
                aVersion.href = "/node/" + i.id + "/history/" + i.version
                aVersion.textContent = "v" + i.version
                div2.appendChild(aVersion)
                nodeLi.appendChild(div)

                const curChange = currentChanges[`node ${i.id}`]
                const nodesHistory = nodesHistories[i.id]
                const tagsTable = processObject(div2, "node", curChange[1] ?? curChange[2], curChange[2], nodesHistory[nodesHistory.length - 1], nodesHistory)
                setTimeout(async () => {
                    await processObjectInteractions("", "node", { nodes: [] }, div2, ...getPrevTargetLastVersions(...(await getHistoryAndVersionByElem(div2))))
                }, 0)
                tagsTable.then(table => {
                    if (nodeLi.classList.contains("tags-non-modified")) {
                        div2.appendChild(table)
                    }
                    //                            table.style.borderColor = "var(--bs-body-color)";
                    //                             table.style.borderStyle = "solid";
                    //                             table.style.borderWidth = "1px";
                })
                ulNodes.appendChild(nodeLi)
            })
        }
        currentChanges = {}
        currentChangeset = null
    }

    for (const it of objectsBag) {
        console.debug(it)
        const uniq_key = `${it.type} ${it.id}`
        if (it.type === "node" && currentWayVersion.version > 0 && !currentWayNodesSet.has(it.id)) {
            objectStates[uniq_key] = it
            continue
        }
        if (it.changeset === currentChangeset) {
            storeChanges(uniq_key, it) // todo split if new way version
        } else if (currentChangeset === null) {
            currentChangeset = it.changeset
            currentUser = it.user
            currentTimestamp = it.timestamp
            storeChanges(uniq_key, it)
        } else {
            if (currentWayVersion.version !== 0) {
                renderInterVersion()
            }
            currentChanges = {}
            storeChanges(uniq_key, it)
            currentChangeset = it.changeset
            currentUser = it.user
            currentTimestamp = it.timestamp
        }
        objectStates[uniq_key] = it
        // для настоящей версии линии
        if (it.type === "way") {
            replaceWayVersion(it)
        }
    }
    if (Object.entries(currentChanges).length) {
        renderInterVersion()
    }
    document.querySelector("#sidebar_content h2").addEventListener(
        "mouseleave",
        () => {
            document.querySelector("#sidebar_content h2").onmouseenter = () => {
                cleanAllObjects()
            }
        },
        {
            once: true,
        },
    )
    // making version filter
    if (document.querySelectorAll('[way-version="inter"]').length > 20) {
        const select = document.createElement("select")
        select.id = "versions-filter"
        select.title = "Filter for intermediate changes"

        const allVersions = document.createElement("option")
        allVersions.value = "all-versions"
        allVersions.textContent = ["ru-RU", "ru"].includes(navigator.language) ? "Все версии" : "All versions"
        select.appendChild(allVersions)

        const withGeom = document.createElement("option")
        withGeom.value = "with-geom"
        withGeom.textContent = ["ru-RU", "ru"].includes(navigator.language) ? "Все изменения геометрии" : "With geometry changes"
        withGeom.setAttribute("selected", "selected")
        select.appendChild(withGeom)

        const withoutInter = document.createElement("option")
        withoutInter.value = "without-inter"
        withoutInter.textContent = ["ru-RU", "ru"].includes(navigator.language) ? "Без промежуточных" : "Without intermediate"
        select.appendChild(withoutInter)

        select.onchange = e => {
            if (e.target.value === "all-versions") {
                document.querySelectorAll('[way-version="inter"]').forEach(i => {
                    i.removeAttribute("hidden")
                })
            } else if (e.target.value === "with-geom") {
                document.querySelectorAll('.only-tags-changed[way-version="inter"]').forEach(i => {
                    i.setAttribute("hidden", "true")
                })
                document.querySelectorAll('[way-version="inter"]:not(.only-tags-changed)').forEach(i => {
                    i.removeAttribute("hidden")
                })
            } else if (e.target.value === "without-inter") {
                document.querySelectorAll('[way-version="inter"]').forEach(i => {
                    i.setAttribute("hidden", "true")
                })
            }
        }
        document.querySelectorAll('.only-tags-changed[way-version="inter"]').forEach(i => {
            i.setAttribute("hidden", "true")
        })
        btn.after(select)
    }
    btn.remove()
}

async function showFullWayHistory(wayID) {
    const btn = document.querySelector("#download-all-versions-btn")
    try {
        await replaceDownloadWayButton(btn, wayID)
    } catch (err) {
        console.error(err)
        btn.title = "Please try reload page.\nIf the error persists, a message about it in the better-osm-org repository"
        btn.style.background = "red"
        btn.style.cursor = "auto"
    }
}

function setupWayVersionView() {
    const match = location.pathname.match(/\/way\/(\d+)\//)
    if (match === null) return
    const wayID = match[1]

    async function loadWayVersion(e, loadMore = true, needShowWay = true, needFly = false) {
        const htmlElem = e.target ? e.target : e
        htmlElem.style.cursor = "progress"
        const version = parseInt(htmlElem.getAttribute("way-version"))
        const [targetVersion, nodesHistory] = await loadWayVersionNodes(wayID, version)
        const nodesList = filterObjectListByTimestamp(nodesHistory, targetVersion.timestamp)
        if (nodesList.some(i => i === null)) {
            htmlElem.parentElement.parentElement.classList.add("broken-version")
            htmlElem.title = "Some nodes was hidden by moderators"
            htmlElem.style.cursor = "auto"
        } else {
            if (needShowWay) {
                cleanAllObjects()
                showWay(cloneInto(nodesList, unsafeWindow), "#000000", needFly, darkModeForMap && isDarkMode())
                nodesList.forEach(node => {
                    if (node.tags && Object.keys(node.tags).filter(k => k !== "created_by" && k !== "source").length > 0) {
                        showNodeMarker(node.lat.toString(), node.lon.toString(), "rgb(161,161,161)", null, "customObjects", 3)
                    }
                })
            }
        }
        if (htmlElem.nodeName === "A") {
            const versionDiv = htmlElem.parentNode.parentNode
            versionDiv.onmouseenter = e => {
                resetMapHover()
                loadWayVersion(e)
            }
            versionDiv.onclick = async e => {
                if (e.target.tagName === "A" || e.target.tagName === "TIME" || e.target.tagName === "SUMMARY" || e.target.tagName === "BUTTON") {
                    return
                }
                await loadWayVersion(versionDiv, true, true, true)
            }
            versionDiv.setAttribute("way-version", version.toString())
            htmlElem.style.cursor = "pointer" // todo finally{}
            htmlElem.setAttribute("hidden", "true")
            // preload next
            if (version !== 1) {
                let prevVersionNum = version - 1
                while (prevVersionNum > 0) {
                    try {
                        console.log(`preloading v${prevVersionNum}`)
                        await loadWayVersionNodes(wayID, prevVersionNum)
                        console.log(`preloaded v${prevVersionNum}`)
                        break
                    } catch {
                        console.log(`Skip v${prevVersionNum}`)
                        prevVersionNum--
                    }
                }
                const loadBtn = document.querySelector(`#sidebar_content a[way-version="${prevVersionNum}"]`)
                if (loadMore && document.querySelector(`#sidebar_content a[way-version="${prevVersionNum}"]`)) {
                    const nodesCount = waysHistories[wayID].filter(v => v.version === prevVersionNum)[0].nodes?.length
                    if (!nodesCount || nodesCount <= 123) {
                        await loadWayVersion(loadBtn, true, false)
                    } else {
                        await loadWayVersion(loadBtn, false, false)
                        if (prevVersionNum > 1) {
                            console.log(`preloading2 v${prevVersionNum - 1}`)
                            await loadWayVersionNodes(wayID, prevVersionNum - 1)
                            console.log(`preloaded v${prevVersionNum - 1}`)
                        }
                    }
                }
            }
        } else {
            try {
                e.target.style.cursor = "auto"
            } catch {
                e.style.cursor = "auto"
            }
        }
    }

    document.querySelectorAll("#element_versions_list > div h4:nth-of-type(1):not(:has(.way-version-view)) a:nth-of-type(1)").forEach(i => {
        const version = i.href.match(/\/(\d+)$/)[1]
        const btn = document.createElement("a")
        btn.classList.add("way-version-view")
        btn.textContent = "📥"
        btn.style.cursor = "pointer"
        btn.setAttribute("way-version", version)
        // fixme mouseenter должен начинать загрузку в фоне
        // но только при клике должна начинаться анимация
        btn.addEventListener("mouseenter", loadWayVersion, {
            once: true,
        })
        i.after(btn)
        i.after(document.createTextNode("\xA0"))
    })

    if (!document.getElementById("download-all-versions-btn")) {
        const downloadAllVersionsBtn = document.createElement("a")
        downloadAllVersionsBtn.id = "download-all-versions-btn"
        downloadAllVersionsBtn.tabIndex = 0
        downloadAllVersionsBtn.textContent = "⏬"
        downloadAllVersionsBtn.style.cursor = "pointer"
        downloadAllVersionsBtn.title = "Download all versions (with intermediate versions)"
        const clickHandler = async () => {
            downloadAllVersionsBtn.style.cursor = "progress"
            await unrollPaginationInHistory()
            for (const i of document.querySelectorAll(`.way-version-view:not([hidden])`)) {
                try {
                    await loadWayVersion(i)
                } catch (e) {
                    console.error(e)
                    console.log("redacted version")
                }
            }
            if (GM_config.get("FullVersionsDiff")) {
                console.time("full history")
                addQuickLookStyles()
                await showFullWayHistory(wayID)
                console.timeEnd("full history")
            }
        }
        downloadAllVersionsBtn.addEventListener("click", clickHandler, { once: true })
        downloadAllVersionsBtn.addEventListener("keypress", clickHandler, { once: true })
        document.querySelector(".compact-toggle-btn")?.after(downloadAllVersionsBtn)
        document.querySelector(".compact-toggle-btn")?.after(document.createTextNode("\xA0"))
    }
}

//<editor-fold desc="relation types">
/**
 * @typedef {Object} RelationMember
 * @property {number} ref
 * @property {'node'|'way'|'relation'} type
 * @property {string} role
 */

/**
 * @typedef {Object} ExtendedRelationNodeMember
 * @property {number} ref
 * @property {'node'} type
 * @property {string} role
 * @property {number} lat
 * @property {number} lon
 */

/**
 * @typedef {Object} ExtendedRelationWayMember
 * @property {number} ref
 * @property {'way'} type
 * @property {string} role
 * @property {LatLon[]} geometry
 */

// TODO ExtendedRelationRelationMember

/**
 * @typedef {ExtendedRelationNodeMember|ExtendedRelationWayMember} ExtendedRelationMember
 */

/**
 * @typedef {Object} RelationVersion
 * @property {number} id
 * @property {number} changeset
 * @property {number} uid
 * @property {string} user
 * @property {RelationMember[]} members
 * @property {number} version
 * @property {boolean} visible
 * @property {string} timestamp
 * @property {'relation'} type
 * @property {Object.<string, string>=} tags
 */

/**
 * @typedef {Object} ExtendedRelationVersion
 * @property {number} id
 * @property {number} changeset
 * @property {number} uid
 * @property {string} user
 * @property {ExtendedRelationMember[]} members
 * @property {number} version
 * @property {boolean} visible
 * @property {string} timestamp
 * @property {'relation'} type
 * @property {Object.<string, string>=} tags
 */

//</editor-fold>

/**
 * @typedef {RelationVersion[]} RelationHistory
 * @property {unique symbol} __brand_relation_history
 */

/**
 * @param {number|string} relationID
 * @return {Promise<RelationHistory>}
 */
async function getRelationHistory(relationID) {
    if (relationsHistories[relationID]) {
        return relationsHistories[relationID]
    } else {
        const res = await fetchRetry(osm_server.apiBase + "relation" + "/" + relationID + "/history.json")
        return (relationsHistories[relationID] = (await res.json()).elements)
    }
}

/**
 * @typedef {[number, number]} LatLonPair
 */

/**
 * @typedef {{lat: number, lon: number}} LatLon
 */

/**
 * @typedef {WayVersion & {geometry: LatLon[]}} ExtendedWayVersion
 */

const overpassCache = {}

/**
 * @typedef {{
 *   min_lat: number,
 *   min_lon: number,
 *   max_lat: number,
 *   max_lon: number,
 * }} BBOX
 */

/**
 * @typedef {{
 *   geom: LatLonPair[][],
 *   bbox: BBOX,
 *   isRestriction: boolean,
 *   restrictionRelationErrors: string[]
 * }} CachedRelation
 */

/**
 * @type {Object.<*, CachedRelation>}
 */
const cachedRelations = {}

/**
 *
 * @param {number} id
 * @param {string} timestamp
 * @param {boolean=true} cleanPrevObjects=true
 * @param {string=} color=
 * @param {string=} layer=
 * @param {boolean=} addStroke
 * @return {Promise<CachedRelation>}
 */
async function loadRelationVersionMembersViaOverpass(id, timestamp, cleanPrevObjects = true, color = "#000000", layer = "activeObjects", addStroke = null) {
    console.time(`Render ${id} relation`)
    console.log(id, timestamp)

    /**
     * @param id
     * @param timestamp
     * @return {Promise<{
     *   elements: (ExtendedRelationVersion)[]
     * }>}
     */
    async function getRelationViaOverpass(id, timestamp) {
        if (overpassCache[[id, timestamp]]) {
            return overpassCache[[id, timestamp]]
        } else {
            const res = await externalFetchRetry({
                url:
                    `${overpass_server.apiUrl}/interpreter?` +
                    new URLSearchParams({
                        data: `
                            [out:json][date:"${timestamp}"];
                            relation(${id});
                            //(._;>;);
                            out geom;
                        `,
                    }),
                responseType: "json",
            })
            return (overpassCache[[id, timestamp]] = res.response)
        }
    }

    const overpassGeom = await getRelationViaOverpass(id, timestamp)
    console.log("Data downloaded")
    if (cleanPrevObjects) {
        cleanCustomObjects()
    }
    cleanObjectsByKey("activeObjects")
    if (!layers[layer]) {
        layers[layer] = []
    }

    /**
     * @param overpassGeom
     * @return {{bbox: BBOX, nodesBbox: BBOX}}
     */
    function getBbox(overpassGeom) {
        /** @type {{bbox: BBOX, nodesBbox: BBOX}} */
        const relationInfo = {
            // prettier-ignore
            bbox:      { min_lat: 10000000, min_lon: 10000000, max_lat: -10000000, max_lon: -100000000 },
            nodesBbox: { min_lat: 10000000, min_lon: 10000000, max_lat: -10000000, max_lon: -100000000 },
        }

        const nodesBag = []
        overpassGeom.elements[0]?.members?.forEach(i => {
            if (i.type === "way") {
                nodesBag.push(
                    ...i.geometry.map(p => {
                        return { lat: p.lat, lon: p.lon }
                    }),
                )
            } else if (i.type === "node") {
                nodesBag.push({ lat: i.lat, lon: i.lon })
            } else {
                // ну нинада пожалуйста
            }
        })

        overpassGeom.elements[0]?.members?.forEach(i => {
            if (i.type === "node" && i?.lat) {
                relationInfo.nodesBbox.min_lat = min(relationInfo.nodesBbox.min_lat, i.lat)
                relationInfo.nodesBbox.min_lon = min(relationInfo.nodesBbox.min_lon, i.lon)
                relationInfo.nodesBbox.max_lat = max(relationInfo.nodesBbox.max_lat, i.lat)
                relationInfo.nodesBbox.max_lon = max(relationInfo.nodesBbox.max_lon, i.lon)
            }
        })

        for (const i of nodesBag) {
            if (i?.lat) {
                relationInfo.bbox.min_lat = min(relationInfo.bbox.min_lat, i.lat)
                relationInfo.bbox.min_lon = min(relationInfo.bbox.min_lon, i.lon)
                relationInfo.bbox.max_lat = max(relationInfo.bbox.max_lat, i.lat)
                relationInfo.bbox.max_lon = max(relationInfo.bbox.max_lon, i.lon)
            }
        }
        return relationInfo
    }

    // GC больно, постоянно передавать в контекст страницы больно
    let cache = /** @type {CachedRelation} */ cachedRelations[[id, timestamp]]
    if (!cache) {
        let wayCounts = 0
        /** @type {LatLonPair[][]} */
        const mergedGeometry = []
        overpassGeom.elements[0]?.members?.forEach(i => {
            if (i.type === "way") {
                const w = /** @type {ExtendedWayVersion} */ i
                wayCounts++
                if (w.geometry === undefined || !w.geometry.length) {
                    return
                }
                const nodesList = w.geometry.map(p => [p.lat, p.lon])
                if (mergedGeometry.length === 0) {
                    mergedGeometry.push(nodesList)
                } else {
                    const lastWay = mergedGeometry[mergedGeometry.length - 1]
                    const [lastLat, lastLon] = lastWay[lastWay.length - 1]
                    if (lastLat === nodesList[0][0] && lastLon === nodesList[0][1]) {
                        mergedGeometry[mergedGeometry.length - 1].push(...nodesList.slice(1))
                    } else {
                        mergedGeometry.push(nodesList)
                    }
                }
            } else if (i.type === "node") {
                showNodeMarker(i.lat, i.lon, color, null, layer)
            } else if (i.type === "relation") {
                // todo
            }
        })
        const isRestriction = isRestrictionObj(overpassGeom.elements?.[0]?.tags ?? {})
        const { bbox, nodesBbox } = getBbox(overpassGeom)
        cache = cachedRelations[[id, timestamp]] = {
            geom: mergedGeometry.map(i => intoPage(i)),
            bbox: bbox,
            nodesBbox: nodesBbox,
            isRestriction: isRestriction,
            restrictionRelationErrors: isRestriction ? validateRestriction(overpassGeom.elements[0]) : [],
        }
        console.log(`${cache.length}/${wayCounts} for render`)
    } else {
        overpassGeom.elements[0]?.members?.forEach(i => {
            if (i.type === "node") {
                showNodeMarker(i.lat, i.lon, color, null, layer)
            }
        })
    }

    cache.geom.forEach(nodesList => {
        displayWay(nodesList, false, color, 4, null, layer, null, null, addStroke, true)
    })

    if (cache.isRestriction && cache.restrictionRelationErrors.length === 0) {
        renderRestriction(overpassGeom.elements[0], restrictionColors[overpassGeom.elements[0].tags["restriction"]] ?? color, layer)
    }

    console.timeEnd(`Render ${id} relation`)

    console.log("relation loaded")
    return cache
}

async function getNodeViaOverpassXML(id, timestamp) {
    const res = await externalFetchRetry({
        url:
            `${overpass_server.apiUrl}/interpreter?` +
            new URLSearchParams({
                data: `
                [out:xml][date:"${timestamp}"];
                node(${id});
                out meta;
            `,
            }),
        responseType: "xml",
    })
    if (res.status !== 200) {
        console.trace(res)
    }
    return new DOMParser().parseFromString(res.response, "text/xml").querySelector("node")
}

async function getWayViaOverpassXML(id, timestamp) {
    const res = await externalFetchRetry({
        url:
            `${overpass_server.apiUrl}/interpreter?` +
            new URLSearchParams({
                data: `
                [out:xml][date:"${timestamp}"];
                way(${id});
                //(._;>;);
                out meta;
            `,
            }),
        responseType: "xml",
    })
    if (res.status !== 200) {
        console.trace(res)
    }
    return new DOMParser().parseFromString(res.response, "text/xml").querySelector("way")
}

async function getRelationViaOverpassXML(id, timestamp) {
    const res = await externalFetchRetry({
        url:
            `${overpass_server.apiUrl}/interpreter?` +
            new URLSearchParams({
                data: `
                [out:xml][date:"${timestamp}"];
                relation(${id});
                //(._;>;);
                out meta;
            `,
            }),
        responseType: "xml",
    })
    if (res.status !== 200) {
        console.trace(res)
    }
    return new DOMParser().parseFromString(res.response, "text/xml").querySelector("relation")
}

/**
 * @typedef {NodeVersion[]} NodesBag
 * @property {unique symbol} __brand_nodes_bag
 */

/**
 * @typedef {{
 * nodes: NodeHistory[],
 * ways: [WayVersion, WayHistory, NodeHistory[]][],
 * relations: RelationHistory[]
 * }} RelationMembersVersions
 */

/**
 * Возвращает нужную версию
 * + точки на момент версии
 * + версию линии на момент версии со все необходимые историями точек в линиях
 * @param {string|number} relationID
 * @param {number} version
 * @throws {string}
 * @returns {Promise<{
 * targetVersion: RelationVersion,
 * membersHistory: RelationMembersVersions
 * }>}
 */
async function loadRelationVersionMembers(relationID, version) {
    console.debug("Loading relation", relationID, version)
    const relationHistory = await getRelationHistory(relationID)

    const targetVersion = relationHistory.filter(v => v.version === version)[0]
    if (!targetVersion) {
        throw `loadRelationVersionMembers failed ${relationID}, ${version}`
    }

    /**
     * @type {{
     * nodes: NodeHistory[],
     * ways: [WayVersion, WayHistory, NodeHistory[]][]|Promise<[WayVersion, WayHistory, NodeHistory[]]>[],
     * relations: [RelationVersion, RelationHistory[]]
     * }}
     */
    const membersHistory = {
        nodes: [],
        ways: [],
        relations: [],
    }
    for (const member of targetVersion.members ?? []) {
        if (member.type === "node") {
            membersHistory.nodes.push(await getNodeHistory(member.ref))
        } else if (member.type === "way") {
            async function loadWay() {
                const wayHistory = await getWayHistory(member.ref)
                const targetTime = new Date(targetVersion.timestamp)
                let targetWayVersion = wayHistory[0]
                wayHistory.forEach(history => {
                    if (new Date(history.timestamp) <= targetTime) {
                        targetWayVersion = history
                    }
                })
                const [target, nodes] = await loadWayVersionNodes(member.ref, targetWayVersion.version)
                return [target, wayHistory, nodes]
            }
            membersHistory.ways.push(loadWay())
        } else if (member.type === "relation") {
            // TODO может нинада? :(
            const relationHistory = await getRelationHistory(member.ref)
            const targetTime = new Date(targetVersion.timestamp)
            let targetRelationVersion = relationHistory[0]
            relationHistory.forEach(history => {
                if (new Date(history.timestamp) <= targetTime) {
                    targetRelationVersion = history
                }
            })
            // todo рекурсивный вызов + защита от зацикливания
            // fixme targetRelationVersion может быть другим из-за редакшнов
            membersHistory.relations.push([targetRelationVersion, relationHistory])
        }
    }
    membersHistory.ways = await Promise.all(membersHistory.ways)
    return { targetVersion: targetVersion, membersHistory: membersHistory }
}

/**
 * @param btn {HTMLElement}
 * @param relationID {number}
 * @return {Promise<void>}
 */
async function replaceDownloadRelationButton(btn, relationID) {
    const objectsBag = await sortRelationMembersByTimestamp(relationID)
    const changesetsSet = new Set()
    objectsBag.forEach(o => changesetsSet.add(o.changeset))
    console.log("uniq changesets in versions:", changesetsSet.size)
    await Promise.all(arraySplit(Array.from(changesetsSet).filter(ch => !changesetMetadatas[ch])).map(it => loadChangesetMetadatas(it)))

    /** @type {Object<number, RelationVersion>} */
    const relationVersionsIndex = makeObjectVersionsIndex(await getRelationHistory(relationID))
    /** @type {Object.<string, NodeVersion|WayVersion|RelationVersion>}*/
    const objectStates = {}
    /** @type {Object.<string, [string, NodeVersion|WayVersion|RelationVersion, NodeVersion|WayVersion|RelationVersion]>} */
    let currentChanges = {}

    /**
     * @param {string} key
     * @param {NodeVersion|WayVersion|RelationVersion} newVersion
     */
    function storeChanges(key, newVersion) {
        const prev = objectStates[key]
        if (prev === undefined) {
            currentChanges[key] = ["new", prev, newVersion]
        } else {
            if (newVersion.type !== "node") {
                if (newVersion.type === "way") {
                    if (nodesChanged(prev, newVersion)) {
                        currentChanges[key] = ["nodes", prev, newVersion]
                    } else {
                        currentChanges[key] = ["", prev, newVersion]
                    }
                } else {
                    if (membersChanged(prev, newVersion)) {
                        currentChanges[key] = ["members", prev, newVersion]
                    } else {
                        currentChanges[key] = ["", prev, newVersion]
                    }
                }
                // debugger // todo
            } else if (locationChanged(prev, newVersion) && tagsChanged(prev, newVersion)) {
                currentChanges[key] = ["new", prev, newVersion]
            } else if (locationChanged(prev, newVersion)) {
                currentChanges[key] = ["location", prev, newVersion]
            } else if (tagsChanged(prev, newVersion)) {
                currentChanges[key] = ["tags", prev, newVersion]
            } else {
                currentChanges[key] = ["", prev, newVersion]
            }
        }
    }

    /** @type {number|null} */
    let currentChangeset = null
    /** @type {string|null} */
    let currentUser = null
    /** @type {string|null} */
    let currentTimestamp = null
    /** @type {RelationVersion} */
    let currentRelationVersion = { version: 0, members: [] }
    /** @type {Set<string>} */
    let currentRelationObjectsSet = new Set()

    function makeInterRelationVersionHeader() {
        const interVersionDivHeader = document.createElement("h4")
        const interVersionDivAbbr = document.createElement("abbr")
        interVersionDivAbbr.textContent = ["ru-RU", "ru"].includes(navigator.language) ? "Промежуточная версия" : "Intermediate version"
        interVersionDivAbbr.title = ["ru-RU", "ru"].includes(navigator.language)
            ? "Произошли изменения тегов или координат точек в отношении,\nкоторые не увеличили версию отношении"
            : "There have been changes to the tags or coordinates of nodes in the relation that have not increased the relation version"
        interVersionDivHeader.appendChild(interVersionDivAbbr)
        return interVersionDivHeader
    }

    function renderInterVersion() {
        /** @type {(NodeVersion|WayVersion|RelationVersion)[]}*/
        const currentMembers = []
        /** @type {Object.<string, NodesBag>} */
        const currentWaysNodes = {}

        relationVersionsIndex[currentRelationVersion.version].members.forEach(member => {
            const uniq_key = `${member.type} ${member.ref}`
            currentMembers.push(objectStates[uniq_key])
            if (member.type === "way") {
                currentWaysNodes[member.ref] = cloneInto(
                    objectStates[uniq_key].nodes.map(n => {
                        const objectState = objectStates[`node ${n}`]
                        if (!objectState) {
                            console.trace("not found node", n)
                        }
                        return objectState
                    }),
                    unsafeWindow,
                )
            }
            if (currentChanges[uniq_key] !== undefined) return
            const curV = objectStates[uniq_key]
            if (curV) {
                currentChanges[uniq_key] = ["", curV, curV]
            } else {
                console.warn(`${uniq_key} not found in states`)
            }
        })

        const interVersionDiv = document.createElement("div")
        interVersionDiv.setAttribute("relation-version", "inter")
        interVersionDiv.classList.add("mb-3", "border-bottom", "border-secondary-subtle", "pb-3", "browse-section")

        const interVersionDivHeader = makeInterRelationVersionHeader()
        interVersionDiv.appendChild(interVersionDivHeader)

        const p = document.createElement("p")
        interVersionDiv.appendChild(p)
        loadChangesetMetadata(currentChangeset).then(ch => {
            p.textContent = shortOsmOrgLinksInText(ch.tags["comment"] ?? "")
        })

        interVersionDiv.appendChild(makeVersionUl(currentTimestamp, currentUser, currentChangeset))

        const membersDetails = document.createElement("details")
        membersDetails.classList.add("way-version-nodes")
        membersDetails.onclick = e => {
            e.stopImmediatePropagation()
        }
        const summary = document.createElement("summary")
        summary.textContent = currentMembers.length
        summary.classList.add("history-diff-modified-tag")
        membersDetails.appendChild(summary)
        const ulMembers = document.createElement("ul")
        ulMembers.classList.add("list-unstyled")
        currentMembers.forEach(i => {
            if (i === undefined) {
                console.trace()
                console.log(currentMembers)
                btn.style.background = "yellow"
                btn.title = "Some members was hidden by moderators"
                return
            }
            const memberLi = document.createElement("li")
            const div = document.createElement("div")
            div.classList.add("d-flex", "gap-1")
            const div2 = document.createElement("div")
            div2.classList.add("align-self-center")
            div.appendChild(div2)

            const aHistory = document.createElement("a")
            aHistory.classList.add(i.type)
            aHistory.href = `/${i.type}/${i.id}/history`
            aHistory.textContent = i.id
            div2.appendChild(aHistory)

            div2.appendChild(document.createTextNode(", "))

            const aVersion = document.createElement("a")
            aVersion.classList.add(i.type)
            aVersion.href = `/${i.type}/${i.id}/history/${i.version}`
            aVersion.textContent = "v" + i.version
            div2.appendChild(aVersion)
            memberLi.appendChild(div)

            // const curChange = currentChanges[`${i.type} ${i.id}`]
            // const memberHistory = histories[i.type][i.id]
            // const tagsTable = processObject(div2, i.type, curChange[1] ?? curChange[2], curChange[2], memberHistory[memberHistory.length - 1], memberHistory)
            // setTimeout(async () => {
            //     await processObjectInteractions("", i.type, { nodes: [], ways: [], relations: [] }, div2, ...getPrevTargetLastVersions(...(await getHistoryAndVersionByElem(div2))))
            // }, 0)
            // tagsTable.then(table => {
            //     if (memberLi.classList.contains("tags-non-modified")) {
            //         div2.appendChild(table)
            //     }
            // table.style.borderColor = "var(--bs-body-color)";
            // table.style.borderStyle = "solid";
            // table.style.borderWidth = "1px";
            // })
            ulMembers.appendChild(memberLi)
        })
        membersDetails.appendChild(ulMembers)
        interVersionDiv.appendChild(membersDetails)

        const tmpChangedNodes = Object.values(currentChanges).filter(i => i[2].type === "node")
        if (tmpChangedNodes.every(i => i[0] === "tags")) {
            interVersionDiv.classList.add("only-tags-changed")
        }
        const changedNodes = tmpChangedNodes.filter(i => i[0] !== "location") // fixme members lists changes
        interVersionDiv.onmouseenter = () => {
            resetMapHover()
            cleanAllObjects()
            currentMembers.forEach(member => {
                if (member.type === "way") {
                    const color = "#000000"
                    displayWay(currentWaysNodes[member.id], false, color, 4, null, "customObjects", null, null, darkModeForMap && isDarkMode(), true)
                }
            })
            currentMembers.forEach(member => {
                if (member.type !== "node") {
                    return
                }
                if (member.tags && Object.keys(member.tags).filter(k => k !== "created_by" && k !== "source").length > 0) {
                    showNodeMarker(member.lat.toString(), member.lon.toString(), "rgb(161,161,161)", null, "customObjects", 3)
                }
            })
            changedNodes.forEach(i => {
                if (i[0] === "") return
                if (i[2].visible === false) {
                    if (i[1].visible !== false) {
                        showNodeMarker(i[1].lat.toString(), i[1].lon.toString(), "#ff0000", null, "customObjects", 3)
                    }
                } else if (i[0] === "new") {
                    if (i[2].tags && Object.keys(i[2].tags).filter(k => k !== "created_by" && k !== "source").length > 0) {
                        showNodeMarker(i[2].lat.toString(), i[2].lon.toString(), "#00a500", null, "customObjects", 3)
                    }
                    showNodeMarker(i[2].lat.toString(), i[2].lon.toString(), "#00a500", null, "customObjects", 3)
                } else {
                    showNodeMarker(i[2].lat.toString(), i[2].lon.toString(), "rgb(255,245,41)", null, "customObjects", 3)
                }
            })
        }
        interVersionDiv.onclick = e => {
            resetMapHover()
            cleanAllObjects()
            currentMembers.forEach(member => {
                if (member.type === "way") {
                    displayWay(currentWaysNodes[member.id], false, "#000000", 4, null, "customObjects", null, null, darkModeForMap && isDarkMode(), true)
                }
            })
            currentMembers.forEach(member => {
                if (member.type !== "node") {
                    return
                }
                if (member.tags && Object.keys(member.tags).filter(k => k !== "created_by" && k !== "source").length > 0) {
                    showNodeMarker(member.lat.toString(), member.lon.toString(), "rgb(161,161,161)", null, "customObjects", 3)
                }
            })
            changedNodes.forEach(i => {
                if (i[0] === "") return
                if (i[2].visible === false) {
                    if (i[1].visible !== false) {
                        showNodeMarker(i[1].lat.toString(), i[1].lon.toString(), "#ff0000", null, "customObjects", 3)
                    }
                } else if (i[0] === "new") {
                    if (i[2].tags && Object.keys(i[2].tags).filter(k => k !== "created_by" && k !== "source").length > 0) {
                        showNodeMarker(i[2].lat.toString(), i[2].lon.toString(), "#00a500", null, "customObjects", 3)
                    }
                    showNodeMarker(i[2].lat.toString(), i[2].lon.toString(), "#00a500", null, "customObjects", 3)
                } else {
                    showNodeMarker(i[2].lat.toString(), i[2].lon.toString(), "rgb(255,245,41)", null, "customObjects", 3)
                }
            })
        }
        // fixme slow selector too much object
        let insertBeforeThat = document.querySelector(`#element_versions_list > :where(div, details)[relation-version="${currentRelationVersion.version}"]`)
        while (insertBeforeThat.previousElementSibling?.getAttribute("relation-version") === "inter") {
            // fixme O(n^2)
            insertBeforeThat = insertBeforeThat.previousElementSibling
        }
        insertBeforeThat.before(interVersionDiv)
    }

    function replaceRelationVersion(it) {
        let divForMembersReplace = document.querySelector(`#element_versions_list > :where(div, details)[relation-version="${it.version}"]`)
        if (Object.keys(currentChanges).length > 1 && divForMembersReplace.classList?.contains("empty-version")) {
            divForMembersReplace.querySelector("summary")?.remove()
            const div = document.createElement("div")
            div.innerHTML = divForMembersReplace.innerHTML
            div.setAttribute("relation-version", divForMembersReplace.getAttribute("relation-version"))
            divForMembersReplace.replaceWith(div)
            divForMembersReplace = div
        }
        currentRelationVersion = it
        currentRelationObjectsSet = new Set()
        currentRelationVersion.members?.forEach(member => {
            const uniq_key = `${member.type} ${member.ref}`
            currentRelationObjectsSet.add(uniq_key)
            if (member.type === "way") {
                objectStates[uniq_key].nodes.forEach(nodeID => currentRelationObjectsSet.add(`node ${nodeID}`))
            } else if (member.type === "relation") {
                objectStates[uniq_key].members.forEach(member => currentRelationObjectsSet.add(`${member.type} ${member.ref}`))
                // todo rec
            }
            if (currentChanges[uniq_key] === undefined) {
                const curV = objectStates[uniq_key]
                if (curV) {
                    if (curV.version === 1 && currentRelationVersion.changeset === curV.changeset) {
                        currentChanges[uniq_key] = ["new", emptyVersion, curV]
                    } else {
                        currentChanges[uniq_key] = ["", curV, curV]
                    }
                } else {
                    console.warn(`${uniq_key} not found in states`)
                }
            }
        })
        if (divForMembersReplace && currentRelationVersion.members) {
            /** @type {[HTMLImageElement, (NodeVersion|WayVersion|RelationVersion)][]}*/
            const currentMembers = []
            const ulMembers = divForMembersReplace.querySelector("details:not(.empty-version) ul")
            ulMembers.parentElement.classList.add("way-version-nodes")
            ulMembers.querySelectorAll("li").forEach(li => {
                li.style.display = "none"
                const [, type, id] = li.querySelector("div div a").href.match(/(node|way|relation)\/(\d+)/)
                currentMembers.push([li.querySelector("img"), objectStates[`${type} ${id}`]])
            })
            if (it.version !== 1) {
                const changedNodes = Object.values(currentChanges).filter(i => i[2].type === "node" && i[0] !== "location" && i[0] !== "")
                document.querySelector(`#element_versions_list > div[relation-version="${it.version}"]`)?.addEventListener("mouseenter", () => {
                    changedNodes.forEach(i => {
                        if (i[2].visible === false) {
                            if (i[1].visible !== false) {
                                showNodeMarker(i[1].lat.toString(), i[1].lon.toString(), "#ff0000", null, "customObjects", 3)
                            }
                        } else if (i[0] === "new") {
                            if (i[2].tags && Object.keys(i[2].tags).filter(k => k !== "created_by" && k !== "source").length > 0) {
                                showNodeMarker(i[2].lat.toString(), i[2].lon.toString(), "#00a500", null, "customObjects", 3)
                            }
                            showNodeMarker(i[2].lat.toString(), i[2].lon.toString(), "#00a500", null, "customObjects", 3)
                        } else {
                            showNodeMarker(i[2].lat.toString(), i[2].lon.toString(), "rgb(255,245,41)", null, "customObjects", 3)
                        }
                    })
                })
                document.querySelector(`#element_versions_list > div[relation-version="${it.version}"]`)?.addEventListener("click", () => {
                    changedNodes.forEach(i => {
                        if (i[2].visible === false) {
                            if (i[1].visible !== false) {
                                showNodeMarker(i[1].lat.toString(), i[1].lon.toString(), "#ff0000", null, "customObjects", 3)
                            }
                        } else if (i[0] === "new") {
                            if (i[2].tags && Object.keys(i[2].tags).filter(k => k !== "created_by" && k !== "source").length > 0) {
                                showNodeMarker(i[2].lat.toString(), i[2].lon.toString(), "#00a500", null, "customObjects", 3)
                            }
                            showNodeMarker(i[2].lat.toString(), i[2].lon.toString(), "#00a500", null, "customObjects", 3)
                        } else {
                            showNodeMarker(i[2].lat.toString(), i[2].lon.toString(), "rgb(255,245,41)", null, "customObjects", 3)
                        }
                    })
                })
            }
            currentMembers.forEach(([img, i]) => {
                if (i === undefined) {
                    console.trace()
                    console.log(currentMembers)
                    btn.style.background = "yellow"
                    btn.title = "Please try reload page.\nIf the error persists, a message about it in the better-osm-org repository"
                    divForMembersReplace.classList.add("broken-version")
                    divForMembersReplace.title = "Some nodes was hidden by moderators :\\"
                    divForMembersReplace.style.cursor = "auto"
                    return
                }
                const memberLi = document.createElement("li")
                const div = document.createElement("div")
                div.classList.add("d-flex", "gap-1")
                const div2 = document.createElement("div")
                div2.classList.add("align-self-center")
                div.appendChild(div2)

                div2.before(img.cloneNode(true))

                const aHistory = document.createElement("a")
                aHistory.classList.add(i.type)
                aHistory.href = `/${i.type}/${i.id}/history`
                aHistory.textContent = i.id
                div2.appendChild(aHistory)
                memberLi.appendChild(div)

                div2.appendChild(document.createTextNode(", "))

                const aVersion = document.createElement("a")
                aVersion.classList.add(i.type)
                aVersion.href = `/${i.type}/${i.id}/history/${i.version}`
                aVersion.textContent = "v" + i.version
                div2.appendChild(aVersion)
                memberLi.appendChild(div)

                const curChange = currentChanges[`${i.type} ${i.id}`]
                const memberHistory = histories[i.type][i.id]
                // todo нужна предзагрузка пакетов правок, потому что теперь рендерятся и линии
                const tagsTable = processObject(div2, i.type, curChange[1] ?? curChange[2], curChange[2], memberHistory[memberHistory.length - 1], memberHistory)
                setTimeout(async () => {
                    await processObjectInteractions(
                        "",
                        i.type,
                        {
                            nodes: [],
                            ways: [],
                            relations: [],
                        },
                        div2,
                        ...getPrevTargetLastVersions(...(await getHistoryAndVersionByElem(div2))),
                    )
                }, 0)
                tagsTable.then(table => {
                    if (memberLi.classList.contains("tags-non-modified")) {
                        div2.appendChild(table)
                    }
                    //                            table.style.borderColor = "var(--bs-body-color)";
                    //                             table.style.borderStyle = "solid";
                    //                             table.style.borderWidth = "1px";
                })
                ulMembers.appendChild(memberLi)
            })
        }
        currentChanges = {}
        currentChangeset = null
    }

    for (const it of objectsBag) {
        // debugger
        // console.debug(it)
        const uniq_key = `${it.type} ${it.id}`

        if ((it.type === "node" || it.type === "way") && currentRelationVersion.version > 0 && !currentRelationObjectsSet.has(uniq_key)) {
            objectStates[uniq_key] = it
            continue
        }
        if (it.type === "way") {
            // debugger
        } else if (it.type === "relation") {
            // debugger
        }
        if (it.changeset === currentChangeset) {
            storeChanges(uniq_key, it) // todo split if new way version
        } else if (currentChangeset === null) {
            currentChangeset = it.changeset
            currentUser = it.user
            currentTimestamp = it.timestamp
            storeChanges(uniq_key, it)
        } else {
            if (currentRelationVersion.version !== 0) {
                renderInterVersion()
            }
            currentChanges = {}
            storeChanges(uniq_key, it)
            currentChangeset = it.changeset
            currentUser = it.user
            currentTimestamp = it.timestamp
        }
        objectStates[uniq_key] = it
        // для настоящей версии линии
        if (it.type === "relation") {
            replaceRelationVersion(it)
        }
    }
    if (Object.entries(currentChanges).length) {
        renderInterVersion()
    }
    document.querySelector("#sidebar_content h2").addEventListener(
        "mouseleave",
        () => {
            document.querySelector("#sidebar_content h2").onmouseenter = () => {
                cleanAllObjects()
            }
        },
        {
            once: true,
        },
    )
    // making version filter
    if (document.querySelectorAll('[relation-version="inter"]').length > 20) {
        const select = document.createElement("select")
        select.id = "versions-filter"
        select.title = "Filter for intermediate changes"

        const allVersions = document.createElement("option")
        allVersions.value = "all-versions"
        allVersions.textContent = ["ru-RU", "ru"].includes(navigator.language) ? "Все версии" : "All versions"
        select.appendChild(allVersions)

        const withGeom = document.createElement("option")
        withGeom.value = "with-geom"
        withGeom.textContent = ["ru-RU", "ru"].includes(navigator.language) ? "Все изменения геометрии" : "With geometry changes"
        withGeom.setAttribute("selected", "selected")
        select.appendChild(withGeom)

        const withoutInter = document.createElement("option")
        withoutInter.value = "without-inter"
        withoutInter.textContent = ["ru-RU", "ru"].includes(navigator.language) ? "Без промежуточных" : "Without intermediate"
        select.appendChild(withoutInter)

        select.onchange = e => {
            if (e.target.value === "all-versions") {
                document.querySelectorAll('[relation-version="inter"]').forEach(i => {
                    i.removeAttribute("hidden")
                })
            } else if (e.target.value === "with-geom") {
                document.querySelectorAll('.only-tags-changed[relation-version="inter"]').forEach(i => {
                    i.setAttribute("hidden", "true")
                })
                document.querySelectorAll('[relation-version="inter"]:not(.only-tags-changed)').forEach(i => {
                    i.removeAttribute("hidden")
                })
            } else if (e.target.value === "without-inter") {
                document.querySelectorAll('[relation-version="inter"]').forEach(i => {
                    i.setAttribute("hidden", "true")
                })
            }
        }
        document.querySelectorAll('.only-tags-changed[relation-version="inter"]').forEach(i => {
            i.setAttribute("hidden", "true")
        })
        btn.after(select)
    }
    btn.remove()
}

/**
 * @param relationID {number}
 * @return {Promise<void>}
 */
async function showFullRelationHistory(relationID) {
    const btn = document.querySelector("#download-all-versions-btn")
    try {
        await replaceDownloadRelationButton(btn, relationID)
    } catch (err) {
        console.error(err)
        btn.title = "Please try reload page.\nIf the error persists, a message about it in the better-osm-org repository"
        btn.style.background = "red"
        btn.style.cursor = "auto"
    }
}

function setupRelationVersionView() {
    const match = location.pathname.match(/\/relation\/(\d+)\//)
    if (match === null) return
    const relationID = match[1]

    async function loadRelationVersion(e, showWay = true) {
        // TODO fly?
        const htmlElem = e.target ? e.target : e
        htmlElem.style.cursor = "progress"

        const version = parseInt(htmlElem.getAttribute("relation-version"))
        console.time(`r${relationID} v${version}`)
        // debugger
        const { targetVersion: targetVersion, membersHistory: membersHistory } = await loadRelationVersionMembers(relationID, version)
        console.timeEnd(`r${relationID} v${version}`)
        if (showWay) {
            cleanCustomObjects()
            let hasBrokenMembers = false
            const nodes = []
            membersHistory.nodes.forEach(nodeHistory => {
                const targetTime = new Date(targetVersion.timestamp)
                /** @type {NodeVersion} */
                let targetNodeVersion = nodeHistory[0]
                nodeHistory.forEach(history => {
                    if (new Date(history.timestamp) <= targetTime) {
                        targetNodeVersion = history
                    }
                })
                nodes.push(targetNodeVersion)
            })
            nodes.forEach(n => {
                showNodeMarker(n.lat, n.lon, "#000")
            })
            membersHistory.ways.forEach(([, , nodesVersionsList]) => {
                try {
                    const nodesList = nodesVersionsList.map(n => {
                        const { lat: lat, lon: lon } = searchVersionByTimestamp(n, targetVersion.timestamp)
                        return [lat, lon]
                    })
                    displayWay(nodesList, false, "#000000", 4, null, "customObjects", null, null, darkModeForMap && isDarkMode())
                } catch {
                    hasBrokenMembers = true
                    // TODO highlight in member list
                }
            })
            if (isRestrictionObj(targetVersion.tags ?? {})) {
                /** @type {Object<number, NodeVersion>}}*/
                const nodeIndex = nodes.reduce((acc, n) => {
                    acc[n.id] = n
                    return acc
                }, {})
                /** @type {Object<number, LatLonPair[]>}}*/
                const wayIndex = membersHistory.ways.reduce((acc, w) => {
                    acc[w[0].id] = w[2].map(n => searchVersionByTimestamp(n, targetVersion.timestamp))
                    return acc
                }, {})
                const extendedRelationVersion = targetVersion
                extendedRelationVersion.members = extendedRelationVersion.members.map(mem => {
                    if (mem.type === "node") {
                        mem["lat"] = nodeIndex[mem.ref].lat
                        mem["lon"] = nodeIndex[mem.ref].lon
                        return /** @type {ExtendedRelationNodeMember} */ mem
                    } else if (mem.type === "way") {
                        mem["geometry"] = wayIndex[mem.ref]
                        return /** @type {ExtendedRelationWayMember} */ mem
                    } else if (mem.type === "relation") {
                        // todo
                        return /** @type {ExtendedRelationMember} */ mem
                    }
                })
                const errors = validateRestriction(/** @type {ExtendedRelationVersion} */ extendedRelationVersion)
                if (errors.length) {
                    showRestrictionValidationStatus(errors, document.querySelector("#element_versions_list > div details:last-of-type summary"))
                } else {
                    renderRestriction(/** @type {ExtendedRelationVersion} */ extendedRelationVersion, restrictionColors[extendedRelationVersion.tags["restriction"]] ?? "#000000", "customObjects")
                }
            }
            if (hasBrokenMembers) {
                htmlElem.classList.add("broken-version")
                htmlElem.parentElement.parentElement.classList.add("broken-version")
            }
        }
        if (htmlElem.nodeName === "A") {
            const versionDiv = htmlElem.parentNode.parentNode
            versionDiv.onmouseenter = loadRelationVersion
            versionDiv.onclick = async e => {
                if (e.target.tagName === "A" || e.target.tagName === "TIME" || e.target.tagName === "SUMMARY" || e.target.tagName === "BUTTON") {
                    return
                }
                await loadRelationVersion(versionDiv) // todo params
            }
            versionDiv.setAttribute("relation-version", version.toString())
            htmlElem.style.cursor = "pointer" // todo finally{}
            htmlElem.setAttribute("hidden", "true")
        } else {
            try {
                e.target.style.cursor = "auto"
            } catch {
                e.style.cursor = "auto"
            }
        }
    }

    document.querySelectorAll("#element_versions_list > div h4:nth-of-type(1):not(:has(.relation-version-view)) a:nth-of-type(1)").forEach(i => {
        const version = i.href.match(/\/(\d+)$/)[1]
        const btn = document.createElement("a")
        btn.classList.add("relation-version-view")
        btn.textContent = "📥"
        btn.style.cursor = "pointer"
        btn.setAttribute("relation-version", version)
        btn.addEventListener(
            "mouseenter",
            async e => {
                i.parentElement.parentElement.querySelectorAll(".browse-tag-list tr").forEach(t => {
                    if (t.querySelector("th")?.textContent?.includes("restriction")) {
                        const key = t.querySelector("td")?.textContent
                        if (restrictionsSignImages[key]) {
                            void fetchTextWithCache(restrictionsSignImages[key])
                        }
                    }
                })
                try {
                    await loadRelationVersion(e)
                } catch (e) {
                    btn.textContent = ":("
                    console.error(e)
                }
            },
            {
                once: true,
            },
        )
        i.after(btn)
        i.after(document.createTextNode("\xA0"))
    })

    if (document.querySelectorAll(`.relation-version-view:not([hidden])`).length > 1 && !document.getElementById("download-all-versions-btn")) {
        // todo remove check after when would full history
        const downloadAllVersionsBtn = document.createElement("a")
        downloadAllVersionsBtn.id = "download-all-versions-btn"
        downloadAllVersionsBtn.tabIndex = 0
        downloadAllVersionsBtn.textContent = "⏬"
        downloadAllVersionsBtn.style.cursor = "pointer"
        downloadAllVersionsBtn.title = "Download all versions" // + " (with intermediate versions)"

        const clickHandler = async e => {
            downloadAllVersionsBtn.style.cursor = "progress"
            for (const i of Array.from(document.querySelectorAll(`.relation-version-view:not([hidden])`)).slice(0, -1)) {
                await loadRelationVersion(i)
            }
            await unrollPaginationInHistory()
            for (const i of document.querySelectorAll(`.relation-version-view:not([hidden])`)) {
                await loadRelationVersion(i)
            }
            if (isDebug() && GM_config.get("FullVersionsDiff")) {
                downloadAllVersionsBtn.textContent += " downloading intermediate versions..."
                console.time("full history")
                addQuickLookStyles()
                await showFullRelationHistory(parseInt(relationID))
                console.timeEnd("full history")
            }
            e.target.remove()
        }
        downloadAllVersionsBtn.addEventListener("click", clickHandler, { once: true })
        downloadAllVersionsBtn.addEventListener("keypress", clickHandler, { once: true })
        document.querySelector(".compact-toggle-btn")?.after(downloadAllVersionsBtn)
        document.querySelector(".compact-toggle-btn")?.after(document.createTextNode("\xA0"))
    }
}

const OVERPASS_NEW_ERA_DATE = new Date("2012-09-12T06:55:00Z")

/**
 * @param objID {number|string}
 * @param type {'node'|'way'|'relation'}
 * @return {Promise<NodeListOf<Element>|undefined>}
 */
async function downloadVersionsOfObjectWithRedactionBefore2012(type, objID) {
    if (osm_server !== prod_server) {
        console.warn("Redaction bypass only for main OSM server")
        return
    }
    if (type === "node" && parseInt(objID) > 1331076658) {
        return
    }
    if (type === "way" && parseInt(objID) > 118351431) {
        return
    }
    if (type === "relation" && parseInt(objID) > 1631294) {
        return
    }
    console.debug(`downloadVersionsOfObjectWithRedactionBefore2012 ${type} ${objID}`)
    let id_prefix = objID
    if (type === "node") {
        id_prefix = Math.floor(id_prefix / 10000)
    } else if (type === "way") {
        id_prefix = Math.floor(id_prefix / 1000)
    } else if (type === "relation") {
        id_prefix = Math.floor(id_prefix / 10)
    }

    async function downloadArchiveData(url, objID, needUnzip = false) {
        try {
            const diffGZ = await fetchBlobWithCache(url, {timeout: 10 * 1000})
            const blob = needUnzip ? await decompressBlob(diffGZ.response) : diffGZ.response
            const diffXML = await blob.text()

            const doc = new DOMParser().parseFromString(diffXML, "application/xml")
            return doc.querySelectorAll(`osm [id='${objID}']`) // todo add type
        } catch {
            return
        }
    }

    const urlPrefix = "https://raw.githubusercontent.com/osm-cc-by-sa/data/refs/heads/main/versions_affected_by_disagreed_users_and_all_after_with_redaction_period"
    const url = `${urlPrefix}/${type}/${id_prefix}.osm` + (type === "relation" ? ".gz" : "")
    return await downloadArchiveData(url, objID, type === "relation")
}

async function downloadObjectTimeViaOverpass(type, objID) {
    const query = `
[out:json][timeout:25];
timeline(${type}, ${objID});
for (t["created"])
{
  retro (_.val)
  {
    ${type}(${objID});
    out meta;
  }
}
`
    console.time(`download overpass history data for ${type} ${objID} via timeline`)
    const res = await externalFetchRetry({
        url:
            overpass_server.apiUrl +
            "/interpreter?" +
            new URLSearchParams({
                data: query,
            }),
        responseType: "json",
    })
    return res.response
    console.timeEnd(`download overpass history data for ${type} ${objID} via timeline`)
}

/**
 * @param showUnredactedBtn {HTMLAnchorElement}
 * @return {Promise<void>}
 */
async function restoreObjectHistory(showUnredactedBtn) {
    const m = location.pathname.match(/\/(node|way|relation)\/(\d+)/)
    const type = m[1]
    const objID = parseInt(m[2])
    const data = await downloadVersionsOfObjectWithRedactionBefore2012(type, objID)

    const keysLinks = new Map()
    document.querySelectorAll("#element_versions_list > div table th a").forEach(a => {
        keysLinks.set(a.textContent, a.href)
    })
    const valuesLinks = new Map()
    document.querySelectorAll("#element_versions_list > div table td a").forEach(a => {
        valuesLinks.set(a.textContent, a.href)
    })

    const versionPrefix = document
        .querySelector("#element_versions_list > div h4")
        ?.textContent?.match(/(^.*#)/gms)
        ?.at(0)

    const redactedVersions = Array.from(document.querySelectorAll('#element_versions_list > div:has(a[href*="/redactions/"]:not([rel]))'))

    let versions
    for (const elem of redactedVersions) {
        elem.querySelector(':scope a[href*="/redactions/"]:not([rel])').classList.add("unredacted")
        const version = elem.textContent.match(/(\d+).*(\d+)/)[1]
        console.log(`Processing v${version}`)
        elem.childNodes[0].textContent = elem.childNodes[0].textContent.match(/(\..*$)/gm)[0].slice(1)

        /** @type {NodeVersion|WayVersion|RelationVersion} */
        let target
        try {
            target = convertXmlVersionToObject(Array.from(data).find(i => i.getAttribute("version") === version))
            if (!target) {
                throw "need Overpass"
            }
        } catch {
            if (!versions) {
                versions = makeObjectVersionsIndex((await downloadObjectTimeViaOverpass(type, objID))?.elements ?? [])
            }
            if (versions[version]) {
                target = versions[version]
            }
        }
        if (!target) {
            console.log(`Downloading v${version} via overpass`)
            const prevDatetime = elem.previousElementSibling.querySelector("time").getAttribute(["datetime"])
            const targetDatetime = new Date(new Date(prevDatetime).getTime() - 1).toISOString()
            if (type === "node") {
                target = convertXmlVersionToObject(await getNodeViaOverpassXML(objID, targetDatetime))
            } else if (type === "way") {
                target = convertXmlVersionToObject(await getWayViaOverpassXML(objID, targetDatetime))
            } else if (type === "relation") {
                target = convertXmlVersionToObject(await getRelationViaOverpassXML(objID, targetDatetime))
            }
            if (!target) {
                console.error(`v${version} not founded`, objID, targetDatetime)
                continue
            }
        }
        const h4 = document.createElement("h4")
        h4.textContent = versionPrefix ?? "#"
        const versionLink = document.createElement("a")
        versionLink.textContent = version
        versionLink.href = `/${type}/${objID}/history/${version}`
        h4.appendChild(versionLink)

        const comment = document.createElement("p")
        comment.classList.add("fs-6", "overflow-x-auto")
        setTimeout(async () => {
            const res = await fetchRetry(osm_server.apiBase + "changeset" + "/" + target["changeset"] + ".json")
            const jsonRes = await res.json()
            comment.textContent = jsonRes.tags?.comment
        }, 0)

        const metadataDiv = document.createElement("div")
        metadataDiv.classList.add("mb-3")

        const time = document.createElement("time")
        time.setAttribute("datetime", target["timestamp"])
        time.setAttribute("natural_text", target["timestamp"]) // it should server side string :(
        time.setAttribute("title", target["timestamp"]) // it should server side string :(
        time.textContent = new Date(target["timestamp"]).toISOString().slice(0, -5) + "Z"
        metadataDiv.appendChild(time)
        metadataDiv.appendChild(document.createTextNode(" "))

        const user = document.createElement("a")
        user.href = "/user/" + target["user"]
        user.textContent = target["user"]
        metadataDiv.appendChild(user)

        const changesetSpan = document.createElement("span")
        const changeset = document.createElement("a")
        changeset.href = "/changeset/" + target["changeset"]
        changeset.textContent = target["changeset"]
        changesetSpan.appendChild(document.createTextNode(" #"))
        changesetSpan.appendChild(changeset)
        metadataDiv.appendChild(changesetSpan)

        if (type === "node") {
            const locationDiv = document.createElement("div")
            metadataDiv.appendChild(locationDiv)

            const locationA = document.createElement("a")
            locationA.href = "/#map=18/" + target["lat"] + "/" + target["lon"]

            const latSpan = document.createElement("span")
            latSpan.classList.add("latitude")
            latSpan.textContent = target["lat"]
            locationA.appendChild(latSpan)
            locationA.appendChild(document.createTextNode(", "))

            const lonSpan = document.createElement("span")
            lonSpan.classList.add("longitude")
            lonSpan.textContent = target["lon"]
            locationA.appendChild(lonSpan)

            locationDiv.appendChild(locationA)
        }

        const tags = document.createElement("div")
        tags.classList.add("mb-3", "border", "border-secondary-subtle", "rounded", "overflow-hidden")
        const table = document.createElement("table")
        table.classList.add("mb-0", "browse-tag-list", "table", "align-middle")
        const tbody = document.createElement("tbody")
        table.appendChild(tbody)

        Object.entries(target["tags"] ?? {}).forEach(([k, v]) => {
            const tr = document.createElement("tr")

            const th = document.createElement("th")
            th.classList.add("py-1", "border-secondary-subtle", "table-secondary", "fw-normal", "history-diff-modified-key")
            if (keysLinks.has(k)) {
                const wikiLink = document.createElement("a")
                wikiLink.textContent = k
                wikiLink.href = keysLinks.get(k)
                th.appendChild(wikiLink)
            } else {
                th.textContent = k
            }

            const td = document.createElement("td")
            td.classList.add("py-1", "border-secondary-subtle", "border-start")
            if (valuesLinks.has(v)) {
                const wikiLink = document.createElement("a")
                wikiLink.textContent = v
                wikiLink.href = valuesLinks.get(v)
                td.appendChild(wikiLink)
            } else {
                td.textContent = v
            }

            tr.appendChild(th)
            tr.appendChild(td)
            tbody.appendChild(tr)
        })
        tags.appendChild(table)
        elem.prepend(h4)
        elem.appendChild(comment)
        elem.appendChild(metadataDiv)
        elem.appendChild(tags)

        if (type === "way") {
            const nodesDetails = document.createElement("details")
            const summary = document.createElement("summary")
            summary.textContent = target["nodes"].length
            nodesDetails.appendChild(summary)
            const ulNodes = document.createElement("ul")
            ulNodes.classList.add("list-unstyled")
            target["nodes"]?.forEach(nodeID => {
                const nodeLi = document.createElement("li")
                const a = document.createElement("a")
                a.classList.add("node")
                a.href = "/node/" + nodeID
                a.textContent = nodeID
                nodeLi.appendChild(a)
                ulNodes.appendChild(nodeLi)
            })
            nodesDetails.appendChild(ulNodes)
            elem.appendChild(nodesDetails)
        } else if (type === "relation") {
            const members = Array.from(target["members"])?.map(i => {
                return {
                    ref: i["ref"],
                    type: i["type"],
                    role: i["role"],
                }
            })

            const membersDetails = document.createElement("details")
            const summary = document.createElement("summary")
            summary.textContent = members.length
            membersDetails.appendChild(summary)
            const ulMembers = document.createElement("ul")
            ulMembers.classList.add("list-unstyled")
            members.forEach(i => {
                const memberLi = document.createElement("li")
                const a = document.createElement("a")
                a.classList.add(type)
                a.href = "/node/" + i.ref
                a.textContent = i.ref
                memberLi.appendChild(a)
                a.before(document.createTextNode(i.type + " "))
                a.after(document.createTextNode(" " + i.role))
                ulMembers.appendChild(memberLi)
            })
            membersDetails.appendChild(ulMembers)
            elem.appendChild(membersDetails)
        }

        elem.classList.remove("hidden-version")
        // elem.classList.remove("browse-redacted")
        elem.classList.add("browse-unredacted")
        // elem.classList.add("browse-node")
    }
    showUnredactedBtn.remove()
    Array.from(document.querySelectorAll("details.empty-version")).forEach(i => {
        i.querySelector("summary")?.remove()
        const div = document.createElement("div")
        div.innerHTML = i.innerHTML
        i.replaceWith(div)
    })
    const classesForClean = ["processed", "history-diff-new-tag", "history-diff-modified-tag", "non-modified-tag", "empty-version"]
    classesForClean.forEach(className => {
        Array.from(document.getElementsByClassName(className)).forEach(i => {
            i.classList.remove(className)
        })
    })
    const elementClassesForRemove = ["history-diff-deleted-tag-tr", "history-diff-modified-location", "find-user-btn", "way-version-view", "relation-version-view"]
    elementClassesForRemove.forEach(elemClass => {
        Array.from(document.getElementsByClassName(elemClass)).forEach(i => {
            i.remove()
        })
    })
}

// tests
// https://osm.org/relation/100742/history
// https://osm.org/way/823589563/history
// https://osm.org/node/1920615841/history
// todo https://www.openstreetmap.org/way/217858945/history
function setupViewRedactions() {
    // TODO дозагрузку нужно делать только если есть аргументы в URL?
    // if (!location.pathname.includes("/node")) {
    //     return;
    // }
    if (document.getElementById("show-unredacted-btn")) {
        return
    }
    const showUnredactedBtn = document.createElement("a")
    showUnredactedBtn.id = "show-unredacted-btn"
    showUnredactedBtn.textContent = ["ru-RU", "ru"].includes(navigator.language) ? "Просмотр неотредактированной истории β" : "View Unredacted History β"
    showUnredactedBtn.style.cursor = "pointer"
    showUnredactedBtn.href = ""
    showUnredactedBtn.onmouseenter = () => {
        resetMapHover()
    }
    showUnredactedBtn.onclick = async e => {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
        await unrollPaginationInHistory()
        showUnredactedBtn.style.cursor = "progress"

        try {
            await restoreObjectHistory(showUnredactedBtn)
        } catch (e) {
            showUnredactedBtn.style.cursor = "not-allowed"
            showUnredactedBtn.textContent = "Error :( Please report this page in better-osm-org GitHub repo"
            throw e
        }

        cleanAllObjects()
        document.querySelector(".compact-toggle-btn")?.remove()
        setTimeout(addDiffInHistory, 0)
    }
    if (!document.querySelector('#sidebar .secondary-actions a[href$="show_redactions=true"]')) {
        document.querySelector("#sidebar .secondary-actions").appendChild(document.createElement("br"))
        document.querySelector("#sidebar .secondary-actions").appendChild(showUnredactedBtn)
    }
}

function extractChangesetID(s) {
    return s.match(/\/changeset\/([0-9]+)/)[1]
}

function isVersionPage() {
    return !!location.pathname.match(/\/(node|way|relation)\/[0-9]+\/?(version\/[0-9]+\/?)?/)
}

function addCommentsCount() {
    queueMicrotask(async () => {
        if (isVersionPage()) {
            document.querySelectorAll(".changeset_num_comments").forEach(i => i.style.setProperty("display", "none", "important"))
        }
        const sectionSelector = isVersionPage() ? "#sidebar_content > div:first-of-type" : "#sidebar_content #element_versions_list > div"
        const links = document.querySelectorAll(`${sectionSelector} div:first-of-type a[href^="/changeset"]:not(.comments-loaded):not(.comments-link)`)
        await loadChangesetMetadatas(
            Array.from(links).map(i => {
                i.classList.add("comments-loaded")
                return parseInt(extractChangesetID(i.getAttribute("href")))
            }).filter(ch => !changesetMetadatas[ch]),
        )
        links.forEach(i => {
            const changesetID = extractChangesetID(i.getAttribute("href"))
            const comments_count = changesetMetadatas[changesetID].comments_count
            if (comments_count) {
                const a = document.createElement("a")
                a.classList.add("comments-link")
                a.textContent = `${comments_count} 💬`
                a.href = i.getAttribute("href")
                a.tabIndex = 0
                a.style.cursor = "pointer"
                a.style.color = "var(--bs-body-color)"
                i.after(a)
                i.after(document.createTextNode("\xA0"))
                setTimeout(async () => {
                    getChangesetComments(changesetID).then(res => {
                        res.forEach(comment => {
                            const shortText = shortOsmOrgLinksInText(comment["text"])
                            a.title += `${comment["user"]}:\n${shortText}\n\n`
                        })
                        a.title = a.title.trimEnd()
                    })
                })
            }
            setTimeout(async () => {
                await loadChangesetMetadata(changesetID)
                Object.entries(changesetMetadatas[changesetID]?.["tags"] ?? {}).forEach(([k, v]) => {
                    // тегов может не быть
                    if (k === "comment") return
                    i.parentElement.title += `${k}: ${v}\n`
                })
                const user_link = i.parentElement.parentElement.querySelector(`a[href^="/user/"]`)
                if (user_link) {
                    getCachedUserInfo(user_link.textContent).then(res => {
                        user_link.title = makeUsernameTitle(res)
                    })
                }
            })
        })
    })
}

/** @type {MutationObserver | null} **/
let historyPagePaginationDeletingObserver = null
/** @type {MutationObserver | null} **/
let paginationInHistoryStepObserver = null

function monitorHistoryPaginationMoving() {
    if (!document.querySelector("#older_element_versions_navigation a")) {
        return
    }
    if (historyPagePaginationDeletingObserver === null) {
        historyPagePaginationDeletingObserver = new MutationObserver(function (mutationsList, observer) {
            for (let mutationRecord of mutationsList) {
                for (let removedNode of mutationRecord.removedNodes ?? []) {
                    if (removedNode.id === "older_element_versions_navigation") {
                        observer.disconnect()
                        addDiffInHistory("pagination")
                    }
                }
            }
        })
        historyPagePaginationDeletingObserver.observe(document.querySelector("#sidebar_content"), {
            childList: true,
            subtree: true,
            attributes: true,
        })
    }
    paginationInHistoryStepObserver = new MutationObserver(function (mutationsList, observer) {
        observer.disconnect()
        addDiffInHistory("pagination")
    })
    paginationInHistoryStepObserver.observe(document.querySelector("#older_element_versions_navigation"), {
        childList: true,
        subtree: true,
        attributes: true,
    })
}

async function unrollPaginationInHistory() {
    if (!document.querySelector("#older_element_versions_navigation")) {
        return
    }
    console.log("start pagination unrolling")
    await new Promise(resolve => {
        if (!paginationInHistoryStepObserver) {
            paginationInHistoryStepObserver = new MutationObserver(function (mutationsList, observer) {
                observer.disconnect()
                console.log("pagination click")
                document.querySelector("#older_element_versions_navigation a")?.click()
            })
            if (!document.querySelector("#older_element_versions_navigation")) {
                resolve()
                return
            }
            paginationInHistoryStepObserver.observe(document.querySelector("#older_element_versions_navigation"), {
                childList: true,
                subtree: true,
                attributes: true,
            })
        }
        const historyPagePaginationObserver = new MutationObserver(function (mutationsList, observer) {
            for (let mutationRecord of mutationsList) {
                for (let removedNode of mutationRecord.removedNodes ?? []) {
                    if (removedNode.id === "older_element_versions_navigation") {
                        observer.disconnect()
                        console.log("pagination unrolling finished")
                        resolve()
                    }
                }
            }
        })
        historyPagePaginationObserver.observe(document.querySelector("#sidebar_content"), {
            childList: true,
            subtree: true,
            attributes: true,
        })

        const btn = document.querySelector("#older_element_versions_navigation a")
        if (!btn) {
            return
        }
        console.log("pagination first click")
        btn.click()
    })
}

function makeTitleForTagsCount(tagsCount) {
    if (tagsCount === 1) {
        // fixme after adding localization
        return tagsCount + (["ru-RU", "ru"].includes(navigator.language) ? " тег" : " tag")
    } else if (tagsCount < 10 && tagsCount > 20 && [2, 3, 4].includes(tagsCount % 10)) {
        return tagsCount + (["ru-RU", "ru"].includes(navigator.language) ? " тега" : " tags")
    } else {
        return tagsCount + (["ru-RU", "ru"].includes(navigator.language) ? " тегов" : " tags")
    }
}

function externalizeLinks(links) {
    links?.forEach(i => i.setAttribute("target", "_blank"))
}

function addDiffInHistoryStyle() {
    const styleText =
        `
    .turbo-progress-bar {
        display: none;
    }

    .compact-toggle-btn {
        position: relative;
        top: -2px;
        cursor: pointer;
        padding: 0px;
        padding-left: 2px;
        padding-right: 2px;
        line-height: initial;
        border-top: none;
        border-bottom: none;
        height: 1rem;
    }
    
    #element_versions_list > div {
        padding-bottom: 0.5rem !important;
    }
    
    #element_versions_list > div > div:has(>table) {
        margin-bottom: 0.5rem !important;
    }

    @media ${mediaQueryForWebsiteTheme} {
        .compact-toggle-btn {
            background: var(--bs-gray-800);
            border-color: var(--bs-gray-800);
        }

        .compact-toggle-btn:hover {
            background: var(--bs-gray-700);
            border-color: var(--bs-gray-700);
        }

        .compact-toggle-btn:active {
            background: var(--bs-gray-700) !important;
            border-color: var(--bs-gray-700) !important;
        }
    }

    .compact-toggle-btn svg {
        display: flex;
    }

    .history-diff-new-tag {
      background: ${c("rgba(17, 238, 9, 0.6)")} !important;
    }
    .history-diff-modified-tag {
      background: rgba(223, 238, 9, 0.6) !important;
    }
    .history-diff-deleted-tag {
      background: ${c("rgba(238, 51, 9, 0.6)")} !important;
    }

    #sidebar_content div.map-hover {
      background-color: rgba(223, 223, 223, 0.6);
    }

    .new-letter {
        background: ${c("rgba(25, 223, 25, 0.6)")};
    }

    .deleted-letter {
        background: ${c("rgba(255, 144, 144, 0.6)")};
    }

    @media ${mediaQueryForWebsiteTheme} {
        .history-diff-new-tag {
          background: ${c("rgba(4, 123, 0, 0.6)", ".history-diff-new-tag")} !important;
        }
        .history-diff-modified-tag {
          color: black !important;
        }
        .history-diff-modified-tag a {
          color: #052894;
        }
        .history-diff-deleted-tag {
          color: lightgray !important;
          background: ${c("rgba(238, 51, 9, 0.4)", ".history-diff-deleted-tag")} !important;
        }

        summary.history-diff-modified-tag {
            background: rgba(223,238,9,0.2) !important;
        }

        /*li.history-diff-modified-tag {*/
        /*     background: rgba(223,238,9,0.2) !important;*/
        /*}*/

        #sidebar_content div.map-hover {
            background-color: rgb(14, 17, 19);
        }

        .new-letter {
            background: ${c("rgba(25, 223, 25, 0.9)")};
        }

        .deleted-letter {
            background: ${c("rgba(253, 83, 83, 0.8)")};
        }
    }
    .non-modified-tag .empty-version {

    }
    .hidden-version, .hidden-h4 {
        display: none;
    }

    table.browse-tag-list.hide-non-modified-tags > tbody > .non-modified-tag {
        display: none;
    }

    table.browse-tag-list.hide-non-modified-tags > tbody > .non-modified-tag + tr:not(:has(th)) {
        display: none;
    }

    #sidebar_content h2:not(.changeset-header){
        font-size: 1rem;
    }

    #element_versions_list h4 {
        font-size: 1rem;
    }

    .copied {
        background-color: rgba(9,238,9,0.6);
        transition:all 0.3s;
    }
    .was-copied {
        background-color: initial;
        transition:all 0.3s;
    }
    @media ${mediaQueryForWebsiteTheme} {
        .copied {
            background-color: rgba(0,255,101,0.6);
            transition:all 0.3s;
        }
        .was-copied {
            background-color: initial;
            transition:all 0.3s;
        }
    }

    @media (max-device-width: 640px) and ${mediaQueryForWebsiteTheme} {
        td.history-diff-new-tag::selection, /*td.history-diff-modified-tag::selection,*/ td.history-diff-deleted-tag::selection {
            background: black;
        }

        th.history-diff-new-tag::selection, /*th.history-diff-modified-tag::selection,*/ th.history-diff-deleted-tag::selection {
            background: black;
        }

        td a.history-diff-new-tag::selection, td a.history-diff-modified-tag::selection, td a.history-diff-deleted-tag::selection {
            background: black;
        }

        th a.history-diff-new-tag::selection, th a.history-diff-modified-tag::selection, th a.history-diff-deleted-tag::selection {
            background: black;
        }
    }

    table.browse-tag-list tr td[colspan="2"] {
        background: var(--bs-body-bg) !important;
    }

    .prev-value-span.hidden {
        display: none !important;
    }

    ` +
        (GM_config.get("ShowChangesetGeometry")
            ? `
    .node-version-view:hover {
        background-color: yellow;
    }

    [node-version]:hover {
        background-color: rgba(244, 244, 244);
    }

    @media ${mediaQueryForWebsiteTheme} {
        [node-version]:hover {
            background-color: rgb(14, 17, 19);
        }
    }

    .way-version-view:hover {
        background-color: yellow;
    }

    [way-version]:hover {
        background-color: rgba(244, 244, 244);
    }

    @media ${mediaQueryForWebsiteTheme} {
        [way-version]:hover {
            background-color: rgb(14, 17, 19);
        }
    }

    [way-version].broken-version details:before {
        color: var(--bs-body-color);
        content: "Some nodes were hidden by moderators";
        font-style: italic;
        font-weight: normal;
        font-size: small;
    }

    .relation-version-view:hover {
        background-color: yellow;
    }

    [relation-version]:hover {
        background-color: rgba(244, 244, 244);
    }

    @media ${mediaQueryForWebsiteTheme} {
        [relation-version]:hover {
            background-color: rgb(14, 17, 19);
        }
    }

    [relation-version].broken-version details:before {
        color: var(--bs-body-color);
        content: "Some members were hidden by moderators";
        font-style: italic;
        font-weight: normal;
        font-size: small;
    }

    @media ${mediaQueryForWebsiteTheme} {
        path.stroke-polyline {
            filter: drop-shadow(1px 1px 0 #7a7a7a) drop-shadow(-1px -1px 0 #7a7a7a) drop-shadow(1px -1px 0 #7a7a7a) drop-shadow(-1px 1px 0 #7a7a7a);
        }
    }
    `
            : ``)
    injectCSSIntoOSMPage(styleText)
}

function historyPaginationClick() {
    const paginationBtn = document.querySelector("#older_element_versions_navigation a")
    console.log("Click by pagination from AddDiffInHistory", paginationBtn?.href)
    paginationBtn?.click()
}

// hard cases:
// https://www.openstreetmap.org/node/1/history
// https://www.openstreetmap.org/node/2/history
// https://www.openstreetmap.org/node/9286365017/history
// https://www.openstreetmap.org/relation/72639/history
// https://www.openstreetmap.org/node/10173297169/history
// https://www.openstreetmap.org/relation/16022751/history
// https://www.openstreetmap.org/node/12084992837/history
// https://www.openstreetmap.org/way/1329437422/history
function addDiffInHistory(reason = "url_change") {
    makeHeaderPartsClickable()
    addHistoryLink()
    externalizeLinks(document.querySelectorAll("#sidebar_content p a"))
    externalizeLinks(document.querySelectorAll("#sidebar_content table a"))
    if (!location.pathname.match(/\/(node|way|relation)\/[0-9]+\/history\/?$/)) {
        return
    }
    if (document.querySelector(".compact-toggle-btn") && reason !== "pagination") {
        return
    }
    const isNode = location.pathname.startsWith("/node")
    const isWay = location.pathname.startsWith("/way")
    const isRelation = location.pathname.startsWith("/relation")

    // костыль для KeyK/L и OSM tags editor
    document.querySelectorAll("#element_versions_list > div").forEach(i => i.classList.add("browse-section"))
    cleanAllObjects()
    hideSearchForm()
    if (document.activeElement?.nodeName !== "A" && document.activeElement?.nodeName !== "SVG") {
        // в хроме фокус не выставляется
        document.querySelector("#sidebar").focus({ focusVisible: false }) // focusVisible работает только в Firefox
        document.querySelector("#sidebar").blur()
    }
    if (!document.querySelector(".compact-toggle-btn")) {
        const compactToggle = document.createElement("button")
        compactToggle.title = "Toggle between full and compact tags diff.\nYou can also use the T key."
        compactToggle.setAttribute("value", "><")
        compactToggle.innerHTML = compactModeSvg
        compactToggle.classList.add("compact-toggle-btn")
        compactToggle.classList.add("btn", "btn-primary", "btn-sm")
        compactToggle.onclick = () => makeElementHistoryCompact()
        const sidebar = document.querySelector("#sidebar_content h2")
        if (!sidebar) {
            return
        }
        sidebar.appendChild(document.createTextNode("\xA0"))
        sidebar.appendChild(compactToggle)
    }

    addDiffInHistoryStyle()

    function convertVersionIntoSpoiler(elem) {
        const spoiler = document.createElement("details")
        const summary = document.createElement("summary")
        summary.textContent = elem.querySelector("a").textContent
        spoiler.innerHTML = elem.innerHTML
        spoiler.prepend(summary)
        spoiler.classList.add("empty-version")
        spoiler.classList.add("browse-" + location.pathname.match(/(node|way|relation)/)[1])
        elem.replaceWith(spoiler)
        return spoiler
    }

    if (!document.querySelector(".tag-added") && !document.querySelector(".tag-unmodified")) {
        const versions = [{ tags: [], coordinates: "", wasModified: false, nodes: [], members: [], visible: true, membersCount: 0, versionNumber: 0 }]
        const oldToNewHtmlVersions = Array.from(
            document.querySelectorAll('#element_versions_list > div:not(.processed):not([way-version="inter"]):not(:has(a[href*="/redactions/"]:not([rel]):not(.unredacted)))'),
        ).toReversed()

        for (let verInd = 0; verInd < oldToNewHtmlVersions.length; verInd++) {
            const ver = oldToNewHtmlVersions[verInd]

            ver.classList.add("processed")
            let wasModifiedObject = false
            const version = parseInt(
                ver
                    .querySelector("a")
                    .getAttribute("href")
                    .match(/\/history\/(\d+)$/)[1],
            )
            const kv = ver.querySelectorAll("tbody > tr") ?? []
            const tags = []

            const metainfoHTML = ver.querySelector("div:nth-of-type(1)")

            const changesetA = ver.querySelector('div > div a[href^="/changeset/"]:not([rel])')
            const changesetHTML = changesetA?.parentElement
            const changesetID = changesetA.textContent

            const time = metainfoHTML.querySelector("time")

            const coordinates = ver.querySelector("div a:has(.latitude)")
            const locationHTML = coordinates?.parentElement
            const locationA = ver.querySelector("div a:has(.latitude)")

            if (metainfoHTML.querySelector('a[href*="/user/"]:not([rel])')) {
                const a = metainfoHTML.querySelector('a[href*="/user/"]:not([rel])')
                metainfoHTML.innerHTML = ""
                metainfoHTML.appendChild(time)
                metainfoHTML.appendChild(document.createTextNode(" "))
                metainfoHTML.appendChild(a)
                metainfoHTML.appendChild(document.createTextNode(" "))
            } else {
                metainfoHTML.innerHTML = ""
                metainfoHTML.appendChild(time)
                const findBtn = document.createElement("span")
                findBtn.classList.add("find-user-btn")
                findBtn.title = "Try find deleted user"
                findBtn.textContent = " 🔍 "
                findBtn.value = changesetID
                findBtn.datetime = time.dateTime
                findBtn.style.cursor = "pointer"
                findBtn.onclick = findChangesetInDiff
                metainfoHTML.appendChild(findBtn)
            }

            changesetHTML.innerHTML = ""
            const hashtag = document.createTextNode("#")
            metainfoHTML.appendChild(hashtag)
            const changesetWrapper = document.createElement("span")
            changesetA.classList.remove("comments-loaded")
            changesetWrapper.appendChild(changesetA)
            metainfoHTML.appendChild(changesetWrapper)
            let visible = true

            if (isNode) {
                if (coordinates) {
                    locationHTML.innerHTML = ""
                    locationHTML.appendChild(locationA)
                    metainfoHTML.appendChild(locationHTML)
                } else {
                    visible = false
                    wasModifiedObject = true // because sometimes deleted object has tags
                    time.before(document.createTextNode("🗑 "))
                }
            } else if (isWay) {
                if (!ver.querySelector("details")) {
                    time.before(document.createTextNode("🗑 "))
                }
            } else if (isRelation) {
                if (!ver.querySelector("details")) {
                    time.before(document.createTextNode("🗑 "))
                }
            }

            const valuesLinks = new Map()
            document.querySelectorAll("#element_versions_list > div table td a").forEach(a => {
                valuesLinks.set(a.textContent, a.href)
            })
            const showPreviousTagValue = GM_config.get("ShowPreviousTagValue", true)
            const lastTags = versions.at(-1).tags
            // add/modification
            kv.forEach(i => {
                const k = i.querySelector("th > a")?.textContent ?? i.querySelector("th")?.textContent
                i.querySelector("td .prev-value-span")?.remove()
                if (i.querySelector("td .current-value-span")) {
                    i.querySelector("td .current-value-span").classList.remove("current-value-span")
                }
                i.querySelector(".wdt-preview svg title")?.remove()
                let v = i.querySelector("td .wdplugin")?.textContent ?? i.querySelector("td")?.textContent
                if (k === undefined) {
                    // todo support multiple wikidata
                    // Human-readable Wikidata extension compatibility
                    return
                }
                if (k.includes("colour")) {
                    const tmpV = i.querySelector("td").cloneNode(true)
                    tmpV.querySelector("svg")?.remove()
                    v = tmpV.textContent
                }
                tags.push([k, v])

                let tagWasModified = false
                if (!lastTags.some(elem => elem[0] === k)) {
                    i.querySelector("th").classList.add("history-diff-new-tag")
                    i.querySelector("td").classList.add("history-diff-new-tag")
                    wasModifiedObject = tagWasModified = true
                } else if (lastTags.some(elem => elem[0] === k)) {
                    lastTags.forEach(el => {
                        if (el[0] === k && el[1] !== v) {
                            i.querySelector("th").classList.add("history-diff-modified-key")
                            const valCell = i.querySelector("td")
                            if (isRTLLayout) {
                                valCell.dir = ""
                            }
                            valCell.classList.add("history-diff-modified-tag")
                            valCell.innerHTML = "<span class='current-value-span'>" + valCell.innerHTML + "</span>"
                            valCell.onclick = e => {
                                if (e.altKey) return
                                if (window.getSelection().type === "Range") return
                                if (e.target.nodeName === "A") return

                                e.preventDefault()
                                e.stopPropagation()
                                if (valCell.querySelector(".prev-value-span").classList.contains("hidden")) {
                                    document.querySelectorAll(".prev-value-span").forEach(span => span.classList.remove("hidden"))
                                } else {
                                    document.querySelectorAll(".prev-value-span").forEach(span => span.classList.add("hidden"))
                                }
                            }

                            const currentValueSpan = i.querySelector("td .current-value-span")
                            const prevValueSpan = document.createElement("span")
                            prevValueSpan.classList.add("prev-value-span")

                            const diff = arraysDiff(Array.from(el[1]).toReversed(), Array.from(v).toReversed(), 1).toReversed()
                            // todo unify with diff in changesets
                            // todo detect asci -> unicode or less strict cond
                            // prettier-ignore
                            if (!i.querySelector("td a") && v.length > 1 && el[1].length > 1
                                && (
                                    diff.length === v.length && el[1].length === v.length
                                    && diff.reduce((cnt, b) => cnt + (b[0] !== b[1]), 0) === 1
                                    || diff.reduce((cnt, b) => cnt + (b[0] !== b[1] && b[0] !== null), 0) === 0
                                    || diff.reduce((cnt, b) => cnt + (b[0] !== b[1] && b[1] !== null), 0) === 0
                                )) {
                                const prevText = document.createElement("span")
                                const newText = document.createElement("span")
                                diff.forEach(c => {
                                    if (c[0] !== c[1]) {
                                        if (c[1]) {
                                            const colored = document.createElement("span")
                                            colored.classList.add("new-letter")
                                            colored.textContent = c[1]
                                            newText.appendChild(colored)
                                        }
                                        if (c[0]) {
                                            const colored = document.createElement("span")
                                            colored.classList.add("deleted-letter")
                                            colored.textContent = c[0]
                                            prevText.appendChild(colored)
                                        }
                                    } else {
                                        prevText.appendChild(document.createTextNode(c[0]))
                                        newText.appendChild(document.createTextNode(c[1]))
                                    }
                                })
                                prevText.normalize()
                                newText.normalize()
                                prevValueSpan.appendChild(prevText)
                                prevValueSpan.appendChild(document.createTextNode(` ${arrowSymbolForChanges} `))
                                newText.classList.add("current-value-span")
                                newText.style.display = "inline-block"
                                if (showPreviousTagValue) {
                                    currentValueSpan.replaceWith(newText)
                                } else {
                                    currentValueSpan.replaceWith(v)
                                }
                                prevText.dir = "auto"
                                newText.dir = "auto"
                            } else {
                                if (valuesLinks.has(el[1])) {
                                    const valueLink = document.createElement("a")
                                    valueLink.href = valuesLinks.get(el[1])
                                    valueLink.target = "_blank"
                                    valueLink.title = ""
                                    valueLink.textContent = `${el[1]}`
                                    prevValueSpan.appendChild(valueLink)
                                    prevValueSpan.appendChild(document.createTextNode(` ${arrowSymbolForChanges} `))
                                } else {
                                    const prevText = document.createElement("span")
                                    prevText.appendChild(document.createTextNode(el[1]))
                                    const newText = document.createElement("span")
                                    newText.appendChild(document.createTextNode(v))

                                    prevValueSpan.appendChild(prevText)
                                    prevValueSpan.appendChild(document.createTextNode(` ${arrowSymbolForChanges} `))
                                    newText.classList.add("current-value-span")
                                    newText.style.display = "inline-block"
                                    if (showPreviousTagValue) {
                                        currentValueSpan.replaceWith(newText)
                                    } else {
                                        currentValueSpan.replaceWith(v)
                                    }
                                }
                            }

                            currentValueSpan.setAttribute("value", v)
                            currentValueSpan.classList.add("current-value-span")
                            currentValueSpan.style.display = "inline-block"
                            prevValueSpan.style.display = "inline-block"
                            valCell.prepend(prevValueSpan)
                            valCell.removeAttribute("dir")
                            if (!showPreviousTagValue) {
                                prevValueSpan.classList.add("hidden")
                            }
                            i.title = `Click for hide previous value`
                            // i.title = `was: "${el[1]}"`;
                            wasModifiedObject = tagWasModified = true
                        }
                    })
                }
                if (!tagWasModified) {
                    i.classList.add("non-modified-tag")
                    i.querySelector("th").classList.add("non-modified-tag")
                    i.querySelector("td").classList.add("non-modified-tag")
                }
            })
            // deletion
            lastTags.forEach(tag => {
                const k = tag[0]
                const v = tag[1]
                const x = ver
                if (tags.some(elem => elem[0] === k)) {
                    return
                }
                const tr = document.createElement("tr")
                tr.classList.add("history-diff-deleted-tag-tr")
                const th = document.createElement("th")
                th.textContent = k
                th.classList.add("history-diff-deleted-tag", "py-1", "border-grey", "table-light", "fw-normal", "border-start", "border-secondary-subtle")
                const td = document.createElement("td")
                if (k.includes("colour")) {
                    td.innerHTML = `<svg width="14" height="14" class="float-end m-1"><title></title><rect x="0.5" y="0.5" width="13" height="13" fill="" stroke="#2222"></rect></svg>`
                    td.querySelector("svg rect").setAttribute("fill", v)
                    td.appendChild(document.createTextNode(v))
                } else {
                    td.textContent = v
                }
                td.classList.add("history-diff-deleted-tag", "py-1", "border-grey", "table-light", "fw-normal", "border-start", "border-secondary-subtle")
                tr.appendChild(th)
                tr.appendChild(td)
                if (!x.querySelector("tbody")) {
                    const tableDiv = document.createElement("table")
                    tableDiv.classList.add("mb-3", "border", "border-secondary-subtle", "rounded", "overflow-hidden")
                    const table = document.createElement("table")
                    table.classList.add("mb-0", "browse-tag-list", "table", "align-middle")
                    const tbody = document.createElement("tbody")
                    table.appendChild(tbody)
                    tableDiv.appendChild(table)
                    x.appendChild(tableDiv)
                }
                const firstNonDeletedTag = x.querySelector("th:not(.history-diff-deleted-tag)")?.parentElement
                if (firstNonDeletedTag) {
                    firstNonDeletedTag.before(tr)
                } else {
                    x.querySelector("tbody").appendChild(tr)
                }
                wasModifiedObject = true
            })
            const lastCoordinates = versions.at(-1).coordinates
            const lastVisible = versions.at(-1).visible
            if (visible && coordinates && versions.length > 1 && coordinates.href !== lastCoordinates) {
                if (lastCoordinates) {
                    const curLat = coordinates.querySelector(".latitude").textContent.replace(",", ".")
                    const curLon = coordinates.querySelector(".longitude").textContent.replace(",", ".")
                    const lastLat = lastCoordinates.match(/#map=.+\/(.+)\/(.+)$/)[1]
                    const lastLon = lastCoordinates.match(/#map=.+\/(.+)\/(.+)$/)[2]
                    // prettier-ignore
                    const distInMeters = getDistanceFromLatLonInKm(
                        Number.parseFloat(lastLat),
                        Number.parseFloat(lastLon),
                        Number.parseFloat(curLat),
                        Number.parseFloat(curLon)
                    ) * 1000
                    const distTxt = document.createElement("span")
                    distTxt.textContent = `${distInMeters.toFixed(1)}m`
                    distTxt.classList.add("history-diff-modified-tag")
                    distTxt.classList.add("history-diff-modified-location")
                    coordinates.after(distTxt)
                    coordinates.after(document.createTextNode(" "))
                }
                wasModifiedObject = true
            }
            let membersCount = 0 // quick workaround for lazy versions
            let childNodes = null
            if (isWay) {
                childNodes = Array.from(ver.querySelectorAll("details ul.list-unstyled li")).map(el => el.textContent.match(/\d+/)[0])
                const lastChildNodes = versions.at(-1).nodes
                // prettier-ignore
                if (version > 1 &&
                    (childNodes.length !== lastChildNodes.length
                        || childNodes.some((el, index) => lastChildNodes[index] !== childNodes[index]))) {
                    ver.querySelector("details > summary")?.classList.add("history-diff-modified-tag")
                    wasModifiedObject = true
                }
                ver.querySelector("details")?.removeAttribute("open")
            } else if (isRelation) {
                membersCount = parseInt(ver.querySelector("details:not(.empty-version) summary")?.textContent?.match(/(\d+)/)?.[0]) ?? 0
                childNodes = Array.from(ver.querySelectorAll("details:not(.empty-version) ul.list-unstyled li")).map(el => el.textContent)

                const olderMembersCount = versions.at(-1).membersCount
                const olderMembers = versions.at(-1).members

                const unloadedMembersList = ver.querySelector("turbo-frame:has(.spinner-border)")
                const olderUnloadedMembersList = oldToNewHtmlVersions[verInd - 1]?.querySelector("turbo-frame:has(.spinner-border)")
                // https://osm.org/relation/9425522/history
                // https://osm.org/relation/17542348/history
                if (version > 1 && membersCount !== olderMembersCount) {
                    ver.querySelector("details:not(.empty-version) > summary")?.classList.add("history-diff-modified-tag")
                    wasModifiedObject = true
                } else if (version > 1 && !unloadedMembersList && !olderUnloadedMembersList) {
                    if (childNodes.length !== olderMembers.length || childNodes.some((el, index) => olderMembers[index] !== childNodes[index])) {
                        ver.querySelector("details:not(.empty-version) > summary")?.classList.add("history-diff-modified-tag")
                        wasModifiedObject = true
                    } else if (!wasModifiedObject) {
                        oldToNewHtmlVersions[verInd] = convertVersionIntoSpoiler(ver)
                    }
                }
                if (unloadedMembersList) {
                    function repairVersions() {
                        const ver = oldToNewHtmlVersions[verInd]
                        const olderVersion = oldToNewHtmlVersions[verInd - 1]
                        const nextVersion = oldToNewHtmlVersions[verInd + 1]
                        if (olderVersion && !olderVersion.querySelector("turbo-frame:has(.spinner-border)")) {
                            const curChildNodes = Array.from(ver.querySelectorAll("details ul.list-unstyled li")).map(el => el.textContent)
                            const oldChildMembers = Array.from(olderVersion.querySelectorAll("details ul.list-unstyled li")).map(el => el.textContent)
                            if (version > 1 && (curChildNodes.length !== oldChildMembers.length || curChildNodes.some((el, index) => curChildNodes[index] !== oldChildMembers[index]))) {
                                ver.querySelector("details:not(.empty-version) > summary")?.classList.add("history-diff-modified-tag")
                                wasModifiedObject = true
                            } else if (!wasModifiedObject) {
                                oldToNewHtmlVersions[verInd] = convertVersionIntoSpoiler(ver)
                            }
                        }
                        if (nextVersion && !nextVersion.querySelector("turbo-frame:has(.spinner-border)")) {
                            const nextChildMembers = Array.from(nextVersion.querySelectorAll("details ul.list-unstyled li")).map(el => el.textContent)
                            const curChildNodes = Array.from(ver.querySelectorAll("details ul.list-unstyled li")).map(el => el.textContent)

                            if (nextChildMembers.length !== curChildNodes.length || curChildNodes.some((el, index) => curChildNodes[index] !== nextChildMembers[index])) {
                                nextVersion.querySelector("details:not(.empty-version) > summary")?.classList.add("history-diff-modified-tag")
                            } else {
                                const nextVersionNumber = parseInt(
                                    nextVersion
                                        .querySelector("a")
                                        .getAttribute("href")
                                        .match(/\/history\/(\d+)$/)[1],
                                )
                                if (versions.find(i => i.versionNumber === nextVersionNumber)?.wasModified === false) {
                                    oldToNewHtmlVersions[verInd + 1] = convertVersionIntoSpoiler(nextVersion)
                                }
                            }
                        }
                    }

                    const lazyMembersObserver = new MutationObserver(function (mutationsList, observer) {
                        for (let mutationRecord of mutationsList) {
                            for (let newNode of mutationRecord.addedNodes ?? []) {
                                if (newNode.nodeName === "UL") {
                                    console.log("lazy version loaded")
                                    observer.disconnect()
                                    repairVersions()
                                }
                            }
                        }
                    })
                    lazyMembersObserver.observe(unloadedMembersList, {
                        childList: true,
                        subtree: true,
                    })
                }
                ver.querySelector("details")?.removeAttribute("open")
            }
            if (!wasModifiedObject && !isRelation && verInd !== 0) {
                oldToNewHtmlVersions[verInd] = convertVersionIntoSpoiler(ver)
            }
            versions.push({
                versionNumber: version,
                tags: tags,
                coordinates: coordinates?.href ?? lastCoordinates,
                wasModified: wasModifiedObject || (visible && !lastVisible),
                nodes: childNodes,
                membersCount: membersCount,
                members: childNodes,
                visible: visible,
            })
            ver.querySelectorAll("h4").forEach((el, index) => (index !== 0 ? el.classList.add("hidden-h4") : null))
            ver.title = makeTitleForTagsCount(tags.length)
        }
        if (document.querySelector("#older_element_versions_navigation a")) {
            oldToNewHtmlVersions[0]?.classList?.remove("processed")
            oldToNewHtmlVersions[0]?.querySelectorAll(".history-diff-new-tag, .history-diff-modified-tag")?.forEach(elem => {
                elem.classList.remove("history-diff-new-tag")
                elem.classList.remove("history-diff-modified-tag")
            })
        }
        let hasRedacted = false
        Array.from(document.querySelectorAll('#element_versions_list > div:has(a[href*="/redactions/"]:not([rel]):not(.unredacted))')).forEach(x => {
            x.classList.add("hidden-version")
            hasRedacted = true
        })
        if (hasRedacted) {
            try {
                setupViewRedactions()
            } catch (e) {
                console.error(e)
            }
        }
    }
    if (reason === "pagination") {
        makeElementHistoryCompact(document.querySelector(".compact-toggle-btn").getAttribute("value") !== "><")
    } else {
        makeElementHistoryCompact()
    }
    makeLinksInVersionTagsClickable()
    makeHashtagsClickable()
    makeTimesSwitchable()
    document.querySelectorAll("#element_versions_list > div p").forEach(shortOsmOrgLinks)
    addCommentsCount()
    setupNodeVersionView()
    setupWayVersionView()
    setupRelationVersionView()
    expandWikidata()
    addCopyCoordinatesButtons()
    addRelationHistoryViewerLinks()
    monitorHistoryPaginationMoving()
    if (isRelation) {
        const maxVersion = parseInt(
            document
                .querySelector("#element_versions_list h4 a")
                .getAttribute("href")
                .match(/\/relation\/[0-9]+\/history\/([0-9]+)/)[1],
        )
        if (maxVersion < 500) {
            historyPaginationClick()
        }
    } else {
        historyPaginationClick()
    }
}

function setupVersionsDiff(path) {
    // prettier-ignore
    if (!path.includes("/history")
        || !path.startsWith("/node")
        && !path.startsWith("/way")
        && !path.startsWith("/relation")) {
        return;
    }
    const timerId = setInterval(addDiffInHistory, 500)
    setTimeout(() => {
        clearInterval(timerId)
        console.debug("stop adding diff in history")
    }, 25000)
    addDiffInHistory()
}

//</editor-fold>
