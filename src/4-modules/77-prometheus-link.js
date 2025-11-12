//<editor-fold desc="better-tags-paste" defaultstate="collapsed">

function setupPrometheusLink() {
    if (document.querySelector("h2")?.textContent !== "This website is under heavy load (queue full)") {
        return
    }
    const hint = document.createElement("div")
    hint.textContent = ""
    hint.innerHTML = `
<a href="https://prometheus.openstreetmap.org/d/5rTT87FMk/web-site">Website prometheus</a>
<br>
<br>
<a href="https://github.com/openstreetmap/openstreetmap-website">GitHub openstreetmap-website</a>
<br>
<br>
<a href="https://github.com/openstreetmap/operations/issues?q=sort%3Aupdated-desc+is%3Aissue+is%3Aopen">OpenStreetMap operations issues</a>
`
    document.body.appendChild(hint)
}

//</editor-fold>
