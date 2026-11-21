//<editor-fold desc="notes-resolve" defaultstate="collapsed">

function insertNoteResolveButtons() {
    /** @type {string} */
    const resolveButtonsText = GM_config.get("ResolveNotesButton")
    if (!resolveButtonsText) {
        return
    }
    const note_id = location.pathname.match(/note\/(\d+)/)[1]

    const buttonsWrapper = document.createElement("span")
    buttonsWrapper.style.display = "flex"
    buttonsWrapper.style.flexWrap = "wrap"
    buttonsWrapper.style.gap = "4px"
    buttonsWrapper.style.rowGap = "4px"
    document.querySelectorAll("form.mb-3")[0].before(buttonsWrapper)

    JSON.parse(resolveButtonsText).forEach((row, index) => {
        const label = row["label"]
        let text = label
        if (row["text"] !== "") {
            text = row["text"]
        }
        const b = document.createElement("button")
        b.classList.add("resolve-note-done", "btn", "btn-primary")
        b.textContent = label
        b.title = t("notes.resolveButtonTitle", { text })
        buttonsWrapper.appendChild(b)
        b.onclick = async e => {
            if (!GM_config.get("AutoResolveNote") || e.altKey) {
                const textarea = document.querySelector("form.mb-3 textarea")
                const prev = textarea.value
                const cursor = textarea.selectionEnd
                textarea.value = prev.substring(0, cursor) + text + prev.substring(cursor)

                const ev = new InputEvent("input", {
                    bubbles: true,
                    cancelable: false,
                    data: textarea.value,
                    inputType: "insertFromPaste",
                })
                textarea.dispatchEvent(ev)
                return
            }
            try {
                await closeNote(note_id, text)
            } catch (err) {
                alert(err)
            } finally {
                tryReloadSidebar()
                getMap().fire("moveend")
            }
        }
    })
    document.querySelectorAll("form.mb-3")[0].before(document.createElement("p"))
    document.querySelector("form.mb-3 .form-control").rows = 3
}

function initKostylForSidebarStateChange(cb) {
    const obs = new MutationObserver((mutations, observer) => {
        if (!mutations[0].removedNodes.length) {
            return
        }
        observer.disconnect()
        cb()
    })
    obs.observe(document.querySelector("#sidebar_content"), { attributes: true, childList: true })
}

function addResolveNotesButton() {
    if (!location.pathname.includes("/note")) return
    if (location.pathname.includes("/note/new")) {
        addCreateNewPOIButton()
        return
    }
    if (document.querySelector(".resolve-note-done")) return
    if (document.querySelector("#timeback-btn")) return
    resetSearchFormFocus()
    trickyGeocoder()

    document.querySelectorAll('#sidebar_content a[href^="/user/"]').forEach(elem => {
        getCachedUserInfo(elem.textContent).then(info => {
            elem.before(makeBadge(info, new Date(elem.parentElement.querySelector("time")?.getAttribute("datetime") ?? new Date())))
            elem.title = makeUsernameTitle(info)
        })
    })
    externalizeLinks(document.querySelectorAll(".overflow-hidden a"))

    makeTimesSwitchable()

    const timestamp = document.querySelector("#sidebar_content time")?.dateTime
    if (!timestamp) {
        return
    }
    addTimebackButton(timestamp)

    try {
        makeHashtagsInNotesClickable()
        makeUsernameInNotesFilterable()
    } catch {
        console.error("fail when setuping filterable links in note")
    }

    processAttachedGpsTracks()
    try {
        addAltClickHandlerForNotes()
    } catch (err) {
        console.error(err, "fail add alt clicks handlers for note layer")
    }

    const isClosedNote = !document.querySelector("#sidebar_content textarea.form-control")

    addStreetCompletePhotos(isClosedNote)

    if (isClosedNote) {
        addRelatedChangesetsSearch()
        return
    }
    insertNoteResolveButtons()
    addAutoCompleteOnOsmOrg()
    initKostylForSidebarStateChange(() => {
        setTimeout(setupResolveNotesButton)
        setTimeout(setupSatelliteLayers)
    })
}

function setupResolveNotesButton() {
    if (!location.pathname.startsWith("/note")) return
    tryApplyModule(addResolveNotesButton, 100, 3000)
}

//</editor-fold>
