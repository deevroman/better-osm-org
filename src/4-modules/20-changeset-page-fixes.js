//<editor-fold desc="changeset-page-fixes" defaultstate="collapsed">

function makeUsernameInNotesFilterable() {
    let usernameLink = document.querySelector("#sidebar_content .details p")?.querySelector('a[href^="/user/"]')
    if (!usernameLink) {
        usernameLink = document.createElement("a")
        usernameLink.setAttribute("href", "/user/anon")
        usernameLink.style.display = "none"
        document.querySelector(".details time").before(usernameLink)
        if (usernameLink.previousSibling?.nodeType === Node.TEXT_NODE) {
            usernameLink.previousSibling.textContent = usernameLink.previousSibling.textContent.trim()
        }
    }
    if (usernameLink.classList.contains("filterable")) {
        return
    }
    usernameLink.classList.add("filterable")
    const username = decodeURI(usernameLink.getAttribute("href").match(/\/user\/(.*)$/)[1])
    const filterIcon = document.createElement("span")
    filterIcon.innerHTML = filterIconSvg
    filterIcon.style.cursor = "pointer"
    filterIcon.style.position = "relative"
    filterIcon.style.top = "-2px"
    filterIcon.style.marginLeft = "3px"
    filterIcon.style.marginRight = "3px"
    filterIcon.onclick = () => {
        if (document.querySelector(".layers-ui").style.display === "none") {
            document.querySelector(".control-layers a").click()
        }
        Array.from(document.querySelectorAll(".overlay-layers label"))[0].scrollIntoView({ block: "center" })
        if (document.querySelector("#filter-notes-by-username").value === "") {
            document.querySelector("#filter-notes-by-username").value = username
        } else {
            document.querySelector("#filter-notes-by-username").value += "," + username
        }
        document.querySelector("#filter-notes-by-username")?.classList?.add("wait-fetch")
        updateNotesLayer()
    }
    usernameLink.after(filterIcon)
    if (filterIcon.nextSibling?.nodeType === Node.TEXT_NODE) {
        filterIcon.nextSibling.remove()
    }
}

// todo remove this
// prettier-ignore
const mainTags = ["shop", "building", "amenity", "man_made", "highway", "natural", "aeroway", "historic", "railway", "tourism", "landuse", "leisure"]

async function getPrevNextChangesetsIDs(changeset_id) {
    const changesetMetadata = await loadChangesetMetadata(changeset_id)
    if (!changesetMetadata || !changesetMetadata.uid) return

    const prevChangesetsPromise = fetchJSONWithCache(
        osm_server.apiBase +
            "changesets.json?" +
            new URLSearchParams({
                user: changesetMetadata.uid.toString(),
                order: "newest",
                from: "2005-01-01T00:00:00Z",
                to: new Date(new Date(changesetMetadata.created_at).getTime() + 1000).toISOString(), // на случай если в одну секунду создано несколько пакетов правок
            }).toString(),
    )

    /*** @type {{changesets: ChangesetMetadata[]}}*/
    const nextChangesets = await fetchJSONWithCache(
        osm_server.apiBase +
            "changesets.json?" +
            new URLSearchParams({
                user: changesetMetadata.uid.toString(),
                order: "oldest",
                from: changesetMetadata.created_at,
                to: new Date().toISOString(),
            }).toString(),
    )

    /*** @type {{changesets: ChangesetMetadata[]}}*/
    const prevChangesets = await prevChangesetsPromise

    return [prevChangesets.changesets.find(i => i.id < changeset_id)?.id, nextChangesets.changesets.find(i => i.id > changeset_id)?.id]
}

async function restorePrevNextChangesetButtons(changeset_id) {
    if (document.querySelector(".restored-secondary-actions")) return
    console.log("try restore prev/next deleted user's changesets")
    const [prevID, nextID] = await getPrevNextChangesetsIDs(changeset_id)
    if (!prevID && !nextID) return
    const secondaryActions = document.querySelector("#sidebar_content .secondary-actions")
    const secondarySecondaryActions = document.createElement("div")
    secondarySecondaryActions.classList.add("secondary-actions", "restored-secondary-actions")
    if (prevID) {
        const prevLink = document.createElement("a")
        prevLink.classList.add("icon-link")
        prevLink.href = "/changeset/" + prevID
        prevLink.innerHTML = '<svg width="8" height="11" viewBox="-8 0 8 11"><path d="M-2,2 l-3.5,3.5 l3.5,3.5" fill="none" stroke="currentColor" stroke-width="1.5"></path></svg>'
        prevLink.appendChild(document.createTextNode(prevID.toString()))
        secondarySecondaryActions.appendChild(prevLink)
    }
    secondarySecondaryActions.appendChild(document.createTextNode(` · ${(await loadChangesetMetadata(changeset_id)).user} · `))
    if (nextID) {
        const nextLink = document.createElement("a")
        nextLink.classList.add("icon-link")
        nextLink.href = "/changeset/" + nextID
        nextLink.innerHTML = '<svg width="8" height="11"><path d="M2,2 l3.5,3.5 l-3.5,3.5" fill="none" stroke="currentColor" stroke-width="1.5"></path></svg>'
        nextLink.prepend(document.createTextNode(nextID.toString()))
        secondarySecondaryActions.appendChild(nextLink)
    }
    secondaryActions.after(secondarySecondaryActions)
}

let changesetObjectsSelectionModeEnabled = false

