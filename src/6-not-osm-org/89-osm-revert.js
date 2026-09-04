//<editor-fold desc="osm-revert" defaultstate="collapsed">

if (location.origin === "https://revert.monicz.dev") {
    injectJSIntoPage(`
    const originalFetch = window.fetch;
    let overpassRequestsLimiter = 0 

    window.fetch = async (...args) => {
        if (window.disableRetriesForOsmRevert) {
            return await originalFetch(...args)
        }
        async function sleep(ms) {
            console.debug("sleep " + ms + "ms")
            await new Promise(r => setTimeout(r, ms))
        }

        try {
            if (args[0].endsWith("/interpreter")) {
                const data = args[1].body.get("data")
                args[1].body.set("data", data.replace("[timeout:180][bbox", "[timeout:60][maxsize:64Mi][bbox"))
                for (let i = 0; i < 3; i++) {
                    let res
                    try {
                        overpassRequestsLimiter++
                        if (overpassRequestsLimiter > 2 && args[0].includes("overpass-api.de")) {
                            overpassRequestsLimiter = 0
                            window.log.value += "better-osm-org: wait after second request...\\n"
                            await sleep(2000)
                        }
                        res = await originalFetch(...args)
                        if (res.ok) {
                            return res
                        }
                    } catch (e) {
                        if (e?.message?.includes("NetworkError")) {
                            window.log.value += "better-osm-org: " + e + " wait for retry...\\n"
                            await sleep(10 * 1000)
                            continue
                        } else {
                            throw e
                        }
                    }
                    if (res.status === 504) {
                        window.log.value += "better-osm-org: Overpass return 504, wait for retry...\\n"
                        await sleep(10 * 1000)
                    } else if (res.status === 429) {
                        window.log.value += "better-osm-org: Overpass return 429, wait 30s for retry...\\n"
                        await sleep(31 * 1000)
                    } else {
                        await sleep(15 * 1000)
                    }
                }
                args[1].body.set("data", data)
                return await originalFetch(...args)
            }
        } catch (e) {
            console.error(e)
            return originalFetch(...args);
        }
        return originalFetch(...args);
    }

    `)
}

//</editor-fold>
