//<editor-fold desc="find-user-in-dif" defaultstate="collapsed">

async function decompressBlob(blob) {
    const ds = new DecompressionStream("gzip")
    const decompressedStream = blob.stream().pipeThrough(ds)
    return await new Response(decompressedStream).blob()
}

async function tryFindChangesetInDiffGZ(gzURL, changesetId) {
    const diffGZ = await externalFetchRetry({
        method: "GET",
        url: gzURL,
        responseType: "blob",
    })
    const blob = await decompressBlob(diffGZ.response)
    const diffXML = await blob.text()

    const diffParser = new DOMParser()
    const doc = diffParser.parseFromString(diffXML, "application/xml")
    return doc.querySelector(`osm changeset[id='${changesetId}']`)
}

async function parseBBB(target, url) {
    const response = await externalFetchRetry({
        method: "GET",
        url: planetOrigin + "/replication/changesets/" + url,
    })
    const BBBHTML = new DOMParser().parseFromString(response.responseText, "text/html")

    const a = Array.from(BBBHTML.querySelector("pre").childNodes).slice(2)
    let x = 0
    let found = false
    for (x; x < a.length; x += 2) {
        const num = parseInt(a[x].textContent)
        let d = new Date(a[x + 1].textContent.trim().slice(0, -1).trim())
        if (url === "003/") {
            if (num === 115) {
                d = new Date("2018-10-1918T01:21:00Z")
            } else if (num === 116) {
                d = new Date("2018-10-1918T13:25:00Z")
            }
        }
        if (target < d) {
            found = true
            break
        }
    }
    if (x === 0) {
        return found ? [a[x].getAttribute("href"), a[x].getAttribute("href")] : false
    } else {
        return found ? [a[x].getAttribute("href"), a[x - 2].getAttribute("href")] : false
    }
}

async function parseCCC(target, url) {
    const response = await externalFetchRetry({
        method: "GET",
        url: planetOrigin + "/replication/changesets/" + url,
    })
    const CCCHTML = new DOMParser().parseFromString(response.responseText, "text/html")

    const a = Array.from(CCCHTML.querySelector("pre").childNodes).slice(2)
    let x = 0
    let found = false
    /**
     * HTML format:
     *              xxx.ext         datetime
     *              xxx.state.txt   datetime <for new changesets>
     *              file.tmp        datetime <sometimes>
     *              yyy.ext         ....
     */
    for (x; x < a.length; x += 2) {
        if (!a[x].textContent.match(/^\d+\.osm\.gz$/)) {
            continue
        }
        const d = new Date(a[x + 1].textContent.trim().slice(0, -1).trim().split(" ").slice(0, -1).join(" ").trim() + " UTC")
        if (target <= d) {
            found = true
            break
        }
    }
    if (!found) {
        return false
    }
    if (x + 2 >= a.length) {
        return [a[x].getAttribute("href"), a[x].getAttribute("href")]
    }
    try {
        // state files are missing in old diffs folders
        if (a[x + 2].getAttribute("href")?.match(/^\d+\.osm\.gz$/)) {
            return [a[x].getAttribute("href"), a[x + 2].getAttribute("href")]
        }
    } catch {
        /* empty */
    }
    if (x + 4 >= a.length) {
        return [a[x].getAttribute("href"), a[x].getAttribute("href")]
    }
    return [a[x].getAttribute("href"), a[x + 4].getAttribute("href")]
}

async function checkBBB(AAA, BBB, targetTime, targetChangesetID) {
    const CCC = await parseCCC(targetTime, AAA + BBB)
    if (!CCC) {
        return
    }
    const gzURL = planetOrigin + "/replication/changesets/" + AAA + BBB

    let foundedChangeset = await tryFindChangesetInDiffGZ(gzURL + CCC[0], targetChangesetID)
    if (!foundedChangeset) {
        foundedChangeset = await tryFindChangesetInDiffGZ(gzURL + CCC[1], targetChangesetID)
    }
    return foundedChangeset
}

