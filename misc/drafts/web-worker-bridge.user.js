// ==UserScript==
// @name        CSP bridge for Web Workers fetch() requests
// @version     1.0
// @author      deevroman
// @license     WTFPL
// @namespace   https://github.com/deevroman/better-osm-org
// @match       https://www.openstreetmap.org/*
// @connect     *
// @grant       GM_addElement
// @grant       GM.xmlHttpRequest
// @run-at      document-start
// @sandbox     JavaScript

// ==/UserScript==

const boWindowObject =
  typeof window.wrappedJSObject !== "undefined"
    ? window.wrappedJSObject
    : unsafeWindow;

function intoPageWithFun(obj) {
  return cloneInto(obj, boWindowObject, { cloneFunctions: true });
}

window.addEventListener("message", async (e) => {
  if (e.origin !== "https://www.openstreetmap.org") {
    return;
  }
  if (e.data.type !== "create_worker") {
    return;
  }
  boWindowObject.maplibreOverridedWorker.onmessage = intoPageWithFun(
    async (e) => {
      if (e.data.type !== "bypass_csp") {
        return;
      }
      const res = await GM.xmlHttpRequest({
        url: e.data.url,
        responseType: "blob",
        headers: {
          Origin: "https://www.openstreetmap.org",
          Referer: "https://www.openstreetmap.org/",
        },
      });
      boWindowObject.maplibreOverridedWorker.postMessage(
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
      );
    },
  );
});

function injectJSIntoPage(text) {
  GM_addElement("script", {
    textContent: text,
  });
}

injectJSIntoPage(`
    const OriginalBlob = window.Blob;
    window.Blob = function Blob(parts = [], options = {}) {
        if (parts?.[0]?.startsWith?.("var sharedModule = {};")) {
            console.log('Blob created:', parts, options);
            window.maplibre_worker_source_code = parts[0]
            window.Blob = OriginalBlob
        }
        return new OriginalBlob(parts, options);
    };
    window.Blob.prototype = OriginalBlob.prototype;
    
    const OriginalWorker = window.Worker
    window.Worker = function (url, options) {
        const fetchCode = "const originalFetch = self.fetch;" +
            "self.fetch = async (...args) => {" +
            "   const url = args[0].url;" +
            "   const resultCallback = new Promise((resolve, reject) => {" +
            "       console.log('fetch in worker', args);" +
            "       self.addEventListener('message', (e) => {" +
            "           if (e.data.type !== 'bypass_csp_response') { return; } " +
            "           if (e.data.url !== url) { return; }" +
            "           resolve(e.data.data);" +
            "       });" +
            "   });" +
            "   self.postMessage({ type: 'bypass_csp', url: url });" +
            "   const res = await resultCallback;" +
            "   return new Response(res.response, { status: res.status, statusText: res.statusText });" +
            "   /*return originalFetch(...args);*/" +
            "};"
        const proxyUrl = URL.createObjectURL(
            new OriginalBlob([fetchCode + window.maplibreWorkerSourceCode], { type: "application/javascript" }),
        )
        const maplibreOverridedWorker = new OriginalWorker(proxyUrl, options);
        window.maplibreOverridedWorker = maplibreOverridedWorker
        window.postMessage({ type: "create_worker" }, "https://www.openstreetmap.org")
        
        return maplibreOverridedWorker
    }
`);
