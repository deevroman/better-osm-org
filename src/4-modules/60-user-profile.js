//<editor-fold desc="user-profile" defaultstate="collapsed">

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
        console.log(res)

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

    // prettier-ignore
    const parts = await Promise.all([
        loadChangesetsBetween(user, startTime, startTime2),
        loadChangesetsBetween(user, startTime2, startTime3),
        loadChangesetsBetween(user, startTime3, startTime4),
        loadChangesetsBetween(user, startTime4, endTime)
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
    const url = "https://raw.githubusercontent.com/deevroman/openstreetmap-statistics/refs/heads/master/src/replace_rules_created_by.json"
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

async function betterUserStat(user) {
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
    filterInputByEditor.title = "Please wait while user changesets loading"

    const item = document.createElement("option")
    item.value = ""
    item.setAttribute("all-editors", "yes")
    item.textContent = "All editors"
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
    searchByComment.placeholder = "Regex search by comments"
    searchByComment.title = "Please wait while user changesets loading"
    searchByComment.setAttribute("disabled", true)
    searchByComment.style.flex = "1"
    searchByComment.style.height = "1.5rem"
    searchByComment.style.boxSizing = "border-box"
    filterInputByEditor.before(searchByComment)

    const _replace_with_rules = makeEditorNormalizer()
    const changesets = await loadChangesets(user)
    const replace_with_rules = await _replace_with_rules
    const editorOfChangesets = {}
    changesets.forEach(ch => (editorOfChangesets[ch.id] = replace_with_rules(ch.tags?.["created_by"])))
    filterInputByEditor.removeAttribute("disabled")
    searchByComment.removeAttribute("disabled")
    filterInputByEditor.title = "Alt + O for open selected changesets on one page"
    searchByComment.title = "Not case-sensitive regex search"

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
        searchByComment.title = `${changesets_count} changesets filtered`

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
                    "javascripts.heatmap.tooltip.contributions",
                    intoPage({
                        count: value,
                        date: localizedDate,
                    }),
                )
            }
            return getWindow().OSM.i18n.t("javascripts.heatmap.tooltip.no_contributions", intoPage({ date: localizedDate }))
        }

        getWindow().$("[rel=tooltip]").tooltip("dispose")
        document.querySelectorAll(".tooltip").forEach(i => i.remove())
        const hrefPrefix = location.href.endsWith("/") ? location.href.slice(0, -1) : location.href
        for (let day of Array.from(document.querySelectorAll("[data-date]"))) {
            day = replaceElementTag(day, "a")
            const newData = newHeatmapData[day.getAttribute("data-date")]
            if (newData) {
                day.setAttribute("data-count", newData[0])
                day.setAttribute("href", hrefPrefix + "/history?before=" + (newData[1] + 1))
                day.innerHTML = ""
                const colorDiff = document.createElement("span")
                colorDiff.style.opacity = `${Math.sqrt(newData[0] / maxPerDay)}`
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
                                changesetComment += "\n - " + mapperCommentText["user"] + ": " + shortOsmOrgLinksInText(mapperCommentText["text"])?.slice(0, 500)
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
                day.innerHTML = ""
                if (day.nodeName === "A") {
                    day = replaceElementTag(day, "span")
                }
                getWindow().$(day).tooltip("disable")
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
            if (i === 1) {
                item.textContent = ` ${i} (${counts[i]} contribution)`
            } else {
                item.textContent = ` ${i} (${counts[i]} contributions)`
            }
            filterInputByEditor.appendChild(item)
        })

    Array.from(new Set(changesets.map(i => i.tags?.["created_by"])))
        .sort()
        .forEach(i => {
            const item = document.createElement("option")
            item.value = i
            item.textContent = i
            filterInputByEditor.appendChild(item)
        })

    filterInputByEditor.after(filterInputByEditor)
    console.log("setuping filters finished")
}

