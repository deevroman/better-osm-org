//<editor-fold desc="wiki" defaultstate="collapsed">

function setupWiki() {
    if (location.pathname.startsWith("/wiki/Proposal:")) {
        let supportList = []
        let opposeList = []
        let abstainList = []

        for (const ul of document.querySelectorAll(":is(h1,h2):has(#Voting) ~ ul")) {
            for (const li of ul.querySelectorAll('li:has([typeof="mw:File"])')) {
                const who = (Array.from(li.querySelectorAll(":scope > a")).at(-2) ?? Array.from(li.querySelectorAll(":scope > a")).at(-1)).textContent
                if (li.querySelectorAll('[href="/wiki/File:Symbol_support_vote.svg"]').length === 1) {
                    supportList.push(who)
                } else if (li.querySelectorAll('[href="/wiki/File:Symbol_oppose_vote.svg"]').length === 1) {
                    opposeList.push(who)
                } else if (li.querySelectorAll('[href="/wiki/File:Symbol_abstain_vote.svg"]').length === 1) {
                    abstainList.push(who)
                } else {
                    console.error("invalid data for", li)
                    return
                }
            }
        }

        if (new Set(supportList).size !== supportList.length) {
            console.error("duplicates in support", supportList)
            return
        }
        if (new Set(opposeList).size !== opposeList.length) {
            console.error("duplicates in oppose", opposeList)
            return
        }
        if (new Set(abstainList).size !== abstainList.length) {
            console.error("duplicates in abstain", abstainList)
            return
        }

        const sum = supportList.length + opposeList.length
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

        const supportImg = document.querySelector('[href="/wiki/File:Symbol_support_vote.svg"]').cloneNode(true)
        const opposeImg = document.querySelector('[href="/wiki/File:Symbol_oppose_vote.svg"]').cloneNode(true)
        const abstainImg = document.querySelector('[href="/wiki/File:Symbol_abstain_vote.svg"]').cloneNode(true)

        support.insertCell().appendChild(supportImg)
        support.insertCell().appendChild(document.createTextNode(`${supportList.length}`))
        support.insertCell().appendChild(document.createTextNode(`${((supportList.length / sum) * 100).toFixed(1)}%`))
        if (supportList.length > opposeList.length * 3) {
            support.insertCell().appendChild(document.createTextNode(`> 75%`))
        } else {
            support.insertCell().appendChild(document.createTextNode(`need ${3 * opposeList.length - supportList.length} more votes up to 75 %`))
        }

        oppose.insertCell().appendChild(opposeImg)
        oppose.insertCell().appendChild(document.createTextNode(`${opposeList.length}`))
        oppose.insertCell().appendChild(document.createTextNode(`${((opposeList.length / sum) * 100).toFixed(1)}%`))

        abstain.insertCell().appendChild(abstainImg)
        abstain.insertCell().appendChild(document.createTextNode(`${abstainList.length}`))
        abstain.insertCell().appendChild(document.createTextNode(``))

        Array.from(document.querySelectorAll(":is(h2,h1):has(#Voting) ~ ul")).at(-1).after(results)
        results.before(document.createElement("br"))
        results.before(document.createTextNode("Interim results calculated by better-osm-org:"))
    }
}

//</editor-fold>
