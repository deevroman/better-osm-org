//<editor-fold desc="/history, /user/*/history">
async function updateUserInfo(username) {
    void initCorporateMappersList()
    const res = await fetchJSONWithCache(
        osm_server.apiBase +
            "changesets.json?" +
            new URLSearchParams({
                display_name: username,
                limit: 1,
                order: "oldest",
            }).toString(),
    )
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

    const res2 = await fetchJSONWithCache(osm_server.apiBase + "user/" + uid + ".json")
    const userInfo = structuredClone(res2.user) // FireMonkey compatibility https://github.com/erosman/firemonkey/issues/8
    userInfo["cacheTime"] = new Date()
    if (firstObjectCreationTime) {
        userInfo["firstChangesetCreationTime"] = new Date(firstObjectCreationTime)
    }
    if (firstChangesetID) {
        userInfo["firstChangesetID"] = firstChangesetID
    }
    await GM.setValue("userinfo-" + username, JSON.stringify(userInfo))
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
    const localUserInfo = await GM.getValue("userinfo-" + username, "")
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

let sidebarObserverForMassActions = null
let massModeForUserChangesetsActive = null
let massModeActive = null
let currentMassDownloadedPages = null
let needHideBigChangesets = true

function openCombinedChangesetsMap() {
    const batchSize = 500

    function openIDs(ids) {
        const forOpen = []
        for (let i = 0; i < ids.length; i += batchSize) {
            const idsStr = ids.slice(i, i + batchSize).join(",")
            forOpen.push(osm_server.url + `/changeset/${ids[i]}?changesets=` + idsStr)
        }
        forOpen.toReversed().forEach(url => open(url, "_blank"))
    }

    const ids = Array.from(document.querySelectorAll(".mass-action-checkbox:checked")).map(i => i.value)
    if (ids.length) {
        openIDs(ids)
    } else {
        const ids = Array.from(document.querySelectorAll(".mass-action-checkbox")).map(i => i.value)
        if (ids.length) {
            openIDs(ids)
        } else {
            const ids = Array.from(document.querySelectorAll(`a[href^="/changeset/"].custom-changeset-id-click`)).map(i => i.getAttribute("href").match(/\/changeset\/([0-9]+)/)[1])
            openIDs(ids)
        }
    }
}

function makeTopActionBar() {
    const actionsBar = document.createElement("div")
    actionsBar.classList.add("actions-bar")
    const copyIds = document.createElement("button")
    copyIds.textContent = "Copy IDs"
    copyIds.classList.add("copy-changesets-ids-btn")
    copyIds.onclick = () => {
        const ids = Array.from(document.querySelectorAll(".mass-action-checkbox:checked"))
            .map(i => i.value)
            .join(",")
        if (ids !== "") {
            navigator.clipboard.writeText(ids).then(() => {
                console.log(ids, "ids copied")
            })
        } else {
            const ids = Array.from(document.querySelectorAll(".mass-action-checkbox"))
                .map(i => i.value)
                .join(",")
            navigator.clipboard.writeText(ids).then(() => {
                console.log(ids, "ids copied")
            })
        }
    }
    const revertButton = document.createElement("button")
    revertButton.textContent = "↩️"
    revertButton.title = "revert via osm-revert"
    revertButton.onclick = () => {
        const ids = Array.from(document.querySelectorAll(".mass-action-checkbox:checked"))
            .map(i => i.value)
            .join(",")
        open("https://revert.monicz.dev/?changesets=" + ids, "_blank")
    }
    const revertViaJOSMButton = document.createElement("button")
    revertViaJOSMButton.textContent = "↩️ via JOSM"
    revertViaJOSMButton.onclick = () => {
        const ids = Array.from(document.querySelectorAll(".mass-action-checkbox:checked"))
            .map(i => i.value)
            .join(",")
        open("http://127.0.0.1:8111/revert_changeset?id=" + ids, "_blank")
    }
    const viewChangesetsButton = document.createElement("button")
    viewChangesetsButton.textContent = "🔍"
    viewChangesetsButton.title = "Display on one map\nif nothing is checked, all uploaded non hidden changesets will open"
    viewChangesetsButton.onclick = openCombinedChangesetsMap
    actionsBar.appendChild(copyIds)
    actionsBar.appendChild(document.createTextNode("\xA0"))
    actionsBar.appendChild(revertButton)
    actionsBar.appendChild(document.createTextNode("\xA0"))
    actionsBar.appendChild(revertViaJOSMButton)
    actionsBar.appendChild(document.createTextNode("\xA0"))
    actionsBar.appendChild(viewChangesetsButton)
    return actionsBar
}

function makeBottomActionBar() {
    if (document.querySelector(".buttom-btn")) return

    const copyIds = document.createElement("button")
    const selectedIDsCount = document.querySelectorAll(".mass-action-checkbox:checked").length
    if (selectedIDsCount) {
        copyIds.textContent = `Copy ${selectedIDsCount} IDs`
    } else {
        copyIds.textContent = "Copy IDs"
    }
    copyIds.classList.add("copy-changesets-ids-btn")
    copyIds.classList.add("buttom-btn")
    copyIds.classList.add("page-link")
    copyIds.onclick = () => {
        const ids = Array.from(document.querySelectorAll(".mass-action-checkbox:checked"))
            .map(i => i.value)
            .join(",")
        if (ids !== "") {
            navigator.clipboard.writeText(ids).then(() => {
                console.log(ids, "ids copied")
            })
        } else {
            const ids = Array.from(document.querySelectorAll(".mass-action-checkbox"))
                .map(i => i.value)
                .join(",")
            navigator.clipboard.writeText(ids).then(() => {
                console.log(ids, "ids copied")
            })
        }
    }
    const revertButton = document.createElement("button")
    revertButton.textContent = "↩️"
    revertButton.title = "revert via osm-revert"
    revertButton.onclick = () => {
        const ids = Array.from(document.querySelectorAll(".mass-action-checkbox:checked"))
            .map(i => i.value)
            .join(",")
        window.location = "https://revert.monicz.dev/?changesets=" + ids
    }
    revertButton.classList.add("page-link")
    const viewChangesetsButton = document.createElement("button")
    viewChangesetsButton.textContent = "🔍"
    viewChangesetsButton.title = "Display on one map"
    viewChangesetsButton.onclick = openCombinedChangesetsMap
    viewChangesetsButton.classList.add("page-link")
    const changesetMore = document.querySelector('#sidebar_content div.changeset_more:has([href*="before"]) li')
    if (changesetMore) {
        changesetMore.style.display = "inline-flex"
        changesetMore.appendChild(copyIds)
        changesetMore.appendChild(document.createTextNode("\xA0"))
        changesetMore.appendChild(revertButton)
        changesetMore.appendChild(document.createTextNode("\xA0"))
        changesetMore.appendChild(viewChangesetsButton)
    } else {
        const changesetsList = document.querySelector("#sidebar_content ol")
        const actionBarWrapper = document.createElement("ul")
        actionBarWrapper.classList.add("pagination", "justify-content-center")
        const actionBarWrapperLi = document.createElement("li")
        actionBarWrapperLi.classList.add("page-item")
        actionBarWrapperLi.style.display = "inline-flex"
        actionBarWrapper.appendChild(actionBarWrapperLi)

        actionBarWrapperLi.classList.add("action-bar-wrapper")
        actionBarWrapperLi.classList.add("text-center")
        actionBarWrapperLi.appendChild(copyIds)
        actionBarWrapperLi.appendChild(document.createTextNode("\xA0"))
        actionBarWrapperLi.appendChild(revertButton)
        actionBarWrapperLi.appendChild(document.createTextNode("\xA0"))
        actionBarWrapperLi.appendChild(viewChangesetsButton)
        changesetsList.after(actionBarWrapper)
    }
}

function makeOsmchaLinkForUsername(username) {
    // example: https://osmcha.org?filters={"users":[{"label":"TrickyFoxy","value":"TrickyFoxy"}]}
    const osmchaFilter = {
        users: [{ label: username, value: username }],
        date__gte: [{ label: "", value: "" }],
    }
    return `${osmcha_server_origin}?${new URLSearchParams({ filters: JSON.stringify(osmchaFilter) }).toString()}`
}

function addMassActionForUserChangesets() {
    if (!location.pathname.includes("/user/") || document.querySelector("#mass-action-btn")) {
        return
    }
    const a = document.createElement("a")
    a.title = "Add checkboxes for mass actions with changesets"
    a.textContent = " 📋"
    a.style.cursor = "pointer"
    a.id = "mass-action-btn"
    a.onclick = () => {
        if (massModeForUserChangesetsActive === null) {
            massModeForUserChangesetsActive = true
            document.querySelector("#sidebar div.changesets").before(makeTopActionBar())
            document.querySelector('#sidebar div.changeset_more:has([href*="before"])').after(document.createTextNode("   "))
            makeBottomActionBar()
            document.querySelectorAll("ol li").forEach(addChangesetCheckbox)
        } else {
            massModeForUserChangesetsActive = !massModeForUserChangesetsActive
            document.querySelectorAll(".actions-bar").forEach(i => i.toggleAttribute("hidden"))
            document.querySelectorAll(".mass-action-checkbox").forEach(i => {
                i.toggleAttribute("hidden")
            })
        }
    }
    const username = decodeURI(location.pathname.match(/\/user\/(.*)\/history$/)[1])
    const osmchaLink = document.createElement("a")
    osmchaLink.innerHTML = osmchaSvgLogo
    osmchaLink.id = "osmcha_link"
    osmchaLink.title = "Open profile in OSMCha"
    osmchaLink.href = makeOsmchaLinkForUsername(username)
    osmchaLink.target = "_blank"
    osmchaLink.rel = "noreferrer"

    const osmchaIcon = osmchaLink.querySelector("svg")
    osmchaIcon.style.height = "1em"
    osmchaIcon.style.cursor = "pointer"
    osmchaIcon.style.marginTop = "-3px"
    if (isDarkMode()) {
        osmchaIcon.style.filter = "invert(0.7)"
    }
    osmchaLink.appendChild(osmchaIcon)

    document.querySelector("#sidebar_content h2").appendChild(a)
    document.querySelector("#sidebar_content h2").appendChild(document.createTextNode("\xA0"))
    document.querySelector("#sidebar_content h2").appendChild(osmchaLink)
    // setTimeout(async () => {
    //     const res = await fetchJSONWithCache(
    //         osm_server.apiBase +
    //         "notes/search.json?" +
    //         new URLSearchParams({
    //             display_name: username,
    //             closed: -1,
    //             order: "newest",
    //         }).toString(),
    //     )
    //     debugger
    // })
}

function addChangesetCheckbox(chagesetElem) {
    if (chagesetElem.querySelector(".mass-action-checkbox")) {
        return
    }
    const a = document.createElement("a")
    a.classList.add("mass-action-wrapper")
    const checkbox = document.createElement("input")
    checkbox.type = "checkbox"
    checkbox.classList.add("mass-action-checkbox")
    checkbox.value = chagesetElem.querySelector(".changeset_id").href.match(/\/(\d+)/)[1]
    checkbox.style.cursor = "pointer"
    checkbox.title = "Shift + click for select a range of empty checkboxes"
    checkbox.onclick = e => {
        if (e.shiftKey) {
            let currentCheckboxFound = false
            for (const cBox of Array.from(document.querySelectorAll(".mass-action-checkbox")).toReversed()) {
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
        const selectedIDsCount = document.querySelectorAll(".mass-action-checkbox:checked").length
        document.querySelectorAll(".copy-changesets-ids-btn").forEach(i => {
            if (selectedIDsCount) {
                i.textContent = `Copy ${selectedIDsCount} IDs`
            } else {
                i.textContent = `Copy IDs`
            }
        })
    }
    a.appendChild(checkbox)
    chagesetElem.querySelector("p").prepend(a)
    chagesetElem.querySelectorAll("a.changeset_id").forEach(i => {
        i.onclick = e => {
            if (massModeActive) {
                e.preventDefault()
            }
        }
    })
}

function filterChangesets(htmlDocument = document) {
    const usernameFilters = document
        .querySelector("#filter-by-user-input")
        .value.trim()
        .split(",")
        .map(i => i.trim())
        .filter(i => i !== "")
    const commentFilters = document
        .querySelector("#filter-by-comment-input")
        .value.trim()
        .split(",")
        .filter(i => i.trim() !== "")
    const changesetsLi = htmlDocument.querySelectorAll("ol li")
    let newHiddenChangesetsCount = 0
    let newChangesetsCount = changesetsLi.length
    changesetsLi.forEach(li => {
        const changesetComment = li.querySelector("p a bdi").textContent
        const changesetAuthorLink = li.querySelector("div > a")
        const changesetAuthor = changesetAuthorLink?.textContent ?? ""
        let bbox
        if (li.getAttribute("data-changeset")) {
            bbox = Object.values(JSON.parse(li.getAttribute("data-changeset")).bbox)
        } else {
            bbox = Object.values(JSON.parse(li.getAttribute("hidden-data-changeset")).bbox)
        }
        bbox = bbox.map(parseFloat)
        const deltaLon = bbox[2] - bbox[0]
        const deltaLat = bbox[3] - bbox[1]
        const bboxSizeLimit = 1
        let wasHidden = false

        function hideLi(li) {
            if (li.getAttribute("data-changeset")) {
                li.setAttribute("hidden-data-changeset", li.getAttribute("data-changeset"))
                li.removeAttribute("data-changeset")
                li.setAttribute("hidden", true)
            } else {
                // FIXME
            }
            wasHidden = true
        }

        function unhideLi(li) {
            if (li.getAttribute("hidden-data-changeset")) {
                li.setAttribute("data-changeset", li.getAttribute("hidden-data-changeset"))
                li.removeAttribute("hidden-data-changeset")
                li.removeAttribute("hidden")
            } else {
                // FIXME
            }
        }

        if (needHideBigChangesets && (deltaLat > bboxSizeLimit || deltaLon > bboxSizeLimit)) {
            hideLi(li)
        }
        if (!wasHidden) {
            const invert = document.querySelector("#invert-user-filter-checkbox").getAttribute("checked") === "true"
            if (invert) {
                let needHide = true
                usernameFilters.forEach(username => {
                    if (changesetAuthor.includes(username)) {
                        needHide = false
                    } else if (username === CORPORATE_EMOJI && corporateMappers?.has(changesetAuthor)) {
                        needHide = false
                    } else if (username === BAN_EMOJI && changesetAuthorLink?.previousElementSibling?.classList?.contains("banned-badge")) {
                        needHide = false
                    } else if (username === REVIEW_REQUESTED_EMOJI && li.classList.contains("review-requested-changeset")) {
                        needHide = false
                    } else if (username === NEWBIE_EMOJI && changesetAuthorLink?.previousElementSibling?.classList?.contains(".newbie-badge")) {
                        needHide = false
                    }
                })
                if (usernameFilters.length && needHide) {
                    hideLi(li)
                }
            } else {
                usernameFilters.forEach(username => {
                    // prettier-ignore
                    if (changesetAuthor.includes(username)
                        || username === CORPORATE_EMOJI && corporateMappers?.has(changesetAuthor)
                        || username === BAN_EMOJI && changesetAuthorLink?.previousElementSibling?.classList?.contains("banned-badge")
                        || username === REVIEW_REQUESTED_EMOJI && li?.classList?.contains("review-requested-changeset")
                        || username === NEWBIE_EMOJI && li?.querySelector(".newbie-badge")
                    ) {
                        hideLi(li)
                    }
                })
            }
        }
        if (!wasHidden) {
            const invert = document.querySelector("#invert-comment-filter-checkbox").getAttribute("checked") === "true"
            commentFilters.forEach(comment => {
                if (changesetComment.includes(comment.trim()) ^ invert) {
                    hideLi(li)
                }
            })
        }
        if (!wasHidden) {
            unhideLi(li)
        } else {
            newHiddenChangesetsCount++
        }
    })

    const counter = document.querySelector("#hidden-changeset-counter")
    const needUpdateCounter = (getWindow().hiddenChangesetsCount !== newHiddenChangesetsCount || parseInt(counter.getAttribute("changesets-count")) !== newChangesetsCount) && htmlDocument === document

    if (needUpdateCounter) {
        getWindow().hiddenChangesetsCount = newHiddenChangesetsCount
        const changesetsCount = document.querySelectorAll("ol > li").length
        counter.textContent = ` Displayed ${changesetsCount - newHiddenChangesetsCount}/${changesetsCount}`
        counter.setAttribute("changesets-count", changesetsCount)
        console.log(changesetsCount)
    }
}

function updateMap() {
    getWindow().needClearLoadMoreRequest++
    getWindow().lastLoadMoreURL = document.querySelector('.changeset_more:has([href*="before"]) a.page-link').href
    document.querySelector('.changeset_more:has([href*="before"]) a.page-link').click()
}

async function addUsernameIntoChangesetsFilter(username) {
    const filterByUsersInput = document.querySelector("#filter-by-user-input")
    if (filterByUsersInput.value === "" || filterByUsersInput.value === username) {
        filterByUsersInput.value = username
    } else {
        filterByUsersInput.value = filterByUsersInput.value + "," + username
        filterByUsersInput.setSelectionRange(filterByUsersInput.value.length, filterByUsersInput.value.length)
    }
    filterChangesets()
    updateMap()
    await GM.setValue("last-user-filter", document.getElementById("filter-by-user-input")?.value)
}

/**
 * @param {HTMLAnchorElement} usernameLink
 */
function makeUsernamesFilterable(usernameLink) {
    if (usernameLink.classList.contains("listen-for-filters")) {
        return
    }
    usernameLink.classList.add("listen-for-filters")

    const filterIcon = document.createElement("span")
    filterIcon.innerHTML = filterIconSvg
    filterIcon.classList.add("filter-username-btn")
    filterIcon.style.cursor = "pointer"
    filterIcon.style.position = "relative"
    filterIcon.style.top = "-2px"
    filterIcon.style.marginLeft = "4px"
    filterIcon.title = "Click for hide this user changesets"
    filterIcon.onclick = async e => {
        e.preventDefault()
        await addUsernameIntoChangesetsFilter(usernameLink.textContent)
    }
    usernameLink.setAttribute("target", "_blank")
    usernameLink.onclick = async e => {
        if (isDebug()) {
            e.preventDefault()
            await addUsernameIntoChangesetsFilter(usernameLink.textContent)
        }
    }
    usernameLink.after(filterIcon)
    // i.style.border = "solid"
    // i.style.borderColor = getWindow()?.makeColor(i.textContent)
    // i.onmouseover = () => {
    //
    // }
}

function getScrollbarWidth() {
    const outer = document.createElement("div")
    outer.style.visibility = "hidden"
    outer.style.overflow = "scroll"
    outer.style.msOverflowStyle = "scrollbar"
    document.body.appendChild(outer)
    const inner = document.createElement("div")
    outer.appendChild(inner)
    const scrollbarWidth = outer.offsetWidth - inner.offsetWidth
    outer.parentNode.removeChild(outer)
    return scrollbarWidth
}

function addMassActionForGlobalChangesets() {
    if ((location.pathname === "/history" || location.pathname === "/history/friends") && document.querySelector("#sidebar_content h2") && !document.querySelector("#changesets-filter-btn")) {
        const a = document.createElement("a")
        a.textContent = " 🔎"
        a.style.cursor = "pointer"
        a.id = "changesets-filter-btn"
        a.title = "Changesets filter via better-osm-org"
        a.onclick = async () => {
            document.querySelector("#sidebar .search_forms")?.setAttribute("hidden", "true")

            async function makeTopFilterBar() {
                const filterBar = document.createElement("div")
                filterBar.classList.add("filter-bar")

                const hideBigChangesetsCheckbox = document.createElement("input")
                hideBigChangesetsCheckbox.checked = needHideBigChangesets = await GM.getValue("last-big-changesets-filter")
                hideBigChangesetsCheckbox.type = "checkbox"
                hideBigChangesetsCheckbox.style.cursor = "pointer"
                hideBigChangesetsCheckbox.id = "hide-big-changesets-checkbox"
                const hideBigChangesetLabel = document.createElement("label")
                hideBigChangesetLabel.textContent = "Hide big changesets"
                hideBigChangesetLabel.htmlFor = "hide-big-changesets-checkbox"
                hideBigChangesetLabel.style.marginLeft = "1px"
                hideBigChangesetLabel.style.marginBottom = "4px"
                hideBigChangesetLabel.style.cursor = "pointer"
                hideBigChangesetsCheckbox.onchange = async () => {
                    needHideBigChangesets = hideBigChangesetsCheckbox.checked
                    filterChangesets()
                    updateMap()
                    await GM.setValue("last-big-changesets-filter", hideBigChangesetsCheckbox.checked)
                }
                filterBar.appendChild(hideBigChangesetsCheckbox)
                filterBar.appendChild(hideBigChangesetLabel)
                filterBar.appendChild(document.createElement("br"))

                const label = document.createElement("span")
                label.textContent = "🔄Hide changesets from "
                label.title = "Click for invert"
                label.style.minWidth = "165px"
                label.style.display = "inline-block"
                label.style.cursor = "pointer"
                label.setAttribute("checked", false)
                label.id = "invert-user-filter-checkbox"
                label.onclick = e => {
                    if (e.target.textContent === "🔄Hide changesets from ") {
                        e.target.textContent = "🔄Show changesets from "
                    } else {
                        e.target.textContent = "🔄Hide changesets from "
                    }
                    if (e.target.getAttribute("checked") === "false") {
                        e.target.setAttribute("checked", true)
                    } else {
                        e.target.setAttribute("checked", false)
                    }
                    if (document.querySelector("#filter-by-user-input").value !== "") {
                        filterChangesets()
                        updateMap()
                    }
                }
                filterBar.appendChild(label)
                const filterByUsersInput = document.createElement("input")
                filterByUsersInput.placeholder = "user1,user2,... and press Enter"
                filterByUsersInput.id = "filter-by-user-input"
                filterByUsersInput.style.width = 253 - getScrollbarWidth() + "px"
                filterByUsersInput.style.marginBottom = "3px"
                filterByUsersInput.addEventListener("keypress", async function (event) {
                    if (event.key === "Enter") {
                        event.preventDefault()
                        filterChangesets()
                        updateMap()
                        await GM.setValue("last-user-filter", filterByUsersInput.value)
                        await GM.setValue("last-comment-filter", filterByCommentInput.value)
                    }
                })
                filterByUsersInput.value = await GM.getValue("last-user-filter", "")
                filterBar.appendChild(filterByUsersInput)

                const label2 = document.createElement("span")
                label2.textContent = "🔄Hide changesets with "
                label2.title = "Click for invert"
                label2.style.minWidth = "165px"
                label2.style.display = "inline-block"
                label2.style.cursor = "pointer"
                label2.id = "invert-comment-filter-checkbox"
                label2.setAttribute("checked", false)
                label2.onclick = e => {
                    if (e.target.textContent === "🔄Hide changesets with ") {
                        e.target.textContent = "🔄Show changesets with "
                    } else {
                        e.target.textContent = "🔄Hide changesets with "
                    }
                    if (e.target.getAttribute("checked") === "false") {
                        e.target.setAttribute("checked", true)
                    } else {
                        e.target.setAttribute("checked", false)
                    }
                    if (document.querySelector("#filter-by-comment-input").value !== "") {
                        filterChangesets()
                        updateMap()
                    }
                }
                filterBar.appendChild(label2)
                const filterByCommentInput = document.createElement("input")
                filterByCommentInput.id = "filter-by-comment-input"
                filterByCommentInput.placeholder = "words1,words2,... and press Enter"
                filterByCommentInput.title = "Filter by substring in changesets comments"
                filterByCommentInput.style.width = 253 - getScrollbarWidth() + "px"
                filterByCommentInput.addEventListener("keypress", async function (event) {
                    if (event.key === "Enter") {
                        event.preventDefault()
                        filterChangesets()
                        updateMap()
                        await GM.setValue("last-user-filter", filterByUsersInput.value)
                        await GM.setValue("last-comment-filter", filterByCommentInput.value)
                    }
                })
                filterByCommentInput.value = await GM.getValue("last-comment-filter", "")
                filterBar.appendChild(filterByCommentInput)

                return filterBar
            }

            getWindow().needPatchLoadMoreRequest = true
            if (massModeActive === null) {
                massModeActive = true
                document.querySelector("#sidebar div.changesets").before(await makeTopFilterBar())
                document.querySelectorAll('ol li div > a[href^="/user/"]').forEach(makeUsernamesFilterable)
            } else {
                massModeActive = !massModeActive
                document.querySelectorAll(".filter-bar").forEach(i => i.toggleAttribute("hidden"))
                document.querySelectorAll(".filter-username-btn").forEach(i => i.toggleAttribute("hidden"))
                document.querySelector("#hidden-changeset-counter")?.toggleAttribute("hidden")
                // document.querySelectorAll(".mass-action-checkbox").forEach(i => {
                // i.toggleAttribute("hidden")
                // })
            }
            filterChangesets()
            updateMap()
        }
        document.querySelector("#sidebar_content h2").appendChild(a)
        const hiddenChangesetsCounter = document.createElement("span")
        hiddenChangesetsCounter.id = "hidden-changeset-counter"
        document.querySelector("#sidebar_content h2").appendChild(hiddenChangesetsCounter)
    }
}

const CORPORATE_EMOJI = "🏢"
const BAN_EMOJI = "⛔️"
const REVIEW_REQUESTED_EMOJI = "🙏"
const NEWBIE_EMOJI = "🍼"

// prettier-ignore
const moderatorBadgeSvg =
    '<svg width="20" height="20">' +
    '<path d="M 10,2 8.125,8 2,8 6.96875,11.71875 5,18 10,14 15,18 13.03125,11.71875 18,8 11.875,8 10,2 z" fill="#447eff" stroke="#447eff" stroke-width="2" stroke-linejoin="round"></path>' +
    '</svg>'
// prettier-ignore
const importerBadgeSvg =
    '<svg width="20" height="20">' +
    '<path d="M 10,2 8.125,8 2,8 6.96875,11.71875 5,18 10,14 15,18 13.03125,11.71875 18,8 11.875,8 10,2 z" fill="#38e13a" stroke="#38e13a" stroke-width="2" stroke-linejoin="round"></path>' +
    '</svg>'

function makeBadge(userInfo, changesetDate = new Date()) {
    // todo make changesetDate required
    const userBadge = document.createElement("span")
    userBadge.classList.add("user-badge")

    function makeModeratorBadge() {
        userBadge.style.position = "relative"
        userBadge.style.bottom = "2px"
        userBadge.title = "This user is a moderator"
        userBadge.innerHTML = moderatorBadgeSvg
        userBadge.querySelector("svg").style.transform = "scale(0.9)"
    }

    function makeImporterBadge() {
        userBadge.style.position = "relative"
        userBadge.style.bottom = "2px"
        userBadge.title = "This user is a importer"
        userBadge.innerHTML = importerBadgeSvg
        userBadge.querySelector("svg").style.transform = "scale(0.9)"
    }

    function makeBannedUserBadge() {
        userBadge.title = "The user was banned"
        userBadge.textContent = BAN_EMOJI + " "
        userBadge.classList.add("banned-badge")
        userBadge.style.cursor = "pointer"
        userBadge.onclick = e => {
            if (massModeActive && !e.ctrlKey && !e.metaKey) {
                addUsernameIntoChangesetsFilter(BAN_EMOJI)
            } else {
                window.open("/user/" + userInfo["display_name"] + "/blocks", "_blank")
            }
        }
        setTimeout(async () => {
            const xml = (
                await externalFetchRetry({
                    url: "/user/" + userInfo["display_name"] + "/blocks",
                })
            ).response
            const lastBlockLinks = new DOMParser().parseFromString(xml, "text/html").querySelector('a[href^="/user_blocks/"]').getAttribute("href")
            const blockID = lastBlockLinks.match(/\/user_blocks\/([0-9]+)/)[1]
            const blockInfo = (
                await externalFetchRetry({
                    url: "/api/0.6/user_blocks/" + blockID + ".json",
                    responseType: "json",
                    headers: { "turbo-frame": "pagination" },
                })
            ).response
            userBadge.title += `\n\n${blockInfo["user_block"]["created_at"]}\n${blockInfo["user_block"]["creator"]["user"]}: ${blockInfo["user_block"]["reason"]}`
        })
    }

    function makeNewbieBadge() {
        userBadge.classList.add("newbie-badge")
        userBadge.title = "At the time of creating the changeset/note, the user had been editing OpenStreetMap for less than a month"
        userBadge.textContent = NEWBIE_EMOJI + " "
        userBadge.style.cursor = "pointer"
        userBadge.onclick = e => {
            if (location.pathname !== "/history") {
                return
            }
            e.preventDefault()
            if (!massModeActive) {
                document.querySelector("#changesets-filter-btn").click()
            }
            // dirty hack
            setTimeout(async () => {
                if (document.querySelector("#invert-user-filter-checkbox").getAttribute("checked") === "false") {
                    if (["", NEWBIE_EMOJI].includes(document.querySelector("#filter-by-user-input").value)) {
                        document.querySelector("#invert-user-filter-checkbox").click()
                    }
                }
                await addUsernameIntoChangesetsFilter(NEWBIE_EMOJI)
            })
        }
    }

    function makeCorporateBadge() {
        const info = corporateMappers.get(userInfo["display_name"])
        userBadge.title = `${info.join(", ")} corporate mapper\n\nClick to open wiki page\nClick with Alt to open data source`
        userBadge.textContent = CORPORATE_EMOJI + " "
        userBadge.classList.add("corporate-badge")
        userBadge.style.cursor = "pointer"
        userBadge.onclick = async e => {
            e.preventDefault()
            if (e.altKey) {
                window.open(corporationContributorsSource, "_blank")
            } else {
                if (massModeActive && !e.ctrlKey && !e.metaKey) {
                    await addUsernameIntoChangesetsFilter(CORPORATE_EMOJI)
                } else {
                    info.forEach(k => {
                        window.open(corporatesLinks.get(k), "_blank")
                    })
                }
            }
        }
    }

    function makeFriendBadge() {
        getFriends().then(res => {
            if (res.includes(userInfo["display_name"])) {
                // todo warn if username startsWith 🫂 or use svg
                userBadge.title = "You are following this user"
                userBadge.textContent = "🫂 "
            }
        })
    }

    if (userInfo["roles"].some(i => i === "moderator")) {
        makeModeratorBadge()
    } else if (userInfo["roles"].some(i => i === "importer")) {
        makeImporterBadge()
    } else if (userInfo["blocks"]["received"]["active"]) {
        makeBannedUserBadge()
    } else if (
        new Date(userInfo["firstChangesetCreationTime"] ?? userInfo["account_created"]).setUTCDate(new Date(userInfo["firstChangesetCreationTime"] ?? userInfo["account_created"]).getUTCDate() + 30) > changesetDate
    ) {
        makeNewbieBadge()
    } else if (!corporateMappers || corporateMappers?.has(userInfo["display_name"])) {
        if (!corporateMappers) {
            initCorporateMappersList().then(() => {
                if (corporateMappers?.has(userInfo["display_name"])) {
                    makeCorporateBadge()
                } else {
                    makeFriendBadge()
                }
            })
        } else {
            makeCorporateBadge()
        }
    } else {
        makeFriendBadge()
    }
    return userBadge
}

function addMassChangesetsActions() {
    if (!location.pathname.includes("/history")) return
    if (!document.querySelector("#sidebar_content h2")) return

    addMassActionForUserChangesets()
    addMassActionForGlobalChangesets()

    const MAX_PAGE_FOR_LOAD = 15
    sidebarObserverForMassActions?.disconnect()

    function observerHandler(mutationsList, observer) {
        // console.log(mutationsList)
        // debugger
        if (!location.pathname.includes("/history")) {
            massModeActive = null
            getWindow().needClearLoadMoreRequest = 0
            getWindow().needPatchLoadMoreRequest = false
            needHideBigChangesets = false
            currentMassDownloadedPages = null
            observer.disconnect()
            sidebarObserverForMassActions = null
            return
        }
        if (massModeForUserChangesetsActive && location.pathname !== "/history" && location.pathname !== "/history/friends") {
            document.querySelectorAll("ol li").forEach(addChangesetCheckbox)
            makeBottomActionBar()
        }
        if (massModeActive && (location.pathname === "/history" || location.pathname === "/history/friends")) {
            document.querySelectorAll('ol li div > a[href^="/user/"]').forEach(makeUsernamesFilterable)
            // sidebarObserverForMassActions?.disconnect()
            filterChangesets()
            // todo
            // sidebarObserverForMassActions.observe(document.querySelector('#sidebar'), {childList: true, subtree: true});
        }
        document.querySelectorAll("#sidebar ol li div .changeset_id").forEach(item => {
            if (item.classList.contains("custom-changeset-id-click")) return
            item.classList.add("custom-changeset-id-click")
            item.onclick = e => {
                if (!e.isTrusted) return
                e.preventDefault()
                const id = e.target.innerText
                navigator.clipboard.writeText(id).then(() => copyAnimation(e, id))
            }
            item.title = "Click for copy changeset id"
            if (location.pathname.match(/^\/history(\/?|\/friends)$/)) {
                const usernameA = item.parentElement.parentElement.querySelector('a[href^="/user/"]')
                getCachedUserInfo(usernameA?.textContent).then(res => {
                    if (!res) return
                    usernameA.title = makeUsernameTitle(res)
                    usernameA.before(makeBadge(res, new Date(item.parentElement.parentElement.querySelector("time")?.getAttribute("datetime") ?? new Date())))
                })
            }
        })
        if (currentMassDownloadedPages && currentMassDownloadedPages <= MAX_PAGE_FOR_LOAD) {
            const loader = document.querySelector('.changeset_more:has([href*="before"]) > [hidden]')
            if (loader === null) {
                makeBottomActionBar()
            } else if (loader.style.display === "") {
                document.querySelector('.changeset_more:has([href*="before"]) a.page-link').click()
                console.log(`Loading page #${currentMassDownloadedPages}`)
                currentMassDownloadedPages++
            }
        } else if (currentMassDownloadedPages > MAX_PAGE_FOR_LOAD) {
            currentMassDownloadedPages = null
            const changesetsCount = document.querySelectorAll("ol > li").length
            document.querySelector("#hidden-changeset-counter").textContent = ` Displayed ${changesetsCount - getWindow().hiddenChangesetsCount}/${changesetsCount}`
        } else {
            if (!document.querySelector("#infinity-list-btn")) {
                const moreButton = document.querySelector('.changeset_more:has([href*="before"]) a.page-link')
                if (!moreButton) return
                moreButton.parentElement.style.display = "inline-flex"
                const infinityList = document.createElement("button")
                infinityList.classList.add("page-link")
                infinityList.textContent = `Load ${20 * MAX_PAGE_FOR_LOAD}`
                infinityList.id = "infinity-list-btn"
                infinityList.onclick = () => {
                    currentMassDownloadedPages = 1
                    moreButton.click()
                    infinityList.remove()
                }
                moreButton.after(infinityList)
                moreButton.after(document.createTextNode("\xA0"))
            }
        }
    }

    sidebarObserverForMassActions = new MutationObserver(observerHandler)
    sidebarObserverForMassActions.observe(document.querySelector("#sidebar"), { childList: true, subtree: true })
}

function setupMassChangesetsActions() {
    if (location.pathname !== "/history" && location.pathname !== "/history/friends" && !(location.pathname.includes("/history") && location.pathname.includes("/user/"))) return
    const timerId = setInterval(addMassChangesetsActions, 300)
    setTimeout(() => {
        clearInterval(timerId)
        console.debug("stop try add mass changesets actions")
    }, 5000)
    addMassChangesetsActions()
}

//</editor-fold>
