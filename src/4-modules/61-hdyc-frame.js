//<editor-fold desc="hdyc-frame" defaultstate="collapsed">

function inFrame() {
    return window.location !== window.parent.location
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
        `)
    const loginLink = document.getElementById("loginLink")
    if (loginLink) {
        const warn = document.createElement("div")
        warn.id = "hdyc-warn"
        injectCSSIntoSimplePage(`
                #hdyc-warn, #hdycLink {
                    text-align: left !important;
                    width: 50%;
                    position: relative;
                    left: 35%;
                    right: 33%;
                }
            `)
        if (isFirefox) {
            warn.textContent = t("userProfile.disableTrackingProtection")

            document.getElementById("authenticate").before(warn)
            const hdycLink = document.createElement("a")
            const match = location.pathname.match(/^\/user\/([^/]+)$/)
            hdycLink.href = "https://www.hdyc.neis-one.org/user/" + (match ? match[1] : "")
            hdycLink.textContent = t("userProfile.goToHdyc")
            hdycLink.target = "_blank"
            hdycLink.id = "hdycLink"
            document.getElementById("authenticate").before(document.createElement("br"))
            document.getElementById("authenticate").before(hdycLink)
            document.getElementById("authenticate").remove()
            window.parent.postMessage({ height: document.body.scrollHeight }, "*")
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
                window.parent.postMessage({ height: document.body.scrollHeight }, "*")
            }
            img_help.src = "https://raw.githubusercontent.com/deevroman/better-osm-org/master/misc/img/hdyc-fix-in-chrome.png"
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
    try {
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
    } catch (e) {
        console.error(e)
    }
    window.parent.postMessage({ height: document.body.scrollHeight }, "*")
}

//</editor-fold>
