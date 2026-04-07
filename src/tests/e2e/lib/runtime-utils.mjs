/**
 * Logs message with ISO timestamp prefix.
 * @param {string} message
 * @returns {void}
 */
export function log(message) {
    const ts = new Date().toISOString()
    console.log(`[${ts}] ${message}`)
}

/**
 * Async timeout helper.
 * @param {number} ms
 * @returns {Promise<void>}
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Builds pause hook for interactive debugging.
 * @param {number} stepPauseMs
 * @param {(message: string) => void} [logFn=log]
 * @returns {(stage: string) => Promise<void>}
 */
export function createPause(stepPauseMs, logFn = log) {
    return async stage => {
        if (!Number.isFinite(stepPauseMs) || stepPauseMs <= 0) {
            return
        }
        logFn(`Pause ${stepPauseMs}ms after step: ${stage}`)
        await sleep(stepPauseMs)
    }
}

/**
 * Resolves locale config used for Firefox preferences and HTTP headers.
 * @param {string} input
 * @returns {{id: string, browserLocale: string, acceptLanguage: string}}
 */
export function resolveLocaleConfig(input) {
    const normalized = (input || "en").trim().toLowerCase()
    if (normalized === "ru" || normalized === "ru-ru") {
        return {
            id: "ru",
            browserLocale: "ru-RU",
            acceptLanguage: "ru-RU,ru,en-US,en",
        }
    }

    if (normalized === "en" || normalized === "en-us") {
        return {
            id: "en",
            browserLocale: "en-US",
            acceptLanguage: "en-US,en",
        }
    }

    return {
        id: normalized || "en",
        browserLocale: input,
        acceptLanguage: input,
    }
}
