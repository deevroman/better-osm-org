//<editor-fold desc="user-profile-stat" defaultstate="collapsed">

async function loadChangesetsBetween(user, fromTime, toTime) {
    let curTime = fromTime
    const processedChangesets = new Set()
    /*** @type {ChangesetMetadata[]}*/
    const changesets = []

    while (true) {
        /*** @type {{changesets: ChangesetMetadata[]}}*/
        const res = await fetchJSONWithCache(
            osm_server.apiBase +
                "changesets.json?" +
                new URLSearchParams({
                    display_name: user,
                    order: "oldest",
                    from: curTime.toISOString(),
                    to: toTime.toISOString(),
                }).toString(),
        )
        console.debug(res)

        res.changesets = res.changesets.filter(i => !processedChangesets.has(i.id))
        if (res.changesets.length === 0) break

        res.changesets.forEach(i => {
            changesets.push(i)
            processedChangesets.add(i.id)
        })

        curTime = new Date(res.changesets[res.changesets.length - 1].created_at)
    }
    console.log(`${changesets.length} changesets from ${fromTime} to ${toTime} fetched`)
    changesets.forEach(i => {
        if (i.comments_count) {
            void getChangesetComments(i.id)
        }
    })
    return changesets
}

/**
 * @template T
 * @template X
 * @param {T[]} items
 * @param {(T) => X} keyFn
 * @return {T[]}
 */
function uniq(items, keyFn) {
    const uniqs = new Set()
    const result = []

    items.forEach(i => {
        const elem = keyFn(i)
        if (!uniqs.has(elem)) {
            uniqs.add(elem)
            result.push(i)
        }
    })
    return result
}

/**
 * @param user {string}
 * @return {Promise<ChangesetMetadata[]>}
 */
async function loadChangesets(user) {
    console.time(`stat-for-${user}`)
    const startTime = new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 365)
    const startTime2 = new Date(new Date().getTime() - (1000 * 60 * 60 * 24 * 365 * 3) / 4)
    const startTime3 = new Date(new Date().getTime() - (1000 * 60 * 60 * 24 * 365 * 2) / 4)
    const startTime4 = new Date(new Date().getTime() - (1000 * 60 * 60 * 24 * 365) / 4)
    const endTime = new Date(new Date().getTime() + 1000 * 60 * 60 * 24)

    const parts = await Promise.all([
        loadChangesetsBetween(user, startTime, startTime2),
        loadChangesetsBetween(user, startTime2, startTime3),
        loadChangesetsBetween(user, startTime3, startTime4),
        loadChangesetsBetween(user, startTime4, endTime),
    ])

    const uniqChangesets = new Set()
    const changesets = []

    parts.forEach(part => {
        part.forEach(ch => {
            if (!uniqChangesets.has(ch.id)) {
                uniqChangesets.add(ch.id)
                changesets.push(ch)
            }
        })
    })

    console.timeEnd(`stat-for-${user}`)
    console.log("Changesets for the last year:", changesets.length)
    return changesets
}

/**
 * @param {ChangesetMetadata[]} changesets
 * @param filter
 * @return {[Object.<string, [number, number, {id: number, comment: string, comments_count: number}]>, number]}
 */
