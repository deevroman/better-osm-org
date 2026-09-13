//<editor-fold desc="user-badges" defaultstate="collapsed">

const CORPORATE_EMOJI = "🏢"
const BAN_EMOJI = "⛔️"
const REVIEW_REQUESTED_EMOJI = "🙏"
const NEWBIE_EMOJI = "🍼"

async function loadFriends() {
    console.debug("Loading friends list")
    const res = await (await fetch(osm_server.url + "/dashboard")).text()
    const parser = new DOMParser()
    const doc = parser.parseFromString(res, "text/html")
    const friends = []
    doc.querySelectorAll('a[data-method="delete"][href*="/follow"]').forEach(a => {
        const username = a.getAttribute("href").match(/\/user\/(.+)\/follow/)[1]
        friends.push(decodeURI(username))
    })
    await GM.setValue("friends", JSON.stringify(friends))
    console.debug("Friends list updated")
    return friends
}

let friendsLoadingLock = false

async function getFriends() {
    const friendsStr = await GM.getValue("friends")
    if (friendsStr) {
        return JSON.parse(friendsStr)
    } else {
        while (friendsLoadingLock) {
            await sleep(500)
        }
        friendsLoadingLock = true
        const res = await loadFriends()
        friendsLoadingLock = false
        return res
    }
}

function makeBadge(userInfo, changesetDate = new Date()) {
    // todo make changesetDate required
    const userBadge = document.createElement("span")
    userBadge.classList.add("user-badge")

    function makeModeratorBadge() {
        userBadge.style.position = "relative"
        userBadge.style.bottom = "2px"
        userBadge.title = t("userBadges.userModerator")
        insertSvg(userBadge, "moderatorBadge")
        userBadge.querySelector("svg").style.transform = "scale(0.9)"
    }

    function makeImporterBadge() {
        userBadge.style.position = "relative"
        userBadge.style.bottom = "2px"
        userBadge.title = t("userBadges.userImporter")
        insertSvg(userBadge, "importerBadge")
        userBadge.querySelector("svg").style.transform = "scale(0.9)"
    }

    function makeBannedUserBadge() {
        userBadge.title = t("userBadges.userBanned")
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
            const lastBlockLinks = new DOMParser()
                .parseFromString(xml, "text/html")
                .querySelector('a[href^="/user_blocks/"]')
                .getAttribute("href")
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
        userBadge.title = t("userBadges.userNewbie")
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
        userBadge.title = t("userBadges.corporateMapper", { names: info.join(", ") })
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
                userBadge.title = t("userBadges.followingUser")
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
        new Date(userInfo["firstChangesetCreationTime"] ?? userInfo["account_created"]).setUTCDate(
            new Date(userInfo["firstChangesetCreationTime"] ?? userInfo["account_created"]).getUTCDate() + 30,
        ) > changesetDate
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

//</editor-fold>
