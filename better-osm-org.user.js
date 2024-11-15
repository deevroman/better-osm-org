// ==UserScript==
// @name            Better osm.org
// @name:ru         Better osm.org
// @version         0.5.2
// @description     Several improvements for advanced users of osm.org
// @description:ru  Скрипт, добавляющий на osm.org полезные картографам функции
// @author       deevroman
// @match        https://www.openstreetmap.org/*
// @exclude      https://www.openstreetmap.org/api*
// @exclude      https://www.openstreetmap.org/diary/new
// @exclude      https://www.openstreetmap.org/message/new/*
// @exclude      https://www.openstreetmap.org/reports/new/*
// @exclude      https://www.openstreetmap.org/profile/edit
// @match        https://master.apis.dev.openstreetmap.org/*
// @exclude      https://master.apis.dev.openstreetmap.org/api/*
// @match        https://taginfo.openstreetmap.org/*
// @match        https://taginfo.geofabrik.de/*
// @match        http://localhost:3000/*
// @exclude      http://localhost:3000/api/*
// @match        https://www.hdyc.neis-one.org/*
// @match        https://hdyc.neis-one.org/*
// @match        https://osmcha.org/*
// @license      WTFPL
// @namespace    https://github.com/deevroman/better-osm-org
// @updateURL    https://github.com/deevroman/better-osm-org/raw/master/better-osm-org.user.js
// @downloadURL  https://github.com/deevroman/better-osm-org/raw/master/better-osm-org.user.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=openstreetmap.org
// @require      https://github.com/deevroman/GM_config/raw/fixed-for-chromium/gm_config.js#sha256=ea04cb4254619543f8bca102756beee3e45e861077a75a5e74d72a5c131c580b
// @require      https://raw.githubusercontent.com/deevroman/osmtags-editor/main/osm-auth.iife.min.js#sha256=dcd67312a2714b7a13afbcc87d2f81ee46af7c3871011427ddba1e56900b4edd
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_listValues
// @grant        GM_deleteValue
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM_getResourceURL
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
// @sandbox      JavaScript
// @resource     OAUTH_HTML https://github.com/deevroman/better-osm-org/raw/master/finish-oauth.html
// @resource     OSMCHA_ICON https://github.com/deevroman/better-osm-org/raw/master/icons/osmcha.ico
// @resource     NODE_ICON https://github.com/deevroman/better-osm-org/raw/master/icons/Osm_element_node.svg
// @resource     WAY_ICON https://github.com/deevroman/better-osm-org/raw/master/icons/Osm_element_way.svg
// @resource     RELATION_ICON https://github.com/deevroman/better-osm-org/raw/master/icons/Taginfo_element_relation.svg
// @resource     OSMCHA_LIKE https://github.com/OSMCha/osmcha-frontend/raw/94f091d01ce5ea2f42eb41e70cdb9f3b2d67db88/src/assets/thumbs-up.svg
// @resource     OSMCHA_DISLIKE https://github.com/OSMCha/osmcha-frontend/raw/94f091d01ce5ea2f42eb41e70cdb9f3b2d67db88/src/assets/thumbs-down.svg
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
/*global GM_registerMenuCommand*/
/*global unsafeWindow*/
/*global exportFunction*/
/*global cloneInto*/
GM_config.init(
    {
        'id': 'Config',
        'title': ' ',
        'fields':
            {
                'OffMapDim': {
                    'label': 'Off map dim in dark mode 🆕',
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
                'ChangesetQuickLook':
                    {
                        'label': 'Add QuickLook for small changesets ',
                        'type': 'checkbox',
                        'default': 'checked',
                        'labelPos': 'right'
                    },
                'ShowChangesetGeometry':
                    {
                        'label': 'Show geometry of objects in changeset β',
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
                'ResolveNotesButtons':
                    {
                        'section': ["Working with notes"],
                        'label': 'Show addition resolve buttons',
                        'type': 'checkbox',
                        'default': 'checked',
                        'labelPos': 'right'
                    },
                'HideNoteHighlight':
                    {
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
                // 'HideLinesForDataView':
                //     {
                //         'label': 'Hide lines in Data View (experimental)',
                //         'type': 'checkbox',
                //         'default': 'unchecked'
                //     },
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
                    'label': 'Add slider for sidebar width',
                    'type': 'checkbox',
                    'default': 'checked',
                    'labelPos': 'right'
                },
                'ClickableAvatar': {
                    'label': 'Click by avatar for open changesets',
                    'type': 'checkbox',
                    'default': 'checked',
                    'labelPos': 'right'
                }
            },
        frameStyle: `
            border: 1px solid #000;
            height: min(85%, 700px);
            width: max(25%, 380px);
            z-index: 9999;
            opacity: 0;
            position: absolute;
            margin-left: auto;
            margin-right: auto;
        `
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

const mainTags = ["shop", "building", "amenity", "man_made", "highway", "natural", "aeroway", "historic", "railway", "tourism", "landuse", "leisure"]

function addRevertButton() {
    if (!location.pathname.includes("/changeset")) return
    if (document.querySelector('#revert_button_class')) return true;
    const sidebar = document.querySelector("#sidebar_content h2");
    if (sidebar) {
        hideSearchForm();
        // sidebar.classList.add("changeset-header")
        let changeset_id = sidebar.innerHTML.match(/(\d+)/)[0];
        sidebar.innerHTML += ` <a href="https://revert.monicz.dev/?changesets=${changeset_id}" target=_blank rel="noreferrer" id=revert_button_class title="Open osm-revert">↩️</a> 
                               <a href="https://osmcha.org/changesets/${changeset_id}" target="_blank" rel="noreferrer"><img src="${GM_info.scriptHandler !== "Violentmonkey" ? GM_getResourceURL("OSMCHA_ICON") : ''}" id="osmcha_link"></a>`;
        // bypass ViolentMonkey bug
        document.querySelector("#osmcha_link").replaceWith(GM_addElement("img", {
            id: "osmcha_link",
            src: GM_getResourceURL("OSMCHA_ICON")
        }))

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
            let a = Array.from(metainfoHTML.children).find(i => i.localName === "a")
            metainfoHTML.innerHTML = ""
            metainfoHTML.appendChild(time)
            metainfoHTML.appendChild(document.createTextNode(" "))
            metainfoHTML.appendChild(a)
            metainfoHTML.appendChild(document.createTextNode(" "))
            getCachedUserInfo(a.textContent).then((res) => {
                a.before(makeBadge(res))
                a.before(document.createTextNode(" "))
            })
        } else {
            let time = Array.from(metainfoHTML.children).find(i => i.localName === "time")
            metainfoHTML.innerHTML = ""
            metainfoHTML.appendChild(time)
            let findBtn = document.createElement("span")
            findBtn.textContent = " 🔍 "
            findBtn.value = changeset_id
            findBtn.datetime = time.dateTime
            findBtn.style.cursor = "pointer"
            findBtn.onclick = findChangesetInDiff
            metainfoHTML.appendChild(findBtn)
        }
        // compact changeset tags
        if (!document.querySelector(".browse-tag-list[compacted]")) {
            document.querySelectorAll(".browse-tag-list tr").forEach(i => {
                const key = i.querySelector("th")
                if (key.textContent === "host") {
                    if (i.querySelector("td").textContent === "https://www.openstreetmap.org/edit") {
                        i.style.display = "none"
                    }
                } else if (key.textContent.startsWith("ideditor:")) {
                    key.title = key.textContent
                    key.textContent = key.textContent.replace("ideditor:", "iD:")
                }
            })
            document.querySelector(".browse-tag-list")?.setAttribute("compacted", "true")
        }

    }
    const textarea = document.querySelector("#sidebar_content textarea");
    if (textarea) {
        textarea.rows = 1;
        let comment = document.querySelector("#sidebar_content button[name=comment]")
        if (comment) {
            comment.hidden = true
            textarea.addEventListener("input", () => {
                    comment.hidden = false
                }
            )
            textarea.addEventListener("click", () => {
                    textarea.rows = textarea.rows + 2
                    comment.hidden = false
                }, {once: true}
            )
            comment.onclick = () => {
                [500, 1000, 2000, 4000].map(i => setTimeout(setupRevertButton, i));
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

        const likeImgRes = GM_getResourceURL("OSMCHA_LIKE")
        const dislikeImgRes = GM_getResourceURL("OSMCHA_DISLIKE")

        const likeBtn = document.createElement("span")
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
        const dislikeImg = document.createElement("img")
        dislikeImg.title = "OSMCha review like"
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
                    username.style.color = "red"
                    dislikeBtn.after(username)
                } else {
                    likeImg.style.filter = ""
                    likeImg.setAttribute("active", "true")
                    username.style.color = "green"
                    likeBtn.after(username)
                }
            } else {
                likeImg.style.filter = "grayscale(1)"
                dislikeImg.style.filter = "grayscale(1)"
                dislikeImg.style.transform = "rotate(180deg)"
                dislikeImg.src = likeImgRes
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

function setupCompactChangesetsHistory() {
    if (!location.pathname.includes("/history") && !location.pathname.includes("/changeset")) {
        return;
    }

    if (location.pathname.includes("/changeset/")) {
        if (document.querySelector("#sidebar_content ul")) {
            document.querySelector("#sidebar_content ul").querySelectorAll("a:not(.page-link)").forEach(i => i.setAttribute("target", "_blank"));
        }
    }

    let styleText = `
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
    /*for id copied*/
    .copied {
      background-color: red;
      transition:all 0.3s;
    }
    .was-copied {
      background-color: none;
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
    `;

    GM_addElement(document.head, "style", {
        textContent: styleText,
    });
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
    }

    handleNewChangesets();
    sidebarObserver?.disconnect();
    sidebarObserver = new MutationObserver(handleNewChangesets);
    if (document.querySelector('#sidebar_content')) {
        sidebarObserver.observe(document.querySelector('#sidebar_content'), {childList: true, subtree: true});
    }
}

function addResolveNotesButtons() {
    if (!location.pathname.includes("/note")) return
    if (document.querySelector('.resolve-note-done')) return true;
    if (document.querySelector('#timeback-btn')) return true;
    blurSearchField();

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
        btn.textContent = " 🕰";
        btn.style.cursor = "pointer"
        document.querySelector("#sidebar_content time").after(btn);
        btn.onclick = () => {
            window.open(`https://overpass-turbo.eu/?Q=${encodeURI(query)}&C=${lat};${lon};${zoom}&R`)
        }
    } catch {
        console.error("setup timeback button fail");
    }

    if (!document.querySelector("#sidebar_content textarea.form-control")) {
        return;
    }
    const auth = makeAuth();
    let note_id = location.pathname.match(/note\/(\d+)/)[1];
    let b = document.createElement("button");
    b.classList.add("resolve-note-done", "btn", "btn-primary");
    b.textContent = "👌";
    document.querySelectorAll("form.mb-3")[0].before(b);
    document.querySelectorAll("form.mb-3")[0].before(document.createElement("p"));
    document.querySelector("form.mb-3 .form-control").rows = 3;
    document.querySelector(".resolve-note-done").onclick = () => {
        auth.xhr({
                method: 'POST',
                path: osm_server.apiBase + 'notes/' + note_id + "/close.json?text=" + encodeURI("👌"),
                prefix: false,
            }, (err) => {
                if (err) {
                    alert(err);
                }
                window.location.reload();
            }
        );
    }
}

function setupResolveNotesButtons(path) {
    if (!path.includes("/note")) return;
    let timerId = setInterval(addResolveNotesButtons, 100);
    setTimeout(() => {
        clearInterval(timerId);
        console.debug('stop try add resolve note button');
    }, 3000);
    addResolveNotesButtons();
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
                }
            });
        });
    });
    tilesObserver = observer;
    observer.observe(document.body, {childList: true, subtree: true});
}

