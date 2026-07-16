//<editor-fold desc="init-config" defaultstate="collapsed">

function makeRow(label, text, without_delete = false, placeholder = "comment that will be added when clicked") {
    const tr = document.createElement("tr")
    const th = document.createElement("th")
    const td = document.createElement("td")
    const td2 = document.createElement("td")

    th.setAttribute("contenteditable", "true")
    td.setAttribute("contenteditable", "true")

    th.textContent = label
    td.textContent = text
    td.style.paddingLeft = "4px"
    td.style.paddingRight = "4px"
    td.style.wordWrap = "anywhere"
    td.setAttribute("placeholder", placeholder)

    td2.textContent = "×"
    td2.title = t("actions.remove")
    td2.style.width = "21px"
    td2.style.cursor = "pointer"
    td2.style.textAlign = "center"
    td2.onclick = () => {
        if ((label === "" && text === "") || confirm(`Remove "${label}"?`)) {
            tr.remove()
        }
    }

    th.style.width = "30px"
    th.appendChild(document.createElement("br"))

    tr.appendChild(th)
    tr.appendChild(td)
    if (!without_delete) {
        tr.appendChild(td2)
    }
    return tr
}

function parseColorPaletteSetting(value) {
    if (!value || value.trim() === "") {
        return { enabled: false, colors: {} }
    }
    try {
        return JSON.parse(value)
    } catch (e) {
        console.log(e)
    }
    return { enabled: false, colors: {} }
}

function makeColorPalettePreview(value, title) {
    const preview = document.createElement("span")
    const fill = document.createElement("span")

    preview.className = "color-palette-preview"
    preview.title = title
    fill.className = "color-palette-preview-fill"
    fill.style.backgroundColor = value
    if (value === "" || fill.style.backgroundColor === "") {
        preview.classList.add("color-palette-preview-empty")
        preview.textContent = "?"
    } else {
        preview.appendChild(fill)
    }
    return preview
}

function colorToHexForInput(value) {
    const colorProbe = document.createElement("span")

    colorProbe.style.color = value
    if (value === "" || colorProbe.style.color === "") {
        return null
    }

    document.documentElement.appendChild(colorProbe)
    const computedColor = getComputedStyle(colorProbe).color
    colorProbe.remove()

    const rgb = computedColor.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    if (!rgb) {
        return null
    }

    return rgb
        .slice(1, 4)
        .map(channel => Number(channel).toString(16).padStart(2, "0"))
        .join("")
        .replace(/^/, "#")
}

function updateColorPalettePreview(row) {
    const valueCell = row.querySelector(".color-palette-value")
    const previewCell = row.querySelector(".color-palette-new-preview")
    const picker = row.querySelector(".color-palette-picker")
    const value = valueCell.textContent.trim() || row.dataset.defaultValue

    previewCell.replaceChildren(...[makeColorPalettePreview(value, `Choose new color. Current value: ${value}`), picker].filter(Boolean))
}

function setColorPaletteValue(row, value) {
    row.querySelector(".color-palette-value").textContent = value
    updateColorPalettePreview(row)
}

function selectColorPaletteColor(row) {
    const valueCell = row.querySelector(".color-palette-value")
    const currentValue = valueCell.textContent.trim()
    const picker = row.querySelector(".color-palette-picker")

    picker.value = colorToHexForInput(currentValue) ?? colorToHexForInput(row.dataset.defaultValue) ?? "#000000"
    picker.click()
}

function makeColorPaletteKey(value) {
    const fragment = document.createDocumentFragment()
    let chunk = ""

    Array.from(value).forEach((char, index, chars) => {
        const prev = chars[index - 1]
        const next = chars[index + 1]
        const isDecimalPoint = char === "." && /\d/.test(prev) && /\d/.test(next)

        if (char === "." && !isDecimalPoint) {
            fragment.appendChild(document.createTextNode(chunk))
            fragment.appendChild(document.createElement("br"))
            chunk = "."
            return
        }
        chunk += char
    })
    fragment.appendChild(document.createTextNode(chunk))

    return fragment
}