function makeChangesetsStat(changesets, filter) {
    const datesStat = {}
    let changesets_count = 0

    changesets.forEach(i => {
        if (!filter(i)) return
        changesets_count++
        const date = new Date(i.created_at)
        const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`
        if (datesStat[key] === undefined) {
            datesStat[key] = [0, 0, []]
        }
        datesStat[key][0] += i.changes_count
        datesStat[key][1] = max(datesStat[key][1], i.id)
        datesStat[key][2].push({
            id: i.id,
            comment: i?.tags?.["comment"] ?? "",
            comments_count: i.comments_count,
        })
    })

    return [
        Object.fromEntries(
            Object.entries(datesStat).sort((a, b) => {
                if (a[0] < b[0]) {
                    return -1
                }
                if (a[0] > b[0]) {
                    return 1
                }
                return 0
            }),
        ),
        changesets_count,
    ]
}

async function makeEditorNormalizer() {
    const url = "https://raw.githubusercontent.com/deevroman/openstreetmap-statistics/refs/heads/master/config/replace_rules_created_by.json"
    const rawReplaceRules = (
        await externalFetchRetry({
            url: url,
        })
    ).responseText
    console.log("replace rules loaded")

    const tag_to_name = {}
    const starts_with_list = []
    const ends_with_list = []
    const contains_list = []
    Object.entries(JSON.parse(rawReplaceRules)).forEach(([name, name_infos]) => {
        if (name_infos["aliases"]) {
            for (let alias in name_infos["aliases"]) {
                tag_to_name[alias] = name
            }
        }
        if (name_infos["starts_with"]) {
            for (const starts_with of name_infos["starts_with"]) {
                starts_with_list.push([starts_with.length, starts_with, name])
            }
        }
        if (name_infos["ends_with"]) {
            for (const ends_with of name_infos["ends_with"]) {
                ends_with_list.push([ends_with.length, ends_with, name])
            }
        }
        if (name_infos["contains"]) {
            for (const compare_str of name_infos["contains"]) {
                contains_list.push([compare_str, name])
            }
        }
    })

    return tag => {
        if (!tag) return tag

        if (tag_to_name[tag]) {
            return tag_to_name[tag]
        }

        for (let [compare_str_length, compare_str, replace_str] of starts_with_list) {
            if (tag.slice(0, compare_str_length) === compare_str) {
                return replace_str
            }
        }

        for (let [compare_str_length, compare_str, replace_str] of ends_with_list) {
            if (tag.slice(-compare_str_length) === compare_str) {
                return replace_str
            }
        }

        for (let [compare_str, replace_str] of contains_list) {
            if (tag.includes(compare_str)) {
                return replace_str
            }
        }

        return tag
    }
}

/**
 * @param {string} user
 * @return {Promise<{id: number, startTime: string}[]>}
 */
async function getUserBlocks(user) {
    if (document.querySelector('a[href$="/blocks"]')?.nextElementSibling?.textContent === undefined) {
        return []
    }
    const xml = (
        await externalFetchRetry({
            url: `/user/${user}/blocks`,
            headers: { "turbo-frame": "pagination" },
        })
    ).response
    const blocks = []
    new DOMParser()
        .parseFromString(xml, "text/html")
        .querySelectorAll("table tr")
        .forEach(i => {
            if (i.querySelector("th")) {
                return
            }
            blocks.push({
                id: parseInt(
                    i
                        .querySelector('td a[href^="/user_blocks/"]')
                        .getAttribute("href")
                        .match(/\/user_blocks\/([0-9]+)/)[1],
                ),
                startTime: i.querySelector("td time").getAttribute("datetime"),
            })
        })
    console.log(blocks)
    return blocks
}

async function betterUserStat() {
    const match = location.pathname.match(/^\/user\/([^/]+)\/?$/)
    if (!match) {
        return
    }
    const user = decodeURI(match[1])
    if (!GM_config.get("BetterProfileStat") || !location.pathname.match(/^\/user\/([^/]+)\/?$/)) {
        return
    }
    if (document.getElementById("filter-bar")) {
        return
    }
    const filterBar = document.createElement("div")
    filterBar.id = "filter-bar"
    filterBar.style.display = "flex"
    filterBar.style.gap = "3px"

    const filterInputByEditor = document.createElement("select")
    filterInputByEditor.style.flex = "1"
    filterInputByEditor.id = "filter-input-by-editor"
    filterInputByEditor.setAttribute("disabled", true)
    filterInputByEditor.title = t("userProfile.pleaseWaitUserChangesetsLoading")

    const item = document.createElement("option")
    item.value = ""
    item.setAttribute("all-editors", "yes")
    item.textContent = t("userProfile.allEditors")
    filterInputByEditor.appendChild(item)

    const calHeatmap = document.querySelector(".heatmap")
    if (!calHeatmap) {
        console.log("osm.org don't show heatmap for this user")
        return
    }
    injectCSSIntoOSMPage(`
    .tooltip-inner {
        white-space: pre-wrap;
        text-align: left;
    }
    `)
    calHeatmap.parentElement.parentElement.after(filterBar)
    filterBar.appendChild(filterInputByEditor)

    const searchByComment = document.createElement("input")
    searchByComment.type = "search"
    searchByComment.placeholder = t("userProfile.regexSearchByCommentsPlaceholder")
    searchByComment.title = t("userProfile.pleaseWaitUserChangesetsLoading")
    searchByComment.setAttribute("disabled", true)
    searchByComment.style.flex = "1"
    searchByComment.style.height = "1.5rem"
    searchByComment.style.boxSizing = "border-box"
    filterInputByEditor.before(searchByComment)

    const _replace_with_rules = makeEditorNormalizer()
    const _blocks_list = getUserBlocks(user).then(async blocks => {
        if (!blocks) {
            console.debug("user blocks not found")
            return []
        }
        for (let block of blocks) {
            block.text = (await getBlockInfo(block.id)).replaceAll("\r\n\r\n", "\n")
        }
        let curBlockIndex = 0
        for (let day of Array.from(document.querySelectorAll("[data-date]"))) {
            const dayDate = day.getAttribute("data-date")
            if (curBlockIndex < blocks.length) {
                if (blocks[curBlockIndex].startTime.startsWith(dayDate)) {
                    day.style.opacity = "1"
                    day.style.fontSize = "smaller"
                    day.textContent = "⛔"
                    curBlockIndex++
                    day.addEventListener(
                        "mouseenter",
                        () => {
                            if (searchByComment.hasAttribute("disabled")) {
                                searchByComment.setAttribute("need-activate-immediately", "true")
                            } else {
                                searchByComment.dispatchEvent(new Event("input", { bubbles: true }))
                            }
                        },
                        { once: true },
                    )
                }
            } else {
                break
            }
        }
        console.log(blocks)
        return blocks
    })
    const changesets = await loadChangesets(user)
    const replace_with_rules = await _replace_with_rules
    const blocks_list = await _blocks_list

    const editorOfChangesets = {}
    changesets.forEach(ch => (editorOfChangesets[ch.id] = replace_with_rules(ch.tags?.["created_by"])))
    filterInputByEditor.removeAttribute("disabled")
    searchByComment.removeAttribute("disabled")
    filterInputByEditor.title = t("userProfile.openSelectedChangesetsOnePage")
    searchByComment.title = t("userProfile.regexSearchNotCaseSensitive")

    async function inputHandler() {
        let filter = _ => true
        const selected = Array.from(filterInputByEditor.options).filter(i => i.selected)
        let regex
        try {
            regex = new RegExp(searchByComment.value.toLowerCase())
            searchByComment.style.color = ""
        } catch {
            searchByComment.style.color = "red"
        }
        filter = ch => {
            return selected.some(option => {
                if (option.getAttribute("all-editors") === "yes") {
                    return (ch.tags?.["comment"] ?? "").toLowerCase().match(regex)
                } else if (option.getAttribute("is-editor-name") === "yes") {
                    return editorOfChangesets[ch.id] === option.value && (ch.tags?.["comment"] ?? "").toLowerCase().match(regex)
                } else {
                    return ch.tags?.["created_by"] === option.value && (ch.tags?.["comment"] ?? "").toLowerCase().match(regex)
                }
            })
        }
        const [newHeatmapData, changesets_count] = makeChangesetsStat(changesets, filter)
        const maxPerDay = Object.values(newHeatmapData)
            .map(i => i[0])
            .reduce((a, b) => max(a, b), 0)
        searchByComment.title = t("userProfile.filteredChangesets", { count: changesets_count })

        function replaceElementTag(oldElement, newTagName) {
            const attrs = {}
            for (const attr of oldElement.attributes) {
                attrs[attr.name] = attr.value
            }
            const newElement = GM_addElement(newTagName, attrs)
            while (oldElement.firstChild) {
                newElement.appendChild(oldElement.firstChild)
            }
            oldElement.parentNode.replaceChild(newElement, oldElement)
            return newElement
        }

        function getTooltipSummary(date, value) {
            const localizedDate = getWindow().OSM.i18n.l("date.formats.long", intoPageWithFun(date))
            if (value > 0) {
                return getWindow().OSM.i18n.t(
                    "javascripts.contribution_calendar.tooltip.contributions",
                    intoPage({
                        count: value,
                        date: localizedDate,
                    }),
                )
            }
            return getWindow().OSM.i18n.t("javascripts.contribution_calendar.tooltip.no_contributions", intoPage({ date: localizedDate }))
        }

        getWindow().$("[rel=tooltip]").tooltip("dispose")
        document.querySelectorAll(".tooltip").forEach(i => i.remove())
        const hrefPrefix = location.href.endsWith("/") ? location.href.slice(0, -1) : location.href
        let curBlockIndex = 0
        for (let day of Array.from(document.querySelectorAll("[data-date]"))) {
            day = replaceElementTag(day, "a")
            const dayDate = day.getAttribute("data-date")
            let banInfo = null
            if (blocks_list && curBlockIndex < blocks_list.length) {
                if (blocks_list[curBlockIndex].startTime.startsWith(dayDate)) {
                    banInfo = blocks_list[curBlockIndex]
                    curBlockIndex++
                }
            }
            const newData = newHeatmapData[dayDate]
            if (newData) {
                day.setAttribute("data-count", newData[0])
                day.setAttribute("href", hrefPrefix + "/history?before=" + (newData[1] + 1))
                day.replaceChildren()
                const colorDiff = document.createElement("span")
                if (banInfo) {
                    colorDiff.style.opacity = "1"
                    colorDiff.style.fontSize = "smaller"
                    colorDiff.textContent = "⛔"
                } else {
                    colorDiff.style.opacity = `${Math.sqrt(newData[0] / maxPerDay)}`
                }
                let tooltipText = getTooltipSummary(new Date(day.getAttribute("data-date")), newData[0])
                if (newData[0]) {
                    tooltipText += "\n"
                    for (let changeset of newData[2]) {
                        let changesetComment = ""
                        if (changeset.comments_count) {
                            colorDiff.style.opacity = `${Math.min(0.7, Math.max(0.35, Math.sqrt(newData[0] / maxPerDay)))}`
                            colorDiff.style.background = "red"
                            changesetComment = "💬 " + changeset.comment
                            ;(await getChangesetComments(changeset.id)).forEach(mapperCommentText => {
                                changesetComment +=
                                    "\n - " +
                                    mapperCommentText["user"] +
                                    ": " +
                                    shortOsmOrgLinksInText(mapperCommentText["text"])?.slice(0, 500)
                                if (mapperCommentText["text"].length > 500) {
                                    changesetComment += "..."
                                }
                            })
                        } else {
                            changesetComment = "• " + changeset.comment
                        }
                        tooltipText += changesetComment + "\n"
                    }
                }
                if (banInfo) {
                    tooltipText += "\n⛔" + banInfo.text
                }
                day.appendChild(colorDiff)
                getWindow()
                    .$(day)
                    .tooltip(
                        intoPage({
                            title: tooltipText,
                            customClass: "wide",
                            delay: { show: 0, hide: 0 },
                        }),
                    )
            } else {
                day.removeAttribute("data-count")
                day.setAttribute("href", "")
                day.replaceChildren()
                if (day.nodeName === "A") {
                    day = replaceElementTag(day, "span")
                }
                if (banInfo) {
                    day.style.opacity = "1"
                    day.style.fontSize = "smaller"
                    day.textContent = "⛔"
                    getWindow()
                        .$(day)
                        .tooltip(
                            intoPage({
                                title: "⛔" + banInfo.text,
                                customClass: "wide",
                                delay: { show: 0, hide: 0 },
                            }),
                        )
                } else {
                    getWindow().$(day).tooltip("disable")
                }
            }
        }
    }

    filterInputByEditor.oninput = inputHandler
    searchByComment.oninput = inputHandler
    document.addEventListener("keydown", e => {
        if (e.altKey && e.code === "KeyO") {
            const selected = Array.from(filterInputByEditor.options).filter(i => i.selected)
            const ids = changesets
                .filter(ch => {
                    return selected.some(i => ch?.tags?.["created_by"]?.includes(i.value))
                })
                .map(i => i.id)
            const idsStr = ids.join(",")
            open(osm_server.url + `/changeset/${ids[0]}?changesets=` + idsStr, "_blank")
        }
    })

    filterInputByEditor.id = "editors"
    filterInputByEditor.addEventListener(
        "mousedown",
        function (e) {
            e.preventDefault()
            e.target.focus()
            filterInputByEditor.setAttribute("size", 7)
            filterInputByEditor.setAttribute("multiple", true)
            inputHandler()
        },
        { once: true },
    )
    searchByComment.addEventListener(
        "mousedown",
        function () {
            inputHandler()
        },
        { once: true },
    )

    const counts = {}

    changesets.forEach(i => {
        const editor = editorOfChangesets[i.id]
        counts[editor] = counts[editor] ? counts[editor] + i.changes_count : i.changes_count
    })

    Array.from(new Set(changesets.map(i => editorOfChangesets[i.id])))
        .sort((a, b) => {
            if (counts[a] < counts[b]) {
                return 1
            }
            if (counts[a] > counts[b]) {
                return -1
            }
            return 0
        })
        .forEach(i => {
            const item = document.createElement("option")
            item.value = i
            item.setAttribute("is-editor-name", "yes")
            item.textContent = t("userProfile.editorContributions", { editor: i, count: counts[i] })
            filterInputByEditor.appendChild(item)
        })
    filterInputByEditor.appendChild(document.createElement("hr"))
    Array.from(new Set(changesets.map(i => i.tags?.["created_by"])))
        .sort()
        .forEach(i => {
            const item = document.createElement("option")
            item.value = i
            item.textContent = i
            filterInputByEditor.appendChild(item)
        })

    console.log("setuping filters finished")
    if (searchByComment.hasAttribute("need-activate-immediately")) {
        searchByComment.dispatchEvent(new Event("input", { bubbles: true }))
    }
    return true
}

async function getBlockInfo(blockID) {
    const blockInfo = (
        await externalFetchRetry({
            url: "/api/0.6/user_blocks/" + blockID + ".json",
            responseType: "json",
            headers: { "turbo-frame": "pagination" },
        })
    ).response
    return `${blockInfo["user_block"]["created_at"]}\n${blockInfo["user_block"]["creator"]["user"]}: ${blockInfo["user_block"]["reason"]}`
}

function setupBetterProfileStat() {
    const match = location.pathname.match(/^\/user\/([^/]+)\/?$/)
    if (!match) {
        return
    }
    tryApplyModule(betterUserStat, 300, 5000)
}

//</editor-fold>