async function validateOsmServerInJOSM() {
    /**
     * @type {{
     *     application: string
     *     version: number
     *     osm_server: "custom"|"default"|undefined
     *     protocolversion: {
     *         major: number,
     *         minor: number
     *     }
     * }}
     */
    const res = await (
        await fetch("http://127.0.0.1:8111/version").catch(() => {
            alert("JOSM is not running")
            throw "JOSM is not running"
        })
    ).json()
    if (res["osm_server"] === "custom" && osm_server === prod_server) {
        alert(`You are using custom OSM API server in JOSM.\n\nChange JOSM settings or open other website`)
        return false
    }
    if (res["osm_server"] === "default" && osm_server !== prod_server) {
        alert(`You are using other OSM instance, but JOSM uses default server.\n\nChange JOSM settings or open other website`)
        return false
    }
    return true
}

function makeUsernameTitle(userInfo) {
    let title = `changesets_count: ${userInfo["changesets"]["count"]}\naccount_created: ${userInfo["account_created"]}`
    if (userInfo["blocks"]["received"]["count"]) {
        title += `\nreceived_blocks: ${userInfo["blocks"]["received"]["count"]}`
    }
    return title
}

function addOsmchaButtons(changeset_id, reactionsContainer) {
    // https://osmcha.org/api/v1/tags/
    const osmchaTags = [
        {
            id: 1,
            name: "Intentional",
            description: "to capture the intent of the user. This is contextual information subjective to the edits and users.",
        },
        {
            id: 2,
            name: "Unintentional",
            description: "to capture the intent of the user. This is contextual information subjective to the edits and users.",
        },
        {
            id: 6,
            name: "Severity: Low",
            description: "to estimate how bad do these edits on a changeset affect OpenStreetMap data",
        },
        {
            id: 7,
            name: "Severity: High",
            description: "to estimate how bad do these edits on a changeset affect OpenStreetMap data",
        },
        {
            id: 8,
            name: "Severity: Critical",
            description: "to estimate how bad do these edits on a changeset affect OpenStreetMap data",
        },
        {
            id: 9,
            name: "Resolved",
            description: "Resolved",
        },
        {
            id: 10,
            name: "Unresolved",
            description:
                "Unresolved: To input action taken by the you (reviewer) on a changeset. " +
                "It is unresolved when the you (reviewer) have commented on the changeset to inform the mapper for corrections or no action has been taken by the you (reviewer) to correct the map data.",
        },
        {
            id: 11,
            name: "DWG",
            description: "When a changeset needs to be reported to the Data Working Group", // changed
        },
    ]

    const likeTitle = "OSMCha review like\n\nRight click to add review tags"
    const dislikeTitle = "OSMCha review dislike\n\nRight click to add review tags"

    async function osmchaRequest(url, method) {
        return await externalFetchRetry({
            url: url,
            headers: {
                Authorization: "Token " + (await GM.getValue("OSMCHA_TOKEN")),
            },
            method: method,
            responseType: "json",
        })
    }

    async function uncheck(changeset_id) {
        return await osmchaRequest(`https://osmcha.org/api/v1/changesets/${changeset_id}/uncheck/`, "PUT")
    }

    const likeBtn = document.createElement("span")
    likeBtn.title = likeTitle
    const likeImg = document.createElement("img")
    likeImg.title = likeTitle
    likeImg.src = osmchaLikeSvg
    likeImg.style.height = "1.1em"
    likeImg.style.cursor = "pointer"
    likeImg.style.filter = "grayscale(1)"
    likeImg.style.marginTop = "-8px"
    likeBtn.onclick = async e => {
        const osmchaToken = await GM.getValue("OSMCHA_TOKEN")
        if (!osmchaToken) {
            alert("Please, login into OSMCha")
            window.open("https://osmcha.org")
            return
        }
        if (e.target.hasAttribute("active")) {
            await uncheck(changeset_id)
            await updateReactions()
            return
        }
        if (document.querySelector(".check_user")) {
            await uncheck(changeset_id)
            await updateReactions()
        }
        await osmchaRequest(`https://osmcha.org/api/v1/changesets/${changeset_id}/set-good/`, "PUT")
        await updateReactions()
    }
    likeBtn.appendChild(likeImg)

    const dislikeBtn = document.createElement("span")
    dislikeBtn.title = dislikeTitle
    const dislikeImg = document.createElement("img")
    dislikeImg.title = dislikeTitle
    dislikeImg.src = osmchaLikeSvg // dirty hack for different gray style colors
    dislikeImg.style.height = "1.1em"
    dislikeImg.style.cursor = "pointer"
    dislikeImg.style.filter = "grayscale(1)"
    dislikeImg.style.transform = "rotate(180deg)"
    dislikeImg.style.marginTop = "3px"
    dislikeBtn.appendChild(dislikeImg)
    dislikeBtn.onclick = async e => {
        const osmchaToken = await GM.getValue("OSMCHA_TOKEN")
        if (!osmchaToken) {
            alert("Please, login into OSMCha")
            window.open("https://osmcha.org")
            return
        }
        if (e.target.hasAttribute("active")) {
            await uncheck(changeset_id)
            await updateReactions()
            return
        }
        if (document.querySelector(".check_user")) {
            await uncheck(changeset_id)
            await updateReactions()
        }
        await osmchaRequest(`https://osmcha.org/api/v1/changesets/${changeset_id}/set-harmful/`, "PUT")
        await updateReactions()
        if (isDebug()) {
            e.stopPropagation()
            e.stopImmediatePropagation()
            contextMenuHandler(e)
        }
    }

    let changesetProps = {}

    async function updateReactions() {
        const osmchaToken = await GM.getValue("OSMCHA_TOKEN")
        if (!osmchaToken) {
            // todo
            throw "Open Osmcha for get access to reactions"
        }
        const res = await osmchaRequest(`https://osmcha.org/api/v1/changesets/${changeset_id}/`, "GET")
        if (res.status === 404) {
            likeImg.title = "Changeset not found in OSMCha database.\nEither OSMCha did not have time to process this changeset, or it is too old."
            dislikeImg.title = "Changeset not found in OSMCha database.\nEither OSMCha did not have time to process this changeset, or it is too old."
            console.warn("Changeset not found in OSMCha database") // todo show alert/title
            return
        }
        if (res.status !== 200) {
            console.trace(res)
        }
        const json = res.response
        changesetProps = json["properties"]
        if (json["properties"]["check_user"]) {
            document.querySelector(".check_user")?.remove()
            likeImg.style.filter = "grayscale(1)"
            dislikeImg.style.filter = "grayscale(1)"

            const username = document.createElement("span")
            username.classList.add("check_user")
            username.textContent = json["properties"]["check_user"]
            if (json["properties"]["harmful"] === true) {
                dislikeImg.style.filter = ""
                dislikeImg.style.transform = ""
                dislikeImg.src = osmchaDislikeSvg
                dislikeImg.setAttribute("active", "true")
                dislikeImg.title = dislikeTitle
                username.style.color = "red"
                dislikeBtn.after(username)
            } else {
                likeImg.style.filter = ""
                likeImg.setAttribute("active", "true")
                likeImg.title = likeTitle
                username.style.color = "green"
                likeBtn.after(username)
            }
        } else {
            likeImg.style.filter = "grayscale(1)"
            dislikeImg.style.filter = "grayscale(1)"
            dislikeImg.style.transform = "rotate(180deg)"
            dislikeImg.src = osmchaLikeSvg
            dislikeImg.title = dislikeTitle
            likeImg.title = likeTitle
            likeImg.removeAttribute("active")
            dislikeImg.removeAttribute("active")
            document.querySelector(".check_user")?.remove()
        }
        document.querySelector(".review-tags")?.remove()
        if (changesetProps["tags"].length) {
            const spanWrapper = document.createElement("span")
            spanWrapper.classList.add("review-tags")
            spanWrapper.title = "OSMCha review tag. Right click to change\n"
            spanWrapper.style.marginBottom = "3px"
            spanWrapper.style.position = "relative"
            spanWrapper.innerHTML = tagSvg
            const svg = spanWrapper.querySelector("svg")
            svg.style.position = "absolute"
            svg.style.top = json["properties"]["check_user"] ? "24px" : "24px"
            svg.style.left = "-10px"
            svg.style.color = "gray"

            const span = document.createElement("span")
            span.style.top = json["properties"]["check_user"] ? "24px" : "24px"
            span.style.left = "6px"
            span.style.position = "absolute"
            span.style.fontSize = "smaller"
            span.style.color = "gray"
            span.textContent = " "
            changesetProps["tags"].forEach(({ id, name }) => {
                span.textContent += name.replace(" ", " ") + " "
                const desc = osmchaTags.find(i => i.id === id)?.description
                if (desc) {
                    spanWrapper.title += `\n${name}: ${desc}`
                }
            })
            const firstComment = document.querySelector("#sidebar_content article")
            if (changesetProps["tags"].length > 1) {
                if (firstComment) {
                    // https://osm.org/changeset/172368459
                    // https://osm.org/changeset/171888749
                    firstComment.style.marginTop = 3 + 17 * (changesetProps["tags"].length - 1) + "px"
                }
            }
            if (changesetProps["tags"].length > 0 && !firstComment) {
                const textarea = document.querySelector("#sidebar_content form")
                // not good because layout jumps :(
                textarea.style.marginTop = 3 + 17 * changesetProps["tags"].length + "px"
            }
            spanWrapper.appendChild(span)
            dislikeBtn.after(spanWrapper)
        }
    }

    setTimeout(updateReactions, 0)

    reactionsContainer.appendChild(likeBtn)
    reactionsContainer.appendChild(document.createTextNode("\xA0"))
    reactionsContainer.appendChild(dislikeBtn)
    reactionsContainer.appendChild(document.createTextNode("\xA0"))

    function contextMenuHandler(e) {
        e.preventDefault()
        const currentUser = decodeURI(
            document
                .querySelector('.user-menu [href^="/user/"]')
                .getAttribute("href")
                .match(/\/user\/(.*)$/)[1],
        )
        if (changesetProps["check_user"] && changesetProps["check_user"] !== currentUser) {
            return
        }
        injectContextMenuCSS()

        const menu = makeContextMenuElem(e)
        osmchaTags.forEach(i => {
            const listItem = document.createElement("div")

            const ch = document.createElement("input")
            ch.id = i.name
            ch.type = "checkbox"
            ch.style.margin = "4px"
            ch.classList.add("review-checkbox")
            ch.setAttribute("name", "review-tag")
            const label = document.createElement("label")
            label.setAttribute("for", i.name)
            label.textContent = i.name
            label.classList.add("review-label")
            label.style.padding = "4px"
            label.style.cursor = "pointer"
            if (changesetProps["tags"].some(t => t.name === i.name)) {
                ch.checked = true
            }

            ch.onchange = async () => {
                if (ch.checked) {
                    const res = await osmchaRequest(`https://osmcha.org/api/v1/changesets/${changeset_id}/tags/${i.id}/`, "POST")
                    if (res.status !== 200) {
                        console.trace(res)
                        ch.checked = "false"
                    } else {
                        console.log(`${i.name} applied`)
                    }
                } else {
                    const res = await osmchaRequest(`https://osmcha.org/api/v1/changesets/${changeset_id}/tags/${i.id}/`, "DELETE")
                    if (res.status !== 200) {
                        console.trace(res)
                        ch.checked = "true"
                    } else {
                        console.log(`${i.name} removed`)
                    }
                }
                await updateReactions()
            }
            listItem.appendChild(ch)
            listItem.appendChild(label)
            document.addEventListener(
                "click",
                function fn(e) {
                    if (!e.isTrusted) {
                        document.addEventListener("click", fn, { once: true })
                        return
                    }
                    if (
                        // prettier-ignore
                        e.target.classList.contains("review-label")
                        || e.target.classList.contains("review-checkbox")
                        || e.target.classList.contains("betterOsmContextMenu")
                    ) {
                        document.addEventListener("click", fn, { once: true })
                        return
                    }
                    menu.remove()
                },
                { once: true },
            )
            menu.appendChild(listItem)
        })
        document.body.appendChild(menu)
    }

    reactionsContainer.addEventListener("contextmenu", contextMenuHandler)
}

