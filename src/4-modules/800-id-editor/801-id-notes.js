//<editor-fold desc="id-notes" defaultstate="collapsed">

let idSidebarObserver = null

function initIdSidebarObserver() {
    if (idSidebarObserver) {
        return
    }
    const sidebar = document.querySelector(".sidebar")
    idSidebarObserver = new MutationObserver((mutations, obs) => {
        obs.disconnect()
        if (document.querySelector(".sidebar-component") && !document.querySelector(".notes-buttons-wrapper")) {
            addResolveNotesButtonInId()
        }
        obs.observe(sidebar, { childList: true })
    })
    idSidebarObserver.observe(sidebar, { childList: true })
}

function addResolveNotesButtonInId() {
    /** @type {string} */
    const resolveButtonsText = GM_config.get("ResolveNotesButton")
    if (!resolveButtonsText) {
        return true
    }
    const parsedResolveButtonsText = JSON.parse(resolveButtonsText)
    if (parsedResolveButtonsText.length === 0) {
        return
    }
    if (!document.querySelector(".sidebar")) {
        return
    }
    try {
        initIdSidebarObserver()
    } catch (e) {
        console.error(e)
    }
    const saveSection = document.querySelector(".note-save.save-section")
    if (!saveSection) {
        return
    }
    if (document.querySelector(".save-button")) {
        return
    }
    if (document.querySelector(".notes-buttons-wrapper")) {
        return true
    }
    addAutoCompleteOnIdEditor()
    if (document.querySelector(".note-header-icon.closed")) {
        return true
    }

    const buttonsWrapper = document.createElement("span")
    buttonsWrapper.classList.add("notes-buttons-wrapper")
    buttonsWrapper.style.display = "flex"
    buttonsWrapper.style.flexWrap = "wrap"
    buttonsWrapper.style.gap = "4px"
    buttonsWrapper.style.rowGap = "4px"
    buttonsWrapper.style.paddingBottom = "30px"
    buttonsWrapper.style.margin = "10px"
    buttonsWrapper.style.marginTop = "5px"
    buttonsWrapper.style.fontSize = "14px"
    saveSection.querySelector(".buttons").after(buttonsWrapper)

    parsedResolveButtonsText.forEach(row => {
        const label = row["label"]
        let text = label
        if (row["text"] !== "") {
            text = row["text"]
        }
        const b = document.createElement("button")
        b.classList.add("resolve-note-done", "btn", "btn-primary", "button", "action")
        b.textContent = label
        b.style.padding = "10px 15px"
        b.title = t("notes.resolveButtonTitle", { text })
        buttonsWrapper.appendChild(b)
        b.onclick = async e => {
            const textarea = saveSection.querySelector("textarea.new-comment-input")
            if (GM_config.get("AutoResolveNote")) {
                textarea.value = text
            } else {
                const prev = textarea.value
                const cursor = textarea.selectionEnd
                textarea.value = prev.substring(0, cursor) + text + prev.substring(cursor)
            }

            const ev = new InputEvent("input", {
                bubbles: true,
                cancelable: false,
                data: textarea.value,
                inputType: "insertFromPaste",
            })
            textarea.dispatchEvent(ev)
            if (!GM_config.get("AutoResolveNote") || e.altKey) {
                return
            }
            saveSection.querySelector(".buttons > .status-button.action").click()
        }
    })
}

function setupResolveNotesButtonInId() {
    tryApplyModule(addResolveNotesButtonInId, 1000, 10000)
}

//</editor-fold>
