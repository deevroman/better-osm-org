// ==UserScript==
// @name         Better osm.org
// @version      0.1
// @description  Several improvements for advanced users of osm.org
// @author       deevroman
// @match        https://www.openstreetmap.org/*
// @match        https://osmcha.org/*
// @license      WTFPL
// @namespace    https://github.com/deevroman/better-osm-org
// @updateURL    https://github.com/deevroman/better-osm-org/raw/master/better-osm-org.user.js
// @downloadURL  https://github.com/deevroman/better-osm-org/raw/master/better-osm-org.user.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=openstreetmap.org
// @grant        GM_registerMenuCommand
// @require      https://openuserjs.org/src/libs/sizzle/GM_config.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM.getValue
// @grant        GM.setValue
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

function setupChangesetIdCopy() {

}

function setup() {
    try {
        setupRevertButton();
    } catch {

    }
    try {
        setupCompactChangesetsHistory();
    } catch {

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
