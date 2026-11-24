function registerOverpassSearchStyles() {
    registerOSMStyle(
        "overpass-search-dialog",
        () => `
        #better-osm-overpass-search {
            position: fixed;
            z-index: 9999;
            top: 5vh;
            left: 0;
            right: 0;
            margin: 0 auto;
            box-sizing: border-box;
            width: min(800px, calc(100% - 24px));
            max-height: 90vh;
            overflow: auto;
            padding: 8px 20px 20px;
            border: 1px solid var(--bs-border-color, #ccc);
            border-radius: 8px;
            background: var(--bs-body-bg, white);
            color: var(--bs-body-color, black);
            box-shadow: 0 8px 24px rgba(0, 0, 0, .25);
        }
        #better-osm-overpass-search form { display: grid; gap: 12px; }
        #better-osm-overpass-search p { margin: 0; }
        #better-osm-overpass-search .overpass-help { color: var(--bs-secondary-color, #6c757d); }
        #better-osm-overpass-search .overpass-heading { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        #better-osm-overpass-search .overpass-close { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; padding: 0; font-size: 1.5rem; line-height: 1; }
        #better-osm-overpass-search .overpass-examples { display: flex; flex-wrap: wrap; gap: 6px; }
        #better-osm-overpass-search .overpass-example { font-family: monospace; }
        #better-osm-overpass-search .overpass-field { display: grid; gap: 4px; }
        #better-osm-overpass-search .overpass-date { width: auto; max-width: 100%; }
        #better-osm-overpass-search textarea { box-sizing: border-box; max-height: 40vh; resize: vertical; font-family: monospace; }
        #better-osm-overpass-search .overpass-preview { position: relative; min-width: 0; }
        #better-osm-overpass-search .overpass-edit-query { position: absolute; top: 4px; right: 4px; padding: 4px; line-height: 1; }
        #better-osm-overpass-search .overpass-edit-query svg { width: 18px; height: 18px; }
        #better-osm-overpass-search pre {
            margin: 0;
            padding: 8px 36px 8px 8px;
            max-height: 180px;
            overflow: auto;
            white-space: pre-wrap;
            overflow-wrap: anywhere;
            background: var(--bs-tertiary-bg, #f3f3f3);
            color: inherit;
            border-radius: 4px;
        }
    `,
    )
}

