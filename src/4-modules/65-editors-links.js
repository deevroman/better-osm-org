//<editor-fold desc="editors-links" defaultstate="collapsed">

let coordinatesObserver = null

function setupNewEditorsLinks() {
    const firstRun = document.getElementsByClassName("custom_editors").length === 0
    const editorsList = document.querySelector("#edit_tab ul")
    if (!editorsList) {
        return
    }
    const curURL = editorsList.querySelector("li a").href
    const match = curURL.match(/map=(\d+)\/([-\d.]+)\/([-\d.]+)(&|$)/)
    if (!match && !curURL.includes("edit?editor=id")) {
        return
    }
    try {
        coordinatesObserver?.disconnect()
        if (!curURL.includes("edit?editor=id") || !match) {
            return
        }
        const zoom = match[1]
        const lat = match[2]
        const lon = match[3]
        {
            const rapidLink = "https://mapwith.ai/rapid#poweruser=true&map="
            let newElem
            if (firstRun) {
                newElem = editorsList.querySelector("li").cloneNode(true)
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
        {
            // https://osmpie.org/app/?pos=30.434481&pos=59.933311&zoom=18.91
            const osmpieLink = "https://osmpie.org/app/"
            let newElem
            if (firstRun) {
                newElem = editorsList.querySelector("li").cloneNode(true)
                newElem.classList.add("custom_editors", "osmpie_btn")
                newElem.querySelector("a").textContent = "Edit with OSM Perfect Intersection Editor"
                newElem.querySelector("a").setAttribute("target", "_blank")
                newElem.title = "OSM Perfect Intersection Editor"
            } else {
                newElem = document.querySelector(".osmpie_btn")
            }
            const actualHref = `${osmpieLink}?pos=${lon}&pos=${lat}&zoom=${parseInt(zoom)}`
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
        coordinatesObserver = new MutationObserver(setupNewEditorsLinks)
        coordinatesObserver.observe(editorsList, { subtree: true, childList: true, attributes: true })
    }
}

//</editor-fold>
