// ==UserScript==
// @name         Better osm.org
// @version      0.1
// @description  Several improvements for advanced users of osm.org
// @author       deevroman
// @match        https://www.openstreetmap.org/*
// @match        https://master.apis.dev.openstreetmap.org/*
// @match        https://osmcha.org/*
// @match        http://localhost:3000/*
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
                'MassRevert':
                    {
                        'label': 'Mass revert selectors',
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
                'HideNoteHighlight':
                    {
                        'label': 'Hide note highlight',
                        'type': 'checkbox',
                        'default': 'checked'
                    },
                'SateliteLayers':
                    {
                        'label': 'Add satelite layers for main page',
                        'type': 'checkbox',
                        'default': 'checked'
                    },
            },
        frameStyle: [
            'bottom: auto; border: 1px solid #000; display: none; height: 75%;',
            'left: 0; margin: 0; max-height: 95%; max-width: 95%; opacity: 0;',
            'overflow: auto; padding: 0; position: fixed; right: auto; top: 0;',
            'width: 20%; z-index: 9999;'
        ].join(' '),
    });

let onInit = config => new Promise(resolve => {
    let isInit = () => setTimeout(() =>
        config.isInit ? resolve() : isInit(), 0);
    isInit();
});

let init = onInit(GM_config);

const prod_server = {
    apiBase: "https://api.openstreetmap.org/api/0.6/",
    apiUrl: "https://api.openstreetmap.org/api/0.6",
    url: "https://www.openstreetmap.org",
}

const dev_server = {
    apiBase: "https://master.apis.dev.openstreetmap.org/api/0.6/",
    apiUrl: "https://master.apis.dev.openstreetmap.org/api/0.6",
    url: "https://master.apis.dev.openstreetmap.org",
}

const local_server = {
    apiBase: "http://localhost:3000/api/0.6/",
    apiUrl: "http://localhost:3000/api/0.6",
    url: "http://localhost:3000",
}

var osm_server = dev_server;

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
        // Put your own credentials here.
        client_id: "FwA",
        client_secret: "ZUq",
        // Hopefully this page is never used.
        redirect_uri: GM_getResourceURL("OAUTH_HTML"),
        scope: "write_api",
        auto: true
    });
}

function addRevertButton(){
    if (document.querySelector('.revert_button_class')) return true;

    let sidebar = document.querySelector("#sidebar_content h2");
    if (sidebar) {
        let changeset_id = sidebar.innerHTML.match(/(\d+)/)[0];
        sidebar.innerHTML += ` [<a href="https://revert.monicz.dev/?changesets=${changeset_id}" target=_blank class=revert_button_class>🔙</a>]`;
    }
}

function setupRevertButton(){
    if (!GM_config.get('RevertButton')) {
        return;
    }
    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            if (!url.includes("/changeset")) return;
            let timerId = setInterval(() => {
                addRevertButton();
            }, 100);
            setTimeout(() => { clearInterval(timerId); console.log('stop try add revert button'); }, 3000);
        }
    }).observe(document, {subtree: true, childList: true});
    if (location.href.includes("/changeset")){
        addRevertButton();
    }
}