async function showOverpassSearchDialog() {
    if (document.querySelector("#better-osm-overpass-search")) return
    const previousFocus = document.activeElement
    const lastQuery = await GM.getValue("lastOverpassQuery", "")
    let rawQuery = await GM.getValue("lastOverpassQueryIsRaw", false)
    if (document.querySelector("#better-osm-overpass-search")) return

    const dialog = document.createElement("dialog")
    dialog.id = "better-osm-overpass-search"
    dialog.setAttribute("aria-label", t("overpassSearch.title"))
    const form = document.createElement("form")

    const heading = document.createElement("div")
    heading.className = "overpass-heading"
    const examplesLabel = document.createElement("p")
    examplesLabel.textContent = t("overpassSearch.examples")
    const cancel = document.createElement("button")
    cancel.type = "button"
    cancel.className = "btn overpass-close"
    cancel.setAttribute("aria-label", t("overpassSearch.cancel"))
    cancel.title = t("overpassSearch.cancel")
    cancel.textContent = "×"
    cancel.addEventListener("click", () => dialog.close())
    heading.append(examplesLabel, cancel)
    const examples = document.createElement("div")
    examples.className = "overpass-examples"
    const currentUser = getCurrentUser()
    const exampleQueries = ["key", "panoramax|mapillary|wikimedia_commons", "key=value", "key~val,i", "~key1|key2"]
    if (currentUser) {
        exampleQueries.push(currentUser.match(/^[a-zA-Z0-9_]+$/) ? `node(user:${currentUser})` : `node(user:"${currentUser}")`)
    }
    exampleQueries.push("way[footway=crossing](if: length() > 150)")

    const inputLabel = document.createElement("label")
    inputLabel.className = "overpass-field"
    const inputCaption = document.createElement("span")
    inputCaption.textContent = t("overpassSearch.selector")
    const input = document.createElement("textarea")
    input.rows = 1
    input.required = true
    input.value = lastQuery
    inputLabel.append(inputCaption, input)
    for (const example of exampleQueries) {
        const button = document.createElement("button")
        button.type = "button"
        button.className = "btn btn-sm btn-outline-secondary overpass-example"
        button.textContent = example
        button.addEventListener("click", () => {
            rawQuery = false
            input.value = example
            resizeInput()
            updatePreview()
            input.focus()
        })
        examples.append(button)
    }

    const help = document.createElement("p")
    help.className = "overpass-help"
    help.textContent = t("overpassSearch.help")
    const hideObjectsHelp = document.createElement("p")
    hideObjectsHelp.className = "overpass-help"
    hideObjectsHelp.textContent = t("overpassSearch.hideObjectsHelp")
    const date = document.createElement("input")
    date.type = "date"
    date.className = "overpass-date"
    date.setAttribute("aria-label", t("overpassSearch.snapshotDate"))
    date.title = t("overpassSearch.snapshotDate")
    examples.append(date)

    const previewLabel = document.createElement("div")
    previewLabel.className = "overpass-field"
    const previewCaption = document.createElement("span")
    previewCaption.textContent = t("overpassSearch.preview")
    const previewContainer = document.createElement("div")
    previewContainer.className = "overpass-preview"
    const preview = document.createElement("pre")
    const editQuery = document.createElement("button")
    editQuery.type = "button"
    editQuery.className = "btn overpass-edit-query"
    editQuery.title = t("overpassSearch.editQuery")
    editQuery.setAttribute("aria-label", t("overpassSearch.editQuery"))
    insertSvg(editQuery, "pencilLink")
    editQuery.addEventListener("click", () => {
        input.value = preview.textContent.replace(/\n$/, "")
        rawQuery = true
        resizeInput()
        updatePreview()
        input.focus()
        const secondLineEnd = input.value.indexOf("\n", input.value.indexOf("\n") + 1)
        const cursorPosition = secondLineEnd === -1 ? input.value.length : secondLineEnd
        input.setSelectionRange(cursorPosition, cursorPosition)
    })
    previewContainer.append(preview, editQuery)
    previewLabel.append(previewCaption, previewContainer)
    const editingQueryHelp = document.createElement("p")
    editingQueryHelp.className = "overpass-help"
    editingQueryHelp.textContent = t("overpassSearch.editingQuery")
    function updatePreview() {
        date.disabled = rawQuery
        editingQueryHelp.hidden = !rawQuery
        preview.textContent = buildOverpassSearchQuery(input.value, getMap().getBounds(), date.value, rawQuery)
    }
    function resizeInput() {
        input.style.height = "auto"
        input.style.height = `${input.scrollHeight + input.offsetHeight - input.clientHeight}px`
    }
    input.addEventListener("input", () => {
        if (!input.value.trim()) rawQuery = false
        resizeInput()
        updatePreview()
    })
    input.addEventListener("keydown", event => {
        if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
            event.preventDefault()
            form.requestSubmit()
        }
    })
    date.addEventListener("input", updatePreview)
    date.addEventListener("change", updatePreview)
    const map = getMap()
    const updatePreviewOnMove = intoPageWithFun(updatePreview)
    map.on("move", updatePreviewOnMove)

    const submit = document.createElement("button")
    submit.type = "submit"
    submit.className = "btn btn-primary"
    submit.textContent = t("overpassSearch.search")
    form.append(heading, examples, inputLabel, help, editingQueryHelp, previewLabel, submit, hideObjectsHelp)
    dialog.append(form)
    dialog.addEventListener("keydown", event => {
        event.stopPropagation()
        if (event.key === "Escape") {
            event.preventDefault()
            dialog.close()
        }
    })
    dialog.addEventListener("close", () => {
        map.off("move", updatePreviewOnMove)
        dialog.remove()
        previousFocus?.focus?.()
    })
    form.addEventListener("submit", event => {
        event.preventDefault()
        const query = input.value.trim()
        if (!query) return
        const snapshotDate = date.value
        dialog.close()
        insertOverlaysStyles()
        void processOverpassQuery(query, snapshotDate, rawQuery)
    })
    document.body.append(dialog)
    updatePreview()
    dialog.show()
    resizeInput()
    input.focus()
}
