//<editor-fold desc="editor-utils" defaultstate="collapsed">

/**
 * @param {XMLDocument} doc
 * @param {HTMLElement} node
 * @param {Object.<string, string>} tags
 */
function tagsToXml(doc, node, tags) {
    for (const [k, v] of Object.entries(tags)) {
        const tag = doc.createElement("tag")
        tag.setAttribute("k", k)
        tag.setAttribute("v", v)
        node.appendChild(tag)
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
        auto: true,
    })
}

//</editor-fold>
