import { log } from "./runtime-utils.mjs"

function formatError(error) {
    if (!error) {
        return "<unknown error>"
    }
    return `${error.name || "Error"}: ${error.message || String(error)}`
}

function summarizeValue(value) {
    if (value === null) {
        return "null"
    }
    if (Array.isArray(value)) {
        return `array(length=${value.length})`
    }
    const type = typeof value
    if (type !== "object") {
        return `${type}(${String(value)})`
    }
    const keys = Object.keys(value).slice(0, 8).join(",")
    const ctor = value.constructor?.name || "Object"
    return `${ctor}{${keys}}`
}

function formatCaptureState(state) {
    if (!state || typeof state !== "object") {
        return "state=<unavailable>"
    }
    const url = state.url || "<unknown>"
    const readyState = state.readyState || "<unknown>"
    const bufferType = state.bufferType || "<unknown>"
    const bufferLength = Number.isFinite(state.bufferLength) ? state.bufferLength : "<unknown>"
    return `url=${url}, readyState=${readyState}, captureInstalled=${Boolean(state.captureInstalled)}, bufferType=${bufferType}, bufferLength=${bufferLength}`
}

async function readPageCaptureState(driver) {
    try {
        return await driver.executeScript(() => ({
            url: window.location?.href || "",
            readyState: document.readyState,
            captureInstalled: Boolean(window.__e2eConsoleCaptureInstalled),
            bufferType: Object.prototype.toString.call(window.__e2eConsoleBuffer),
            bufferLength: Array.isArray(window.__e2eConsoleBuffer) ? window.__e2eConsoleBuffer.length : null,
        }))
    } catch {
        return null
    }
}

/**
 * Installs browser-side console/event capture hook in current tab.
 * @param {import("selenium-webdriver").WebDriver} driver
 * @returns {Promise<void>}
 */
export async function installConsoleCapture(driver) {
    await driver.executeScript(() => {
        if (window.__e2eConsoleCaptureInstalled) {
            return
        }

        window.__e2eConsoleBuffer = []
        const levels = ["log", "info", "warn", "error", "debug"]
        const serialize = value => {
            if (typeof value === "string") return value
            if (value instanceof Error) return `${value.name}: ${value.message}`
            try {
                return JSON.stringify(value)
            } catch {
                return String(value)
            }
        }
        const push = (level, args) => {
            window.__e2eConsoleBuffer.push({
                ts: Date.now(),
                level,
                text: Array.from(args).map(serialize).join(" "),
            })
        }

        for (const level of levels) {
            const original = console[level]?.bind(console)
            if (!original) continue
            console[level] = (...args) => {
                push(level, args)
                original(...args)
            }
        }

        window.addEventListener("error", event => {
            push("error", [
                `window.onerror: ${event.message}`,
                event.filename || "",
                `${event.lineno || 0}:${event.colno || 0}`,
            ])
        })

        window.addEventListener("unhandledrejection", event => {
            push("error", ["unhandledrejection:", event.reason])
        })

        window.__e2eConsoleCaptureInstalled = true
    })
}

/**
 * Flushes captured browser console lines and forwards to runner logger.
 * @param {import("selenium-webdriver").WebDriver} driver
 * @param {string} label
 * @param {(message: string) => void} [logFn=log]
 * @returns {Promise<void>}
 */
export async function flushConsoleCapture(driver, label, logFn = log) {
    let result
    try {
        result = await driver.executeScript(() => {
            const rawBuffer = window.__e2eConsoleBuffer
            const entries = Array.isArray(rawBuffer) ? rawBuffer : []
            window.__e2eConsoleBuffer = []
            return {
                entries,
                state: {
                    url: window.location?.href || "",
                    readyState: document.readyState,
                    captureInstalled: Boolean(window.__e2eConsoleCaptureInstalled),
                    bufferType: Object.prototype.toString.call(rawBuffer),
                    bufferLength: Array.isArray(rawBuffer) ? rawBuffer.length : null,
                },
            }
        })
    } catch (error) {
        const state = await readPageCaptureState(driver)
        logFn(
            `[browser:${label}:warn] console capture flush failed: ${formatError(error)}; ${formatCaptureState(state)}`,
        )
        return
    }

    const entries = Array.isArray(result?.entries) ? result.entries : Array.isArray(result) ? result : []
    if (!Array.isArray(result?.entries) && !Array.isArray(result)) {
        const state = result?.state || (await readPageCaptureState(driver))
        logFn(
            `[browser:${label}:warn] console capture returned unexpected payload: ${summarizeValue(result)}; ${formatCaptureState(state)}`,
        )
    } else if (result?.state && result.state.bufferType !== "[object Array]") {
        logFn(
            `[browser:${label}:warn] console capture buffer was reset from ${result.state.bufferType}; ${formatCaptureState(result.state)}`,
        )
    }

    for (const entry of entries) {
        const level = entry?.level || "log"
        const text = entry?.text || ""
        logFn(`[browser:${label}:${level}] ${text}`)
    }
}

/**
 * Best-effort console flush without throwing.
 * @param {import("selenium-webdriver").WebDriver} driver
 * @param {string} label
 * @param {(message: string) => void} [logFn=log]
 * @returns {Promise<void>}
 */
export async function safeFlushConsoleCapture(driver, label, logFn = log) {
    try {
        await installConsoleCapture(driver)
        await flushConsoleCapture(driver, label, logFn)
    } catch {
        // ignored
    }
}
