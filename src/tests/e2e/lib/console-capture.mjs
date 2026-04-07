import { log } from "./runtime-utils.mjs"

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

export async function flushConsoleCapture(driver, label, logFn = log) {
    const entries = await driver.executeScript(() => {
        const buffer = Array.isArray(window.__e2eConsoleBuffer) ? window.__e2eConsoleBuffer : []
        window.__e2eConsoleBuffer = []
        return buffer
    })
    for (const entry of entries) {
        const level = entry?.level || "log"
        const text = entry?.text || ""
        logFn(`[browser:${label}:${level}] ${text}`)
    }
}

export async function safeFlushConsoleCapture(driver, label, logFn = log) {
    try {
        await installConsoleCapture(driver)
        await flushConsoleCapture(driver, label, logFn)
    } catch {
        // ignored
    }
}
