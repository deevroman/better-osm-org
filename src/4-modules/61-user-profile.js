//<editor-fold desc="user-profile" defaultstate="collapsed">

function makeWebArchiveLink(text, username) {
    const link = document.createElement("a")
    link.textContent = text
    link.target = "_blank"
    link.href = `https://web.archive.org/web/*/${osm_server.url}/user/${username}`
    return link
}

function makeOSMChaLinkInUserProfile(username) {
    const osmchaLink = document.createElement("a")
    osmchaLink.textContent = t("userProfile.osmcha")
    osmchaLink.id = "osmcha_link"
    osmchaLink.title = t("osmcha.openProfileInOsmcha")
    osmchaLink.href = makeOsmchaLinkForUsername(username)
    osmchaLink.target = "_blank"
    osmchaLink.rel = "noreferrer"
    return osmchaLink
}

async function makeDeletedProfileById(userID, div, processIDs) {
    const data = await whosthatNamesRequest(userID)
    let names = data?.[0]?.["names"] ?? []

    const userNamesP = document.createElement("p")
    div.appendChild(userNamesP)
    setTimeout(async () => {
        if (!names.length) {
            const res = (
                await overpassRequest(
                    `
[out:json];
node(uid:${userID})->.b;
node.b(if:lat() == b.min(lat()));
out meta;
`,
                    "json",
                )
            ).response
            if (res?.elements?.length) {
                names = [res.elements[0].user]
            }
            div.title = t("userProfile.viaOverpassApi")
        } else {
            div.title = t("userProfile.viaWhosthat")
        }
        if (names.length) {
            userNamesP.textContent = t("userProfile.usernames")
            injectCSSIntoOSMPage(copyAnimationStyles)
            names.forEach(name => {
                const usernameSpan = document.createElement("span")
                usernameSpan.textContent = name
                usernameSpan.title = t("copying.clickForCopy")
                usernameSpan.style.cursor = "pointer"
                usernameSpan.onclick = e => {
                    navigator.clipboard.writeText(name).then(() => copyAnimation(e, name))
                }
                userNamesP.appendChild(usernameSpan)
                userNamesP.appendChild(document.createTextNode(" "))
                userNamesP.appendChild(makeWebArchiveLink("[WA] ", name))
                userNamesP.appendChild(makeOSMChaLinkInUserProfile(name))
            })
        }
    })
    await processIDs([{ id: userID }], div)
}

