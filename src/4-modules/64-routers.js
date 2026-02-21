//<editor-fold desc="routers" defaultstate="collapsed">

window.addEventListener("message", async e => {
    if (e.origin !== location.origin) return
    if (e.data.type !== "add_router_data_date") return
    if (!GM_config.get("RoutersTimestamps")) return

    function addTime(text) {
        document.querySelectorAll(".routing-timestamp").forEach(i => i.remove())
        const elem = document.createElement("p")
        elem.classList.add("text-center", "routing-timestamp")
        elem.textContent = text
        elem.title = "added by better-osm-org"
        document.querySelector("#sidebar_content").appendChild(elem)
    }

    const url = e.data.url
    if (url.startsWith("https://valhalla1.openstreetmap.de")) {
        await abortableSleep(500, getAbortController())
        // TODO abortion controller
        externalFetchRetry({ url: "https://valhalla1.openstreetmap.de/status", responseType: "json" }).then(r => {
            addTime("Valhalla data time: " + new Date(r.response["tileset_last_modified"] * 1000).toISOString())
        })
    } else if (url.startsWith("https://routing.openstreetmap.de")) {
        document.querySelectorAll(".routing-timestamp").forEach(i => i.remove())
        const dataUrls = []

        if (url.includes("/routed-bike/")) {
            dataUrls.push(
                ["europe-asia", "https://map.project-osrm.org/timestamps/bikeeuasi.data_timestamp"],
                ["africa-oceania", "https://map.project-osrm.org/timestamps/bikeafoce.data_timestamp"],
                ["americas", "https://map.project-osrm.org/timestamps/bikeam.data_timestamp"],
            )
        } else if (url.includes("/routed-foot/")) {
            dataUrls.push(
                ["europe-asia", "https://map.project-osrm.org/timestamps/footeuasi.data_timestamp"],
                ["africa-oceania", "https://map.project-osrm.org/timestamps/footafoce.data_timestamp"],
                ["americas", "https://map.project-osrm.org/timestamps/footam.data_timestamp"],
            )
        } else if (url.includes("/routed-car/")) {
            dataUrls.push(
                ["europe-asia", "https://map.project-osrm.org/timestamps/careuasi.data_timestamp"],
                ["africa-oceania", "https://map.project-osrm.org/timestamps/carafoce.data_timestamp"],
                ["americas", "https://map.project-osrm.org/timestamps/caram.data_timestamp"],
            )
        } else {
            console.error("Unknown router mode", url)
        }
        const times = []
        for (let dataUrl of dataUrls) {
            const res = await externalFetchRetry({ url: dataUrl[1] })
            times.push([dataUrl[0], new DOMParser().parseFromString(res.response, "text/html").body.textContent.trim()])
        }
        setTimeout(() => {
            document.querySelectorAll(".routing-timestamp").forEach(i => i.remove())
            times.forEach(([name, time]) => {
                const elem = document.createElement("p")
                elem.classList.add("text-center", "routing-timestamp")
                elem.textContent = `Routing data time for ${name}: ` + time
                elem.title = "added by better-osm-org"
                document.querySelector("#sidebar_content").appendChild(elem)
            })
        })
    } else if (url.startsWith("https://graphhopper.com/api/1/route")) {
        document.querySelectorAll(".routing-timestamp").forEach(i => i.remove())
        addTime("Routing data time: " + e.data.time)
    } else {
        document.querySelectorAll(".routing-timestamp").forEach(i => i.remove())
    }
})

//</editor-fold>