function addSatelliteLayers() {
    if (!navigator.userAgent.includes("Firefox")) return
    if (!location.pathname.includes("/note")) return;
    if (document.querySelector('.turn-on-satellite')) return true;
    if (!document.querySelector("#sidebar_content h4")) {
        return;
    }
    let b = document.createElement("span");
    if (!tilesObserver) {
        b.textContent = "🛰";
    } else {
        b.textContent = invertTilesMode(currentTilesMode);
    }
    b.style.cursor = "pointer";
    b.classList.add("turn-on-satellite");
    document.querySelectorAll("h4")[0].appendChild(document.createTextNode("\xA0"));
    document.querySelectorAll("h4")[0].appendChild(b);

    b.onclick = (e) => {
        switchTiles();
        e.target.textContent = invertTilesMode(currentTilesMode);
    }
}

function setupSatelliteLayers(path) {
    if (!path.includes("/note")) return;
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
        document.querySelector(".compact-toggle-btn").textContent = "<>"
    } else {
        document.querySelectorAll(".hidden-non-modified-tag").forEach((el) => {
            el.classList.replace("hidden-non-modified-tag", "non-modified-tag")
        })
        document.querySelectorAll(".hidden-empty-version").forEach((el) => {
            el.classList.replace("hidden-empty-version", "empty-version")
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
 */
function showWay(nodesList, color = "#000000", needFly = false) {
    layers["customObjects"].forEach(i => i.remove())
    layers["customObjects"] = []
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
    layers[layerName]?.forEach(i => i.remove())
    layers[layerName] = []
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
 * @param {string=} dashArray
 * @param {string} popupContent
 */
function displayWay(nodesList, needFly = false, color = "#000000", width = 4, infoElemID = null, layerName = "customObjects", dashArray = null, popupContent = null) {
    if (!layers[layerName]) {
        layers[layerName] = []
    }

    function bindPopup(line, popup) {
        if (popup) return line.bindPopup(popup)
        return line
    }

    const line = bindPopup(getWindow().L.polyline(
        intoPage(nodesList.map(elem => intoPage(getWindow().L.latLng(intoPage(elem))))),
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
        layers[layerName][layers[layerName].length - 1].on('click', cloneInto(function (e) {
            const elementById = document.getElementById(infoElemID);
            elementById?.scrollIntoView()
            document.querySelectorAll(".map-hover").forEach(el => {
                el.classList.remove("map-hover")
            })
            elementById?.classList.add("map-hover")
        }, getWindow(), {cloneFunctions: true,}))
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
function showNodeMarker(a, b, color = "#006200", infoElemID = null, layerName = 'customObjects', radius = 5) {
    const haloStyle = {
        weight: 2.5,
        radius: radius,
        fillOpacity: 0,
        color: color
    };
    layers[layerName].push(getWindow().L.circleMarker(getWindow().L.latLng(a, b), intoPage(haloStyle)).addTo(getMap()));
    if (infoElemID) {
        layers[layerName][layers[layerName].length - 1].on('click', cloneInto(function (e) {
            const elementById = document.getElementById("n" + infoElemID);
            elementById?.scrollIntoView()
            document.querySelectorAll(".map-hover").forEach(el => {
                el.classList.remove("map-hover")
            })
            elementById.classList.add("map-hover")
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
        layers["activeObjects"].forEach((i) => {
            i.remove();
        })
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
 * @param {number=} dashArray
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
        layers["activeObjects"].forEach((i) => {
            i.remove();
        })
    }
    layers["activeObjects"].push(line);
    if (needFly) {
        fitBounds(get4Bounds(line))
    }
    if (infoElemID) {
        layers["activeObjects"][layers["activeObjects"].length - 1].on('click', cloneInto(function (e) {
            const elementById = document.getElementById("w" + infoElemID);
            elementById?.scrollIntoView()
            document.querySelectorAll(".map-hover").forEach(el => {
                el.classList.remove("map-hover")
            })
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
 * @type {Object.<number, Document>}
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
    const parser = new DOMParser();
    changesetsCache[id] = parser.parseFromString(await res.text(), "application/xml");
    nodesWithParentWays[id] = new Set(Array.from(changesetsCache[id].querySelectorAll("way > nd")).map(i => parseInt(i.getAttribute("ref"))))
    nodesWithOldParentWays[id] = new Set(Array.from(changesetsCache[id].querySelectorAll("way:not([version='1']) > nd")).map(i => parseInt(i.getAttribute("ref"))))
    return changesetsCache[id]
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
 * @property {number[]} nodes
 * @property {number} version
 * @property {boolean} visible
 * @property {string} timestamp
 * @property {Object.<string, string>=} tags
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
    if (notCached.length < 2) {
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
        for (let v = 1; v < lastVersion.version; v++) {
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
        history.push(lastVersionsMap[id][0])
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
function filterVersionByTimestamp(history, timestamp, alwaysReturn = false) {
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
    return objectList.map(i => filterVersionByTimestamp(i, timestamp, alwaysReturn))
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
                showWay(cloneInto(nodesList, unsafeWindow), "#000000", needFly)
            }
        }
        if (htmlElem.nodeName === "A") {
            const versionDiv = htmlElem.parentNode.parentNode
            versionDiv.onmouseenter = loadWayVersion
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
        downloadAllVersionsBtn.textContent = "⏬"
        downloadAllVersionsBtn.style.cursor = "pointer"
        downloadAllVersionsBtn.title = "Download all versions"

        downloadAllVersionsBtn.addEventListener("click", async e => {
            downloadAllVersionsBtn.style.cursor = "progress"
            for (const i of document.querySelectorAll(`.way-version-view:not([hidden])`)) {
                await loadWayVersion(i)
            }
            e.target.remove()
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
        return relationsHistories[relationID] = (await res.json()).elements;
    }
}

const overpassCache = {}
const bboxCache = {}

/**
 *
 * @param {number} id
 * @param {string} timestamp
 * @param {boolean=true} cleanPrevObjects=true
 * @param {string=} color=
 * @return {Promise<{}>}
 */
async function loadRelationVersionMembersViaOverpass(id, timestamp, cleanPrevObjects = true, color = "#000000") {
    console.log(id, timestamp)

    async function getRelationViaOverpass(id, timestamp) {
        if (overpassCache[[id, timestamp]]) {
            return overpassCache[[id, timestamp]]
        } else {
            try {
                const res = await fetch("https://overpass-api.de/api/interpreter?" + new URLSearchParams({
                    data: `
                [out:json][date:"${timestamp}"];
                relation(${id});
                //(._;>;);
                out geom;
            `
                }), {signal: abortDownloadingController.signal})
                return overpassCache[[id, timestamp]] = await res.json()
            } catch (e) {
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
    }

    const overpassGeom = await getRelationViaOverpass(id, timestamp)
    if (cleanPrevObjects) {
        cleanCustomObjects()
    }
    cleanObjectsByKey("activeObjects")
    // нужен видимо веш геометрии
    // GC больно
    overpassGeom.elements[0]?.members?.forEach(i => {
        if (i.type === "way") {
            const nodesList = i.geometry.map(p => [p.lat, p.lon])
            displayWay(cloneInto(nodesList, unsafeWindow), false, color, 4, null, "activeObjects")
        } else if (i.type === "node") {
            showNodeMarker(i.lat, i.lon, color, null, "activeObjects")
        } else if (i.type === "relation") {

        }
    })

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
                        const {lat: lat, lon: lon} = filterVersionByTimestamp(n, targetVersion.timestamp)
                        return [lat, lon]
                    })
                    displayWay(cloneInto(nodesList, unsafeWindow))
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
            elem.childNodes[0].textContent = elem.childNodes[0].textContent.match(/(\..*$)/gm)[0].slice(1)
            let target;
            try {
                target = Array.from(data).find(i => i.getAttribute("version") === version)
            } catch {}
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
    hideSearchForm();
    if (!location.pathname.includes("/user/")) {
        let compactToggle = document.createElement("button")
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
    
    @media (prefers-color-scheme: dark) {
        .history-diff-new-tag {
          background: rgba(4, 123, 0, 0.6) !important;
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
        background-color: rgba(244, 244, 244);
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
        background-color: rgba(244, 244, 244);
        content: "Some members were hidden by moderators";
        font-style: italic;
        font-weight: normal;
        font-size: small;
    }

    @media (prefers-color-scheme: dark) {        
        [relation-version].broken-version details:before {
            background-color: rgb(14, 17, 19);
            content: "Some members were hidden by moderators";
            font-style: italic;
            font-weight: normal;
            font-size: small;
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
                td.textContent = v
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
 * @param {T[]} a
 * @param {T[]} b
 * @param {number} one_replace_cost
 * @return {[T, T][]}
 */
function arraysDiff(a, b, one_replace_cost = 2) {
    a = a.map(i => JSON.stringify(i))
    b = b.map(i => JSON.stringify(i))
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
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const del_cost = dp[i - 1][j]
            const ins_cost = dp[i][j - 1]
            const replace_cost = dp[i - 1][j - 1] + (a[i - 1] !== b[j - 1]) * one_replace_cost // replacement is not very desirable
            dp[i][j] = min(min(del_cost, ins_cost) + 1, replace_cost)
        }
    }

    a = a.map(i => JSON.parse(i))
    b = b.map(i => JSON.parse(i))

    const answer = []

    function restore(i, j) {
        if (i === 0 || j === 0) {
            if (i === 0 && j === 0) {
                return;
            } else if (i === 0) {
                answer.push([null, b[j - 1]])
                restore(i, j - 1)
                return;
            } else {
                answer.push([a[i - 1], null])
                restore(i - 1, j)
                return;
            }
        }

        const del_cost = dp[i - 1][j]
        const ins_cost = dp[i][j - 1]
        const replace_cost = dp[i - 1][j - 1] + (JSON.stringify(a[i - 1]) !== JSON.stringify(b[j - 1])) * one_replace_cost
        if (del_cost <= ins_cost && del_cost + 1 <= replace_cost) {
            answer.push([a[i - 1], null])
            restore(i - 1, j)
        } else if (ins_cost <= del_cost && ins_cost + 1 <= replace_cost) {
            answer.push([null, b[j - 1]])
            restore(i, j - 1)
        } else {
            answer.push([a[i - 1], b[j - 1]])
            restore(i - 1, j - 1)
        }
    }

    restore(a.length, b.length);
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
 *
 * @type {{minlon: number,
 * closed_at: string,
 * max_lon: number,
 * maxlon: number,
 * created_at: string,
 * type: string,
 * changes_count: number,
 * tags: {},
 * min_lon: number,
 * uid: number,
 * max_lat: number,
 * maxlat: number,
 * minlat: number,
 * comments_count: number,
 * id: number,
 * min_lat: number,
 * user: string,
 * open: boolean}
 * |null}
 */
let changesetMetadata = null
let startTouch = null;
let touchMove = null;
let touchEnd = null;

function addSwipes() {
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
                        abortDownloadingController.abort()
                        Array.from(navigationLinks).at(-1).click()
                    }
                } else if (diffX < -sidebar.offsetWidth / 3) {
                    const navigationLinks = document.querySelectorAll("div.secondary-actions")[1]?.querySelectorAll("a")
                    if (navigationLinks && navigationLinks[0].href.includes("/changeset/")) {
                        abortDownloadingController.abort()
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

function isDarkMode() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
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
    try {
        if (GM_config.get("ShowChangesetGeometry")) {
            GM_addElement(document.head, "style", {
                textContent: `
            #sidebar_content li.node:hover {
                background-color: rgba(223, 223, 223, 0.6);
            }
            #sidebar_content li.way:hover {
                background-color: rgba(223, 223, 223, 0.6);
            }
            #sidebar_content li.node.map-hover {
                background-color: rgba(223, 223, 223, 0.6);
            }
            #sidebar_content li.way.map-hover {
                background-color: rgba(223, 223, 223, 0.6);
            }
            #sidebar_content li.relation.downloaded:hover {
                background-color: rgba(223, 223, 223, 0.6);
            }
            
            @media (prefers-color-scheme: dark) {            
                #sidebar_content li.node:hover {
                    background-color: rgb(14, 17, 19);
                }
                #sidebar_content li.way:hover {
                    background-color: rgb(14, 17, 19);
                }
                #sidebar_content li.node.map-hover {
                    background-color: rgb(14, 17, 19);
                }
                #sidebar_content li.way.map-hover {
                    background-color: rgb(14, 17, 19);
                }
                #sidebar_content li.relation.downloaded:hover {
                    background-color: rgb(14, 17, 19);
                }
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
            tr.restored-tag::after {
              content: " ♻️";
              position: absolute;
              margin-top: 2px
            }
            tr.removed-tag::after {
              content: " 🗑";
              position: absolute;
              margin-top: 2px
            }
            tr.replaced-tag::after {
              content: " ⇄";
              position: absolute;
            }
            tr.reverted-tag::after {
              content: " ↻";
              position: absolute;
              // margin-top: 2px
            }
            `,
            });
        }
    } catch { /* empty */
    }
    blurSearchField();
    makeTimesSwitchable()
    if (GM_config.get("ResizableSidebar")) {
        document.querySelector("#sidebar").style.resize = "horizontal"
    }
    if (GM_config.get("Swipes")) {
        addSwipes();
    }


    const changesetID = location.pathname.match(/changeset\/(\d+)/)[1]

    async function getHistoryAndVersionByElem(elem) {
        const [, objType, objID, version] = elem.querySelector("a:nth-of-type(2)").href.match(/(node|way|relation)\/(\d+)\/history\/(\d+)$/);
        if (histories[objType][objID]) {
            return [histories[objType][objID], parseInt(version)]
        }
        const res = await fetch(osm_server.apiBase + objType + "/" + objID + "/history.json", {signal: abortDownloadingController.signal});
        return [histories[objType][objID] = (await res.json()).elements, parseInt(version)];
    }

    const emptyVersion = {
        tags: {},
        version: 0,
        lat: null,
        lon: null,
        visible: false
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
        return [prevVersion, targetVersion, lastVersion]
    }

    async function processObjects(objType, uniqTypes) {
        const objCount = document.querySelectorAll(`.list-unstyled li.${objType}:not(.processed-object)`).length
        if (objCount === 0) {
            return;
        }

        /**
         * @param {Element} i
         * @param {NodeVersion|WayVersion|RelationVersion} prevVersion
         * @param {NodeVersion|WayVersion|RelationVersion} targetVersion
         * @param {NodeVersion|WayVersion|RelationVersion} lastVersion
         */
        async function processObject(i, prevVersion, targetVersion, lastVersion) {
            /**
             * @type {[string, string, string, string]}
             */
            const m = i.querySelector("a:nth-of-type(2)").href.match(/(node|way|relation)\/(\d+)\/history\/(\d+)$/);
            const [, , objID, strVersion] = m
            const version = parseInt(strVersion)
            //<editor-fold desc="tags diff">
            const tagsTable = document.createElement("table")
            tagsTable.classList.add("quick-look")
            const tbody = document.createElement("tbody")
            tagsTable.appendChild(tbody)

            function makeTagRow(key, value) {
                const tagRow = document.createElement("tr")
                const tagTh = document.createElement("th")
                const tagTd = document.createElement("td")
                tagRow.appendChild(tagTh)
                tagRow.appendChild(tagTd)
                tagTh.textContent = key
                tagTd.textContent = value
                return tagRow
            }

            let tagsWasChanged = false;
            // tags deletion
            if (prevVersion.version !== 0) {
                for (const [key, value] of Object.entries(prevVersion?.tags ?? {})) {
                    if (targetVersion.tags === undefined || targetVersion.tags[key] === undefined) {
                        const row = makeTagRow(key, value)
                        if (isDarkMode()) {
                            row.style.background = "rgba(238,51,9,0.4)"
                        } else {
                            row.style.background = "rgba(238,51,9,0.6)"
                        }
                        tbody.appendChild(row)
                        tagsWasChanged = true
                        if (lastVersion.tags && lastVersion.tags[key] === prevVersion.tags[key]) {
                            row.classList.add("restored-tag")
                            row.title = row.title + "The tag is now restored"
                        }
                    }
                }
            }
            // tags add/modification
            for (const [key, value] of Object.entries(targetVersion.tags ?? {})) {
                const row = makeTagRow(key, value)
                if (prevVersion.tags === undefined || prevVersion.tags[key] === undefined) {
                    tagsWasChanged = true
                    if (isDarkMode()) {
                        row.style.background = "rgba(17,238,9,0.3)"
                    } else {
                        row.style.background = "rgba(17,238,9,0.6)"
                    }
                    if (!lastVersion.tags || lastVersion.tags[key] !== targetVersion.tags[key]) {
                        if (lastVersion.tags && lastVersion.tags[key]) {
                            row.classList.add("replaced-tag")
                            row.title = `Now is ${key}=${lastVersion.tags[key]}`
                        } else if (lastVersion.visible !== false) {
                            row.classList.add("removed-tag")
                            row.title = `The tag is now deleted`
                        }
                    }
                } else if (prevVersion.tags[key] !== value) {
                    // todo reverted changes
                    const valCell = row.querySelector("td")
                    valCell.style.background = "rgba(223,238,9,0.6)"
                    if (isDarkMode()) {
                        valCell.style.color = "black"
                    }
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
                } else {
                    row.classList.add("non-modified-tag-in-quick-view")
                    if (!tagsOfObjectsVisible) {
                        row.setAttribute("hidden", "true")
                    }
                }
                tbody.appendChild(row)
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
                            const version = filterVersionByTimestamp(await getNodeHistory(left), targetTimestamp)
                            showActiveNodeMarker(version.lat.toString(), version.lon.toString(), "#ff00e3")
                        }
                        tagTd.onclick = async e => {
                            e.stopPropagation() // fixme
                            const targetTimestamp = (new Date(new Date(changesetMetadata.created_at).getTime() - 1)).toISOString()
                            const version = filterVersionByTimestamp(await getNodeHistory(left), targetTimestamp)
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
                            const version = filterVersionByTimestamp(await getNodeHistory(right), changesetMetadata.closed_at ?? new Date().toISOString())
                            showActiveNodeMarker(version.lat.toString(), version.lon.toString(), "#ff00e3")
                        }
                        tagTd2.onclick = async e => {
                            e.stopPropagation() // fixme
                            e.target.classList.add("way-version-node")
                            const version = filterVersionByTimestamp(await getNodeHistory(right), changesetMetadata.closed_at ?? new Date().toISOString())
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
                    tbodyForTags.appendChild(makeTagRow(k, v))
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
            if (prevVersion.visible === false && targetVersion?.visible !== false && targetVersion.version !== 1) {
                let restoredElemFlag = document.createElement("span")
                restoredElemFlag.textContent = " ♻️"
                restoredElemFlag.title = "Object was restored"
                restoredElemFlag.style.userSelect = "none"
                i.appendChild(restoredElemFlag)
            }
            if (prevVersion?.members && JSON.stringify(prevVersion.members) !== JSON.stringify(targetVersion.members)) {
                let memChangedFlag = document.createElement("span")
                memChangedFlag.textContent = " 👥"
                memChangedFlag.title = "List of relation members has been changed.\nСlick to see more details"
                memChangedFlag.style.userSelect = "none"
                memChangedFlag.style.background = "rgba(223,238,9,0.6)"
                memChangedFlag.style.cursor = "pointer"


                const membersTable = document.createElement("table")
                membersTable.classList.add("relation-members-table")
                membersTable.style.display = "none"
                const tbody = document.createElement("tbody")
                membersTable.style.borderWidth = "2px"
                tbody.style.borderWidth = "2px"
                membersTable.appendChild(tbody)


                const nodeIcon = GM_getResourceURL("NODE_ICON")
                const wayIcon = GM_getResourceURL("WAY_ICON")
                const relationIcon = GM_getResourceURL("RELATION_ICON")

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
                    tagTd.textContent = `${left?.ref ?? ""} ${left?.role ?? ""}`
                    if (left && typeof left === "object") {
                        const icon = document.createElement("img")
                        icon.src = getIcon(left)
                        icon.style.height = "1em"
                        icon.style.marginLeft = "1px"
                        icon.style.marginTop = "-3px"
                        tagTd.appendChild(icon)
                    }
                    tagTd2.textContent = `${right?.ref ?? ""} ${right?.role ?? ""}`
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
                                const version = filterVersionByTimestamp(await getNodeHistory(left.ref), targetTimestamp)
                                showActiveNodeMarker(version.lat.toString(), version.lon.toString(), "#ff00e3")
                            } else if (left.type === "way") {

                                // todo
                            }
                        }

                        tagTd.onmouseleave = e => {
                            e.target.classList.remove("relation-version-node")
                        }
                        tagTd.onclick = async e => {
                            e.stopPropagation()
                            if (left.type === "node") {
                                const targetTimestamp = (new Date(new Date(changesetMetadata.created_at).getTime() - 1)).toISOString()
                                const version = filterVersionByTimestamp(await getNodeHistory(left.ref), targetTimestamp)
                                panTo(version.lat.toString(), version.lon.toString())
                            }
                        }
                    }

                    if (right && typeof right === "object") {
                        tagTd2.onmouseenter = async e => {
                            e.stopPropagation() // fixme
                            e.target.classList.add("relation-version-node")
                            const targetTimestamp = (new Date(changesetMetadata.closed_at ?? new Date())).toISOString()
                            if (right.type === "node") {
                                const version = filterVersionByTimestamp(await getNodeHistory(right.ref), targetTimestamp)
                                showActiveNodeMarker(version.lat.toString(), version.lon.toString(), "#ff00e3")
                            } else {
                                // todo
                            }
                        }
                        tagTd2.onmouseleave = e => {
                            e.target.classList.remove("relation-version-node")
                        }
                        tagTd2.onclick = async e => {
                            e.stopPropagation()
                            if (right.type === "node") {
                                const targetTimestamp = (new Date(changesetMetadata.closed_at ?? new Date())).toISOString()
                                const version = filterVersionByTimestamp(await getNodeHistory(right.ref), targetTimestamp)
                                panTo(version.lat.toString(), version.lon.toString())
                            }
                        }
                    }

                    return row
                }

                let haveOnlyInsertion = true
                let haveOnlyDeletion = true
                if (JSON.stringify(prevVersion.members.toReversed()) === JSON.stringify(targetVersion.members)) {
                    // members reversed
                    const row = makeRelationDiffRow("", "🔃")
                    row.querySelectorAll("td").forEach(i => i.style.textAlign = "center")
                    row.querySelector("td:nth-of-type(2)").title = "Members of the relation were reversed"
                    tbody.appendChild(row)

                    prevVersion.members.forEach((i, index) => {
                        const row = makeRelationDiffRow(i, targetVersion.members[index])
                        row.querySelector("td:nth-of-type(2)").style.background = "rgba(223,238,9,0.6)"
                        row.style.fontFamily = "monospace"
                        tbody.appendChild(row)
                    })
                    haveOnlyInsertion = false
                    haveOnlyDeletion = false
                } else {
                    arraysDiff(prevVersion.members ?? [], targetVersion.members ?? []).forEach(i => {
                        const row = makeRelationDiffRow(i[0], i[1])
                        if (i[0] === null) {
                            row.style.background = "rgba(17,238,9,0.6)"
                            haveOnlyDeletion = false
                        } else if (i[1] === null) {
                            row.style.background = "rgba(238,51,9,0.6)"
                            haveOnlyInsertion = false
                        } else if (JSON.stringify(i[0]) !== JSON.stringify(i[1])) {
                            row.style.background = "rgba(223,238,9,0.6)"
                            haveOnlyInsertion = false
                            haveOnlyDeletion = false
                        }
                        row.style.fontFamily = "monospace"
                        tbody.appendChild(row)
                    })
                }

                if (haveOnlyInsertion) {
                    if (isDarkMode()) {
                        memChangedFlag.style.background = "rgba(17, 238, 9, 0.3)"
                    } else {
                        memChangedFlag.style.background = "rgba(101,238,9,0.6)"
                    }
                } else if (haveOnlyDeletion) {
                    if (isDarkMode()) {
                        memChangedFlag.style.background = "rgba(238, 51, 9, 0.4)"
                    } else {
                        memChangedFlag.style.background = "rgba(238, 9, 9, 0.42)"
                    }
                }

                const tagsTable = document.createElement("table")
                tagsTable.style.display = "none"
                const tbodyForTags = document.createElement("tbody")
                tagsTable.appendChild(tbodyForTags)

                Object.entries(targetVersion.tags ?? {}).forEach(([k, v]) => {
                    tbodyForTags.appendChild(makeTagRow(k, v))
                })

                memChangedFlag.onclick = e => {
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
                memChangedFlag.after(membersTable)
                memChangedFlag.after(tagsTable)
            }
            if (targetVersion.lat && prevVersion.lat && (prevVersion.lat !== targetVersion.lat || prevVersion.lon !== targetVersion.lon)) {
                i.classList.add("location-modified")
                let memChangedFlag = document.createElement("span")
                const distInMeters = getDistanceFromLatLonInKm(
                    prevVersion.lat,
                    prevVersion.lon,
                    targetVersion.lat,
                    targetVersion.lon,
                ) * 1000;
                memChangedFlag.textContent = ` 📍${distInMeters.toFixed(1)}m`
                memChangedFlag.title = "Coordinates of node has been changed"
                memChangedFlag.classList.add("location-modified-marker")
                memChangedFlag.style.userSelect = "none"
                if (isDarkMode()) {
                    memChangedFlag.style.background = "rgba(223, 238, 9, 0.6)"
                    memChangedFlag.style.color = "black"
                } else {
                    memChangedFlag.style.background = "rgba(223,238,9,0.6)"
                }
                i.appendChild(memChangedFlag)
                memChangedFlag.onmouseover = e => {
                    e.stopPropagation()
                    showActiveNodeMarker(targetVersion.lat.toString(), targetVersion.lon.toString(), "#ff00e3")
                    showActiveNodeMarker(prevVersion.lat.toString(), prevVersion.lon.toString(), "#0022ff", false)
                }
            }
            if (targetVersion.visible === false) {
                i.classList.add("removed-object")
            }
            if (targetVersion.version !== lastVersion.version && lastVersion.visible === false) {
                i.appendChild(document.createTextNode(['ru-RU', 'ru'].includes(navigator.language) ? " ⓘ Объект уже удалён" : " ⓘ The object is now deleted"))
            }
            if (targetVersion.visible === false && lastVersion.visible !== false) {
                i.appendChild(document.createTextNode(['ru-RU', 'ru'].includes(navigator.language) ? " ⓘ Объект сейчас восстановлен" : " ⓘ The object is now restored"))
            }
            if (tagsWasChanged) {
                i.appendChild(tagsTable)
            } else {
                i.classList.add("tags-non-modified")
            }
            //</editor-fold>
            i.classList.add("tags-processed-object")
        }

        const needFetch = []


        if (objType === "relation" && objCount >= 2) {
            for (let i of document.querySelectorAll(`.list-unstyled li.${objType}:not(.processed-object)`)) {
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
                for (let i of document.querySelectorAll(`.list-unstyled li.${objType}:not(.processed-object)`)) {
                    await processObject(i, ...getPrevTargetLastVersions(...await getHistoryAndVersionByElem(i)))
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
                for (let i of document.querySelectorAll(`.list-unstyled li.${objType}:not(.processed-object)`)) {
                    const [, , objID, strVersion] = i.querySelector("a:nth-of-type(2)").href.match(/(node|way|relation)\/(\d+)\/history\/(\d+)$/);
                    const version = parseInt(strVersion)
                    await processObject(i, ...getPrevTargetLastVersions(Object.values(objectsVersions[objID]), version))
                }
            }
        } else {
            await Promise.all(Array.from(document.querySelectorAll(`.list-unstyled li.${objType}:not(.processed-object)`)).map(async function (i) {
                await processObject(i, ...getPrevTargetLastVersions(...await getHistoryAndVersionByElem(i)))
            }))
        }

        // reorder non-interesting-objects
        Array.from(document.querySelectorAll(`.list-unstyled li.${objType}.tags-non-modified`)).forEach(i => {
            document.querySelector(`.list-unstyled li.${objType}`).parentElement.appendChild(i)
        })
        Array.from(document.querySelectorAll(`.list-unstyled li.${objType}.tags-non-modified:not(.location-modified)`)).forEach(i => {
            document.querySelector(`.list-unstyled li.${objType}`).parentElement.appendChild(i)
        })


        //<editor-fold desc="setup compact mode toggles">
        let compactToggle = document.createElement("button")
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
                } else {
                    i.setAttribute("hidden", "true")
                }
            });
        }
        const objectListSection = document.querySelector(`.list-unstyled li.${objType}`).parentElement.parentElement.querySelector("h4")
        if (!objectListSection.querySelector(".quick-look-compact-toggle-btn")) {
            objectListSection.appendChild(compactToggle)
        }
        compactToggle.before(document.createTextNode("\xA0"))
        if (uniqTypes === 1 && document.querySelectorAll(`.list-unstyled li.${objType} .non-modified-tag-in-quick-view`).length < 5) {
            compactToggle.style.display = "none"
            document.querySelectorAll(".non-modified-tag-in-quick-view").forEach(i => {
                i.removeAttribute("hidden")
            });
        }
        //</editor-fold>
    }

    async function processObjectsInteractions(objType, uniqTypes) {
        const objCount = document.querySelectorAll(`.list-unstyled li.${objType}:not(.processed-object)`).length
        if (objCount === 0) {
            return;
        }

        /**
         * @param {Element} i
         * @param {NodeVersion|WayVersion|RelationVersion} prevVersion
         * @param {NodeVersion|WayVersion|RelationVersion} targetVersion
         * @param {NodeVersion|WayVersion|RelationVersion} lastVersion
         */
        async function processObjectInteractions(i, prevVersion, targetVersion, lastVersion) {
            if (!GM_config.get("ShowChangesetGeometry")) {
                i.classList.add("processed-object")
                return
            }
            /**
             * @type {[string, string, string, string]}
             */
            const m = i.querySelector("a:nth-of-type(2)").href.match(/(node|way|relation)\/(\d+)\/history\/(\d+)$/);
            const [, , objID, strVersion] = m
            if (objID === "1317609767") debugger
            const version = parseInt(strVersion)
            i.ondblclick = () => {
                if (changesetMetadata) {
                    fitBounds([
                        [changesetMetadata.min_lat, changesetMetadata.min_lon],
                        [changesetMetadata.max_lat, changesetMetadata.max_lon]
                    ])
                }
            }
            if (objType === "node") {
                i.id = "n" + objID
                i.onmouseenter = () => {
                    if (targetVersion.visible === false) {
                        if (prevVersion.visible !== false) {
                            showActiveNodeMarker(prevVersion.lat.toString(), prevVersion.lon.toString(), "#0022ff")
                        }
                    } else {
                        showActiveNodeMarker(targetVersion.lat.toString(), targetVersion.lon.toString(), "#ff00e3")
                    }
                    document.querySelectorAll(".map-hover").forEach(el => {
                        el.classList.remove("map-hover")
                    })
                }
                i.onclick = () => {
                    if (targetVersion.visible === false) {
                        panTo(prevVersion.lat.toString(), prevVersion.lon.toString(), 18, false)
                    } else {
                        panTo(targetVersion.lat.toString(), targetVersion.lon.toString(), 18, false)
                    }
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
                        showNodeMarker(targetVersion.lat.toString(), targetVersion.lon.toString(), "#006200", targetVersion.id)
                    }
                } else if (prevVersion?.visible === false && targetVersion?.visible !== false) {
                    showNodeMarker(targetVersion.lat.toString(), targetVersion.lon.toString(), "rgba(89,170,9,0.6)", targetVersion.id, 'customObjects', 2)
                } else {
                    showNodeMarker(targetVersion.lat.toString(), targetVersion.lon.toString(), "rgb(255,245,41)", targetVersion.id)
                }
            } else if (objType === "way") {
                i.id = "w" + objID

                const res = await fetch(osm_server.apiBase + objType + "/" + objID + "/full.json", {signal: abortDownloadingController.signal});
                if (!res.ok) {
                    setTimeout(async () => {
                        if (changesetMetadata === null) {
                            await new Promise(r => setTimeout(r, 1000));
                        }
                        const versionForLoad = targetVersion.visible === false ? prevVersion.version : targetVersion.version;
                        if (versionForLoad === 0 && targetVersion.visible === false) {
                            return;
                        }
                        let lineWidth = 4
                        const [, nodesHistory] = await loadWayVersionNodes(objID, versionForLoad);
                        const targetTimestamp = (new Date(new Date(changesetMetadata.created_at).getTime() - 1)).toISOString()
                        const nodesList = filterObjectListByTimestamp(nodesHistory, targetTimestamp, true)
                        if (targetVersion.visible === false) {
                            const closedTime = (new Date(changesetMetadata.closed_at ?? new Date())).toISOString()
                            const nodesAfterChangeset = filterObjectListByTimestamp(nodesHistory, closedTime)
                            if (nodesAfterChangeset.some(i => i.visible === false)) {
                                displayWay(cloneInto(nodesList, unsafeWindow), false, "#ff0000", 3, "w" + objID)
                            } else {
                                const layer = displayWay(cloneInto(nodesList, unsafeWindow), false, "#ff0000", 7, "w" + objID)
                                layer.bringToBack()
                                lineWidth = 8
                            }
                        } else {
                            if (targetVersion.version === 1) {
                                displayWay(cloneInto(nodesList, unsafeWindow), false, "rgba(0,128,0,0.6)", 3, "w" + objID, "customObjects", "4, 4")
                            } else {
                                if (prevVersion.visible === false) {
                                    displayWay(cloneInto(nodesList, unsafeWindow), false, "rgb(255,245,41)", 3, "w" + objID, "customObjects", "4, 4")
                                } else {
                                    displayWay(cloneInto(nodesList, unsafeWindow), false, "rgb(0,0,0)", 3, "w" + objID, "customObjects", "4, 4")
                                }
                            }
                        }
                        i.onmouseenter = () => {
                            showActiveWay(cloneInto(nodesList, unsafeWindow), "#ff00e3", false, objID, true, lineWidth)
                        }
                        i.onclick = () => {
                            showActiveWay(cloneInto(nodesList, unsafeWindow), "#ff00e3", true, objID, true, lineWidth)
                        }
                    }, 10);
                    i.classList.add("processed-object")
                    return
                }
                const lastElements = (await res.json()).elements
                lastElements.forEach(n => {
                    if (n.type !== "node") return
                    if (n.version === 1) {
                        nodesHistories[n.id] = [n]
                    }
                })


                const [, wayNodesHistories] = await loadWayVersionNodes(objID, version)
                const targetNodes = filterObjectListByTimestamp(wayNodesHistories, targetVersion.timestamp)

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


                i.onclick = async () => {
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
                        const prevVersion = filterVersionByTimestamp(await getWayHistory(objID), targetTimestamp);
                        if (prevVersion) {
                            const [, nodesHistory] = await loadWayVersionNodes(objID, prevVersion.version);
                            const nodesList = filterObjectListByTimestamp(nodesHistory, targetTimestamp)
                            showActiveWay(cloneInto(nodesList, unsafeWindow), "rgb(238,146,9)", currentNodesList.length === 0, objID, false, 4, "4, 4")
                        }
                        showActiveWay(cloneInto(currentNodesList, unsafeWindow), "#ff00e3", false, objID, false)
                    }
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
                            displayWay(cloneInto(nodesList, unsafeWindow), false, "#ff0000", 3, "w" + objID)
                        } else {
                            const layer = displayWay(cloneInto(nodesList, unsafeWindow), false, "#ff0000", 7, "w" + objID)
                            layer.bringToBack()
                        }
                    }
                } else if (version === 1 && targetVersion.changeset === parseInt(changesetID)) {
                    displayWay(cloneInto(currentNodesList, unsafeWindow), false, "rgba(0,128,0,0.6)", 4, "w" + objID)
                } else if (prevVersion?.visible === false) {
                    displayWay(cloneInto(currentNodesList, unsafeWindow), false, "rgba(120,238,9,0.6)", 4, "w" + objID)
                } else {
                    displayWay(cloneInto(currentNodesList, unsafeWindow), false, "#373737", 4, "w" + objID)
                }
                i.onmouseenter = async () => {
                    showActiveWay(cloneInto(currentNodesList, unsafeWindow))
                    document.querySelectorAll(".map-hover").forEach(el => {
                        el.classList.remove("map-hover")
                    })
                    if (version > 1) {
                        // show prev version
                        const [, nodesHistory] = await loadWayVersionNodes(objID, version - 1);
                        const targetTimestamp = (new Date(new Date(changesetMetadata.created_at).getTime() - 1)).toISOString()
                        const nodesList = filterObjectListByTimestamp(nodesHistory, targetTimestamp)
                        showActiveWay(cloneInto(nodesList, unsafeWindow), "rgb(238,146,9)", false, objID, false, 4, "4, 4")

                        showActiveWay(cloneInto(currentNodesList, unsafeWindow), "#ff00e3", false, objID, false)
                    } else {
                        const targetTimestamp = (new Date(new Date(changesetMetadata.created_at).getTime() - 1)).toISOString()
                        const prevVersion = filterVersionByTimestamp(await getWayHistory(objID), targetTimestamp);
                        if (prevVersion) {
                            const [, nodesHistory] = await loadWayVersionNodes(objID, prevVersion.version);
                            const nodesList = filterObjectListByTimestamp(nodesHistory, targetTimestamp)
                            showActiveWay(cloneInto(nodesList, unsafeWindow), "rgb(238,146,9)", false, objID, false, 4, "4, 4")
                        }
                        showActiveWay(cloneInto(currentNodesList, unsafeWindow), "#ff00e3", false, objID, false)
                    }
                }
            } else if (objType === "relation") {
                const btn = document.createElement("a")
                btn.textContent = "📥"
                btn.classList.add("load-relation-version")
                btn.title = "Download this relation"
                btn.style.cursor = "pointer"
                btn.addEventListener("click", async () => {
                    btn.style.cursor = "progress"
                    let targetTimestamp = (new Date(changesetMetadata.closed_at ?? new Date())).toISOString()
                    if (targetVersion.visible === false) {
                        targetTimestamp = new Date(new Date(changesetMetadata.created_at).getTime() - 1).toISOString();
                    }
                    try {
                        const relationMetadata = await loadRelationVersionMembersViaOverpass(parseInt(objID), targetTimestamp, false, "#ff00e3")
                        i.onclick = () => {
                            fitBounds([
                                [relationMetadata.bbox.min_lat, relationMetadata.bbox.min_lon],
                                [relationMetadata.bbox.max_lat, relationMetadata.bbox.max_lon]
                            ])
                        }
                        i.onmouseenter = async () => {
                            await loadRelationVersionMembersViaOverpass(parseInt(objID), targetTimestamp, false, "#ff00e3")
                        }
                        i.classList.add("downloaded")
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
            i.classList.add("processed-object")
        }

        const needFetch = []

        if (objType === "relation" && objCount >= 2) {
            for (let i of document.querySelectorAll(`.list-unstyled li.${objType}:not(.processed-object)`)) {
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
                for (let i of document.querySelectorAll(`.list-unstyled li.${objType}:not(.processed-object)`)) {
                    await processObjectInteractions(i, ...getPrevTargetLastVersions(...await getHistoryAndVersionByElem(i)))
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
                for (let i of document.querySelectorAll(`.list-unstyled li.${objType}:not(.processed-object)`)) {
                    const [, , objID, strVersion] = i.querySelector("a:nth-of-type(2)").href.match(/(node|way|relation)\/(\d+)\/history\/(\d+)$/);
                    const version = parseInt(strVersion)
                    await processObjectInteractions(i, ...getPrevTargetLastVersions(Object.values(objectsVersions[objID]), version))
                }
            }
        } else {
            await Promise.all(Array.from(document.querySelectorAll(`.list-unstyled li.${objType}:not(.processed-object)`)).map(async function (i) {
                await processObjectInteractions(i, ...getPrevTargetLastVersions(...await getHistoryAndVersionByElem(i)))
            }))
        }

        if (!changesetsCache[changesetID]) {
            await getChangeset(changesetID)
        } else if (objCount >= 20 && uniqTypes !== 1) {
            await new Promise(r => setTimeout(r, 500));
        }

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
        const changesetDataPromise = getChangeset(location.pathname.match(/changeset\/(\d+)/)[1])
        for (const objType of ["way", "node", "relation"]) {
            await processObjectsInteractions(objType, uniqTypes);
        }
        const changesetData = await changesetDataPromise

        function replaceNodes(changesetData) {
            const pagination = Array.from(document.querySelectorAll(".pagination")).find(i => {
                return Array.from(i.querySelectorAll("a.page-link")).some(a => a.href?.includes("node"))
            })
            if (!pagination) return
            const ul = pagination.parentElement.querySelector("ul.list-unstyled")
            const nodes = changesetData.querySelectorAll("node")
            if (nodes.length > 1000) {
                return;
            }
            pagination.remove();
            const summaryHeader = document.querySelector(`.list-unstyled li.node`)
                .parentElement.parentElement.querySelector("h4")
                .firstChild;
            summaryHeader.textContent = summaryHeader.textContent.replace(/\(.*\)/, `(1-${nodes.length})`)

            nodes.forEach(node => {
                if (document.querySelector("#n" + node.id)) {
                    return
                }
                const ulItem = document.createElement("li");
                ulItem.classList.add("node");
                ulItem.id = "n" + node.id

                const nodeLink = document.createElement("a")
                nodeLink.rel = "nofollow"
                nodeLink.href = `/node/${node.id}`
                nodeLink.textContent = node.id
                ulItem.appendChild(nodeLink)

                ulItem.appendChild(document.createTextNode(", "))

                const versionLink = document.createElement("a")
                versionLink.rel = "nofollow"
                versionLink.href = `/node/${node.id}/history/${node.getAttribute("version")}`
                versionLink.textContent = "v" + node.getAttribute("version")
                ulItem.appendChild(versionLink)

                Array.from(node.children).forEach(i => {
                    // todo
                    if (mainTags.includes(i.getAttribute("k"))) {
                        ulItem.classList.add(i.getAttribute("k"))
                        ulItem.classList.add(i.getAttribute("v"))
                    }
                })
                if (node.getAttribute("visible") === "false") {
                    ulItem.innerHTML = "<s>" + ulItem.innerHTML + "</s>"
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
            const summaryHeader = document.querySelector(`.list-unstyled li.way`)
                .parentElement.parentElement.querySelector("h4")
                .firstChild;
            summaryHeader.textContent = summaryHeader.textContent.replace(/\(.*\)/, `(1-${ways.length})`)
            ways.forEach(way => {
                if (document.querySelector("#w" + way.id)) {
                    return
                }
                const ulItem = document.createElement("li");
                ulItem.classList.add("way");
                ulItem.id = "w" + way.id

                const nodeLink = document.createElement("a")
                nodeLink.rel = "nofollow"
                nodeLink.href = `/way/${way.id}`
                nodeLink.textContent = way.id
                ulItem.appendChild(nodeLink)

                ulItem.appendChild(document.createTextNode(", "))

                const versionLink = document.createElement("a")
                versionLink.rel = "nofollow"
                versionLink.href = `/way/${way.id}/history/${way.getAttribute("version")}`
                versionLink.textContent = "v" + way.getAttribute("version")
                ulItem.appendChild(versionLink)

                Array.from(way.children).forEach(i => {
                    // todo
                    if (["shop", "building", "amenity", "man_made", "highway", "natural"].includes(i.getAttribute("k"))) {
                        ulItem.classList.add(i.getAttribute("k"))
                        ulItem.classList.add(i.getAttribute("v"))
                    }
                })
                if (way.getAttribute("visible") === "false") {
                    ulItem.innerHTML = "<s>" + ulItem.innerHTML + "</s>"
                }
                ul.appendChild(ulItem)
            })
        }

        replaceWays(changesetData)
        await processObjects("way", uniqTypes);
        await processObjectsInteractions("way", uniqTypes);

        replaceNodes(changesetData)
        await processObjects("node", uniqTypes);
        await processObjectsInteractions("node", uniqTypes);

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
                await processObjectsInteractions(objType, uniqTypes);
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
            if (!rawRes.ok) {
                console.warn(`fetching parent ways for ${nodeID} failed)`)
                console.trace()
                return []
            }
            return (await rawRes.json()).elements;

        }

        async function findParents() {
            const nodesCount = changesetData.querySelectorAll(`node`)
            changesetData.querySelectorAll(`node[version="1"]`).forEach(i => {
                const nodeID = i.getAttribute("id")
                if (!i.querySelector("tag")) {
                    if (i.getAttribute("visible") === "false") {
                        // todo
                    } else if (i.getAttribute("version") === "1" && !nodesWithParentWays[parseInt(changesetID)].has(parseInt(nodeID))) {
                        showNodeMarker(i.getAttribute("lat"), i.getAttribute("lon"), "#006200", nodeID)
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
                                const targetVersion = filterVersionByTimestamp(await getWayHistory(way.id), changesetMetadata.closed_at);
                                if (targetVersion === null) {
                                    return
                                }
                                const [, wayNodesHistories] = await loadWayVersionNodes(objID, targetVersion.version)
                                const targetNodes = filterObjectListByTimestamp(wayNodesHistories, changesetMetadata.closed_at)

                                const nodesMap = {}
                                targetNodes.forEach(elem => {
                                    nodesMap[elem.id] = [elem.lat, elem.lon]
                                })

                                let currentNodesList = []
                                targetVersion.nodes.forEach(node => {
                                    if (node in nodesMap) {
                                        currentNodesList.push(nodesMap[node])
                                    } else {
                                        console.error(objID, node)
                                        console.trace()
                                    }
                                })

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

                                displayWay(cloneInto(currentNodesList, unsafeWindow), false, "rgba(55,55,55,0.5)", 4, "n" + nodeID, "customObjects", null, popup.outerHTML)

                                way.nodes.forEach(n => {
                                    if (!document.querySelector("#n" + n)) return
                                    document.querySelector("#n" + n).addEventListener('mouseenter', async () => {
                                        showActiveWay(cloneInto(currentNodesList, unsafeWindow))
                                        document.querySelectorAll(".map-hover").forEach(el => {
                                            el.classList.remove("map-hover")
                                        })
                                        const targetTimestamp = (new Date(new Date(changesetMetadata.created_at).getTime() - 1)).toISOString()
                                        if (targetVersion.version > 1) {
                                            // show prev version
                                            const prevVersion = filterVersionByTimestamp(await getWayHistory(way.id), targetTimestamp);
                                            const [, nodesHistory] = await loadWayVersionNodes(objID, prevVersion.version);
                                            const nodesList = filterObjectListByTimestamp(nodesHistory, targetTimestamp)
                                            showActiveWay(cloneInto(nodesList, unsafeWindow), "rgb(238,146,9)", false, objID, false, 4, "4, 4")

                                            // showActiveWay(cloneInto(currentNodesList, unsafeWindow), "rgba(55,55,55,0.5)", false, objID, false)
                                        } else {
                                            const prevVersion = filterVersionByTimestamp(await getWayHistory(way.id), targetTimestamp);
                                            if (prevVersion) {
                                                const [, nodesHistory] = await loadWayVersionNodes(objID, prevVersion.version);
                                                const nodesList = filterObjectListByTimestamp(nodesHistory, targetTimestamp)
                                                showActiveWay(cloneInto(nodesList, unsafeWindow), "rgb(238,146,9)", false, objID, false, 4, "4, 4")

                                                // showActiveWay(cloneInto(currentNodesList, unsafeWindow), "rgba(55,55,55,0.5)", false, objID, false)
                                            }
                                        }
                                        // if (targetVersion.version > 1) {
                                        //     const prevVersion = filterVersionByTimestamp(await getNodeHistory(n), targetTimestamp)
                                        //     showActiveNodeMarker(prevVersion.lat.toString(), prevVersion.lon.toString(), "#0022ff", false)
                                        // }
                                        const curVersion = filterVersionByTimestamp(await getNodeHistory(n), changesetMetadata.closed_at ?? new Date())
                                        showActiveNodeMarker(curVersion.lat.toString(), curVersion.lon.toString(), "#ff00e3", false)
                                    })
                                })
                            }
                        )
                    )
                }
            };
            const nodesWithModifiedLocation = Array.from(document.querySelectorAll(".node.location-modified")).map(i => parseInt(i.id.slice(1)))
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
        }
    } finally {
        injectingStarted = false
        console.timeEnd("QuickLook")
        console.log("%cSetup QuickLook finished", 'background: #222; color: #bada55')
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

let unDimmed = false;

function setupOffMapDim(){
    if (!GM_config.get("OffMapDim") || GM_config.get("DarkModeForMap") || unDimmed) {
        return;
    }
    GM_addElement(document.head, "style", {
        textContent: `
            @media (prefers-color-scheme: dark) {
              .leaflet-tile-container, .mapkey-table-entry td:first-child > * {
                filter: none !important;
              }
            }
        `,
    });
    unDimmed = true
}

let darkModeForMap = false;

function setupDarkModeForMap(){
    if (!GM_config.get("DarkModeForMap") || darkModeForMap) {
        return;
    }
    GM_addElement(document.head, "style", {
        textContent: `
            @media (prefers-color-scheme: dark) {
              .leaflet-tile-container, .mapkey-table-entry td:first-child > * {
                filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
              }
              .leaflet-tile-container * {
                filter: none;
              }
            }
        `,
    });
    darkModeForMap = true
}

async function setupHDYCInProfile(path) {
    let match = path.match(/^\/user\/([^/]+)$/);
    if (!match) {
        return;
    }
    const user = match[1];
    if (user === "forgot-password" || user === "new") return;
    document.querySelector(".content-body > .content-inner").style.paddingBottom = "0px";
    GM_addElement(document.querySelector("#content"), "iframe", {
        src: "https://www.hdyc.neis-one.org/?" + user,
        width: "100%",
        height: "2500px",
        id: "hdyc-iframe",
        scrolling: "no",
    });
    if (document.querySelector('a[href$="/blocks"]')?.nextElementSibling?.textContent > 0) {
        document.querySelector('a[href$="/blocks"]').nextElementSibling.style.background = "rgba(255, 0, 0, 0.3)"
    }
}

function simplifyHDCYIframe() {
    if (window.location === window.parent.location) {
        return
    }
    if (isDarkMode()) {
        GM_addElement(document.head, "style", {
            textContent: `
                body {
                    background-color: rgb(49, 54, 59);
                    color: lightgray;
                }
                
                #mapwrapper {
                    filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) brightness(0.7);
                }
                
                #activitymap {
                    filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) brightness(0.7);
                }
                
                .leaflet-popup-content {
                    filter: brightness(0.7);
                }
            `,
        });
        document.querySelectorAll("a").forEach(i => {
            if (i.style.color === "black") {
                i.style.color = "lightgray";
            }
        })
        document.querySelectorAll("td").forEach(i => {
            if (i.style.color === "purple") {
                i.style.color = "orchid";
            }
        })
    }
    document.querySelector("html").style.overflowX = "scroll"
    document.querySelector("body").style.overflowX = "scroll"
    const loginLink = document.getElementById("loginLink")
    if (loginLink) {
        let warn = document.createElement("div")
        warn.id = "hdyc-warn"
        if (navigator.userAgent.includes("Firefox")) {
            warn.textContent = "Please disable tracking protection so that the HDYC account login works"

            document.getElementById("authenticate").before(warn)
            let hdycLink = document.createElement("a")
            hdycLink.href = "https://www.hdyc.neis-one.org/"
            hdycLink.textContent = "Go to https://www.hdyc.neis-one.org/"
            hdycLink.target = "_blank"
            document.getElementById("authenticate").before(document.createElement("br"))
            document.getElementById("authenticate").before(hdycLink)
            document.getElementById("authenticate").remove()
        } else {
            warn.innerHTML = `To see more than just public profiles, do the following:<br/>
1. <a href="https://www.hdyc.neis-one.org/"> Log in to HDYC</a> <br/>
2. Open the browser console (F12) <br/>
3. Open the Application tab <br/>
4. In the left panel, select <i>Storage</i>→<i>Cookies</i>→<i>https://www.hdyc.neis-one.org</i><br/>
5. Click on the cell with the name <i>SameSite</i> and type <i>None</i> in it`
            GM_addElement(document.head, "style", {
                textContent: `
                    #hdyc-warn {
                        text-align: left !important;
                        width: 50%;
                        position: relative;
                        left: 35%;
                        right: 33%;
                    }
                `,
            });
            document.getElementById("authenticate").before(warn)
            const img_help = document.createElement("img")
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
}

//<editor-fold desc="/history, /user/*/history">
async function updateUserInfo(username) {
    const rawRes = await fetch(osm_server.apiBase + "changesets.json?" + new URLSearchParams({
        display_name: username,
        limit: 1
    }).toString());
    const res = await rawRes.json()
    const uid = res['changesets'][0]['uid']

    const rawRes2 = await fetch(osm_server.apiBase + "user/" + uid + ".json");
    const res2 = await rawRes2.json()
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
        window.location = "https://revert.monicz.dev/?changesets=" + ids
    }
    const revertViaJOSMButton = document.createElement("button")
    revertViaJOSMButton.textContent = "↩️ via JOSM"
    revertViaJOSMButton.onclick = () => {
        const ids = Array.from(document.querySelectorAll(".mass-action-checkbox:checked")).map(i => i.value).join(",")
        window.location = "http://127.0.0.1:8111/revert_changeset?id=" + ids
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
    const username = location.pathname.match(/\/user\/(.*)\/history$/)[1]
    const osmchaFilter = {"users": [{"label": username, "value": username}]}
    const osmchaLink = document.createElement("a");
    osmchaLink.href = "https://osmcha.org?" + new URLSearchParams({filters: JSON.stringify(osmchaFilter)}).toString()
    osmchaLink.target = "_blank"
    osmchaLink.rel = "noreferrer"

    const osmchaIcon = document.createElement("img")
    osmchaIcon.src = GM_getResourceURL("OSMCHA_ICON")
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
        if (massModeActive && (!e.metaKey && !e.ctrlKey)) {
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
    if (location.pathname === "/history"
        && document.querySelector("#sidebar_content h2")
        && !document.querySelector("#changesets-filter-btn")) {
        const a = document.createElement("a")
        a.textContent = " 🔎"
        a.style.cursor = "pointer"
        a.id = "changesets-filter-btn"
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
        if (massModeForUserChangesetsActive && location.pathname !== "/history") {
            document.querySelectorAll(".changesets li").forEach(addChangesetCheckbox)
            makeBottomActionBar()
        }
        if (massModeActive && location.pathname === "/history") {
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
            if (location.pathname.match(/^\/history\/?$/)) {
                getCachedUserInfo(item.previousSibling.previousSibling.textContent).then((res) => {
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
    if (location.pathname !== "/history"
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


async function loadChangesetMetadata() {
    const match = location.pathname.match(/changeset\/(\d+)/)
    if (!match) {
        return;
    }
    const changeset_id = parseInt(match[1]);
    if (changesetMetadata !== null && changesetMetadata.id === changeset_id) {
        return;
    }
    const res = await fetch(osm_server.apiBase + "changeset" + "/" + changeset_id + ".json",
        // {signal: abortDownloadingController.signal}
    );
    const jsonRes = await res.json();
    if (res.status === 509) {
        console.error("oops, DOS block")
    } else {
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
        console.error("oops, DOS block")
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
        console.error("oops, DOS block")
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
        console.error("oops, DOS block")
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
        console.error("oops, DOS block")
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
        if (!(document.activeElement?.name !== "query" && !["TEXTAREA", "INPUT"].includes(document.activeElement?.nodeName))) {
            return;
        }
        if (e.metaKey || e.ctrlKey) {
            return;
        }
        if (e.code === "KeyN") { // notes
            Array.from(document.querySelectorAll(".overlay-layers label"))[0].click()
        } else if (e.code === "KeyD") { // map data
            Array.from(document.querySelectorAll(".overlay-layers label"))[1].click()
        } else if (e.code === "KeyG") { // gps tracks
            Array.from(document.querySelectorAll(".overlay-layers label"))[2].click()
        } else if (e.code === "KeyS") { // satellite
            if (e.shiftKey) {
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
                return
            } else {
                switchTiles()
                if (document.querySelector(".turn-on-satellite")) {
                    document.querySelector(".turn-on-satellite").textContent = invertTilesMode(currentTilesMode)
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
                getMap()?.invalidateSize()
                if (changesetMetadata) {
                    fitBounds([
                        [changesetMetadata.min_lat, changesetMetadata.min_lon],
                        [changesetMetadata.max_lat, changesetMetadata.max_lon]
                    ])
                } else {
                    console.warn("Changeset metadata not downloaded")
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
                    if (noteMetadata) {
                        panTo(noteMetadata.geometry.coordinates[1], noteMetadata.geometry.coordinates[0], Math.max(17, getMap().getZoom()))
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
                getMap().setZoom(getMap().getZoom() - 2)
            }
        } else if (e.code === "Equal") {
            if (document.activeElement?.id !== "map") {
                getMap().setZoom(getMap().getZoom() + 2)
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
        } else {
            // console.log(e.key, e.code)
        }
        if (location.pathname.includes("/changeset")) {
            if (e.altKey || ["Comma", "Period"].includes(e.code)) {
                if (e.code === "ArrowLeft" || e.code === "Comma") {
                    const navigationLinks = document.querySelectorAll("div.secondary-actions")[1]?.querySelectorAll("a")
                    if (navigationLinks && navigationLinks[0].href.includes("/changeset/")) {
                        abortDownloadingController.abort()
                        navigationLinks[0].click()
                    }
                } else if (e.code === "ArrowRight" || e.code === "Period") {
                    const navigationLinks = document.querySelectorAll("div.secondary-actions")[1]?.querySelectorAll("a")
                    if (navigationLinks && Array.from(navigationLinks).at(-1).href.includes("/changeset/")) {
                        abortDownloadingController.abort()
                        Array.from(navigationLinks).at(-1).click()
                    }
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
                        document.querySelectorAll(".map-hover").forEach(el => {
                            el.classList.remove("map-hover")
                        })
                        cur.previousElementSibling.classList.add("map-hover")
                    } else {
                        if (cur.classList.contains("node")) {
                            cur.classList.remove("active-object")
                            document.querySelector("ul.list-unstyled li.way:last-of-type").classList.add("active-object")
                            document.querySelector("ul .active-object").click()
                            document.querySelector("ul .active-object").classList.add("map-hover")

                            document.querySelectorAll(".map-hover").forEach(el => {
                                el.classList.remove("map-hover")
                            })
                            document.querySelector("ul .active-object").classList.add("map-hover")
                        }
                    }
                }
            } else if (e.code === "KeyL") {
                if (!document.querySelector("ul .active-object")) {
                    document.querySelector("ul.list-unstyled li.node,.way,.relation").classList.add("active-object")
                    document.querySelector("ul .active-object").click()
                    document.querySelectorAll(".map-hover").forEach(el => {
                        el.classList.remove("map-hover")
                    })
                    document.querySelector("ul .active-object").classList.add("map-hover")
                } else {
                    const cur = document.querySelector("ul .active-object")
                    if (cur.nextElementSibling) {
                        cur.nextElementSibling.classList.add("active-object")
                        cur.classList.remove("active-object")
                        cur.nextElementSibling.click()
                        cur.nextElementSibling.scrollIntoView()
                        document.querySelectorAll(".map-hover").forEach(el => {
                            el.classList.remove("map-hover")
                        })
                        cur.nextElementSibling.classList.add("map-hover")
                    } else {
                        if (cur.classList.contains("way")) {
                            cur.classList.remove("active-object")
                            document.querySelector("ul.list-unstyled li.node").classList.add("active-object")
                            document.querySelector("ul .active-object").click()

                            document.querySelectorAll(".map-hover").forEach(el => {
                                el.classList.remove("map-hover")
                            })
                            document.querySelector("ul .active-object").classList.add("map-hover")
                        }
                    }
                }
            }
        } else if (location.pathname.match(/^\/(node|way|relation)\/\d+/)) {
            if (e.altKey || ["Comma", "Period"].includes(e.code)) {
                if (e.code === "ArrowLeft" || e.code === "Comma") {
                    const navigationLinks = document.querySelectorAll("div.secondary-actions")[1]?.querySelectorAll("a")
                    if (navigationLinks && navigationLinks[0].href.includes("/history/")) {
                        if (location.pathname.includes("history")) {
                            navigationLinks[0].click()
                        } else {
                            Array.from(navigationLinks).at(-1).click()
                        }
                    }
                } else if (e.code === "ArrowRight" || e.code === "Period") {
                    const navigationLinks = document.querySelectorAll("div.secondary-actions")[1]?.querySelectorAll("a")
                    if (navigationLinks && Array.from(navigationLinks).at(-1).href.includes("/history/")) {
                        Array.from(navigationLinks).at(-1).click()
                    }
                }
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

const modules = [
    setupOffMapDim,
    setupDarkModeForMap,
    setupHDYCInProfile,
    setupCompactChangesetsHistory,
    setupMassChangesetsActions,
    setupRevertButton,
    setupResolveNotesButtons,
    setupDeletor,
    setupHideNoteHighlight,
    setupSatelliteLayers,
    setupVersionsDiff,
    setupChangesetQuickLook,
    setupNewEditorsLinks,
    setupNavigationViaHotkeys,
    setupRelationVersionViewer,
    setupClickableAvatar
];

function setupTaginfo() {
    if (location.pathname.match(/reports\/key_lengths$/)) {
        const instance = document.querySelector("#instance").textContent
        document.querySelectorAll(".dt-body[data-col='1']").forEach(i => {
            if (i.querySelector(".overpass-link")) return
            const overpassLink = document.createElement("a")
            overpassLink.classList.add("overpass-link")
            overpassLink.textContent = "🔍"
            overpassLink.target = "_blank"
            const key = i.querySelector("a").textContent
            overpassLink.href = "https://overpass-turbo.eu/?" + new URLSearchParams({
                w: `"${key}"=* in "${instance}"`,
                R: ""
            }).toString()
            i.prepend(document.createTextNode("\xA0"))
            i.prepend(overpassLink)
        })
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
                abortDownloadingController.abort()
                cleanAllObjects()
                getMap().attributionControl.setPrefix("")
                addSwipes();
            } catch (e) {
            }
        }
        lastPath = path + location.search;
        for (const module of modules.filter(module => GM_config.get(module.name.slice('setup'.length)))) {
            setTimeout(module, 0, path);
        }
        return fn
    }()).observe(document, {subtree: true, childList: true});
}

function main() {
    'use strict';
    if (location.origin === "https://www.hdyc.neis-one.org" || location.origin === "https://hdyc.neis-one.org") {
        simplifyHDCYIframe();
    } else {
        try {
            GM_registerMenuCommand("Settings", function () {
                GM_config.open();
            });
        } catch { /* empty */
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
}

init.then(main);

// garbage collection for cached infos (user info, changeset history)
setTimeout(async function () {
    if (Math.random() > 0.5) return
    if (!location.pathname.includes("/history")) return
    const lastGC = new Date(GM_getValue("last-garbage-collection-time", Date.now()))
    if (lastGC.getTime() + 1000 * 60 * 60 * 24 * 2 > Date.now()) return
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
}, 1000 * 42)
