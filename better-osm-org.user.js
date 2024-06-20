// ==UserScript==
// @name         Better osm.org
// @version      0.3.5
// @description  Several improvements for advanced users of osm.org
// @author       deevroman
// @match        https://www.openstreetmap.org/*
// @exclude      https://www.openstreetmap.org/api*
// @match        https://master.apis.dev.openstreetmap.org/*
// @exclude      https://master.apis.dev.openstreetmap.org/api/*
// @match        https://osmcha.org/*
// @match        http://localhost:3000/*
// @exclude      http://localhost:3000//api/*
// @match        https://www.hdyc.neis-one.org/*
// @match        https://hdyc.neis-one.org/*
// @license      WTFPL
// @namespace    https://github.com/deevroman/better-osm-org
// @updateURL    https://github.com/deevroman/better-osm-org/raw/master/better-osm-org.user.js
// @downloadURL  https://github.com/deevroman/better-osm-org/raw/master/better-osm-org.user.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=openstreetmap.org
// @grant        GM_registerMenuCommand
// @require      https://github.com/deevroman/GM_config/raw/fixed-for-chromium/gm_config.js
// @require      https://raw.githubusercontent.com/Zverik/osmtags-editor/main/osm-auth.iife.min.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM_getResourceURL
// @grant        GM_addElement
// @grant        GM.xmlHttpRequest
// @connect      planet.openstreetmap.org
// @connect      planet.maps.mail.ru
// @connect      www.hdyc.neis-one.org
// @connect      hdyc.neis-one.org
// @connect      resultmaps.neis-one.org
// @connect      www.openstreetmap.org
// @sandbox      JavaScript
// @resource     OAUTH_HTML https://github.com/deevroman/better-osm-org/raw/master/finish-oauth.html
// ==/UserScript==
/*global osmAuth*/
/*global GM*/
/*global GM_config*/
/*global GM_addElement*/
/*global GM_getResourceURL*/
/*global unsafeWindow*/
/*global exportFunction*/
GM_config.init(
    {
        'id': 'Config',
        'title': ' ',
        'fields':
            {
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
                        'label': 'Revert changeset button',
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
                        'label': 'Add hotkeys for navigation (Alt + ←/→ for user changesets)',
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
            },
        frameStyle: `
            border: 1px solid #000;
            height: min(75%, 500px);
            width: max(25%, 400px);
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

function addRevertButton() {
    if (!location.pathname.includes("/changeset")) return
    if (document.querySelector('.revert_button_class')) return true;

    let sidebar = document.querySelector("#sidebar_content h2");
    if (sidebar) {
        // sidebar.classList.add("changeset-header")
        let changeset_id = sidebar.innerHTML.match(/(\d+)/)[0];
        sidebar.innerHTML += ` <a href="https://revert.monicz.dev/?changesets=${changeset_id}" target=_blank class=revert_button_class>↩️</a>`;
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
        } else {
            let time = Array.from(metainfoHTML.children).find(i => i.localName === "time")
            metainfoHTML.innerHTML = ""
            metainfoHTML.appendChild(time)
            let findBtn = document.createElement("a")
            findBtn.textContent = " 🔍 "
            findBtn.value = changeset_id
            findBtn.datetime = time.dateTime
            findBtn.classList.add("find-deleted-user-btn")
            findBtn.onclick = findChangesetInDiff
            metainfoHTML.appendChild(findBtn)
        }
    }
    let textarea = document.querySelector("#sidebar_content textarea")
    if (textarea) {
        textarea.rows = 2;
        let comment = document.querySelector("#sidebar_content button[name=comment]")
        if (comment) {
            comment.hidden = true
            textarea.addEventListener("input", () => {
                    comment.hidden = false
                }
            )
        }
    }
    let tagsHeader = document.querySelector("#sidebar_content h4");
    if (tagsHeader) {
        tagsHeader.remove()
    }
}

function setupRevertButton(path) {
    if (!path.includes("/changeset")) return;
    let timerId = setInterval(addRevertButton, 100);
    setTimeout(() => {
        clearInterval(timerId);
        console.debug('stop try add revert button');
    }, 3000);
    addRevertButton();
}

let sidebarObserver = null;

function setupCompactChangesetsHistory() {
    if (!location.pathname.includes("/history") && !location.pathname.includes("/changeset")) {
        return;
    }

    let styleText = `
    .changesets p {
      margin-bottom: 0;
      font-weight: 788;
    }
    /*@document regexp(".*!history") {*/
        .map-layout #sidebar {
          width: 450px;
        }
    /*}
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
    `;

    GM_addElement(document.head, "style", {
        textContent: styleText,
    });

    function handleNewChangesets() {
        // remove useless
        document.querySelectorAll("#sidebar .changesets .col").forEach((e) => {
            e.childNodes[0].textContent = ""
        })
        // document.querySelector(".search_forms").remove() // make custom search via changesets
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

    try {
        // timeback button
        let timestamp = document.querySelector("#sidebar_content time").dateTime;
        let timeSource = "note creation date"
        const mapsmeDate = document.querySelector(".overflow-hidden p")?.textContent?.match(/OSM data version: (\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z)/);
        if (mapsmeDate) {
            timestamp = mapsmeDate[1];
            timeSource = "MAPS.ME snapshot date"
        }
        const organicmapsDate = document.querySelector(".overflow-hidden p")?.textContent?.match(/OSM snapshot date: (\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z)/);
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
    link.before(document.createTextNode("\xA0"));

    function deleteObject(e) {
        e.preventDefault();
        link.classList.add("dbclicked");
        const changesetTags = {
            'created_by': 'better osm.org',
            'comment': 'Delete ' + object_type + " " + object_id
        };
        let changesetPayload = document.implementation.createDocument(null, 'osm');
        let cs = changesetPayload.createElement('changeset');
        changesetPayload.documentElement.appendChild(cs);
        tagsToXml(changesetPayload, cs, changesetTags);
        const chPayloadStr = new XMLSerializer().serializeToString(changesetPayload);

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

const OSMPrefix = "https://tile.openstreetmap.org/"
const ESRIPrefix = "https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/"
// const ESRIPrefix = "https://clarity.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/"
let SAT_MODE = "🛰"
let MAPNIK_MODE = "🗺️"
let mode = SAT_MODE;
let tilesObserver = undefined;

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
        b.textContent = (mode === SAT_MODE) ? MAPNIK_MODE : SAT_MODE;
    }
    b.style.cursor = "pointer";
    b.classList.add("turn-on-satellite");
    document.querySelectorAll("h4")[0].appendChild(document.createTextNode("\xA0"));
    document.querySelectorAll("h4")[0].appendChild(b);

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
        let match = url.match(new RegExp(`${ESRIPrefix}(\\d+)\\/(\\d+)\\/(\\d+)`))
        if (!match) {
            return false
        }
        return {
            x: match[3],
            y: match[2],
            z: match[1],
        }
    }

    function switchTiles(e) {
        if (tilesObserver) {
            tilesObserver.disconnect();
        }
        mode = e.target.textContent;
        document.querySelectorAll(".leaflet-tile").forEach(i => {
            if (i.nodeName !== 'IMG') {
                return;
            }
            if (mode === "🛰") {
                let xyz = parseOSMTileURL(i.src)
                if (!xyz) return
                i.src = ESRIPrefix + xyz.z + "/" + xyz.y + "/" + xyz.x;
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
                    if (mode === "🛰") {
                        let xyz = parseOSMTileURL(node.src);
                        if (!xyz) return
                        node.src = ESRIPrefix + xyz.z + "/" + xyz.y + "/" + xyz.x;
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
        if (e.target.textContent === "🛰") {
            e.target.textContent = "🗺️"
        } else {
            e.target.textContent = "🛰"
        }
    }

    b.onclick = switchTiles;
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

async function tryFindChangesetInDiffGZ(gzURL, changesetId) {
    async function decompressBlob(blob) {
        let ds = new DecompressionStream("gzip");
        let decompressedStream = blob.stream().pipeThrough(ds);
        return await new Response(decompressedStream).blob();
    }

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

function copyAnimation(e, text) {
    console.log(`Copying ${text} to clipboard was successful!`);
    e.target.classList.add("copied");
    setTimeout(() => {
        e.target.classList.remove("copied");
        e.target.classList.add("was-copied");
        setTimeout(() => e.target.classList.remove("was-copied"), 300);
    }, 300);
}

// tests
// https://osm.org/way/488322838/history
// https://osm.org/way/74034517/history
// https://osm.org/relation/17425783/history
// https://osm.org/way/554280669/history
// https://osm.org/node/4122049406 (/replication/changesets/005/638/ contains .tmp files)
// https://osm.org/node/2/history (very hard)
async function findChangesetInDiff(e) {
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

    let foundedChangeset = await checkAAA(AAAs[0], targetTime, targetChangesetID);
    if (!foundedChangeset) {
        foundedChangeset = await checkAAA(AAAs[1], targetTime, targetChangesetID);
    }
    if (!foundedChangeset) {
        alert(":(")
        return
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
    e.target.remove()
}

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
}


// hard cases:
// https://www.openstreetmap.org/node/1/history
// https://www.openstreetmap.org/node/2/history
// https://www.openstreetmap.org/node/9286365017/history
// https://www.openstreetmap.org/relation/72639/history
// https://www.openstreetmap.org/node/10173297169/history
// https://www.openstreetmap.org/relation/16022751/history
function addDiffInHistory() {
    addHistoryLink();
    if (!location.pathname.includes("/history")
        || location.pathname === "/history"
        || location.pathname.includes("/history/")
        || location.pathname.includes("/user/")
    ) return;
    if (document.querySelector(".compact-toggle-btn")) {
        return;
    }
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
    
    .find-deleted-user-btn {
        cursor: pointer !important;
    }
    
    .copied {
      background-color: red !important;
      transition:all 0.3s;
    }
    .was-copied {
      background-color: none !important;
      transition:all 0.3s;
    }
    
    `;
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

        let metainfoHTML = ver.querySelector('ul:nth-child(3) > li:nth-child(1)');

        let changesetHTML = ver.querySelector('ul:nth-child(3) > li:nth-child(2)');
        let changesetA = ver.querySelector('ul:nth-child(3) > li:nth-child(2) > a');
        const changesetID = changesetA.textContent

        let time = Array.from(metainfoHTML.children).find(i => i.localName === "time")
        if (Array.from(metainfoHTML.children).some(e => e.localName === "a")) {
            let a = Array.from(metainfoHTML.children).find(i => i.localName === "a")
            metainfoHTML.innerHTML = ""
            metainfoHTML.appendChild(time)
            metainfoHTML.appendChild(document.createTextNode(" "))
            metainfoHTML.appendChild(a)
            metainfoHTML.appendChild(document.createTextNode(" "))
        } else {
            metainfoHTML.innerHTML = ""
            metainfoHTML.appendChild(time)
            let findBtn = document.createElement("a")
            findBtn.textContent = " 🔍 "
            findBtn.value = changesetID
            findBtn.datetime = time.dateTime
            findBtn.classList.add("find-deleted-user-btn")
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
                let locationHTML = ver.querySelector('ul:nth-child(3) > li:nth-child(3)');
                let locationA = ver.querySelector('ul:nth-child(3) > li:nth-child(3) > a');
                locationHTML.innerHTML = ''
                locationHTML.appendChild(locationA)
            } else {
                visible = false
                wasModifiedObject = true // because sometimes deleted object has tags
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
        let lastCoordinates = versions.slice(-1)[0].coordinates
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
                coordinates.after(distTxt);
                coordinates.after(document.createTextNode(" "));
            }
            wasModifiedObject = true
        }
        let childNodes = null
        if (location.pathname.includes("/way") || location.pathname.includes("/relation")) {
            childNodes = Array.from(ver.querySelectorAll("details ul.list-unstyled li")).map((el) => el.textContent)
            let lastChildNodes = versions.slice(-1)[0].nodes
            if (version > 1 &&
                (childNodes.length !== lastChildNodes.length
                    || childNodes.some((el, index) => lastChildNodes[index] !== childNodes[index]))) {
                ver.querySelector("details > summary")?.classList.add("history-diff-modified-tag")
                wasModifiedObject = true
            }
            ver.querySelector("details")?.removeAttribute("open")
        }
        versions.push({
            tags: tags,
            coordinates: coordinates?.href ?? lastCoordinates,
            wasModified: wasModifiedObject,
            nodes: childNodes,
            members: [],
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
                x.querySelector("tbody").prepend(tr)
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
            x.replaceWith(spoiler)
        }
    })
    Array.from(document.getElementsByClassName("browse-section browse-redacted")).forEach(
        (elem) => {
            elem.classList.add("hidden-version")
        }
    )
    makeHistoryCompact();
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

/*
let HIDE_WAYS = true

function addHideLinesForDataView() {
    if (!location.hash.includes("D")) {
        return;
    }
    let g = document.querySelector("g");
    if (g && HIDE_WAYS) {
        document.querySelector("g").querySelectorAll("path:not([fill-rule=evenodd])").forEach(i => {
            i.remove()
        })
        let obs = new MutationObserver(() => {
            document.querySelector("g").querySelectorAll("path:not([fill-rule=evenodd])").forEach(i => {
                i.remove()
            })
        })
        obs.observe(g, {subtree: true, childList: true})
    }
}
*/
/*
function setupHideLinesForDataView(path) {
    if (!location.hash.includes("D")) {
        return;
    }
    let timerId = setInterval(addHideLinesForDataView, 500);
    setTimeout(() => {
        clearInterval(timerId);
        console.debug('stop try hide lines for data view');
    }, 5000);
    addHideLinesForDataView();
}

function setupChangesetQuickLook(path) {

}
 */

const rapidLink = "https://mapwith.ai/rapid#background=fb-mapwithai-maxar&disable_features=boundaries&map="
let coordinatesObserver = null;

function setupNewEditorsLinks() {
    const firstRun = document.getElementsByClassName("custom_editors").length === 0
    let editorsList = document.querySelector("#edit_tab ul");
    if (!editorsList) {
        return;
    }
    const curURL = editorsList.querySelector("li a").href
    const match = curURL.match(/map=(\d+)\/([\d.]+)\/([\d.]+)(&|$)/)
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
}

async function simplifyHDCYIframe() {
    if (window.location === window.parent.location) {
        return
    }
    const loginLink = document.getElementById("loginLink")
    if (loginLink) {
        let warn = document.createElement("b")
        warn.textContent = "Please disable tracking protection so that the HDYC account login works"
        document.getElementById("authenticate").before(warn)
        let hdycLink = document.createElement("a")
        hdycLink.href = "https://www.hdyc.neis-one.org/"
        hdycLink.textContent = "Go to https://www.hdyc.neis-one.org/"
        hdycLink.target = "_blank"
        document.getElementById("authenticate").before(document.createElement("br"))
        document.getElementById("authenticate").before(hdycLink)
        document.getElementById("authenticate").remove()
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

let sidebarObserverForMassActions = null;
let massModeForUserChangesetsActive = null;
let massModeActive = null;
let currentMassDownloadedPages = null;
let needClearLoadMoreRequest = false;
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
    actionsBar.appendChild(copyIds)
    actionsBar.appendChild(document.createTextNode("\xA0"))
    actionsBar.appendChild(revertButton)
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
    document.querySelector("#sidebar_content h2").appendChild(a)
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
        const changesetComment = i.querySelector("a:nth-child(1) span").textContent
        const changesetAuthor = i.querySelector("a:nth-child(2)").textContent
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
    }
}

function updateMap() {
    // debugger
    needClearLoadMoreRequest = true
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
        }
    }
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
                hideBigChangesetsCheckbox.checked = true
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
                    updateMap()
                }
                filterBar.appendChild(hideBigChangesetsCheckbox)
                filterBar.appendChild(hideBigChangesetLabel)
                filterBar.appendChild(document.createElement("br"))


                const label = document.createElement("span")
                label.textContent = "🔄Hide changesets from "
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
                filterByUsersInput.id = "filter-by-user-input"
                filterByUsersInput.style.width = "250px"
                filterByUsersInput.style.marginBottom = "3px"
                filterByUsersInput.addEventListener("keypress", function (event) {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        filterChangesets();
                        updateMap()
                    }
                });
                filterBar.appendChild(filterByUsersInput)

                const label2 = document.createElement("span")
                label2.textContent = "🔄Hide changesets with "
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
                    }
                });
                filterBar.appendChild(filterByCommentInput)

                return filterBar
            }

            needPatchLoadMoreRequest = true
            if (massModeActive === null) {
                massModeActive = true
                document.querySelector("#sidebar_content > div").after(makeTopFilterBar())
                document.querySelectorAll("ol li a:nth-child(2)").forEach(makeUsernamesFilterable)
            } else {
                massModeActive = !massModeActive
                document.querySelectorAll(".filter-bar").forEach(i => i.toggleAttribute("hidden"))
                document.querySelector("#hidden-changeset-counter")?.toggleAttribute("hidden")
                // document.querySelectorAll(".mass-action-checkbox").forEach(i => {
                // i.toggleAttribute("hidden")
                // })
            }
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
                    needClearLoadMoreRequest = false
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

