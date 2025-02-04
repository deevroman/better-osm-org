// ==UserScript==
// @name            Better osm.org
// @name:ru         Better osm.org
// @version         0.8.1
// @changelog       v0.8: https://osm.org/user/TrickyFoxy/diary/406061
// @changelog       v0.8: Images from Panoramax, StreetComplete, Wikipedia Commons in changeset and notes
// @changelog       v0.8: GPX-tracks render (also in StreetComplete notes)
// @changelog       v0.8: Show first comment in changesets history, user badge for your friends
// @changelog       v0.8: T — toggle between compact and full tags diff mode, U — open user profile from changeset, note, ...
// @changelog       v0.8: Hotkeys on user profile Page (H — user changesets, T — tracks, D — Diary, C — comments, N — notes)
// @changelog       v0.8: Drag&Drop for geotagged photos, GeoJSON and GPX files
// @changelog       New: Comments templates, support ways render in relation members list
// @changelog       New: Q for close sidebar, shift + Z for real bbox of changeset
// @changelog       New: displaying the full history of ways (You can disable it in settings)
// @changelog       https://c.osm.org/t/better-osm-org-a-script-that-adds-useful-little-things-to-osm-org/121670/44
// @description     Several improvements for advanced users of openstreetmap.org
// @description:ru  Скрипт, добавляющий на openstreetmap.org полезные картографам функции
// @author       deevroman
// @match        https://www.openstreetmap.org/*
// @exclude      https://www.openstreetmap.org/api*
// @exclude      https://www.openstreetmap.org/diary/new
// @exclude      https://www.openstreetmap.org/message/new/*
// @exclude      https://www.openstreetmap.org/reports/new/*
// @exclude      https://www.openstreetmap.org/profile/edit
// @exclude      https://www.openstreetmap.org/oauth2/*
// @match        https://master.apis.dev.openstreetmap.org/*
// @exclude      https://master.apis.dev.openstreetmap.org/api/*
// @exclude      https://master.apis.dev.openstreetmap.org/oauth2/*
// @match        https://taginfo.openstreetmap.org/*
// @match        https://taginfo.geofabrik.de/*
// @match        https://www.hdyc.neis-one.org/*
// @match        https://hdyc.neis-one.org/*
// @match        https://osmcha.org/*
// @exclude      https://taginfo.openstreetmap.org/embed/*
// @license      WTFPL
// @namespace    https://github.com/deevroman/better-osm-org
// @updateURL    https://github.com/deevroman/better-osm-org/raw/master/better-osm-org.user.js
// @downloadURL  https://github.com/deevroman/better-osm-org/raw/master/better-osm-org.user.js
// @supportURL   https://github.com/deevroman/better-osm-org/issues
// @icon         https://www.google.com/s2/favicons?sz=64&domain=openstreetmap.org
// @require      https://github.com/deevroman/GM_config/raw/fixed-for-chromium/gm_config.js#sha256=ea04cb4254619543f8bca102756beee3e45e861077a75a5e74d72a5c131c580b
// @require      https://raw.githubusercontent.com/deevroman/osmtags-editor/main/osm-auth.iife.min.js#sha256=dcd67312a2714b7a13afbcc87d2f81ee46af7c3871011427ddba1e56900b4edd
// @require      https://raw.githubusercontent.com/deevroman/exif-js/53b0c7c1951a23d255e37ed0a883462218a71b6f/exif.js#sha256=2235967d47deadccd9976244743e3a9be5ca5e41803cda65a40b8686ec713b74
// @incompatible safari https://github.com/deevroman/better-osm-org/issues/13
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_listValues
// @grant        GM_deleteValue
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM_getResourceURL
// @grant        GM_getResourceText
// @grant        GM_addElement
// @grant        GM.xmlHttpRequest
// @grant        GM_info
// @connect      planet.openstreetmap.org
// @connect      planet.maps.mail.ru
// @connect      www.hdyc.neis-one.org
// @connect      hdyc.neis-one.org
// @connect      resultmaps.neis-one.org
// @connect      www.openstreetmap.org
// @connect      osmcha.org
// @connect      overpass-api.de
// @connect      raw.githubusercontent.com
// @connect      en.wikipedia.org
// @connect      amazonaws.com
// @sandbox      JavaScript
// @resource     OAUTH_HTML https://github.com/deevroman/better-osm-org/raw/master/finish-oauth.html
// @resource     OSMCHA_ICON https://github.com/deevroman/better-osm-org/raw/master/icons/osmcha.ico
// @resource     NODE_ICON https://github.com/deevroman/better-osm-org/raw/master/icons/Osm_element_node.svg
// @resource     WAY_ICON https://github.com/deevroman/better-osm-org/raw/master/icons/Osm_element_way.svg
// @resource     RELATION_ICON https://github.com/deevroman/better-osm-org/raw/master/icons/Taginfo_element_relation.svg
// @resource     OSMCHA_LIKE https://github.com/OSMCha/osmcha-frontend/raw/94f091d01ce5ea2f42eb41e70cdb9f3b2d67db88/src/assets/thumbs-up.svg
// @resource     OSMCHA_DISLIKE https://github.com/OSMCha/osmcha-frontend/raw/94f091d01ce5ea2f42eb41e70cdb9f3b2d67db88/src/assets/thumbs-down.svg
// @resource     DARK_THEME_FOR_ID_CSS https://gist.githubusercontent.com/deevroman/55f35da68ab1efb57b7ba4636bdf013d/raw/7b94e3b7db91d023f1570ae415acd7ac989fffe0/dark.css
// @run-at       document-end
// ==/UserScript==
//<editor-fold desc="config" defaultstate="collapsed">
/*global osmAuth*/
/*global GM*/
/*global GM_info*/
/*global GM_config*/
/*global GM_addElement*/
/*global GM_getValue*/
/*global GM_setValue*/
/*global GM_listValues*/
/*global GM_deleteValue*/
/*global GM_getResourceURL*/
/*global GM_getResourceText*/
/*global GM_registerMenuCommand*/
/*global unsafeWindow*/
/*global exportFunction*/
/*global cloneInto*/

/*global EXIF*/

function isDarkMode() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function makeRow(label, text) {
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
    td.setAttribute("placeholder", "comment that will be added when clicked")

    td2.textContent = "×"
    td2.title = "remove"
    td2.style.width = "21px"
    td2.style.cursor = "pointer"
    td2.style.textAlign = "center"
    td2.onclick = () => {
        if (label === "" && text === "" || confirm(`Remove "${label}"?`)) {
            tr.remove()
        }
    }

    th.style.width = "30px"
    th.appendChild(document.createElement("br"))

    tr.appendChild(th)
    tr.appendChild(td)
    tr.appendChild(td2)
    return tr
}

GM_config.init(
    {
        'id': 'Config',
        'title': ' ',
        'fields':
            {
                'OffMapDim': {
                    'label': 'Off map dim (⚠️: now it\'s <a href="https://www.openstreetmap.org/preferences" target="_blank">built</a> into osm.org!)',
                    'type': 'checkbox',
                    'default': false,
                    'labelPos': 'right'
                },
                'DarkModeForMap': {
                    'label': 'Invert map colors in dark mode 🆕',
                    'type': 'checkbox',
                    'default': false,
                    'labelPos': 'right'
                },
                'DarkModeForID': {
                    'label': 'Dark mode for iD 🆕 (<a href="https://userstyles.world/style/15596/openstreetmap-dark-theme" target="_blank">Thanks AlexPS</a>)',
                    'type': 'checkbox',
                    'default': false,
                    'labelPos': 'right'
                },
                'CompactChangesetsHistory':
                    {
                        'section': ["Viewing edits"],
                        'label': 'Compact changesets history',
                        'type': 'checkbox',
                        'default': 'checked',
                        'labelPos': 'right',
                    },
                'VersionsDiff':
                    {
                        'label': 'Add tags diff in history',
                        'type': 'checkbox',
                        'default': 'checked',
                        'labelPos': 'right',
                    },
                'FullVersionsDiff':
                    {
                        'label': 'Add diff with intermediate versions in way history',
                        'type': 'checkbox',
                        'default': 'checked',
                        'labelPos': 'right',
                    },
                'ChangesetQuickLook':
                    {
                        'label': 'Add QuickLook for small changesets ',
                        'type': 'checkbox',
                        'default': 'checked',
                        'labelPos': 'right'
                    },
                'ShowChangesetGeometry':
                    {
                        'label': 'Show geometry of objects in changeset',
                        'type': 'checkbox',
                        'default': 'checked',
                        'labelPos': 'right'
                    },
                'MassChangesetsActions':
                    {
                        'label': 'Add actions for changesets list (mass revert, filtering, ...)',
                        'type': 'checkbox',
                        'default': 'checked',
                        'labelPos': 'right'
                    },
                'HideNoteHighlight':
                    {
                        'section': ["Working with notes"],
                        'label': 'Hide note highlight',
                        'type': 'checkbox',
                        'default': 'checked',
                        'labelPos': 'right'
                    },
                'SatelliteLayers':
                    {
                        'label': 'Add satellite layers for notes page (Firefox only)',
                        'type': 'checkbox',
                        'default': 'checked',
                        'labelPos': 'right'
                    },
                'ResolveNotesButton':
                    {
                        'label': 'Addition resolve buttons:',
                        'type': 'menu',
                        'default': '[{"label": "👌", "text": ""}]'
                    },
                'RevertButton':
                    {
                        'section': ["New actions"],
                        'label': 'Revert&Osmcha changeset button',
                        'type': 'checkbox',
                        'default': 'checked',
                        'labelPos': 'right'
                    },
                'Deletor':
                    {
                        'label': 'Button for node deletion',
                        'type': 'checkbox',
                        'default': 'checked',
                        'labelPos': 'right'
                    },
                'OneClickDeletor':
                    {
                        'label': 'Delete node without confirmation',
                        'type': 'checkbox',
                        'default': false,
                        'labelPos': 'right'
                    },
                'ChangesetsTemplates':
                    {
                        'label': 'Changesets comments templates <a id="last-comments-link" target="_blank">(your last comments)</a>',
                        'type': 'menu',
                        'default': '[{"label": "👋", "text": ""}]'
                    },
                'HDYCInProfile':
                    {
                        'section': ["Other"],
                        'label': 'Add HDYC to user profile',
                        'type': 'checkbox',
                        'default': 'checked',
                        'labelPos': 'right'
                    },
                'NavigationViaHotkeys':
                    {
                        'label': 'Add hotkeys <a href="https://github.com/deevroman/better-osm-org#Hotkeys" target="_blank">(List)</a>', // add help button with list
                        'type': 'checkbox',
                        'default': 'checked',
                        'labelPos': 'right'
                    },
                'NewEditorsLinks':
                    {
                        'label': 'Add new editors (Rapid, ... ?)',
                        'type': 'checkbox',
                        'default': 'checked',
                        'labelPos': 'right'
                    },
                'ViewLinks':
                    {
                        'label': 'Viewers (Bing, GMaps, ... ?)',
                        'type': 'checkbox',
                        'default': 'checked',
                        'labelPos': 'right'
                    },
                'RelationVersionViewer':
                    {
                        'label': 'Add relation version view via overpass',
                        'type': 'checkbox',
                        'default': 'checked',
                        'labelPos': 'right'
                    },
                'ResetSearchFormFocus': {
                    'label': 'Reset search form focus',
                    'type': 'checkbox',
                    'default': 'checked',
                    'labelPos': 'right'
                },
                'Swipes': {
                    'label': 'Add swipes between user changesets',
                    'type': 'checkbox',
                    'default': false,
                    'labelPos': 'right'
                },
                'ResizableSidebar': {
                    'label': 'Slider for sidebar width',
                    'type': 'checkbox',
                    'default': 'checked',
                    'labelPos': 'right'
                },
                'ClickableAvatar': {
                    'label': 'Click by avatar for open changesets',
                    'type': 'checkbox',
                    'default': 'checked',
                    'labelPos': 'right'
                },
                'OverzoomForDataLayer': {
                    'label': 'Allow overzoom when data layer enabled β',
                    'type': 'checkbox',
                    'default': false,
                    'labelPos': 'right'
                },
                'DragAndDropViewers': {
                    'label': 'Drag&Drop for .geojson, .jpg, .gpx β',
                    'type': 'checkbox',
                    'default': 'checked',
                    'labelPos': 'right'
                }
            },
        'types': {
            'menu': {
                'default': '',
                toNode: function () {
                    const templates = this.value || this.settings.default;
                    const settingNode = this.create('div', {
                        className: 'config_var',
                        id: this.configId + '_' + this.id + '_var',
                    });

                    this.templates = templates;

                    settingNode.appendChild(this.create('input', {
                        innerHTML: this.settings.label,
                        id: this.configId + '_' + this.id + '_field_filler',
                        className: 'filler',
                        type: "checkbox",
                    }));

                    const label = this.create('label', {
                        innerHTML: this.settings.label,
                        id: this.configId + '_' + this.id + '_field_label',
                        for: this.configId + '_field_' + this.id,
                        className: 'field_label'
                    })
                    if (label.querySelector("#last-comments-link")) {
                        const userId = document.querySelector("head")?.getAttribute("data-user")
                        if (userId) {
                            label.querySelector("#last-comments-link").setAttribute("href", `https://resultmaps.neis-one.org/osm-discussion-comments?uid=${userId}&commented`)
                        } else {
                            label.querySelector("#last-comments-link").remove()
                        }
                    }
                    settingNode.appendChild(label);


                    const table = document.createElement("table")
                    table.setAttribute("cellspacing", "0")
                    table.setAttribute("cellpadding", "0")
                    table.style.width = "100%"
                    settingNode.appendChild(table)
                    const tbody = document.createElement("tbody")
                    table.appendChild(tbody)

                    JSON.parse(templates).forEach(row => {
                        tbody.appendChild(makeRow(row['label'], row['text']))
                    })

                    const tr = document.createElement("tr")
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

                    return settingNode;
                },
                toValue: function () {
                    let templates = [];
                    if (this.wrapper) {
                        for (let row of Array.from(this.wrapper.getElementsByTagName('tr')).slice(0, -1)) {
                            const forPush = {
                                label: row.querySelector("th").textContent,
                                text: row.querySelector("td").textContent
                            }
                            if (!(forPush.label.trim() === "" && forPush.text.trim() === "")) {
                                templates.push(forPush)
                            }
                        }
                    }
                    return JSON.stringify(templates);
                },
                reset: function () {
                    if (this.wrapper) {
                        for (let row of Array.from(this.wrapper.getElementsByTagName('tr')).slice(0, -1)) {
                            row.remove()
                        }
                        JSON.parse(this.settings.default).forEach(i => {
                            this.wrapper.querySelector(`#${this.configId}_${this.id}_var table`).lastElementChild.before(makeRow(i['label'], i['text']));
                        })
                    }
                }
            }
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
        @media (prefers-color-scheme: dark) {
            #Config {
                background: #232528;
                color: white;
            }
            #Config a {
                color: darkgray;
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
        }
        `,
        'events':
            {
                'save': function () {
                    GM_config.close()
                }
            }
    });

let onInit = config => new Promise(resolve => {
    let isInit = () => setTimeout(() =>
        config.isInit ? resolve() : isInit(), 0);
    isInit();
});

let init = onInit(GM_config);

const prod_server = {
    apiBase: "https://www.openstreetmap.org/api/0.6/",
    apiUrl: "https://www.openstreetmap.org/api/0.6",
    url: "https://www.openstreetmap.org",
    origin: "https://www.openstreetmap.org"
}

const ohm_prod_server = {
    apiBase: "https://www.openhistoricalmap.org/api/0.6/",
    apiUrl: "https://www.openhistoricalmap.org/api/0.6",
    url: "https://www.openhistoricalmap.org",
    origin: "https://www.openhistoricalmap.org"
}

const dev_server = {
    apiBase: "https://master.apis.dev.openstreetmap.org/api/0.6/",
    apiUrl: "https://master.apis.dev.openstreetmap.org/api/0.6",
    url: "https://master.apis.dev.openstreetmap.org",
    origin: "https://master.apis.dev.openstreetmap.org",
}

const local_server = {
    apiBase: "http://localhost:3000/api/0.6/",
    apiUrl: "http://localhost:3000/api/0.6",
    url: "http://localhost:3000",
    origin: "http://localhost:3000",
}

let osm_server = dev_server;

const planetOrigin = "https://planet.maps.mail.ru"

//</editor-fold>

function tagsToXml(doc, node, tags) {
    for (const [k, v] of Object.entries(tags)) {
        let tag = doc.createElement('tag');
        tag.setAttribute('k', k);
        tag.setAttribute('v', v);
        node.appendChild(tag);
    }
}

function makeAuth() {
    return osmAuth.osmAuth({
        apiUrl: osm_server.apiUrl,
        url: osm_server.url,
        client_id: "FwA",
        client_secret: "ZUq",
        redirect_uri: GM_getResourceURL("OAUTH_HTML"),
        scope: "write_api",
        auto: true
    });
}

function makeHashtagsClickable() {
    const comment = document.querySelector(".browse-section p")
    comment.childNodes.forEach(node => {
        if (node.nodeType !== Node.TEXT_NODE) return
        const span = document.createElement("span")
        span.textContent = node.textContent
        span.innerHTML = span.innerHTML.replaceAll(/\B(#[\p{L}\d_-]+)\b/gu, function (match) {
            const osmchaFilter = {"comment": [{"label": match, "value": match}]}
            const osmchaLink = "https://osmcha.org?" + new URLSearchParams({filters: JSON.stringify(osmchaFilter)}).toString()
            const a = document.createElement("a")
            a.href = osmchaLink
            a.target = "_blank"
            a.title = "Search this hashtags in OSMCha"
            a.textContent = match
            return a.outerHTML
        })
        node.replaceWith(span)
    })
}

function shortOsmOrgLinksInText(text) {
    return text.replaceAll("https://www.openstreetmap.org", "osm.org")
        .replaceAll("https://wiki.openstreetmap.org/wiki", "osm.wiki")
        .replaceAll("https://wiki.openstreetmap.org", "osm.wiki")
        .replaceAll("https://community.openstreetmap.org", "c.osm.org")
        .replaceAll("https://openstreetmap.org", "osm.org")
}

function shortOsmOrgLinks(elem) {
    elem.querySelectorAll('a[href^="https://www.openstreetmap.org"], a[href^="https://wiki.openstreetmap.org"], a[href^="https://community.openstreetmap.org"], a[href^="https://openstreetmap.org"]').forEach(i => {
        i.textContent = shortOsmOrgLinksInText(i.textContent)
    })
}

// todo remove this
const mainTags = ["shop", "building", "amenity", "man_made", "highway", "natural", "aeroway", "historic", "railway", "tourism", "landuse", "leisure"]

function addRevertButton() {
    if (!location.pathname.includes("/changeset")) return
    if (document.querySelector('#revert_button_class')) return true;
    const sidebar = document.querySelector("#sidebar_content h2");
    if (sidebar) {
        hideSearchForm();
        // sidebar.classList.add("changeset-header")
        const changeset_id = sidebar.innerHTML.match(/(\d+)/)[0];
        sidebar.innerHTML += ` <a href="https://revert.monicz.dev/?changesets=${changeset_id}" target=_blank rel="noreferrer" id=revert_button_class title="Open osm-revert\nShift + click for revert via JOSM">↩️</a> 
                               <a href="https://osmcha.org/changesets/${changeset_id}" target="_blank" rel="noreferrer"><img src="${GM_getResourceURL("OSMCHA_ICON", false)}" id="osmcha_link"></a>`;

        document.querySelector("#revert_button_class").onclick = (e) => {
            if (!e.shiftKey) return
            e.preventDefault()
            window.location = "http://127.0.0.1:8111/revert_changeset?id=" + changeset_id // todo open in new tab
        }
        document.querySelector("#revert_button_class").style.textDecoration = "none"
        const osmcha_link = document.querySelector("#osmcha_link");
        osmcha_link.style.height = "1em";
        osmcha_link.style.cursor = "pointer";
        osmcha_link.style.marginTop = "-3px";
        osmcha_link.title = "Open changeset in OSMCha (or press O)\n(shift + O for open Achavi)";
        if (isDarkMode()) {
            osmcha_link.style.filter = "invert(0.7)";
        }

        // find deleted user
        // todo extract
        let metainfoHTML = document.querySelector(".browse-section > .details")
        let time = Array.from(metainfoHTML.children).find(i => i.localName === "time")
        if (Array.from(metainfoHTML.children).some(e => e.localName === "a")) {
            let usernameA = Array.from(metainfoHTML.children).find(i => i.localName === "a")
            metainfoHTML.innerHTML = ""
            metainfoHTML.appendChild(time)
            metainfoHTML.appendChild(document.createTextNode(" "))
            metainfoHTML.appendChild(usernameA)
            metainfoHTML.appendChild(document.createTextNode(" "))
            getCachedUserInfo(usernameA.textContent).then((res) => {
                usernameA.before(makeBadge(res))
                usernameA.before(document.createTextNode(" "))
            })
            //<link rel="alternate" type="application/atom+xml" title="ATOM" href="https://www.openstreetmap.org/user/Elizen/history/feed">
            const rssfeed = document.createElement("link")
            rssfeed.id = "fixed-rss-feed"
            rssfeed.type = "application/atom+xml"
            rssfeed.title = "ATOM"
            rssfeed.rel = "alternate"
            rssfeed.href = `https://www.openstreetmap.org/user/${encodeURI(usernameA.textContent)}/history/feed`
            document.head.appendChild(rssfeed)
        } else {
            let time = Array.from(metainfoHTML.children).find(i => i.localName === "time")
            metainfoHTML.innerHTML = ""
            metainfoHTML.appendChild(time)
            const findBtn = document.createElement("span")
            findBtn.title = "Try find deleted user"
            findBtn.textContent = " 🔍 "
            findBtn.value = changeset_id
            findBtn.datetime = time.dateTime
            findBtn.style.cursor = "pointer"
            findBtn.onclick = findChangesetInDiff
            metainfoHTML.appendChild(findBtn)
        }
        // compact changeset tags
        if (!document.querySelector(".browse-tag-list[compacted]")) {
            makeHashtagsClickable()
            shortOsmOrgLinks(document.querySelector(".browse-section p"));
            let needUnhide = false
            document.querySelectorAll(".browse-tag-list tr").forEach(i => {
                const key = i.querySelector("th")
                if (key.textContent === "host") {
                    if (i.querySelector("td").textContent === "https://www.openstreetmap.org/edit") {
                        i.style.display = "none"
                        i.classList.add("hidden-tag")
                    }
                } else if (key.textContent.startsWith("ideditor:")) {
                    key.title = key.textContent
                    key.textContent = key.textContent.replace("ideditor:", "iD:")
                } else if (key.textContent === "revert:id") {
                    if (i.querySelector("td").textContent.match(/^((\d+(;|$))+$)/)) {
                        i.querySelector("td").innerHTML = i.querySelector("td").innerHTML.replaceAll(/(\d+)/g,
                            `<a href="/changeset/$1" class="changeset_link_in_changeset_tags">$1</a>`)
                    } else if (i.querySelector("td").textContent.match(/https:\/\/(www\.)?openstreetmap.org\/changeset\//g)) {
                        i.querySelector("td").innerHTML = i.querySelector("td").innerHTML.replaceAll(/>https:\/\/(www\.)?openstreetmap.org\/changeset\//g, ">")
                    }
                } else if (key.textContent === "redacted_changesets") {
                    if (i.querySelector("td").textContent.match(/^((\d+(,|$))+$)/)) {
                        i.querySelector("td").innerHTML = i.querySelector("td").innerHTML.replaceAll(/(\d+)/g,
                            `<a href="/changeset/$1" class="changeset_link_in_changeset_tags">$1</a>`)
                    } else if (i.querySelector("td").textContent.match(/https:\/\/(www\.)?openstreetmap.org\/changeset\//g)) {
                        i.querySelector("td").innerHTML = i.querySelector("td").innerHTML.replaceAll(/>https:\/\/(www\.)?openstreetmap.org\/changeset\//g, ">")
                    }
                } else if (key.textContent === "closed:note") {
                    if (i.querySelector("td").textContent.match(/^((\d+(;|$))+$)/)) {
                        i.querySelector("td").innerHTML = i.querySelector("td").innerHTML.replaceAll(/(\d+)/g,
                            `<a href="/note/$1" class="note_link_in_changeset_tags">$1</a>`)
                    }
                } else if (key.textContent.startsWith("v:") && GM_config.get("ChangesetQuickLook")) {
                    i.style.display = "none"
                    i.classList.add("hidden-tag")
                    needUnhide = true
                }
            })
            if (needUnhide) {
                const expander = document.createElement("td")
                expander.onclick = e => {
                    document.querySelectorAll(".hidden-tag").forEach(i => {
                        i.style.display = ""
                    })
                    e.target.remove()
                }
                expander.colSpan = 2
                expander.textContent = "∇"
                expander.style.textAlign = "center"
                expander.style.cursor = "pointer"
                expander.title = "Show hidden tags"
                document.querySelector(".browse-tag-list").appendChild(expander)
            }
            document.querySelector(".browse-tag-list")?.setAttribute("compacted", "true")
        }

    }
    const textarea = document.querySelector("#sidebar_content textarea");
    if (textarea) {
        textarea.rows = 1;
        let comment = document.querySelector("#sidebar_content button[name=comment]")
        if (comment) {
            comment.parentElement.hidden = true
            textarea.addEventListener("input", () => {
                    comment.hidden = false
                }
            )
            textarea.addEventListener("click", () => {
                    textarea.rows = textarea.rows + 5
                    comment.parentElement.hidden = false
                }, {once: true}
            )
            comment.onclick = () => {
                [500, 1000, 2000, 4000, 6000].map(i => setTimeout(setupRevertButton, i));
            }
            const templates = GM_config.get("ChangesetsTemplates")
            if (templates) {
                JSON.parse(templates).forEach(row => {
                    const label = row['label']
                    let text = label
                    if (row['text'] !== "") {
                        text = row['text']
                    }
                    let b = document.createElement("span");
                    b.classList.add("comment-template", "btn", "btn-primary");
                    b.textContent = label;
                    b.title = `Add into the comment "${text}".\nYou can change text in userscript settings`
                    document.querySelectorAll("form.mb-3 [name=comment]")[0].parentElement.appendChild(b);
                    b.after(document.createTextNode("\xA0"));
                    b.onclick = (e) => {
                        e.stopImmediatePropagation()
                        const textarea = document.querySelector("form.mb-3 textarea")
                        const prev = textarea.value;
                        const cursor = textarea.selectionEnd
                        textarea.value = prev.substring(0, cursor) + text + prev.substring(cursor)
                        textarea.focus()
                    }
                })
            }
        }
    }
    const tagsHeader = document.querySelector("#sidebar_content h4");
    if (tagsHeader) {
        tagsHeader.remove()
    }
    const primaryButtons = document.querySelector("[name=subscribe], [name=unsubscribe]")
    if (primaryButtons && osm_server.url === prod_server.url) {
        const changeset_id = sidebar.innerHTML.match(/(\d+)/)[0];

        async function uncheck(changeset_id) {
            return await GM.xmlHttpRequest({
                url: `https://osmcha.org/api/v1/changesets/${changeset_id}/uncheck/`,
                headers: {
                    "Authorization": "Token " + GM_getValue("OSMCHA_TOKEN"),
                },
                method: "PUT",
            });
        }

        const likeImgRes = GM_getResourceURL("OSMCHA_LIKE", false)
        const dislikeImgRes = GM_getResourceURL("OSMCHA_DISLIKE", false)

        const likeBtn = document.createElement("span")
        likeBtn.title = "OSMCha review like"
        const likeImg = document.createElement("img")
        likeImg.title = "OSMCha review like"
        likeImg.src = likeImgRes
        likeImg.style.height = "1.1em"
        likeImg.style.cursor = "pointer"
        likeImg.style.filter = "grayscale(1)"
        likeImg.style.marginTop = "-8px"
        likeBtn.onclick = async e => {
            const osmchaToken = GM_getValue("OSMCHA_TOKEN")
            if (!osmchaToken) {
                alert("Please, login into OSMCha")
                window.open("https://osmcha.org")
                return;
            }
            if (e.target.hasAttribute("active")) {
                await uncheck(changeset_id)
                await updateReactions()
                return
            }
            if (document.querySelector(".check_user")) {
                await uncheck(changeset_id)
                await updateReactions()
            }
            await GM.xmlHttpRequest({
                url: `https://osmcha.org/api/v1/changesets/${changeset_id}/set-good/`,
                headers: {
                    "Authorization": "Token " + GM_getValue("OSMCHA_TOKEN"),
                },
                method: "PUT",
            });
            await updateReactions()
        }
        likeBtn.appendChild(likeImg)

        const dislikeBtn = document.createElement("span")
        dislikeBtn.title = "OSMCha review dislike"
        const dislikeImg = document.createElement("img")
        dislikeImg.title = "OSMCha review dislike"
        dislikeImg.src = likeImgRes // dirty hack for different graystyle colors
        dislikeImg.style.height = "1.1em"
        dislikeImg.style.cursor = "pointer"
        dislikeImg.style.filter = "grayscale(1)"
        dislikeImg.style.transform = "rotate(180deg)"
        dislikeImg.style.marginTop = "3px"
        dislikeBtn.appendChild(dislikeImg)
        dislikeBtn.onclick = async e => {
            const osmchaToken = GM_getValue("OSMCHA_TOKEN")
            if (!osmchaToken) {
                alert("Please, login into OSMCha")
                window.open("https://osmcha.org")
                return;
            }
            if (e.target.hasAttribute("active")) {
                await uncheck(changeset_id)
                await updateReactions()
                return
            }
            if (document.querySelector(".check_user")) {
                await uncheck(changeset_id)
                await updateReactions()
            }
            await GM.xmlHttpRequest({
                url: `https://osmcha.org/api/v1/changesets/${changeset_id}/set-harmful/`,
                headers: {
                    "Authorization": "Token " + GM_getValue("OSMCHA_TOKEN"),
                },
                method: "PUT",
            });
            await updateReactions()
        }

        async function updateReactions() {
            const res = await GM.xmlHttpRequest({
                url: "https://osmcha.org/api/v1/changesets/" + changeset_id,
                method: "GET",
                headers: {
                    "Authorization": "Token " + GM_getValue("OSMCHA_TOKEN"),
                },
                responseType: "json"
            })
            if (res.status === 404) {
                console.warn("Changeset not found in OSMCha database")
                return;
            }
            const json = res.response;
            if (json['properties']['check_user']) {
                document.querySelector(".check_user")?.remove()
                likeImg.style.filter = "grayscale(1)"
                dislikeImg.style.filter = "grayscale(1)"

                const username = document.createElement("span")
                username.classList.add("check_user")
                username.textContent = json['properties']['check_user']
                if (json['properties']['harmful'] === true) {
                    dislikeImg.style.filter = ""
                    dislikeImg.style.transform = ""
                    dislikeImg.src = dislikeImgRes
                    dislikeImg.setAttribute("active", "true")
                    dislikeImg.title = "OSMCha review dislike"
                    username.style.color = "red"
                    dislikeBtn.after(username)
                } else {
                    likeImg.style.filter = ""
                    likeImg.setAttribute("active", "true")
                    likeImg.title = "OSMCha review like"
                    username.style.color = "green"
                    likeBtn.after(username)
                }
            } else {
                likeImg.style.filter = "grayscale(1)"
                dislikeImg.style.filter = "grayscale(1)"
                dislikeImg.style.transform = "rotate(180deg)"
                dislikeImg.src = likeImgRes
                dislikeImg.title = "OSMCha review dislike"
                likeImg.title = "OSMCha review like"
                likeImg.removeAttribute("active")
                dislikeImg.removeAttribute("active")
                document.querySelector(".check_user")?.remove()
            }
        }

        setTimeout(updateReactions, 0);

        primaryButtons.before(likeBtn)
        primaryButtons.before(document.createTextNode("\xA0"))
        primaryButtons.before(dislikeBtn)
        primaryButtons.before(document.createTextNode("\xA0"))
    }
    document.querySelectorAll('#sidebar_content li[id^=c] small > a[href^="/user/"]').forEach(elem => {
        getCachedUserInfo(elem.textContent).then(info => {
            elem.before(makeBadge(info))
        })
    })
    // fixme dont work loggined
    document.querySelectorAll(".browse-section > div:has([name=subscribe],[name=unsubscribe]) ~ ul li div").forEach(c => {
        c.innerHTML = c.innerHTML.replaceAll(/((changesets )((\d+)([,. ])(\s|$|<\/))+|changeset \d+)/gm, (match) => {
            return match.replaceAll(/(\d+)/g, `<a href="/changeset/$1" class="changeset_link_in_comment">$1</a>`)
        }).replaceAll(/>https:\/\/(www\.)?openstreetmap.org\//g, ">osm.org/")
    })
}

function setupRevertButton() {
    if (!location.pathname.includes("/changeset")) return;
    let timerId = setInterval(() => {
        if (addRevertButton()) clearInterval(timerId)
    }, 100);
    setTimeout(() => {
        clearInterval(timerId);
        console.debug('stop try add revert button');
    }, 3000);
    addRevertButton();
}

function hideSearchForm() {
    if (location.pathname.includes("/search") || location.pathname.includes("/directions")) return;
    if (!document.querySelector("#sidebar .search_forms")?.hasAttribute("hidden")) {
        document.querySelector("#sidebar .search_forms")?.setAttribute("hidden", "true")
    }

    function showSearchForm() {
        document.querySelector("#sidebar .search_forms")?.removeAttribute("hidden");
        cleanAllObjects()
    }

    document.querySelector("#sidebar_content .btn-close")?.addEventListener("click", showSearchForm)
    document.querySelector("h1 .icon-link")?.addEventListener("click", showSearchForm)
}

let sidebarObserver = null;
let timestampMode = "natural_text"

function makeTimesSwitchable() {
    document.querySelectorAll("time:not([natural_text])").forEach(j => {
        j.setAttribute("natural_text", j.textContent)
        if (timestampMode !== "natural_text") {
            j.textContent = j.getAttribute("datetime")
        }
    })

    function switchTimestamp() {
        if (window.getSelection().type === "Range") {
            return
        }
        document.querySelectorAll("time:not([natural_text])").forEach(j => {
            j.setAttribute("natural_text", j.textContent)
        })

        function switchElement(j) {
            if (j.textContent === j.getAttribute("natural_text")) {
                j.textContent = j.getAttribute("datetime")
                timestampMode = "datetime"
            } else {
                j.textContent = j.getAttribute("natural_text")
                timestampMode = "natural_text"
            }
        }

        document.querySelectorAll("time").forEach(switchElement)
    }

    document.querySelectorAll("time:not([switchable])").forEach(i => i.addEventListener("click", switchTimestamp))
    document.querySelectorAll("time:not([switchable])").forEach(i => i.setAttribute("switchable", "true"))

}

const compactSidebarStyleText = `
    .changesets p {
      margin-bottom: 0;
      font-weight: 788;
      font-style: italic;
      font-size: 14px !important;
    }
    @media (prefers-color-scheme: dark) {
        .changesets time {
            color: darkgray;
        }
                
        .changesets p {
            font-weight: 400;
        }
        
        .changeset_id.custom-changeset-id-click {
            color: #767676 !important;
        }
    }
    .browse-section > p:nth-of-type(1) {
        font-size: 14px !important;
        font-style: italic;  
    }
    .map-layout #sidebar {
      width: 450px;
    }
    turbo-frame {
        word-wrap: anywhere;
    }
    
    turbo-frame th {
        min-width: max-content;
        word-wrap: break-word;
    }
    
    /*for id copied*/
    .copied {
      background-color: red;
      transition:all 0.3s;
    }
    .was-copied {
      background-color: initial;
      transition:all 0.3s;
    }
    #sidebar_content h2:not(.changeset-header) {
        font-size: 1rem;
    }
    #sidebar {
      border-top: solid;
      border-top-width: 1px;
      border-top-color: rgba(var(--bs-secondary-bg-rgb), var(--bs-bg-opacity)) !important;
    }
  
    .fixme-tag {
      color: red !important;
      font-weight: bold;
    }
  
    @media (prefers-color-scheme: dark) {
      .fixme-tag {
        color: #ff5454 !important;
        font-weight: unset;
      }
    }
    
    @media (prefers-color-scheme: dark) {
        table.browse-tag-list tr td[colspan="2"]{
          background: var(--bs-body-bg) !important;
        }
    }
      
    `;

let styleForSidebarApplied = false

function setupCompactChangesetsHistory() {
    if (!location.pathname.includes("/history") && !location.pathname.includes("/changeset")) {
        if (!styleForSidebarApplied && (location.pathname.includes("/node")
            || location.pathname.includes("/way")
            || location.pathname.includes("/relation"))) {
            styleForSidebarApplied = true
            GM_addElement(document.head, "style", {
                textContent: compactSidebarStyleText,
            });
        }
        return;
    }

    if (location.pathname.includes("/changeset/")) {
        if (document.querySelector("#sidebar_content ul")) {
            document.querySelector("#sidebar_content ul").querySelectorAll("a:not(.page-link)").forEach(i => i.setAttribute("target", "_blank"));
        }
    }

    styleForSidebarApplied = true
    GM_addElement(document.head, "style", {
        textContent: compactSidebarStyleText,
    });

    if (location.pathname.match(/\d+\/history\/\d+$/) && !document.querySelector(".find-user-btn")) {
        try {
            const ver = document.querySelector(".browse-section.browse-node, .browse-section.browse-way, .browse-section.browse-relation")
            const metainfoHTML = ver?.querySelector('ul > li:nth-child(1)');
            if (metainfoHTML && !Array.from(metainfoHTML.children).some(e => e.localName === "a" && e.href.includes("/user/"))) {
                const time = Array.from(metainfoHTML.children).find(i => i.localName === "time")
                const changesetID = ver.querySelector('ul a[href^="/changeset"]').textContent;

                metainfoHTML.lastChild.remove()
                const findBtn = document.createElement("span")
                findBtn.classList.add("find-user-btn")
                findBtn.title = "Try find deleted user"
                findBtn.textContent = " 🔍 "
                findBtn.value = changesetID
                findBtn.datetime = time.dateTime
                findBtn.style.cursor = "pointer"
                findBtn.onclick = findChangesetInDiff
                metainfoHTML.appendChild(findBtn)
            }
        } catch {
        }
    }
    // увы, инвалидация в этом месте ломает зум при загрузке объекте самим сайтом
    // try {
    // getMap()?.invalidateSize()
    // } catch (e) {
    // }

    function handleNewChangesets() {
        // remove useless
        document.querySelectorAll("#sidebar .changesets .col").forEach((e) => {
            e.childNodes[0].textContent = ""
        })
        makeTimesSwitchable();
        hideSearchForm();

        document.querySelectorAll(".changesets li a.changeset_id span:not(.compacted)").forEach(description => {
            description.classList.add("compacted")
            description.textContent = shortOsmOrgLinksInText(description.textContent)
        })

        // TODO need cache like getUserInfo
        async function getChangesetComments(changeset_id) {
            const res = await fetch(osm_server.apiBase + "changeset" + "/" + changeset_id + ".json?include_discussion=true",
                // {signal: abortDownloadingController.signal}
            );
            if (res.status === 509) {
                await error509Handler(res)
            } else {
                return (await res.json())['changeset']['comments'];
            }
        }

        setTimeout(async () => {
            for (const elem of document.querySelectorAll(".changesets li:not(:has(.first-comment)):not(.comments-loaded)")) {
                elem.classList.add("comments-loaded")
                const commentsBadge = elem.querySelector(".col-auto.text-secondary")
                const commentsCount = parseInt(commentsBadge.firstChild.textContent.trim());
                if (commentsCount) {
                    if (commentsCount > 3) {
                        commentsBadge.style.setProperty("color", "red", "important")
                    } else if (commentsCount > 1) {
                        commentsBadge.style.setProperty("color", "#ff7800", "important")
                    }
                    const comment = document.createElement("div");
                    comment.classList.add("first-comment")
                    comment.style.fontSize = "0.7rem"
                    comment.style.borderTopColor = "#0000"
                    comment.style.borderTopStyle = "solid"
                    comment.style.borderTopWidth = "1px"
                    elem.appendChild(comment)

                    const changeset_id = elem.querySelector(".changeset_id").href.match(/\/(\d+)/)[1];
                    getChangesetComments(changeset_id).then(res => {
                        const firstComment = res[0];
                        const userLink = document.createElement("a")
                        userLink.href = osm_server.url + "/user/" + encodeURI(firstComment["user"]);
                        userLink.textContent = firstComment["user"];
                        comment.appendChild(userLink);
                        getCachedUserInfo(firstComment["user"]).then((res) => {
                            const badge = makeBadge(res)
                            const svg = badge.querySelector("svg")
                            if (svg) {
                                badge.style.marginLeft = "-4px"
                                badge.style.height = "1rem";
                                badge.style.float = "left";
                                svg.style.transform = "scale(0.7)"
                            }
                            userLink.before(badge)
                        })
                        const shortText = shortOsmOrgLinksInText(firstComment["text"])
                        comment.appendChild(document.createTextNode(" " + shortText));
                    });
                }
            }
        }, 0);
    }

    handleNewChangesets();
    sidebarObserver?.disconnect();
    sidebarObserver = new MutationObserver(handleNewChangesets);
    if (document.querySelector('#sidebar_content')) {
        sidebarObserver.observe(document.querySelector('#sidebar_content'), {childList: true, subtree: true});
    }
}

function addResolveNotesButton() {
    if (!location.pathname.includes("/note")) return
    if (location.pathname.includes("/note/new")) {
        if (newNotePlaceholder && document.querySelector(".note form textarea")) {
            document.querySelector(".note form textarea").textContent = newNotePlaceholder
            document.querySelector(".note form textarea").selectionEnd = 0
            newNotePlaceholder = null
        }
        return
    }
    if (document.querySelector('.resolve-note-done')) return true;
    if (document.querySelector('#timeback-btn')) return true;
    blurSearchField();

    document.querySelectorAll('#sidebar_content a[href^="/user/"]').forEach(elem => {
        getCachedUserInfo(elem.textContent).then(info => {
            elem.before(makeBadge(info, new Date(elem.parentElement.querySelector("time")?.getAttribute("datetime") ?? new Date())))
        })
    })
    document.querySelectorAll(".overflow-hidden a").forEach(i => {
        i.setAttribute("target", "_blank")
    })

    makeTimesSwitchable()

    try {
        // timeback button
        let timestamp = document.querySelector("#sidebar_content time").dateTime;
        let timeSource = "note creation date"
        const mapsmeDate = document.querySelector(".overflow-hidden")?.textContent?.match(/OSM data version: (\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z)/);
        if (mapsmeDate) {
            timestamp = mapsmeDate[1];
            timeSource = "MAPS.ME snapshot date"
        }
        const organicmapsDate = document.querySelector(".overflow-hidden")?.textContent?.match(/OSM snapshot date: (\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z)/);
        if (organicmapsDate) {
            timestamp = organicmapsDate[1];
            timeSource = "Organic Maps snapshot date"
        }
        const lat = document.querySelector("#sidebar_content .latitude").textContent.replace(",", ".");
        const lon = document.querySelector("#sidebar_content .longitude").textContent.replace(",", ".");
        const zoom = 18;
        const query =
            `// via ${timeSource}
[date:"${timestamp}"]; 
(
  node({{bbox}});
  way({{bbox}});
  //relation({{bbox}});
);
(._;>;);
out meta;
    `;
        let btn = document.createElement("a")
        btn.id = "timeback-btn";
        btn.title = "Open the map state at the time of note creation"
        btn.textContent = " 🕰";
        btn.style.cursor = "pointer"
        document.querySelector("#sidebar_content time").after(btn);
        btn.onclick = () => {
            window.open(`https://overpass-turbo.eu/?Q=${encodeURI(query)}&C=${lat};${lon};${zoom}&R`)
        }
    } catch {
        console.error("setup timeback button fail");
    }

    document.querySelectorAll('#sidebar_content div:has(h4) a:not(.gpx-displayed)').forEach(i => {
        i.classList.add("gpx-displayed")
        const m = i.href.match(new RegExp(`${osm_server.url}/user/.+/traces/(\\d+)`))
        if (m) {
            GM.xmlHttpRequest({
                url: `${osm_server.url}/traces/${m[1]}/data`,
            }).then(res => displayGPXTrack(res.response))
        }
    })

    if (!document.querySelector("#sidebar_content textarea.form-control")) {
        return;
    }
    const auth = makeAuth();
    let note_id = location.pathname.match(/note\/(\d+)/)[1];
    /** @type {string} */
    const resolveButtonsText = GM_config.get("ResolveNotesButton")
    if (resolveButtonsText) {
        JSON.parse(resolveButtonsText).forEach(row => {
            const label = row['label']
            let text = label
            if (row['text'] !== "") {
                text = row['text']
            }
            let b = document.createElement("button");
            b.classList.add("resolve-note-done", "btn", "btn-primary");
            b.textContent = label;
            b.title = `Add to the comment "${text}" and close the note.\nYou can change emoji in userscript settings`
            document.querySelectorAll("form.mb-3")[0].before(b);
            b.after(document.createTextNode("\xA0"));
            b.onclick = () => {
                try {
                    getWindow().OSM.router.stateChange(getWindow().OSM.parseHash(getWindow().OSM.formatHash(getMap())))
                } catch (e) {
                    console.error(e)
                }
                auth.xhr({
                        method: 'POST',
                        path: osm_server.apiBase + 'notes/' + note_id + "/close.json?" + new URLSearchParams({
                            text: text
                        }).toString(),
                        prefix: false,
                    }, (err) => {
                        if (err) {
                            alert(err);
                        }
                        window.location.reload();
                    }
                );
            }
        })
        document.querySelectorAll("form.mb-3")[0].before(document.createElement("p"));
        document.querySelector("form.mb-3 .form-control").rows = 3;
    }
    document.querySelectorAll('#sidebar_content div:has(h4) a').forEach(i => {
        if (i.href.match(/^(https:\/\/streetcomplete\.app\/|https:\/\/westnordost\.de\/).+\.jpg$/)) {
            const img = GM_addElement("img", {
                src: i.href,
                // crossorigin: "anonymous"
            })
            img.style.width = "100%"
            i.after(img)
            document.querySelector("#sidebar").style.resize = "horizontal"
            document.querySelector("#sidebar").style.width = "450px"
            // hideSearchForm()
        }
    })
}

function setupResolveNotesButton(path) {
    if (!path.includes("/note")) return;
    let timerId = setInterval(addResolveNotesButton, 100);
    setTimeout(() => {
        clearInterval(timerId);
        console.debug('stop try add resolve note button');
    }, 3000);
    addResolveNotesButton();
}

function addDeleteButton() {
    if (!location.pathname.includes("/node/")) return;
    if (location.pathname.includes("/history")) return;

    if (document.querySelector('.delete_object_button_class')) return true;

    let match = location.pathname.match(/(node|way)\/(\d+)/);
    if (!match) return;
    let object_type = match[1];
    let object_id = match[2];

    const auth = makeAuth();
    let link = document.createElement('a');
    link.text = ['ru-RU', 'ru'].includes(navigator.language) ? "Выпилить!" : "Delete";
    link.href = "";
    link.classList.add("delete_object_button_class");
    // skip deleted
    if (document.querySelectorAll(".browse-section h4").length < 2 && document.querySelector(".browse-section .latitude") === null) {
        link.setAttribute("hidden", true);
        return;
    }
    // skip having a parent
    if (document.querySelectorAll(".browse-section details").length !== 0) {
        return;
    }

    if (!document.querySelector(".secondary-actions")) return;
    document.querySelector(".secondary-actions").appendChild(link);
    link.after(document.createTextNode("\xA0"));
    link.before(document.createTextNode("\xA0· "));

    if (!document.querySelector(".secondary-actions .edit_tags_class")) {
        const tagsEditorExtensionWaiter = new MutationObserver(() => {
            if (document.querySelector(".secondary-actions .edit_tags_class")) {
                tagsEditorExtensionWaiter.disconnect()

                const tmp = document.createComment('')
                const node1 = document.querySelector(".delete_object_button_class")
                const node2 = document.querySelector(".edit_tags_class")

                node2.replaceWith(tmp)
                node1.replaceWith(node2)
                tmp.replaceWith(node1)

                console.log("Delete button replaced for Tags editor extension capability")
            }
        })
        tagsEditorExtensionWaiter.observe(document.querySelector(".secondary-actions"), {
            childList: true,
            subtree: true
        })
        setTimeout(() => tagsEditorExtensionWaiter.disconnect(), 3000)
    }

    function deleteObject(e) {
        e.preventDefault();
        link.classList.add("dbclicked");

        console.log("Opening changeset");

        auth.xhr({
            method: 'GET',
            path: osm_server.apiBase + object_type + '/' + object_id,
            prefix: false,
        }, function (err, objectInfo) {
            if (err) {
                console.log(err);
                return;
            }

            let tagsHint = ""
            const tags = Array.from(objectInfo.children[0].children[0]?.children)
            for (const i of tags) {
                if (mainTags.includes(i.getAttribute("k"))) {
                    tagsHint = tagsHint + ` ${i.getAttribute("k")}=${i.getAttribute("v")}`;
                    break
                }
            }
            for (const i of tags) {
                if (i.getAttribute("k") === "name") {
                    tagsHint = tagsHint + ` ${i.getAttribute("k")}=${i.getAttribute("v")}`;
                    break
                }
            }
            const changesetTags = {
                'created_by': 'better osm.org',
                'comment': tagsHint !== "" ? `Delete${tagsHint}` : `Delete ${object_type} ${object_id}`
            };

            let changesetPayload = document.implementation.createDocument(null, 'osm');
            let cs = changesetPayload.createElement('changeset');
            changesetPayload.documentElement.appendChild(cs);
            tagsToXml(changesetPayload, cs, changesetTags);
            const chPayloadStr = new XMLSerializer().serializeToString(changesetPayload);

            auth.xhr({
                method: 'PUT',
                path: osm_server.apiBase + 'changeset/create',
                prefix: false,
                content: chPayloadStr
            }, function (err1, result) {
                const changesetId = result;
                console.log(changesetId);
                objectInfo.children[0].children[0].setAttribute('changeset', changesetId);
                auth.xhr({
                    method: 'DELETE',
                    path: osm_server.apiBase + object_type + '/' + object_id,
                    prefix: false,
                    content: objectInfo
                }, function (err2) {
                    if (err2) {
                        console.log({changesetError: err2});
                    }
                    auth.xhr({
                        method: 'PUT',
                        path: osm_server.apiBase + 'changeset/' + changesetId + '/close',
                        prefix: false
                    }, function (err3) {
                        if (!err3) {
                            window.location.reload();
                        }
                    });
                });
            });
        });
    }

    if (GM_config.get("OneClickDeletor")) {
        link.onclick = deleteObject;
    } else {
        link.onclick = (e) => {
            e.preventDefault();
            setTimeout(() => {
                if (!link.classList.contains("dbclicked")) {
                    link.text = "Double click please";
                }
            }, 200);
        }
        link.ondblclick = deleteObject
    }
}

function setupDeletor(path) {
    if (!path.includes("/node/") /*&& !url.includes("/way/")*/) return;
    let timerId = setInterval(addDeleteButton, 100);
    setTimeout(() => {
        clearInterval(timerId);
        console.debug('stop try add delete button');
    }, 3000);
    addDeleteButton();
}

let mapDataSwitcherUnderSupervision = false

function hideNoteHighlight() {
    let g = document.querySelector("g");
    if (!g || g.childElementCount === 0) return;
    let mapDataCheckbox = document.querySelector(".layers-ui li:nth-child(2) > label:nth-child(1) > input:nth-child(1)")
    if (!mapDataCheckbox.checked) {
        if (mapDataSwitcherUnderSupervision) return;
        mapDataSwitcherUnderSupervision = true
        mapDataCheckbox.addEventListener("click", () => {
            mapDataSwitcherUnderSupervision = false
            hideNoteHighlight();
        }, {once: true})
        return;
    }
    if (g.childNodes[g.childElementCount - 1].getAttribute("stroke") === "#FF6200"
        && g.childNodes[g.childElementCount - 1].getAttribute("d").includes("a20,20 0 1,0 -40,0 ")) {
        g.childNodes[g.childElementCount - 1].remove();
        document.querySelector("img.leaflet-marker-icon:last-child").style.filter = "contrast(120%)";
    }
}

function setupHideNoteHighlight(path) {
    if (!path.includes("/note/")) return;
    let timerId = setInterval(hideNoteHighlight, 1000);
    setTimeout(() => {
        clearInterval(timerId);
        console.debug('stop removing note highlight');
    }, 5000);
    hideNoteHighlight();
}

//<editor-fold desc="satellite switching">
const OSMPrefix = "https://tile.openstreetmap.org/"
const ESRIPrefix = "https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/"
const ESRIBetaPrefix = "https://clarity.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/"
let SatellitePrefix = ESRIPrefix
let SAT_MODE = "🛰"
let MAPNIK_MODE = "🗺️"
let currentTilesMode = MAPNIK_MODE;
let tilesObserver = undefined;

function invertTilesMode(mode) {
    return mode === "🛰" ? "🗺️" : "🛰";
}

function parseOSMTileURL(url) {
    let match = url.match(new RegExp(`${OSMPrefix}(\\d+)\\/(\\d+)\\/(\\d+)\\.png`))
    if (!match) {
        return false
    }
    return {
        x: match[2],
        y: match[3],
        z: match[1],
    }
}

function parseESRITileURL(url) {
    let match = url.match(new RegExp(`${SatellitePrefix}(\\d+)\\/(\\d+)\\/(\\d+)`))
    if (!match) {
        return false
    }
    return {
        x: match[3],
        y: match[2],
        z: match[1],
    }
}

function switchESRIbeta() {
    const NewSatellitePrefix = SatellitePrefix === ESRIPrefix ? ESRIBetaPrefix : ESRIPrefix;
    document.querySelectorAll(".leaflet-tile").forEach(i => {
        if (i.nodeName !== 'IMG') {
            return;
        }
        let xyz = parseESRITileURL(i.src)
        if (!xyz) return
        i.src = NewSatellitePrefix + xyz.z + "/" + xyz.y + "/" + xyz.x;
    })
    SatellitePrefix = NewSatellitePrefix
    if (SatellitePrefix === ESRIBetaPrefix) {
        getMap()?.attributionControl?.setPrefix("ESRI Beta")
    } else {
        getMap()?.attributionControl?.setPrefix("ESRI")
    }
}

function switchTiles() {
    if (tilesObserver) {
        tilesObserver.disconnect();
    }
    currentTilesMode = invertTilesMode(currentTilesMode);
    if (currentTilesMode === SAT_MODE) {
        if (SatellitePrefix === ESRIBetaPrefix) {
            getMap()?.attributionControl?.setPrefix("ESRI Beta")
        } else {
            getMap()?.attributionControl?.setPrefix("ESRI")
        }
    } else {
        getMap()?.attributionControl?.setPrefix("")
    }
    document.querySelectorAll(".leaflet-tile").forEach(i => {
        if (i.nodeName !== 'IMG') {
            return;
        }
        if (currentTilesMode === SAT_MODE) {
            let xyz = parseOSMTileURL(i.src)
            if (!xyz) return
            i.src = SatellitePrefix + xyz.z + "/" + xyz.y + "/" + xyz.x;
            if (i.complete) {
                i.classList.add("no-invert");
            } else {
                i.addEventListener("load", e => {
                    e.target.classList.add("no-invert");
                }, {once: true})
            }
            /*
            const newImg = GM_addElement(document.body, "img", {
                src: SatellitePrefix + xyz.z + "/" + xyz.y + "/" + xyz.x
            })
            newImg.classList = i.classList
            newImg.style.cssText = i.style.cssText;
            i.replaceWith(newImg)
            */
        } else {
            let xyz = parseESRITileURL(i.src)
            if (!xyz) return
            i.src = OSMPrefix + xyz.z + "/" + xyz.x + "/" + xyz.y + ".png";
            if (i.complete) {
                i.classList.remove("no-invert");
            } else {
                i.addEventListener("load", e => {
                    e.target.classList.remove("no-invert");
                }, {once: true})
            }
        }
    })
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeName !== 'IMG') {
                    return;
                }
                if (currentTilesMode === SAT_MODE) {
                    let xyz = parseOSMTileURL(node.src);
                    if (!xyz) return
                    node.src = SatellitePrefix + xyz.z + "/" + xyz.y + "/" + xyz.x;
                    if (node.complete) {
                        node.classList.add("no-invert");
                    } else {
                        node.addEventListener("load", e => {
                            e.target.classList.add("no-invert");
                        }, {once: true})
                    }
                    /*
                    const newImg = GM_addElement(document.body, "img", {
                        src: SatellitePrefix + xyz.z + "/" + xyz.y + "/" + xyz.x
                    })
                    newImg.classList = node.classList
                    newImg.style.cssText = node.style.cssText;
                    node.replaceWith(newImg)
                    */
                } else {
                    let xyz = parseESRITileURL(node.src)
                    if (!xyz) return
                    node.src = OSMPrefix + xyz.z + "/" + xyz.x + "/" + xyz.y + ".png";
                    if (node.complete) {
                        node.classList.remove("no-invert");
                    } else {
                        node.addEventListener("load", e => {
                            e.target.classList.remove("no-invert");
                        }, {once: true})
                    }
                }
            });
        });
    });
    tilesObserver = observer;
    observer.observe(document.body, {childList: true, subtree: true});
}

function addSatelliteLayers() {
    const btnOnPane = document.createElement("span");
    let btnOnNotePage = document.createElement("span");
    if (!document.querySelector('.turn-on-satellite-from-pane')) {
        const mapnikBtn = document.querySelector(".layers-ui label span")
        if (mapnikBtn) {
            if (!tilesObserver) {
                btnOnPane.textContent = "🛰";
            } else {
                btnOnPane.textContent = invertTilesMode(currentTilesMode);
            }
            btnOnPane.style.cursor = "pointer";
            btnOnPane.classList.add("turn-on-satellite-from-pane");
            btnOnPane.title = "Switch between map and satellite images.\nAlso you press key S, press with Shift for ESRI beta"
            mapnikBtn.appendChild(document.createTextNode("\xA0"));
            mapnikBtn.appendChild(btnOnPane);

            btnOnPane.onclick = (e) => {
                e.stopImmediatePropagation()
                if (e.shiftKey) {
                    switchESRIbeta()
                    return
                }
                switchTiles();
                btnOnNotePage.textContent = invertTilesMode(currentTilesMode);
                btnOnPane.textContent = invertTilesMode(currentTilesMode);
            }
        }
    }
    if (!location.pathname.includes("/note")) return;
    if (document.querySelector('.turn-on-satellite')) return true;
    if (!document.querySelector("#sidebar_content h4")) {
        return;
    }
    if (!tilesObserver) {
        btnOnNotePage.textContent = "🛰";
    } else {
        btnOnNotePage.textContent = invertTilesMode(currentTilesMode);
    }
    btnOnNotePage.style.cursor = "pointer";
    btnOnNotePage.classList.add("turn-on-satellite");
    btnOnNotePage.title = "Switch between map and satellite images. Only for Firefox"
    // todo disable for Chrome
    document.querySelectorAll("h4")[0].appendChild(document.createTextNode("\xA0"));
    document.querySelectorAll("h4")[0].appendChild(btnOnNotePage);

    btnOnNotePage.onclick = () => {
        switchTiles();
        btnOnNotePage.textContent = invertTilesMode(currentTilesMode);
        btnOnPane.textContent = invertTilesMode(currentTilesMode);
    }
}

function setupSatelliteLayers() {
    if (!navigator.userAgent.includes("Firefox")) return
    let timerId = setInterval(addSatelliteLayers, 100);
    setTimeout(() => {
        clearInterval(timerId);
        console.debug('stop try add resolve note button');
    }, 3000);
    addSatelliteLayers();
}

//</editor-fold>

function makeHistoryCompact() {
    // todo -> toogleAttribute
    if (document.querySelector(".compact-toggle-btn").textContent === "><") {
        document.querySelectorAll(".non-modified-tag").forEach((el) => {
            el.classList.replace("non-modified-tag", "hidden-non-modified-tag")
        })
        document.querySelectorAll(".empty-version").forEach((el) => {
            el.classList.replace("empty-version", "hidden-empty-version")
        })
        document.querySelectorAll(".preview-img-link img").forEach(i => {
            i.style.display = "none"
        })
        document.querySelector(".compact-toggle-btn").textContent = "<>"
    } else {
        document.querySelectorAll(".hidden-non-modified-tag").forEach((el) => {
            el.classList.replace("hidden-non-modified-tag", "non-modified-tag")
        })
        document.querySelectorAll(".hidden-empty-version").forEach((el) => {
            el.classList.replace("hidden-empty-version", "empty-version")
        })
        document.querySelectorAll(".preview-img-link img").forEach(i => {
            i.style.display = ""
        })
        document.querySelector(".compact-toggle-btn").textContent = "><"
    }
}

function copyAnimation(e, text) {
    console.log(`Copying ${text} to clipboard was successful!`);
    e.target.classList.add("copied");
    setTimeout(() => {
        e.target.classList.remove("copied");
        e.target.classList.add("was-copied");
        setTimeout(() => e.target.classList.remove("was-copied"), 300);
    }, 300);
}

//<editor-fold desc="find deleted user in diffs" defaultstate="collapsed">
async function decompressBlob(blob) {
    let ds = new DecompressionStream("gzip");
    let decompressedStream = blob.stream().pipeThrough(ds);
    return await new Response(decompressedStream).blob();
}

async function tryFindChangesetInDiffGZ(gzURL, changesetId) {
    const diffGZ = await GM.xmlHttpRequest({
        method: "GET",
        url: gzURL,
        responseType: "blob"
    });
    let blob = await decompressBlob(diffGZ.response);
    let diffXML = await blob.text()

    const diffParser = new DOMParser();
    const doc = diffParser.parseFromString(diffXML, "application/xml");
    return doc.querySelector(`osm changeset[id='${changesetId}']`)
}

async function parseBBB(target, url) {
    const response = await GM.xmlHttpRequest({
        method: "GET",
        url: planetOrigin + "/replication/changesets/" + url,
    });
    const parser = new DOMParser();
    const BBBHTML = parser.parseFromString(response.responseText, "text/html");

    let a = Array.from(BBBHTML.querySelector("pre").childNodes).slice(2)
    let x = 0;
    let found = false;
    for (x; x < a.length; x += 2) {
        let d = new Date(a[x + 1].textContent.trim().slice(0, -1).trim())
        if (target < d) {
            found = true;
            break
        }
    }
    if (x === 0) {
        return found ? [a[x].getAttribute("href"), a[x].getAttribute("href")] : false
    } else {
        return found ? [a[x].getAttribute("href"), a[x - 2].getAttribute("href")] : false
    }
}

async function parseCCC(target, url) {
    const response = await GM.xmlHttpRequest({
        method: "GET",
        url: planetOrigin + "/replication/changesets/" + url,
    });
    const parser = new DOMParser();
    const CCCHTML = parser.parseFromString(response.responseText, "text/html");

    let a = Array.from(CCCHTML.querySelector("pre").childNodes).slice(2)
    let x = 0;
    let found = false;
    /**
     * HTML format:
     *              xxx.ext         datetime
     *              xxx.state.txt   datetime <for new changesets>
     *              file.tmp        datetime <sometimes>
     *              yyy.ext         ....
     */
    for (x; x < a.length; x += 2) {
        if (!a[x].textContent.match(/^\d+\.osm\.gz$/)) {
            continue
        }
        let d = new Date(a[x + 1].textContent
            .trim().slice(0, -1).trim()
            .split(" ").slice(0, -1).join(" ").trim() + ' UTC')
        if (target <= d) {
            found = true;
            break
        }
    }
    if (!found) {
        return false
    }
    if (x + 2 >= a.length) {
        return [a[x].getAttribute("href"), a[x].getAttribute("href")]
    }
    try {
        // state files are missing in old diffs folders
        if (a[x + 2].getAttribute("href")?.match(/^\d+\.osm\.gz$/)) {
            return [a[x].getAttribute("href"), a[x + 2].getAttribute("href")]
        }
    } catch { /* empty */
    }
    if (x + 4 >= a.length) {
        return [a[x].getAttribute("href"), a[x].getAttribute("href")]
    }
    return [a[x].getAttribute("href"), a[x + 4].getAttribute("href")]
}

async function checkBBB(AAA, BBB, targetTime, targetChangesetID) {
    let CCC = await parseCCC(targetTime, AAA + BBB);
    if (!CCC) {
        return;
    }
    let gzURL = planetOrigin + "/replication/changesets/" + AAA + BBB;

    let foundedChangeset = await tryFindChangesetInDiffGZ(gzURL + CCC[0], targetChangesetID)
    if (!foundedChangeset) {
        foundedChangeset = await tryFindChangesetInDiffGZ(gzURL + CCC[1], targetChangesetID)
    }
    return foundedChangeset
}

async function checkAAA(AAA, targetTime, targetChangesetID) {
    let BBBs = await parseBBB(targetTime, AAA)
    if (!BBBs) {
        return
    }

    let foundedChangeset = await checkBBB(AAA, BBBs[0], targetTime, targetChangesetID);
    if (!foundedChangeset) {
        foundedChangeset = await checkBBB(AAA, BBBs[1], targetTime, targetChangesetID);
    }
    return foundedChangeset
}

// tests
// https://osm.org/way/488322838/history
// https://osm.org/way/74034517/history
// https://osm.org/relation/17425783/history
// https://osm.org/way/554280669/history
// https://osm.org/node/4122049406 (/replication/changesets/005/638/ contains .tmp files)
// https://osm.org/node/2/history (very hard)
async function findChangesetInDiff(e) {
    e.preventDefault()
    e.stopPropagation()
    e.target.style.cursor = "progress"

    let foundedChangeset;
    try {
        const match = location.pathname.match(/\/(node|way|relation)\/(\d+)/)
        const [, type, objID] = match
        if (type === "node") {
            foundedChangeset = await getNodeViaOverpassXML(objID, e.target.datetime)
        } else if (type === "way") {
            foundedChangeset = await getWayViaOverpassXML(objID, e.target.datetime)
        } else if (type === "relation") {
            foundedChangeset = await getRelationViaOverpassXML(objID, e.target.datetime)
        }
        if (!foundedChangeset.getAttribute("user")) {
            foundedChangeset = null
            console.log("Loading via overpass failed. Try via diffs")
            throw ""
        }
    } catch {
        const response = await GM.xmlHttpRequest({
            method: "GET",
            url: planetOrigin + "/replication/changesets/",
        });
        const parser = new DOMParser();
        const AAAHTML = parser.parseFromString(response.responseText, "text/html");
        const targetTime = new Date(e.target.datetime)
        targetTime.setSeconds(0)
        const targetChangesetID = e.target.value;

        let a = Array.from(AAAHTML.querySelector("pre").childNodes).slice(2).slice(0, -4)
        a.push(...a.slice(-2))
        let x = 0;
        for (x; x < a.length - 2; x += 2) {
            let d = new Date(a[x + 1].textContent.trim().slice(0, -1).trim())
            if (targetTime < d) break
        }
        let AAAs;
        if (x === 0) {
            AAAs = [a[x].getAttribute("href"), a[x].getAttribute("href")]
        } else {
            AAAs = [a[x - 2].getAttribute("href"), a[x].getAttribute("href")]
        }

        foundedChangeset = await checkAAA(AAAs[0], targetTime, targetChangesetID);
        if (!foundedChangeset) {
            foundedChangeset = await checkAAA(AAAs[1], targetTime, targetChangesetID);
        }
        if (!foundedChangeset) {
            alert(":(")
            return
        }
    }

    let userInfo = document.createElement("span")
    userInfo.style.cursor = "pointer"
    userInfo.style.background = "#fff181"
    if (isDarkMode()) {
        userInfo.style.color = "black"
    }
    userInfo.textContent = foundedChangeset.getAttribute("user")

    function clickForCopy(e) {
        e.preventDefault();
        let id = e.target.innerText;
        navigator.clipboard.writeText(id).then(() => copyAnimation(e, id));
    }

    userInfo.onclick = clickForCopy
    e.target.before(document.createTextNode("\xA0"))
    e.target.before(userInfo)
    e.target.before(document.createTextNode("\xA0"))

    let uid = document.createElement("span")
    uid.style.background = "#9cff81"
    uid.style.cursor = "pointer"
    if (isDarkMode()) {
        uid.style.color = "black"
    }
    uid.onclick = clickForCopy
    uid.textContent = `${foundedChangeset.getAttribute("uid")}`
    e.target.before(uid)
    e.target.before(document.createTextNode("\xA0"))

    const webArchiveLink = document.createElement("a")
    webArchiveLink.textContent = "WebArchive"
    webArchiveLink.target = "_blank"
    webArchiveLink.href = "https://web.archive.org/web/*/https://www.openstreetmap.org/user/" + foundedChangeset.getAttribute("user")
    e.target.before(webArchiveLink)
    e.target.before(document.createTextNode("\xA0"))

    e.target.remove()
}

//</editor-fold>

/**
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 */
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    function deg2rad(deg) {
        return deg * (Math.PI / 180)
    }

    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function blurSearchField() {
    if (document.querySelector("#query") && !document.querySelector("#query").getAttribute("blured")) {
        document.querySelector("#query").setAttribute("blured", "true")
        document.activeElement?.blur()
    }
}


function makePanoramaxValue(elem) {
    elem.innerHTML = elem.innerHTML.replaceAll(/([0-9a-z-]+)/g, function (match) {
        const a = document.createElement("a")
        a.textContent = match
        a.classList.add("preview-img-link")
        a.target = "_blank"
        a.href = "https://api.panoramax.xyz/#focus=pic&pic=" + match
        return a.outerHTML
    })
    elem.querySelectorAll('a.preview-img-link').forEach(a => {
        const img = GM_addElement("img", {
            src: `https://api.panoramax.xyz/api/pictures/${a.textContent}/sd.jpg`,
            // crossorigin: "anonymous"
        })
        img.style.width = "100%"
        a.appendChild(img)
    })
    elem.onclick = e => {
        e.stopImmediatePropagation()
    }
}

function makeMapillaryValue(elem) {
    elem.innerHTML = elem.innerHTML.replaceAll(/([0-9]+)/g, function (match) {
        const a = document.createElement("a")
        a.textContent = match
        a.target = "_blank"
        a.href = "https://www.mapillary.com/app/?pKey=" + match
        return a.outerHTML
    })
    elem.onclick = e => {
        e.stopImmediatePropagation()
    }
}

function makeWikimediaCommonsValue(elem) {
    elem.querySelectorAll('a[href^="//commons.wikimedia.org/wiki/"]:not(.preview-img-link)').forEach(a => {
        a.classList.add("preview-img-link")
        setTimeout(async () => {
            const res = (await GM.xmlHttpRequest({
                url: `https://en.wikipedia.org/w/api.php?` + new URLSearchParams({
                    action: "query",
                    iiprop: "url",
                    prop: "imageinfo",
                    titles: a.textContent,
                    format: "json"
                }).toString(),
                responseType: "json"
            })).response
            const img = GM_addElement("img", {
                src: res['query']['pages']["-1"]["imageinfo"][0]['url'],
                // crossorigin: "anonymous"
            })
            img.style.width = "100%"
            a.appendChild(img)
        })
    })
}

// example https://osm.org/node/6506618057
function makeLinksInTagsClickable() {
    document.querySelectorAll(".browse-tag-list tr").forEach(i => {
        const key = i.querySelector("th")?.textContent?.toLowerCase()
        if (key === "fixme") {
            i.querySelector("td").classList.add("fixme-tag")
        } else if (key.startsWith("panoramax")) {
            if (!i.querySelector("td a")) {
                makePanoramaxValue(i.querySelector("td"))
            }
        } else if (key.startsWith("mapillary")) {
            if (!i.querySelector("td a")) {
                makeMapillaryValue(i.querySelector("td"))
            }
        } else if (key === "xmas:feature" && !document.querySelector(".egg-snow-tag") || i.querySelector("td").textContent.includes("snow")) {
            const curDate = new Date()
            if (curDate.getMonth() === 11 && curDate.getDate() >= 18 || curDate.getMonth() === 0 && curDate.getDate() < 10) {
                const snowBtn = document.createElement("span")
                snowBtn.classList.add("egg-snow-tag")
                snowBtn.textContent = " ❄️"
                snowBtn.style.cursor = "pointer"
                snowBtn.title = "better-osm-org easter egg"
                snowBtn.addEventListener("click", (e) => {
                    e.target.style.display = "none"
                    runSnow()
                }, {
                    once: true
                })
                document.querySelector(".browse-tag-list").parentElement.previousElementSibling.appendChild(snowBtn)
            }
        } else if (key === "wikimedia_commons") {
            makeWikimediaCommonsValue(i.querySelector("td"));
        }
    })
    const tagsTable = document.querySelector(".browse-tag-list")
    if (tagsTable) {
        tagsTable.parentElement.previousElementSibling.title = tagsTable.querySelectorAll("tr th").length + " tags"
    }
}

function addHistoryLink() {
    if (!location.pathname.includes("/node")
        && !location.pathname.includes("/way")
        && !location.pathname.includes("/relation")
        || location.pathname.includes("/history")
    ) return;
    if (document.querySelector('.history_button_class')) return true;
    let versionInSidebar = document.querySelector("#sidebar_content h4 a")
    if (!versionInSidebar) {
        return
    }
    let a = document.createElement("a")
    let curHref = document.querySelector("#sidebar_content h4 a").href.match(/(.*)\/(\d+)$/)
    a.href = curHref[1]
    a.textContent = "🕒"
    a.classList.add("history_button_class")
    if (curHref[2] !== "1") {
        versionInSidebar.after(a)
        versionInSidebar.after(document.createTextNode("\xA0"))
    }
    blurSearchField();
    makeTimesSwitchable();
    if (GM_config.get("ResizableSidebar")) {
        document.querySelector("#sidebar").style.resize = "horizontal"
    }
    makeLinksInTagsClickable()
    makeHashtagsClickable()
    shortOsmOrgLinks(document.querySelector(".browse-section p"))
    setTimeout(() => {
        GM_addElement(document.head, "style", {
            textContent: `
            table.browse-tag-list tr td[colspan="2"]{
                background: var(--bs-body-bg) !important;
            }`,
        }, 0);
    })
}


//<editor-fold desc="render functions" defaultstate="collapsed">
// For WebStorm: Settings | Editor | Language Injections
// Places Patterns + jsLiteralExpression(jsArgument(jsReferenceExpression().withQualifiedName("injectJSIntoPage"), 0))

/**
 * @param {string} text
 */
function injectJSIntoPage(text) {
    GM_addElement("script", {
        textContent: text
    })
}

const layers = {
    customObjects: [],
    activeObjects: []
}

function intoPage(obj) {
    return cloneInto(obj, getWindow())
}

function intoPageWithFun(obj) {
    return cloneInto(obj, getWindow(), {cloneFunctions: true})
}

/**
 * @name showWay
 * @memberof unsafeWindow
 * @param {[]} nodesList
 * @param {string=} color
 * @param {boolean} needFly
 * @param {boolean} addStroke
 */
function showWay(nodesList, color = "#000000", needFly = false, addStroke = false) {
    cleanCustomObjects()
    const line = getWindow().L.polyline(
        intoPage(nodesList.map(elem => getWindow().L.latLng(intoPage(elem)))),
        intoPage({
            color: color,
            weight: 4,
            clickable: false,
            opacity: 1,
            fillOpacity: 1
        })
    ).addTo(getMap());
    if (addStroke) {
        line._path.classList.add("stroke-polyline")
    }
    layers["customObjects"].push(line);
    if (needFly) {
        if (nodesList.length) {
            fitBounds(get4Bounds(line))
        }
    }
}

/**
 * @name showWays
 * @memberof unsafeWindow
 * @param {[][]} ListOfNodesList
 * @param {string=} layerName
 * @param {string=} color
 */
function showWays(ListOfNodesList, layerName = "customObjects", color = "#000000") {
    cleanObjectsByKey(layerName)
    ListOfNodesList.forEach(nodesList => {
        const line = getWindow().L.polyline(
            intoPage(nodesList.map(elem => getWindow().L.latLng(intoPage(elem)))),
            intoPage({
                color: color,
                weight: 4,
                clickable: false,
                opacity: 1,
                fillOpacity: 1
            })
        ).addTo(getMap());
        layers[layerName].push(line);
    })
}


/**
 * @name displayWay
 * @memberof unsafeWindow
 * @param {[]} nodesList
 * @param {boolean=} needFly
 * @param {string=} color
 * @param {number=} width
 * @param {string|number|null=} infoElemID
 * @param {string=null} layerName
 * @param {string|null=} dashArray
 * @param {string|null=} popupContent
 * @param {boolean|null=} addStroke
 * @param {boolean=} geometryCached
 */
function displayWay(nodesList, needFly = false, color = "#000000", width = 4, infoElemID = null, layerName = "customObjects", dashArray = null, popupContent = null, addStroke = null, geometryCached = false) {
    if (!layers[layerName]) {
        layers[layerName] = []
    }

    function bindPopup(line, popup) {
        if (popup) return line.bindPopup(popup)
        return line
    }

    const line = bindPopup(getWindow().L.polyline(
        geometryCached ? nodesList : intoPage(nodesList),
        intoPage({
            color: color,
            weight: width,
            clickable: false,
            opacity: 1,
            fillOpacity: 1,
            dashArray: dashArray
        })
    ), popupContent).addTo(getMap());
    layers[layerName].push(line);
    if (needFly) {
        getMap().flyTo(intoPage(line.getBounds().getCenter()), 18, intoPage({
            animate: false,
            duration: 0.5
        }));
    }
    if (infoElemID) {
        layers[layerName][layers[layerName].length - 1].on('click', cloneInto(function () {
            const elementById = document.getElementById(infoElemID);
            elementById?.scrollIntoView()
            resetMapHover()
            elementById?.parentElement?.parentElement?.classList.add("map-hover")
            cleanObjectsByKey("activeObjects")
        }, getWindow(), {cloneFunctions: true,}))
    }
    if (addStroke) {
        line._path.classList.add("stroke-polyline");
    }
    return line
}

/**
 * @name showNodeMarker
 * @memberof unsafeWindow
 * @param {string|float} a
 * @param {string|float} b
 * @param {string=} color
 * @param {string|number|null=null} infoElemID
 * @param {string=} layerName
 * @param {number=} radius
 */
function showNodeMarker(a, b, color = "#00a500", infoElemID = null, layerName = 'customObjects', radius = 5) {
    const haloStyle = {
        weight: 2.5,
        radius: radius,
        fillOpacity: 0,
        color: color
    };
    layers[layerName].push(getWindow().L.circleMarker(getWindow().L.latLng(a, b), intoPage(haloStyle)).addTo(getMap()));
    if (infoElemID) {
        layers[layerName][layers[layerName].length - 1].on('click', cloneInto(function () {
            const elementById = document.getElementById("n" + infoElemID);
            elementById?.scrollIntoView()
            resetMapHover()
            elementById?.parentElement?.parentElement.classList?.add("map-hover")
        }, getWindow(), {cloneFunctions: true}))
    }
}

/**
 * @name showActiveNodeMarker
 * @memberof unsafeWindow
 * @param {string} lat
 * @param {string} lon
 * @param {string} color
 * @param {boolean=true} removeActiveObjects
 */
function showActiveNodeMarker(lat, lon, color, removeActiveObjects = true) {
    const haloStyle = {
        weight: 2.5,
        radius: 5,
        fillOpacity: 0,
        color: color
    };
    if (removeActiveObjects) {
        cleanObjectsByKey("activeObjects")
    }
    layers["activeObjects"].push(getWindow().L.circleMarker(getWindow().L.latLng(lat, lon), intoPage(haloStyle)).addTo(getMap()));
}

/**
 * @name showActiveWay
 * @memberof unsafeWindow
 * @param {[]} nodesList
 * @param {string=} color
 * @param {boolean=} needFly
 * @param {string|number=null} infoElemID
 * @param {boolean=true} removeActiveObjects
 * @param {number=} weight
 * @param {string=} dashArray
 */
function showActiveWay(nodesList, color = "#ff00e3", needFly = false, infoElemID = null, removeActiveObjects = true, weight = 4, dashArray = null) {
    const line = getWindow().L.polyline(
        intoPage(nodesList.map(elem => intoPage(getWindow().L.latLng(intoPage(elem))))),
        intoPage({
            color: color,
            weight: weight,
            clickable: false,
            opacity: 1,
            fillOpacity: 1,
            dashArray: dashArray
        })
    ).addTo(getMap());
    if (removeActiveObjects) {
        cleanObjectsByKey("activeObjects")
    }
    layers["activeObjects"].push(line);
    if (needFly) {
        fitBounds(get4Bounds(line))
    }
    if (infoElemID) {
        layers["activeObjects"][layers["activeObjects"].length - 1].on('click', cloneInto(function () {
            const elementById = document.getElementById("w" + infoElemID);
            elementById?.scrollIntoView()
            resetMapHover()
            elementById.classList.add("map-hover")
        }, getWindow(), {cloneFunctions: true}))
    }
}

/**
 * @name cleanObjectsByKey
 * @param {string} key
 * @memberof unsafeWindow
 */
function cleanObjectsByKey(key) {
    if (layers[key]) {
        layers[key]?.forEach(i => i.remove())
        layers[key] = []
    }
}

/**
 * @name cleanCustomObjects
 * @memberof unsafeWindow
 */
function cleanCustomObjects() {
    layers["customObjects"].forEach(i => i.remove())
    layers["customObjects"] = []
}

/**
 * @name panTo
 * @memberof unsafeWindow
 * @param {string} lat
 * @param {string} lon
 * @param {number=} zoom
 * @param {boolean=} animate
 */
function panTo(lat, lon, zoom = 18, animate = false) {
    getMap().flyTo(intoPage([lat, lon]), zoom, intoPage({animate: animate}));
}

function get4Bounds(b) {
    try {
        return [
            [b.getBounds().getSouth(), b.getBounds().getWest()],
            [b.getBounds().getNorth(), b.getBounds().getEast()]
        ]
    } catch {
        console.error("Please, reload page")
    }
}

/**
 * @name fitBounds
 * @memberof unsafeWindow
 */
function fitBounds(bound) {
    getMap().fitBounds(intoPageWithFun(bound));
}

/**
 * @name fitBoundsWithPadding
 * @memberof unsafeWindow
 */
function fitBoundsWithPadding(bound, padding) {
    getMap().fitBounds(intoPageWithFun(bound), intoPage({padding: [padding, padding]}));
}

/**
 * @name setZoom
 * @memberof unsafeWindow
 */
function setZoom(zoomLevel) {
    getMap().setZoom(zoomLevel);
}


function cleanAllObjects() {
    for (let member in layers) {
        layers[member].forEach((i) => {
            i.remove();
        })
        layers[member] = []
    }
}

//</editor-fold>

let abortDownloadingController = new AbortController();

/**
 * @typedef {Object} ObjectVersion
 * @property {number} version
 * @property {number} id
 * @property {boolean} visible
 * @property {string} timestamp
 */
/**
 * @typedef {Object} NodeVersion
 * @extends ObjectVersion
 * @property {number} version
 * @property {number} id
 * @property {number} changeset
 * @property {number} uid
 * @property {string} user
 * @property {boolean} visible
 * @property {string} timestamp
 * @property {'node'|'way'|'relation'} type
 * @property {float} lat
 * @property {float} lon
 * @property {Object.<string, string>=} tags
 */

/**
 * @type {Object.<string, NodeVersion[]>}
 */
const nodesHistories = {}

/**
 * @type {Object.<string, WayVersion[]>}
 */
const waysRedactedVersions = {}

/**
 * @type {Object.<string, WayVersion[]>}
 */
const waysHistories = {}

/**
 * @type {Object.<string, RelationVersion[]>}
 */
const relationsHistories = {}

const histories = {
    node: nodesHistories,
    way: waysHistories,
    relation: relationsHistories
}

/**
 *
 * @type {Object.<number, XMLDocument>}
 */
let changesetsCache = {}
/**
 * @type {Object.<number, Set<number>>}
 */
let nodesWithParentWays = {};
/**
 * @type {Object.<number, Set<number>>}
 */
let nodesWithOldParentWays = {};

// TODO кажется это всё нужно чистить


/**
 * @param {string|number} id
 */
async function getChangeset(id) {
    if (changesetsCache[id]) {
        return changesetsCache[id];
    }
    const res = await fetch(osm_server.apiBase + "changeset" + "/" + id + "/download", {signal: abortDownloadingController.signal});
    if (res.status === 509) {
        await error509Handler(res)
    } else {
        const parser = new DOMParser();
        changesetsCache[id] = /** @type {XMLDocument} **/ parser.parseFromString(await res.text(), "application/xml");
        nodesWithParentWays[id] = new Set(Array.from(changesetsCache[id].querySelectorAll("way > nd")).map(i => parseInt(i.getAttribute("ref"))))
        nodesWithOldParentWays[id] = new Set(Array.from(changesetsCache[id].querySelectorAll("way:not([version='1']) > nd")).map(i => parseInt(i.getAttribute("ref"))))
        return changesetsCache[id]
    }
}

function setupNodeVersionView() {
    const match = location.pathname.match(/\/node\/(\d+)\//);
    if (match === null) return;
    let nodeHistoryPath = []
    document.querySelectorAll(".browse-node span.latitude").forEach(i => {
        let lat = i.textContent.replace(",", ".")
        let lon = i.nextElementSibling.textContent.replace(",", ".")
        nodeHistoryPath.push([lat, lon])
        i.parentElement.parentElement.onmouseenter = () => {
            showActiveNodeMarker(lat, lon, "#ff00e3");
        }
        i.parentElement.parentElement.parentElement.parentElement.onclick = (e) => {
            if (e.altKey) return;
            if (e.target.tagName === "A" || e.target.tagName === "TIME" || e.target.tagName === "SUMMARY") {
                return
            }
            panTo(lat, lon);
            showActiveNodeMarker(lat, lon, "#ff00e3");
        }
    })
    displayWay(cloneInto(nodeHistoryPath, unsafeWindow), false, "rgba(251,156,112,0.86)", 2);
}


/**
 * @param {number[]} nodes
 * @return {Promise<NodeVersion[][]>}
 */
async function loadNodesViaHistoryCalls(nodes) {
    async function _do(nodes) {
        const targetNodesHistory = []
        for (const nodeID of nodes) {
            if (nodesHistories[nodeID]) {
                targetNodesHistory.push(nodesHistories[nodeID]);
            } else {
                const res = await fetch(osm_server.apiBase + "node" + "/" + nodeID + "/history.json", {signal: abortDownloadingController.signal});
                nodesHistories[nodeID] = (await res.json()).elements
                targetNodesHistory.push(nodesHistories[nodeID]);
            }
        }
        return targetNodesHistory
    }

    return (await Promise.all(arraySplit(nodes, 5).map(_do))).flat()
}

/**
 * @param {number|string} nodeID
 * @return {Promise<NodeVersion[]>}
 */
async function getNodeHistory(nodeID) {
    if (nodesHistories[nodeID]) {
        console.count("Node history hit")
        return nodesHistories[nodeID];
    } else {
        console.count("Node history miss")
        const res = await fetch(osm_server.apiBase + "node" + "/" + nodeID + "/history.json", {signal: abortDownloadingController.signal});
        return nodesHistories[nodeID] = (await res.json()).elements;
    }
}

/**
 * @typedef {Object} WayVersion
 * @property {number} id
 * @property {number} changeset
 * @property {number} uid
 * @property {string} user
 * @property {number[]=} [nodes]
 * @property {number} version
 * @property {boolean} visible
 * @property {string} timestamp
 * @property {'node'|'way'|'relation'} type
 * @property {Object.<string, string>=} [tags]
 */
/**
 * @param {number|string} wayID
 * @return {Promise<WayVersion[]>}
 */
async function getWayHistory(wayID) {
    if (waysHistories[wayID]) {
        return waysHistories[wayID];
    } else {
        const res = await fetch(osm_server.apiBase + "way" + "/" + wayID + "/history.json", {signal: abortDownloadingController.signal});
        return waysHistories[wayID] = (await res.json()).elements;
    }
}


/**
 * @param {string|number} wayID
 * @param {number} version
 * @param {string|number|null=} changesetID
 * @return {Promise<[WayVersion, NodeVersion[][]]>}
 */
async function loadWayVersionNodes(wayID, version, changesetID = null) {
    console.debug("Loading way", wayID, version)
    const wayHistory = await getWayHistory(wayID)

    const targetVersion = Array.from(wayHistory).find(v => v.version === version)
    if (!targetVersion) {
        throw `loadWayVersionNodes failed ${wayID}, ${version}`
    }
    if (!targetVersion.nodes || targetVersion.nodes.length === 0) {
        return [targetVersion, []]
    }
    const notCached = targetVersion.nodes.filter(nodeID => !nodesHistories[nodeID])
    console.debug("Not cached nodes histories for download:", notCached.length, "/", targetVersion.nodes)
    if (notCached.length < 2 || osm_server === local_server) { // https://github.com/openstreetmap/openstreetmap-website/issues/5183
        return [targetVersion, await loadNodesViaHistoryCalls(targetVersion.nodes)]
    }
    // todo batchSize должен быть динамический
    // Максимальная длина урла 8213 символов.
    // 400 взято с запасом, что для точки нужно 20 символов
    // пример точки: 123456789012v1234,
    const batchSize = 410
    const lastVersions = []
    const batches = []
    for (let i = 0; i < notCached.length; i += batchSize) {
        console.debug(`Batch #${i}/${notCached.length}`)
        batches.push(notCached.slice(i, i + batchSize))
    }
    await Promise.all(batches.map(async (batch) => {
        const res = await fetch(osm_server.apiBase + "nodes.json?nodes=" + batch.join(","), {signal: abortDownloadingController.signal});
        const nodes = (await res.json()).elements
        lastVersions.push(...nodes)
        nodes.forEach(n => {
            if (n.version === 1) {
                nodesHistories[n.id] = [n]
            }
        })
    }))

    const longHistoryNodes = lastVersions.filter(n => n?.version !== 1)
    const lastVersionsMap = Object.groupBy(lastVersions, ({id}) => id)

    console.debug("Nodes with multiple versions: ", longHistoryNodes.length);
    if (longHistoryNodes.length === 0) {
        return [targetVersion, targetVersion.nodes.map(nodeID => nodesHistories[nodeID])]
    }

    const queryArgs = [""]
    const maxQueryArgLen = 8213 - (osm_server.apiBase.length + "nodes.json?nodes=".length)
    for (const lastVersion of longHistoryNodes) {
        for (let v = 1; v < lastVersion.version; v++) { // todo не нужно загружать версию, которая в текущем пакете правок (если уже успели его загрузить)
            const arg = lastVersion.id + "v" + v
            if (queryArgs[queryArgs.length - 1].length + arg.length + 1 < maxQueryArgLen) {
                if (queryArgs[queryArgs.length - 1] === "") {
                    queryArgs[queryArgs.length - 1] += arg
                } else {
                    queryArgs[queryArgs.length - 1] += "," + arg
                }
            } else {
                queryArgs.push(arg)
            }
        }
    }

    // https://github.com/openstreetmap/openstreetmap-website/issues/5005

    /**
     * @type {NodeVersion[]}
     */
    let versions = []
    console.groupCollapsed(`w${wayID}v${version}`)
    await Promise.all(queryArgs.map(async args => {
        const res = await fetch(osm_server.apiBase + "nodes.json?nodes=" + args, {signal: abortDownloadingController.signal});
        if (res.status === 404) {
            console.log('%c Some nodes was hidden. Start slow fetching :(', 'background: #222; color: #bada55')
            let newArgs = args.split(",").map(i => parseInt(i.match(/(\d+)v(\d+)/)[1]));
            // это нарушает инвариант, что versions не содержит последней версии
            // важно также сохранять отсортированность,
            // иначе loadNodesViaHistoryCalls сделает внутри несколько вызовов для одной и той же точки
            (await loadNodesViaHistoryCalls(newArgs)).forEach(i => {
                versions.push(...i)
            })
        } else if (res.status === 414) {
            console.error("hmm, the maximum length of the URI is incorrectly calculated")
            console.trace();
        } else {
            versions.push(...(await res.json()).elements)
        }
    }))
    console.groupEnd()
    // из-за возможной ручной докачки историй, нужна дедупликация
    const seen = {};
    versions = versions.filter(function ({id: id, version: version}) {
        return Object.prototype.hasOwnProperty.call(seen, [id, version]) ? false : (seen[[id, version]] = true);
    });

    Object.entries(Object.groupBy(versions, ({id}) => id)).forEach(([id, history]) => {
        history.sort((a, b) => {
            if (a.version < b.version) return -1
            if (a.version > b.version) return 1;
            return 0
        })
        if (history.length && history[history.length - 1].version !== lastVersionsMap[id][0].version) {
            history.push(lastVersionsMap[id][0])
        }
        nodesHistories[id] = history
    })
    return [targetVersion, targetVersion.nodes.map(nodeID => nodesHistories[nodeID])]
}

/**
 * @template {NodeVersion|WayVersion|RelationVersion} T
 * @param {T[]} history
 * @param {string} timestamp
 * @param {boolean=} alwaysReturn
 * @return {T|null}
 */
function searchVersionByTimestamp(history, timestamp, alwaysReturn = false) {
    const targetTime = new Date(timestamp)
    let cur = history[0]
    if (targetTime < new Date(cur.timestamp) && !alwaysReturn) {
        return null
    }
    for (const v of history) {
        if (new Date(v.timestamp) <= targetTime) {
            cur = v;
        }
    }
    return cur
}

/**
 * @template T
 * @param {T[][]} objectList
 * @param {string} timestamp
 * @param {boolean=} alwaysReturn
 * @return {T[]}
 */
function filterObjectListByTimestamp(objectList, timestamp, alwaysReturn = false) {
    return objectList.map(i => searchVersionByTimestamp(i, timestamp, alwaysReturn))
}

async function sortWayNodesByTimestamp(wayID) {
    /** @type {(NodeVersion|WayVersion)[]} */
    const objectsBag = []
    /** @type {Set<string>} */
    const objectsSet = new Set()
    for (const i of document.querySelectorAll(`.way-version-view`)) {
        const [targetVersion, nodesHistory] = await loadWayVersionNodes(wayID, parseInt(i.getAttribute("way-version")));
        objectsBag.push(targetVersion)
        nodesHistory.forEach(v => {
            if (v.length === 0) {
                console.error(`${wayID}, v${parseInt(i.getAttribute("way-version"))} has node with empty history`)
            }
            const uniq_key = `${v[0].type} ${v[0].id}`
            if (!objectsSet.has(uniq_key)) {
                objectsBag.push(...v)
                objectsSet.add(uniq_key)
            }
        })
    }
    objectsBag.sort((a, b) => {
        if (a.timestamp < b.timestamp) return -1;
        if (a.timestamp > b.timestamp) return 1;
        if (a.type < b.type) return -1;
        if (a.type > b.type) return 1;
        return 0
    })
    return objectsBag;
}

/**
 * @template T
 * @param {T[]} history
 * @return {Object.<number, T>}
 */
function makeObjectVersionsIndex(history) {
    const wayVersionsIndex = {};
    history.forEach(i => {
        wayVersionsIndex[i.version] = i;
    });
    return wayVersionsIndex
}

/**
 * @param {NodeVersion} v1
 * @param {NodeVersion} v2
 * @return {boolean}
 */
function locationChanged(v1, v2) {
    return v1.lat !== v2.lat || v1.lon !== v2.lon;
}

/**
 * @param {NodeVersion|WayVersion} v1
 * @param {NodeVersion|WayVersion} v2
 * @return {boolean}
 */
function tagsChanged(v1, v2) {
    return JSON.stringify(v1.tags) !== JSON.stringify(v2.tags);
}

async function showFullWayHistory(wayID) {
    const btn = document.querySelector("#download-all-versions-btn")
    try {
        const objectsBag = await sortWayNodesByTimestamp(wayID);

        const wayVersionsIndex = makeObjectVersionsIndex(await getWayHistory(wayID));
        /** @type {Object.<string, NodeVersion|WayVersion>}*/
        const objectStates = {};
        /** @type {Object.<string, [string, NodeVersion|WayVersion, NodeVersion|WayVersion]>} */
        let currentChanges = {}

        /**
         * @param {string} key
         * @param {NodeVersion|WayVersion} newVersion
         */
        function storeChanges(key, newVersion) {
            const prev = objectStates[key];
            if (prev === undefined) {
                currentChanges[key] = ["new", prev, newVersion]
            } else {
                if (locationChanged(prev, newVersion) && tagsChanged(prev, newVersion)) {
                    currentChanges[key] = ["new", prev, newVersion]
                } else if (locationChanged(prev, newVersion)) {
                    currentChanges[key] = ["location", prev, newVersion]
                } else if (tagsChanged(prev, newVersion)) {
                    currentChanges[key] = ["tags", prev, newVersion]
                } else {
                    currentChanges[key] = ["", prev, newVersion]
                }
            }
        }

        /** @type {number|null} */
        let currentChangeset = null
        /** @type {string|null} */
        let currentUser = null
        /** @type {string|null} */
        let currentTimestamp = null
        /** @type {WayVersion}*/
        let currentWayVersion = {version: 0, nodes: []}
        let currentWayNodesSet = new Set()
        for (const it of objectsBag) {
            console.debug(it);
            const uniq_key = `${it.type} ${it.id}`
            if (it.type === "node" && currentWayVersion.version > 0 && !currentWayNodesSet.has(it.id)) {
                objectStates[uniq_key] = it
                continue
            }
            if (it.changeset === currentChangeset) {
                storeChanges(uniq_key, it) // todo split if new way version
            } else if (currentChangeset === null) {
                currentChangeset = it.changeset
                currentUser = it.user
                currentTimestamp = it.timestamp
                storeChanges(uniq_key, it)
            } else {
                if (currentWayVersion.version !== 0) {
                    const currentNodes = [];
                    wayVersionsIndex[currentWayVersion.version].nodes.forEach(nodeID => {
                        currentNodes.push(objectStates[`node ${nodeID}`])
                        const uniq_key = `node ${nodeID}`
                        if (currentChanges[uniq_key] !== undefined) return;
                        const curV = objectStates[uniq_key]
                        if (curV) {
                            currentChanges[uniq_key] = ["", curV, curV]
                        } else {
                            console.warn(`${uniq_key} not found in states`)
                        }
                    });

                    const interVersionDiv = document.createElement("div")
                    interVersionDiv.setAttribute("way-version", "inter")
                    interVersionDiv.classList.add("browse-section")

                    const interVersionDivHeader = document.createElement("h4")
                    const interVersionDivAbbr = document.createElement("abbr")
                    interVersionDivAbbr.textContent = ['ru-RU', 'ru'].includes(navigator.language) ? "Промежуточная версия" : "Intermediate version"
                    interVersionDivAbbr.title = ['ru-RU', 'ru'].includes(navigator.language)
                        ? "Произошли изменения тегов или координат точек в линии,\nкоторые не увеличили версию линии"
                        : "There have been changes to the tags or coordinates of nodes in the way that have not increased the way version"
                    interVersionDivHeader.appendChild(interVersionDivAbbr)
                    interVersionDiv.appendChild(interVersionDivHeader)

                    const p = document.createElement("p")
                    interVersionDiv.appendChild(p)
                    fetch(osm_server.apiBase + "changeset" + "/" + currentChangeset + ".json").then(async res => {
                        const jsonRes = await res.json();
                        /** @type {ChangesetMetadata} */
                        const changesetMetadata = jsonRes.changeset ? jsonRes.changeset : jsonRes.elements[0]
                        p.textContent = changesetMetadata.tags['comment'];
                    })

                    const ul = document.createElement("ul")
                    ul.classList.add("list-unstyled")
                    const li = document.createElement("li")
                    ul.appendChild(li)

                    const time = document.createElement("time")
                    time.setAttribute("datetime", currentTimestamp)
                    time.setAttribute("natural_text", currentTimestamp) // it should server side string :(
                    time.setAttribute("title", currentTimestamp) // it should server side string :(
                    time.textContent = (new Date(currentTimestamp).toISOString()).slice(0, -5) + "Z"
                    li.appendChild(time)
                    li.appendChild(document.createTextNode("\xA0"))

                    const user_link = document.createElement("a")
                    user_link.href = location.origin + "/user/" + currentUser
                    user_link.textContent = currentUser
                    li.appendChild(user_link)
                    li.appendChild(document.createTextNode("\xA0"))

                    const changeset_link = document.createElement("a")
                    changeset_link.href = location.origin + "/changeset/" + currentChangeset
                    changeset_link.textContent = "#" + currentChangeset
                    li.appendChild(changeset_link)

                    interVersionDiv.appendChild(ul)

                    const nodesDetails = document.createElement("details")
                    nodesDetails.classList.add("way-version-nodes")
                    nodesDetails.onclick = (e) => {
                        e.stopImmediatePropagation()
                    }
                    const summary = document.createElement("summary")
                    summary.textContent = currentNodes.length
                    summary.classList.add("history-diff-modified-tag")
                    nodesDetails.appendChild(summary)
                    const ulNodes = document.createElement("ul")
                    ulNodes.classList.add("list-unstyled")
                    currentNodes.forEach(i => {
                        if (i === undefined) {
                            console.trace()
                            console.log(currentNodes)
                            btn.style.background = "yellow"
                            btn.title = "Some nodes was hidden by moderators"
                            return
                        }
                        const nodeLi = document.createElement("li")
                        const div = document.createElement("div")
                        div.classList.add("d-flex", "gap-1")
                        const div2 = document.createElement("div")
                        div2.classList.add("align-self-center")
                        div.appendChild(div2)

                        const aHistory = document.createElement("a")
                        aHistory.classList.add("node")
                        aHistory.href = "/node/" + i.id + "/history"
                        aHistory.textContent = i.id
                        div2.appendChild(aHistory)

                        div2.appendChild(document.createTextNode(", "))

                        const aVersion = document.createElement("a")
                        aVersion.classList.add("node")
                        aVersion.href = "/node/" + i.id + "/history/" + i.version
                        aVersion.textContent = "v" + i.version
                        div2.appendChild(aVersion)
                        nodeLi.appendChild(div)

                        const curChange = currentChanges[`node ${i.id}`]
                        const nodesHistory = nodesHistories[i.id]
                        const tagsTable = processObject(div2, "node", curChange[1] ?? curChange[2], curChange[2], nodesHistory[nodesHistory.length - 1], nodesHistory)
                        setTimeout(async () => {
                            await processObjectInteractions("", "node", div2, ...getPrevTargetLastVersions(...await getHistoryAndVersionByElem(div2)))
                        }, 0)
                        tagsTable.then((table) => {
                            if (nodeLi.classList.contains("tags-non-modified")) {
                                div2.appendChild(table)
                            }
                            // table.style.borderColor = "var(--bs-body-color)";
                            // table.style.borderStyle = "solid";
                            // table.style.borderWidth = "1px";
                        })
                        ulNodes.appendChild(nodeLi)
                    })
                    nodesDetails.appendChild(ulNodes)
                    interVersionDiv.appendChild(nodesDetails)

                    const tmpChangedNodes = Object.values(currentChanges).filter(i => i[2].type === "node")
                    if (tmpChangedNodes.every(i => i[0] === "tags")) {
                        interVersionDiv.classList.add("only-tags-changed")
                    }
                    const changedNodes = tmpChangedNodes.filter(i => i[0] !== "location")
                    interVersionDiv.onmouseenter = () => {
                        resetMapHover()
                        cleanAllObjects()
                        showWay(cloneInto(currentNodes, unsafeWindow), "#000000", false, darkModeForMap && isDarkMode())
                        currentNodes.forEach(node => {
                            if (node.tags && Object.keys(node.tags).filter(k => k !== "created_by" && k !== "source").length > 0) {
                                showNodeMarker(node.lat.toString(), node.lon.toString(), "rgb(161,161,161)", null, 'customObjects', 3)
                            }
                        })
                        changedNodes.forEach(i => {
                            if (i[0] === "") return
                            if (i[2].visible === false) {
                                if (i[1].visible !== false) {
                                    showNodeMarker(i[1].lat.toString(), i[1].lon.toString(), "#ff0000", null, 'customObjects', 3)
                                }
                            } else if (i[0] === "new") {
                                if (i[2].tags && Object.keys(i[2].tags).filter(k => k !== "created_by" && k !== "source").length > 0) {
                                    showNodeMarker(i[2].lat.toString(), i[2].lon.toString(), "#00a500", null, 'customObjects', 3)
                                }
                                showNodeMarker(i[2].lat.toString(), i[2].lon.toString(), "#00a500", null, 'customObjects', 3)
                            } else {
                                showNodeMarker(i[2].lat.toString(), i[2].lon.toString(), "rgb(255,245,41)", null, 'customObjects', 3)
                            }
                        })
                    }
                    interVersionDiv.onclick = (e) => {
                        resetMapHover()
                        cleanAllObjects()
                        showWay(cloneInto(currentNodes, unsafeWindow), "#000000", e.isTrusted, darkModeForMap && isDarkMode())
                        currentNodes.forEach(node => {
                            if (node.tags && Object.keys(node.tags).filter(k => k !== "created_by" && k !== "source").length > 0) {
                                showNodeMarker(node.lat.toString(), node.lon.toString(), "rgb(161,161,161)", null, 'customObjects', 3)
                            }
                        })
                        changedNodes.forEach(i => {
                            if (i[0] === "") return
                            if (i[2].visible === false) {
                                if (i[1].visible !== false) {
                                    showNodeMarker(i[1].lat.toString(), i[1].lon.toString(), "#ff0000", null, 'customObjects', 3)
                                }
                            } else if (i[0] === "new") {
                                if (i[2].tags && Object.keys(i[2].tags).filter(k => k !== "created_by" && k !== "source").length > 0) {
                                    showNodeMarker(i[2].lat.toString(), i[2].lon.toString(), "#00a500", null, 'customObjects', 3)
                                }
                                showNodeMarker(i[2].lat.toString(), i[2].lon.toString(), "#00a500", null, 'customObjects', 3)
                            } else {
                                showNodeMarker(i[2].lat.toString(), i[2].lon.toString(), "rgb(255,245,41)", null, 'customObjects', 3)
                            }
                        })
                    }
                    let insertBeforeThat = document.querySelector(`.browse-way[way-version="${currentWayVersion.version}"]`)
                    while (insertBeforeThat.previousElementSibling.getAttribute("way-version") === "inter") { // fixme O(n^2)
                        insertBeforeThat = insertBeforeThat.previousElementSibling
                    }
                    insertBeforeThat.before(interVersionDiv)
                }
                currentChanges = {}
                storeChanges(uniq_key, it)
                currentChangeset = it.changeset
                currentUser = it.user
                currentTimestamp = it.timestamp
            }
            objectStates[uniq_key] = it
            // для настоящей версии линии
            if (it.type === "way") {
                let forNodesReplace = document.querySelector(`.browse-way[way-version="${it.version}"]`)
                if (Object.keys(currentChanges).length > 1 && (forNodesReplace.classList?.contains("empty-version") || forNodesReplace.classList?.contains("hidden-empty-version"))) {
                    forNodesReplace.querySelector("summary")?.remove()
                    const div = document.createElement("div")
                    div.innerHTML = forNodesReplace.innerHTML
                    div.classList.add("browse-section")
                    div.classList.add("browse-way")
                    div.setAttribute("way-version", forNodesReplace.getAttribute("way-version"))
                    forNodesReplace.replaceWith(div)
                    forNodesReplace = div
                }
                currentWayVersion = it
                currentWayNodesSet = new Set()
                currentWayVersion.nodes?.forEach(nodeID => {
                    currentWayNodesSet.add(nodeID)
                    const uniq_key = `node ${nodeID}`
                    if (currentChanges[uniq_key] === undefined) {
                        const curV = objectStates[uniq_key]
                        if (curV) {
                            if (curV.version === 1 && currentWayVersion.changeset === curV.changeset) {
                                currentChanges[uniq_key] = ["new", emptyVersion, curV]
                            } else {
                                currentChanges[uniq_key] = ["", curV, curV]
                            }
                        } else {
                            console.warn(`${uniq_key} not found in states`)
                        }
                    }
                })
                if (forNodesReplace && currentWayVersion.nodes) {
                    const currentNodes = [];
                    const ulNodes = forNodesReplace.querySelector("details:not(.empty-version):not(.hidden-empty-version) ul")
                    ulNodes.parentElement.classList.add("way-version-nodes")
                    ulNodes.querySelectorAll("li").forEach(li => {
                        li.style.display = "none"
                        const id = li.querySelector("div div a").href.match(/node\/(\d+)/)[1]
                        currentNodes.push([li.querySelector("img"), objectStates[`node ${id}`]])
                    })
                    if (it.version !== 1) {
                        const changedNodes = Object.values(currentChanges).filter(i => i[2].type === "node" && i[0] !== "location" && i[0] !== "")
                        document.querySelector(`.browse-way[way-version="${it.version}"]`)?.addEventListener("mouseenter", () => {
                            changedNodes.forEach(i => {
                                if (i[2].visible === false) {
                                    if (i[1].visible !== false) {
                                        showNodeMarker(i[1].lat.toString(), i[1].lon.toString(), "#ff0000", null, 'customObjects', 3)
                                    }
                                } else if (i[0] === "new") {
                                    if (i[2].tags && Object.keys(i[2].tags).filter(k => k !== "created_by" && k !== "source").length > 0) {
                                        showNodeMarker(i[2].lat.toString(), i[2].lon.toString(), "#00a500", null, 'customObjects', 3)
                                    }
                                    showNodeMarker(i[2].lat.toString(), i[2].lon.toString(), "#00a500", null, 'customObjects', 3)
                                } else {
                                    showNodeMarker(i[2].lat.toString(), i[2].lon.toString(), "rgb(255,245,41)", null, 'customObjects', 3)
                                }
                            })
                        })
                        document.querySelector(`.browse-way[way-version="${it.version}"]`)?.addEventListener("click", () => {
                            changedNodes.forEach(i => {
                                if (i[2].visible === false) {
                                    if (i[1].visible !== false) {
                                        showNodeMarker(i[1].lat.toString(), i[1].lon.toString(), "#ff0000", null, 'customObjects', 3)
                                    }
                                } else if (i[0] === "new") {
                                    if (i[2].tags && Object.keys(i[2].tags).filter(k => k !== "created_by" && k !== "source").length > 0) {
                                        showNodeMarker(i[2].lat.toString(), i[2].lon.toString(), "#00a500", null, 'customObjects', 3)
                                    }
                                    showNodeMarker(i[2].lat.toString(), i[2].lon.toString(), "#00a500", null, 'customObjects', 3)
                                } else {
                                    showNodeMarker(i[2].lat.toString(), i[2].lon.toString(), "rgb(255,245,41)", null, 'customObjects', 3)
                                }
                            })
                        })
                    }
                    currentNodes.forEach(([img, i]) => {
                        if (i === undefined) {
                            console.trace()
                            console.log(currentNodes)
                            btn.style.background = "yellow"
                            btn.title = "Please try reload page.\nIf the error persists, a message about it in the better-osm-org repository"
                            forNodesReplace.classList.add("broken-version")
                            forNodesReplace.title = "Some nodes was hidden by moderators :\\"
                            forNodesReplace.style.cursor = "auto"
                            return
                        }
                        const nodeLi = document.createElement("li")
                        const div = document.createElement("div")
                        div.classList.add("d-flex", "gap-1")
                        const div2 = document.createElement("div")
                        div2.classList.add("align-self-center")
                        div.appendChild(div2)

                        div2.before(img.cloneNode(true))

                        const aHistory = document.createElement("a")
                        aHistory.classList.add("node")
                        aHistory.href = "/node/" + i.id + "/history"
                        aHistory.textContent = i.id
                        div2.appendChild(aHistory)
                        nodeLi.appendChild(div)

                        div2.appendChild(document.createTextNode(", "))

                        const aVersion = document.createElement("a")
                        aVersion.classList.add("node")
                        aVersion.href = "/node/" + i.id + "/history/" + i.version
                        aVersion.textContent = "v" + i.version
                        div2.appendChild(aVersion)
                        nodeLi.appendChild(div)

                        const curChange = currentChanges[`node ${i.id}`]
                        const nodesHistory = nodesHistories[i.id]
                        const tagsTable = processObject(div2, "node", curChange[1] ?? curChange[2], curChange[2], nodesHistory[nodesHistory.length - 1], nodesHistory)
                        setTimeout(async () => {
                            await processObjectInteractions("", "node", div2, ...getPrevTargetLastVersions(...await getHistoryAndVersionByElem(div2)))
                        }, 0)
                        tagsTable.then((table) => {
                            if (nodeLi.classList.contains("tags-non-modified")) {
                                div2.appendChild(table)
                            }
//                            table.style.borderColor = "var(--bs-body-color)";
//                             table.style.borderStyle = "solid";
//                             table.style.borderWidth = "1px";
                        })
                        ulNodes.appendChild(nodeLi)
                    })
                }
                currentChanges = {}
                currentChangeset = null
            }
        }
        document.querySelector("#sidebar_content h2").addEventListener("mouseleave", () => {
            document.querySelector("#sidebar_content h2").onmouseenter = () => {
                cleanAllObjects()
            }
        }, {
            once: true
        })
        // making version filter
        if (document.querySelectorAll('[way-version="inter"]').length > 20) {
            const select = document.createElement("select")
            select.id = "versions-filter"
            select.title = "Filter for intermediate changes"

            const allVersions = document.createElement("option")
            allVersions.value = "all-versions"
            allVersions.textContent = ['ru-RU', 'ru'].includes(navigator.language) ? "Все версии" : "All versions"
            select.appendChild(allVersions)

            const withGeom = document.createElement("option")
            withGeom.value = "with-geom"
            withGeom.textContent = ['ru-RU', 'ru'].includes(navigator.language) ? "Все изменения геометрии" : "With geometry changes"
            withGeom.setAttribute("selected", "selected")
            select.appendChild(withGeom)

            const withoutInter = document.createElement("option")
            withoutInter.value = "without-inter"
            withoutInter.textContent = ['ru-RU', 'ru'].includes(navigator.language) ? "Без промежуточных" : "Without intermediate"
            select.appendChild(withoutInter)

            select.onchange = (e) => {
                if (e.target.value === "all-versions") {
                    document.querySelectorAll('[way-version="inter"]').forEach(i => {
                        i.removeAttribute("hidden")
                    })
                } else if (e.target.value === "with-geom") {
                    document.querySelectorAll('.only-tags-changed[way-version="inter"]').forEach(i => {
                        i.setAttribute("hidden", "true")
                    })
                    document.querySelectorAll('[way-version="inter"]:not(.only-tags-changed)').forEach(i => {
                        i.removeAttribute("hidden")
                    })
                } else if (e.target.value === "without-inter") {
                    document.querySelectorAll('[way-version="inter"]').forEach(i => {
                        i.setAttribute("hidden", "true")
                    })
                }
            }
            document.querySelectorAll('.only-tags-changed[way-version="inter"]').forEach(i => {
                i.setAttribute("hidden", "true")
            })
            btn.after(select)
        }
        btn.remove()
    } catch (err) {
        console.error(err)
        btn.title = "Please try reload page.\nIf the error persists, a message about it in the better-osm-org repository"
        btn.style.background = "red"
        btn.style.cursor = "auto"
    }
}

function setupWayVersionView() {
    const match = location.pathname.match(/\/way\/(\d+)\//);
    if (match === null) return;
    const wayID = match[1]

    async function loadWayVersion(e, loadMore = true, needShowWay = true, needFly = false) {
        const htmlElem = e.target ? e.target : e
        htmlElem.style.cursor = "progress"
        const version = parseInt(htmlElem.getAttribute("way-version"))
        const [targetVersion, nodesHistory] = await loadWayVersionNodes(wayID, version);
        const nodesList = filterObjectListByTimestamp(nodesHistory, targetVersion.timestamp)
        if (nodesList.some(i => i === null)) {
            htmlElem.parentElement.parentElement.classList.add("broken-version")
            htmlElem.title = "Some nodes was hidden by moderators"
            htmlElem.style.cursor = "auto"
        } else {
            if (needShowWay) {
                cleanAllObjects()
                showWay(cloneInto(nodesList, unsafeWindow), "#000000", needFly, darkModeForMap && isDarkMode())
                nodesList.forEach(node => {
                    if (node.tags && Object.keys(node.tags).filter(k => k !== "created_by" && k !== "source").length > 0) {
                        showNodeMarker(node.lat.toString(), node.lon.toString(), "rgb(161,161,161)", null, 'customObjects', 3)
                    }
                })
            }
        }
        if (htmlElem.nodeName === "A") {
            const versionDiv = htmlElem.parentNode.parentNode
            versionDiv.onmouseenter = (e) => {
                resetMapHover()
                loadWayVersion(e);
            }
            versionDiv.onclick = async e => {
                if (e.target.tagName === "A" || e.target.tagName === "TIME" || e.target.tagName === "SUMMARY") {
                    return
                }
                await loadWayVersion(versionDiv, true, true, true)
            }
            versionDiv.setAttribute("way-version", version.toString())
            htmlElem.style.cursor = "pointer" // todo finally{}
            htmlElem.setAttribute("hidden", "true")
            // preload next
            if (version !== 1) {
                let prevVersionNum = version - 1;
                while (prevVersionNum > 0) {
                    try {
                        console.log(`preloading v${prevVersionNum}`);
                        await loadWayVersionNodes(wayID, prevVersionNum)
                        console.log(`preloaded v${prevVersionNum}`);
                        break
                    } catch {
                        console.log(`Skip v${prevVersionNum}`)
                        prevVersionNum--;
                    }
                }
                const loadBtn = document.querySelector(`#sidebar_content a[way-version="${prevVersionNum}"]`)
                if (loadMore && document.querySelector(`#sidebar_content a[way-version="${prevVersionNum}"]`)) {
                    const nodesCount = waysHistories[wayID].filter(v => v.version === prevVersionNum)[0].nodes?.length
                    if (!nodesCount || nodesCount <= 123) {
                        await loadWayVersion(loadBtn, true, false)
                    } else {
                        await loadWayVersion(loadBtn, false, false)
                        if (prevVersionNum > 1) {
                            console.log(`preloading2 v${prevVersionNum - 1}`);
                            await loadWayVersionNodes(wayID, (prevVersionNum - 1))
                            console.log(`preloaded v${prevVersionNum - 1}`);
                        }
                    }
                }
            }
        } else {
            try {
                e.target.style.cursor = "auto"
            } catch {
                e.style.cursor = "auto"
            }
        }
    }

    document.querySelectorAll(".browse-way h4:nth-of-type(1) a").forEach(i => {
        const version = i.href.match(/\/(\d+)$/)[1];
        const btn = document.createElement("a")
        btn.classList.add("way-version-view")
        btn.textContent = "📥"
        btn.style.cursor = "pointer"
        btn.setAttribute("way-version", version)
        // fixme mouseenter должен начинать загрузку в фоне
        // но только при клике должна начинаться анимация
        btn.addEventListener("mouseenter", loadWayVersion, {
            once: true,
        })
        i.after(btn)
        i.after(document.createTextNode("\xA0"))
    })
    if (document.querySelectorAll(`.way-version-view:not([hidden])`).length > 1) {
        const downloadAllVersionsBtn = document.createElement("a")
        downloadAllVersionsBtn.id = "download-all-versions-btn"
        downloadAllVersionsBtn.textContent = "⏬"
        downloadAllVersionsBtn.style.cursor = "pointer"
        downloadAllVersionsBtn.title = "Download all versions"

        downloadAllVersionsBtn.addEventListener("click", async () => {
            downloadAllVersionsBtn.style.cursor = "progress"
            for (const i of document.querySelectorAll(`.way-version-view:not([hidden])`)) {
                try {
                    await loadWayVersion(i)
                } catch (e) {
                    console.error(e)
                    console.log("redacted version")
                }
            }
            if (GM_config.get("FullVersionsDiff")) {
                console.time("full history")
                addQuickLookStyles()
                await showFullWayHistory(wayID)
                console.timeEnd("full history")
            }
        }, {
            once: true,
        })
        document.querySelector(".compact-toggle-btn")?.after(downloadAllVersionsBtn)
        document.querySelector(".compact-toggle-btn")?.after(document.createTextNode("\xA0"))
    }
}

/**
 * @typedef {Object} RelationMember
 * @property {number} ref
 * @property {'node'|'way'|'relation'} type
 * @property {string} role
 */

/**
 * @typedef {Object} RelationVersion
 * @property {number} id
 * @property {number} changeset
 * @property {number} uid
 * @property {string} user
 * @property {RelationMember[]} members
 * @property {number} version
 * @property {boolean} visible
 * @property {string} timestamp
 * @property {'node'|'way'|'relation'} type
 * @property {Object.<string, string>=} tags
 */
/**
 * @param {number|string} relationID
 * @return {Promise<RelationVersion[]>}
 */
async function getRelationHistory(relationID) {
    if (relationsHistories[relationID]) {
        return relationsHistories[relationID];
    } else {
        const res = await fetch(osm_server.apiBase + "relation" + "/" + relationID + "/history.json");
        if (res.status === 509) {
            await error509Handler(res)
        } else {
            return relationsHistories[relationID] = (await res.json()).elements;
        }
    }
}

const overpassCache = {}
const bboxCache = {}

const cachedRelationsGeometry = {}

/**
 *
 * @param {number} id
 * @param {string} timestamp
 * @param {boolean=true} cleanPrevObjects=true
 * @param {string=} color=
 * @param {string=} layer=
 * @param {boolean=} addStroke
 * @return {Promise<{}>}
 */
async function loadRelationVersionMembersViaOverpass(id, timestamp, cleanPrevObjects = true, color = "#000000", layer = "activeObjects", addStroke = null) {
    console.time(`Render ${id} relation`)
    console.log(id, timestamp)

    async function getRelationViaOverpass(id, timestamp) {
        if (overpassCache[[id, timestamp]]) {
            return overpassCache[[id, timestamp]]
        } else {
            const res = await GM.xmlHttpRequest({
                url: "https://overpass-api.de/api/interpreter?" + new URLSearchParams({
                    data: `
                            [out:json][date:"${timestamp}"];
                            relation(${id});
                            //(._;>;);
                            out geom;
                        `
                }),
                responseType: "json"
            });
            return overpassCache[[id, timestamp]] = res.response
        }
    }

    const overpassGeom = await getRelationViaOverpass(id, timestamp)
    console.log("Data downloaded")
    if (cleanPrevObjects) {
        cleanCustomObjects()
    }
    cleanObjectsByKey("activeObjects")
    if (!layers[layer]) {
        layers[layer] = []
    }
    // нужен видимо веш геометрии
    // GC больно
    let cache = cachedRelationsGeometry[[id, timestamp]];
    if (!cache) {
        let wayCounts = 0
        const mergedGeometry = []
        overpassGeom.elements[0]?.members?.forEach(i => {
            if (i.type === "way") {
                wayCounts++
                if (i.geometry === undefined || !i.geometry.length) {
                    return
                }
                const nodesList = i.geometry.map(p => [p.lat, p.lon])
                if (mergedGeometry.length === 0) {
                    mergedGeometry.push(nodesList)
                } else {
                    const lastWay = mergedGeometry[mergedGeometry.length - 1]
                    const [lastLat, lastLon] = lastWay[lastWay.length - 1]
                    if (lastLat === nodesList[0][0] && lastLon === nodesList[0][1]) {
                        mergedGeometry[mergedGeometry.length - 1].push(...nodesList.slice(1))
                    } else {
                        mergedGeometry.push(nodesList)
                    }
                }
            } else if (i.type === "node") {
                showNodeMarker(i.lat, i.lon, color, null, layer)
            } else if (i.type === "relation") {
                // todo
            }
        })
        cache = cachedRelationsGeometry[[id, timestamp]] = mergedGeometry.map(i => intoPage(i))
        console.log(`${cache.length}/${wayCounts} for render`)
    } else {
        overpassGeom.elements[0]?.members?.forEach(i => {
            if (i.type === "node") {
                showNodeMarker(i.lat, i.lon, color, null, layer)
            }
        })
    }

    cache.forEach(nodesList => {
        displayWay(nodesList, false, color, 4, null, layer, null, null, addStroke, true)
    })

    console.timeEnd(`Render ${id} relation`)

    function getBbox(id, timestamp) {
        if (bboxCache[[id, timestamp]]) {
            return bboxCache[[id, timestamp]]
        }
        const nodesBag = []
        overpassGeom.elements[0]?.members?.forEach(i => {
            if (i.type === "way") {
                nodesBag.push(...i.geometry.map(p => {
                    return {lat: p.lat, lon: p.lon}
                }))
            } else if (i.type === "node") {
                nodesBag.push({lat: i.lat, lon: i.lon})
            } else {
                // ну нинада пожалуйста
            }
        })
        const relationInfo = {}
        relationInfo.bbox = {
            min_lat: Math.min(...nodesBag.map(i => i.lat)),
            min_lon: Math.min(...nodesBag.map(i => i.lon)),
            max_lat: Math.max(...nodesBag.map(i => i.lat)),
            max_lon: Math.max(...nodesBag.map(i => i.lon))
        }
        return bboxCache[[id, timestamp]] = relationInfo
    }

    console.log("relation loaded")
    return getBbox(id, timestamp)
}

async function getNodeViaOverpassXML(id, timestamp) {
    const res = await GM.xmlHttpRequest({
        url: "https://overpass-api.de/api/interpreter?" + new URLSearchParams({
            data: `
                [out:xml][date:"${timestamp}"];
                node(${id});
                out meta;
            `
        }),
        responseType: "xml"
    });
    return new DOMParser().parseFromString(res.response, "text/xml").querySelector("node")
}

async function getWayViaOverpassXML(id, timestamp) {
    const res = await GM.xmlHttpRequest({
        url: "https://overpass-api.de/api/interpreter?" + new URLSearchParams({
            data: `
                [out:xml][date:"${timestamp}"];
                way(${id});
                //(._;>;);
                out meta;
            `
        }),
        responseType: "xml"
    });
    return new DOMParser().parseFromString(res.response, "text/xml").querySelector("way")
}


async function getRelationViaOverpassXML(id, timestamp) {
    const res = await GM.xmlHttpRequest({
        url: "https://overpass-api.de/api/interpreter?" + new URLSearchParams({
            data: `
                [out:xml][date:"${timestamp}"];
                relation(${id});
                //(._;>;);
                out meta;
            `
        }),
        responseType: "xml"
    });
    return new DOMParser().parseFromString(res.response, "text/xml").querySelector("relation")
}

/**
 * @typedef {{nodes: NodeVersion[][], ways: [WayVersion, NodeVersion[][]][], relations: RelationVersion[][]}}
 * @name RelationMembersVersions
 */

/**
 *
 * @param {string|number} relationID
 * @param {number} version
 * @throws {string}
 * @returns {Promise<{
 * targetVersion: RelationVersion,
 * membersHistory: RelationMembersVersions
 * }>}
 */
async function loadRelationVersionMembers(relationID, version) {
    console.debug("Loading relation", relationID, version)
    const relationHistory = await getRelationHistory(relationID)

    const targetVersion = relationHistory.filter(v => v.version === version)[0]
    if (!targetVersion) {
        throw `loadWayVersionNodes failed ${relationID}, ${version}`
    }

    /**
     * @type {{nodes: NodeVersion[][], ways: [WayVersion, NodeVersion[][]][]|Promise<[WayVersion, NodeVersion[][]]>[], relations: RelationVersion[][]}}
     */
    const membersHistory = {
        nodes: [],
        ways: [],
        relations: []
    }
    for (const member of targetVersion.members ?? []) {
        if (member.type === "node") {
            const nodeHistory = await getNodeHistory(member.ref)
            const targetTime = new Date(targetVersion.timestamp)
            let targetWayVersion = nodeHistory[0]
            nodeHistory.forEach(history => {
                if (new Date(history.timestamp) <= targetTime) {
                    targetWayVersion = history;
                }
            })
            membersHistory.nodes.push(targetWayVersion)
        } else if (member.type === "way") {
            async function loadWay() {
                let wayHistory = await getWayHistory(member.ref);
                const targetTime = new Date(targetVersion.timestamp)
                let targetWayVersion = wayHistory[0]
                wayHistory.forEach(history => {
                    if (new Date(history.timestamp) <= targetTime) {
                        targetWayVersion = history;
                    }
                })
                return await loadWayVersionNodes(member.ref, targetWayVersion.version)
            }

            membersHistory.ways.push(loadWay())
        } else if (member.type === "relation") {
            // TODO может нинада? :(
        }
    }
    membersHistory.ways = await Promise.all(membersHistory.ways)
    return {targetVersion: targetVersion, membersHistory: membersHistory}
}

function setupRelationVersionView() {
    const match = location.pathname.match(/\/relation\/(\d+)\//);
    if (match === null) return;
    const relationID = match[1];

    async function loadRelationVersion(e, loadMore = true, showWay = true) {
        const htmlElem = e.target ? e.target : e
        htmlElem.style.cursor = "progress"

        const version = parseInt(htmlElem.getAttribute("relation-version"))
        console.time(`r${relationID} v${version}`)
        const {
            targetVersion: targetVersion,
            membersHistory: membersHistory
        } = await loadRelationVersionMembers(relationID, version);
        console.timeEnd(`r${relationID} v${version}`)
        if (showWay) {
            cleanCustomObjects()
            let hasBrokenMembers = false
            membersHistory.nodes.forEach(n => {
                showNodeMarker(n.lat, n.lon, "#000")
            })
            membersHistory.ways.forEach(([, nodesVersionsList]) => {
                try {
                    const nodesList = nodesVersionsList.map(n => {
                        const {lat: lat, lon: lon} = searchVersionByTimestamp(n, targetVersion.timestamp)
                        return [lat, lon]
                    })
                    displayWay(cloneInto(nodesList, unsafeWindow), false, "#000000", 4, null, "customObjects", null, null, darkModeForMap && isDarkMode())
                } catch {
                    hasBrokenMembers = true
                    // TODO highlight in member list
                }
            })
            if (hasBrokenMembers) {
                htmlElem.classList.add("broken-version")
                if (htmlElem.parentElement?.parentElement.classList.contains("browse-section")) {
                    htmlElem.parentElement.parentElement.classList.add("broken-version")
                }
            }
        }
        if (htmlElem.nodeName === "A") {
            const versionDiv = htmlElem.parentNode.parentNode
            versionDiv.onmouseenter = loadRelationVersion
            versionDiv.setAttribute("relation-version", version.toString())
            htmlElem.style.cursor = "pointer" // todo finally{}
            htmlElem.setAttribute("hidden", "true")
        } else {
            e.target.style.cursor = "auto"
        }
    }

    document.querySelectorAll(".browse-relation h4:nth-of-type(1) a").forEach((i) => {
        const version = i.href.match(/\/(\d+)$/)[1];
        const btn = document.createElement("a")
        btn.classList.add("relation-version-view")
        btn.textContent = "📥"
        btn.style.cursor = "pointer"
        btn.setAttribute("relation-version", version)

        btn.addEventListener("mouseenter", async e => {
            await loadRelationVersion(e)
        }, {
            once: true,
        })
        i.after(btn)
        i.after(document.createTextNode("\xA0"))
    })

    if (document.querySelectorAll(`.relation-version-view:not([hidden])`).length > 1) {
        const downloadAllVersionsBtn = document.createElement("a")
        downloadAllVersionsBtn.id = "download-all-versions-btn"
        downloadAllVersionsBtn.textContent = "⏬"
        downloadAllVersionsBtn.style.cursor = "pointer"
        downloadAllVersionsBtn.title = "Download all versions"

        downloadAllVersionsBtn.addEventListener("click", async e => {
            downloadAllVersionsBtn.style.cursor = "progress"
            for (const i of document.querySelectorAll(`.relation-version-view:not([hidden])`)) {
                await loadRelationVersion(i)
            }
            e.target.remove()
        }, {
            once: true,
        })
        document.querySelector(".compact-toggle-btn")?.after(downloadAllVersionsBtn)
        document.querySelector(".compact-toggle-btn")?.after(document.createTextNode("\xA0"))
    }
}


// tests
// https://www.openstreetmap.org/relation/100742/history
function setupViewRedactions() {
    // TODO дозагрузку нужно делать только если есть аргументы в URL?
    // if (!location.pathname.includes("/node")) {
    //     return;
    // }
    if (document.getElementById("show-unredacted-btn")) {
        return
    }
    let showUnredactedBtn = document.createElement("a")
    showUnredactedBtn.id = "show-unredacted-btn"
    showUnredactedBtn.textContent = ['ru-RU', 'ru'].includes(navigator.language) ? "Просмотр неотредактированной истории β" : "View Unredacted History β"
    showUnredactedBtn.style.cursor = "pointer"
    showUnredactedBtn.href = ""
    showUnredactedBtn.onmouseenter = async () => {
        resetMapHover()
    }
    showUnredactedBtn.onclick = async e => {
        e.preventDefault()
        showUnredactedBtn.style.cursor = "progress"
        const type = location.pathname.match(/\/(node|way|relation)/)[1]
        const objID = parseInt(location.pathname.match(/\/(node|way|relation)\/(\d+)/)[2]);
        let id_prefix = objID;
        if (type === "node") {
            id_prefix = Math.floor(id_prefix / 10000);
        } else if (type === "way") {
            id_prefix = Math.floor(id_prefix / 1000);
        } else if (type === "relation") {
            id_prefix = Math.floor(id_prefix / 10);
        }

        async function downloadArchiveData(url, objID, needUnzip = false) {
            try {
                const diffGZ = await GM.xmlHttpRequest({
                    method: "GET",
                    url: url,
                    responseType: "blob"
                });
                let blob = needUnzip ? await decompressBlob(diffGZ.response) : diffGZ.response;
                let diffXML = await blob.text()

                const diffParser = new DOMParser();
                const doc = diffParser.parseFromString(diffXML, "application/xml");
                return doc.querySelectorAll(`osm [id='${objID}']`)
            } catch {
                return null
            }
        }

        const url = `https://raw.githubusercontent.com/osm-cc-by-sa/data/refs/heads/main/versions_affected_by_disagreed_users_and_all_after_with_redaction_period/${type}/${id_prefix}.osm` + (type === "relation" ? ".gz" : "")
        const data = await downloadArchiveData(url, objID, type === "relation")

        const keysLinks = new Map()
        document.querySelectorAll(".browse-section table th a").forEach(a => {
            keysLinks.set(a.textContent, a.href)
        })
        const valuesLinks = new Map()
        document.querySelectorAll(".browse-section table td a").forEach(a => {
            valuesLinks.set(a.textContent, a.href)
        })

        const versionPrefix = document.querySelector(`.browse-${type} h4`)?.textContent?.match(/(^.*#)/gms)?.at(0)

        for (const elem of Array.from(document.getElementsByClassName("browse-section browse-redacted"))) {
            const version = elem.textContent.match(/(\d+).*(\d+)/)[1]
            console.log(`Downloading v${version}`)
            elem.childNodes[0].textContent = elem.childNodes[0].textContent.match(/(\..*$)/gm)[0].slice(1)
            let target;
            try {
                target = Array.from(data).find(i => i.getAttribute("version") === version)
            } catch {
            }
            if (!target) {
                const prevDatetime = elem.previousElementSibling.querySelector("time").getAttribute("datetime")
                const targetDatetime = new Date(new Date(prevDatetime).getTime() - 1).toISOString()
                if (type === "node") {
                    target = await getNodeViaOverpassXML(objID, targetDatetime)
                } else if (type === "way") {
                    target = await getWayViaOverpassXML(objID, targetDatetime)
                } else if (type === "relation") {
                    target = await getRelationViaOverpassXML(objID, targetDatetime)
                }
                // todo попробовать заменить на оператор timeline в overpass api
            }
            const h4 = document.createElement("h4")
            h4.textContent = versionPrefix ?? "#"
            const versionLink = document.createElement("a")
            versionLink.textContent = version
            versionLink.href = `/${type}/${objID}/history/${version}`
            h4.appendChild(versionLink)

            const comment = document.createElement("p")
            comment.classList.add("fs-6", "overflow-x-auto")
            setTimeout(async () => {
                const res = await fetch(osm_server.apiBase + "changeset" + "/" + target.getAttribute("changeset") + ".json",);
                const jsonRes = await res.json();
                comment.textContent = jsonRes.tags?.comment
            }, 0)

            const ul = document.createElement("ul")
            ul.classList.add("list-unstyled")

            const timeLi = document.createElement("li")
            ul.appendChild(timeLi)

            const time = document.createElement("time")
            time.setAttribute("datetime", target.getAttribute("timestamp"))
            time.setAttribute("natural_text", target.getAttribute("timestamp")) // it should server side string :(
            time.setAttribute("title", target.getAttribute("timestamp")) // it should server side string :(
            time.textContent = (new Date(target.getAttribute("timestamp")).toISOString()).slice(0, -5) + "Z"
            timeLi.appendChild(time)
            timeLi.appendChild(document.createTextNode(" "))

            const user = document.createElement("a")
            user.href = "/user/" + target.getAttribute("user")
            user.textContent = target.getAttribute("user")
            timeLi.appendChild(user)

            const changesetLi = document.createElement("li")
            const changeset = document.createElement("a")
            changeset.href = "/changeset/" + target.getAttribute("changeset")
            changeset.textContent = target.getAttribute("changeset")
            changesetLi.appendChild(document.createTextNode(" #"))
            changesetLi.appendChild(changeset)
            ul.appendChild(changesetLi)

            if (type === "node") {
                const locationLi = document.createElement("li")
                ul.appendChild(locationLi)

                const locationA = document.createElement("a")
                locationA.href = "/#map=18/" + target.getAttribute("lat") + "/" + target.getAttribute("lon")

                const latSpan = document.createElement("span")
                latSpan.classList.add("latitude")
                latSpan.textContent = target.getAttribute("lat")
                locationA.appendChild(latSpan)
                locationA.appendChild(document.createTextNode(", "))

                const lonSpan = document.createElement("span")
                lonSpan.classList.add("longitude")
                lonSpan.textContent = target.getAttribute("lon")
                locationA.appendChild(lonSpan)

                locationLi.appendChild(locationA)
            }

            const tags = document.createElement("div")
            tags.classList.add("mb-3", "border", "border-secondary-subtle", "rounded", "overflow-hidden")
            const table = document.createElement("table")
            table.classList.add("mb-0", "browse-tag-list", "table", "align-middle")
            const tbody = document.createElement("tbody")
            table.appendChild(tbody)

            target.querySelectorAll("tag").forEach(tag => {
                const tr = document.createElement("tr")

                const th = document.createElement("th")
                th.classList.add("py-1", "border-secondary-subtle", "table-secondary", "fw-normal", "history-diff-modified-key")
                const k = tag.getAttribute("k")
                if (keysLinks.has(k)) {
                    const wikiLink = document.createElement("a")
                    wikiLink.textContent = k
                    wikiLink.href = keysLinks.get(k)
                    th.appendChild(wikiLink)
                } else {
                    th.textContent = k
                }

                const td = document.createElement("td")
                td.classList.add("py-1", "border-secondary-subtle", "border-start")
                const v = tag.getAttribute("v")
                if (valuesLinks.has(v)) {
                    const wikiLink = document.createElement("a")
                    wikiLink.textContent = v
                    wikiLink.href = valuesLinks.get(v)
                    td.appendChild(wikiLink)
                } else {
                    td.textContent = v
                }

                tr.appendChild(th)
                tr.appendChild(td)
                tbody.appendChild(tr)
            })
            tags.appendChild(table)
            elem.prepend(h4)
            elem.appendChild(comment)
            elem.appendChild(ul)
            elem.appendChild(tags)

            if (type === "way") {
                const nodes = Array.from(target.querySelectorAll("nd")).map(i => i.getAttribute("ref"))

                const nodesDetails = document.createElement("details")
                const summary = document.createElement("summary")
                summary.textContent = nodes.length
                nodesDetails.appendChild(summary)
                const ulNodes = document.createElement("ul")
                ulNodes.classList.add("list-unstyled")
                nodes.forEach(i => {
                    const nodeLi = document.createElement("li")
                    const a = document.createElement("a")
                    a.classList.add("node")
                    a.href = "/node/" + i
                    a.textContent = i
                    nodeLi.appendChild(a)
                    ulNodes.appendChild(nodeLi)
                })
                nodesDetails.appendChild(ulNodes)
                elem.appendChild(nodesDetails)
            } else if (type === "relation") {
                const members = Array.from(target.querySelectorAll("member")).map(i => {
                    return {
                        ref: i.getAttribute("ref"),
                        type: i.getAttribute("type"),
                        role: i.getAttribute("role")
                    }
                })

                const membersDetails = document.createElement("details")
                const summary = document.createElement("summary")
                summary.textContent = members.length
                membersDetails.appendChild(summary)
                const ulMembers = document.createElement("ul")
                ulMembers.classList.add("list-unstyled")
                members.forEach(i => {
                    const memberLi = document.createElement("li")
                    const a = document.createElement("a")
                    a.classList.add(type)
                    a.href = "/node/" + i.ref
                    a.textContent = i.ref
                    memberLi.appendChild(a)
                    a.before(document.createTextNode(i.type + " "))
                    a.after(document.createTextNode(" " + i.role))
                    ulMembers.appendChild(memberLi)
                })
                membersDetails.appendChild(ulMembers)
                elem.appendChild(membersDetails)
            }

            elem.classList.remove("hidden-version")
            elem.classList.remove("browse-redacted")
            elem.classList.add("browse-unredacted")
            elem.classList.add("browse-node")
        }
        showUnredactedBtn.remove()
        const classesForClean = ["history-diff-new-tag", "history-diff-modified-tag", "non-modified-tag", ".empty-version", "hidden-non-modified-tag", "hidden-empty-version"]
        classesForClean.forEach(className => {
            Array.from(document.getElementsByClassName(className)).forEach(i => {
                i.classList.remove(className)
            })
        })
        const elementClassesForRemove = ["history-diff-deleted-tag-tr", "history-diff-modified-location", "find-user-btn", "way-version-view", "relation-version-view"]
        elementClassesForRemove.forEach(elemClass => {
            Array.from(document.getElementsByClassName(elemClass)).forEach(i => {
                i.remove()
            })
        })

        Array.from(["browse-node", "browse-way", "browse-relation"]).forEach(typeClass => {
            Array.from(document.querySelectorAll("details." + typeClass)).forEach(i => {
                i.querySelector("summary")?.remove()
                const div = document.createElement("div")
                div.innerHTML = i.innerHTML
                div.classList.add("browse-section", typeClass)
                i.replaceWith(div)
            })

        })
        cleanAllObjects()
        document.querySelector(".compact-toggle-btn")?.remove()
        setTimeout(addDiffInHistory, 0)
    }
    if (!document.querySelector('#sidebar .secondary-actions a[href$="show_redactions=true"]')) {
        document.querySelector("#sidebar .secondary-actions").appendChild(document.createElement("br"))
        document.querySelector("#sidebar .secondary-actions").appendChild(showUnredactedBtn)
    }
}

// hard cases:
// https://www.openstreetmap.org/node/1/history
// https://www.openstreetmap.org/node/2/history
// https://www.openstreetmap.org/node/9286365017/history
// https://www.openstreetmap.org/relation/72639/history
// https://www.openstreetmap.org/node/10173297169/history
// https://www.openstreetmap.org/relation/16022751/history
// https://www.openstreetmap.org/node/12084992837/history
// https://www.openstreetmap.org/way/1329437422/history
function addDiffInHistory() {
    addHistoryLink();
    if (document.querySelector("#sidebar_content table")) {
        document.querySelector("#sidebar_content table").querySelectorAll("a").forEach(i => i.setAttribute("target", "_blank"));
    }
    if (!location.pathname.includes("/history")
        || location.pathname === "/history"
        || location.pathname.includes("/history/")
        || location.pathname.includes("/user/")
    ) return;
    if (document.querySelector(".compact-toggle-btn")) {
        return;
    }
    cleanAllObjects()
    hideSearchForm();
    // в хроме фокус не выставляется
    document.querySelector("#sidebar").focus({focusVisible: false}) // focusVisible работает только в Firefox
    document.querySelector("#sidebar").blur()
    makeLinksInTagsClickable();
    if (!location.pathname.includes("/user/")) {
        let compactToggle = document.createElement("button")
        compactToggle.title = "Toggle between full and compact tags diff"
        compactToggle.textContent = "><"
        compactToggle.classList.add("compact-toggle-btn")
        compactToggle.onclick = makeHistoryCompact
        let sidebar = document.querySelector("#sidebar_content h2")
        if (!sidebar) {
            return
        }
        sidebar.appendChild(compactToggle)
    }

    const styleText = `
    .history-diff-new-tag {
      background: rgba(17,238,9,0.6) !important;
    }
    .history-diff-modified-tag {
      background: rgba(223,238,9,0.6) !important;
    }
    .history-diff-deleted-tag {
      background: rgba(238,51,9,0.6) !important;
    }
    
    #sidebar_content div.map-hover {
      background-color: rgba(223, 223, 223, 0.6);
    }
    
    @media (prefers-color-scheme: dark) {
        .history-diff-new-tag {
          background: rgba(4, 123, 0, 0.6) !important;
        }
        .history-diff-modified-tag {
          color: black !important;
        }
        .history-diff-modified-tag a {
          color: #052894;
        }
        .history-diff-deleted-tag {
          color: lightgray !important;
          background: rgba(238,51,9,0.4) !important;
        }
        
        summary.history-diff-modified-tag {
            background: rgba(223,238,9,0.2) !important;
        }
                
        /*li.history-diff-modified-tag {*/
        /*     background: rgba(223,238,9,0.2) !important;*/
        /*}*/
        
        #sidebar_content div.map-hover {
            background-color: rgb(14, 17, 19);
        }
    }
    .non-modified-tag .empty-version {
        
    }
    .hidden-non-modified-tag, .hidden-empty-version {
        display: none;
    }
    .hidden-version, .hidden-h4 {
        display: none;
    }
    
    #sidebar_content h2:not(.changeset-header){
        font-size: 1rem;
    }
    
    h4 {
        font-size: 1rem;
    }
    
    .copied {
      background-color: red !important;
      transition:all 0.3s;
    }
    .was-copied {
      background-color: unset !important;
      transition:all 0.3s;
    }
    
    @media (max-device-width: 640px) and (prefers-color-scheme: dark) {
        td.history-diff-new-tag::selection, /*td.history-diff-modified-tag::selection,*/ td.history-diff-deleted-tag::selection {
            background: black;
        }
        
        th.history-diff-new-tag::selection, /*th.history-diff-modified-tag::selection,*/ th.history-diff-deleted-tag::selection {
            background: black;
        }
        
        td a.history-diff-new-tag::selection, td a.history-diff-modified-tag::selection, td a.history-diff-deleted-tag::selection {
            background: black;
        }
        
        th a.history-diff-new-tag::selection, th a.history-diff-modified-tag::selection, th a.history-diff-deleted-tag::selection {
            background: black;
        }
    }
    
    table.browse-tag-list tr td[colspan="2"] {
        background: var(--bs-body-bg) !important;
    }
    ` + (GM_config.get("ShowChangesetGeometry") ? `
    .way-version-view:hover {
        background-color: yellow;
    }
    
    [way-version]:hover {
        background-color: rgba(244, 244, 244);
    }
    
    @media (prefers-color-scheme: dark) {
        [way-version]:hover {
            background-color: rgb(14, 17, 19);
        }
    }
          
    [way-version].broken-version details:before {
        color: var(--bs-body-color);
        content: "Some nodes were hidden by moderators";
        font-style: italic;
        font-weight: normal;
        font-size: small;
    }
    
    .relation-version-view:hover {
        background-color: yellow;
    }
    
    [relation-version]:hover {
        background-color: rgba(244, 244, 244);
    }
    
    @media (prefers-color-scheme: dark) {
        [relation-version]:hover {
            background-color: rgb(14, 17, 19);
        }
    }
    
    [relation-version].broken-version details:before {
        color: var(--bs-body-color);
        content: "Some members were hidden by moderators";
        font-style: italic;
        font-weight: normal;
        font-size: small;
    }

    @media (prefers-color-scheme: dark) {        
        path.stroke-polyline {
            filter: drop-shadow(1px 1px 0 #7a7a7a) drop-shadow(-1px -1px 0 #7a7a7a) drop-shadow(1px -1px 0 #7a7a7a) drop-shadow(-1px 1px 0 #7a7a7a);
        }
    }
    ` : ``);
    GM_addElement(document.head, "style", {
        textContent: styleText,
    });
    let versions = [{tags: [], coordinates: "", wasModified: false, nodes: [], members: [], visible: true}];
    // add/modification
    let versionsHTML = Array.from(document.querySelectorAll(".browse-section.browse-node, .browse-section.browse-way, .browse-section.browse-relation"))
    for (let ver of versionsHTML.toReversed()) {
        let wasModifiedObject = false;
        let version = ver.children[0].childNodes[1].href.match(/\/(\d+)$/)[1]
        let kv = ver.querySelectorAll("tbody > tr") ?? [];
        let tags = [];

        let metainfoHTML = ver.querySelector('ul > li:nth-child(1)');

        let changesetHTML = ver.querySelector('ul > li:nth-child(2)');
        let changesetA = ver.querySelector('ul a[href^="/changeset"]');
        const changesetID = changesetA.textContent

        let time = Array.from(metainfoHTML.children).find(i => i.localName === "time")
        if (Array.from(metainfoHTML.children).some(e => e.localName === "a" && e.href.includes("/user/"))) {
            let a = Array.from(metainfoHTML.children).find(i => i.localName === "a")
            metainfoHTML.innerHTML = ""
            metainfoHTML.appendChild(time)
            metainfoHTML.appendChild(document.createTextNode(" "))
            metainfoHTML.appendChild(a)
            metainfoHTML.appendChild(document.createTextNode(" "))
        } else {
            metainfoHTML.innerHTML = ""
            metainfoHTML.appendChild(time)
            let findBtn = document.createElement("span")
            findBtn.classList.add("find-user-btn")
            findBtn.title = "Try find deleted user"
            findBtn.textContent = " 🔍 "
            findBtn.value = changesetID
            findBtn.datetime = time.dateTime
            findBtn.style.cursor = "pointer"
            findBtn.onclick = findChangesetInDiff
            metainfoHTML.appendChild(findBtn)
        }

        changesetHTML.innerHTML = ''
        let hashtag = document.createTextNode("#")
        metainfoHTML.appendChild(hashtag)
        metainfoHTML.appendChild(changesetA)
        let visible = true

        let coordinates = null
        if (location.pathname.includes("/node")) {
            coordinates = ver.querySelector("li:nth-child(3) > a")
            if (coordinates) {
                let locationHTML = ver.querySelector('ul > li:nth-child(3)');
                let locationA = ver.querySelector('ul > li:nth-child(3) > a');
                locationHTML.innerHTML = ''
                locationHTML.appendChild(locationA)
            } else {
                visible = false
                wasModifiedObject = true // because sometimes deleted object has tags
                time.before(document.createTextNode("🗑 "))
            }
        } else if (location.pathname.includes("/way")) {
            if (!ver.querySelector("details")) {
                time.before(document.createTextNode("🗑 "))
            }
        } else if (location.pathname.includes("/relation")) {
            if (!ver.querySelector("details")) {
                time.before(document.createTextNode("🗑 "))
            }
        }
        kv.forEach(
            (i) => {
                let k = i.querySelector("th > a")?.textContent ?? i.querySelector("th")?.textContent;
                let v = i.querySelector("td .wdplugin")?.textContent ?? i.querySelector("td")?.textContent;
                if (k === undefined) {
                    // Human-readable Wikidata extension compatibility
                    return
                }
                if (k.includes("colour")) {
                    const tmpV = i.querySelector("td").cloneNode(true)
                    tmpV.querySelector("svg")?.remove()
                    v = tmpV.textContent
                }
                tags.push([k, v])

                let lastTags = versions.slice(-1)[0].tags
                let tagWasModified = false
                if (!lastTags.some((elem) => elem[0] === k)) {
                    i.querySelector("th").classList.add("history-diff-new-tag")
                    i.querySelector("td").classList.add("history-diff-new-tag")
                    wasModifiedObject = tagWasModified = true
                } else if (lastTags.some((elem) => elem[0] === k)) {
                    lastTags.forEach((el) => {
                        if (el[0] === k && el[1] !== v) {
                            i.querySelector("th").classList.add("history-diff-modified-key")
                            i.querySelector("td").classList.add("history-diff-modified-tag")
                            i.title = `was: "${el[1]}"`;
                            wasModifiedObject = tagWasModified = true
                        }
                    })
                }
                if (!tagWasModified) {
                    i.querySelector("th").classList.add("non-modified-tag")
                    i.querySelector("td").classList.add("non-modified-tag")
                }

            }
        )
        const lastCoordinates = versions.slice(-1)[0].coordinates
        const lastVisible = versions.slice(-1)[0].visible
        if (visible && coordinates && versions.length > 1 && coordinates.href !== lastCoordinates) {
            if (lastCoordinates) {
                const curLat = coordinates.querySelector(".latitude").textContent.replace(",", ".");
                const curLon = coordinates.querySelector(".longitude").textContent.replace(",", ".");
                const lastLat = lastCoordinates.match(/#map=.+\/(.+)\/(.+)$/)[1];
                const lastLon = lastCoordinates.match(/#map=.+\/(.+)\/(.+)$/)[2];
                const distInMeters = getDistanceFromLatLonInKm(
                    Number.parseFloat(lastLat),
                    Number.parseFloat(lastLon),
                    Number.parseFloat(curLat),
                    Number.parseFloat(curLon)
                ) * 1000;
                const distTxt = document.createElement("span")
                distTxt.textContent = `${distInMeters.toFixed(1)}m`
                distTxt.classList.add("history-diff-modified-tag")
                distTxt.classList.add("history-diff-modified-location")
                coordinates.after(distTxt);
                coordinates.after(document.createTextNode(" "));
            }
            wasModifiedObject = true
        }
        let childNodes = null
        if (location.pathname.includes("/way")) {
            childNodes = Array.from(ver.querySelectorAll("details ul.list-unstyled li")).map(el => el.textContent.match(/\d+/)[0])
            let lastChildNodes = versions.slice(-1)[0].nodes
            if (version > 1 &&
                (childNodes.length !== lastChildNodes.length
                    || childNodes.some((el, index) => lastChildNodes[index] !== childNodes[index]))) {
                ver.querySelector("details > summary")?.classList.add("history-diff-modified-tag")
                wasModifiedObject = true
            }
            ver.querySelector("details")?.removeAttribute("open")
        } else if (location.pathname.includes("/relation")) {
            childNodes = Array.from(ver.querySelectorAll("details ul.list-unstyled li")).map(el => el.textContent)
            let lastChildMembers = versions.slice(-1)[0].members
            if (version > 1 &&
                (childNodes.length !== lastChildMembers.length
                    || childNodes.some((el, index) => lastChildMembers[index] !== childNodes[index]))) {
                // todo непонятно как подружить отображением редакшнов
                ver.querySelector("details > summary")?.classList.add("history-diff-modified-tag")
                wasModifiedObject = true
            }
            ver.querySelector("details")?.removeAttribute("open")
        }
        versions.push({
            tags: tags,
            coordinates: coordinates?.href ?? lastCoordinates,
            wasModified: wasModifiedObject || (visible && !lastVisible),
            nodes: childNodes,
            members: childNodes,
            visible: visible
        })
        ver.querySelectorAll("h4").forEach((el, index) => (index !== 0) ? el.classList.add("hidden-h4") : null)
        if (tags.length === 1) { // fixme after adding locationzation
            ver.title = tags.length + (['ru-RU', 'ru'].includes(navigator.language) ? " тег" : " tag")
        } else if (tags.length < 10 && tags.length > 20 && ([2, 3, 4].includes(tags.length % 10))) {
            ver.title = tags.length + (['ru-RU', 'ru'].includes(navigator.language) ? " тега" : " tags")
        } else {
            ver.title = tags.length + (['ru-RU', 'ru'].includes(navigator.language) ? " тегов" : " tags")
        }
    }
    // deletion
    Array.from(versionsHTML).forEach((x, index) => {
        if (versionsHTML.length <= index + 1) return;
        versions.toReversed()[index + 1].tags.forEach((tag) => {
            let k = tag[0]
            let v = tag[1]
            if (!versions.toReversed()[index].tags.some((elem) => elem[0] === k)) {
                let tr = document.createElement("tr")
                tr.classList.add("history-diff-deleted-tag-tr")
                let th = document.createElement("th")
                th.textContent = k
                th.classList.add("history-diff-deleted-tag", "py-1", "border-grey", "table-light", "fw-normal")
                let td = document.createElement("td")
                if (k.includes("colour")) {
                    td.innerHTML = `
                        <svg width="14" height="14" class="float-end m-1"><title></title>
                            <rect x="0.5" y="0.5" width="13" height="13" fill="" stroke="#2222"></rect>
                        </svg>`
                    td.querySelector("svg rect").setAttribute("fill", v)
                    td.appendChild(document.createTextNode(v))
                } else {
                    td.textContent = v
                }
                td.classList.add("history-diff-deleted-tag", "py-1", "border-grey", "table-light", "fw-normal")
                tr.appendChild(th)
                tr.appendChild(td)
                if (!x.querySelector("tbody")) {
                    let tableDiv = document.createElement("table")
                    tableDiv.classList.add("mb-3", "border", "border-secondary-subtle", "rounded", "overflow-hidden")
                    let table = document.createElement("table")
                    table.classList.add("mb-0", "browse-tag-list", "table", "align-middle")
                    let tbody = document.createElement("tbody")
                    table.appendChild(tbody)
                    tableDiv.appendChild(table)
                    x.appendChild(tableDiv)
                }
                const firstNonDeletedTag = x.querySelector("th:not(.history-diff-deleted-tag)")?.parentElement
                if (firstNonDeletedTag) {
                    firstNonDeletedTag.before(tr)
                } else {
                    x.querySelector("tbody").appendChild(tr)
                }
                versions[versions.length - index - 1].wasModified = true
            }
        })
        if (!versions[versions.length - index - 1].wasModified) {
            let spoiler = document.createElement("details")
            let summary = document.createElement("summary")
            summary.textContent = x.querySelector("a").textContent
            spoiler.innerHTML = x.innerHTML
            spoiler.prepend(summary)
            spoiler.classList.add("empty-version")
            spoiler.classList.add("browse-" + location.pathname.match(/(node|way|relation)/)[1])
            x.replaceWith(spoiler)
        }
    })
    let hasRedacted = false
    Array.from(document.getElementsByClassName("browse-section browse-redacted")).forEach(
        x => {
            x.classList.add("hidden-version")
            hasRedacted = true
        }
    )
    if (hasRedacted) {
        try {
            setupViewRedactions();
        } catch (e) {
            console.error(e)
        }
    }
    makeHistoryCompact();
    makeHashtagsClickable();
    shortOsmOrgLinks(document.querySelector(".browse-section p"));
    setupNodeVersionView();
    setupWayVersionView();
    setupRelationVersionView();
}


function setupVersionsDiff(path) {
    if (!path.includes("/history")
        && !path.includes("/node")
        && !path.includes("/way")
        && !path.includes("/relation")) {
        return;
    }
    let timerId = setInterval(addDiffInHistory, 500);
    setTimeout(() => {
        clearInterval(timerId);
        console.debug('stop adding diff in history');
    }, 25000);
    addDiffInHistory();
}

function addRelationVersionView() {
    if (document.querySelector("#load-relation-version")) return
    const btn = document.createElement("a")
    btn.textContent = "📥"
    btn.id = "load-relation-version"
    btn.title = "Load relation version via Overpass API"
    btn.style.cursor = "pointer"
    btn.addEventListener("click", async () => {
        btn.style.cursor = "progress"
        const match = location.pathname.match(/relation\/(\d+)\/history\/(\d+)\/?$/)
        const id = parseInt(match[1])
        const timestamp = document.querySelector("time").getAttribute("datetime")
        try {
            await loadRelationVersionMembersViaOverpass(id, timestamp)
        } catch (e) {
            btn.style.cursor = "pointer"
            throw e
        }
        btn.style.visibility = "hidden"
    })
    document.querySelector(".browse-relation h4")?.appendChild(btn)
}

function setupRelationVersionViewer() {
    const match = location.pathname.match(/relation\/(\d+)\/history\/(\d+)\/?$/)
    if (!match) {
        return
    }
    let timerId = setInterval(addRelationVersionView, 500);
    setTimeout(() => {
        clearInterval(timerId);
        console.debug('stop adding RelationVersionView');
    }, 25000);
    addRelationVersionView();
}

// Модули должны стать классами
// - поддерживается всеми браузерами, в которых есть TM
// - изоляция функций и глобальных переменных
// - для модулей, которые внедряются черзе setInterval можно сохранить таймер, чтобы предотвратить дублирование вызовов
// - возможность сохранить результат внедрения

let injectingStarted = false
let tagsOfObjectsVisible = true

// Perf test:                                           https://osm.org/changeset/155712128
// Check way 695574090:                                 https://osm.org/changeset/71014890
// Check deleted relation                               https://osm.org/changeset/155923052
// Heavy ways and deleted relation                      https://osm.org/changeset/153431079
// Downloading parents:                                 https://osm.org/changeset/156331065
// Restored objects                                     https://osm.org/changeset/156515722
// Check ways with version=1                            https://osm.org/changeset/155689740
// Many changes in the coordinates of the intersections https://osm.org/changeset/156331065
// Deleted and restored objects                         https://osm.org/changeset/155160344
// Old edits with unusual objects                       https://osm.org/changeset/1000
// Parent ways only in future                           https://osm.org/changeset/156525401
// Restored tags                                        https://osm.org/changeset/141362243
/**
 * Get editorial prescription via modified Levenshtein distance finding algorithm
 * @template T
 * @param {T[]} arg_a
 * @param {T[]} arg_b
 * @param {number} one_replace_cost
 * @return {[T, T][]}
 */
function arraysDiff(arg_a, arg_b, one_replace_cost = 2) {
    let a = arg_a.map(i => JSON.stringify(i))
    let b = arg_b.map(i => JSON.stringify(i))
    const dp = []
    for (let i = 0; i < a.length + 1; i++) {
        dp[i] = new Uint32Array(b.length + 1);
    }

    for (let i = 0; i <= a.length; i++) {
        dp[i][0] = i
    }

    for (let i = 0; i <= b.length; i++) {
        dp[0][i] = i
    }

    const min = Math.min; // fuck Tampermonkey
    // for some fucking reason every math.min call goes through TM wrapper code
    // that is not optimised by the JIT compiler
    if (arg_a.length && Object.prototype.hasOwnProperty.call(arg_a[0], "role")) {
        for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
                const del_cost = dp[i - 1][j]
                const ins_cost = dp[i][j - 1]
                const replace_cost = dp[i - 1][j - 1] + (a[i - 1] !== b[j - 1]) * one_replace_cost // replacement is not very desirable
                const replace_role_cost = dp[i - 1][j - 1] +
                    ((!(arg_a[i - 1].type === arg_b[j - 1].type && arg_a[i - 1].ref === arg_b[j - 1].ref)) || arg_a[i - 1].role === arg_b[j - 1].role) * one_replace_cost
                dp[i][j] = min(min(del_cost, ins_cost) + 1, min(replace_cost, replace_role_cost))
            }
        }
    } else {
        for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
                const del_cost = dp[i - 1][j]
                const ins_cost = dp[i][j - 1]
                const replace_cost = dp[i - 1][j - 1] + (a[i - 1] !== b[j - 1]) * one_replace_cost // replacement is not very desirable
                dp[i][j] = min(min(del_cost, ins_cost) + 1, replace_cost)
            }
        }
    }

    a = a.map(i => JSON.parse(i))
    b = b.map(i => JSON.parse(i))

    const answer = []
    let i = a.length
    let j = b.length

    while (true) {
        if (i === 0 || j === 0) {
            if (i === 0 && j === 0) {
                break;
            } else if (i === 0) {
                answer.push([null, b[j - 1]])
                j = j - 1
                continue;
            } else {
                answer.push([a[i - 1], null])
                i = i - 1
                continue;
            }
        }

        const del_cost = dp[i - 1][j]
        const ins_cost = dp[i][j - 1]
        let replace_cost = dp[i - 1][j - 1] + (JSON.stringify(a[i - 1]) !== JSON.stringify(b[j - 1])) * one_replace_cost
        if (arg_a.length && Object.prototype.hasOwnProperty.call(arg_a[0], "role")) {
            replace_cost = min(replace_cost, dp[i - 1][j - 1] + ((!(arg_a[i - 1].type === arg_b[j - 1].type && arg_a[i - 1].ref === arg_b[j - 1].ref)) || arg_a[i - 1].role === arg_b[j - 1].role) * one_replace_cost)
        }

        if (del_cost <= ins_cost && del_cost + 1 <= replace_cost) {
            answer.push([a[i - 1], null])
            i = i - 1
        } else if (ins_cost <= del_cost && ins_cost + 1 <= replace_cost) {
            answer.push([null, b[j - 1]])
            j = j - 1
        } else {
            answer.push([a[i - 1], b[j - 1]])
            i = i - 1
            j = j - 1
        }
    }
    return answer.toReversed();
}

/**
 * @param {[]} arr
 * @param N
 * @return {[]}
 */
function arraySplit(arr, N = 2) {
    const chunkSize = Math.max(1, Math.floor(arr.length / N));
    const res = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        res.push(arr.slice(i, i + chunkSize));
    }
    return res;
}

/**
 * @typedef {{
 * closed_at: string,
 * max_lon: number,
 * maxlon: number,
 * created_at: string,
 * type: string,
 * changes_count: number,
 * tags: {},
 * min_lon: number,
 * minlon: number,
 * uid: number,
 * max_lat: number,
 * maxlat: number,
 * minlat: number,
 * comments_count: number,
 * id: number,
 * min_lat: number,
 * user: string,
 * open: boolean}}
 * @name ChangesetMetadata
 */

/**
 * @type ChangesetMetadata|null
 **/
let prevChangesetMetadata = null
/**
 * @type ChangesetMetadata|null
 **/
let changesetMetadata = null
let startTouch = null;
let touchMove = null;
let touchEnd = null;

function addSwipes() {
    if (!GM_config.get("Swipes")) {
        return;
    }
    let startX = 0
    let startY = 0
    let direction = null
    const sidebar = document.querySelector("#sidebar_content")
    sidebar.style.transform = 'translateX(var(--touch-diff, 0px))'

    if (!location.pathname.includes("/changeset/")) {
        sidebar.removeEventListener('touchstart', startTouch)
        sidebar.removeEventListener('touchmove', touchMove)
        sidebar.removeEventListener('touchend', touchEnd)
        startTouch = null;
        touchMove = null;
        touchEnd = null;
    } else {
        if (startTouch !== null) return
        startTouch = e => {
            startX = e.touches[0].clientX
            startY = e.touches[0].clientY
        };

        touchMove = e => {
            const diffY = e.changedTouches[0].clientY - startY;
            const diffX = e.changedTouches[0].clientX - startX;
            if (direction == null) {
                if (diffY >= 10 || diffY <= -10) {
                    direction = "v"
                } else if (diffX >= 10 || diffX <= -10) {
                    direction = "h"
                    startX = e.touches[0].clientX
                }
            } else if (direction === "h") {
                e.preventDefault()
                sidebar.style.setProperty('--touch-diff', `${diffX}px`)
            }
        };

        touchEnd = e => {
            const diffX = startX - e.changedTouches[0].clientX

            sidebar.style.removeProperty('--touch-diff')
            if (direction === "h") {
                if (diffX > sidebar.offsetWidth / 3) {
                    const navigationLinks = document.querySelectorAll("div.secondary-actions")[1]?.querySelectorAll("a")
                    if (navigationLinks && Array.from(navigationLinks).at(-1).href.includes("/changeset/")) {
                        abortDownloadingController.abort(ABORT_ERROR_PREV)
                        Array.from(navigationLinks).at(-1).click()
                    }
                } else if (diffX < -sidebar.offsetWidth / 3) {
                    const navigationLinks = document.querySelectorAll("div.secondary-actions")[1]?.querySelectorAll("a")
                    if (navigationLinks && navigationLinks[0].href.includes("/changeset/")) {
                        abortDownloadingController.abort(ABORT_ERROR_NEXT)
                        navigationLinks[0].click()
                    }
                }
            }
            direction = null
        };

        sidebar.addEventListener('touchstart', startTouch)
        sidebar.addEventListener('touchmove', touchMove)
        sidebar.addEventListener('touchend', touchEnd)
    }
}


let rateLimitBan = false

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function error509Handler(res) {
    rateLimitBan = true
    console.error("oops, DOS block")
    getMap()?.attributionControl?.setPrefix(escapeHtml(await res.text()))
}

function addRegionForFirstChangeset(attempts = 5) {
    if (rateLimitBan) {
        return
    }
    if (getMap().getZoom() <= 10) {
        getMap().attributionControl.setPrefix("")
        if (attempts > 0) {
            console.log(`Attempt №${7 - attempts} for geocoding`)
            setTimeout(() => {
                addRegionForFirstChangeset(attempts - 1)
            }, 100)
        } else {
            console.log("Skip geocoding")
        }
        return
    }
    const center = getMap().getCenter()
    console.time("Geocoding changeset")
    fetch(`https://nominatim.openstreetmap.org/reverse.php?lon=${center.lng}&lat=${center.lat}&format=jsonv2&zoom=10`, {signal: abortDownloadingController.signal}).then((res) => {
        res.json().then((r) => {
            if (r?.address?.state) {
                getMap().attributionControl.setPrefix(`${r.address.state}`)
                console.timeEnd("Geocoding changeset")
            }
        })
    })

}

let iconsList = null

async function loadIconsList() {
    const yml = (await GM.xmlHttpRequest({
        url: `https://raw.githubusercontent.com/openstreetmap/openstreetmap-website/refs/heads/master/config/browse_icons.yml`,
    })).responseText
    iconsList = {}
    // не, ну а почему бы и нет
    yml.match(/[\w_-]+:\s*(([\w_-]|:\*)+:(\s+{.*}\s+))*/g).forEach(tags => {
        const lines = tags.split("\n")
        lines.slice(1).forEach(i => {
            const line = i.trim()
            if (line === "") return;
            const [, value, json] = line.match(/(:\*|\w+): (\{.*})/)
            iconsList[lines[0].slice(0, -1) + "=" + value] = JSON.parse(json.replaceAll(/(\w+):/g, '"$1":'))
        })
    })
    GM_setValue("poi-icons", JSON.stringify({icons: iconsList, cacheTime: new Date()}))
    return iconsList
}

async function initPOIIcons() {
    const cache = GM_getValue("poi-icons", "")
    if (cache) {
        console.log("poi icons cached")
        const cacheTime = new Date(cache['cacheTime'])
        if (cacheTime.setUTCDate(cacheTime.getUTCDate() + 2) < new Date()) {
            console.log("but cache outdated")
            setTimeout(loadIconsList, 0)
        }
        iconsList = JSON.parse(cache)['icons']
    }
    console.log("loading icons")
    await loadIconsList()
}

const nodeFallback = "https://raw.githubusercontent.com/openstreetmap/openstreetmap-website/master/app/assets/images/browse/node.svg"
const wayFallback = "https://raw.githubusercontent.com/openstreetmap/openstreetmap-website/master/app/assets/images/browse/way.svg"
const relationFallback = "https://raw.githubusercontent.com/openstreetmap/openstreetmap-website/master/app/assets/images/browse/relation.svg"

/**
 *
 * @param {string} type
 * @param {[[string, string]]}tags
 * @return {[string, boolean]}
 */
function getPOIIconURL(type, tags) {
    if (!iconsList) {
        return ["", false]
    }

    function getFallback(type) {
        if (type === "node") {
            return nodeFallback
        } else if (type === "way") {
            return wayFallback
        } else if (type === "relation") {
            return relationFallback
        }
    }

    let result = undefined
    tags.forEach(([key, value]) => {
        function makeIconURL(filename) {
            return `https://raw.githubusercontent.com/openstreetmap/openstreetmap-website/master/app/assets/images/browse/` + filename
        }

        if (iconsList[key + "=" + value] === undefined) {
            if (iconsList[key + "=:*"] && !result) {
                result = [makeIconURL(iconsList[key + "=:*"]["filename"]), iconsList[key + "=:*"]["invert"]]
            }
        } else {
            result = [makeIconURL(iconsList[key + "=" + value]["filename"]), iconsList[key + "=" + value]["invert"]]
        }
    })
    return result ?? [getFallback(type), false]
}


function makeTagRow(key, value, addTd = false) {
    const tagRow = document.createElement("tr")
    const tagTh = document.createElement("th")
    const tagTd = document.createElement("td")
    tagRow.appendChild(tagTh)
    tagRow.appendChild(tagTd)
    if (addTd) {
        const td = document.createElement("td")
        td.classList.add("tag-flag")
        tagRow.appendChild(td)
    }
    tagTh.textContent = key
    tagTd.textContent = value
    return tagRow
}


function makeLinksInRowClickable(row) {
    if (row.querySelector("td").textContent.match(/^https?:\/\//)) {
        const a = document.createElement("a")
        a.textContent = row.querySelector("td").textContent
        a.href = row.querySelector("td").textContent
        row.querySelector("td").textContent = ""
        a.target = "_blank"
        a.onclick = e => {
            e.stopPropagation()
            e.stopImmediatePropagation()
        }
        row.querySelector("td").appendChild(a)
    } else {
        if (row.querySelector("th").textContent.startsWith("panoramax")) {
            makePanoramaxValue(row.querySelector("td"))
        } else if (row.querySelector("th").textContent.startsWith("mapillary")) {
            makeMapillaryValue(row.querySelector("td"))
        } else if (row.querySelector("th").textContent.startsWith("wikimedia_commons")) {
            makeWikimediaCommonsValue(row.querySelector("td"))
        }
    }
}

function detectEditsWars(prevVersion, targetVersion, objHistory, row, key) {
    let revertsCounter = 0
    let warLog = document.createElement("table")
    warLog.style.borderColor = "var(--bs-body-color)";
    warLog.style.borderStyle = "solid";
    warLog.style.borderWidth = "1px";
    warLog.title = ""
    for (let j = 0; j < objHistory.length; j++) {
        const it = objHistory[j];

        const prevIt = (objHistory[j - 1]?.tags ?? {})[key]
        const targetIt = (it.tags ?? {})[key]
        const prevTag = (prevVersion.tags ?? {})[key]
        const targetTag = (targetVersion.tags ?? {})[key]

        if (prevIt === targetIt) {
            continue
        }

        if (prevTag === targetIt) {
            revertsCounter++
        }
        if (targetIt === undefined) {
            const tr = document.createElement("tr")
            tr.classList.add("quick-look-deleted-tag")
            const th_ver = document.createElement("th")
            const ver_link = document.createElement("a")
            ver_link.textContent = `v${it.version}`
            ver_link.href = `/${it.type}/${it.id}/history/${it.version}`
            ver_link.target = "_blank"
            ver_link.style.color = "unset"
            th_ver.appendChild(ver_link)
            const td_user = document.createElement("td")
            td_user.textContent = `${it.user}`
            const td_tag = document.createElement("td")
            td_tag.textContent = "<deleted>"
            tr.appendChild(th_ver)
            tr.appendChild(td_user)
            tr.appendChild(td_tag)
            warLog.appendChild(tr)
        } else {
            const tr = document.createElement("tr")
            const th_ver = document.createElement("th")
            const ver_link = document.createElement("a")
            ver_link.textContent = `v${it.version}`
            ver_link.href = `/${it.type}/${it.id}/history/${it.version}`
            ver_link.target = "_blank"
            ver_link.style.color = "unset"
            th_ver.appendChild(ver_link)
            const td_user = document.createElement("td")
            td_user.textContent = `${it.user}`
            const td_tag = document.createElement("td")
            td_tag.textContent = it.tags[key]
            tr.appendChild(th_ver)
            tr.appendChild(td_user)
            tr.appendChild(td_tag)
            warLog.appendChild(tr)
        }
    }
    if (revertsCounter > 3) {
        row.classList.add("edits-wars-tag")
        row.title = `Edits war. ${row.title}\nClick for details`
    }
    const tr = document.createElement("tr")
    const td = document.createElement("td")
    td.appendChild(warLog)
    td.colSpan = 3
    tr.style.display = "none"
    tr.appendChild(td)

    row.after(tr)
    row.querySelector("td.tag-flag").style.cursor = "pointer"
    row.querySelector("td.tag-flag").onclick = (e) => {
        e.stopPropagation()
        e.stopImmediatePropagation()
        if (e.target.getAttribute("open")) {
            tr.style.display = "none"
            e.target.removeAttribute("open")
        } else {
            tr.style.removeProperty("display")
            e.target.setAttribute("open", "true")
        }
    }
}

const emptyVersion = {
    tags: {},
    version: 0,
    lat: null,
    lon: null,
    visible: false
}


/**
 * @param {string} targetTimestamp
 * @param {string|number} wayID
 * @return {Promise<(*[])[]>}
 */
async function getWayNodesByTimestamp(targetTimestamp, wayID) {
    const targetVersion = searchVersionByTimestamp(await getWayHistory(wayID), targetTimestamp);
    if (targetVersion === null) {
        return
    }
    const [, wayNodesHistories] = await loadWayVersionNodes(wayID, targetVersion.version)
    const targetNodes = filterObjectListByTimestamp(wayNodesHistories, targetTimestamp)

    const nodesMap = {}
    targetNodes.forEach(elem => {
        nodesMap[elem.id] = [elem.lat, elem.lon]
    })

    let currentNodesList = []
    targetVersion.nodes.forEach(node => {
        if (node in nodesMap) {
            currentNodesList.push(nodesMap[node])
        } else {
            console.error(wayID, node)
            console.trace()
        }
    })
    return [targetVersion, currentNodesList]
}

let pinnedRelations = new Set();

/**
 * @param {Element} i
 * @param {string} objType
 * @param {NodeVersion|WayVersion|RelationVersion} prevVersion
 * @param {NodeVersion|WayVersion|RelationVersion} targetVersion
 * @param {NodeVersion|WayVersion|RelationVersion} lastVersion
 * @param {NodeVersion[]|WayVersion[]|RelationVersion[]} objHistory
 */
async function processObject(i, objType, prevVersion, targetVersion, lastVersion, objHistory) {
    const tagsTable = document.createElement("table")
    tagsTable.classList.add("quick-look")
    const tbody = document.createElement("tbody")
    tagsTable.appendChild(tbody)

    let tagsWasChanged = false;

    // tags deletion
    if (prevVersion.version !== 0) {
        for (const [key, value] of Object.entries(prevVersion?.tags ?? {})) {
            if (targetVersion.tags === undefined || targetVersion.tags[key] === undefined) {
                const row = makeTagRow(key, value, true)
                row.classList.add("quick-look-deleted-tag")
                tbody.appendChild(row)
                tagsWasChanged = true
                if (lastVersion.tags && lastVersion.tags[key] === prevVersion.tags[key]) {
                    row.classList.add("restored-tag")
                    row.title = row.title + "The tag is now restored"
                }
                makeLinksInRowClickable(row)
                detectEditsWars(prevVersion, targetVersion, objHistory, row, key)
            }
        }
    }
    // tags add/modification
    for (const [key, value] of Object.entries(targetVersion.tags ?? {})) {
        const row = makeTagRow(key, value, true)
        if (prevVersion.tags === undefined || prevVersion.tags[key] === undefined) {
            tagsWasChanged = true
            row.classList.add("quick-look-new-tag")
            if (!lastVersion.tags || lastVersion.tags[key] !== targetVersion.tags[key]) {
                if (lastVersion.tags && lastVersion.tags[key]) {
                    row.classList.add("replaced-tag")
                    row.title = `Now is ${key}=${lastVersion.tags[key]}`
                } else if (lastVersion.visible !== false) {
                    row.classList.add("removed-tag")
                    row.title = `The tag is now deleted`
                }
            }
            makeLinksInRowClickable(row)
            tbody.appendChild(row)
            detectEditsWars(prevVersion, targetVersion, objHistory, row, key)
        } else if (prevVersion.tags[key] !== value) {
            // todo reverted changes
            const valCell = row.querySelector("td")
            row.classList.add("quick-look-modified-tag")
            // toReversed is dirty hack for group inserted/deleted symbols https://osm.org/changeset/157338007
            const diff = arraysDiff(Array.from(prevVersion.tags[key]).toReversed(), Array.from(valCell.textContent).toReversed(), 1).toReversed()
            // for one character diff
            // example: https://osm.org/changeset/157002657
            if (valCell.textContent.length > 1 && prevVersion.tags[key].length > 1
                && (
                    diff.length === valCell.textContent.length && prevVersion.tags[key].length === valCell.textContent.length
                    && diff.reduce((cnt, b) => cnt + (b[0] !== b[1]), 0) === 1
                    || diff.reduce((cnt, b) => cnt + (b[0] !== b[1] && b[0] !== null), 0) === 0
                    || diff.reduce((cnt, b) => cnt + (b[0] !== b[1] && b[1] !== null), 0) === 0
                )) {
                let prevText = document.createElement("span")
                let newText = document.createElement("span")
                diff.forEach(c => {
                    if (c[0] !== c[1]) {
                        {
                            const colored = document.createElement("span")
                            if (isDarkMode()) {
                                colored.style.background = "rgba(25, 223, 25, 0.9)"
                            } else {
                                colored.style.background = "rgba(25, 223, 25, 0.6)"
                            }
                            colored.textContent = c[1]
                            newText.appendChild(colored)
                        }
                        {
                            const colored = document.createElement("span")
                            if (isDarkMode()) {
                                colored.style.background = "rgba(253, 83, 83, 0.8)"
                            } else {
                                colored.style.background = "rgba(255, 144, 144, 0.6)"
                            }
                            colored.textContent = c[0]
                            prevText.appendChild(colored)
                        }
                    } else {
                        prevText.appendChild(document.createTextNode(c[0]))
                        newText.appendChild(document.createTextNode(c[1]))
                    }
                })
                valCell.textContent = ""
                valCell.appendChild(prevText)
                valCell.appendChild(document.createTextNode(" → "))
                valCell.appendChild(newText)
            } else {
                valCell.textContent = prevVersion.tags[key] + " → " + valCell.textContent
            }
            valCell.title = "was: " + prevVersion.tags[key]
            tagsWasChanged = true
            if (!lastVersion.tags || lastVersion.tags[key] !== targetVersion.tags[key]) {
                if (lastVersion.tags && prevVersion.tags && lastVersion.tags[key] === prevVersion.tags[key]) {
                    row.classList.add("reverted-tag")
                    row.title = `The tag is now reverted`
                } else if (lastVersion.tags && lastVersion.tags[key]) {
                    row.classList.add("replaced-tag")
                    row.title = `Now is ${key}=${lastVersion.tags[key]}`
                } else if (lastVersion.visible !== false) {
                    row.classList.add("removed-tag")
                    row.title = `The tag is now deleted`
                }
            }
            tbody.appendChild(row)
            detectEditsWars(prevVersion, targetVersion, objHistory, row, key)
        } else {
            row.classList.add("non-modified-tag-in-quick-view")
            if (!tagsOfObjectsVisible) {
                row.setAttribute("hidden", "true")
            }
            makeLinksInRowClickable(row)
            tbody.appendChild(row)
        }
    }
    if (targetVersion.visible !== false && prevVersion?.nodes && prevVersion.nodes.toString() !== targetVersion.nodes?.toString()) {
        let geomChangedFlag = document.createElement("span")
        geomChangedFlag.textContent = " 📐"
        geomChangedFlag.title = "List of way nodes has been changed"
        geomChangedFlag.style.userSelect = "none"
        geomChangedFlag.style.background = "rgba(223,238,9,0.6)"
        geomChangedFlag.style.cursor = "pointer"

        const nodesTable = document.createElement("table")
        nodesTable.classList.add("way-nodes-table")
        nodesTable.style.display = "none"
        const tbody = document.createElement("tbody")
        nodesTable.style.borderWidth = "2px"
        nodesTable.onclick = e => {
            e.stopPropagation()
        }
        tbody.style.borderWidth = "2px"
        nodesTable.appendChild(tbody)

        function makeWayDiffRow(left, right) {
            const row = document.createElement("tr")
            const tagTd = document.createElement("td")
            const tagTd2 = document.createElement("td")
            tagTd.style.borderWidth = "2px"
            tagTd2.style.borderWidth = "2px"
            row.style.borderWidth = "2px"
            row.appendChild(tagTd)
            row.appendChild(tagTd2)
            tagTd.textContent = left
            tagTd2.textContent = right
            tagTd.style.textAlign = "right"
            tagTd2.style.textAlign = "right"

            if (typeof left === "number") {
                tagTd.onmouseenter = async e => {
                    e.stopPropagation() // fixme
                    e.target.classList.add("way-version-node")
                    const targetTimestamp = (new Date(new Date(changesetMetadata.created_at).getTime() - 1)).toISOString()
                    const version = searchVersionByTimestamp(await getNodeHistory(left), targetTimestamp)
                    showActiveNodeMarker(version.lat.toString(), version.lon.toString(), "#ff00e3")
                }
                tagTd.onclick = async e => {
                    e.stopPropagation() // fixme
                    const targetTimestamp = (new Date(new Date(changesetMetadata.created_at).getTime() - 1)).toISOString()
                    const version = searchVersionByTimestamp(await getNodeHistory(left), targetTimestamp)
                    panTo(version.lat.toString(), version.lon.toString())
                }
                tagTd.onmouseleave = e => {
                    e.target.classList.remove("way-version-node")
                }
            } else {
                tagTd.onclick = e => {
                    e.stopPropagation()
                }
            }

            if (typeof right === "number") {
                tagTd2.onmouseenter = async e => {
                    e.stopPropagation() // fixme
                    e.target.classList.add("way-version-node")
                    const version = searchVersionByTimestamp(await getNodeHistory(right), changesetMetadata.closed_at ?? new Date().toISOString())
                    showActiveNodeMarker(version.lat.toString(), version.lon.toString(), "#ff00e3")
                }
                tagTd2.onclick = async e => {
                    e.stopPropagation() // fixme
                    e.target.classList.add("way-version-node")
                    const version = searchVersionByTimestamp(await getNodeHistory(right), changesetMetadata.closed_at ?? new Date().toISOString())
                    panTo(version.lat.toString(), version.lon.toString())
                }
                tagTd2.onmouseleave = e => {
                    e.target.classList.remove("way-version-node")
                }
            } else {
                tagTd2.onclick = e => {
                    e.stopPropagation()
                }
            }

            return row
        }

        let haveOnlyInsertion = true
        let haveOnlyDeletion = true
        const lineWasReversed = JSON.stringify(prevVersion.nodes.toReversed()) === JSON.stringify(targetVersion.nodes)
        if (lineWasReversed) {
            const row = makeWayDiffRow("", "🔃")
            row.querySelectorAll("td").forEach(i => i.style.textAlign = "center")
            row.querySelector("td:nth-of-type(2)").title = "Nodes of the way were reversed"
            tbody.appendChild(row)

            prevVersion.nodes.forEach((i, index) => {
                const row = makeWayDiffRow(i, targetVersion.nodes[index])
                row.querySelector("td:nth-of-type(2)").style.background = "rgba(223,238,9,0.6)"
                row.style.fontFamily = "monospace"
                tbody.appendChild(row)
            })
            haveOnlyInsertion = false
            haveOnlyDeletion = false
        } else {
            arraysDiff(prevVersion.nodes ?? [], targetVersion.nodes ?? []).forEach(i => {
                const row = makeWayDiffRow(i[0], i[1])
                if (i[0] === null) {
                    row.style.background = "rgba(17,238,9,0.6)"
                    haveOnlyDeletion = false
                } else if (i[1] === null) {
                    row.style.background = "rgba(238,51,9,0.6)"
                    haveOnlyInsertion = false
                } else if (i[0] !== i[1]) {
                    row.style.background = "rgba(223,238,9,0.6)" // never executed?
                    haveOnlyInsertion = false
                    haveOnlyDeletion = false
                }
                row.style.fontFamily = "monospace"
                tbody.appendChild(row)
            })
        }
        if (haveOnlyInsertion) {
            if (isDarkMode()) {
                geomChangedFlag.style.background = "rgba(17, 238, 9, 0.3)"
            } else {
                geomChangedFlag.style.background = "rgba(101,238,9,0.6)"
            }
        } else if (haveOnlyDeletion) {
            if (isDarkMode()) {
                geomChangedFlag.style.background = "rgba(238, 51, 9, 0.4)"
            } else {
                geomChangedFlag.style.background = "rgba(238, 9, 9, 0.42)"
            }
        }

        const tagsTable = document.createElement("table")
        tagsTable.style.display = "none"
        const tbodyForTags = document.createElement("tbody")
        tagsTable.appendChild(tbodyForTags)

        Object.entries(targetVersion.tags ?? {}).forEach(([k, v]) => {
            const row = makeTagRow(k, v)
            makeLinksInRowClickable(row)
            tbodyForTags.appendChild(row)
        })

        geomChangedFlag.onclick = e => {
            e.stopPropagation()
            if (nodesTable.style.display === "none") {
                nodesTable.style.display = ""
                tagsTable.style.display = ""
            } else {
                nodesTable.style.display = "none"
                tagsTable.style.display = "none"
            }
        }

        i.appendChild(geomChangedFlag)

        geomChangedFlag.after(nodesTable)
        geomChangedFlag.after(tagsTable)
        if (lineWasReversed) {
            geomChangedFlag.after(document.createTextNode(['ru-RU', 'ru'].includes(navigator.language) ? " ⓘ Линию перевернули" : "ⓘ The line has been reversed"))
        }

    }
    if (objType === "way" && targetVersion.visible !== false) {
        if (prevVersion.nodes && prevVersion.nodes.length !== targetVersion.nodes?.length) {
            i.title += (i.title === "" ? "" : "\n") + `Nodes count: ${prevVersion.nodes.length} → ${targetVersion.nodes.length}`
        } else {
            i.title += (i.title === "" ? "" : "\n") + `Nodes count: ${targetVersion.nodes.length}`
        }
    }
    if (prevVersion.visible === false && targetVersion?.visible !== false && targetVersion.version !== 1) {
        let restoredElemFlag = document.createElement("span")
        restoredElemFlag.textContent = " ♻️"
        restoredElemFlag.title = "Object was restored"
        restoredElemFlag.style.userSelect = "none"
        i.appendChild(restoredElemFlag)
    }
    if (objType === "relation") {
        let memChangedFlag = document.createElement("span")
        memChangedFlag.textContent = " 👥"
        memChangedFlag.style.userSelect = "none"
        let membersChanged = false
        if (JSON.stringify(prevVersion?.members ?? []) !== JSON.stringify(targetVersion.members) && targetVersion.version !== 1) {
            memChangedFlag.style.background = "rgba(223,238,9,0.6)"
            memChangedFlag.title = "List of relation members has been changed.\nСlick to see more details"
            membersChanged = true
        } else {
            memChangedFlag.title = "Show list of relation members"
        }
        memChangedFlag.style.cursor = "pointer"


        const membersTable = document.createElement("table")
        membersTable.classList.add("relation-members-table")
        membersTable.style.display = "none"
        const tbody = document.createElement("tbody")
        membersTable.style.borderWidth = "2px"
        tbody.style.borderWidth = "2px"
        membersTable.appendChild(tbody)


        const nodeIcon = GM_getResourceURL("NODE_ICON", false)
        const wayIcon = GM_getResourceURL("WAY_ICON", false)
        const relationIcon = GM_getResourceURL("RELATION_ICON", false)
        // const nodeIcon = nodeFallback
        // const wayIcon = wayFallback
        // const relationIcon = relationFallback

        /**
         * @param {RelationMember} member
         */
        function getIcon(member) {
            if (member?.type === "node") {
                return nodeIcon
            } else if (member?.type === "way") {
                return wayIcon
            } else if (member?.type === "relation") {
                return relationIcon
            } else {
                console.error(member);
                console.trace();
            }
        }

        /**
         * @param {string|RelationMember} left
         * @param {string|RelationMember} right
         */
        function makeRelationDiffRow(left, right) {
            const row = document.createElement("tr")
            const tagTd = document.createElement("td")
            const tagTd2 = document.createElement("td")
            tagTd.style.borderWidth = "2px"
            tagTd2.style.borderWidth = "2px"
            row.style.borderWidth = "2px"
            row.appendChild(tagTd)
            row.appendChild(tagTd2)

            const leftRefSpan = document.createElement("span")
            leftRefSpan.classList.add("rel-ref")
            leftRefSpan.textContent = `${left?.ref ?? ""} `
            const leftRoleSpan = document.createElement("span")
            leftRoleSpan.classList.add("rel-role")
            leftRoleSpan.textContent = `${left?.role ?? ""}`

            tagTd.appendChild(leftRefSpan)
            tagTd.appendChild(leftRoleSpan)

            if (left && typeof left === "object") {
                const icon = document.createElement("img")
                icon.src = getIcon(left)
                icon.style.height = "1em"
                icon.style.marginLeft = "1px"
                icon.style.marginTop = "-3px"
                tagTd.appendChild(icon)
            }

            const rightRefSpan = document.createElement("span")
            rightRefSpan.textContent = `${right?.ref ?? ""} `
            rightRefSpan.classList.add("rel-ref")
            const rightRoleSpan = document.createElement("span")
            rightRoleSpan.textContent = `${right?.role ?? ""}`
            rightRoleSpan.classList.add("rel-role")

            tagTd2.appendChild(rightRefSpan)
            tagTd2.appendChild(rightRoleSpan)

            if (right && typeof right === "object") {
                const icon = document.createElement("img")
                icon.src = getIcon(right)
                icon.style.height = "1em"
                icon.style.marginLeft = "1px"
                icon.style.marginTop = "-3px"
                tagTd2.appendChild(icon)
            }
            tagTd2.style.cursor = "";
            tagTd.style.textAlign = "right"
            tagTd2.style.textAlign = "right"

            if (left && typeof left === "object") {
                tagTd.onmouseenter = async e => {
                    e.stopPropagation()
                    e.target.classList.add("relation-version-node")
                    const targetTimestamp = (new Date(new Date(changesetMetadata.created_at).getTime() - 1)).toISOString()
                    if (left.type === "node") {
                        const version = searchVersionByTimestamp(await getNodeHistory(left.ref), targetTimestamp)
                        showActiveNodeMarker(version.lat.toString(), version.lon.toString(), "#ff00e3")
                        tagTd.title = ""
                        for (let tagsKey in version.tags ?? {}) {
                            tagTd.title += `${tagsKey}=${version.tags[tagsKey]}\n`;
                        }
                    } else if (left.type === "way") {
                        const [, currentNodesList] = await getWayNodesByTimestamp(targetTimestamp, left.ref)
                        showActiveWay(cloneInto(currentNodesList, unsafeWindow))
                        const version = searchVersionByTimestamp(await getWayHistory(left.ref), targetTimestamp)
                        tagTd.title = ""
                        for (let tagsKey in version.tags ?? {}) {
                            tagTd.title += `${tagsKey}=${version.tags[tagsKey]}\n`;
                        }
                    } else if (left.type === "relation") {
                        // todo
                    }
                }

                tagTd.onmouseleave = e => {
                    e.target.classList.remove("relation-version-node")
                }
                tagTd.onclick = async e => {
                    e.stopPropagation()
                    const targetTimestamp = (new Date(new Date(changesetMetadata.created_at).getTime() - 1)).toISOString()
                    if (left.type === "node") {
                        const version = searchVersionByTimestamp(await getNodeHistory(left.ref), targetTimestamp)
                        panTo(version.lat.toString(), version.lon.toString())
                    } else if (left.type === "way") {
                        const [, currentNodesList] = await getWayNodesByTimestamp(targetTimestamp, left.ref)
                        showActiveWay(cloneInto(currentNodesList, unsafeWindow), "#ff00e3", true)
                    }
                }
            }

            if (right && typeof right === "object") {
                tagTd2.onmouseenter = async e => {
                    e.stopPropagation() // fixme
                    e.target.classList.add("relation-version-node")
                    const targetTimestamp = (new Date(changesetMetadata.closed_at ?? new Date())).toISOString()
                    if (right.type === "node") {
                        const version = searchVersionByTimestamp(await getNodeHistory(right.ref), targetTimestamp)
                        showActiveNodeMarker(version.lat.toString(), version.lon.toString(), "#ff00e3")
                        tagTd2.title = ""
                        for (let tagsKey in version.tags ?? {}) {
                            tagTd2.title += `${tagsKey}=${version.tags[tagsKey]}\n`;
                        }
                    } else if (right.type === "way") {
                        const [, currentNodesList] = await getWayNodesByTimestamp(targetTimestamp, right.ref)
                        showActiveWay(cloneInto(currentNodesList, unsafeWindow))
                        const version = searchVersionByTimestamp(await getWayHistory(right.ref), targetTimestamp)
                        tagTd2.title = ""
                        for (let tagsKey in version.tags ?? {}) {
                            tagTd2.title += `${tagsKey}=${version.tags[tagsKey]}\n`;
                        }
                    } else if (right.type === "relation") {
                        // todo
                    }
                }
                tagTd2.onmouseleave = e => {
                    e.target.classList.remove("relation-version-node")
                }
                tagTd2.onclick = async e => {
                    e.stopPropagation()
                    const targetTimestamp = (new Date(changesetMetadata.closed_at ?? new Date())).toISOString()
                    if (right.type === "node") {
                        const version = searchVersionByTimestamp(await getNodeHistory(right.ref), targetTimestamp)
                        panTo(version.lat.toString(), version.lon.toString())
                    } else if (right.type === "way") {
                        const [, currentNodesList] = await getWayNodesByTimestamp(targetTimestamp, right.ref)
                        showActiveWay(cloneInto(currentNodesList, unsafeWindow), "#ff00e3", true)
                    }
                }
            }

            return row
        }

        let haveOnlyInsertion = true
        let haveOnlyDeletion = true

        function colorizeFlag() {
            if (haveOnlyInsertion && membersChanged && targetVersion.version !== 1) {
                if (isDarkMode()) {
                    memChangedFlag.style.background = "rgba(17, 238, 9, 0.3)"
                } else {
                    memChangedFlag.style.background = "rgba(101,238,9,0.6)"
                }
            } else if (haveOnlyDeletion && membersChanged) {
                if (isDarkMode()) {
                    memChangedFlag.style.background = "rgba(238, 51, 9, 0.4)"
                } else {
                    memChangedFlag.style.background = "rgba(238, 9, 9, 0.42)"
                }
            }
        }

        if (JSON.stringify((prevVersion?.members ?? []).toReversed()) === JSON.stringify(targetVersion.members)) {
            // members reversed
            const row = makeRelationDiffRow("", "🔃")
            row.querySelectorAll("td").forEach(i => i.style.textAlign = "center")
            row.querySelector("td:nth-of-type(2)").title = "Members of the relation were reversed"
            tbody.appendChild(row)

            prevVersion?.members?.forEach((i, index) => {
                const row = makeRelationDiffRow(i, targetVersion.members[index])
                row.querySelector("td:nth-of-type(2)").style.background = "rgba(223,238,9,0.6)"
                row.style.fontFamily = "monospace"
                tbody.appendChild(row)
            })
            haveOnlyInsertion = false
            haveOnlyDeletion = false
            colorizeFlag()
        } else {
            memChangedFlag.style.display = "none"
            setTimeout(() => {
                arraysDiff(prevVersion?.members ?? [], targetVersion.members ?? []).forEach(i => {
                    const row = makeRelationDiffRow(i[0], i[1])
                    if (i[0] === null) {
                        row.style.background = "rgba(17,238,9,0.6)"
                        haveOnlyDeletion = false
                    } else if (i[1] === null) {
                        row.style.background = "rgba(238,51,9,0.6)"
                        haveOnlyInsertion = false
                    } else if (JSON.stringify(i[0]) !== JSON.stringify(i[1])) {
                        if (i[0].ref === i[1].ref && i[0].type === i[1].type) {
                            row.querySelectorAll(".rel-role").forEach(i => {
                                i.style.background = "rgba(223,238,9,0.6)"
                                if (isDarkMode()) {
                                    i.style.color = "black"
                                }
                            })
                        } else {
                            row.style.background = "rgba(223,238,9,0.6)"
                            if (isDarkMode()) {
                                row.style.color = "black"
                            }
                        }
                        haveOnlyInsertion = false
                        haveOnlyDeletion = false
                    }
                    row.style.fontFamily = "monospace"
                    tbody.appendChild(row)
                })
                memChangedFlag.style.display = ""
                colorizeFlag()
            })
        }

        const tagsTable = document.createElement("table")
        tagsTable.style.display = "none"
        const tbodyForTags = document.createElement("tbody")
        tagsTable.appendChild(tbodyForTags)

        Object.entries(targetVersion.tags ?? {}).forEach(([k, v]) => {
            const row = makeTagRow(k, v)
            makeLinksInRowClickable(row)
            tbodyForTags.appendChild(row)
        })

        memChangedFlag.onclick = e => {
            // todo preload first elements
            e.stopPropagation()
            if (membersTable.style.display === "none") {
                membersTable.style.display = ""
                tagsTable.style.display = ""
            } else {
                membersTable.style.display = "none"
                tagsTable.style.display = "none"
            }
        }

        i.appendChild(memChangedFlag)
        const pinRelation = document.createElement("span")
        pinRelation.textContent = "📌"
        pinRelation.classList.add("pin-relation")
        pinRelation.style.cursor = "pointer"
        pinRelation.style.display = "none"
        pinRelation.title = "Pin relation on map"
        pinRelation.onclick = async (e) => {
            e.stopImmediatePropagation()
            if (!pinRelation.classList.contains("pinned")) {
                pinnedRelations.add(targetVersion.id)
                pinRelation.style.cursor = "progress"
                const color = (darkModeForMap && isDarkMode()) ? "#000" : "#373737";
                await loadRelationVersionMembersViaOverpass(targetVersion.id, targetVersion.timestamp, false, color, `customObjects/${targetVersion.id}`, darkModeForMap && isDarkMode())
                pinRelation.style.cursor = "pointer"
                pinRelation.classList.add("pinned")
                pinRelation.textContent = "📍"
                pinRelation.title = "Unpin relation from map"
            } else {
                pinRelation.title = "Pin relation on map"
                pinRelation.classList.remove("pinned")
                pinRelation.textContent = "📌"
                cleanObjectsByKey(`customObjects/${targetVersion.id}`)
                pinnedRelations.delete(targetVersion.id)
            }
        }
        memChangedFlag.after(pinRelation)

        pinRelation.after(membersTable)
        if (membersChanged) {
            pinRelation.after(tagsTable)
        }
    }
    if (targetVersion.lat && prevVersion.lat && (prevVersion.lat !== targetVersion.lat || prevVersion.lon !== targetVersion.lon)) {
        i.parentElement.parentElement.classList.add("location-modified")
        const locationChangedFlag = document.createElement("span")
        const distInMeters = getDistanceFromLatLonInKm(
            prevVersion.lat,
            prevVersion.lon,
            targetVersion.lat,
            targetVersion.lon,
        ) * 1000;
        locationChangedFlag.textContent = ` 📍${distInMeters.toFixed(1)}m`
        locationChangedFlag.title = "Coordinates of node has been changed"
        locationChangedFlag.classList.add("location-modified-marker")
        // if (distInMeters > 100) {
        //     locationChangedFlag.classList.add("location-modified-marker-warn")
        // }
        locationChangedFlag.style.userSelect = "none"
        if (isDarkMode()) {
            locationChangedFlag.style.background = "rgba(223, 238, 9, 0.6)"
            locationChangedFlag.style.color = "black"
        } else {
            locationChangedFlag.style.background = "rgba(223,238,9,0.6)"
        }
        i.appendChild(locationChangedFlag)
        locationChangedFlag.onmouseover = e => {
            e.stopPropagation()
            e.stopImmediatePropagation()
            showActiveNodeMarker(targetVersion.lat.toString(), targetVersion.lon.toString(), "#ff00e3")
            showActiveNodeMarker(prevVersion.lat.toString(), prevVersion.lon.toString(), "#0022ff", false)
        }
        locationChangedFlag.onclick = (e) => {
            e.stopPropagation()
            e.stopImmediatePropagation()
            fitBoundsWithPadding([
                [prevVersion.lat.toString(), prevVersion.lon.toString()],
                [targetVersion.lat.toString(), targetVersion.lon.toString()]
            ], 30)
        }
        if (lastVersion.visible !== false && (prevVersion.lat === lastVersion.lat && prevVersion.lon === lastVersion.lon)) {
            locationChangedFlag.classList.add("reverted-coordinates")
            locationChangedFlag.title += ",\nbut now they have been restored."
        }
    }
    if (targetVersion.visible === false) {
        i.parentElement.parentElement.classList.add("removed-object")
    }
    if (targetVersion.version !== lastVersion.version && lastVersion.visible === false) {
        i.appendChild(document.createTextNode(['ru-RU', 'ru'].includes(navigator.language) ? " ⓘ Объект уже удалён" : " ⓘ The object is now deleted"))
    }
    if (targetVersion.visible === false && lastVersion.visible !== false) {
        i.appendChild(document.createTextNode(['ru-RU', 'ru'].includes(navigator.language) ? " ⓘ Объект сейчас восстановлен" : " ⓘ The object is now restored"))
    }
    // if (objType === "node") {
    //     i.appendChild(tagsTable)
    // }
    if (tagsWasChanged) {
        i.appendChild(tagsTable)
    } else {
        i.parentElement.parentElement.classList.add("tags-non-modified")
    }
    i.parentElement.parentElement.classList.add("tags-processed-object")
    return tagsTable
}

/**
 * @param {string} changesetID
 * @param {string} objType
 * @param {Element} i
 * @param {NodeVersion|WayVersion|RelationVersion} prevVersion
 * @param {NodeVersion|WayVersion|RelationVersion} targetVersion
 * @param {NodeVersion|WayVersion|RelationVersion} lastVersion
 */
async function processObjectInteractions(changesetID, objType, i, prevVersion, targetVersion, lastVersion) {
    if (!GM_config.get("ShowChangesetGeometry")) {
        i.parentElement.parentElement.classList.add("processed-object")
        return
    }
    /**
     * @type {[string, string, string, string]}
     */
    const m = i.querySelector("a:nth-of-type(2)").href.match(/(node|way|relation)\/(\d+)\/history\/(\d+)$/);
    const [, , objID, strVersion] = m
    const version = parseInt(strVersion)
    i.parentElement.parentElement.ondblclick = (e) => {
        if (e.altKey) return
        if (changesetMetadata) {
            fitBounds([
                [changesetMetadata.min_lat, changesetMetadata.min_lon],
                [changesetMetadata.max_lat, changesetMetadata.max_lon]
            ])
        }
    }

    function processNode() {
        i.id = "n" + objID

        function mouseoverHandler(e) {
            if (e.relatedTarget?.parentElement === e.target) {
                return
            }
            if (targetVersion.visible === false) {
                if (prevVersion.visible !== false) {
                    showActiveNodeMarker(prevVersion.lat.toString(), prevVersion.lon.toString(), "#0022ff")
                }
            } else {
                showActiveNodeMarker(targetVersion.lat.toString(), targetVersion.lon.toString(), "#ff00e3")
            }
            resetMapHover()
        }

        i.parentElement.parentElement.onmouseover = mouseoverHandler
        if ((prevVersion.tags && Object.keys(prevVersion.tags).length) || (targetVersion.tags && Object.keys(targetVersion.tags).length)) { // todo temp hack for potential speed up
            document.querySelectorAll(`.browse-section > div:has([name=subscribe],[name=unsubscribe]) ~ ul li div a[href*="node/${objID}"]`).forEach(link => {
                // link.title = "Alt + click for scroll into object list"
                link.onmouseenter = mouseoverHandler
                link.onclick = (e) => {
                    if (!e.altKey) return
                    i.scrollIntoView()
                }
            })
        }
        i.parentElement.parentElement.onclick = (e) => {
            if (e.altKey) return
            if (window.getSelection().type === "Range") return

            if (prevVersion.visible !== false && targetVersion.visible !== false) {
                fitBoundsWithPadding([
                    [prevVersion.lat.toString(), prevVersion.lon.toString()],
                    [targetVersion.lat.toString(), targetVersion.lon.toString()]
                ], 30)
                showActiveNodeMarker(prevVersion.lat.toString(), prevVersion.lon.toString(), "#0022ff", true)
                showActiveNodeMarker(targetVersion.lat.toString(), targetVersion.lon.toString(), "#ff00e3", false)
            } else if (targetVersion.visible === false) {
                panTo(prevVersion.lat.toString(), prevVersion.lon.toString(), 18, false)
                showActiveNodeMarker(prevVersion.lat.toString(), prevVersion.lon.toString(), "#0022ff", true)
            } else {
                panTo(targetVersion.lat.toString(), targetVersion.lon.toString(), 18, false)
                showActiveNodeMarker(targetVersion.lat.toString(), targetVersion.lon.toString(), "#ff00e3", true)
            }
        }
        if (!location.pathname.includes("changeset")) {
            return
        }
        if (targetVersion.visible === false) {
            if (targetVersion.version !== 1 && prevVersion.visible !== false) { // даа, такое есть https://www.openstreetmap.org/node/300524/history
                if (prevVersion.tags) {
                    showNodeMarker(prevVersion.lat.toString(), prevVersion.lon.toString(), "#FF0000", prevVersion.id)
                } else {
                    showNodeMarker(prevVersion.lat.toString(), prevVersion.lon.toString(), "#FF0000", prevVersion.id, "customObjects", 2)
                    // todo show prev parent ways
                }
            }
        } else if (targetVersion.version === 1) {
            if (targetVersion.tags || nodesWithOldParentWays[parseInt(changesetID)].has(parseInt(objID))) {
                showNodeMarker(targetVersion.lat.toString(), targetVersion.lon.toString(), "#00a500", targetVersion.id)
            }
        } else if (prevVersion?.visible === false && targetVersion?.visible !== false) {
            showNodeMarker(targetVersion.lat.toString(), targetVersion.lon.toString(), "rgba(89,170,9,0.6)", targetVersion.id, 'customObjects', 2)
        } else {
            showNodeMarker(targetVersion.lat.toString(), targetVersion.lon.toString(), "rgb(255,245,41)", targetVersion.id)
        }
    }

    async function processWay() {
        i.id = "w" + objID

        const res = await fetch(osm_server.apiBase + objType + "/" + objID + "/full.json", {signal: abortDownloadingController.signal});
        const nowDeleted = !res.ok;
        const dashArray = nowDeleted ? "4, 4" : null;
        let lineWidth = nowDeleted ? 4 : 3

        if (!nowDeleted) {
            const lastElements = (await res.json()).elements
            lastElements.forEach(n => {
                if (n.type !== "node") return
                if (n.version === 1) {
                    nodesHistories[n.id] = [n]
                }
            })
            if (changesetMetadata === null) {
                console.log(`changesetMetadata not ready. Wait second...`)
                await new Promise(r => setTimeout(r, 1000)); // todo нужно поретраить
            }
        }

        const [, wayNodesHistories] = await loadWayVersionNodes(objID, version)
        const targetNodes = filterObjectListByTimestamp(wayNodesHistories, targetVersion.timestamp) // fixme what if changeset was long opened anf nodes changed after way?

        let nodesMap = {}
        targetNodes.forEach(elem => {
            nodesMap[elem.id] = [elem.lat, elem.lon]
        })

        let currentNodesList = []
        if (targetVersion.visible !== false) {
            targetVersion.nodes?.forEach(node => {
                if (node in nodesMap) {
                    currentNodesList.push(nodesMap[node])
                } else {
                    console.error(objID, node)
                    console.trace()
                }
            })
        }


        i.parentElement.parentElement.onclick = async (e) => {
            if (e.altKey) return
            if (window.getSelection().type === "Range") return
            showActiveWay(cloneInto(currentNodesList, unsafeWindow), "#ff00e3", currentNodesList.length !== 0, objID)

            if (version > 1) {
                // show prev version
                const [, nodesHistory] = await loadWayVersionNodes(objID, version - 1);
                const targetTimestamp = (new Date(new Date(changesetMetadata.created_at).getTime() - 1)).toISOString()
                const nodesList = filterObjectListByTimestamp(nodesHistory, targetTimestamp)
                showActiveWay(cloneInto(nodesList, unsafeWindow), "rgb(238,146,9)", currentNodesList.length === 0, objID, false, 4, "4, 4")

                showActiveWay(cloneInto(currentNodesList, unsafeWindow), "#ff00e3", false, objID, false)
            } else {
                const targetTimestamp = (new Date(new Date(changesetMetadata.created_at).getTime() - 1)).toISOString()
                const prevVersion = searchVersionByTimestamp(await getWayHistory(objID), targetTimestamp);
                if (prevVersion) {
                    const [, nodesHistory] = await loadWayVersionNodes(objID, prevVersion.version);
                    const nodesList = filterObjectListByTimestamp(nodesHistory, targetTimestamp)
                    showActiveWay(cloneInto(nodesList, unsafeWindow), "rgb(238,146,9)", currentNodesList.length === 0, objID, false, 4, "4, 4")
                }
                showActiveWay(cloneInto(currentNodesList, unsafeWindow), "#ff00e3", false, objID, false)
            }
        }
        if (changesetMetadata === null) {
            console.log(`changesetMetadata not ready. Wait second...`)
            await new Promise(r => setTimeout(r, 1000)); // todo нужно поретраить
        }
        if (targetVersion.visible === false) {
            const versionForLoad = targetVersion.visible === false ? prevVersion.version : targetVersion.version;
            const [, nodesHistory] = await loadWayVersionNodes(objID, versionForLoad);
            const targetTimestamp = (new Date(new Date(changesetMetadata.created_at).getTime() - 1)).toISOString()
            const nodesList = filterObjectListByTimestamp(nodesHistory, targetTimestamp)
            if (targetVersion.visible === false) {
                const closedTime = (new Date(changesetMetadata.closed_at ?? new Date())).toISOString()
                const nodesAfterChangeset = filterObjectListByTimestamp(nodesHistory, closedTime)
                if (nodesAfterChangeset.some(i => i.visible === false)) {
                    displayWay(cloneInto(nodesList, unsafeWindow), false, "#ff0000", 3, "w" + objID, "customObjects", dashArray)
                } else {
                    const layer = displayWay(cloneInto(nodesList, unsafeWindow), false, "#ff0000", 7, "w" + objID, "customObjects", dashArray)
                    layer.bringToBack()
                    lineWidth = 8
                }
            }
        } else if (version === 1 && targetVersion.changeset === parseInt(changesetID)) {
            displayWay(cloneInto(currentNodesList, unsafeWindow), false, "rgba(0,128,0,0.6)", lineWidth, "w" + objID, "customObjects", dashArray)
        } else if (prevVersion?.visible === false) {
            displayWay(cloneInto(currentNodesList, unsafeWindow), false, "rgba(120,238,9,0.6)", lineWidth, "w" + objID, "customObjects", dashArray)
        } else {
            displayWay(cloneInto(currentNodesList, unsafeWindow), false, nowDeleted ? "rgb(0,0,0)" : "#373737", lineWidth, "w" + objID, "customObjects", null, null, darkModeForMap && isDarkMode())
        }

        async function mouseenterHandler() {
            showActiveWay(cloneInto(currentNodesList, unsafeWindow))
            resetMapHover()
            if (version > 1) {
                // show prev version
                const [, nodesHistory] = await loadWayVersionNodes(objID, version - 1);
                const targetTimestamp = (new Date(new Date(changesetMetadata.created_at).getTime() - 1)).toISOString()
                const nodesList = filterObjectListByTimestamp(nodesHistory, targetTimestamp)
                showActiveWay(cloneInto(nodesList, unsafeWindow), "rgb(238,146,9)", false, objID, false, 4, "4, 4")

                showActiveWay(cloneInto(currentNodesList, unsafeWindow), "#ff00e3", false, objID, false, lineWidth)
            } else {
                const targetTimestamp = (new Date(new Date(changesetMetadata.created_at).getTime() - 1)).toISOString()
                const prevVersion = searchVersionByTimestamp(await getWayHistory(objID), targetTimestamp);
                if (prevVersion) {
                    const [, nodesHistory] = await loadWayVersionNodes(objID, prevVersion.version);
                    const nodesList = filterObjectListByTimestamp(nodesHistory, targetTimestamp)
                    showActiveWay(cloneInto(nodesList, unsafeWindow), "rgb(238,146,9)", false, objID, false, 4, "4, 4")
                }
                showActiveWay(cloneInto(currentNodesList, unsafeWindow), "#ff00e3", false, objID, false, lineWidth)
            }
        }

        i.parentElement.parentElement.onmouseenter = mouseenterHandler
        document.querySelectorAll(`.browse-section > div:has([name=subscribe],[name=unsubscribe]) ~ ul li div a[href*="way/${objID}"]`).forEach(link => {
            // link.title = "Alt + click for scroll into object list"
            link.onmouseenter = mouseenterHandler
            link.onclick = (e) => {
                if (!e.altKey) return
                i.scrollIntoView()
            }
        })
    }

    function processRelation() {
        const btn = document.createElement("a")
        btn.textContent = "📥"
        btn.classList.add("load-relation-version")
        btn.title = "Download this relation"
        btn.style.cursor = "pointer"
        btn.addEventListener("click", async (e) => {
            if (e.altKey) return
            if (window.getSelection().type === "Range") return
            btn.style.cursor = "progress"
            let targetTimestamp = (new Date(changesetMetadata.closed_at ?? new Date())).toISOString()
            if (targetVersion.visible === false) {
                targetTimestamp = new Date(new Date(changesetMetadata.created_at).getTime() - 1).toISOString();
            }
            try {
                const relationMetadata = await loadRelationVersionMembersViaOverpass(parseInt(objID), targetTimestamp, false, "#ff00e3")
                i.parentElement.parentElement.onclick = (e) => {
                    if (e.altKey) return
                    fitBounds([
                        [relationMetadata.bbox.min_lat, relationMetadata.bbox.min_lon],
                        [relationMetadata.bbox.max_lat, relationMetadata.bbox.max_lon]
                    ])
                }

                async function mouseenterHandler() {
                    if (!pinnedRelations.has(parseInt(objID))) {
                        await loadRelationVersionMembersViaOverpass(parseInt(objID), targetTimestamp, false, "#ff00e3")
                    }
                }

                i.parentElement.parentElement.onmouseenter = mouseenterHandler
                document.querySelectorAll(`.browse-section > div:has([name=subscribe],[name=unsubscribe]) ~ ul li div a[href*="relation/${objID}"]`).forEach(link => {
                    // link.title = "Alt + click for scroll into object list"
                    link.onmouseenter = mouseenterHandler
                    link.onclick = (e) => {
                        if (!e.altKey) return
                        i.scrollIntoView()
                    }
                })

                i.parentElement.parentElement.classList.add("downloaded")
                i.parentElement.querySelector(".pin-relation").style.display = ""
            } catch (e) {
                btn.style.cursor = "pointer"
                throw e
            }
            btn.style.visibility = "hidden"
            // todo нужна кнопка с глазом чтобы можно было скрывать
        })
        i.querySelector("a:nth-of-type(2)").after(btn)
        i.querySelector("a:nth-of-type(2)").after(document.createTextNode("\xA0"))
    }


    if (objType === "node") {
        processNode()
    } else if (objType === "way") {
        await processWay()
    } else if (objType === "relation") {
        processRelation()
    }
    i.parentElement.parentElement.classList.add("processed-object")
}


async function processObjectsInteractions(objType, uniqTypes, changesetID) {
    const objCount = document.querySelectorAll(`#changeset_${objType}s .list-unstyled li:not(.processed-object)`).length
    if (objCount === 0) {
        return;
    }

    const needFetch = []

    if (objType === "relation" && objCount >= 2) {
        for (let i of document.querySelectorAll(`#changeset_${objType}s .list-unstyled li:not(.processed-object) div div`)) {
            const [, , objID, strVersion] = i.querySelector("a:nth-of-type(2)").href.match(/(node|way|relation)\/(\d+)\/history\/(\d+)$/);
            const version = parseInt(strVersion)
            if (version === 1) {
                needFetch.push(objID + "v" + version)
                needFetch.push(objID)
            } else {
                needFetch.push(objID + "v" + (version - 1))
                needFetch.push(objID + "v" + version)
                needFetch.push(objID)
            }
        }
        const res = await fetch(osm_server.apiBase + `${objType}s.json?${objType}s=` + needFetch.join(","), {signal: abortDownloadingController.signal});
        if (res.status === 404) {
            for (let i of document.querySelectorAll(`#changeset_${objType}s .list-unstyled li:not(.processed-object) div div`)) {
                await processObjectInteractions(changesetID, objType, i, ...getPrevTargetLastVersions(...await getHistoryAndVersionByElem(i)))
            }
        } else {
            /**
             * @type {RelationVersion[]}
             */
            const versions = (await res.json()).elements
            /**
             * @type {Object.<number, Object.<number, RelationVersion>>}
             */
            const objectsVersions = {}
            Object.entries(Object.groupBy(Array.from(versions), i => i.id)).forEach(([id, history]) => {
                    objectsVersions[id] = Object.fromEntries(Object.entries(Object.groupBy(history, i => i.version)).map(([version, val]) => [version, val[0]]))
                }
            )
            for (let i of document.querySelectorAll(`#changeset_${objType}s .list-unstyled li:not(.processed-object) div div`)) {
                const [, , objID, strVersion] = i.querySelector("a:nth-of-type(2)").href.match(/(node|way|relation)\/(\d+)\/history\/(\d+)$/);
                const version = parseInt(strVersion)
                await processObjectInteractions(changesetID, objType, i, ...getPrevTargetLastVersions(Object.values(objectsVersions[objID]), version))
            }
        }
    } else {
        await Promise.all(Array.from(document.querySelectorAll(`#changeset_${objType}s .list-unstyled li:not(.processed-object) div div`)).map(async function (i) {
            await processObjectInteractions(changesetID, objType, i, ...getPrevTargetLastVersions(...await getHistoryAndVersionByElem(i)))
        }))
    }

    if (!changesetsCache[changesetID]) {
        await getChangeset(changesetID)
    } else if (objCount >= 20 && uniqTypes !== 1) {
        await new Promise(r => setTimeout(r, 500));
    }

}


async function getHistoryAndVersionByElem(elem) {
    const [, objType, objID, version] = elem.querySelector("a:nth-of-type(2)").href.match(/(node|way|relation)\/(\d+)\/history\/(\d+)$/);
    if (histories[objType][objID]) {
        return [histories[objType][objID], parseInt(version)]
    }
    const res = await fetch(osm_server.apiBase + objType + "/" + objID + "/history.json", {signal: abortDownloadingController.signal});
    if (res.status === 509) {
        await error509Handler(res)
    } else {
        return [histories[objType][objID] = (await res.json()).elements, parseInt(version)];
    }
}

/**
 * @param {[]} objHistory
 * @param {number} version
 */
function getPrevTargetLastVersions(objHistory, version) {
    let prevVersion = emptyVersion;
    let targetVersion = prevVersion;
    let lastVersion = objHistory.at(-1);

    for (const objVersion of objHistory) {
        prevVersion = targetVersion
        targetVersion = objVersion
        if (objVersion.version === version) {
            break
        }
    }
    return [prevVersion, targetVersion, lastVersion, objHistory]
}


function addQuickLookStyles() {
    try {
        const styleText = `
            tr.quick-look-new-tag th {
                background: rgba(17,238,9,0.6);
            }
            
            tr.quick-look-modified-tag td:nth-of-type(1){
                background: rgba(223,238,9,0.6);
            }
            
            tr.quick-look-deleted-tag th {
                background: rgba(238,51,9,0.6);
            }
                        
            tr.quick-look-new-tag td:not(.tag-flag) {
                background: rgba(17,238,9,0.6);
            }
            
            tr.quick-look-deleted-tag td:not(.tag-flag) {
                background: rgba(238,51,9,0.6);
            }
            
            @media (prefers-color-scheme: dark) {            
                tr.quick-look-new-tag th{
                    /*background: #0f540fde;*/
                    background: rgba(17,238,9,0.3);
                    /*background: rgba(87, 171, 90, 0.3);*/
                }
                                
                tr.quick-look-new-tag td:not(.tag-flag){
                    /*background: #0f540fde;*/
                    background: rgba(17,238,9,0.3);
                    /*background: rgba(87, 171, 90, 0.3);*/
                }
                
                tr.quick-look-modified-tag td {
                    color: black;
                }
                            
                tr.quick-look-deleted-tag th {
                    /*background: #692113;*/
                    background: rgba(238,51,9,0.4);
                    /*background: rgba(229, 83, 75, 0.3);*/
                }
                                
                tr.quick-look-deleted-tag td:not(.tag-flag) {
                    /*background: #692113;*/
                    background: rgba(238,51,9,0.4);
                    /*background: rgba(229, 83, 75, 0.3);*/
                }
                                
                tr.quick-look-new-tag th::selection {
                    background: black !important;
                }
                
                tr.quick-look-modified-tag th::selection {
                    background: black !important;
                }
                            
                tr.quick-look-deleted-tag th::selection {
                    background: black !important;
                }
                              
                tr.quick-look-new-tag td::selection {
                    background: black !important;
                }
                
                /*tr.quick-look-modified-tag td::selection {*/
                /*    background: black !important;*/
                /*}*/
                            
                tr.quick-look-deleted-tag td::selection {
                    background: black !important;
                }
            }
            .edits-wars-tag td:nth-of-type(2)::after{
              content: " ⚔️";
              margin-top: 2px
            }
            tr.restored-tag td:nth-of-type(2)::after {
              content: " ♻️";
              margin-top: 2px
            }
            tr.restored-tag.edits-wars-tag td:nth-of-type(2)::after {
              content: " ♻️⚔️";
              margin-top: 2px
            }
            tr.removed-tag td:nth-of-type(2)::after {
              content: " 🗑";
              margin-top: 2px
            }
            tr.removed-tag.edits-wars-tag td:nth-of-type(2)::after {
              content: " 🗑⚔️";
              margin-top: 2px
            }
            tr.replaced-tag td:nth-of-type(2)::after {
              content: " ⇄";
              color: var(--bs-body-color);
            }
            tr.replaced-tag.edits-wars-tag td:nth-of-type(2)::after {
              content: " ⇄⚔️";
              color: var(--bs-body-color);
            }
            tr.reverted-tag td:nth-of-type(2)::after {
              content: " ↻";
              color: var(--bs-body-color);
            }

            tr.reverted-tag.edits-wars-tag td:nth-of-type(2)::after {
              content: " ↻⚔️";
              color: var(--bs-body-color);
            }
            span.reverted-coordinates::after {
              content: " ↻";
              position: absolute;
              color: var(--bs-body-color);
            }
            
            table.browse-tag-list tr td[colspan="2"]{
                background: var(--bs-body-bg) !important;
            }
            
            `
            + ((GM_config.get("ShowChangesetGeometry")) ? `
            #sidebar_content #changeset_nodes li:hover {
                background-color: rgba(223, 223, 223, 0.6);
            }
            #sidebar_content #changeset_ways li:hover {
                background-color: rgba(223, 223, 223, 0.6);
            }
            #sidebar_content #changeset_nodes li.map-hover {
                background-color: rgba(223, 223, 223, 0.6);
            }
            #sidebar_content #changeset_ways li.map-hover {
                background-color: rgba(223, 223, 223, 0.6);
            }
            #sidebar_content #changeset_relations li.downloaded:hover {
                background-color: rgba(223, 223, 223, 0.6);
            }
            
            .location-modified-marker-warn::after:hover {
                  background-color: rgba(223, 223, 223, 0.6);;
            }
                        
            #sidebar_content .browse-section details.way-version-nodes li:hover {
                background-color: rgba(223, 223, 223, 0.6);
            }
            #sidebar_content .browse-section details.way-version-nodes li:hover {
                background-color: rgba(223, 223, 223, 0.6);
            }
            #sidebar_content .browse-section details.way-version-nodes li.map-hover {
                background-color: rgba(223, 223, 223, 0.6);
            }
            #sidebar_content .browse-section details.way-version-nodes li.map-hover {
                background-color: rgba(223, 223, 223, 0.6);
            }
            #sidebar_content .browse-section details.way-version-nodes li.downloaded:hover {
                background-color: rgba(223, 223, 223, 0.6);
            }
            
            .location-modified-marker-warn::after:hover {
                  background-color: rgba(223, 223, 223, 0.6);;
            }
            
            @media (prefers-color-scheme: dark) {            
                #sidebar_content #changeset_nodes li:hover {
                    background-color: rgb(14, 17, 19);
                }
                #sidebar_content #changeset_ways li:hover {
                    background-color: rgb(14, 17, 19);
                }
                #sidebar_content #changeset_nodes li.map-hover {
                    background-color: rgb(14, 17, 19);
                }
                #sidebar_content #changeset_ways li.map-hover {
                    background-color: rgb(14, 17, 19);
                }
                #sidebar_content #changeset_relations li.downloaded:hover {
                    background-color: rgb(14, 17, 19);
                }
                                
                #sidebar_content .browse-section details.way-version-nodes li:hover {
                    background-color: rgb(52,61,67);
                }
                #sidebar_content .browse-section details.way-version-nodes li:hover {
                    background-color: rgb(52,61,67);
                }
                #sidebar_content .browse-section details.way-version-nodes li.map-hover {
                    background-color: rgb(52,61,67);
                }
                #sidebar_content .browse-section details.way-version-nodes li.map-hover {
                    background-color: rgb(52,61,67);
                }
                #sidebar_content .browse-section details.way-version-nodes li.downloaded:hover {
                    background-color: rgb(52,61,67);
                }
                    
                .location-modified-marker-warn::after:hover {
                    background-color: rgb(14, 17, 19);
                }
            }
            .location-modified-marker-warn::after {
              content: " ⚠️";
              background: var(--bs-body-bg);
            }
            .location-modified-marker:hover {
                background: #0022ff82 !important;
            }
            .way-version-node:hover {
                background-color: #ff00e3 !important;
            }
            .relation-version-node:hover {
                background-color: #ff00e3 !important;
            }
            .leaflet-fade-anim .leaflet-popup {
                transition: none;
            }
            
            @media (prefers-color-scheme: dark) {        
                path.stroke-polyline {
                    filter: drop-shadow(1px 1px 0 #7a7a7a) drop-shadow(-1px -1px 0 #7a7a7a) drop-shadow(1px -1px 0 #7a7a7a) drop-shadow(-1px 1px 0 #7a7a7a);
                }
            }
            ` : "");
        GM_addElement(document.head, "style", {
            textContent: styleText
        });
    } catch { /* empty */
    }
}

function removeEditTagsButton() {
    if (location.pathname.includes("/changeset/")) {
        if (!document.querySelector(".secondary-actions .edit_tags_class")) {
            const tagsEditorExtensionWaiter = new MutationObserver(() => {
                document.querySelector(".edit_tags_class")?.previousSibling?.remove()
                document.querySelector(".edit_tags_class")?.remove()
            })
            tagsEditorExtensionWaiter.observe(document.querySelector(".secondary-actions"), {
                childList: true,
                subtree: true
            })
            setTimeout(() => tagsEditorExtensionWaiter.disconnect(), 3000)
        } else {
            document.querySelector(".edit_tags_class")?.previousSibling?.remove()
            document.querySelector(".edit_tags_class")?.remove()
        }
    }
}

async function addChangesetQuickLook() {
    if (!location.pathname.includes("/changeset")) {
        tagsOfObjectsVisible = true
        return
    }
    if (document.querySelector('.quick-look')) return true;

    let sidebar = document.querySelector("#sidebar_content h2");
    if (!sidebar) {
        return;
    }
    if (injectingStarted) return
    injectingStarted = true
    abortDownloadingController = new AbortController()
    addQuickLookStyles();
    addRegionForFirstChangeset();
    blurSearchField();
    makeTimesSwitchable()
    if (GM_config.get("ResizableSidebar")) {
        document.querySelector("#sidebar").style.resize = "horizontal"
    }
    addSwipes();
    removeEditTagsButton();

    const changesetID = location.pathname.match(/changeset\/(\d+)/)[1]

    async function processObjects(objType, uniqTypes) {
        pinnedRelations = new Set()
        const objCount = document.querySelectorAll(`#changeset_${objType}s .list-unstyled li:not(.processed-object)`).length
        if (objCount === 0) {
            return;
        }

        const needFetch = []


        if (objType === "relation") {
            for (let i of document.querySelectorAll(`#changeset_${objType}s .list-unstyled li:not(.processed-object) div div`)) {
                const [, , objID, strVersion] = i.querySelector("a:nth-of-type(2)").href.match(/(node|way|relation)\/(\d+)\/history\/(\d+)$/);
                const version = parseInt(strVersion)
                if (version === 1) {
                    needFetch.push(objID + "v" + version)
                    needFetch.push(objID)
                } else {
                    needFetch.push(objID + "v" + (version - 1))
                    needFetch.push(objID + "v" + version)
                    needFetch.push(objID)
                }
            }
            const res = await fetch(osm_server.apiBase + `${objType}s.json?${objType}s=` + needFetch.join(","), {signal: abortDownloadingController.signal});
            if (res.status === 404) {
                for (let i of document.querySelectorAll(`#changeset_${objType}s .list-unstyled li:not(.processed-object) div div`)) {
                    await processObject(i, objType, ...getPrevTargetLastVersions(...await getHistoryAndVersionByElem(i)))
                }
            } else {
                /**
                 * @type {RelationVersion[]}
                 */
                const versions = (await res.json()).elements
                /**
                 * @type {Object.<number, Object.<number, RelationVersion>>}
                 */
                const objectsVersions = {}
                Object.entries(Object.groupBy(Array.from(versions), i => i.id)).forEach(([id, history]) => {
                        objectsVersions[id] = Object.fromEntries(Object.entries(Object.groupBy(history, i => i.version)).map(([version, val]) => [version, val[0]]))
                    }
                )
                for (let i of document.querySelectorAll(`#changeset_${objType}s .list-unstyled li:not(.processed-object) div div`)) {
                    const [, , objID, strVersion] = i.querySelector("a:nth-of-type(2)").href.match(/(node|way|relation)\/(\d+)\/history\/(\d+)$/);
                    const version = parseInt(strVersion)
                    await processObject(i, objType, ...getPrevTargetLastVersions(Object.values(objectsVersions[objID]), version))
                }
            }
        } else {
            await Promise.all(Array.from(document.querySelectorAll(`#changeset_${objType}s .list-unstyled li:not(.processed-object) div div`)).map(async function (i) {
                await processObject(i, objType, ...getPrevTargetLastVersions(...await getHistoryAndVersionByElem(i)))
            }))
        }

        // reorder non-interesting-objects
        Array.from(document.querySelectorAll(`#changeset_${objType}s .list-unstyled li.tags-non-modified`)).forEach(i => {
            document.querySelector(`#changeset_${objType}s .list-unstyled li`).parentElement.appendChild(i)
        })
        Array.from(document.querySelectorAll(`#changeset_${objType}s .list-unstyled li.tags-non-modified:not(.location-modified)`)).forEach(i => {
            document.querySelector(`#changeset_${objType}s .list-unstyled li`).parentElement.appendChild(i)
        })


        //<editor-fold desc="setup compact mode toggles">
        let compactToggle = document.createElement("button")
        compactToggle.title = "Toggle between full and compact tags diff"
        compactToggle.textContent = tagsOfObjectsVisible ? "><" : "<>"
        compactToggle.classList.add("quick-look-compact-toggle-btn")
        compactToggle.classList.add("btn", "btn-sm", "btn-primary")
        compactToggle.classList.add("quick-look")
        compactToggle.onclick = (e) => {
            document.querySelectorAll(".quick-look-compact-toggle-btn").forEach(i => {
                if (e.target.textContent === "><") {
                    i.textContent = "<>"
                } else {
                    i.textContent = "><"
                }
            })
            tagsOfObjectsVisible = !tagsOfObjectsVisible
            document.querySelectorAll(".non-modified-tag-in-quick-view").forEach(i => {
                if (e.target.textContent === "><") {
                    i.removeAttribute("hidden")
                    if (!e.altKey) {
                        document.querySelectorAll(".preview-img-link img").forEach(i => {
                            i.style.display = ""
                        })
                    }
                } else {
                    i.setAttribute("hidden", "true")
                    if (!e.altKey) {
                        document.querySelectorAll(".preview-img-link img").forEach(i => {
                            i.style.display = "none"
                        })
                    }
                }
            });
        }
        const objectListSection = document.querySelector(`#changeset_${objType}s .list-unstyled li`).parentElement.parentElement.querySelector("h4")
        if (!objectListSection.querySelector(".quick-look-compact-toggle-btn")) {
            objectListSection.appendChild(compactToggle)
        }
        compactToggle.before(document.createTextNode("\xA0"))
        if (uniqTypes === 1 && document.querySelectorAll(`#changeset_${objType}s .list-unstyled li .non-modified-tag-in-quick-view`).length < 5) {
            compactToggle.style.display = "none"
            document.querySelectorAll(".non-modified-tag-in-quick-view").forEach(i => {
                i.removeAttribute("hidden")
            });
        }
        //</editor-fold>
    }


    try {
        console.time("QuickLook")
        console.log(`%cQuickLook for ${changesetID}`, 'background: #222; color: #bada55')
        let uniqTypes = 0
        for (const objType of ["way", "node", "relation"]) {
            if (document.querySelectorAll(`.list-unstyled li.${objType}`).length > 0) {
                uniqTypes++;
            }
        }

        for (const objType of ["way", "node", "relation"]) {
            await processObjects(objType, uniqTypes);
        }
        const changesetDataPromise = getChangeset(changesetID)
        for (const objType of ["way", "node", "relation"]) {
            await processObjectsInteractions(objType, uniqTypes, changesetID);
        }
        const changesetData = await changesetDataPromise

        function replaceNodes(changesetData) {
            const pagination = Array.from(document.querySelectorAll(".pagination")).find(i => {
                return Array.from(i.querySelectorAll("a.page-link")).some(a => a.href?.includes("node"))
            })
            if (!pagination) return
            const ul = pagination.parentElement.querySelector("ul.list-unstyled")
            const nodes = changesetData.querySelectorAll("node")
            const other = changesetData.querySelectorAll("way,relation").length
            if (nodes.length > 1000) {
                if (nodes.length > 2000 || other > 10 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                    return;
                }
            }
            pagination.remove();
            const summaryHeader = document.querySelector(`#changeset_nodes h4`).firstChild;
            summaryHeader.textContent = summaryHeader.textContent.replace(/\(.*\)/, `(1-${nodes.length})`)

            nodes.forEach(node => {
                if (document.querySelector("#n" + node.id)) {
                    return
                }
                const ulItem = document.createElement("li");
                const div1 = document.createElement("div")
                div1.classList.add("d-flex", "gap-1")
                ulItem.appendChild(div1)


                try {
                    const [iconSrc, invert] = getPOIIconURL("node", Array.from(node.querySelectorAll('tag[k]')).map(i => [i.getAttribute("k"), i.getAttribute("v")]))
                    div1.appendChild(GM_addElement("img", {
                            src: iconSrc,
                            height: 20,
                            width: 20,
                            class: "align-bottom object-fit-none browse-icon" + (invert ? " browse-icon-invertible" : "")
                        })
                    )
                } catch (e) {
                    console.error(e)
                    const img = document.createElement("img")
                    img.height = 20
                    img.width = 20
                    img.style.visibility = "hidden"
                    div1.appendChild(img)
                }

                const div2 = document.createElement("div")
                div2.classList.add("align-self-center")
                div1.appendChild(div2)

                div2.classList.add("node");
                div2.id = "n" + node.id

                const nodeLink = document.createElement("a")
                nodeLink.rel = "nofollow"
                nodeLink.href = `/node/${node.id}`
                if (node.querySelector('tag[k="name"]')?.getAttribute("v")) {
                    nodeLink.textContent = `${node.querySelector('tag[k="name"]')?.getAttribute("v")} (${node.id})`
                } else {
                    nodeLink.textContent = node.id
                }
                div2.appendChild(nodeLink)

                div2.appendChild(document.createTextNode(", "))

                const versionLink = document.createElement("a")
                versionLink.rel = "nofollow"
                versionLink.href = `/node/${node.id}/history/${node.getAttribute("version")}`
                versionLink.textContent = "v" + node.getAttribute("version")
                div2.appendChild(versionLink)

                Array.from(node.children).forEach(i => {
                    // todo
                    if (mainTags.includes(i.getAttribute("k"))) {
                        div2.classList.add(i.getAttribute("k"))
                        div2.classList.add(i.getAttribute("v"))
                    }
                })
                if (node.getAttribute("visible") === "false") {
                    div2.innerHTML = "<s>" + div2.innerHTML + "</s>"
                }
                ul.appendChild(ulItem)
            })
        }

        // todo unify
        function replaceWays(changesetData) {
            const pagination = Array.from(document.querySelectorAll(".pagination")).find(i => {
                return Array.from(i.querySelectorAll("a.page-link")).some(a => a.href?.includes("way"))
            })
            if (!pagination) return
            const ul = pagination.parentElement.querySelector("ul.list-unstyled")
            const ways = changesetData.querySelectorAll("way")
            if (ways.length > 50) {
                if (ways.length > 100 && changesetData.querySelectorAll("node") > 40) {
                    return;
                }
                if (ways.length > 520) {
                    return
                }
            }
            pagination.remove();
            const summaryHeader = document.querySelector(`#changeset_ways h4`).firstChild;
            summaryHeader.textContent = summaryHeader.textContent.replace(/\(.*\)/, `(1-${ways.length})`)
            ways.forEach(way => {
                if (document.querySelector("#w" + way.id)) {
                    return
                }
                const ulItem = document.createElement("li");
                const div1 = document.createElement("div")
                div1.classList.add("d-flex", "gap-1")
                ulItem.appendChild(div1)

                try {
                    const [iconSrc, invert] = getPOIIconURL("way", Array.from(way.querySelectorAll('tag[k]')).map(i => [i.getAttribute("k"), i.getAttribute("v")]))
                    div1.appendChild(GM_addElement("img", {
                            src: iconSrc,
                            height: 20,
                            width: 20,
                            class: "align-bottom object-fit-none browse-icon" + (invert ? " browse-icon-invertible" : "")
                        })
                    )
                } catch (e) {
                    console.error(e)
                    const img = document.createElement("img")
                    img.height = 20
                    img.width = 20
                    img.style.visibility = "hidden"
                    div1.appendChild(img)
                }

                const div2 = document.createElement("div")
                div2.classList.add("align-self-center")
                div1.appendChild(div2)

                div2.classList.add("way");
                div2.id = "w" + way.id

                const wayLink = document.createElement("a")
                wayLink.rel = "nofollow"
                wayLink.href = `/way/${way.id}`
                if (way.querySelector('tag[k="name"]')?.getAttribute("v")) {
                    wayLink.textContent = `${way.querySelector('tag[k="name"]')?.getAttribute("v")} (${way.id})`
                } else {
                    wayLink.textContent = way.id
                }
                div2.appendChild(wayLink)

                div2.appendChild(document.createTextNode(", "))

                const versionLink = document.createElement("a")
                versionLink.rel = "nofollow"
                versionLink.href = `/way/${way.id}/history/${way.getAttribute("version")}`
                versionLink.textContent = "v" + way.getAttribute("version")
                div2.appendChild(versionLink)

                Array.from(way.children).forEach(i => {
                    // todo
                    if (["shop", "building", "amenity", "man_made", "highway", "natural"].includes(i.getAttribute("k"))) {
                        div2.classList.add(i.getAttribute("k"))
                        div2.classList.add(i.getAttribute("v"))
                    }
                })
                if (way.getAttribute("visible") === "false") {
                    div2.innerHTML = "<s>" + div2.innerHTML + "</s>"
                }
                ul.appendChild(ulItem)
            })
        }

        try {
            await initPOIIcons()
        } catch (e) {
            console.log(e)
            console.trace()
        }

        replaceWays(changesetData)
        await processObjects("way", uniqTypes);
        await processObjectsInteractions("way", uniqTypes, changesetID);

        replaceNodes(changesetData)
        await processObjects("node", uniqTypes);
        await processObjectsInteractions("node", uniqTypes, changesetID);

        function observePagination(obs) {
            if (document.querySelector("#changeset_nodes .pagination")) {
                obs.observe(document.querySelector("#changeset_nodes"), {
                    attributes: true
                })
            }
            if (document.querySelector("#changeset_ways .pagination")) {
                obs.observe(document.querySelector("#changeset_ways"), {
                    attributes: true
                })
            }
            if (document.querySelector("#changeset_relations .pagination")) {
                obs.observe(document.querySelector("#changeset_relations"), {
                    attributes: true
                })
            }
        }


        const obs = new MutationObserver(async (mutationList, observer) => {
            observer.disconnect()
            observer.takeRecords()
            for (const objType of ["way", "node", "relation"]) {
                await processObjects(objType, uniqTypes);
            }
            for (const objType of ["way", "node", "relation"]) {
                await processObjectsInteractions(objType, uniqTypes, changesetID);
            }
            observePagination(obs)
        })
        observePagination(obs)

        // try find parent ways


        /**
         * @param {number|string} nodeID
         * @return {Promise<WayVersion[]>}
         */
        async function getParentWays(nodeID) {
            const rawRes = await fetch(osm_server.apiBase + "node/" + nodeID + "/ways.json", {signal: abortDownloadingController.signal});
            if (rawRes.status === 509) {
                await error509Handler(rawRes)
            } else {
                if (!rawRes.ok) {
                    console.warn(`fetching parent ways for ${nodeID} failed`)
                    console.trace()
                    return []
                }
                return (await rawRes.json()).elements;
            }
        }

        async function findParents() {
            const nodesCount = changesetData.querySelectorAll(`node`)
            changesetData.querySelectorAll(`node[version="1"]`).forEach(i => {
                const nodeID = i.getAttribute("id")
                if (!i.querySelector("tag")) {
                    if (i.getAttribute("visible") === "false") {
                        // todo
                    } else if (i.getAttribute("version") === "1" && !nodesWithParentWays[parseInt(changesetID)].has(parseInt(nodeID))) {
                        showNodeMarker(i.getAttribute("lat"), i.getAttribute("lon"), "#00a500", nodeID)
                    }
                }
            })
            /**
             * @type {Set<number>}
             */
            const processedNodes = new Set();
            /**
             * @type {Set<number>}
             */
            const processedWays = new Set();
            // fixme
            const changesetWaysSet = new Set(Array.from(changesetData.querySelectorAll(`way`)).map(i => parseInt(i.id)))
            const loadNodesParents = async nodes => {
                for (const nodeID of nodes) {
                    if (nodesWithParentWays[parseInt(changesetID)].has(nodeID) && nodesCount > 30 || processedNodes.has(parseInt(nodeID))) {
                        continue;
                    }
                    const parents = await getParentWays(nodeID)

                    await Promise.all(parents.map(
                            async way => {
                                if (processedWays.has(way.id) || changesetWaysSet.has(way.id)) {
                                    return
                                }
                                processedWays.add(way.id)
                                way.nodes.forEach(node => {
                                    processedNodes.add(node)
                                })
                                const objID = way.id

                                const res = await fetch(osm_server.apiBase + "way" + "/" + way.id + "/full.json", {signal: abortDownloadingController.signal});
                                if (!res.ok) {
                                    // крааайне маловероятно
                                    return;
                                }
                                const lastElements = (await res.json()).elements
                                lastElements.forEach(n => {
                                    if (n.type !== "node") return
                                    if (n.version === 1) {
                                        nodesHistories[n.id] = [n]
                                    }
                                })

                                const res2 = await getWayNodesByTimestamp(changesetMetadata.closed_at, objID)
                                if (!res2) {
                                    // если линия создана после правки
                                    return
                                }
                                const [targetVersion, currentNodesList] = res2

                                const popup = document.createElement("span")
                                const link = document.createElement("a")
                                link.href = `/way/${way.id}`
                                link.target = "_blank"
                                link.textContent = "w" + way.id

                                const tagsTable = document.createElement("table")
                                const tbody = document.createElement("tbody")
                                Object.entries(way.tags ?? {}).forEach(tag => {
                                    const row = document.createElement("tr")
                                    const tagTd = document.createElement("th")
                                    const tagTd2 = document.createElement("td")
                                    tagTd.style.borderWidth = "2px"
                                    tagTd2.style.borderWidth = "2px"
                                    row.style.borderWidth = "2px"
                                    row.appendChild(tagTd)
                                    row.appendChild(tagTd2)
                                    tagTd.textContent = tag[0]
                                    tagTd2.textContent = tag[1]
                                    tagTd.style.textAlign = "right"
                                    tagTd2.style.textAlign = "right"
                                    tbody.appendChild(row)
                                })
                                tagsTable.appendChild(tbody)
                                popup.appendChild(link)
                                popup.appendChild(tagsTable)
                                // todo показать по ховеру прошлую версию?

                                displayWay(cloneInto(currentNodesList, unsafeWindow), false, "rgba(55,55,55,0.5)", 4, "n" + nodeID, "customObjects", null, popup.outerHTML, darkModeForMap && isDarkMode())

                                // ховер в списке объектов, который показывает родительнскую линию
                                way.nodes.forEach(n => {
                                    if (!document.querySelector("#n" + n)) return
                                    document.querySelector("#n" + n).parentElement.parentElement.addEventListener('mouseover', async (e) => {
                                        if (e.relatedTarget?.parentElement === e.target) {
                                            return
                                        }
                                        showActiveWay(cloneInto(currentNodesList, unsafeWindow))
                                        resetMapHover()
                                        const targetTimestamp = (new Date(new Date(changesetMetadata.created_at).getTime() - 1)).toISOString()
                                        if (targetVersion.version > 1) {
                                            // show prev version
                                            const prevVersion = searchVersionByTimestamp(await getWayHistory(way.id), targetTimestamp);
                                            const [, nodesHistory] = await loadWayVersionNodes(objID, prevVersion.version);
                                            const nodesList = filterObjectListByTimestamp(nodesHistory, targetTimestamp)
                                            showActiveWay(cloneInto(nodesList, unsafeWindow), "rgb(238,146,9)", false, objID, false, 4, "4, 4")

                                            // showActiveWay(cloneInto(currentNodesList, unsafeWindow), "rgba(55,55,55,0.5)", false, objID, false)
                                        } else {
                                            const prevVersion = searchVersionByTimestamp(await getWayHistory(way.id), targetTimestamp);
                                            if (prevVersion) {
                                                const [, nodesHistory] = await loadWayVersionNodes(objID, prevVersion.version);
                                                const nodesList = filterObjectListByTimestamp(nodesHistory, targetTimestamp)
                                                showActiveWay(cloneInto(nodesList, unsafeWindow), "rgb(238,146,9)", false, objID, false, 4, "4, 4")

                                                // showActiveWay(cloneInto(currentNodesList, unsafeWindow), "rgba(55,55,55,0.5)", false, objID, false)
                                            }
                                        }
                                        const curVersion = searchVersionByTimestamp(await getNodeHistory(n), changesetMetadata.closed_at ?? new Date())
                                        if (curVersion.version > 1) {
                                            const prevVersion = searchVersionByTimestamp(await getNodeHistory(n), targetTimestamp)
                                            showActiveNodeMarker(prevVersion.lat.toString(), prevVersion.lon.toString(), "#0022ff", false)
                                        }
                                        showActiveNodeMarker(curVersion.lat.toString(), curVersion.lon.toString(), "#ff00e3", false)
                                    })
                                })
                            }
                        )
                    )
                }
            };
            const nodesWithModifiedLocation = Array.from(document.querySelectorAll("#changeset_nodes .location-modified div div")).map(i => parseInt(i.id.slice(1)))
            await Promise.all(arraySplit(nodesWithModifiedLocation, 4).map(loadNodesParents))
            // fast hack
            // const someInterestingNodes = Array.from(changesetData.querySelectorAll("node")).filter(i => i.querySelector("tag[k=power],tag[k=entrance]")).map(i => parseInt(i.id))
            // await Promise.all(arraySplit(someInterestingNodes, 4).map(loadNodesParents))
        }

        if (GM_config.get("ShowChangesetGeometry")) {
            console.log("%cTry find parents ways", 'background: #222; color: #bada55')
            await findParents()
        }
    } catch (e) { // TODO notify user
        if (e.name === "AbortError") {
            console.debug("Some requests was aborted")
        } else {
            console.error(e)
            console.log("%cSetup QuickLook finished with error ⚠️", 'background: #222; color: #bada55')
            // try {
            //     if (![ABORT_ERROR_PREV, ABORT_ERROR_NEXT, ABORT_ERROR_USER_CHANGESETS].includes(e)) {
            //         debugger
            //         getMap()?.attributionControl?.setPrefix("⚠️") // todo debug only
            //         alert("⚠")
            //     }
            // } catch (e) {
            // }
        }
    } finally {
        injectingStarted = false
        console.timeEnd("QuickLook")
        console.log("%cSetup QuickLook finished", 'background: #222; color: #bada55')
        // todo mark changeset as reviewed
    }
}

function setupChangesetQuickLook(path) {
    if (!path.includes("/changeset")) return;
    let timerId = setInterval(addChangesetQuickLook, 100);
    setTimeout(() => {
        clearInterval(timerId);
        console.debug('stop try add revert button');
    }, 3000);
    addChangesetQuickLook();
}


const rapidLink = "https://mapwith.ai/rapid#background=EsriWorldImagery&map="
let coordinatesObserver = null;

function setupNewEditorsLinks() {
    const firstRun = document.getElementsByClassName("custom_editors").length === 0
    let editorsList = document.querySelector("#edit_tab ul");
    if (!editorsList) {
        return;
    }
    const curURL = editorsList.querySelector("li a").href
    const match = curURL.match(/map=(\d+)\/([-\d.]+)\/([-\d.]+)(&|$)/)
    if (!match && !curURL.includes("edit?editor=id")) {
        return
    }
    try {
        coordinatesObserver?.disconnect()
        if (!curURL.includes("edit?editor=id#") || !match) {
            return;
        }
        const zoom = match[1]
        const lat = match[2]
        const lon = match[3]
        {
            // Rapid
            let newElem;
            if (firstRun) {
                newElem = editorsList.querySelector("li").cloneNode(true);
                newElem.classList.add("custom_editors", "rapid_btn")
                newElem.querySelector("a").textContent = "Edit with Rapid"
            } else {
                newElem = document.querySelector(".rapid_btn")
            }
            newElem.querySelector("a").href = `${rapidLink}${zoom}/${lat}/${lon}`
            if (firstRun) {
                editorsList.appendChild(newElem)
            }
        }
        /*
        {
            // geo:
            let newElem;
            if (firstRun) {
                newElem = editorsList.querySelector("li").cloneNode(true);
                newElem.classList.add("custom_editors", "geo_btn")
                newElem.querySelector("a").textContent = "Open geo:"
            } else {
                newElem = document.querySelector(".geo_btn")
            }
            newElem.querySelector("a").href = `geo:${lat},${lon}?z=${zoom}`
            if (firstRun) {
                editorsList.appendChild(newElem)
            }
        }
        */
    } finally {
        coordinatesObserver = new MutationObserver(setupNewEditorsLinks);
        coordinatesObserver.observe(editorsList, {subtree: true, childList: true, attributes: true});
    }
}

function setupViewLinks() {
    let viewersList = [
        {
            id: 'view-google-default',
            name: 'Google Maps (Default)',
            url: 'https://www.google.com/maps/@?api=1&map_action=map&basemap=roadmap&center=<lat>,<lon>&zoom=<zoom>'
        },
        {
            id: 'view-google-satellite',
            name: 'Google Maps (Satellite)',
            url: 'https://www.google.com/maps/@?api=1&map_action=map&basemap=satellite&center=<lat>,<lon>&zoom=<zoom>'
        },
        {
            id: 'view-bing-default',
            name: 'Bing Maps (Default)',
            url: 'https://bing.com/maps/default.aspx?cp=<lat>~<lon>&lvl=<zoom>&style=r'
        },
        {
            id: 'view-bing-satellite',
            name: 'Bing Maps (Satellite)',
            url: 'https://bing.com/maps/default.aspx?cp=<lat>~<lon>&lvl=<zoom>&style=h'
        }
    ];
    /* Steal current geo coordinates from Edit tab. */
    let editorsList = document.querySelector("#edit_tab ul");
    if (!editorsList) {
        return;
    }
    const curURL = editorsList.querySelector("li a").href
    const match = curURL.match(/map=(\d+)\/([-\d.]+)\/([-\d.]+)(&|$)/)
    if (!match && !curURL.includes("edit?editor=id")) {
        return;
    }
    try {
        coordinatesObserver?.disconnect()
        if (!curURL.includes("edit?editor=id#") || !match) {
            return;
        }
        const zoom = match[1]
        const lat = match[2]
        const lon = match[3]
        const firstRun = document.getElementsByClassName('viewlink').length === 0
        if (firstRun) {
            /*
             * Create the new View drop down menu, copying the Edit menu element hierarchy
             * and class names.
             */
            let primaryNav = document.getElementsByClassName('primary')[0];
            let tabDivElem = document.createElement('div');
            tabDivElem.id = 'view_tab';
            tabDivElem.classList.add('btn-group');
            let tabDivButtonElem = document.createElement('button');
            tabDivButtonElem.classList.add('btn', 'btn-outline-primary', 'dropdown-toggle', 'dropdown-toggle-split', 'flex-grow-0');
            tabDivButtonElem.type = 'button';
            tabDivButtonElem.setAttribute('data-bs-toggle', 'dropdown');
            tabDivButtonElem.innerText = 'View ';
            tabDivElem.appendChild(tabDivButtonElem);
            let tabDivUlElem = document.createElement('ul');
            tabDivUlElem.classList.add('dropdown-menu');

            viewersList.forEach(function(v) {
                let tabDivUlLiElem = document.createElement('li');
                let tabDivUlLiAElem = document.createElement('a');
                tabDivUlLiAElem.classList.add('geolink', 'viewlink', 'dropdown-item');
                tabDivUlLiAElem.id = v.id;
                tabDivUlLiAElem.text = v.name;
                tabDivUlLiElem.appendChild(tabDivUlLiAElem);
                tabDivUlElem.appendChild(tabDivUlLiElem);
            });
            tabDivElem.appendChild(tabDivUlElem);
            primaryNav.appendChild(tabDivElem);
        }
        viewersList.forEach(function(v) {
            document.getElementById(v.id).href = v.url.replaceAll('<lat>', lat).replaceAll('<lon>', lon).replaceAll('<zoom>', zoom);
        });
    } finally {
        coordinatesObserver = new MutationObserver(setupViewLinks);
        coordinatesObserver.observe(editorsList, {subtree: true, childList: true, attributes: true});
    }
}

let unDimmed = false;

function setupOffMapDim() {
    if (!GM_config.get("OffMapDim") || GM_config.get("DarkModeForMap") || unDimmed) {
        return;
    }
    GM_addElement(document.head, "style", {
        textContent: `
            @media (prefers-color-scheme: dark) {
              .leaflet-tile-container, .mapkey-table-entry td:first-child > * {
                filter: none !important;
              }
              .leaflet-tile-container * {
                filter: none !important;
              }
            }
        `,
    });
    unDimmed = true
}

let darkModeForMap = false;

function setupDarkModeForMap() {
    if (!GM_config.get("DarkModeForMap") || darkModeForMap) {
        return;
    }
    GM_addElement(document.head, "style", {
        textContent: `
            @media (prefers-color-scheme: dark) {
              .leaflet-tile-container, .mapkey-table-entry td:first-child > * {
                filter: none !important;
              }
              .leaflet-tile-container * {
                filter: none !important;
              }
               .leaflet-tile-container .leaflet-tile:not(.no-invert), .mapkey-table-entry td:first-child > * {
                filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%) !important;
              }
            }
        `,
    });
    darkModeForMap = true
}

async function setupHDYCInProfile(path) {
    let match = path.match(/^\/user\/([^/]+)(\/|\/notes)?$/);
    if (!match || path.includes("/history")) {
        return;
    }
    const user = match[1];
    if (user === "forgot-password" || user === "new") return;
    document.querySelector(".content-body > .content-inner").style.paddingBottom = "0px";
    if (isDarkMode()) {
        GM_addElement(document.querySelector("#content"), "iframe", {
            src: "https://www.hdyc.neis-one.org/?" + user,
            width: "100%",
            id: "hdyc-iframe",
            scrolling: "no",
            background: "rgb(49, 54, 59)",
            style: "visibility:hidden;background-color: rgb(49, 54, 59);",
        });
        setTimeout(() => {
            document.getElementById("hdyc-iframe").style.visibility = 'visible';
        }, 1500)
    } else {
        GM_addElement(document.querySelector("#content"), "iframe", {
            src: "https://www.hdyc.neis-one.org/?" + user,
            width: "100%",
            id: "hdyc-iframe",
            scrolling: "no",
        });
    }
    if (document.querySelector('a[href$="/blocks"]')?.nextElementSibling?.textContent > 0) {
        document.querySelector('a[href$="/blocks"]').nextElementSibling.style.background = "rgba(255, 0, 0, 0.3)"
        if (isDarkMode()) {
            document.querySelector('a[href$="/blocks"]').nextElementSibling.style.color = "white"
        }
        getCachedUserInfo(decodeURI(user)).then(userInfo => {
            if (userInfo['blocks']['received']['active'] === 0) {
                updateUserInfo(decodeURI(user))
            }
        })
    }
    const iframe = document.getElementById('hdyc-iframe');
    window.addEventListener('message', function (event) {
        iframe.height = event.data.height + 'px';
    });
}

function simplifyHDCYIframe() {
    if (window.location === window.parent.location) {
        return
    }
    GM_addElement(document.head, "style", {
        textContent: `
            html, body {
                overflow-x: auto;
            }

            @media (prefers-color-scheme: dark) {
                body {
                    background-color: #181a1b;
                    color: #e8e6e3;
                }
                
                #header a {
                    color: lightgray !important;
                }

                #activitymap .leaflet-tile,
                #mapwrapper .leaflet-tile {
                    filter: invert(100%) hue-rotate(180deg) contrast(90%);
                }
                #activitymap path {
                    stroke: #0088ff;
                    fill: #0088ff;
                    stroke-opacity: 0.7;
                }
                #activitymapswitcher {
                    background-color: rgba(24, 26, 27, 0.8);
                }

                .leaflet-popup-content {
                    color: lightgray;
                }
                .leaflet-popup-content-wrapper, .leaflet-popup-tip {
                    background: #222;
                }

                a, .leaflet-container a {
                    color: #1c84fd;
                }
                a:visited, .leaflet-container a:visited {
                    color: #c94bff;
                }
                a[style*="black"] {
                    color: lightgray !important;
                }

                .day-cell[fill="#e8e8e8"] {
                    fill: #262a2b;
                }
                
                #result th {
                    background-color: rgba(24, 26, 27, 0.8);
                }
                #result td {
                    border-color: #363659;
                }
                td[style*="purple"] {
                    color: #ff72ff !important;
                }
                td[style*="green"] {
                    color: limegreen !important;
                }

                #graph_years canvas,
                #graph_editors canvas,
                #graph_days canvas,
                #graph_hours canvas {
                    filter: saturate(4);
                }
                .tickLabel {
                    color: #b3aca2;
                }
                .editors_wrapper th, .editors_wrapper td {
                    border-bottom-color: #8c8273;
                }
            }
        `,
    });
    const loginLink = document.getElementById("loginLink")
    if (loginLink) {
        let warn = document.createElement("div")
        warn.id = "hdyc-warn"
        GM_addElement(document.head, "style", {
            textContent: `
                    #hdyc-warn, #hdycLink {
                        text-align: left !important;
                        width: 50%;
                        position: relative;
                        left: 35%;
                        right: 33%;
                    }
                `,
        });
        if (navigator.userAgent.includes("Firefox")) {
            warn.textContent = "Please disable tracking protection so that the HDYC account login works"

            document.getElementById("authenticate").before(warn)
            let hdycLink = document.createElement("a")
            const match = location.pathname.match(/^\/user\/([^/]+)$/);
            hdycLink.href = "https://www.hdyc.neis-one.org/" + (match ? match[1] : "")
            hdycLink.textContent = "Go to https://www.hdyc.neis-one.org/"
            hdycLink.target = "_blank"
            hdycLink.id = "hdycLink"
            document.getElementById("authenticate").before(document.createElement("br"))
            document.getElementById("authenticate").before(hdycLink)
            document.getElementById("authenticate").remove()
            window.parent.postMessage({height: document.body.scrollHeight}, '*')
        } else {
            warn.innerHTML = `To see more than just public profiles, do the following:<br/>
0. Turn off tracking protection if your browser has it (for example in Brave or Vivaldi)<br/>
1. <a href="https://www.hdyc.neis-one.org/" target="_blank"> Log in to HDYC</a> <br/>
2. Open the browser console (F12) <br/>
3. Open the Application tab <br/>
4. In the left panel, select <i>Storage</i>→<i>Cookies</i>→<i>https://www.hdyc.neis-one.org</i><br/>
5. Click on the cell with the name <i>SameSite</i> and type <i>None</i> in it`
            document.getElementById("authenticate").before(warn)
            const img_help = document.createElement("img")
            img_help.onload = () => {
                window.parent.postMessage({height: document.body.scrollHeight}, '*')
            }
            img_help.src = "https://raw.githubusercontent.com/deevroman/better-osm-org/master/img/hdyc-fix-in-chrome.png"
            img_help.style.width = "90%"
            warn.after(img_help)
            document.getElementById("authenticate").remove()
        }
        // var xhr = XPCNativeWrapper(new window.wrappedJSObject.XMLHttpRequest());
        // let res = await GM.xmlHttpRequest({
        //     method: "GET",
        //     url: document.querySelector("#loginLink").href,
        //     withCredentials: true
        // })
        // debugger
        return
    }
    document.getElementById("header").remove()
    document.getElementById("user").remove()
    document.getElementById("searchfield").remove()
    document.querySelector(".mapper_img").remove()
    let bCnt = 0
    for (let childNodesKey of Array.from(document.querySelector(".since").childNodes)) {
        if (childNodesKey.nodeName === "#text") {
            childNodesKey.remove()
            continue
        }
        if (childNodesKey.classList.contains("image")) {
            continue
        }
        if (childNodesKey.localName === "b") {
            if (bCnt === 2) {
                break
            }
            bCnt++
        }
        childNodesKey.remove()
    }
    window.parent.postMessage({height: document.body.scrollHeight}, '*');
}

//<editor-fold desc="/history, /user/*/history">
async function updateUserInfo(username) {
    const res = await fetchJSONWithCache(osm_server.apiBase + "changesets.json?" + new URLSearchParams({
        display_name: username,
        limit: 1
    }).toString());
    let uid;
    if (res['changesets'].length === 0) {
        const res = await fetchJSONWithCache(osm_server.apiBase + "notes/search.json?" + new URLSearchParams({
            display_name: username,
            limit: 1
        }).toString());
        uid = res['features'][0]['properties']['comments'].find(i => i['user'] === username)['uid']
    } else {
        uid = res['changesets'][0]['uid']
    }

    const res2 = await fetchJSONWithCache(osm_server.apiBase + "user/" + uid + ".json");
    const userInfo = res2.user
    userInfo['cacheTime'] = new Date()
    GM_setValue("userinfo-" + username, JSON.stringify(userInfo))
    return userInfo
}

async function getCachedUserInfo(username) {
    // TODO async better?
    const localUserInfo = GM_getValue("userinfo-" + username, "")
    if (localUserInfo) {
        const cacheTime = new Date(localUserInfo['cacheTime'])
        if (cacheTime.setUTCDate(cacheTime.getUTCDate() + 7) < new Date()) {
            setTimeout(updateUserInfo, 0, username)
        }
        return JSON.parse(localUserInfo)
    }
    return await updateUserInfo(username)
}

let sidebarObserverForMassActions = null;
let massModeForUserChangesetsActive = null;
let massModeActive = null;
let currentMassDownloadedPages = null;
let needClearLoadMoreRequest = 0;
let needPatchLoadMoreRequest = null;
let needHideBigChangesets = true;
let hiddenChangesetsCount = null;
let lastLoadMoreURL = "";

function makeTopActionBar() {
    const actionsBar = document.createElement("div")
    actionsBar.classList.add("actions-bar")
    const copyIds = document.createElement("button")
    copyIds.textContent = "Copy IDs"
    copyIds.classList.add("copy-changesets-ids-btn")
    copyIds.onclick = () => {
        const ids = Array.from(document.querySelectorAll(".mass-action-checkbox:checked")).map(i => i.value).join(",")
        navigator.clipboard.writeText(ids);
    }
    const revertButton = document.createElement("button")
    revertButton.textContent = "↩️"
    revertButton.onclick = () => {
        const ids = Array.from(document.querySelectorAll(".mass-action-checkbox:checked")).map(i => i.value).join(",")
        open("https://revert.monicz.dev/?changesets=" + ids, "_blank")
    }
    const revertViaJOSMButton = document.createElement("button")
    revertViaJOSMButton.textContent = "↩️ via JOSM"
    revertViaJOSMButton.onclick = () => {
        const ids = Array.from(document.querySelectorAll(".mass-action-checkbox:checked")).map(i => i.value).join(",")
        open("http://127.0.0.1:8111/revert_changeset?id=" + ids, "_blank")
    }
    actionsBar.appendChild(copyIds)
    actionsBar.appendChild(document.createTextNode("\xA0"))
    actionsBar.appendChild(revertButton)
    actionsBar.appendChild(document.createTextNode("\xA0"))
    actionsBar.appendChild(revertViaJOSMButton)
    return actionsBar;
}

function makeBottomActionBar() {
    if (document.querySelector(".buttom-btn")) return

    const copyIds = document.createElement("button")
    const selectedIDsCount = document.querySelectorAll(".mass-action-checkbox:checked").length
    if (selectedIDsCount) {
        copyIds.textContent = `Copy ${selectedIDsCount} IDs`
    } else {
        copyIds.textContent = "Copy IDs"
    }
    copyIds.classList.add("copy-changesets-ids-btn")
    copyIds.classList.add("buttom-btn")
    copyIds.classList.add("btn", "btn-primary")
    copyIds.onclick = () => {
        const ids = Array.from(document.querySelectorAll(".mass-action-checkbox:checked")).map(i => i.value).join(",")
        navigator.clipboard.writeText(ids);
    }
    const revertButton = document.createElement("button")
    revertButton.textContent = "↩️"
    revertButton.onclick = () => {
        const ids = Array.from(document.querySelectorAll(".mass-action-checkbox:checked")).map(i => i.value).join(",")
        window.location = "https://revert.monicz.dev/?changesets=" + ids
    }
    revertButton.classList.add("btn", "btn-primary")
    const changesetMore = document.querySelector("#sidebar_content div.changeset_more")
    if (changesetMore) {
        changesetMore.appendChild(copyIds)
        changesetMore.appendChild(document.createTextNode("\xA0"))
        changesetMore.appendChild(revertButton)
    } else {
        const changesetsList = document.querySelector("#sidebar_content ol");
        const actionBarWrapper = document.createElement("div")
        actionBarWrapper.classList.add("mt-3", "text-center")
        actionBarWrapper.appendChild(copyIds)
        actionBarWrapper.appendChild(document.createTextNode("\xA0"))
        actionBarWrapper.appendChild(revertButton)
        changesetsList.appendChild(actionBarWrapper)
    }
}

function addMassActionForUserChangesets() {
    if (!location.pathname.includes("/user/") || document.querySelector("#mass-action-btn")) {
        return;
    }
    const a = document.createElement("a")
    a.title = "Add checkboxes for mass actions with changesets"
    a.textContent = " 📋"
    a.style.cursor = "pointer"
    a.id = "mass-action-btn"
    a.onclick = () => {
        if (massModeForUserChangesetsActive === null) {
            massModeForUserChangesetsActive = true
            document.querySelector("#sidebar_content > div").after(makeTopActionBar())
            document.querySelector("#sidebar_content div.changeset_more").after(document.createTextNode("   "))
            makeBottomActionBar()
            document.querySelectorAll(".changesets li").forEach(addChangesetCheckbox)
        } else {
            massModeForUserChangesetsActive = !massModeForUserChangesetsActive
            document.querySelectorAll(".actions-bar").forEach(i => i.toggleAttribute("hidden"))
            document.querySelectorAll(".mass-action-checkbox").forEach(i => {
                i.toggleAttribute("hidden")
            })
        }
    }
    // example: https://osmcha.org?filters={"users":[{"label":"TrickyFoxy","value":"TrickyFoxy"}]}
    const username = decodeURI(location.pathname.match(/\/user\/(.*)\/history$/)[1])
    const osmchaFilter = {"users": [{"label": username, "value": username}], "date__gte": [{"label": "", "value": ""}]}
    const osmchaLink = document.createElement("a");
    osmchaLink.title = "Open profile in OSMCha.org"
    osmchaLink.href = "https://osmcha.org?" + new URLSearchParams({filters: JSON.stringify(osmchaFilter)}).toString()
    osmchaLink.target = "_blank"
    osmchaLink.rel = "noreferrer"

    const osmchaIcon = document.createElement("img")
    osmchaIcon.src = GM_getResourceURL("OSMCHA_ICON", false)
    osmchaIcon.style.height = "1em";
    osmchaIcon.style.cursor = "pointer";
    osmchaIcon.style.marginTop = "-3px";
    if (isDarkMode()) {
        osmchaIcon.style.filter = "invert(0.7)";
    }
    osmchaLink.appendChild(osmchaIcon)


    document.querySelector("#sidebar_content h2").appendChild(a)
    document.querySelector("#sidebar_content h2").appendChild(document.createTextNode("\xA0"))
    document.querySelector("#sidebar_content h2").appendChild(osmchaLink)
}

function addChangesetCheckbox(chagesetElem) {
    if (chagesetElem.querySelector(".mass-action-checkbox")) {
        return;
    }
    const a = document.createElement("a");
    a.classList.add("mass-action-wrapper")
    const checkbox = document.createElement("input")
    checkbox.type = "checkbox"
    checkbox.classList.add("mass-action-checkbox")
    checkbox.value = chagesetElem.querySelector(".changeset_id").href.match(/\/(\d+)/)[1]
    checkbox.style.cursor = "pointer"
    checkbox.title = "Shift + click for select a range of empty checkboxes"
    checkbox.onclick = e => {
        if (e.shiftKey) {
            let currentCheckboxFound = false
            for (const cBox of Array.from(document.querySelectorAll(".mass-action-checkbox")).toReversed()) {
                if (!currentCheckboxFound) {
                    if (cBox.value === checkbox.value) {
                        currentCheckboxFound = true
                    }
                } else {
                    if (cBox.checked) {
                        break
                    }
                    cBox.checked = true
                }
            }
        }
        const selectedIDsCount = document.querySelectorAll(".mass-action-checkbox:checked").length
        document.querySelectorAll(".copy-changesets-ids-btn").forEach(i => {
            if (selectedIDsCount) {
                i.textContent = `Copy ${selectedIDsCount} IDs`
            } else {
                i.textContent = `Copy IDs`
            }
        })
    }
    a.appendChild(checkbox)
    chagesetElem.querySelector("p").prepend(a)
    chagesetElem.querySelectorAll("a.changeset_id").forEach((i) => {
        i.onclick = (e) => {
            if (massModeActive) {
                e.preventDefault()
            }
        }
    })
}

function filterChangesets(htmlDocument = document) {
    const usernameFilters = document.querySelector("#filter-by-user-input").value.trim().split(",").filter(i => i.trim() !== "")
    const commentFilters = document.querySelector("#filter-by-comment-input").value.trim().split(",").filter(i => i.trim() !== "")
    let newHiddenChangesetsCount = 0;
    htmlDocument.querySelectorAll("ol li").forEach(i => {
        const changesetComment = i.querySelector("p a span").textContent
        const changesetAuthor = i.querySelector("div > a").textContent
        let bbox;
        if (i.getAttribute("data-changeset")) {
            bbox = Object.values(JSON.parse(i.getAttribute("data-changeset")).bbox)
        } else {
            bbox = Object.values(JSON.parse(i.getAttribute("hidden-data-changeset")).bbox)
        }
        bbox = bbox.map(parseFloat)
        const deltaLon = bbox[2] - bbox[0]
        const deltaLat = bbox[3] - bbox[1]
        const bboxSizeLimit = 1
        let wasHidden = false
        if (needHideBigChangesets && (deltaLat > bboxSizeLimit || deltaLon > bboxSizeLimit)) {
            wasHidden = true
            if (i.getAttribute("data-changeset")) {
                i.setAttribute("hidden-data-changeset", i.getAttribute("data-changeset"))
                i.removeAttribute("data-changeset")
                i.setAttribute("hidden", true)
            } else {
                // FIXME
            }
        }
        if (!wasHidden) {
            let invert = document.querySelector("#invert-user-filter-checkbox").getAttribute("checked") === "true"
            usernameFilters.forEach(username => {
                if (changesetAuthor.includes(username.trim()) ^ invert) {
                    if (i.getAttribute("data-changeset")) {
                        i.setAttribute("hidden-data-changeset", i.getAttribute("data-changeset"))
                        i.removeAttribute("data-changeset")
                        i.setAttribute("hidden", true)
                    } else {
                        // FIXME
                    }
                    wasHidden = true
                }
            })
        }
        if (!wasHidden) {
            let invert = document.querySelector("#invert-comment-filter-checkbox").getAttribute("checked") === "true"
            commentFilters.forEach(comment => {
                if (changesetComment.includes(comment.trim()) ^ invert) {
                    if (i.getAttribute("data-changeset")) {
                        i.setAttribute("hidden-data-changeset", i.getAttribute("data-changeset"))
                        i.removeAttribute("data-changeset")
                        i.setAttribute("hidden", true)
                    } else {
                        // FIXME
                    }
                    wasHidden = true
                }
            })
        }
        if (!wasHidden) {
            if (i.getAttribute("hidden-data-changeset")) {
                i.setAttribute("data-changeset", i.getAttribute("hidden-data-changeset"))
                i.removeAttribute("hidden-data-changeset")
                i.removeAttribute("hidden")
            } else {
                // FIXME
            }
        } else {
            newHiddenChangesetsCount++;
        }
    })
    if (hiddenChangesetsCount !== newHiddenChangesetsCount && htmlDocument === document) {
        hiddenChangesetsCount = newHiddenChangesetsCount
        const changesetsCount = document.querySelectorAll("ol > li").length
        document.querySelector("#hidden-changeset-counter").textContent = ` Displayed ${changesetsCount - newHiddenChangesetsCount}/${changesetsCount}`
        console.log(changesetsCount);
    }
}

function updateMap() {
    needClearLoadMoreRequest++
    lastLoadMoreURL = document.querySelector(".changeset_more > a").href
    document.querySelector(".changeset_more > a").click()
}

function makeUsernamesFilterable(i) {
    if (i.classList.contains("listen-for-filters")) {
        return
    }
    i.classList.add("listen-for-filters")
    i.onclick = (e) => {
        if (massModeActive && (!e.metaKey && !e.ctrlKey && e.isTrusted)) {
            e.preventDefault()
            const filterByUsersInput = document.querySelector("#filter-by-user-input")
            if (filterByUsersInput.value === "") {
                filterByUsersInput.value = e.target.textContent
            } else {
                filterByUsersInput.value = filterByUsersInput.value + "," + e.target.textContent
            }
            filterChangesets()
            updateMap()
            GM_setValue("last-user-filter", document.getElementById("filter-by-user-input")?.value)
        }
    }
    i.title = "Click for hide this user changesets. Ctrl + click for open user profile"
}

let queriesCache = {
    cacheTime: Date.now(),
    elems: {}
}

function addMassActionForGlobalChangesets() {
    if ((location.pathname === "/history" || location.pathname === "/history/friends")
        && document.querySelector("#sidebar_content h2")
        && !document.querySelector("#changesets-filter-btn")) {
        const a = document.createElement("a")
        a.textContent = " 🔎"
        a.style.cursor = "pointer"
        a.id = "changesets-filter-btn"
        a.title = "Changesets filter via better-osm-org"
        a.onclick = () => {
            document.querySelector("#sidebar .search_forms")?.setAttribute("hidden", "true")

            function makeTopFilterBar() {
                const filterBar = document.createElement("div")
                filterBar.classList.add("filter-bar")

                const hideBigChangesetsCheckbox = document.createElement("input")
                hideBigChangesetsCheckbox.checked = needHideBigChangesets = GM_getValue("last-big-changesets-filter")
                hideBigChangesetsCheckbox.type = "checkbox"
                hideBigChangesetsCheckbox.style.cursor = "pointer"
                hideBigChangesetsCheckbox.id = "hide-big-changesets-checkbox"
                const hideBigChangesetLabel = document.createElement("label")
                hideBigChangesetLabel.textContent = "Hide big changesets"
                hideBigChangesetLabel.htmlFor = "hide-big-changesets-checkbox"
                hideBigChangesetLabel.style.marginLeft = "1px"
                hideBigChangesetLabel.style.marginBottom = "4px"
                hideBigChangesetLabel.style.cursor = "pointer"
                hideBigChangesetsCheckbox.onchange = () => {
                    needHideBigChangesets = hideBigChangesetsCheckbox.checked;
                    filterChangesets()
                    updateMap()
                    GM_setValue("last-big-changesets-filter", hideBigChangesetsCheckbox.checked)
                }
                filterBar.appendChild(hideBigChangesetsCheckbox)
                filterBar.appendChild(hideBigChangesetLabel)
                filterBar.appendChild(document.createElement("br"))


                const label = document.createElement("span")
                label.textContent = "🔄Hide changesets from "
                label.title = "Click for invert"
                label.style.minWidth = "165px";
                label.style.display = "inline-block";
                label.style.cursor = "pointer"
                label.setAttribute("checked", false)
                label.id = "invert-user-filter-checkbox"
                label.onclick = e => {
                    if (e.target.textContent === "🔄Hide changesets from ") {
                        e.target.textContent = "🔄Show changesets from "
                    } else {
                        e.target.textContent = "🔄Hide changesets from "
                    }
                    if (e.target.getAttribute("checked") === "false") {
                        e.target.setAttribute("checked", true)
                    } else {
                        e.target.setAttribute("checked", false)
                    }
                    if (document.querySelector("#filter-by-user-input").value !== "") {
                        filterChangesets();
                        updateMap();
                    }
                }
                filterBar.appendChild(label)
                const filterByUsersInput = document.createElement("input")
                filterByUsersInput.placeholder = "user1,user2,... and press Enter"
                filterByUsersInput.id = "filter-by-user-input"
                filterByUsersInput.style.width = "250px"
                filterByUsersInput.style.marginBottom = "3px"
                filterByUsersInput.addEventListener("keypress", function (event) {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        filterChangesets();
                        updateMap()
                        GM_setValue("last-user-filter", filterByUsersInput.value)
                        GM_setValue("last-comment-filter", filterByCommentInput.value)
                    }
                });
                filterByUsersInput.value = GM_getValue("last-user-filter", "")
                filterBar.appendChild(filterByUsersInput)

                const label2 = document.createElement("span")
                label2.textContent = "🔄Hide changesets with "
                label2.title = "Click for invert"
                label2.style.minWidth = "165px";
                label2.style.display = "inline-block";
                label2.style.cursor = "pointer"
                label2.id = "invert-comment-filter-checkbox"
                label2.setAttribute("checked", false)
                label2.onclick = e => {
                    if (e.target.textContent === "🔄Hide changesets with ") {
                        e.target.textContent = "🔄Show changesets with "
                    } else {
                        e.target.textContent = "🔄Hide changesets with "
                    }
                    if (e.target.getAttribute("checked") === "false") {
                        e.target.setAttribute("checked", true)
                    } else {
                        e.target.setAttribute("checked", false)
                    }
                    if (document.querySelector("#filter-by-comment-input").value !== "") {
                        filterChangesets();
                        updateMap()
                    }
                }
                filterBar.appendChild(label2)
                const filterByCommentInput = document.createElement("input")
                filterByCommentInput.id = "filter-by-comment-input"
                filterByCommentInput.style.width = "250px"
                filterByCommentInput.addEventListener("keypress", function (event) {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        filterChangesets();
                        updateMap()
                        GM_setValue("last-user-filter", filterByUsersInput.value)
                        GM_setValue("last-comment-filter", filterByCommentInput.value)
                    }
                });
                filterByCommentInput.value = GM_getValue("last-comment-filter", "")
                filterBar.appendChild(filterByCommentInput)

                return filterBar
            }

            needPatchLoadMoreRequest = true
            if (massModeActive === null) {
                massModeActive = true
                document.querySelector("#sidebar_content > div").after(makeTopFilterBar())
                document.querySelectorAll("ol li div > a").forEach(makeUsernamesFilterable)
            } else {
                massModeActive = !massModeActive
                document.querySelectorAll(".filter-bar").forEach(i => i.toggleAttribute("hidden"))
                document.querySelector("#hidden-changeset-counter")?.toggleAttribute("hidden")
                // document.querySelectorAll(".mass-action-checkbox").forEach(i => {
                // i.toggleAttribute("hidden")
                // })
            }
            filterChangesets()
            updateMap()
        }
        document.querySelector("#sidebar_content h2").appendChild(a)
        const hiddenChangesetsCounter = document.createElement("span")
        hiddenChangesetsCounter.id = "hidden-changeset-counter"
        document.querySelector("#sidebar_content h2").appendChild(hiddenChangesetsCounter)
    }

    if (needPatchLoadMoreRequest === null) {
        // double dirty hack
        // override XMLHttpRequest.getResponseText
        // caching queries since .responseText can be called multiple times
        needPatchLoadMoreRequest = false
        if (!unsafeWindow.XMLHttpRequest.prototype.getResponseText) {
            unsafeWindow.XMLHttpRequest.prototype.getResponseText = Object.getOwnPropertyDescriptor(unsafeWindow.XMLHttpRequest.prototype, 'responseText').get;
        }
        Object.defineProperty(unsafeWindow.XMLHttpRequest.prototype, 'responseText', {
            get: exportFunction(function () {
                if (queriesCache.cacheTime + 2 > Date.now()) {
                    if (queriesCache.elems[this.responseURL]) {
                        return queriesCache.elems[this.responseURL]
                    }
                } else {
                    queriesCache.cacheTime = Date.now()
                    queriesCache.elems = {}
                }
                let responseText = unsafeWindow.XMLHttpRequest.prototype.getResponseText.call(this);
                if (location.pathname !== "/history"
                    && !(location.pathname.includes("/history") && location.pathname.includes("/user/"))) {
                    // todo also for node/123/history
                    // off patching
                    Object.defineProperty(unsafeWindow.XMLHttpRequest.prototype, 'responseText', {
                        get: unsafeWindow.XMLHttpRequest.prototype.getResponseText,
                        enumerable: true,
                        configurable: true
                    })
                    return responseText;
                }
                if (needClearLoadMoreRequest) {
                    console.log("new changesets cleared")
                    needClearLoadMoreRequest--;
                    const docParser = new DOMParser();
                    const doc = docParser.parseFromString(responseText, "text/html");
                    doc.querySelectorAll("ol > li").forEach(i => i.remove())
                    doc.querySelector(".changeset_more a").href = lastLoadMoreURL
                    queriesCache.elems[lastLoadMoreURL] = doc.documentElement.outerHTML;
                    queriesCache.elems[this.responseURL] = doc.documentElement.outerHTML;
                    lastLoadMoreURL = ""
                } else if (needPatchLoadMoreRequest) {
                    console.log("new changesets patched")
                    const docParser = new DOMParser();
                    const doc = docParser.parseFromString(responseText, "text/html");
                    filterChangesets(doc)
                    setTimeout(() => {
                        const changesetsCount = document.querySelectorAll("ol > li").length
                        document.querySelector("#hidden-changeset-counter").textContent = ` Displayed ${changesetsCount - hiddenChangesetsCount}/${changesetsCount}` // hiddenChangesetsCount?
                    }, 100)
                    queriesCache.elems[this.responseURL] = doc.documentElement.outerHTML;
                } else {
                    queriesCache.elems[this.responseURL] = responseText
                }
                return queriesCache.elems[this.responseURL]
            }, unsafeWindow),
            enumerable: true,
            configurable: true
        });
    }

}

function makeBadge(userInfo, changesetDate = new Date()) {
    let userBadge = document.createElement("span")
    userBadge.classList.add("user-badge")
    if (userInfo['roles'].some(i => i === "moderator")) {
        userBadge.style.position = "relative"
        userBadge.style.bottom = "2px"
        userBadge.title = "This user is a moderator"
        userBadge.innerHTML = '<svg width="20" height="20"><path d="M 10,2 8.125,8 2,8 6.96875,11.71875 5,18 10,14 15,18 13.03125,11.71875 18,8 11.875,8 10,2 z" fill="#447eff" stroke="#447eff" stroke-width="2" stroke-linejoin="round"></path></svg>'
        userBadge.querySelector("svg").style.transform = "scale(0.9)"
    } else if (userInfo['roles'].some(i => i === "importer")) {
        userBadge.style.position = "relative"
        userBadge.style.bottom = "2px"
        userBadge.title = "This user is a importer"
        userBadge.innerHTML = '<svg width="20" height="20"><path d="M 10,2 8.125,8 2,8 6.96875,11.71875 5,18 10,14 15,18 13.03125,11.71875 18,8 11.875,8 10,2 z" fill="#38e13a" stroke="#38e13a" stroke-width="2" stroke-linejoin="round"></path></svg>'
        userBadge.querySelector("svg").style.transform = "scale(0.9)"
    } else if (userInfo['blocks']['received']['active']) {
        userBadge.title = "The user was banned"
        userBadge.textContent = "⛔️"
    } else if (
        new Date(userInfo['account_created']).setUTCDate(new Date(userInfo['account_created']).getUTCDate() + 30)
        > changesetDate
    ) {
        userBadge.title = "The user is less than a month old"
        userBadge.textContent = "🍼"
    } else {
        getFriends().then(res => {
            if (res.includes(userInfo['display_name'])) { // todo warn if username startsWith 🫂 or use svg
                userBadge.title = "You are following this user"
                userBadge.textContent = "🫂 "
            }
        })
    }
    return userBadge
}

function addMassChangesetsActions() {
    if (!location.pathname.includes("/history")) return;
    if (!document.querySelector("#sidebar_content h2")) return

    addMassActionForUserChangesets();
    addMassActionForGlobalChangesets();

    const MAX_PAGE_FOR_LOAD = 15;
    sidebarObserverForMassActions?.disconnect()

    function observerHandler(mutationsList, observer) {
        // console.log(mutationsList)
        // debugger
        if (!location.pathname.includes("/history")) {
            massModeActive = null
            needClearLoadMoreRequest = 0
            needPatchLoadMoreRequest = false
            needHideBigChangesets = false
            currentMassDownloadedPages = null
            observer.disconnect()
            sidebarObserverForMassActions = null
            return;
        }
        if (massModeForUserChangesetsActive && location.pathname !== "/history" && location.pathname !== "/history/friends") {
            document.querySelectorAll(".changesets li").forEach(addChangesetCheckbox)
            makeBottomActionBar()
        }
        if (massModeActive && (location.pathname === "/history" || location.pathname === "/history/friends")) {
            document.querySelectorAll("ol li div > a").forEach(makeUsernamesFilterable)
            // sidebarObserverForMassActions?.disconnect()
            filterChangesets()
            // todo
            // sidebarObserverForMassActions.observe(document.querySelector('#sidebar'), {childList: true, subtree: true});
        }
        document.querySelectorAll('#sidebar .col .changeset_id').forEach((item) => {
            if (item.classList.contains("custom-changeset-id-click")) return
            item.classList.add("custom-changeset-id-click")
            item.onclick = (e) => {
                e.preventDefault();
                let id = e.target.innerText.slice(1);
                navigator.clipboard.writeText(id).then(() => copyAnimation(e, id));
            }
            item.title = "Click for copy changeset id"
            if (location.pathname.match(/^\/history(\/?|\/friends)$/)) {
                getCachedUserInfo(item.previousSibling.previousSibling.textContent).then((res) => {
                    item.previousSibling.previousSibling.title = `changesets_count: ${res['changesets']['count']}\naccount_created: ${res['account_created']}`
                    item.previousSibling.previousSibling.before(makeBadge(res,
                        new Date(item.parentElement.querySelector("time")?.getAttribute("datetime") ?? new Date())))
                })
            }
        })
        if (currentMassDownloadedPages && currentMassDownloadedPages <= MAX_PAGE_FOR_LOAD) {
            const loader = document.querySelector(".changeset_more > .loader")
            if (loader === null) {
                makeBottomActionBar()
            } else if (loader.style.display === "") {
                document.querySelector(".changeset_more > a").click()
                console.log(`Loading page #${currentMassDownloadedPages}`)
                currentMassDownloadedPages++
            }
        } else if (currentMassDownloadedPages > MAX_PAGE_FOR_LOAD) {
            currentMassDownloadedPages = null
            const changesetsCount = document.querySelectorAll("ol > li").length
            document.querySelector("#hidden-changeset-counter").textContent = ` Displayed ${changesetsCount - hiddenChangesetsCount}/${changesetsCount}`
        } else {
            if (!document.querySelector("#infinity-list-btn")) {
                let moreButton = document.querySelector(".changeset_more > a")
                if (!moreButton) return
                const infinityList = document.createElement("button")
                infinityList.classList.add("btn", "btn-primary")
                infinityList.textContent = `Load ${20 * MAX_PAGE_FOR_LOAD}`
                infinityList.id = "infinity-list-btn"
                infinityList.onclick = () => {
                    currentMassDownloadedPages = 1;
                    moreButton.click()
                    infinityList.remove()
                }
                moreButton.after(infinityList)
                moreButton.after(document.createTextNode("\xA0"))
            }
        }
    }

    sidebarObserverForMassActions = new MutationObserver(observerHandler)
    sidebarObserverForMassActions.observe(document.querySelector('#sidebar'), {childList: true, subtree: true});
}

function setupMassChangesetsActions() {
    if (location.pathname !== "/history" && location.pathname !== "/history/friends"
        && !(location.pathname.includes("/history") && location.pathname.includes("/user/"))) return;
    let timerId = setInterval(addMassChangesetsActions, 300);
    setTimeout(() => {
        clearInterval(timerId);
        console.debug('stop try add mass changesets actions');
    }, 5000);
    addMassChangesetsActions();
}

//</editor-fold>


//<editor-fold desc="hotkeys">
let hotkeysConfigured = false


/**
 * @param {number|null=} changeset_id
 * @return {Promise<void>}
 */
async function loadChangesetMetadata(changeset_id = null) {
    if (!changeset_id) {
        const match = location.pathname.match(/changeset\/(\d+)/)
        if (!match) {
            return;
        }
        changeset_id = parseInt(match[1]);
    }
    if (changesetMetadata !== null && changesetMetadata.id === changeset_id) {
        return;
    }
    prevChangesetMetadata = changesetMetadata
    const res = await fetch(osm_server.apiBase + "changeset" + "/" + changeset_id + ".json",
        // {signal: abortDownloadingController.signal}
    );
    if (res.status === 509) {
        await error509Handler(res)
    } else {
        const jsonRes = await res.json();
        if (jsonRes.changeset) {
            changesetMetadata = jsonRes.changeset
            return
        }
        changesetMetadata = jsonRes.elements[0]
        changesetMetadata.min_lat = changesetMetadata.minlat
        changesetMetadata.min_lon = changesetMetadata.minlon
        changesetMetadata.max_lat = changesetMetadata.maxlat
        changesetMetadata.max_lon = changesetMetadata.maxlon
    }
}

let noteMetadata = null

async function loadNoteMetadata() {
    const match = location.pathname.match(/note\/(\d+)/)
    if (!match) {
        return;
    }
    const note_id = parseInt(match[1]);
    if (noteMetadata !== null && noteMetadata.id === note_id) {
        return;
    }
    const res = await fetch(osm_server.apiBase + "notes" + "/" + note_id + ".json", {signal: abortDownloadingController.signal});
    if (res.status === 509) {
        await error509Handler(res)
    } else {
        noteMetadata = await res.json()
    }
}

let nodeMetadata = null

async function loadNodeMetadata() {
    const match = location.pathname.match(/node\/(\d+)/)
    if (!match) {
        return;
    }
    const node_id = parseInt(match[1]);
    if (nodeMetadata !== null && nodeMetadata.id === node_id) {
        return;
    }
    const res = await fetch(osm_server.apiBase + "node" + "/" + node_id + ".json", {signal: abortDownloadingController.signal});
    if (res.status === 509) {
        await error509Handler(res)
    } else if (res.status === 410) {
        console.warn("node was deleted");
    } else {
        const jsonRes = await res.json();
        nodeMetadata = jsonRes.elements[0]
    }
}

let wayMetadata = null

async function loadWayMetadata() {
    const match = location.pathname.match(/way\/(\d+)/)
    if (!match) {
        return;
    }
    const way_id = parseInt(match[1]);
    if (wayMetadata !== null && wayMetadata.id === way_id) {
        return;
    }
    const res = await fetch(osm_server.apiBase + "way" + "/" + way_id + "/full.json", {signal: abortDownloadingController.signal});
    if (res.status === 509) {
        await error509Handler(res)
    } else if (res.status === 410) {
        console.warn("way was deleted");
    } else {
        const jsonRes = await res.json();
        wayMetadata = jsonRes.elements.filter(i => i.type === "node")
        wayMetadata.bbox = {
            min_lat: Math.min(...wayMetadata.map(i => i.lat)),
            min_lon: Math.min(...wayMetadata.map(i => i.lon)),
            max_lat: Math.max(...wayMetadata.map(i => i.lat)),
            max_lon: Math.max(...wayMetadata.map(i => i.lon))
        }
    }
}

let relationMetadata = null

async function loadRelationMetadata() {
    const match = location.pathname.match(/relation\/(\d+)/)
    if (!match) {
        return;
    }
    const relation_id = parseInt(match[1]);
    if (relationMetadata !== null && relationMetadata.id === relation_id) {
        return;
    }
    const res = await fetch(osm_server.apiBase + "relation" + "/" + relation_id + "/full.json", {signal: abortDownloadingController.signal});
    if (res.status === 509) {
        await error509Handler(res)
    } else if (res.status === 410) {
        console.warn("relation was deleted");
    } else {
        const jsonRes = await res.json();
        relationMetadata = jsonRes.elements.filter(i => i.type === "node")
        relationMetadata.bbox = {
            min_lat: Math.min(...relationMetadata.map(i => i.lat)),
            min_lon: Math.min(...relationMetadata.map(i => i.lon)),
            max_lat: Math.max(...relationMetadata.map(i => i.lat)),
            max_lon: Math.max(...relationMetadata.map(i => i.lon))
        }
    }
}

function updateCurrentObjectMetadata() {
    setTimeout(loadChangesetMetadata, 0)
    setTimeout(loadNoteMetadata, 0)
    setTimeout(loadNodeMetadata, 0)
    setTimeout(loadWayMetadata, 0)
    setTimeout(loadRelationMetadata, 0)
}

async function sleep(ms) {
    await new Promise(r => setTimeout(r, ms))
}

async function loadFriends() {
    console.debug("Loading friends list")
    const res = await ((await fetch(osm_server.url + "/dashboard")).text())
    const parser = new DOMParser()
    const doc = parser.parseFromString(res, "text/html")
    const friends = []
    doc.querySelectorAll('a[data-method="delete"][href*="/follow"]').forEach(a => {
        const username = a.getAttribute("href").match(/\/user\/(.+)\/follow/)[1]
        friends.push(decodeURI(username))
    })
    GM_setValue("friends", JSON.stringify(friends))
    console.debug("Friends list updated")
    return friends
}

let friendsLoadingLock = false;

async function getFriends() {
    const friendsStr = GM_getValue("friends")
    if (friendsStr) {
        return JSON.parse(friendsStr)
    } else {
        while (friendsLoadingLock) {
            await sleep(500)
        }
        friendsLoadingLock = true
        const res = await loadFriends()
        friendsLoadingLock = false
        return res
    }
}

const mapPositionsHistory = []
const mapPositionsNextHistory = []

function runPositionTracker() {
    setInterval(() => {
        if (!getMap()) return
        const bound = get4Bounds(getMap())
        if (JSON.stringify(mapPositionsHistory[mapPositionsHistory.length - 1]) === JSON.stringify(bound)) {
            return;
        }
        // in case of a transition between positions
        // via timeout?
        if (JSON.stringify(mapPositionsNextHistory[mapPositionsNextHistory.length - 1]) === JSON.stringify(bound)) {
            return;
        }
        mapPositionsNextHistory.length = 0
        mapPositionsHistory.push(bound)
        if (mapPositionsHistory.length > 100) {
            mapPositionsHistory.shift()
            mapPositionsHistory.shift()
        }
    }, 1000);
}

let newNotePlaceholder = null

function resetMapHover() {
    document.querySelectorAll(".map-hover").forEach(el => {
        el.classList.remove("map-hover")
    })
}

function enableOverzoom() {
    if (!GM_config.get("OverzoomForDataLayer")) {
        return
    }
    console.log("Enabling overzoom for map layer")
    injectJSIntoPage(`
    (function () {
        map.options.maxZoom = 22
        const layers = [];
        map.eachLayer(i => layers.push(i))
        layers[0].options.maxZoom = 22
    })()
    `)
    // it's unstable
    console.log("Overzoom enabled")
}

const ABORT_ERROR_PREV = "Abort requests for moving to prev changeset";
const ABORT_ERROR_NEXT = "Abort requests for moving to next changeset";
const ABORT_ERROR_USER_CHANGESETS = "Abort requests for moving to user changesets";

let layersHidden = false;

function setupNavigationViaHotkeys() {
    if (["/edit", "/id"].includes(location.pathname)) return
    updateCurrentObjectMetadata()
    // if (!location.pathname.includes("/changeset")) return;
    if (hotkeysConfigured) return
    hotkeysConfigured = true

    runPositionTracker()

    function keydownHandler(e) {
        if (e.repeat) return
        if (document.activeElement?.name === "text") return
        if (document.activeElement?.name === "query") {
            if (e.code === "Escape") {
                document.activeElement.blur()
            }
            return
        }
        if (["TEXTAREA", "INPUT"].includes(document.activeElement?.nodeName) && document.activeElement?.getAttribute("type") !== "checkbox") {
            return;
        }
        if (e.metaKey || e.ctrlKey) {
            return;
        }
        if (e.code === "KeyN") {
            if (location.pathname.includes("/user/")) {
                document.querySelector('a[href^="/user/"][href$="/notes"]')?.click()
            } else {
                // notes
                if (e.shiftKey) {
                    if (location.pathname.includes("/node") || location.pathname.includes("/way") || location.pathname.includes("/relation")) {
                        newNotePlaceholder = "\n \n" + location.href
                    }
                    document.querySelector("a:has(span.note)").click()
                } else {
                    Array.from(document.querySelectorAll(".overlay-layers label"))[0].click()
                }
            }
        } else if (e.code === "KeyD") {
            if (location.pathname.includes("/user/")) {
                document.querySelector('a[href^="/user/"][href$="/diary"]')?.click()
            } else {
                // map data
                Array.from(document.querySelectorAll(".overlay-layers label"))[1].click()
                enableOverzoom()
            }
        } else if (e.code === "KeyG") { // gps tracks
            Array.from(document.querySelectorAll(".overlay-layers label"))[2].click()
        } else if (e.code === "KeyS") { // satellite
            if (e.shiftKey) {
                switchESRIbeta()
                return
            } else {
                switchTiles()
                if (document.querySelector(".turn-on-satellite")) {
                    document.querySelector(".turn-on-satellite").textContent = invertTilesMode(currentTilesMode)
                }
                if (document.querySelector(".turn-on-satellite-from-pane")) {
                    document.querySelector(".turn-on-satellite-from-pane").textContent = invertTilesMode(currentTilesMode)
                }
            }
        } else if (e.code === "KeyE") {
            if (e.shiftKey) {
                if (document.querySelector("#editanchor").getAttribute("data-editor") === "id") {
                    document.querySelectorAll("#edit_tab .dropdown-menu .editlink")[1]?.click()
                } else {
                    document.querySelectorAll("#edit_tab .dropdown-menu .editlink")[0]?.click()
                }
            } else {
                document.querySelector("#editanchor")?.click()
            }
        } else if (e.code === "KeyH") {
            if (e.shiftKey) {
                const targetURL = document.querySelector('.dropdown-item[href^="/user/"]').getAttribute("href") + "/history"
                if (targetURL !== location.pathname) {
                    try {
                        getWindow().OSM.router.route(targetURL)
                    } catch {
                        window.location = targetURL
                    }
                }
            } else {
                if (location.pathname.match(/(node|way|relation)\/\d+/)) {
                    if (location.pathname.match(/(node|way|relation)\/\d+\/?$/)) {
                        getWindow().OSM.router.route(window.location.pathname + "/history")
                    } else if (location.pathname.match(/(node|way|relation)\/\d+\/history\/\d+\/?$/)) {
                        const historyPath = window.location.pathname.match(/(\/(node|way|relation)\/\d+\/history)\/\d+/)[1]
                        getWindow().OSM.router.route(historyPath)
                    } else {
                        console.debug("skip H")
                    }
                } else if (location.pathname === "/" || location.pathname.includes("/note")) {
                    // document.querySelector("#history_tab")?.click()
                    document.querySelector('.nav-link[href^="/history"]')?.click()
                } else if (location.pathname.includes("/user/")) {
                    document.querySelector('a[href^="/user/"][href$="/history"]')?.click()
                }
            }
        } else if (e.code === "KeyY") {
            const [, z, x, y] = new URL(document.querySelector("#editanchor").href).hash.match(/map=(\d+)\/([0-9.-]+)\/([0-9.-]+)/)
            window.open(`https://yandex.ru/maps/?l=stv,sta&ll=${y},${x}&z=${z}`, "_blank", "noreferrer");
        } else if (e.key === "1") {
            if (location.pathname.match(/\/(node|way|relation)\/\d+/)) {
                if (location.pathname.match(/\/(node|way|relation)\/\d+/)) {
                    getWindow().OSM.router.route(location.pathname.match(/\/(node|way|relation)\/\d+/)[0] + "/history/1")
                } else {
                    console.debug("skip 1")
                }
            }
        } else if (e.key === "0") {
            const center = getMap().getCenter()
            setZoom(2)
            fetch(`https://nominatim.openstreetmap.org/reverse.php?lon=${center.lng}&lat=${center.lat}&format=jsonv2`).then((res) => {
                res.json().then((r) => {
                    if (r?.address?.state) {
                        getMap().attributionControl.setPrefix(`${r.address.state}`)
                    }
                })
            })
        } else if (e.code === "KeyZ") {
            if (location.pathname.includes("/changeset")) {
                if (e.shiftKey && changesetMetadata) {
                    setTimeout(async () => {
                        // todo changesetID => merged BBOX
                        const changesetID = parseInt(location.pathname.match(/changeset\/(\d+)/)[1])
                        const nodesBag = [];
                        for (const node of Array.from(changesetsCache[changesetID].querySelectorAll('node'))) {
                            if (node.getAttribute("visible") !== "false") {
                                nodesBag.push({
                                    lat: parseFloat(node.getAttribute("lat")),
                                    lon: parseFloat(node.getAttribute("lon"))
                                });
                            } else {
                                const version = searchVersionByTimestamp(
                                    await getNodeHistory(node.getAttribute("id")),
                                    new Date(new Date(changesetMetadata.created_at).getTime() - 1).toISOString()
                                )
                                if (version.visible !== false) {
                                    nodesBag.push({
                                        lat: version.lat,
                                        lon: version.lon
                                    });
                                }
                            }
                        }
                        if (changesetsCache[changesetID].querySelectorAll("relation").length) {
                            for (const way of changesetsCache[changesetID].querySelectorAll("way")) {
                                const targetTime = way.getAttribute("visible") === "false"
                                    ? new Date(new Date(changesetMetadata.created_at).getTime() - 1).toISOString()
                                    : changesetMetadata.closed_at
                                const [, currentNodesList] = await getWayNodesByTimestamp(targetTime, way.getAttribute("id"))
                                currentNodesList.forEach(coords => {
                                    nodesBag.push({
                                        lat: coords[0],
                                        lon: coords[1]
                                    })
                                })
                            }
                        }
                        getMap()?.invalidateSize()
                        if (nodesBag.length) {
                            const bbox = {
                                min_lat: Math.min(...nodesBag.map(i => i.lat)),
                                min_lon: Math.min(...nodesBag.map(i => i.lon)),
                                max_lat: Math.max(...nodesBag.map(i => i.lat)),
                                max_lon: Math.max(...nodesBag.map(i => i.lon))
                            }
                            fitBounds([
                                [bbox.min_lat, bbox.min_lon],
                                [bbox.max_lat, bbox.max_lon]
                            ])
                        } else {
                            fitBounds([
                                [changesetMetadata.min_lat, changesetMetadata.min_lon],
                                [changesetMetadata.max_lat, changesetMetadata.max_lon]
                            ])
                        }
                    })
                } else {
                    getMap()?.invalidateSize()
                    if (changesetMetadata) {
                        fitBounds([
                            [changesetMetadata.min_lat, changesetMetadata.min_lon],
                            [changesetMetadata.max_lat, changesetMetadata.max_lon]
                        ])
                    } else {
                        console.warn("Changeset metadata not downloaded")
                    }
                }
            } else if (location.pathname.match(/(node|way|relation|note)\/\d+/)) {
                if (location.pathname.includes("node")) {
                    if (nodeMetadata) {
                        panTo(nodeMetadata.lat, nodeMetadata.lon)
                    } else {
                        if (location.pathname.includes("history")) {
                            // panTo last visible version
                            panTo(
                                document.querySelector(".browse-node span.latitude").textContent.replace(",", "."),
                                document.querySelector(".browse-node span.longitude").textContent.replace(",", ".")
                            )
                        }
                    }
                } else if (location.pathname.includes("note")) {
                    if (!document.querySelector('#sidebar_content a[href*="/traces/"]') || !trackMetadata) {
                        if (noteMetadata) {
                            panTo(noteMetadata.geometry.coordinates[1], noteMetadata.geometry.coordinates[0], Math.max(17, getMap().getZoom()))
                        }
                    } else if (trackMetadata) {
                        fitBounds([
                            [trackMetadata.min_lat, trackMetadata.min_lon],
                            [trackMetadata.max_lat, trackMetadata.max_lon]
                        ])
                    }
                } else if (location.pathname.includes("way")) {
                    if (wayMetadata) {
                        fitBounds([
                            [wayMetadata.bbox.min_lat, wayMetadata.bbox.min_lon],
                            [wayMetadata.bbox.max_lat, wayMetadata.bbox.max_lon]
                        ])
                    }
                } else if (location.pathname.includes("relation")) {
                    if (relationMetadata) {
                        fitBounds([
                            [relationMetadata.bbox.min_lat, relationMetadata.bbox.min_lon],
                            [relationMetadata.bbox.max_lat, relationMetadata.bbox.max_lon]
                        ])
                    }
                }
            } else if (location.search.includes("&display-gpx=")) {
                if (trackMetadata) {
                    fitBounds([
                        [trackMetadata.min_lat, trackMetadata.min_lon],
                        [trackMetadata.max_lat, trackMetadata.max_lon]
                    ])
                }
            }
        } else if (e.key === "8") {
            if (mapPositionsHistory.length > 1) {
                mapPositionsNextHistory.push(mapPositionsHistory[mapPositionsHistory.length - 1])
                mapPositionsHistory.pop()
                fitBounds(mapPositionsHistory[mapPositionsHistory.length - 1])
            }
        } else if (e.key === "9") {
            if (mapPositionsNextHistory.length) {
                mapPositionsHistory.push(mapPositionsNextHistory.pop())
                fitBounds(mapPositionsHistory[mapPositionsHistory.length - 1])
            }
        } else if (e.code === "Minus") {
            if (document.activeElement?.id !== "map") {
                if (!e.altKey) {
                    getMap().setZoom(getMap().getZoom() - 2)
                } else {
                    getMap().setZoom(getMap().getZoom() - 1)
                }
            }
        } else if (e.code === "Equal") {
            if (document.activeElement?.id !== "map") {
                if (!e.altKey) {
                    getMap().setZoom(getMap().getZoom() + 2)
                } else {
                    getMap().setZoom(getMap().getZoom() + 1)
                }
            }
        } else if (e.code === "KeyO") {
            if (e.shiftKey) {
                window.open("https://overpass-api.de/achavi/?changeset=" + location.pathname.match(/\/changeset\/(\d+)/)[1])
            } else {
                document.querySelector("#osmcha_link")?.click()
            }
        } else if (e.code === "Escape") {
            cleanObjectsByKey("activeObjects")
        } else if (e.code === "KeyL") {
            if (e.shiftKey) {
                document.getElementsByClassName("geolocate")[0]?.click()
            }
        } else if (e.code === "KeyC") {
            if (location.pathname.includes("/user/")) {
                if (location.pathname.includes("/diary_comments")) {
                    document.querySelector('a[href^="/user/"][href$="changeset_comments"]')?.click()
                } else {
                    document.querySelector('a[href^="/user/"][href$="_comments"]')?.click()
                }
            } else {
                const activeObject = document.querySelector(".browse-section.active-object")
                if (activeObject) {
                    activeObject.querySelector('a[href^="/changeset/"]')?.click()
                } else {
                    const changesetsLinks = document.querySelectorAll('a[href^="/changeset/"]')
                    if (changesetsLinks.length === 1) {
                        changesetsLinks[0].click()
                    }
                }
            }
        } else if (e.code === "KeyQ" && !e.altKey && !e.metaKey && !e.shiftKey && !e.ctrlKey) {
            document.querySelector("#sidebar_content .btn-close")?.click()
            document.querySelector(".welcome .btn-close")?.click()
        } else if (e.code === "KeyT" && !e.altKey && !e.metaKey && !e.shiftKey && !e.ctrlKey) {
            if (location.pathname.includes("/user/")) {
                document.querySelector('a[href="/traces/mine"], a[href$="/traces"]:not(.nav-link):not(.dropdown-item)')?.click()
            } else {
                document.querySelector(".quick-look-compact-toggle-btn")?.click()
                document.querySelector(".compact-toggle-btn")?.click()
            }
        } else if (e.code === "KeyU" && !e.altKey && !e.metaKey && !e.ctrlKey) {
            if (e.shiftKey) {
                window.location = document.querySelector('.dropdown-item[href^="/user/"]').getAttribute("href")
            } else {
                const user_link = document.querySelector('#sidebar_content a[href^="/user/"]')
                if (user_link) {
                    if (user_link.checkVisibility()) {
                        user_link?.click()
                    } else {
                        document.querySelector('#sidebar_content li:not([hidden-data-changeset]) a[href^="/user/"]')?.click()
                    }
                    // todo fixme on changesets page with filter
                } else {
                    document.querySelector('#content a[href^="/user/"]:not([href$=rss]):not([href*="/diary"]):not([href*="/traces"])')?.click()
                }
            }
        } else if (e.code === "Backquote" && !e.altKey && !e.metaKey && !e.ctrlKey) {
            for (let member in layers) {
                layers[member].forEach((i) => {
                    if (layersHidden) {
                        i.getElement().style.visibility = ""
                    } else {
                        i.getElement().style.visibility = "hidden"
                    }
                })
            }
            layersHidden = !layersHidden;
        } else if (e.code === "KeyF" && !e.altKey && !e.metaKey && !e.ctrlKey) {
            document.querySelector("#changesets-filter-btn")?.click()
        } else {
            // console.log(e.key, e.code)
        }
        if (location.pathname.includes("/changeset") && !location.pathname.includes("/changeset_comments")) {
            if (e.code === "Comma") {
                const navigationLinks = document.querySelectorAll("div.secondary-actions")[1]?.querySelectorAll("a")
                if (navigationLinks && navigationLinks[0].href.includes("/changeset/")) {
                    abortDownloadingController.abort(ABORT_ERROR_PREV)
                    navigationLinks[0].focus()
                    navigationLinks[0].click()
                }
            } else if (e.code === "Period") {
                const navigationLinks = document.querySelectorAll("div.secondary-actions")[1]?.querySelectorAll("a")
                if (navigationLinks && Array.from(navigationLinks).at(-1).href.includes("/changeset/")) {
                    abortDownloadingController.abort(ABORT_ERROR_NEXT)
                    Array.from(navigationLinks).at(-1).focus()
                    Array.from(navigationLinks).at(-1).click()
                }
            } else if (e.code === "KeyH") {
                const userChangesetsLink = document.querySelectorAll("div.secondary-actions")[1]?.querySelector('a[href^="/user/"]')
                if (userChangesetsLink) {
                    abortDownloadingController.abort(ABORT_ERROR_USER_CHANGESETS)
                    userChangesetsLink.focus()
                    userChangesetsLink.click()
                }
            } else if (e.code === "KeyK") {
                if (!document.querySelector("ul .active-object")) {

                } else {
                    const cur = document.querySelector("ul .active-object")
                    if (cur.previousElementSibling) {
                        cur.previousElementSibling.classList.add("active-object")
                        cur.classList.remove("active-object")
                        cur.previousElementSibling.click()
                        cur.previousElementSibling.scrollIntoView()
                        resetMapHover()
                        cur.previousElementSibling.classList.add("map-hover")
                    } else {
                        if (cur.parentElement.parentElement.id === "changeset_nodes") {
                            cur.classList.remove("active-object")
                            document.querySelector("#changeset_ways li:last-of-type").classList.add("active-object")
                            document.querySelector("ul .active-object").click()
                            document.querySelector("ul .active-object").classList.add("map-hover")
                            resetMapHover()
                            document.querySelector("ul .active-object").classList.add("map-hover")
                        }
                    }
                }
            } else if (e.code === "KeyL" && !e.shiftKey) {
                if (!document.querySelector("ul .active-object")) {
                    document.querySelector("#changeset_nodes li, #changeset_ways li, #changeset_relations li").classList.add("active-object")
                    document.querySelector("ul .active-object").click()
                    resetMapHover()
                    document.querySelector("ul .active-object").classList.add("map-hover")
                } else {
                    const cur = document.querySelector("ul .active-object")
                    if (cur.nextElementSibling) {
                        cur.nextElementSibling.classList.add("active-object")
                        cur.classList.remove("active-object")
                        cur.nextElementSibling.click()
                        cur.nextElementSibling.scrollIntoView()
                        resetMapHover()
                        cur.nextElementSibling.classList.add("map-hover")
                    } else {
                        if (cur.parentElement.parentElement.id === "changeset_ways") {
                            cur.classList.remove("active-object")
                            document.querySelector("#changeset_nodes li").classList.add("active-object")
                            document.querySelector("ul .active-object").click()

                            resetMapHover();
                            document.querySelector("ul .active-object").classList.add("map-hover")
                        }
                    }
                }
            }
        } else if (location.pathname.match(/^\/(node|way|relation)\/\d+/)) {
            if (e.code === "Comma") {
                const navigationLinks = document.querySelectorAll("div.secondary-actions")[1]?.querySelectorAll("a")
                if (navigationLinks && navigationLinks[0].href.includes("/history/")) {
                    if (location.pathname.includes("history")) {
                        navigationLinks[0].click()
                    } else {
                        Array.from(navigationLinks).at(-1).click()
                    }
                }
            } else if (e.code === "Period") {
                const navigationLinks = document.querySelectorAll("div.secondary-actions")[1]?.querySelectorAll("a")
                if (navigationLinks && Array.from(navigationLinks).at(-1).href.includes("/history/")) {
                    Array.from(navigationLinks).at(-1).click()
                }
            }
            if (location.pathname.match(/\/history$/)) {
                if (e.code === "KeyK") {
                    if (!document.querySelector("#sidebar_content .active-object")) {
                        getMap()?.invalidateSize()
                        document.querySelector(".browse-section:not(.hidden-version)").classList.add("active-object")
                        document.querySelector(".browse-section:not(.hidden-version)").click()
                        resetMapHover()
                        document.querySelector(".browse-section:not(.hidden-version)").classList.add("map-hover")
                    } else {
                        const old = document.querySelector(".browse-section.active-object")
                        let cur = old?.previousElementSibling
                        while (cur && (!cur.classList.contains("browse-section") || cur.classList.contains("hidden-version"))) {
                            cur = cur.previousElementSibling
                        }
                        if (cur) {
                            cur.classList.add("active-object")
                            old.classList.remove("active-object")
                            cur.click()
                            cur.scrollIntoView()
                            resetMapHover()
                            cur.classList.add("map-hover")
                        }
                    }
                } else if (e.code === "KeyL" && !e.shiftKey) {
                    if (!document.querySelector("#sidebar_content .active-object")) {
                        getMap()?.invalidateSize()
                        document.querySelector(".browse-section").classList.add("active-object")
                        document.querySelector(".browse-section.active-object").click()
                        resetMapHover()
                        document.querySelector(".browse-section.active-object").classList.add("map-hover")
                    } else {
                        const old = document.querySelector(".browse-section.active-object")
                        let cur = old?.nextElementSibling
                        while (cur && (!cur.classList.contains("browse-section") || cur.classList.contains("hidden-version"))) {
                            cur = cur.nextElementSibling
                        }
                        if (cur) {
                            cur.classList.add("active-object")
                            old.classList.remove("active-object")
                            cur.click()
                            cur.scrollIntoView()
                            resetMapHover()
                            cur.classList.add("map-hover")
                        }
                    }
                }
            }
        } else if (location.pathname.match(/user\/.+\/(traces|diary_comments|changeset_comments)/)) {
            if (e.code === "Comma") {
                document.querySelector('.pagination a[href*="after"]')?.click()
            } else if (e.code === "Period") {
                document.querySelector('.pagination a[href*="before"]')?.click()
            }
        } else if (location.pathname.match(/user\/.+\/(notes)/)) {
            if (e.code === "Comma") {
                document.querySelectorAll('.pagination li a')[0]?.click()
            } else if (e.code === "Period") {
                document.querySelectorAll('.pagination li a')[1]?.click()
            }
        }
    }

    document.addEventListener('keydown', keydownHandler, false);
}

//</editor-fold>

function resetSearchFormFocus() {
    blurSearchField()
    // document.querySelector("#sidebar .search_form .input-group > button").setAttribute('tabIndex', "-1")
}

function setupClickableAvatar() {
    const miniAvatar = document.querySelector(".user_thumbnail_tiny:not([patched-for-click])")
    if (!miniAvatar || miniAvatar.setAttribute("patched-for-click", "true")) {
        return;
    }
    miniAvatar.onclick = (e) => {
        if (!e.isTrusted) return
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
        if (location.pathname.match(/\/user\/.+\/history/)) {
            const targetURL = document.querySelector('.dropdown-item[href^="/user/"]').getAttribute("href")
            if (e.ctrlKey || e.metaKey) {
                window.open(targetURL, "_blank")
            } else {
                window.location = targetURL
            }
            miniAvatar.click() // dirty hack for hide dropdown
        } else {
            const targetURL = document.querySelector('.dropdown-item[href^="/user/"]').getAttribute("href") + "/history"
            if (targetURL !== location.pathname) {
                if (e.ctrlKey || e.metaKey) {
                    window.open(targetURL, "_blank")
                } else {
                    try {
                        getWindow().OSM.router.route(targetURL)
                    } catch {
                        window.location = targetURL
                    }
                }
                miniAvatar.click() // dirty hack for hide dropdown
            }
        }
    }
}

function setupOverzoomForDataLayer() {
    if (location.hash.includes("D") && location.hash.includes("layers")) {
        enableOverzoom()
    }
}

const modules = [
    setupOffMapDim,
    setupDarkModeForMap,
    setupHDYCInProfile,
    setupCompactChangesetsHistory,
    setupMassChangesetsActions,
    setupRevertButton,
    setupResolveNotesButton,
    setupDeletor,
    setupHideNoteHighlight,
    setupSatelliteLayers,
    setupVersionsDiff,
    setupChangesetQuickLook,
    setupNewEditorsLinks,
    setupViewLinks,
    setupNavigationViaHotkeys,
    setupRelationVersionViewer,
    setupClickableAvatar,
    setupOverzoomForDataLayer,
    setupDragAndDropViewers
];

const fetchJSONWithCache = (() => {
    const cache = new Map();

    return async url => {
        if (cache.has(url)) {
            return cache.get(url);
        }

        const promise = fetch(url).then((res) => res.json());
        cache.set(url, promise);

        try {
            const result = await promise;
            cache.set(url, result);
            return result;
        } catch (error) {
            cache.delete(url);
            throw error;
        }
    };
})();

function setupTaginfo() {
    const instance_text = document.querySelector("#instance")?.textContent;
    const instance = instance_text?.replace(/ \(.*\)/, "")

    if (instance_text?.includes(" ")) {
        const turboLink = document.querySelector("#turbo_button:not(.fixed-link)")
        if (turboLink && (turboLink.href.includes("%22+in") || turboLink.href.includes("*+in"))) {
            turboLink.href = turboLink.href.replace(/(%22|\*)\+in\+(.*)&/, `$1+in+"${instance}"&`)
            turboLink.classList?.add("fixed-link")
        }
    }

    if (location.pathname.match(/reports\/key_lengths$/)) {
        document.querySelectorAll(".dt-body[data-col='1']").forEach(i => {
            if (i.querySelector(".overpass-link")) return
            const overpassLink = document.createElement("a")
            overpassLink.classList.add("overpass-link")
            overpassLink.textContent = "🔍"
            overpassLink.target = "_blank"
            const count = parseInt(i.nextElementSibling.querySelector(".value").textContent.replace(/\s/g, ''))
            const key = i.querySelector(".empty") ? "" : i.querySelector("a").textContent
            overpassLink.href = "https://overpass-turbo.eu/?" + (count > 100000
                ? new URLSearchParams({
                        w: instance ? `"${key}"=* in "${instance}"` : `"${key}"=*`
                    }
                ).toString()
                : new URLSearchParams({
                    w: instance ? `"${key}"=* in "${instance}"` : `"${key}"=* global`,
                    R: ""
                }).toString())
            i.prepend(document.createTextNode("\xA0"))
            i.prepend(overpassLink)
        })
    } else if (location.pathname.match(/relations\//)) {
        if (location.hash !== "#roles") {
            return
        }
        if (!document.querySelector(".value")) {
            console.log("Table not loaded")
            return
        }
        document.querySelectorAll("#roles .dt-body[data-col='0']").forEach(i => {
            if (i.querySelector(".overpass-link")) return
            const overpassLink = document.createElement("a")
            overpassLink.classList.add("overpass-link")
            overpassLink.textContent = "🔍"
            overpassLink.target = "_blank"
            overpassLink.style.cursor = "progress"
            const role = i.querySelector(".empty") ? "" : i.textContent.replaceAll("␣", " ")
            const type = location.pathname.match(/relations\/(.*$)/)[1]
            const count = parseInt(i.nextElementSibling.querySelector(".value").textContent.replace(/\s/g, ''))
            if (instance) {
                fetchJSONWithCache("https://nominatim.openstreetmap.org/search?" + new URLSearchParams({
                    format: "json",
                    q: instance
                }).toString()).then((r) => {
                    if (r[0]['osm_id']) {
                        const query = `// ${instance}
area(id:${3600000000 + parseInt(r[0]['osm_id'])})->.a;
rel[type=${type}](if:count_by_role("${role}") > 0)(area.a);
out geom;
`;
                        overpassLink.href = "https://overpass-turbo.eu/?" + (count > 1000
                            ? new URLSearchParams({Q: query})
                            : new URLSearchParams({Q: query, R: ""})).toString()
                        overpassLink.style.cursor = "pointer"
                    } else {
                        overpassLink.remove()
                    }
                })
            } else {
                const query = `rel[type=${type}](if:count_by_role("${role}") > 0)${count > 1000 ? "({{bbox}})" : ""};\nout geom;`
                overpassLink.href = "https://overpass-turbo.eu/?" + (count > 1000
                    ? new URLSearchParams({Q: query})
                    : new URLSearchParams({Q: query, R: ""})).toString()
                overpassLink.style.cursor = "pointer"
            }
            i.prepend(document.createTextNode("\xA0"))
            i.prepend(overpassLink)
        })
    }
}


let trackMetadata = null;

/**
 * @param {string} xml
 */
function displayGPXTrack(xml) {
    const diffParser = new DOMParser();
    const doc = diffParser.parseFromString(xml, "application/xml");

    const popup = document.createElement("span")

    const name = doc.querySelector("gpx name")?.textContent
    const nameSpan = document.createElement("p")
    nameSpan.textContent = name

    const desc = doc.querySelector("gpx desc")?.textContent
    const descSpan = document.createElement("p")
    descSpan.textContent = desc

    const link = doc.querySelector("gpx link")?.getAttribute("href")
    const linkA = document.createElement("a")
    linkA.href = link
    linkA.textContent = link

    popup.appendChild(nameSpan)
    popup.appendChild(descSpan)
    popup.appendChild(linkA)

    console.time("start gpx track render")
    const min = Math.min;
    const max = Math.max;
    trackMetadata = {
        min_lat: 10000000,
        min_lon: 10000000,
        max_lat: -10000000,
        max_lon: -100000000,
    }
    doc.querySelectorAll("gpx trk").forEach(trk => {
        const nodesList = []
        trk.querySelectorAll("trkseg trkpt").forEach(i => {
            const lat = parseFloat(i.getAttribute("lat"));
            const lon = parseFloat(i.getAttribute("lon"));
            nodesList.push([lat, lon]);

            trackMetadata.min_lat = min(trackMetadata.min_lat, lat);
            trackMetadata.min_lon = min(trackMetadata.min_lon, lon);
            trackMetadata.max_lat = max(trackMetadata.max_lat, lat);
            trackMetadata.max_lon = max(trackMetadata.max_lon, lon);
        });
        displayWay(cloneInto(nodesList, unsafeWindow), false, "rgb(255,0,47)", 5, null, "customObjects", null, popup.outerHTML);
    });
    doc.querySelectorAll("gpx wpt").forEach(wpt => {
        const lat = wpt.getAttribute("lat");
        const lon = wpt.getAttribute("lon");
        showNodeMarker(lat, lon, "rgb(255,0,47)", null, 'customObjects', 3);

        trackMetadata.min_lat = min(trackMetadata.min_lat, lat);
        trackMetadata.min_lon = min(trackMetadata.min_lon, lon);
        trackMetadata.max_lat = max(trackMetadata.max_lat, lat);
        trackMetadata.max_lon = max(trackMetadata.max_lon, lon);
    });
    console.timeEnd("start gpx track render")
}

async function setupDragAndDropViewers() {
    document.querySelector("#map")?.addEventListener("drop", e => {
        if (location.pathname.includes("/directions") || location.pathname.includes("/note/new")) {
            return;
        }
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation();
        e.target.style.cursor = "progress"
        try {
            const mapWidth = getComputedStyle(document.querySelector("#map")).width
            const mapHeight = getComputedStyle(document.querySelector("#map")).height

            GM_addElement(document.head, "style", {
                textContent: `
                    .leaflet-popup-content:has(.geojson-props-table) {
                        overflow: scroll;
                    }
                    
                    .map-img-preview-popup {
                        width: initial;
                    }
                    
                    .leaflet-popup-content:has(.geotagged-img) {
                        max-width: calc(${mapWidth} / 2) !important;
                        min-width: calc(${mapWidth} / 2) !important;
                        max-height: calc(${mapHeight} / 2);
                        min-height: calc(${mapHeight} / 2);
                        width: auto;
                        height: auto;
                        overflow-y: scroll;
                    }
                `,
            });

            [...e.dataTransfer.items].forEach(async (item, _) => {
                if (item.kind === "file") {
                    const file = item.getAsFile();
                    if (file.type.startsWith("image/jpeg")) {
                        const metadata = EXIF.readFromBinaryFile(await file.arrayBuffer())
                        console.log(metadata)
                        console.log(metadata.GPSLatitude, metadata.GPSLongitude)
                        let lat = parseFloat(metadata.GPSLatitude[0]) + parseFloat(metadata.GPSLatitude[1]) / 60 + parseFloat(metadata.GPSLatitude[2]) / 3600;
                        let lon = parseFloat(metadata.GPSLongitude[0]) + parseFloat(metadata.GPSLongitude[1]) / 60 + parseFloat(metadata.GPSLongitude[2]) / 3600;

                        if (metadata.GPSLatitudeRef === "S") {
                            lat = parseFloat(lat) * -1;
                        }

                        if (metadata.GPSLongitudeRef === "W") {
                            lon = parseFloat(lon) * -1;
                        }

                        const marker = getWindow().L.marker(getWindow().L.latLng(lat, lon), intoPage({
                            maxWidth: mapWidth,
                            maxHeight: mapHeight,
                            className: "map-img-preview-popup"
                        }));
                        const img = document.createElement("img")
                        img.classList.add("geotagged-img")
                        img.setAttribute("width", "100%")
                        const fr = new FileReader();
                        fr.onload = function () {
                            img.src = fr.result;
                            marker.bindPopup(img.outerHTML);
                        }
                        fr.readAsDataURL(file);
                        marker.addTo(getMap());
                    } else if (file.type === "application/json" || file.type === "application/geo+json") {
                        const geojson = JSON.parse(await file.text())

                        injectJSIntoPage(`
                        function renderGeoJSON(data) {
                            L.geoJSON(data, {
                                onEachFeature: function (feature, layer) {
                                    if (feature.properties) {
                                        const table = document.createElement("table")
                                        table.style.overflow = "scroll"
                                        table.classList.add("geojson-props-table")
                                        const tbody = document.createElement("tbody")
                                        table.appendChild(tbody)
                                        Object.entries(feature.properties).forEach(([key, value]) => {
                                            if (Array.isArray(value) && value.length === 0) {
                                                value = "[]"
                                            } else if (typeof value === 'object' && Object.entries(value).length === 0) {
                                                value = "{}"
                                            }
                                            const th = document.createElement("th")
                                            th.textContent = key
                                            const td = document.createElement("td")
                                            td.textContent = value

                                            const tr = document.createElement("tr")
                                            tr.appendChild(th)
                                            tr.appendChild(td)
                                            tbody.appendChild(tr)
                                        })
                                        layer.bindPopup(table.outerHTML)
                                    }
                                }
                            }).addTo(map);
                        }
                        `)
                        getWindow().renderGeoJSON(intoPage(geojson))
                    } else if (file.type === "application/gpx+xml") {
                        displayGPXTrack(await file.text())
                    }
                }
            });
        } finally {
            e.target.style.cursor = "grab"
        }


    })
    document.querySelector("#map")?.addEventListener("dragover", e => {
        if (!location.pathname.includes("/directions") && !location.pathname.includes("/note/new")) {
            e.preventDefault()
        }
    })

    if (location.pathname.includes("/traces")) {
        document.querySelectorAll('a[href*="edit?gpx="]').forEach(i => {
            const trackID = i.getAttribute("href").match(/edit\?gpx=(\d+)/)[1]
            const editLink = i.parentElement.parentElement.querySelector('a:not([href*="display-gpx"])')
            const url = new URL(editLink.href);
            url.search += "&display-gpx=" + trackID
            editLink.href = url.toString()
        })
    } else if (location.search.includes("&display-gpx=")) {
        const trackID = location.search.match(/&display-gpx=(\d+)/)[1]
        const res = await GM.xmlHttpRequest({
            url: `${osm_server.url}/traces/${trackID}/data`,
            responseType: "blob"
        });
        const contentType = res.responseHeaders.split("\r\n").find(i => i.startsWith("content-type:")).split(" ")[1]
        if (contentType === "application/gpx+xml") {
            displayGPXTrack(await res.response.text())
        } else if (contentType === "application/gzip") {
            displayGPXTrack(await (await decompressBlob(res.response)).text());
        }
        if (trackMetadata) {
            fitBounds([
                [trackMetadata.min_lat, trackMetadata.min_lon],
                [trackMetadata.max_lat, trackMetadata.max_lon]
            ])
        }
    }

}


function setup() {
    if (location.href.startsWith("https://osmcha.org")) {
        setTimeout(() => {
            GM_setValue("OSMCHA_TOKEN", localStorage.getItem("token"))
        }, 1000);
        return
    }
    if (location.href.startsWith("https://taginfo.openstreetmap.org")
        || location.href.startsWith("https://taginfo.geofabrik.de")) {
        new MutationObserver(function fn() {
            setTimeout(setupTaginfo, 0);
            return fn
        }()).observe(document, {subtree: true, childList: true});
        return
    }
    if ([prod_server.origin, dev_server.origin, local_server.origin].includes(location.origin)
        && ["/id"].includes(location.pathname) && GM_config.get("DarkModeForID")) {
        GM_addElement(document.head, "style", {
            textContent: "@media (prefers-color-scheme: dark) {\n" + GM_getResourceText("DARK_THEME_FOR_ID_CSS") + "\n}"
        })
        return
    }
    if (GM_config.get("ResetSearchFormFocus")) {
        resetSearchFormFocus();
    }
    if (location.href.startsWith(prod_server.origin)) {
        osm_server = prod_server;
    } else if (location.href.startsWith(dev_server.origin)) {
        osm_server = dev_server;
    } else if (location.href.startsWith(ohm_prod_server.origin)) {
        osm_server = ohm_prod_server
    } else {
        osm_server = local_server;
    }
    let lastPath = "";
    new MutationObserver(function fn() {
        const path = location.pathname;
        if (path + location.search === lastPath) return;
        if (lastPath.includes("/changeset/") && (!path.includes("/changeset/") || lastPath !== path)) {
            try {
                abortDownloadingController.abort() // todo вообще-то опасненько, нет гарантии что ещё не начились новые запросы
                cleanAllObjects()
                getMap().attributionControl.setPrefix("")
                addSwipes();
                document.querySelector("#fixed-rss-feed")?.remove()
            } catch {
            }
        }
        lastPath = path + location.search;
        for (const module of modules.filter(module => GM_config.get(module.name.slice('setup'.length)))) {
            setTimeout(module, 0, path);
        }
        return fn
    }()).observe(document, {subtree: true, childList: true});
    if (location.pathname.includes("/dashboard") || location.pathname.includes("/user/")) {
        setTimeout(loadFriends, 4000);
    }
}

//<editor-fold desc="config" defaultstate="collapsed">
function runSnow() {
    injectJSIntoPage(`
    // This code distributed under MIT license
    // Author: https://github.com/DevBubba/Bookmarklets
    // Code was deminified
    function snow(t) {
        function i() {
            this.D = function () {
                const t = h.atan(this.i / this.d);
                l.save(), l.translate(this.b, this.a), l.rotate(-t), l.scale(this.e, this.e * h.max(1, h.pow(this.j, .7) / 15)), l.drawImage(m, -v / 2, -v / 2), l.restore()
            }
        }

        window;
        const h = Math, r = h.random, a = document, o = Date.now;
        e = (t => {
            l.clearRect(0, 0, _, f), l.fill(), requestAnimationFrame(e);
            const i = .001 * y.et;
            y.r();
            const s = L.et * g;
            for (var n = 0; n < C.length; ++n) {
                const t = C[n];
                t.i = h.sin(s + t.g) * t.h, t.j = h.sqrt(t.i * t.i + t.f), t.a += t.d * i, t.b += t.i * i, t.a > w && (t.a = -u), t.b > b && (t.b = -u), t.b < -u && (t.b = b), t.D()
            }
        }), s = (t => {
            for (var e = 0; e < p; ++e) C[e].a = r() * (f + u), C[e].b = r() * _
        }), n = (t => {
            c.width = _ = innerWidth, c.height = f = innerHeight, w = f + u, b = _ + u, s()
        });

        class d {
            constructor(t, e = !0) {
                this._ts = o(), this._p = !0, this._pa = o(), this.d = t, e && this.s()
            }

            get et() {
                return this.ip ? this._pa - this._ts : o() - this._ts
            }

            get rt() {
                return h.max(0, this.d - this.et)
            }

            get ip() {
                return this._p
            }

            get ic() {
                return this.et >= this.d
            }

            s() {
                return this._ts = o() - this.et, this._p = !1, this
            }

            r() {
                return this._pa = this._ts = o(), this
            }

            p() {
                return this._p = !0, this._pa = o(), this
            }

            st() {
                return this._p = !0, this
            }
        }

        const c = a.createElement("canvas");
        H = c.style, H.position = "fixed", H.left = 0, H.top = 0, H.width = "100vw", H.height = "100vh", H.zIndex = "100000", H.pointerEvents = "none", a.body.insertBefore(c, a.body.children[0]);
        const l = c.getContext("2d"), p = 300, g = 5e-4, u = 20;
        let _ = c.width = innerWidth, f = c.height = innerHeight, w = f + u, b = _ + u;
        const v = 15.2, m = a.createElement("canvas"), E = m.getContext("2d"),
            x = E.createRadialGradient(7.6, 7.6, 0, 7.6, 7.6, 7.6);
        x.addColorStop(0, "hsla(255,255%,255%,1)"), x.addColorStop(1, "hsla(255,255%,255%,0)"), E.fillStyle = x, E.fillRect(0, 0, v, v);
        let y = new d(0, !0), C = [], L = new d(0, !0);
        for (var j = 0; j < p; ++j) {
            const t = new i;
            t.a = r() * (f + u), t.b = r() * _, t.c = 1 * (3 * r() + .8), t.d = .1 * h.pow(t.c, 2.5) * 50 * (2 * r() + 1), t.d = t.d < 65 ? 65 : t.d, t.e = t.c / 7.6, t.f = t.d * t.d, t.g = r() * h.PI / 1.3, t.h = 15 * t.c, t.i = 0, t.j = 0, C.push(t)
        }
        s(), EL = a.addEventListener, EL("visibilitychange", () => setTimeout(n, 100), !1), EL("resize", n, !1), e()
    };snow();`)
}

//</editor-fold>

function main() {
    // GM_config.open();
    'use strict';
    if (location.origin === "https://www.hdyc.neis-one.org" || location.origin === "https://hdyc.neis-one.org") {
        simplifyHDCYIframe();
    } else {
        try {
            GM_registerMenuCommand("Settings", function () {
                if (window.location !== window.parent.location) {
                    return
                }
                GM_config.open();
            });
            if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                GM_registerMenuCommand("Check script updates", function () {
                    window.open("https://raw.githubusercontent.com/deevroman/better-osm-org/master/better-osm-org.user.js", "_blank")
                });
            }
            // New Year Easter egg
            const curDate = new Date()
            if (curDate.getMonth() === 11 && curDate.getDate() >= 18 || curDate.getMonth() === 0 && curDate.getDate() < 10) {
                GM_registerMenuCommand("☃️", runSnow);
            }
            // GM_registerMenuCommand("Ask question on forum", function () {
            //     window.open("https://community.openstreetmap.org/t/better-osm-org-a-script-that-adds-useful-little-things-to-osm-org/121670")
            // });
        } catch (e) {
            console.error(e)
        }
        setup();
    }
}

var map = null
var getMap = null
var getWindow = null

if ([prod_server.origin, dev_server.origin, local_server.origin].includes(location.origin)
    && !["/edit", "/id"].includes(location.pathname)) {
    // This must be done as early as possible in order to pull the map object into the global scope
    // https://github.com/deevroman/better-osm-org/issues/34
    if (navigator.userAgent.includes("Firefox") && GM_info.scriptHandler === "Violentmonkey") {
        function mapHook() {
            console.log("start map intercepting")
            window.wrappedJSObject.L.Map.addInitHook(exportFunction((function () {
                    if (this._container?.id === "map") {
                        window.wrappedJSObject.globalThis.map = this;
                        console.log("map intercepted");
                    }
                }), window.wrappedJSObject)
            )
        }

        window.wrappedJSObject.mapHook = exportFunction(mapHook, window.wrappedJSObject)
        window.wrappedJSObject.mapHook()
        if (window.wrappedJSObject.map instanceof HTMLElement) {
            console.error("Please, reload page, if something doesn't work")
        }
        getMap = () => window.wrappedJSObject.map
        getWindow = () => window.wrappedJSObject
    } else {
        function mapHook() {
            console.log("start map intercepting")
            unsafeWindow.L.Map.addInitHook(exportFunction((function () {
                    if (this._container?.id === "map") {
                        unsafeWindow.map = this;
                        console.log("map intercepted");
                    }
                }), unsafeWindow)
            )
        }

        unsafeWindow.mapHook = exportFunction(mapHook, unsafeWindow)
        unsafeWindow.mapHook()
        if (unsafeWindow.map instanceof HTMLElement) {
            console.error("Please, reload page, if something doesn't work")
        }
        getMap = () => unsafeWindow.map
        getWindow = () => unsafeWindow
    }
    map = getMap()
} else if ([prod_server.origin, dev_server.origin, local_server.origin].includes(location.origin)
    && ["/edit", "/id"].includes(location.pathname) && isDarkMode()) {
    if (location.pathname === "/edit") {
        // document.querySelector("#id-embed").style.visibility = "hidden"
        // window.addEventListener("message", (event) => {
        //     console.log("making iD visible")
        //     if (event.origin !== location.origin)
        //         return;
        //     if (event.data === "kek") {
        //         document.querySelector("#id-embed").style.visibility = "visible"
        //     }
        // });
        GM_addElement(document.head, "style", {
            textContent: `@media (prefers-color-scheme: dark) {
            #id-embed {
                background: #212529 !important;
            }
        }`
        })
    } else {
        GM_addElement(document.head, "style", {
            textContent: `@media (prefers-color-scheme: dark) {
            html {
             background: #212529 !important;
            }
            body {
             background: #212529 !important;
            }
            #id-embed {
                background: #212529 !important;
            }
            #id-container {
                background: #212529 !important;
            }
        }`
        })
        // if (location.pathname === "/id") {
        //     console.log("post")
        //     window.parent.postMessage("kek", location.origin);
        // }
    }
}

init.then(main);

// garbage collection for cached infos (user info, changeset history)
setTimeout(async function () {
    if (Math.random() > 0.5) return
    if (!location.pathname.includes("/history") && !location.pathname.includes("/note")) return
    const lastGC = GM_getValue("last-garbage-collection-time")
    if (lastGC && (new Date(lastGC)).getTime() + 1000 * 60 * 60 * 24 * 2 > Date.now()) return
    GM_setValue("last-garbage-collection-time", Date.now());

    const keys = GM_listValues();
    for (const i of keys) {
        try {
            const userinfo = JSON.parse(GM_getValue(i))
            if (userinfo.cacheTime && (new Date(userinfo.cacheTime)).getTime() + 1000 * 60 * 60 * 24 * 14 < Date.now()) {
                await GM_deleteValue(i);
            }
        } catch (e) {
        }
    }
    console.log("Old cache cleaned")
}, 1000 * 12)