function makeColorPaletteRow(key, defaultValue, colorblindValue, value) {
    const tr = document.createElement("tr")
    const sourcePreview = document.createElement("td")
    const sourceName = document.createElement("td")
    const newPreview = document.createElement("td")
    const newValue = document.createElement("td")
    const colorPicker = document.createElement("input")

    tr.dataset.colorPaletteKey = key
    tr.dataset.defaultValue = defaultValue
    if (colorblindValue) {
        tr.dataset.colorblindValue = colorblindValue
    }

    sourcePreview.className = "color-palette-source-preview"
    sourcePreview.title = defaultValue ? `Use original color: ${defaultValue}` : "No original color"
    sourcePreview.onclick = () => {
        if (defaultValue) {
            setColorPaletteValue(tr, defaultValue)
        }
    }
    sourcePreview.appendChild(makeColorPalettePreview(defaultValue, sourcePreview.title))

    sourceName.className = "color-palette-source-name"
    sourceName.title = key
    sourceName.appendChild(makeColorPaletteKey(key))

    newPreview.className = "color-palette-new-preview"
    newPreview.onclick = () => selectColorPaletteColor(tr)

    newValue.className = "color-palette-value"
    newValue.textContent = value
    newValue.spellcheck = false
    newValue.setAttribute("contenteditable", "true")
    newValue.oninput = () => updateColorPalettePreview(tr)

    colorPicker.className = "color-palette-picker"
    colorPicker.type = "color"
    colorPicker.onclick = event => event.stopPropagation()
    colorPicker.oninput = colorPicker.onchange = () => {
        setColorPaletteValue(tr, colorPicker.value)
    }
    newPreview.appendChild(colorPicker)

    tr.appendChild(sourcePreview)
    tr.appendChild(sourceName)
    tr.appendChild(newPreview)
    tr.appendChild(newValue)
    updateColorPalettePreview(tr)

    return tr
}

function fillColorPaletteTable(tbody, overrides) {
    const renderedKeys = new Set()

    Object.entries(defaultColorsPalette).forEach(([key, defaultValue]) => {
        renderedKeys.add(key)
        tbody.appendChild(makeColorPaletteRow(key, defaultValue, colorblindFriendlyPalette[key], overrides[key] ?? defaultValue))
    })
    Object.entries(overrides).forEach(([key, value]) => {
        if (!renderedKeys.has(key)) {
            tbody.appendChild(makeColorPaletteRow(key, "", colorblindFriendlyPalette[key], value))
        }
    })
}

function getColorPaletteColors(wrapper, exportDefaultColors = false) {
    const colors = {}

    for (let row of wrapper.querySelectorAll("tr[data-color-palette-key]")) {
        const key = row.dataset.colorPaletteKey
        const defaultValue = row.dataset.defaultValue
        const value = row.querySelector(".color-palette-value").textContent.trim()
        if (value !== "" && (exportDefaultColors || value !== defaultValue)) {
            colors[key] = value
        }
    }

    return colors
}

