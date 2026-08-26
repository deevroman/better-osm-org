//<editor-fold desc="messages" defaultstate="collapsed">

function setupMessagesTemplates() {
    if (!location.pathname.startsWith("/messages/new/")) {
        return
    }
    const templates = /** @type {string} */ (GM_config.get("MessagesTemplates"))
    if (!templates) {
        return
    }
    const buttonsWrapper = document.querySelector(".richtext_container ul")

    const li = document.createElement("li")
    li.classList.add("nav-item")
    buttonsWrapper.appendChild(li)
    const b = document.createElement("button")
    b.classList.add("comment-template", "nav-link")
    b.setAttribute("disabled", "true")
    b.textContent = t("messages.templatesHeader")
    li.appendChild(b)

    JSON.parse(templates).forEach(row => {
        const label = row["label"]
        let text = label
        if (row["text"] !== "") {
            text = row["text"]
        }
        text = text.replace("{{ mapper.displayName }}", decodeURI(location.pathname.match(/\/messages\/new\/([^\/]*)/)[1]))
        const li = document.createElement("li")
        li.classList.add("nav-item")
        buttonsWrapper.appendChild(li)

        const b = document.createElement("button")
        b.classList.add("comment-template", "nav-link")
        b.textContent = label
        b.title = t("messages.commentTemplateTitle", { text })
        li.appendChild(b)
        b.onmousedown = e => {
            e.preventDefault()
        }
        b.onclick = e => {
            e.preventDefault()
            e.stopImmediatePropagation()
            const textarea = document.querySelector("textarea#message_body")
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
            textarea.setSelectionRange(cursor + text.length, cursor + text.length)
        }
    })

    const liSettings = document.createElement("li")
    liSettings.classList.add("nav-item")
    liSettings.style.marginLeft = "auto"
    buttonsWrapper.appendChild(liSettings)
    const bSettings = document.createElement("button")
    bSettings.classList.add("comment-template", "nav-link", "bi", "bi-gear")
    bSettings.style.color = "revert"
    bSettings.onclick = e => {
        e.preventDefault()
        GM_config.open()
    }
    liSettings.appendChild(bSettings)
}

//</editor-fold>
