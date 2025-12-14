//<editor-fold desc="better-error-page" defaultstate="collapsed">

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
    setTimeout(() => {
        const iframe = GM_addElement("iframe", {
            src: "https://deevroman.github.io/Dino-Game-Clone",
            width: "70%",
            height: "250px",
            title: "better-osm-org easter egg :-)",
        })
        iframe.style.border = "0"
        document.body.appendChild(iframe)
    }, 4000)
}

//</editor-fold>
