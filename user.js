// ==UserScript==
// @name         Better osm.org
// @version      0.1
// @description  Several improvements for advanced users of osm.org
// @author       deevroman
// @match        https://www.openstreetmap.org/changeset/*
// @license      WTFPL
// @namespace    https://github.com/deevroman/better-osm-org
// @updateURL    https://github.com/deevroman/better-osm-org/raw/master/user.js
// @downloadURL  https://github.com/deevroman/better-osm-org/raw/master/user.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=openstreetmap.org
// @grant        GM.addStyle
// ==/UserScript==

function addRevertButton(){
    if (document.querySelector('.revert_button_class')) return true;

    let sidebar = document.querySelector("#sidebar_content h2");
    if (sidebar) {
        let changeset_id = sidebar.innerHTML.match(/(\d+)/)[0];
        sidebar.innerHTML += ` [<a href="https://revert.monicz.dev/?changesets=${changeset_id}" target=_blank class=revert_button_class>🔙</a>]`;
    }
}

(function() {
    'use strict';
    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            if (!url.includes("/changeset")) return;
            let timerId = setInterval(() => {
                addRevertButton();
            }, 300);
            setTimeout(() => { clearInterval(timerId); console.log('stop try add revert button'); }, 3000);
        }
    }).observe(document, {subtree: true, childList: true});
    addRevertButton();
})();
