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
        },
    },
}

GM_config.init(configOptions)
//</editor-fold>
