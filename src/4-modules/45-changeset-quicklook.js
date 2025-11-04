//<editor-fold desc="changeset-quicklook" defaultstate="collapsed">

let quickLookInjectingStarted = false
let allTagsOfObjectsVisible = true

// Perf test:                                           https://osm.org/changeset/155712128
// Check way 695574090:                                 https://osm.org/changeset/71014890
// Check deleted relation                               https://osm.org/changeset/155923052
// Heavy ways and deleted relation                      https://osm.org/changeset/153431079
// Downloading parents:                                 https://osm.org/changeset/156331065
// Restored objects                                     https://osm.org/changeset/156515722
// Check ways with version=1                            https://osm.org/changeset/155689740
// Many changes in the coordinates of the intersections https://osm.org/changeset/156331065
// Deleted and restored objects                         https://osm.org/changeset/155160344
// Old edits with unusual objects                       https://osm.org/changeset/1000
// Parent ways only in future                           https://osm.org/changeset/156525401
// Restored tags                                        https://osm.org/changeset/141362243
/**
 * Get editorial prescription via modified Levenshtein distance finding algorithm
 * @template T
 * @param {T[]} arg_a
 * @param {T[]} arg_b
 * @param {number} one_replace_cost
 * @return {[T, T][]}
 */
function arraysDiff(arg_a, arg_b, one_replace_cost = 2) {
    let a = arg_a.map(i => JSON.stringify(i))
    let b = arg_b.map(i => JSON.stringify(i))
    const dp = []
    for (let i = 0; i < a.length + 1; i++) {
        dp[i] = new Uint32Array(b.length + 1)
    }

    for (let i = 0; i <= a.length; i++) {
        dp[i][0] = i
    }

    for (let i = 0; i <= b.length; i++) {
        dp[0][i] = i
    }

    const min = Math.min // fuck Tampermonkey
    // for some fucking reason every math.min call goes through TM wrapper code
    // that is not optimised by the JIT compiler
    if (arg_a.length && Object.prototype.hasOwnProperty.call(arg_a[0], "role")) {
        for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
                const del_cost = dp[i - 1][j]
                const ins_cost = dp[i][j - 1]
                const replace_cost = dp[i - 1][j - 1] + (a[i - 1] !== b[j - 1]) * one_replace_cost // replacement is not very desirable
                const replace_role_cost = dp[i - 1][j - 1] + (!(arg_a[i - 1].type === arg_b[j - 1].type && arg_a[i - 1].ref === arg_b[j - 1].ref) || arg_a[i - 1].role === arg_b[j - 1].role) * one_replace_cost
                dp[i][j] = min(min(del_cost, ins_cost) + 1, min(replace_cost, replace_role_cost))
            }
        }
    } else {
        for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
                const del_cost = dp[i - 1][j]
                const ins_cost = dp[i][j - 1]
                const replace_cost = dp[i - 1][j - 1] + (a[i - 1] !== b[j - 1]) * one_replace_cost // replacement is not very desirable
                dp[i][j] = min(min(del_cost, ins_cost) + 1, replace_cost)
            }
        }
    }

    a = a.map(i => JSON.parse(i))
    b = b.map(i => JSON.parse(i))

    const answer = []
    let i = a.length
    let j = b.length

    while (true) {
        if (i === 0 || j === 0) {
            if (i === 0 && j === 0) {
                break
            } else if (i === 0) {
                answer.push([null, b[j - 1]])
                j = j - 1
                continue
            } else {
                answer.push([a[i - 1], null])
                i = i - 1
                continue
            }
        }

        const del_cost = dp[i - 1][j]
        const ins_cost = dp[i][j - 1]
        let replace_cost = dp[i - 1][j - 1] + (JSON.stringify(a[i - 1]) !== JSON.stringify(b[j - 1])) * one_replace_cost
        if (arg_a.length && Object.prototype.hasOwnProperty.call(arg_a[0], "role")) {
            replace_cost = min(replace_cost, dp[i - 1][j - 1] + (!(arg_a[i - 1].type === arg_b[j - 1].type && arg_a[i - 1].ref === arg_b[j - 1].ref) || arg_a[i - 1].role === arg_b[j - 1].role) * one_replace_cost)
        }

        if (del_cost <= ins_cost && del_cost + 1 <= replace_cost) {
            answer.push([a[i - 1], null])
            i = i - 1
        } else if (ins_cost <= del_cost && ins_cost + 1 <= replace_cost) {
            answer.push([null, b[j - 1]])
            j = j - 1
        } else {
            answer.push([a[i - 1], b[j - 1]])
            i = i - 1
            j = j - 1
        }
    }
    return answer.toReversed()
}

/**
 * @template T
 * @param {T[]} arr
 * @param N
 * @return {T[][]}
 */
function arraySplit(arr, N = 2) {
    const chunkSize = Math.max(1, Math.floor(arr.length / N)) // todo это неправильно, но и так сойдёт
    const res = []
    for (let i = 0; i < arr.length; i += chunkSize) {
        res.push(arr.slice(i, i + chunkSize))
    }
    return res
}

/**
 * @typedef {{
 * closed_at: string,
 * max_lon: number,
 * maxlon: number,
 * created_at: string,
 * type: string,
 * changes_count: number,
 * tags: {},
 * min_lon: number,
 * minlon: number,
 * uid: number,
 * max_lat: number,
 * maxlat: number,
 * minlat: number,
 * comments_count: number,
 * id: number,
 * min_lat: number,
 * user: string,
 * open: boolean}} ChangesetMetadata
 */

// /**
//  * @type ChangesetMetadata|null
//  **/
// let prevChangesetMetadata = null;
/**
 * @type {Object.<string, ChangesetMetadata>}|null
 **/
const changesetMetadatas = {}
let startTouch = null
let touchMove = null
let touchEnd = null

function addSwipes() {
    if (!GM_config.get("Swipes")) {
        return
    }
    let startX = 0
    let startY = 0
    let direction = null
    const sidebar = document.querySelector("#sidebar_content")
    sidebar.style.transform = "translateX(var(--touch-diff, 0px))"

    if (!location.pathname.startsWith("/changeset/")) {
        sidebar.removeEventListener("touchstart", startTouch)
        sidebar.removeEventListener("touchmove", touchMove)
        sidebar.removeEventListener("touchend", touchEnd)
        startTouch = null
        touchMove = null
        touchEnd = null
    } else {
        if (startTouch !== null) return
        startTouch = e => {
            startX = e.touches[0].clientX
            startY = e.touches[0].clientY
        }

        touchMove = e => {
            const diffY = e.changedTouches[0].clientY - startY
            const diffX = e.changedTouches[0].clientX - startX
            if (direction == null) {
                if (diffY >= 10 || diffY <= -10) {
                    direction = "v"
                } else if (diffX >= 10 || diffX <= -10) {
                    direction = "h"
                    startX = e.touches[0].clientX
                }
            } else if (direction === "h") {
                e.preventDefault()
                sidebar.style.setProperty("--touch-diff", `${diffX}px`)
            }
        }

        touchEnd = e => {
            const diffX = startX - e.changedTouches[0].clientX

            sidebar.style.removeProperty("--touch-diff")
            if (direction === "h") {
                if (diffX > sidebar.offsetWidth / 3) {
                    const navigationLinks = document.querySelectorAll("div.secondary-actions")[1]?.querySelectorAll("a")
                    if (navigationLinks && Array.from(navigationLinks).at(-1).href.includes("/changeset/")) {
                        getAbortController().abort(ABORT_ERROR_PREV)
                        Array.from(navigationLinks).at(-1).click()
                    }
                } else if (diffX < -sidebar.offsetWidth / 3) {
                    const navigationLinks = document.querySelectorAll("div.secondary-actions")[1]?.querySelectorAll("a")
                    if (navigationLinks && navigationLinks[0].href.includes("/changeset/")) {
                        getAbortController().abort(ABORT_ERROR_NEXT)
                        navigationLinks[0].click()
                    }
                }
            }
            direction = null
        }

        sidebar.addEventListener("touchstart", startTouch)
        sidebar.addEventListener("touchmove", touchMove)
        sidebar.addEventListener("touchend", touchEnd)
    }
}

/**
 * @param {string} unsafe
 * @returns {string}
 */
