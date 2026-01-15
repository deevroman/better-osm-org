//<editor-fold desc="relation version page" defaultstate="collapsed">

function addRelationVersionView() {
    const match = location.pathname.match(/relation\/(\d+)\/history\/(\d+)\/?$/)
    if (!match) {
        return
    }
    if (document.querySelector("#load-relation-version")) return
    const btn = document.createElement("a")
    btn.textContent = "📥"
    btn.id = "load-relation-version"
    btn.title = "Load relation version via Overpass API"
    btn.tabIndex = 0
    btn.style.cursor = "pointer"

    async function clickForDownloadHandler(e) {
        if (e.type === "keypress" && (e.code === "Space" || e.code === "Enter")) {
            e.preventDefault()
        } else if (e.type === "keypress") {
            return
        }
        e.stopPropagation()
        e.stopImmediatePropagation()
        btn.style.cursor = "progress"
        const match = location.pathname.match(/relation\/(\d+)\/history\/(\d+)\/?$/)
        const id = parseInt(match[1])
        const timestamp = document.querySelector("time").getAttribute("datetime")
        try {
            const { restrictionRelationErrors } = await loadRelationVersionMembersViaOverpass(id, timestamp)
            showRestrictionValidationStatus(restrictionRelationErrors, document.querySelector("#sidebar_content > div details summary"))
        } catch (e) {
            btn.style.cursor = "pointer"
            throw e
        }
        btn.style.visibility = "hidden"
    }

    btn.addEventListener("click", clickForDownloadHandler)
    btn.addEventListener("keypress", clickForDownloadHandler)
    document.querySelector("#sidebar_content > div h4")?.appendChild(btn)
}

function setupRelationVersionViewer() {
    const match = location.pathname.match(/relation\/(\d+)\/history\/(\d+)\/?$/)
    if (!match) {
        return
    }
    tryApplyModule(addRelationVersionView, 500, 25000)
}

//</editor-fold>
