//<editor-fold desc="notes-autocomplete" defaultstate="collapsed">

const noteHashtags = [
    "#added",
    "#fixed",
    "#irrelevant",
    "#alreadyfixed",
    "#needmoreinfo",
    "#surveyme",
    "#tooold",
    "#notonortophoto",
    "#notenoughinfo",
    "#inacurratelocation",
    "#needconfirmation",
    "#remindme",
    "#softremindme",
]

function addAutoComplete(ta, container) {
    let anchorPos = null // { left, top }
    let anchorStart = null

    const box = document.createElement("div")
    box.style.position = "absolute"
    box.style.border = "1px solid var(--bs-border-color)"
    box.style.background = "var(--bs-body-bg)"
    box.style.fontSize = "1rem"
    box.style.display = "none"
    box.style.zIndex = 1000
    container.appendChild(box)

    let items = []
    let index = 0
    let match = null

    function findMatch(value, pos) {
        const left = value.slice(0, pos)
        const m = left.match(/(^|\s)(#\w*)$/)
        if (!m) return null
        return { start: pos - m[2].length, text: m[2] }
    }

    function caretCoords(ta, pos, container) {
        const taRect = ta.getBoundingClientRect()
        const cRect = container.getBoundingClientRect()

        const div = document.createElement("div")
        div.style.padding = getComputedStyle(ta).padding

        div.style.position = "absolute"
        div.style.visibility = "hidden"
        div.style.top = taRect.top - cRect.top + container.scrollTop + "px"
        div.style.left = taRect.left - cRect.left + container.scrollLeft + "px"

        div.textContent = ta.value.slice(0, pos)

        const span = document.createElement("span")
        span.textContent = "\u200b"
        div.appendChild(span)

        container.appendChild(div)
        const r = span.getBoundingClientRect()
        container.removeChild(div)

        return {
            left: r.left - cRect.left + container.scrollLeft - ta.scrollLeft,
            top: r.top - cRect.top + container.scrollTop - ta.scrollTop,
            bottom: r.bottom - cRect.top + container.scrollTop - ta.scrollTop,
        }
    }

    function render() {
        box.replaceChildren()
        items.forEach((t, i) => {
            const d = document.createElement("div")
            d.textContent = t
            d.style.padding = "0px 4px"
            d.style.cursor = "pointer"
            if (i === index) {
                d.style.background = "var(--bs-border-color-translucent)"
            }
            d.onmousedown = e => {
                e.preventDefault()
                index = i
                apply()
            }
            box.appendChild(d)
        })
        box.style.display = items.length ? "block" : "none"
    }

    function apply() {
        if (!items.length || !match) {
            return
        }
        ta.value = ta.value.slice(0, match.start) + items[index] + " " + ta.value.slice(match.start + match.text.length)
        box.style.display = "none"
    }

    ta.addEventListener("input", () => {
        const m = findMatch(ta.value, ta.selectionStart)
        if (!m) {
            box.style.display = "none"
            anchorPos = null
            anchorStart = null
            return
        }

        if (anchorStart !== m.start) {
            anchorStart = m.start
            const r = caretCoords(ta, m.start, container)
            anchorPos = { left: r.left - 4, top: r.bottom + 4 }
        }

        box.style.left = anchorPos.left + "px"
        box.style.top = anchorPos.top + "px"

        match = m
        items = noteHashtags.filter(t => t.startsWith(match.text))
        index = 0

        if (!items.length) {
            box.style.display = "none"
            return
        }

        box.style.left = anchorPos.left + "px"
        box.style.top = anchorPos.top + "px"
        render()
    })

    ta.addEventListener("keydown", e => {
        if (box.style.display === "none") {
            return
        }
        if (e.key === "Tab" || e.key === "Enter") {
            e.preventDefault()
            apply()
        } else if (e.key === "ArrowDown") {
            e.preventDefault()
            index = (index + 1) % items.length
            render()
        } else if (e.key === "ArrowUp") {
            e.preventDefault()
            index = (index - 1 + items.length) % items.length
            render()
        } else if (e.key === "Escape") {
            box.style.display = "none"
        }
    })

    ta.addEventListener("blur", () => {
        box.style.display = "none"
    })
}

function addAutoCompleteOnOsmOrg() {
    addAutoComplete(document.querySelector("form.mb-3 .form-control"), document.querySelector("#sidebar"))
}

function addAutoCompleteOnIdEditor() {
    try {
        addAutoComplete(document.querySelector(".note-save.save-section textarea.new-comment-input"), document.querySelector(".sidebar"))
    } catch (e) {
        console.error(e)
    }
}

//</editor-fold>