// https://osm.org/user/Молотов-Прибой
// https://osm.org/user/user_14840936
// https://osm.org/user/Torunianin
// https://osm.org/user/user_22937564
// https://osm.org/user/korobkov
// https://osm.org/user/user_389895
// https://osm.org/user/user_20965583
// https://osm.org/user/500396986
async function makeProfileForDeletedUser(user) {
    const content = document.querySelector(".content-body")
    const div = document.createElement("div")
    div.classList.add("content-inner", "position-relative", "m-auto")

    const webArchiveLink = makeWebArchiveLink(t("links.webArchive"), decodeURI(user))
    div.appendChild(webArchiveLink)
    div.appendChild(document.createElement("br"))

    async function processIDs(data, elemForResult) {
        if (data.length === 1) {
            elemForResult.appendChild(document.createTextNode(t("userProfile.singleUserIdLabel")))
        } else {
            elemForResult.appendChild(document.createTextNode(t("userProfile.foundUserIds", { count: data.length })))
            elemForResult.appendChild(document.createElement("br"))
            elemForResult.appendChild(document.createTextNode(t("userProfile.userIdBadge")))
        }
        for (let i = 0; i < data.length; i++) {
            if (i !== 0) {
                elemForResult.appendChild(document.createElement("br"))
                elemForResult.appendChild(document.createElement("hr"))
                elemForResult.appendChild(document.createTextNode(t("userProfile.userIdBadge").trim()))
            }
            const id = data[i].id
            const idSpan = document.createElement("span")
            idSpan.textContent = id
            idSpan.title = t("copying.clickForCopy")
            idSpan.style.cursor = "pointer"
            idSpan.onclick = e => {
                navigator.clipboard.writeText(id).then(() => copyAnimation(e, id))
            }
            injectCSSIntoOSMPage(copyAnimationStyles)
            elemForResult.appendChild(idSpan)
            elemForResult.appendChild(document.createElement("br"))
            if (data[i].names?.length > 1) {
                const p = document.createElement("p")
                p.textContent = t("userProfile.usernames")
                injectCSSIntoOSMPage(copyAnimationStyles)
                data[i].names
                    .map(i => i.name)
                    .forEach(name => {
                        const usernameSpan = document.createElement("span")
                        usernameSpan.textContent = name
                        usernameSpan.title = t("copying.clickForCopy")
                        usernameSpan.style.cursor = "pointer"
                        usernameSpan.onclick = e => {
                            navigator.clipboard.writeText(name).then(() => copyAnimation(e, name))
                        }
                        p.appendChild(usernameSpan)
                        p.appendChild(document.createTextNode(" "))

                        p.appendChild(makeWebArchiveLink("[WA] ", name))

                        p.appendChild(makeOSMChaLinkInUserProfile(name))
                    })
                elemForResult.appendChild(p)
            }
            setTimeout(async () => {
                const blocksSpan = document.createElement("span")

                const loadingStatus = document.createElement("span")
                loadingStatus.textContent = t("userProfile.findingBlocks")
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

                function processFoundBlocks(foundUserBlock) {
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
                    processFoundBlocks(foundUserBlock)
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
                                processFoundBlocks(foundUserBlock)
                            }
                        }

                        const onPage = 20
                        const threads = 10
                        console.log("download user_block batch before ", lastUserBlock)
                        loadingStatus.title = t("userProfile.scannedBlocksAfter", { id: lastUserBlock })
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

            elemForResult.appendChild(document.createTextNode(t("userProfile.lastChangesets", { count: lastChangesets.changesets?.length })))
            lastChangesets.changesets.forEach(ch => {
                const changesetLine = document.createElement("div")
                const changesetTime = ch["created_at"]
                const checkbox = document.createElement("input")
                checkbox.type = "checkbox"
                checkbox.classList.add("mass-action-checkbox")
                checkbox.textContent = "#" + ch.id + ""
                checkbox.title = t("selection.shiftClickSelectRange")
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
                            i.textContent = t("userProfile.copyIdsCount", { count: selectedIDsCount })
                        } else {
                            i.textContent = t("userProfile.copyIds")
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
                comment.textContent = " " + (ch.tags?.["comment"] ?? t("userProfile.noComment"))
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
            copyIds.textContent = t("userProfile.copyIds")
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

    const data = await whosthatInfoRequest(user)
    if (data.length) {
        webArchiveLink.after(makeOSMChaLinkInUserProfile(decodeURI(user)))

        const result = document.createElement("p")
        div.appendChild(result)
        result.title = t("userProfile.viaWhosthat")
        await processIDs(data, result)
    } else {
        setTimeout(async () => {
            const forHiddenUsersPromise = updateUserInfo(decodeURI(user))
            const res = (
                await overpassRequest(
                    `
[out:json];
node(user:"${decodeURI(user).replace('"', '\\"')}")->.b;
node.b(if:lat() == b.min(lat()));
out meta;
`,
                    "json",
                )
            ).response
            if (res.elements?.length) {
                webArchiveLink.after(makeOSMChaLinkInUserProfile(decodeURI(user)))

                const result = document.createElement("p")
                div.appendChild(result)
                result.title = t("userProfile.viaOverpassApi")
                await processIDs([{ id: res.elements[0].uid }], result)
            } else {
                const userInfoRes = await forHiddenUsersPromise
                if (userInfoRes.firstChangesetCreationTime) {
                    // todo firstChangesetCreationTime + 1
                    const res = (
                        await overpassRequest(
                            `
[date:"${userInfoRes.firstChangesetCreationTime}"][out:json];
node(user:"${decodeURI(user).replace('"', '\\"')}")->.b;
node.b(if:lat() == b.min(lat()));
out meta;
`,
                            "json",
                        )
                    ).response
                    webArchiveLink.after(makeOSMChaLinkInUserProfile(decodeURI(user)))

                    const result = document.createElement("p")
                    div.appendChild(result)
                    result.title = t("userProfile.viaOverpassApi")
                    await processIDs([{ id: res.elements[0].uid }], result)
                }
            }
        })
    }
    if (user.match(/^user_[0-9]+$/)) {
        // user_XXX может быт валидным юзернеймом, поэтому сначала мы проверяли его честно,
        // а теперь пытаемся искать по ID
        await makeDeletedProfileById(parseInt(user.match(/user_([0-9]+)/)[1]), div, processIDs)
    }
    content.appendChild(div)
}

/**
 * @param {string} user
 */
function addColorForActiveBlock(user) {
    const blocksLink = document.querySelector('a[href$="/blocks"]')
    if (blocksLink?.nextElementSibling?.textContent > 0) {
        blocksLink.nextElementSibling.style.background = "rgba(255, 0, 0, 0.3)"
        if (isDarkMode()) {
            blocksLink.nextElementSibling.style.color = "white"
        }
        getCachedUserInfo(decodeURI(user)).then(userInfo => {
            if (userInfo["blocks"]["received"]["active"] === 0) {
                void updateUserInfo(decodeURI(user))
            }
        })
    } else if (blocksLink?.nextElementSibling?.textContent === "0") {
        getCachedUserInfo(decodeURI(user)).then(userInfo => {
            if (userInfo["blocks"]["received"]["active"] !== 0) {
                void updateUserInfo(decodeURI(user))
            }
        })
    }
}

function addUserID(userDetails, userID) {
    if (!document.querySelector('[href^="/api/0.6/user"]')) {
        const dt = document.createElement("dt")
        dt.textContent = t("userProfile.userIdLabel")
        dt.classList.add("list-inline-item", "m-0")
        const dd = document.createElement("dd")
        dd.classList.add("list-inline-item", "user-id")
        dd.textContent = userID
        dd.title = t("copying.clickForCopy")
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

async function addUsernames(userDetails, userID, user) {
    async function fallbackMethod(userID) {
        const res1 = await findUsernamesById(userID)
        if (res1.length) {
            return res1
        }
        const info = await updateUserInfo(decodeURI(user))
        if (new Date(info.firstChangesetCreationTime) < OVERPASS_NEW_ERA_DATE) {
            const ch = await fetchJSONWithCache(
                osm_server.apiBase +
                    "changesets.json?" +
                    new URLSearchParams({
                        user: userID,
                        order: "oldest",
                        to: new Date().toISOString(),
                        from: OVERPASS_NEW_ERA_DATE.toISOString().slice(0, -5) + "Z",
                    }).toString(),
            )
            const res = await tryFindDeletedChangesetAuthor(ch.changesets[0].id, undefined, "changeset", ch.changesets[0].id)
            if (!res.user) {
                return []
            }
            return [res.user]
            // todo (more usernames)
        }
        const res = await tryFindDeletedChangesetAuthor(
            info.firstChangesetID,
            info.firstChangesetCreationTime,
            "changeset",
            info.firstChangesetID,
        )
        if (!res.user) {
            return []
        }
        return [res.user]
    }

    async function updateUserIDInfo(userID, username) {
        const userInfo = {
            data: await whosthatNamesRequest(userID),
        }
        if (!userInfo.data?.[0]) {
            const names = await fallbackMethod(userID)
            if (!names.includes(username)) {
                names.push(username)
            }
            userInfo.data = [{ names: names, partial: true }]
        }
        userInfo["cacheTime"] = new Date()
        await GM.setValue(storagePrefix + "useridinfo-" + userID, JSON.stringify(userInfo))
        if (userInfo.data[0]["names"].length > 1) {
            let usernames = userInfo.data[0]["names"].filter(i => i !== decodeURI(user)).join(", ")
            if (usernames.length > 0 && userInfo.data[0]["partial"]) {
                usernames += ", ..."
            }
            if (document.querySelector(".prev-usernames")) {
                document.querySelector(".prev-usernames").textContent = usernames
            }
        }
        return userInfo
    }

    async function getCachedUserIDInfo(userID, username) {
        const localUserInfo = await GM.getValue(storagePrefix + "useridinfo-" + userID, "")
        if (localUserInfo) {
            const json = JSON.parse(localUserInfo)
            const cacheTime = new Date(json["cacheTime"])
            const timeLater = new Date(cacheTime.getTime() + 14 * 24 * 60 * 60 * 1000)
            if (timeLater < new Date() || cacheTime < new Date("2026-10-25T00:00:00Z")) {
                console.log("but cache outdated")
                setTimeout(updateUserIDInfo, 0, userID, username)
            }
            return json
        }
        return await updateUserIDInfo(userID, username)
    }

    const userIDInfo = await getCachedUserIDInfo(userID, decodeURI(user))
    if (userIDInfo.data[0]["names"].length <= 1) {
        console.log("prev user's usernames not found")
        return
    }
    let usernames = userIDInfo.data[0]["names"].filter(i => i !== decodeURI(user)).join(", ")
    if (usernames.length > 0 && userIDInfo.data[0]["partial"]) {
        usernames += ", ..."
    }
    const dt = document.createElement("dt")
    dt.textContent = t("userProfile.pastUsernames")
    dt.title = t("betterOsmOrg.addedByBetterOsmOrg")
    dt.classList.add("list-inline-item", "m-0", "prev-usernames-label")
    const dd = document.createElement("dd")
    dd.classList.add("list-inline-item", "prev-usernames")
    dd.textContent = usernames
    dd.title = t("betterOsmOrg.addedByBetterOsmOrg")
    userDetails.appendChild(dt)
    userDetails.appendChild(document.createTextNode("\xA0"))
    userDetails.appendChild(dd)
}

async function addPrevUsernamesInfo(user) {
    if (document.querySelector(".prev-usernames")) {
        return
    }
    const userDetails = document.querySelector(".content-inner small dl")
    if (!userDetails) {
        return
    }
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
    userID = parseInt(userID)

    addUserID(userDetails, userID)

    try {
        if (osm_server === prod_server) {
            // todo check that non zero changeset
            await addUsernames(userDetails, userID, user)
        }
    } catch (err) {
        console.log(err)
    }
}

function makeUsernameHeaderClickable(usernameHeader) {
    const span = document.createElement("span")
    span.classList.add("copyable-username")
    span.textContent = usernameHeader.textContent
    span.title = t("copying.clickForCopy")
    span.style.cursor = "pointer"
    span.onclick = e => {
        const username = usernameHeader.textContent.trim()
        navigator.clipboard.writeText(username).then(() => copyAnimation(e, username))
    }
    usernameHeader.replaceWith(span)
    injectCSSIntoOSMPage(copyAnimationStyles)
}

async function setupHDYCInProfile() {
    const match = location.pathname.match(/^\/user\/([^/]+)(\/|\/notes)?$/)
    if (!match || location.pathname.includes("/history")) {
        return
    }
    /** @type {string} **/
    const user = match[1]
    addColorForActiveBlock(user)
    if (isOHMServer() || isOGFServer()) {
        return
    }
    if (document.getElementById("hdyc-iframe")) {
        return
    }
    if (user === "forgot-password" || user === "new") return
    document.querySelector(".content-body > .content-inner").style.paddingBottom = "0px"
    if (osm_server === prod_server) {
        if (isDarkMode()) {
            GM_addElement(document.querySelector("#content"), "iframe", {
                src: "https://www.hdyc.neis-one.org/user/" + user + "#forcedarktheme",
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
                src: "https://www.hdyc.neis-one.org/user/" + user + "#forcelighttheme",
                width: "100%",
                id: "hdyc-iframe",
                scrolling: "no",
            })
        }
    }
    const isDeletedUser = !document.querySelector(".user_image")
    const usernameHeader = document.querySelector("#content h1")?.firstChild
    if (!isDeletedUser && usernameHeader && usernameHeader.nodeType === Node.TEXT_NODE) {
        makeUsernameHeaderClickable(usernameHeader)
    }
    if (osm_server === prod_server) {
        queueMicrotask(() => addPrevUsernamesInfo(user))
        const iframe = document.getElementById("hdyc-iframe")
        window.addEventListener("message", function (event) {
            if (event.origin === "https://www.hdyc.neis-one.org") {
                iframe.height = event.data.height + "px"
            }
        })
    }
    if (isDeletedUser && !location.pathname.includes("/notes")) {
        await makeProfileForDeletedUser(user)
    }
}

//</editor-fold>
