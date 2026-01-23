//<editor-fold desc="in-osm-page-code" defaultstate="collapsed">

function allowedCspBridgeOrigin(origin) {
    return origin === prod_server.origin || origin === dev_server.origin || origin === ohm_prod_server.origin
}

function initCspBridge() {
    window.addEventListener("message", async e => {
        if (!customLayerUrlOrigin && !vectorLayerStyleUrlOrigin) {
            return
        }
        if (e.origin !== location.origin) return
        if (!allowedCspBridgeOrigin(e.origin)) return
        if (e.data.type !== "bypass_csp") {
            return
        }
        // console.log(e.data)
        const opt = {}
        if (e.data.url.startsWith("https://tiles.openrailwaymap.org")) {
            opt.headers = { Referer: "https://www.openrailwaymap.org/" }
        }
        // fuck TM, need imitate Response
        const res = await fetchBlobWithCache(e.data.url, opt)
        window.postMessage(
            {
                type: "bypass_csp_response",
                url: e.data.url,
                data: {
                    status: res.status,
                    statusText: res.statusText,
                    response: res.response,
                },
            },
            e.origin,
        )
    })
}

let initCustomFetch

function initMaplibreWorkerOverrider() {
    window.addEventListener("message", async e => {
        if (e.origin !== location.origin) {
            return
        }
        if (e.data.type !== "create_worker") {
            return
        }
        console.log("create_worker message")
        const worker = boWindowObject.maplibreOverriddenWorker
        worker.onmessage = intoPageWithFun(async e => {
            if (e.data.type !== "bypass_csp") {
                return
            }
            // console.log(e.data)
            if (!customLayerUrlOrigin && !vectorLayerStyleUrlOrigin) {
            } else {
                const res = await GM.xmlHttpRequest({
                    url: e.data.url,
                    responseType: "blob",
                    headers: {
                        Origin: location.origin,
                        Referer: location.origin + "/",
                    },
                })
                worker.postMessage(
                    cloneInto(
                        {
                            type: "bypass_csp_response",
                            url: e.data.url,
                            data: {
                                status: res.status,
                                statusText: res.statusText,
                                response: res.response,
                            },
                        },
                        boWindowObject,
                    ),
                )
            }
        })
        initCustomFetch = () => {
            worker.postMessage(intoPage({ type: "init_custom_fetch" }))
        }
        delete boWindowObject.maplibreOverriddenWorker
        // лучше убрать воркер из глобального скоупа
    })
}
if ([prod_server.origin, dev_server.origin, local_server.origin, ohm_prod_server.origin].includes(location.origin)) {
    initCspBridge()
    initMaplibreWorkerOverrider()
}

