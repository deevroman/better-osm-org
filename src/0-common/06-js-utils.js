//<editor-fold desc="utils" defaultstate="collapsed">

// For WebStorm: Settings | Editor | Language Injections
// Places Patterns + jsLiteralExpression(jsArgument(jsReferenceExpression().withQualifiedName("injectJSIntoPage"), 0))

/**
 * @param {string} text
 */
function injectJSIntoPage(text) {
    GM_addElement("script", {
        textContent: text,
    })
}

/**
 * @param {string} text
 */
function injectCSSIntoOSMPage(text) {
    if ((GM_info.scriptHandler === "FireMonkey" && parseFloat(GM_info.version) < 3.0) || GM_info.scriptHandler === "Userscripts" || GM_info.scriptHandler === "Greasemonkey" || isSafari) {
        const styleElem = document.querySelector("style")
        if (!styleElem) {
            console.trace("<style> elem not found. Try wait this elem")
            setTimeout(async () => {
                for (let i = 0; i < 20; i++) {
                    const styleElem = document.querySelector("style")
                    if (!styleElem) {
                        await sleep(100)
                        continue
                    }
                    styleElem.innerHTML += text
                }
            }, 100)
            return
        }
        styleElem.innerHTML += text
        if (!isSafari) {
            styleElem.parentElement.appendChild(styleElem)
        }
    } else {
        return GM_addElement(document.head, "style", {
            textContent: text,
        })
    }
}

/**
 * @param {string} text
 */
function injectCSSIntoSimplePage(text) {
    return GM_addElement(document.head, "style", {
        textContent: text,
    })
}

// In Tampermonkey access to Math.* very slow
const min = Math.min
const max = Math.max

/**
 * @type {Object.<string, AbortController>}
 */
const abortDownloadingControllers = {}

/**
 * @return {AbortController}
 */
function getAbortController() {
    return (abortDownloadingControllers[location.pathname] ??= new AbortController())
}

function abortPrevControllers(reason = null) {
    console.log("abort prev controllers")
    Object.entries(abortDownloadingControllers).forEach(([path, controller]) => {
        if (path !== location.pathname) {
            console.log("abort for", path)
            controller.abort(reason)
            delete abortDownloadingControllers[path]
        }
    })
}

/**
 * @param ms {number}
 * @param signal {AbortSignal}
 * @return {Promise<void>}
 */
async function abortableSleep(ms, { signal }) {
    console.debug(`sleep ${ms}ms`)
    await new Promise((resolve, reject) => {
        signal?.throwIfAborted()

        function done() {
            resolve()
            signal?.removeEventListener("abort", stop)
        }

        function stop() {
            console.debug("sleep aborted")
            reject(this.reason)
            clearTimeout(timer)
        }

        const timer = setTimeout(done, ms)
        signal?.addEventListener("abort", stop)
    })
}

async function sleep(ms) {
    console.debug(`sleep ${ms}ms`)
    await new Promise(r => setTimeout(r, ms))
}

/**
 * @param X {number}
 * @param signal {AbortSignal}
 * @return {Promise<unknown>}
 */
async function abortableSleepUntilNextXthSeconds(X, { signal }) {
    const nowTime = new Date().getTime()
    const nextTime = new Date(Math.ceil(nowTime / 1000 / X) * X * 1000)
    const delay = nextTime - nowTime
    return await abortableSleep(delay, { signal })
}

/**
 * @param {Event} e
 * @param {string} text
 */
function copyAnimation(e, text) {
    console.log(`Copying ${text} to clipboard was successful!`)
    e.target.classList.add("copied")
    setTimeout(() => {
        e.target.classList.remove("copied")
        e.target.classList.add("was-copied")
        setTimeout(() => e.target.classList.remove("was-copied"), 300)
    }, 300)
}

/**
 * @param {function(): boolean|void} fn
 * @param {number} interval
 * @param {number} timeout
 */
function tryApplyModule(fn, interval, timeout) {
    const intervalTimerId = setInterval(async () => {
        if ((await fn()) === true) {
            console.debug("fast stop calling", fn.name)
            clearInterval(intervalTimerId)
            clearTimeout(timeoutTimerId)
        }
    }, interval)
    const timeoutTimerId = setTimeout(() => {
        clearInterval(intervalTimerId)
        console.debug("stop calling", fn.name)
    }, timeout)
    if (fn() === true) {
        clearInterval(intervalTimerId)
        clearTimeout(timeoutTimerId)
    }
}

//</editor-fold>
