// ==UserScript==
// @name         Better osm.org
// @version      0.3.1
// @description  Several improvements for advanced users of osm.org
// @author       deevroman
// @match        https://www.openstreetmap.org/*
// @match        https://master.apis.dev.openstreetmap.org/*
// @match        https://osmcha.org/*
// @match        http://localhost:3000/*
// @match        https://www.hdyc.neis-one.org/*
// @match        https://hdyc.neis-one.org/*
// @license      WTFPL
// @namespace    https://github.com/deevroman/better-osm-org
// @updateURL    https://github.com/deevroman/better-osm-org/raw/master/better-osm-org.user.js
// @downloadURL  https://github.com/deevroman/better-osm-org/raw/master/better-osm-org.user.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=openstreetmap.org
// @grant        GM_registerMenuCommand
// @require      https://openuserjs.org/src/libs/sizzle/GM_config.js
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
GM_config.init(
    {
        'id': 'Config',
        'title': 'Better osm.org settings',
        'fields':
            {
                'RevertButton':
                    {
                        'label': 'Revert button',
                        'type': 'checkbox',
                        'default': 'checked'
                    },
                'CompactChangesetsHistory':
                    {
                        'label': 'Compact changesets history',
                        'type': 'checkbox',
                        'default': 'checked'
                    },
                'ResolveNotesButtons':
                    {
                        'label': 'Show addition resolve buttons',
                        'type': 'checkbox',
                        'default': 'checked'
                    },
                'Deletor':
                    {
                        'label': 'Show buttons for object deletion',
                        'type': 'checkbox',
                        'default': 'checked'
                    },
                'OneClickDeletor':
                    {
                        'label': 'Delete object without confirmation',
                        'type': 'checkbox',
                        // 'default': 'unchecked'
                    },
                'HideNoteHighlight':
                    {
                        'label': 'Hide note highlight',
                        'type': 'checkbox',
                        'default': 'checked'
                    },
                'SatelliteLayers':
                    {
                        'label': 'Add satellite layers for notes page (Firefox only)',
                        'type': 'checkbox',
                        'default': 'checked'
                    },
                'VersionsDiff':
                    {
                        'label': 'Add tags diff in history',
                        'type': 'checkbox',
                        'default': 'checked'
                    },
                // 'ChangesetQuickLook':
                //     {
                //         'label': 'Add QuickLook for small changesets ',
                //         'type': 'checkbox',
                //         'default': 'unchecked'
                //     },
                'HDYCInProfile':
                    {
                        'label': 'Add HDYC in history',
                        'type': 'checkbox',
                        'default': 'checked'
                    },
                'HideLinesForDataView':
                    {
                        'label': 'Hide lines in Data View (experimental)',
                        'type': 'checkbox',
                        // 'default': 'unchecked'
                    }
            },
        frameStyle: `
            bottom: auto; border: 1px solid #000; display: none; height: min(75%, 400px);
            left: 0; margin: 0; max-height: 95%; max-width: 95%; opacity: 0;
            overflow: auto; padding: 0; position: fixed; right: auto; top: 0;
            width: 25%; z-index: 9999;
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
        sidebar.innerHTML += ` [<a href="https://revert.monicz.dev/?changesets=${changeset_id}" target=_blank class=revert_button_class>🔙</a>]`;
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
            textarea.oninput = () => {
                comment.hidden = false
            }
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

function setupCompactChangesetsHistory(path) {
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

    // remove useless
    document.querySelectorAll("#sidebar .changesets .col").forEach((e) => {
        e.childNodes[0].textContent = ""
    })
    // document.querySelector(".search_forms").remove() // make custom search via changesets
    // copying id
    document.querySelectorAll('#sidebar .col .changeset_id').forEach((item) => {
        item.onclick = (e) => {
            e.preventDefault();
            let id = e.target.innerText.slice(1);
            navigator.clipboard.writeText(id).then(() => {
                console.log(`Copying ${id} to clipboard was successful!`);
                e.target.classList.add("copied");
                setTimeout(() => {
                    e.target.classList.remove("copied");
                    e.target.classList.add("was-copied");
                    setTimeout(() => e.target.classList.remove("was-copied"), 300);
                }, 300);
            });
        }
    });
}

function addResolveNotesButtons() {
    if (!location.pathname.includes("/note")) return

    if (document.querySelector('.resolve-note-done')) return true;
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
    document.querySelector(".resolve-note-done").onclick = (e) => {
        auth.xhr({
                method: 'POST',
                path: osm_server.apiBase + 'notes/' + note_id + "/close.json?text=" + encodeURI("👌"),
                prefix: false,
            }, (err, result) => {
                if (err) {
                    alert(err);
                }
                window.location.reload();
            }
        );
    }

    // timeback
    let timestamp = document.querySelector("#sidebar_content time").dateTime;
    const mapsmeDate = document.querySelector(".note-description p").textContent.match(/OSM data version\: ([\d]{4}-[\d]{2}-[\d]{2}T[\d]{2}\:[\d]{2}\:[\d]{2}\Z)/);
    if (mapsmeDate) {
        timestamp = mapsmeDate[1];
    }
    const organicmapsDate = document.querySelector(".note-description p").textContent.match(/OSM snapshot date\: ([\d]{4}-[\d]{2}-[\d]{2}T[\d]{2}\:[\d]{2}\:[\d]{2}\Z)/);
    if (organicmapsDate) {
        timestamp = organicmapsDate[1];
    }
    const lat = document.querySelector("#sidebar_content .latitude").textContent.replace(",", ".");
    const lon = document.querySelector("#sidebar_content .longitude").textContent.replace(",", ".");
    const zoom = 18;
    const query =
        `[date:"${timestamp}"];
(
  node({{bbox}});
  way({{bbox}});
  //relation({{bbox}});
);
(._;>;);
out meta;
`;
    let btn = document.createElement("a")
    btn.textContent = " 🕰";
    btn.style.cursor = "pointer"
    document.querySelector("#sidebar_content time").after(btn);
    btn.onclick = () => {
        window.open(`https://overpass-turbo.eu/?Q=${encodeURI(query)}&C=${lat};${lon};${zoom}&R`)
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
    link.text = ['ru-RU', 'ru'].includes(navigator.language) ? "Выпилить!" : "Delete!";
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
                }, function (err2, result) {
                    if (err2) {
                        console.log({changesetError: err2});
                    }
                    auth.xhr({
                        method: 'PUT',
                        path: osm_server.apiBase + 'changeset/' + changesetId + '/close',
                        prefix: false
                    }, function (err3, result) {
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

function hideNoteHighlight() {
    let g = document.querySelector("g");
    if (!g || g.childElementCount === 0) return;
    if (g.childNodes[g.childElementCount - 1].getAttribute("stroke") === "#FF6200"
        && g.childNodes[g.childElementCount - 1].getAttribute("d").includes("a20,20 0 1,0 -40,0 ")) {
        g.childNodes[g.childElementCount - 1].remove();
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
                debugger
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

async function findChangesetInDiff(e) {
    const response = await GM.xmlHttpRequest({
        method: "GET",
        url: planetOrigin + "/replication/changesets/",
    });
    const parser = new DOMParser();
    const AAAHTML = parser.parseFromString(response.responseText, "text/html");
    let target = new Date(e.target.datetime)
    target.setSeconds(0)


    let a = Array.from(AAAHTML.querySelector("pre").childNodes).slice(2).slice(0, -4)
    a.push(...a.slice(-2))
    let x = 0;
    for (x; x < a.length - 2; x += 2) {
        let d = new Date(a[x + 1].textContent.trim().slice(0, -1).trim())
        if (target < d) break
    }
    let AAAs;
    if (x === 0) {
        AAAs = [a[x].getAttribute("href"), a[x].getAttribute("href")]
    } else {
        AAAs = [a[x - 2].getAttribute("href"), a[x].getAttribute("href")]
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
        return found ? a[x].getAttribute("href") : false
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
        for (x; x < a.length; x += 2) {
            if (!a[x].textContent.match(/^\d+\.osm\.gz$/)) {
                x += 2 // bypass .tmp files
            }
            let d = new Date(a[x + 1].textContent
                .trim().slice(0, -1).trim()
                .split(" ").slice(0, -1).join(" ").trim() + ' UTC')
            if (target <= d) {
                found = true;
                break
            }
        }
        return found ? [a[x].getAttribute("href"), a[x + 4].getAttribute("href")] : false
    }

    let BBB1 = await parseBBB(target, AAAs[1])
    let CCC = await parseCCC(target, AAAs[1] + BBB1);
    let gzURL = ""
    if (CCC) {
        gzURL = planetOrigin + "/replication/changesets/" + AAAs[1] + BBB1;
    } else {
        let BBB0 = await parseBBB(target, AAAs[0])
        if (BBB0) {
            CCC = await parseCCC(target, AAAs[0] + BBB1);
            gzURL = planetOrigin + "/replication/changesets/" + AAAs[0] + BBB0;
        } else {
            alert(":(")
        }
    }

    async function decompressBlob(blob) {
        let ds = new DecompressionStream("gzip");
        let decompressedStream = blob.stream().pipeThrough(ds);
        return await new Response(decompressedStream).blob();
    }

    const diffGZ = await GM.xmlHttpRequest({
        method: "GET",
        url: gzURL + CCC[0],
        responseType: "blob"
    });
    let blob = await decompressBlob(diffGZ.response);
    let diffXML = await blob.text()

    const diffParser = new DOMParser();
    const doc = diffParser.parseFromString(diffXML, "application/xml");
    let foundedChangeset = doc.querySelector(`osm changeset[id='${e.target.value}']`)
    if (!foundedChangeset) {
        const diffGZ = await GM.xmlHttpRequest({
            method: "GET",
            url: gzURL + CCC[1],
            responseType: "blob"
        });
        let blob = await decompressBlob(diffGZ.response);
        let diffXML = await blob.text()

        const diffParser = new DOMParser();
        const doc = diffParser.parseFromString(diffXML, "application/xml");
        foundedChangeset = doc.querySelector(`osm changeset[id='${e.target.value}']`)
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
        navigator.clipboard.writeText(id).then(() => {
            console.log(`Copying ${id} to clipboard was successful!`);
            e.target.classList.add("copied");
            setTimeout(() => {
                e.target.classList.remove("copied");
                e.target.classList.add("was-copied");
                setTimeout(() => e.target.classList.remove("was-copied"), 300);
            }, 300);
        });
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


function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
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
function addDiffInHistory() {
    addHistoryLink();
    if (!location.pathname.includes("/history")
        || location.pathname === "/history"
        || location.pathname.includes("/history/")
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
                let v = i.querySelector("td .wdplugin")?.textContent ?? i.querySelector("td > a")?.textContent ?? i.querySelector("td")?.textContent;
                if (!k) {
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
                debugger
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
            childNodes = Array.from(ver.querySelectorAll("details ul.list-unstyled li a:first-child")).map((el) => el.href)
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
    debugger
}

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

async function setupHDYCInProfile(path) {
    let match = path.match(/^\/user\/([^\/]+)$/);
    if (!match) {
        return;
    }
    const user = match[1];
    if (user === "forgot-password" || user === "new") return;
    document.querySelector(".content-body > .content-inner").style.paddingBottom = "0px";
    let iframe = GM_addElement(document.querySelector("#content"), "iframe", {
        src: "https://www.hdyc.neis-one.org/?" + user,
        width: "100%",
        height: "2500px",
        id: "hdyc-iframe",
        scrolling: "no",
    })
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

let modules = [
    setupHDYCInProfile,
    setupCompactChangesetsHistory,
    setupRevertButton,
    setupResolveNotesButtons,
    setupDeletor,
    setupHideNoteHighlight,
    setupSatelliteLayers,
    setupVersionsDiff,
    // setupChangesetQuickLook
    // setupHideLinesForDataView
];


function setup() {
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
        // TODO write custom settings
        GM.registerMenuCommand("Settings", function () {
            GM_config.open();
        });
        setup();
    }
}

init.then(main);