// TODO support JOSM reverter after https://josm.openstreetmap.de/ticket/23701
function addMassChangesetsActions() {
    if (!location.pathname.includes("/history")) return;
    if (!document.querySelector("#sidebar_content h2")) return

    addMassActionForUserChangesets();
    addMassActionForGlobalChangesets();

    const MAX_PAGE_FOR_LOAD = 25;
    sidebarObserverForMassActions?.disconnect()

    function observerHandler(mutationsList, observer) {
        // console.log(mutationsList)
        // debugger
        if (!location.pathname.includes("/history")) {
            massModeActive = null
            needClearLoadMoreRequest = false
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
            document.querySelectorAll("ol li a:nth-child(2)").forEach(makeUsernamesFilterable)
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

// Модули должны стать классами
// - поддерживается всеми браузерами, в которых есть TM
// - изоляция функций и глобальных переменных
// - для модулей, которые внедряются черзе setInterval можно сохранить таймер, чтобы предотвратить дублирование вызовов
// - возможность сохранить результат внедрения

// TODO локализация
let injectingStarted = false

async function addChangesetQuickLook() {
    if (!location.pathname.includes("/changeset")) return
    if (document.querySelector('.quick-look')) return true;

    let sidebar = document.querySelector("#sidebar_content h2");
    if (!sidebar) {
        return;
    }
    if (injectingStarted) return
    injectingStarted = true
    try {
        for (const objType of ["node", "way", "relation"]) {
            await Promise.all(Array.from(document.querySelectorAll(`.list-unstyled li.${objType}`)).map(async (i) => {
                const [, , nodeID, version] = i.querySelector("a:nth-of-type(2)").href.match(/(node|way|relation)\/(\d+)\/history\/(\d+)$/);
                const res = await fetch(osm_server.apiBase + objType + "/" + nodeID + "/history.json");
                const objHistory = (await res.json()).elements;
                let prevVersion = {
                    tags: {}, version: 0
                };

                let targetVersion = prevVersion;
                let lastVersion = objHistory.at(-1);
                for (const objVersion of objHistory) {
                    prevVersion = targetVersion
                    targetVersion = objVersion
                    if (objVersion.version.toString() === version) {
                        break
                    }
                }
                const tagsTable = document.createElement("table")
                const tbody = document.createElement("tbody")
                tagsTable.appendChild(tbody)
                tagsTable.classList.add("quick-look")

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

                if (prevVersion.version !== 0) {
                    for (const [key, value] of Object.entries(prevVersion.tags ?? {})) {
                        if (targetVersion.tags[key] === undefined) {
                            const row = makeTagRow(key, value)
                            row.style.background = "rgba(238,51,9,0.6)"
                            tbody.appendChild(row)
                        }
                    }
                }
                for (const [key, value] of Object.entries(targetVersion.tags ?? {})) {
                    const row = makeTagRow(key, value)
                    if (prevVersion.tags[key] === undefined) {
                        row.style.background = "rgba(17,238,9,0.6)"
                    } else if (prevVersion.tags[key] !== value) {
                        const valCell = row.querySelector("td")
                        valCell.style.background = "rgba(223,238,9,0.6)"
                        valCell.textContent = prevVersion.tags[key] + " → " + valCell.textContent
                        valCell.title = "was " + prevVersion.tags[key]
                    } else {
                        row.classList.add("non-modified-tag-in-quick-view")
                    }
                    tbody.appendChild(row)
                }
                i.appendChild(tagsTable)

                // console.log(prevVersion, targetVersion, lastVersion);
            }))
        }
    } finally {
        injectingStarted = false
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

let hotkeysConfigured = false

function setupNavigationViaHotkeys() {
    if (!location.pathname.includes("/changeset")) return;
    if (hotkeysConfigured) return
    hotkeysConfigured = true

    function keyupHandler(e) {
        if (!location.pathname.includes("/changeset")) return;
        if (e.altKey) {
            if (e.code === "ArrowLeft") {
                const navigationLinks = document.querySelectorAll("div.secondary-actions")[1].querySelectorAll("a")
                if (navigationLinks[0].href.includes("/changeset/")) {
                    navigationLinks[0].click()
                }

            } else if (e.code === "ArrowRight") {
                const navigationLinks = document.querySelectorAll("div.secondary-actions")[1].querySelectorAll("a")
                if (Array.from(navigationLinks).at(-1).href.includes("/changeset/")) {
                    Array.from(navigationLinks).at(-1).click()
                }
            }
        }
    }

    document.addEventListener('keyup', keyupHandler, false);
}

const modules = [
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
    // setupHideLinesForDataView
    setupNewEditorsLinks,
    setupNavigationViaHotkeys
];


function setup() {
    if (location.href.startsWith("https://osmcha.org")) {
        // todo
        return
    }
    if (location.href.startsWith(prod_server.origin)) {
        osm_server = prod_server;
    } else if (location.href.startsWith(dev_server.origin)) {
        osm_server = dev_server;
    } else {
        osm_server = local_server;
    }
    let lastPath = "";
    new MutationObserver(function fn() {
        const path = location.pathname;
        if (path === lastPath) return;
        lastPath = path;
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
        GM.registerMenuCommand("Settings", function () {
            GM_config.open();
        });
        setup();
    }
}

init.then(main);