function addRevertButton() {
    if (!location.pathname.startsWith("/changeset")) return
    if (document.querySelector("#revert_button_class")) return true
    const sidebar = document.querySelector("#sidebar_content h2")
    if (sidebar) {
        hideSearchForm()
        // sidebar.classList.add("changeset-header")
        const changeset_id = sidebar.innerHTML.match(/([0-9]+)/)[0]
        const reverterTitle = "Open osm-revert\nShift + click for revert via JOSM\nPress R for partial revert"
        // prettier-ignore
        sidebar.innerHTML +=
            ` <a href="https://revert.monicz.dev/?changesets=${changeset_id}" target=_blank rel="noreferrer" id=revert_button_class title="${reverterTitle}">↩️</a>
              <a href="https://osmcha.org/changesets/${changeset_id}" id="osmcha_link" target="_blank" rel="noreferrer">${osmchaSvgLogo}</a>`
        changesetObjectsSelectionModeEnabled = false
        document.querySelector("#revert_button_class").onclick = async e => {
            if (changesetObjectsSelectionModeEnabled) {
                e.preventDefault()
                if (osm_server !== prod_server) {
                    e.preventDefault()
                    alert("osm-revert works only for www.openstreetmap.org")
                    return
                }

                let selector = ""

                const nodes = Array.from(document.querySelectorAll("#changeset_nodes input[type=checkbox]:checked"))
                if (nodes.length) {
                    selector +=
                        "node(id:" +
                        nodes
                            .map(n => {
                                return n.parentElement.nextElementSibling.id.match(/[0-9]+n([0-9]+)/)[1]
                            })
                            .join(",") +
                        ");\n"
                }
                const ways = Array.from(document.querySelectorAll("#changeset_ways input[type=checkbox]:checked"))
                if (ways.length) {
                    selector +=
                        "way(id:" +
                        ways
                            .map(w => {
                                return w.parentElement.nextElementSibling.id.match(/[0-9]+w([0-9]+)/)[1]
                            })
                            .join(",") +
                        ");\n"
                }
                const relations = Array.from(document.querySelectorAll("#changeset_relations input[type=checkbox]:checked"))
                if (relations.length) {
                    selector +=
                        "rel(id:" +
                        relations
                            .map(r => {
                                return r.parentElement.nextElementSibling.id.match(/[0-9]+r([0-9]+)/)[1]
                            })
                            .join(",") +
                        ");"
                }

                window.open(
                    "https://revert.monicz.dev/?" +
                        new URLSearchParams({
                            changesets: changeset_id,
                            "query-filter": selector,
                        }).toString(),
                    "_blank",
                )
                return
            }
            if (!e.shiftKey) {
                if (osm_server !== prod_server) {
                    e.preventDefault()
                    alert(
                        "osm-revert works only for www.openstreetmap.org\n\n" +
                            "But you can install reverter plugin in JOSM and use shift+click for other OSM servers.\n\n" +
                            "⚠️Change the osm server in the josm settings!",
                    )
                }
                return
            }
            e.preventDefault()
            if (!(await validateOsmServerInJOSM())) {
                return
            }

            if (osm_server !== prod_server) {
                if (!confirm("⚠️This is not the main OSM server!\n\n⚠️To change the OSM server in the JOSM settings!")) {
                    return
                }
            }
            window.location = "http://127.0.0.1:8111/revert_changeset?id=" + changeset_id // todo open in new tab. It's broken in Firefox and open new window
        }
        document.querySelector("#revert_button_class").style.textDecoration = "none"
        const osmcha_link = document.querySelector("#osmcha_link svg")
        osmcha_link.style.height = "1em"
        osmcha_link.style.cursor = "pointer"
        osmcha_link.style.marginTop = "-3px"
        osmcha_link.title = "Open changeset in OSMCha (or press O)\n(shift + O for open Achavi)"
        if (isDarkMode()) {
            osmcha_link.style.filter = "invert(0.7)"
        }

        // find deleted user
        // todo extract
        const metainfoHTML = document.querySelector("#sidebar_content h2 ~ div > .details")
        const time = metainfoHTML.querySelector("time")
        if (metainfoHTML.querySelector('a[href*="/user/"]:not([rel])')) {
            const usernameA = metainfoHTML.querySelector('a[href*="/user/"]:not([rel])')
            metainfoHTML.innerHTML = ""
            metainfoHTML.appendChild(time)
            metainfoHTML.appendChild(document.createTextNode(" "))
            metainfoHTML.appendChild(usernameA)
            metainfoHTML.appendChild(document.createTextNode(" "))
            getCachedUserInfo(usernameA.textContent).then(res => {
                usernameA.before(makeBadge(res, new Date(time.getAttribute("datetime"))))
                usernameA.before(document.createTextNode(" "))
                usernameA.title = makeUsernameTitle(res)

                document.querySelectorAll(".browse-tag-list tr").forEach(i => {
                    const key = i.querySelector("th")
                    if (!key) return
                    if (key.textContent === "changesets_count") {
                        function insertAllChangesets(info) {
                            const allChangesets = document.createElement("span")
                            allChangesets.textContent = `/${info["changesets"]["count"]}`
                            allChangesets.style.color = "gray"
                            allChangesets.title = "how many changesets does the user have in total"
                            i.querySelector("td").appendChild(allChangesets)
                        }

                        if (parseInt(i.querySelector("td").textContent) >= res["changesets"]["count"]) {
                            updateUserInfo(usernameA.textContent).then(res => {
                                insertAllChangesets(res)
                            })
                        } else {
                            insertAllChangesets(res)
                        }
                    }
                })
            })
            //<link rel="alternate" type="application/atom+xml" title="ATOM" href="https://www.openstreetmap.org/user/Elizen/history/feed">
            const rssfeed = document.createElement("link")
            rssfeed.id = "fixed-rss-feed"
            rssfeed.type = "application/atom+xml"
            rssfeed.title = "ATOM"
            rssfeed.rel = "alternate"
            rssfeed.href = `https://www.openstreetmap.org/user/${encodeURI(usernameA.textContent)}/history/feed`
            document.head.appendChild(rssfeed)
        } else {
            const time = metainfoHTML.querySelector("time")
            metainfoHTML.innerHTML = ""
            metainfoHTML.appendChild(time)
            const findBtn = document.createElement("span")
            findBtn.title = "Try find deleted user"
            findBtn.textContent = " 🔍 "
            findBtn.value = changeset_id
            findBtn.datetime = time.dateTime
            findBtn.style.cursor = "pointer"
            findBtn.onclick = findChangesetInDiff
            metainfoHTML.appendChild(findBtn)

            void restorePrevNextChangesetButtons(parseInt(changeset_id))
        }
        // compact changeset tags
        if (!document.querySelector(".browse-tag-list[compacted]")) {
            makeHashtagsClickable()
            shortOsmOrgLinks(document.querySelector("#sidebar_content h2 ~ div p"))
            let needUnhide = false

            function isSimpleNode(elem) {
                return elem.childNodes.length === 1 && elem.childNodes[0].nodeType === Node.TEXT_NODE
            }

            document.querySelectorAll(".browse-tag-list tr").forEach(i => {
                const key = i.querySelector("th")
                if (!key) return
                i.querySelectorAll("a").forEach(i => (i.tabIndex = -1))
                if (key.textContent === "host") {
                    if (i.querySelector("td").textContent === "https://www.openstreetmap.org/edit") {
                        i.style.display = "none"
                        i.classList.add("hidden-tag")
                    }
                } else if (key.textContent.startsWith("ideditor:")) {
                    key.title = key.textContent
                    key.textContent = key.textContent.replace("ideditor:", "iD:")
                } else if (key.textContent === "revert:id") {
                    const cell = i.querySelector("td")
                    if (isSimpleNode(cell) && cell.textContent.match(/^((\d+(;|…?$))+$)/)) {
                        cell.innerHTML = cell.innerHTML.replaceAll(/(\d+)(;|$)/g, `<a href="/changeset/$1" class="changeset_link_in_changeset_tags">$1</a>$2`)
                    } else if (cell.textContent.match(/https:\/\/(www\.)?openstreetmap.org\/changeset\//g)) {
                        cell.innerHTML = cell.innerHTML.replaceAll(/>https:\/\/(www\.)?openstreetmap.org\/changeset\//g, ">")
                    }
                } else if (key.textContent === "revert:dmp:relation:id" || key.textContent === "revert:dmp:fail:relation:id") {
                    const cell = i.querySelector("td")
                    if (isSimpleNode(cell) && cell.textContent.match(/^((\d+(;|…?$))+$)/)) {
                        cell.innerHTML = cell.innerHTML.replaceAll(/(\d+)(;|$)/g, `<a href="/relation/$1" class="relation_link_in_changeset_tags">$1</a>$2`)
                    }
                } else if (key.textContent === "revert:dmp:way:id" || key.textContent === "revert:dmp:fail:way:id") {
                    const cell = i.querySelector("td")
                    if (isSimpleNode(cell) && cell.textContent.match(/^((\d+(;|…?$))+$)/)) {
                        cell.innerHTML = cell.innerHTML.replaceAll(/(\d+)(;|$)/g, `<a href="/way/$1" class="way_link_in_changeset_tags">$1</a>$2`)
                    }
                } else if (key.textContent === "redacted_changesets") {
                    const cell = i.querySelector("td")
                    if (isSimpleNode(cell) && cell.textContent.match(/^((\d+(,|$))+$)/)) {
                        cell.innerHTML = cell.innerHTML.replaceAll(/(\d+)/g, `<a href="/changeset/$1" class="changeset_link_in_changeset_tags">$1</a>`)
                    } else if (cell.textContent.match(/https:\/\/(www\.)?openstreetmap.org\/changeset\//g)) {
                        cell.innerHTML = cell.innerHTML.replaceAll(/>https:\/\/(www\.)?openstreetmap.org\/changeset\//g, ">")
                    }
                } else if (key.textContent.startsWith("v:") && GM_config.get("ChangesetQuickLook")) {
                    i.style.display = "none"
                    i.classList.add("hidden-tag")
                    needUnhide = true
                } else if (
                    key.textContent === "hashtags" &&
                    i.querySelector("td").textContent.includes("#") &&
                    document.querySelector("#sidebar_content h2 ~ div p")?.textContent?.includes(i.querySelector("td").textContent)
                ) {
                    i.style.display = "none"
                    i.classList.add("hidden-tag")
                }
            })
            if (needUnhide) {
                const expander = document.createElement("td")
                expander.onclick = e => {
                    document.querySelectorAll(".hidden-tag").forEach(i => {
                        i.style.display = ""
                    })
                    e.target.remove()
                }
                expander.colSpan = 2
                expander.textContent = "∇"
                expander.style.textAlign = "center"
                expander.style.cursor = "pointer"
                expander.title = "Show hidden tags"
                document.querySelector(".browse-tag-list").appendChild(expander)
            }
            document.querySelector(".browse-tag-list")?.setAttribute("compacted", "true")
        }
    }
    const textarea = document.querySelector("#sidebar_content textarea")
    if (textarea) {
        textarea.rows = 1
        const comment = document.querySelector("#sidebar_content button[name=comment]")
        if (comment) {
            comment.parentElement.hidden = true
            textarea.addEventListener("input", () => {
                comment.hidden = false
            })
            textarea.addEventListener(
                "click",
                () => {
                    textarea.rows = textarea.rows + 5
                    comment.parentElement.hidden = false
                },
                { once: true },
            )
            comment.onclick = () => {
                ;[500, 1000, 2000, 4000, 6000].map(i => setTimeout(setupRevertButton, i))
            }
            const templates = /** @type {string} */ (GM_config.get("ChangesetsTemplates"))
            if (templates) {
                JSON.parse(templates).forEach(row => {
                    const label = row["label"]
                    let text = label
                    if (row["text"] !== "") {
                        text = row["text"]
                    }
                    const b = document.createElement("span")
                    b.classList.add("comment-template", "btn", "btn-primary")
                    b.textContent = label
                    b.title = `Add into the comment "${text}".\nYou can change text in userscript settings`
                    document.querySelectorAll("form.mb-3 [name=comment]")[0].parentElement.appendChild(b)
                    b.after(document.createTextNode("\xA0"))
                    b.onclick = e => {
                        e.stopImmediatePropagation()
                        const textarea = document.querySelector("form.mb-3 textarea")
                        const prev = textarea.value
                        const cursor = textarea.selectionEnd
                        textarea.value = prev.substring(0, cursor) + text + prev.substring(cursor)
                        textarea.focus()
                    }
                })
            }
        }
    }
    const tagsHeader = document.querySelector("#sidebar_content h4")
    if (tagsHeader) {
        tagsHeader.remove()
    }
    const primaryButtons = document.querySelector("[name=subscribe], [name=unsubscribe]")
    if (primaryButtons?.getAttribute("name") === "subscribe") {
        primaryButtons.tabIndex = -1
    }
    if (primaryButtons && osm_server.url === prod_server.url) {
        const changeset_id = sidebar.innerHTML.match(/(\d+)/)[0]
        const reactionsContainer = document.createElement("span")
        primaryButtons.before(reactionsContainer)
        addOsmchaButtons(changeset_id, reactionsContainer)
    }
    document.querySelectorAll('#sidebar_content article[id^=c] small > a[href^="/user/"]').forEach(elem => {
        getCachedUserInfo(elem.textContent).then(info => {
            elem.before(makeBadge(info, new Date(elem.nextElementSibling.getAttribute("datetime"))))
            elem.title = makeUsernameTitle(info)
        })
    })
    document.querySelectorAll("#sidebar_content h2 ~ div article p").forEach(c => {
        c.childNodes?.forEach(node => {
            if (node.nodeType !== Node.TEXT_NODE) return
            const span = document.createElement("span")
            span.textContent = node.textContent
            span.innerHTML = span.innerHTML.replaceAll(/((changesets )((\d+)([,. ])(\s|$|<\/))+|changeset \d+)/gm, match => {
                return match.replaceAll(/(\d+)/g, `<a href="/changeset/$1" class="changeset_link_in_comment">$1</a>`)
            })
            node.replaceWith(span)
        })
    })
    makeHeaderPartsClickable()
}

function setupRevertButton() {
    if (!location.pathname.startsWith("/changeset")) return
    const timerId = setInterval(() => {
        if (addRevertButton()) clearInterval(timerId)
    }, 100)
    setTimeout(() => {
        clearInterval(timerId)
        console.debug("stop try add revert button")
    }, 3000)
    addRevertButton()
}

// noinspection CssUnusedSymbol,CssUnresolvedCustomProperty
const compactSidebarStyleText = `
    .changesets p {
      margin-bottom: 0px !important;
      font-weight: 788;
      font-style: italic;
      font-size: 14px !important;
      font-synthesis: none;
    }
    #sidebar_content > div:not(.changesets) .changeset_num_comments {
        display: none !important;
    }
    @media ${mediaQueryForWebsiteTheme} {
        .changesets time {
            color: darkgray;
        }

        .changesets p {
            font-weight: 400;
        }

        span:has(.changeset_id.custom-changeset-id-click) {
            color: #767676 !important;
        }
    }

    .changeset_id.custom-changeset-id-click {
        color: #767676 !important;
    }
    
    #sidebar_content h2 ~ div > p:nth-of-type(1) {
        font-size: 14px !important;
        font-style: italic;
        font-synthesis: none;
    }

    #element_versions_list div > p:nth-of-type(1) {
        font-size: 14px !important;
        font-style: italic;
        font-synthesis: none;
    }

    .hidden-comments-badge:not(.increased-specificity-for-fucked-safari) {
        display: none !important;
    }

    .better-diff-icon {
        position: relative;
        top: 2px;
    }

    .map-layout #sidebar${isSafari ? ":not(.increased-specificity-for-fucked-safari)" : ""} {
      width: 450px;
    }
    turbo-frame {
        word-wrap: anywhere;
    }
    .numbered_pagination {
        word-wrap: initial;
    }

    turbo-frame th {
        min-width: max-content;
        word-wrap: break-word;
    }

${copyAnimationStyles}

    #sidebar_content h2:not(.changeset-header) {
        font-size: 1rem;
    }
    #sidebar {
      border-top: solid;
      border-top-width: 1px;
      border-top-color: rgba(var(--bs-secondary-bg-rgb), var(--bs-bg-opacity)) !important;
    }

    .fixme-tag {
      color: red !important;
      font-weight: bold;
    }

    .note-tag {
      font-weight: bold;
    }

    @media ${mediaQueryForWebsiteTheme} {
      .fixme-tag {
        color: #ff5454 !important;
        font-weight: unset;
      }

      .note-tag:not(.current-value-span):not(.history-diff-new-tag):not(.history-diff-deleted-tag) {
        background: black !important;
        font-weight: unset;
      }
    }

    @media ${mediaQueryForWebsiteTheme} {
        table.browse-tag-list tr td[colspan="2"]{
          background: var(--bs-body-bg) !important;
        }
    }

    .sidebar-close-controls.position-relative .position-absolute {
        padding: 1.5rem !important;
        padding-bottom: 1.3rem !important;
        padding-top: 1.4rem !important;
        padding-left: 1.3rem !important;
    }

    .way-last-version-node:hover, .relation-last-version-member:hover, .node-last-version-parent:hover {
        background-color: rgba(244, 244, 244);
    }

    @media ${mediaQueryForWebsiteTheme} {
        .way-last-version-node:hover, .relation-last-version-member:hover, .node-last-version-parent:hover {
            background-color: rgb(14, 17, 19);
        }
    }

    .copy-changesets-ids-btn {
        padding-left: 5px;
        padding-right: 5px;
    }

    #mouse-trap {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: auto;
        cursor: none;
        z-index: 999999;
        /* background: rgba(255, 0, 0, 0.3); */
        background: transparent;
    }
    `

let styleForSidebarApplied = false

function addCompactSidebarStyle() {
    if (styleForSidebarApplied) return
    styleForSidebarApplied = true
    injectCSSIntoOSMPage(compactSidebarStyleText)
}

async function getChangesetComments(changeset_id) {
    const res = await fetchJSONWithCache(osm_server.apiBase + "changeset" + "/" + changeset_id + ".json?include_discussion=true")
    return res["changeset"]["comments"]
}

let sidebarObserver = null

function setupCompactChangesetsHistory() {
    if (!location.pathname.includes("/history") && !location.pathname.startsWith("/changeset")) {
        // prettier-ignore
        if (!styleForSidebarApplied && (location.pathname.startsWith("/node")
            || location.pathname.startsWith("/way")
            || location.pathname.startsWith("/relation"))) {
            addCompactSidebarStyle()
        }
        return
    }

    if (location.pathname.startsWith("/changeset")) {
        externalizeLinks(document.querySelectorAll("#sidebar_content p:first-of-type a"))
        externalizeLinks(document.querySelector("#sidebar_content ul")?.querySelectorAll("a:not(.page-link)"))
    }

    addCompactSidebarStyle()

    // увы, инвалидация в этом месте ломает зум при загрузке объекте самим сайтом
    // try {
    // getMap()?.invalidateSize()
    // } catch (e) {
    // }

    function handleNewChangesets() {
        if (!location.pathname.includes("/history")) {
            return
        }
        // remove useless
        document.querySelectorAll("#sidebar ol > li > .overflow-hidden:not(.better)").forEach(e => {
            e.classList.add("better")
            e.childNodes[0].textContent = ""
            if (e.querySelector("time")?.nextSibling?.nodeType === Node.TEXT_NODE) {
                if (e.querySelector("time").nextSibling.textContent.length < 5) {
                    // hack for deleted users
                    e.querySelector("time").nextSibling.textContent = "\xA0"
                }
            }
            e.classList.remove("pt-3")
            const badgesDiv = e.nextElementSibling
            if (badgesDiv) {
                badgesDiv.classList.remove("flex-column")
                badgesDiv.classList.add("flex-row")
                badgesDiv.style.gap = "5px"
                if (badgesDiv.querySelector(".changeset_line")) {
                    badgesDiv.querySelector(".changeset_line").style.flexDirection = "row-reverse"
                }
            }
            const changesBadge = badgesDiv.querySelector("span:not(.changeset_num_comments) svg")
            if (changesBadge && !changesBadge.classList.contains("better-diff-icon")) {
                changesBadge.outerHTML = diffSvg
                changesBadge.style.position = "relative"
                changesBadge.style.top = "3px"
            }
            const changesetIDspan = badgesDiv?.querySelector('a[href^="/changeset/"]:not([rel])')?.parentElement
            if (changesetIDspan) {
                e.appendChild(changesetIDspan)
            }
            const wrapper = document.createElement("div")
            wrapper.classList.add("better-wrapper", "d-flex", "flex-nowrap", "justify-content-between", "align-items-end")
            e.parentElement.appendChild(wrapper)
            wrapper.appendChild(e)
            wrapper.appendChild(badgesDiv)
        })
        makeTimesSwitchable()
        hideSearchForm()

        document.querySelectorAll("ol li a.changeset_id bdi:not(.compacted)").forEach(description => {
            description.classList.add("compacted")
            description.textContent = shortOsmOrgLinksInText(description.textContent)
        })

        setTimeout(async () => {
            for (const elem of document.querySelectorAll("ol li:not(:has(.comment)):not(.comments-loaded)")) {
                elem.classList.add("comments-loaded")
                const commentsBadge = elem.querySelector(".changeset_num_comments")
                // prettier-ignore
                commentsBadge.querySelector("i").outerHTML = commentSvg
                const commentsCount = parseInt(commentsBadge.firstChild.textContent.trim())
                if (commentsCount) {
                    if (commentsCount > 3) {
                        commentsBadge.firstElementChild.style.setProperty("color", "red", "important")
                    } else if (commentsCount > 1) {
                        commentsBadge.firstElementChild.style.setProperty("color", "#ff7800", "important")
                    } else if (commentsCount > 0) {
                        commentsBadge.firstElementChild.style.setProperty("color", "#ffae00", "important")
                    }

                    const changeset_id = elem.querySelector(".changeset_id").href.match(/\/(\d+)/)[1]
                    getChangesetComments(changeset_id).then(res => {
                        res.forEach((comment, idx) => {
                            const commentElem = document.createElement("div")
                            commentElem.classList.add("comment")
                            commentElem.style.fontSize = "0.7rem"
                            commentElem.style.borderTopColor = "#0000"
                            commentElem.style.borderTopStyle = "solid"
                            commentElem.style.borderTopWidth = "1px"
                            if (idx !== 0) {
                                commentElem.style.display = "none"
                            }
                            elem.appendChild(commentElem)

                            const userLink = document.createElement("a")
                            userLink.href = osm_server.url + "/user/" + encodeURI(comment["user"])
                            userLink.textContent = comment["user"]
                            commentElem.appendChild(userLink)
                            getCachedUserInfo(comment["user"]).then(res => {
                                const badge = makeBadge(res /* fixme */)
                                const svg = badge.querySelector("svg")
                                if (svg) {
                                    badge.style.marginLeft = "-4px"
                                    badge.style.height = "1rem"
                                    badge.style.float = "left"
                                    svg.style.transform = "scale(0.7)"
                                }
                                userLink.before(badge)
                            })
                            const shortText = shortOsmOrgLinksInText(comment["text"])
                            if (shortText.length > 500) {
                                const text = document.createElement("span")
                                text.textContent = " " + shortText.slice(0, 500)
                                commentElem.appendChild(text)
                                const more = document.createElement("span")
                                more.textContent = "..."
                                more.title = "Click for view more"
                                more.style.cursor = "pointer"
                                more.style.color = "rgba(var(--bs-link-color-rgb), var(--bs-link-opacity, 1))"
                                more.onclick = () => {
                                    more.remove()
                                    text.textContent = " " + shortText
                                }
                                commentElem.appendChild(more)
                            } else {
                                commentElem.appendChild(document.createTextNode(" " + shortText))
                            }
                        })

                        commentsBadge.firstElementChild.style.cursor = "pointer"

                        let state = commentsCount === 1 ? "" : "none"
                        commentsBadge.firstElementChild.onclick = () => {
                            elem.querySelectorAll(".comment").forEach(comment => {
                                if (state === "none") {
                                    comment.style.display = ""
                                } else {
                                    comment.style.display = "none"
                                }
                            })
                            state = state === "none" ? "" : "none"
                        }
                        commentsBadge.firstElementChild.title = ""
                        res.forEach(comment => {
                            const shortText = shortOsmOrgLinksInText(comment["text"])
                            commentsBadge.firstElementChild.title += `${comment["user"]}:\n${shortText}\n\n`
                        })
                        commentsBadge.firstElementChild.title = commentsBadge.firstElementChild.title.trimEnd()
                    })
                } else {
                    commentsBadge.classList.add("hidden-comments-badge")
                }
            }
            const changesetIdElems = document.querySelectorAll("#sidebar ol li div .changeset_id:not(.metadata-loading)")
            const changesetsIDs = Array.from(changesetIdElems)
                .map(elem => {
                    elem.classList.add("metadata-loading")
                    return parseInt(elem.href.match(/\/(\d+)/)[1])
                })
                .filter(ch => !changesetMetadatas[ch])
            await loadChangesetMetadatas(changesetsIDs)
            changesetIdElems.forEach(elem => {
                const changesetId = parseInt(elem.href.match(/\/(\d+)/)[1])
                const li = elem.parentElement.parentElement.parentElement.parentElement
                if (changesetMetadatas[changesetId]?.tags?.["review_requested"] === "yes") {
                    li.classList.add("review-requested-changeset")
                    const reviewRequestedBadge = document.createElement("span")
                    reviewRequestedBadge.textContent = " " + REVIEW_REQUESTED_EMOJI
                    reviewRequestedBadge.title = "Mapper requested changeset review\nClick to filter this changesets"
                    reviewRequestedBadge.style.cursor = "pointer"
                    elem.after(reviewRequestedBadge)
                    reviewRequestedBadge.onclick = () => {
                        if (!massModeActive) {
                            document.querySelector("#changesets-filter-btn").click()
                        }
                        // dirty hack
                        setTimeout(() => {
                            if (document.querySelector("#invert-user-filter-checkbox").getAttribute("checked") === "false") {
                                if (["", REVIEW_REQUESTED_EMOJI].includes(document.querySelector("#filter-by-user-input").value)) {
                                    document.querySelector("#invert-user-filter-checkbox").click()
                                }
                            }
                            addUsernameIntoChangesetsFilter(REVIEW_REQUESTED_EMOJI)
                        })
                    }
                }
                if (li.title !== "") {
                    li.title += "\n"
                }
                li.title += Object.entries(changesetMetadatas[changesetId]?.tags)
                    .filter(([k, v]) => k !== "comment" && !(k === "host" && v === "https://www.openstreetmap.org/edit") && !k.startsWith("v:"))
                    .map(([k, v]) => `${k}=${v}`)
                    .join("\n")
            })
        })
    }

    if (!location.pathname.startsWith("/node") && !location.pathname.startsWith("/way") && !location.pathname.startsWith("/relation")) {
        sidebarObserver?.disconnect()
        handleNewChangesets()
        sidebarObserver = new MutationObserver(handleNewChangesets)
        if (document.querySelector("#sidebar_content") && !location.pathname.startsWith("/changeset")) {
            sidebarObserver.observe(document.querySelector("#sidebar_content"), { childList: true, subtree: true })
        }
    }

    void initCorporateMappersList()
}

//</editor-fold>
