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

/**
 *
 * @param {string} text
 * @param {boolean} strict
 * @return {Map<string, string>}
 */
function buildTags(text, strict = false) {
    const lines = text.split("\n")
    const tags = new Map()
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        let eqPos = line.indexOf("=")
        if (eqPos <= 0 || eqPos === line.length - 1) {
            eqPos = line.indexOf("\t")
            if (eqPos <= 0 || eqPos === line.length - 1) {
                if (strict && line.trim() !== "") {
                    throw `Empty key or value in line №${i}: ${line}`
                }
                continue
            }
        }
        const k = line.substring(0, eqPos).trim()
        const v = line.substring(eqPos + 1).trim()
        if (v === "" || k === "") {
            if (strict && line.trim() !== "") {
                throw `Empty key or value in line №${i + 1}: ${line}`
            }
            continue
        }
        tags.set(k, v.replaceAll("\\\\", "\n"))
    }
    return tags
}

/**
 * @param {Map<string, string>} a
 * @param {Map<string, string>} b
 * @return {boolean}
 */
function isDifferentTagsMap(a, b) {
    return JSON.stringify(Object.fromEntries(a)) !== JSON.stringify(Object.fromEntries(b))
}

//</editor-fold>