function runInOsmPageCode() {
    injectJSIntoPage(`
    const OriginalBlob = window.Blob;
    window.Blob = function Blob(parts = [], options = {}) {
        if (parts?.[0]?.startsWith?.("var sharedModule = {};")) {
            console.debug('Blob intercepted:', options, "len", parts[0].length);
            window.maplibreWorkerSourceCode = parts[0]
            window.Blob = OriginalBlob
        }
        return new OriginalBlob(parts, options);
    };
    window.Blob.prototype = OriginalBlob.prototype;

    const OriginalWorker = window.Worker
    window.Worker = function (url, options) {
        const fetchCode = "const originalFetch = self.fetch;" +
            "let customFetchEnabled = false;" +
            "self.addEventListener('message', (e) => {" +
            "    if (e.data.type !== 'init_custom_fetch') { return; } " +
            "    customFetchEnabled = true;" +
            "});" +
            "self.fetch = async (...args) => {" +
            "   if (!customFetchEnabled || args.length > 1) return await originalFetch(...args);" +
            "   const url = args[0].url;" +
            "   const resultCallback = new Promise((resolve, reject) => {" +
            "       console.log('fetch in worker', url);" +
            "       self.addEventListener('message', (e) => {" +
            "           if (e.data.type !== 'bypass_csp_response') { return; } " +
            "           if (e.data.url !== url) { return; }" +
            "           resolve(e.data.data);" +
            "       });" +
            "   });" +
            "   self.postMessage({ type: 'bypass_csp', url: url });" +
            "   const res = await resultCallback;" +
            "   return new Response(res.response, { status: res.status, statusText: res.statusText });" +
            "};"
        const proxyUrl = URL.createObjectURL(
            new OriginalBlob([fetchCode + window.maplibreWorkerSourceCode], { type: "application/javascript" }),
        )
        // TODO FIXME proxyUrl = URL.createObjectURL — memory leak?
        console.count("newWorkerCounter")
        const maplibreOverriddenWorker = new OriginalWorker(proxyUrl, options);
        window.maplibreOverriddenWorker = maplibreOverriddenWorker
        window.postMessage({ type: "create_worker" }, location.origin)

        return maplibreOverriddenWorker
    }
        
    const originalFetch = window.fetch;

    window.fetchIntercepterScriptInited = true;
    window.needClearLoadMoreRequest = 0;
    window.needPatchLoadMoreRequest = null;
    window.hiddenChangesetsCount = null;
    window.spyGlassMode = false;

    window.notesDisplayName = "";
    window.notesQFilter = "";
    window.notesClosedFilter = "";
    window.notesCommentsFilter = "";
    window.notesIDsFilter = new Set();

    window.customLayerOrigin = null
    window.customVectorStyleLayerOrigin = null

    // const cache = new Map();

    window.mapDataIDsFilter = new Set();

    console.log('Fetch intercepted');
    window.fetch = async (...args) => {
        try {
            if (args[0]?.includes?.("notes.json") && (
                    window.notesDisplayName !== ""
                    || window.notesQFilter !== ""
                    || (window.notesClosedFilter !== "" && window.notesClosedFilter !== "7"))
                || window.notesCommentsFilter !== ""
                || window.notesIDsFilter.size
            ) {
                const url = new URL(args[0], location.origin);
                url.pathname = url.pathname.replace("notes.json", "notes/search.json")
                url.searchParams.set("limit", "1000")
                if (window.notesDisplayName && !window.invertDisplayName && !window.notesDisplayName.includes(",")) {
                    if (window.notesDisplayName !== "anon") {
                        url.searchParams.set("display_name", window.notesDisplayName)
                    }
                }
                // if (window.notesQFilter && !window.invertQ && !window.notesQFilter.includes(",")) {
                //     url.searchParams.set("q", window.notesQFilter)
                // }
                if (window.notesClosedFilter) {
                    if (window.notesClosedFilter < -1) {
                        if (window.notesClosedFilter < -365) {
                            url.searchParams.set("from", new Date("2000-01-01T00:00:00Z").toISOString().slice(0, -5) + "Z")
                            const d = new Date()
                            d.setTime(d.getTime() - 1000 * 86400 * -notesClosedFilter)
                            url.searchParams.set("to", d.toISOString().slice(0, -5) + "Z")
                        } else {
                            const d = new Date()
                            d.setTime(d.getTime() - 1000 * 86400 * -notesClosedFilter)
                            url.searchParams.set("from", d.toISOString().slice(0, -5) + "Z")
                        }
                    } else {
                        url.searchParams.set("closed", window.notesClosedFilter)
                    }
                }
                args[0] = url.toString()
                const response = await originalFetch(...args);
                if (response.status !== 200) {
                    return response
                }
                /** @type import('geojson').GeoJSON */
                const originalJSON = await response.json();
                originalJSON.features = originalJSON.features?.filter(note => {
                    if (window.notesCommentsFilter) {
                        const currentUserID = document.head.getAttribute("data-user")
                        switch (window.notesCommentsFilter) {
                            case "only with comments":
                                if (note.properties.comments.length <= 1) {
                                    return false
                                }
                                break
                            case "only with my comments":
                                if (currentUserID) {
                                    if (!note.properties.comments.slice(1).some(c => c.uid === currentUserID)) {
                                        return false
                                    }
                                }
                                break
                            case "without comments":
                                if (note.properties.comments.length > 1) {
                                    return false
                                }
                                break
                            case "without my comments":
                                if (currentUserID) {
                                    if (note.properties.comments.slice(1)?.some(c => c.uid === currentUserID)) {
                                        return false
                                    }
                                }
                                break
                            case "commented by other users":
                                if (currentUserID) {
                                    if (note.properties.comments.length <= 1) {
                                        return false
                                    }
                                    if (!note.properties.comments.slice(1).some(c => c.uid === currentUserID)) {
                                        return false
                                    }
                                }
                                break
                            default:
                                console.error("unsupported comments filter", window.notesCommentsFilter)
                        }
                    }
                    if (window.notesDisplayName) {
                        if (window.invertDisplayName) {
                            const usernames = window.notesDisplayName.split(",")
                            for (const username of usernames) {
                                if (username === "anon" && !note.properties.comments?.[0]?.user) {
                                    return false
                                } else if (note.properties.comments?.[0]?.user === username) {
                                    return false
                                }
                            }
                        } else {
                            const usernames = window.notesDisplayName.split(",")
                            let found = false
                            for (const username of usernames) {
                                if (username === "anon" && !note.properties.comments?.[0]?.user) {
                                    found = true
                                } else if (note.properties.comments?.[0]?.user === username) {
                                    found = true
                                }
                            }
                            if (!found) {
                                return false
                            }
                        }
                    }
                    if (window.notesQFilter) {
                        if (window.invertQ) {
                            const words = window.notesQFilter.split(",").map(i => i.trim()).filter(i => i !== "")
                            for (const word of words) {
                                for (const comment of note.properties.comments ?? []) {
                                    if (comment.text?.toLowerCase()?.includes(word.toLowerCase())) {
                                        return false
                                    }
                                }
                            }
                        } else {
                            const words = window.notesQFilter.split(",").map(i => i.trim()).filter(i => i !== "")
                            let found = false
                            for (const word of words) {
                                for (const comment of note.properties.comments ?? []) {
                                    if (comment.text?.toLowerCase()?.includes(word.toLowerCase())) {
                                        found = true
                                    }
                                }
                            }
                            if (!found && words.length) {
                                return false
                            }
                        }
                    }
                    if (window.notesIDsFilter.size) {
                        if (window.notesIDsFilter.has(note.properties.id)) {
                            return false
                        }
                    }
                    return true
                })

                return new Response(JSON.stringify(originalJSON), {
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers
                });
            } else if (args[0]?.startsWith?.("/history?bbox") && (needClearLoadMoreRequest || needPatchLoadMoreRequest)) {
                const response = await originalFetch(...args);
                const originalText = await response.text();
                if (needClearLoadMoreRequest) {
                    console.log("new changesets cleared")
                    needClearLoadMoreRequest--;
                    const doc = (new DOMParser()).parseFromString(originalText, "text/html");
                    doc.querySelectorAll("ol > li").forEach(i => i.remove())
                    doc.querySelector('.changeset_more:has([href*="before"]) a.page-link').href = window.lastLoadMoreURL
                    window.lastLoadMoreURL = ""
                    return new Response(doc.documentElement.outerHTML, {
                        status: response.status,
                        statusText: response.statusText,
                        headers: response.headers
                    });
                } else if (needPatchLoadMoreRequest) {
                    console.log("new changesets patched")
                    const doc = (new DOMParser()).parseFromString(originalText, "text/html");
                    filterChangesets(doc)
                    setTimeout(() => {
                        const changesetsCount = document.querySelectorAll("ol > li").length
                        document.querySelector("#hidden-changeset-counter").textContent = " Displayed " + (changesetsCount - getWindow().hiddenChangesetsCount) + "/" + changesetsCount
                    }, 100)
                    return new Response(doc.documentElement.outerHTML, {
                        status: response.status,
                        statusText: response.statusText,
                        headers: response.headers
                    });
                }
            } else if (window.mapGLIntercepted && window.customLayerOrigin && args?.[0]?.url?.startsWith?.(window.customLayerOrigin)
            || window.mapGLIntercepted && window.customVectorStyleLayerOrigin && (
                    window.customVectorStyleLayerOrigin.startsWith("http://localhost") 
                    || window.customVectorStyleLayerOrigin.startsWith("https://raw.githubusercontent.com") 
                    || args?.[0]?.url?.startsWith?.(window.customVectorStyleLayerOrigin)
                )) {
                const resourceUrl = args?.[0]?.url
                console.log("overridden fetch in page", window.customLayerOrigin, window.customVectorStyleLayerOrigin, resourceUrl)
                const resultCallback = new Promise((resolve, reject) => {
                    window.addEventListener("message", e => {
                        if (e.origin !== location.origin) return
                        if (e.data.type !== "bypass_csp_response") {
                            return
                        }
                        if (e.data.url !== resourceUrl) {
                            return
                        }
                        resolve(e.data.data)
                    })
                })
                window.postMessage({ "type": "bypass_csp", url: resourceUrl }, location.origin)
                const res = await resultCallback
                return new Response(res.response, {
                    status: res.status,
                    statusText: res.statusText,
                });
            } else if (args?.[0]?.url === "https://vector.openstreetmap.org/styles/shortbread/colorful.json"
                || args?.[0]?.url === "https://vector.openstreetmap.org/styles/shortbread/eclipse.json") {
                return originalFetch(...args);
                // const response = await originalFetch(...args);
                // const originalJSON = await response.json();
                // originalJSON.layers[originalJSON.layers.findIndex(i => i.id === "water-river")].paint['line-color'] = "red"
                // originalJSON.layers.forEach(i => {
                //     if (i.paint && i.paint['line-color']) {
                //         i.paint['line-color'] = "red"
                //     }
                //     if (i.paint && i.paint['fill-color']) {
                //         i.paint['fill-color'] = "black"
                //     }
                // })
                // console.log(originalJSON)
                // return new Response(JSON.stringify(originalJSON));
            } else if (args[0]?.includes?.("/members")) {
                // console.log("freeeeeze", args[0])
                // await new Promise(() => setTimeout(() => true, 1000 * 1000))
            } else if (args[0]?.includes?.("https://www.wikidata.org/w/api.php")) {
                // if (cache.has(args[0])) {
                //     console.log("force cache for", args[0])
                //     return new Response(cache.get(args[0]), {
                //         status: response.status,
                //         statusText: response.statusText,
                //         headers: response.headers
                //     });
                // }
                // const response = await originalFetch(...args);
                // const jsonStr = JSON.stringify(await response.json());
                // cache.set(args[0], jsonStr)
                // return new Response(jsonStr, {
                //     status: response.status,
                //     statusText: response.statusText,
                //     headers: response.headers
                // });
            } else if (spyGlassMode && args[0]?.includes?.("/map.json")) {
                console.debug("replacing Map Data overlay")
                const response = await originalFetch(...args);
                const originalJSON = await response.json();
                if (false) {
                    const reverseIndex = {}
                    originalJSON.elements?.forEach(i => {
                        reverseIndex[i.type + i.id] = i
                    })
                    map.dataLayer.on('layeradd', e => {
                        // if (e.layer.feature.tags["name"] && e.layer.feature.tags["landuse"]) {
                        //     e.layer.bindTooltip(
                        //         e.layer.feature.tags["name"],
                        //         {
                        //             content: e.layer.feature.tags["name"],
                        //             sticky: true,
                        //             permanent: true,
                        //             offset: L.point(10, 0)
                        //         },
                        //     )
                        //         .openTooltip()
                        // }
                        const layer = e.layer
                        const f = e.layer.feature
                        const t = f.tags || {};
                        const palette = {
                            background: "#ffeef7",
                            border: "#ffb6c1",
                            text: "#d81b60",
                            pink1: "#f8bbd0",
                            pink2: "#f48fb1",
                            pink3: "#ec407a",
                            pink4: "#ad1457",
                            white: "#fff"
                        };

                        if (t.building) {
                            layer.setStyle({
                                color: palette.pink3,
                                fillColor: palette.pink1,
                                fillOpacity: 0.8,
                                weight: 1
                            });
                        } else if (t.landuse) {
                            if (["forest", "meadow", "grass", "farmland"].includes(t.landuse)) {
                                layer.setStyle({
                                    color: palette.pink2,
                                    fillColor: palette.pink1,
                                    fillOpacity: 0.6
                                });
                            } else if (["residential", "commercial", "industrial"].includes(t.landuse)) {
                                layer.setStyle({
                                    color: palette.pink4,
                                    fillColor: palette.pink3,
                                    fillOpacity: 0.5
                                });
                            } else {
                                layer.setStyle({
                                    color: palette.border,
                                    fillColor: palette.pink1,
                                    fillOpacity: 0.4
                                });
                            }
                        } else if (t.highway) {
                            layer.setStyle({
                                color: palette.pink4,
                                weight: 2,
                                opacity: 0.9
                            });
                        } else if (t.natural === "water" || t.waterway) {
                            layer.setStyle({
                                color: "#ff80ab",
                                fillColor: "#ffbcd9",
                                fillOpacity: 0.5
                            });
                        } else {
                            layer.setStyle({
                                color: palette.border,
                                fillColor: palette.background,
                                fillOpacity: 0.2
                            });
                        }
                        if (reverseIndex[f.type + f.id].user === "TrickyFoxy") {
                            debugger
                            layer.setStyle({
                                color: "green"
                            });
                        }
                    })
                }
                let rightPopup = document.getElementById("spy-glass-popup")
                if (!rightPopup) {
                    rightPopup = document.createElement("div")
                    rightPopup.id = "spy-glass-popup"
                    rightPopup.style.position = "absolute"
                    rightPopup.style.top = "0px"
                    rightPopup.style.width = "max(350px, 30%)"
                    rightPopup.style.height = "fit-content"
                    rightPopup.style.background = "white"
                    document.getElementById("map").after(rightPopup)
                }
                rightPopup.style.zIndex = "99"
                // todo clean prev handler
                map.dataLayer.clearLayers()

                const features = map.dataLayer.buildFeatures(originalJSON)
                const nodes = features.filter(i => i.type === "node")
                const other = features.filter(i => i.type !== "node")
                for (const feature of [...other, ...nodes]) {
                    if (window.mapDataIDsFilter.has(feature.type + feature.id)) {
                        continue
                    }
                    let layer, layerShadow;

                    if (feature.type === "node") {
                        layerShadow = L.circleMarker(feature.latLng, {
                            color: "white",
                            weight: 4,
                            radius: 4,
                            opacity: 1,
                            fillOpacity: 1
                        });
                        layer = L.circleMarker(feature.latLng, {
                            color: "black",
                            weight: 2,
                            radius: 2,
                            opacity: 1,
                            fillOpacity: 1
                        });
                    } else {
                        const latLngs = new Array(feature.nodes.length);

                        for (let j = 0; j < feature.nodes.length; j++) {
                            latLngs[j] = feature.nodes[j].latLng;
                        }

                        if (map.dataLayer.isWayArea(feature)) {
                            latLngs.pop();
                            layer = L.polygon(latLngs, {
                                color: "black",
                                weight: 2,
                                opacity: 1,
                                fillOpacity: 0.5
                            });
                        } else {
                            layer = L.polyline(latLngs, {
                                color: "black",
                                weight: 2,
                                radius: 4,
                                opacity: 1,
                                fillOpacity: 0.5
                            });
                        }
                    }

                    function attachMouseHandlers(layer) {
                        layer.on("mouseover", function(e) {
                            rightPopup.textContent = ""
                            layer.setStyle({
                                color: "red",
                                weight: 2,
                                radius: 2,
                                opacity: 1,
                                fillOpacity: 1
                            })
                            layer._path.classList.add("spy-glass-stroke-polyline")
                            layer.bringToFront()

                            const t = document.createElement("table")
                            t.classList.add("spy-glass")
                            t.style.margin = "4px"
                            t.style.border = "solid 1px red"
                            t.style.borderRadius = "4px"
                            t.style.width = "97%"
                            const tB = document.createElement("tbody")
                            t.appendChild(tB)

                            const thead = document.createElement("thead")
                            thead.style.color = "black"
                            thead.style.background = "yellow"
                            thead.style.fontWeight = "bold"
                            thead.style.fontSize = "large"
                            thead.style.textAlign = "center"
                            thead.style.borderBottom = "solid 1px gray"
                            t.appendChild(thead)

                            const th = document.createElement("th")
                            th.colSpan = 2
                            th.textContent = feature.type + " " + feature.id
                            thead.appendChild(th)

                            Object.entries(feature.tags ?? {}).forEach(([k, v]) => {
                                const tr = document.createElement("tr")
                                const tdKey = document.createElement("td")
                                const tdValue = document.createElement("td")
                                tdKey.textContent = k
                                tdKey.style.color = "black"
                                tdKey.style.fontWeight = "bold"
                                tdValue.textContent = v
                                tdValue.style.color = "black"
                                tr.appendChild(tdKey)
                                tr.appendChild(tdValue)
                                tB.appendChild(tr)
                            })

                            rightPopup.appendChild(t)

                            console.log(feature)
                        })
                        layer.on("mouseout", function(e) {
                            layer.setStyle({
                                color: "black",
                                weight: 2,
                                radius: 2,
                                opacity: 1,
                                fillOpacity: 1
                            })
                            layer._path.classList.remove("spy-glass-stroke-polyline")
                            if (feature.type === "way") {
                                layer.bringToBack()
                            }
                        })
                        layer.on('click', e => {
                            if (!layer.feature) {
                                return
                            }
                            if (!e.originalEvent.altKey) {
                                OSM.router.route("/" + layer.feature.type + "/" + layer.feature.id)
                                rightPopup.style.zIndex = "0"
                                return
                            }
                            window.mapDataIDsFilter.add(layer.feature.type + layer.feature.id)
                            layer.remove()
                            layerShadow.remove()
                        })
                    }

                    attachMouseHandlers(layer)
                    if (feature.type === "node") {
                        layerShadow.addTo(map);
                        queueMicrotask(() => {
                            layer.addTo(map);
                            layer.feature = feature;
                            layerShadow.feature = feature;
                            layer._path.classList.add("spy-glass-" + feature.type)
                            layer.bringToFront()
                        })
                    } else {
                        layer.addTo(map);
                        layer.feature = feature;
                        layer._path.classList.add("spy-glass-" + feature.type)
                    }
                }
                throw "PreventMapData"
            } else {
                // console.log("other requests", args[0])
                // debugger
            }
        } catch (e) {
            if (e === "PreventMapData") {
                throw { name: "AbortError" }
            }
            return originalFetch(...args);
        } finally {
            document.querySelectorAll(".wait-fetch").forEach(elem => elem.classList.remove("wait-fetch"))
        }
        return originalFetch(...args);
    }
    `)
}

if (isOsmServer()) {
    runInOsmPageCode()
}

//</editor-fold>
