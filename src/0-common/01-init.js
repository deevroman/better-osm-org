//<editor-fold desc="init" defaultstate="collapsed">
/*global osmAuth*/
/*global GM*/
/*global GM_info*/
/*global GM_config*/
/*global GM_addElement*/
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
/*global unzipit*/
/*global bz2*/
performance.mark("BETTER_OSM_START")
function tryAddWarnAboutScriptIntoOsmOrgRepo() {
    if (document.querySelector(".better-osm-org-warn")) {
        return
    }
    let result = document.evaluate("//h1[normalize-space(text())='Create new issue']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
    if (!result) {
        result = document.evaluate("//h2[normalize-space(text())='Create new issue']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
    }
    if (result) {
        const warn = document.createElement("div")
        warn.textContent = "⚠️⚠️⚠️️ "
        warn.classList.add("better-osm-org-warn")
        const subWarn = document.createElement("span")
        subWarn.textContent = "Disable better-osm-org"
        subWarn.style.color = "red"
        warn.appendChild(subWarn)
        warn.appendChild(document.createTextNode(" before reporting bugs or asking questions about features ⚠️⚠️⚠️"))
        result.before(warn)
        result.before(document.createElement("br"))
    }
}

if ((location.origin + location.pathname).startsWith("https://github.com/openstreetmap/openstreetmap-website/issues/new")) {
    setInterval(tryAddWarnAboutScriptIntoOsmOrgRepo, 3000)
    setTimeout(tryAddWarnAboutScriptIntoOsmOrgRepo, 100)
    throw "skip better-osm-org run on GitHub"
}

function tryAddScriptInfo() {
    if (document.querySelector(".better-osm-org-rich-textarea")) {
        return
    }
    const textarea = document.querySelector('[class*="CreateIssueForm"] textarea')
    if (!textarea) return
    if (textarea.value.trim() !== "") return
    textarea.value += `\n\n\nScript version: \`${GM_info.script.version}\`
Script manager: \`${GM_info.scriptHandler}\`
User Agent: \`${navigator.userAgent}\``
    textarea.classList.add("better-osm-org-rich-textarea")
    textarea.dispatchEvent(new Event("input", { bubbles: true }))
}

if ((location.origin + location.pathname).startsWith("https://github.com/deevroman/better-osm-org/issues/new")) {
    setInterval(tryAddScriptInfo, 3000)
    setTimeout(tryAddScriptInfo, 1000)
    throw "skip better-osm-org run on GitHub"
}


if (location.search.includes("&kek")) {
    throw "better-osm-org disable via url param"
}

if (["Userscripts", "Greasemonkey", "Firemonkey", "OrangeMonkey"].includes(GM_info.scriptHandler)) {
    console.error("YOU ARE USING AN UNSUPPORTED SCRIPT MANAGER")
}

if (GM_info.scriptHandler === "Greasemonkey") {
    alert(
        "better-osm-org will not work in GreasyMonkey :(\n\n" +
        "It does not support important APIs without which most of the script's functions will not work.\n\n" +
        "Use ViolentMonkey or TamperMonkey\n\n" +
        "Discussion: https://github.com/deevroman/better-osm-org/issues/217",
    )
    throw ""
}

const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
const isFirefox = navigator.userAgent.includes("Firefox")
const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent)
const isMac = navigator.platform?.toUpperCase()?.indexOf("MAC") >= 0
const CtrlKeyName = isMac ? "Cmd" : "Ctrl"

if (isSafari) {
    console.error("YOU ARE USING AN UNSUPPORTED BROWSER")
}

function initGmApiPolyfills() {
    if (typeof GM_getResourceURL === "undefined") {
        const resources = {}
        setTimeout(async () => {
            const REPO_PREFIX = "https://github.com/deevroman/better-osm-org/raw/master/misc/assets/"
            const resourcesName = {
                OAUTH_HTML: REPO_PREFIX + "finish-oauth.html",
                DARK_THEME_FOR_ID_CSS: "https://gist.githubusercontent.com/deevroman/55f35da68ab1efb57b7ba4636bdf013d/raw/7b94e3b7db91d023f1570ae415acd7ac989fffe0/dark.css",
            }
            for (let resource in resourcesName) {
                GM.xmlHttpRequest({
                    method: "GET",
                    url: resourcesName[resource],
                    responseType: "blob",
                    onload: res => {
                        const a = new FileReader()
                        a.onload = function (e) {
                            resources[resource] = e.target.result
                        }
                        a.readAsDataURL(res.response)
                    },
                })
            }
        })
        window.GM_getResourceURL = name => {
            console.log(resources)
            return resources[name]
        }
    }

    if (typeof GM_addElement === "undefined") {
        window.GM_addElement = function () {
            let parent, type, attrs
            if (arguments.length === 3) {
                ;[parent, type, attrs] = arguments
            } else if (arguments.length === 2) {
                ;[type, attrs] = arguments
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

    if (typeof exportFunction === "undefined") {
        window.exportFunction = function (fn) {
            return fn
        }
    }

    if (typeof cloneInto === "undefined") {
        window.cloneInto = function (obj) {
            return obj
        }
    }
}

if (GM_info.scriptHandler === "Userscripts" || GM_info.scriptHandler === "Greasemonkey" || GM_info.scriptHandler === "OrangeMonkey" || GM_info.scriptHandler === "ScriptCat") {
    initGmApiPolyfills()
}

const accountForceLightTheme = document.querySelector("html")?.getAttribute("data-bs-theme") === "light"
const accountForceDarkTheme = document.querySelector("html")?.getAttribute("data-bs-theme") === "dark"
const mediaQueryForWebsiteTheme = `${accountForceDarkTheme ? "all" : "(prefers-color-scheme: dark)"} ${accountForceLightTheme ? "and (not all)" : ""}`

function isDarkMode() {
    return (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches && !accountForceLightTheme) || accountForceDarkTheme
}

const isRTLLayout = document.querySelector("html").dir === "rtl"
const arrowSymbolForChanges = !isRTLLayout ? " → " : " ← "

const SCRIPT_UPDATE_URL = "https://raw.githubusercontent.com/deevroman/better-osm-org/master/better-osm-org.user.js"
const DEV_SCRIPT_UPDATE_URL = "https://raw.githubusercontent.com/deevroman/better-osm-org/dev/better-osm-org.user.js"

const prod_server = {
    apiBase: "https://www.openstreetmap.org/api/0.6/",
    apiUrl: "https://www.openstreetmap.org/api/0.6",
    url: "https://www.openstreetmap.org",
    origin: "https://www.openstreetmap.org",
}

const ohm_prod_server = {
    apiBase: "https://www.openhistoricalmap.org/api/0.6/",
    apiUrl: "https://www.openhistoricalmap.org/api/0.6",
    url: "https://www.openhistoricalmap.org",
    origin: "https://www.openhistoricalmap.org",
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
    if (location.origin === prod_server.origin) return prod_server
    else if (location.origin === dev_server.origin) return dev_server
    else if (location.origin === ohm_prod_server.origin) return ohm_prod_server
    else if (location.origin === local_server.origin) return local_server
    else return null
})()

function isOHMServer() {
    return location.origin === ohm_prod_server.origin
}

function isOsmServer() {
    return !!osm_server
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

const OHM_OVERPASS_INSTANCE = {
    name: "overpass-api.openhistoricalmap.org",
    apiUrl: "https://overpass-api.openhistoricalmap.org/api/",
    url: "https://overpass-turbo.openhistoricalmap.org/",
}

let overpass_server = MAIN_OVERPASS_INSTANCE

const MAIN_OSMCHA = "https://osmcha.org"
const OHM_OSMCHA = "https://osmcha.openhistoricalmap.org"

const osmcha_server_origin = isOHMServer() ? OHM_OSMCHA : MAIN_OSMCHA

const MAIN_OSM_REVERT = "https://revert.monicz.dev"
const OHM_OSM_REVERT = "https://ohm-revert.monicz.dev"

const MAIN_OSM_REVERT_NAME = "osm-revert"
const OHM_OSM_REVERT_NAME = "ohm-revert"

const osm_revert_origin = isOHMServer() ? OHM_OSM_REVERT : MAIN_OSM_REVERT
const osm_revert_name = isOHMServer() ? OHM_OSM_REVERT_NAME : MAIN_OSM_REVERT_NAME

/**
 * @typedef {{
 *     [type]: "node"|"way"|"relation",
 *     [id]: number|string,
 *     [x]: string,
 *     [y]: string,
 *     [z]: string,
 *     [waymarkedtrails_type]: "hiking"|"cycling"|"mtb"|"riding"|"skating"|"slopes",
 * }} externalURLParams
 */

/**
 * @typedef {{
 *     name: string,
 *     url: string,
 *     makeURL: (externalURLParams) => string,
 * }} externalURL
 */

/** @type {externalURL[]} */
const instancesOf3DViewers = [
    {
        name: "OSM Building Viewer",
        url: "https://deevroman.github.io/OSMBuilding/",
        makeURL: function ({ type: type, id: id }) {
            return `${this.url}?id=${id}&type=${type}` // TODO osmAPIurl
        },
    },
    {
        name: "F4Map",
        url: "https://demo.f4map.com/",
        makeURL: function ({ x: x, y: y, z: z }) {
            return `${this.url}#lat=${x}&lon=${y}&zoom=${z}`
        },
    },
    {
        name: "streets.gl",
        url: "https://streets.gl/",
        makeURL: function ({ x: x, y: y }) {
            return `${this.url}#${x},${y},45.00,0.00,2000.00`
        },
    },
    {
        name: "OSM go",
        url: "https://www.osmgo.org/go.html",
        makeURL: function ({ x: x, y: y }) {
            return `${this.url}?lat=${x}&lon=${y}&view=-50&ele=150`
        },
    },
    {
        name: "osmbuildings.org",
        url: "https://osmbuildings.org/",
        makeURL: function ({ x: x, y: y, z: z }) {
            return `${this.url}?lat=${x}&lon=${y}&zoom=${z}`
        },
    },
    {
        name: "labs.mapbox.com",
        url: "https://labs.mapbox.com/standard-style?lightPreset=day#",
        makeURL: function ({ x: x, y: y, z: z }) {
            // z-1 looks better
            return `${this.url}${z - 1}/${x}/${y}/0/50`
        },
    },
    {
        name: "OSM Building Inspector",
        url: "https://www.osmgo.org/bevy.html",
        makeURL: function ({ type: type, id: id }) {
            return `${this.url}?${type}=${id}` // todo relation don't work?
        },
    },
    {
        name: "ArcGIS 3D Buildings & Trees",
        url: "https://arcgis.com/home/webscene/viewer.html",
        makeURL: function ({ x: x, y: y }) {
            return `${this.url}?webscene=037cceb0e24440179dbd00846d2a8c4f&viewpoint=cam:${y},${parseFloat(x) - 0.0015},150;0,50` // todo relation don't work?
        },
    },
    // {
    //     name: "OSM Building Viewer (fork)",
    //     url: "https://deevroman.github.io/OSMBuilding/",
    //     makeURL: function ({type: type, id: id}) {
    //         return `${this.url}/?id=${id}&type=${type}`
    //     }
    // }
]

/** @type {externalURL} */
const waymarkedtrailsLink = {
    name: "Waymarked Trails",
    url: "https://{type}.waymarkedtrails.org/",
    makeURL: function ({ x, y, z, id, waymarkedtrails_type }) {
        return `${this.url.replace("{type}", waymarkedtrails_type)}#route?id=${id}&map=${z}/${x}/${y}`
    },
}

/** @type {externalURL} */
const publicTransportNetworkAnalysisLink = {
    name: "Public Transport Network Analysis",
    url: "https://ptna.openstreetmap.de/relation.php",
    makeURL: function ({ id }) {
        return `${this.url}?id=${id}`
    },
}

/** @type {externalURL} */
const mapkiLink = {
    name: "Mapki history viewer",
    url: "https://osm.mapki.com/history",
    makeURL: function ({ type, id }) {
        return `${this.url}/${type}/${id}`
    },
}

/** @type {externalURL} */
const pewuLink = {
    name: "Pewu history viewer",
    url: "https://pewu.github.io/osm-history/#",
    makeURL: function ({ type, id }) {
        return `${this.url}/${type}/${id}`
    },
}

/** @type {externalURL} */
const osmlabDeepHistoryLink = {
    name: "Osmlab deep history",
    url: "https://osmlab.github.io/osm-deep-history/#",
    makeURL: function ({ type, id }) {
        return `${this.url}/${type}/${id}`
    },
}

/** @type {externalURL} */
const relationAnalizerLink = {
    name: "OSM Relation Analyzer",
    url: "https://ra.osmsurround.org/analyzeRelation",
    makeURL: function ({ id }) {
        return `${this.url}?relationId=${id}`
    },
}

/** @type {externalURL[]} */
const instancesOfRelationViewers = [mapkiLink, pewuLink, relationAnalizerLink, osmlabDeepHistoryLink]

/** @type {externalURL} */
const relatifyLink = {
    name: "OSM Relatify",
    url: "https://relatify.monicz.dev/",
    makeURL: function ({ id }) {
        return `${this.url}?load=1&relation=${id}`
    },
}

/** @type {unsafeWindow & windowOSM} **/
const boWindowObject = typeof window.wrappedJSObject !== "undefined" ? window.wrappedJSObject : unsafeWindow
const boGlobalThis = typeof boWindowObject.globalThis !== "undefined" ? boWindowObject.globalThis : boWindowObject

/** @type {null|(function(): null|import('leaflet').Map)}*/
let getMap = null

/**
 * @typedef {{
 *  OSM: {
 *   router: { stateChange: (args: Object.<string, any>) => Object.<string, any> },
 *   i18n: {t: Function},
 *   formatHash: (hash: string) => Object.<string, any>,
 *   parseHash: (args: Object.<string, any>) => string,
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
const getWindow = isSafari && GM_info.scriptHandler === "Userscripts" ? () => window : () => boWindowObject

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
    return cloneInto(obj, getWindow(), { cloneFunctions: true })
}

const dataUser = document.querySelector("head")?.getAttribute("data-user")
// TrickyFoxy on osm.org and OHM
let _isDebug = dataUser === "11528195" || dataUser === "15560" || osm_server === local_server || osm_server === dev_server

function isDebug() {
    return _isDebug
}

function debug_alert() {
    if (!isDebug()) return
    alert(JSON.stringify(arguments))
    // eslint-disable-next-line
    debugger
}

//<editor-fold desc="i18n. Work In Progress!" defaultstate="collapsed">

//</editor-fold>

function printScriptDebugInfo() {
    console.log(`Script version: ${GM_info.script.version}`)
    console.log(`Script manager: ${GM_info.scriptHandler}`)
    console.debug(
        "Settings:",
        Object.entries(GM_config.fields).map(i => {
            if (typeof i[1].value === "boolean" || typeof i[1].value === "number") {
                return [i[0], i[1].value]
            } else {
                return [i[0], `length: ${i[1].value.length}`]
            }
        }),
    )
}

setTimeout(printScriptDebugInfo, 2000)

function injectMapHooks() {
    console.log("injectMapHooks called")
    function mapHook() {
        console.log("start map intercepting")
        if (boWindowObject.L && boWindowObject.L.Map) {
            boWindowObject.L.Map.addInitHook(
                exportFunction(function () {
                    if (this._container?.id === "map") {
                        boGlobalThis.map = this
                        boGlobalThis.mapIntercepted = true
                        console.log("%cMap intercepted", "background: #000; color: #0f0")
                        if (!boGlobalThis.scriptInstance) {
                            boGlobalThis.scriptInstance = GM_info.scriptHandler
                        } else if (boGlobalThis.scriptInstance !== GM_info.scriptHandler) {
                            console.error(`Two copies of the script were running simultaneously via ${boGlobalThis.scriptInstance} and ${GM_info.scriptHandler}. Turn off one of them`)
                        }
                    }
                }, boWindowObject),
            )
            boWindowObject.L.OSM.MaplibreGL.addInitHook(
                exportFunction(function () {
                    // if (this._container?.id === "map") {
                    if (!boGlobalThis.mapGL) {
                        boGlobalThis.mapGL = intoPage([])
                    }
                    boGlobalThis.mapGL.push(this)
                    boGlobalThis.mapGLIntercepted = true
                    console.log("%cMapGL intercepted", "background: #000; color: #0f0")
                    // }
                }, boWindowObject),
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
    } else {
        boWindowObject.mapHook = exportFunction(mapHook, boWindowObject)
        boWindowObject.mapHook()
        if (boWindowObject.map instanceof HTMLElement) {
            console.error("Please, reload page, if something doesn't work")
            // todo
            // getMap = () => null
            // } else {
            //     getMap = () => boWindowObject.map
        }

        getMap = () => boWindowObject.map
    }
}

function runOnDOMContentLoaded(callback) {
    if (document.readyState === "loading") {
        console.log("Waiting DOMContentLoaded...")
        document.addEventListener("DOMContentLoaded", callback)
    } else {
        console.log("DOMContentLoaded has already happened. Run immediately")
        callback()
    }
}

function preventWhiteFlashesInIdEditor() {
    if (isDarkMode()) {
        if (location.pathname === "/edit") {
            injectCSSIntoOSMPage(
                `@media ${mediaQueryForWebsiteTheme} {
                #id-embed {
                    background: #212529 !important;
                }
            }`,
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
            }`,
            )
        }
    }
}

if (isOsmServer() && location.pathname !== "/id" && !document.querySelector("#id-embed")) {
    runOnDOMContentLoaded(injectMapHooks)
} else if (isOsmServer() && ["/edit", "/id"].includes(location.pathname)) {
    preventWhiteFlashesInIdEditor()
    GM_registerMenuCommand("JOSM!", function () {
        const iframe = GM_addElement("iframe", {
            src: "https://deevroman.github.io/web-josm",
            width: "100%",
            height: "100%",
            id: "josmembed",
        })
        document.querySelector("#id-embed").replaceWith(iframe)
    })
}

//</editor-fold>