// https://osm.org/user/Молотов-Прибой
// https://osm.org/user/user_14840936
// https://osm.org/user/Torunianin
// https://osm.org/user/user_22937564
// https://osm.org/user/korobkov
// https://osm.org/user/user_389895
// https://osm.org/user/user_20965583
async function makeProfileForDeletedUser(user) {
    const content = document.querySelector(".content-body")
    const div = document.createElement("div")
    div.classList.add("content-inner", "position-relative", "m-auto")

    const webArchiveLink = document.createElement("a")
    webArchiveLink.textContent = "WebArchive"
    webArchiveLink.target = "_blank"
    webArchiveLink.href = "https://web.archive.org/web/*/https://www.openstreetmap.org/user/" + decodeURI(user)
    div.appendChild(webArchiveLink)
    div.appendChild(document.createElement("br"))

    function makeOSMChaLink(username) {
        const osmchaLink = document.createElement("a")
        osmchaLink.textContent = " [OSMCha] "
        osmchaLink.id = "osmcha_link"
        osmchaLink.title = "Open profile in OSMCha.org"
        osmchaLink.href = makeOsmchaLinkForUsername(username)
        osmchaLink.target = "_blank"
        osmchaLink.rel = "noreferrer"
        return osmchaLink
    }

    async function processIDs(data, elemForResult) {
        if (data.length === 1) {
            elemForResult.appendChild(document.createTextNode("User ID: "))
        } else {
            elemForResult.appendChild(document.createTextNode(`⚠️ Found ${data.length} user IDs`))
            elemForResult.appendChild(document.createElement("br"))
            elemForResult.appendChild(document.createTextNode(`🆔: `))
        }
        for (let i = 0; i < data.length; i++) {
            if (i !== 0) {
                elemForResult.appendChild(document.createElement("br"))
                elemForResult.appendChild(document.createElement("hr"))
                elemForResult.appendChild(document.createTextNode("🆔:"))
            }
            const id = data[i].id
            const idSpan = document.createElement("span")
            idSpan.textContent = id
            idSpan.title = "Click for copy"
            idSpan.style.cursor = "pointer"
            idSpan.onclick = e => {
                navigator.clipboard.writeText(id).then(() => copyAnimation(e, id))
            }
            injectCSSIntoOSMPage(copyAnimationStyles)
            elemForResult.appendChild(idSpan)
            elemForResult.appendChild(document.createElement("br"))
            if (data[i].names?.length > 1) {
                const p = document.createElement("p")
                p.textContent = "Usernames: "
                injectCSSIntoOSMPage(copyAnimationStyles)
                data[i].names
                    .map(i => i.name)
                    .forEach(name => {
                        const usernameSpan = document.createElement("span")
                        usernameSpan.textContent = name
                        usernameSpan.title = "Click for copy"
                        usernameSpan.style.cursor = "pointer"
                        usernameSpan.onclick = e => {
                            navigator.clipboard.writeText(name).then(() => copyAnimation(e, name))
                        }
                        p.appendChild(usernameSpan)
                        p.appendChild(document.createTextNode(" "))

                        const webArchiveLink = document.createElement("a")
                        webArchiveLink.textContent = "[WA] "
                        webArchiveLink.target = "_blank"
                        webArchiveLink.href = "https://web.archive.org/web/*/https://www.openstreetmap.org/user/" + name
                        p.appendChild(webArchiveLink)

                        p.appendChild(makeOSMChaLink(name))
                    })
                elemForResult.appendChild(p)
            }
            setTimeout(async () => {
                const blocksSpan = document.createElement("span")

                const loadingStatus = document.createElement("span")
                loadingStatus.textContent = " Finding blocks... "
                loadingStatus.style.color = "gray"
                blocksSpan.appendChild(document.createTextNode(" "))
                blocksSpan.appendChild(loadingStatus)

                idSpan.after(blocksSpan)
                const startPage = await externalFetchRetry({
                    url: "/user_blocks",
                    // responseType: "xml",
                    headers: { "turbo-frame": "pagination" },
                })

                const blocksCount = new Map()

                function findBlocks(xml) {
                    const foundUserBlock = []
                    let lastUserBlock
                    new DOMParser()
                        .parseFromString(xml, "text/html")
                        .querySelectorAll("table tr")
                        .forEach(i => {
                            if (i.querySelector("th")) {
                                return
                            }
                            const username = decodeURI(
                                i
                                    .querySelector("td a")
                                    .getAttribute("href")
                                    .match(/\/user\/(.*)$/)[1],
                            )
                            if (blocksCount.has(username)) {
                                blocksCount.set(username, blocksCount.get(username) + 1)
                            } else {
                                blocksCount.set(username, 1)
                            }
                            lastUserBlock = i
                                .querySelector('td a[href^="/user_blocks/"]')
                                .getAttribute("href")
                                .match(/\/user_blocks\/([0-9]+)/)[1]
                            if (username === "user_" + id) {
                                foundUserBlock.push(lastUserBlock)
                            }
                        })
                    return [foundUserBlock, lastUserBlock]
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

                function processFoundedBlocks(foundUserBlock) {
                    foundUserBlock.forEach(blockId => {
                        const blockLink = document.createElement("a")
                        blockLink.href = "/user_blocks/" + blockId
                        blockLink.target = "_blank"
                        blockLink.textContent = "🔨/" + blockId
                        getBlockInfo(blockId).then(res => {
                            blockLink.title = res
                        })
                        blocksSpan.appendChild(blockLink)
                        blocksSpan.appendChild(document.createTextNode(" "))
                    })
                }

                let [foundUserBlock, lastUserBlock] = findBlocks(startPage.response)
                if (foundUserBlock.length) {
                    processFoundedBlocks(foundUserBlock)
                } else {
                    while (lastUserBlock > 1) {
                        async function processBlocks(before) {
                            console.log("download user_block before ", before)
                            before = Math.max(1, before)
                            const startPage = await externalFetchRetry({
                                url: "/user_blocks?before=" + before,
                                // responseType: "xml",
                                headers: { "turbo-frame": "pagination" },
                            })
                            ;[foundUserBlock, before] = findBlocks(startPage.response)
                            if (!before) {
                                return
                            }
                            if (foundUserBlock.length) {
                                processFoundedBlocks(foundUserBlock)
                            }
                        }

                        const onPage = 20
                        const threads = 10
                        console.log("download user_block batch before ", lastUserBlock)
                        loadingStatus.title = `Scanned all blocks after #${lastUserBlock}`
                        const batch = []
                        for (let j = 0; j < threads; j++) {
                            batch.push(processBlocks(lastUserBlock - onPage * j))
                        }
                        await Promise.all(batch)
                        lastUserBlock -= threads * onPage
                    }
                    loadingStatus.style.display = "none"
                    const arr = Array.from(blocksCount.entries()).filter(([k, v]) => v >= 10)
                    arr.sort((a, b) => {
                        if (a[1] < b[1]) {
                            return 1
                        } else if (a[1] > b[1]) {
                            return -1
                        } else {
                            return 0
                        }
                    })
                    console.log("Top banned:", arr)
                    console.log("All blocks downloaded")
                }
            })

            /*** @type {{changesets: ChangesetMetadata[]}}*/
            const lastChangesets = await fetchJSONWithCache(
                osm_server.apiBase +
                    "changesets.json?" +
                    new URLSearchParams({
                        user: id,
                        order: "newest",
                        to: new Date().toISOString(),
                    }).toString(),
            )
            const processedChangesets = new Set(lastChangesets.changesets.map(c => c.id))

            for (let i = 0; i < 20; i++) {
                const curTime = lastChangesets.changesets[lastChangesets.changesets.length - 1].created_at
                const ch = await fetchJSONWithCache(
                    osm_server.apiBase +
                        "changesets.json?" +
                        new URLSearchParams({
                            user: id,
                            order: "newest",
                            to: new Date(new Date(curTime).getTime() + 1000).toISOString(),
                            from: "2005-01-01T00:00:00Z",
                        }).toString(),
                )
                ch.changesets = ch.changesets.filter(ch => !processedChangesets.has(ch.id))
                if (ch.changesets.length === 0) break
                lastChangesets.changesets.push(...(ch.changesets ?? []))
            }

            elemForResult.appendChild(document.createTextNode(`Last ${lastChangesets.changesets?.length} changesets:`))
            lastChangesets.changesets.forEach(ch => {
                const changesetLine = document.createElement("div")
                const changesetTime = ch["created_at"]
                const checkbox = document.createElement("input")
                checkbox.type = "checkbox"
                checkbox.classList.add("mass-action-checkbox")
                checkbox.textContent = "#" + ch.id + ""
                checkbox.title = "Shift + click for select a range of empty checkboxes"
                checkbox.value = ch.id
                checkbox.setAttribute("user-id", id)
                checkbox.onclick = e => {
                    if (e.shiftKey) {
                        let currentCheckboxFound = false
                        for (const cBox of Array.from(elemForResult.querySelectorAll("input")).toReversed()) {
                            if (!currentCheckboxFound) {
                                if (cBox.value === checkbox.value) {
                                    currentCheckboxFound = true
                                }
                            } else {
                                if (cBox.checked) {
                                    break
                                }
                                cBox.checked = true
                            }
                        }
                    }
                    const selectedIDsCount = elemForResult.querySelectorAll(`input:checked[user-id="${id}"]`).length
                    elemForResult.querySelectorAll(`.copy-changesets-ids-btn[user-id="${id}"]`).forEach(i => {
                        if (selectedIDsCount) {
                            i.textContent = `Copy ${selectedIDsCount} IDs`
                        } else {
                            i.textContent = `Copy IDs`
                        }
                    })
                }
                changesetLine.appendChild(checkbox)
                changesetLine.appendChild(document.createTextNode("\xA0"))

                const a = document.createElement("a")
                a.textContent = ch.id
                a.href = "/changeset/" + ch.id
                a.target = "_blank"
                a.style.fontFamily = "monospace"
                changesetLine.appendChild(a)

                const changesetDate = document.createElement("span")
                changesetDate.textContent = " " + changesetTime + " "
                changesetDate.style.fontFamily = "monospace"
                changesetDate.style.color = "gray"
                changesetDate.style.cursor = "pointer"
                changesetDate.setAttribute("datetime", changesetTime)
                changesetDate.onclick = e => {
                    navigator.clipboard.writeText(changesetTime).then(() => copyAnimation(e, changesetTime))
                }
                changesetLine.appendChild(document.createTextNode("\xA0"))
                changesetLine.appendChild(changesetDate)

                const comment = document.createElement("span")
                comment.textContent = " " + (ch.tags?.["comment"] ?? "No comment")
                changesetLine.appendChild(comment)

                if (ch.comments_count) {
                    const commentsBadge = document.createElement("a")
                    commentsBadge.textContent = " " + ch.comments_count + " 💬"
                    commentsBadge.href = "/changeset/" + ch.id
                    commentsBadge.target = "_blank"
                    setTimeout(async () => {
                        getChangesetComments(ch.id).then(res => {
                            res.forEach(comment => {
                                const shortText = shortOsmOrgLinksInText(comment["text"])
                                commentsBadge.title += `${comment["user"]}:\n${shortText}\n\n`
                            })
                            commentsBadge.title = commentsBadge.title.trimEnd()
                        })
                    })
                    changesetLine.appendChild(commentsBadge)
                }

                elemForResult.appendChild(changesetLine)
            })

            const copyIds = document.createElement("button")
            copyIds.textContent = "Copy IDs"
            copyIds.title = ""
            copyIds.classList.add("copy-changesets-ids-btn")
            copyIds.setAttribute("user-id", id)
            copyIds.onclick = e => {
                const ids = Array.from(elemForResult.querySelectorAll(`input:checked[user-id="${id}"]`))
                    .map(i => i.value)
                    .join(",")
                if (ids !== "") {
                    navigator.clipboard.writeText(ids).then(() => copyAnimation(e, ids))
                } else {
                    const ids = Array.from(elemForResult.querySelectorAll("input"))
                        .map(i => i.value)
                        .join(",")
                    navigator.clipboard.writeText(ids).then(() => copyAnimation(e, ids))
                }
            }
            elemForResult.appendChild(copyIds)
        }
    }

    const res = await externalFetchRetry({
        url: "https://whosthat.osmz.ru/whosthat.php?action=info&name=" + user,
        responseType: "json",
    })
    // FireMonkey compatibility https://github.com/erosman/firemonkey/issues/8
    // but here need resolve problem with return promise
    const data = structuredClone(res.response)
    if (data.length) {
        webArchiveLink.after(makeOSMChaLink(decodeURI(user)))

        const result = document.createElement("p")
        div.appendChild(result)
        result.title = "via whosthat.osmz.ru"
        await processIDs(data, result)
    } else {
        setTimeout(async () => {
            const res = (
                await externalFetchRetry({
                    url:
                        `${overpass_server.apiUrl}/interpreter?` +
                        new URLSearchParams({
                            data: `
                                [out:json];
                                node(user:"${user.replace('"', '\\"')}")->.b;
                                node.b(if:lat() == b.min(lat()));
                                out meta;
                            `,
                        }),
                    responseType: "json",
                })
            ).response
            if (res.elements?.length) {
                webArchiveLink.after(makeOSMChaLink(decodeURI(user)))

                const result = document.createElement("p")
                div.appendChild(result)
                result.title = "via Overpass API"
                await processIDs([{ id: res.elements[0].uid }], result)
            }
        })
    }

    if (user.match(/^user_[0-9]+$/)) {
        const userID = parseInt(user.match(/user_([0-9]+)/)[1])
        const res = await externalFetchRetry({
            url: "https://whosthat.osmz.ru/whosthat.php?action=names&id=" + userID,
            responseType: "json",
        })
        // FireMonkey compatibility https://github.com/erosman/firemonkey/issues/8
        // but here need resolve problem with return promise
        const data = structuredClone(res.response)
        let names = data[0]["names"]

        const userNamesP = document.createElement("p")
        div.appendChild(userNamesP)
        setTimeout(async () => {
            if (!names.length) {
                const res = (
                    await externalFetchRetry({
                        url:
                            `${overpass_server.apiUrl}/interpreter?` +
                            new URLSearchParams({
                                data: `
                            [out:json];
                            node(uid:${userID})->.b;
                            node.b(if:lat() == b.min(lat()));
                            out meta;
                        `,
                            }),
                        responseType: "json",
                    })
                ).response
                if (res?.elements?.length) {
                    names = [res.elements[0].user]
                }
                div.title = "via Overpass API"
            } else {
                div.title = "via whosthat.osmz.ru"
            }
            if (names.length) {
                userNamesP.textContent = "Usernames: "
                injectCSSIntoOSMPage(copyAnimationStyles)
                names.forEach(name => {
                    const usernameSpan = document.createElement("span")
                    usernameSpan.textContent = name
                    usernameSpan.title = "Click for copy"
                    usernameSpan.style.cursor = "pointer"
                    usernameSpan.onclick = e => {
                        navigator.clipboard.writeText(name).then(() => copyAnimation(e, name))
                    }
                    userNamesP.appendChild(usernameSpan)
                    userNamesP.appendChild(document.createTextNode(" "))

                    const webArchiveLink = document.createElement("a")
                    webArchiveLink.textContent = "[WA] "
                    webArchiveLink.target = "_blank"
                    webArchiveLink.href = "https://web.archive.org/web/*/https://www.openstreetmap.org/user/" + name
                    userNamesP.appendChild(webArchiveLink)

                    userNamesP.appendChild(makeOSMChaLink(name))
                })
            }
        })
        await processIDs([{ id: userID }], div)
    }
    content.appendChild(div)
}

async function setupHDYCInProfile(path) {
    const match = path.match(/^\/user\/([^/]+)(\/|\/notes)?$/)
    if (!match || path.includes("/history")) {
        return
    }
    if (document.getElementById("hdyc-iframe")) {
        return
    }
    /** @type {string} **/
    const user = match[1]
    if (user === "forgot-password" || user === "new") return
    document.querySelector(".content-body > .content-inner").style.paddingBottom = "0px"
    if (isDarkMode()) {
        GM_addElement(document.querySelector("#content"), "iframe", {
            src: "https://www.hdyc.neis-one.org/?" + user + "#forcedarktheme",
            width: "100%",
            id: "hdyc-iframe",
            scrolling: "no",
            background: "rgb(49, 54, 59)",
            style: "visibility:hidden;background-color: rgb(49, 54, 59);",
        })
        setTimeout(() => {
            document.getElementById("hdyc-iframe").style.visibility = "visible"
        }, 1500)
    } else {
        GM_addElement(document.querySelector("#content"), "iframe", {
            src: "https://www.hdyc.neis-one.org/?" + user + "#forcelighttheme",
            width: "100%",
            id: "hdyc-iframe",
            scrolling: "no",
        })
    }
    if (document.querySelector('a[href$="/blocks"]')?.nextElementSibling?.textContent > 0) {
        document.querySelector('a[href$="/blocks"]').nextElementSibling.style.background = "rgba(255, 0, 0, 0.3)"
        if (isDarkMode()) {
            document.querySelector('a[href$="/blocks"]').nextElementSibling.style.color = "white"
        }
        getCachedUserInfo(decodeURI(user)).then(userInfo => {
            if (userInfo["blocks"]["received"]["active"] === 0) {
                updateUserInfo(decodeURI(user))
            }
        })
    } else if (document.querySelector('a[href$="/blocks"]')?.nextElementSibling?.textContent === "0") {
        getCachedUserInfo(decodeURI(user)).then(userInfo => {
            if (userInfo["blocks"]["received"]["active"] !== 0) {
                updateUserInfo(decodeURI(user))
            }
        })
    }
    const isDeletedUser = !document.querySelector(".user_image")
    const usernameHeader = document.querySelector("#content h1")?.firstChild
    if (!isDeletedUser && usernameHeader && usernameHeader.nodeType === Node.TEXT_NODE) {
        const span = document.createElement("span")
        span.classList.add("copyable-username")
        span.textContent = usernameHeader.textContent
        span.title = "Click for copy"
        span.style.cursor = "pointer"
        span.onclick = e => {
            const username = usernameHeader.textContent.trim()
            navigator.clipboard.writeText(username).then(() => copyAnimation(e, username))
        }
        usernameHeader.replaceWith(span)
        injectCSSIntoOSMPage(copyAnimationStyles)
    }
    queueMicrotask(async () => {
        if (document.querySelector(".prev-usernames")) return
        const userDetails = document.querySelector(".content-inner small dl")
        if (!userDetails) return
        // https://www.openstreetmap.org/reports/new?reportable_id=12345&reportable_type=User
        let userID = document
            .querySelector('[href*="reportable_id="]')
            ?.getAttribute("href")
            ?.match(/reportable_id=(\d+)/)?.[1]
        userID = userID ?? document.head.getAttribute("data-user")
        if (!userID) {
            const res = await fetchJSONWithCache(
                osm_server.apiBase +
                    "changesets.json?" +
                    new URLSearchParams({
                        display_name: decodeURI(user),
                        limit: 1,
                        order: "oldest",
                    }).toString(),
            )
            if (res["changesets"].length === 0) {
                const res = await fetchJSONWithCache(
                    osm_server.apiBase +
                        "notes/search.json?" +
                        new URLSearchParams({
                            display_name: decodeURI(user),
                            limit: 1,
                            closed: -1,
                            order: "oldest",
                        }).toString(),
                )
                userID = res?.["features"]?.[0]?.["properties"]?.["comments"]?.find(i => i["user"] === decodeURI(user))?.["uid"]
                if (!userID) {
                    return
                }
            } else {
                userID = res["changesets"][0]["uid"]
            }
        }

        async function addUsernames() {
            async function updateUserIDInfo(userID) {
                const res = await externalFetchRetry({
                    url: "https://whosthat.osmz.ru/whosthat.php?action=names&id=" + userID,
                    responseType: "json",
                })
                // FireMonkey compatibility https://github.com/erosman/firemonkey/issues/8
                // but here need resolve problem with return promise
                const userInfo = {
                    data: structuredClone(res.response),
                }
                if (userInfo.data[0]["names"].length > 1) {
                    userInfo["cacheTime"] = new Date()
                    await GM.setValue("useridinfo-" + userID, JSON.stringify(userInfo))

                    const usernames = userInfo.data[0]["names"].filter(i => i !== decodeURI(user)).join(", ")
                    if (document.querySelector(".prev-usernames")) {
                        document.querySelector(".prev-usernames").textContent = usernames
                    }
                }
                return userInfo
            }

            async function getCachedUserIDInfo(userID) {
                const localUserInfo = await GM.getValue("useridinfo-" + userID, "")
                if (localUserInfo) {
                    setTimeout(updateUserIDInfo, 0, userID)
                    return JSON.parse(localUserInfo)
                }
                return await updateUserIDInfo(userID)
            }

            const userIDInfo = await getCachedUserIDInfo(userID)
            if (userIDInfo.data[0]["names"].length <= 1) {
                console.log("prev user's usernames not found")
                return
            }
            const usernames = userIDInfo.data[0]["names"].filter(i => i !== decodeURI(user)).join(", ")
            const dt = document.createElement("dt")
            dt.textContent = "Past usernames: "
            dt.title = "Added by better-osm-org"
            dt.classList.add("list-inline-item", "m-0", "prev-usernames-label")
            const dd = document.createElement("dd")
            dd.classList.add("list-inline-item", "prev-usernames")
            dd.textContent = usernames
            dd.title = "Added by better-osm-org"
            userDetails.appendChild(dt)
            userDetails.appendChild(document.createTextNode("\xA0"))
            userDetails.appendChild(dd)
        }

        await addUsernames()

        function addUserID() {
            if (!document.querySelector('[href^="/api/0.6/user"]')) {
                const dt = document.createElement("dt")
                dt.textContent = "ID: "
                dt.classList.add("list-inline-item", "m-0")
                const dd = document.createElement("dd")
                dd.classList.add("list-inline-item", "user-id")
                dd.textContent = userID
                dd.title = "Click for copy"
                dd.style.cursor = "pointer"
                dd.onclick = e => {
                    navigator.clipboard.writeText(userID).then(() => copyAnimation(e, userID))
                }
                userDetails.appendChild(dt)
                userDetails.appendChild(document.createTextNode("\xA0"))
                userDetails.appendChild(dd)
                injectCSSIntoOSMPage(copyAnimationStyles)
            }
        }

        addUserID()
    })
    const iframe = document.getElementById("hdyc-iframe")
    window.addEventListener("message", function (event) {
        if (event.origin === "https://www.hdyc.neis-one.org") {
            iframe.height = event.data.height + "px"
        }
    })
    if (isDeletedUser && !location.pathname.includes("/notes")) {
        await makeProfileForDeletedUser(user)
    }
}

function setupBetterProfileStat() {
    const match = location.pathname.match(/^\/user\/([^/]+)\/?$/)
    if (!match) {
        return
    }
    const user = match[1]
    const timerId = setInterval(betterUserStat, 300, decodeURI(user))
    setTimeout(() => {
        clearInterval(timerId)
        console.debug("stop try add heatmap filters")
    }, 5000)
    void betterUserStat(decodeURI(user))
}

function inFrame() {
    return window.location !== window.parent.location
}

function simplifyHDCYIframe() {
    if (!inFrame()) {
        return
    }
    const forceLightTheme = location.hash.includes("forcelighttheme")
    const forceDarkTheme = location.hash.includes("forcedarktheme")
    injectCSSIntoSimplePage(`
            html, body {
                overflow-x: auto;
            }

            @media ${forceDarkTheme ? "all" : "(prefers-color-scheme: dark)"} ${forceLightTheme ? "and (not all)" : ""} {
                body {
                    background-color: #181a1b;
                    color: #e8e6e3;
                }

                #header a {
                    color: lightgray !important;
                }

                #activitymap .leaflet-tile,
                #mapwrapper .leaflet-tile {
                    filter: invert(100%) hue-rotate(180deg) contrast(90%);
                }

                #activitymap path {
                    stroke: #0088ff;
                    fill: #0088ff;
                    stroke-opacity: 0.7;
                }

                #activitymapswitcher {
                    background-color: rgba(24, 26, 27, 0.8);
                }

                .leaflet-popup-content {
                    color: lightgray;
                }

                .leaflet-popup-content-wrapper, .leaflet-popup-tip {
                    background: #222;
                }

                a, .leaflet-container a {
                    color: #1c84fd;
                }

                a:visited, .leaflet-container a:visited {
                    color: #c94bff;
                }

                a[style*="black"] {
                    color: lightgray !important;
                }

                .day-cell[fill="#e8e8e8"] {
                    fill: #262a2b;
                }

                #result th {
                    background-color: rgba(24, 26, 27, 0.8);
                }

                #result td {
                    border-color: #363659;
                }

                td[style*="purple"] {
                    color: #ff72ff !important;
                }

                td[style*="green"] {
                    color: limegreen !important;
                }

                #graph_years canvas,
                #graph_editors canvas,
                #graph_days canvas,
                #graph_hours canvas {
                    filter: saturate(4);
                }

                .tickLabel {
                    color: #b3aca2;
                }

                .editors_wrapper th, .editors_wrapper td {
                    border-bottom-color: #8c8273;
                }
            }
        `)
    const loginLink = document.getElementById("loginLink")
    if (loginLink) {
        const warn = document.createElement("div")
        warn.id = "hdyc-warn"
        injectCSSIntoSimplePage(`
                #hdyc-warn, #hdycLink {
                    text-align: left !important;
                    width: 50%;
                    position: relative;
                    left: 35%;
                    right: 33%;
                }
            `)
        if (isFirefox) {
            warn.textContent = "Please disable tracking protection so that the HDYC account login works"

            document.getElementById("authenticate").before(warn)
            const hdycLink = document.createElement("a")
            const match = location.pathname.match(/^\/user\/([^/]+)$/)
            hdycLink.href = "https://www.hdyc.neis-one.org/" + (match ? match[1] : "")
            hdycLink.textContent = "Go to https://www.hdyc.neis-one.org/"
            hdycLink.target = "_blank"
            hdycLink.id = "hdycLink"
            document.getElementById("authenticate").before(document.createElement("br"))
            document.getElementById("authenticate").before(hdycLink)
            document.getElementById("authenticate").remove()
            window.parent.postMessage({ height: document.body.scrollHeight }, "*")
        } else {
            warn.innerHTML = `To see more than just public profiles, do the following:<br/>
0. Turn off tracking protection if your browser has it (for example in Brave or Vivaldi)<br/>
1. <a href="https://www.hdyc.neis-one.org/" target="_blank"> Log in to HDYC</a> <br/>
2. Open the browser console (F12) <br/>
3. Open the Application tab <br/>
4. In the left panel, select <i>Storage</i>→<i>Cookies</i>→<i>https://www.hdyc.neis-one.org</i><br/>
5. Click on the cell with the name <i>SameSite</i> and type <i>None</i> in it`
            document.getElementById("authenticate").before(warn)
            const img_help = document.createElement("img")
            img_help.onload = () => {
                window.parent.postMessage({ height: document.body.scrollHeight }, "*")
            }
            img_help.src = "https://raw.githubusercontent.com/deevroman/better-osm-org/master/misc/img/hdyc-fix-in-chrome.png"
            img_help.style.width = "90%"
            warn.after(img_help)
            document.getElementById("authenticate").remove()
        }
        // var xhr = XPCNativeWrapper(new window.wrappedJSObject.XMLHttpRequest());
        // let res = await GM.xmlHttpRequest({
        //     method: "GET",
        //     url: document.querySelector("#loginLink").href,
        //     withCredentials: true
        // })
        // debugger
        return
    }
    try {
        document.getElementById("header").remove()
        document.getElementById("user").remove()
        document.getElementById("searchfield").remove()
        document.querySelector(".mapper_img").remove()
        let bCnt = 0
        for (let childNodesKey of Array.from(document.querySelector(".since").childNodes)) {
            if (childNodesKey.nodeName === "#text") {
                childNodesKey.remove()
                continue
            }
            if (childNodesKey.classList.contains("image")) {
                continue
            }
            if (childNodesKey.localName === "b") {
                if (bCnt === 2) {
                    break
                }
                bCnt++
            }
            childNodesKey.remove()
        }
    } catch (e) {
        console.error(e)
    }
    window.parent.postMessage({ height: document.body.scrollHeight }, "*")
}

//</editor-fold>
