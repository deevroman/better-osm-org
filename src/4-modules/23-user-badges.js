//<editor-fold desc="user-badges" defaultstate="collapsed">

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
