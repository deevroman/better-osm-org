//<editor-fold desc="better-tags-paste" defaultstate="collapsed">

function fixTagsPaste() {
    if (!GM_config.get("BetterTagsPaste")) {
        return
    }
    function repairTags(text, context) {
        return text
            .split("\n")
            .map(line => {
                if (line.includes("=") || (!line.includes(" ") && !line.includes("\t"))) {
                    return line
                }
                const [key, value] = line.split(/[ \t](.+)/)
                if (key === undefined || value === undefined) {
                    return line
                }
                if (context === "iD") {
                    return `${key}=${value}`
                } else {
                    return `${key} = ${value}`
                }
            })
            .join("\n")
    }

    document.addEventListener("paste", e => {
        console.log("checking paste event")
        const t = e.target
        if (!(t instanceof HTMLTextAreaElement)) {
            return
        }
        let context
        if (location.pathname === "/id") {
            if (!t.classList.contains("tag-text")) {
                return
            }
            context = "iD"
        } else {
            if (!location.pathname.includes("node") && !location.pathname.includes("way") && !location.pathname.includes("relation")) {
                return
            }
            if (t.getAttribute("rows") !== "10" || t.getAttribute("cols") !== "40") {
                return
            }
            context = "osm.org tags editor"
        }
        const pos = t.selectionStart
        const textBefore = t.value.slice(0, pos)
        const line = textBefore.split(/\r?\n/).pop() ?? ""
        if (line.includes("=") || line.trim() !== "") {
            return
        }
        const raw = e.clipboardData.getData("text")
        const fixedText = repairTags(raw)
        if (raw === fixedText) {
            return
        }
        e.preventDefault()

        function pasteText(text, start, end) {
            let ok = false
            try {
                ok = document.execCommand("insertText", false, text)
            } catch (_) {}
            if (!ok) {
                t.setRangeText(text, start, end, "end")
                const ev = new InputEvent("input", { bubbles: true, cancelable: false, data: text, inputType: "insertFromPaste" })
                t.dispatchEvent(ev)
            }
        }

        // сначала вставляем без изменений,
        t.focus()
        const start = t.selectionStart
        const firstEnd = t.selectionEnd
        t.setSelectionRange(start, firstEnd)
        pasteText(raw, start, firstEnd)
        // потом с, чтобы ctrl + Z мог откатить исправление
        t.setSelectionRange(start, start + raw.length)
        pasteText(fixedText, start, start + raw.length)
    })
}

function setupBetterTagsPaste() {
    fixTagsPaste()
}
//</editor-fold>
