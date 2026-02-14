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
    td2.title = "remove"
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
            label: "Invert map colors in dark mode",
            type: "checkbox",
            default: false,
            labelPos: "right",
        },
        ColorblindFriendlyPalette: {
            label: "Colorblind-friendly palette β",
            type: "checkbox",
            default: false,
            labelPos: "right",
        },
        BetterTagsPaste: {
            section: ["iD"],
            label: "Add = when pasting tags separated by spaces or tabs",
            type: "checkbox",
            default: "checked",
            labelPos: "right",
        },
        DarkModeForID: {
            label: 'Dark mode for iD (<a href="https://userstyles.world/style/15596/openstreetmap-dark-theme" target="_blank">Thanks AlexPS</a>)',
            type: "checkbox",
            default: false,
            labelPos: "right",
        },
        CompactChangesetsHistory: {
            section: ["Viewing edits"],
            label: "Compact changesets history",
            type: "checkbox",
            default: "checked",
            labelPos: "right",
        },
        VersionsDiff: {
            label: "Add tags diff in history",
            type: "checkbox",
            default: "checked",
            labelPos: "right",
        },
        ShowPreviousTagValue: {
            label: "Show previous tag value",
            type: "checkbox",
            default: "checked",
            labelPos: "right",
        },
        FullVersionsDiff: {
            label: "Add diff with intermediate versions in way history",
            type: "checkbox",
            default: "checked",
            labelPos: "right",
        },
        ChangesetQuickLook: {
            label: "Add QuickLook for changesets",
            type: "checkbox",
            default: "checked",
            labelPos: "right",
        },
        ShowChangesetGeometry: {
            label: "Show geometry of objects in changeset",
            type: "checkbox",
            default: "checked",
            labelPos: "right",
        },
        MassChangesetsActions: {
            label: "Add actions for changesets list (mass revert, filtering, ...)",
            type: "checkbox",
            default: "checked",
            labelPos: "right",
        },
        ImagesAndLinksInTags: {
            label: "Make some tags clickable, shorter and display photos",
            type: "checkbox",
            default: "checked",
            labelPos: "right",
        },
        HideNoteHighlight: {
            section: ["Working with notes"],
            label: "Hide note highlight",
            type: "checkbox",
            default: "checked",
            labelPos: "right",
        },
        ResolveNotesButton: {
            label: "Addition resolve buttons:",
            type: "menu",
            default: '[{"label": "👌", "text": ""}]',
        },
        RevertButton: {
            section: ["New actions"],
            label: "Revert&Osmcha changeset button",
            type: "checkbox",
            default: "checked",
            labelPos: "right",
        },
        Deletor: {
            label: "Button for node deletion",
            type: "checkbox",
            default: "checked",
            labelPos: "right",
        },
        OneClickDeletor: {
            label: "Delete node without confirmation",
            type: "checkbox",
            default: false,
            labelPos: "right",
        },
        ChangesetsTemplates: {
            label: 'Changesets comments templates <a id="last-comments-link" target="_blank">(your last comments)</a>',
            type: "menu",
            default: '[{"label": "👋", "text": ""}]',
        },
        HDYCInProfile: {
            section: ["Other"],
            label: "Add HDYC to user profile",
            type: "checkbox",
            default: "checked",
            labelPos: "right",
        },
        BetterProfileStat: {
            label: "Add filters to profile statistics",
            type: "checkbox",
            default: "checked",
            labelPos: "right",
        },
        NavigationViaHotkeys: {
            label: 'Add hotkeys <a href="https://github.com/deevroman/better-osm-org#Hotkeys" target="_blank">(List)</a>', // add help button with list
            type: "checkbox",
            default: "checked",
            labelPos: "right",
        },
        NewEditorsLinks: {
            label: "Add new editors into Edit menu",
            type: "checkbox",
            default: "checked",
            labelPos: "right",
        },
        ResetSearchFormFocus: {
            label: "Reset search form focus",
            type: "checkbox",
            default: "checked",
            labelPos: "right",
        },
        SatelliteLayers: {
            label: "Add satellite layers switches",
            type: "checkbox",
            default: "checked",
            labelPos: "right",
        },
        Swipes: {
            label: "Add swipes between user changesets",
            type: "checkbox",
            default: false,
            labelPos: "right",
        },
        ResizableSidebar: {
            label: "Slider for sidebar width",
            type: "checkbox",
            default: "checked",
            labelPos: "right",
        },
        ClickableAvatar: {
            label: "Click by avatar for open changesets",
            type: "checkbox",
            default: "checked",
            labelPos: "right",
        },
        OverzoomForDataLayer: {
            label: "Allow overzoom when data/satellite layer enabled β",
            type: "checkbox",
            default: false,
            labelPos: "right",
        },
        DragAndDropViewers: {
            label: "Drag&Drop for .geojson, .jpg, .gpx, .osm",
            type: "checkbox",
            default: "checked",
            labelPos: "right",
        },
        "3DViewerInNewTab": {
            label: "Open buildings 3D viewers always in new tab",
            type: "checkbox",
            default: "checked",
            labelPos: "right",
        },
        BetterTaginfo: {
            label: "Add new buttons in Taginfo",
            type: "checkbox",
            default: "checked",
            labelPos: "right",
        },
        DefaultZoomKeysBehaviour: {
            label: "Do not double the zoom step of the buttons +/-",
            type: "checkbox",
            default: false,
            labelPos: "right",
        },
        AddLocationFromNominatim: {
            label: "Add location from Nominatim for changesets and notes",
            type: "checkbox",
            default: "checked",
            labelPos: "right",
        },
        OverpassInstance: {
            label: '<a href="https://wiki.openstreetmap.org/wiki/Overpass_API#Public_Overpass_API_instances">Overpass API server</a>',
            labelPos: "left",
            type: "select",
            options: [MAIN_OVERPASS_INSTANCE.name, MAILRU_OVERPASS_INSTANCE.name, PRIVATECOFFEE_OVERPASS_INSTANCE.name],
        },
        PanoramaxUploader: {
            label: "Add form for uploading photos into Panoramax",
            type: "checkbox",
            default: false,
            labelPos: "right",
        },
        RoutersTimestamps: {
            label: "Add routing data date",
            type: "checkbox",
            default: true,
            labelPos: "right",
        },
        DebugMode: {
            label: "Enable debug and experimental features",
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
                        label.querySelector("#last-comments-link").setAttribute("href", `https://resultmaps.neis-one.org/osm-discussion-comments?uid=${userId}&commented`)
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
                        this.wrapper.querySelector(`#${this.configId}_${this.id}_var table`).lastElementChild.before(makeRow(i["label"], i["text"]))
                    })
                }
            },
        },
    },
    frameStyle: `
            border: 1px solid #000;
            height: min(85%, 760px);
            width: max(25%, 380px);
            z-index: 9999;
            opacity: 0;
            position: absolute;
            margin-left: auto;
            margin-right: auto;
        `,
    css: `
            #Config_saveBtn {
                cursor: pointer;
            }
            #Config_closeBtn {
                cursor: pointer;
            }
            #Config_field_ResolveNotesButton {
                width: 100%;
                max-width: 100%;
            }
            #Config table {
                border-collapse: collapse;
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
            #version {
                position: absolute;
                left: 12;
                font-size: small;
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
            #Config_saveBtn {
                filter: invert(0.9);
            }
            #Config_closeBtn {
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
            versionSection.textContent = `Script version: `
            const version = document.createElement("span")
            version.textContent = GM_info.script.version
            version.title = "Click for copy"
            version.style.cursor = "pointer"
            version.onclick = e => {
                navigator.clipboard.writeText(GM_info.script.version).then(() => copyAnimation(e, GM_info.script.version))
            }
            versionSection.appendChild(version)
            doc.querySelector(".reset_holder").prepend(versionSection)
        },
    },
}

GM_config.init(configOptions)
//</editor-fold>
