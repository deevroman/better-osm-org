//<editor-fold desc="network-utils" defaultstate="collapsed">

/**
 * @param details {Tampermonkey.Request}
 * @return {Promise<Tampermonkey.Response>}
 */
async function externalFetch(details) {
    if (GM_info.scriptHandler === "FireMonkey" && parseFloat(GM_info.version) < 3.0) {
        const res = await GM.fetch(details.url, details)
        if (details["responseType"] === "json") {
            res.response = res.json
        } else {
            res.responseText = res.text
        }
        return res
    } else {
        return await GM.xmlHttpRequest(details)
    }
}

/**
 * @param details {Tampermonkey.Request}
 * @return {Promise<Tampermonkey.Response>}
 */
async function externalFetchRetry(details) {
    if (GM_info.scriptHandler === "FireMonkey" && parseFloat(GM_info.version) < 3.0) {
        const res = await _fetchRetry(GM.fetch, details.url, details)
        if (details["responseType"] === "json") {
            res.response = res.json
        } else {
            res.responseText = res.text
        }
        return res
    } else {
        // https://github.com/erosman/firemonkey/issues/33
        return await _fetchRetry(async (...args) => await GM.xmlHttpRequest(...args), details)
    }
}

/**
 * @param input {string | Request}
 * @param [init] {RequestInit}
 * @return {Promise<Response>}
 */
async function fetchRetry(input, init) {
    return await _fetchRetry(fetch, input, init)
}

async function _fetchRetry(fetchImpl, ...args) {
    const RETRY_COUNT = 10
    let count = RETRY_COUNT
    while (count > 0) {
        try {
            const res = await fetchImpl(...args)
            if (res.status === 509 || res.status === 429 || res.status === 504) {
                console.warn(`HTTP ${res.status}. Waiting before retry`)
                let sleepTime
                if (res.headers?.get("retry-after")) {
                    sleepTime = (parseInt(res.headers.get("retry-after")) + 1) * 1000
                } else {
                    if (res.status === 504) {
                        sleepTime = (10 + Math.random() * 10) * 1000
                    } else {
                        sleepTime = (30 + Math.random() * 10) * 1000
                    }
                }
                await abortableSleep(sleepTime, getAbortController());
                count -= 1
                if (count === 0) {
                    console.error("oops, DOS block")
                    setTimeout(async () => {
                        getMap()?.attributionControl?.setPrefix(escapeHtml(await res.text()))
                    })
                    throw "rate limit ban is too long"
                }
                continue
            }
            return res
        } catch (error) {
            if (!error?.message || !error.message.startsWith("NetworkError")) {
                throw error
            }
            console.error(error, "fetch. Remain retries:", count)
            await abortableSleepUntilNextXthSeconds(10, getAbortController())
        }
        count -= 1
        if (!navigator.onLine) {
            console.log("wait online")
            await new Promise(resolve => {
                window.addEventListener("online", () => {
                    console.log("online")
                    resolve()
                })
            })
            console.log("online")
            continue
        }
        if (count === 0) {
            console.error("Big wait before new retries")
            await abortableSleep(60 * 1000, getAbortController())
            count = RETRY_COUNT
        }
    }
}

const fetchBlobWithCache = (() => {
    const cache = new Map()

    return async (url, options = {}) => {
        if (cache.has(url)) {
            return cache.get(url)
        }

        const promise = externalFetchRetry({
            url: url,
            responseType: "blob",
            headers: options.headers ?? {},
        })
        cache.set(url, promise)

        try {
            const result = await promise
            cache.set(url, result)
            if (options?.timeout) {
                setTimeout(() => {
                    cache.delete(url)
                    console.debug("Purged cache for", url)
                }, options.timeout)
            }
            return result
        } catch (error) {
            cache.delete(url)
            throw error
        }
    }
})()

/**
 * @param imgSrc {string}
 * @return {Promise<string>}
 */
async function fetchImageWithCache(imgSrc) {
    const res = await fetchBlobWithCache(imgSrc)
    const blob = res.response

    return await new Promise(resolve => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.readAsDataURL(blob)
    })
}

const fetchJSONWithCache = (() => {
    /**@type {Map<string, Object | Promise<Object>>}*/
    const cache = new Map()

    return async (url, init = {}, responseChecker = _ => true) => {
        if (cache.has(url)) {
            return cache.get(url)
        }

        const promise = fetchRetry(url, init).then(res => {
            if (!res) console.trace()
            if (responseChecker(res)) {
                return res.json()
            }
        })
        cache.set(url, promise)

        try {
            const result = await promise
            cache.set(url, result)
            return result
        } catch (error) {
            cache.delete(url)
            throw error
        }
    }
})()

const fetchJSONorResWithCache = (() => {
    /**@type {Map<string, Object | Promise<Object|Response>>}*/
    const cache = new Map()

    return async (url, init = {}) => {
        if (cache.has(url)) {
            return cache.get(url)
        }

        const promise = fetchRetry(url, init).then(res => {
            if (!res.ok) return res
            return res.json()
        })
        cache.set(url, promise)

        try {
            const result = await promise
            cache.set(url, result)
            return result
        } catch (error) {
            cache.delete(url)
            throw error
        }
    }
})()

const fetchTextWithCache = (() => {
    /**@type {Map<string, string | undefined | Promise<string | undefined> >}*/
    const cache = new Map()
    /**
     * @param {string} url
     * @return {Promise<string>}
     */
    return async url => {
        if (cache.has(url)) {
            return cache.get(url)
        }

        const promise = externalFetchRetry({ url: url }).then(r => r.responseText)
        cache.set(url, promise)

        try {
            const result = await promise
            cache.set(url, result)
            return result
        } catch (error) {
            cache.delete(url)
            throw error
        }
    }
})()

const originalFetchTextWithCache = (() => {
    /**@type {Map<string, string | undefined | Promise<string | undefined> >}*/
    const cache = new Map()

    /**
     * @param {string} url
     * @param {RequestInit} init
     */
    return async (url, init) => {
        if (cache.has(url)) {
            return cache.get(url)
        }

        const promise = fetchRetry(url, init).then(res => {
            if (!res) console.trace()
            return res.text()
        })
        cache.set(url, promise)

        try {
            const result = await promise
            cache.set(url, result)
            return result
        } catch (error) {
            cache.delete(url)
            throw error
        }
    }
})()

function resourceCacher(url, storageKey, name, dateDelta, type) {
    let database
    async function load() {
        const raw_data = (
            await externalFetchRetry({
                url: url,
                responseType: type,
            })
        ).response
        if (!raw_data) {
            throw `${name} not downloaded`
        }
        database = raw_data
        console.log(`${name} database updated`)
        await GM.setValue(
            storageKey,
            JSON.stringify({
                raw_data: raw_data,
                cacheTime: new Date(),
            }),
        )
    }
    return {
        get: () => database,
        init: async function () {
            if (database) return
            const cache = await GM.getValue(storageKey, "")
            if (database) return
            if (cache) {
                console.log(`${name} cached`)
                const json = JSON.parse(cache)
                const cacheTime = new Date(json["cacheTime"])
                const timeLater = new Date(cacheTime.getTime() + dateDelta)
                if (timeLater < new Date()) {
                    console.log("but cache outdated")
                    setTimeout(load, 0)
                }
                database = JSON.parse(cache)["raw_data"]
                return
            }
            console.log(`loading ${name}`)
            try {
                await load()
            } catch (e) {
                console.log(`loading ${name} failed`, e)
            }
        },
    }
}

//</editor-fold>
