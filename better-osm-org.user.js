// ==UserScript==
// @name            Better osm.org
// @name:ru         Better osm.org
// @version         1.1.7
// @changelog       v1.0.0: type=restriction render, user ID in profile, profile for deleted user
// @changelog       v1.0.0: notes filter, Overpass link in taginfo for key values, ruler, nodes mover
// @changelog       v0.9.9: Button for 3D view building in OSMBuilding, F4map and other viewers
// @changelog       v0.9.9: Key1 for open first user's changeset, add poweruser=true in Rapid link
// @changelog       v0.9.9: Restore navigation links on changeset page of deleted user
// @changelog       v0.9.9: KeyR select object for partial revert or open in JOSM/Level0 (KeyJ)
// @changelog       v0.9.9: You can replace iD with JOSM (click on extension icon)
// @changelog       v0.9.8: Hover for nodes/members in nodes way or relation members list, better RTL support
// @changelog       v0.9.8: Show past usernames of user, click for copy ID from header, adoption to updates osm.org
// @changelog       v0.9.6: Filter by editor for edits heatmap
// @changelog       v0.9.5: Adoption to updates osm.org, render camera:direction=*
// @changelog       v0.9.1: script should work more stably in Chrome
// @changelog       v0.9.1: display prev value in history diff cell
// @changelog       v0.9.1: Alt + click by <time> for open augmented diffs
// @changelog       v0.9.1: adapting to changes on the page /history
// @changelog       v0.8.9: Satellite layer in Chrome
// @changelog       v0.8.9: Support Mapillary images in tags
// @changelog       v0.8.9: KeyJ — open in JOSM current state of objects from changeset, alt + J — in Level0
// @changelog       v0.8.9: Ctrl + click by <time> for open  state of the map as of the selected date
// @changelog       v0.8.9: Shift + / for simple search and editor via Overpass
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
// @changelog       https://c.osm.org/t/better-osm-org-a-script-that-adds-useful-little-things-to-osm-org/121670/112
// @description     Several improvements for advanced users of openstreetmap.org
// @description:ru  Скрипт, добавляющий на openstreetmap.org полезные картографам функции
// @author       deevroman
// @match        https://www.openstreetmap.org/*
// @exclude      https://www.openstreetmap.org/api*
// @exclude      https://www.openstreetmap.org/diary/new
// @exclude      https://www.openstreetmap.org/message/new/*
// @exclude      https://www.openstreetmap.org/reports/new/*
// @exclude      https://www.openstreetmap.org/profile/*
// @exclude      https://www.openstreetmap.org/messages/*
// @exclude      https://www.openstreetmap.org/diary/*
// @exclude      https://www.openstreetmap.org/account*
// @exclude      https://www.openstreetmap.org/oauth2/*
// @exclude      https://www.openstreetmap.org/login*
// @match        https://master.apis.dev.openstreetmap.org/*
// @exclude      https://master.apis.dev.openstreetmap.org/api/*
// @exclude      https://master.apis.dev.openstreetmap.org/account*
// @exclude      https://master.apis.dev.openstreetmap.org/messages/*
// @exclude      https://master.apis.dev.openstreetmap.org/diary/*
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
// @icon         https://www.openstreetmap.org/favicon.ico
// @require      https://raw.githubusercontent.com/deevroman/GM_config/fixed-for-chromium/gm_config.js#sha256=ea04cb4254619543f8bca102756beee3e45e861077a75a5e74d72a5c131c580b
// @require      https://raw.githubusercontent.com/deevroman/osm-auth/d83736efcbec64a87d2c31ffdca3e3efc255f823/dist/osm-auth.iife.js#sha256=f9f85ed6209aa413097a5a4e1a4b6870d3a9ee94f267ac7c3ec35cee99b7dec9
// @require      https://raw.githubusercontent.com/deevroman/exif-js/53b0c7c1951a23d255e37ed0a883462218a71b6f/exif.js#sha256=2235967d47deadccd9976244743e3a9be5ca5e41803cda65a40b8686ec713b74
// @require      https://raw.githubusercontent.com/deevroman/osmtogeojson/c97381a0c86c0a021641dd47d7bea01fb5514716/osmtogeojson.js#sha256=663bb5bbae47d5d12bff9cf1c87b8f973e85fab4b1f83453810aae99add54592
// @require      https://gist.githubusercontent.com/deevroman/d8b7a2176446e321fa6b0b47d0615d6e/raw/57c11b07432890b9a066ef6b6aba970dda9cb5ad/snow-animation.js#sha256=3b6cd76818c5575ea49aceb7bf4dc528eb8a7cb228b701329a41bb50f0800a5d
// @require      https://raw.githubusercontent.com/deevroman/opening_hours.js/f70889c71fcfd6e3ef7ba8df3b1263d8295b3dec/opening_hours+deps.min.js#sha256=e9a3213aba77dcf79ff1da9f828532acf1ebf7107ed1ce5f9370b922e023baff
// @incompatible safari https://github.com/deevroman/better-osm-org/issues/13
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM_registerMenuCommand
// @grant        GM_listValues
// @grant        GM_deleteValue
// @grant        GM_getResourceURL
// @grant        GM_getResourceText
// @grant        GM_addElement
// @grant        GM.xmlHttpRequest
// @grant        GM.fetch
// @grant        GM_info
// @comment      for get diffs for finding deleted users
// @connect      planet.openstreetmap.org
// @connect      planet.maps.mail.ru
// @comment      overpass instances
// @connect      maps.mail.ru
// @connect      overpass.private.coffee
// @connect      turbo.overpass.private.coffee
// @connect      overpass-api.de
// @connect      www.hdyc.neis-one.org
// @connect      hdyc.neis-one.org
// @connect      resultmaps.neis-one.org
// @connect      www.openstreetmap.org
// @connect      osmcha.org
// @connect      raw.githubusercontent.com
// @connect      en.wikipedia.org
// @connect      graph.mapillary.com
// @connect      api.panoramax.xyz
// @comment      for downloading gps-tracks — osm stores tracks in AWS
// @connect      amazonaws.com
// @comment      for satellite images
// @connect      server.arcgisonline.com
// @connect      clarity.maptiles.arcgis.com
// @connect      wayback.maptiles.arcgis.com
// @comment      geocoder
// @connect      photon.komoot.io
// @connect      whosthat.osmz.ru
// @connect      content-a.strava.com
// @sandbox      JavaScript
// @resource     OAUTH_HTML https://raw.githubusercontent.com/deevroman/better-osm-org/master/finish-oauth.html?bypass_cache
// @resource     OSMCHA_ICON https://raw.githubusercontent.com/deevroman/better-osm-org/master/icons/osmcha.ico
// @resource     NODE_ICON https://raw.githubusercontent.com/deevroman/better-osm-org/master/icons/Osm_element_node.svg
// @resource     WAY_ICON https://raw.githubusercontent.com/deevroman/better-osm-org/master/icons/Osm_element_way.svg
// @resource     RELATION_ICON https://raw.githubusercontent.com/deevroman/better-osm-org/master/icons/Taginfo_element_relation.svg
// @resource     OSMCHA_LIKE https://raw.githubusercontent.com/OSMCha/osmcha-frontend/94f091d01ce5ea2f42eb41e70cdb9f3b2d67db88/src/assets/thumbs-up.svg
// @resource     OSMCHA_DISLIKE https://raw.githubusercontent.com/OSMCha/osmcha-frontend/94f091d01ce5ea2f42eb41e70cdb9f3b2d67db88/src/assets/thumbs-down.svg
// @resource     DARK_THEME_FOR_ID_CSS https://gist.githubusercontent.com/deevroman/55f35da68ab1efb57b7ba4636bdf013d/raw/1e91d589ca8cb51c693a119424a45d9f773c265e/dark.css
// @run-at       document-end
// ==/UserScript==
//<editor-fold desc="init" defaultstate="collapsed">
/*global osmAuth*/
/*global GM*/
/*global GM_info*/
/*global GM_config*/
/*global GM_addElement*/
/*global GM_listValues*/
/*global GM_deleteValue*/
/*global GM_getResourceURL*/
/*global GM_getResourceText*/
/*global GM_registerMenuCommand*/
/*global unsafeWindow*/
/*global exportFunction*/
/*global cloneInto*/
/*global EXIF*/
/*global osmtogeojson*/
/*global opening_hours*/
/*global runSnowAnimation*/

if (location.search.includes("&kek")) {
    throw "better-osm-org disable via url param";
}

if (GM_info.scriptHandler === "Userscripts" || GM_info.scriptHandler === "Greasemonkey" || GM_info.scriptHandler === "Firemonkey") {
    console.error("YOU ARE USING AN UNSUPPORTED SCRIPT MANAGER")
}

const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const isFirefox = navigator.userAgent.includes("Firefox");
const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent)

if (isSafari) {
    console.error("YOU ARE USING AN UNSUPPORTED BROWSER")
}

if (GM_info.scriptHandler === "Userscripts" || GM_info.scriptHandler === "Greasemonkey") {
    if (typeof GM_getResourceURL === "undefined") {
        const resources = {}
        setTimeout(async () => {
            const resourcesName = {
                "OAUTH_HTML": "https://github.com/deevroman/better-osm-org/raw/master/finish-oauth.html",
                "OSMCHA_ICON": "https://github.com/deevroman/better-osm-org/raw/master/icons/osmcha.ico",
                "NODE_ICON": "https://github.com/deevroman/better-osm-org/raw/master/icons/Osm_element_node.svg",
                "WAY_ICON": "https://github.com/deevroman/better-osm-org/raw/master/icons/Osm_element_way.svg",
                "RELATION_ICON": "https://github.com/deevroman/better-osm-org/raw/master/icons/Taginfo_element_relation.svg",
                "OSMCHA_LIKE": "https://github.com/OSMCha/osmcha-frontend/raw/94f091d01ce5ea2f42eb41e70cdb9f3b2d67db88/src/assets/thumbs-up.svg",
                "OSMCHA_DISLIKE": "https://github.com/OSMCha/osmcha-frontend/raw/94f091d01ce5ea2f42eb41e70cdb9f3b2d67db88/src/assets/thumbs-down.svg",
                "DARK_THEME_FOR_ID_CSS": "https://gist.githubusercontent.com/deevroman/55f35da68ab1efb57b7ba4636bdf013d/raw/7b94e3b7db91d023f1570ae415acd7ac989fffe0/dark.css"
            }
            for (let resource in resourcesName) {
                GM.xmlHttpRequest({
                    method: "GET",
                    url: resourcesName[resource],
                    responseType: "blob",
                    onload: res => {
                        const a = new FileReader();
                        a.onload = function (e) {
                            resources[resource] = e.target.result
                        }
                        a.readAsDataURL(res.response);
                    }
                })
            }
        })
        window.GM_getResourceURL = (name) => {
            console.log(resources);
            return resources[name]
        }
    }

    if (typeof GM_addElement === "undefined") {
        window.GM_addElement = function () {
            let parent, type, attrs;
            if (arguments.length === 3) {
                [parent, type, attrs] = arguments
            } else if (arguments.length === 2) {
                [type, attrs] = arguments
            } else {
                return
            }
            const elem = document.createElement(type)
            Object.entries(attrs).forEach(([key, value]) => {
                elem.setAttribute(key, value)
            })
            if (parent) {
                parent.appendChild(elem)
            }
            return elem
        }
    }
}

const accountForceLightTheme = document.querySelector("html")?.getAttribute("data-bs-theme") === "light";
const accountForceDarkTheme = document.querySelector("html")?.getAttribute("data-bs-theme") === "dark";
const mediaQueryForWebsiteTheme = `${accountForceDarkTheme ? "all" : "(prefers-color-scheme: dark)"} ${accountForceLightTheme ? "and (not all)" : ""}`;

function isDarkMode() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches && !accountForceLightTheme || accountForceDarkTheme;
}

const isRTLLayout = document.querySelector("html").dir === "rtl";
const arrowSymbolForChanges = !isRTLLayout ? " → " : " ← ";

const SCRIPT_UPDATE_URL = "https://raw.githubusercontent.com/deevroman/better-osm-org/master/better-osm-org.user.js"
const DEV_SCRIPT_UPDATE_URL = "https://raw.githubusercontent.com/deevroman/better-osm-org/dev/better-osm-org.user.js"

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

const osm_server = (() => {
    if (location.origin === prod_server.origin) return prod_server;
    else if (location.origin === dev_server.origin) return dev_server;
    else if (location.origin === ohm_prod_server.origin) return ohm_prod_server;
    else if (location.origin === local_server.origin) return local_server;
    else return null;
})()

function isOsmServer() {
    return !!osm_server;
}

const planetOrigin = "https://planet.maps.mail.ru"

const MAIN_OVERPASS_INSTANCE = {
    name: "overpass-api.de",
    apiUrl: "https://overpass-api.de/api",
    url: "https://overpass-turbo.eu/",
}

const MAILRU_OVERPASS_INSTANCE = {
    name: "maps.mail.ru/osm/tools/overpass",
    apiUrl: "https://maps.mail.ru/osm/tools/overpass/api",
    url: "https://maps.mail.ru/osm/tools/overpass/",
}

const PRIVATECOFFEE_OVERPASS_INSTANCE = {
    name: "overpass.private.coffee",
    apiUrl: "https://overpass.private.coffee/api",
    url: "https://turbo.overpass.private.coffee/",
}

let overpass_server = MAIN_OVERPASS_INSTANCE

const instancesOf3DViewers = [
    {
        name: "OSM Building Viewer",
        url: "https://deevroman.github.io/OSMBuilding/",
        makeURL: function ({type: type, id: id}) {
            return `${this.url}?id=${id}&type=${type}`// TODO osmAPIurl
        }
    },
    {
        name: "F4Map",
        url: "https://demo.f4map.com/",
        makeURL: function ({x: x, y: y, z: z}) {
            return `${this.url}#lat=${x}&lon=${y}&zoom=${z}`;
        }
    },
    {
        name: "streets.gl",
        url: "https://streets.gl/",
        makeURL: function ({x: x, y: y, z: z}) {
            return `${this.url}#${x},${y},45.00,0.00,2000.00`
        }
    },
    {
        name: "OSM go",
        url: "https://www.osmgo.org/go.html",
        makeURL: function ({x: x, y: y, z: z}) {
            return `${this.url}?lat=${x}&lon=${y}&view=-50&ele=150`
        }
    },
    {
        name: "osmbuildings.org",
        url: "https://osmbuildings.org/",
        makeURL: function ({x: x, y: y, z: z}) {
            return `${this.url}?lat=${x}&lon=${y}&zoom=${z}`
        }
    },
    {
        name: "labs.mapbox.com",
        url: "https://labs.mapbox.com/standard-style?lightPreset=day#",
        makeURL: function ({x: x, y: y, z: z}) {
            // z-1 looks better
            return `${this.url}${z - 1}/${x}/${y}/0/50`
        }
    },
    // {
    //     name: "OSM Building Viewer (fork)",
    //     url: "https://deevroman.github.io/OSMBuilding/",
    //     makeURL: function ({type: type, id: id}) {
    //         return `${this.url}/?id=${id}&type=${type}`
    //     }
    // }
]

/** @type {unsafeWindow & windowOSM} **/
const boWindowObject = typeof window.wrappedJSObject !== "undefined" ? window.wrappedJSObject : unsafeWindow;
const boGlobalThis = typeof boWindowObject.globalThis !== "undefined" ? boWindowObject.globalThis : boWindowObject;

/** @type {null|(function(): null|import('leaflet').Map)}*/
let getMap = null

/**
 * @typedef {{
 *  OSM: {
 *   router: { stateChange: function(args: Object): Object },
 *   i18n: {t: Function},
 *   formatHash: function(hash: string): Object,
 *   parseHash: function(args: Object): string,
 *  },
 *  L: {
 *      polyline: import('leaflet').polyline,
 *      marker: import('leaflet').marker,
 *      circleMarker: import('leaflet').circleMarker,
 *      latLng: import('leaflet').latLng,
 *      latLngBounds: import('leaflet').latLngBounds,
 *      rectangle: import('leaflet').rectangle,
 *      geoJSON: import('leaflet').geoJSON,
 *      tooltip: import('leaflet').tooltip,
 *      point: import('leaflet').point,
 *      DomEvent: import('leaflet').DomEvent,
 *      imageOverlay: import('leaflet').imageOverlay,
 *  },
 *  mapIntercepted: boolean,
 *  scriptInstance: string|undefined,
 *  map: import('leaflet').Map,
 * }} windowOSM
 */

/** @type {null|(function(): null|(boWindowObject & windowOSM)|(window & windowOSM))}*/
let getWindow = null

/**
 * @template T
 * @param {T} obj
 * @returns {T}
 */
function intoPage(obj) {
    return cloneInto(obj, getWindow())
}

/**
 * @template T
 * @param {T} obj
 * @returns {T}
 */
function intoPageWithFun(obj) {
    return cloneInto(obj, getWindow(), {cloneFunctions: true})
}

if (isOsmServer() && !["/edit", "/id"].includes(location.pathname)) {
    function mapHook() {
        console.log("start map intercepting")
        if (boWindowObject.L && boWindowObject.L.Map) {
            boWindowObject.L.Map.addInitHook(exportFunction((function () {
                    if (this._container?.id === "map") {
                        boGlobalThis.map = this;
                        boGlobalThis.mapIntercepted = true
                        console.log("%cMap intercepted", 'background: #000; color: #0f0')
                        if (!boGlobalThis.scriptInstance) {
                            boGlobalThis.scriptInstance = GM_info.scriptHandler;
                        } else if (boGlobalThis.scriptInstance !== GM_info.scriptHandler) {
                            console.error(`Two copies of the script were running simultaneously via ${boGlobalThis.scriptInstance} and ${GM_info.scriptHandler}. Turn off one of them`)
                        }
                    }
                }), boWindowObject)
            )
        } else {
            console.error("the script could not access the L.Map object. Some of the functions will not work")
            console.log(GM_info)
            console.log(window?.wrappedJSObject)
            console.log(unsafeWindow)
        }
    }

    if (isSafari && GM_info.scriptHandler === "Userscripts") {
        getMap = () => null
        getWindow = () => window
    } else {
        boWindowObject.mapHook = exportFunction(mapHook, boWindowObject)
        boWindowObject.mapHook()
        if (boWindowObject.map instanceof HTMLElement) {
            console.error("Please, reload page, if something doesn't work")
        }

        getMap = () => boWindowObject.map
        getWindow = () => boWindowObject
    }

    // try {
    //     interceptRectangle()
    // } catch (e) {
    // }

    setTimeout(() => {
        console.debug("Settings:", Object.entries(GM_config.fields).map(i => {
            if (typeof i[1].value === "boolean") {
                return [i[0], i[1].value]
            } else {
                return [i[0], `length: ${i[1].value.length}`]
            }
        }))
    }, 1500)

} else if (isOsmServer() && ["/edit", "/id"].includes(location.pathname)) {
    if (isDarkMode()) {
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
            injectCSSIntoOSMPage(
                `@media ${mediaQueryForWebsiteTheme} {
                #id-embed {
                    background: #212529 !important;
                }
            }`
            )
        } else {
            injectCSSIntoOSMPage(
                `@media ${mediaQueryForWebsiteTheme} {
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
            )
            // if (location.pathname === "/id") {
            //     console.log("post")
            //     window.parent.postMessage("kek", location.origin);
            // }
        }
    }
    GM_registerMenuCommand("JOSM!", function () {
        const iframe = GM_addElement("iframe", {
            "src": "https://deevroman.github.io/web-josm",
            "width": "100%",
            "height": "100%",
            "id": "josmembed",
        })
        document.querySelector("#id-embed").replaceWith(iframe)
    });
}

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
        if (label === "" && text === "" || confirm(`Remove "${label}"?`)) {
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
`;

GM_config.init(
    {
        'id': 'Config',
        'title': ' ',
        'fields':
            {
                'DarkModeForMap': {
                    'label': 'Invert map colors in dark mode',
                    'type': 'checkbox',
                    'default': false,
                    'labelPos': 'right'
                },
                'DarkModeForID': {
                    'label': 'Dark mode for iD (<a href="https://userstyles.world/style/15596/openstreetmap-dark-theme" target="_blank">Thanks AlexPS</a>)',
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
                'ShowPreviousTagValue':
                    {
                        'label': 'Show previous tag value',
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
                'ImagesAndLinksInTags':
                    {
                        'label': 'Make some tags clickable, shorter and display photos',
                        'type': 'checkbox',
                        'default': 'checked',
                        'labelPos': 'right',
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
                        'label': 'Add satellite layers for notes page',
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
                'BetterProfileStat':
                    {
                        'label': 'Add filters to profile statistics',
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
                    'label': 'Allow overzoom when data/satellite layer enabled β',
                    'type': 'checkbox',
                    'default': false,
                    'labelPos': 'right'
                },
                'DragAndDropViewers': {
                    'label': 'Drag&Drop for .geojson, .jpg, .gpx β',
                    'type': 'checkbox',
                    'default': 'checked',
                    'labelPos': 'right'
                },
                '3DViewerInNewTab': {
                    'label': 'Open buildings 3D viewers always in new tab',
                    'type': 'checkbox',
                    'default': 'checked',
                    'labelPos': 'right'
                },
                'BetterTaginfo': {
                    'label': 'Add new button in Taginfo',
                    'type': 'checkbox',
                    'default': 'checked',
                    'labelPos': 'right'
                },
                'OverpassInstance': {
                    'label': '<a href="https://wiki.openstreetmap.org/wiki/Overpass_API#Public_Overpass_API_instances">Overpass API server</a>',
                    'labelPos': 'left',
                    'type': 'select',
                    'options': [
                        MAIN_OVERPASS_INSTANCE.name,
                        MAILRU_OVERPASS_INSTANCE.name,
                        PRIVATECOFFEE_OVERPASS_INSTANCE.name
                    ],
                },
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

                    const placeholder = this.settings.placeholder ?? "comment that will be added when clicked"
                    JSON.parse(templates).forEach(row => {
                        tbody.appendChild(makeRow(row['label'], row['text'], false, placeholder))
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
        'events':
            {
                'init': main,
                'save': function () {
                    GM_config.close()
                },
                'open': function (doc) {
                    const versionSection = document.createElement("span");
                    versionSection.id = "version";
                    versionSection.textContent = `Script version: `;
                    const version = document.createElement("span");
                    version.textContent = GM_info.script.version;
                    version.title = "Click for copy"
                    version.style.cursor = "pointer";
                    version.onclick = e => {
                        navigator.clipboard.writeText(GM_info.script.version).then(() => copyAnimation(e, GM_info.script.version));
                    }
                    versionSection.appendChild(version);
                    doc.querySelector(".reset_holder").prepend(versionSection);
                }
            }
    });

//</editor-fold>

/**
 * @param {XMLDocument} doc
 * @param {HTMLElement} node
 * @param {Object.<string, string>} tags
 */
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
    if (!GM_config.get("ImagesAndLinksInTags")) return;

    const comment = document.querySelector("#element_versions_list > div p")
    comment?.childNodes?.forEach(node => {
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

function makeHashtagsInNotesClickable() {
    if (!GM_config.get("ImagesAndLinksInTags")) return;

    const notesParagraphs = document.querySelectorAll("#sidebar_content h4 ~ div:first-of-type > p")
    notesParagraphs.forEach(p => {
        p?.childNodes?.forEach(node => {
            if (node.nodeType !== Node.TEXT_NODE) return
            const span = document.createElement("span")
            span.textContent = node.textContent
            span.innerHTML = span.innerHTML.replaceAll(/\B(#[\p{L}\d_-]+)\b/gu, function (match) {
                // const notesReviewLink = "https://ent8r.github.io/NotesReview/?" + new URLSearchParams({
                //     view: "map",
                //     status: "open",
                //     area: "view",
                //     limit: 30,
                //     query: match
                // }).toString()

                const a = document.createElement("a")
                a.id = "note-link-" + Math.random()
                a.href = ""
                a.target = "_blank"
                a.title = "Click for filter notes by this hashtag.\nClick with CTLR or Shift for search this hashtags in osm-note-viewer"
                a.textContent = match

                function fixLink() {
                    const notesReviewLink = "https://antonkhorev.github.io/osm-note-viewer/#" + new URLSearchParams({
                        mode: "search",
                        q: match,
                        bbox: [
                            Math.round(getMap().getBounds().getWest() * 10000) / 10000, Math.round(getMap().getBounds().getSouth() * 10000) / 10000,
                            Math.round(getMap().getBounds().getEast() * 10000) / 10000, Math.round(getMap().getBounds().getNorth() * 10000) / 10000
                        ].join(","),
                        sort: "created_at",
                        order: "newest",
                        closed: 0,
                        map: `${getMap().getZoom()}/${getMap().getCenter().lat}/${getMap().getCenter().lng}`,
                    }).toString()
                    const link = document.getElementById(a.id)
                    link.href = notesReviewLink
                    link.onclick = (e) => {
                        if (e.shiftKey || e.ctrlKey || e.metaKey) {
                            return
                        }
                        e.preventDefault()
                        if (document.querySelector(".layers-ui").style.display === "none") {
                            document.querySelector(".control-layers a").click()
                        }
                        Array.from(document.querySelectorAll(".overlay-layers label"))[0].scrollIntoView({block: "center"})
                        document.querySelector("#filter-notes-by-string").value = match
                        updateNotesLayer()
                    }
                    console.log("search link in note was fixed");
                }

                setTimeout(() => {
                    interceptMapManually().then(fixLink)
                })
                setTimeout(fixLink, 1000)
                return a.outerHTML
            })
            node.replaceWith(span)
        })
    })
}

function shortOsmOrgLinksInText(text) {
    return text.replaceAll("https://www.openstreetmap.org", "osm.org")
        .replaceAll("https://wiki.openstreetmap.org/wiki/", "osm.wiki/")
        .replaceAll("https://wiki.openstreetmap.org", "osm.wiki")
        .replaceAll("https://community.openstreetmap.org", "c.osm.org")
        .replaceAll("https://openstreetmap.org", "osm.org")
}

function shortOsmOrgLinks(elem) {
    if (!GM_config.get("ImagesAndLinksInTags")) return;
    elem?.querySelectorAll('a[href^="https://www.openstreetmap.org"], a[href^="https://wiki.openstreetmap.org"], a[href^="https://community.openstreetmap.org"], a[href^="https://openstreetmap.org"]')?.forEach(i => {
        i.textContent = shortOsmOrgLinksInText(i.textContent)
    })
}

// todo remove this
const mainTags = ["shop", "building", "amenity", "man_made", "highway", "natural", "aeroway", "historic", "railway", "tourism", "landuse", "leisure"]

async function getPrevNextChangesetsIDs(changeset_id) {
    const changesetMetadata = await loadChangesetMetadata(changeset_id)
    if (!changesetMetadata.uid) return

    const prevChangesetsPromise = fetchJSONWithCache(osm_server.apiBase + "changesets.json?" + new URLSearchParams({
        user: changesetMetadata.uid,
        order: 'newest',
        from: "2005-01-01T00:00:00Z",
        to: new Date(new Date(changesetMetadata.created_at).getTime() + 1000).toISOString(), // на случай если в одну секунду создано несколько пакетов правок
    }).toString())

    /*** @type {{changesets: ChangesetMetadata[]}}*/
    const nextChangesets = await fetchJSONWithCache(osm_server.apiBase + "changesets.json?" + new URLSearchParams({
        user: changesetMetadata.uid,
        order: 'oldest',
        from: changesetMetadata.created_at,
        to: new Date().toISOString(),
    }).toString())

    /*** @type {{changesets: ChangesetMetadata[]}}*/
    const prevChangesets = await prevChangesetsPromise;

    return [prevChangesets.changesets.find(i => i.id < changeset_id)?.id, nextChangesets.changesets.find(i => i.id > changeset_id)?.id];
}

async function restorePrevNextChangesetButtons(changeset_id) {
    if (document.querySelector(".restored-secondary-actions")) return;
    console.log("try restore prev/next deleted user's changesets")
    const [prevID, nextID] = await getPrevNextChangesetsIDs(changeset_id);
    if (!prevID && !nextID) return
    const secondaryActions = document.querySelector("#sidebar_content .secondary-actions")
    const secondarySecondaryActions = document.createElement("div")
    secondarySecondaryActions.classList.add("secondary-actions", "restored-secondary-actions")
    if (prevID) {
        const prevLink = document.createElement("a")
        prevLink.classList.add("icon-link")
        prevLink.href = "/changeset/" + prevID
        prevLink.innerHTML = '<svg width="8" height="11" viewBox="-8 0 8 11"><path d="M-2,2 l-3.5,3.5 l3.5,3.5" fill="none" stroke="currentColor" stroke-width="1.5"></path></svg>'
        prevLink.appendChild(document.createTextNode(prevID))
        secondarySecondaryActions.appendChild(prevLink)
    }
    secondarySecondaryActions.appendChild(document.createTextNode(` · ${(await loadChangesetMetadata(changeset_id)).user} · `))
    if (nextID) {
        const nextLink = document.createElement("a")
        nextLink.classList.add("icon-link")
        nextLink.href = "/changeset/" + nextID
        nextLink.innerHTML = '<svg width="8" height="11"><path d="M2,2 l3.5,3.5 l-3.5,3.5" fill="none" stroke="currentColor" stroke-width="1.5"></path></svg>'
        nextLink.prepend(document.createTextNode(nextID))
        secondarySecondaryActions.appendChild(nextLink)
    }
    secondaryActions.after(secondarySecondaryActions)
}

let changesetObjectsSelectionModeEnabled = false;

async function validateOsmServerInJOSM() {
    const res = await(await fetch("http://127.0.0.1:8111/version").catch(() => {
        alert("JOSM is not running")
        throw "JOSM is not running"
    })).json()
    if (res['osm_server'] === "custom" && osm_server === prod_server) {
        alert(`You are using custom OSM API server in JOSM.\n\nChange JOSM settings or open other website`)
        return false
    }
    if (res['osm_server'] === "default" && osm_server !== prod_server) {
        alert(`You are using other OSM instance, but JOSM uses default server.\n\nChange JOSM settings or open other website`)
        return false
    }
    return true
}


function addRevertButton() {
    if (!location.pathname.startsWith("/changeset")) return
    if (document.querySelector('#revert_button_class')) return true;
    const sidebar = document.querySelector("#sidebar_content h2");
    if (sidebar) {
        hideSearchForm();
        // sidebar.classList.add("changeset-header")
        const changeset_id = sidebar.innerHTML.match(/([0-9]+)/)[0];
        sidebar.innerHTML += ` <a href="https://revert.monicz.dev/?changesets=${changeset_id}" target=_blank rel="noreferrer" id=revert_button_class title="Open osm-revert\nShift + click for revert via JOSM\nPress R for partial revert">↩️</a> 
                               <a href="https://osmcha.org/changesets/${changeset_id}" target="_blank" rel="noreferrer"><img src="${GM_getResourceURL("OSMCHA_ICON", false)}" id="osmcha_link"></a>`;
        changesetObjectsSelectionModeEnabled = false
        document.querySelector("#revert_button_class").onclick = async (e) => {
            if (changesetObjectsSelectionModeEnabled) {
                e.preventDefault()
                if (osm_server !== prod_server) {
                    e.preventDefault()
                    alert("osm-revert works only for www.openstreetmap.org")
                    return
                }

                let selector = ""

                const nodes = Array.from(document.querySelectorAll("#changeset_nodes input[type=checkbox]:checked"));
                if (nodes.length) {
                    selector += "node(id:" + nodes.map(n => {
                        return n.parentElement.nextElementSibling.id.match(/[0-9]+n([0-9]+)/)[1]
                    }).join(",") + ");\n"
                }
                const ways = Array.from(document.querySelectorAll("#changeset_ways input[type=checkbox]:checked"));
                if (ways.length) {
                    selector += "way(id:" + ways.map(w => {
                        return w.parentElement.nextElementSibling.id.match(/[0-9]+w([0-9]+)/)[1]
                    }).join(",") + ");\n"
                }
                const relations = Array.from(document.querySelectorAll("#changeset_relations input[type=checkbox]:checked"));
                if (relations.length) {
                    selector += "rel(id:" + relations.map(r => {
                        return r.parentElement.nextElementSibling.id.match(/[0-9]+r([0-9]+)/)[1]
                    }).join(",") + ");"
                }

                window.open("https://revert.monicz.dev/?" + new URLSearchParams({
                    changesets: changeset_id,
                    "query-filter": selector
                }).toString(), "_blank")
                return
            }
            if (!e.shiftKey) {
                if (osm_server !== prod_server) {
                    e.preventDefault()
                    alert("osm-revert works only for www.openstreetmap.org\n\nBut you can install reverter plugin in JOSM and use shift+click for other OSM servers.\n\n⚠️Change the osm server in the josm settings!")
                }
                return
            }
            e.preventDefault()
            if (!await validateOsmServerInJOSM()) {
                return
            }

            if (osm_server !== prod_server) {
                if (!confirm("⚠️This is not the main OSM server!\n\n⚠️To change the OSM server in the JOSM settings!")) {
                    return
                }
            }
            window.location = "http://127.0.0.1:8111/revert_changeset?id=" + changeset_id // todo open in new tab. It's broken in Fifefox and open new window
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
        const metainfoHTML = document.querySelector("#sidebar_content h2 ~ div > .details")
        const time = metainfoHTML.querySelector("time")
        if (metainfoHTML.querySelector('a[href*="/user/"]:not([rel])')) {
            let usernameA = metainfoHTML.querySelector('a[href*="/user/"]:not([rel])')
            metainfoHTML.innerHTML = ""
            metainfoHTML.appendChild(time)
            metainfoHTML.appendChild(document.createTextNode(" "))
            metainfoHTML.appendChild(usernameA)
            metainfoHTML.appendChild(document.createTextNode(" "))
            getCachedUserInfo(usernameA.textContent).then((res) => {
                usernameA.before(makeBadge(res, new Date(time.getAttribute("datetime"))))
                usernameA.before(document.createTextNode(" "))
                usernameA.title = `changesets_count: ${res['changesets']['count']}\naccount_created: ${res['account_created']}`

                document.querySelectorAll(".browse-tag-list tr").forEach(i => {
                    const key = i.querySelector("th")
                    if (!key) return
                    if (key.textContent === "changesets_count") {
                        function insertAllChangesets(info) {
                            const allChangesets = document.createElement("span")
                            allChangesets.textContent = `/${info['changesets']['count']}`
                            allChangesets.style.color = "gray"
                            allChangesets.title = "how many changesets does the user have in total"
                            i.querySelector("td").appendChild(allChangesets)
                        }

                        if (parseInt(i.querySelector("td").textContent) >= res['changesets']['count']) {
                            updateUserInfo(usernameA.textContent).then((res) => {
                                insertAllChangesets(res)
                            })
                        } else {
                            insertAllChangesets(res)
                        }
                    }
                })
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
            const time = metainfoHTML.querySelector("time")
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

            void restorePrevNextChangesetButtons(parseInt(changeset_id))
        }
        // compact changeset tags
        if (!document.querySelector(".browse-tag-list[compacted]")) {
            makeHashtagsClickable()
            shortOsmOrgLinks(document.querySelector("#sidebar_content h2 ~ div p"));
            let needUnhide = false
            document.querySelectorAll(".browse-tag-list tr").forEach(i => {
                const key = i.querySelector("th")
                if (!key) return
                i.querySelectorAll("a").forEach(i => i.tabIndex = -1)
                if (key.textContent === "host") {
                    if (i.querySelector("td").textContent === "https://www.openstreetmap.org/edit") {
                        i.style.display = "none"
                        i.classList.add("hidden-tag")
                    }
                } else if (key.textContent.startsWith("ideditor:")) {
                    key.title = key.textContent
                    key.textContent = key.textContent.replace("ideditor:", "iD:")
                } else if (key.textContent === "revert:id") {
                    if (i.querySelector("td").textContent.match(/^((\d+(;|…?$))+$)/)) {
                        i.querySelector("td").innerHTML = i.querySelector("td").innerHTML.replaceAll(/(\d+)(;|$)/g,
                            `<a href="/changeset/$1" class="changeset_link_in_changeset_tags">$1</a>$2`)
                    } else if (i.querySelector("td").textContent.match(/https:\/\/(www\.)?openstreetmap.org\/changeset\//g)) {
                        i.querySelector("td").innerHTML = i.querySelector("td").innerHTML.replaceAll(/>https:\/\/(www\.)?openstreetmap.org\/changeset\//g, ">")
                    }
                } else if (key.textContent === "revert:dmp:relation:id" || key.textContent === "revert:dmp:fail:relation:id") {
                    if (i.querySelector("td").textContent.match(/^((\d+(;|…?$))+$)/)) {
                        i.querySelector("td").innerHTML = i.querySelector("td").innerHTML.replaceAll(/(\d+)(;|$)/g,
                            `<a href="/relation/$1" class="relation_link_in_changeset_tags">$1</a>$2`)
                    }
                } else if (key.textContent === "revert:dmp:way:id" || key.textContent === "revert:dmp:fail:way:id") {
                    if (i.querySelector("td").textContent.match(/^((\d+(;|…?$))+$)/)) {
                        i.querySelector("td").innerHTML = i.querySelector("td").innerHTML.replaceAll(/(\d+)(;|$)/g,
                            `<a href="/way/$1" class="way_link_in_changeset_tags">$1</a>$2`)
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
                } else if (key.textContent === "hashtags" && i.querySelector("td").textContent.includes("#") && document.querySelector("#sidebar_content h2 ~ div p")?.textContent?.includes(i.querySelector("td").textContent)) {
                    i.style.display = "none"
                    i.classList.add("hidden-tag")
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
    if (primaryButtons?.getAttribute("name") === "subscribe") {
        primaryButtons.tabIndex = -1
    }
    if (primaryButtons && osm_server.url === prod_server.url) {
        const changeset_id = sidebar.innerHTML.match(/(\d+)/)[0];

        async function uncheck(changeset_id) {
            return await GM.xmlHttpRequest({
                url: `https://osmcha.org/api/v1/changesets/${changeset_id}/uncheck/`,
                headers: {
                    "Authorization": "Token " + await GM.getValue("OSMCHA_TOKEN"),
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
            const osmchaToken = await GM.getValue("OSMCHA_TOKEN")
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
                    "Authorization": "Token " + await GM.getValue("OSMCHA_TOKEN"),
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
            const osmchaToken = await GM.getValue("OSMCHA_TOKEN")
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
                    "Authorization": "Token " + await GM.getValue("OSMCHA_TOKEN"),
                },
                method: "PUT",
            });
            await updateReactions()
        }

        async function updateReactions() {
            const res = await GM.xmlHttpRequest({
                url: "https://osmcha.org/api/v1/changesets/" + changeset_id + "/",
                method: "GET",
                headers: {
                    "Authorization": "Token " + await GM.getValue("OSMCHA_TOKEN"),
                },
                responseType: "json"
            })
            if (res.status === 404) {
                likeImg.title = "Changeset not found in OSMCha database.\nEither OSMCha did not have time to process this changeset, or it is too old."
                dislikeImg.title = "Changeset not found in OSMCha database.\nEither OSMCha did not have time to process this changeset, or it is too old."
                console.warn("Changeset not found in OSMCha database") // todo show alert/title
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
    document.querySelectorAll('#sidebar_content article[id^=c] small > a[href^="/user/"]').forEach(elem => {
        getCachedUserInfo(elem.textContent).then(info => {
            elem.before(makeBadge(info, new Date(elem.nextElementSibling.getAttribute("datetime"))))
            elem.title = `changesets_count: ${info['changesets']['count']}\naccount_created: ${info['account_created']}`
        })
    })
    // fixme dont work loggined
    document.querySelectorAll("#sidebar_content h2 ~ div > div:has([name=subscribe],[name=unsubscribe]) ~ article div").forEach(c => {
        c.innerHTML = c.innerHTML.replaceAll(/((changesets )((\d+)([,. ])(\s|$|<\/))+|changeset \d+)/gm, (match) => {
            return match.replaceAll(/(\d+)/g, `<a href="/changeset/$1" class="changeset_link_in_comment">$1</a>`)
        }).replaceAll(/>https:\/\/(www\.)?openstreetmap.org\//g, ">osm.org/")
    })
    makeHeaderPartsClickable()
}

function setupRevertButton() {
    if (!location.pathname.startsWith("/changeset")) return;
    let timerId = setInterval(() => {
        if (addRevertButton()) clearInterval(timerId)
    }, 100);
    setTimeout(() => {
        clearInterval(timerId);
        console.debug('stop try add revert button');
    }, 3000);
    addRevertButton();
}

function showSearchForm() {
    document.querySelector("#sidebar .search_forms")?.removeAttribute("hidden");
}

function hideSearchForm() {
    if (location.pathname.startsWith("/search") || location.pathname.startsWith("/directions")) return;
    if (!document.querySelector("#sidebar .search_forms")?.hasAttribute("hidden")) {
        document.querySelector("#sidebar .search_forms")?.setAttribute("hidden", "true")
    }

    document.querySelector(".sidebar-close-controls .btn-close:not(.hotkeyed)")?.addEventListener("click", () => {
        showSearchForm()
        cleanAllObjects()
    })
    document.querySelector(".sidebar-close-controls .btn-close:not(.hotkeyed)")?.classList?.add("hotkeyed")
    document.querySelector("h1 .icon-link:not(.hotkeyed)")?.addEventListener("click", () => {
        showSearchForm()
        cleanAllObjects()
    })
    document.querySelector("h1 .icon-link:not(.hotkeyed)")?.classList?.add("hotkeyed")
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
            if (j.childNodes[0].textContent === j.getAttribute("natural_text")) {
                j.childNodes[0].textContent = j.getAttribute("datetime")
                timestampMode = "datetime"
            } else {
                j.childNodes[0].textContent = j.getAttribute("natural_text")
                timestampMode = "natural_text"
            }
            if (j.querySelector(".timeback-btn") && j.nextElementSibling?.id !== "timeback-btn") {
                j.querySelector(".timeback-btn").style.display = ""
            }
        }

        document.querySelectorAll("time").forEach(switchElement)
    }

    const isObjectPage = location.pathname.includes("node") || location.pathname.includes("way") || location.pathname.includes("relation")
    const isNotePage = location.pathname.includes("note")

    function openMapStateInOverpass(elem, adiff = false) {
        const {lng: lon, lat: lat} = getMap().getCenter()
        const zoom = getMap().getZoom();
        const query = `// via changeset closing time
[${adiff ? "adiff" : "date"}:"${elem.getAttribute("datetime")}"]; 
(
  node({{bbox}});
  way({{bbox}});
  //relation({{bbox}});
);
(._;>;);
out meta;
`;
        window.open(`${overpass_server.url}?Q=${encodeURI(query)}&C=${lat};${lon};${zoom}${zoom > 15 ? "&R" : ""}`, "_blank")
    }

    document.querySelectorAll("time:not([switchable])").forEach(i => {
        if (i.title !== "") {
            i.title += `\n\n`
        }
        i.title += `Click for change time format`
        i.title += `\nClick with ctrl for open the map state at the time of ${isObjectPage ? "version was created" : (isNotePage ? "note was created" : "changeset was closed")}\nClick with Alt for view adiff`

        function clickEvent(e) {
            if (e.metaKey || e.ctrlKey || e.altKey) {
                if (window.getSelection().type === "Range") {
                    return
                }
                openMapStateInOverpass(i, e.altKey)
            } else {
                switchTimestamp()
            }
        }

        i.addEventListener("click", clickEvent);
    })
    document.querySelectorAll("time:not([switchable])").forEach(i => {
        i.setAttribute("switchable", "true")
        const btn = document.createElement("a")
        btn.classList.add("timeback-btn");
        btn.title = `Open the map state at the time of ${isObjectPage ? "version was created" : "changeset was closed"}`
        btn.textContent = " 🕰";
        btn.style.cursor = "pointer"
        btn.style.display = "none"
        btn.style.userSelect = "none"
        btn.onclick = (e) => {
            e.stopPropagation()
            openMapStateInOverpass(i, e.altKey)
        }
        i.appendChild(btn);
    })

}

// noinspection CssUnusedSymbol,CssUnresolvedCustomProperty
const compactSidebarStyleText = `
    .changesets p {
      margin-bottom: 0px !important;
      font-weight: 788;
      font-style: italic;
      font-size: 14px !important;
      font-synthesis: none;
    }
    #sidebar_content > div:not(.changesets) .changeset_num_comments {
        display: none !important;
    }
    @media ${mediaQueryForWebsiteTheme} {
        .changesets time {
            color: darkgray;
        }
                
        .changesets p {
            font-weight: 400;
        }
        
        span:has(.changeset_id.custom-changeset-id-click) {
            color: #767676 !important;
        }
        
        .changeset_id.custom-changeset-id-click {
            color: #767676 !important;
        }
    }
    #sidebar_content h2 ~ div > p:nth-of-type(1) {
        font-size: 14px !important;
        font-style: italic;
        font-synthesis: none;  
    }
    
    #element_versions_list div > p:nth-of-type(1) {
        font-size: 14px !important;
        font-style: italic;
        font-synthesis: none;  
    }
    
    .hidden-comments-badge {
        display: none !important;
    }
    
    .better-diff-icon {
        position: relative;
        top: 2px;
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
    
${copyAnimationStyles}
    
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
    
    .note-tag {
      font-weight: bold;
    }
  
    @media ${mediaQueryForWebsiteTheme} {
      .fixme-tag {
        color: #ff5454 !important;
        font-weight: unset;
      }
            
      .note-tag {
        background: black !important;
        font-weight: unset;
      }
    }
    
    @media ${mediaQueryForWebsiteTheme} {
        table.browse-tag-list tr td[colspan="2"]{
          background: var(--bs-body-bg) !important;
        }
    }
    
    .sidebar-close-controls.position-relative .position-absolute {
        padding: 1.5rem !important;
        padding-bottom: 1.3rem !important;
        padding-top: 1.4rem !important;
        padding-left: 1.3rem !important;
    }
    
    .way-last-version-node:hover, .relation-last-version-member:hover, .node-last-version-parent:hover {
        background-color: rgba(244, 244, 244);
    }
    
    @media ${mediaQueryForWebsiteTheme} {
        .way-last-version-node:hover, .relation-last-version-member:hover, .node-last-version-parent:hover {
            background-color: rgb(14, 17, 19);
        }  
    }
    
    .copy-changesets-ids-btn {
        padding-left: 5px;
        padding-right: 5px;
    }
    
    #mouse-trap {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: auto;
        cursor: none;
        z-index: 999999;
        /* background: rgba(255, 0, 0, 0.3); */
        background: transparent;
    }
    `;

let styleForSidebarApplied = false

function addCompactSidebarStyle() {
    if (styleForSidebarApplied) return;
    styleForSidebarApplied = true;
    injectCSSIntoOSMPage(compactSidebarStyleText);
}

async function getChangesetComments(changeset_id) {
    const res = await fetchJSONWithCache(osm_server.apiBase + "changeset" + "/" + changeset_id + ".json?include_discussion=true")
    if (res.status === 509) {
        error509Handler(res)
    } else {
        return res['changeset']['comments'];
    }
}

function setupCompactChangesetsHistory() {
    if (!location.pathname.includes("/history") && !location.pathname.startsWith("/changeset")) {
        if (!styleForSidebarApplied && (location.pathname.startsWith("/node")
            || location.pathname.startsWith("/way")
            || location.pathname.startsWith("/relation"))) {
            addCompactSidebarStyle();
        }
        return;
    }

    if (location.pathname.startsWith("/changeset")) {
        externalizeLinks(document.querySelectorAll("#sidebar_content p:first-of-type a"))
        externalizeLinks(document.querySelector("#sidebar_content ul")?.querySelectorAll("a:not(.page-link)"))
    }

    addCompactSidebarStyle();

    // увы, инвалидация в этом месте ломает зум при загрузке объекте самим сайтом
    // try {
    // getMap()?.invalidateSize()
    // } catch (e) {
    // }

    function handleNewChangesets() {
        if (!location.pathname.includes("/history")) {
            return
        }
        // remove useless
        document.querySelectorAll("#sidebar ol .overflow-hidden:not(.better)").forEach((e) => {
            e.classList.add("better")
            e.childNodes[0].textContent = ""
            e.classList.remove("pt-3")
            const badgesDiv = e.nextElementSibling
            if (badgesDiv) {
                badgesDiv.classList.remove("flex-column")
                badgesDiv.classList.add("flex-row")
                badgesDiv.style.gap = "5px"
                if (badgesDiv.querySelector(".changeset_line")) {
                    badgesDiv.querySelector(".changeset_line").style.flexDirection = "row-reverse"
                }
            }
            const changesBadge = badgesDiv.querySelector("span:not(.changeset_num_comments) svg")
            if (changesBadge && !changesBadge.classList.contains("better-diff-icon")) {
                changesBadge.outerHTML = "<svg class=\"lucide lucide-diff better-diff-icon\" xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 3v14\"/><path d=\"M5 10h14\"/><path d=\"M5 21h14\"/></svg>"
                changesBadge.style.position = "relative";
                changesBadge.style.top = "3px";
            }
            const changesetIDspan = badgesDiv?.querySelector('a[href^="/changeset/"]:not([rel])')?.parentElement
            if (changesetIDspan) {
                e.appendChild(document.createTextNode("·"))
                e.appendChild(changesetIDspan)
            }
            const wrapper = document.createElement("div")
            wrapper.classList.add("d-flex", "flex-nowrap", "gap-3", "justify-content-between", "align-items-end")
            e.parentElement.appendChild(wrapper)
            wrapper.appendChild(e)
            wrapper.appendChild(badgesDiv)
        })
        makeTimesSwitchable();
        hideSearchForm();

        document.querySelectorAll("ol li a.changeset_id bdi:not(.compacted)").forEach(description => {
            description.classList.add("compacted")
            description.textContent = shortOsmOrgLinksInText(description.textContent)
        })

        setTimeout(async () => {
            for (const elem of document.querySelectorAll("ol li:not(:has(.comment)):not(.comments-loaded)")) {
                elem.classList.add("comments-loaded")
                const commentsBadge = elem.querySelector(".changeset_num_comments")
                commentsBadge.querySelector("svg").outerHTML = `<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M2.678 11.894a1 1 0 0 1 .287.801 11 11 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8 8 0 0 0 8 14c3.996 0 7-2.807 7-6s-3.004-6-7-6-7 2.808-7 6c0 1.468.617 2.83 1.678 3.894m-.493 3.905a22 22 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a10 10 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105"></path></svg>`
                const commentsCount = parseInt(commentsBadge.firstChild.textContent.trim());
                if (commentsCount) {
                    if (commentsCount > 3) {
                        commentsBadge.firstElementChild.style.setProperty("color", "red", "important")
                    } else if (commentsCount > 1) {
                        commentsBadge.firstElementChild.style.setProperty("color", "#ff7800", "important")
                    } else if (commentsCount > 0) {
                        commentsBadge.firstElementChild.style.setProperty("color", "#ffae00", "important")
                    }

                    const changeset_id = elem.querySelector(".changeset_id").href.match(/\/(\d+)/)[1];
                    getChangesetComments(changeset_id).then(res => {
                        res.forEach((comment, idx) => {
                            const commentElem = document.createElement("div");
                            commentElem.classList.add("comment")
                            commentElem.style.fontSize = "0.7rem"
                            commentElem.style.borderTopColor = "#0000"
                            commentElem.style.borderTopStyle = "solid"
                            commentElem.style.borderTopWidth = "1px"
                            if (idx !== 0) {
                                commentElem.style.display = "none"
                            }
                            elem.appendChild(commentElem)

                            const userLink = document.createElement("a")
                            userLink.href = osm_server.url + "/user/" + encodeURI(comment["user"]);
                            userLink.textContent = comment["user"];
                            commentElem.appendChild(userLink);
                            getCachedUserInfo(comment["user"]).then((res) => {
                                const badge = makeBadge(res /* fixme */)
                                const svg = badge.querySelector("svg")
                                if (svg) {
                                    badge.style.marginLeft = "-4px"
                                    badge.style.height = "1rem";
                                    badge.style.float = "left";
                                    svg.style.transform = "scale(0.7)"
                                }
                                userLink.before(badge)
                            })
                            let shortText = shortOsmOrgLinksInText(comment["text"])
                            if (shortText.length > 500) {
                                const text = document.createElement("span")
                                text.textContent = " " + shortText.slice(0, 500)
                                commentElem.appendChild(text);
                                const more = document.createElement("span")
                                more.textContent = "..."
                                more.title = "Click for view more"
                                more.style.cursor = "pointer"
                                more.style.color = "rgba(var(--bs-link-color-rgb), var(--bs-link-opacity, 1))"
                                more.onclick = () => {
                                    more.remove()
                                    text.textContent = " " + shortText
                                }
                                commentElem.appendChild(more);
                            } else {
                                commentElem.appendChild(document.createTextNode(" " + shortText));
                            }
                        })

                        commentsBadge.firstElementChild.style.cursor = "pointer"

                        let state = (commentsCount === 1 ? "" : "none")
                        commentsBadge.firstElementChild.onclick = () => {
                            elem.querySelectorAll(".comment").forEach(comment => {
                                if (state === "none") {
                                    comment.style.display = ""
                                } else {
                                    comment.style.display = "none"
                                }
                            })
                            state = (state === "none") ? "" : "none"
                        }
                        commentsBadge.firstElementChild.title = ""
                        res.forEach(comment => {
                            const shortText = shortOsmOrgLinksInText(comment["text"])
                            commentsBadge.firstElementChild.title += `${comment["user"]}:\n${shortText}\n\n`
                        })
                        commentsBadge.firstElementChild.title = commentsBadge.firstElementChild.title.trimEnd()
                    });
                } else {
                    commentsBadge.classList.add("hidden-comments-badge")
                }
            }
        });
    }

    if (!location.pathname.startsWith("/node") && !location.pathname.startsWith("/way") && !location.pathname.startsWith("/relation")) {
        sidebarObserver?.disconnect();
        handleNewChangesets();
        sidebarObserver = new MutationObserver(handleNewChangesets);
        if (document.querySelector('#sidebar_content') && !location.pathname.startsWith("/changeset")) {
            sidebarObserver.observe(document.querySelector('#sidebar_content'), {childList: true, subtree: true});
        }
    }
}

/**
 *
 * @param {string} text
 * @param {boolean} strict
 * @return {Object.<string, string>}
 */
function buildTags(text, strict = false) {
    const lines = text.split('\n');
    let json = {};
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        let eqPos = line.indexOf('=');
        if (eqPos <= 0 || eqPos === line.length - 1) {
            eqPos = line.indexOf("\t");
            if (eqPos <= 0 || eqPos === line.length - 1) {
                if (strict && line.trim() !== '') {
                    throw `Empty key or value in line №${i}: ${line}`;
                }
                continue;
            }
        }
        const k = line.substring(0, eqPos).trim();
        const v = line.substring(eqPos + 1).trim();
        if (v === '' || k === '') {
            if (strict && line.trim() !== '') {
                throw `Empty key or value in line №${i + 1}: ${line}`;
            }
            continue;
        }
        json[k] = v.replaceAll('\\\\', '\n');
    }
    return json;
}


function makeTextareaFromTagsTable(table) {
    const textarea = document.createElement("textarea")
    table.querySelectorAll("tr:not(.add-tag-row)").forEach(i => {
        if (i.querySelector("th").textContent.trim() === "" || i.querySelector("td").textContent.trim() === "") return
        textarea.value += `${i.querySelector("th").textContent}=${i.querySelector("td").textContent.replaceAll('\\\\', '\n')}\n`
    })
    textarea.value = textarea.value.trim()
    textarea.rows = 5
    return textarea
}

function addResolveNotesButton() {
    if (!location.pathname.includes("/note")) return
    if (location.pathname.includes("/note/new")) {
        if (!document.querySelector("#sidebar_content form")) {
            return
        }
        if (newNotePlaceholder && document.querySelector(".note form textarea")) {
            document.querySelector(".note form textarea").textContent = newNotePlaceholder
            document.querySelector(".note form textarea").selectionEnd = 0
            newNotePlaceholder = null
        }
        if (document.querySelector(".add-new-object-btn")) return
        let b = document.createElement("span");
        b.classList.add("add-new-object-btn", "btn", "btn-primary");
        b.textContent = "➕";
        if (!getMap() || !getMap().getZoom) {
            b.style.display = "none"
            interceptMapManually().then(() => {
                b.style.display = ""
            })
        }
        b.title = `Add new object on map\nPaste tags in textarea\nkey=value\nkey2=value2\n...`
        document.querySelector("#sidebar_content form div:has(input)").appendChild(b);
        b.before(document.createTextNode("\xA0"));
        b.onclick = (e) => {
            e.stopImmediatePropagation()
            const auth = makeAuth();

            console.log("Opening changeset");

            let tagsHint = ""
            let tags;
            try {
                tags = buildTags(document.querySelector("#sidebar_content form textarea").value, true)
            } catch (e) {
                alert(e)
                return
            }
            if (Object.entries(tags).length === 0) {
                alert("Textarea not contains any tag")
                return
            }

            for (const i of Object.entries(tags)) {
                if (mainTags.includes(i[0])) {
                    tagsHint = tagsHint + ` ${i[0]}=${i[1]}`;
                    break
                }
            }
            for (const i of Object.entries(tags)) {
                if (i[0] === "name") {
                    tagsHint = tagsHint + ` ${i[0]}=${i[1]}`;
                    break
                }
            }
            const changesetTags = {
                'created_by': `better osm.org v${GM_info.script.version}`,
                'comment': tagsHint !== "" ? `Create${tagsHint}` : `Create node`
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

                const nodePayload = document.createElement('osm');
                const node = document.createElement("node")
                nodePayload.appendChild(node)
                node.setAttribute("changeset", changesetId)

                const l = [];
                getMap().eachLayer(intoPageWithFun(i => l.push(i)))
                const {
                    lat: lat,
                    lng: lng
                } = l.find(i => !!i._icon && i._icon.classList.contains("leaflet-marker-draggable"))._latlng
                node.setAttribute("lat", lat)
                node.setAttribute("lon", lng)

                for (const tag of Object.entries(tags)) {
                    let tagElem = document.createElement("tag")
                    tagElem.setAttribute("k", tag[0])
                    tagElem.setAttribute("v", tag[1])
                    node.appendChild(tagElem)
                }
                const nodeStr = new XMLSerializer().serializeToString(nodePayload).replace(/xmlns="[^"]+"/, '');
                auth.xhr({
                    method: 'POST',
                    path: osm_server.apiBase + "nodes",
                    prefix: false,
                    content: nodeStr,
                    headers: {"Content-Type": "application/xml; charset=utf-8"},
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
                            window.location = osm_server.url + '/changeset/' + changesetId
                        }
                    });
                });
            });
        }
        return
    }
    if (document.querySelector('.resolve-note-done')) return true;
    if (document.querySelector('#timeback-btn')) return true;
    resetSearchFormFocus();

    document.querySelectorAll('#sidebar_content a[href^="/user/"]').forEach(elem => {
        getCachedUserInfo(elem.textContent).then(info => {
            elem.before(makeBadge(info, new Date(elem.parentElement.querySelector("time")?.getAttribute("datetime") ?? new Date())))
            elem.title = `changesets_count: ${info['changesets']['count']}\naccount_created: ${info['account_created']}`
        })
    })
    externalizeLinks(document.querySelectorAll(".overflow-hidden a"))

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
        if (organicmapsDate || mapsmeDate) {
            btn.title = "Open the map state at the time of map snapshot"
        } else {
            btn.title = "Open the map state at the time of note creation"
        }
        btn.textContent = " 🕰";
        btn.style.cursor = "pointer"
        document.querySelector("#sidebar_content time").after(btn);
        btn.onclick = () => {
            window.open(`${overpass_server.url}?Q=${encodeURI(query)}&C=${lat};${lon};${zoom}&R`)
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

    makeHashtagsInNotesClickable()
}

function setupResolveNotesButton(path) {
    if (!path.startsWith("/note")) return;
    let timerId = setInterval(addResolveNotesButton, 100);
    setTimeout(() => {
        clearInterval(timerId);
        console.debug('stop try add resolve note button');
    }, 3000);
    addResolveNotesButton();
}

let updateNotesLayer = null;

function addNotesFiltersButtons() {
    if (document.getElementById("notes-filter")) {
        return
    }
    const noteLabel = Array.from(document.querySelectorAll(".overlay-layers label"))[0]
    if (!noteLabel) {
        return
    }
    const checkbox = noteLabel.querySelector("input")
    const filters = document.createElement("div")

    function updateNotesFilters() {
        if (checkbox.checked) {
            filters.style.display = ""
            getWindow().notesDisplayName = filterByUsername.value;
            getWindow().notesQFilter = filterByString.value;
            getWindow().notesClosedFilter = "";
        } else {
            filters.style.display = "none"
            getWindow().notesDisplayName = "";
            getWindow().notesQFilter = "";
            getWindow().notesClosedFilter = "";
        }
    }

    updateNotesLayer = function () {
        updateNotesFilters()
        getMap().fire("moveend")
    }

    checkbox.onchange = updateNotesFilters
    if (!checkbox.checked) {
        return
    }
    filters.id = "notes-filter"
    filters.style.display = "none"

    const filterByString = document.createElement("input")
    filterByString.type = "input"
    filterByString.id = "filter-notes-by-string"
    filterByString.placeholder = "word in notes"
    filterByString.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            updateNotesLayer()
        }
    })

    const filterByUsername = document.createElement("input")
    filterByUsername.type = "input"
    filterByUsername.placeholder = "username"
    filterByUsername.id = "filter-notes-by-username"
    filterByUsername.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            updateNotesLayer()
        }
    })

    filters.appendChild(filterByString)
    filters.appendChild(filterByUsername)

    noteLabel.after(filters)
    updateNotesFilters()
}

function setupNotesFiltersButtons() {
    let timerId = setInterval(addNotesFiltersButtons, 100);
    setTimeout(() => {
        clearInterval(timerId);
        console.debug('stop try add notes filters buttons');
    }, 3000);
    addNotesFiltersButtons();
}

let nodeMoverMenuItem;

function removePOIMoverMenu() {
    if (!nodeMoverMenuItem) return
    try {
        nodeMoverMenuItem = getMap().contextmenu.removeItem(nodeMoverMenuItem)
        nodeMoverMenuItem = null
    } catch { /* empty */
    }
}

function addDeleteButton() {
    if (!location.pathname.startsWith("/node/") && !location.pathname.startsWith("/relation/")) return;
    if (location.pathname.includes("/history")) return;

    if (document.querySelector('.delete_object_button_class')) return true;

    const match = location.pathname.match(/(node|relation)\/(\d+)/);
    if (!match) return;
    const object_type = match[1];
    const object_id = match[2];

    const auth = makeAuth();
    const link = document.createElement('a');
    link.text = ['ru-RU', 'ru'].includes(navigator.language) ? "Выпилить!" : "Delete";
    link.href = "";
    link.classList.add("delete_object_button_class");
    // skip deleted
    if (object_type === "node") {
        if (document.querySelectorAll("#sidebar_content > div:first-of-type h4").length < 2 && document.querySelector("#element_versions_list > div .latitude") === null) {
            return;
        }
    } else if (object_type === "relation") {
        if (document.querySelectorAll("#sidebar_content > div:first-of-type h4").length < 2) {
            return;
        }
    }
    // skip having a parent
    if (object_type === "node" && document.querySelectorAll("#sidebar_content > div:first-of-type details").length !== 0) {
        return;
    } else if (object_type === "relation") {
        if (document.querySelectorAll("#sidebar_content > div:first-of-type details").length > 1) {
            return;
        }
        if (Array.from(document.querySelectorAll(".browse-tag-list th")).some(i => i.textContent === "wikidata")) {
            return
        }
        const dangerousType = Array.from(document.querySelectorAll(".browse-tag-list td")).map(i => i.textContent).find(i => ["route_master", "route", "multipolygon", "public_transport"].includes(i))
        if (dangerousType) {
            if (dangerousType === "multipolygon") {
                if (document.querySelectorAll("#sidebar_content > div:first-of-type details li").length > 1) {
                    return
                }
            } else {
                return
            }
        }
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

        console.log("Getting info");

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
                if (i.getAttribute("k") === "type") {
                    tagsHint = tagsHint + ` ${i.getAttribute("k")}=${i.getAttribute("v")}`;
                }
            }
            for (const i of tags) {
                if (i.getAttribute("k") === "restriction") {
                    tagsHint = tagsHint + ` ${i.getAttribute("k")}=${i.getAttribute("v")}`;
                }
            }
            for (const i of tags) {
                if (i.getAttribute("k") === "name") {
                    tagsHint = tagsHint + ` ${i.getAttribute("k")}=${i.getAttribute("v")}`;
                    break
                }
            }
            const changesetTags = {
                'created_by': `better osm.org v${GM_info.script.version}`,
                'comment': tagsHint !== "" ? `Delete${tagsHint}` : `Delete ${object_type} ${object_id}`
            };

            if (object_type === "relation" && !prompt("⚠️ Delete relation?\n\nChangeset comment:", changesetTags['comment'])) {
                return
            }

            let changesetPayload = document.implementation.createDocument(null, 'osm');
            let cs = changesetPayload.createElement('changeset');
            changesetPayload.documentElement.appendChild(cs);
            tagsToXml(changesetPayload, cs, changesetTags);
            const chPayloadStr = new XMLSerializer().serializeToString(changesetPayload);

            console.log("Opening changeset");

            auth.xhr({
                method: 'PUT',
                path: osm_server.apiBase + 'changeset/create',
                prefix: false,
                content: chPayloadStr,
                headers: {"Content-Type": "application/xml; charset=utf-8"}
            }, function (err1, result) {
                if (err1) {
                    console.log({changesetError: err1});
                    return
                }
                const changesetId = result;
                console.log(changesetId);
                objectInfo.children[0].children[0].setAttribute('changeset', changesetId);
                auth.xhr({
                    method: 'DELETE',
                    path: osm_server.apiBase + object_type + '/' + object_id,
                    prefix: false,
                    content: objectInfo,
                    headers: {"Content-Type": "application/xml; charset=utf-8"}
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
    if (GM_config.get("OneClickDeletor") || object_type === "relation") {
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
    setTimeout(async () => {
        if (object_type !== "node") return
        removePOIMoverMenu()
        await sleep(110)
        if (!getMap || !getMap().contextmenu || !measurerAdded) {
            await sleep(1110)
        }
        nodeMoverMenuItem = getMap().contextmenu.addItem(intoPageWithFun({
            text: "Move node to here",
            callback: async function moveNode(e) {
                let match = location.pathname.match(/(node)\/(\d+)/);
                if (!match) return;
                let object_type = match[1];
                let object_id = match[2];
                const auth = makeAuth();
                if (!confirm("⚠️ move node?")) {
                    return
                }
                const {lat: newLat, lng: newLon} = e.latlng
                console.log("Opening changeset");
                const rawObjectInfo = (await (await auth.fetch(osm_server.apiBase + object_type + '/' + object_id, {
                    method: 'GET',
                    prefix: false,
                })).text());
                const objectInfo = (new DOMParser()).parseFromString(rawObjectInfo, "text/xml")
                const dist = Math.round(getDistanceFromLatLonInKm(
                    parseFloat(objectInfo.querySelector("node").getAttribute("lat")),
                    parseFloat(objectInfo.querySelector("node").getAttribute("lon")),
                    newLat,
                    newLon,
                ) * 1000) / 1000;
                if (dist > 50) {
                    if (!confirm(`⚠️ ${dist} kilometers.\n\nARE YOU SURE?`)) {
                        return
                    }
                }
                objectInfo.querySelector("node").setAttribute("lat", newLat)
                objectInfo.querySelector("node").setAttribute("lon", newLon)

                const changesetTags = {
                    'created_by': `better osm.org v${GM_info.script.version}`,
                    'comment': "Moving node"
                };

                let changesetPayload = document.implementation.createDocument(null, 'osm');
                let cs = changesetPayload.createElement('changeset');
                changesetPayload.documentElement.appendChild(cs);
                tagsToXml(changesetPayload, cs, changesetTags);
                const chPayloadStr = new XMLSerializer().serializeToString(changesetPayload);

                const changesetId = await auth.fetch(osm_server.apiBase + 'changeset/create', {
                    method: 'PUT',
                    prefix: false,
                    body: chPayloadStr
                }).then((res) => {
                    if (res.ok) return res.text();
                    throw new Error(res);
                });
                console.log(changesetId);


                try {
                    objectInfo.children[0].children[0].setAttribute('changeset', changesetId);

                    const objectInfoStr = new XMLSerializer().serializeToString(objectInfo).replace(/xmlns="[^"]+"/, '')
                    console.log(objectInfoStr);
                    await auth.fetch(osm_server.apiBase + object_type + '/' + object_id, {
                        method: 'PUT',
                        prefix: false,
                        body: objectInfoStr
                    }).then(async (res) => {
                        const text = await res.text()
                        if (res.ok) return text;
                        alert(text)
                        throw new Error(text);
                    });
                } finally {
                    await auth.fetch(osm_server.apiBase + 'changeset/' + changesetId + '/close', {
                        method: 'PUT',
                        prefix: false
                    });
                    window.location.reload();
                }
            }
        }))
    })
}

function setupDeletor(path) {
    if (!path.startsWith("/node/") && !path.startsWith("/relation/")) return;
    let timerId = setInterval(addDeleteButton, 100);
    setTimeout(() => {
        clearInterval(timerId);
        console.debug('stop try add delete button');
    }, 3000);
    addDeleteButton();
}

let mapDataSwitcherUnderSupervision = false

function hideNoteHighlight() {
    let g = document.querySelector("#map g");
    if (!g || g.childElementCount === 0) return;
    let mapDataCheckbox = document.querySelector(".layers-ui #label-layers-data input")
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

function setupHideNoteHighlight() {
    if (!location.pathname.startsWith("/note/")) return;
    let timerId = setInterval(hideNoteHighlight, 1000);
    setTimeout(() => {
        clearInterval(timerId);
        console.debug('stop removing note highlight');
    }, 5000);
    hideNoteHighlight();
}

//<editor-fold desc="satellite switching">
const OSMPrefix = "https://tile.openstreetmap.org/"
let BaseLayerPrefix = OSMPrefix
const ESRIPrefix = "https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/"
const ESRIBetaPrefix = "https://clarity.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/"
let SatellitePrefix = ESRIPrefix
let SAT_MODE = "🛰"
let MAPNIK_MODE = "🗺️"
let currentTilesMode = MAPNIK_MODE;
let tilesObserver = undefined;

const OSMGPSPrefix = "https://gps.tile.openstreetmap.org/lines/"
const StravaPrefix = "https://content-a.strava.com/identified/globalheat/all/blue/"
let currentOverlayModeIsStrava = false;
let overlayTilesObserver = undefined;

function invertTilesMode(mode) {
    return mode === "🛰" ? "🗺️" : "🛰";
}

function invertOverlayMode(mode) { // fixme
    return currentOverlayModeIsStrava = !currentOverlayModeIsStrava;
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

function parseOSMGPSTileURL(url) {
    let match = url.match(new RegExp(`${OSMGPSPrefix}(\\d+)\\/(\\d+)\\/(\\d+)\\.png`))
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

function parseStravaTileURL(url) {
    let match = url.match(new RegExp(`${StravaPrefix}(\\d+)\\/(\\d+)\\/(\\d+)`))
    if (!match) {
        return false
    }
    return {
        x: match[3],
        y: match[2],
        z: match[1],
    }
}

const fetchBlobWithCache = (() => {
    const cache = new Map();

    return async url => {
        if (cache.has(url)) {
            return cache.get(url);
        }

        const promise = GM.xmlHttpRequest({
            url: url,
            responseType: "blob"
        })
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

let needStravaAuth = false;

async function bypassChromeCSPForImagesSrc(imgElem, url, isStrava = true) {
    const res = await fetchBlobWithCache(url);
    if (res.status !== 200) {
        if (!GM_config.get("OverzoomForDataLayer")) {
            return
        }
        if (isStrava && res.status === 403) {
            if (!needStravaAuth) {
                needStravaAuth = true;
                alert("Need login in Strava for access to heatmap")
                window.open("https://www.strava.com/maps/global-heatmap", "_blank")
            }
            return
        }
        if (getMap().getZoom() >= 18) {
            const zoomStr = url.match(/(tile|org)\/([0-9]+)/)[2]
            if (zoomStr) {
                const tileZoom = parseInt(zoomStr)
                console.log(tileZoom);
                getMap().setZoom(Math.min(19, Math.min(getMap().getZoom(), tileZoom - 1)))
            }
        }
        tileErrorHandler({currentTarget: imgElem}, url)
        imgElem.src = "/dev/null";
        return;
    }

    const blob = res.response;

    const satTile = await new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
    });
    if (currentTilesMode === SAT_MODE || currentOverlayModeIsStrava) {
        imgElem.src = satTile;
    }
}

let blankSuffix = "";

function switchESRIbeta() {
    const NewSatellitePrefix = SatellitePrefix === ESRIPrefix ? ESRIBetaPrefix : ESRIPrefix;
    document.querySelectorAll(".leaflet-tile").forEach(i => {
        if (i.nodeName !== 'IMG') {
            return;
        }
        let xyz = parseESRITileURL(!needBypassSatellite ? i.src : i.getAttribute("real-url") ?? "")
        if (!xyz) return
        const newUrl = NewSatellitePrefix + xyz.z + "/" + xyz.y + "/" + xyz.x + blankSuffix
        if (!needBypassSatellite) {
            i.src = newUrl;
        } else {
            bypassChromeCSPForImagesSrc(i, newUrl);
        }
    })
    SatellitePrefix = NewSatellitePrefix
    if (SatellitePrefix === ESRIBetaPrefix) {
        getMap()?.attributionControl?.setPrefix("ESRI Beta")
    } else {
        getMap()?.attributionControl?.setPrefix("ESRI")
    }
}

const needBypassSatellite = !isFirefox || GM_info.scriptHandler === "Violentmonkey";

function tileErrorHandler(e, url = null) {
    if (!GM_config.get("OverzoomForDataLayer")) {
        return
    }
    if (getMap().getZoom() >= 18) {
        if (e?.currentTarget?.src?.endsWith("/dev/null") && !url) {
            return
        }
        let tileURL = e?.currentTarget?.src?.match(/(tile|org)\/([0-9]+)/)
        if (!tileURL) {
            tileURL = e.currentTarget.getAttribute("real-url").match(/(tile|org)\/([0-9]+)/)
            console.log(e.currentTarget.getAttribute("real-url"));
        }
        const zoomStr = tileURL[2]
        if (zoomStr) {
            const tileZoom = parseInt(zoomStr)
            console.log(tileZoom);
            getMap().setZoom(Math.min(19, Math.min(getMap().getZoom(), tileZoom - 1)))
        }
    }
}

function makeSatelliteURL(x, y, z) {
    return SatellitePrefix + z + "/" + y + "/" + x + blankSuffix;
}

const retina = (window.retina || window.devicePixelRatio > 1);

function makeStravaURL(x, y, z) {
    return StravaPrefix + z + "/" + x + "/" + y + (retina ? "@2x" : "") + ".png";
}

function makeOSMURL(x, y, z) {
    return OSMPrefix + z + "/" + x + "/" + y + ".png";
}

function makeBaseLayerURL(x, y, z) {
    return makeOSMURL(x, y, z);
}

function makeOSMGPSURL(x, y, z) {
    return OSMGPSPrefix + z + "/" + x + "/" + y + ".png";
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
            // unsafeWindow.L.DomEvent.off(i, "error") // todo добавить перехватчик 404
            try {
                i.onerror = tileErrorHandler
            } catch { /* empty */
            }
            const newUrl = makeSatelliteURL(xyz.x, xyz.y, xyz.z)
            if (!needBypassSatellite) {
                i.src = newUrl;
            } else {
                i.setAttribute("real-url", newUrl);
            }
            if (needBypassSatellite) {
                bypassChromeCSPForImagesSrc(i, newUrl);
            }
            if (i.complete && !needBypassSatellite) {
                i.classList.add("no-invert");
            } else {
                i.addEventListener("load", e => {
                    e.target.classList.add("no-invert");
                }, {once: true})
            }
        } else {
            let xyz = parseESRITileURL(!needBypassSatellite ? i.src : i.getAttribute("real-url") ?? "")
            if (!xyz) return
            i.src = makeBaseLayerURL(xyz.x, xyz.y, xyz.z);
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
                    // unsafeWindow.L.DomEvent.off(node, "error")
                    try {
                        node.onerror = tileErrorHandler
                    } catch { /* empty */
                    }
                    const newURL = makeSatelliteURL(xyz.x, xyz.y, xyz.z)
                    if (!needBypassSatellite) {
                        node.src = newURL;
                    } else {
                        node.src = "/dev/null";
                    }
                    node.setAttribute("real-url", newURL);
                    if (needBypassSatellite) {
                        bypassChromeCSPForImagesSrc(node, newURL)
                    }
                    if (node.complete) {
                        node.classList.add("no-invert");
                    } else {
                        node.addEventListener("load", e => {
                            e.target.classList.add("no-invert");
                        }, {once: true})
                    }
                } else {
                    let xyz = parseESRITileURL(!needBypassSatellite ? node.src : node.getAttribute("real-url"))
                    if (!xyz) return
                    node.src = makeBaseLayerURL(xyz.x, xyz.y, xyz.z);
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


let osmTilesObserver = undefined;

function bypassCaches() {
    if (osmTilesObserver) {
        osmTilesObserver.disconnect();
    }
    document.querySelectorAll(".leaflet-tile").forEach(i => {
        if (i.nodeName !== 'IMG') {
            return;
        }
        let xyz = parseOSMTileURL(i.src)
        if (!xyz) return
        const newUrl = makeOSMURL(xyz.x, xyz.y, xyz.z)
        i.src = newUrl + "?bypassCache=" + new Date().getUTCSeconds();
        // fetch(newUrl, intoPage({cache: "reload"}))
        // const img = new Image()
        // img.src = newUrl + "?bypassCache=" + new Date().getUTCSeconds();
        // img.onload = () => {
        //     i.src = img.src
        // }
    })
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeName !== 'IMG') {
                    return;
                }
                let xyz = parseOSMTileURL(node.src)
                if (!xyz) return
                const newUrl = makeOSMURL(xyz.x, xyz.y, xyz.z)
                node.src = newUrl + "?bypassCache=" + new Date().getUTCSeconds();
                // const img = new Image()
                // img.src = newUrl + "?bypassCache=" + new Date().getUTCSeconds();
                // img.onload = () => {
                //     node.src = img.src
                // }
            });
        });
    });
    osmTilesObserver = observer;
    observer.observe(document.body, {childList: true, subtree: true});

}

function switchOverlayTiles() {
    if (overlayTilesObserver) {
        overlayTilesObserver.disconnect();
    }
    currentOverlayModeIsStrava = invertOverlayMode(currentOverlayModeIsStrava);
    if (currentOverlayModeIsStrava) {
        getMap()?.attributionControl?.setPrefix("Strava")
    } else {
        getMap()?.attributionControl?.setPrefix("")
    }
    document.querySelectorAll(".leaflet-tile").forEach(i => {
        if (i.nodeName !== 'IMG') {
            return;
        }
        if (currentOverlayModeIsStrava) {
            let xyz = parseOSMGPSTileURL(i.src)
            if (!xyz) return
            // unsafeWindow.L.DomEvent.off(i, "error") // todo добавить перехватчик 404
            try {
                i.onerror = tileErrorHandler
            } catch { /* empty */
            }
            const newUrl = makeStravaURL(xyz.x, xyz.y, xyz.z)
            i.setAttribute("real-url", newUrl);
            bypassChromeCSPForImagesSrc(i, newUrl, true);
            if (i.complete) {
                i.classList.add("no-invert");
            } else {
                i.addEventListener("load", e => {
                    e.target.classList.add("no-invert");
                }, {once: true})
            }
        } else {
            let xyz = parseStravaTileURL(i.getAttribute("real-url") ?? "")
            if (!xyz) return
            i.src = makeOSMGPSURL(xyz.x, xyz.y, xyz.z);
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
                if (currentOverlayModeIsStrava) {
                    let xyz = parseOSMGPSTileURL(node.src);
                    if (!xyz) return
                    // unsafeWindow.L.DomEvent.off(node, "error")
                    try {
                        node.onerror = tileErrorHandler
                    } catch { /* empty */
                    }
                    const newURL = makeStravaURL(xyz.x, xyz.y, xyz.z)
                    node.src = "/dev/null";
                    node.setAttribute("real-url", newURL);
                    bypassChromeCSPForImagesSrc(node, newURL, true)
                    if (node.complete) {
                        node.classList.add("no-invert");
                    } else {
                        node.addEventListener("load", e => {
                            e.target.classList.add("no-invert");
                        }, {once: true})
                    }
                } else {
                    let xyz = parseStravaTileURL(node.getAttribute("real-url"))
                    if (!xyz) return
                    node.src = makeOSMGPSURL(xyz.x, xyz.y, xyz.z);
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
    overlayTilesObserver = observer;
    observer.observe(document.body, {childList: true, subtree: true});
}

if (isOsmServer() && new URLSearchParams(location.search).has("sat-tiles")) {
    switchTiles()
    if (document.querySelector(".turn-on-satellite")) {
        document.querySelector(".turn-on-satellite").textContent = invertTilesMode(currentTilesMode)
    }
    if (document.querySelector(".turn-on-satellite-from-pane")) {
        document.querySelector(".turn-on-satellite-from-pane").textContent = invertTilesMode(currentTilesMode)
    }
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
                enableOverzoom()
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
    btnOnNotePage.title = "Switch between map and satellite images"

    document.querySelectorAll("h4")[0].appendChild(document.createTextNode("\xA0"));
    document.querySelectorAll("h4")[0].appendChild(btnOnNotePage);

    btnOnNotePage.onclick = () => {
        enableOverzoom()
        switchTiles();
        btnOnNotePage.textContent = invertTilesMode(currentTilesMode);
        btnOnPane.textContent = invertTilesMode(currentTilesMode);
    }
}

function setupSatelliteLayers() {
    let timerId = setInterval(addSatelliteLayers, 100);
    setTimeout(() => {
        clearInterval(timerId);
        console.debug('stop try add resolve note button');
    }, 3000);
    addSatelliteLayers();
}

//</editor-fold>

function makeElementHistoryCompact(forceState = null) {
    const shouldBeCompact = forceState !== null ? forceState : document.querySelector(".compact-toggle-btn").getAttribute("value") === "><";
    const forToggle = Array.from(document.querySelectorAll("table.browse-tag-list"))
    // workaround for https://github.com/deevroman/better-osm-org/pull/273#issuecomment-2830047660
    forToggle.slice(0, 8).forEach((el) => {
        el.classList.toggle("hide-non-modified-tags", shouldBeCompact)
    })
    setTimeout(() => {
        forToggle.slice(8).forEach((el) => {
            el.classList.toggle("hide-non-modified-tags", shouldBeCompact)
        })
    })
    document.querySelectorAll(".empty-version").forEach((el) => {
        el.classList.toggle("d-none", shouldBeCompact)
    })
    document.querySelectorAll(".preview-img-link img").forEach(i => {
        i.classList.toggle("d-none", shouldBeCompact)
    })
    document.querySelector(".compact-toggle-btn").setAttribute("value", shouldBeCompact ? "<>" : "><")
    document.querySelector(".compact-toggle-btn").innerHTML = shouldBeCompact ? expandModeSvg : compactModeSvg
}

/**
 * @param {Event} e
 * @param {string} text
 */
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
    userInfo.title = "Click for copy username"
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
    uid.title = "Click for copy user ID"
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

function yetAnotherWizard(s) {
    // const [k, v] = s.split("=")
    if (s[0] === "[") {
        return `nwr${s};`
    } else if (s.match(/^(node|way|rel|nwr|nw|nr|wr)/)) {
        return `${s}` + (s.slice(-1) === ";" ? "" : ";")
    } else {
        return `nwr[${s}];`
    }
}

let searchResultBBOX = null;

async function processOverpassQuery(query) {
    if (!query.length) return
    await GM.setValue("lastOverpassQuery", query)
    const bound = getMap().getBounds()
    const bboxString = [bound.getSouthWest().wrap().lat, bound.getSouthWest().wrap().lng, bound.getNorthEast().wrap().lat, bound.getNorthEast().wrap().lng]
    const bboxExpr = query[query.length - 1] !== "!" ? "[bbox:" + bboxString + "]" : ""
    if (query[query.length - 1] === "!") {
        query = query.slice(0, -1)
    }
    const prevTitle = document.title
    const newTitle = "◴" + prevTitle
    document.title = newTitle

    try {
        const overpassQuery = `[out:xml]${bboxExpr};
${yetAnotherWizard(query)}
//(._;>;);
out geom;
`
        console.log(overpassQuery);

        console.time("download overpass data")
        const res = await GM.xmlHttpRequest({
            // todo switcher
            url: overpass_server.apiUrl + "/interpreter?" + new URLSearchParams({
                data: overpassQuery
            }),
            responseType: "xml"
        })
        console.timeEnd("download overpass data")

        const xml = new DOMParser().parseFromString(res.response, "text/xml");
        const data_age = new Date(xml.querySelector("meta").getAttribute("osm_base"))
        console.log(data_age);

        getMap()?.invalidateSize()
        const bbox = searchResultBBOX = combineBBOXes(Array.from(xml.querySelectorAll("bounds")).map(i => {
            return {
                min_lat: i.getAttribute("minlat"),
                min_lon: i.getAttribute("minlon"),
                max_lat: i.getAttribute("maxlat"),
                max_lon: i.getAttribute("maxlon")
            }
        }))
        // const points = []
        Array.from(xml.querySelectorAll("node")).forEach(n => {
            const lat = parseFloat(n.getAttribute("lat"))
            const lon = parseFloat(n.getAttribute("lon"))
            // points.push([lon, lat])

            bbox.min_lat = min(bbox.min_lat, lat);
            bbox.min_lon = min(bbox.min_lon, lon);
            bbox.max_lat = max(bbox.max_lat, lat);
            bbox.max_lon = max(bbox.max_lon, lon);
        })
        console.log(bbox)
        if (bbox.min_lon === 10000000) {
            alert("invalid query")
        } else {
            console.time("render overpass response")
            fitBounds([[bbox.min_lat, bbox.min_lon], [bbox.max_lat, bbox.max_lon]])
            loadBannedVersions();
            preloadEditIcons()
            cleanAllObjects()
            getWindow().jsonLayer?.remove()
            jsonLayer?.remove()
            jsonLayer = renderOSMGeoJSON(xml, true)
            console.timeEnd("render overpass response")

            let statusPrefix = ""
            if (!xml.querySelector("node,way,relation")) {
                statusPrefix += "Empty result"
            }

            if ((new Date().getTime() - data_age.getTime()) / 1000 / 60 > 5) {
                if (statusPrefix === "") {
                    statusPrefix += "Currentless of the data: " + data_age.toLocaleDateString() + " " + data_age.toLocaleTimeString()
                } else {
                    statusPrefix += " | " + "Currentless of the data: " + data_age.toLocaleDateString() + " " + data_age.toLocaleTimeString()
                }
            }

            getMap()?.attributionControl?.setPrefix(statusPrefix)

            /*
            const centroid = [...points.map(i => turf.point(i)), ...Array.from(xml.querySelectorAll("way")).map(w => {
                return turf.center(
                    turf.polygon([Array.from(w.querySelectorAll("nd")).map(n => {
                        return [
                            parseFloat(n.getAttribute("lon")),
                            parseFloat(n.getAttribute("lat")),
                        ]
                    })])
                )
            })]
            const voronoiPolygons = turf.voronoi(turf.featureCollection(centroid),
                {
                    bbox: [bbox.min_lon, bbox.min_lat, bbox.max_lon, bbox.max_lat]
                }
            );
            renderGeoJSONwrapper(voronoiPolygons)
            getWindow().jsonLayer.bringToBack()
            */
        }
    } finally {
        if (document.title === newTitle) {
            document.title = prevTitle
        }
    }
}

function blurSearchField() {
    if (document.querySelector("#sidebar #query") && !document.querySelector("#sidebar #query").getAttribute("blured")) {
        document.querySelector("#sidebar #query").setAttribute("blured", "true")
        document.querySelector("#sidebar #query").removeAttribute("autofocus")
        document.activeElement?.blur()
    }
}

function resetSearchFormFocus() {
    if (!GM_config.get("ResetSearchFormFocus")) {
        return;
    }
    blurSearchField();
}

// https://osm.org/node/12559772251
// https://osm.org/node/10588878341
// https://osm.org/way/1264114016
function makePanoramaxValue(elem) {
    if (!GM_config.get("ImagesAndLinksInTags")) return;
    // extracting uuid
    elem.innerHTML = elem.innerHTML.replaceAll(/(?<=(^|;))([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(&amp;xyz=-?[0-9]+(\.[0-9]+)?\/-?[0-9]+(\.[0-9]+)?\/-?[0-9]+(\.[0-9]+)?)?/gi, function (match) {
        const a = document.createElement("a")
        a.textContent = match.replaceAll("&amp;", "&")
        a.classList.add("preview-img-link")
        a.target = "_blank"
        const browseSection = elem?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement
        const lat = browseSection?.querySelector(".latitude")?.textContent?.replace(",", ".")
        const lon = browseSection?.querySelector(".longitude")?.textContent?.replace(",", ".")
        a.href = "https://api.panoramax.xyz/#focus=pic&pic=" + match.replaceAll("&amp;", "&") + (lat ? (`&map=16/${lat}/${lon}`) : "")
        return a.outerHTML
    })
    elem.querySelectorAll('a.preview-img-link').forEach(a => {
        const uuid = a.textContent.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/)
        const img = GM_addElement("img", {
            src: `https://api.panoramax.xyz/api/pictures/${uuid}/sd.jpg`,
            // crossorigin: "anonymous"
        })
        img.onerror = () => {
            img.style.display = "none"
        }
        img.onload = () => {
            img.style.width = "100%"
        }
        a.appendChild(img)
        setTimeout(async () => {
            const res = (await GM.xmlHttpRequest({
                url: `https://api.panoramax.xyz/api/search?limit=1&ids=${uuid}`,
                responseType: "json"
            })).response
            if (!res['error']) {
                a.onmouseenter = () => {
                    const lat = res['features'][0]['geometry']["coordinates"][1]
                    const lon = res['features'][0]['geometry']["coordinates"][0]
                    const raw_angle = res['features'][0]["properties"]["exif"]["Exif.GPSInfo.GPSImgDirection"]
                    const angle = raw_angle?.includes("/") ? raw_angle.split("/")[0] / raw_angle.split("/")[1] : parseFloat(raw_angle)

                    showActiveNodeMarker(lat, lon, "#0022ff", true)

                    if (angle) {
                        drawRay(lat, lon, angle - 30, "#0022ff")
                        drawRay(lat, lon, angle + 30, "#0022ff")
                    }
                }
            }
        })
    })
    elem.onclick = e => {
        e.stopImmediatePropagation()
    }
}

const earthRadius = 6378137;

function drawRay(lat, lon, angle, color) {
    const rad = (angle * Math.PI) / 180;
    const length = 7;
    const latOffset = (length * Math.cos(rad)) / earthRadius;
    const lonOffset = (length * Math.sin(rad)) / (earthRadius * Math.cos((lat * Math.PI) / 180));
    showActiveWay([[lat, lon], [lat + (latOffset * 180) / Math.PI, lon + (lonOffset * 180) / Math.PI]], color, false, null, false)
}

// https://www.mapillary.com/dashboard/developers
const MAPILLARY_CLIENT_KEY = "MLY|23980706878196295|56711819158553348b8159429530d931"
const MAPILLARY_URL_PARAMS = new URLSearchParams({
    access_token: MAPILLARY_CLIENT_KEY,
    fields: "id,geometry,computed_geometry,compass_angle,computed_compass_angle,thumb_1024_url"
})

// https://osm.org/node/7417065297
// https://osm.org/node/6257534611
// https://osm.org/way/682528624/history/3
function makeMapillaryValue(elem) {
    if (!GM_config.get("ImagesAndLinksInTags")) return;
    elem.innerHTML = elem.innerHTML.replaceAll(/(?<=(^|;))([0-9]+)(?=(;|&|$))(&amp;x=-?[0-9]+(\.[0-9]+)?&amp;y=-?[0-9]+(\.[0-9]+)?&amp;zoom=-?[0-9]+(\.[0-9]+)?)?/g, function (match) {
        const a = document.createElement("a")
        a.textContent = match.replaceAll("&amp;", "&")
        a.classList.add("preview-mapillary-img-link")
        a.target = "_blank"
        const browseSection = elem?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement
        const lat = browseSection?.querySelector(".latitude")?.textContent?.replace(",", ".")
        const lon = browseSection?.querySelector(".longitude")?.textContent?.replace(",", ".")
        a.href = `https://www.mapillary.com/app/?focus=photo${lat ? ("&lat=" + lat + "&lng=" + lon + "&z=16") : ""}&pKey=` + arguments[0].replaceAll("&amp;", "&")
        return a.outerHTML
    })
    setTimeout(async () => {
        for (const a of elem.querySelectorAll('a.preview-mapillary-img-link')) {
            const res = (await GM.xmlHttpRequest({
                url: `https://graph.mapillary.com/${a.textContent.match(/[0-9]+/)}?${MAPILLARY_URL_PARAMS.toString()}`,
                responseType: "json"
            })).response
            if (!res['error']) {
                const img = GM_addElement("img", {
                    src: res['thumb_1024_url'],
                    alt: "image from Mapillary",
                    title: "Blue — position from GPS tracker\nOrange — estimated real postion"
                    // crossorigin: "anonymous"
                })
                img.onerror = () => {
                    img.style.display = "none"
                }
                img.onload = () => {
                    img.style.width = "100%"
                }
                a.appendChild(img)
                a.onmouseenter = () => {
                    const lat = res['geometry']["coordinates"][1]
                    const lon = res['geometry']["coordinates"][0]
                    const angle = res["compass_angle"]

                    const computed_lat = res['computed_geometry']["coordinates"][1]
                    const computed_lon = res['computed_geometry']["coordinates"][0]
                    const computed_angle = res["computed_compass_angle"]

                    showActiveNodeMarker(lat, lon, "#0022ff", true)
                    showActiveNodeMarker(computed_lat, computed_lon, "#ee9209", false)


                    drawRay(lat, lon, angle - 30, "#0022ff")
                    drawRay(computed_lat, computed_lon, computed_angle - 25, "#ee9209")

                    drawRay(lat, lon, angle + 30, "#0022ff")
                    drawRay(computed_lat, computed_lon, computed_angle + 25, "#ee9209")
                }
            } else {
                a.classList.add("broken-mapillary-link")
            }
        }
    })
    elem.onclick = e => {
        e.stopImmediatePropagation()
    }
}

function makeWikimediaCommonsValue(elem) {
    if (!GM_config.get("ImagesAndLinksInTags")) return;
    elem.querySelectorAll('a[href^="//commons.wikimedia.org/wiki/"]:not(.preview-img-link)').forEach(a => {
        a.classList.add("preview-img-link")
        setTimeout(async () => {
            const wikimediaResponse = (await GM.xmlHttpRequest({
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
                src: wikimediaResponse['query']['pages']["-1"]["imageinfo"][0]['url'],
                // crossorigin: "anonymous"
            })
            img.style.width = "100%"
            a.appendChild(img)
        })
    })
}

function makeRefBelpostValue(elem) {
    if (!GM_config.get("ImagesAndLinksInTags")) return;
    if (elem.innerHTML.match(/^[0-9]+$/)) {
        const a = document.createElement("a")
        a.href = "https://belpost.by/Pochtovyyeyashchiki/" + elem.textContent
        a.rel = "noreferrer"
        a.textContent = elem.textContent
        elem.innerHTML = a.outerHTML
    }
}

let buildingViewerIframe = null;

let contextMenuCSSInjected = false;

const contextMenuCSS = `
    .betterOsmContextMenu {
        position: absolute;
        display: "block";
        background: var(--bs-body-bg);
        border: 1px solid var(--bs-border-color);
        box-shadow: 0 2px 5px var(--bs-body-bg);
        z-index: 1000;
        padding: 5px 0;
        border-radius: 4px;
        min-width: 150px;
    }
    .betterOsmContextMenu div {
        cursor: pointer;
        display: flex;
    }
    .betterOsmContextMenu div:hover {
        cursor: pointer;
        background: var(--bs-secondary-bg);
    }
    .betterOsmContextMenu div a {
        display: block;
        padding-top: 6px;
        padding-right: 12px;
        padding-bottom: 6px;
        padding-left: 6px;
    }
    .betterOsmContextMenu div .pin {
        align-content: center;
        padding-right: 8px;
    }
    .betterOsmContextMenu div .pin:hover {
        cursor: pointer;
        background: var(--bs-secondary-bg);
    }
    .betterOsmContextMenu div .pin {
        display: none;
    }
    .betterOsmContextMenu div .pin + label {
        align-self: center;
        padding-left: 6px;
    }
    .betterOsmContextMenu div .pin:not(:checked) + label {
        filter: grayscale(100%);
        opacity: 20%;
        cursor: pointer;
    }
    .betterOsmContextMenu div .pin:not(:checked) + label:hover {
        filter: initial;
        opacity: initial;
    }
`;

function injectContextMenuCSS() {
    if (contextMenuCSSInjected) return;
    contextMenuCSSInjected = true;
    injectCSSIntoOSMPage(contextMenuCSS);
}


// example https://osm.org/node/6506618057
function makeLinksInTagsClickable() {
    document.querySelectorAll(".browse-tag-list tr").forEach(row => {
        const key = row.querySelector("th")?.textContent?.toLowerCase()
        if (!key) return
        const valueCell = row.querySelector("td .current-value-span") ? row.querySelector("td .current-value-span") : row.querySelector("td")
        if (key === "fixme") {
            valueCell.classList.add("fixme-tag")
        } else if (key === "note") {
            valueCell.classList.add("note-tag")
        } else if (key.startsWith("panoramax")) {
            if (!row.querySelector("td a")) {
                makePanoramaxValue(valueCell)
            }
        } else if (key.startsWith("mapillary")) {
            if (!row.querySelector("td a")) {
                makeMapillaryValue(valueCell)
            }
        } else if (key === "xmas:feature" && !document.querySelector(".egg-snow-tag") || valueCell.textContent.includes("snow")) {
            const curDate = new Date()
            if (curDate.getMonth() === 11 && curDate.getDate() >= 18 || curDate.getMonth() === 0 && curDate.getDate() < 10) {
                const snowBtn = document.createElement("span")
                snowBtn.classList.add("egg-snow-tag")
                snowBtn.textContent = " ❄️"
                snowBtn.style.cursor = "pointer"
                snowBtn.title = "better-osm-org easter egg"
                snowBtn.addEventListener("click", (e) => {
                    e.target.style.display = "none"
                    runSnowAnimation()
                }, {
                    once: true
                })
                document.querySelector(".browse-tag-list").parentElement.previousElementSibling.appendChild(snowBtn)
            }
        } else if (key === "wikimedia_commons") {
            makeWikimediaCommonsValue(valueCell);
        } else if (key === "direction" || key === "camera:direction") {
            const coords = row.parentElement.parentElement.parentElement.parentElement.querySelector("span.latitude")
            if (coords) {
                const lat = coords.textContent.replace(",", ".")
                const lon = coords.nextElementSibling.textContent.replace(",", ".")
                const match = location.pathname.match(/(node|way|relation)\/(\d+)\/history\/(\d+)\/?$/)
                if (match || document.querySelector(".browse-tag-list") === row.parentElement.parentElement) {
                    cleanObjectsByKey("activeObjects")
                    renderDirectionTag(parseFloat(lat), parseFloat(lon), valueCell.textContent, "#ff00e3")
                }
                row.onmouseenter = () => {
                    cleanObjectsByKey("activeObjects")
                    renderDirectionTag(parseFloat(lat), parseFloat(lon), valueCell.textContent, "#ff00e3")
                }
            }
        } else if (key.startsWith("opening_hours") // https://github.com/opening-hours/opening_hours.js/blob/master/scripts/related_tags.txt
            || ["happy_hours", "delivery_hours", "smoking_hours", "collection_times", "service_times"].includes(key)) {
            if (key !== "opening_hours:signed" && typeof opening_hours !== "undefined") {
                try {
                    new opening_hours(valueCell.textContent, null, {tag_key: key});
                    valueCell.title = "opening_hours.js not found errors👍"
                } catch (e) {
                    valueCell.title = e
                    valueCell.classList.add("fixme-tag")
                }
            }
        } else if (["building", "building:part"].includes(key) || (key === "type" && valueCell.textContent === "building")) {
            if (document.querySelector(".view-3d-link")) {
                return;
            }
            const m = location.pathname.match(/\/(way|relation)\/(\d+)/)
            if (!m) {
                return
            }
            const [, type, id] = m
            if (!type) {
                return
            }
            if (type === "way" && ["building", "building:part"].includes(key) &&
                !Array.from(document.querySelectorAll(".browse-tag-list tr th"))
                    .some(i => i.textContent.includes("level") || i.textContent.includes("height")
                        || i.textContent.includes("roof")
                    )) {
                return
            }
            injectCSSIntoOSMPage(`
                    #building-3d-view {
                        position: absolute !important;
                        height: 120% !important;
                        z-index: 9999 !important;
                    }
            ` + contextMenuCSS)
            const viewIn3D = document.createElement("span")
            viewIn3D.classList.add("view-3d-link")
            viewIn3D.textContent = " 🏯"
            viewIn3D.style.cursor = "pointer"
            viewIn3D.title = "Click for show embedded 3D Viewer.\nRight click for select viewer\nClick with CTRL for open viewer in new tab\nIn userscript setting you can set open in tab by default"

            async function contextMenuHandler(e) {
                const buildingViewer = await GM.getValue("3DViewer") ?? "OSM Building Viewer";
                e.preventDefault();

                const menu = document.createElement("div");
                menu.classList.add("betterOsmContextMenu");
                instancesOf3DViewers.forEach(i => {
                    const listItem = document.createElement("div");
                    const a = document.createElement("a");
                    const [x, y, z] = getCurrentXYZ();
                    a.href = i.makeURL({x, y, z, type, id});
                    a.textContent = i.name;
                    a.target = "_blank";

                    const pin = document.createElement("input")
                    pin.id = i.name
                    pin.type = "radio"
                    pin.classList.add("pin")
                    pin.setAttribute("name", "viewer-selector")
                    const pinLabel = document.createElement("label");
                    pinLabel.setAttribute("for", i.name)
                    pinLabel.classList.add("pin-label")
                    pinLabel.textContent = "📌"
                    pinLabel.title = "Set as default for click"
                    if (i.name === buildingViewer) {
                        pin.checked = true
                        pinLabel.title = "It's default viewer"
                    }
                    pin.onchange = async () => {
                        if (pin.checked) {
                            await GM.setValue("3DViewer", i.name)
                        }
                    }
                    listItem.appendChild(pin);
                    listItem.appendChild(pinLabel);
                    listItem.appendChild(a);
                    document.addEventListener("click", function fn(e) {
                        if (e.target.classList.contains("pin-label") || e.target.classList.contains("pin")) {
                            document.addEventListener("click", fn, {once: true});
                            return
                        }
                        menu.remove()
                    }, {once: true})
                    menu.appendChild(listItem);
                });
                menu.style.left = `${e.pageX - 30}px`;
                menu.style.top = `${e.pageY}px`;
                document.body.appendChild(menu);
            }

            viewIn3D.addEventListener("contextmenu", contextMenuHandler);

            async function clickHandler(e) {
                if (buildingViewerIframe) {
                    buildingViewerIframe.remove()
                    buildingViewerIframe = null
                    return
                }
                const [x, y, z] = getCurrentXYZ();
                const buildingViewer = await GM.getValue("3DViewer") ?? "OSM Building Viewer";
                const viewer = instancesOf3DViewers.find(i => i.name === buildingViewer)
                const url = viewer.makeURL({x, y, z, type, id})
                if (isMobile || e.ctrlKey || e.metaKey || e.which === 2 || GM_config.get("3DViewerInNewTab")) {
                    window.open(url, "_blank")
                    return
                }

                buildingViewerIframe = GM_addElement("iframe", {
                    src: url,
                    width: document.querySelector("#map").clientWidth,
                    height: "100%",
                    id: "building-3d-view"
                })
                document.querySelector("#map").before(buildingViewerIframe)
            }

            viewIn3D.addEventListener("click", clickHandler)
            viewIn3D.addEventListener("auxclick", e => {
                if (e.which !== 2) return;
                clickHandler(e);
            })
            document.querySelector(".browse-tag-list").parentElement.previousElementSibling.appendChild(viewIn3D)
        } else if (key === "ref:belpost") {
            if (!valueCell.querySelector("a")) {
                makeRefBelpostValue(valueCell)
            }
        }
    })
    const tagsTable = document.querySelector(".browse-tag-list")
    if (tagsTable) {
        tagsTable.parentElement.previousElementSibling.title = tagsTable.querySelectorAll("tr th").length + " tags"
    }
}

function addHistoryLink() {
    if (!location.pathname.startsWith("/node")
        && !location.pathname.startsWith("/way")
        && !location.pathname.startsWith("/relation")
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
    a.title = "Click for open object history page\nOr press key H"
    a.classList.add("history_button_class")
    if (curHref[2] !== "1") {
        versionInSidebar.after(a)
        versionInSidebar.after(document.createTextNode("\xA0"))
    }
    resetSearchFormFocus();
    makeTimesSwitchable();
    if (GM_config.get("ResizableSidebar")) {
        document.querySelector("#sidebar").style.resize = "horizontal"
    }
    makeLinksInTagsClickable()
    makeHashtagsClickable()
    document.querySelectorAll("#element_versions_list > div p").forEach(shortOsmOrgLinks)
    injectCSSIntoOSMPage(`
    table.browse-tag-list tr td[colspan="2"] {
        background: var(--bs-body-bg) !important;
    }
    `);
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

/**
 * @param {string} text
 */
function injectCSSIntoOSMPage(text) {
    if (GM_info.scriptHandler === "FireMonkey" || GM_info.scriptHandler === "Userscripts"
        || GM_info.scriptHandler === "Greasemonkey" || isSafari) {
        document.querySelector("style").innerHTML += text;
        if (!isSafari) {
            document.querySelector("style").parentElement.appendChild(document.querySelector("style"))
        }
    } else {
        return GM_addElement(document.head, "style", {
            textContent: text,
        });
    }
}

/**
 * @param {string} text
 */
function injectCSSIntoSimplePage(text) {
    return GM_addElement(document.head, "style", {
        textContent: text,
    });
}

/**
 * @type {{
 *  customObjects: (import('leaflet').Path)[],
 *  activeObjects: (import('leaflet').Path)[],
 *  changesetBounds: (import('leaflet').Path)[]
 * }}
 */
const layers = {
    customObjects: [],
    activeObjects: [],
    changesetBounds: []
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
 * @param {string|null=} infoElemID
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
        }, getWindow(), {cloneFunctions: true}))
    }
    if (addStroke) {
        line._path.classList.add("stroke-polyline");
    }
    return line
}

/**
 * @name showNodeMarker
 * @memberof unsafeWindow
 * @param {string|number} a
 * @param {string|number} b
 * @param {string=} color
 * @param {string|null=null} infoElemID
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
    const marker = getWindow().L.circleMarker(getWindow().L.latLng(a, b), intoPage(haloStyle)).addTo(getMap())
    layers[layerName].push(marker);
    if (infoElemID) {
        marker.on('click', cloneInto(function () {
            const elementById = document.getElementById(infoElemID);
            elementById?.scrollIntoView()
            resetMapHover()
            elementById?.parentElement?.parentElement.classList?.add("map-hover")
        }, getWindow(), {cloneFunctions: true}))
    }
    return marker
}

/**
 * @name showActiveNodeMarker
 * @memberof unsafeWindow
 * @param {string} lat
 * @param {string} lon
 * @param {string} color
 * @param {boolean=true} removeActiveObjects
 * @param {number} radius
 * @param {number=} weight
 */
function showActiveNodeMarker(lat, lon, color, removeActiveObjects = true, radius = 5, weight = 2.5) {
    const haloStyle = {
        weight: weight,
        radius: radius,
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
 * @param {string|null=} infoElemID
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
            const elementById = document.getElementById(infoElemID);
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

/**
 * @name panInside
 * @memberof unsafeWindow
 * @param {string} lat
 * @param {string} lon
 * @param {boolean=} animate
 * @param {[]=} padding
 */
function panInside(lat, lon, animate = false, padding = [0, 0]) {
    getMap().panInside(intoPage([lat, lon]), intoPage({animate: animate, padding: padding}));
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
function fitBounds(bound, maxZoom = 19) {
    getMap().fitBounds(intoPageWithFun(bound), intoPage({maxZoom: maxZoom}));
}

/**
 * @name fitBoundsWithPadding
 * @memberof unsafeWindow
 */
function fitBoundsWithPadding(bound, padding, maxZoom = 19) {
    getMap().fitBounds(intoPageWithFun(bound), intoPage({padding: [padding, padding], maxZoom: maxZoom}));
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

/**
 *
 * @type {Object.<string, AbortController>}
 */
let abortDownloadingControllers = {};

function getAbortController() {
    if (abortDownloadingControllers[location.pathname]) {
        return abortDownloadingControllers[location.pathname]
    }
    return abortDownloadingControllers[location.pathname] = new AbortController()
}

function abortPrevControllers(reason = null) {
    console.log("abort prev controllers")
    Object.entries(abortDownloadingControllers).forEach(([path, controller]) => {
        if (path !== location.pathname) {
            console.log("abort for", path)
            controller.abort(reason)
            delete abortDownloadingControllers[path]
        }
    })
}

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
 * @property {number} lat
 * @property {number} lon
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

const fetchTextWithCache = (() => {
    /**@type {Map<string, string | undefined | Promise<string | undefined> >}*/
    const cache = new Map();

    return async url => {
        if (cache.has(url)) {
            return cache.get(url);
        }

        const promise = GM.xmlHttpRequest({url: url}).then(r => r.responseText)
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

const originalFetchTextWithCache = (() => {
    /**@type {Map<string, string | undefined | Promise<string | undefined> >}*/
    const cache = new Map();

    return async (url, init) => {
        if (cache.has(url)) {
            return cache.get(url);
        }

        const promise = fetch(url, init).then((res) => {
            if (!res) console.trace()
            if (res.status === 509) {
                error509Handler(res)
            } else {
                return res.text()
            }
        });
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


/**
 *
 * @type {Object.<number, {
 * data: XMLDocument,
 * nodesWithParentWays: Set<number>,
 * nodesWithOldParentWays: Set<number>
 * }>}
 */
const changesetsCache = {}

/**
 * @param {string|number} id
 */
async function getChangeset(id) {
    if (changesetsCache[id]) {
        return changesetsCache[id];
    }
    const text = await originalFetchTextWithCache(osm_server.apiBase + "changeset" + "/" + id + "/download", {signal: getAbortController().signal});
    const parser = new DOMParser();
    const data = /** @type {XMLDocument} **/ parser.parseFromString(text, "application/xml");
    return changesetsCache[id] = {
        data: data,
        nodesWithParentWays: new Set(Array.from(data.querySelectorAll("way > nd")).map(i => parseInt(i.getAttribute("ref")))),
        nodesWithOldParentWays: new Set(Array.from(data.querySelectorAll("way:not([version='1']) > nd")).map(i => parseInt(i.getAttribute("ref"))))
    }
}

/**
 *
 * @param {float} lat
 * @param {float} lon
 * @param {string} values
 * @param {string} color
 */
function renderDirectionTag(lat, lon, values, color = "#ff00e3") {
    const cardinalToAngle = {
        "N": 0.0,
        "north": 0.0,
        "NNE": 22.0,
        "NE": 45.0,
        "ENE": 67.0,
        "E": 90.0,
        "east": 90.0,
        "ESE": 112.0,
        "SE": 135.0,
        "SSE": 157.0,
        "S": 180.0,
        "south": 180.0,
        "SSW": 202.0,
        "SW": 225.0,
        "WSW": 247.0,
        "W": 270.0,
        "west": 270.0,
        "WNW": 292.0,
        "NW": 315.0,
        "NNW": 337.0,
    }
    values.split(";").forEach(angleStr => {
        const angle = cardinalToAngle[angleStr] !== undefined ? cardinalToAngle[angleStr] : parseFloat(angleStr)
        if (!isNaN(angle)) {
            drawRay(lat, lon, angle - 30, color)
            drawRay(lat, lon, angle + 30, color)
        }
    })
}

function setupNodeVersionView() {
    const match = location.pathname.match(/\/node\/(\d+)\//);
    if (match === null) return;
    let nodeHistoryPath = []
    document.querySelectorAll("#element_versions_list > div span.latitude").forEach(i => {
        let lat = i.textContent.replace(",", ".")
        let lon = i.nextElementSibling.textContent.replace(",", ".")
        nodeHistoryPath.push([lat, lon])
        const versionDiv = i.parentElement.parentElement.parentElement.parentElement
        versionDiv.onmouseenter = async () => {
            await interceptMapManually()
            showActiveNodeMarker(lat, lon, "#ff00e3");
            versionDiv.querySelectorAll(".browse-tag-list tr").forEach(row => {
                const key = row.querySelector("th")?.textContent?.toLowerCase()
                if (!key) return
                if (key === "direction" || key === "camera:direction") {
                    renderDirectionTag(parseFloat(lat), parseFloat(lon), row.querySelector("td").textContent, "#ff00e3")
                    row.onmouseenter = () => {
                        renderDirectionTag(parseFloat(lat), parseFloat(lon), row.querySelector("td").textContent, "#ff00e3")
                    }
                }
            })
        }
        versionDiv.onclick = (e) => {
            if (e.altKey) return;
            if (e.target.tagName === "A" || e.target.tagName === "TIME" || e.target.tagName === "SUMMARY" || e.target.tagName === "BUTTON") {
                return
            }
            panTo(lat, lon);
            showActiveNodeMarker(lat, lon, "#ff00e3");
        }
    })
    interceptMapManually().then(() => {
        displayWay(cloneInto(nodeHistoryPath, unsafeWindow), false, "rgba(251,156,112,0.86)", 2);
    })
    document.querySelectorAll("#element_versions_list > div h4:nth-of-type(1):not(:has(.relation-version-view)) a:nth-of-type(1)").forEach(i => {
        const version = i.href.match(/\/(\d+)$/)[1];
        i.parentElement.parentElement.setAttribute("node-version", version)
    })
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
                const res = await fetch(osm_server.apiBase + "node" + "/" + nodeID + "/history.json", {signal: getAbortController().signal});
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
        // console.count("Node history hit")
        return nodesHistories[nodeID];
    } else {
        // console.count("Node history miss")
        const res = await fetch(osm_server.apiBase + "node" + "/" + nodeID + "/history.json", {signal: getAbortController().signal});
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
        const res = await fetch(osm_server.apiBase + "way" + "/" + wayID + "/history.json", {signal: getAbortController().signal});
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
        const res = await fetch(osm_server.apiBase + "nodes.json?nodes=" + batch.join(","), {signal: getAbortController().signal});
        if (!res.ok) {
            console.trace(res)
        }
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
    // console.debug(`w${wayID}v${version}`)
    // console.groupCollapsed(`w${wayID}v${version}`)
    await Promise.all(queryArgs.map(async args => {
        const res = await fetch(osm_server.apiBase + "nodes.json?nodes=" + args, {signal: getAbortController().signal});
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
            if (!res.ok) {
                console.trace(res)
            }
            versions.push(...(await res.json()).elements)
        }
    }))
    // console.debug(`end w${wayID}v${version}`)
    // console.groupEnd()
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

async function replaceDownloadWayButton(btn, wayID) {
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

    function renderInterVersion() {
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
        interVersionDiv.classList.add("mb-3", "border-bottom", "border-secondary-subtle", "pb-3", "browse-section")

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
                await processObjectInteractions("", "node", {nodes: []}, div2, ...getPrevTargetLastVersions(...await getHistoryAndVersionByElem(div2)))
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
        let insertBeforeThat = document.querySelector(`#element_versions_list > div[way-version="${currentWayVersion.version}"]`)
        while (insertBeforeThat.previousElementSibling?.getAttribute("way-version") === "inter") { // fixme O(n^2)
            insertBeforeThat = insertBeforeThat.previousElementSibling
        }
        insertBeforeThat.before(interVersionDiv)
    }

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
                renderInterVersion()
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
            let forNodesReplace = document.querySelector(`#element_versions_list > div[way-version="${it.version}"]`)
            if (Object.keys(currentChanges).length > 1 && forNodesReplace.classList?.contains("empty-version")) {
                forNodesReplace.querySelector("summary")?.remove()
                const div = document.createElement("div")
                div.innerHTML = forNodesReplace.innerHTML
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
                const ulNodes = forNodesReplace.querySelector("details:not(.empty-version) ul")
                ulNodes.parentElement.classList.add("way-version-nodes")
                ulNodes.querySelectorAll("li").forEach(li => {
                    li.style.display = "none"
                    const id = li.querySelector("div div a").href.match(/node\/(\d+)/)[1]
                    currentNodes.push([li.querySelector("img"), objectStates[`node ${id}`]])
                })
                if (it.version !== 1) {
                    const changedNodes = Object.values(currentChanges).filter(i => i[2].type === "node" && i[0] !== "location" && i[0] !== "")
                    document.querySelector(`#element_versions_list > div[way-version="${it.version}"]`)?.addEventListener("mouseenter", () => {
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
                    document.querySelector(`#element_versions_list > div[way-version="${it.version}"]`)?.addEventListener("click", () => {
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
                        await processObjectInteractions("", "node", {nodes: []}, div2, ...getPrevTargetLastVersions(...await getHistoryAndVersionByElem(div2)))
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
    if (Object.entries(currentChanges).length) {
        renderInterVersion()
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
}

async function showFullWayHistory(wayID) {
    const btn = document.querySelector("#download-all-versions-btn")
    try {
        await replaceDownloadWayButton(btn, wayID)
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
                if (e.target.tagName === "A" || e.target.tagName === "TIME" || e.target.tagName === "SUMMARY" || e.target.tagName === "BUTTON") {
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

    document.querySelectorAll("#element_versions_list > div h4:nth-of-type(1):not(:has(.way-version-view)) a:nth-of-type(1)").forEach(i => {
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

    if (!document.getElementById("download-all-versions-btn")) {
        const downloadAllVersionsBtn = document.createElement("a")
        downloadAllVersionsBtn.id = "download-all-versions-btn"
        downloadAllVersionsBtn.tabIndex = 0
        downloadAllVersionsBtn.textContent = "⏬"
        downloadAllVersionsBtn.style.cursor = "pointer"
        downloadAllVersionsBtn.title = "Download all versions (with intermediate versions)"
        const clickHandler = async () => {
            await unrollPaginationInHistory()
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
        }
        downloadAllVersionsBtn.addEventListener("click", clickHandler, {once: true})
        downloadAllVersionsBtn.addEventListener("keypress", clickHandler, {once: true})
        document.querySelector(".compact-toggle-btn")?.after(downloadAllVersionsBtn)
        document.querySelector(".compact-toggle-btn")?.after(document.createTextNode("\xA0"))
    }
}

//<editor-fold desc="setup compact mode toggles">
/**
 * @typedef {Object} RelationMember
 * @property {number} ref
 * @property {'node'|'way'|'relation'} type
 * @property {string} role
 */

/**
 * @typedef {Object} ExtendedRelationNodeMember
 * @property {number} ref
 * @property {'node'} type
 * @property {string} role
 * @property {number} lat
 * @property {number} lon
 */

/**
 * @typedef {Object} ExtendedRelationWayMember
 * @property {number} ref
 * @property {'way'} type
 * @property {string} role
 * @property {LatLon[]} geometry
 */

// TODO ExtendedRelationRelationMember

/**
 * @typedef {ExtendedRelationNodeMember|ExtendedRelationWayMember} ExtendedRelationMember
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
 * @typedef {Object} ExtendedRelationVersion
 * @property {number} id
 * @property {number} changeset
 * @property {number} uid
 * @property {string} user
 * @property {ExtendedRelationMember[]} members
 * @property {number} version
 * @property {boolean} visible
 * @property {string} timestamp
 * @property {'node'|'way'|'relation'} type
 * @property {Object.<string, string>=} tags
 */

//</editor-fold>

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
            error509Handler(res)
        } else {
            return relationsHistories[relationID] = (await res.json()).elements;
        }
    }
}

/**
 * @typedef {[number, number]} LatLonPair
 */

/**
 * @typedef {{lat: number, lon: number}} LatLon
 */

/**
 * @typedef {WayVersion & {geometry: LatLon[]}} ExtendedWayVersion
 */

const overpassCache = {}

/**
 * @typedef {{
 *   min_lat: number,
 *   min_lon: number,
 *   max_lat: number,
 *   max_lon: number,
 * }} BBOX
 */

/**
 * @typedef {{
 *   geom: LatLonPair[][],
 *   bbox: BBOX,
 *   isRestriction: boolean,
 *   restrictionRelationErrors: string[]
 * }} CachedRelation
 */

/**
 * @type {Object.<*, CachedRelation>}
 */
const cachedRelations = {}

/**
 * @param {number} lat
 * @param {number} lng
 * @returns {{x: number, y: number}}
 */
function toMercator(lat, lng) {
    const x = earthRadius * lng * Math.PI / 180;
    const y = earthRadius * Math.log(Math.tan((lat * Math.PI / 180) / 2 + Math.PI / 4));
    return {x, y};
}

/**
 * @param {number} x
 * @param {number} y
 * @returns {{lat: number, lng: number}}
 */
function fromMercator(x, y) {
    const lat = (2 * Math.atan(Math.exp(y / earthRadius)) - Math.PI / 2) * 180 / Math.PI;
    const lng = x / earthRadius * 180 / Math.PI;
    return {lat, lng};
}


/**
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @param {number} angleDeg
 * @param {number} lengthMeters
 * @returns {{lat: number, lon: number}}
 */
function rotateSegment(lat1, lon1, lat2, lon2, angleDeg, lengthMeters) {
    let {x: x1, y: y1} = toMercator(lat1, lon1)
    let {x: x2, y: y2} = toMercator(lat2, lon2)

    const angleRad = angleDeg * Math.PI / 180;

    const dx = y2 - y1;
    const dy = x2 - x1;

    const segmentLength = Math.sqrt(dx * dx + dy * dy);

    const ndx = dx / segmentLength;
    const ndy = dy / segmentLength;

    const scaledDx = ndx * lengthMeters;
    const scaledDy = ndy * lengthMeters;

    const rotatedDx = scaledDx * Math.cos(angleRad) - scaledDy * Math.sin(angleRad);
    const rotatedDy = scaledDx * Math.sin(angleRad) + scaledDy * Math.cos(angleRad)

    const {lat: lat, lng: lon} = fromMercator(x1 + rotatedDy, y1 + rotatedDx)
    return {lat: lat, lon: lon};
}


/**
 * @param {{lat: number, lon: number}} latLon1
 * @param {{lat: number, lon: number}} latLon2
 * @return {boolean}
 */
function isEqualCoordinates(latLon1, latLon2) {
    return latLon1.lat === latLon2.lat && latLon1.lon === latLon2.lon;
}

/**
 * @param {ExtendedRelationVersion} rel
 * @return {string[]}
 */
function validateRestriction(rel) {
    /** @type {ExtendedRelationWayMember[]} */
    let from = [];
    /** @type {ExtendedRelationNodeMember[]} */
    let viaNodes = [];
    /** @type {ExtendedRelationWayMember[]} */
    let viaWays = [];
    /** @type {ExtendedRelationWayMember[]} */
    let to = [];
    const errors = []
    const {value: restrictionValue} = getRestrictionKeyValue(rel.tags)
    rel.members?.forEach(i => {
        if (i.type === "way" && i.role === "from") {
            from.push(i)
        } else if (i.type === "way" && i.role === "to") {
            to.push(i)
        } else if (i.type === "node" && i.role === "via") {
            viaNodes.push(i)
        } else if (i.type === "way" && i.role === "via") {
            viaWays.push(i)
        } else {
            errors.push(`Incorrect member: ${i.type}/${i.ref} with "${i.role}" role`)
        }
    })
    if (viaNodes.length + viaWays.length === 0) {
        errors.push('Missing member with "via" role');
    }
    if (from.length === 0) {
        errors.push('Missing member with "from" role')
    }
    if (to.length === 0) {
        errors.push('Missing member with "to" role')
    }

    [...from, ...to].forEach(i => {
        if (i.geometry?.length < 2) {
            errors.push(`${i.type}/${i.ref} (${i.role}) way contains < 2 nodes`)
        }
    })
    if (restrictionValue !== "no_exit" && restrictionValue !== "no_entry") {
        if (from.length > 1) {
            errors.push('Multiple "from" role')
        }
        if (to.length > 1) {
            errors.push('Multiple "to" role')
        }
    }
    if (errors.length) return errors;

    if (viaNodes.length && viaWays.length) {
        errors.push(`Mixed "node" and "way" types for via role`)
    } else if (viaNodes.length > 1) {
        errors.push(`multiple "via" nodes`)
    } else if (viaWays.length > 0) {
        let lastNode = from[0].geometry[0]
        if (isEqualCoordinates(from[0].geometry[0], lastNode)) {
            lastNode = viaWays[0].geometry[viaWays[0].geometry.length - 1]
        } else if (isEqualCoordinates(from[0].geometry[from[0].geometry.length - 1], lastNode)) {
            lastNode = viaWays[0].geometry[0]
        } else {
            errors.push(`"from" -> "via" are arranged in the wrong order or torn`)
        }
        viaWays.slice(1).forEach(w => {
            if (isEqualCoordinates(w.geometry[0], lastNode)) {
                lastNode = w.geometry[w.geometry.length - 1]
            } else if (isEqualCoordinates(w.geometry[w.geometry.length - 1], lastNode)) {
                lastNode = w.geometry[0]
            } else {
                errors.push(`"via" -> "via" are arranged in the wrong order or torn`)
            }
        })
        if (!isEqualCoordinates(to[0].geometry[0], lastNode) && isEqualCoordinates(to[0].geometry[to[0].geometry.length - 1], lastNode)) {
            errors.push(`"via" -> "to" are arranged in the wrong order or torn`)
        }
    }
    if (errors.length) return errors;

    return errors
}

const restrictionColors = {
    no_left_turn:       "#ff0000",
    no_right_turn:      "#ff0000",
    no_straight_on:     "#ff0000",
    no_u_turn:          "#ff0000",
    only_right_turn:    "#0000ff",
    only_left_turn:     "#0000ff",
    only_straight_on:   "#0000ff",
    no_entry:           "#ff0000",
    no_exit:            "#ff0000",
}
// TODO сделать ресурсами
const restrictionsImagesPrefix = "https://raw.githubusercontent.com/deevroman/better-osm-org/8f4aca194ec701111005a5902fa9380879b811a3/icons/restrictions/"

const restrictionsSignImages = {
    no_left_turn:       restrictionsImagesPrefix + "France_road_sign_B2a.svg",
    no_right_turn:      restrictionsImagesPrefix + "France_road_sign_B2b.svg",
    no_straight_on:     restrictionsImagesPrefix + "MUTCD_R3-27.svg",
    no_u_turn:          restrictionsImagesPrefix + "France_road_sign_B2c.svg",
    only_right_turn:    restrictionsImagesPrefix + "France_road_sign_B21c1.svg",
    only_left_turn:     restrictionsImagesPrefix + "France_road_sign_B21c2.svg",
    only_straight_on:   restrictionsImagesPrefix + "France_road_sign_B21b.svg",
    no_entry:           restrictionsImagesPrefix + "RU_road_sign_3.1.svg",
    no_exit:            restrictionsImagesPrefix + "RU_road_sign_3.1.svg",
}

function azimuth(lat1, lon1, lat2, lon2) {
    const p1 = toMercator(lat1, lon1);
    const p2 = toMercator(lat2, lon2);

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;

    const angleRad = Math.atan2(dx, dy);
    const angleDeg = angleRad * 180 / Math.PI;

    return (angleDeg + 360) % 360;
}

function getRestrictionKeyValue(tags) {
    const key = Object.keys(tags).find(k => k === "restriction" || k === "was:restriction" || k.startsWith("restriction:"))
    return {
        key: key,
        value: tags[key]
    }
}

/**
 * @param {ExtendedRelationVersion} rel
 * @param {string} color
 * @param {string} layer
 * @return {[]}
 */
function renderRestriction(rel, color, layer) {
    /** @type {ExtendedRelationWayMember[]} */
    let from = [];
    /** @type {ExtendedRelationNodeMember[]} */
    let viaNodes = [];
    /** @type {ExtendedRelationWayMember[]} */
    let viaWays = [];
    /** @type {ExtendedRelationWayMember[]} */
    let to = [];
    rel.members?.forEach(i => {
        if (i.type === "way" && i.role === "from") {
            from.push(i)
        } else if (i.type === "way" && i.role === "to") {
            to.push(i)
        } else if (i.type === "node" && i.role === "via") {
            viaNodes.push(i)
        } else if (i.type === "way" && i.role === "via") {
            viaWays.push(i)
        }
    })
    let via = viaNodes?.[0];
    if (!via) {
        if (isEqualCoordinates(from[0].geometry[0], viaWays[0].geometry[0])
            || isEqualCoordinates(from[0].geometry[from[0].geometry.length - 1], viaWays[0].geometry[0])) {
            via = viaWays[0].geometry[0]
        } else if (isEqualCoordinates(from[0].geometry[0], viaWays[0].geometry[viaWays[0].geometry.length - 1])
            || isEqualCoordinates(from[0].geometry[from[0].geometry.length - 1], viaWays[0].geometry[viaWays[0].geometry.length - 1])) {
            via = viaWays[0].geometry[viaWays[0].geometry.length - 1]
        } else {
            console.error("Restriction validation error")
            debug_alert("Restriction validation error")
        }
    }
    const {value: restrictionValue} = getRestrictionKeyValue(rel.tags)
    const angle = 25
    const len = 7
    const arrows = []
    let signAngle = 0.0
    from.forEach(f => {
        let startPoint = f.geometry[0]
        let endPoint = f.geometry[1]
        if (isEqualCoordinates(f.geometry[f.geometry.length - 1], via)) { // оверпас не даёт айдишники точек геометрии
            startPoint = f.geometry[f.geometry.length - 1]
            endPoint = f.geometry[f.geometry.length - 2]
        }
        signAngle = 360 - azimuth(endPoint.lat, endPoint.lon, startPoint.lat, startPoint.lon)
        console.debug(signAngle);
        // const {lat: p1_lat, lon: p1_lon} = startPoint;
        // const {lat: p2_lat, lon: p2_lon} = endPoint
        // const rotated1 = rotateSegment(p1_lat, p1_lon, p2_lat, p2_lon, -angle, len)
        // const rotated2 = rotateSegment(p1_lat, p1_lon, p2_lat, p2_lon, angle, len)
        // arrows.push(displayWay(cloneInto([startPoint, rotated1], unsafeWindow), false, "white", 7, null, layer))
        // arrows.push(displayWay(cloneInto([startPoint, rotated2], unsafeWindow), false, "white", 7, null, layer))
        // arrows.push(displayWay(cloneInto([startPoint, rotated1], unsafeWindow), false, color, 4, null, layer))
        // arrows.push(displayWay(cloneInto([startPoint, rotated2], unsafeWindow), false, color, 4, null, layer))
    })
    to.forEach(t => {
        let startPoint = t.geometry[0]
        let endPoint = t.geometry[1]
        if (t.geometry[0].lat === via.lat && t.geometry[0].lon === via.lon) {
            if (from.length > 1) {
                signAngle = 360 - azimuth(endPoint.lat, endPoint.lon, startPoint.lat, startPoint.lon)
            }
            startPoint = t.geometry[t.geometry.length - 1]
            endPoint = t.geometry[t.geometry.length - 2]
        } else {
            if (from.length > 1) {
                signAngle = 360 - azimuth(
                    t.geometry[t.geometry.length - 2].lat, t.geometry[t.geometry.length - 2].lon,
                    t.geometry[t.geometry.length - 1].lat, t.geometry[t.geometry.length - 1].lon
                )
            }
        }
        const {lat: p1_lat, lon: p1_lon} = startPoint;
        const {lat: p2_lat, lon: p2_lon} = endPoint
        const rotated1 = rotateSegment(p1_lat, p1_lon, p2_lat, p2_lon, -angle, len)
        const rotated2 = rotateSegment(p1_lat, p1_lon, p2_lat, p2_lon, angle, len)
        if (restrictionValue === "no_exit" || restrictionValue === "no_entry") {
            arrows.push(displayWay(cloneInto([startPoint, rotated1], unsafeWindow), false, "white", 7, null, layer))
            arrows.push(displayWay(cloneInto([startPoint, rotated2], unsafeWindow), false, "white", 7, null, layer))
            arrows.push(displayWay(cloneInto([startPoint, rotated1], unsafeWindow), false, color, 4, null, layer))
            arrows.push(displayWay(cloneInto([startPoint, rotated2], unsafeWindow), false, color, 4, null, layer))
        }
    });
    [100, 250, 500, 1000].forEach(t => {
        setTimeout(() => {
            arrows.forEach(i => i.bringToFront())
        }, t)
    })

    queueMicrotask(async () => {
        const imageUrl = restrictionsSignImages[restrictionValue];
        if (!imageUrl) {
            return
        }
        let img = await fetchTextWithCache(imageUrl);
        img = img.replace('version="1.1"', `style="rotate: -${Math.round(signAngle)}deg" version="1.1"`)

        function getSquareBounds(center) {
            const {x, y} = toMercator(center.lat, center.lon)
            return [
                [...Object.values(fromMercator(x - 10, y - 10))],
                [...Object.values(fromMercator(x + 10, y + 10))]
            ];
        }

        const imgLayer = getWindow().L.imageOverlay("data:image/svg+xml;base64," + btoa(img), intoPage(getSquareBounds(via, 0.0002)),
            intoPage({
                interactive: true,
                zIndex: 99999,
                className: "restriction-img"
            })).addTo(getMap());
        arrows.push(imgLayer)
        arrows.forEach(l => layers[layer].push(l))
        imgLayer.bringToFront()
    })
    return arrows
}

function isRestrictionObj(tags) {
    return Object.entries(tags).some(([k]) => k === "restriction" || k === "was:restriction" || k.startsWith("restriction:"))
}

/**
 *
 * @param {number} id
 * @param {string} timestamp
 * @param {boolean=true} cleanPrevObjects=true
 * @param {string=} color=
 * @param {string=} layer=
 * @param {boolean=} addStroke
 * @return {Promise<CachedRelation>}
 */
async function loadRelationVersionMembersViaOverpass(id, timestamp, cleanPrevObjects = true, color = "#000000", layer = "activeObjects", addStroke = null) {
    console.time(`Render ${id} relation`)
    console.log(id, timestamp)

    /**
     * @param id
     * @param timestamp
     * @return {Promise<{
     *   elements: (ExtendedRelationVersion)[]
     * }>}
     */
    async function getRelationViaOverpass(id, timestamp) {
        if (overpassCache[[id, timestamp]]) {
            return overpassCache[[id, timestamp]]
        } else {
            const res = await GM.xmlHttpRequest({
                url: `${overpass_server.apiUrl}/interpreter?` + new URLSearchParams({
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

    /**
     * @param overpassGeom
     * @return {{bbox: BBOX, nodesBbox: BBOX}}
     */
    function getBbox(overpassGeom) {
        /** @type {{bbox: BBOX, nodesBbox: BBOX}} */
        const relationInfo = {
            bbox:      { min_lat: 10000000, min_lon: 10000000, max_lat: -10000000, max_lon: -100000000 },
            nodesBbox: { min_lat: 10000000, min_lon: 10000000, max_lat: -10000000, max_lon: -100000000 }
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

        overpassGeom.elements[0]?.members?.forEach(i => {
            if (i.type === "node" && i?.lat) {
                relationInfo.nodesBbox.min_lat = min(relationInfo.nodesBbox.min_lat, i.lat)
                relationInfo.nodesBbox.min_lon = min(relationInfo.nodesBbox.min_lon, i.lon)
                relationInfo.nodesBbox.max_lat = max(relationInfo.nodesBbox.max_lat, i.lat)
                relationInfo.nodesBbox.max_lon = max(relationInfo.nodesBbox.max_lon, i.lon)
            }
        })

        for (const i of nodesBag) {
            if (i?.lat) {
                relationInfo.bbox.min_lat = min(relationInfo.bbox.min_lat, i.lat)
                relationInfo.bbox.min_lon = min(relationInfo.bbox.min_lon, i.lon)
                relationInfo.bbox.max_lat = max(relationInfo.bbox.max_lat, i.lat)
                relationInfo.bbox.max_lon = max(relationInfo.bbox.max_lon, i.lon)
            }
        }
        return relationInfo
    }

    // GC больно, постоянно передавать в контекст страницы больно
    let cache = /** @type {CachedRelation} */ cachedRelations[[id, timestamp]];
    if (!cache) {
        let wayCounts = 0
        /** @type {LatLonPair[][]} */
        const mergedGeometry = []
        overpassGeom.elements[0]?.members?.forEach(i => {
            if (i.type === "way") {
                const w = /** @type {ExtendedWayVersion} */ i;
                wayCounts++
                if (w.geometry === undefined || !w.geometry.length) {
                    return
                }
                const nodesList = w.geometry.map(p => [p.lat, p.lon])
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
        const isRestriction = isRestrictionObj(overpassGeom.elements?.[0].tags ?? {})
        const {bbox, nodesBbox} = getBbox(overpassGeom)
        cache = cachedRelations[[id, timestamp]] = {
            geom: mergedGeometry.map(i => intoPage(i)),
            bbox: bbox,
            nodesBbox: nodesBbox,
            isRestriction: isRestriction,
            restrictionRelationErrors: isRestriction ? validateRestriction(overpassGeom.elements[0]) : [],
        }
        console.log(`${cache.length}/${wayCounts} for render`)
    } else {
        overpassGeom.elements[0]?.members?.forEach(i => {
            if (i.type === "node") {
                showNodeMarker(i.lat, i.lon, color, null, layer)
            }
        })
    }

    cache.geom.forEach(nodesList => {
        displayWay(nodesList, false, color, 4, null, layer, null, null, addStroke, true)
    })

    if (cache.isRestriction && cache.restrictionRelationErrors.length === 0) {
        renderRestriction(overpassGeom.elements[0], restrictionColors[overpassGeom.elements[0].tags['restriction']] ?? color, layer)
    }

    console.timeEnd(`Render ${id} relation`)

    console.log("relation loaded")
    return cache;
}

async function getNodeViaOverpassXML(id, timestamp) {
    const res = await GM.xmlHttpRequest({
        url: `${overpass_server.apiUrl}/interpreter?` + new URLSearchParams({
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
        url: `${overpass_server.apiUrl}/interpreter?` + new URLSearchParams({
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
        url: `${overpass_server.apiUrl}/interpreter?` + new URLSearchParams({
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
 * @typedef {{nodes: NodeVersion[], ways: [WayVersion, NodeVersion[][]][], relations: RelationVersion[][]}}
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
     * @type {{nodes: NodeVersion[], ways: [WayVersion, NodeVersion[][]][]|Promise<[WayVersion, NodeVersion[][]]>[], relations: RelationVersion[][]}}
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
            /** @type {NodeVersion} */
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

    async function loadRelationVersion(e, showWay = true) { // TODO fly?
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
            if (isRestrictionObj(targetVersion.tags ?? {})) {
                /** @type {Object<number, NodeVersion>}}*/
                const nodeIndex = membersHistory.nodes.reduce(((acc, n) => {
                    acc[n.id] = n;
                    return acc
                }), {})
                /** @type {Object<number, LatLonPair[]>}}*/
                const wayIndex = membersHistory.ways.reduce(((acc, w) => {
                    acc[w[0].id] = w[1].map(n => searchVersionByTimestamp(n, targetVersion.timestamp))
                    return acc
                }), {})
                const extendedRelationVersion = targetVersion
                extendedRelationVersion.members = extendedRelationVersion.members.map(mem => {
                    if (mem.type === "node") {
                        mem['lat'] = nodeIndex[mem.ref].lat
                        mem['lon'] = nodeIndex[mem.ref].lon
                        return /** @type {ExtendedRelationNodeMember} */ mem
                    } else if (mem.type === "way") {
                        mem['geometry'] = wayIndex[mem.ref]
                        return /** @type {ExtendedRelationWayMember} */ mem
                    } else if (mem.type === "relation") {
                        // todo
                        return /** @type {ExtendedRelationMember} */ mem
                    }
                })
                const errors = validateRestriction(/** @type {ExtendedRelationVersion} */ extendedRelationVersion)
                if (errors.length) {
                    showRestrictionValidationStatus(errors, document.querySelector("#element_versions_list > div details:last-of-type summary"))
                } else {
                    renderRestriction(/** @type {ExtendedRelationVersion} */ extendedRelationVersion, restrictionColors[extendedRelationVersion.tags['restriction']] ?? "#000000", "customObjects")
                }
            }
            if (hasBrokenMembers) {
                htmlElem.classList.add("broken-version")
                htmlElem.parentElement.parentElement.classList.add("broken-version")
            }
        }
        if (htmlElem.nodeName === "A") {
            const versionDiv = htmlElem.parentNode.parentNode
            versionDiv.onmouseenter = loadRelationVersion
            versionDiv.onclick = async (e) => {
                if (e.target.tagName === "A" || e.target.tagName === "TIME" || e.target.tagName === "SUMMARY" || e.target.tagName === "BUTTON") {
                    return
                }
                await loadRelationVersion(versionDiv) // todo params
            }
            versionDiv.setAttribute("relation-version", version.toString())
            htmlElem.style.cursor = "pointer" // todo finally{}
            htmlElem.setAttribute("hidden", "true")
        } else {
            try {
                e.target.style.cursor = "auto"
            } catch {
                e.style.cursor = "auto"
            }
        }
    }

    document.querySelectorAll('#element_versions_list > div h4:nth-of-type(1):not(:has(.relation-version-view)) a:nth-of-type(1)').forEach((i) => {
        const version = i.href.match(/\/(\d+)$/)[1];
        const btn = document.createElement("a")
        btn.classList.add("relation-version-view")
        btn.textContent = "📥"
        btn.style.cursor = "pointer"
        btn.setAttribute("relation-version", version)

        btn.addEventListener("mouseenter", async e => {
            i.parentElement.parentElement.querySelectorAll(".browse-tag-list tr").forEach(t => {
                if (t.querySelector("th")?.textContent?.includes("restriction")) {
                    const key = t.querySelector("td")?.textContent
                    if (restrictionsSignImages[key]) {
                        void fetchTextWithCache(restrictionsSignImages[key]);
                    }
                }
            })
            await loadRelationVersion(e)
        }, {
            once: true,
        })
        i.after(btn)
        i.after(document.createTextNode("\xA0"))
    })

    if (document.querySelectorAll(`.relation-version-view:not([hidden])`).length > 1 && !document.getElementById("download-all-versions-btn")) { // todo remove check after when would full history
        const downloadAllVersionsBtn = document.createElement("a")
        downloadAllVersionsBtn.id = "download-all-versions-btn"
        downloadAllVersionsBtn.tabIndex = 0
        downloadAllVersionsBtn.textContent = "⏬"
        downloadAllVersionsBtn.style.cursor = "pointer"
        downloadAllVersionsBtn.title = "Download all versions (with intermediate versions)"

        const clickHandler = async e => {
            await unrollPaginationInHistory()
            downloadAllVersionsBtn.style.cursor = "progress"
            for (const i of document.querySelectorAll(`.relation-version-view:not([hidden])`)) {
                await loadRelationVersion(i)
            }
            e.target.remove()
        }
        downloadAllVersionsBtn.addEventListener("click", clickHandler, {once: true})
        downloadAllVersionsBtn.addEventListener("keypress", clickHandler, {once: true})
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
        await unrollPaginationInHistory()
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
        document.querySelectorAll("#element_versions_list > div table th a").forEach(a => {
            keysLinks.set(a.textContent, a.href)
        })
        const valuesLinks = new Map()
        document.querySelectorAll("#element_versions_list > div table td a").forEach(a => {
            valuesLinks.set(a.textContent, a.href)
        })

        const versionPrefix = document.querySelector('#element_versions_list > div h4')?.textContent?.match(/(^.*#)/gms)?.at(0)

        for (const elem of Array.from(document.querySelectorAll('#element_versions_list > div:has(a[href*="/redactions/"]:not([rel]))'))) {
            const version = elem.textContent.match(/(\d+).*(\d+)/)[1]
            console.log(`Downloading v${version}`)
            elem.childNodes[0].textContent = elem.childNodes[0].textContent.match(/(\..*$)/gm)[0].slice(1)
            let target;
            try {
                target = Array.from(data).find(i => i.getAttribute("version") === version)
            } catch { /* empty */
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
                if (!target) {
                    console.error(`v${version} not founded`)
                    continue
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
                if (!target) return
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
            // elem.classList.remove("browse-redacted")
            elem.classList.add("browse-unredacted")
            // elem.classList.add("browse-node")
        }
        showUnredactedBtn.remove()
        const classesForClean = ["processed", "history-diff-new-tag", "history-diff-modified-tag", "non-modified-tag", ".empty-version"]
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

        Array.from(document.querySelectorAll("details.empty-version")).forEach(i => {
            i.querySelector("summary")?.remove()
            const div = document.createElement("div")
            div.innerHTML = i.innerHTML
            i.replaceWith(div)
        })

        cleanAllObjects()
        document.querySelector(".compact-toggle-btn")?.remove()
        setTimeout(async () => {
            await addDiffInHistory();
            addCommentsCount()
        }, 0)
    }
    if (!document.querySelector('#sidebar .secondary-actions a[href$="show_redactions=true"]')) {
        document.querySelector("#sidebar .secondary-actions").appendChild(document.createElement("br"))
        document.querySelector("#sidebar .secondary-actions").appendChild(showUnredactedBtn)
    }
}

function extractChangesetID(s) {
    return s.match(/\/changeset\/([0-9]+)/)[1];
}

function isVersionPage() {
    return !!location.pathname.match(/\/(node|way|relation)\/[0-9]+\/?(version\/[0-9]+\/?)?/)
}

function addCommentsCount() {
    queueMicrotask(async () => {
        if (isVersionPage()) {
            document.querySelectorAll(".changeset_num_comments").forEach(i => i.style.setProperty("display", "none", "important"))
        }
        const sectionSelector = isVersionPage() ? "#sidebar_content > div:first-of-type" : "#sidebar_content #element_versions_list > div"
        const links = document.querySelectorAll(`${sectionSelector} div:first-of-type a[href^="/changeset"]:not(.comments-loaded):not(.comments-link)`)
        await loadChangesetMetadatas(
            Array.from(links).map(i => {
                i.classList.add("comments-loaded")
                return parseInt(extractChangesetID(i.getAttribute("href")))
            })
        )
        links.forEach(i => {
            const changesetID = extractChangesetID(i.getAttribute("href"))
            const comments_count = changesetMetadatas[changesetID].comments_count
            if (comments_count) {
                const a = document.createElement("a")
                a.classList.add("comments-link")
                a.textContent = `${comments_count} 💬`
                a.href = i.getAttribute("href")
                a.tabIndex = 0
                a.style.cursor = "pointer"
                a.style.color = "var(--bs-body-color)"
                i.after(a)
                i.after(document.createTextNode("\xA0"))
                setTimeout(async () => {
                    getChangesetComments(changesetID).then(res => {
                        res.forEach(comment => {
                            const shortText = shortOsmOrgLinksInText(comment["text"])
                            a.title += `${comment["user"]}:\n${shortText}\n\n`
                        })
                        a.title = a.title.trimEnd()
                    });
                })
            }
            setTimeout(async () => {
                await loadChangesetMetadata(changesetID)
                Object.entries(changesetMetadatas[changesetID]?.["tags"] ?? {}).forEach(([k, v]) => { // тегов может не быть
                    if (k === "comment") return;
                    i.parentElement.title += `${k}: ${v}\n`
                })
                const user_link = i.parentElement.parentElement.querySelector(`a[href^="/user/"]`)
                if (user_link) {
                    getCachedUserInfo(user_link.textContent).then((res) => {
                        user_link.title = `changesets_count: ${res['changesets']['count']}\naccount_created: ${res['account_created']}`
                    })
                }
            })
        })
    })
}

const compactModeSvg = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" height="17" width="17" viewBox="0 0 17 17"><path d="M15 12 l-5-4  5-4"></path><path d="M2 12 l 5-4 -5-4"></path></svg>'
const expandModeSvg = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" height="17" width="17" viewBox="0 0 17 17"><path d="M7 12 l-5-4  5-4"></path><path d="M10 12 l 5-4 -5-4"></path></svg>'

/** @type {MutationObserver | null} **/
let historyPagePaginationDeletingObserver = null
/** @type {MutationObserver | null} **/
let paginationInHistoryStepObserver = null

function monitorHistoryPaginationMoving() {
    if (!document.querySelector("#older_element_versions_navigation a")) {
        return;
    }
    if (historyPagePaginationDeletingObserver === null) {
        historyPagePaginationDeletingObserver = new MutationObserver(function (mutationsList, observer) {
            for (let mutationRecord of mutationsList) {
                for (let removedNode of mutationRecord.removedNodes ?? []) {
                    if (removedNode.id === 'older_element_versions_navigation') {
                        observer.disconnect()
                        addDiffInHistory("pagination")
                    }
                }
            }
        })
        historyPagePaginationDeletingObserver.observe(document.querySelector("#sidebar_content"), {
            childList: true,
            subtree: true,
            attributes: true
        });
    }
    paginationInHistoryStepObserver = new MutationObserver(function (mutationsList, observer) {
        observer.disconnect()
        addDiffInHistory("pagination")
    })
    paginationInHistoryStepObserver.observe(document.querySelector("#older_element_versions_navigation"), {
        childList: true,
        subtree: true,
        attributes: true
    });
}


async function unrollPaginationInHistory() {
    if (!document.querySelector("#older_element_versions_navigation")) {
        return
    }
    console.log("start pagination unrolling")
    await new Promise((resolve) => {
        if (!paginationInHistoryStepObserver) {
            paginationInHistoryStepObserver = new MutationObserver(function (mutationsList, observer) {
                observer.disconnect()
                console.log("pagination click");
                document.querySelector("#older_element_versions_navigation a")?.click()
            })
            if (!document.querySelector("#older_element_versions_navigation")) {
                resolve()
                return;
            }
            paginationInHistoryStepObserver.observe(document.querySelector("#older_element_versions_navigation"), {
                childList: true,
                subtree: true,
                attributes: true
            });
        }
        const historyPagePaginationObserver = new MutationObserver(function (mutationsList, observer) {
            for (let mutationRecord of mutationsList) {
                for (let removedNode of mutationRecord.removedNodes ?? []) {
                    if (removedNode.id === 'older_element_versions_navigation') {
                        observer.disconnect()
                        console.log("pagination unrolling finished");
                        resolve()
                    }
                }
            }
        })
        historyPagePaginationObserver.observe(document.querySelector("#sidebar_content"), {
            childList: true,
            subtree: true,
            attributes: true
        });

        const btn = document.querySelector("#older_element_versions_navigation a")
        if (!btn) {
            return
        }
        console.log("pagination first click");
        btn.click()
    })
}

function makeTitleForTagsCount(tagsCount) {
    if (tagsCount === 1) { // fixme after adding locationzation
        return tagsCount + (['ru-RU', 'ru'].includes(navigator.language) ? " тег" : " tag")
    } else if (tagsCount < 10 && tagsCount > 20 && ([2, 3, 4].includes(tagsCount % 10))) {
        return tagsCount + (['ru-RU', 'ru'].includes(navigator.language) ? " тега" : " tags")
    } else {
        return tagsCount + (['ru-RU', 'ru'].includes(navigator.language) ? " тегов" : " tags")
    }
}

function externalizeLinks(links) {
    links?.forEach(i => i.setAttribute("target", "_blank"));
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
function addDiffInHistory(reason = "url_change") {
    makeHeaderPartsClickable();
    addHistoryLink();
    externalizeLinks(document.querySelectorAll("#sidebar_content p a"))
    externalizeLinks(document.querySelectorAll("#sidebar_content table a"))
    if (!location.pathname.includes("/history")
        || location.pathname === "/history"
        || (location.pathname.includes("/history/") && !location.pathname.endsWith("/history/"))
        || location.pathname.includes("/user/")
    ) return;
    if (document.querySelector(".compact-toggle-btn") && reason !== "pagination") {
        return;
    }
    // костыль для KeyK/L и OSM tags editor
    document.querySelectorAll("#element_versions_list > div").forEach(i => i.classList.add("browse-section"))
    cleanAllObjects()
    hideSearchForm();
    // в хроме фокус не выставляется
    document.querySelector("#sidebar").focus({focusVisible: false}) // focusVisible работает только в Firefox
    document.querySelector("#sidebar").blur()
    makeLinksInTagsClickable();
    if (!location.pathname.includes("/user/") && !document.querySelector(".compact-toggle-btn")) {
        let compactToggle = document.createElement("button")
        compactToggle.title = "Toggle between full and compact tags diff.\nYou can also use the T key."
        compactToggle.setAttribute("value", "><")
        compactToggle.innerHTML = compactModeSvg
        compactToggle.classList.add("compact-toggle-btn")
        compactToggle.classList.add("btn", "btn-primary", "btn-sm")
        compactToggle.onclick = () => makeElementHistoryCompact()
        let sidebar = document.querySelector("#sidebar_content h2")
        if (!sidebar) {
            return
        }
        sidebar.appendChild(document.createTextNode("\xA0"))
        sidebar.appendChild(compactToggle)
    }

    const styleText = `
    
    .turbo-progress-bar {
        display: none;
    }
   
    .compact-toggle-btn {
        position: relative;
        top: -2px;
        cursor: pointer;
        padding: 0px;
        padding-left: 2px;
        padding-right: 2px;
        line-height: initial;
        border-top: none;
        border-bottom: none;
        height: 1rem;
    }
    
    
    @media ${mediaQueryForWebsiteTheme} {
        .compact-toggle-btn {
            background: var(--bs-gray-800);
            border-color: var(--bs-gray-800);
        }
    
        .compact-toggle-btn:hover {
            background: var(--bs-gray-700);
            border-color: var(--bs-gray-700);
        }
        
        .compact-toggle-btn:active {
            background: var(--bs-gray-700) !important;
            border-color: var(--bs-gray-700) !important;
        }
    }
        
    .compact-toggle-btn svg {
        display: flex;
    }
    
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
    
    .new-letter {
        background: rgba(25, 223, 25, 0.6);
    }
    
    .deleted-letter {
        background: rgba(255, 144, 144, 0.6);
    }
    
    @media ${mediaQueryForWebsiteTheme} {
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
        
        .new-letter {
            background: rgba(25, 223, 25, 0.9); 
        }
    
        .deleted-letter {
            background: rgba(253, 83, 83, 0.8);
        }
    }
    .non-modified-tag .empty-version {
        
    }
    .hidden-version, .hidden-h4 {
        display: none;
    }

    table.browse-tag-list.hide-non-modified-tags > tbody > .non-modified-tag {
        display: none;
    }

    #sidebar_content h2:not(.changeset-header){
        font-size: 1rem;
    }
    
    h4 {
        font-size: 1rem;
    }
    
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
            transition:all 0.3s;
        }
        .was-copied {
            background-color: initial;
            transition:all 0.3s;
        }
    }
    
    @media (max-device-width: 640px) and ${mediaQueryForWebsiteTheme} {
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
    
    .prev-value-span.hidden {
        display: none !important;
    }
    
    ` + (GM_config.get("ShowChangesetGeometry") ? `
    .node-version-view:hover {
        background-color: yellow;
    }
    
    [node-version]:hover {
        background-color: rgba(244, 244, 244);
    }
    
    @media ${mediaQueryForWebsiteTheme} {
        [node-version]:hover {
            background-color: rgb(14, 17, 19);
        }
    }
          
    .way-version-view:hover {
        background-color: yellow;
    }
    
    [way-version]:hover {
        background-color: rgba(244, 244, 244);
    }
    
    @media ${mediaQueryForWebsiteTheme} {
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
    
    @media ${mediaQueryForWebsiteTheme} {
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

    @media ${mediaQueryForWebsiteTheme} {        
        path.stroke-polyline {
            filter: drop-shadow(1px 1px 0 #7a7a7a) drop-shadow(-1px -1px 0 #7a7a7a) drop-shadow(1px -1px 0 #7a7a7a) drop-shadow(-1px 1px 0 #7a7a7a);
        }
    }
    ` : ``);
    injectCSSIntoOSMPage(styleText)
    const versions = [{tags: [], coordinates: "", wasModified: false, nodes: [], members: [], visible: true}];
    // add/modification
    const versionsHTML = Array.from(document.querySelectorAll('#element_versions_list > div:not(.processed):not(:has(a[href*="/redactions/"]:not([rel])))'))
    for (let ver of versionsHTML.toReversed()) {
        ver.classList.add("processed")
        let wasModifiedObject = false;
        const version = ver.children[0].childNodes[1].href.match(/\/(\d+)$/)[1]
        const kv = ver.querySelectorAll("tbody > tr") ?? [];
        const tags = [];

        const metainfoHTML = ver.querySelector('div:nth-of-type(1)');

        const changesetA = ver.querySelector('div > div a[href^="/changeset/"]:not([rel])');
        const changesetHTML = changesetA?.parentElement;
        const changesetID = changesetA.textContent

        const time = metainfoHTML.querySelector("time")

        const coordinates = ver.querySelector("div a:has(.latitude)")
        const locationHTML = coordinates?.parentElement;
        const locationA = ver.querySelector("div a:has(.latitude)");

        if (metainfoHTML.querySelector('a[href*="/user/"]:not([rel])')) {
            const a = metainfoHTML.querySelector('a[href*="/user/"]:not([rel])')
            metainfoHTML.innerHTML = ""
            metainfoHTML.appendChild(time)
            metainfoHTML.appendChild(document.createTextNode(" "))
            metainfoHTML.appendChild(a)
            metainfoHTML.appendChild(document.createTextNode(" "))
        } else {
            metainfoHTML.innerHTML = ""
            metainfoHTML.appendChild(time)
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

        changesetHTML.innerHTML = ''
        let hashtag = document.createTextNode("#")
        metainfoHTML.appendChild(hashtag)
        const changesetWrapper = document.createElement("span")
        changesetWrapper.appendChild(changesetA)
        metainfoHTML.appendChild(changesetWrapper)
        let visible = true

        if (location.pathname.startsWith("/node")) {
            if (coordinates) {
                locationHTML.innerHTML = ''
                locationHTML.appendChild(locationA)
                metainfoHTML.appendChild(locationHTML)
            } else {
                visible = false
                wasModifiedObject = true // because sometimes deleted object has tags
                time.before(document.createTextNode("🗑 "))
            }
        } else if (location.pathname.startsWith("/way")) {
            if (!ver.querySelector("details")) {
                time.before(document.createTextNode("🗑 "))
            }
        } else if (location.pathname.startsWith("/relation")) {
            if (!ver.querySelector("details")) {
                time.before(document.createTextNode("🗑 "))
            }
        }

        const valuesLinks = new Map()
        document.querySelectorAll("#element_versions_list > div table td a").forEach(a => {
            valuesLinks.set(a.textContent, a.href)
        })
        const showPreviousTagValue = GM_config.get("ShowPreviousTagValue", true)
        kv.forEach(
            (i) => {
                let k = i.querySelector("th > a")?.textContent ?? i.querySelector("th")?.textContent;
                i.querySelector("td .prev-value-span")?.remove()
                if (i.querySelector("td .current-value-span")) {
                    i.querySelector("td .current-value-span").classList.remove("current-value-span")
                }
                i.querySelector(".wdt-preview svg title")?.remove()
                let v = i.querySelector("td .wdplugin")?.textContent ?? i.querySelector("td")?.textContent;
                if (k === undefined) {
                    // todo support multiple wikidata
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
                            const valCell = i.querySelector("td")
                            if (isRTLLayout) {
                                valCell.dir = ""
                            }
                            valCell.classList.add("history-diff-modified-tag")
                            valCell.innerHTML = "<span class='current-value-span'>" + valCell.innerHTML + "</span>"
                            valCell.onclick = e => {
                                if (e.altKey) return
                                if (window.getSelection().type === "Range") return
                                if (e.target.nodeName === "A") return

                                e.preventDefault()
                                e.stopPropagation()
                                if (valCell.querySelector(".prev-value-span").classList.contains("hidden")) {
                                    document.querySelectorAll(".prev-value-span").forEach(span => span.classList.remove("hidden"))
                                } else {
                                    document.querySelectorAll(".prev-value-span").forEach(span => span.classList.add("hidden"))
                                }
                            }

                            const currentValueSpan = i.querySelector("td .current-value-span")
                            const prevValueSpan = document.createElement("span")
                            prevValueSpan.classList.add("prev-value-span")

                            const diff = arraysDiff(Array.from(el[1]).toReversed(), Array.from(v).toReversed(), 1).toReversed()
                            // todo unify with diff in changesets
                            // todo detect asci -> unicode or less strict cond
                            if (!i.querySelector("td a") && v.length > 1 && el[1].length > 1
                                && (
                                    diff.length === v.length && el[1].length === v.length
                                    && diff.reduce((cnt, b) => cnt + (b[0] !== b[1]), 0) === 1
                                    || diff.reduce((cnt, b) => cnt + (b[0] !== b[1] && b[0] !== null), 0) === 0
                                    || diff.reduce((cnt, b) => cnt + (b[0] !== b[1] && b[1] !== null), 0) === 0
                                )) {
                                let prevText = document.createElement("span")
                                let newText = document.createElement("span")
                                diff.forEach(c => {
                                    if (c[0] !== c[1]) {
                                        if (c[1]) {
                                            const colored = document.createElement("span")
                                            colored.classList.add("new-letter")
                                            colored.textContent = c[1]
                                            newText.appendChild(colored)
                                        }
                                        if (c[0]) {
                                            const colored = document.createElement("span")
                                            colored.classList.add("deleted-letter")
                                            colored.textContent = c[0]
                                            prevText.appendChild(colored)
                                        }
                                    } else {
                                        prevText.appendChild(document.createTextNode(c[0]))
                                        newText.appendChild(document.createTextNode(c[1]))
                                    }
                                })
                                prevText.normalize()
                                newText.normalize()
                                prevValueSpan.appendChild(prevText)
                                prevValueSpan.appendChild(document.createTextNode(` ${arrowSymbolForChanges} `))
                                newText.classList.add("current-value-span")
                                newText.style.display = "inline-block"
                                if (showPreviousTagValue) {
                                    currentValueSpan.replaceWith(newText)
                                } else {
                                    currentValueSpan.replaceWith(v)
                                }
                                prevText.dir = "auto"
                                newText.dir = "auto"
                            } else {
                                if (valuesLinks.has(el[1])) {
                                    const valueLink = document.createElement("a")
                                    valueLink.href = valuesLinks.get(el[1])
                                    valueLink.target = "_blank"
                                    valueLink.title = ""
                                    valueLink.textContent = `${el[1]}`
                                    prevValueSpan.appendChild(valueLink)
                                    prevValueSpan.appendChild(document.createTextNode(` ${arrowSymbolForChanges} `))
                                } else {
                                    let prevText = document.createElement("span")
                                    prevText.appendChild(document.createTextNode(el[1]))
                                    let newText = document.createElement("span")
                                    newText.appendChild(document.createTextNode(v))

                                    prevValueSpan.appendChild(prevText)
                                    prevValueSpan.appendChild(document.createTextNode(` ${arrowSymbolForChanges} `))
                                    newText.classList.add("current-value-span")
                                    newText.style.display = "inline-block"
                                    if (showPreviousTagValue) {
                                        currentValueSpan.replaceWith(newText)
                                    } else {
                                        currentValueSpan.replaceWith(v)
                                    }
                                }
                            }

                            currentValueSpan.setAttribute("value", v)
                            currentValueSpan.classList.add("current-value-span")
                            currentValueSpan.style.display = "inline-block"
                            prevValueSpan.style.display = "inline-block"
                            valCell.prepend(prevValueSpan)
                            valCell.removeAttribute("dir")
                            if (!showPreviousTagValue) {
                                prevValueSpan.classList.add("hidden")
                            }
                            i.title = `Click for hide previous value`;
                            // i.title = `was: "${el[1]}"`;
                            wasModifiedObject = tagWasModified = true
                        }
                    })
                }
                if (!tagWasModified) {
                    i.classList.add("non-modified-tag")
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
        if (location.pathname.startsWith("/way")) {
            childNodes = Array.from(ver.querySelectorAll("details ul.list-unstyled li")).map(el => el.textContent.match(/\d+/)[0])
            let lastChildNodes = versions.slice(-1)[0].nodes
            if (version > 1 &&
                (childNodes.length !== lastChildNodes.length
                    || childNodes.some((el, index) => lastChildNodes[index] !== childNodes[index]))) {
                ver.querySelector("details > summary")?.classList.add("history-diff-modified-tag")
                wasModifiedObject = true
            }
            ver.querySelector("details")?.removeAttribute("open")
        } else if (location.pathname.startsWith("/relation")) {
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
        ver.title = makeTitleForTagsCount(tags.length);
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
                    td.innerHTML = `<svg width="14" height="14" class="float-end m-1"><title></title><rect x="0.5" y="0.5" width="13" height="13" fill="" stroke="#2222"></rect></svg>`
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
    if (document.querySelector("#older_element_versions_navigation a")) {
        versionsHTML.toReversed()?.[0].classList.remove("processed")
        versionsHTML.toReversed()?.[0]?.querySelectorAll(".history-diff-new-tag, .history-diff-modified-tag")?.forEach(elem => {
            elem.classList.remove("history-diff-new-tag")
            elem.classList.remove("history-diff-modified-tag")
        })
    }
    let hasRedacted = false
    Array.from(document.querySelectorAll('#element_versions_list > div:has(a[href*="/redactions/"]:not([rel]))')).forEach(
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
    if (reason === "pagination") {
        makeElementHistoryCompact(document.querySelector(".compact-toggle-btn").getAttribute("value") !== "><");
    } else {
        makeElementHistoryCompact();
    }
    makeHashtagsClickable();
    makeTimesSwitchable();
    document.querySelectorAll("#element_versions_list > div p").forEach(shortOsmOrgLinks);
    addCommentsCount();
    setupNodeVersionView();
    setupWayVersionView();
    setupRelationVersionView();
    expandWikidata();
    addCopyCoordinatesButtons();
    monitorHistoryPaginationMoving();
    console.log("Click by pagination from AddDiffInHistory")
    document.querySelector("#older_element_versions_navigation a")?.click()
}


function setupVersionsDiff(path) {
    if (!path.includes("/history")
        && !path.startsWith("/node")
        && !path.startsWith("/way")
        && !path.startsWith("/relation")) {
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
    const match = location.pathname.match(/relation\/(\d+)\/history\/(\d+)\/?$/)
    if (!match) {
        return
    }
    if (document.querySelector("#load-relation-version")) return
    const btn = document.createElement("a")
    btn.textContent = "📥"
    btn.id = "load-relation-version"
    btn.title = "Load relation version via Overpass API"
    btn.tabIndex = 0
    btn.style.cursor = "pointer"

    async function clickForDownloadHandler(e) {
        if (e.type === "keypress" && (e.code === "Space" || e.code === "Enter")) {
            e.preventDefault()
        } else if (e.type === "keypress") {
            return
        }
        btn.style.cursor = "progress"
        const match = location.pathname.match(/relation\/(\d+)\/history\/(\d+)\/?$/)
        const id = parseInt(match[1])
        const timestamp = document.querySelector("time").getAttribute("datetime")
        try {
            const {restrictionRelationErrors} = await loadRelationVersionMembersViaOverpass(id, timestamp);
            showRestrictionValidationStatus(restrictionRelationErrors, document.querySelector("#element_versions_list > div details summary"))
        } catch (e) {
            btn.style.cursor = "pointer"
            throw e
        }
        btn.style.visibility = "hidden"
    }

    btn.addEventListener("click", clickForDownloadHandler)
    btn.addEventListener("keypress", clickForDownloadHandler)
    document.querySelector("#element_versions_list > div h4")?.appendChild(btn)
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

async function addHoverForNodesParents() {
    if (!location.pathname.match(/^\/node\/(\d+)\/?$/)) {
        return
    }
    document.querySelectorAll(`details [href^="/way/"]:not(.hover-added)`).forEach(elem => {
        elem.classList.add("hover-added")
        setTimeout(async () => {
            const wayID = parseInt(elem.href.match(/way\/(\d+)/)[1])
            const wayData = await loadWayMetadata(wayID)
            const wayInfo = wayData.elements.find(i => i.id === wayID)
            /*** @type {Map<string, NodeVersion>}*/
            const nodesMap = new Map(Object.entries(Object.groupBy(wayData.elements.filter(i => i.type === "node"), i => i.id)).map(([k, v]) => [k, v[0]]));
            const wayLi = elem?.parentElement?.parentElement?.parentElement;
            wayLi.classList.add("node-last-version-parent");
            wayLi.onmouseenter = () => {
                const currentNodesList = wayInfo.nodes.map(i => [nodesMap.get(i.toString()).lat, nodesMap.get(i.toString()).lon]);
                showActiveWay(cloneInto(currentNodesList, unsafeWindow), darkModeForMap ? "#ff00e3" : "#000000");
            }
            wayLi.onclick = (e) => {
                if (e.altKey) return;
                if (e.target.tagName === "A") return;
                const currentNodesList = wayInfo.nodes.map(i => [nodesMap.get(i.toString()).lat, nodesMap.get(i.toString()).lon]);
                showActiveWay(cloneInto(currentNodesList, unsafeWindow), darkModeForMap ? "#ff00e3" : "#000000", true);
            }
            wayLi.ondblclick = zoomToCurrentObject
            if (wayInfo.tags) {
                Object.entries(wayInfo.tags).forEach(([k, v]) => {
                    wayLi.title += `\n${k}=${v}`;
                })
                wayLi.title = wayLi.title.trim()
            }
        })
    })
    document.querySelector(".node-last-version-parent")?.parentElement?.parentElement?.querySelector("summary")?.addEventListener("mouseenter", () => {
        cleanObjectsByKey("activeObjects")
    })
    document.querySelector(".secondary-actions")?.addEventListener("mouseenter", () => {
        cleanObjectsByKey("activeObjects")
    })
    console.log("addHoverForWayNodes finished");
}

async function addHoverForWayNodes() {
    if (!location.pathname.match(/^\/way\/(\d+)\/?$/)) {
        return
    }
    const wayData = await loadWayMetadata();
    if (!wayData) return
    /*** @type {Map<string, NodeVersion>}*/
    const nodesMap = new Map(Object.entries(Object.groupBy(wayData.elements.filter(i => i.type === "node"), i => i.id)).map(([k, v]) => [k, v[0]]));
    document.querySelectorAll(`details [href^="/node/"]:not(.hover-added)`).forEach(elem => {
        elem.classList.add("hover-added")
        const nodeInfo = nodesMap.get(elem.href.match(/node\/(\d+)/)[1]);
        const nodeLi = elem?.parentElement?.parentElement?.parentElement;
        nodeLi.classList.add("way-last-version-node");
        nodeLi.onmouseenter = () => {
            showActiveNodeMarker(nodeInfo.lat.toString(), nodeInfo.lon.toString(), darkModeForMap ? "#ff00e3" : "#000000", true, 6, 3)
        }
        nodeLi.onclick = (e) => {
            if (e.altKey) return;
            panTo(nodeInfo.lat.toString(), nodeInfo.lon.toString());
            showActiveNodeMarker(nodeInfo.lat.toString(), nodeInfo.lon.toString(), darkModeForMap ? "#ff00e3" : "#000000", true, 6, 3);
        }
        nodeLi.ondblclick = zoomToCurrentObject
        if (nodeInfo.tags) {
            Object.entries(nodeInfo.tags).forEach(([k, v]) => {
                nodeLi.title += `\n${k}=${v}`;
            })
            nodeLi.title = nodeLi.title.trim()
        }
    })
    document.querySelector(".way-last-version-node")?.parentElement?.parentElement?.querySelector("summary")?.addEventListener("mouseenter", () => {
        cleanObjectsByKey("activeObjects")
    })
    document.querySelector(".secondary-actions")?.addEventListener("mouseenter", () => {
        cleanObjectsByKey("activeObjects")
    })
    console.log("addHoverForWayNodes finished");
}

/**
 * @param {string[]} restrictionRelationErrors
 * @param {HTMLElement} targetElem
 */
function showRestrictionValidationStatus(restrictionRelationErrors, targetElem) {
    if (restrictionRelationErrors.length === 0) {
        return
    }
    if (!targetElem.querySelector(".validation-status")) {
        const validationStatus = document.createElement("span")
        validationStatus.classList.add("validation-status")
        validationStatus.textContent = " ⚠️"
        validationStatus.title = restrictionRelationErrors.join("\n")
        targetElem.appendChild(validationStatus)
    }
}

async function addHoverForRelationMembers() {
    const match = location.pathname.match(/^\/relation\/(\d+)\/?$/)
    if (!match) {
        return;
    }
    const relation_id = parseInt(match[1]);
    const relationData = await loadRelationMetadata(relation_id);
    if (!relationData) return
    /*** @type {Map<string, NodeVersion>}*/
    const nodesMap = new Map(Object.entries(Object.groupBy(relationData.elements.filter(i => i.type === "node"), i => i.id)).map(([k, v]) => [k, v[0]]));
    /*** @type {Map<string, WayVersion>}*/
    const waysMap = new Map(Object.entries(Object.groupBy(relationData.elements.filter(i => i.type === "way"), i => i.id)).map(([k, v]) => [k, v[0]]));
    /*** @type {Map<string, RelationVersion>}*/
    const relationsMap = new Map(Object.entries(Object.groupBy(relationData.elements.filter(i => i.type === "relation"), i => i.id)).map(([k, v]) => [k, v[0]]));
    let restrictionArrows = []
    const pinSign = document.createElement("span")

    function bringRestrictionArrowsToFront() {
        restrictionArrows.forEach(i => i.bringToFront())
    }

    let isRestriction = false
    document.querySelectorAll(`details [href^="/node/"]:not(.hover-added)`).forEach(elem => {
        elem.classList.add("hover-added")
        const nodeInfo = nodesMap.get(elem.href.match(/node\/(\d+)/)[1]);
        const nodeLi = elem?.parentElement?.parentElement?.parentElement;
        nodeLi.classList.add("relation-last-version-member");
        nodeLi.onmouseenter = () => {
            showActiveNodeMarker(nodeInfo.lat.toString(), nodeInfo.lon.toString(), darkModeForMap ? "#ff00e3" : "#000000", true, 6, 3)
            bringRestrictionArrowsToFront();
            if (isRestriction && pinSign.classList.contains("pinned")) {
                // https://github.com/deevroman/better-osm-org/pull/324#issuecomment-2993733516
                injectJSIntoPage(`
                (() => {
                    let tmp = document.createElement("span")
                    tmp.innerHTML = '<svg id="kek" width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="6" stroke="black" stroke-width="3" fill="none" /></svg>'
                    window.prevdo = {
                        maxWidth: 10,
                        maxHeight: 10,
                        className: "restriction-via-node-workaround",
                        icon: L.icon({
                            iconUrl: "data:image/svg+xml;base64," + btoa(tmp.innerHTML),
                            iconSize: [100, 100],
                            iconAnchor: [50, 50]
                        })
                    };
                })()
                `)
                const m = getWindow().L.marker(getWindow().L.latLng(nodeInfo.lat, nodeInfo.lon), getWindow().prevdo);
                layers["activeObjects"].push(m)
                m.addTo(getMap());
            }
        }
        nodeLi.onclick = (e) => {
            if (e.altKey) return;
            panTo(nodeInfo.lat.toString(), nodeInfo.lon.toString());
            showActiveNodeMarker(nodeInfo.lat.toString(), nodeInfo.lon.toString(), darkModeForMap ? "#ff00e3" : "#000000", true, 6, 3);
            bringRestrictionArrowsToFront();
        }
        nodeLi.ondblclick = zoomToCurrentObject
        if (nodeInfo.tags) {
            Object.entries(nodeInfo.tags).forEach(([k, v]) => {
                nodeLi.title += `\n${k}=${v}`;
            })
            nodeLi.title = nodeLi.title.trim()
        }
    })
    document.querySelectorAll(`details [href^="/way/"]:not(.hover-added)`).forEach(elem => {
        elem.classList.add("hover-added")
        const wayInfo = waysMap.get(elem.href.match(/way\/(\d+)/)[1]);
        const wayLi = elem?.parentElement?.parentElement?.parentElement;
        wayLi.classList.add("relation-last-version-member");
        wayLi.onmouseenter = () => {
            const currentNodesList = wayInfo.nodes.map(i => [nodesMap.get(i.toString()).lat, nodesMap.get(i.toString()).lon]);
            showActiveWay(cloneInto(currentNodesList, unsafeWindow), darkModeForMap ? "#ff00e3" : "#000000");
            bringRestrictionArrowsToFront();
        }
        wayLi.onclick = (e) => {
            if (e.altKey) return;
            if (e.target.tagName === "A") return;
            const currentNodesList = wayInfo.nodes.map(i => [nodesMap.get(i.toString()).lat, nodesMap.get(i.toString()).lon]);
            showActiveWay(cloneInto(currentNodesList, unsafeWindow), darkModeForMap ? "#ff00e3" : "#000000", true);
            bringRestrictionArrowsToFront();
        }
        wayLi.ondblclick = zoomToCurrentObject
        if (wayInfo.tags) {
            Object.entries(wayInfo.tags).forEach(([k, v]) => {
                wayLi.title += `\n${k}=${v}`;
            })
            wayLi.title = wayLi.title.trim()
        }
    })
    document.querySelectorAll(`details:last-of-type [href^="/relation/"]:not(.hover-added)`).forEach(elem => {
        elem.classList.add("hover-added")
        const relationInfo = relationsMap.get(elem.href.match(/relation\/(\d+)/)[1]);
        const relationLi = elem?.parentElement?.parentElement?.parentElement;
        relationLi.classList.add("relation-last-version-member");
        relationLi.onmouseenter = () => {
            relationInfo.members.forEach(i => {
                if (i.type === "node") {
                    showActiveNodeMarker(nodesMap[i.id].lat.toString(), nodesMap[i.id].lon.toString(), darkModeForMap ? "#ff00e3" : "#000000", true, 6, 3)
                } else if (i.type === "way") {
                    const currentNodesList = waysMap[i.id].nodes.map(i => [nodesMap.get(i.toString()).lat, nodesMap.get(i.toString()).lon]);
                    showActiveWay(cloneInto(currentNodesList, unsafeWindow), darkModeForMap ? "#ff00e3" : "#000000");
                } else {
                    // todo
                }
            })
            bringRestrictionArrowsToFront();
        }
        relationLi.onclick = (e) => {
            if (e.altKey) return;
            if (e.target.tagName === "A") return;
            relationInfo.members.forEach(i => {
                if (i.type === "node") {
                    if (e.altKey) return;
                    panTo(nodesMap[i.id].lat.toString(), nodesMap[i.id].lon.toString());
                    showActiveNodeMarker(nodesMap[i.id].lat.toString(), nodesMap[i.id].lon.toString(), darkModeForMap ? "#ff00e3" : "#000000", true, 6, 3);
                } else if (i.type === "way") {
                    const currentNodesList = waysMap[i.id].nodes.map(i => [nodesMap.get(i.toString()).lat, nodesMap.get(i.toString()).lon]);
                    showActiveWay(cloneInto(currentNodesList, unsafeWindow), darkModeForMap ? "#ff00e3" : "#000000", true);
                } else {
                    // todo
                }
            })
            bringRestrictionArrowsToFront();
        }
        relationLi.ondblclick = zoomToCurrentObject
        if (relationInfo.tags) {
            Object.entries(relationInfo.tags).forEach(([k, v]) => {
                relationLi.title += `\n${k}=${v}`;
            })
            relationLi.title = relationLi.title.trim()
        }
    })
    document.querySelector(".relation-last-version-member")?.parentElement?.parentElement?.querySelector("summary")?.addEventListener("mouseenter", () => {
        cleanObjectsByKey("activeObjects")
    })
    document.querySelector(".secondary-actions")?.addEventListener("mouseenter", () => {
        cleanObjectsByKey("activeObjects")
    })
    if (document.querySelector('#sidebar_content h2:not(.restriction-rendered)') && isRestrictionObj(relationsMap.get(relation_id.toString()).tags ?? {})) {
        isRestriction = true
        document.querySelector('#sidebar_content h2').classList.add("restriction-rendered")
        const extendedRelationVersion = relationsMap.get(relation_id.toString())
        extendedRelationVersion.members = extendedRelationVersion.members.map(mem => {
            if (mem.type === "node") {
                mem['lat'] = nodesMap.get(mem.ref.toString()).lat
                mem['lon'] = nodesMap.get(mem.ref.toString()).lon
                return /** @type {ExtendedRelationNodeMember} */ mem
            } else if (mem.type === "way") {
                mem['geometry'] = waysMap.get(mem.ref.toString()).nodes.map(n => ({
                    lat: nodesMap.get(n.toString()).lat,
                    lon: nodesMap.get(n.toString()).lon
                }))
                return /** @type {ExtendedRelationWayMember} */ mem
            } else if (mem.type === "relation") {
                // todo
                return /** @type {ExtendedRelationMember} */ mem
            }
        })
        const errors = validateRestriction(/** @type {ExtendedRelationVersion} */ extendedRelationVersion)
        if (errors.length) {
            showRestrictionValidationStatus(errors, document.querySelector("#sidebar_content > div:first-of-type details:last-of-type summary"))
        } else {
            restrictionArrows = renderRestriction(/** @type {ExtendedRelationVersion} */ extendedRelationVersion, restrictionColors[extendedRelationVersion.tags['restriction']] ?? "#000", "customObjects")
            pinSign.classList.add("pinned")
            pinSign.textContent = "📌"
            pinSign.tabIndex = 0
            pinSign.title = "Pin restriction sign on map.\nYou can hide all the objects that better-osm-org adds by pressing ` or ~"
            pinSign.style.cursor = "pointer"
            pinSign.onkeypress = pinSign.onclick = async (e) => {
                e.preventDefault()
                e.stopImmediatePropagation()
                if (pinSign.classList.contains("pinned")) {
                    pinSign.style.cursor = "pointer"
                    pinSign.classList.remove("pinned")
                    pinSign.style.filter = "grayscale(1)"
                    pinSign.title = "Hide restriction sign"
                    restrictionArrows.forEach(i => i.getElement().style.display = "none")
                } else {
                    pinSign.title = "Hide restriction sign"
                    pinSign.classList.add("pinned")
                    pinSign.style.filter = ""
                    restrictionArrows.forEach(i => i.getElement().style.display = "")
                }
            }
            document.querySelector("#sidebar_content > div:first-of-type details:last-of-type summary").appendChild(document.createTextNode(" "))
            document.querySelector("#sidebar_content > div:first-of-type details:last-of-type summary").appendChild(pinSign)
        }
    }
    console.log("addHoverForRelationMembers finished");
}

const isMac = navigator.platform?.toUpperCase()?.indexOf('MAC') >= 0;

function makeHeaderPartsClickable() {
    function makeElemCopyable(elem, url = "") {
        if (/^\d+$/.test(elem.textContent)) {
            elem.title = `Click to copy ID\n${isMac ? "Cmd" : "Ctrl"} + click to copy URL`
        } else {
            elem.title = "Click to copy"
        }
        elem.style.cursor = "pointer";
        elem.classList.add("copyable")
        elem.addEventListener("click", e => {
            if (e.altKey) return;
            if (window.getSelection().type === "Range") return;
            if ((e.ctrlKey || e.metaKey) && url !== "") {
                navigator.clipboard.writeText(url).then(() => copyAnimation(e, url));
            } else {
                navigator.clipboard.writeText(elem.textContent).then(() => copyAnimation(e, elem.textContent));
            }
        })
    }

    document.querySelectorAll("#sidebar_content h2 bdi:not(.copyable)").forEach(i => {
        if (i.textContent.match(/^\d+$/)) {
            const url = shortOsmOrgLinksInText(location.origin + location.pathname)
            if (url.startsWith("http")) {
                makeElemCopyable(i, url)
            } else {
                makeElemCopyable(i, "https://" + url)
            }
        } else {
            makeElemCopyable(i)
        }
    })
    document.querySelectorAll("#sidebar_content h2:not(:has(.copyable))").forEach(i => {
        if (i.childNodes.length >= 1 && i.childNodes[0].nodeName === "#text") {
            const match = /\d+/g.exec(i.childNodes[0].textContent);
            if (!match) return;
            i.childNodes[0].splitText(match.index + match[0].length)
            i.childNodes[0].splitText(match.index)
            const span = document.createElement("bdi")
            span.textContent = i.childNodes[1].textContent
            i.childNodes[1].replaceWith(span)
            const url = shortOsmOrgLinksInText(location.origin + location.pathname)
            if (url.startsWith("http")) {
                makeElemCopyable(span, url)
            } else {
                makeElemCopyable(span, "https://" + url)
            }
        }
    })
}

function expandWikidata() {
    const links = Array.from(document.querySelectorAll(".wdt-preview:not([disabled])"));
    console.log("Wikilinks count:", links.length);
    (links.find(i => i.parentElement.classList.contains("history-diff-new-tag") || i.parentElement.classList.contains("history-diff-modified-tag")) ?? links?.[0])?.click();
    setTimeout(() => {links.slice(0, 3).forEach(i => i.click())}, 100);
    setTimeout(() => {links.slice(3).forEach(i => i.click())}, 1000);
}

function addCopyCoordinatesButtons() {
    const m = location.pathname.match(/^\/(node|way)\/(\d+)/);
    if (!m) {
        return;
    }
    const type = m[1];
    if (type === "way") {
        return;
    }

    function addCopyButton(coordsElem, lat, lon) {
        const coordinatesFormatters = {
            "Lat Lon": {getter: () => `${lat} ${lon}`},
            "Lon Lat": {getter: () => `${lon} ${lat}`},
            "geo:": {getter: () => `geo:${lat},${lon}`}
        }
        if (getMap && getMap()) {
            coordinatesFormatters["osm.org"] =  {getter: () => `osm.org#map=${getMap().getZoom()}/${lat}/${lon}`}
        }

        coordsElem.onclick = async e => {
            e.preventDefault()
            e.stopPropagation()
            e.stopImmediatePropagation()

            const coordinatesFormat = await GM.getValue("CoordinatesFormat") ?? "Lat Lon";
            const text = coordinatesFormatters[coordinatesFormat]['getter']()
            navigator.clipboard.writeText(text).then(() => copyAnimation({target: coordsElem}, text));
        }
        setTimeout(async () => {
            const coordinatesFormat = await GM.getValue("CoordinatesFormat") ?? "Lat Lon";
            coordsElem.title = "Click to copy " + coordinatesFormatters[coordinatesFormat]['getter']()
        })
        coordsElem.classList.add("copyable")
        const copyButton = document.createElement("span")
        copyButton.classList.add("copy-coords-btn")
        copyButton.textContent = "📄"
        copyButton.title = "Select coordinates format for copy.\nTo copy just click by coordinates"
        copyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-icon lucide-file"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>'
        copyButton.style.height = "0.9rem"
        copyButton.style.position = "relative"
        if (location.pathname.endsWith("/history")) {
            copyButton.style.top = "-2px"
        } else {
            copyButton.style.top = "-1px"
        }
        copyButton.style.left = "-1px"
        copyButton.style.color = "gray"
        copyButton.style.cursor = "pointer"

        async function contextMenuHandler(e) {
            const coordinatesFormat = await GM.getValue("CoordinatesFormat") ?? "Lat Lon";
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            injectContextMenuCSS();
            document.querySelectorAll(".betterOsmContextMenu").forEach(i => i.remove())
            const menu = document.createElement("div");
            menu.classList.add("betterOsmContextMenu");
            Object.entries(coordinatesFormatters).forEach(([format, formatter], ind) => {
                const listItem = document.createElement("div");
                const text = formatter.getter()
                const a = document.createElement("a");
                a.textContent = text;
                a.title = "Click to copy " + text;
                a.onclick = () => {
                    navigator.clipboard.writeText(text);
                }

                const pin = document.createElement("input")
                pin.id = "CoordFormat_" + ind
                pin.type = "radio"
                pin.classList.add("pin")
                pin.setAttribute("name", "viewer-selector")
                const pinLabel = document.createElement("label");
                pinLabel.setAttribute("for", "CoordFormat_" + ind)
                pinLabel.classList.add("pin-label")
                pinLabel.textContent = "📌"
                pinLabel.title = "Set as default for copy, when you click by coordinates"
                if (format === coordinatesFormat) {
                    pin.checked = true
                    pinLabel.title = "It's default format, when your click by coordinates"
                }
                pin.onchange = async () => {
                    if (pin.checked) {
                        await GM.setValue("CoordinatesFormat", format)
                        coordsElem.title = "Click to copy " + coordinatesFormatters[format]['getter']()
                    }
                }
                listItem.appendChild(pin);
                listItem.appendChild(pinLabel);
                listItem.appendChild(a);
                document.addEventListener("click", function fn(e) {
                    if (e.target.classList.contains("pin-label") || e.target.classList.contains("pin")) {
                        document.addEventListener("click", fn, {once: true});
                        return
                    }
                    menu.remove()
                }, {once: true})
                menu.appendChild(listItem);
            });
            menu.style.left = `${e.pageX - 30}px`;
            menu.style.top = `${e.pageY}px`;
            document.body.appendChild(menu);
        }

        copyButton.addEventListener("click", contextMenuHandler)
        coordsElem.after(copyButton)
        coordsElem.after(document.createTextNode("\xA0"))
    }
    document.querySelectorAll("#sidebar_content a:has(.longitude):not(.copyable)").forEach(coordsElem => {
        const lat = coordsElem.querySelector(".latitude").textContent.replace(",", ".")
        const lon = coordsElem.querySelector(".longitude").textContent.replace(",", ".")
        addCopyButton(coordsElem, lat, lon)
    })
    if (type === "way") {

    }
    // try {
    //     const wrapper = document.createElement("span")
    //     document.querySelector(".share-geo-uri h4:not(.copyable)")?.appendChild(wrapper)
    //     document.querySelector(".share-geo-uri h4").classList.add("copyable")
    //
    //     const lat = getMap().getCenter().lat.toFixed(6)
    //     const lon = getMap().getCenter().lat.toFixed(6)
    //     addCopyButton(wrapper, lat, lon)
    // } catch (e) {
    //     console.error(e)
    // }
}

function makeVersionPageBetter() {
    const match = location.pathname.match(/(node|way|relation)\/(\d+)(\/history\/(\d+)\/?$|\/?$)/)
    if (!match) {
        return
    }
    addCompactSidebarStyle()
    const browseSectionSelector = document.querySelector("#element_versions_list")
        ? '#element_versions_list > div:not(:has(a[href*="/redactions/"]:not([rel])))'
        : "#sidebar_content > div:first-of-type";
    if (!document.querySelector(".find-user-btn")) {
        try {
            const ver = document.querySelector(browseSectionSelector)
            const tagsCount = ver.querySelectorAll("#sidebar_content tr:has(th):has(td)").length
            if (tagsCount > 5) {
                ver.title = makeTitleForTagsCount(tagsCount)
            }

            const metainfoHTML = ver?.querySelector('div:nth-of-type(1)');
            if (metainfoHTML && !metainfoHTML.querySelector('a[href*="/user/"]:not([rel])')) {
                const time = metainfoHTML.querySelector("time")
                const changesetID = ver.querySelector('div a[href^="/changeset/"]:not([rel])').textContent;

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
        } catch { /* empty */
        }
    }
    makeHeaderPartsClickable()
    addHistoryLink()
    makeLinksInTagsClickable()
    makeHashtagsClickable()
    makeTimesSwitchable()
    document.querySelectorAll(`${browseSectionSelector} p`).forEach(shortOsmOrgLinks)
    addCommentsCount();
    expandWikidata();
    addCopyCoordinatesButtons();
    void addHoverForNodesParents();
    void addHoverForWayNodes();
    void addHoverForRelationMembers();
    // костыль для KeyK/L и OSM tags editor
    document.querySelector("#sidebar_content > div:first-of-type")?.classList?.add("browse-section")
    document.querySelectorAll("#element_versions_list > div").forEach(i => i.classList.add("browse-section"))
}

function setupMakeVersionPageBetter() {
    const match = location.pathname.match(/(node|way|relation)\/(\d+)(\/history\/(\d+)\/?$|\/?$)/)
    if (!match) {
        return
    }
    let timerId = setInterval(makeVersionPageBetter, 500);
    setTimeout(() => {
        clearInterval(timerId);
        console.debug('stop adding MakeVersionPageBetter');
    }, 3000);
    makeVersionPageBetter();
}

// Модули должны стать классами
// - поддерживается всеми браузерами, в которых есть TM
// - изоляция функций и глобальных переменных
// - для модулей, которые внедряются черзе setInterval можно сохранить таймер, чтобы предотвратить дублирование вызовов
// - возможность сохранить результат внедрения

let quickLookInjectingStarted = false
let allTagsOfObjectsVisible = true

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
    const chunkSize = Math.max(1, Math.floor(arr.length / N)); // todo это неправильно, но и так сойдёт
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

// /**
//  * @type ChangesetMetadata|null
//  **/
// let prevChangesetMetadata = null;
/**
 * @type {Object.<string, ChangesetMetadata>}|null
 **/
let changesetMetadatas = {};
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

    if (!location.pathname.startsWith("/changeset/")) {
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
                        getAbortController().abort(ABORT_ERROR_PREV)
                        Array.from(navigationLinks).at(-1).click()
                    }
                } else if (diffX < -sidebar.offsetWidth / 3) {
                    const navigationLinks = document.querySelectorAll("div.secondary-actions")[1]?.querySelectorAll("a")
                    if (navigationLinks && navigationLinks[0].href.includes("/changeset/")) {
                        getAbortController().abort(ABORT_ERROR_NEXT)
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

function error509Handler(res) {
    rateLimitBan = true
    console.error("oops, DOS block")
    setTimeout(async () => {
        getMap()?.attributionControl?.setPrefix(escapeHtml(await res.text()))
    })
    // todo sleep
}

function addRegionForFirstChangeset(attempts = 5) {
    if (location.search.includes("changesets")) return;
    setTimeout(async () => {
        if (rateLimitBan) {
            return
        }
        await interceptMapManually()
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
        console.time(`Geocoding changeset ${center.lng},${center.lat}`)
        fetch(`https://nominatim.openstreetmap.org/reverse.php?lon=${center.lng}&lat=${center.lat}&format=jsonv2&zoom=10`, {signal: getAbortController().signal}).then((res) => {
            res.json().then((r) => {
                if (r?.address?.state) {
                    getMap().attributionControl.setPrefix(`${r.address.state}`)
                    console.timeEnd(`Geocoding changeset ${center.lng},${center.lat}`)
                }
            })
        }).catch(e => {
            console.debug("Nominatim fail")
            console.debug(e)
        })
    })
}

let iconsList = null

async function loadIconsList() {
    let yml;
    const url = `https://raw.githubusercontent.com/openstreetmap/openstreetmap-website/refs/heads/master/config/browse_icons.yml`;
    if (GM_info.scriptHandler !== "FireMonkey") {
        yml = (await GM.xmlHttpRequest({
            url: url,
        })).responseText
    } else {
        yml = await (await GM.fetch(url)).text
    }
    iconsList = {}
    // не, ну а почему бы и нет
    yml.match(/[\w_-]+:\s*(([\w_-]|:\*)+:(\s+{.*}\s+))*/g).forEach(tags => {
        const lines = tags.split("\n")
        lines.slice(1).forEach(i => {
            const line = i.trim()
            if (line === "") return;
            const [, value, jsonValue] = line.match(/(:\*|\w+): (\{.*})/)
            iconsList[lines[0].slice(0, -1) + "=" + value] = JSON.parse(jsonValue.replaceAll(/(\w+):/g, '"$1":'))
        })
    })
    await GM.setValue("poi-icons", JSON.stringify({icons: iconsList, cacheTime: new Date()}))
    return iconsList
}

async function initPOIIcons() {
    const cache = await GM.getValue("poi-icons", "")
    if (cache) {
        console.log("poi icons cached")
        const cacheTime = new Date(cache['cacheTime'])
        if (cacheTime.setUTCDate(cacheTime.getUTCDate() + 1) < new Date()) {
            console.log("but cache outdated")
            setTimeout(loadIconsList, 0)
        }
        iconsList = JSON.parse(cache)['icons']
        return
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
        const key = row.querySelector("th").textContent
        const valueCell = row.querySelector("td")
        if (key.startsWith("panoramax")) {
            makePanoramaxValue(valueCell)
        } else if (key.startsWith("mapillary")) {
            makeMapillaryValue(valueCell)
        } else if (key.startsWith("wikimedia_commons")) {
            makeWikimediaCommonsValue(valueCell)
        } else if (key.startsWith("opening_hours") // https://github.com/opening-hours/opening_hours.js/blob/master/scripts/related_tags.txt
            || ["happy_hours", "delivery_hours", "smoking_hours", "collection_times", "service_times"].includes(key)) {
            if (key !== "opening_hours:signed" && typeof opening_hours !== "undefined") {
                try {
                    new opening_hours(valueCell.textContent, null, {tag_key: key});
                } catch (e) {
                    valueCell.title = e
                    valueCell.classList.add("fixme-tag")
                }
            }
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
    warLog.classList.add("edits-wars-log")
    for (let j = 0; j < objHistory.length; j++) {
        const it = objHistory[j];

        const prevIt = (objHistory[j - 1]?.tags ?? {})[key]
        const targetIt = (it.tags ?? {})[key]
        const prevTag = (prevVersion.tags ?? {})[key]
        // const targetTag = (targetVersion.tags ?? {})[key]

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
            const user_link = document.createElement("a")
            user_link.textContent = `${it.user}`
            user_link.href = `/user/${it.user}`
            user_link.target = "_blank"
            user_link.style.color = "unset"
            td_user.appendChild(user_link)
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
            const user_link = document.createElement("a")
            user_link.textContent = `${it.user}`
            user_link.href = `/user/${it.user}`
            user_link.target = "_blank"
            user_link.style.color = "unset"
            td_user.appendChild(user_link)
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
    targetVersion.nodes?.forEach(node => {
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
    let changedOnlyUninterestedTags = true;

    const uninterestedTags = new Set([
        'check_date', 'check_date:opening_hours',
        'check_date:opening_hours', 'survey:date'
    ]);

    // tags deletion
    if (prevVersion.version !== 0) {
        for (const [key, value] of Object.entries(prevVersion?.tags ?? {})) {
            if (targetVersion.tags === undefined || targetVersion.tags[key] === undefined) {
                const row = makeTagRow(key, value, true)
                row.classList.add("quick-look-deleted-tag")
                tbody.appendChild(row)
                tagsWasChanged = true
                changedOnlyUninterestedTags = false
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
            if (!uninterestedTags.has(key)) {
                changedOnlyUninterestedTags = false;
            }
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
            if (!uninterestedTags.has(key)) {
                changedOnlyUninterestedTags = false;
            }
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
                prevText.dir = "auto"
                newText.dir = "auto"
                diff.forEach(c => {
                    if (c[0] !== c[1]) {
                        if (c[1]) {
                            const colored = document.createElement("span")
                            colored.classList.add("new-letter")
                            colored.textContent = c[1]
                            newText.appendChild(colored)
                        }
                        if (c[0]) {
                            const colored = document.createElement("span")
                            colored.classList.add("deleted-letter")
                            colored.textContent = c[0]
                            prevText.appendChild(colored)
                        }
                    } else {
                        prevText.appendChild(document.createTextNode(c[0]))
                        newText.appendChild(document.createTextNode(c[1]))
                    }
                })
                prevText.normalize()
                newText.normalize()
                valCell.textContent = ""
                valCell.appendChild(prevText)
                valCell.appendChild(document.createTextNode(` ${arrowSymbolForChanges} `))
                valCell.appendChild(newText)
            } else {
                const prevSpan = document.createElement("span")
                prevSpan.dir = "auto"
                prevSpan.textContent = prevVersion.tags[key]
                const newSpan = document.createElement("span")
                newSpan.dir = "auto"
                newSpan.textContent = valCell.textContent
                valCell.textContent = ""
                valCell.appendChild(prevSpan)
                valCell.appendChild(document.createTextNode(` ${arrowSymbolForChanges} `))
                valCell.appendChild(newSpan)
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
            if (!allTagsOfObjectsVisible) {
                row.setAttribute("hidden", "true")
            }
            makeLinksInRowClickable(row)
            tbody.appendChild(row)
        }
    }
    if (targetVersion.visible !== false && prevVersion?.nodes && prevVersion.nodes.toString() !== targetVersion.nodes?.toString()) {
        let geomChangedFlag = document.createElement("span")
        geomChangedFlag.textContent = " 📐"
        geomChangedFlag.tabIndex = 0
        geomChangedFlag.classList.add("nodes-changed")
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
                    const targetTimestamp = (new Date(new Date(changesetMetadatas[targetVersion.changeset].created_at).getTime() - 1)).toISOString()
                    const version = searchVersionByTimestamp(await getNodeHistory(left), targetTimestamp)
                    showActiveNodeMarker(version.lat.toString(), version.lon.toString(), "#ff00e3")
                }
                tagTd.onclick = async e => {
                    e.stopPropagation() // fixme
                    const targetTimestamp = (new Date(new Date(changesetMetadatas[targetVersion.changeset].created_at).getTime() - 1)).toISOString()
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
                    const version = searchVersionByTimestamp(await getNodeHistory(right), changesetMetadatas[targetVersion.changeset].closed_at ?? new Date().toISOString())
                    showActiveNodeMarker(version.lat.toString(), version.lon.toString(), "#ff00e3")
                }
                tagTd2.onclick = async e => {
                    e.stopPropagation() // fixme
                    e.target.classList.add("way-version-node")
                    const version = searchVersionByTimestamp(await getNodeHistory(right), changesetMetadatas[targetVersion.changeset].closed_at ?? new Date().toISOString())
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

        geomChangedFlag.onkeypress = geomChangedFlag.onclick = e => {
            if (e.type === "keypress" && (e.code === "Space" || e.code === "Enter")) {
                e.preventDefault()
            } else if (e.type === "keypress") {
                return
            }
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
        memChangedFlag.tabIndex = 0
        memChangedFlag.classList.add("members-changed")
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
                    const targetTimestamp = (new Date(new Date(changesetMetadatas[targetVersion.changeset].created_at).getTime() - 1)).toISOString()
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
                    const targetTimestamp = (new Date(new Date(changesetMetadatas[targetVersion.changeset].created_at).getTime() - 1)).toISOString()
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
                    const targetTimestamp = (new Date(changesetMetadatas[targetVersion.changeset].closed_at ?? new Date())).toISOString()
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
                    const targetTimestamp = (new Date(changesetMetadatas[targetVersion.changeset].closed_at ?? new Date())).toISOString()
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

        memChangedFlag.onkeypress = memChangedFlag.onclick = e => {
            if (e.type === "keypress" && (e.code === "Space" || e.code === "Enter")) {
                e.preventDefault()
            } else if (e.type === "keypress") {
                return
            }
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
        pinRelation.tabIndex = 0
        pinRelation.classList.add("pin-relation")
        pinRelation.style.cursor = "pointer"
        pinRelation.style.display = "none"
        pinRelation.title = "Pin relation on map"
        pinRelation.onkeypress = pinRelation.onclick = async (e) => {
            if (e.type === "keypress" && (e.code === "Space" || e.code === "Enter")) {
                e.preventDefault()
            } else if (e.type === "keypress") {
                return
            }
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
    if (targetVersion.tags?.['type'] === "restriction") {
        const key = Object.keys(targetVersion.tags).find(k => k === "restriction") ?? Object.keys(targetVersion.tags).find(k => k.startsWith("restriction"))
        if (key && restrictionsSignImages[key]) {
            void fetchTextWithCache(restrictionsSignImages[key]);
        }
    }
    if (tagsWasChanged) {
        i.appendChild(tagsTable)
        if (changedOnlyUninterestedTags) {
            i.parentElement.parentElement.classList.add("tags-uninterested-modified")
        }
    } else {
        i.parentElement.parentElement.classList.add("tags-non-modified")
    }
    i.parentElement.parentElement.classList.add("tags-processed-object")
    return tagsTable
}

/**
 * @typedef {{
 * nodes: Array<HTMLElement>,
 * ways: Array<HTMLElement>,
 * relations: Array<HTMLElement>
 * }}
 * @name ObjectsInComments
 */

/**
 * @param {string} changesetID
 * @param {string} objType
 * @param {ObjectsInComments} objectsInComments
 * @param {Element} i
 * @param {NodeVersion|WayVersion|RelationVersion} prevVersion
 * @param {NodeVersion|WayVersion|RelationVersion} targetVersion
 */
async function processObjectInteractions(changesetID, objType, objectsInComments, i, prevVersion, targetVersion) {
    let changesetMetadata = changesetMetadatas[targetVersion.changeset];
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
        if ((e.target.nodeName === "TH" || e.target.nodeName === "TD") && i.querySelector("[contenteditable]")) return
        if (changesetMetadatas[targetVersion.changeset]) {
            fitBounds([
                [changesetMetadatas[targetVersion.changeset].min_lat, changesetMetadatas[targetVersion.changeset].min_lon],
                [changesetMetadatas[targetVersion.changeset].max_lat, changesetMetadatas[targetVersion.changeset].max_lon]
            ])
        }
    }

    function processNode() {
        i.id = `${changesetID}n${objID}`

        function mouseoverHandler(e) {
            if (e.relatedTarget?.parentElement === e.target) {
                return
            }
            if (targetVersion.visible === false) {
                if (prevVersion.visible !== false) {
                    showActiveNodeMarker(prevVersion.lat.toString(), prevVersion.lon.toString(), "#0022ff")
                    const direction = prevVersion.tags?.['direction'] ?? prevVersion.tags?.['camera:direction']
                    if (direction) {
                        renderDirectionTag(prevVersion.lat, prevVersion.lon, direction, "#0022ff")
                    }
                }
            } else {
                showActiveNodeMarker(targetVersion.lat.toString(), targetVersion.lon.toString(), "#ff00e3")
                const direction = targetVersion.tags?.['direction'] ?? targetVersion.tags?.['camera:direction']
                if (direction) {
                    renderDirectionTag(targetVersion.lat, targetVersion.lon, direction, "#ff00e3")
                }
            }
            resetMapHover()
        }

        i.parentElement.parentElement.onmouseover = mouseoverHandler
        if ((prevVersion.tags && Object.keys(prevVersion.tags).length) || (targetVersion.tags && Object.keys(targetVersion.tags).length)) { // todo temp hack for potential speed up // fixme remove comment
            objectsInComments.nodes.filter(i => i.href.includes(`node/${objID}`)).forEach(link => {
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
            if ((e.target.nodeName === "TH" || e.target.nodeName === "TD") && i.querySelector("[contenteditable]")) return

            document.querySelector("#element_versions_list > div.active-object")?.classList?.remove()
            i.parentElement.parentElement.classList.add("active-object")

            if (prevVersion.visible !== false && targetVersion.visible !== false) {
                fitBoundsWithPadding([
                    [prevVersion.lat.toString(), prevVersion.lon.toString()],
                    [targetVersion.lat.toString(), targetVersion.lon.toString()]
                ], 30)
                showActiveNodeMarker(prevVersion.lat.toString(), prevVersion.lon.toString(), "#0022ff", true)
                showActiveNodeMarker(targetVersion.lat.toString(), targetVersion.lon.toString(), "#ff00e3", false)
                const direction = prevVersion.tags?.['direction'] ?? prevVersion.tags?.['camera:direction']
                if (direction) {
                    renderDirectionTag(prevVersion.lat, prevVersion.lon, direction, "#0022ff")
                }
                const newDirection = targetVersion.tags?.['direction'] ?? targetVersion.tags?.['camera:direction']
                if (direction) {
                    renderDirectionTag(targetVersion.lat, targetVersion.lon, newDirection, "#ff00e3")
                }
            } else if (targetVersion.visible === false) {
                panTo(prevVersion.lat.toString(), prevVersion.lon.toString(), 18, false)
                showActiveNodeMarker(prevVersion.lat.toString(), prevVersion.lon.toString(), "#0022ff", true)
                const direction = prevVersion.tags?.['direction'] ?? prevVersion.tags?.['camera:direction']
                if (direction) {
                    renderDirectionTag(prevVersion.lat, prevVersion.lon, direction, "#0022ff")
                }
            } else {
                if (!repeatedEvent && trustedEvent) { // todo
                    panTo(targetVersion.lat.toString(), targetVersion.lon.toString(), 18, false)
                } else {
                    /*
                    const bounds = getMap().getBounds()
                    const lat1 = bounds.getNorthWest().lat
                    const lng1 = bounds.getNorthWest().lng
                    const lat2 = bounds.getSouthEast().lat
                    const lng2 = bounds.getSouthEast().lng

                    const delta_lat = (lat2 - lat1) / 5.0
                    const delta_lng = (lng2 - lng1) / 5.0

                    const newBounds = getWindow().L.latLngBounds(
                        intoPage([lat1 + delta_lat, lng1 + delta_lng]),
                        intoPage([lat2 - delta_lat, lng2 - delta_lng])
                    )

                    getWindow().L.rectangle(
                        intoPage([
                            [newBounds.getSouth(), newBounds.getWest()],
                            [newBounds.getNorth(), newBounds.getEast()]
                        ]),
                        intoPage({color: "#0022ff", weight: 3, fillOpacity: 0})
                    ).addTo(getMap());

                    if (!newBounds.contains(getWindow().L.latLng(intoPage([targetVersion.lat.toString(), targetVersion.lon.toString()])))) {
                        panTo(targetVersion.lat.toString(), targetVersion.lon.toString(), 18, false)
                    }
                    */
                    // panInside(targetVersion.lat.toString(), targetVersion.lon.toString(), false, [70, 70])
                    panTo(targetVersion.lat.toString(), targetVersion.lon.toString(), 18, false)
                }
                showActiveNodeMarker(targetVersion.lat.toString(), targetVersion.lon.toString(), "#ff00e3", true)
                const direction = targetVersion.tags?.['direction'] ?? targetVersion.tags?.['camera:direction']
                if (direction) {
                    renderDirectionTag(targetVersion.lat, targetVersion.lon, direction, "#ff00e3")
                }
            }
        }
        if (!location.pathname.includes("changeset")) {
            return
        }
        if (targetVersion.visible === false) {
            if (targetVersion.version !== 1 && prevVersion.visible !== false) { // даа, такое есть https://www.openstreetmap.org/node/300524/history
                if (prevVersion.tags) {
                    showNodeMarker(prevVersion.lat.toString(), prevVersion.lon.toString(), "#FF0000", changesetID + "n" + prevVersion.id)
                } else {
                    showNodeMarker(prevVersion.lat.toString(), prevVersion.lon.toString(), "#FF0000", changesetID + "n" + prevVersion.id, "customObjects", 2)
                    // todo show prev parent ways
                }
            }
        } else if (targetVersion.version === 1) {
            if (targetVersion.tags) {
                showNodeMarker(targetVersion.lat.toString(), targetVersion.lon.toString(), "#00a500", changesetID + "n" + targetVersion.id)
            }
            setTimeout(async () => {
                if ((await getChangeset(parseInt(changesetID))).nodesWithOldParentWays.has(parseInt(objID))) {
                    showNodeMarker(targetVersion.lat.toString(), targetVersion.lon.toString(), "#00a500", changesetID + "n" + targetVersion.id)
                }
            }, 0); // dirty hack for https://osm.org/changeset/162017882
        } else if (prevVersion?.visible === false && targetVersion?.visible !== false) {
            showNodeMarker(targetVersion.lat.toString(), targetVersion.lon.toString(), "rgba(89,170,9,0.6)", changesetID + "n" + targetVersion.id, 'customObjects', 2)
        } else {
            showNodeMarker(targetVersion.lat.toString(), targetVersion.lon.toString(), "rgb(255,245,41)", changesetID + "n" + targetVersion.id)
        }
    }

    async function processWay() {
        i.id = `${changesetID}w${objID}`

        const res = await fetch(osm_server.apiBase + objType + "/" + objID + "/full.json", {signal: getAbortController().signal});
        // todo по-хорошему нужно проверять, а не успела ли измениться история линии
        // будет более актуально после добавление предзагрузки
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
            let attempts = 0
            while (!changesetMetadata && attempts < 60) {
                attempts++
                console.log(`changesetMetadata[${targetVersion.changeset}] not ready. Wait second...`)
                await abortableSleep(1000, getAbortController()) // todo нужно поретраить
                changesetMetadata = changesetMetadatas[targetVersion.changeset]
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
            if ((e.target.nodeName === "TH" || e.target.nodeName === "TD") && i.querySelector("[contenteditable]")) return

            document.querySelector("#element_versions_list > div.active-object")?.classList?.remove()
            i.parentElement.parentElement.classList.add("active-object")

            showActiveWay(cloneInto(currentNodesList, unsafeWindow), "#ff00e3", currentNodesList.length !== 0, changesetID + "w" + objID)

            if (version > 1) {
                // show prev version
                const [, nodesHistory] = await loadWayVersionNodes(objID, version - 1);
                const targetTimestamp = (new Date(new Date(changesetMetadatas[targetVersion.changeset].created_at).getTime() - 1)).toISOString()
                const nodesList = filterObjectListByTimestamp(nodesHistory, targetTimestamp)
                showActiveWay(cloneInto(nodesList, unsafeWindow), "rgb(238,146,9)", currentNodesList.length === 0, changesetID + "w" + objID, false, 4, "4, 4")

                showActiveWay(cloneInto(currentNodesList, unsafeWindow), "#ff00e3", false, changesetID + "w" + objID, false)
            } else {
                const targetTimestamp = (new Date(new Date(changesetMetadatas[targetVersion.changeset].created_at).getTime() - 1)).toISOString()
                const prevVersion = searchVersionByTimestamp(await getWayHistory(objID), targetTimestamp);
                if (prevVersion) {
                    const [, nodesHistory] = await loadWayVersionNodes(objID, prevVersion.version);
                    const nodesList = filterObjectListByTimestamp(nodesHistory, targetTimestamp)
                    showActiveWay(cloneInto(nodesList, unsafeWindow), "rgb(238,146,9)", currentNodesList.length === 0, changesetID + "w" + objID, false, 4, "4, 4")
                }
                showActiveWay(cloneInto(currentNodesList, unsafeWindow), "#ff00e3", false, changesetID + "w" + objID, false)
            }
        }
        let attempts = 0
        while (!changesetMetadata && attempts < 60) {
            attempts++
            console.log(`changesetMetadata[${targetVersion.changeset}] not ready. Wait second...`)
            await abortableSleep(1000, getAbortController()) // todo нужно поретраить
            changesetMetadata = changesetMetadatas[targetVersion.changeset]
        }
        if (targetVersion.visible === false) {
            const [, nodesHistory] = await loadWayVersionNodes(objID, prevVersion.version);
            const targetTimestamp = (new Date(new Date(changesetMetadata.created_at).getTime() - 1)).toISOString()
            const nodesList = filterObjectListByTimestamp(nodesHistory, targetTimestamp)
            if (!nodesList.some(i => i.visible === false)) {
                const closedTime = (new Date(changesetMetadata.closed_at ?? new Date())).toISOString()
                const nodesAfterChangeset = filterObjectListByTimestamp(nodesHistory, closedTime)
                if (nodesAfterChangeset.some(i => i.visible === false)) {
                    displayWay(cloneInto(nodesList, unsafeWindow), false, "#ff0000", 3, changesetID + "w" + objID, "customObjects", dashArray)
                } else {
                    // скорее всего это объединение линий, поэтому эту удаление линии нужно отправить на задний план
                    const layer = displayWay(cloneInto(nodesList, unsafeWindow), false, "#ff0000", 7, changesetID + "w" + objID, "customObjects", dashArray)
                    layer.bringToBack()
                    lineWidth = 8
                }
            } else {
                console.error(`broken way: ${objID}`, nodesList) // todo retray
            }
        } else if (version === 1 && targetVersion.changeset === parseInt(changesetID)) {
            displayWay(cloneInto(currentNodesList, unsafeWindow), false, "rgba(0,128,0,0.6)", lineWidth, changesetID + "w" + objID, "customObjects", dashArray)
        } else if (prevVersion?.visible === false) {
            displayWay(cloneInto(currentNodesList, unsafeWindow), false, "rgba(120,238,9,0.6)", lineWidth, changesetID + "w" + objID, "customObjects", dashArray)
        } else {
            displayWay(cloneInto(currentNodesList, unsafeWindow), false, nowDeleted ? "rgb(0,0,0)" : "#373737", lineWidth, changesetID + "w" + objID, "customObjects", null, null, darkModeForMap && isDarkMode())
        }

        async function mouseenterHandler() {
            showActiveWay(cloneInto(currentNodesList, unsafeWindow))
            resetMapHover()
            if (version > 1) {
                // show prev version
                const [, nodesHistory] = await loadWayVersionNodes(objID, version - 1);
                const targetTimestamp = (new Date(new Date(changesetMetadatas[targetVersion.changeset].created_at).getTime() - 1)).toISOString()
                const nodesList = filterObjectListByTimestamp(nodesHistory, targetTimestamp)
                showActiveWay(cloneInto(nodesList, unsafeWindow), "rgb(238,146,9)", false, changesetID + "w" + objID, false, 4, "4, 4")

                showActiveWay(cloneInto(currentNodesList, unsafeWindow), "#ff00e3", false, changesetID + "w" + objID, false, lineWidth)
            } else {
                const targetTimestamp = (new Date(new Date(changesetMetadatas[targetVersion.changeset].created_at).getTime() - 1)).toISOString()
                const prevVersion = searchVersionByTimestamp(await getWayHistory(objID), targetTimestamp);
                if (prevVersion) {
                    const [, nodesHistory] = await loadWayVersionNodes(objID, prevVersion.version);
                    const nodesList = filterObjectListByTimestamp(nodesHistory, targetTimestamp)
                    showActiveWay(cloneInto(nodesList, unsafeWindow), "rgb(238,146,9)", false, changesetID + "w" + objID, false, 4, "4, 4")
                }
                showActiveWay(cloneInto(currentNodesList, unsafeWindow), "#ff00e3", false, changesetID + "w" + objID, false, lineWidth)
            }
        }

        i.parentElement.parentElement.onmouseenter = mouseenterHandler
        objectsInComments.ways.filter(i => i.href.includes(`way/${objID}`)).forEach(link => {
            // link.title = "Alt + click for scroll into object list"
            link.onmouseenter = mouseenterHandler
            link.onclick = (e) => {
                if (!e.altKey) return
                i.scrollIntoView()
            }
        })
    }

    function processRelation() {
        i.id = `${changesetID}r${objID}`
        const btn = document.createElement("a")
        btn.textContent = "📥"
        btn.classList.add("load-relation-version")
        btn.title = "Download this relation"
        btn.tabIndex = 0
        btn.style.cursor = "pointer"

        async function clickForDownloadHandler(e) {
            if (e.altKey) return
            if (window.getSelection().type === "Range") return
            if ((e.target.nodeName === "TH" || e.target.nodeName === "TD") && i.querySelector("[contenteditable]")) return
            if (e.type === "keypress" && (e.code === "Space" || e.code === "Enter")) {
                e.preventDefault()
            } else if (e.type === "keypress") {
                return
            }

            document.querySelector("#element_versions_list > div.active-object")?.classList?.remove()
            i.parentElement.parentElement.classList.add("active-object")

            btn.style.cursor = "progress"
            let targetTimestamp = (new Date(changesetMetadatas[targetVersion.changeset].closed_at ?? new Date())).toISOString()
            if (targetVersion.visible === false) {
                targetTimestamp = new Date(new Date(changesetMetadatas[targetVersion.changeset].created_at).getTime() - 1).toISOString();
            }
            try {
                const relationMetadata = (await loadRelationVersionMembersViaOverpass(parseInt(objID), targetTimestamp, false, "#ff00e3"))
                if (relationMetadata.restrictionRelationErrors.length) {
                    showRestrictionValidationStatus(relationMetadata.restrictionRelationErrors, i.parentElement)
                } else {
                    if (relationMetadata.isRestriction) {
                        i.parentElement.parentElement.title = 'Click with Shift for zoom to "via" members'
                    }
                }
                i.parentElement.parentElement.onclick = (e) => {
                    if (e.altKey) return
                    if (e.shiftKey && relationMetadata.isRestriction) {
                        fitBounds([
                            [relationMetadata.nodesBbox.min_lat, relationMetadata.nodesBbox.min_lon],
                            [relationMetadata.nodesBbox.max_lat, relationMetadata.nodesBbox.max_lon]
                        ])
                    } else {
                        fitBounds([
                            [relationMetadata.bbox.min_lat, relationMetadata.bbox.min_lon],
                            [relationMetadata.bbox.max_lat, relationMetadata.bbox.max_lon]
                        ])
                    }
                }

                async function mouseenterHandler() {
                    if (!pinnedRelations.has(parseInt(objID))) {
                        await loadRelationVersionMembersViaOverpass(parseInt(objID), targetTimestamp, false, "#ff00e3")
                    }
                }

                i.parentElement.parentElement.onmouseenter = mouseenterHandler
                objectsInComments.relations.filter(i => i.href.includes(`relation/${objID}`)).forEach(link => {
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
        }

        btn.addEventListener("click", clickForDownloadHandler)
        btn.addEventListener("keypress", clickForDownloadHandler)
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
    const objects = document.querySelectorAll(`[changeset-id="${changesetID}"]#changeset_${objType}s .list-unstyled li:not(.processed-object):not(.object-in-process)`)
    if (objects.length === 0) {
        return;
    }
    objects.forEach(i => {
        i.classList.add("object-in-process")
    })

    const objectsLinksInComments = { // todo can be optimaized
        nodes: Array.from(document.querySelectorAll(`#element_versions_list > div > div:has([name=subscribe],[name=unsubscribe]) ~ article div a[href*="node/"]`)),
        ways: Array.from(document.querySelectorAll(`#element_versions_list > div > div:has([name=subscribe],[name=unsubscribe]) ~ article div a[href*="way/"]`)),
        relations: Array.from(document.querySelectorAll(`#element_versions_list > div > div:has([name=subscribe],[name=unsubscribe]) ~ article div a[href*="relation/"]`))
    }

    try {
        const needFetch = []

        if (objType === "relation" && objects.length >= 2) {
            for (let i of document.querySelectorAll(`[changeset-id="${changesetID}"]#changeset_${objType}s .list-unstyled li:not(.processed-object) div div`)) {
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
            const res = await fetch(osm_server.apiBase + `${objType}s.json?${objType}s=` + needFetch.join(","), {signal: getAbortController().signal});
            if (res.status === 404) {
                for (let i of document.querySelectorAll(`[changeset-id="${changesetID}"]#changeset_${objType}s .list-unstyled li:not(.processed-object) div div`)) {
                    await processObjectInteractions(changesetID, objType, objectsLinksInComments, i, ...getPrevTargetLastVersions(...await getHistoryAndVersionByElem(i)))
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
                for (let i of document.querySelectorAll(`[changeset-id="${changesetID}"]#changeset_${objType}s .list-unstyled li:not(.processed-object) div div`)) {
                    const [, , objID, strVersion] = i.querySelector("a:nth-of-type(2)").href.match(/(node|way|relation)\/(\d+)\/history\/(\d+)$/);
                    const version = parseInt(strVersion)
                    await processObjectInteractions(changesetID, objType, objectsLinksInComments, i, ...getPrevTargetLastVersions(Object.values(objectsVersions[objID]), version))
                }
            }
        } else {
            await Promise.all(Array.from(document.querySelectorAll(`[changeset-id="${changesetID}"]#changeset_${objType}s .list-unstyled li:not(.processed-object) div div`)).map(async function (i) {
                await processObjectInteractions(changesetID, objType, objectsLinksInComments, i, ...getPrevTargetLastVersions(...await getHistoryAndVersionByElem(i)))
            }))
        }
    } finally {
        objects.forEach(i => {
            i.classList.remove("object-in-process")
        })
    }

    await getChangeset(changesetID)
}


async function getHistoryAndVersionByElem(elem) {
    const [, objType, objID, version] = elem.querySelector("a:nth-of-type(2)").href.match(/(node|way|relation)\/(\d+)\/history\/(\d+)$/);
    if (histories[objType][objID]) {
        return [histories[objType][objID], parseInt(version)]
    }
    const res = await fetch(osm_server.apiBase + objType + "/" + objID + "/history.json", {signal: getAbortController().signal});
    if (!res.ok) {
        console.trace(objType, objID, version)
    }
    if (res.status === 509) {
        error509Handler(res)
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


let quickLookStylesInjected = false

function addQuickLookStyles() {
    if (quickLookStylesInjected) return
    quickLookStylesInjected = true
    try {
        const styleText = `
            .edits-wars-log tr:nth-child(even) td, .edits-wars-log tr:nth-child(even) th {
                background-color: color-mix(in srgb, var(--bs-body-bg), black 25%);
            }
            
            @media ${mediaQueryForWebsiteTheme} {
            
            .edits-wars-log tr:nth-child(even) td, .edits-wars-log tr:nth-child(even) th {
                background-color: color-mix(in srgb, var(--bs-body-bg), white 5%);
            }
            
            }
            
            tr.quick-look-new-tag th {
                background: rgba(17,238,9,0.6);
            }
            
            table[contenteditable] th:not(.tag-flag) {
                border: solid 2px black;
            }
            
            table[contenteditable] td:not(.tag-flag) {
                border: solid 2px black;
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

            table.quick-look.hide-non-modified-tags > tbody > .non-modified-tag-in-quick-view {
                display: none;
            }

            .new-letter {
                background: rgba(25, 223, 25, 0.6);
            }
            
            .deleted-letter {
                background: rgba(255, 144, 144, 0.6);
            }
            
            @media ${mediaQueryForWebsiteTheme} {            
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
                            
                tr.quick-look-deleted-tag th:not(.tag-flag) { /* dirty hack for zebra colors override */
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
                
                .new-letter {
                    background: rgba(25, 223, 25, 0.9); 
                }
            
                .deleted-letter {
                    background: rgba(253, 83, 83, 0.8);
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
            
            ul:has(li[hidden]):after {
                color: var(--bs-body-color);
                content: attr(hidden-nodes-count) ' uninteresting nodes hidden';
                font-style: italic;
                font-weight: normal;
                font-size: small;
                opacity: 0.5;
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
            #sidebar_content #changeset_relations li.map-hover {
                background-color: rgba(223, 223, 223, 0.6);
            }
            #sidebar_content #changeset_relations li.downloaded:hover {
                background-color: rgba(223, 223, 223, 0.6);
            }
            
            .location-modified-marker-warn::after:hover {
                  background-color: rgba(223, 223, 223, 0.6);;
            }
                        
            #sidebar_content #element_versions_list > div details.way-version-nodes li:hover {
                background-color: rgba(223, 223, 223, 0.6);
            }
            #sidebar_content #element_versions_list > div details.way-version-nodes li:hover {
                background-color: rgba(223, 223, 223, 0.6);
            }
            #sidebar_content #element_versions_list > div details.way-version-nodes li.map-hover {
                background-color: rgba(223, 223, 223, 0.6);
            }
            #sidebar_content #element_versions_list > div details.way-version-nodes li.map-hover {
                background-color: rgba(223, 223, 223, 0.6);
            }
            #sidebar_content #element_versions_list > div details.way-version-nodes li.downloaded:hover {
                background-color: rgba(223, 223, 223, 0.6);
            }
            
            .location-modified-marker-warn::after:hover {
                  background-color: rgba(223, 223, 223, 0.6);;
            }
            
            @media ${mediaQueryForWebsiteTheme} {            
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
                #sidebar_content #changeset_relations li.map-hover {
                    background-color: rgb(14, 17, 19);
                }
                #sidebar_content #changeset_relations li.downloaded:hover {
                    background-color: rgb(14, 17, 19);
                }
                                
                #sidebar_content #element_versions_list > div details.way-version-nodes li:hover {
                    background-color: rgb(52,61,67);
                }
                #sidebar_content #element_versions_list > div details.way-version-nodes li:hover {
                    background-color: rgb(52,61,67);
                }
                #sidebar_content #element_versions_list > div details.way-version-nodes li.map-hover {
                    background-color: rgb(52,61,67);
                }
                #sidebar_content #element_versions_list > div details.way-version-nodes li.map-hover {
                    background-color: rgb(52,61,67);
                }
                #sidebar_content #element_versions_list > div details.way-version-nodes li.downloaded:hover {
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
        injectCSSIntoOSMPage(styleText)
    } catch { /* empty */
    }
}

function removeEditTagsButton() {
    if (location.pathname.startsWith("/changeset/")) {
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

async function preloadChangeset(changesetID) {
    console.log(`c${changesetID} preloading`)
    performance.mark("PRELOADING_" + changesetID)
    const ways = (await getChangeset(changesetID)).data.querySelectorAll("way")
    Array.from(ways).slice(0, 5).forEach(way => {
        getWayHistory(way.id)
    })
    performance.mark("END_PRELOADING_" + changesetID)
    console.log(`c${changesetID} preloaded`)
}

function preloadPrevNextChangesets() {
    console.debug("Preloading changesets")
    const prevLink = getPrevChangesetLink()
    if (prevLink) {
        const changesetID = prevLink.href.match(/\/changeset\/(\d+)/)[1]
        setTimeout(preloadChangeset, 0, changesetID)
    }
    const nextLink = getNextChangesetLink()
    if (nextLink) {
        const changesetID = nextLink.href.match(/\/changeset\/(\d+)/)[1]
        setTimeout(preloadChangeset, 0, changesetID)
    }
    needPreloadChangesets = false
}


/**
 * @param {number|string} nodeID
 * @return {Promise<WayVersion[]>}
 */
async function getParentWays(nodeID) {
    const rawRes = await fetch(osm_server.apiBase + "node/" + nodeID + "/ways.json", {signal: getAbortController().signal});
    if (rawRes.status === 509) {
        error509Handler(rawRes)
    } else {
        if (!rawRes.ok) {
            console.warn(`fetching parent ways for ${nodeID} failed`)
            console.trace()
            return []
        }
        return (await rawRes.json()).elements;
    }
}


async function processQuickLookInSidebar(changesetID) {
    const interceptMapManuallyPromise = interceptMapManually()
    const multipleChangesets = location.search.includes("changesets=")

    /**
     * Загружает историю объектов и показывает дифф тегов. Не использует Overpass API
     * @param {"node"|"way"|"relation"} objType
     * @param {0|1|2|3} uniqTypes - сколько различных типов OSM объектов пришло
     * @return {Promise<void>}
     */
    async function processObjects(objType, uniqTypes) {
        pinnedRelations = new Set()
        const objects = document.querySelectorAll(`[changeset-id="${changesetID}"]#changeset_${objType}s .list-unstyled li:not(.processed-object):not(.object-in-process)`)
        if (objects.length === 0) {
            return;
        }
        objects.forEach(i => {
            i.classList.add("object-in-process")
        })

        const needFetch = []

        try {
            if (objType === "relation") {
                for (let i of document.querySelectorAll(`[changeset-id="${changesetID}"]#changeset_${objType}s .list-unstyled li:not(.processed-object) div div`)) {
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
                const res = await fetch(osm_server.apiBase + `${objType}s.json?${objType}s=` + needFetch.join(","), {signal: getAbortController().signal});
                if (res.status === 404) {
                    for (let i of document.querySelectorAll(`[changeset-id="${changesetID}"]#changeset_${objType}s .list-unstyled li:not(.processed-object) div div`)) {
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
                    for (let i of document.querySelectorAll(`[changeset-id="${changesetID}"]#changeset_${objType}s .list-unstyled li:not(.processed-object) div div`)) {
                        const [, , objID, strVersion] = i.querySelector("a:nth-of-type(2)").href.match(/(node|way|relation)\/(\d+)\/history\/(\d+)$/);
                        const version = parseInt(strVersion)
                        await processObject(i, objType, ...getPrevTargetLastVersions(Object.values(objectsVersions[objID]), version))
                    }
                }
            } else {
                const elems = Array.from(document.querySelectorAll(`[changeset-id="${changesetID}"]#changeset_${objType}s .list-unstyled li:not(.processed-object) div div`));
                for (const elem of arraySplit(elems, elems.length > 520 ? 10 : 1)) {
                    await Promise.all(elem.map(async function (i) {
                        await processObject(i, objType, ...getPrevTargetLastVersions(...await getHistoryAndVersionByElem(i)))
                    }))
                }
            }
        } finally {
            objects.forEach(i => {
                i.classList.remove("object-in-process")
            })
        }

        // reorder non-interesting-objects
        const objectsList = document.querySelector(`[changeset-id="${changesetID}"]#changeset_${objType}s .list-unstyled li`).parentElement
        Array.from(document.querySelectorAll(`[changeset-id="${changesetID}"]#changeset_${objType}s .list-unstyled li.tags-uninterested-modified.location-modified`)).forEach(i => {
            objectsList.appendChild(i)
        })
        Array.from(document.querySelectorAll(`[changeset-id="${changesetID}"]#changeset_${objType}s .list-unstyled li.tags-uninterested-modified:not(.location-modified)`)).forEach(i => {
            objectsList.appendChild(i)
        })
        Array.from(document.querySelectorAll(`[changeset-id="${changesetID}"]#changeset_${objType}s .list-unstyled li.tags-non-modified`)).forEach(i => {
            objectsList.appendChild(i)
        })
        Array.from(document.querySelectorAll(`[changeset-id="${changesetID}"]#changeset_${objType}s .list-unstyled li.tags-non-modified:not(.location-modified)`)).forEach(i => {
            objectsList.appendChild(i)
        })

        if (multipleChangesets) {
            document.querySelectorAll("#changeset_nodes .tags-non-modified:not(.location-modified)").forEach(i => {
                i.setAttribute("hidden", "true")
            })
        }


        //<editor-fold desc="setup compact mode toggles">
        let compactToggle = document.createElement("button")
        compactToggle.title = "Toggle between full and compact tags diff.\nYou can also use the T key."
        compactToggle.textContent = allTagsOfObjectsVisible ? "><" : "<>"
        compactToggle.classList.add("quick-look-compact-toggle-btn")
        compactToggle.classList.add("btn", "btn-sm", "btn-primary")
        compactToggle.classList.add("quick-look")
        compactToggle.onclick = (e) => {
            const needHideNodes = location.search.includes("changesets=")
            const state = e.target.textContent === "><"
            document.querySelectorAll(".quick-look-compact-toggle-btn").forEach(i => {
                if (state) {
                    i.textContent = "<>"
                } else {
                    i.textContent = "><"
                }
            })
            allTagsOfObjectsVisible = !allTagsOfObjectsVisible
            const shouldBeHidden = e.target.textContent === "<>"
            document.querySelectorAll("table.quick-look").forEach(el => {
                el.classList.toggle("hide-non-modified-tags", shouldBeHidden)
            });
            if (needHideNodes) {
                if (e.target.textContent === "><") {
                    document.querySelectorAll("#changeset_nodes .tags-non-modified:not(.location-modified)").forEach(i => {
                        i.setAttribute("hidden", "true")
                    })
                    document.querySelectorAll("#changeset_nodes").forEach(i => {
                        if (!i.querySelector("li:not([hidden])")) {
                            i.setAttribute("hidden", "true")
                        }
                    })
                } else {
                    document.querySelectorAll("#changeset_nodes .tags-non-modified:not(.location-modified)").forEach(i => {
                        i.removeAttribute("hidden")
                    })
                    document.querySelectorAll("#changeset_nodes").forEach(i => {
                        i.removeAttribute("hidden")
                    })
                }
            }
            if (e.target.textContent === "><") {
                if (!e.altKey) {
                    document.querySelectorAll(".preview-img-link img").forEach(i => {
                        i.style.display = ""
                    })
                }
            } else {
                if (!e.altKey) {
                    document.querySelectorAll(".preview-img-link img").forEach(i => {
                        i.style.display = "none"
                    })
                }
            }
        }
        const objectListSection = document.querySelector(`[changeset-id="${changesetID}"]#changeset_${objType}s .list-unstyled li`).parentElement.parentElement.querySelector("h4")
        if (!objectListSection.querySelector(".quick-look-compact-toggle-btn")) {
            objectListSection.appendChild(compactToggle)
        }
        compactToggle.before(document.createTextNode("\xA0"))
        if (uniqTypes === 1 && document.querySelectorAll(`[changeset-id="${changesetID}"]#changeset_${objType}s .list-unstyled li .non-modified-tag-in-quick-view`).length < 5) {
            compactToggle.style.display = "none"
            document.querySelectorAll(".non-modified-tag-in-quick-view").forEach(i => {
                i.removeAttribute("hidden")
            });
        }
        if (multipleChangesets && compactToggle.style.display !== "none") {
            document.querySelectorAll(`[changeset-id="${changesetID}"]`).forEach(changeset => {
                const forHide = document.querySelectorAll(`[changeset-id="${changeset.getAttribute("changeset-id")}"]#changeset_nodes .tags-non-modified:not(.location-modified)`);
                forHide.forEach(i => {
                    i.setAttribute("hidden", "true")
                })
                document.querySelectorAll(`[changeset-id="${changeset.getAttribute("changeset-id")}"]#changeset_nodes`).forEach(i => {
                    if (!i.querySelector("li:not([hidden])")) {
                        i.setAttribute("hidden", "true")
                    }
                })
            })
        }
        //</editor-fold>
    }

    try {
        console.time(`QuickLook ${changesetID}`)
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
        const changesetDataPromise = getChangeset(changesetID);
        await interceptMapManuallyPromise;
        for (const objType of ["way", "node", "relation"]) {
            await processObjectsInteractions(objType, uniqTypes, changesetID);
        }
        const changesetData = (await changesetDataPromise).data;

        function replaceNodes(changesetData) {
            const pagination = Array.from(document.querySelectorAll(`[changeset-id="${changesetID}"]#changeset_nodes .pagination`)).find(i => {
                return Array.from(i.querySelectorAll("a.page-link")).some(a => a.href?.includes("node"))
            })
            if (!pagination) return
            const ul = pagination.parentElement.querySelector("ul.list-unstyled")
            const nodes = changesetData.querySelectorAll("node")
            const other = changesetData.querySelectorAll("way,relation").length
            if (nodes.length > 1200) {
                if (nodes.length > 3500 || other > 10 || isMobile) { // fixme bump
                    return;
                }
            }
            pagination.remove();

            try {
                document.querySelector(`[changeset-id="${changesetID}"]#changeset_nodes h4 .count-number`).textContent = `1-${nodes.length}`;
            } catch (e) {
                console.error(e)
            }

            nodes.forEach(node => {
                if (document.getElementById(`${changesetID}n${node.id}`)) {
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
                div2.id = `${changesetID}n${node.id}`

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
            const pagination = Array.from(document.querySelectorAll(`[changeset-id="${changesetID}"]#changeset_ways .pagination`)).find(i => {
                return Array.from(i.querySelectorAll("a.page-link")).some(a => a.href?.includes("way"))
            })
            if (!pagination) return
            const ul = pagination.parentElement.querySelector("ul.list-unstyled")
            const ways = changesetData.querySelectorAll("way")
            if (ways.length > 50) {
                if (ways.length > 200 && changesetData.querySelectorAll("node") > 40) {
                    return;
                }
                if (ways.length > 520 && isMobile) {
                    return;
                }
                if (ways.length > 1520) {
                    return
                }
            }
            pagination.remove();

            try {
                document.querySelector(`[changeset-id="${changesetID}"]#changeset_ways h4 .count-number`).textContent = `1-${ways.length}`
            } catch (e) {
                console.error(e)
            }

            ways.forEach(way => {
                if (document.getElementById(`${changesetID}w${way.id}`)) {
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
                div2.id = `${changesetID}w${way.id}`

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
            if (document.querySelector(`[changeset-id="${changesetID}"]#changeset_nodes .pagination`)) {
                obs.observe(document.querySelector(`[changeset-id="${changesetID}"]#changeset_nodes`), {
                    attributes: true
                })
            }
            if (document.querySelector(`[changeset-id="${changesetID}"]#changeset_ways .pagination`)) {
                obs.observe(document.querySelector(`[changeset-id="${changesetID}"]#changeset_ways`), {
                    attributes: true
                })
            }
            if (document.querySelector(`[changeset-id="${changesetID}"]#changeset_relations .pagination`)) {
                obs.observe(document.querySelector(`[changeset-id="${changesetID}"]#changeset_relations`), {
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

        async function findParents() {
            performance.mark("FIND_PARENTS_BEGIN_" + changesetID)
            const nodesCount = changesetData.querySelectorAll(`node`)
            for (const i of changesetData.querySelectorAll(`node[version="1"]`)) {
                const nodeID = i.getAttribute("id")
                if (!i.querySelector("tag")) {
                    if (i.getAttribute("visible") === "false") {
                        // todo
                    } else if (i.getAttribute("version") === "1" && !(await getChangeset(parseInt(changesetID))).nodesWithParentWays.has(parseInt(nodeID))) {
                        showNodeMarker(i.getAttribute("lat"), i.getAttribute("lon"), "#00a500", changesetID + "n" + nodeID)
                    }
                }
            }
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
                    if ((await getChangeset(parseInt(changesetID))).nodesWithParentWays.has(nodeID) && nodesCount > 30 || processedNodes.has(parseInt(nodeID))) {
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

                                const res = await fetch(osm_server.apiBase + "way" + "/" + way.id + "/full.json", {signal: getAbortController().signal});
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

                                if (!changesetMetadatas[changesetID]) {
                                    console.log(`changesetMetadata[${changesetID}] not ready. Wait second...`)
                                    await abortableSleep(1000, getAbortController()) // todo нужно поретраить
                                }

                                const res2 = await getWayNodesByTimestamp(changesetMetadatas[changesetID].closed_at, objID)
                                if (!res2) {
                                    // если линия создана после правки
                                    console.log(`skip parent w${objID} for ${nodeID}`);
                                    return
                                }
                                const [targetVersion, currentNodesList] = res2
                                if (targetVersion.visible === false) {
                                    console.log(`skip parent w${objID} for ${nodeID} because version not visible`);
                                    return
                                }

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

                                const line = displayWay(cloneInto(currentNodesList, unsafeWindow), false, "rgba(55,55,55,0.5)", 4, changesetID + "n" + nodeID, "customObjects", null, popup.outerHTML, darkModeForMap && isDarkMode())
                                if (layersHidden) {
                                    line.getElement().style.visibility = "hidden"
                                }

                                // ховер в списке объектов, который показывает родительскую линию
                                way.nodes.forEach(n => {
                                    if (!document.getElementById(`${changesetID}n${n}`)) return
                                    document.getElementById(`${changesetID}n${n}`).parentElement.parentElement.addEventListener('mouseover', async (e) => {
                                        if (e.relatedTarget?.parentElement === e.target) {
                                            return
                                        }
                                        showActiveWay(cloneInto(currentNodesList, unsafeWindow))
                                        resetMapHover()
                                        const targetTimestamp = (new Date(new Date(changesetMetadatas[changesetID].created_at).getTime() - 1)).toISOString()
                                        if (targetVersion.version > 1) {
                                            // show prev version
                                            const prevVersion = searchVersionByTimestamp(await getWayHistory(way.id), targetTimestamp);
                                            const [, nodesHistory] = await loadWayVersionNodes(objID, prevVersion.version);
                                            const nodesList = filterObjectListByTimestamp(nodesHistory, targetTimestamp)
                                            showActiveWay(cloneInto(nodesList, unsafeWindow), "rgb(238,146,9)", false, changesetID + "w" + objID, false, 4, "4, 4")

                                            // showActiveWay(cloneInto(currentNodesList, unsafeWindow), "rgba(55,55,55,0.5)", false, objID, false)
                                        } else {
                                            const prevVersion = searchVersionByTimestamp(await getWayHistory(way.id), targetTimestamp);
                                            if (prevVersion) {
                                                const [, nodesHistory] = await loadWayVersionNodes(objID, prevVersion.version);
                                                const nodesList = filterObjectListByTimestamp(nodesHistory, targetTimestamp)
                                                showActiveWay(cloneInto(nodesList, unsafeWindow), "rgb(238,146,9)", false, changesetID + "w" + objID, false, 4, "4, 4")

                                                // showActiveWay(cloneInto(currentNodesList, unsafeWindow), "rgba(55,55,55,0.5)", false, objID, false)
                                            }
                                        }
                                        const curVersion = searchVersionByTimestamp(await getNodeHistory(n), changesetMetadatas[changesetID].closed_at ?? new Date())
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
            const nodesWithModifiedLocation = Array.from(document.querySelectorAll("#changeset_nodes .location-modified div div")).map(i => parseInt(i.id.match(/n(\d+)/)[1]))
            await Promise.all(arraySplit(nodesWithModifiedLocation, 4).map(loadNodesParents))
            // fast hack
            // const someInterestingNodes = Array.from(changesetData.querySelectorAll("node")).filter(i => i.querySelector("tag[k=power],tag[k=entrance]")).map(i => parseInt(i.id))
            // await Promise.all(arraySplit(someInterestingNodes, 4).map(loadNodesParents))
            performance.mark("FIND_PARENTS_END_" + changesetID)
            console.debug(performance.measure("FIND_PARENTS", {
                start: "FIND_PARENTS_BEGIN_" + changesetID
            }), "FIND_PARENTS_END_" + changesetID);
        }

        if (GM_config.get("ShowChangesetGeometry")) {
            console.log("%cTry find parents ways", 'background: #222; color: #bada55')
            if (multipleChangesets) { // todo не стоит если пакетов мало?
                findParents().then(() => {
                    console.log(`Parents with ${changesetID} loaded`);
                })
            } else {
                await findParents()
            }
        }
    } catch (err) { // TODO notify user
        if (err.name === "AbortError") {
            console.debug("Some requests was aborted")
        } else {
            console.error(err)
            console.log("%cSetup QuickLook finished with error ⚠️", 'background: #222; color: #bada55')

            function makeGithubIssueLink(text) {
                const a = document.createElement("a")
                a.classList.add("crash-report-link")
                a.href = "https://github.com/deevroman/better-osm-org/issues/new?"
                    + new URLSearchParams({
                        body: text,
                        title: "Crash Report",
                        labels: "bug,crash"
                    }).toString()
                a.target = "_blank"
                a.appendChild(document.createTextNode("Send Bug Report"))
                a.title = "better-osm-org was unable to display some data"
                return a
            }

            if (![ABORT_ERROR_PREV, ABORT_ERROR_NEXT, ABORT_ERROR_USER_CHANGESETS, ABORT_ERROR_WHEN_PAGE_CHANGED].includes(err) && getMap().getZoom) {
                // eslint-disable-next-line no-debugger
                debugger
                try {
                    const reportText = `
**Page:** ${location.origin}${location.pathname}

**Error:** \`${err.toString().replace("`", "\\`")}\`

**StackTrace:**

\`\`\`
${err.stack.replace("`", "\\`").replaceAll(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/gm, "<hidden>")}
\`\`\`

**Script handler:** \`${GM_info.scriptHandler} v${GM_info.version}\`

**UserAgent:** \`${JSON.stringify(GM_info.userAgentData)}\`
                                   
                    `
                    if (!document.querySelector(".crash-report-link")) {
                        document.querySelector("#sidebar_content .secondary-actions").appendChild(document.createTextNode(" · "))
                        document.querySelector("#sidebar_content .secondary-actions").appendChild(makeGithubIssueLink(reportText))
                    }
                    if (isDebug()) {
                        getMap()?.attributionControl?.setPrefix("⚠️")
                    }
                } catch { /* empty */
                }
                if (isDebug()) {
                    alert("⚠ read logs.\nOnly the script developer should see this message")
                }
                // eslint-disable-next-line no-debugger
                debugger
                throw err
            }
        }
    } finally {
        quickLookInjectingStarted = false
        console.timeEnd(`QuickLook ${changesetID}`)
        console.log("%cSetup QuickLook finished", 'background: #222; color: #bada55')
        // todo mark changeset as reviewed
    }
}

const currentChangesets = [];


function drawBBox(bbox, options = {color: "#ff7800", weight: 1, fillOpacity: 0}) {
    try {
        const bottomLeft = getMap().project(getWindow().L.latLng(bbox.min_lat, bbox.min_lon));
        const topRight = getMap().project(getWindow().L.latLng(bbox.max_lat, bbox.max_lon));
        const width = topRight.x - bottomLeft.x;
        const height = bottomLeft.y - topRight.y;
        const minSize = 10;

        if (width < minSize) {
            bottomLeft.x -= ((minSize - width) / 2);
            topRight.x += ((minSize - width) / 2);
        }

        if (height < minSize) {
            bottomLeft.y += ((minSize - height) / 2);
            topRight.y -= ((minSize - height) / 2);
        }

        const b = getWindow().L.latLngBounds(
            getMap().unproject(intoPage(bottomLeft)),
            getMap().unproject(intoPage(topRight))
        )

        const bound = getWindow().L.rectangle(
            intoPage([
                [b.getSouth(), b.getWest()],
                [b.getNorth(), b.getEast()]
            ]),
            intoPage(options)
        );
        bound.on('click', intoPageWithFun(function () {
            const elementById = document.getElementById(bbox.id);
            elementById?.scrollIntoView()
            resetMapHover()
            elementById?.parentElement?.parentElement?.classList.add("map-hover")
            cleanObjectsByKey("activeObjects")
        }))
        bound.addTo(getMap());
        bound.bringToBack()
        layers['changesetBounds'].push(bound)
        return bound
    } catch (err) {
        console.trace(err)
    }
}

async function processQuickLookForCombinedChangesets(changesetID, changesetIDs) {
    await loadChangesetMetadatas(changesetIDs)
    await zoomToChangesets()
    for (let curID of changesetIDs) {
        currentChangesets.push(changesetMetadatas[curID]);
    }

    for (let bbox of currentChangesets) {
        drawBBox(bbox)
    }
    drawBBox(changesetMetadatas[changesetID])
    getMap().on("moveend zoomend", intoPageWithFun(function () {
        if (layersHidden) return
        for (let bound of layers["changesetBounds"]) {
            bound.remove()
        }
        layers["changesetBounds"] = []
        for (let bbox of currentChangesets) {
            drawBBox(bbox)
        }
        drawBBox(changesetMetadatas[changesetID])
    }))

    const step = 10
    const changesetsQueue = []
    if (changesetIDs.length) {
        // preloading
        changesetIDs.slice(0, step).forEach(i => {
            changesetsQueue.push(GM.xmlHttpRequest({
                url: osm_server.url + "/changeset/" + i
            }))
        })
    }
    // MORE PRELOADING
    const waysForPreload = []
    await Promise.all(changesetIDs.map(async i => {
        const data = (await getChangeset(i)).data
        Array.from(data.querySelectorAll("way:not([version='1'])")).map(i => waysForPreload.push(parseInt(i.getAttribute("id"))))
    }))
    await Promise.all(Array.from(new Set(waysForPreload)).map(i => getWayHistory(i)))

    for (let i = 0; i < changesetIDs.length; i++) {
        console.log(`${i + 1} / ${changesetIDs.length}`)
        let curID = changesetIDs[i];

        let res = await changesetsQueue.shift()

        const parser = new DOMParser()
        const doc = parser.parseFromString(res.response, "text/html")
        const newPrevLink = getPrevChangesetLink(doc)
        if (newPrevLink) {
            const prevLink = getPrevChangesetLink()
            const prevID = extractChangesetID(prevLink.href)

            const newPrevID = extractChangesetID(newPrevLink.href)
            prevLink.childNodes[2].textContent = prevLink.childNodes[2].textContent.replace(prevID, newPrevID)
            prevLink.href = "/changeset/" + newPrevID
        }

        const divID = document.createElement("a")
        divID.id = curID
        divID.textContent = "#" + curID
        divID.href = "/changeset/" + curID
        divID.style.color = "var(--bs-body-color)"
        // todo add comment
        document.querySelector("turbo-frame:last-of-type").after(divID)
        let prevFrame = null;
        doc.querySelectorAll("turbo-frame").forEach(frame => {
            frame.setAttribute("changeset-id", curID)
            if (prevFrame) {
                prevFrame.after(frame)
            } else {
                divID.after(frame)
                prevFrame = frame
            }
        })
        setTimeout(async () => {
            await loadChangesetMetadata(parseInt(curID))
            const span = document.createElement("span")
            span.textContent = " " + shortOsmOrgLinksInText(changesetMetadatas[curID].tags["comment"] ?? "") // todo trim
            span.title = " " + (changesetMetadatas[curID].tags["comment"] ?? "")
            span.style.color = "gray"
            divID.after(span)
        })

        const promise = processQuickLookInSidebar(curID);
        if (i + step < changesetIDs.length) {
            changesetsQueue.push(GM.xmlHttpRequest({
                url: osm_server.url + "/changeset/" + changesetIDs[i + step]
            }))
        }
        await promise;
    }
}

/*
function interceptRectangle() {
    console.log("intercept rectangle");
    injectJSIntoPage(`
    var layers = {}

    function makeColor(username) {
        let hash = 0;
        for (let i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + 42 + ((hash << 5) - hash);
        }
        return '#' + ((hash >> 16) & 0xFFFFFF).toString(16).padStart(6, '0');
    }

    if (!window.rectangleIntercepted) {
        L.Rectangle.addInitHook((function () {
                return
                this.better_id = -1
                const layer = this
                Object.defineProperty(
                    this,
                    'id',
                    {
                        get: function () {
                            try {
                                const username = document.querySelector('#changeset_' + this.better_id + ' a[href^="/user/"]').textContent
                                // debugger
                                this.options.color = makeColor(username)
                            } catch (e) {
                            }

                            return this.better_id
                        },
                        set: function (val) {
                            if (location.pathname !== "/history") {
                                this.better_id = val;
                                return;
                            }
                            const username = document.querySelector('#changeset_' + val + ' a[href^="/user/"]').textContent
                            this.options.color = makeColor(username)

                            this.better_id = val
                        }
                    }
                );
                Object.defineProperty(
                    this.options,
                    'color',
                    {
                        get: function () {
                            if (location.pathname !== "/history") {
                                this.better_id = val;
                                return;
                            }
                            const username = document.querySelector('#changeset_' + layer.better_id + ' a[href^="/user/"]')?.textContent
                            if (!username) return "#000"
                            return makeColor(username)

                            // return this.better_options
                        },
                        set: function (color) {
                            // debugger
                            const username = document.querySelector('#changeset_' + layer.better_id + ' a[href^="/user/"]')?.textContent
                            if (!username) return color
                            return makeColor(username)
                        }
                    }
                );
            })
        )
        window.rectangleIntercepted = true
    }
    `)
}
*/

async function interceptMapManually() {
    // if (!getWindow().rectangleIntercepted) {
    //     interceptRectangle()
    // }
    if (getWindow().mapIntercepted) return
    try {
        console.warn("try intercept map manually")
        getWindow().scriptHandler = GM_info.scriptHandler
        injectJSIntoPage(`
        L.Layer.addInitHook(function () {
                if (window.mapIntercepted) return
                try {
                    this.addEventListener("add", (e) => {
                        if (window.mapIntercepted) return;
                        console.log("%cMap intercepted with workaround", 'background: #000; color: #0f0')
                        window.mapIntercepted = true
                        window.map = e.target._map;
                        if (!window.scriptInstance) {
                            window.scriptInstance = window.scriptHandler;
                        } else if (window.scriptInstance !== window.scriptHandler) {
                            console.error(\`Two copies of the script were running simultaneously via ${window.scriptInstance} and ${window.scriptInstance}. Turn off one of them\`)
                        }
                    })
                } catch (e) {
                    console.error(e)
                }
            }
        )
        `)
        // trigger Layer creation
        let exportImageBtn = document.querySelector("#export-image #image_filter");
        if (!exportImageBtn) {
            await sleep(10)
            exportImageBtn = document.querySelector("#export-image #image_filter")
            if (!exportImageBtn) {
                await sleep(10)
                exportImageBtn = document.querySelector("#export-image #image_filter")
            }
        }
        if (getWindow().mapIntercepted) {
            console.log("skip manual intercepting: already intercepted")
            return
        }
        exportImageBtn.click()
        exportImageBtn.click()
        if (!getWindow().mapIntercepted) {
            console.warn("wait for map intercepting")
            await sleep(9)
        }
    } catch (e) {
        console.error(e)
    }
}

async function addChangesetQuickLook() {
    if (quickLookInjectingStarted) return
    if (!location.pathname.startsWith("/changeset")) {
        allTagsOfObjectsVisible = true
        return
    }
    addQuickLookStyles();
    if (document.querySelector('.quick-look')) return true;
    const sidebar = document.querySelector("#sidebar_content h2");
    if (!sidebar) {
        return;
    }
    if (!document.querySelector("turbo-frame")) {
        console.log("changeset is empty")
        return
    }
    quickLookInjectingStarted = true
    resetSearchFormFocus();
    addRegionForFirstChangeset();
    makeTimesSwitchable()
    if (GM_config.get("ResizableSidebar")) {
        document.querySelector("#sidebar").style.resize = "horizontal"
    }
    addSwipes();
    removeEditTagsButton();

    const changesetID = location.pathname.match(/changeset\/(\d+)/)[1]
    document.querySelectorAll("turbo-frame").forEach(i => i.setAttribute("changeset-id", changesetID))

    const params = new URLSearchParams(location.search)
    let changesetIDs = [];
    if (params.get("changesets")) {
        changesetIDs = params.get("changesets")?.split(",")?.filter(i => i !== changesetID) ?? []
    }

    if (!GM_config.get("NavigationViaHotkeys")) {
        setTimeout(loadChangesetMetadata, 0)
    }
    await processQuickLookInSidebar(changesetID);

    if (changesetIDs.length) {
        await processQuickLookForCombinedChangesets(changesetID, changesetIDs);
    }

    if (needPreloadChangesets) {
        preloadPrevNextChangesets(changesetID);
    }
}

function setupChangesetQuickLook(path) {
    if (!path.startsWith("/changeset")) return;
    let timerId = setInterval(addChangesetQuickLook, 100);
    setTimeout(() => {
        clearInterval(timerId);
        console.debug('stop try add QuickLook');
    }, 4000);
    void addChangesetQuickLook();
}


const rapidLink = "https://mapwith.ai/rapid#poweruser=true&map="
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
            const actualHref = `${rapidLink}${zoom}/${lat}/${lon}`
            if (newElem.querySelector("a").href !== actualHref) {
                newElem.querySelector("a").href = actualHref
            }
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

let darkModeForMap = false;
let darkMapStyleElement = false;

function injectDarkMapStyle() {
    darkMapStyleElement = injectCSSIntoOSMPage(`
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
    `)
}

function setupDarkModeForMap() {
    if (!GM_config.get("DarkModeForMap") || darkModeForMap) {
        return;
    }
    injectDarkMapStyle()
    darkModeForMap = true
}

async function loadChangesetsBetween(user, fromTime, toTime) {
    let curTime = fromTime
    const processedChangesets = new Set()
    /*** @type {ChangesetMetadata[]}*/
    const changesets = []

    while (true) {
        /*** @type {{changesets: ChangesetMetadata[]}}*/
        const res = await fetchJSONWithCache(osm_server.apiBase + "changesets.json?" + new URLSearchParams({
            display_name: user,
            order: 'oldest',
            from: curTime.toISOString(),
            to: toTime.toISOString()
        }).toString())
        console.log(res);

        res.changesets = res.changesets.filter(i => !processedChangesets.has(i.id))
        if (res.changesets.length === 0) break

        res.changesets.forEach(i => {
            changesets.push(i)
            processedChangesets.add(i.id)
        })

        curTime = new Date(res.changesets[res.changesets.length - 1].created_at)
    }
    console.log(`${changesets.length} changesets from ${fromTime} to ${toTime} fetched`)
    changesets.forEach(i => {
        if (i.comments_count) {
            void getChangesetComments(i.id)
        }
    })
    return changesets
}

/**
 * @template T
 * @template X
 * @param {T[]} items
 * @param {(T) => X} keyFn
 * @return {T[]}
 */
function uniq(items, keyFn) {
    const uniqs = new Set()
    const result = []

    items.forEach(i => {
        const elem = keyFn(i)
        if (!uniqs.has(elem)) {
            uniqs.add(elem)
            result.push(i)
        }
    })
    return result
}

/**
 * @param user {string}
 * @return {Promise<ChangesetMetadata[]>}
 */
async function loadChangesets(user) {
    console.time(`stat-for-${user}`)
    let startTime = new Date((new Date().getTime()) - 1000 * 60 * 60 * 24 * 365)
    let startTime2 = new Date((new Date().getTime()) - 1000 * 60 * 60 * 24 * 365 * 3 / 4)
    let startTime3 = new Date((new Date().getTime()) - 1000 * 60 * 60 * 24 * 365 * 2 / 4)
    let startTime4 = new Date((new Date().getTime()) - 1000 * 60 * 60 * 24 * 365 / 4)
    let endTime = new Date((new Date().getTime()) + 1000 * 60 * 60 * 24)


    const parts = await Promise.all([
        loadChangesetsBetween(user, startTime, startTime2),
        loadChangesetsBetween(user, startTime2, startTime3),
        loadChangesetsBetween(user, startTime3, startTime4),
        loadChangesetsBetween(user, startTime4, endTime)
    ])

    const uniqChangesets = new Set()
    const changesets = []

    parts.forEach(part => {
        part.forEach(ch => {
            if (!uniqChangesets.has(ch.id)) {
                uniqChangesets.add(ch.id)
                changesets.push(ch)
            }
        })
    })

    console.timeEnd(`stat-for-${user}`)
    console.log("Changesets for the last year:", changesets.length);
    return changesets
}

/**
 * @param {ChangesetMetadata[]} changesets
 * @param filter
 * @return {[Object.<string, [number, number, {id: number, comment: string, comments_count: number}]>, number]}
 */
function makeChangesetsStat(changesets, filter) {
    const datesStat = {}
    let changesets_count = 0

    changesets.forEach(i => {
        if (!filter(i)) return
        changesets_count++
        const date = new Date(i.created_at)
        const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`
        if (datesStat[key] === undefined) {
            datesStat[key] = [0, 0, []]
        }
        datesStat[key][0] += i.changes_count
        datesStat[key][1] = max(datesStat[key][1], i.id)
        datesStat[key][2].push({
            id: i.id,
            comment: i?.tags?.['comment'] ?? "",
            comments_count: i.comments_count
        })
    })

    return [Object.fromEntries(Object.entries(datesStat).sort((a, b) => {
        if (a[0] < b[0]) {
            return -1;
        }
        if (a[0] > b[0]) {
            return 1;
        }
        return 0
    })), changesets_count]
}

async function makeEditorNormalizer() {
    let rawReplaceRules;
    const url = "https://raw.githubusercontent.com/deevroman/openstreetmap-statistics/refs/heads/master/src/replace_rules_created_by.json";
    if (GM_info.scriptHandler !== "FireMonkey") {
        rawReplaceRules = (await GM.xmlHttpRequest({
            url: url,
        })).responseText
    } else {
        rawReplaceRules = await (await GM.fetch(url)).text
    }
    console.log("replace rules loaded")

    const tag_to_name = {}
    const starts_with_list = []
    const ends_with_list = []
    const contains_list = []
    Object.entries(JSON.parse(rawReplaceRules)).forEach(([name, name_infos]) => {
        if (name_infos["aliases"]) {
            for (let alias in name_infos["aliases"]) {
                tag_to_name[alias] = name
            }
        }
        if (name_infos["starts_with"]) {
            for (const starts_with of name_infos["starts_with"]) {
                starts_with_list.push([starts_with.length, starts_with, name])
            }
        }
        if (name_infos["ends_with"]) {
            for (const ends_with of name_infos["ends_with"]) {
                ends_with_list.push([ends_with.length, ends_with, name])
            }
        }
        if (name_infos["contains"]) {
            for (const compare_str of name_infos["contains"]) {
                contains_list.push([compare_str, name])
            }
        }
    })

    return (tag) => {
        if (!tag) return tag

        if (tag_to_name[tag]) {
            return tag_to_name[tag]
        }

        for (let [compare_str_length, compare_str, replace_str] of starts_with_list) {
            if (tag.slice(0, compare_str_length) === compare_str) {
                return replace_str
            }
        }

        for (let [compare_str_length, compare_str, replace_str] of ends_with_list) {
            if (tag.slice(-compare_str_length) === compare_str) {
                return replace_str
            }
        }

        for (let [compare_str, replace_str] of contains_list) {
            if (tag.includes(compare_str)) {
                return replace_str
            }
        }

        return tag
    }
}

async function betterUserStat(user) {
    if (!GM_config.get("BetterProfileStat") || !location.pathname.match(/^\/user\/([^/]+)\/?$/)) {
        return
    }
    if (document.getElementById("filter-bar")) {
        return
    }
    const filterBar = document.createElement("div")
    filterBar.id = "filter-bar"
    filterBar.style.display = "flex"
    filterBar.style.gap = "3px"

    const filterInputByEditor = document.createElement("select")
    filterInputByEditor.style.flex = "1"
    filterInputByEditor.id = "filter-input-by-editor"
    filterInputByEditor.setAttribute("disabled", true)
    filterInputByEditor.title = "Please wait while user changesets loading"

    const item = document.createElement("option")
    item.value = ""
    item.setAttribute("all-editors", "yes")
    item.textContent = "All editors"
    filterInputByEditor.appendChild(item)

    const calHeatmap = document.querySelector(".heatmap")
    if (!calHeatmap) {
        console.log("osm.org don't show heatmap for this user")
        return;
    }
    injectCSSIntoOSMPage(`
    .tooltip-inner {
        white-space: pre-wrap;
        text-align: left;
    }
    `)
    calHeatmap.parentElement.parentElement.after(filterBar)
    filterBar.appendChild(filterInputByEditor)

    const searchByComment = document.createElement("input")
    searchByComment.type = "search"
    searchByComment.placeholder = "Regex search by comments"
    searchByComment.title = "Please wait while user changesets loading"
    searchByComment.setAttribute("disabled", true)
    searchByComment.style.flex = "1"
    searchByComment.style.height = "1.5rem";
    searchByComment.style.boxSizing = "border-box";
    filterInputByEditor.before(searchByComment)

    const _replace_with_rules = makeEditorNormalizer()
    const changesets = await loadChangesets(user)
    const replace_with_rules = await _replace_with_rules
    const editorOfChangesets = {}
    changesets.forEach(ch => editorOfChangesets[ch.id] = replace_with_rules(ch.tags?.["created_by"]))
    filterInputByEditor.removeAttribute("disabled")
    searchByComment.removeAttribute("disabled")
    filterInputByEditor.title = "Alt + O for open selected changesets on one page"
    searchByComment.title = "Not case-sensitive regex search"

    async function inputHandler() {
        let filter = (_) => true
        const selected = Array.from(filterInputByEditor.options).filter(i => i.selected)
        let regex;
        try {
            regex = new RegExp(searchByComment.value.toLowerCase());
            searchByComment.style.color = ""
        } catch {
            searchByComment.style.color = "red"
        }
        filter = (ch) => {
            return selected.some(option => {
                if (option.getAttribute("all-editors") === "yes") {
                    return (ch.tags?.["comment"] ?? "").toLowerCase().match(regex);
                } else if (option.getAttribute("is-editor-name") === "yes") {
                    return editorOfChangesets[ch.id] === option.value && (ch.tags?.["comment"] ?? "").toLowerCase().match(regex);
                } else {
                    return ch.tags?.["created_by"] === option.value && (ch.tags?.["comment"] ?? "").toLowerCase().match(regex);
                }
            })
        }
        const [newHeatmapData, changesets_count] = makeChangesetsStat(changesets, filter)
        const maxPerDay = Object.values(newHeatmapData).map(i => i[0]).reduce((a, b) => max(a, b), 0);
        searchByComment.title = `${changesets_count} changesets filtered`

        function replaceElementTag(oldElement, newTagName) {
            const attrs = {}
            for (const attr of oldElement.attributes) {
                attrs[attr.name] = attr.value;
            }
            const newElement = GM_addElement(newTagName, attrs);
            while (oldElement.firstChild) {
                newElement.appendChild(oldElement.firstChild);
            }
            oldElement.parentNode.replaceChild(newElement, oldElement);
            return newElement;
        }

        function getTooltipSummary(date, value) {
            const localizedDate = getWindow().OSM.i18n.l("date.formats.long", intoPageWithFun(date));
            if (value > 0) {
                return getWindow().OSM.i18n.t("javascripts.heatmap.tooltip.contributions", intoPage({
                    count: value,
                    date: localizedDate
                }));
            }
            return getWindow().OSM.i18n.t("javascripts.heatmap.tooltip.no_contributions", intoPage({date: localizedDate}));
        }

        getWindow().$('[rel=tooltip]').tooltip('dispose')
        document.querySelectorAll(".tooltip").forEach(i => i.remove())
        const hrefPrefix = location.href.endsWith("/") ? location.href.slice(0, -1) : location.href
        for (let day of Array.from(document.querySelectorAll("[data-date]"))) {
            day = replaceElementTag(day, "a")
            const newData = newHeatmapData[day.getAttribute("data-date")];
            if (newData) {
                day.setAttribute("data-count", newData[0])
                day.setAttribute("href", hrefPrefix + "/history?before=" + (newData[1] + 1))
                day.innerHTML = ""
                const colorDiff = document.createElement("span")
                colorDiff.style.opacity = `${Math.sqrt(newData[0] / maxPerDay)}`
                let tooltipText = getTooltipSummary(new Date(day.getAttribute("data-date")), newData[0]);
                if (newData[0]) {
                    tooltipText += "\n";
                    for (let changeset of newData[2]) {
                        let changesetComment = "";
                        if (changeset.comments_count) {
                            colorDiff.style.opacity = `${Math.min(0.7, Math.max(0.35, Math.sqrt(newData[0] / maxPerDay)))}`
                            colorDiff.style.background = "red"
                            changesetComment = "💬 " + changeset.comment;
                            (await getChangesetComments(changeset.id)).forEach(mapperCommentText => {
                                changesetComment += "\n - " + mapperCommentText['user'] + ": " + shortOsmOrgLinksInText(mapperCommentText['text'])?.slice(0, 500)
                                if (mapperCommentText['text'].length > 500) {
                                    changesetComment += "..."
                                }
                            });
                        } else {
                            changesetComment = "• " + changeset.comment
                        }
                        tooltipText += changesetComment + "\n";
                    }
                }

                day.appendChild(colorDiff)
                getWindow().$(day).tooltip(intoPage({
                    title: tooltipText,
                    customClass: "wide",
                    delay: {show: 0, hide: 0}
                }));
            } else {
                day.removeAttribute("data-count")
                day.setAttribute("href", "")
                day.innerHTML = ""
                if (day.nodeName === "A") {
                    day = replaceElementTag(day, "span")
                }
                getWindow().$(day).tooltip('disable')
            }
        }

    }

    filterInputByEditor.oninput = inputHandler
    searchByComment.oninput = inputHandler
    document.addEventListener("keydown", (e) => {
        if (e.altKey && e.code === "KeyO") {
            const selected = Array.from(filterInputByEditor.options).filter(i => i.selected)
            const ids = changesets.filter((ch) => {
                return selected.some(i => ch?.tags?.["created_by"]?.includes(i.value))
            }).map(i => i.id)
            const idsStr = ids.join(",")
            open(osm_server.url + `/changeset/${ids[0]}?changesets=` + idsStr, "_blank")
        }
    })

    filterInputByEditor.id = "editors"
    filterInputByEditor.addEventListener("mousedown", function (e) {
        e.preventDefault()
        e.target.focus()
        filterInputByEditor.setAttribute("size", 7)
        filterInputByEditor.setAttribute("multiple", true)
        inputHandler()
    }, {"once": true})
    searchByComment.addEventListener("mousedown", function (e) {
        inputHandler()
    }, {"once": true})

    const counts = {};

    changesets.forEach(i => {
        const editor = editorOfChangesets[i.id]
        counts[editor] = counts[editor] ? counts[editor] + i.changes_count : i.changes_count;
    })

    Array.from(new Set(changesets.map(i => editorOfChangesets[i.id]))).sort((a, b) => {
        if (counts[a] < counts[b]) {
            return 1
        }
        if (counts[a] > counts[b]) {
            return -1
        }
        return 0
    }).forEach(i => {
        const item = document.createElement("option")
        item.value = i
        item.setAttribute("is-editor-name", "yes")
        if (i === 1) {
            item.textContent = ` ${i} (${counts[i]} contribution)`
        } else {
            item.textContent = ` ${i} (${counts[i]} contributions)`
        }
        filterInputByEditor.appendChild(item)
    })

    Array.from(new Set(changesets.map(i => i.tags?.["created_by"]))).sort().forEach(i => {
        const item = document.createElement("option")
        item.value = i
        item.textContent = i
        filterInputByEditor.appendChild(item)
    })

    filterInputByEditor.after(filterInputByEditor)
    console.log("setuping filters finished")
}

// https://osm.org/user/Молотов-Прибой
// https://osm.org/user/user_14840936
// https://osm.org/user/Torunianin
// https://osm.org/user/user_22937564
// https://osm.org/user/korobkov
// https://osm.org/user/user_389895
// https://osm.org/user/user_20965583
async function makeProfileForDeletedUser(user) {
    const content = document.querySelector(".content-body")
    const div = document.createElement("div")
    div.classList.add("content-inner", "position-relative", "m-auto")

    const webArchiveLink = document.createElement("a")
    webArchiveLink.textContent = "WebArchive"
    webArchiveLink.target = "_blank"
    webArchiveLink.href = "https://web.archive.org/web/*/https://www.openstreetmap.org/user/" + decodeURI(user)
    div.appendChild(webArchiveLink)
    div.appendChild(document.createElement("br"))

    function makeOSMChaLink(username) {
        const osmchaLink = document.createElement("a");
        osmchaLink.textContent = " [OSMCha] "
        osmchaLink.id = "osmcha_link"
        osmchaLink.title = "Open profile in OSMCha.org"
        osmchaLink.href = makeOsmchaLinkForUsername(username)
        osmchaLink.target = "_blank"
        osmchaLink.rel = "noreferrer"
        return osmchaLink
    }

    async function processIDs(data, elemForResult) {
        elemForResult.appendChild(document.createTextNode(data.length === 1 ? "User ID: " : "User IDs: "))
        for (let i = 0; i < data.length; i++) {
            const id = data[i].id;
            const idSpan = document.createElement("span")
            idSpan.textContent = id
            idSpan.title = "Click for copy"
            idSpan.style.cursor = "pointer"
            idSpan.onclick = e => {
                navigator.clipboard.writeText(id).then(() => copyAnimation(e, id));
            }
            injectCSSIntoOSMPage(copyAnimationStyles)
            elemForResult.appendChild(idSpan)
            elemForResult.appendChild(document.createElement("br"))
            if (data[i].names?.length > 1) {
                const p = document.createElement("p")
                p.textContent = "Usernames: ";
                injectCSSIntoOSMPage(copyAnimationStyles)
                data[i].names.map(i => i.name).forEach(name => {
                    const usernameSpan = document.createElement("span")
                    usernameSpan.textContent = name
                    usernameSpan.title = "Click for copy"
                    usernameSpan.style.cursor = "pointer"
                    usernameSpan.onclick = e => {
                        navigator.clipboard.writeText(name).then(() => copyAnimation(e, name));
                    }
                    p.appendChild(usernameSpan)
                    p.appendChild(document.createTextNode(" "))

                    const webArchiveLink = document.createElement("a")
                    webArchiveLink.textContent = "[WA] "
                    webArchiveLink.target = "_blank"
                    webArchiveLink.href = "https://web.archive.org/web/*/https://www.openstreetmap.org/user/" + name
                    p.appendChild(webArchiveLink)

                    p.appendChild(makeOSMChaLink(name))
                })
                elemForResult.appendChild(p)
            }
            setTimeout(async () => {
                const blocksSpan = document.createElement("span")

                const loadingStatus = document.createElement("span")
                loadingStatus.textContent = " Finding blocks... "
                loadingStatus.style.color = "gray"
                blocksSpan.appendChild(document.createTextNode(" "))
                blocksSpan.appendChild(loadingStatus)

                idSpan.after(blocksSpan)
                const startPage = await GM.xmlHttpRequest({
                    url: "/user_blocks",
                    // responseType: "xml",
                    headers: {"turbo-frame": "pagination"}
                })

                function findBlocks(xml) {
                    let foundUserBlock = [];
                    let lastUserBlock;
                    (new DOMParser().parseFromString(xml, "text/xml")).querySelectorAll("table > tr").forEach(i => {
                        const username = decodeURI(i.querySelector("td a").getAttribute("href").match(/\/user\/(.*)$/)[1])
                        lastUserBlock = i.querySelector('td a[href^="/user_blocks/"]').getAttribute("href").match(/\/user_blocks\/([0-9]+)/)[1]
                        if (username === "user_" + id) {
                            foundUserBlock.push(lastUserBlock)
                        }
                    })
                    return [foundUserBlock, lastUserBlock]
                }

                async function getBlockInfo(blockID) {
                    const blockInfo = (await GM.xmlHttpRequest({
                        url: "/api/0.6/user_blocks/" + blockID + ".json",
                        responseType: "json",
                        headers: {"turbo-frame": "pagination"}
                    })).response
                    return `${blockInfo['user_block']['created_at']}\n${blockInfo['user_block']['creator']['user']}: ${blockInfo['user_block']['reason']}`
                }

                function processFoundedBlocks(foundUserBlock) {
                    foundUserBlock.forEach(blockId => {
                        const blockLink = document.createElement("a")
                        blockLink.href = "/user_blocks/" + blockId
                        blockLink.target = "_blank"
                        blockLink.textContent = "🔨/" + blockId
                        getBlockInfo(blockId).then(res => {
                            blockLink.title = res
                        })
                        blocksSpan.appendChild(blockLink)
                        blocksSpan.appendChild(document.createTextNode(" "))
                    })
                }

                let [foundUserBlock, lastUserBlock] = findBlocks(startPage.response)
                if (foundUserBlock.length) {
                    processFoundedBlocks(foundUserBlock)
                } else {
                    while (lastUserBlock > 1) {
                        async function processBlocks(before) {
                            console.log("download user_block before ", before)
                            before = Math.max(1, before);
                            const startPage = await GM.xmlHttpRequest({
                                url: "/user_blocks?before=" + before,
                                // responseType: "xml",
                                headers: {"turbo-frame": "pagination"}
                            });
                            [foundUserBlock, before] = findBlocks(startPage.response)
                            if (!before) {
                                return
                            }
                            if (foundUserBlock.length) {
                                processFoundedBlocks(foundUserBlock)
                            }
                        }

                        const onPage = 20;
                        const threads = 10;
                        console.log("download user_block batch before ", lastUserBlock)
                        loadingStatus.title = `Scanned all blocks after #${lastUserBlock}`
                        const batch = []
                        for (let j = 0; j < threads; j++) {
                            batch.push(processBlocks(lastUserBlock - onPage * j))
                        }
                        await Promise.all(batch);
                        lastUserBlock -= threads * onPage
                    }
                    loadingStatus.style.display = "none"
                    console.log("All blocks downloaded");
                }
            })


            /*** @type {{changesets: ChangesetMetadata[]}}*/
            const lastChangesets = await fetchJSONWithCache(osm_server.apiBase + "changesets.json?" + new URLSearchParams({
                user: id,
                order: 'newest',
                to: new Date().toISOString(),
            }).toString())
            const processedChangesets = new Set(lastChangesets.changesets.map(c => c.id))

            for(let i = 0; i < 20; i++) {
                const curTime = lastChangesets.changesets[lastChangesets.changesets.length - 1].created_at
                const ch  = await fetchJSONWithCache(osm_server.apiBase + "changesets.json?" + new URLSearchParams({
                    user: id,
                    order: 'newest',
                    to: new Date(new Date(curTime).getTime() + 1000).toISOString(),
                    from: "2005-01-01T00:00:00Z",
                }).toString())
                ch.changesets = ch.changesets.filter(ch => !processedChangesets.has(ch.id))
                if (ch.changesets.length === 0) break
                lastChangesets.changesets.push(...(ch.changesets ?? []))
            }

            elemForResult.appendChild(document.createTextNode(`Last ${lastChangesets.changesets?.length} changesets:`))
            lastChangesets.changesets.forEach(ch => {
                const changesetLine = document.createElement("div")
                changesetLine.title = ch['created_at']
                const checkbox = document.createElement("input")
                checkbox.type = "checkbox"
                checkbox.classList.add("mass-action-checkbox")
                checkbox.textContent = "#" + ch.id + ""
                checkbox.title = "Shift + click for select a range of empty checkboxes"
                checkbox.value = ch.id
                checkbox.onclick = e => {
                    if (e.shiftKey) {
                        let currentCheckboxFound = false
                        for (const cBox of Array.from(elemForResult.querySelectorAll("input")).toReversed()) {
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
                    const selectedIDsCount = elemForResult.querySelectorAll("input:checked").length
                    elemForResult.querySelectorAll(".copy-changesets-ids-btn").forEach(i => {
                        if (selectedIDsCount) {
                            i.textContent = `Copy ${selectedIDsCount} IDs`
                        } else {
                            i.textContent = `Copy IDs`
                        }
                    })
                }
                changesetLine.appendChild(checkbox)
                changesetLine.appendChild(document.createTextNode("\xA0"))

                const a = document.createElement("a")
                a.textContent = ch.id
                a.href = "/changeset/" + ch.id
                a.target = "_blank"
                a.style.fontFamily = "monospace"
                changesetLine.appendChild(a)

                const comment = document.createElement("span")
                comment.textContent = " " + (ch.tags?.['comment'] ?? "No comment")
                changesetLine.appendChild(comment)

                if (ch.comments_count) {
                    const commentsBadge = document.createElement("a")
                    commentsBadge.textContent = " " + ch.comments_count + " 💬"
                    commentsBadge.href = "/changeset/" + ch.id
                    commentsBadge.target = "_blank"
                    setTimeout(async () => {
                        getChangesetComments(ch.id).then(res => {
                            res.forEach(comment => {
                                const shortText = shortOsmOrgLinksInText(comment["text"])
                                commentsBadge.title += `${comment["user"]}:\n${shortText}\n\n`
                            })
                            commentsBadge.title = commentsBadge.title.trimEnd()
                        });
                    })
                    changesetLine.appendChild(commentsBadge)
                }

                elemForResult.appendChild(changesetLine)
            })

            const copyIds = document.createElement("button")
            copyIds.textContent = "Copy IDs"
            copyIds.title = ""
            copyIds.classList.add("copy-changesets-ids-btn")
            copyIds.onclick = e => {
                const ids = Array.from(elemForResult.querySelectorAll("input:checked")).map(i => i.value).join(",")
                if (ids !== "") {
                    navigator.clipboard.writeText(ids).then(() => copyAnimation(e, ids))
                } else {
                    const ids = Array.from(elemForResult.querySelectorAll("input")).map(i => i.value).join(",")
                    navigator.clipboard.writeText(ids).then(() => copyAnimation(e, ids))
                }
            }
            elemForResult.appendChild(copyIds)
        }
    }


    const res = await GM.xmlHttpRequest({
        url: "https://whosthat.osmz.ru/whosthat.php?action=info&name=" + user,
        responseType: "json"
    })
    // FireMonkey compatibility https://github.com/erosman/firemonkey/issues/8
    // but here need resolve problem with return promise
    const data = structuredClone(res.response);
    if (data.length) {
        webArchiveLink.after(makeOSMChaLink(decodeURI(user)))

        const result = document.createElement("p")
        div.appendChild(result)
        result.title = "via whosthat.osmz.ru"
        await processIDs(data, result)
    } else {
        setTimeout(async () => {
            const res = (await GM.xmlHttpRequest({
                url: `${overpass_server.apiUrl}/interpreter?` + new URLSearchParams({
                    data: `
                                [out:json];
                                node(user:"${user.replace('"', '\\"')}")->.b;
                                node.b(if:lat() == b.min(lat()));
                                out meta;
                            `
                }),
                responseType: "json"
            })).response;
            if (res.elements?.length) {
                webArchiveLink.after(makeOSMChaLink(decodeURI(user)))

                const result = document.createElement("p")
                div.appendChild(result)
                result.title = "via Overpass API"
                await processIDs([{id: res.elements[0].uid}], result)
            }
        })
    }

    if (user.match(/^user_[0-9]+$/)) {
        const userID = parseInt(user.match(/user_([0-9]+)/)[1])
        const res = await GM.xmlHttpRequest({
            url: "https://whosthat.osmz.ru/whosthat.php?action=names&id=" + userID,
            responseType: "json"
        })
        // FireMonkey compatibility https://github.com/erosman/firemonkey/issues/8
        // but here need resolve problem with return promise
        const data = structuredClone(res.response)
        let names = data[0]['names']

        const userNamesP = document.createElement("p")
        div.appendChild(userNamesP)
        setTimeout(async () => {
            if (!names.length) {
                const res = (await GM.xmlHttpRequest({
                    url: `${overpass_server.apiUrl}/interpreter?` + new URLSearchParams({
                        data: `
                            [out:json];
                            node(uid:${userID})->.b;
                            node.b(if:lat() == b.min(lat()));
                            out meta;
                        `
                    }),
                    responseType: "json"
                })).response;
                if (res?.elements?.length) {
                    names = [res.elements[0].user]
                }
                div.title = "via Overpass API"
            } else {
                div.title = "via whosthat.osmz.ru"
            }
            if (names.length) {
                userNamesP.textContent = "Usernames: ";
                injectCSSIntoOSMPage(copyAnimationStyles)
                names.forEach(name => {
                    const usernameSpan = document.createElement("span")
                    usernameSpan.textContent = name
                    usernameSpan.title = "Click for copy"
                    usernameSpan.style.cursor = "pointer"
                    usernameSpan.onclick = e => {
                        navigator.clipboard.writeText(name).then(() => copyAnimation(e, name));
                    }
                    userNamesP.appendChild(usernameSpan)
                    userNamesP.appendChild(document.createTextNode(" "))

                    const webArchiveLink = document.createElement("a")
                    webArchiveLink.textContent = "[WA] "
                    webArchiveLink.target = "_blank"
                    webArchiveLink.href = "https://web.archive.org/web/*/https://www.openstreetmap.org/user/" + name
                    userNamesP.appendChild(webArchiveLink)

                    userNamesP.appendChild(makeOSMChaLink(name))
                })
            }
        })
        await processIDs([{id: userID}], div)
    }
    content.appendChild(div)
}

async function setupHDYCInProfile(path) {
    let match = path.match(/^\/user\/([^/]+)(\/|\/notes)?$/);
    if (!match || path.includes("/history")) {
        return;
    }
    if (document.getElementById("hdyc-iframe")) {
        return
    }
    /** @type {string} **/
    const user = match[1];
    if (user === "forgot-password" || user === "new") return;
    document.querySelector(".content-body > .content-inner").style.paddingBottom = "0px";
    if (isDarkMode()) {
        GM_addElement(document.querySelector("#content"), "iframe", {
            src: "https://www.hdyc.neis-one.org/?" + user + "#forcedarktheme",
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
            src: "https://www.hdyc.neis-one.org/?" + user + "#forcelighttheme",
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
    } else if (document.querySelector('a[href$="/blocks"]')?.nextElementSibling?.textContent === "0") {
        getCachedUserInfo(decodeURI(user)).then(userInfo => {
            if (userInfo['blocks']['received']['active'] !== 0) {
                updateUserInfo(decodeURI(user))
            }
        })
    }
    const isDeletedUser = !document.querySelector(".user_image")
    const usernameHeader = document.querySelector("#content h1")?.firstChild
    if (!isDeletedUser && usernameHeader && usernameHeader.nodeType === Node.TEXT_NODE) {
        const span = document.createElement("span")
        span.classList.add("copyable-username")
        span.textContent = usernameHeader.textContent
        span.title = "Click for copy"
        span.style.cursor = "pointer"
        span.onclick = e => {
            navigator.clipboard.writeText(usernameHeader.textContent.slice(0, -1)).then(() => copyAnimation(e, usernameHeader.textContent.slice(0, -1)));
        }
        usernameHeader.replaceWith(span)
        injectCSSIntoOSMPage(copyAnimationStyles)
    }
    queueMicrotask(async () => {
        if (document.querySelector(".prev-usernames")) return
        const userDetails = document.querySelector(".content-inner small dl")
        if (!userDetails) return;
        // https://www.openstreetmap.org/reports/new?reportable_id=12345&reportable_type=User
        let userID = document.querySelector('[href*="reportable_id="]')?.getAttribute("href")?.match(/reportable_id=(\d+)/)?.[1]
        userID = userID ?? document.head.getAttribute("data-user")
        if (!userID) {
            const res = await fetchJSONWithCache(osm_server.apiBase + "changesets.json?" + new URLSearchParams({
                display_name: decodeURI(user),
                limit: 1,
                order: 'oldest'
            }).toString());
            if (res['changesets'].length === 0) {
                const res = await fetchJSONWithCache(osm_server.apiBase + "notes/search.json?" + new URLSearchParams({
                    display_name: decodeURI(user),
                    limit: 1,
                    closed: -1,
                    order: "oldest"
                }).toString());
                userID = res?.['features']?.[0]?.['properties']?.['comments']?.find(i => i['user'] === decodeURI(user))?.['uid']
                if (!userID) {
                    return;
                }
            } else {
                userID = res['changesets'][0]['uid']
            }
        }

        async function addUsernames() {
            async function updateUserIDInfo(userID) {
                const res = await GM.xmlHttpRequest({
                    url: "https://whosthat.osmz.ru/whosthat.php?action=names&id=" + userID,
                    responseType: "json"
                })
                // FireMonkey compatibility https://github.com/erosman/firemonkey/issues/8
                // but here need resolve problem with return promise
                const userInfo = {
                    data: structuredClone(res.response)
                }
                if (userInfo.data[0]['names'].length > 1) {
                    userInfo['cacheTime'] = new Date()
                    await GM.setValue("useridinfo-" + userID, JSON.stringify(userInfo))

                    const usernames = userInfo.data[0]['names'].filter(i => i !== decodeURI(user)).join(", ")
                    if (document.querySelector(".prev-usernames")) {
                        document.querySelector(".prev-usernames").textContent = usernames
                    }
                }
                return userInfo
            }

            async function getCachedUserIDInfo(userID) {
                const localUserInfo = await GM.getValue("useridinfo-" + userID, "")
                if (localUserInfo) {
                    setTimeout(updateUserIDInfo, 0, userID)
                    return JSON.parse(localUserInfo)
                }
                return await updateUserIDInfo(userID)
            }

            const userIDInfo = await getCachedUserIDInfo(userID)
            if (userIDInfo.data[0]['names'].length <= 1) {
                console.log("prev user's usernames not found")
                return
            }
            const usernames = userIDInfo.data[0]['names'].filter(i => i !== decodeURI(user)).join(", ")
            const dt = document.createElement("dt")
            dt.textContent = "Past usernames: "
            dt.classList.add("list-inline-item", "m-0", "prev-usernames-label")
            const dd = document.createElement("dd")
            dd.classList.add("list-inline-item", "prev-usernames")
            dd.textContent = usernames
            userDetails.appendChild(dt)
            userDetails.appendChild(document.createTextNode("\xA0"))
            userDetails.appendChild(dd)
        }

        await addUsernames()

        function addUserID() {
            if (!document.querySelector('[href^="/api/0.6/user"]')) {
                const dt = document.createElement("dt")
                dt.textContent = "ID: "
                dt.classList.add("list-inline-item", "m-0")
                const dd = document.createElement("dd")
                dd.classList.add("list-inline-item", "user-id")
                dd.textContent = userID
                dd.title = "Click for copy"
                dd.style.cursor = "pointer"
                dd.onclick = e => {
                    navigator.clipboard.writeText(userID).then(() => copyAnimation(e, userID));
                }
                userDetails.appendChild(dt)
                userDetails.appendChild(document.createTextNode("\xA0"))
                userDetails.appendChild(dd)
                injectCSSIntoOSMPage(copyAnimationStyles)
            }
        }

        addUserID()
    })
    const iframe = document.getElementById('hdyc-iframe');
    window.addEventListener('message', function (event) {
        if (event.origin === "https://www.hdyc.neis-one.org") {
            iframe.height = event.data.height + 'px';
        }
    });
    if (isDeletedUser && !location.pathname.includes("/notes")) {
        await makeProfileForDeletedUser(user)
    }
}

function setupBetterProfileStat() {
    let match = location.pathname.match(/^\/user\/([^/]+)\/?$/);
    if (!match) {
        return;
    }
    const user = match[1];
    let timerId = setInterval(betterUserStat, 300, decodeURI(user));
    setTimeout(() => {
        clearInterval(timerId);
        console.debug('stop try add heatmap filters');
    }, 5000);
    void betterUserStat(decodeURI(user))
}

function inFrame() {
    return window.location !== window.parent.location;
}

function simplifyHDCYIframe() {
    if (!inFrame()) {
        return
    }
    const forceLightTheme = location.hash.includes("forcelighttheme")
    const forceDarkTheme = location.hash.includes("forcedarktheme")
    injectCSSIntoSimplePage(`
            html, body {
                overflow-x: auto;
            }

            @media ${forceDarkTheme ? "all" : "(prefers-color-scheme: dark)"} ${forceLightTheme ? "and (not all)" : ""} {
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
        `
    );
    const loginLink = document.getElementById("loginLink")
    if (loginLink) {
        let warn = document.createElement("div")
        warn.id = "hdyc-warn"
        injectCSSIntoSimplePage(`
                #hdyc-warn, #hdycLink {
                    text-align: left !important;
                    width: 50%;
                    position: relative;
                    left: 35%;
                    right: 33%;
                }
            `,
        );
        if (isFirefox) {
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
        limit: 1,
        order: 'oldest'
    }).toString());
    let uid;
    let firstObjectCreationTime;
    let firstChangesetID;
    if (res['changesets'].length === 0) {
        const res = await fetchJSONWithCache(osm_server.apiBase + "notes/search.json?" + new URLSearchParams({
            display_name: username,
            limit: 1,
            closed: -1,
            order: "oldest"
        }).toString());
        uid = res['features'][0]['properties']['comments'].find(i => i['user'] === username)['uid']
        firstObjectCreationTime = res['features'][0]['properties']['comments'].find(i => i['user'] === username)['date']
    } else {
        uid = res['changesets'][0]['uid']
        firstObjectCreationTime = res['changesets'][0]['created_at']
        firstChangesetID = res['changesets'][0]['id']
    }

    const res2 = await fetchJSONWithCache(osm_server.apiBase + "user/" + uid + ".json");
    const userInfo = structuredClone(res2.user) // FireMonkey compatibility https://github.com/erosman/firemonkey/issues/8
    userInfo['cacheTime'] = new Date()
    if (firstObjectCreationTime) {
        userInfo['firstChangesetCreationTime'] = new Date(firstObjectCreationTime)
    }
    if (firstChangesetID) {
        userInfo['firstChangesetID'] = firstChangesetID
    }
    await GM.setValue("userinfo-" + username, JSON.stringify(userInfo))
    return userInfo
}

/**
 * @param {string} username
 * @return {Promise<*>}
 */
async function getCachedUserInfo(username) {
    if (!username) {
        console.trace("invalid username")
        return
    }
    const localUserInfo = await GM.getValue("userinfo-" + username, "")
    if (localUserInfo) {
        const cacheTime = new Date(localUserInfo['cacheTime'])
        if (cacheTime.setUTCDate(cacheTime.getUTCDate() + 3) < new Date()) {
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

function openCombinedChangesetsMap() {
    const batchSize = 500

    function openIDs(ids) {
        const forOpen = []
        for (let i = 0; i < ids.length; i += batchSize) {
            const idsStr = ids.slice(i, i + batchSize).join(",")
            forOpen.push(osm_server.url + `/changeset/${ids[i]}?changesets=` + idsStr)
        }
        forOpen.toReversed().forEach(url => open(url, "_blank"))
    }

    const ids = Array.from(document.querySelectorAll(".mass-action-checkbox:checked")).map(i => i.value)
    if (ids.length) {
        openIDs(ids)
    } else {
        const ids = Array.from(document.querySelectorAll(".mass-action-checkbox")).map(i => i.value)
        if (ids.length) {
            openIDs(ids)
        } else {
            const ids = Array.from(document.querySelectorAll(`a[href^="/changeset/"].custom-changeset-id-click`)).map(i => i.getAttribute("href").match(/\/changeset\/([0-9]+)/)[1])
            openIDs(ids)
        }
    }
}

function makeTopActionBar() {
    const actionsBar = document.createElement("div")
    actionsBar.classList.add("actions-bar")
    const copyIds = document.createElement("button")
    copyIds.textContent = "Copy IDs"
    copyIds.classList.add("copy-changesets-ids-btn")
    copyIds.onclick = () => {
        const ids = Array.from(document.querySelectorAll(".mass-action-checkbox:checked")).map(i => i.value).join(",")
        if (ids !== "") {
            navigator.clipboard.writeText(ids).then(() => {
                console.log(ids, "ids copied")
            });
        } else {
            const ids = Array.from(document.querySelectorAll(".mass-action-checkbox")).map(i => i.value).join(",")
            navigator.clipboard.writeText(ids).then(() => {
                console.log(ids, "ids copied")
            });
        }
    }
    const revertButton = document.createElement("button")
    revertButton.textContent = "↩️"
    revertButton.title = "revert via osm-revert"
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
    const viewChangesetsButton = document.createElement("button")
    viewChangesetsButton.textContent = "🔍"
    viewChangesetsButton.title = "Display on one map\nif nothing is checked, all uploaded non hidden changesets will open"
    viewChangesetsButton.onclick = openCombinedChangesetsMap
    actionsBar.appendChild(copyIds)
    actionsBar.appendChild(document.createTextNode("\xA0"))
    actionsBar.appendChild(revertButton)
    actionsBar.appendChild(document.createTextNode("\xA0"))
    actionsBar.appendChild(revertViaJOSMButton)
    actionsBar.appendChild(document.createTextNode("\xA0"))
    actionsBar.appendChild(viewChangesetsButton)
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
    copyIds.classList.add("page-link")
    copyIds.onclick = () => {
        const ids = Array.from(document.querySelectorAll(".mass-action-checkbox:checked")).map(i => i.value).join(",")
        if (ids !== "") {
            navigator.clipboard.writeText(ids).then(() => {
                console.log(ids, "ids copied")
            });
        } else {
            const ids = Array.from(document.querySelectorAll(".mass-action-checkbox")).map(i => i.value).join(",")
            navigator.clipboard.writeText(ids).then(() => {
                console.log(ids, "ids copied")
            });
        }
    }
    const revertButton = document.createElement("button")
    revertButton.textContent = "↩️"
    revertButton.title = "revert via osm-revert"
    revertButton.onclick = () => {
        const ids = Array.from(document.querySelectorAll(".mass-action-checkbox:checked")).map(i => i.value).join(",")
        window.location = "https://revert.monicz.dev/?changesets=" + ids
    }
    revertButton.classList.add("page-link")
    const viewChangesetsButton = document.createElement("button")
    viewChangesetsButton.textContent = "🔍"
    viewChangesetsButton.title = "Display on one map"
    viewChangesetsButton.onclick = openCombinedChangesetsMap
    viewChangesetsButton.classList.add("page-link")
    const changesetMore = document.querySelector('#sidebar_content div.changeset_more:has([href*="before"]) li')
    if (changesetMore) {
        changesetMore.style.display = "inline-flex"
        changesetMore.appendChild(copyIds)
        changesetMore.appendChild(document.createTextNode("\xA0"))
        changesetMore.appendChild(revertButton)
        changesetMore.appendChild(document.createTextNode("\xA0"))
        changesetMore.appendChild(viewChangesetsButton)
    } else {
        const changesetsList = document.querySelector("#sidebar_content ol");
        const actionBarWrapper = document.createElement("ul")
        actionBarWrapper.classList.add("pagination", "justify-content-center")
        const actionBarWrapperLi = document.createElement("li")
        actionBarWrapperLi.classList.add("page-item")
        actionBarWrapperLi.style.display = "inline-flex"
        actionBarWrapper.appendChild(actionBarWrapperLi)

        actionBarWrapperLi.classList.add("action-bar-wrapper")
        actionBarWrapperLi.classList.add("text-center")
        actionBarWrapperLi.appendChild(copyIds)
        actionBarWrapperLi.appendChild(document.createTextNode("\xA0"))
        actionBarWrapperLi.appendChild(revertButton)
        actionBarWrapperLi.appendChild(document.createTextNode("\xA0"))
        actionBarWrapperLi.appendChild(viewChangesetsButton)
        changesetsList.after(actionBarWrapper)
    }
}

function makeOsmchaLinkForUsername(username) {
    // example: https://osmcha.org?filters={"users":[{"label":"TrickyFoxy","value":"TrickyFoxy"}]}
    const osmchaFilter = {
        "users": [{"label": username, "value": username}],
        "date__gte": [{"label": "", "value": ""}]
    }
    return "https://osmcha.org?" + new URLSearchParams({filters: JSON.stringify(osmchaFilter)}).toString()
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
            document.querySelector("#sidebar div.changesets").before(makeTopActionBar())
            document.querySelector('#sidebar div.changeset_more:has([href*="before"])').after(document.createTextNode("   "))
            makeBottomActionBar()
            document.querySelectorAll("ol li").forEach(addChangesetCheckbox)
        } else {
            massModeForUserChangesetsActive = !massModeForUserChangesetsActive
            document.querySelectorAll(".actions-bar").forEach(i => i.toggleAttribute("hidden"))
            document.querySelectorAll(".mass-action-checkbox").forEach(i => {
                i.toggleAttribute("hidden")
            })
        }
    }
    const username = decodeURI(location.pathname.match(/\/user\/(.*)\/history$/)[1])
    const osmchaLink = document.createElement("a");
    osmchaLink.id = "osmcha_link"
    osmchaLink.title = "Open profile in OSMCha.org"
    osmchaLink.href = makeOsmchaLinkForUsername(username)
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
        const changesetComment = i.querySelector("p a bdi").textContent
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
    lastLoadMoreURL = document.querySelector('.changeset_more:has([href*="before"]) a.page-link').href
    document.querySelector('.changeset_more:has([href*="before"]) a.page-link').click()
}

/**
 * @param {HTMLAnchorElement} i
 */
function makeUsernamesFilterable(i) {
    if (i.classList.contains("listen-for-filters")) {
        return
    }
    i.classList.add("listen-for-filters")
    i.onclick = async (e) => {
        if (massModeActive && (!e.metaKey && !e.ctrlKey && e.isTrusted)) {
            e.preventDefault()
            const filterByUsersInput = document.querySelector("#filter-by-user-input")
            if (filterByUsersInput.value === "") {
                filterByUsersInput.value = e.target.textContent
            } else {
                filterByUsersInput.value = filterByUsersInput.value + "," + e.target.textContent
                filterByUsersInput.setSelectionRange(filterByUsersInput.value.length, filterByUsersInput.value.length)
            }
            filterChangesets()
            updateMap()
            await GM.setValue("last-user-filter", document.getElementById("filter-by-user-input")?.value)
        }
    }
    i.title = "Click for hide this user changesets. Ctrl + click for open user profile"
    // i.style.border = "solid"
    // i.style.borderColor = getWindow()?.makeColor(i.textContent)
    // i.onmouseover = () => {
    //
    // }
}

let queriesCache = {
    cacheTime: Date.now(),
    elems: {}
}

if (isOsmServer()) {
    injectJSIntoPage(`
    const originalFetch = window.fetch;

    window.notesDisplayName = "";
    window.notesQFilter = "";
    window.notesClosedFilter = "";

    console.log('Fetch intercepted');
    window.fetch = async (...args) => {
        if (args[0]?.includes?.("notes.json") && (window.notesDisplayName !== "" || window.notesQFilter !== "" || window.notesClosedFilter !== "")) {
            const url = new URL(args[0], location.origin);
            url.pathname = url.pathname.replace("notes.json", "notes/search.json")
            url.searchParams.set("limit", "1000")
            if (window.notesDisplayName) {
                url.searchParams.set("display_name", window.notesDisplayName)
            }
            if (window.notesQFilter) {
                url.searchParams.set("q", window.notesQFilter)
            }
            // if (window.notesClosedFilter) {
            //     url.searchParams.set("closed", window.notesClosedFilter)
            // }
            args[0] = url.toString()
        }
        return originalFetch(...args);
    }
    `)
}

function getScrollbarWidth() {
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll';
    outer.style.msOverflowStyle = 'scrollbar';
    document.body.appendChild(outer);
    const inner = document.createElement('div');
    outer.appendChild(inner);
    const scrollbarWidth = (outer.offsetWidth - inner.offsetWidth);
    outer.parentNode.removeChild(outer);
    return scrollbarWidth;
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
        a.onclick = async () => {
            document.querySelector("#sidebar .search_forms")?.setAttribute("hidden", "true")

            async function makeTopFilterBar() {
                const filterBar = document.createElement("div")
                filterBar.classList.add("filter-bar")

                const hideBigChangesetsCheckbox = document.createElement("input")
                hideBigChangesetsCheckbox.checked = needHideBigChangesets = await GM.getValue("last-big-changesets-filter")
                hideBigChangesetsCheckbox.type = "checkbox"
                hideBigChangesetsCheckbox.style.cursor = "pointer"
                hideBigChangesetsCheckbox.id = "hide-big-changesets-checkbox"
                const hideBigChangesetLabel = document.createElement("label")
                hideBigChangesetLabel.textContent = "Hide big changesets"
                hideBigChangesetLabel.htmlFor = "hide-big-changesets-checkbox"
                hideBigChangesetLabel.style.marginLeft = "1px"
                hideBigChangesetLabel.style.marginBottom = "4px"
                hideBigChangesetLabel.style.cursor = "pointer"
                hideBigChangesetsCheckbox.onchange = async () => {
                    needHideBigChangesets = hideBigChangesetsCheckbox.checked;
                    filterChangesets()
                    updateMap()
                    await GM.setValue("last-big-changesets-filter", hideBigChangesetsCheckbox.checked)
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
                filterByUsersInput.style.width = 253 - getScrollbarWidth() + "px"
                filterByUsersInput.style.marginBottom = "3px"
                filterByUsersInput.addEventListener("keypress", async function (event) {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        filterChangesets();
                        updateMap()
                        await GM.setValue("last-user-filter", filterByUsersInput.value)
                        await GM.setValue("last-comment-filter", filterByCommentInput.value)
                    }
                });
                filterByUsersInput.value = await GM.getValue("last-user-filter", "")
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
                filterByCommentInput.placeholder = "words1,words2,... and press Enter"
                filterByCommentInput.title = "Filter by substring in changesets comments"
                filterByCommentInput.style.width = 253 - getScrollbarWidth() + "px"
                filterByCommentInput.addEventListener("keypress", async function (event) {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        filterChangesets();
                        updateMap()
                        await GM.setValue("last-user-filter", filterByUsersInput.value)
                        await GM.setValue("last-comment-filter", filterByCommentInput.value)
                    }
                });
                filterByCommentInput.value = await GM.getValue("last-comment-filter", "")
                filterBar.appendChild(filterByCommentInput)

                return filterBar
            }

            needPatchLoadMoreRequest = true
            if (massModeActive === null) {
                massModeActive = true
                document.querySelector("#sidebar div.changesets").before(await makeTopFilterBar())
                document.querySelectorAll('ol li div > a[href^="/user/"]').forEach(makeUsernamesFilterable)
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
                    doc.querySelector('.changeset_more:has([href*="before"]) a.page-link').href = lastLoadMoreURL
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

function makeBadge(userInfo, changesetDate = new Date()) { // todo make changesetDate required
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
        new Date(userInfo['firstChangesetCreationTime'] ?? userInfo['account_created']).setUTCDate(new Date(userInfo['firstChangesetCreationTime'] ?? userInfo['account_created']).getUTCDate() + 30)
        > changesetDate
    ) {
        userBadge.title = "At the time of creating the changeset/note, the user had been editing OpenStreetMap for less than a month"
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
            document.querySelectorAll("ol li").forEach(addChangesetCheckbox)
            makeBottomActionBar()
        }
        if (massModeActive && (location.pathname === "/history" || location.pathname === "/history/friends")) {
            document.querySelectorAll('ol li div > a[href^="/user/"]').forEach(makeUsernamesFilterable)
            // sidebarObserverForMassActions?.disconnect()
            filterChangesets()
            // todo
            // sidebarObserverForMassActions.observe(document.querySelector('#sidebar'), {childList: true, subtree: true});
        }
        document.querySelectorAll('#sidebar ol li div .changeset_id').forEach((item) => {
            if (item.classList.contains("custom-changeset-id-click")) return
            item.classList.add("custom-changeset-id-click")
            item.onclick = (e) => {
                if (!e.isTrusted) return
                e.preventDefault();
                let id = e.target.innerText;
                navigator.clipboard.writeText(id).then(() => copyAnimation(e, id));
            }
            item.title = "Click for copy changeset id"
            if (location.pathname.match(/^\/history(\/?|\/friends)$/)) {
                const usernameA = item.parentElement.parentElement.querySelector('a[href^="/user/"]')
                getCachedUserInfo(usernameA?.textContent).then((res) => {
                    if (!res) return
                    usernameA.title = `changesets_count: ${res['changesets']['count']}\naccount_created: ${res['account_created']}`
                    usernameA.before(makeBadge(res,
                        new Date(item.parentElement.parentElement.querySelector("time")?.getAttribute("datetime") ?? new Date())))
                })
            }
        })
        if (currentMassDownloadedPages && currentMassDownloadedPages <= MAX_PAGE_FOR_LOAD) {
            const loader = document.querySelector('.changeset_more:has([href*="before"]) > [hidden]')
            if (loader === null) {
                makeBottomActionBar()
            } else if (loader.style.display === "") {
                document.querySelector('.changeset_more:has([href*="before"]) a.page-link').click()
                console.log(`Loading page #${currentMassDownloadedPages}`)
                currentMassDownloadedPages++
            }
        } else if (currentMassDownloadedPages > MAX_PAGE_FOR_LOAD) {
            currentMassDownloadedPages = null
            const changesetsCount = document.querySelectorAll("ol > li").length
            document.querySelector("#hidden-changeset-counter").textContent = ` Displayed ${changesetsCount - hiddenChangesetsCount}/${changesetsCount}`
        } else {
            if (!document.querySelector("#infinity-list-btn")) {
                let moreButton = document.querySelector('.changeset_more:has([href*="before"]) a.page-link')
                if (!moreButton) return
                moreButton.parentElement.style.display = "inline-flex"
                const infinityList = document.createElement("button")
                infinityList.classList.add("page-link")
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


async function getChangesetMetadata(changeset_id) {
    return await fetch(osm_server.apiBase + "changeset" + "/" + changeset_id + ".json");
}

const _isDebug = document.querySelector("head")?.getAttribute("data-user") === "11528195"
    || osm_server === local_server
    || osm_server === dev_server;

function isDebug() {
    return _isDebug;
}

function debug_alert() {
    if (!isDebug()) return
    alert(arguments)
    // eslint-disable-next-line
    debugger
}

/**
 * @param {number|null=} changeset_id
 * @return {Promise<ChangesetMetadata|void>}
 */
async function loadChangesetMetadata(changeset_id = null) {
    console.debug(`Loading changeset metadata`)
    if (!changeset_id) {
        const match = location.pathname.match(/changeset\/(\d+)/)
        if (!match) {
            return;
        }
        changeset_id = parseInt(match[1]);
    }
    console.debug(`Loading metadata of changeset #${changeset_id}`)
    if (changesetMetadatas[changeset_id] && changesetMetadatas[changeset_id].id === changeset_id) {
        return changesetMetadatas[changeset_id];
    }
    // prevChangesetMetadata = changesetMetadatas[changeset_id]
    const res = await getChangesetMetadata(changeset_id);
    if (res.status === 509) {
        error509Handler(res)
    } else if (res.status !== 200) {
        console.error(res)
        debug_alert("metadatas failed")
    } else {
        const jsonRes = await res.json();
        if (jsonRes.changeset) {
            return changesetMetadatas[changeset_id] = jsonRes.changeset
        }
        changesetMetadatas[changeset_id] = jsonRes.elements[0]
        changesetMetadatas[changeset_id].min_lat = changesetMetadatas[changeset_id].minlat
        changesetMetadatas[changeset_id].min_lon = changesetMetadatas[changeset_id].minlon
        changesetMetadatas[changeset_id].max_lat = changesetMetadatas[changeset_id].maxlat
        changesetMetadatas[changeset_id].max_lon = changesetMetadatas[changeset_id].maxlon
        return changesetMetadatas[changeset_id]
    }
}

/**
 * @param {number[]} changeset_ids
 */
async function loadChangesetMetadatas(changeset_ids) {
    if (!changeset_ids.length) {
        return
    }
    const batchSize = 100
    for (let i = 0; i < changeset_ids.length; i += batchSize) {
        const res = await fetch(osm_server.apiBase + "changesets.json?changesets=" + changeset_ids.slice(i, i + batchSize).join(","));
        if (res.status === 509) {
            error509Handler(res)
        } else {
            const jsonRes = await res.json();
            jsonRes["changesets"].forEach(i => {
                changesetMetadatas[i.id] = i
            })
        }
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
    const res = await fetch(osm_server.apiBase + "notes" + "/" + note_id + ".json", {signal: getAbortController().signal});
    if (res.status === 509) {
        error509Handler(res)
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
    const jsonRes = await fetchJSONWithCache(osm_server.apiBase + "node" + "/" + node_id + ".json", (res) => {
        if (res.status === 509) {
            error509Handler(res)
        } else if (res.status === 410) {
            console.warn(`node ${node_id} was deleted`);
        } else {
            return true
        }
    });
    if (!jsonRes) return;
    nodeMetadata = jsonRes.elements[0];
    return jsonRes;
}

let wayMetadata = null

/**
 * @param {number|null=} way_id
 * @return {Promise<void|{elements: []}>}
 */
async function loadWayMetadata(way_id = null) {
    console.log(`Loading way metadata`)
    if (!way_id) {
        const match = location.pathname.match(/way\/(\d+)/)
        if (!match) {
            return;
        }
        way_id = parseInt(match[1]);
    }
    /*** @type {{elements: []}|undefined}*/
    const jsonRes = await fetchJSONWithCache(osm_server.apiBase + "way" + "/" + way_id + "/full.json", (res) => {
        if (res.status === 509) {
            error509Handler(res)
        } else if (res.status === 410) {
            console.warn(`way ${way_id} was deleted`);
        } else {
            return true
        }
    });
    if (!jsonRes) return;
    wayMetadata = jsonRes.elements.filter(i => i.type === "node")
    wayMetadata.bbox = {
        min_lat: Math.min(...wayMetadata.map(i => i.lat)),
        min_lon: Math.min(...wayMetadata.map(i => i.lon)),
        max_lat: Math.max(...wayMetadata.map(i => i.lat)),
        max_lon: Math.max(...wayMetadata.map(i => i.lon))
    }
    return jsonRes
}

/**
 * @type {{
 *     relation: RelationVersion,
 *     bbox: {
 *         min_lat: number,
 *         min_lon: number,
 *         max_lat: number,
 *         max_lon: number,
 *     }
 * } | null}
 */
let relationMetadata = null

/**
 * @param {number|null=} relation_id
 * @return {Promise<{elements: (NodeVersion|WayVersion|RelationVersion)[]}| undefined>}
 */
async function loadRelationMetadata(relation_id = null) {
    console.log(`Loading relation metadata`)
    if (!relation_id) {
        const match = location.pathname.match(/relation\/(\d+)/)
        if (!match) {
            return;
        }
        relation_id = parseInt(match[1]);
    }
    const jsonRes = await fetchJSONWithCache(osm_server.apiBase + "relation" + "/" + relation_id + "/full.json", (res) => {
        if (res.status === 509) {
            error509Handler(res)
        } else if (res.status === 410) {
            console.warn(`relation ${relation_id} was deleted`);
        } else {
            return true
        }
    });
    if (!jsonRes) return;
    const nodes = /** @type {NodeVersion[]} */ jsonRes.elements.filter(i => i.type === "node")
    relationMetadata = {
        relation: jsonRes.elements.find(i => i.type === "relation" && i.id === relation_id),
        bbox: {
            min_lat: Math.min(...nodes.map(i => i.lat)),
            min_lon: Math.min(...nodes.map(i => i.lon)),
            max_lat: Math.max(...nodes.map(i => i.lat)),
            max_lon: Math.max(...nodes.map(i => i.lon)),
        }
    }
    return jsonRes;
}

function updateCurrentObjectMetadata() {
    setTimeout(loadChangesetMetadata, 0)
    setTimeout(loadNoteMetadata, 0)
    setTimeout(loadNodeMetadata, 0)
    setTimeout(loadWayMetadata, 0)
    setTimeout(loadRelationMetadata, 0)
}

async function abortableSleep(ms, {signal}) {
    console.debug(`sleep ${ms}ms`)
    await new Promise((resolve, reject) => {
        signal?.throwIfAborted();

        function done() {
            resolve();
            signal?.removeEventListener("abort", stop);
        }

        function stop() {
            console.debug("sleep aborted")
            reject(this.reason);
            clearTimeout(timer);
        }

        const timer = setTimeout(done, ms);
        signal?.addEventListener("abort", stop);
    });
}


async function sleep(ms) {
    console.debug(`sleep ${ms}ms`)
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
    await GM.setValue("friends", JSON.stringify(friends))
    console.debug("Friends list updated")
    return friends
}

let friendsLoadingLock = false;

async function getFriends() {
    const friendsStr = await GM.getValue("friends")
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

function resetSelectedChangesets() {
    document.querySelectorAll(".selected").forEach(el => {
        el.classList.remove("selected")
    })
}

let overzoomObserver = null

function enableOverzoom() {
    if (!GM_config.get("OverzoomForDataLayer")) {
        return
    }
    blankSuffix = "?blankTile=false"
    console.log("Enabling overzoom for map layer")
    if (overzoomObserver) {
        overzoomObserver.disconnect()
    }

    injectJSIntoPage(`
    (function () {
        if (map && map.options) {
            map.options.maxZoom = 22
            const layers = [];
            map.eachLayer(i => layers.push(i))
            layers[0].options.maxZoom = 22
        } else {
            console.warn("overzoom not enabled")
        }
    })()
    `)

    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeName !== 'IMG') {
                    return;
                }
                getWindow().L.DomEvent.off(node, "error")
            });
        });
    });
    overzoomObserver = observer;
    observer.observe(document.body, {childList: true, subtree: true});

    // it's unstable
    console.log("Overzoom enabled")
}

function disableOverzoom() {
    if (!GM_config.get("OverzoomForDataLayer")) {
        return
    }
    injectJSIntoPage(`
    (function () {
        map.options.maxZoom = 19
        const layers = [];
        map.eachLayer(i => layers.push(i))
        layers[0].options.maxZoom = 19
    })()
    `)
}

const ABORT_ERROR_PREV = "Abort requests for moving to prev changeset";
const ABORT_ERROR_NEXT = "Abort requests for moving to next changeset";
const ABORT_ERROR_USER_CHANGESETS = "Abort requests for moving to user changesets";
const ABORT_ERROR_WHEN_PAGE_CHANGED = "Abort requests. Reason: page changed";

let layersHidden = false;

let needPreloadChangesets = false;

function getPrevChangesetLink(doc = document) {
    const navigationLinks = doc.querySelectorAll("div.secondary-actions")[1]?.querySelectorAll("a")
    if (navigationLinks && navigationLinks[0].href.includes("/changeset/")) {
        return navigationLinks[0]
    }
}

function getNextChangesetLink(doc = document) {
    const navigationLinks = doc.querySelectorAll("div.secondary-actions")[1]?.querySelectorAll("a")
    if (navigationLinks && Array.from(navigationLinks).at(-1).href.includes("/changeset/")) {
        return Array.from(navigationLinks).at(-1);
    }
}

let repeatedEvent = false
let trustedEvent = true
const smoothScroll = "auto"

function goToPrevChangesetObject(e) {
    repeatedEvent = e.repeat
    if (!document.querySelector("ul .active-object")) {
        return;
    }
    if (document.querySelector("#sidebar").matches(":hover")) {
        preventHoverEvents()
    }

    const prev = document.querySelector("ul .active-object")
    for (let i = 0; i < 10000; i++) {
        const cur = document.querySelector("ul .active-object")
        if (cur.previousElementSibling) {
            cur.previousElementSibling.classList.add("active-object")
            cur.classList.remove("active-object")

            if (!cur.previousElementSibling.classList.contains('tags-non-modified')
                || cur.previousElementSibling.classList.contains('location-modified')
                || cur.previousElementSibling.querySelector('.nodes-changed, .members-changed')
                || e.altKey
                || !location.search.includes("changesets=")) {
                trustedEvent = false
                cur.previousElementSibling.click()
                if (changesetObjectsSelectionModeEnabled) {
                    cur.previousElementSibling.querySelector("input")?.focus()
                }
                trustedEvent = true
                cur.previousElementSibling.scrollIntoView({block: "center", behavior: smoothScroll})
                resetMapHover()
                cur.previousElementSibling.classList.add("map-hover")
                if (cur.previousElementSibling.querySelector(".load-relation-version")) {
                    cur.previousElementSibling.querySelector(".load-relation-version").focus()
                }
                return
            }
        } else {
            const curFrame = cur.parentElement.parentElement
            if (curFrame.id === "changeset_nodes" && ["changeset_ways", "changeset_relations"].includes(curFrame.previousElementSibling?.id)
                || curFrame.id === "changeset_relations" && ["changeset_ways"].includes(curFrame.previousElementSibling?.id)) {
                cur.classList.remove("active-object")
                curFrame.previousElementSibling.querySelector("#changeset_ways li:last-of-type, #changeset_relations li:last-of-type").classList.add("active-object")
                if (!curFrame.previousElementSibling.querySelector(".active-object").classList.contains('tags-non-modified')
                    || curFrame.previousElementSibling.querySelector(".active-object").classList.contains('location-modified')
                    || curFrame.previousElementSibling.querySelector(".active-object").querySelector('.nodes-changed, .members-changed')
                    || e.altKey
                    || !location.search.includes("changesets=")) {
                    trustedEvent = false
                    curFrame.previousElementSibling.querySelector(".active-object").click()
                    if (changesetObjectsSelectionModeEnabled) {
                        curFrame.previousElementSibling.querySelector(".active-object input")?.focus()
                    }
                    trustedEvent = true
                    curFrame.previousElementSibling.querySelector(".active-object").scrollIntoView({
                        block: "center",
                        behavior: smoothScroll
                    })
                    resetMapHover()
                    curFrame.previousElementSibling.querySelector(".active-object").classList.add("map-hover")
                    if (curFrame.previousElementSibling?.querySelector(".load-relation-version")) {
                        curFrame.previousElementSibling.querySelector(".load-relation-version").focus()
                    }
                    if (curFrame.id === "changeset_relations") {
                        document.activeElement.blur()
                    }
                    return
                }
            } else {
                let prev = curFrame?.previousElementSibling?.previousElementSibling
                if (prev?.nodeName !== "TURBO-FRAME" && prev?.previousElementSibling?.nodeName === "TURBO-FRAME") {
                    prev = prev.previousElementSibling;
                }
                if (prev?.nodeName === "TURBO-FRAME") {
                    cur.classList.remove("active-object")
                    prev.querySelector("li:last-of-type").classList.add("active-object")
                    if (!prev.querySelector("li:last-of-type").classList.contains('tags-non-modified')
                        || prev.querySelector("li:last-of-type").classList.contains('location-modified')
                        || prev.querySelector("li:last-of-type")?.querySelector('.nodes-changed, .members-changed')
                        || e.altKey
                        || !location.search.includes("changesets=")) {
                        trustedEvent = false
                        prev.querySelector("li:last-of-type").click()
                        if (changesetObjectsSelectionModeEnabled) {
                            prev.querySelector("li:last-of-type input")?.focus()
                        }
                        trustedEvent = true
                        prev.querySelector("li:last-of-type").scrollIntoView({
                            block: "center",
                            behavior: smoothScroll
                        })
                        resetMapHover()
                        prev.querySelector("li:last-of-type").classList.add("map-hover")
                        if (prev.querySelector("li:last-of-type").querySelector(".load-relation-version")) {
                            prev.querySelector("li:last-of-type").querySelector(".load-relation-version").focus()
                        }
                        return
                    }
                }
            }
        }

        if (cur === document.querySelector("ul .active-object")) {
            cur.classList.remove("active-object")
            prev.classList.add("active-object")
            return;
        }
    }
}

function goToNextChangesetObject(e) {
    repeatedEvent = e.repeat
    if (document.querySelector("#sidebar").matches(":hover")) {
        preventHoverEvents()
    }
    if (!document.querySelector("ul .active-object")) {
        document.querySelector("#changeset_nodes li:not(.page-item), #changeset_ways li:not(.page-item), #changeset_relations li:not(.page-item)").classList.add("active-object")
        trustedEvent = false
        document.querySelector("ul .active-object").click()
        if (changesetObjectsSelectionModeEnabled) {
            document.querySelector("ul .active-object input")?.focus()
        }
        trustedEvent = true
        resetMapHover()
        document.querySelector("ul .active-object").classList.add("map-hover")
        return
    }
    const prev = document.querySelector("ul .active-object")
    for (let i = 0; i < 10000; i++) {
        const cur = document.querySelector("ul .active-object")
        if (cur.nextElementSibling) {
            cur.nextElementSibling.classList.add("active-object")
            cur.classList.remove("active-object")
            if (!cur.nextElementSibling.classList.contains('tags-non-modified')
                || cur.nextElementSibling.classList.contains('location-modified')
                || cur.nextElementSibling.querySelector('.nodes-changed, .members-changed')
                || e.altKey
                || !location.search.includes("changesets=")) {
                trustedEvent = false
                cur.nextElementSibling.click()
                if (changesetObjectsSelectionModeEnabled) {
                    cur.nextElementSibling.querySelector("input")?.focus()
                }
                trustedEvent = true
                cur.nextElementSibling.scrollIntoView({block: "center", behavior: smoothScroll})
                resetMapHover()
                cur.nextElementSibling.classList.add("map-hover")
                if (cur.nextElementSibling.querySelector(".load-relation-version")) {
                    cur.nextElementSibling.querySelector(".load-relation-version").focus()
                }
                return
            }
        } else {
            const curFrame = cur.parentElement.parentElement
            if (curFrame.id === "changeset_ways" && ["changeset_nodes", "changeset_relations"].includes(curFrame.nextElementSibling?.id)
                || curFrame.id === "changeset_relations" && ["changeset_nodes"].includes(curFrame.nextElementSibling?.id)) {
                cur.classList.remove("active-object")
                curFrame.nextElementSibling.querySelector("#changeset_nodes li, #changeset_relations li").classList.add("active-object")
                if (!curFrame.nextElementSibling.querySelector(".active-object").classList.contains('tags-non-modified')
                    || curFrame.nextElementSibling.querySelector(".active-object").classList.contains('location-modified')
                    || curFrame.nextElementSibling.querySelector(".active-object").querySelector('.nodes-changed, .members-changed')
                    || e.altKey
                    || !location.search.includes("changesets=")) {
                    trustedEvent = false
                    curFrame.nextElementSibling.querySelector(".active-object").click()
                    if (changesetObjectsSelectionModeEnabled) {
                        curFrame.nextElementSibling.querySelector(".active-object input")?.focus()
                    }
                    trustedEvent = true
                    curFrame.nextElementSibling.querySelector(".active-object").scrollIntoView({
                        block: "center",
                        behavior: smoothScroll
                    })

                    resetMapHover();
                    curFrame.nextElementSibling.querySelector(".active-object").classList.add("map-hover")
                    if (curFrame.nextElementSibling?.querySelector(".load-relation-version")) {
                        curFrame.nextElementSibling.querySelector(".load-relation-version").focus()
                    }
                    if (curFrame.id === "changeset_relations") {
                        document.activeElement.blur()
                    }
                    return;
                }
            } else {
                let next = curFrame?.nextElementSibling?.nextElementSibling
                if (next?.nodeName !== "TURBO-FRAME" && next?.nextElementSibling?.nodeName === "TURBO-FRAME") {
                    next = next.nextElementSibling;
                }
                if (next?.nodeName === "TURBO-FRAME") {
                    cur.classList.remove("active-object")
                    next.querySelector("li").classList.add("active-object")
                    if (!next.querySelector("li").classList.contains('tags-non-modified')
                        || next.querySelector("li").classList.contains('location-modified')
                        || next.querySelector("li")?.querySelector('.nodes-changed, .members-changed')
                        || e.altKey
                        || !location.search.includes("changesets=")) {
                        trustedEvent = false
                        next.querySelector("li").click()
                        if (changesetObjectsSelectionModeEnabled) {
                            next.querySelector("li input")?.focus()
                        }
                        trustedEvent = true
                        next.querySelector("li").scrollIntoView({block: "center", behavior: smoothScroll})
                        resetMapHover()
                        next.querySelector("li").classList.add("map-hover")
                        if (next.querySelector("li").querySelector(".load-relation-version")) {
                            next.querySelector("li").querySelector(".load-relation-version").focus()
                        }
                        return
                    }
                }
            }
        }

        if (cur === document.querySelector("ul .active-object")) {
            cur.classList.remove("active-object")
            prev.classList.add("active-object")
            return;
        }
    }
    console.log("KeyL not found next elem")
}

function extractBboxFromElem(elem) {
    const bbox = JSON.parse(elem.getAttribute("data-changeset")).bbox
    bbox.min_lon = bbox.minlon
    bbox.min_lat = bbox.minlat
    bbox.max_lon = bbox.maxlon
    bbox.max_lat = bbox.maxlat
    return bbox
}

function preventHoverEvents() {
    if (document.querySelector("#mouse-trap")) return;

    console.log("add mouse trap");
    const trap = document.createElement('div');
    trap.id = 'mouse-trap';
    document.body.appendChild(trap);

    window.addEventListener('mousemove', () => {
        trap.remove();
        console.log("remove mouse trap")
    }, {once: true});
}

function goToPrevChangeset(e) {
    if (!document.querySelector("ol .active-object")) {
        return;
    }
    preventHoverEvents()

    const cur = document.querySelector("ol .active-object")
    let prev = cur.previousElementSibling
    while (true) {
        if (!prev) break
        if (prev.getAttribute("hidden") === "true") {
            prev = prev.previousElementSibling
        } else {
            break
        }
    }

    if (prev) {
        prev.classList.add("active-object")
        cur.classList.remove("active-object")
        let focused = prev.querySelector("a")
        focused.focus()
        if (massModeForUserChangesetsActive) {
            focused = prev.querySelector("input")
            focused?.focus()
        }
        resetSelectedChangesets()
        prev.classList.add("selected")
        prev.scrollIntoView({block: "center", behavior: "instant"})
        cleanObjectsByKey('changesetBounds')

        setTimeout(() => {
            const bound = drawBBox(extractBboxFromElem(prev), {color: "#000000", weight: 4, fillOpacity: 0})
            bound.bringToFront()
            focused.addEventListener("focusout", () => {
                bound.remove()
            }, {once: true})
            setTimeout(() => {
                bound.bringToFront()
            }, 20)
        })
    } else {
        document.querySelector('.changeset_more a[href*="after"]')?.click()
    }

}

function goToNextChangeset(e) {
    preventHoverEvents()
    if (!document.querySelector("ol .active-object")) {
        let next = document.querySelector("ol li")
        while (true) {
            if (next?.getAttribute("hidden") === "true") {
                next = next.nextElementSibling
            } else {
                break
            }
        }
        if (!next) {
            document.querySelector('.changeset_more a[href*="before"]')?.click()
            return
        }
        next.classList.add("active-object")
        document.querySelector("ol .active-object a").tabIndex = 0
        let focused = document.querySelector("ol .active-object a")
        focused.focus()
        if (massModeForUserChangesetsActive) {
            focused = document.querySelector("ol .active-object input")
            focused?.focus()
        }
        resetSelectedChangesets()
        document.querySelector("ol .active-object").classList.add("selected")
        cleanObjectsByKey('changesetBounds')
        const bound = drawBBox(extractBboxFromElem(document.querySelector("ol .active-object")), {
            color: "#000000",
            weight: 4,
            fillOpacity: 0
        })
        bound.bringToFront()
        focused.addEventListener("focusout", () => {
            bound.remove()
        }, {once: true})
        return
    }
    const cur = document.querySelector("ol .active-object")
    let next = cur.nextElementSibling
    while (true) {
        if (!next) break
        if (next.getAttribute("hidden") === "true") {
            next = next.nextElementSibling
        } else {
            break
        }
    }
    if (next) {
        next.classList.add("active-object")
        cur.classList.remove("active-object")
        let focused = next.querySelector("a")
        focused.focus()
        if (massModeForUserChangesetsActive) {
            focused = next.querySelector("input")
            focused?.focus()
        }
        resetSelectedChangesets()
        next.classList.add("selected")
        next.scrollIntoView({block: "center", behavior: "instant"})
        cleanObjectsByKey('changesetBounds')

        setTimeout(() => {
            const bound = drawBBox(extractBboxFromElem(next), {color: "#000000", weight: 4, fillOpacity: 0})
            bound.bringToFront()
            focused.addEventListener("focusout", () => {
                bound.remove()
            }, {once: true})
            setTimeout(() => {
                bound.bringToFront()
            }, 20)
        })
    } else {
        document.querySelector('.changeset_more a[href*="before"]')?.click()
    }
}

function extractLatLonFromElem(elem) {
    return [elem.getAttribute("data-lat"), elem.getAttribute("data-lon")]
}

function goToPrevSearchResult(e) {
    if (!document.querySelector("#sidebar_content ul .active-object")) {
        return;
    }
    preventHoverEvents()

    const cur = document.querySelector("#sidebar_content ul .active-object")
    let prev = cur.previousElementSibling
    while (true) {
        if (!prev) break
        if (prev.getAttribute("hidden") === "true") {
            prev = prev.previousElementSibling
        } else {
            break
        }
    }
    if (!prev) {
        if (cur.parentElement.previousElementSibling.tagName === "UL") {
            prev = cur.parentElement.previousElementSibling?.querySelector("li:last-of-type")
        }
    }
    if (prev) {
        prev.classList.add("active-object")
        cur.classList.remove("active-object")
        let focused = prev.querySelector("a")
        focused.focus()
        prev.scrollIntoView({block: "center", behavior: "instant"})

        const [lat, lon] = extractLatLonFromElem(document.querySelector("#sidebar_content ul .active-object a"))
        const marker = showNodeMarker(lat, lon)
        panTo(lat, lon)
        focused.addEventListener("focusout", () => {
            marker.remove()
        }, {once: true})
    }

}

function goToNextSearchResult(e) {
    preventHoverEvents()
    if (!document.querySelector("#sidebar_content ul .active-object")) {
        document.querySelector("#sidebar_content ul li").classList.add("active-object")
        document.querySelector("#sidebar_content ul .active-object a").tabIndex = 0
        let focused = document.querySelector("#sidebar_content .active-object a")
        focused.focus()
        const [lat, lon] = extractLatLonFromElem(document.querySelector("#sidebar_content ul .active-object a"))
        const marker = showNodeMarker(lat, lon)
        panTo(lat, lon)
        focused.addEventListener("focusout", () => {
            marker.remove()
        }, {once: true})
        return
    }
    const cur = document.querySelector("#sidebar_content ul .active-object")
    let next = cur.nextElementSibling
    while (true) {
        if (!next) break
        if (next.getAttribute("hidden") === "true") {
            next = next.nextElementSibling
        } else {
            break
        }
    }
    if (!next) {
        if (cur.parentElement.nextElementSibling.tagName === "UL") {
            next = cur.parentElement.nextElementSibling?.querySelector("li")
        }
    }
    if (next) {
        next.classList.add("active-object")
        cur.classList.remove("active-object")
        let focused = next.querySelector("a")
        focused.focus()
        resetSelectedChangesets()
        next.scrollIntoView({block: "center", behavior: "instant"})

        const [lat, lon] = extractLatLonFromElem(document.querySelector("#sidebar_content ul .active-object a"))
        const marker = showNodeMarker(lat, lon)
        panTo(lat, lon)

        focused.addEventListener("focusout", () => {
            marker.remove()
        }, {once: true})
    } else {
        document.querySelector('.search_more a')?.click()
    }
}

function goToPrevObjectVersion() {
    if (document.querySelector("#sidebar").matches(":hover")) {
        preventHoverEvents()
    }
    if (!document.querySelector("#sidebar_content .active-object")) {
        getMap()?.invalidateSize()
        document.querySelector("#element_versions_list > div:not(.hidden-version)").classList.add("active-object")
        document.querySelector("#element_versions_list > div:not(.hidden-version)").click()
        resetMapHover()
        document.querySelector("#element_versions_list > div:not(.hidden-version)").classList.add("map-hover")
    } else {
        const old = document.querySelector("#element_versions_list > div.active-object")
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
}

function gotNextObjectVersion() {
    if (document.querySelector("#sidebar").matches(":hover")) {
        preventHoverEvents()
    }
    if (!document.querySelector("#sidebar_content .active-object")) {
        getMap()?.invalidateSize()
        document.querySelector("#element_versions_list > div").classList.add("active-object")
        document.querySelector("#element_versions_list > div.active-object").click()
        resetMapHover()
        document.querySelector("#element_versions_list > div.active-object").classList.add("map-hover")
    } else {
        const old = document.querySelector("#element_versions_list > div.active-object")
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


const min = Math.min;
const max = Math.max;

function combineBBOXes(bboxes) {
    const bbox = {
        min_lat: 10000000, min_lon: 10000000, max_lat: -10000000, max_lon: -100000000,
    }
    for (const i of bboxes) {
        if (i?.min_lat) {
            bbox.min_lat = min(bbox.min_lat, i.min_lat);
            bbox.min_lon = min(bbox.min_lon, i.min_lon);
            bbox.max_lat = max(bbox.max_lat, i.max_lat);
            bbox.max_lon = max(bbox.max_lon, i.max_lon);
        }
    }
    return bbox;
}

async function zoomToChangesets() {
    const params = new URLSearchParams(location.search)
    let changesetIDs = params.get("changesets")?.split(",")
    if (!changesetIDs) {
        return;
    }

    for (const i of changesetIDs) {
        await loadChangesetMetadata(parseInt(i));
    }
    getMap()?.invalidateSize()
    const bbox = combineBBOXes(changesetIDs.map(i => changesetMetadatas[i]))
    fitBounds([[bbox.min_lat, bbox.min_lon], [bbox.max_lat, bbox.max_lon]])
}

let shiftKeyZClicks = 0

function zoomToCurrentObject(e) {
    if (new URLSearchParams(location.search).has("changesets")) {
        void zoomToChangesets()
    } else if (location.pathname.startsWith("/changeset")) {
        const changesetMetadata = changesetMetadatas[location.pathname.match(/changeset\/(\d+)/)[1]]
        if (e.shiftKey && changesetMetadata) {
            setTimeout(async () => {
                // todo changesetID => merged BBOX
                const changesetID = parseInt(location.pathname.match(/changeset\/(\d+)/)[1])
                const nodesBag = [];
                for (const node of Array.from((await getChangeset(changesetID)).data.querySelectorAll('node'))) {
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
                if ((await getChangeset(changesetID)).data.querySelectorAll("relation").length && shiftKeyZClicks % 2 === 1) {
                    for (const way of (await getChangeset(changesetID)).data.querySelectorAll("way")) {
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
                    ]) // todo max zoom
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
                        document.querySelector("#element_versions_list > div span.latitude").textContent.replace(",", "."),
                        document.querySelector("#element_versions_list > div span.longitude").textContent.replace(",", ".")
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
                const viaNodes = relationMetadata.relation.members.filter(m => m.role === "via").flatMap(m => {
                    if (m.type === "node") {
                        return m
                    } else {
                        return m.geometry
                    }
                })
                if (e.code === "KeyZ" && e.shiftKey) {
                    fitBounds([
                        [Math.min(...viaNodes.map(i => i.lat)), Math.min(...viaNodes.map(i => i.lon))],
                        [Math.max(...viaNodes.map(i => i.lat)), Math.max(...viaNodes.map(i => i.lon))]
                    ])
                } else {
                    fitBounds([
                        [relationMetadata.bbox.min_lat, relationMetadata.bbox.min_lon],
                        [relationMetadata.bbox.max_lat, relationMetadata.bbox.max_lon]
                    ])
                }
            }
        }
    } else if (location.search.includes("&display-gpx=")) {
        if (trackMetadata) {
            fitBounds([
                [trackMetadata.min_lat, trackMetadata.min_lon],
                [trackMetadata.max_lat, trackMetadata.max_lon]
            ])
        }
    } else if (searchResultBBOX) {
        fitBounds([
            [searchResultBBOX.min_lat, searchResultBBOX.min_lon],
            [searchResultBBOX.max_lat, searchResultBBOX.max_lon]
        ])
    }
}


function getCurrentXYZ() {
    const [, z, x, y] = new URL(document.querySelector("#editanchor").href).hash.match(/map=(\d+)\/([0-9.-]+)\/([0-9.-]+)/);
    return [x, y, z];
}

function setupNavigationViaHotkeys() {
    if (["/edit", "/id"].includes(location.pathname)) return
    updateCurrentObjectMetadata()
    // if (!location.pathname.startsWith("/changeset")) return;
    if (hotkeysConfigured) return
    hotkeysConfigured = true

    runPositionTracker()

    function keydownHandler(e) {
        if (e.repeat && !["KeyK", "KeyL"].includes(e.code)) return
        if (document.activeElement?.name === "text") return
        if (document.activeElement?.name === "query") { // todo расширить для любого поля
            if (e.code === "Escape") {
                document.activeElement.blur()
            }
            return
        }
        if (["TEXTAREA", "INPUT", "SELECT"].includes(document.activeElement?.nodeName) && document.activeElement?.getAttribute("type") !== "checkbox") {
            return;
        }
        if (document.activeElement.getAttribute("contenteditable")) {
            return
        }
        if (["TH", "TD"].includes(document.activeElement?.nodeName)
            && document.activeElement?.parentElement?.parentElement?.parentElement?.hasAttribute("contenteditable")) {
            return
        }
        if (["TR"].includes(document.activeElement?.nodeName)
            && document.activeElement?.parentElement?.parentElement?.hasAttribute("contenteditable")) {
            return
        }
        if (measuring) {
            if ((e.ctrlKey || e.metaKey) && e.code === "KeyZ") {
                if (currentMeasuring.way.length) {
                    currentMeasuring.way.pop()
                    currentMeasuring.nodes.pop()?.remove()
                    currentMeasuring.tempLine?.remove()
                    currentMeasuring.wayLine?.remove()
                    if (currentMeasuring.way.length) {
                        currentMeasuring.wayLine = displayWay(currentMeasuring.way, false, "#000000", 1);
                        currentMeasuring.tempLine = displayWay([currentMeasuring.way[currentMeasuring.way.length - 1], lastLatLng], false, "#000000", 1)
                    }
                }
            } else if (e.code === "Escape") {
                endMeasuring()
            }
        }
        // if (drawingBuildings) {
        //     if (e.code === "Escape") {
        //         firstBuilding = null
        //     }
        // }
        if (e.metaKey || e.ctrlKey) {
            return;
        }
        console.log("Key: ", e.key)
        console.log("Key code: ", e.code)
        if (e.code === "KeyN") {
            if (location.pathname.includes("/user/") && !location.pathname.includes("/history")) {
                document.querySelector('a[href^="/user/"][href$="/notes"]')?.click()
            } else if (e.altKey && location.pathname.match(/note\/[0-9]+/)) {
                window.open(document.querySelector('#sidebar_content a[href^="/user/"]').getAttribute("href") + "/notes", "_blank")
            } else {
                // notes
                if (e.shiftKey) {
                    if (location.pathname.includes("/node") || location.pathname.includes("/way") || location.pathname.includes("/relation")) {
                        newNotePlaceholder = "\n \n" + location.href
                    }
                    document.querySelector(".control-note .control-button").click()
                } else {
                    Array.from(document.querySelectorAll(".overlay-layers label input"))[0].removeAttribute("disabled")
                    Array.from(document.querySelectorAll(".overlay-layers label"))[0].click()
                }
            }
        } else if (e.code === "KeyD") {
            if (e.altKey && isDebug()) {
                // eslint-disable-next-line no-debugger
                debugger
                throw "debug"
            }
            if (e.shiftKey && isDebug()) {
                location.search += "&kek"
                return
            }
            if (e.altKey || e.shiftKey) {
                return;
            }
            if (location.pathname.includes("/user/") && !location.pathname.includes("/history")) {
                document.querySelector('a[href^="/user/"][href$="/diary"]')?.click()
            } else {
                // map data
                Array.from(document.querySelectorAll(".overlay-layers label input"))[1].removeAttribute("disabled")
                Array.from(document.querySelectorAll(".overlay-layers label"))[1].click()
                if (!location.hash.includes("D")) {
                    disableOverzoom()
                } else {
                    enableOverzoom()
                }
            }
        } else if (e.code === "KeyG") { // gps tracks
            if (e.shiftKey || e.altKey) {
                enableOverzoom()
                getMap().setZoom(Math.min(14, getMap().getZoom()))
                if (!document.querySelectorAll(".overlay-layers label")[2].querySelector("input").checked) {
                    Array.from(document.querySelectorAll(".overlay-layers label"))[2].click()
                }
                switchOverlayTiles()
            } else {
                Array.from(document.querySelectorAll(".overlay-layers label"))[2].click()
            }
        } else if (e.code === "KeyS") { // satellite
            enableOverzoom()
            if (e.shiftKey) {
                switchESRIbeta()
                return
            } else if (e.altKey) {
                bypassCaches()
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
            if (!location.pathname.match(/^\/user\/([^/]+)\/?$/)) {
                if (e.shiftKey) {
                    if (document.querySelector("#editanchor").getAttribute("data-editor") === "id") {
                        document.querySelectorAll("#edit_tab .dropdown-menu .editlink")[1]?.click()
                    } else {
                        document.querySelectorAll("#edit_tab .dropdown-menu .editlink")[0]?.click()
                    }
                } else if (e.altKey && isDebug()) {
                    document.querySelectorAll("table.quick-look, table.geojson-props-table:not(.metainfo-table)").forEach(i => {
                        i.setAttribute("contenteditable", "true")
                    })
                } else {
                    document.querySelector("#editanchor")?.click()
                }
            } else {
                document.querySelector('a[href^="/user/"][href$="/history"]')?.click()
            }
        } else if (e.code === "KeyR") {
            if (location.pathname.includes("/user/") && !location.pathname.includes("/history")) {
                document.querySelector('a[href*="/reports/new"]')?.click()
                return
            }
            if (changesetObjectsSelectionModeEnabled || e.altKey) {
                document.querySelector("#revert_button_class").click()
                return
            }
            changesetObjectsSelectionModeEnabled = true;
            document.querySelectorAll("#changeset_nodes, #changeset_ways, #changeset_relations").forEach(i => {
                i.querySelectorAll('button, input, a, textarea, select, [tabindex]').forEach(el => {
                    el.setAttribute('tabindex', '-1');
                })
            });

            ["#changeset_nodes", "#changeset_ways", "#changeset_relations"].forEach(selector => {
                document.querySelectorAll(`${selector} :not(.pagination) li`).forEach(obj => {
                    const checkbox = document.createElement("input")
                    checkbox.type = "checkbox"
                    checkbox.title = "Click with Shift for select range\nPress R for revert via osm-revert\nPress J for open objects in JOSM\nPress alt + J for open objects in Level0"
                    checkbox.tabIndex = 0
                    checkbox.style.width = "18px"
                    checkbox.style.height = "18px"
                    checkbox.style.margin = "1px"
                    checkbox.classList.add("align-bottom", "object-fit-none", "browse-icon")

                    function selectRange() {
                        let currentCheckboxFound = false
                        for (const cBox of Array.from(document.querySelectorAll(`#changeset_nodes li input[type=checkbox], #changeset_ways li input[type=checkbox], #changeset_relations li input[type=checkbox]`)).toReversed()) {
                            if (!currentCheckboxFound) {
                                if (cBox === checkbox) {
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

                    checkbox.onclick = e => {
                        e.stopPropagation()
                        e.stopImmediatePropagation()
                        if (e.shiftKey) {
                            selectRange()
                        }
                    }
                    checkbox.onkeydown = e => {
                        if (e.shiftKey && e.code === "Space") {
                            selectRange()
                        } else if (e.code === "Enter") {
                            e.target.click()
                            if (e.shiftKey) {
                                selectRange()
                            }
                        }
                    }
                    const icon = obj.querySelector("img")
                    icon.style.display = "none"
                    const label = document.createElement("label")
                    label.appendChild(checkbox)
                    label.onclick = e => {
                        e.stopPropagation()
                        e.stopImmediatePropagation()
                    }
                    icon.after(label)
                })
            })
            document.querySelector("#changeset_nodes input[type=checkbox], #changeset_ways input[type=checkbox], #changeset_relations input[type=checkbox]").focus()
        } else if (e.code === "KeyJ") {
            setTimeout(async () => {
                if (!location.pathname.includes("changeset")) {
                    const m = location.pathname.match(/\/(node|way|relation)\/([0-9]+)/)
                    if (!m) return
                    const [, type, id] = m
                    const shortType = type === "node" ? "n" : (type === "way" ? "w" : "r")
                    if (e.altKey) {
                        if (osm_server !== prod_server) {
                            alert("level0 works only with osm.org")
                            return
                        }
                        window.open("https://level0.osmz.ru/?" + new URLSearchParams({
                            url: shortType + id + "!"
                        }).toString())
                    } else {
                        if (!await validateOsmServerInJOSM()) {
                            return
                        }
                        window.open("http://localhost:8111/load_object?" + new URLSearchParams({
                            objects: [shortType + id],
                            relation_members: true,
                        }).toString())
                    }
                    return
                }

                const nodes = new Set()
                const ways = new Set()
                const relations = new Set()

                let changesetID = parseInt(location.pathname.match(/changeset\/(\d+)/)[1])
                const changesetData = (await getChangeset(changesetID)).data

                function processChangeset(data) {
                    if (changesetObjectsSelectionModeEnabled) {
                        document.querySelectorAll("#changeset_nodes input[type=checkbox]:checked").forEach(n => {
                            nodes.add(parseInt(n.parentElement.nextElementSibling.id.match(/[0-9]+n([0-9]+)/)[1]))
                        })
                        document.querySelectorAll("#changeset_ways input[type=checkbox]:checked").forEach(w => {
                            ways.add(parseInt(w.parentElement.nextElementSibling.id.match(/[0-9]+w([0-9]+)/)[1]))
                        })
                        document.querySelectorAll("#changeset_relations input[type=checkbox]:checked").forEach(r => {
                            relations.add(parseInt(r.parentElement.nextElementSibling.id.match(/[0-9]+r([0-9]+)/)[1]))
                        })
                    } else {
                        Array.from(data.querySelectorAll("node")).map(i => nodes.add(parseInt(i.getAttribute("id"))))
                        Array.from(data.querySelectorAll("way")).map(i => ways.add(parseInt(i.getAttribute("id"))))
                        Array.from(data.querySelectorAll("relation")).map(i => relations.add(parseInt(i.getAttribute("id"))))
                    }
                }

                processChangeset(changesetData)

                if (location.search.includes("changesets=")) {
                    const params = new URLSearchParams(location.search)
                    const changesetIDs = params.get("changesets")?.split(",")?.filter(i => i !== changesetID) ?? []
                    await Promise.all(changesetIDs.map(async i => {
                        if (i === changesetID) return
                        processChangeset((await getChangeset(i)).data)
                    }))
                }

                if (e.altKey) {
                    if (osm_server !== prod_server) {
                        alert("level0 works only with osm.org")
                        return
                    }
                    window.open("https://level0.osmz.ru/?" + new URLSearchParams({
                        url: [
                            Array.from(nodes).map(i => "n" + i).join(","),
                            Array.from(ways).map(i => "w" + i).join(","),
                            Array.from(relations).map(i => "r" + i).join(",")
                        ].join(",").replace(/,,/, ",").replace(/,$/, "").replace(/^,/, "")
                    }).toString())
                } else {
                    if (!await validateOsmServerInJOSM()) {
                        return
                    }
                    window.open("http://localhost:8111/load_object?" + new URLSearchParams({
                        new_layer: "true",
                        objects: [
                            Array.from(nodes).map(i => "n" + i).join(","),
                            Array.from(ways).map(i => "w" + i).join(","),
                            Array.from(relations).map(i => "r" + i).join(",")
                        ].join(",")
                    }).toString())
                }
            })
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
                    addCompactSidebarStyle();
                    document.querySelector('.nav-link[href^="/history"]')?.click()
                } else if (location.pathname.includes("/user/")) {
                    document.querySelector('a[href^="/user/"][href$="/history"]')?.click()
                }
            }
        } else if (e.code === "KeyY") {
            const [x, y, z] = getCurrentXYZ();
            window.open(`https://yandex.ru/maps/?l=stv,sta&ll=${y},${x}&z=${z}`, "_blank", "noreferrer");
        } else if (e.key === "1") {
            if (location.pathname.match(/\/(node|way|relation)\/\d+/)) {
                if (location.pathname.match(/\/(node|way|relation)\/\d+/)) {
                    getWindow().OSM.router.route(location.pathname.match(/\/(node|way|relation)\/\d+/)[0] + "/history/1")
                } else {
                    console.debug("skip 1")
                }
            } else if (location.pathname.startsWith("/changeset")) {
                const user_link = document.querySelector('#sidebar_content a[href^="/user/"]')
                if (user_link) {
                    const username = decodeURI(user_link.getAttribute("href").match(/\/user\/([^/]+)/)[1])
                    getCachedUserInfo(username).then(res => {
                        if (res["firstChangesetID"]) {
                            getWindow().OSM.router.route(`/changeset/${res["firstChangesetID"]}`)
                        } else {
                            console.warn("not found first changeset for " + username)
                        }
                    })
                }
            } else if (location.pathname.match(/\/user\/[^\\]+\/history\/?/)) {
                const user_link = document.querySelector('#sidebar_content a[href^="/user/"]')
                if (user_link) {
                    const username = decodeURI(user_link.getAttribute("href").match(/\/user\/([^/]+)/)[1])
                    getCachedUserInfo(username).then(res => {
                        if (res["firstChangesetID"]) {
                            getWindow().OSM.router.route(`${location.pathname}?after=${res["firstChangesetID"]-1}`)
                        } else {
                            console.warn("not found first changeset for " + username)
                        }
                    })
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
            if (e.shiftKey) {
                shiftKeyZClicks += 1
                document.addEventListener("mousemove", () => {
                    shiftKeyZClicks = 0
                }, {once: true})
            } else {
                shiftKeyZClicks = 0
            }
            zoomToCurrentObject(e)
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
            } else if (!e.altKey) {
                const usernameMatch = location.pathname.match(/^\/user\/([^/]+)\/?$/)
                if (usernameMatch) {
                    window.open(makeOsmchaLinkForUsername(decodeURI(usernameMatch[1])))
                } else {
                    document.querySelector("#osmcha_link")?.click()
                }
            }
        } else if (e.code === "Escape") {
            cleanObjectsByKey("activeObjects")
            document.querySelectorAll(".betterOsmContextMenu").forEach(i => i.remove())
        } else if (e.code === "KeyL" && e.shiftKey) {
            document.querySelector(".control-locate .control-button").click()
        } else if (e.code === "KeyK" && location.pathname.match(/^(\/user\/.+)?\/history\/?$/)) {
            goToPrevChangeset(e);
        } else if (e.code === "KeyL" && location.pathname.match(/^(\/user\/.+)?\/history\/?$/)) {
            goToNextChangeset(e);
        } else if (e.code === "KeyK" && location.pathname === "/search") {
            goToPrevSearchResult(e);
        } else if (e.code === "KeyL" && location.pathname === "/search") {
            goToNextSearchResult(e);
        } else if (e.code === "KeyC") {
            if (location.pathname.includes("/user/") && !location.pathname.includes("/history")) {
                if (location.pathname.includes("/diary_comments")) {
                    document.querySelector('a[href^="/user/"][href$="changeset_comments"]')?.click()
                } else {
                    document.querySelector('a[href^="/user/"][href$="_comments"]')?.click()
                }
            } else {
                const activeObject = document.querySelector("#element_versions_list > div.active-object")
                if (activeObject) {
                    if (e.shiftKey) {
                        window.open(activeObject.querySelector('a[href^="/changeset/"]').href, "_blank")
                    } else {
                        activeObject.querySelector('a[href^="/changeset/"]')?.click()
                    }
                } else {
                    const changesetsLinks = document.querySelectorAll('a[href^="/changeset/"]:not([href*="?locale="])')
                    if (e.shiftKey) {
                        if (changesetsLinks?.[0]?.href) {
                            window.open(changesetsLinks?.[0]?.href, "_blank")
                        }
                    } else {
                        changesetsLinks?.[0]?.click()
                    }
                }
            }
        } else if (e.code === "KeyQ" && !e.altKey && !e.metaKey && !e.shiftKey && !e.ctrlKey) {
            buildingViewerIframe?.remove()
            buildingViewerIframe = null
            document.querySelectorAll(".sidebar-close-controls .btn-close").forEach(i => i?.click())
            document.querySelector(".welcome .btn-close")?.click()
            document.querySelector("#banner .btn-close")?.click()
        } else if (e.code === "KeyT" && !e.altKey && !e.metaKey && !e.shiftKey && !e.ctrlKey) {
            if (location.pathname.includes("/user/") && !location.pathname.includes("/history")) {
                document.querySelector('a[href="/traces/mine"], a[href$="/traces"]:not(.nav-link):not(.dropdown-item)')?.click()
            } else {
                document.querySelector(".quick-look-compact-toggle-btn")?.click()
                document.querySelector(".compact-toggle-btn")?.click()
            }
        } else if (e.code === "KeyM" && !e.altKey && !e.metaKey && !e.ctrlKey) {
            if (e.shiftKey) {
                if (location.pathname.includes("/user/")) {
                    const username = location.pathname.match(/^\/user\/([^/]+)/)[1]
                    window.open("/messages/new/" + decodeURI(username))
                } else {
                        const username = document.querySelector("#sidebar_content a[href^='/user/']").getAttribute("href").match(/^\/user\/([^/]+)/)[1]
                    window.open("/messages/new/" + decodeURI(username))
                }
            } else if (location.pathname.includes("/user/") && !location.pathname.includes("/history")) {
                document.querySelector('a[href^="/messages/new/"]')?.click()
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
        } else if ((e.code === "Backquote" || e.code === "Quote" || e.key === "`" || e.key === "~") && !e.altKey && !e.metaKey && !e.ctrlKey) {
            if (!getWindow().mapIntercepted) return
            e.preventDefault()
            for (let member in layers) {
                layers[member].forEach((i) => {
                    if (layersHidden) {
                        i.getElement().style.visibility = ""
                    } else {
                        i.getElement().style.visibility = "hidden"
                    }
                })
            }
            if (getWindow()?.jsonLayer) {
                if (layersHidden) {
                    injectJSIntoPage(`jsonLayer.eachLayer(i => i.getElement().style.visibility = "")`)
                } else {
                    injectJSIntoPage(`jsonLayer.eachLayer(i => i.getElement().style.visibility = "hidden")`)
                }
            } else if (jsonLayer) {
                if (layersHidden) {
                    jsonLayer.eachLayer(intoPageWithFun(i => getMap()._layers[i._leaflet_id].getElement().style.visibility = ""))
                } else {
                    jsonLayer.eachLayer(intoPageWithFun(i => getMap()._layers[i._leaflet_id].getElement().style.visibility = "hidden"))
                }
            }
            layersHidden = !layersHidden;
        } else if (e.code === "KeyF" && !e.altKey && !e.metaKey && !e.ctrlKey) {
            document.querySelector("#changesets-filter-btn")?.click()
            document.querySelector("#mass-action-btn")?.click()
        } else if (isDebug() && e.code === "KeyP" && e.altKey) {
            if (location.pathname.startsWith("/changeset")) {
                const params = new URLSearchParams(location.search)
                let changesetIDs = params.get("changesets")?.split(",") ?? [parseInt(location.pathname.match(/changeset\/(\d+)/)[1])]
                const objects = []
                if (changesetIDs) {
                    setTimeout(async () => {
                        for (const i of changesetIDs) {
                            (await getChangeset(i)).data.querySelectorAll("node,way,relation").forEach(obj => {
                                objects.push(obj)
                            })
                        }
                        objects.sort((a, b) => {
                            const A = new Date(a.getAttribute("timestamp"))
                            const B = new Date(b.getAttribute("timestamp"))
                            if (A < B) return -1;
                            if (A > B) return 1;
                            return 0;
                        })
                        const nodesList = []
                        for (let object of objects) {
                            if (object.nodeName === "node" && object.getAttribute("visible") === "true") {
                                // debugger
                                // showNodeMarker(object.getAttribute("lat"), object.getAttribute("lon"), "rgb(0,34,255)", null, 'customObjects')
                                // await sleep(300)
                                nodesList.push([object.getAttribute("lat"), object.getAttribute("lon")])
                            } else if (object.nodeName === "way") {
                                // TODO
                            }
                        }
                        showActiveWay(nodesList, "#0022ff", false, null, true, 2)
                    })
                }
            }
        } else if ((e.code === "Slash" || e.code === "Backslash" || e.code === "NumpadDivide" || e.key === "/") && e.shiftKey) {
            setTimeout(async () => {
                getMap().getBounds()
                const query = prompt(`Type overpass selector:\n\tkey\n\tkey=value\n\tkey~val,i\n\tway[footway=crossing](if: length() > 150)\nEnd with ! for global search\n⚠this is a simple prototype of search`, await GM.getValue("lastOverpassQuery", ""))
                if (query) {
                    insertOverlaysStyles()
                    processOverpassQuery(query)
                }
            }, 0);
        } else if (e.altKey && e.code === "Backquote") {
            darkModeForMap = !darkModeForMap
            if (darkModeForMap) {
                injectDarkMapStyle()
            } else {
                darkMapStyleElement?.remove()
            }
        } else if (e.code === "KeyP") {
            navigator.clipboard.writeText(shortOsmOrgLinksInText(location.origin + location.pathname));
        } else if (e.code === "KeyB") {
            if (location.pathname.includes("/user/") && !location.pathname.includes("/history")) {
                document.querySelector('a[href^="/user/"][href$="/blocks"]')?.click()
            }
            //setupBuildingTools()
        } else {
            // console.log(e.key, e.code)
        }
        if (location.pathname.startsWith("/changeset") && !location.pathname.includes("/changeset_comments")) {
            if (e.code === "Comma") {
                const link = getPrevChangesetLink()
                if (link) {
                    getAbortController().abort(ABORT_ERROR_PREV)
                    needPreloadChangesets = true
                    link.focus()
                    link.click()
                }
            } else if (e.code === "Period") {
                const link = getNextChangesetLink()
                if (link) {
                    getAbortController().abort(ABORT_ERROR_NEXT)
                    needPreloadChangesets = true
                    link.focus()
                    link.click()
                }
            } else if (e.code === "KeyH") {
                const userChangesetsLink = document.querySelectorAll("div.secondary-actions")[1]?.querySelector('a[href^="/user/"]')
                if (userChangesetsLink) {
                    getAbortController().abort(ABORT_ERROR_USER_CHANGESETS)
                    userChangesetsLink.focus()
                    userChangesetsLink.click()
                }
            } else if (e.code === "KeyK") {
                goToPrevChangesetObject(e);
            } else if (e.code === "KeyL" && !e.shiftKey) {
                goToNextChangesetObject(e);
            }
        } else if (location.pathname.match(/^\/(node|way|relation)\/\d+/)) {
            if (e.code === "Comma") {
                const links = Array.from(document.querySelectorAll("#sidebar_content nav div ul a"))
                for (let i = 0; i < links.length; i++) {
                    if (links[i].parentElement.classList.contains("active")) {
                        links[i-1]?.click()
                        break
                    }
                }
            } else if (e.code === "Period") {
                const links = Array.from(document.querySelectorAll("#sidebar_content nav div ul a"))
                for (let i = 0; i < links.length; i++) {
                    if (links[i].parentElement.classList.contains("active")) {
                        links[i+1]?.click()
                        break
                    }
                }
            }
            if (location.pathname.match(/\/history$/)) {
                if (e.code === "KeyK") {
                    goToPrevObjectVersion();
                } else if (e.code === "KeyL" && !e.shiftKey) {
                    gotNextObjectVersion();
                }
            }
        } else if (location.pathname.match(/user\/.+\/(traces|diary_comments|changeset_comments)/)
            || location.pathname.match(/\/user_blocks($|\/)/)
            || location.pathname.match(/\/blocks_by$/)) {
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
        } else if (e.code === "KeyH" && location.pathname.includes("/history") && (location.search.includes("after") || location.search.includes("before"))) {
            try {
                getWindow().OSM.router.route(location.pathname)
            } catch {
                window.location = location.pathname
            }
        }
    }

    document.addEventListener('keydown', keydownHandler, false);
}

//</editor-fold>


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

/***@type {((function(string): Promise<void>|void))[]}*/
const modules = [
    setupDarkModeForMap,
    setupHDYCInProfile,
    setupBetterProfileStat,
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
    setupNavigationViaHotkeys,
    setupClickableAvatar,
    setupOverzoomForDataLayer,
    setupDragAndDropViewers
];

const alwaysEnabledModules = [
    setupRelationVersionViewer,
    setupMakeVersionPageBetter,
    setupNotesFiltersButtons,
    setupMeasurer
]

const fetchJSONWithCache = (() => {
    /**@type {Map<string, Object | Promise<Object>>}*/
    const cache = new Map();

    return async (url, init = {}, responseChecker = (_) => true) => {
        if (cache.has(url)) {
            return cache.get(url);
        }

        const promise = fetch(url, init).then((res) => {
            if (!res) console.trace()
            if (responseChecker(res)) {
                return res.json()
            }
        });
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
    if (!GM_config.get("BetterTaginfo")) return;

    const instance_text = document.querySelector("#instance")?.textContent;
    const instance = instance_text?.replace(/ \(.*\)/, "")

    if (instance_text?.includes(" ")) {
        const turboLink = document.querySelector("#turbo_button:not(.fixed-link)")
        if (turboLink && (turboLink.href.includes("%22+in") || turboLink.href.includes("*+in") || turboLink.href.includes("relation+in"))) {
            turboLink.href = turboLink.href.replace(/(%22|\*|relation)\+in\+(.*)&/, `$1+in+"${instance}"&`)
            turboLink.classList?.add("fixed-link")
        }
    }

    function escapeTaginfoString(s) {
        return s.replaceAll("\\", "\\\\").replaceAll('"', '\\"').replaceAll("␣", " ")
    }

    if (location.pathname.match(/reports\/key_lengths$/)) {
        document.querySelectorAll(".dt-body[data-col='1']").forEach(i => {
            if (i.querySelector(".overpass-link")) return
            const overpassLink = document.createElement("a")
            overpassLink.classList.add("overpass-link")
            overpassLink.textContent = "🔍"
            overpassLink.target = "_blank"
            const count = parseInt(i.nextElementSibling.querySelector(".value").textContent.replace(/\s/g, ''))
            const key = i.querySelector(".empty") ? "" : escapeTaginfoString(i.querySelector("a").textContent)
            overpassLink.href = `${overpass_server.url}?` + (count > 100000
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
            const role = i.querySelector(".empty") ? "" : escapeTaginfoString(i.textContent)
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
                        overpassLink.href = `${overpass_server.url}?` + (count > 1000
                            ? new URLSearchParams({Q: query})
                            : new URLSearchParams({Q: query, R: ""})).toString()
                        overpassLink.style.cursor = "pointer"
                    } else {
                        overpassLink.remove()
                    }
                })
            } else {
                const query = `rel[type=${type}](if:count_by_role("${role}") > 0)${count > 1000 ? "({{bbox}})" : ""};\nout geom;`
                overpassLink.href = `${overpass_server.url}?` + (count > 1000
                    ? new URLSearchParams({Q: query})
                    : new URLSearchParams({Q: query, R: ""})).toString()
                overpassLink.style.cursor = "pointer"
            }
            i.prepend(document.createTextNode("\xA0"))
            i.prepend(overpassLink)
        })
    } else if (location.hash === "#values") {
        const key = escapeTaginfoString(document.querySelector("h1").textContent)
        document.querySelectorAll("#values .dt-body[data-col='0']").forEach(i => {
            if (i.querySelector(".overpass-link")) return
            const overpassLink = document.createElement("a")
            overpassLink.classList.add("overpass-link")
            overpassLink.textContent = "🔍"
            overpassLink.target = "_blank"
            const count = parseInt(i.nextElementSibling.querySelector(".value").textContent.replace(/\s/g, ''))
            const value = i.querySelector(".empty") ? "" : escapeTaginfoString(i.querySelector("a").textContent)
            overpassLink.href = `${overpass_server.url}?` + (count > 10000
                ? new URLSearchParams({
                        w: instance ? `"${key}"="${value}" in "${instance}"` : `"${key}"="${value}"`
                    }
                ).toString()
                : new URLSearchParams({
                    w: instance ? `"${key}"="${value}" in "${instance}"` : `"${key}"="${value}" global`,
                    R: ""
                }).toString())
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
        const marker = showNodeMarker(lat, lon, "rgb(255,0,47)", null, 'customObjects', 3);
        const name = wpt.querySelector("name")
        const desc = wpt.querySelector("desc")
        if (name || desc) {
            const popup = document.createElement("span")
            if (name) {
                popup.textContent = name.textContent
            }
            if (desc) {
                popup.appendChild(document.createElement("br"))
                popup.appendChild(document.createTextNode(desc.textContent))
            }
            marker.bindTooltip(popup.outerHTML)
            marker.bindPopup(popup.outerHTML)
        }

        trackMetadata.min_lat = min(trackMetadata.min_lat, lat);
        trackMetadata.min_lon = min(trackMetadata.min_lon, lon);
        trackMetadata.max_lat = max(trackMetadata.max_lat, lat);
        trackMetadata.max_lon = max(trackMetadata.max_lon, lon);
    });
    console.timeEnd("start gpx track render")
}


function renderGeoJSONwrapper(geojson) {
    injectJSIntoPage(`
    var jsonLayer = null;

    function renderGeoJSON(data) {
        function onEachFeature(feature, layer) {
            if (feature.properties) {
                const table = document.createElement("table")
                table.style.overflow = "scroll"
                table.classList.add("geojson-props-table")
                table.classList.add("zebra_colors")
                const tbody = document.createElement("tbody")
                table.appendChild(tbody)
                Object.entries(feature.properties).forEach(([key, value]) => {
                    if (Array.isArray(value) && value.length === 0) {
                        value = "[]"
                    } else if (value === null) {
                        value = "null"
                    } else if (typeof value === 'object' && Object.entries(value).length === 0) {
                        value = "{}"
                    }
                    const th = document.createElement("th")
                    th.textContent = key
                    const td = document.createElement("td")
                    if (key === "id" && typeof value(value.startsWith("node/") || value.startsWith("way/") || value.startsWith("relation/"))) {
                        const a = document.createElement("a")
                        a.textContent = value
                        a.href = "/" + value
                        td.appendChild(a)
                    } else {
                        td.textContent = value
                    }

                    const tr = document.createElement("tr")
                    tr.appendChild(th)
                    tr.appendChild(td)
                    tbody.appendChild(tr)
                })
                layer.on("click", e => {
                    if (e.originalEvent.altKey) {
                        layer.remove()
                        e.originalEvent.stopPropagation()
                        e.originalEvent.stopImmediatePropagation()
                    }
                })
                layer.bindPopup(table.outerHTML)
            }
        }

        jsonLayer = L.geoJSON(data, {
            onEachFeature: onEachFeature
        });
        jsonLayer.addTo(map);
    }
    `)
    getWindow().renderGeoJSON(intoPage(geojson))
}

var jsonLayer = null;
let bannedVersions = null

function currentVersionBanned(module) {
    if (!bannedVersions) return false;
    if (bannedVersions[GM_info.script.version]) {
        if (bannedVersions[GM_info.script.version][module]) {
            return bannedVersions[GM_info.script.version][module]
        }
    }
    return false
}

function insertOverlaysStyles() {
    const mapWidth = getComputedStyle(document.querySelector("#map")).width
    const mapHeight = getComputedStyle(document.querySelector("#map")).height

    injectCSSIntoOSMPage(`
            .leaflet-popup-content, .leaflet-tooltip {
                white-space: pre;
            }
            
            .leaflet-popup-content:has(.geojson-props-table) {
                overflow: scroll;
            }

            .leaflet-popup-content:has(.geojson-editor) {
                    /*max-width: calc(${mapWidth} / 3) !important;
                        min-width: calc(${mapWidth} / 3) !important;
                        max-height: calc(${mapHeight} / 2);
                        min-height: calc(${mapHeight} / 2);*/
                overflow-y: scroll;
                font-size: larger;
            }

            .geojson-editor {
                margin-left: 5px;
            }

            table.tags-table {
                margin-top: 5px;
                margin-left: 5px;
            }

            table.metainfo-table {
                margin-top: 5px;
                margin-left: 5px;
            }

            table.tags-table th:not(.tag-flag) {
                border: solid 2px transparent;
                min-width: 50px;
            }

            table.tags-table td:not(.tag-flag) {
                border: solid 2px transparent;
                min-width: 150px;
            }

            table.editable.tags-table th:not(.tag-flag) {
                border: solid 2px black;
                min-width: 50px;
            }

            table.editable.tags-table td:not(.tag-flag) {
                border: solid 2px black;
                min-width: 150px;
            }

            table:not(.editable).tags-table tr.add-tag-row {
                display: none;
                min-width: 150px;
            }

            table.editable.tags-table tr.add-tag-row th {
                text-align: center;
                cursor: pointer;
                min-width: 294px;
                resize: both !important;
            }

            table.tags-table textarea {
                min-width: 280px;
            }

            .mode-btn:not(.visible) {
                display: none;
            }

            .map-img-preview-popup {
                width: initial;
            }

            .zebra_colors tr:nth-child(even) td, .zebra_colors tr:nth-child(even) th {
                background-color: color-mix(in srgb, var(--bs-body-bg), black 10%);
            }

            @media ${mediaQueryForWebsiteTheme} {

                .mode-btn.visible img {
                    filter: invert(0.9);
                }

                .zebra_colors tr:nth-child(even) td, .zebra_colors tr:nth-child(even) th {
                    background-color: color-mix(in srgb, var(--bs-body-bg), white 7%);
                }

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
        `
    );

}

// todo inline
const rawEditIcon = "https://raw.githubusercontent.com/openstreetmap/iD/671e9f00699c3b2602b82b291c5cd776445032aa/svg/fontawesome/fas-i-cursor.svg";
const tableEditIcon = "https://raw.githubusercontent.com/openstreetmap/iD/671e9f00699c3b2602b82b291c5cd776445032aa/svg/fontawesome/fas-th-list.svg";

// const lastVersionsCache = {}

function loadBannedVersions() {
    GM.xmlHttpRequest({
        url: "https://raw.githubusercontent.com/deevroman/better-osm-org/refs/heads/master/banned_versions.json",
        responseType: "json"
    }).then(async res => {
        bannedVersions = await res.response
    })
}

function preloadEditIcons() {
    GM_addElement("img", {
        src: rawEditIcon,
        height: "14px",
        width: "14px"
    })
    GM_addElement("img", {
        src: tableEditIcon,
        height: "14px",
        width: "14px"
    })
}

let osmEditAuth = null;

function renderOSMGeoJSON(xml, options = {}) {
    if (osmEditAuth === null) {
        osmEditAuth = makeAuth();
    }
    /**
     * @param {Object.<string, string>} tags
     * @return {HTMLTableSectionElement}
     */
    function makeTBody(tags) {
        const tbody = document.createElement("tbody")
        Object.entries(tags).forEach(([key, value]) => {
            const th = document.createElement("th")
            th.textContent = key
            const td = document.createElement("td")
            td.textContent = value
            const tr = document.createElement("tr")
            th.tabIndex = 0
            td.tabIndex = 0
            tr.appendChild(th)
            tr.appendChild(td)
            tbody.appendChild(tr)
        })
        const tr = document.createElement("tr")
        tr.classList.add("add-tag-row")
        const th = document.createElement("th")
        th.textContent = "+"
        th.colSpan = 2
        th.tabIndex = 0
        th.setAttribute("contenteditable", false)
        tr.appendChild(th)
        th.onclick = () => {
            tbody.lastElementChild.before(makeRow("", "", true))
        }
        tbody.appendChild(tr)
        return tbody
    }

    function makePopupHTML(feature) {
        // debugger
        // const cachedObjectInfo = lastVersionsCache[`${feature.type}_${feature.id}`]
        // if (cachedObjectInfo && feature.properties.meta.version
        //     && parseInt(cachedObjectInfo.querySelector("node,way,relation").getAttribute("version")) > feature.properties.meta.version) {
        //     feature.properties.tags = {}
        //     lastVersionsCache[`${feature.type}_${feature.id}`].querySelectorAll("tag").forEach(i => {
        //         feature.properties.tags[i.getAttribute("k")] = i.getAttribute("v")
        //     })
        //     feature.properties.meta = {}
        //     Array.from(cachedObjectInfo.querySelector("node,way,relation").attributes).map(i => [i.name, i.value]).forEach(([key, value]) => {
        //         if (key === "visible" || key === "nodes" || key === "members" || key === "id") return
        //         feature.properties.meta[key] = value
        //     })
        // }

        const popupBody = document.createElement("span")
        popupBody.classList.add("geojson-editor")

        const objLink = document.createElement("a")
        objLink.textContent = feature.properties.type + "/" + feature.properties.id
        objLink.href = "/" + feature.properties.type + "/" + feature.properties.id
        popupBody.appendChild(objLink)

        popupBody.appendChild(document.createTextNode(", "))

        const versionLink = document.createElement("a")
        versionLink.classList.add("version-link")
        versionLink.textContent = feature.properties.meta.version ? ("v" + feature.properties.meta.version) : ""
        versionLink.href = "/" + feature.type + "/" + feature.id + "history/" + feature.properties.meta.version
        popupBody.appendChild(versionLink)

        const editButton = document.createElement("button")
        editButton.id = feature.properties.type + "-" + feature.properties.id + "-" + feature.properties.meta.version
        editButton.classList.add("edit-tags-btn")
        editButton.textContent = "🖊"

        popupBody.appendChild(document.createTextNode("\xA0"))
        popupBody.appendChild(editButton)

        const modeBtn = document.createElement("button")
        modeBtn.classList.add("mode-btn")
        modeBtn.title = "Switch between table and raw editor"

        popupBody.appendChild(document.createTextNode("\xA0"))
        popupBody.appendChild(modeBtn)

        const table = document.createElement("table")
        popupBody.appendChild(table)
        table.style.overflow = "scroll"
        table.classList.add("geojson-props-table")
        table.classList.add("zebra_colors")
        table.classList.add("tags-table")

        const details = document.createElement("details")
        details.style.color = "gray"

        const summary = document.createElement("summary")
        summary.textContent = "metainfo"
        details.appendChild(summary)
        popupBody.appendChild(details)

        const metaTable = document.createElement("table")
        details.appendChild(metaTable)
        metaTable.style.overflow = "scroll"
        metaTable.classList.add("geojson-props-table")
        metaTable.classList.add("zebra_colors")
        metaTable.classList.add("metainfo-table")

        const metaTBody = document.createElement("tbody")
        metaTable.appendChild(metaTBody)
        Object.entries(feature.properties?.meta).forEach(([key, value]) => {
            const th = document.createElement("th")
            th.textContent = key
            const td = document.createElement("td")
            if (key === "id" && typeof value === "string" && (value.startsWith("node/") || value.startsWith("way/") || value.startsWith("relation/"))) {
                const a = document.createElement("a")
                a.textContent = value
                a.href = "/" + value
                td.appendChild(a)
            } else {
                td.textContent = value
            }

            const tr = document.createElement("tr")
            tr.appendChild(th)
            tr.appendChild(td)
            metaTBody.appendChild(tr)
        })

        return popupBody
    }

    function onEachFeature(feature, layer) {
        if (!feature.properties) {
            return;
        }

        getWindow().L.DomEvent.on(layer, "click", intoPageWithFun((e) => {
            const layer = getMap()._layers[e.target._leaflet_id]
            if (e.originalEvent.altKey) {
                layer.remove()
                e.originalEvent.stopPropagation()
                e.originalEvent.stopImmediatePropagation()
            } else {
                if (!layer.getPopup()) {
                    layer.bindPopup(makePopupHTML(feature).outerHTML, intoPage({minWidth: 300})).openPopup()
                }
            }
        }))

        const startEdit = intoPageWithFun(async startEditEvent => {
            let lastEditMode = await GM.getValue("lastEditMode", "table")

            const table = startEditEvent.target.parentElement.querySelector("table.tags-table")
            const metaTable = startEditEvent.target.parentElement.querySelector("table.metainfo-table")
            /** @type {Object.<string, string>}*/
            let oldTags = {}
            if (lastEditMode === "table") {
                table.querySelectorAll("tr:not(.add-tag-row)").forEach(i => {
                    oldTags[i.querySelector("th").textContent] = i.querySelector("td").textContent
                })
            } else {
                oldTags = buildTags(table.querySelector("textarea").value)
            }

            const modeBtn = startEditEvent.target.parentElement.querySelector(".mode-btn")
            modeBtn.classList.add("visible")

            const tableModeBtnImg = GM_addElement("img", {
                src: tableEditIcon,
                height: "14px",
                width: "14px"
            })
            tableModeBtnImg.style.marginTop = "-3px"
            const rawModeBtnImg = GM_addElement("img", {
                src: rawEditIcon,
                height: "14px",
                width: "14px"
            })
            rawModeBtnImg.style.marginTop = "-3px"

            if (lastEditMode === "table") {
                modeBtn.appendChild(rawModeBtnImg)
            } else {
                modeBtn.appendChild(tableModeBtnImg)
                const textarea = table.querySelector("textarea")
                textarea.setAttribute("disabled", "true")
                textarea.value = ""
                textarea.rows = 5
                Object.entries(feature.properties?.tags).forEach(([k, v]) => {
                    textarea.value += `${k}=${v.replaceAll('\\\\', '\n')}\n`
                })
                textarea.value = textarea.value.trim()
                table.appendChild(textarea)
            }

            modeBtn.onclick = async (e) => {
                e.stopPropagation()
                modeBtn.querySelector("img").remove()
                if (lastEditMode === "table") {
                    modeBtn.appendChild(tableModeBtnImg)
                    lastEditMode = "raw"
                    await GM.setValue("lastEditMode", lastEditMode)

                    table.appendChild(makeTextareaFromTagsTable(table))
                    table.querySelector("tbody")?.remove()
                } else {
                    modeBtn.appendChild(rawModeBtnImg)
                    lastEditMode = "table"
                    await GM.setValue("lastEditMode", lastEditMode)

                    table.appendChild(makeTBody(buildTags(table.querySelector("textarea").value)))
                    table.querySelectorAll("tr:not(.add-tag-row)").forEach(i => {
                        i.querySelector("th").setAttribute("contenteditable", true)
                        i.querySelector("td").setAttribute("contenteditable", true)
                    })
                    table.querySelector("textarea")?.remove()
                }
            }

            const object_type = feature.properties.type
            const object_id = parseInt(feature.properties.id)
            let object_version = parseInt(feature.properties.meta.version)

            async function syncTags() {
                const rawObjectInfo = (await (await osmEditAuth.fetch(osm_server.apiBase + object_type + '/' + object_id, {
                    method: 'GET',
                    prefix: false,
                })).text());
                const objectInfo = (new DOMParser()).parseFromString(rawObjectInfo, "text/xml")
                // lastVersionsCache[`${object_type}_${object_id}`] = objectInfo
                const lastTags = {}
                objectInfo.querySelectorAll("tag").forEach(i => {
                    lastTags[i.getAttribute("k")] = i.getAttribute("v")
                })
                const new_object_version = parseInt(objectInfo.querySelector("[version]:not(osm)").getAttribute("version"))
                if (JSON.stringify(lastTags) !== JSON.stringify(oldTags) || object_version && object_version + 1 !== new_object_version) {
                    console.log("applying new tags")
                    if (lastEditMode === "table") {
                        table.querySelector("tbody").remove()
                        table.appendChild(makeTBody(lastTags))
                    } else {
                        table.querySelector("textarea")?.remove()
                        const textarea = document.createElement("textarea")
                        textarea.value = ""
                        textarea.rows = 5
                        Object.entries(lastTags).forEach(([k, v]) => {
                            textarea.value += `${k}=${v.replaceAll('\\\\', '\n')}\n`
                        })
                        textarea.value = textarea.value.trim()
                        table.appendChild(textarea)
                    }
                }
                object_version = new_object_version
                startEditEvent.target.parentElement.querySelector(".version-link").textContent = (object_version ? "v" + object_version : "")
                startEditEvent.target.parentElement.querySelector(".version-link").href = `/${object_type}/${object_id}/history/${object_version}`

                metaTable.querySelector("tbody")?.remove()

                const metaTBody = document.createElement("tbody")
                metaTable.appendChild(metaTBody)
                Array.from(objectInfo.querySelector("node,way,relation").attributes).map(i => [i.name, i.value]).forEach(([key, value]) => {
                    if (key === "visible" || key === "nodes" || key === "members" || key === "id") return
                    const th = document.createElement("th")
                    th.textContent = key
                    const td = document.createElement("td")
                    td.textContent = value

                    const tr = document.createElement("tr")
                    tr.appendChild(th)
                    tr.appendChild(td)
                    metaTBody.appendChild(tr)
                })
            }

            await syncTags()

            table.classList.add("editable")
            table.querySelectorAll("tr:not(.add-tag-row)").forEach(i => {
                i.querySelector("th").setAttribute("contenteditable", true)
                i.querySelector("td").setAttribute("contenteditable", true)
            })
            table.querySelector("textarea")?.removeAttribute("disabled")
            table.addEventListener("input", () => {
                startEditEvent.target.removeAttribute("disabled")
            })
            startEditEvent.target.textContent = "📤"
            startEditEvent.target.setAttribute("disabled", true)
            startEditEvent.target.addEventListener("click", async function upload() {
                startEditEvent.target.style.cursor = "progress"
                /** @type {Object.<string, string>}*/
                let newTags = {}
                const lastEditMode = await GM.getValue("lastEditMode", "table")
                if (lastEditMode === "table") {
                    table.querySelectorAll("tr:not(.add-tag-row)").forEach(i => {
                        const key = i.querySelector("th").textContent.trim()
                        const value = i.querySelector("td").textContent.trim()
                        if (key === "" || value === "") { // todo notify about error
                            return;
                        }
                        newTags[key] = value
                    })
                } else {
                    newTags = buildTags(table.querySelector("textarea").value)
                }

                console.log("Opening changeset");
                const rawObjectInfo = (await (await osmEditAuth.fetch(osm_server.apiBase + object_type + '/' + object_id, {
                    method: 'GET',
                    prefix: false,
                })).text());
                const objectInfo = (new DOMParser()).parseFromString(rawObjectInfo, "text/xml")
                const lastVersion = parseInt(objectInfo.querySelector("[version]:not(osm)").getAttribute("version"))
                if (lastVersion !== object_version) {
                    startEditEvent.target.textContent = "🔄"
                    alert("Conflict")
                    throw ""
                }

                const objectXML = objectInfo.querySelector("node,way,relation")
                const prevTags = {}
                objectXML.querySelectorAll("tag").forEach(i => {
                    prevTags[i.getAttribute("k")] = i.getAttribute("v")
                    i.remove()
                })
                Object.entries(newTags).forEach(([k, v]) => {
                    const tag = objectInfo.createElement("tag")
                    tag.setAttribute("k", k)
                    tag.setAttribute("v", v)
                    objectXML.appendChild(tag)
                })

                function makeComment(object_type, object_id, prevTags, newTags) {
                    const removedKeys = Object.entries(prevTags).map(([k,]) => k).filter(k => newTags[k] === undefined)
                    const addedKeys = Object.entries(newTags).map(([k,]) => k).filter(k => prevTags[k] === undefined)
                    const modifiedKeys = Object.entries(prevTags).filter(([k, v]) => newTags[k] !== undefined && newTags[k] !== v).map(([k,]) => k)

                    let tagsHint = ""
                    if (addedKeys.length) {
                        tagsHint += "Add " + addedKeys.map(k => `${k}=${newTags[k]}`).join(", ") + "; "
                    }

                    if (modifiedKeys.length) {
                        tagsHint += "Changed " + modifiedKeys.map(k => `${k}=${prevTags[k]}\u200b→\u200b${newTags[k]}`).join(", ") + "; "
                    }

                    if (removedKeys.length) {
                        tagsHint += "Removed " + removedKeys.map(k => `${k}=${prevTags[k]}`).join(", ") + "; "
                    }

                    if (tagsHint.length > 200 || modifiedKeys.length > 1) {
                        tagsHint = ""
                        if (addedKeys.length) {
                            tagsHint += "Add " + addedKeys.join(", ") + "; "
                        }

                        if (modifiedKeys.length) {
                            tagsHint += "Changed " + modifiedKeys.join(", ") + "; "
                        }

                        if (removedKeys.length) {
                            tagsHint += "Removed " + removedKeys.join(", ") + "; "
                        }
                    }

                    tagsHint = tagsHint.match(/(.*); /)[1]

                    let mainTagsHint = ""

                    for (const i of Object.entries(prevTags)) {
                        if (mainTags.includes(i[0]) && !removedKeys.includes(i[0]) && !modifiedKeys.includes(i[0])) {
                            mainTagsHint += ` ${i[0]}=${i[1]}`;
                            break
                        }
                    }
                    for (const i of Object.entries(prevTags)) {
                        if (i[0] === "name" && !removedKeys.includes("name") && !modifiedKeys.includes("name")) {
                            mainTagsHint += ` ${i[0]}=${i[1]}`;
                            break
                        }
                    }

                    if (mainTagsHint !== "") {
                        if (removedKeys.length) {
                            tagsHint += " from" + mainTagsHint
                        } else if (modifiedKeys.length) {
                            tagsHint += " of" + mainTagsHint
                        } else if (addedKeys.length) {
                            tagsHint += " to" + mainTagsHint
                        }
                    } else {
                        tagsHint += ` for ${object_type} ${object_id}`
                    }

                    return tagsHint !== "" ? tagsHint.slice(0, 255) : `Update tags of ${object_type} ${object_id}`
                }

                const changesetTags = {
                    'created_by': `better osm.org v${GM_info.script.version}`,
                    'comment': makeComment(object_type, object_id, prevTags, newTags)
                };

                let changesetPayload = document.implementation.createDocument(null, 'osm');
                let cs = changesetPayload.createElement('changeset');
                changesetPayload.documentElement.appendChild(cs);
                tagsToXml(changesetPayload, cs, changesetTags);
                const chPayloadStr = new XMLSerializer().serializeToString(changesetPayload);

                const changesetId = await osmEditAuth.fetch(osm_server.apiBase + 'changeset/create', {
                    method: 'PUT',
                    prefix: false,
                    body: chPayloadStr
                }).then((res) => {
                    if (res.ok) return res.text();
                    throw new Error(res);
                });
                console.log(changesetId);


                try {
                    objectInfo.children[0].children[0].setAttribute('changeset', changesetId);

                    const objectInfoStr = new XMLSerializer().serializeToString(objectInfo).replace(/xmlns="[^"]+"/, '')
                    console.log(objectInfoStr);
                    await osmEditAuth.fetch(osm_server.apiBase + object_type + '/' + object_id, {
                        method: 'PUT',
                        prefix: false,
                        body: objectInfoStr
                    }).then(async (res) => {
                        const text = await res.text()
                        if (res.ok) return text;
                        alert(text)
                        throw new Error(text);
                    });
                } finally {
                    startEditEvent.target.style.cursor = ""
                    await osmEditAuth.fetch(osm_server.apiBase + 'changeset/' + changesetId + '/close', {
                        method: 'PUT',
                        prefix: false
                    });
                }

                startEditEvent.target.textContent = "#" + changesetId
                startEditEvent.target.style.color = "green"

                startEditEvent.target.onclick = () => {
                    window.open("/changeset/" + changesetId, "_blank")
                }

                table.addEventListener("input", () => {
                    startEditEvent.target.removeAttribute("disabled")
                    startEditEvent.target.textContent = "📤"
                    startEditEvent.target.onclick = null
                }, {once: true})

                oldTags = {}
                objectInfo.querySelectorAll("tag").forEach(i => {
                    oldTags[i.getAttribute("k")] = i.getAttribute("v")
                })
                await syncTags()

                console.log(objectInfo);

            }, {once: true})
            table.addEventListener('keydown', (e) => {
                if (e.code === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault()
                    const tr = document.createElement("tr")
                    const th = document.createElement("th")
                    const td = document.createElement("td")
                    tr.appendChild(th)
                    tr.appendChild(td)
                    tr.style.height = "1rem"
                    tr.tabIndex = 0
                    e.target.after(tr)
                    tr.focus()
                }
            }, false);
        })
        getWindow().L.DomEvent.on(layer, "popupopen", intoPageWithFun(async (openEvent) => {
            const layer = getMap()._layers[openEvent.target._leaflet_id]
            const editButton = layer.getPopup().getElement().querySelector(".edit-tags-btn")
            if (currentVersionBanned("overpass_tags_editor")) {
                editButton.classList.add("banned-feature")
                editButton.textContent = "Need update better-osm-org"
                editButton.title = "Please click for update better-osm-org script.\nThe current version contains a bug that may corrupt OSM data."
                editButton.addEventListener("click", intoPageWithFun(() => {
                    window.open(SCRIPT_UPDATE_URL, "_blank")
                }), intoPage({once: true}))
            } else {
                editButton.addEventListener("click", startEdit, intoPage({once: true}))

                if (await GM.getValue("lastEditMode", "table") === "raw") {
                    const textarea = document.createElement("textarea")
                    textarea.setAttribute("disabled", "true")
                    Object.entries(feature.properties?.tags).forEach(([k, v]) => {
                        if (k === "" && v === "") return
                        textarea.value += `${k}=${v.replaceAll('\\\\', '\n')}\n`
                    })
                    textarea.value = textarea.value.trim()
                    textarea.rows = 5
                    layer.getPopup().getElement().querySelector(".tags-table").appendChild(textarea)
                } else {
                    layer.getPopup().getElement().querySelector(".tags-table").appendChild(makeTBody(feature.properties?.tags))
                }
            }
        }, intoPage({once: true})))
    }
    xml.querySelectorAll("[action=delete]").forEach(i => i.remove())
    const geojson = osmtogeojson(xml, {flatProperties: false})
    if (options['skip_tainted']) {
        geojson.features = geojson.features.filter(f => !f.properties['tainted'])
    }
    const pointOptions = intoPage(options['point_options'] ?? {})
    const jsonLayer = getWindow().L.geoJSON(intoPage(geojson), intoPageWithFun({
            style: options['style'],
            onEachFeature: intoPageWithFun(onEachFeature),
            pointToLayer: intoPageWithFun(function (feature, latlng) {
                return getWindow().L.circleMarker(latlng, pointOptions);
            })
        })
    );
    jsonLayer.addTo(getMap());
    return jsonLayer
}

async function setupDragAndDropViewers() {
    // GM_addElement(document.head, "link", {
    //     href: "https://unpkg.com/maplibre-gl@latest/dist/maplibre-gl.css",
    //     rel:'stylesheet'
    // })
    // GM_addElement(document.head, "script", {
    //     src: "https://unpkg.com/maplibre-gl@latest/dist/maplibre-gl.js",
    // })
    // GM_addElement(document.head, "script", {
    //     src: "https://unpkg.com/@maplibre/maplibre-gl-leaflet/leaflet-maplibre-gl.js",
    // })

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
            insertOverlaysStyles();
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
                        renderGeoJSONwrapper(geojson)
                    } else if (file.type === "application/gpx+xml") {
                        displayGPXTrack(await file.text())
                    } else if (file.type === "application/vnd.openstreetmap.data+xml") {
                        const doc = (new DOMParser()).parseFromString(await file.text(), "application/xml");
                        loadBannedVersions();
                        preloadEditIcons();
                        jsonLayer = renderOSMGeoJSON(doc, true)
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
        const contentType = res.responseHeaders.split("\r\n").find(i => i.toLowerCase().startsWith("content-type:")).split(" ")[1]
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

    // todo refactor
    const createNoteButton = document.querySelector(".control-note.leaflet-control a")
    if (createNoteButton && !createNoteButton.getAttribute("data-bs-original-title").includes(" (shift + N)")) {
        createNoteButton.setAttribute("data-bs-original-title", createNoteButton.getAttribute("data-bs-original-title") + " (shift + N)")
    }

}

//<editor-fold desc="measurer" defaultstate="collapsed">

let measurerAdded = false
let measuring = false

function makeEmptyMeasuring() {
    return {
        way: [],
        nodes: [],
        wayLine: null,
        tempLine: null,
    }
}

let currentMeasuring = makeEmptyMeasuring()

let lastLatLng = null
let movingTooltip = null

function getMeasureDistance(way, floatingCoord) {
    const [res,] = way.reduce(([dist, prev], cur) => {
        if (prev === null) {
            return [0.0, cur]
        }
        return [dist + getDistanceFromLatLonInKm(
            prev.lat,
            prev.lng,
            cur.lat,
            cur.lng
        ), cur]
    }, [0.0, null])
    return (Math.round((res + getDistanceFromLatLonInKm(
        way[way.length - 1].lat,
        way[way.length - 1].lng,
        floatingCoord.lat,
        floatingCoord.lng
    )) * 100000) / 100.0)
}

function formatMeasureDistance(distInMeters) {
    return distInMeters < 2500 ? distInMeters.toString() + "m" : (Math.round(distInMeters) / 1000).toString() + "km"
}

let measuringMouseDownHandler = null;
let measuringMouseUpHandler = null;
let measuringMouseMoveHandler = null;
let measuringMenuItem = null;

function endMeasuring() {
    document.querySelector("#map").style.cursor = "drag"
    measuringMenuItem.textContent = "Measure from here"
    measuring = false

    getMap().off('mousedown', measuringMouseDownHandler)
    getMap().off('mouseup', measuringMouseUpHandler)
    getMap().off('mousemove', measuringMouseMoveHandler)
    movingTooltip?.remove()
    const lastNode = currentMeasuring.nodes[currentMeasuring.nodes.length - 1]
    const distInMeters = getMeasureDistance(currentMeasuring.way, lastNode.getLatLng())
    const text = formatMeasureDistance(distInMeters)
    currentMeasuring.nodes[currentMeasuring.nodes.length - 1].bindTooltip(text, intoPage({
        content: text,
        sticky: true,
        permanent: true,
        offset: getWindow().L.point(10, 0),
    })).openTooltip()
    currentMeasuring.tempLine?.remove()
    currentMeasuring = makeEmptyMeasuring()
}

async function setupMeasurer() {
    await sleep(100)
    if (measurerAdded) return
    measurerAdded = true
    const contextMenu = document.querySelector("#map .leaflet-contextmenu")
    if (!contextMenu) {
        return;
    }
    if (!getMap || !getMap().contextmenu) {
        await sleep(1000)
    }
    // sometime click don't fire when move 1px
    let lastMouseDownX = 0;
    let lastMouseDownY = 0;
    measuringMouseDownHandler = intoPageWithFun(e => {
        lastMouseDownX = e.originalEvent.clientX;
        lastMouseDownY = e.originalEvent.clientY;
    })
    measuringMouseUpHandler = intoPageWithFun(e => {
        if (!measuring) {
            return
        }
        if (e.originalEvent.button === 2) {
            return
        }
        if (e.originalEvent.altKey) {
            currentMeasuring = makeEmptyMeasuring()
        }
        const {lat: lat, lng: lng} = e.latlng
        if (lastMouseDownX - e.originalEvent.clientX > 1 || lastMouseDownY - e.originalEvent.clientY > 1 ||
            lastMouseDownX - e.originalEvent.clientX < -1 || lastMouseDownY - e.originalEvent.clientY < -1) {
            console.log("skipped click");
            console.log(lastMouseDownX - e.originalEvent.clientX);
            console.log(lastMouseDownY - e.originalEvent.clientY);
            return
        }
        currentMeasuring.way.push({lat: lat, lng: lng})
        currentMeasuring.nodes.push(showNodeMarker(lat, lng, "#000000"))
        currentMeasuring.wayLine?.remove()

        const distInMeters = getMeasureDistance(currentMeasuring.way, {lat: lat, lng: lng})
        const text = formatMeasureDistance(distInMeters)
        currentMeasuring.wayLine = displayWay(currentMeasuring.way, false, "#000000", 1)
        movingTooltip?.remove()
        movingTooltip = getWindow().L.tooltip(getWindow().L.latLng(intoPage({lat: lat, lng: lng})), intoPage({
            content: text,
            sticky: true,
            offset: getWindow().L.point(10, 0),
        })).addTo(getMap())
        currentMeasuring.wayLine.bindTooltip(text, intoPage({
            content: text,
            sticky: true,
            offset: getWindow().L.point(10, 0),
        })).openTooltip()
    })
    measuringMouseMoveHandler = intoPageWithFun(e => {
        if (!measuring) {
            return
        }
        lastLatLng = e.latlng
        const {lat: lat, lng: lng} = e.latlng
        currentMeasuring.tempLine?.remove()
        if (!currentMeasuring.way.length) return
        const distInMeters = getMeasureDistance(currentMeasuring.way, {lat: lat, lng: lng})
        const text = formatMeasureDistance(distInMeters)
        if (!e.originalEvent.altKey) {
            cleanObjectsByKey("activeObjects")
            currentMeasuring.tempLine = displayWay([currentMeasuring.way[currentMeasuring.way.length - 1], {
                lat: lat,
                lng: lng
            }], false, "#000000", 1);
            movingTooltip?.remove()
            movingTooltip = getWindow().L.tooltip(getWindow().L.latLng(intoPage({lat: lat, lng: lng})), intoPage({
                content: text,
                sticky: true,
                offset: getWindow().L.point(10, 0),
            })).addTo(getMap())
        } else {
            showActiveNodeMarker(e.latlng.lat, e.latlng.lng, "#000000")
        }
    })

    getMap().contextmenu.addItem(intoPageWithFun({
        separator: true,
        index: 1
    }))
    measuringMenuItem = getMap().contextmenu.addItem(intoPageWithFun({
        text: "Measure from here",
        callback: function startMeasuring(e) {
            if (measuring) {
                endMeasuring()
                return
            }
            currentMeasuring = makeEmptyMeasuring()
            const {lat: initLat, lng: initLng} = e.latlng
            currentMeasuring.way.push({lat: initLat, lng: initLng})
            currentMeasuring.nodes.push(showNodeMarker(initLat, initLng, "#000000"))
            if (currentMeasuring.way.length > 1) {
                currentMeasuring.wayLine?.remove()
                currentMeasuring.wayLine = displayWay(currentMeasuring.way)
            } else {
                document.querySelector("#map").style.cursor = "pointer"
                measuring = true
                measuringMenuItem.textContent = "End measure"

                getMap().on('mousedown', measuringMouseDownHandler)
                getMap().on('mouseup', measuringMouseUpHandler)
                getMap().on('mousemove', measuringMouseMoveHandler)
            }
        }
    }));
}

//</editor-fold>

function setupIDframe() {
    if (GM_config.get("DarkModeForID")) {
        injectCSSIntoOSMPage(`
                @media ${mediaQueryForWebsiteTheme} {
                    ${GM_getResourceText("DARK_THEME_FOR_ID_CSS")}
                }`
        )
    }
    GM_registerMenuCommand("Show iD OAuth token", function () {
        let token = document.querySelector("#id-container")?.getAttribute("data-token")
        if (!token) {
            token = localStorage.getItem(`${osm_server.url}oauth2_access_token`)
            if (!token) {
                alert("Please switch the focus to the Iframe iD.\nJust click anywhere in the editor.")
                return;
            }
        }
        alert(token);
    });
}

function setupOSMWebsite() {
    if (location.pathname === "/id") {
        setupIDframe()
        return
    }
    resetSearchFormFocus();
    if (GM_config.get("OverpassInstance") === MAILRU_OVERPASS_INSTANCE.name) {
        overpass_server = MAILRU_OVERPASS_INSTANCE
    } else if (GM_config.get("OverpassInstance") === PRIVATECOFFEE_OVERPASS_INSTANCE.name) {
        overpass_server = PRIVATECOFFEE_OVERPASS_INSTANCE
    } else {
        overpass_server = MAIN_OVERPASS_INSTANCE
    }
    let lastPath = "";
    new MutationObserver(function mainObserverHandler() {
        const path = location.pathname;
        if (path === lastPath) return;
        try {
            shiftKeyZClicks = 0
            abortPrevControllers(ABORT_ERROR_WHEN_PAGE_CHANGED)
            cleanAllObjects()
            getMap().attributionControl.setPrefix("")
            addSwipes();
            document.querySelector("#fixed-rss-feed")?.remove()
            buildingViewerIframe?.remove()
            buildingViewerIframe = null
            historyPagePaginationDeletingObserver?.disconnect()
            historyPagePaginationDeletingObserver = null
            paginationInHistoryStepObserver?.disconnect()
            paginationInHistoryStepObserver = null
            removePOIMoverMenu()
            if (!path.startsWith("/changeset") && !path.startsWith("/history") &&
                !path.startsWith("/node") && !path.startsWith("/way") && path !== "/relation" &&
                !path.startsWith("/note")) {
                showSearchForm()
            }
        } catch { /* empty */
        }
        lastPath = path;
        for (const module of modules.filter(module => GM_config.get(module.name.slice('setup'.length)))) {
            queueMicrotask(() => {
                // console.log(module.name)
                module(path)
            });
        }
        for (const module of alwaysEnabledModules) {
            queueMicrotask(() => {
                // console.log(module.name)
                module(path)
            });
        }
        return mainObserverHandler
    }()).observe(document, {subtree: true, childList: true});
    if (location.pathname.startsWith("/dashboard") || location.pathname.startsWith("/user/")) {
        setTimeout(loadFriends, 4000);
    }
    setTimeout(() => {
        if (GM_config.get('CompactChangesetsHistory')) {
            document.querySelector('.nav-link[href^="/history"]').addEventListener("click", () => {
                addCompactSidebarStyle()
            }, {once: true});
        }
    });
}

function makeCommandsMenu() {
    try {
        GM_registerMenuCommand("Settings", function () {
            if (!inFrame()) {
                GM_config.open();
            }
        });
        if (isMobile || isDebug()) {
            GM_registerMenuCommand("Check script updates", function () {
                window.open(`${SCRIPT_UPDATE_URL}?bypasscache=${Math.random()}`, "_blank")
            });
        }
        if (isDebug()) {
            GM_registerMenuCommand("Check dev script updates", function () {
                window.open(`${DEV_SCRIPT_UPDATE_URL}?bypasscache=${Math.random()}`, "_blank")
            });
        }

        // New Year Easter egg
        const curDate = new Date()
        if (curDate.getMonth() === 11 && curDate.getDate() >= 18 || curDate.getMonth() === 0 && curDate.getDate() < 10) {
            GM_registerMenuCommand("☃️", runSnowAnimation);
        }
        // todo hotkeys
        GM_registerMenuCommand("List of hotkeys", function () {
            window.open("https://github.com/deevroman/better-osm-org/#hotkeys", "_blank")
        });
        // GM_registerMenuCommand("Ask question on forum", function () {
        //     window.open("https://community.openstreetmap.org/t/better-osm-org-a-script-that-adds-useful-little-things-to-osm-org/121670")
        // });
    } catch (e) {
        console.error(e)
    }
}


function main() {
    'use strict';
    if (location.origin === "https://www.hdyc.neis-one.org" || location.origin === "https://hdyc.neis-one.org") {
        simplifyHDCYIframe();
        return
    }
    if (location.origin === "https://osmcha.org") {
        setTimeout(async () => {
            await GM.setValue("OSMCHA_TOKEN", localStorage.getItem("token"))
        }, 1000);
        return
    }
    makeCommandsMenu();
    if (location.origin === "https://taginfo.openstreetmap.org" || location.origin === "https://taginfo.geofabrik.de") {
        new MutationObserver(function fn() {
            setTimeout(setupTaginfo, 0);
            return fn
        }()).observe(document, {subtree: true, childList: true});
        return
    }
    if (isOsmServer()) {
        setupOSMWebsite();
    }
}

setTimeout(async () => {
    if (location.pathname.includes("/user/") && !location.pathname.includes("/history")) return
    if (getWindow && !getWindow().mapIntercepted) {
        console.log("map not intercepted after 900ms");
        document.querySelector(".control-share a").click()
        document.querySelector(".control-share a").click()
        await interceptMapManually()
    }
}, 900)

// garbage collection for cached infos (user info, changeset history)
setTimeout(async function () {
    if (Math.random() > 0.5) return
    if (!location.pathname.includes("/history") && !location.pathname.includes("/note")) return
    const lastGC = await GM.getValue("last-garbage-collection-time")
    if (lastGC && (new Date(lastGC)).getTime() + 1000 * 60 * 60 * 24 * 2 > Date.now()) return
    await GM.setValue("last-garbage-collection-time", Date.now());

    const keys = GM_listValues();
    for (const i of keys) {
        if (i.startsWith("userinfo-")) {
            try {
                const userinfo = JSON.parse(await GM.getValue(i))
                if (userinfo.cacheTime && (new Date(userinfo.cacheTime)).getTime() + 1000 * 60 * 60 * 24 * 14 < Date.now()) {
                    await GM_deleteValue(i);
                }
            } catch { /* empty */
            }
        } else if (i.startsWith("useridinfo-")) {
            try {
                const userIDInfo = JSON.parse(await GM.getValue(i))
                if (userIDInfo.cacheTime && (new Date(userIDInfo.cacheTime)).getTime() + 1000 * 60 * 60 * 24 * 14 < Date.now()) {
                    await GM_deleteValue(i);
                }
            } catch { /* empty */
            }
        }

    }
    console.log("Old cache cleaned")
}, 1000 * 12)
