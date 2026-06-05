//<editor-fold desc="wiki" defaultstate="collapsed">

function addToList(list, who, type) {
    if (list.has(who)) {
        console.error(`duplicate ${type} vote from ${who}`)
        return false
    }
    list.add(who)
    return true
}

function setupWiki() {
    if (!location.pathname.startsWith("/wiki/Proposal:")) {
        return;
    }
    const supportList = new Set()
    const opposeList = new Set()
    const abstainList = new Set()

    const supportSymbolQuery = '[href="/wiki/File:Symbol_support_vote.svg"]'
    const opposeSymbolQuery = '[href="/wiki/File:Symbol_oppose_vote.svg"]'
    const abstainSymbolQuery = '[href="/wiki/File:Symbol_abstain_vote.svg"]'
    let hasDupeVotes = false
    for (const ul of document.querySelectorAll(":is(h1,h2):has(#Voting) ~ ul")) {
        for (const li of ul.querySelectorAll('li:has([typeof="mw:File"])')) {
            const anchors = Array.from(li.querySelectorAll(":scope > a"))
            const who = (anchors.at(-2) ?? anchors.at(-1))
                .textContent
            if (li.querySelectorAll(supportSymbolQuery).length === 1) {
                hasDupeVotes |= !addToList(supportList, who, "support")
            } else if (li.querySelectorAll(opposeSymbolQuery).length === 1) {
                hasDupeVotes |= !addToList(opposeList, who, "oppose")
            } else if (li.querySelectorAll(abstainSymbolQuery).length === 1) {
                hasDupeVotes |= !addToList(abstainList, who, "abstain")
            } else {
                console.error("invalid data for", li)
                return
            }
        }
    }

    if (hasDupeVotes) {
        console.error("duplicate votes found in vote lists")
        return
    }

    const sum = supportList.size + opposeList.size
    if (sum === 0) {
        console.log("votes not found")
        return
    }
    console.log(supportList, opposeList, abstainList)
    const results = document.createElement("table")
    results.style.textAlign = "right"

    const support = results.insertRow()
    const oppose = results.insertRow()
    const abstain = results.insertRow()

    const supportImg = document.querySelector(supportSymbolQuery).cloneNode(true)
    const opposeImg = document.querySelector(opposeSymbolQuery).cloneNode(true)
    const abstainImg = document.querySelector(abstainSymbolQuery).cloneNode(true)

    support.insertCell().appendChild(supportImg)
    support.insertCell().appendChild(document.createTextNode(`${supportList.size}`))
    support.insertCell().appendChild(document.createTextNode(`${((supportList.size / sum) * 100).toFixed(1)}%`))
    if (supportList.size > opposeList.size * 3) {
        support.insertCell().appendChild(document.createTextNode(`> 75%`))
    } else {
        support
            .insertCell()
            .appendChild(document.createTextNode(t("wiki.needMoreVotes", { count: 3 * opposeList.size - supportList.size })))
    }

    oppose.insertCell().appendChild(opposeImg)
    oppose.insertCell().appendChild(document.createTextNode(`${opposeList.size}`))
    oppose.insertCell().appendChild(document.createTextNode(`${((opposeList.size / sum) * 100).toFixed(1)}%`))

    abstain.insertCell().appendChild(abstainImg)
    abstain.insertCell().appendChild(document.createTextNode(`${abstainList.size}`))
    abstain.insertCell().appendChild(document.createTextNode(``))

    Array.from(document.querySelectorAll(":is(h2,h1):has(#Voting) ~ :is(ul,dl)")).at(-1).after(results)
    results.before(document.createElement("br"))
    results.before(document.createTextNode(t("wiki.interimResults")))
}

//</editor-fold>