function setupCompactChangesetsHistory(){
    if (!GM_config.get('CompactChangesetsHistory')) {
        return;
    }
    if (!location.href.includes("/history")){
        return;
    }

    var style = document.createElement('style');
    style.type = 'text/css';

    var styleText = `
    .changesets p {
      margin-bottom: 0;
      font-weight: 788;
    }
    .map-layout #sidebar {
      width: 450px;
    }
    /* for id copied */
    .copied {
      background-color: red;
      transition:all 0.3s;
    }
    .was-copied {
      background-color: none;
      transition:all 0.3s;
    }
    `
    if (style.styleSheet) {
        style.styleSheet.cssText=styleText;
    } else {
        style.appendChild(document.createTextNode(styleText));
    }
    document.getElementsByTagName('head')[0].appendChild(style);

    new MutationObserver(() => {
        // remove useless
        document.querySelectorAll("#sidebar .changesets .col").forEach((e) => {e.childNodes[0].textContent = ""})
        // copying id
        document.querySelectorAll('#sidebar .col .changeset_id').forEach((item) => {
            item.onclick = (e) => {
                e.preventDefault();
                let id = e.target.innerText.slice(1);
                navigator.clipboard.writeText(id).then(function() {
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
    }).observe(document, {subtree: true, childList: true});
}

function setupResolveNotesButtons() {
    if (!GM_config.get('ResolveNotesButtons')) {
        return;
    }
    if (!location.href.includes("/note")){
        return;
    }
    if (!document.querySelector("#sidebar_content textarea.form-control")){
        return;
    }
    let note_id = location.href.match(/note\/(\d+)/)[1];
    let b = document.createElement("button");
    b.classList.add("resolve-note-done", "btn", "btn-primary");
    b.textContent = "👌";
    document.querySelectorAll(".btn-wrapper .btn")[0].before(b);
    document.querySelectorAll(".btn-wrapper .btn")[0].after(document.createTextNode("\xA0"));
    document.querySelector(".resolve-note-done").onclick = (e) => {
        const auth = makeAuth();
        auth.xhr({
                method: 'POST',
                path: osm_server.apiBase + 'notes/' + note_id + "/close?text=" + encodeURI("👌"),
                prefix: false,
            }, (err, result) =>{
                if (err) {
                    alert(err);
                }
                location.reload();
            }
        );
    }
}

function addDeleteButton() {
    if (document.querySelector('.delete_object_button_class')) return true;

    let match = location.href.match(/(node|way)\/(\d+)/);
    if (!match) return;
    let object_type = match[1];
    let object_id = match[2];

    const auth = makeAuth();
    let link = document.createElement('a');
    link.text = "Выпилить!";
    link.href = "";
    link.classList.add("delete_object_button_class");
    if(document.querySelectorAll(".browse-section h4").length < 2 && document.querySelector(".browse-section .latitude") === null){
        link.setAttribute("hidden", true);
        return;
    }

    if (!document.querySelector(".secondary-actions")) return;
    document.querySelector(".secondary-actions").appendChild(link);
    link.after(document.createTextNode("\xA0"));
    link.before(document.createTextNode("\xA0"));
    link.onclick = (e) => {
        e.preventDefault();
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
        }, function(err, objectInfo) {
            if (err) {
                console.log(err);
                return;
            }
            auth.xhr({
                method: 'PUT',
                path: osm_server.apiBase + 'changeset/create',
                prefix: false,
                content: chPayloadStr
            }, function(err1, result) {
                const changesetId = result;
                console.log(changesetId);
                objectInfo.children[0].children[0].setAttribute('changeset', changesetId);
                auth.xhr({
                    method: 'DELETE',
                    path: osm_server.apiBase + object_type +'/' + object_id,
                    prefix: false,
                    content: objectInfo
                }, function(err2, result) {
                    if (err2) {
                        console.log({changesetError: err2});
                    }
                    auth.xhr({
                        method: 'PUT',
                        path: osm_server.apiBase + 'changeset/' + changesetId + '/close',
                        prefix: false
                    }, function(err3, result) {
                        if (!err3) {
                            window.location.reload();
                        }
                    });
                });
            });
        });
    };
}

function setupDeletor(){
    if (!GM_config.get('Deletor')) {
        return;
    }
    if (!location.href.includes("/node/") &&
        !location.href.includes("/way/") &&
        !location.href.includes("/note/") &&
        !location.href.includes("/changeset/")
       ){
        return;
    }
    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            if (!url.includes("/node/") /*&& !url.includes("/way/")*/) return;
            let timerId = setInterval(() => {
                addDeleteButton();
            }, 100);
            setTimeout(() => { clearInterval(timerId); console.log('stop try add delete button'); }, 3000);
        }
    }).observe(document, {subtree: true, childList: true});
    if (location.href.includes("/node/") /*|| location.href.includes("/way/")*/){
        addDeleteButton();
    }
}

function hideNoteHighlight(){
    let g = document.querySelector("g");
    if (g.childElementCount == 0) return;
    if(g.childNodes[g.childElementCount-1].getAttribute("stroke") == "#FF6200"
        && g.childNodes[g.childElementCount-1].getAttribute("d").includes("a20,20 0 1,0 -40,0 ")){
        g.childNodes[g.childElementCount-1].remove();
    }
}

function setupHideNoteHighlight(){
    if (!GM_config.get('HideNoteHighlight')) {
        return;
    }
    if (!location.href.includes("/note/")){
        return;
    }
    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            if (!url.includes("/note/")) return;
            let timerId = setInterval(() => {
                hideNoteHighlight();
            }, 1000);
            setTimeout(() => { clearInterval(timerId); console.log('stop removing note highlight'); }, 5000);
        }
    }).observe(document, {subtree: true, childList: true});
    if (location.href.includes("/note/")){
        hideNoteHighlight();
    }
}

function setupSateliteLayers() {
    if (!GM_config.get('SateliteLayers')) {
        return;
    }

}

function setup() {
    if (location.href.startsWith(prod_server.url)){
        osm_server = prod_server;
    } else if (location.href.startsWith(dev_server.url)) {
        osm_server = dev_server;
    } else {
        osm_server = local_server;
    }
    console.log(osm_server);
    try {
        setupRevertButton();
    } catch {

    }
    try {
        setupCompactChangesetsHistory();
    } catch {

    }
    try {
        setupResolveNotesButtons();
    } catch {

    }
    try {
        setupDeletor();
    } finally {

    }
    try {
        setupHideNoteHighlight();
    } finally {

    }
    try {
        setupSateliteLayers();
    } finally {

    }
}

function main() {
    'use strict';

    GM.registerMenuCommand("Settings", function() {
        GM_config.open();
    });
    setup();
};

init.then(main);