async function checkAAA(AAA, targetTime, targetChangesetID) {
    const BBBs = await parseBBB(targetTime, AAA)
    if (!BBBs) {
        return
    }

    let foundedChangeset = await checkBBB(AAA, BBBs[0], targetTime, targetChangesetID)
    if (!foundedChangeset) {
        foundedChangeset = await checkBBB(AAA, BBBs[1], targetTime, targetChangesetID)
    }
    return foundedChangeset
}

// tests
// https://osm.org/way/488322838/history
// https://osm.org/way/74034517/history
// https://osm.org/relation/17425783/history
// https://osm.org/way/554280669/history
// https://osm.org/node/4122049406 (/replication/changesets/005/638/ contains .tmp files)
// https://osm.org/node/2/history (very hard)
async function findChangesetInDiff(e) {
    e.preventDefault()
    e.stopPropagation()
    e.target.style.cursor = "progress"

    let foundedChangeset
    try {
        const match = location.pathname.match(/\/(node|way|relation|changeset)\/(\d+)/)
        let [, type, objID] = match
        if (type === "changeset") {
            const ch = (await getChangeset(objID)).data
            type = ch.querySelector(`[changeset="${objID}"]`).nodeName
            objID = ch.querySelector(`[changeset="${objID}"]`).getAttribute("id")
        }
        if (type === "node") {
            foundedChangeset = await getNodeViaOverpassXML(objID, e.target.datetime)
        } else if (type === "way") {
            foundedChangeset = await getWayViaOverpassXML(objID, e.target.datetime)
        } else if (type === "relation") {
            foundedChangeset = await getRelationViaOverpassXML(objID, e.target.datetime)
        }
        if (!foundedChangeset?.getAttribute("user")) {
            foundedChangeset = null
            console.log("Loading via overpass failed. Try via diffs")
            throw ""
        }
    } catch {
        const response = await externalFetchRetry({
            method: "GET",
            url: planetOrigin + "/replication/changesets/",
        })
        const parser = new DOMParser()
        const AAAHTML = parser.parseFromString(response.responseText, "text/html")
        const targetTime = new Date(e.target.datetime)
        targetTime.setSeconds(0)
        const targetChangesetID = e.target.value

        const a = Array.from(AAAHTML.querySelector("pre").childNodes).slice(2).slice(0, -4)
        a.push(...a.slice(-2))
        let x = 0
        for (x; x < a.length - 2; x += 2) {
            const d = new Date(a[x + 1].textContent.trim().slice(0, -1).trim())
            if (targetTime < d) break
        }
        let AAAs
        if (x === 0) {
            AAAs = [a[x].getAttribute("href"), a[x].getAttribute("href")]
        } else {
            AAAs = [a[x - 2].getAttribute("href"), a[x].getAttribute("href")]
        }

        foundedChangeset = await checkAAA(AAAs[0], targetTime, targetChangesetID)
        if (!foundedChangeset) {
            foundedChangeset = await checkAAA(AAAs[1], targetTime, targetChangesetID)
        }
        if (!foundedChangeset) {
            alert(":(")
            return
        }
    }

    const userInfo = document.createElement("a")
    userInfo.setAttribute("href", "/user/" + foundedChangeset.getAttribute("user"))
    userInfo.style.cursor = "pointer"
    userInfo.textContent = foundedChangeset.getAttribute("user")

    e.target.before(document.createTextNode("\xA0"))
    e.target.before(userInfo)
    e.target.before(document.createTextNode("\xA0"))

    const uid = document.createElement("span")
    uid.style.cursor = "pointer"
    uid.title = "Click for copy user ID"
    uid.onclick = e => {
        const text = foundedChangeset.getAttribute("uid")
        navigator.clipboard.writeText(text).then(() => copyAnimation(e, text))
    }
    uid.textContent = `${foundedChangeset.getAttribute("uid")}`

    e.target.before(document.createTextNode("ID: "))
    e.target.before(uid)
    e.target.before(document.createTextNode("\xA0"))

    const webArchiveLink = document.createElement("a")
    webArchiveLink.textContent = "WebArchive"
    webArchiveLink.target = "_blank"
    webArchiveLink.href = "https://web.archive.org/web/*/https://www.openstreetmap.org/user/" + foundedChangeset.getAttribute("user")
    e.target.before(webArchiveLink)
    e.target.before(document.createTextNode("\xA0"))

    e.target.remove()
}

//</editor-fold>
