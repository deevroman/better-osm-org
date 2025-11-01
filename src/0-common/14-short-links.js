//<editor-fold desc="short-links" defaultstate="collapsed">

/**
 * @param {string} text
 * @returns {string}
 */
function shortOsmOrgLinksInText(text) {
    // prettier-ignore
    return text
        .replaceAll("https://www.openstreetmap.org", "osm.org")
        .replaceAll("https://wiki.openstreetmap.org/wiki/", "osm.wiki/")
        .replaceAll("https://wiki.openstreetmap.org", "osm.wiki")
        .replaceAll("https://community.openstreetmap.org", "c.osm.org")
        .replaceAll("https://openstreetmap.org", "osm.org")
}

function shortOsmOrgLinks(elem) {
    if (!GM_config.get("ImagesAndLinksInTags")) return
    elem?.querySelectorAll('a[href^="https://www.openstreetmap.org"], a[href^="https://wiki.openstreetmap.org"], a[href^="https://community.openstreetmap.org"], a[href^="https://openstreetmap.org"]')?.forEach(i => {
        i.textContent = shortOsmOrgLinksInText(i.textContent)
    })
}
//</editor-fold>