const copyAnimationStyles = `
    .copied {
      background-color: rgba(9,238,9,0.6);
      transition:all 0.3s;
    }
    .was-copied {
      background-color: initial;
      transition:all 0.3s;
    }
    @media ${mediaQueryForWebsiteTheme} {
        .copied {
          background-color: rgba(0,255,101,0.6);
          transition: all 0.3s;
        }
        .was-copied {
          background-color: initial;
          transition: all 0.3s;
        }
    }
`
const configOptions = {
    id: "Config",
    title: " ",
    fields: {
        DarkModeForMap: {
            label: t("config.darkModeForMap"),
            type: "checkbox",
            default: false,
            labelPos: "right",
        },
        ColorblindFriendlyPalette: {
            label: t("config.colorblindFriendlyPalette"),
            type: "checkbox",
            default: false,
            labelPos: "right",
        },
        ColorPalette: {
            label: t("config.customPalette"),
            type: "colors",
            default: "{enabled: false, colors: {}}",
        },
        BetterTagsPaste: {
            section: [t("config.sectionID")],
            label: t("config.betterTagsPaste"),
            type: "checkbox",
            default: "checked",
            labelPos: "right",
        },
        DarkModeForID: {
            label: t("config.darkModeForID"),
            type: "checkbox",
            default: false,
            labelPos: "right",
        },
        CompactChangesetsHistory: {
            section: [t("config.sectionViewingEdits")],
            label: t("config.compactChangesetsHistory"),
            type: "checkbox",
            default: "checked",
            labelPos: "right",
        },
        VersionsDiff: {
            label: t("config.versionsDiff"),
            type: "checkbox",
            default: "checked",
            labelPos: "right",
        },
        ShowPreviousTagValue: {
            label: t("config.showPreviousTagValue"),
            type: "checkbox",
            default: "checked",
            labelPos: "right",
        },
        FullVersionsDiff: {
            label: t("config.fullVersionsDiff"),
            type: "checkbox",
            default: "checked",
            labelPos: "right",
        },
        ChangesetQuickLook: {
            label: t("config.changesetQuickLook"),
            type: "checkbox",
            default: "checked",
            labelPos: "right",
        },
        ShowChangesetGeometry: {
            label: t("config.showChangesetGeometry"),
            type: "checkbox",
            default: "checked",
            labelPos: "right",
        },
        MassChangesetsActions: {
            label: t("config.massChangesetsActions"),
            type: "checkbox",
            default: "checked",
            labelPos: "right",
        },
        ImagesAndLinksInTags: {
            label: t("config.imagesAndLinksInTags"),
            type: "checkbox",
            default: "checked",
            labelPos: "right",
        },
        HideNoteHighlight: {
            section: [t("config.sectionWorkingWithNotes")],
            label: t("config.hideNoteHighlight"),
            type: "checkbox",
            default: "checked",
            labelPos: "right",
        },
        ResolveNotesButton: {
            label: t("config.resolveNotesButton"),
            type: "menu",
            default: '[{"label": "👌", "text": ""}]',
        },
        RevertButton: {
            section: [t("config.sectionNewActions")],
            label: t("config.revertButton"),
            type: "checkbox",
            default: "checked",
            labelPos: "right",
        },
        Deletor: {
            label: t("config.deletor"),
            type: "checkbox",
            default: "checked",
            labelPos: "right",
        },
        OneClickDeletor: {
            label: t("config.oneClickDeletor"),
            type: "checkbox",
            default: false,
            labelPos: "right",
        },
        ChangesetsTemplates: {
            label: t("config.changesetsTemplates"),
            type: "menu",
            default: '[{"label": "👋", "text": ""}]',
        },
        HDYCInProfile: {
            section: [t("config.sectionOther")],
            label: t("config.hdycInProfile"),
            type: "checkbox",
            default: "checked",
            labelPos: "right",
        },
        BetterProfileStat: {
            label: t("config.betterProfileStat"),
            type: "checkbox",
            default: "checked",
            labelPos: "right",
        },
        NavigationViaHotkeys: {
            label: t("config.navigationViaHotkeys"), // add help button with list
            type: "checkbox",
            default: "checked",
            labelPos: "right",
        },
        NewEditorsLinks: {
            label: t("config.newEditorsLinks"),
            type: "checkbox",
            default: "checked",
            labelPos: "right",
        },
        ResetSearchFormFocus: {
            label: t("config.resetSearchFormFocus"),
            type: "checkbox",
            default: "checked",
            labelPos: "right",
        },
        SatelliteLayers: {
            label: t("config.satelliteLayers"),
            type: "checkbox",
            default: "checked",
            labelPos: "right",
        },
        Swipes: {
            label: t("config.swipes"),
            type: "checkbox",
            default: false,
            labelPos: "right",
        },
        ResizableSidebar: {
            label: t("config.resizableSidebar"),
            type: "checkbox",
            default: "checked",
            labelPos: "right",
        },
        ClickableAvatar: {
            label: t("config.clickableAvatar"),
            type: "checkbox",
            default: "checked",
            labelPos: "right",
        },
        OverzoomForDataLayer: {
            label: t("config.overzoomForDataLayer"),
            type: "checkbox",
            default: false,
            labelPos: "right",
        },
        DragAndDropViewers: {
            label: t("config.dragAndDropViewers"),
            type: "checkbox",
            default: "checked",
            labelPos: "right",
        },
        "3DViewerInNewTab": {
            label: t("config.viewer3DInNewTab"),
            type: "checkbox",
            default: "checked",
            labelPos: "right",
        },
        BetterTaginfo: {
            label: t("config.betterTaginfo"),
            type: "checkbox",
            default: "checked",
            labelPos: "right",
        },
        DefaultZoomKeysBehaviour: {
            label: t("config.defaultZoomKeysBehaviour"),
            type: "checkbox",
            default: false,
            labelPos: "right",
        },
        AddLocationFromNominatim: {
            label: t("config.addLocationFromNominatim"),
            type: "checkbox",
            default: "checked",
            labelPos: "right",
        },
        OverpassInstance: {
            label: t("config.overpassInstance"),
            labelPos: "left",
            type: "select",
            options: [MAIN_OVERPASS_INSTANCE.name, MAILRU_OVERPASS_INSTANCE.name, PRIVATECOFFEE_OVERPASS_INSTANCE.name],
        },
        // CustomOverpassInstance: {
        //     label: 'Custom Overpass API</a>',
        //     labelPos: "left",
        //     type: "input",
        // },
        PanoramaxUploader: {
            label: t("config.panoramaxUploader"),
            type: "checkbox",
            default: false,
            labelPos: "right",
        },
        RoutersTimestamps: {
            label: t("config.routersTimestamps"),
            type: "checkbox",
            default: true,
            labelPos: "right",
        },
        ClickableMap: {
            label: t("config.clickableMap"),
            type: "checkbox",
            default: false,
            labelPos: "right",
        },
        DebugMode: {
            label: t("config.debugMode"),
            type: "checkbox",
            default: false,
            labelPos: "right",
        },
    },
    types: {
        menu: {
            default: "",
            toNode: function () {
                const templates = /** @type {string} */ (this.value || this.settings.default)
                const settingNode = this.create("div", {
                    className: "config_var",
                    id: this.configId + "_" + this.id + "_var",
                })

                this.templates = templates

                settingNode.appendChild(
                    this.create("input", {
                        innerHTML: this.settings.label,
                        id: this.configId + "_" + this.id + "_field_filler",
                        className: "filler",
                        type: "checkbox",
                    }),
                )

                const label = this.create("label", {
                    innerHTML: this.settings.label,
                    id: this.configId + "_" + this.id + "_field_label",
                    for: this.configId + "_field_" + this.id,
                    className: "field_label",
                })
                if (label.querySelector("#last-comments-link")) {
                    const userId = document.querySelector("head")?.getAttribute("data-user")
                    if (userId) {
                        label
                            .querySelector("#last-comments-link")
                            .setAttribute("href", `https://resultmaps.neis-one.org/osm-discussion-comments?uid=${userId}&commented`)
                    } else {
                        label.querySelector("#last-comments-link").remove()
                    }
                }
                settingNode.appendChild(label)

                const table = document.createElement("table")
                table.setAttribute("cellspacing", "0")
                table.setAttribute("cellpadding", "0")
                table.style.width = "100%"
                settingNode.appendChild(table)
                const tbody = document.createElement("tbody")
                table.appendChild(tbody)

                const placeholder = this.settings.placeholder ?? "comment that will be added when clicked"
                JSON.parse(templates).forEach(row => {
                    tbody.appendChild(makeRow(row["label"], row["text"], false, placeholder))
                })

                const tr = document.createElement("tr")
                tr.classList.add("add-tag-row")
                tbody.appendChild(tr)
                const th = document.createElement("th")
                th.textContent = "+"
                th.colSpan = 3
                th.style.textAlign = "center"
                th.style.cursor = "pointer"
                tr.appendChild(th)
                th.onclick = () => {
                    tbody.lastElementChild.before(makeRow("", ""))
                }

                return settingNode
            },
            toValue: function () {
                const templates = []
                if (this.wrapper) {
                    for (let row of Array.from(this.wrapper.getElementsByTagName("tr")).slice(0, -1)) {
                        const forPush = {
                            label: row.querySelector("th").textContent,
                            text: row.querySelector("td").textContent,
                        }
                        if (!(forPush.label.trim() === "" && forPush.text.trim() === "")) {
                            templates.push(forPush)
                        }
                    }
                }
                return JSON.stringify(templates)
            },
            reset: function () {
                if (this.wrapper) {
                    for (let row of Array.from(this.wrapper.getElementsByTagName("tr")).slice(0, -1)) {
                        row.remove()
                    }
                    JSON.parse(/** @type {string} */ (this.settings.default)).forEach(i => {
                        this.wrapper
                            .querySelector(`#${this.configId}_${this.id}_var table`)
                            .lastElementChild.before(makeRow(i["label"], i["text"]))
                    })
                }
            },
        },
        colors: {
            default: "{enabled: false, colors: {}}",
            toNode: function () {
                const { enabled, colors } = parseColorPaletteSetting(/** @type {string} */ (this.value || this.settings.default))
                const settingNode = this.create("div", {
                    className: "config_var",
                    id: this.configId + "_" + this.id + "_var",
                })

                this.templates = colors

                settingNode.appendChild(
                    this.create("input", {
                        innerHTML: this.settings.label,
                        id: this.configId + "_" + this.id + "_field",
                        className: "color-palette-enabled",
                        type: "checkbox",
                        checked: enabled,
                    }),
                )

                const label = this.create("label", {
                    innerHTML: this.settings.label,
                    id: this.configId + "_" + this.id + "_field_label",
                    for: this.configId + "_" + this.id + "_field",
                    className: "field_label",
                })
                settingNode.appendChild(label)

                const details = document.createElement("details")
                details.className = "color-palette-details"
                settingNode.appendChild(details)

                const importDefaultPalette = this.create("button", {
                    id: "ImportDefaultPalette",
                    className: "color-palette-action",
                    textContent: t("config.importDefaultPalette"),
                })
                importDefaultPalette.onclick = () => {
                    table.querySelectorAll("#Config_ColorPalette_var tr[data-color-palette-key]").forEach(row => {
                        setColorPaletteValue(row, row.dataset.defaultValue)
                    })
                }
                details.appendChild(importDefaultPalette)

                const importColorblindPalette = this.create("button", {
                    id: "ImportColorblindFriendlyPalette",
                    className: "color-palette-action",
                    textContent: t("config.importColorblindPalette"),
                })
                importColorblindPalette.onclick = () => {
                    table.querySelectorAll("#Config_ColorPalette_var tr[data-color-palette-key]").forEach(row => {
                        if (row.dataset.colorblindValue) {
                            setColorPaletteValue(row, row.dataset.colorblindValue)
                        }
                    })
                }
                details.appendChild(importColorblindPalette)

                const importPalette = this.create("button", {
                    id: "ImportColorPalette",
                    className: "color-palette-action",
                    textContent: t("config.importPaletteFromClipboard"),
                })
                importPalette.onclick = async event => {
                    try {
                        const colors = JSON.parse(await navigator.clipboard.readText())
                        const tbody1 = settingNode.querySelector(".color-palette-table tbody")

                        tbody1.replaceChildren()
                        fillColorPaletteTable(tbody1, colors)
                        copyAnimation(event, "palette JSON")
                    } catch (e) {
                        alert(`Failed to import palette: ${e.message}`)
                    }
                }
                details.appendChild(importPalette)

                const exportPalette = this.create("button", {
                    id: "ExportColorPalette",
                    className: "color-palette-action",
                    textContent: t("config.exportPaletteIntoClipboard"),
                })
                exportPalette.onclick = async event => {
                    const json = JSON.stringify(getColorPaletteColors(settingNode, true), null, 2)
                    try {
                        await navigator.clipboard.writeText(json)
                        copyAnimation(event, "palette JSON")
                    } catch (e) {
                        alert(`Failed to export palette: ${e.message}`)
                    }
                }
                details.appendChild(exportPalette)

                /*                const reloadSidebar = this.create("button", {
                    id: "ImportColorblindFriendlyPalette",
                    textContent: "🔄",
                })
                reloadSidebar.onclick = () => {
                    GM_config.save()
                    const cur = location.pathname
                    getWindow().OSM.router.route("/")
                    getWindow().OSM.router.route(cur)
                }
                details.appendChild(reloadSidebar)*/

                const summary = document.createElement("summary")
                summary.textContent = t("config.customizePalette")
                details.appendChild(summary)

                const table = document.createElement("table")
                table.className = "color-palette-table"
                table.setAttribute("cellspacing", "0")
                table.setAttribute("cellpadding", "0")
                table.style.width = "100%"
                details.appendChild(table)

                const thead = document.createElement("thead")
                table.appendChild(thead)
                const headRow = document.createElement("tr")
                thead.appendChild(headRow)
                ;["Original", "New"].forEach(headerText => {
                    const th = document.createElement("th")
                    th.colSpan = 2
                    th.textContent = headerText
                    headRow.appendChild(th)
                })

                const tbody = document.createElement("tbody")
                table.appendChild(tbody)
                fillColorPaletteTable(tbody, colors)

                return settingNode
            },
            toValue: function () {
                if (this.wrapper) {
                    return JSON.stringify({
                        enabled: this.wrapper.querySelector(".color-palette-enabled").checked,
                        colors: getColorPaletteColors(this.wrapper),
                    })
                }
                return JSON.stringify({ enabled: false, colors: {} })
            },
            reset: function () {
                if (this.wrapper) {
                    const enabledInput = this.wrapper.querySelector(".color-palette-enabled")
                    const tbody = this.wrapper.querySelector(".color-palette-table tbody")

                    enabledInput.checked = parseColorPaletteSetting(/** @type {string} */ (this.settings.default)).enabled
                    tbody.replaceChildren()
                    fillColorPaletteTable(tbody, parseColorPaletteSetting(/** @type {string} */ (this.settings.default)).colors)
                }
            },
        },
    },
    frameStyle: `
            border: 1px solid #000;
            height: min(85%, 760px);
            width: min(max(25%, 400px), 100vw);
            z-index: 9999;
            opacity: 0;
            position: absolute;
            margin-left: auto;
            margin-right: auto;
        `,
    css: `
            .config_var:has(input[type=checkbox]:not(.filler)) {
                display: flex;
            }
            .config_var:has(details) {
                flex-wrap: wrap;
            }
            .config_var > details {
                flex: 0 0 100%;
                margin-top: 4px;
            } 
            summary {
                font-size: 12px;
                font-weight: bold;
                margin-left: 10px;
            }
            input[type=checkbox]:not(.filler) + .field_label {
                display: flex;
                align-items: anchor-center;
            }

            #Config .field_label {
                font-size: ${isMobile ? "15px" : "13px"};
            }
            
            #Config_saveBtn, #Config_closeBtn, #Config .color-palette-action {
                cursor: pointer;
                margin-right: 4px;
                margin-bottom: 4px;
            }
            #Config_field_ResolveNotesButton {
                width: 100%;
                max-width: 100%;
            }
            #Config_field_ColorPalette {
                width: 100%;
            }
            #Config .color-palette-table th {
                padding: 3px 5px;
                text-align: left;
            }
            #Config .color-palette-table td {
                padding: 2px 5px;
            }
            #Config .color-palette-table .color-palette-source-preview,
            #Config .color-palette-table .color-palette-new-preview {
                padding: 0;
            }
            #Config .color-palette-source-preview,
            #Config .color-palette-new-preview {
                text-align: center;
            }
            #Config .color-palette-source-preview,
            #Config .color-palette-new-preview {
                cursor: pointer;
            }
            #Config .color-palette-picker {
                height: 1px;
                opacity: 0;
                padding: 0;
                position: absolute;
                width: 1px;
            }
            #Config .color-palette-source-name,
            #Config .color-palette-value {
                word-break: break-word;
                overflow-wrap: anywhere;
            }
            #Config .color-palette-source-name {
                font-family: monospace;
                font-size: 12px;
            }
            #Config .color-palette-value {
                cursor: text;
                font-family: monospace;
                font-size: 12px;
                min-width: 120px;
            }
            #Config .color-palette-preview {
                background-image:
                    linear-gradient(45deg, #bbb 25%, transparent 25%),
                    linear-gradient(-45deg, #bbb 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, #bbb 75%),
                    linear-gradient(-45deg, transparent 75%, #bbb 75%);
                background-position: 0 0, 0 6px, 6px -6px, -6px 0;
                background-size: 12px 12px;
                box-sizing: border-box;
                display: inline-block;
                height: 20px;
                line-height: 16px;
                overflow: hidden;
                position: relative;
                text-align: center;
                vertical-align: middle;
                width: 20px;
            }
            #Config .color-palette-preview-fill {
                bottom: 0;
                display: block;
                left: 0;
                position: absolute;
                right: 0;
                top: 0;
            }
            #Config .color-palette-preview-empty {
                background-color: transparent;
                color: #555;
                font-family: monospace;
                font-size: 12px;
            }
            summary {
                cursor: pointer;
            }
            #Config_ColorPalette_field:not(:checked) ~ details {
                display: none;
            }
            .config_var:has(select) {
                display: flex;
            }
            .config_var:has(table) {
                display: flex;
                flex-wrap: wrap;
            }
            #Config table {
                border-collapse: collapse;
                flex: 0 0 100%;
            }
            th, td {
                border: 1px solid black;
                min-height: 21px;
            }
            #Config [placeholder]:empty::before {
                content: attr(placeholder);
                color: #555;
            }

            #Config [placeholder]:empty:focus::before {
                content: "";
            }

            #Config .filler {
                visibility: hidden;
            }
            #export_import_wrapper {
                margin-top: 10px;
                position: absolute;
                left: 12px;
                text-align: left;
                gap: 4px;
                display: flex;
                flex-wrap: wrap;
            }
            #export_settings, #import_settings {
                cursor: pointer;
                color: gray;
                font-size: small;
                flex: 0 100%;
            }
            #version {
                position: absolute;
                left: 12;
                font-size: small;
            }
            #Config_OverpassInstance_field_label {
                align-self: center;
            }
        @media ${mediaQueryForWebsiteTheme} {
            #Config {
                background: #232528;
                color: white;
            }
            #Config a {
                color: darkgray;
            }
            #Config_field_OverpassInstance {
                filter: invert(0.9);
            }
            #Config_saveBtn, #Config_closeBtn, #Config .color-palette-action {
                filter: invert(0.9);
            }
            #Config_resetLink {
                color: gray !important;
            }
            #Config textarea {
                background: #232528;
                color: white;
                background: rgb(31, 32, 35);
                border: 1px solid rgb(60, 63, 68);
                border-radius: 4px;
                font-size: 13px;
                color: rgb(247, 248, 248);
                appearance: none;
            }
            #Config input:focus-visible {
                outline-style: none;
            }
            th, td {
                border-color: white;
            }
            #version {
                color: gray !important;
            }
        }
        ${copyAnimationStyles}
        `,
    events: {
        init: main,
        save: function () {
            GM_config.close()
        },
        open: function (doc) {
            const versionSection = document.createElement("span")
            versionSection.id = "version"
            versionSection.textContent = t("init.scriptVersion")
            const version = document.createElement("span")
            version.textContent = GM_info.script.version
            version.title = t("copying.clickForCopy")
            version.style.cursor = "pointer"
            version.onclick = e => {
                navigator.clipboard.writeText(GM_info.script.version).then(() => copyAnimation(e, GM_info.script.version))
            }
            versionSection.appendChild(version)
            doc.querySelector(".reset_holder").prepend(versionSection)

            const wrapper = document.createElement("span")
            wrapper.id = "export_import_wrapper"

            const exportBtn = document.createElement("span")
            exportBtn.id = "export_settings"
            exportBtn.textContent = t("config.exportSettings")
            exportBtn.title = t("config.exportSettingsTitle")
            exportBtn.onclick = async event => {
                const json = JSON.stringify(
                    Object.fromEntries(Object.entries(GM_config.fields).map(([id]) => [id, GM_config.get(id)])),
                    null,
                    2,
                )
                try {
                    await navigator.clipboard.writeText(json)
                    copyAnimation(event, json)
                } catch (e) {
                    alert(`Failed to export settings: ${e.message}`)
                }
            }

            const importBtn = document.createElement("span")
            importBtn.id = "import_settings"
            importBtn.textContent = t("config.importSettings")
            importBtn.title = t("config.importSettingsTitle")
            importBtn.onclick = async () => {
                const text = await navigator.clipboard.readText()
                try {
                    const settings = JSON.parse(text)
                    if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
                        throw new Error("Settings JSON must be an object")
                    }
                    for (const [id, value] of Object.entries(settings)) {
                        if (GM_config.fields[id]) {
                            GM_config.set(id, value)
                        }
                    }
                    GM_config.close()
                    GM_config.open()
                } catch (e) {
                    alert(`Failed to import settings: ${e.message}\nText: ${text}`)
                }
            }

            wrapper.appendChild(exportBtn)
            wrapper.appendChild(importBtn)
            doc.querySelector("#Config_buttons_holder").prepend(wrapper)
        },
    },
}

GM_config.init(configOptions)
//</editor-fold>