function escapeHtml(unsafe) {
    // prettier-ignore
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 *
 * @param {string} key
 * @param {number} ms
 * @return {Promise<void>}
 */
async function globalRateLimitByKey(key, ms) {
    // simple rate limiter
    while (true) {
        const lastReqTime = await GM.getValue(key)
        if (!lastReqTime || new Date(lastReqTime).getTime() + ms < Date.now()) {
            await GM.setValue(key, Date.now())
            break
        }
        console.log(`wait 1s for "${key}" key`)
        await abortableSleep(1000, getAbortController()) // todo extract const
    }
}
const cachedNominatimRequests = new Set()

async function geocodeCurrentView(attempts = 5) {
    if (!GM_config.get("AddLocationFromNominatim")) return
    if (location.search.includes("changesets")) return
    await interceptMapManually()
    if (getZoom() <= 10) {
        getMap().attributionControl?.setPrefix("")
        if (attempts > 0) {
            console.log(`Attempt №${7 - attempts} for geocoding`)
            setTimeout(geocodeCurrentView, 100, attempts - 1)
        } else {
            console.log("Skip geocoding")
        }
        return
    }
    const center = getMapCenter()
    const precision = getZoom() <= 15 ? 5 : 6
    const latStr = center.lat.toString().slice(0, precision)
    const lngStr = center.lng.toString().slice(0, precision)
    const url = `https://nominatim.openstreetmap.org/reverse.php?lat=${latStr}&lon=${lngStr}&format=jsonv2&zoom=10`

    console.time(`Geocoding ${latStr}, ${lngStr}`)
    if (!cachedNominatimRequests.has(url)) {
        await globalRateLimitByKey("last-geocoder-request-time", 1000)
    } else {
        console.debug(`%c${url} should be cached`, "background: #222; color: #00ff00")
    }

    fetchJSONWithCache(url, {
        signal: getAbortController().signal,
    })
        .then(r => {
            cachedNominatimRequests.add(url)
            if (r?.address?.state) {
                getMap().attributionControl?.setPrefix(`${r.address.state}`)
                console.timeEnd(`Geocoding ${latStr}, ${lngStr}`)
            }
        })
        .catch(e => {
            console.debug("Nominatim fail")
            console.debug(e)
        })
}

let iconsList = null

async function loadIconsList() {
    const url = `https://raw.githubusercontent.com/openstreetmap/openstreetmap-website/refs/heads/master/config/browse_icons.yml`
    const yml = (
        await externalFetchRetry({
            url: url,
        })
    ).responseText
    iconsList = {}
    // не, ну а почему бы и нет
    yml.match(/[\w_-]+:\s*(([\w_-]|:\*)+:(\s+{.*}\s+))*/g).forEach(tags => {
        const lines = tags.split("\n")
        lines.slice(1).forEach(i => {
            const line = i.trim()
            if (line === "") return
            const [, value, jsonValue] = line.match(/(:\*|\w+): (\{.*})/)
            iconsList[lines[0].slice(0, -1) + "=" + value] = JSON.parse(jsonValue.replaceAll(/(\w+):/g, '"$1":'))
        })
    })
    await GM.setValue("poi-icons", JSON.stringify({ icons: iconsList, cacheTime: new Date() }))
    return iconsList
}

async function initPOIIcons() {
    const cache = await GM.getValue("poi-icons", "")
    if (cache) {
        console.log("poi icons cached")
        const json = JSON.parse(cache)
        const cacheTime = new Date(json["cacheTime"])
        const oneDayLater = new Date(cacheTime.getTime() + 24 * 60 * 60 * 1000)
        if (oneDayLater < new Date()) {
            console.log("but cache outdated")
            setTimeout(loadIconsList, 0)
        }
        iconsList = json["icons"]
        return
    }
    console.log("loading icons")
    await loadIconsList()
}

/** @type {null | Map}*/
let corporatesLinks = null
/** @type {null | Map}*/
let corporateMappers = null

const corporationContributorsURL = "https://raw.githubusercontent.com/deevroman/openstreetmap-statistics/refs/heads/master/config/organised_teams_contributors.json"
const corporationContributorsSource = "https://github.com/deevroman/openstreetmap-statistics/blob/master/config/organised_teams_contributors.json"

/**
 * @param {Object} raw_data
 */
function makeCorporateMappersData(raw_data) {
    corporatesLinks = new Map()
    corporateMappers = new Map()
    for (let [kontora, { url, usernames }] of Object.entries(raw_data)) {
        corporatesLinks.set(kontora, url)
        usernames.forEach(username => {
            if (corporateMappers.has(username)) {
                corporateMappers.get(username).push(kontora)
            } else {
                corporateMappers.set(username, [kontora])
            }
        })
    }
}

async function loadAndMakeCorporateMappersList() {
    const raw_data = (
        await externalFetchRetry({
            url: corporationContributorsURL,
            responseType: "json",
        })
    ).response
    makeCorporateMappersData(raw_data)
    await GM.setValue(
        "corporate-mappers",
        JSON.stringify({
            raw_data: raw_data,
            cacheTime: new Date(),
        }),
    )
}

async function initCorporateMappersList() {
    if (corporatesLinks) return
    const cache = await GM.getValue("corporate-mappers", "")
    if (corporatesLinks) return
    if (cache) {
        console.log("corporate mappers cached")
        const json = JSON.parse(cache)
        const cacheTime = new Date(json["cacheTime"])
        const threeDaysLater = new Date(cacheTime.getTime() + 3 * 24 * 60 * 60 * 1000)
        if (threeDaysLater < new Date()) {
            console.log("but cache outdated")
            setTimeout(loadAndMakeCorporateMappersList, 0)
        }
        makeCorporateMappersData(JSON.parse(cache)["raw_data"])
        return
    }
    console.log("loading corporate mappers")
    try {
        await loadAndMakeCorporateMappersList()
    } catch (e) {
        console.log("loading corporate mappers list failed", e)
    }
}

const nodeFallback = "https://raw.githubusercontent.com/openstreetmap/openstreetmap-website/master/app/assets/images/browse/node.svg"
const wayFallback = "https://raw.githubusercontent.com/openstreetmap/openstreetmap-website/master/app/assets/images/browse/way.svg"
const relationFallback = "https://raw.githubusercontent.com/openstreetmap/openstreetmap-website/master/app/assets/images/browse/relation.svg"

/**
 *
 * @param {string} type
 * @param {[[string, string]]}tags
 * @return {[string, boolean]}
 */
function getPOIIconURL(type, tags) {
    if (!iconsList) {
        return ["", false]
    }

    function getFallback(type) {
        if (type === "node") {
            return nodeFallback
        } else if (type === "way") {
            return wayFallback
        } else if (type === "relation") {
            return relationFallback
        }
    }

    let result = undefined
    tags.forEach(([key, value]) => {
        function makeIconURL(filename) {
            return `https://raw.githubusercontent.com/openstreetmap/openstreetmap-website/master/app/assets/images/browse/` + filename
        }

        if (iconsList[key + "=" + value] === undefined) {
            if (iconsList[key + "=:*"] && !result) {
                result = [makeIconURL(iconsList[key + "=:*"]["filename"]), iconsList[key + "=:*"]["invert"]]
            }
        } else {
            result = [makeIconURL(iconsList[key + "=" + value]["filename"]), iconsList[key + "=" + value]["invert"]]
        }
    })
    return result ?? [getFallback(type), false]
}

function makeTagRow(key, value, addTd = false) {
    const tagRow = document.createElement("tr")
    const tagTh = document.createElement("th")
    const tagTd = document.createElement("td")
    tagRow.appendChild(tagTh)
    tagRow.appendChild(tagTd)
    if (addTd) {
        const td = document.createElement("td")
        td.classList.add("tag-flag")
        tagRow.appendChild(td)
    }
    tagTh.textContent = key
    tagTd.textContent = value
    return tagRow
}

function makeLinksInChangesetObjectRowClickable(row) {
    if (row.querySelector("td").textContent.match(/^https?:\/\//)) {
        const a = document.createElement("a")
        a.textContent = row.querySelector("td").textContent
        a.href = row.querySelector("td").textContent
        row.querySelector("td").textContent = ""
        a.target = "_blank"
        a.onclick = e => {
            e.stopPropagation()
            e.stopImmediatePropagation()
        }
        row.querySelector("td").appendChild(a)
    } else {
        const key = row.querySelector("th").textContent
        const valueCell = row.querySelector("td")
        if (key.startsWith("panoramax")) {
            makePanoramaxValue(valueCell)
        } else if (key.startsWith("mapillary")) {
            makeMapillaryValue(valueCell)
        } else if (key.startsWith("wikimedia_commons")) {
            makeWikimediaCommonsValue(valueCell)
        } else if (
            key.startsWith("opening_hours") || // https://github.com/opening-hours/opening_hours.js/blob/master/scripts/related_tags.txt
            key.startsWith("happy_hours") ||
            ["delivery_hours", "smoking_hours", "collection_times", "service_times"].includes(key)
        ) {
            if (key !== "opening_hours:signed" && typeof opening_hours !== "undefined") {
                try {
                    new opening_hours(valueCell.textContent, null, { tag_key: key })
                } catch (e) {
                    valueCell.title = e
                    valueCell.classList.add("fixme-tag")
                }
            }
        }
    }
}

function detectEditsWars(prevVersion, targetVersion, objHistory, row, key) {
    let revertsCounter = 0
    const warLog = document.createElement("table")
    warLog.style.borderColor = "var(--bs-body-color)"
    warLog.style.borderStyle = "solid"
    warLog.style.borderWidth = "1px"
    warLog.title = ""
    warLog.classList.add("edits-wars-log")
    for (let j = 0; j < objHistory.length; j++) {
        const it = objHistory[j]

        const prevIt = (objHistory[j - 1]?.tags ?? {})[key]
        const targetIt = (it.tags ?? {})[key]
        const prevTag = (prevVersion.tags ?? {})[key]
        // const targetTag = (targetVersion.tags ?? {})[key]

        if (prevIt === targetIt) {
            continue
        }

        if (prevTag === targetIt) {
            revertsCounter++
        }
        if (targetIt === undefined) {
            const tr = document.createElement("tr")
            tr.classList.add("quick-look-deleted-tag")
            const th_ver = document.createElement("th")
            const ver_link = document.createElement("a")
            ver_link.textContent = `v${it.version}`
            ver_link.href = `/${it.type}/${it.id}/history/${it.version}`
            ver_link.target = "_blank"
            ver_link.style.color = "unset"
            th_ver.appendChild(ver_link)
            const td_user = document.createElement("td")
            const user_link = document.createElement("a")
            user_link.textContent = `${it.user}`
            user_link.href = `/user/${it.user}`
            user_link.target = "_blank"
            user_link.style.color = "unset"
            td_user.appendChild(user_link)
            const td_tag = document.createElement("td")
            td_tag.textContent = "<deleted>"
            tr.appendChild(th_ver)
            tr.appendChild(td_user)
            tr.appendChild(td_tag)
            warLog.appendChild(tr)
        } else {
            const tr = document.createElement("tr")
            const th_ver = document.createElement("th")
            const ver_link = document.createElement("a")
            ver_link.textContent = `v${it.version}`
            ver_link.href = `/${it.type}/${it.id}/history/${it.version}`
            ver_link.target = "_blank"
            ver_link.style.color = "unset"
            th_ver.appendChild(ver_link)
            const td_user = document.createElement("td")
            const user_link = document.createElement("a")
            user_link.textContent = `${it.user}`
            user_link.href = `/user/${it.user}`
            user_link.target = "_blank"
            user_link.style.color = "unset"
            td_user.appendChild(user_link)
            const td_tag = document.createElement("td")
            td_tag.textContent = it.tags[key]
            tr.appendChild(th_ver)
            tr.appendChild(td_user)
            tr.appendChild(td_tag)
            warLog.appendChild(tr)
        }
    }
    if (revertsCounter > 3) {
        row.classList.add("edits-wars-tag")
        row.title = `Edits war. ${row.title}\nClick for details`
    }
    const tr = document.createElement("tr")
    const td = document.createElement("td")
    td.appendChild(warLog)
    td.colSpan = 3
    tr.style.display = "none"
    tr.appendChild(td)

    row.after(tr)
    row.querySelector("td.tag-flag").style.cursor = "pointer"
    row.querySelector("td.tag-flag").onclick = e => {
        e.stopPropagation()
        e.stopImmediatePropagation()
        if (e.target.getAttribute("open")) {
            tr.style.display = "none"
            e.target.removeAttribute("open")
        } else {
            tr.style.removeProperty("display")
            e.target.setAttribute("open", "true")
        }
    }
}

const emptyVersion = {
    tags: {},
    version: 0,
    lat: null,
    lon: null,
    visible: false,
}

/**
 * @param {string} targetTimestamp
 * @param {string|number} wayID
 * @return {Promise<(*[])[]>}
 */
async function getWayNodesByTimestamp(targetTimestamp, wayID) {
    const targetVersion = searchVersionByTimestamp(await getWayHistory(wayID), targetTimestamp)
    if (targetVersion === null) {
        return
    }
    if (targetVersion.visible === false) {
        return [targetVersion, currentNodesList]
    }
    const [, wayNodesHistories] = await loadWayVersionNodes(wayID, targetVersion.version)
    const targetNodes = filterObjectListByTimestamp(wayNodesHistories, targetTimestamp)

    const nodesMap = {}
    targetNodes.forEach(elem => {
        nodesMap[elem.id] = [elem.lat, elem.lon]
    })

    const currentNodesList = []
    targetVersion.nodes?.forEach(node => {
        if (node in nodesMap) {
            currentNodesList.push(nodesMap[node])
        } else {
            console.error("not found target nodes", wayID, node)
        }
    })
    return [targetVersion, currentNodesList]
}

let pinnedRelations = new Set()

/**
 * @param {Element} i
 * @param {string} objType
 * @param {NodeVersion|WayVersion|RelationVersion} prevVersion
 * @param {NodeVersion|WayVersion|RelationVersion} targetVersion
 * @param {NodeVersion|WayVersion|RelationVersion} lastVersion
 * @param {NodeVersion[]|WayVersion[]|RelationVersion[]} objHistory
 */
async function processObject(i, objType, prevVersion, targetVersion, lastVersion, objHistory) {
    const tagsTable = document.createElement("table")
    tagsTable.classList.add("quick-look")
    tagsTable.classList.toggle("hide-non-modified-tags", !allTagsOfObjectsVisible)

    const tbody = document.createElement("tbody")
    tagsTable.appendChild(tbody)

    let tagsWasChanged = false
    let changedOnlyUninterestedTags = true

    const uninterestedTags = new Set(["check_date", "check_date:opening_hours", "check_date:opening_hours", "survey:date"])

    // tags deletion
    if (prevVersion.version !== 0) {
        for (const [key, value] of Object.entries(prevVersion?.tags ?? {})) {
            if (targetVersion.tags === undefined || targetVersion.tags[key] === undefined) {
                const row = makeTagRow(key, value, true)
                row.classList.add("quick-look-deleted-tag")
                tbody.appendChild(row)
                tagsWasChanged = true
                changedOnlyUninterestedTags = false
                if (lastVersion.tags && lastVersion.tags[key] === prevVersion.tags[key]) {
                    row.classList.add("restored-tag")
                    row.title = row.title + "The tag is now restored"
                }
                makeLinksInChangesetObjectRowClickable(row)
                detectEditsWars(prevVersion, targetVersion, objHistory, row, key)
            }
        }
    }
    // tags add/modification
    for (const [key, value] of Object.entries(targetVersion.tags ?? {})) {
        const row = makeTagRow(key, value, true)
        if (prevVersion.tags === undefined || prevVersion.tags[key] === undefined) {
            tagsWasChanged = true
            if (!uninterestedTags.has(key)) {
                changedOnlyUninterestedTags = false
            }
            row.classList.add("quick-look-new-tag")
            if (!lastVersion.tags || lastVersion.tags[key] !== targetVersion.tags[key]) {
                if (lastVersion.tags && lastVersion.tags[key]) {
                    row.classList.add("replaced-tag")
                    row.title = `Now is ${key}=${lastVersion.tags[key]}`
                } else if (lastVersion.visible !== false) {
                    row.classList.add("removed-tag")
                    row.title = `The tag is now deleted`
                }
            }
            makeLinksInChangesetObjectRowClickable(row)
            tbody.appendChild(row)
            detectEditsWars(prevVersion, targetVersion, objHistory, row, key)
        } else if (prevVersion.tags[key] !== value) {
            // todo reverted changes
            const valCell = row.querySelector("td")
            if (!uninterestedTags.has(key)) {
                changedOnlyUninterestedTags = false
            }
            row.classList.add("quick-look-modified-tag")
            // toReversed is dirty hack for group inserted/deleted symbols https://osm.org/changeset/157338007
            const diff = arraysDiff(Array.from(prevVersion.tags[key]).toReversed(), Array.from(valCell.textContent).toReversed(), 1).toReversed()
            // for one character diff
            // example: https://osm.org/changeset/157002657
            // prettier-ignore
            if (valCell.textContent.length > 1 && prevVersion.tags[key].length > 1
                && (
                    diff.length === valCell.textContent.length && prevVersion.tags[key].length === valCell.textContent.length
                    && diff.reduce((cnt, b) => cnt + (b[0] !== b[1]), 0) === 1
                    || diff.reduce((cnt, b) => cnt + (b[0] !== b[1] && b[0] !== null), 0) === 0
                    || diff.reduce((cnt, b) => cnt + (b[0] !== b[1] && b[1] !== null), 0) === 0
                )) {
                const prevText = document.createElement("span")
                const newText = document.createElement("span")
                prevText.dir = "auto"
                newText.dir = "auto"
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
                valCell.textContent = ""
                valCell.appendChild(prevText)
                valCell.appendChild(document.createTextNode(` ${arrowSymbolForChanges} `))
                valCell.appendChild(newText)
            } else {
                const prevSpan = document.createElement("span")
                prevSpan.dir = "auto"
                prevSpan.textContent = prevVersion.tags[key]
                const newSpan = document.createElement("span")
                newSpan.dir = "auto"
                newSpan.textContent = valCell.textContent
                valCell.textContent = ""
                valCell.appendChild(prevSpan)
                valCell.appendChild(document.createTextNode(` ${arrowSymbolForChanges} `))
                valCell.appendChild(newSpan)
            }
            valCell.title = "was: " + prevVersion.tags[key]
            tagsWasChanged = true
            if (!lastVersion.tags || lastVersion.tags[key] !== targetVersion.tags[key]) {
                if (lastVersion.tags && prevVersion.tags && lastVersion.tags[key] === prevVersion.tags[key]) {
                    row.classList.add("reverted-tag")
                    row.title = `The tag is now reverted`
                } else if (lastVersion.tags && lastVersion.tags[key]) {
                    row.classList.add("replaced-tag")
                    row.title = `Now is ${key}=${lastVersion.tags[key]}`
                } else if (lastVersion.visible !== false) {
                    row.classList.add("removed-tag")
                    row.title = `The tag is now deleted`
                }
            }
            tbody.appendChild(row)
            detectEditsWars(prevVersion, targetVersion, objHistory, row, key)
        } else {
            row.classList.add("non-modified-tag-in-quick-view")
            makeLinksInChangesetObjectRowClickable(row)
            tbody.appendChild(row)
        }
    }
    if (targetVersion.visible !== false && prevVersion?.nodes && prevVersion.nodes.toString() !== targetVersion.nodes?.toString()) {
        const geomChangedFlag = document.createElement("span")
        geomChangedFlag.textContent = " 📐"
        geomChangedFlag.tabIndex = 0
        geomChangedFlag.classList.add("nodes-changed")
        geomChangedFlag.title = "List of way nodes has been changed"
        geomChangedFlag.style.userSelect = "none"
        geomChangedFlag.style.background = "rgba(223, 238, 9, 0.6)"
        geomChangedFlag.style.cursor = "pointer"

        const nodesTable = document.createElement("table")
        nodesTable.classList.add("way-nodes-table")
        nodesTable.style.display = "none"
        const tbody = document.createElement("tbody")
        nodesTable.style.borderWidth = "2px"
        nodesTable.onclick = e => {
            e.stopPropagation()
        }
        tbody.style.borderWidth = "2px"
        nodesTable.appendChild(tbody)

        function makeWayDiffRow(left, right) {
            const row = document.createElement("tr")
            const tagTd = document.createElement("td")
            const tagTd2 = document.createElement("td")
            tagTd.style.borderWidth = "2px"
            tagTd2.style.borderWidth = "2px"
            row.style.borderWidth = "2px"
            row.appendChild(tagTd)
            row.appendChild(tagTd2)
            tagTd.textContent = left
            tagTd2.textContent = right
            tagTd.style.textAlign = "right"
            tagTd2.style.textAlign = "right"

            if (typeof left === "number") {
                tagTd.onmouseenter = async e => {
                    e.stopPropagation() // fixme
                    e.target.classList.add("way-version-node")
                    const targetTimestamp = new Date(new Date(changesetMetadatas[targetVersion.changeset].created_at).getTime() - 1).toISOString()
                    const version = searchVersionByTimestamp(await getNodeHistory(left), targetTimestamp)
                    showActiveNodeMarker(version.lat.toString(), version.lon.toString(), c("#ff00e3"))
                }
                tagTd.onclick = async e => {
                    e.stopPropagation() // fixme
                    const targetTimestamp = new Date(new Date(changesetMetadatas[targetVersion.changeset].created_at).getTime() - 1).toISOString()
                    const version = searchVersionByTimestamp(await getNodeHistory(left), targetTimestamp)
                    panTo(version.lat.toString(), version.lon.toString())
                }
                tagTd.onmouseleave = e => {
                    e.target.classList.remove("way-version-node")
                }
            } else {
                tagTd.onclick = e => {
                    e.stopPropagation()
                }
            }

            if (typeof right === "number") {
                tagTd2.onmouseenter = async e => {
                    e.stopPropagation() // fixme
                    e.target.classList.add("way-version-node")
                    const version = searchVersionByTimestamp(await getNodeHistory(right), changesetMetadatas[targetVersion.changeset].closed_at ?? new Date().toISOString())
                    showActiveNodeMarker(version.lat.toString(), version.lon.toString(), c("#ff00e3"))
                }
                tagTd2.onclick = async e => {
                    e.stopPropagation() // fixme
                    e.target.classList.add("way-version-node")
                    const version = searchVersionByTimestamp(await getNodeHistory(right), changesetMetadatas[targetVersion.changeset].closed_at ?? new Date().toISOString())
                    panTo(version.lat.toString(), version.lon.toString())
                }
                tagTd2.onmouseleave = e => {
                    e.target.classList.remove("way-version-node")
                }
            } else {
                tagTd2.onclick = e => {
                    e.stopPropagation()
                }
            }

            return row
        }

        let haveOnlyInsertion = true
        let haveOnlyDeletion = true
        const lineWasReversed = JSON.stringify(prevVersion.nodes.toReversed()) === JSON.stringify(targetVersion.nodes)
        if (lineWasReversed) {
            const row = makeWayDiffRow("", "🔃")
            row.querySelectorAll("td").forEach(i => (i.style.textAlign = "center"))
            row.querySelector("td:nth-of-type(2)").title = "Nodes of the way were reversed"
            tbody.appendChild(row)

            prevVersion.nodes.forEach((i, index) => {
                const row = makeWayDiffRow(i, targetVersion.nodes[index])
                row.querySelector("td:nth-of-type(2)").style.background = "rgba(223, 238, 9, 0.6)"
                row.style.fontFamily = "monospace"
                tbody.appendChild(row)
            })
            haveOnlyInsertion = false
            haveOnlyDeletion = false
        } else {
            arraysDiff(prevVersion.nodes ?? [], targetVersion.nodes ?? []).forEach(i => {
                const row = makeWayDiffRow(i[0], i[1])
                if (i[0] === null) {
                    row.style.background = c("rgba(17, 238, 9, 0.6)", ".nodes-changed-row")
                    haveOnlyDeletion = false
                } else if (i[1] === null) {
                    row.style.background = c("rgba(238, 51, 9, 0.6)", ".nodes-changed-row")
                    haveOnlyInsertion = false
                } else if (i[0] !== i[1]) {
                    row.style.background = "rgba(223, 238, 9, 0.6)" // never executed?
                    haveOnlyInsertion = false
                    haveOnlyDeletion = false
                }
                row.style.fontFamily = "monospace"
                tbody.appendChild(row)
            })
        }
        if (haveOnlyInsertion) {
            if (isDarkMode()) {
                geomChangedFlag.style.background = c("rgba(17, 238, 9, 0.3)", ".nodes-changed-flag")
            } else {
                geomChangedFlag.style.background = c("rgba(101, 238, 9, 0.6)", ".nodes-changed-flag")
            }
        } else if (haveOnlyDeletion) {
            if (isDarkMode()) {
                geomChangedFlag.style.background = c("rgba(238, 51, 9, 0.4)", ".nodes-changed-flag")
            } else {
                geomChangedFlag.style.background = c("rgba(238, 9, 9, 0.42)", ".nodes-changed-flag")
            }
        }

        const tagsTable = document.createElement("table")
        tagsTable.style.display = "none"
        const tbodyForTags = document.createElement("tbody")
        tagsTable.appendChild(tbodyForTags)

        Object.entries(targetVersion.tags ?? {}).forEach(([k, v]) => {
            const row = makeTagRow(k, v)
            makeLinksInChangesetObjectRowClickable(row)
            tbodyForTags.appendChild(row)
        })

        geomChangedFlag.onkeypress = geomChangedFlag.onclick = e => {
            if (e.type === "keypress" && (e.code === "Space" || e.code === "Enter")) {
                e.preventDefault()
            } else if (e.type === "keypress") {
                return
            }
            e.stopPropagation()
            if (nodesTable.style.display === "none") {
                nodesTable.style.display = ""
                tagsTable.style.display = ""
            } else {
                nodesTable.style.display = "none"
                tagsTable.style.display = "none"
            }
        }

        i.appendChild(geomChangedFlag)

        geomChangedFlag.after(nodesTable)
        geomChangedFlag.after(tagsTable)
        if (lineWasReversed) {
            geomChangedFlag.after(document.createTextNode(["ru-RU", "ru"].includes(navigator.language) ? " ⓘ Линию перевернули" : "ⓘ The line has been reversed"))
        }
    }
    if (objType === "way" && targetVersion.visible !== false) {
        if (prevVersion.nodes && prevVersion.nodes.length !== targetVersion.nodes?.length) {
            i.title += (i.title === "" ? "" : "\n") + `Nodes count: ${prevVersion.nodes.length} → ${targetVersion.nodes.length}`
        } else {
            i.title += (i.title === "" ? "" : "\n") + `Nodes count: ${targetVersion.nodes.length}`
        }
    }
    if (prevVersion.visible === false && targetVersion?.visible !== false && targetVersion.version !== 1) {
        const restoredElemFlag = document.createElement("span")
        restoredElemFlag.textContent = " ♻️"
        restoredElemFlag.title = "Object was restored"
        restoredElemFlag.style.userSelect = "none"
        i.appendChild(restoredElemFlag)
    }
    if (objType === "relation") {
        const memChangedFlag = document.createElement("span")
        memChangedFlag.textContent = " 👥"
        memChangedFlag.tabIndex = 0
        memChangedFlag.classList.add("members-changed")
        memChangedFlag.style.userSelect = "none"
        let membersChanged = false
        if (JSON.stringify(prevVersion?.members ?? []) !== JSON.stringify(targetVersion.members) && targetVersion.version !== 1) {
            memChangedFlag.style.background = "rgba(223, 238, 9, 0.6)"
            memChangedFlag.title = "List of relation members has been changed.\nClick to see more details"
            membersChanged = true
        } else {
            memChangedFlag.title = "Show list of relation members"
        }
        memChangedFlag.style.cursor = "pointer"

        const membersTable = document.createElement("table")
        membersTable.classList.add("relation-members-table")
        membersTable.style.display = "none"
        const tbody = document.createElement("tbody")
        membersTable.style.borderWidth = "2px"
        tbody.style.borderWidth = "2px"
        membersTable.appendChild(tbody)

        /**
         * @param {RelationMember} member
         */
        function getIcon(member) {
            if (member?.type === "node") {
                return nodeIcon
            } else if (member?.type === "way") {
                return wayIcon
            } else if (member?.type === "relation") {
                return relationIcon
            } else {
                console.error(member)
                console.trace()
            }
        }

        /**
         * @param {string|RelationMember} left
         * @param {string|RelationMember} right
         */
        function makeRelationDiffRow(left, right) {
            const row = document.createElement("tr")
            const tagTd = document.createElement("td")
            const tagTd2 = document.createElement("td")
            tagTd.style.borderWidth = "2px"
            tagTd2.style.borderWidth = "2px"
            row.style.borderWidth = "2px"
            row.appendChild(tagTd)
            row.appendChild(tagTd2)

            const leftRefSpan = document.createElement("span")
            leftRefSpan.classList.add("rel-ref")
            leftRefSpan.textContent = `${left?.ref ?? ""} `
            const leftRoleSpan = document.createElement("span")
            leftRoleSpan.classList.add("rel-role")
            leftRoleSpan.textContent = `${left?.role ?? ""}`

            tagTd.appendChild(leftRefSpan)
            tagTd.appendChild(leftRoleSpan)

            if (left && typeof left === "object") {
                const icon = document.createElement("img")
                icon.src = getIcon(left)
                icon.style.height = "1em"
                icon.style.marginLeft = "1px"
                icon.style.marginTop = "-3px"
                tagTd.appendChild(icon)
            }

            const rightRefSpan = document.createElement("span")
            rightRefSpan.textContent = `${right?.ref ?? ""} `
            rightRefSpan.classList.add("rel-ref")
            const rightRoleSpan = document.createElement("span")
            rightRoleSpan.textContent = `${right?.role ?? ""}`
            rightRoleSpan.classList.add("rel-role")

            tagTd2.appendChild(rightRefSpan)
            tagTd2.appendChild(rightRoleSpan)

            if (right && typeof right === "object") {
                const icon = document.createElement("img")
                icon.src = getIcon(right)
                icon.style.height = "1em"
                icon.style.marginLeft = "1px"
                icon.style.marginTop = "-3px"
                tagTd2.appendChild(icon)
            }
            tagTd2.style.cursor = ""
            tagTd.style.textAlign = "right"
            tagTd2.style.textAlign = "right"

            if (left && typeof left === "object") {
                tagTd.onmouseenter = async e => {
                    e.stopPropagation()
                    e.target.classList.add("relation-version-node")
                    const targetTimestamp = new Date(new Date(changesetMetadatas[targetVersion.changeset].created_at).getTime() - 1).toISOString()
                    if (left.type === "node") {
                        const version = searchVersionByTimestamp(await getNodeHistory(left.ref), targetTimestamp)
                        showActiveNodeMarker(version.lat.toString(), version.lon.toString(), c("#ff00e3"))
                        tagTd.title = ""
                        for (let tagsKey in version.tags ?? {}) {
                            tagTd.title += `${tagsKey}=${version.tags[tagsKey]}\n`
                        }
                    } else if (left.type === "way") {
                        const [, currentNodesList] = await getWayNodesByTimestamp(targetTimestamp, left.ref)
                        showActiveWay(cloneInto(currentNodesList, unsafeWindow))
                        const version = searchVersionByTimestamp(await getWayHistory(left.ref), targetTimestamp)
                        tagTd.title = ""
                        for (let tagsKey in version.tags ?? {}) {
                            tagTd.title += `${tagsKey}=${version.tags[tagsKey]}\n`
                        }
                    } else if (left.type === "relation") {
                        // todo
                    }
                }

                tagTd.onmouseleave = e => {
                    e.target.classList.remove("relation-version-node")
                }
                tagTd.onclick = async e => {
                    e.stopPropagation()
                    const targetTimestamp = new Date(new Date(changesetMetadatas[targetVersion.changeset].created_at).getTime() - 1).toISOString()
                    if (left.type === "node") {
                        const version = searchVersionByTimestamp(await getNodeHistory(left.ref), targetTimestamp)
                        panTo(version.lat.toString(), version.lon.toString())
                    } else if (left.type === "way") {
                        const [, currentNodesList] = await getWayNodesByTimestamp(targetTimestamp, left.ref)
                        showActiveWay(cloneInto(currentNodesList, unsafeWindow), c("#ff00e3"), true)
                    }
                }
            }

            if (right && typeof right === "object") {
                tagTd2.onmouseenter = async e => {
                    e.stopPropagation() // fixme
                    e.target.classList.add("relation-version-node")
                    const targetTimestamp = new Date(changesetMetadatas[targetVersion.changeset].closed_at ?? new Date()).toISOString()
                    if (right.type === "node") {
                        const version = searchVersionByTimestamp(await getNodeHistory(right.ref), targetTimestamp)
                        showActiveNodeMarker(version.lat.toString(), version.lon.toString(), c("#ff00e3"))
                        tagTd2.title = ""
                        for (let tagsKey in version.tags ?? {}) {
                            tagTd2.title += `${tagsKey}=${version.tags[tagsKey]}\n`
                        }
                    } else if (right.type === "way") {
                        const [, currentNodesList] = await getWayNodesByTimestamp(targetTimestamp, right.ref)
                        showActiveWay(cloneInto(currentNodesList, unsafeWindow))
                        const version = searchVersionByTimestamp(await getWayHistory(right.ref), targetTimestamp)
                        tagTd2.title = ""
                        for (let tagsKey in version.tags ?? {}) {
                            tagTd2.title += `${tagsKey}=${version.tags[tagsKey]}\n`
                        }
                    } else if (right.type === "relation") {
                        // todo
                    }
                }
                tagTd2.onmouseleave = e => {
                    e.target.classList.remove("relation-version-node")
                }
                tagTd2.onclick = async e => {
                    e.stopPropagation()
                    const targetTimestamp = new Date(changesetMetadatas[targetVersion.changeset].closed_at ?? new Date()).toISOString()
                    if (right.type === "node") {
                        const version = searchVersionByTimestamp(await getNodeHistory(right.ref), targetTimestamp)
                        panTo(version.lat.toString(), version.lon.toString())
                    } else if (right.type === "way") {
                        const [, currentNodesList] = await getWayNodesByTimestamp(targetTimestamp, right.ref)
                        showActiveWay(cloneInto(currentNodesList, unsafeWindow), c("#ff00e3"), true)
                    }
                }
            }

            return row
        }

        let haveOnlyInsertion = true
        let haveOnlyDeletion = true

        function colorizeFlag() {
            if (haveOnlyInsertion && membersChanged && targetVersion.version !== 1) {
                if (isDarkMode()) {
                    memChangedFlag.style.background = c("rgba(17, 238, 9, 0.3)", ".members-changed-flag")
                } else {
                    memChangedFlag.style.background = c("rgba(101, 238, 9, 0.6)", ".members-changed-flag")
                }
            } else if (haveOnlyDeletion && membersChanged) {
                if (isDarkMode()) {
                    memChangedFlag.style.background = c("rgba(238, 51, 9, 0.4)", ".members-changed-flag")
                } else {
                    memChangedFlag.style.background = c("rgba(238, 9, 9, 0.42)", ".members-changed-flag")
                }
            }
        }

        if (JSON.stringify((prevVersion?.members ?? []).toReversed()) === JSON.stringify(targetVersion.members)) {
            // members reversed
            const row = makeRelationDiffRow("", "🔃")
            row.querySelectorAll("td").forEach(i => (i.style.textAlign = "center"))
            row.querySelector("td:nth-of-type(2)").title = "Members of the relation were reversed"
            tbody.appendChild(row)

            prevVersion?.members?.forEach((i, index) => {
                const row = makeRelationDiffRow(i, targetVersion.members[index])
                row.querySelector("td:nth-of-type(2)").style.background = "rgba(223, 238, 9, 0.6)"
                row.style.fontFamily = "monospace"
                tbody.appendChild(row)
            })
            haveOnlyInsertion = false
            haveOnlyDeletion = false
            colorizeFlag()
        } else {
            memChangedFlag.style.display = "none"
            setTimeout(() => {
                arraysDiff(prevVersion?.members ?? [], targetVersion.members ?? []).forEach(i => {
                    const row = makeRelationDiffRow(i[0], i[1])
                    if (i[0] === null) {
                        row.style.background = c("rgba(17, 238, 9, 0.6)", ".members-changed-row")
                        haveOnlyDeletion = false
                    } else if (i[1] === null) {
                        row.style.background = c("rgba(238, 51, 9, 0.6)", ".members-changed-row")
                        haveOnlyInsertion = false
                    } else if (JSON.stringify(i[0]) !== JSON.stringify(i[1])) {
                        if (i[0].ref === i[1].ref && i[0].type === i[1].type) {
                            row.querySelectorAll(".rel-role").forEach(i => {
                                i.style.background = "rgba(223, 238, 9, 0.6)"
                                if (isDarkMode()) {
                                    i.style.color = "black"
                                }
                            })
                        } else {
                            row.style.background = "rgba(223, 238, 9, 0.6)"
                            if (isDarkMode()) {
                                row.style.color = "black"
                            }
                        }
                        haveOnlyInsertion = false
                        haveOnlyDeletion = false
                    }
                    row.style.fontFamily = "monospace"
                    tbody.appendChild(row)
                })
                memChangedFlag.style.display = ""
                colorizeFlag()
            })
        }

        const tagsTable = document.createElement("table")
        tagsTable.style.display = "none"
        const tbodyForTags = document.createElement("tbody")
        tagsTable.appendChild(tbodyForTags)

        Object.entries(targetVersion.tags ?? {}).forEach(([k, v]) => {
            const row = makeTagRow(k, v)
            makeLinksInChangesetObjectRowClickable(row)
            tbodyForTags.appendChild(row)
        })

        memChangedFlag.onkeypress = memChangedFlag.onclick = e => {
            if (e.type === "keypress" && (e.code === "Space" || e.code === "Enter")) {
                e.preventDefault()
            } else if (e.type === "keypress") {
                return
            }
            // todo preload first elements
            e.stopPropagation()
            if (membersTable.style.display === "none") {
                membersTable.style.display = ""
                tagsTable.style.display = ""
            } else {
                membersTable.style.display = "none"
                tagsTable.style.display = "none"
            }
        }

        i.appendChild(memChangedFlag)
        const pinRelation = document.createElement("span")
        pinRelation.textContent = "📌"
        pinRelation.tabIndex = 0
        pinRelation.classList.add("pin-relation")
        pinRelation.style.cursor = "pointer"
        pinRelation.style.display = "none"
        pinRelation.title = "Pin relation on map"
        pinRelation.onkeypress = pinRelation.onclick = async e => {
            if (e.type === "keypress" && (e.code === "Space" || e.code === "Enter")) {
                e.preventDefault()
            } else if (e.type === "keypress") {
                return
            }
            e.stopImmediatePropagation()
            if (!pinRelation.classList.contains("pinned")) {
                pinnedRelations.add(targetVersion.id)
                pinRelation.style.cursor = "progress"
                const color = darkModeForMap && isDarkMode() ? "#000" : "#373737"
                await loadRelationVersionMembersViaOverpass(targetVersion.id, targetVersion.timestamp, false, color, `customObjects/${targetVersion.id}`, darkModeForMap && isDarkMode())
                pinRelation.style.cursor = "pointer"
                pinRelation.classList.add("pinned")
                pinRelation.textContent = "📍"
                pinRelation.title = "Unpin relation from map"
            } else {
                pinRelation.title = "Pin relation on map"
                pinRelation.classList.remove("pinned")
                pinRelation.textContent = "📌"
                cleanObjectsByKey(`customObjects/${targetVersion.id}`)
                pinnedRelations.delete(targetVersion.id)
            }
        }
        memChangedFlag.after(pinRelation)

        pinRelation.after(membersTable)
        if (membersChanged) {
            pinRelation.after(tagsTable)
        }
    }
    if (targetVersion.lat && prevVersion.lat && (prevVersion.lat !== targetVersion.lat || prevVersion.lon !== targetVersion.lon)) {
        i.parentElement.parentElement.classList.add("location-modified")
        const locationChangedFlag = document.createElement("span")
        // prettier-ignore
        const distInMeters = getDistanceFromLatLonInKm(
            prevVersion.lat,
            prevVersion.lon,
            targetVersion.lat,
            targetVersion.lon,
        ) * 1000;
        locationChangedFlag.textContent = ` 📍${distInMeters.toFixed(1)}m`
        locationChangedFlag.title = "Coordinates of node has been changed"
        locationChangedFlag.classList.add("location-modified-marker")
        // if (distInMeters > 100) {
        //     locationChangedFlag.classList.add("location-modified-marker-warn")
        // }
        locationChangedFlag.style.userSelect = "none"
        if (isDarkMode()) {
            locationChangedFlag.style.background = "rgba(223, 238, 9, 0.6)"
            locationChangedFlag.style.color = "black"
        } else {
            locationChangedFlag.style.background = "rgba(223, 238, 9, 0.6)"
        }
        i.appendChild(locationChangedFlag)
        locationChangedFlag.onmouseover = e => {
            e.stopPropagation()
            e.stopImmediatePropagation()
            showActiveNodeMarker(targetVersion.lat.toString(), targetVersion.lon.toString(), c("#ff00e3"))
            showActiveNodeMarker(prevVersion.lat.toString(), prevVersion.lon.toString(), c("#0022ff"), false)
        }
        locationChangedFlag.onclick = e => {
            e.stopPropagation()
            e.stopImmediatePropagation()
            fitBoundsWithPadding(
                [
                    [prevVersion.lat.toString(), prevVersion.lon.toString()],
                    [targetVersion.lat.toString(), targetVersion.lon.toString()],
                ],
                30,
            )
        }
        if (lastVersion.visible !== false && prevVersion.lat === lastVersion.lat && prevVersion.lon === lastVersion.lon) {
            locationChangedFlag.classList.add("reverted-coordinates")
            locationChangedFlag.title += ",\nbut now they have been restored."
        }
    }
    if (targetVersion.visible === false) {
        i.parentElement.parentElement.classList.add("removed-object")
    }
    // https://osm.org/changeset/169708866
    if (targetVersion.version !== lastVersion.version && lastVersion.visible === false) {
        const objDeletedBadge = document.createElement("span")
        if (targetVersion.user === lastVersion.user) {
            objDeletedBadge.textContent = ["ru-RU", "ru"].includes(navigator.language) ? " ⓘ Автор уже удалил объект" : " ⓘ The object is now deleted by author"
        } else {
            objDeletedBadge.textContent = ["ru-RU", "ru"].includes(navigator.language) ? " ⓘ Объект уже удалён" : " ⓘ The object is now deleted"
        }
        objDeletedBadge.title = ["ru-RU", "ru"].includes(navigator.language) ? `${lastVersion.user} удалил этот объект` : `${lastVersion.user} deleted this object`
        i.appendChild(objDeletedBadge)
    }
    if (targetVersion.visible === false && lastVersion.visible !== false) {
        const objRestoredBadge = document.createElement("span")
        objRestoredBadge.textContent = ["ru-RU", "ru"].includes(navigator.language) ? " ⓘ Объект сейчас восстановлен" : " ⓘ The object is now restored"
        let lastRestoredVersion
        for (let versionInd = 1; versionInd < objHistory.length; versionInd++) {
            if (objHistory[versionInd].version <= targetVersion.version) {
                continue
            }
            if (objHistory[versionInd - 1].visible === false && objHistory[versionInd].visible !== false) {
                lastRestoredVersion = objHistory[versionInd]
            }
        }
        if (lastRestoredVersion) {
            if (lastRestoredVersion.user === targetVersion.user) {
                objRestoredBadge.textContent = ["ru-RU", "ru"].includes(navigator.language) ? " ⓘ Автор уже восстановил объект" : " ⓘ The object is now restored by author"
            } else {
                objRestoredBadge.title = ["ru-RU", "ru"].includes(navigator.language) ? `${lastVersion.user} восстановил этот объект` : `${lastVersion.user} restored this object`
            }
        }
        i.appendChild(objRestoredBadge)
    }
    // if (objType === "node") {
    //     i.appendChild(tagsTable)
    // }
    if (targetVersion.tags?.["type"] === "restriction") {
        const key = Object.keys(targetVersion.tags).find(k => k === "restriction") ?? Object.keys(targetVersion.tags).find(k => k.startsWith("restriction"))
        if (key && restrictionsSignImages[key]) {
            void fetchTextWithCache(restrictionsSignImages[key])
        }
    }
    if (tagsWasChanged) {
        i.appendChild(tagsTable)
        if (changedOnlyUninterestedTags) {
            i.parentElement.parentElement.classList.add("tags-uninterested-modified")
        }
    } else {
        i.parentElement.parentElement.classList.add("tags-non-modified")
    }
    i.parentElement.parentElement.classList.add("tags-processed-object")
    return tagsTable
}

/**
 * @typedef {{
 * nodes: Array<HTMLElement>,
 * ways: Array<HTMLElement>,
 * relations: Array<HTMLElement>
 * }} ObjectsInComments
 */

/**
 * @param {string} changesetID
 * @param {string} objType
 * @param {ObjectsInComments} objectsInComments
 * @param {Element} i
 * @param {NodeVersion|WayVersion|RelationVersion} prevVersion
 * @param {NodeVersion|WayVersion|RelationVersion} targetVersion
 * @param {NodeVersion[]|WayVersion[]|RelationVersion[]} objHistory
 */
async function processObjectInteractions(changesetID, objType, objectsInComments, i, prevVersion, targetVersion, objHistory) {
    let changesetMetadata = changesetMetadatas[targetVersion.changeset]
    if (!GM_config.get("ShowChangesetGeometry")) {
        i.parentElement.parentElement.classList.add("processed-object")
        return
    }
    /**
     * @type {[string, string, string, string]}
     */
    const m = i.querySelector("a:nth-of-type(2)").href.match(/(node|way|relation)\/(\d+)\/history\/(\d+)$/)
    const [, , objID, strVersion] = m
    const version = parseInt(strVersion)
    i.parentElement.parentElement.ondblclick = e => {
        if (e.altKey) return
        if ((e.target.nodeName === "TH" || e.target.nodeName === "TD") && i.querySelector("[contenteditable]")) return
        if (changesetMetadatas[targetVersion.changeset]) {
            fitBounds([
                [changesetMetadatas[targetVersion.changeset].min_lat, changesetMetadatas[targetVersion.changeset].min_lon],
                [changesetMetadatas[targetVersion.changeset].max_lat, changesetMetadatas[targetVersion.changeset].max_lon],
            ])
        }
    }

    function processNode() {
        i.id = `${changesetID}n${objID}`

        function mouseoverHandler(e) {
            if (e.relatedTarget?.parentElement === e.target) {
                return
            }
            if (targetVersion.visible === false) {
                if (prevVersion.visible !== false) {
                    showActiveNodeMarker(prevVersion.lat.toString(), prevVersion.lon.toString(), c("#0022ff"))
                    const direction = prevVersion.tags?.["direction"] ?? prevVersion.tags?.["camera:direction"]
                    if (direction) {
                        renderDirectionTag(prevVersion.lat, prevVersion.lon, direction, c("#0022ff"))
                    }
                }
            } else {
                showActiveNodeMarker(targetVersion.lat.toString(), targetVersion.lon.toString(), c("#ff00e3"))
                const direction = targetVersion.tags?.["direction"] ?? targetVersion.tags?.["camera:direction"]
                if (direction) {
                    renderDirectionTag(targetVersion.lat, targetVersion.lon, direction, c("#ff00e3"))
                }
            }
            resetMapHover()
        }

        i.parentElement.parentElement.onmouseover = mouseoverHandler
        if ((prevVersion.tags && Object.keys(prevVersion.tags).length) || (targetVersion.tags && Object.keys(targetVersion.tags).length)) {
            // todo temp hack for potential speed up // fixme remove comment
            objectsInComments.nodes
                .filter(i => i.href.includes(`node/${objID}`))
                .forEach(link => {
                    // link.title = "Alt + click for scroll into object list"
                    link.onmouseenter = mouseoverHandler
                    link.onclick = e => {
                        if (!e.altKey) return
                        i.scrollIntoView()
                    }
                })
        }
        i.parentElement.parentElement.onclick = e => {
            if (e.altKey) return
            if (window.getSelection().type === "Range") return
            if ((e.target.nodeName === "TH" || e.target.nodeName === "TD") && i.querySelector("[contenteditable]")) return

            document.querySelector("#element_versions_list > div.active-object")?.classList?.remove()
            i.parentElement.parentElement.classList.add("active-object")

            if (prevVersion.visible !== false && targetVersion.visible !== false) {
                fitBoundsWithPadding(
                    [
                        [prevVersion.lat.toString(), prevVersion.lon.toString()],
                        [targetVersion.lat.toString(), targetVersion.lon.toString()],
                    ],
                    30,
                )
                showActiveNodeMarker(prevVersion.lat.toString(), prevVersion.lon.toString(), c("#0022ff"), true)
                showActiveNodeMarker(targetVersion.lat.toString(), targetVersion.lon.toString(), c("#ff00e3"), false)
                const direction = prevVersion.tags?.["direction"] ?? prevVersion.tags?.["camera:direction"]
                if (direction) {
                    renderDirectionTag(prevVersion.lat, prevVersion.lon, direction, c("#0022ff"))
                }
                const newDirection = targetVersion.tags?.["direction"] ?? targetVersion.tags?.["camera:direction"]
                if (direction) {
                    renderDirectionTag(targetVersion.lat, targetVersion.lon, newDirection, c("#ff00e3"))
                }
            } else if (targetVersion.visible === false) {
                panTo(prevVersion.lat.toString(), prevVersion.lon.toString(), 18, false)
                showActiveNodeMarker(prevVersion.lat.toString(), prevVersion.lon.toString(), c("#0022ff"), true)
                const direction = prevVersion.tags?.["direction"] ?? prevVersion.tags?.["camera:direction"]
                if (direction) {
                    renderDirectionTag(prevVersion.lat, prevVersion.lon, direction, c("#0022ff"))
                }
            } else {
                if (!repeatedEvent && trustedEvent) {
                    // todo
                    panTo(targetVersion.lat.toString(), targetVersion.lon.toString(), 18, false)
                } else {
                    /*
                    const bounds = getMap().getBounds()
                    const lat1 = bounds.getNorthWest().lat
                    const lng1 = bounds.getNorthWest().lng
                    const lat2 = bounds.getSouthEast().lat
                    const lng2 = bounds.getSouthEast().lng

                    const delta_lat = (lat2 - lat1) / 5.0
                    const delta_lng = (lng2 - lng1) / 5.0

                    const newBounds = getWindow().L.latLngBounds(
                        intoPage([lat1 + delta_lat, lng1 + delta_lng]),
                        intoPage([lat2 - delta_lat, lng2 - delta_lng])
                    )

                    getWindow().L.rectangle(
                        intoPage([
                            [newBounds.getSouth(), newBounds.getWest()],
                            [newBounds.getNorth(), newBounds.getEast()]
                        ]),
                        intoPage({color: "#0022ff", weight: 3, fillOpacity: 0})
                    ).addTo(getMap());

                    if (!newBounds.contains(getWindow().L.latLng(intoPage([targetVersion.lat.toString(), targetVersion.lon.toString()])))) {
                        panTo(targetVersion.lat.toString(), targetVersion.lon.toString(), 18, false)
                    }
                    */
                    // panInside(targetVersion.lat.toString(), targetVersion.lon.toString(), false, [70, 70])
                    panTo(targetVersion.lat.toString(), targetVersion.lon.toString(), 18, false)
                }
                showActiveNodeMarker(targetVersion.lat.toString(), targetVersion.lon.toString(), c("#ff00e3"), true)
                const direction = targetVersion.tags?.["direction"] ?? targetVersion.tags?.["camera:direction"]
                if (direction) {
                    renderDirectionTag(targetVersion.lat, targetVersion.lon, direction, c("#ff00e3"))
                }
            }
        }
        if (!location.pathname.includes("changeset")) {
            return
        }
        if (targetVersion.visible === false) {
            if (targetVersion.version !== 1 && prevVersion.visible !== false) {
                // даа, такое есть https://www.openstreetmap.org/node/300524/history
                if (prevVersion.tags) {
                    showNodeMarker(prevVersion.lat.toString(), prevVersion.lon.toString(), c("#ff0000", ".deleted-node-geom"), changesetID + "n" + prevVersion.id)
                } else {
                    showNodeMarker(prevVersion.lat.toString(), prevVersion.lon.toString(), c("#ff0000", ".deleted-node-geom"), changesetID + "n" + prevVersion.id, "customObjects", 2)
                    // todo show prev parent ways
                }
            }
        } else if (targetVersion.version === 1) {
            if (targetVersion.tags) {
                showNodeMarker(targetVersion.lat.toString(), targetVersion.lon.toString(), c("#00a500", ".first-node-version"), changesetID + "n" + targetVersion.id)
            }
            setTimeout(async () => {
                if ((await getChangeset(parseInt(changesetID))).nodesWithOldParentWays.has(parseInt(objID))) {
                    showNodeMarker(targetVersion.lat.toString(), targetVersion.lon.toString(), c("#00a500", ".first-node-version"), changesetID + "n" + targetVersion.id)
                }
            }, 0) // dirty hack for https://osm.org/changeset/162017882
        } else if (prevVersion?.visible === false && targetVersion?.visible !== false) {
            showNodeMarker(targetVersion.lat.toString(), targetVersion.lon.toString(), c("rgba(89, 170, 9, 0.6)", ".restored-node-version"), changesetID + "n" + targetVersion.id, "customObjects", 2)
        } else {
            showNodeMarker(targetVersion.lat.toString(), targetVersion.lon.toString(), "rgb(255,245,41)", changesetID + "n" + targetVersion.id)
        }
    }

    // old changeset with redactions https://osm.org/changeset/10934800
    async function processWay() {
        i.id = `${changesetID}w${objID}`

        // TODO для полной истории кеш нужен, а вот для правок сомнительно, если нужно перемещаться между ними
        // хотя при отображении нескольких правок разом тоже полезно
        const res = await fetchJSONorResWithCache(osm_server.apiBase + objType + "/" + objID + "/full.json", { signal: getAbortController().signal })
        // todo по-хорошему нужно проверять, а не успела ли измениться история линии
        // будет более актуально после добавление предзагрузки
        const nowDeleted = res instanceof Response
        const dashArray = nowDeleted ? "4, 4" : null
        let lineWidth = nowDeleted ? 4 : 3

        if (!nowDeleted) {
            const lastElements = res.elements
            lastElements.forEach(n => {
                if (n.type !== "node") return
                if (n.version === 1) {
                    nodesHistories[n.id] = [n]
                }
            })
            if (!changesetMetadata) {
                changesetMetadata = await loadChangesetMetadata(targetVersion.changeset)
            }
        }

        const [, wayNodesHistories] = await loadWayVersionNodes(objID, version)

        const currentNodesList = []
        if (targetVersion.visible !== false) {
            // https://osm.org/changeset/174173815
            // if changeset was long opened anв nodes changed after way
            let hasInterChanges = false
            /**
             * @template {NodeVersion|WayVersion|RelationVersion} T
             * @param {T[]} history
             * @param {string} timestamp
             * @param {string} notLater
             * @param {number} currentChangeset
             * @return {T|null}
             */
            function searchFinalVersion(history, timestamp, notLater, currentChangeset) {
                const targetTime = new Date(timestamp)
                let cur = history[0]
                if (targetTime < new Date(cur.timestamp)) {
                    return null
                }
                for (const v of history) {
                    if (new Date(v.timestamp) <= targetTime) {
                        cur = v
                    } else {
                        if (new Date(v.timestamp) <= new Date(notLater) && v.changeset === currentChangeset) {
                            cur = v
                            hasInterChanges = true
                        } else {
                            break
                        }
                    }
                }
                return cur
            }
            /**
             * @template T
             * @param {T[][]} objectList
             * @param {string} timestamp
             * @param {string} notLater
             * @param {number} currentChangeset
             * @return {T[]}
             */
            function filterFinalObjectState(objectList, timestamp, notLater, currentChangeset) {
                return objectList.map(i => searchFinalVersion(i, timestamp, notLater, currentChangeset))
            }

            function upperBoundVersion(objHistory, version) {
                let index = version - 1
                if (objHistory[index]?.version === version) {
                    return objHistory[index + 1]
                }
                index--
                while (index >= 0) {
                    if (objHistory[index]?.version === version) {
                        return objHistory[index + 1]
                    }
                    index--
                }
                return undefined
            }

            const nextVersionTimestamp = upperBoundVersion(objHistory, targetVersion.version)?.timestamp
            const notLater = !nextVersionTimestamp || new Date(nextVersionTimestamp) > new Date(changesetMetadata.closed_at) ? changesetMetadata.closed_at : nextVersionTimestamp
            // notLater важен для правок от StreetComplete. Там часто линия обновляется несколько раз в правке
            const targetNodes = filterFinalObjectState(wayNodesHistories, targetVersion.timestamp, notLater, changesetMetadata.id)
            if (hasInterChanges) {
                const hasInterChangesWarn = document.createElement("span")
                hasInterChangesWarn.textContent = "…"
                hasInterChangesWarn.title = "The tags and coordinates of the way nodes were changed several times during the changeset"
                i.querySelector("a ~ table.quick-look")?.before(hasInterChangesWarn)
            }
            const nodesMap = {}
            targetNodes.forEach(elem => {
                if (!elem) {
                    console.error(targetNodes, objID, targetVersion)
                }
                if (!elem.lon) {
                    console.error(elem, targetNodes, objID, targetVersion)
                }
                nodesMap[elem.id] = [elem.lat, elem.lon]
            })
            targetVersion.nodes?.forEach(node => {
                if (node in nodesMap) {
                    currentNodesList.push(nodesMap[node])
                } else {
                    console.error("not found target nodes", objID, node)
                }
            })
        }

        i.parentElement.parentElement.onclick = async e => {
            if (e.altKey) return
            if (window.getSelection().type === "Range") return
            if ((e.target.nodeName === "TH" || e.target.nodeName === "TD") && i.querySelector("[contenteditable]")) return

            document.querySelector("#element_versions_list > div.active-object")?.classList?.remove()
            i.parentElement.parentElement.classList.add("active-object")

            showActiveWay(cloneInto(currentNodesList, unsafeWindow), c("#ff00e3"), currentNodesList.length !== 0, changesetID + "w" + objID)

            if (version > 1) {
                // show prev version
                const [, nodesHistory] = await loadWayVersionNodes(objID, version - 1)
                const targetTimestamp = new Date(new Date(changesetMetadatas[targetVersion.changeset].created_at).getTime() - 1).toISOString()
                const nodesList = filterObjectListByTimestamp(nodesHistory, targetTimestamp)
                showActiveWay(cloneInto(nodesList, unsafeWindow), "rgb(238,146,9)", currentNodesList.length === 0, changesetID + "w" + objID, false, 4, "4, 4")

                showActiveWay(cloneInto(currentNodesList, unsafeWindow), c("#ff00e3"), false, changesetID + "w" + objID, false)
            } else {
                const targetTimestamp = new Date(new Date(changesetMetadatas[targetVersion.changeset].created_at).getTime() - 1).toISOString()
                const prevVersion = searchVersionByTimestamp(await getWayHistory(objID), targetTimestamp)
                if (prevVersion) {
                    const [, nodesHistory] = await loadWayVersionNodes(objID, prevVersion.version)
                    const nodesList = filterObjectListByTimestamp(nodesHistory, targetTimestamp)
                    showActiveWay(cloneInto(nodesList, unsafeWindow), "rgb(238,146,9)", currentNodesList.length === 0, changesetID + "w" + objID, false, 4, "4, 4")
                }
                showActiveWay(cloneInto(currentNodesList, unsafeWindow), c("#ff00e3"), false, changesetID + "w" + objID, false)
            }
        }
        if (!changesetMetadata) {
            changesetMetadata = await loadChangesetMetadata(targetVersion.changeset)
        }
        if (targetVersion.visible === false) {
            const [, nodesHistory] = await loadWayVersionNodes(objID, prevVersion.version)
            const targetTimestamp = new Date(new Date(changesetMetadata.created_at).getTime() - 1).toISOString()
            const nodesList = filterObjectListByTimestamp(nodesHistory, targetTimestamp)
            if (!nodesList.some(i => i.visible === false)) {
                const closedTime = new Date(changesetMetadata.closed_at ?? new Date()).toISOString()
                const nodesAfterChangeset = filterObjectListByTimestamp(nodesHistory, closedTime)
                if (nodesAfterChangeset.some(i => i.visible === false)) {
                    displayWay(nodesList, false, c("#ff0000", ".deleted-way-geom"), 3, changesetID + "w" + objID, "customObjects", dashArray)
                } else {
                    // скорее всего это объединение линий, поэтому это удаление линии нужно отправить на задний план
                    const layer = displayWay(nodesList, false, c("#ff0000", ".deleted-way-geom"), 7, changesetID + "w" + objID, "customObjects", dashArray)
                    layer.bringToBack()
                    lineWidth = 8
                }
            } else {
                console.error(`broken way: ${objID}`, nodesList) // todo retry
            }
        } else if (version === 1 && targetVersion.changeset === parseInt(changesetID)) {
            displayWay(currentNodesList, false, c("rgba(0, 128, 0, 0.6)"), lineWidth, changesetID + "w" + objID, "customObjects", dashArray)
        } else if (prevVersion?.visible === false) {
            displayWay(currentNodesList, false, c("rgba(120, 238, 9, 0.6)"), lineWidth, changesetID + "w" + objID, "customObjects", dashArray)
        } else {
            displayWay(currentNodesList, false, nowDeleted ? "rgb(0,0,0)" : "#373737", lineWidth, changesetID + "w" + objID, "customObjects", null, null, darkModeForMap && isDarkMode())
        }

        async function mouseenterHandler() {
            showActiveWay(cloneInto(currentNodesList, unsafeWindow))
            resetMapHover()
            if (version > 1) {
                // show prev version
                const [, nodesHistory] = await loadWayVersionNodes(objID, version - 1)
                const targetTimestamp = new Date(new Date(changesetMetadatas[targetVersion.changeset].created_at).getTime() - 1).toISOString()
                const nodesList = filterObjectListByTimestamp(nodesHistory, targetTimestamp)
                showActiveWay(cloneInto(nodesList, unsafeWindow), "rgb(238,146,9)", false, changesetID + "w" + objID, false, 4, "4, 4")

                showActiveWay(cloneInto(currentNodesList, unsafeWindow), c("#ff00e3"), false, changesetID + "w" + objID, false, lineWidth)
            } else {
                const targetTimestamp = new Date(new Date(changesetMetadatas[targetVersion.changeset].created_at).getTime() - 1).toISOString()
                const prevVersion = searchVersionByTimestamp(await getWayHistory(objID), targetTimestamp)
                if (prevVersion) {
                    const [, nodesHistory] = await loadWayVersionNodes(objID, prevVersion.version)
                    const nodesList = filterObjectListByTimestamp(nodesHistory, targetTimestamp)
                    showActiveWay(cloneInto(nodesList, unsafeWindow), "rgb(238,146,9)", false, changesetID + "w" + objID, false, 4, "4, 4")
                }
                showActiveWay(cloneInto(currentNodesList, unsafeWindow), c("#ff00e3"), false, changesetID + "w" + objID, false, lineWidth)
            }
        }

        i.parentElement.parentElement.onmouseenter = mouseenterHandler
        objectsInComments.ways
            .filter(i => i.href.includes(`way/${objID}`))
            .forEach(link => {
                // link.title = "Alt + click for scroll into object list"
                link.onmouseenter = mouseenterHandler
                link.onclick = e => {
                    if (!e.altKey) return
                    i.scrollIntoView()
                }
            })
    }

    function processRelation() {
        i.id = `${changesetID}r${objID}`
        const btn = document.createElement("a")
        btn.textContent = "📥"
        btn.classList.add("load-relation-version")
        btn.title = "Download this relation"
        btn.tabIndex = 0
        btn.style.cursor = "pointer"

        async function clickForDownloadHandler(e) {
            if (e.altKey) return
            if (window.getSelection().type === "Range") return
            if ((e.target.nodeName === "TH" || e.target.nodeName === "TD") && i.querySelector("[contenteditable]")) return
            if (e.type === "keypress" && (e.code === "Space" || e.code === "Enter")) {
                e.preventDefault()
            } else if (e.type === "keypress") {
                return
            }
            e.preventDefault()

            document.querySelector("#element_versions_list > div.active-object")?.classList?.remove()
            i.parentElement.parentElement.classList.add("active-object")

            btn.style.cursor = "progress"
            let targetTimestamp = new Date(changesetMetadatas[targetVersion.changeset].closed_at ?? new Date()).toISOString()
            if (targetVersion.visible === false) {
                targetTimestamp = new Date(new Date(changesetMetadatas[targetVersion.changeset].created_at).getTime() - 1).toISOString()
            }
            try {
                const relationMetadata = await loadRelationVersionMembersViaOverpass(parseInt(objID), targetTimestamp, false, c("#ff00e3"))
                if (relationMetadata.restrictionRelationErrors.length) {
                    showRestrictionValidationStatus(relationMetadata.restrictionRelationErrors, i.parentElement)
                } else {
                    if (relationMetadata.isRestriction) {
                        i.parentElement.parentElement.title = 'Click with Shift for zoom to "via" members'
                    }
                }
                i.parentElement.parentElement.onclick = e => {
                    if (e.altKey) return
                    if (e.shiftKey && relationMetadata.isRestriction) {
                        fitBounds([
                            [relationMetadata.nodesBbox.min_lat, relationMetadata.nodesBbox.min_lon],
                            [relationMetadata.nodesBbox.max_lat, relationMetadata.nodesBbox.max_lon],
                        ])
                    } else {
                        fitBounds([
                            [relationMetadata.bbox.min_lat, relationMetadata.bbox.min_lon],
                            [relationMetadata.bbox.max_lat, relationMetadata.bbox.max_lon],
                        ])
                    }
                }

                async function mouseenterHandler() {
                    if (!pinnedRelations.has(parseInt(objID))) {
                        await loadRelationVersionMembersViaOverpass(parseInt(objID), targetTimestamp, false, c("#ff00e3"))
                    }
                }

                i.parentElement.parentElement.onmouseenter = mouseenterHandler
                objectsInComments.relations
                    .filter(i => i.href.includes(`relation/${objID}`))
                    .forEach(link => {
                        // link.title = "Alt + click for scroll into object list"
                        link.onmouseenter = mouseenterHandler
                        link.onclick = e => {
                            if (!e.altKey) return
                            i.scrollIntoView()
                        }
                    })

                i.parentElement.parentElement.classList.add("downloaded")
                i.parentElement.querySelector(".pin-relation").style.display = ""
            } catch (e) {
                btn.style.cursor = "pointer"
                throw e
            }
            btn.style.visibility = "hidden"
            // todo нужна кнопка с глазом чтобы можно было скрывать
        }

        btn.addEventListener("click", clickForDownloadHandler)
        btn.addEventListener("keypress", clickForDownloadHandler)
        i.querySelector("a:nth-of-type(2)").after(btn)
        i.querySelector("a:nth-of-type(2)").after(document.createTextNode("\xA0"))
    }

    if (objType === "node") {
        processNode()
    } else if (objType === "way") {
        await processWay()
    } else if (objType === "relation") {
        processRelation()
    }
    i.parentElement.parentElement.classList.add("processed-object")
}

async function processObjectsInteractions(objType, uniqTypes, changesetID) {
    const objects = document.querySelectorAll(`[changeset-id="${changesetID}"]#changeset_${objType}s .list-unstyled li:not(.processed-object):not(.object-in-process)`)
    if (objects.length === 0) {
        return
    }
    objects.forEach(i => {
        i.classList.add("object-in-process")
    })

    const objectsLinksInComments = {
        // todo can be optimized
        nodes: Array.from(document.querySelectorAll(`#element_versions_list > div > div:has([name=subscribe],[name=unsubscribe]) ~ article div a[href*="node/"]`)),
        ways: Array.from(document.querySelectorAll(`#element_versions_list > div > div:has([name=subscribe],[name=unsubscribe]) ~ article div a[href*="way/"]`)),
        relations: Array.from(document.querySelectorAll(`#element_versions_list > div > div:has([name=subscribe],[name=unsubscribe]) ~ article div a[href*="relation/"]`)),
    }

    try {
        const needFetch = []

        if (objType === "relation" && objects.length >= 2) {
            for (let i of document.querySelectorAll(`[changeset-id="${changesetID}"]#changeset_${objType}s .list-unstyled li:not(.processed-object) div div`)) {
                const [, , objID, strVersion] = i.querySelector("a:nth-of-type(2)").href.match(/(node|way|relation)\/(\d+)\/history\/(\d+)$/)
                const version = parseInt(strVersion)
                if (version === 1) {
                    needFetch.push(objID + "v" + version)
                    needFetch.push(objID)
                } else {
                    needFetch.push(objID + "v" + (version - 1))
                    needFetch.push(objID + "v" + version)
                    needFetch.push(objID)
                }
            }
            const res = await fetchRetry(osm_server.apiBase + `${objType}s.json?${objType}s=` + needFetch.join(","), {
                signal: getAbortController().signal,
            })
            if (res.status === 404) {
                for (let i of document.querySelectorAll(`[changeset-id="${changesetID}"]#changeset_${objType}s .list-unstyled li:not(.processed-object) div div`)) {
                    await processObjectInteractions(changesetID, objType, objectsLinksInComments, i, ...getPrevTargetLastVersions(...(await getHistoryAndVersionByElem(i))))
                }
            } else {
                /**
                 * @type {RelationVersion[]}
                 */
                const versions = (await res.json()).elements
                /**
                 * @type {Object.<number, Object.<number, RelationVersion>>}
                 */
                const objectsVersions = {}
                Object.entries(Object.groupBy(Array.from(versions), i => i.id)).forEach(([id, history]) => {
                    objectsVersions[id] = Object.fromEntries(Object.entries(Object.groupBy(history, i => i.version)).map(([version, val]) => [version, val[0]]))
                })
                for (let i of document.querySelectorAll(`[changeset-id="${changesetID}"]#changeset_${objType}s .list-unstyled li:not(.processed-object) div div`)) {
                    const [, , objID, strVersion] = i.querySelector("a:nth-of-type(2)").href.match(/(node|way|relation)\/(\d+)\/history\/(\d+)$/)
                    const version = parseInt(strVersion)
                    await processObjectInteractions(changesetID, objType, objectsLinksInComments, i, ...getPrevTargetLastVersions(Object.values(objectsVersions[objID]), version))
                }
            }
        } else {
            await Promise.all(
                Array.from(document.querySelectorAll(`[changeset-id="${changesetID}"]#changeset_${objType}s .list-unstyled li:not(.processed-object) div div`)).map(async function (i) {
                    await processObjectInteractions(changesetID, objType, objectsLinksInComments, i, ...getPrevTargetLastVersions(...(await getHistoryAndVersionByElem(i))))
                }),
            )
        }
    } finally {
        objects.forEach(i => {
            i.classList.remove("object-in-process")
        })
    }

    await getChangeset(changesetID)
}

async function getHistoryAndVersionByElem(elem) {
    const [, objType, objID, version] = elem.querySelector("a:nth-of-type(2)").href.match(/(node|way|relation)\/(\d+)\/history\/(\d+)$/)
    if (histories[objType][objID]) {
        return [histories[objType][objID], parseInt(version)]
    }
    if (objType === "node") {
        return [await getNodeHistory(objID), parseInt(version)]
    } else if (objType === "way") {
        return [await getWayHistory(objID), parseInt(version)]
    } else if (objType === "relation") {
        return [await getRelationHistory(objID), parseInt(version)]
    }
}

/**
 * @param {[]} objHistory
 * @param {number} version
 */
function getPrevTargetLastVersions(objHistory, version) {
    let prevVersion = emptyVersion
    let targetVersion = prevVersion
    let lastVersion = objHistory.at(-1)

    for (const objVersion of objHistory) {
        prevVersion = targetVersion
        targetVersion = objVersion
        if (objVersion.version === version) {
            break
        }
    }
    return [prevVersion, targetVersion, lastVersion, objHistory]
}

let quickLookStylesInjected = false

function addQuickLookStyles() {
    if (quickLookStylesInjected) return
    quickLookStylesInjected = true
    const styleText =
        `
        .edits-wars-log tr:nth-child(even) td, .edits-wars-log tr:nth-child(even) th {
            background-color: color-mix(in srgb, var(--bs-body-bg), black 25%);
        }

        @media ${mediaQueryForWebsiteTheme} {

        .edits-wars-log tr:nth-child(even) td, .edits-wars-log tr:nth-child(even) th {
            background-color: color-mix(in srgb, var(--bs-body-bg), white 5%);
        }

        }

        tr.quick-look-new-tag th {
            background: ${c("rgba(17, 238, 9, 0.6)")};
        }

        table[contenteditable] th:not(.tag-flag) {
            border: solid 2px black;
        }

        table[contenteditable] td:not(.tag-flag) {
            border: solid 2px black;
        }

        tr.quick-look-modified-tag td:nth-of-type(1){
            background: ${c("rgba(223, 238, 9, 0.6)")};
        }
        
        tr.quick-look-deleted-tag th {
            background: ${c("rgba(238, 51, 9, 0.6)")};
            color: ${c("#000", ".quick-look-deleted-tag")};
        }

        tr.quick-look-new-tag td:not(.tag-flag) {
            background: ${c("rgba(17, 238, 9, 0.6)")};
        }

        tr.quick-look-deleted-tag td:not(.tag-flag) {
            background: ${c("rgba(238, 51, 9, 0.6)")};
            color: ${c("#000", ".quick-look-deleted-tag")};
        }

        table.quick-look.hide-non-modified-tags > tbody > .non-modified-tag-in-quick-view {
            display: none;
        }

        .new-letter {
            background: ${c("rgba(25, 223, 25, 0.6)")};
        }

        .deleted-letter {
            background: ${c("rgba(255, 144, 144, 0.6)")};
        }

        @media ${mediaQueryForWebsiteTheme} {
            tr.quick-look-new-tag th{
                /*background: #0f540fde;*/
                background: ${c("rgba(17, 238, 9, 0.3)")};
                /*background: rgba(87, 171, 90, 0.3);*/
            }

            tr.quick-look-new-tag td:not(.tag-flag){
                /*background: #0f540fde;*/
                background: ${c("rgba(17, 238, 9, 0.3)")};
                /*background: rgba(87, 171, 90, 0.3);*/
            }

            tr.quick-look-modified-tag td {
                color: black;
            }

            tr.quick-look-deleted-tag th:not(.tag-flag) { /* dirty hack for zebra colors override */
                /*background: #692113;*/
                background: ${c("rgba(238, 51, 9, 0.4)")};
                /*background: rgba(229, 83, 75, 0.3);*/
                color: ${c("#fff", ".quick-look-deleted-tag")};
            }

            tr.quick-look-deleted-tag td:not(.tag-flag) {
                /*background: #692113;*/
                background: ${c("rgba(238, 51, 9, 0.4)")};
                /*background: rgba(229, 83, 75, 0.3);*/
                color: ${c("#fff", ".quick-look-deleted-tag")};
            }

            tr.quick-look-new-tag th::selection {
                background: black !important;
            }

            tr.quick-look-modified-tag th::selection {
                background: black !important;
            }

            tr.quick-look-deleted-tag th::selection {
                background: black !important;
            }

            tr.quick-look-new-tag td::selection {
                background: black !important;
            }

            /*tr.quick-look-modified-tag td::selection {*/
            /*    background: black !important;*/
            /*}*/

            tr.quick-look-deleted-tag td::selection {
                background: black !important;
            }

            .new-letter {
                background: ${c("rgba(25, 223, 25, 0.9)")};
            }

            .deleted-letter {
                background: ${c("rgba(253, 83, 83, 0.8)")};
            }
        }
        .edits-wars-tag td:nth-of-type(2)::after{
          content: " ⚔️";
          margin-top: 2px
        }
        tr.restored-tag td:nth-of-type(2)::after {
          content: " ♻️";
          margin-top: 2px
        }
        tr.restored-tag.edits-wars-tag td:nth-of-type(2)::after {
          content: " ♻️⚔️";
          margin-top: 2px
        }
        tr.removed-tag td:nth-of-type(2)::after {
          content: " 🗑";
          margin-top: 2px
        }
        tr.removed-tag.edits-wars-tag td:nth-of-type(2)::after {
          content: " 🗑⚔️";
          margin-top: 2px
        }
        tr.replaced-tag td:nth-of-type(2)::after {
          content: " ⇄";
          color: var(--bs-body-color);
        }
        tr.replaced-tag.edits-wars-tag td:nth-of-type(2)::after {
          content: " ⇄⚔️";
          color: var(--bs-body-color);
        }
        tr.reverted-tag td:nth-of-type(2)::after {
          content: " ↻";
          color: var(--bs-body-color);
        }

        tr.reverted-tag.edits-wars-tag td:nth-of-type(2)::after {
          content: " ↻⚔️";
          color: var(--bs-body-color);
        }
        span.reverted-coordinates::after {
          content: " ↻";
          position: absolute;
          color: var(--bs-body-color);
        }


        table.browse-tag-list tr td[colspan="2"]{
            background: var(--bs-body-bg) !important;
        }

        ul:has(li[hidden]):after {
            color: var(--bs-body-color);
            content: attr(hidden-nodes-count) ' uninteresting nodes hidden';
            font-style: italic;
            font-weight: normal;
            font-size: small;
            opacity: 0.5;
        }

        ` +
        (GM_config.get("ShowChangesetGeometry")
            ? `
        #sidebar_content #changeset_nodes ul:not(.pagination) li:hover {
            background-color: rgba(223, 223, 223, 0.6);
        }
        #sidebar_content #changeset_ways ul:not(.pagination) li:hover {
            background-color: rgba(223, 223, 223, 0.6);
        }
        #sidebar_content #changeset_nodes ul:not(.pagination) li.map-hover {
            background-color: rgba(223, 223, 223, 0.6);
        }
        #sidebar_content #changeset_ways ul:not(.pagination) li.map-hover {
            background-color: rgba(223, 223, 223, 0.6);
        }
        #sidebar_content #changeset_relations ul:not(.pagination) li.map-hover {
            background-color: rgba(223, 223, 223, 0.6);
        }
        #sidebar_content #changeset_relations ul:not(.pagination) li.downloaded:hover {
            background-color: rgba(223, 223, 223, 0.6);
        }

        .location-modified-marker-warn::after:hover {
            background-color: rgba(223, 223, 223, 0.6);
        }

        #sidebar_content #element_versions_list > div details.way-version-nodes li:hover {
            background-color: rgba(223, 223, 223, 0.6);
        }
        #sidebar_content #element_versions_list > div details.way-version-nodes li:hover {
            background-color: rgba(223, 223, 223, 0.6);
        }
        #sidebar_content #element_versions_list > div details.way-version-nodes li.map-hover {
            background-color: rgba(223, 223, 223, 0.6);
        }
        #sidebar_content #element_versions_list > div details.way-version-nodes li.map-hover {
            background-color: rgba(223, 223, 223, 0.6);
        }
        #sidebar_content #element_versions_list > div details.way-version-nodes li.downloaded:hover {
            background-color: rgba(223, 223, 223, 0.6);
        }

        .location-modified-marker-warn::after:hover {
              background-color: rgba(223, 223, 223, 0.6);;
        }

        @media ${mediaQueryForWebsiteTheme} {
            #sidebar_content #changeset_nodes ul:not(.pagination) li:hover {
                background-color: rgb(14, 17, 19);
            }
            #sidebar_content #changeset_ways ul:not(.pagination) li:hover {
                background-color: rgb(14, 17, 19);
            }
            #sidebar_content #changeset_nodes ul:not(.pagination) li.map-hover {
                background-color: rgb(14, 17, 19);
            }
            #sidebar_content #changeset_ways ul:not(.pagination) li.map-hover {
                background-color: rgb(14, 17, 19);
            }
            #sidebar_content #changeset_relations ul:not(.pagination) li.map-hover {
                background-color: rgb(14, 17, 19);
            }
            #sidebar_content #changeset_relations ul:not(.pagination) li.downloaded:hover {
                background-color: rgb(14, 17, 19);
            }

            #sidebar_content #element_versions_list > div details.way-version-nodes li:hover {
                background-color: rgb(52,61,67);
            }
            #sidebar_content #element_versions_list > div details.way-version-nodes li:hover {
                background-color: rgb(52,61,67);
            }
            #sidebar_content #element_versions_list > div details.way-version-nodes li.map-hover {
                background-color: rgb(52,61,67);
            }
            #sidebar_content #element_versions_list > div details.way-version-nodes li.map-hover {
                background-color: rgb(52,61,67);
            }
            #sidebar_content #element_versions_list > div details.way-version-nodes li.downloaded:hover {
                background-color: rgb(52,61,67);
            }

            .location-modified-marker-warn::after:hover {
                background-color: rgb(14, 17, 19);
            }
        }
        .location-modified-marker-warn::after {
          content: " ⚠️";
          background: var(--bs-body-bg);
        }
        .location-modified-marker:hover {
            background: #0022ff82 !important;
        }
        .way-version-node:hover {
            background-color: #ff00e3 !important;
        }
        .relation-version-node:hover {
            background-color: #ff00e3 !important;
        }
        .leaflet-fade-anim .leaflet-popup {
            transition: none;
        }

        @media (prefers-color-scheme: dark) {
            path.stroke-polyline {
                filter: drop-shadow(1px 1px 0 #7a7a7a) drop-shadow(-1px -1px 0 #7a7a7a) drop-shadow(1px -1px 0 #7a7a7a) drop-shadow(-1px 1px 0 #7a7a7a);
            }
        }
        `
            : "")
    try {
        injectCSSIntoOSMPage(styleText)
    } catch {
        /* empty */
    }
}

function removeEditTagsButton() {
    if (location.pathname.startsWith("/changeset/")) {
        if (!document.querySelector(".secondary-actions .edit_tags_class")) {
            const tagsEditorExtensionWaiter = new MutationObserver(() => {
                document.querySelector(".edit_tags_class")?.previousSibling?.remove()
                document.querySelector(".edit_tags_class")?.remove()
            })
            tagsEditorExtensionWaiter.observe(document.querySelector(".secondary-actions"), {
                childList: true,
                subtree: true,
            })
            setTimeout(() => tagsEditorExtensionWaiter.disconnect(), 3000)
        } else {
            document.querySelector(".edit_tags_class")?.previousSibling?.remove()
            document.querySelector(".edit_tags_class")?.remove()
        }
    }
}

async function preloadChangeset(changesetID) {
    console.log(`c${changesetID} preloading`)
    performance.mark("PRELOADING_" + changesetID)
    const ways = (await getChangeset(changesetID)).data.querySelectorAll("way")
    Array.from(ways)
        .slice(0, 5)
        .forEach(way => {
            getWayHistory(way.id)
        })
    performance.mark("END_PRELOADING_" + changesetID)
    console.log(`c${changesetID} preloaded`)
}

function preloadPrevNextChangesets() {
    console.debug("Preloading changesets")
    const prevLink = getPrevChangesetLink()
    if (prevLink) {
        const changesetID = prevLink.href.match(/\/changeset\/(\d+)/)[1]
        setTimeout(preloadChangeset, 0, changesetID)
    }
    const nextLink = getNextChangesetLink()
    if (nextLink) {
        const changesetID = nextLink.href.match(/\/changeset\/(\d+)/)[1]
        setTimeout(preloadChangeset, 0, changesetID)
    }
    needPreloadChangesets = false
}

/**
 * @param {number|string} nodeID
 * @return {Promise<WayVersion[]>}
 */
async function getParentWays(nodeID) {
    const rawRes = await fetchRetry(osm_server.apiBase + "node/" + nodeID + "/ways.json", { signal: getAbortController().signal })
    if (!rawRes.ok) {
        console.warn(`fetching parent ways for ${nodeID} failed`)
        console.trace()
        return []
    }
    return (await rawRes.json()).elements
}

async function safeCallForSafari(fn) {
    try {
        await fn()
    } catch (e) {
        console.error(e)
        if (!isSafari) {
            throw e
        } else {
            console.trace("suppressing errors for safari")
        }
    }
}

function makeCrashReportText(err) {
    return `
  **Page:** ${location.origin}${location.pathname}

  **Error:** \`${err.toString().replace("`", "\\`")}\`

  **StackTrace:**

  \`\`\`
  ${err.stack.replace("`", "\\`").replaceAll(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/gm, "<hidden>")}
  \`\`\`

  **Script handler:** \`${GM_info.scriptHandler} v${GM_info.version}\`

  **UserAgent:** \`${JSON.stringify(GM_info.userAgentData)}\`

                      `
}

function isAbortError(err) {
    return [ABORT_ERROR_PREV, ABORT_ERROR_NEXT, ABORT_ERROR_USER_CHANGESETS, ABORT_ERROR_WHEN_PAGE_CHANGED].includes(err)
}

async function processQuickLookInSidebar(changesetID) {
    const interceptMapManuallyPromise = interceptMapManually()
    const multipleChangesets = location.search.includes("changesets=")

    function addCompactModeToggles(objType, uniqTypes) {
        const compactToggle = document.createElement("button")
        compactToggle.title = "Toggle between full and compact tags diff.\nYou can also use the T key."
        compactToggle.textContent = allTagsOfObjectsVisible ? "><" : "<>"
        compactToggle.classList.add("quick-look-compact-toggle-btn")
        compactToggle.classList.add("btn", "btn-sm", "btn-primary")
        compactToggle.classList.add("quick-look")
        compactToggle.onclick = e => {
            const needHideNodes = location.search.includes("changesets=")
            const state = e.target.textContent === "><"
            document.querySelectorAll(".quick-look-compact-toggle-btn").forEach(i => {
                if (state) {
                    i.textContent = "<>"
                } else {
                    i.textContent = "><"
                }
            })
            allTagsOfObjectsVisible = !allTagsOfObjectsVisible
            const shouldBeHidden = e.target.textContent === "<>"
            document.querySelectorAll("table.quick-look").forEach(el => {
                el.classList.toggle("hide-non-modified-tags", shouldBeHidden)
            })
            if (needHideNodes) {
                if (e.target.textContent === "<>") {
                    document.querySelectorAll("#changeset_nodes .tags-non-modified:not(.location-modified)").forEach(i => {
                        i.setAttribute("hidden", "true")
                    })
                    document.querySelectorAll("#changeset_nodes").forEach(i => {
                        if (!i.querySelector("li:not([hidden])")) {
                            i.setAttribute("hidden", "true")
                        }
                    })
                } else {
                    document.querySelectorAll("#changeset_nodes .tags-non-modified:not(.location-modified)").forEach(i => {
                        i.removeAttribute("hidden")
                    })
                    document.querySelectorAll("#changeset_nodes").forEach(i => {
                        i.removeAttribute("hidden")
                    })
                }
            }
            if (e.target.textContent === "><") {
                if (!e.altKey) {
                    document.querySelectorAll(".preview-img-link img").forEach(i => {
                        i.style.display = ""
                    })
                }
            } else {
                if (!e.altKey) {
                    document.querySelectorAll(".preview-img-link img").forEach(i => {
                        i.style.display = "none"
                    })
                }
            }
        }
        const objectListSection = document.querySelector(`[changeset-id="${changesetID}"]#changeset_${objType}s .list-unstyled li`).parentElement.parentElement.querySelector("h4")
        if (!objectListSection.querySelector(".quick-look-compact-toggle-btn")) {
            objectListSection.appendChild(compactToggle)
        }
        compactToggle.before(document.createTextNode("\xA0"))
        if (uniqTypes === 1 && document.querySelectorAll(`[changeset-id="${changesetID}"]#changeset_${objType}s .list-unstyled li .non-modified-tag-in-quick-view`).length < 5) {
            compactToggle.style.display = "none"
            document.querySelectorAll(".non-modified-tag-in-quick-view").forEach(i => {
                i.removeAttribute("hidden")
            })
        }
        if (multipleChangesets && compactToggle.style.display !== "none") {
            document.querySelectorAll(`[changeset-id="${changesetID}"]`).forEach(changeset => {
                const forHide = document.querySelectorAll(`[changeset-id="${changeset.getAttribute("changeset-id")}"]#changeset_nodes .tags-non-modified:not(.location-modified)`)
                forHide.forEach(i => {
                    i.setAttribute("hidden", "true")
                })
                document.querySelectorAll(`[changeset-id="${changeset.getAttribute("changeset-id")}"]#changeset_nodes`).forEach(i => {
                    if (!i.querySelector("li:not([hidden])")) {
                        i.setAttribute("hidden", "true")
                    }
                })
            })
        }
    }

    /**
     * Загружает историю объектов и показывает дифф тегов. Не использует Overpass API
     * @param {"node"|"way"|"relation"} objType
     * @param {0|1|2|3} uniqTypes - сколько различных типов OSM объектов пришло
     * @return {Promise<void>}
     */
    async function processObjects(objType, uniqTypes) {
        pinnedRelations = new Set()
        const objects = document.querySelectorAll(`[changeset-id="${changesetID}"]#changeset_${objType}s .list-unstyled li:not(.processed-object):not(.object-in-process)`)
        if (objects.length === 0) {
            return
        }
        objects.forEach(i => {
            i.classList.add("object-in-process")
        })

        const needFetch = []

        try {
            if (objType === "relation") {
                for (let i of document.querySelectorAll(`[changeset-id="${changesetID}"]#changeset_${objType}s .list-unstyled li:not(.processed-object) div div`)) {
                    const [, , objID, strVersion] = i.querySelector("a:nth-of-type(2)").href.match(/(node|way|relation)\/(\d+)\/history\/(\d+)$/)
                    const version = parseInt(strVersion)
                    if (version === 1) {
                        needFetch.push(objID + "v" + version)
                        needFetch.push(objID)
                    } else {
                        needFetch.push(objID + "v" + (version - 1))
                        needFetch.push(objID + "v" + version)
                        needFetch.push(objID)
                    }
                }
                const res = await fetchRetry(osm_server.apiBase + `${objType}s.json?${objType}s=` + needFetch.join(","), {
                    signal: getAbortController().signal,
                })
                if (res.status === 404) {
                    for (let i of document.querySelectorAll(`[changeset-id="${changesetID}"]#changeset_${objType}s .list-unstyled li:not(.processed-object) div div`)) {
                        await processObject(i, objType, ...getPrevTargetLastVersions(...(await getHistoryAndVersionByElem(i))))
                    }
                } else {
                    /**
                     * @type {RelationVersion[]}
                     */
                    const versions = (await res.json()).elements
                    /**
                     * @type {Object.<number, Object.<number, RelationVersion>>}
                     */
                    const objectsVersions = {}
                    Object.entries(Object.groupBy(Array.from(versions), i => i.id)).forEach(([id, history]) => {
                        objectsVersions[id] = Object.fromEntries(Object.entries(Object.groupBy(history, i => i.version)).map(([version, val]) => [version, val[0]]))
                    })
                    for (let i of document.querySelectorAll(`[changeset-id="${changesetID}"]#changeset_${objType}s .list-unstyled li:not(.processed-object) div div`)) {
                        const [, , objID, strVersion] = i.querySelector("a:nth-of-type(2)").href.match(/(node|way|relation)\/(\d+)\/history\/(\d+)$/)
                        const version = parseInt(strVersion)
                        await processObject(i, objType, ...getPrevTargetLastVersions(Object.values(objectsVersions[objID]), version))
                    }
                }
            } else {
                const elems = Array.from(document.querySelectorAll(`[changeset-id="${changesetID}"]#changeset_${objType}s .list-unstyled li:not(.processed-object) div div`))
                for (const elem of arraySplit(elems, elems.length > 520 ? 10 : 1)) {
                    await Promise.all(
                        elem.map(async function (i) {
                            await processObject(i, objType, ...getPrevTargetLastVersions(...(await getHistoryAndVersionByElem(i))))
                        }),
                    )
                }
            }
        } finally {
            objects.forEach(i => {
                i.classList.remove("object-in-process")
            })
        }

        // reorder non-interesting-objects
        const objectsList = document.querySelector(`[changeset-id="${changesetID}"]#changeset_${objType}s .list-unstyled li`).parentElement
        Array.from(document.querySelectorAll(`[changeset-id="${changesetID}"]#changeset_${objType}s .list-unstyled li.tags-uninterested-modified.location-modified`)).forEach(i => {
            objectsList.appendChild(i)
        })
        Array.from(document.querySelectorAll(`[changeset-id="${changesetID}"]#changeset_${objType}s .list-unstyled li.tags-uninterested-modified:not(.location-modified)`)).forEach(i => {
            objectsList.appendChild(i)
        })
        Array.from(document.querySelectorAll(`[changeset-id="${changesetID}"]#changeset_${objType}s .list-unstyled li.tags-non-modified`)).forEach(i => {
            objectsList.appendChild(i)
        })
        Array.from(document.querySelectorAll(`[changeset-id="${changesetID}"]#changeset_${objType}s .list-unstyled li.tags-non-modified:not(.location-modified)`)).forEach(i => {
            objectsList.appendChild(i)
        })

        if (multipleChangesets) {
            document.querySelectorAll("#changeset_nodes .tags-non-modified:not(.location-modified)").forEach(i => {
                i.setAttribute("hidden", "true")
            })
        }

        addCompactModeToggles(objType, uniqTypes)
    }

    try {
        console.time(`QuickLook ${changesetID}`)
        console.log(`%cQuickLook for ${changesetID}`, "background: #222; color: #bada55")

        /** @type {("way" | "node" | "relation")[]} */
        const osmTypesOrder = ["way", "node", "relation"]

        /** @type {0|1|2|3} */
        let uniqTypes = 0
        for (const objType of osmTypesOrder) {
            if (document.querySelectorAll(`.list-unstyled li.${objType}`).length > 0) {
                uniqTypes++
            }
        }

        for (const objType of osmTypesOrder) {
            await processObjects(objType, uniqTypes)
        }
        const changesetDataPromise = getChangeset(changesetID)
        await interceptMapManuallyPromise
        await safeCallForSafari(async () => {
            for (const objType of osmTypesOrder) {
                await processObjectsInteractions(objType, uniqTypes, changesetID)
            }
        })
        const changesetData = (await changesetDataPromise).data
        const paginationSelector = document.querySelector(".numbered_pagination") ? ".numbered_pagination" : ".pagination"

        // osm.org/changeset/170309417
        function dropNodesPagination(changesetData) {
            const pagination = Array.from(document.querySelectorAll(`[changeset-id="${changesetID}"]#changeset_nodes ${paginationSelector}`)).find(i => {
                return Array.from(i.querySelectorAll("a.page-link")).some(a => a.href?.includes("node"))
            })
            if (!pagination) {
                return false
            }
            const nodesUl = pagination.parentElement.querySelector("ul.list-unstyled")
            const nodes = Array.from(changesetData.querySelectorAll("node"))
            const other = changesetData.querySelectorAll("way,relation").length
            if (nodes.length > 1200 && !isDebug()) {
                if (other > 20 || isMobile) {
                    // fixme bump
                    return false
                }
                if (nodes.length > 3500 && isMobile) {
                    return false
                }
                if (nodes.length > 6000) {
                    return false
                }
            }
            pagination.remove()
            try {
                document.querySelector(`[changeset-id="${changesetID}"]#changeset_nodes h4 .count-number`).textContent = `1-${nodes.length}`
            } catch (e) {
                console.error(e)
            }
            return { nodes, nodesUl }
        }

        function insertPOIIcon(parentElem, objType, tags) {
            try {
                const [iconSrc, invert] = getPOIIconURL(objType, tags)
                if (isSafari) {
                    const tmpElem = document.createElement("span")
                    parentElem.appendChild(tmpElem)
                    fetchImageWithCache(iconSrc).then(async imgData => {
                        const img = document.createElement("img")
                        img.src = imgData
                        img.height = 20
                        img.width = 20
                        img.classList.add("align-bottom", "object-fit-none", "browse-icon")
                        if (invert) {
                            img.classList.add("browse-icon-invertible")
                        }
                        tmpElem.replaceWith(img)
                    })
                } else {
                    parentElem.appendChild(
                        GM_addElement("img", {
                            src: iconSrc,
                            height: 20,
                            width: 20,
                            class: "align-bottom object-fit-none browse-icon" + (invert ? " browse-icon-invertible" : ""),
                        }),
                    )
                }
            } catch (e) {
                console.error(e)
                const img = document.createElement("img")
                img.height = 20
                img.width = 20
                img.style.visibility = "hidden"
                parentElem.appendChild(img)
            }
        }

        function replaceNodes(nodes, nodesUl) {
            nodes.forEach(node => {
                if (document.getElementById(`${changesetID}n${node.id}`)) {
                    return
                }
                const ulItem = document.createElement("li")
                const div1 = document.createElement("div")
                div1.classList.add("d-flex", "gap-1")
                ulItem.appendChild(div1)

                insertPOIIcon(
                    div1,
                    "node",
                    Array.from(node.querySelectorAll("tag[k]")).map(i => [i.getAttribute("k"), i.getAttribute("v")]),
                )

                const div2 = document.createElement("div")
                div2.classList.add("align-self-center")
                div1.appendChild(div2)

                div2.classList.add("node")
                div2.id = `${changesetID}n${node.id}`

                const nodeLink = document.createElement("a")
                nodeLink.rel = "nofollow"
                nodeLink.href = `/node/${node.id}`
                if (node.querySelector('tag[k="name"]')?.getAttribute("v")) {
                    nodeLink.textContent = `${node.querySelector('tag[k="name"]')?.getAttribute("v")} (${node.id})`
                } else {
                    nodeLink.textContent = node.id
                }
                div2.appendChild(nodeLink)

                div2.appendChild(document.createTextNode(", "))

                const versionLink = document.createElement("a")
                versionLink.rel = "nofollow"
                versionLink.href = `/node/${node.id}/history/${node.getAttribute("version")}`
                versionLink.textContent = "v" + node.getAttribute("version")
                div2.appendChild(versionLink)

                Array.from(node.children).forEach(i => {
                    // todo
                    if (mainTags.includes(i.getAttribute("k"))) {
                        div2.classList.add(i.getAttribute("k"))
                        try {
                            div2.classList.add(i.getAttribute("v"))
                        } catch {
                            console.log(`skip tag with value: ${i.getAttribute("v")}`)
                        }
                    }
                })
                if (node.getAttribute("visible") === "false") {
                    div2.innerHTML = "<s>" + div2.innerHTML + "</s>"
                }
                nodesUl.appendChild(ulItem)
            })
        }

        function dropWaysPagination(changesetData) {
            const pagination = Array.from(document.querySelectorAll(`[changeset-id="${changesetID}"]#changeset_ways ${paginationSelector}`)).find(i => {
                return Array.from(i.querySelectorAll("a.page-link")).some(a => a.href?.includes("way"))
            })
            if (!pagination) {
                return false
            }
            const waysUl = pagination.parentElement.querySelector("ul.list-unstyled")
            const ways = Array.from(changesetData.querySelectorAll("way"))
            if (ways.length > 50 && !isDebug()) {
                if (ways.length > 200 && changesetData.querySelectorAll("node") > 40) {
                    return false
                }
                if (ways.length > 520 && isMobile) {
                    return false
                }
                if (ways.length > 5000) {
                    return false
                }
            }
            pagination.remove()
            try {
                document.querySelector(`[changeset-id="${changesetID}"]#changeset_ways h4 .count-number`).textContent = `1-${ways.length}`
            } catch (e) {
                console.error(e)
            }
            return { ways, waysUl }
        }

        // todo unify
        function replaceWays(ways, waysUl) {
            ways.forEach(way => {
                if (document.getElementById(`${changesetID}w${way.id}`)) {
                    return
                }
                const ulItem = document.createElement("li")
                const div1 = document.createElement("div")
                div1.classList.add("d-flex", "gap-1")
                ulItem.appendChild(div1)

                insertPOIIcon(
                    div1,
                    "way",
                    Array.from(way.querySelectorAll("tag[k]")).map(i => [i.getAttribute("k"), i.getAttribute("v")]),
                )

                const div2 = document.createElement("div")
                div2.classList.add("align-self-center")
                div1.appendChild(div2)

                div2.classList.add("way")
                div2.id = `${changesetID}w${way.id}`

                const wayLink = document.createElement("a")
                wayLink.rel = "nofollow"
                wayLink.href = `/way/${way.id}`
                if (way.querySelector('tag[k="name"]')?.getAttribute("v")) {
                    wayLink.textContent = `${way.querySelector('tag[k="name"]')?.getAttribute("v")} (${way.id})`
                } else {
                    wayLink.textContent = way.id
                }
                div2.appendChild(wayLink)

                div2.appendChild(document.createTextNode(", "))

                const versionLink = document.createElement("a")
                versionLink.rel = "nofollow"
                versionLink.href = `/way/${way.id}/history/${way.getAttribute("version")}`
                versionLink.textContent = "v" + way.getAttribute("version")
                div2.appendChild(versionLink)

                Array.from(way.children).forEach(i => {
                    if (mainTags.includes(i.getAttribute("k"))) {
                        div2.classList.add(i.getAttribute("k"))
                        try {
                            div2.classList.add(i.getAttribute("v"))
                        } catch {
                            console.log(`skip tag with value: ${i.getAttribute("v")}`)
                        }
                    }
                })
                if (way.getAttribute("visible") === "false") {
                    div2.innerHTML = "<s>" + div2.innerHTML + "</s>"
                }
                waysUl.appendChild(ulItem)
            })
        }

        try {
            await initPOIIcons()
        } catch (e) {
            console.log(e)
            console.trace()
        }

        const waysRes = dropWaysPagination(changesetData)
        if (waysRes) {
            const batchSize = 300
            for (let i = 0; i < waysRes.ways.length; i += batchSize) {
                console.log(`Ways batch ${i}-${i + batchSize} / ${waysRes.ways.length}`)
                replaceWays(waysRes.ways.slice(i, i + batchSize), waysRes.waysUl)
                await processObjects("way", uniqTypes)
                await safeCallForSafari(async () => {
                    await processObjectsInteractions("way", uniqTypes, changesetID)
                })
            }
        }

        const nodesRes = dropNodesPagination(changesetData)
        if (nodesRes) {
            const batchSize = 3000
            for (let i = 0; i < nodesRes.nodes.length; i += batchSize) {
                console.log(`Nodes batch ${i}-${i + batchSize} / ${nodesRes.nodes.length}`)
                replaceNodes(nodesRes.nodes.slice(i, i + batchSize), nodesRes.nodesUl)
                await processObjects("node", uniqTypes)
                await safeCallForSafari(async () => {
                    await processObjectsInteractions("node", uniqTypes, changesetID)
                })
            }
        }

        function observePagination(obs) {
            const paginationSelector = document.querySelector(".numbered_pagination") ? ".numbered_pagination" : ".pagination"

            if (document.querySelector(`[changeset-id="${changesetID}"]#changeset_nodes ${paginationSelector}`)) {
                obs.observe(document.querySelector(`[changeset-id="${changesetID}"]#changeset_nodes`), {
                    attributes: true,
                })
            }
            if (document.querySelector(`[changeset-id="${changesetID}"]#changeset_ways ${paginationSelector}`)) {
                obs.observe(document.querySelector(`[changeset-id="${changesetID}"]#changeset_ways`), {
                    attributes: true,
                })
            }
            if (document.querySelector(`[changeset-id="${changesetID}"]#changeset_relations ${paginationSelector}`)) {
                obs.observe(document.querySelector(`[changeset-id="${changesetID}"]#changeset_relations`), {
                    attributes: true,
                })
            }
        }

        const obs = new MutationObserver(async (mutationList, observer) => {
            observer.disconnect()
            observer.takeRecords()
            for (const objType of ["way", "node", "relation"]) {
                await processObjects(objType, uniqTypes)
            }
            for (const objType of ["way", "node", "relation"]) {
                await processObjectsInteractions(objType, uniqTypes, changesetID)
            }
            observePagination(obs)
        })
        observePagination(obs)

        // try to find parent ways

        async function findParents() {
            performance.mark("FIND_PARENTS_BEGIN_" + changesetID)
            const nodesCount = changesetData.querySelectorAll(`node`)
            for (const i of changesetData.querySelectorAll(`node[version="1"]`)) {
                const nodeID = i.getAttribute("id")
                if (!i.querySelector("tag")) {
                    if (i.getAttribute("visible") === "false") {
                        // todo
                    } else if (i.getAttribute("version") === "1" && !(await getChangeset(parseInt(changesetID))).nodesWithParentWays.has(parseInt(nodeID))) {
                        showNodeMarker(i.getAttribute("lat"), i.getAttribute("lon"), "#00a500", changesetID + "n" + nodeID)
                    }
                }
            }
            /**
             * @type {Set<number>}
             */
            const processedNodes = new Set()
            /**
             * @type {Set<number>}
             */
            const processedWays = new Set()
            // fixme
            const changesetWaysSet = new Set(Array.from(changesetData.querySelectorAll(`way`)).map(i => parseInt(i.id)))
            const loadNodesParents = async nodes => {
                for (const nodeID of nodes) {
                    if (((await getChangeset(parseInt(changesetID))).nodesWithParentWays.has(nodeID) && nodesCount > 30) || processedNodes.has(parseInt(nodeID))) {
                        continue
                    }
                    const parents = await getParentWays(nodeID)

                    await Promise.all(
                        parents.map(async way => {
                            if (processedWays.has(way.id) || changesetWaysSet.has(way.id)) {
                                return
                            }
                            processedWays.add(way.id)
                            way.nodes.forEach(node => {
                                processedNodes.add(node)
                            })
                            const objID = way.id

                            const res = await fetchRetry(osm_server.apiBase + "way" + "/" + way.id + "/full.json", {
                                signal: getAbortController().signal,
                            })
                            if (!res.ok) {
                                // крааайне маловероятно
                                return
                            }
                            const lastElements = (await res.json()).elements
                            lastElements.forEach(n => {
                                if (n.type !== "node") return
                                if (n.version === 1) {
                                    nodesHistories[n.id] = [n]
                                }
                            })

                            if (!changesetMetadatas[changesetID]) {
                                console.log(`changesetMetadata[${changesetID}] not ready. Wait second...`)
                                await abortableSleep(1000, getAbortController()) // todo нужно поретраить
                            }

                            const res2 = await getWayNodesByTimestamp(changesetMetadatas[changesetID].closed_at, objID)
                            if (!res2) {
                                // если линия создана после правки
                                console.log(`skip parent w${objID} for ${nodeID}`)
                                return
                            }
                            const [targetVersion, currentNodesList] = res2
                            if (targetVersion.visible === false) {
                                console.log(`skip parent w${objID} for ${nodeID} because version not visible`)
                                return
                            }

                            const popup = document.createElement("span")
                            const link = document.createElement("a")
                            link.href = `/way/${way.id}`
                            link.target = "_blank"
                            link.textContent = "w" + way.id

                            const tagsTable = document.createElement("table")
                            const tbody = document.createElement("tbody")
                            Object.entries(way.tags ?? {}).forEach(tag => {
                                const row = document.createElement("tr")
                                const tagTd = document.createElement("th")
                                const tagTd2 = document.createElement("td")
                                tagTd.style.borderWidth = "2px"
                                tagTd2.style.borderWidth = "2px"
                                row.style.borderWidth = "2px"
                                row.appendChild(tagTd)
                                row.appendChild(tagTd2)
                                tagTd.textContent = tag[0]
                                tagTd2.textContent = tag[1]
                                tagTd.style.textAlign = "right"
                                tagTd2.style.textAlign = "right"
                                tbody.appendChild(row)
                            })
                            tagsTable.appendChild(tbody)
                            popup.appendChild(link)
                            popup.appendChild(tagsTable)
                            // todo показать по ховеру прошлую версию?
                            // prettier-ignore
                            const line = displayWay(
                                cloneInto(currentNodesList, unsafeWindow),
                                false,
                                "rgba(55,55,55,0.5)",
                                4,
                                changesetID + "n" + nodeID,
                                "customObjects",
                                null,
                                popup.outerHTML,
                                darkModeForMap && isDarkMode(),
                            )
                            if (layersHidden) {
                                line.getElement().style.visibility = "hidden"
                            }

                            // ховер в списке объектов, который показывает родительскую линию
                            way.nodes.forEach(n => {
                                if (!document.getElementById(`${changesetID}n${n}`)) return
                                document.getElementById(`${changesetID}n${n}`).parentElement.parentElement.addEventListener("mouseover", async e => {
                                    if (e.relatedTarget?.parentElement === e.target) {
                                        return
                                    }
                                    showActiveWay(cloneInto(currentNodesList, unsafeWindow))
                                    resetMapHover()
                                    const targetTimestamp = new Date(new Date(changesetMetadatas[changesetID].created_at).getTime() - 1).toISOString()
                                    if (targetVersion.version > 1) {
                                        // show prev version
                                        const prevVersion = searchVersionByTimestamp(await getWayHistory(way.id), targetTimestamp)
                                        const [, nodesHistory] = await loadWayVersionNodes(objID, prevVersion.version)
                                        const nodesList = filterObjectListByTimestamp(nodesHistory, targetTimestamp)
                                        showActiveWay(cloneInto(nodesList, unsafeWindow), "rgb(238,146,9)", false, changesetID + "w" + objID, false, 4, "4, 4")

                                        // showActiveWay(cloneInto(currentNodesList, unsafeWindow), "rgba(55,55,55,0.5)", false, objID, false)
                                    } else {
                                        const prevVersion = searchVersionByTimestamp(await getWayHistory(way.id), targetTimestamp)
                                        if (prevVersion) {
                                            const [, nodesHistory] = await loadWayVersionNodes(objID, prevVersion.version)
                                            const nodesList = filterObjectListByTimestamp(nodesHistory, targetTimestamp)
                                            showActiveWay(cloneInto(nodesList, unsafeWindow), "rgb(238,146,9)", false, changesetID + "w" + objID, false, 4, "4, 4")

                                            // showActiveWay(cloneInto(currentNodesList, unsafeWindow), "rgba(55,55,55,0.5)", false, objID, false)
                                        }
                                    }
                                    const curVersion = searchVersionByTimestamp(await getNodeHistory(n), changesetMetadatas[changesetID].closed_at ?? new Date())
                                    if (curVersion.version > 1) {
                                        const prevVersion = searchVersionByTimestamp(await getNodeHistory(n), targetTimestamp)
                                        showActiveNodeMarker(prevVersion.lat.toString(), prevVersion.lon.toString(), c("#0022ff"), false)
                                    }
                                    showActiveNodeMarker(curVersion.lat.toString(), curVersion.lon.toString(), c("#ff00e3"), false)
                                })
                            })
                        }),
                    )
                }
            }
            const nodesWithModifiedLocation = Array.from(document.querySelectorAll("#changeset_nodes .location-modified div div")).map(i => parseInt(i.id.match(/n(\d+)/)[1]))
            await Promise.all(arraySplit(nodesWithModifiedLocation, 4).map(loadNodesParents))
            // fast hack
            // const someInterestingNodes = Array.from(changesetData.querySelectorAll("node")).filter(i => i.querySelector("tag[k=power],tag[k=entrance]")).map(i => parseInt(i.id))
            // await Promise.all(arraySplit(someInterestingNodes, 4).map(loadNodesParents))
            performance.mark("FIND_PARENTS_END_" + changesetID)
            console.debug(
                performance.measure("FIND_PARENTS", {
                    start: "FIND_PARENTS_BEGIN_" + changesetID,
                }),
                "FIND_PARENTS_END_" + changesetID,
            )
        }

        if (GM_config.get("ShowChangesetGeometry")) {
            console.log("%cTry find parents ways", "background: #222; color: #bada55")
            if (multipleChangesets) {
                // todo не стоит если пакетов мало?
                findParents().then(() => {
                    console.log(`Parents with ${changesetID} loaded`)
                })
            } else {
                await findParents()
            }
        }
    } catch (err) {
        // TODO notify user
        if (err.name === "AbortError") {
            console.debug("Some requests was aborted")
        } else {
            console.error(err)
            console.log("%cSetup QuickLook finished with error ⚠️", "background: #222; color: #bada55")

            function makeGithubIssueLink(text) {
                const a = document.createElement("a")
                a.classList.add("crash-report-link")
                a.href =
                    "https://github.com/deevroman/better-osm-org/issues/new?" +
                    new URLSearchParams({
                        body: text,
                        title: "Crash Report",
                        labels: "bug,crash",
                    }).toString()
                a.target = "_blank"
                a.appendChild(document.createTextNode("Send Bug Report"))
                a.title = "better-osm-org was unable to display some data"
                return a
            }

            if (!isAbortError(err) && getMap()?.getZoom) {
                // eslint-disable-next-line no-debugger
                debugger
                try {
                    const reportText = makeCrashReportText(err)
                    if (!document.querySelector(".crash-report-link")) {
                        document.querySelector("#sidebar_content .secondary-actions").appendChild(document.createTextNode(" · "))
                        document.querySelector("#sidebar_content .secondary-actions").appendChild(makeGithubIssueLink(reportText))
                    }
                    if (isDebug()) {
                        getMap()?.attributionControl?.setPrefix("⚠️")
                    }
                } catch {
                    /* empty */
                }
                if (isDebug()) {
                    alert("⚠ read logs.\nOnly the script developer should see this message")
                }
                // eslint-disable-next-line no-debugger
                debugger
                throw err
            }
        }
    } finally {
        quickLookInjectingStarted = false
        console.timeEnd(`QuickLook ${changesetID}`)
        console.log("%cSetup QuickLook finished", "background: #222; color: #bada55")
        // todo mark changeset as reviewed
    }
}

const currentChangesets = []

function drawBBox(bbox, options = { color: "#ff7800", weight: 1, fillOpacity: 0 }) {
    try {
        const bottomLeft = getMap().project(getWindow().L.latLng(bbox.min_lat, bbox.min_lon))
        const topRight = getMap().project(getWindow().L.latLng(bbox.max_lat, bbox.max_lon))
        const width = topRight.x - bottomLeft.x
        const height = bottomLeft.y - topRight.y
        const minSize = 10

        if (width < minSize) {
            bottomLeft.x -= (minSize - width) / 2
            topRight.x += (minSize - width) / 2
        }

        if (height < minSize) {
            bottomLeft.y += (minSize - height) / 2
            topRight.y -= (minSize - height) / 2
        }

        const b = getWindow().L.latLngBounds(getMap().unproject(intoPage(bottomLeft)), getMap().unproject(intoPage(topRight)))

        const bound = getWindow().L.rectangle(
            intoPage([
                [b.getSouth(), b.getWest()],
                [b.getNorth(), b.getEast()],
            ]),
            intoPage(options),
        )
        bound.on(
            "click",
            intoPageWithFun(function () {
                const elementById = document.getElementById(bbox.id)
                elementById?.scrollIntoView()
                resetMapHover()
                elementById?.parentElement?.parentElement?.classList.add("map-hover")
                cleanObjectsByKey("activeObjects")
            }),
        )
        bound.addTo(getMap())
        bound.bringToBack()
        layers["changesetBounds"].push(bound)
        return bound
    } catch (err) {
        console.trace(err)
    }
}

async function processQuickLookForCombinedChangesets(changesetID, changesetIDs) {
    await loadChangesetMetadatas(changesetIDs)
    await zoomToChangesets()
    for (let curID of changesetIDs) {
        currentChangesets.push(changesetMetadatas[curID])
    }

    for (let bbox of currentChangesets) {
        drawBBox(bbox)
    }
    drawBBox(changesetMetadatas[changesetID])
    getMap().on(
        "moveend zoomend",
        intoPageWithFun(function () {
            if (layersHidden) return
            for (let bound of layers["changesetBounds"]) {
                bound.remove()
            }
            layers["changesetBounds"] = []
            for (let bbox of currentChangesets) {
                drawBBox(bbox)
            }
            drawBBox(changesetMetadatas[changesetID])
        }),
    )

    const step = 10
    const changesetsQueue = []
    if (changesetIDs.length) {
        // preloading
        changesetIDs.slice(0, step).forEach(i => {
            changesetsQueue.push(fetchRetry(osm_server.url + "/changeset/" + i).then(async res => await res.text()))
        })
    }
    // MORE PRELOADING
    const waysForPreload = []
    await Promise.all(
        changesetIDs.map(async i => {
            const data = (await getChangeset(i)).data
            Array.from(data.querySelectorAll("way:not([version='1'])")).map(i => waysForPreload.push(parseInt(i.getAttribute("id"))))
        }),
    )
    await Promise.all(Array.from(new Set(waysForPreload)).map(i => getWayHistory(i)))

    for (let i = 0; i < changesetIDs.length; i++) {
        console.log(`${i + 1} / ${changesetIDs.length}`)
        const curID = changesetIDs[i]

        const res = await changesetsQueue.shift()

        const doc = new DOMParser().parseFromString(res, "text/html")
        const newPrevLink = getPrevChangesetLink(doc)
        if (newPrevLink) {
            const prevLink = getPrevChangesetLink()
            const prevID = extractChangesetID(prevLink.href)

            const newPrevID = extractChangesetID(newPrevLink.href)
            prevLink.childNodes[2].textContent = prevLink.childNodes[2].textContent.replace(prevID, newPrevID)
            prevLink.href = "/changeset/" + newPrevID
        }

        const divID = document.createElement("a")
        divID.id = curID
        divID.textContent = "#" + curID
        divID.href = "/changeset/" + curID
        divID.style.color = "var(--bs-body-color)"
        // todo add comment
        document.querySelector("turbo-frame:is(#changeset_nodes,#changeset_ways,#changeset_relations):last-of-type").after(divID)
        let prevFrame = null
        doc.querySelectorAll("turbo-frame:is(#changeset_nodes,#changeset_ways,#changeset_relations)").forEach(frame => {
            frame.setAttribute("changeset-id", curID)
            if (prevFrame) {
                prevFrame.after(frame)
            } else {
                divID.after(frame)
                prevFrame = frame
            }
        })
        setTimeout(async () => {
            await loadChangesetMetadata(parseInt(curID))
            const span = document.createElement("span")
            span.textContent = " " + shortOsmOrgLinksInText(changesetMetadatas[curID].tags["comment"] ?? "") // todo trim
            span.title = " " + (changesetMetadatas[curID].tags["comment"] ?? "")
            span.style.color = "gray"
            divID.after(span)
        })

        const promise = processQuickLookInSidebar(curID)
        if (i + step < changesetIDs.length) {
            changesetsQueue.push(fetchRetry(osm_server.url + "/changeset/" + changesetIDs[i + step]).then(async res => await res.text()))
        }
        await promise
    }
}

/*
function interceptRectangle() {
    console.log("intercept rectangle");
    injectJSIntoPage(`
    var layers = {}

    function makeColor(username) {
        let hash = 0;
        for (let i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + 42 + ((hash << 5) - hash);
        }
        return '#' + ((hash >> 16) & 0xFFFFFF).toString(16).padStart(6, '0');
    }

    if (!window.rectangleIntercepted) {
        L.Rectangle.addInitHook((function () {
                return
                this.better_id = -1
                const layer = this
                Object.defineProperty(
                    this,
                    'id',
                    {
                        get: function () {
                            try {
                                const username = document.querySelector('#changeset_' + this.better_id + ' a[href^="/user/"]').textContent
                                // debugger
                                this.options.color = makeColor(username)
                            } catch (e) {
                            }

                            return this.better_id
                        },
                        set: function (val) {
                            if (location.pathname !== "/history") {
                                this.better_id = val;
                                return;
                            }
                            const username = document.querySelector('#changeset_' + val + ' a[href^="/user/"]').textContent
                            this.options.color = makeColor(username)

                            this.better_id = val
                        }
                    }
                );
                Object.defineProperty(
                    this.options,
                    'color',
                    {
                        get: function () {
                            if (location.pathname !== "/history") {
                                this.better_id = val;
                                return;
                            }
                            const username = document.querySelector('#changeset_' + layer.better_id + ' a[href^="/user/"]')?.textContent
                            if (!username) return "#000"
                            return makeColor(username)

                            // return this.better_options
                        },
                        set: function (color) {
                            // debugger
                            const username = document.querySelector('#changeset_' + layer.better_id + ' a[href^="/user/"]')?.textContent
                            if (!username) return color
                            return makeColor(username)
                        }
                    }
                );
            })
        )
        window.rectangleIntercepted = true
    }
    `)
}
*/

async function interceptMapManually() {
    // if (!getWindow().rectangleIntercepted) {
    //     interceptRectangle()
    // }
    if (getWindow().mapIntercepted) return
    try {
        console.warn("try intercept map manually")
        getWindow().scriptHandler = GM_info.scriptHandler
        injectJSIntoPage(`
        L.Layer.addInitHook(function () {
                if (window.mapIntercepted) return
                try {
                    this.addEventListener("add", (e) => {
                        if (window.mapIntercepted) return;
                        console.log("%cMap intercepted with workaround", 'background: #000; color: #0f0')
                        window.mapIntercepted = true
                        window.map = e.target._map;
                        if (!window.scriptInstance) {
                            window.scriptInstance = window.scriptHandler;
                        } else if (window.scriptInstance !== window.scriptHandler) {
                            console.error(\`Two copies of the script were running simultaneously via ${window.scriptInstance} and ${window.scriptInstance}. Turn off one of them\`)
                        }
                    })
                } catch (e) {
                    console.error(e)
                }
            }
        )
        `)
        // trigger Layer creation
        let exportImageBtn = document.querySelector("#export-image #image_filter")
        if (!exportImageBtn) {
            await sleep(10)
            exportImageBtn = document.querySelector("#export-image #image_filter")
            if (!exportImageBtn) {
                await sleep(10)
                exportImageBtn = document.querySelector("#export-image #image_filter")
            }
        }
        if (getWindow().mapIntercepted) {
            console.log("skip manual intercepting: already intercepted")
            return
        }
        exportImageBtn.click()
        exportImageBtn.click()
        if (!getWindow().mapIntercepted) {
            console.warn("wait for map intercepting")
            await sleep(9)
        }
    } catch (e) {
        console.error(e)
    }
}

async function addChangesetQuickLook() {
    if (quickLookInjectingStarted) return
    if (!location.pathname.startsWith("/changeset")) {
        allTagsOfObjectsVisible = true
        return
    }
    addQuickLookStyles()
    if (document.querySelector(".quick-look")) return true
    const sidebar = document.querySelector("#sidebar_content h2")
    if (!sidebar) {
        return
    }
    if (!document.querySelector("turbo-frame:is(#changeset_nodes,#changeset_ways,#changeset_relations)")) {
        console.log("changeset is empty")
        return
    }
    quickLookInjectingStarted = true
    resetSearchFormFocus()
    void geocodeCurrentView()
    makeTimesSwitchable()
    if (GM_config.get("ResizableSidebar")) {
        document.querySelector("#sidebar").style.resize = "horizontal"
    }
    addSwipes()
    removeEditTagsButton()

    const changesetID = location.pathname.match(/changeset\/(\d+)/)[1]
    document.querySelectorAll("turbo-frame:is(#changeset_nodes,#changeset_ways,#changeset_relations)").forEach(i => i.setAttribute("changeset-id", changesetID))

    const params = new URLSearchParams(location.search)
    let changesetIDs = []
    if (params.get("changesets")) {
        changesetIDs =
            params
                .get("changesets")
                ?.split(",")
                ?.filter(i => i !== changesetID) ?? []
    }

    if (!GM_config.get("NavigationViaHotkeys")) {
        setTimeout(loadChangesetMetadata, 0)
    }
    await processQuickLookInSidebar(changesetID)

    if (changesetIDs.length) {
        await processQuickLookForCombinedChangesets(changesetID, changesetIDs)
    }

    if (needPreloadChangesets) {
        preloadPrevNextChangesets(changesetID)
    }
}

function setupChangesetQuickLook(path) {
    if (!path.startsWith("/changeset")) return
    const timerId = setInterval(addChangesetQuickLook, 100)
    setTimeout(() => {
        clearInterval(timerId)
        console.debug("stop try add QuickLook")
    }, 4000)
    void addChangesetQuickLook()
}

//</editor-fold>
