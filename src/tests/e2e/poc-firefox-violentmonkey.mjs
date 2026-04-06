#!/usr/bin/env node

import "geckodriver"
import { Builder, By } from "selenium-webdriver"
import firefox from "selenium-webdriver/firefox.js"
import fs from "node:fs/promises"
import http from "node:http"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, "../../..")
const artifactsDir = path.join(__dirname, "artifacts")

const DEFAULT_TARGET_URL = "https://master.apis.dev.openstreetmap.org"
const targetUrl = process.env.E2E_TARGET_URL || DEFAULT_TARGET_URL
const assertSelector = process.env.E2E_ASSERT_SELECTOR || ".turn-on-satellite-from-pane"
const targetOrigin = (() => {
    try {
        return new URL(targetUrl).origin
    } catch {
        return ""
    }
})()

const userscriptPath = process.env.E2E_USER_SCRIPT_PATH || path.join(repoRoot, "better-osm-org.user.js")
const userscriptUrlFromEnv = process.env.E2E_USER_SCRIPT_URL
const scriptServerHost = process.env.E2E_SCRIPT_HOST || "127.0.0.1"
const scriptServerPort = Number.parseInt(process.env.E2E_SCRIPT_PORT || "17321", 10)
const firefoxBinaryFromEnv = process.env.E2E_FIREFOX_BINARY

const scriptManagerName = process.env.E2E_SCRIPT_MANAGER_NAME || "Violentmonkey"
const scriptManagerXpi = process.env.E2E_SCRIPT_MANAGER_XPI || process.env.VIOLENTMONKEY_XPI
const seleniumRemoteUrl = process.env.SELENIUM_REMOTE_URL
const headless = !["0", "false", "no"].includes((process.env.E2E_HEADLESS || "1").toLowerCase())
const stepPauseMs = Number.parseInt(process.env.E2E_STEP_PAUSE_MS || "0", 10)
const requireSelector = !["0", "false", "no"].includes((process.env.E2E_REQUIRE_SELECTOR || "0").toLowerCase())
const printBrowserConsole = (() => {
    const value = process.env.E2E_PRINT_BROWSER_CONSOLE
    if (typeof value === "undefined") {
        return Boolean(process.env.CI)
    }
    return !["0", "false", "no"].includes(value.toLowerCase())
})()

const installTimeoutMs = Number.parseInt(process.env.E2E_INSTALL_TIMEOUT_MS || "45000", 10)
const assertTimeoutMs = Number.parseInt(process.env.E2E_ASSERT_TIMEOUT_MS || "30000", 10)
const targetLoadTimeoutMs = Number.parseInt(process.env.E2E_TARGET_LOAD_TIMEOUT_MS || "45000", 10)

function printHelp() {
    console.log(`
Firefox userscript manager E2E PoC

Required env:
  E2E_SCRIPT_MANAGER_XPI=/absolute/path/to/manager.xpi
  (legacy alias: VIOLENTMONKEY_XPI=...)

Optional env:
  E2E_SCRIPT_MANAGER_NAME=Violentmonkey|Tampermonkey|Firemonkey
  E2E_TARGET_URL=https://master.apis.dev.openstreetmap.org
  E2E_ASSERT_SELECTOR=.turn-on-satellite-from-pane
  E2E_USER_SCRIPT_PATH=/absolute/path/to/better-osm-org.user.js
  E2E_USER_SCRIPT_URL=http://127.0.0.1:17321/better-osm-org.user.js
  E2E_SCRIPT_HOST=127.0.0.1
  E2E_SCRIPT_PORT=17321
  E2E_FIREFOX_BINARY=/Applications/Firefox.app/Contents/MacOS/firefox
  E2E_HEADLESS=1|0
  E2E_STEP_PAUSE_MS=0
  E2E_REQUIRE_SELECTOR=1|0
  E2E_PRINT_BROWSER_CONSOLE=1|0
  SELENIUM_REMOTE_URL=http://127.0.0.1:4444/wd/hub
  E2E_INSTALL_TIMEOUT_MS=45000
  E2E_ASSERT_TIMEOUT_MS=30000
  E2E_TARGET_LOAD_TIMEOUT_MS=45000

Example:
  npm run build
  E2E_SCRIPT_MANAGER_NAME=Violentmonkey E2E_SCRIPT_MANAGER_XPI=/tmp/violentmonkey.xpi npm run e2e:poc
`.trim())
}

function log(message) {
    const ts = new Date().toISOString()
    console.log(`[${ts}] ${message}`)
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function maybePause(stage) {
    if (!Number.isFinite(stepPauseMs) || stepPauseMs <= 0) {
        return
    }
    log(`Pause ${stepPauseMs}ms after step: ${stage}`)
    await sleep(stepPauseMs)
}

async function installConsoleCapture(driver) {
    if (!printBrowserConsole) {
        return
    }
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
            push("error", [`window.onerror: ${event.message}`, event.filename || "", `${event.lineno || 0}:${event.colno || 0}`])
        })

        window.addEventListener("unhandledrejection", event => {
            push("error", ["unhandledrejection:", event.reason])
        })

        window.__e2eConsoleCaptureInstalled = true
    })
}

async function flushConsoleCapture(driver, label) {
    if (!printBrowserConsole) {
        return
    }
    const entries = await driver.executeScript(() => {
        const buffer = Array.isArray(window.__e2eConsoleBuffer) ? window.__e2eConsoleBuffer : []
        window.__e2eConsoleBuffer = []
        return buffer
    })
    for (const entry of entries) {
        const level = entry?.level || "log"
        const text = entry?.text || ""
        log(`[browser:${label}:${level}] ${text}`)
    }
}

async function safeFlushConsoleCapture(driver, label) {
    if (!printBrowserConsole) {
        return
    }
    try {
        await installConsoleCapture(driver)
        await flushConsoleCapture(driver, label)
    } catch {
        // ignored
    }
}

async function resolveFirefoxBinary() {
    if (firefoxBinaryFromEnv) {
        return firefoxBinaryFromEnv
    }
    if (process.platform !== "darwin") {
        return null
    }

    const macCandidates = [
        "/Applications/Firefox.app/Contents/MacOS/firefox",
        "/Applications/FirefoxStable.app/Contents/MacOS/firefox",
        "/Applications/Firefox Nightly.app/Contents/MacOS/firefox",
    ]

    for (const candidate of macCandidates) {
        try {
            await fs.access(candidate)
            return candidate
        } catch {
            // keep trying
        }
    }
    return null
}

async function startUserscriptServer() {
    if (userscriptUrlFromEnv) {
        log(`Using userscript URL from env: ${userscriptUrlFromEnv}`)
        return { server: null, userscriptUrl: userscriptUrlFromEnv }
    }

    const scriptSource = await fs.readFile(userscriptPath, "utf8")

    const server = http.createServer((req, res) => {
        const reqUrl = new URL(req.url || "/", `http://${scriptServerHost}:${scriptServerPort}`)

        if (reqUrl.pathname === "/better-osm-org.user.js") {
            res.writeHead(200, {
                "content-type": "text/plain; charset=utf-8",
                "cache-control": "no-store",
            })
            res.end(scriptSource)
            return
        }

        if (reqUrl.pathname === "/healthz") {
            res.writeHead(200, { "content-type": "text/plain; charset=utf-8" })
            res.end("ok")
            return
        }

        res.writeHead(404, { "content-type": "text/plain; charset=utf-8" })
        res.end("Not found")
    })

    await new Promise((resolve, reject) => {
        server.once("error", reject)
        server.listen(scriptServerPort, scriptServerHost, resolve)
    })

    const userscriptUrl = `http://${scriptServerHost}:${scriptServerPort}/better-osm-org.user.js`
    log(`Userscript server is running: ${userscriptUrl}`)
    return { server, userscriptUrl }
}

async function clickInstallButton(driver, timeoutMs) {
    const deadline = Date.now() + timeoutMs
    let lastSnapshot = []

    while (Date.now() < deadline) {
        const handles = await driver.getAllWindowHandles()
        const snapshot = []

        for (const handle of handles) {
            try {
                await driver.switchTo().window(handle)
                const url = await driver.getCurrentUrl()
                const result = await driver.executeScript(() => {
                    const normalize = text => (text || "").replace(/\s+/g, " ").trim()
                    const positive = /(install|confirm|save|track|enable|yes|ok|установ|подтверд|сохран|добав|включ|принять)/i
                    const negative = /(close|cancel|later|dismiss|skip|закры|отмен|позже|пропус|назад)/i
                    const preferInstall = /(install|установ)/i

                    const candidates = Array.from(document.querySelectorAll('button, [role="button"], input[type="button"], input[type="submit"]'))
                    const visible = el => {
                        const style = window.getComputedStyle(el)
                        if (!style || style.display === "none" || style.visibility === "hidden") return false
                        const rect = el.getBoundingClientRect()
                        return rect.width > 0 && rect.height > 0
                    }

                    let best = null
                    const labels = []

                    for (const el of candidates) {
                        const disabled = Boolean(el.disabled || el.getAttribute("aria-disabled") === "true")
                        if (disabled || !visible(el)) continue

                        const text = normalize(el.innerText || el.textContent || el.value || el.getAttribute("aria-label") || el.title)
                        labels.push(text || "<empty>")
                        if (!positive.test(text) || negative.test(text)) continue

                        let score = 0
                        if (positive.test(text)) score += 100
                        if (preferInstall.test(text)) score += 50
                        if (!text) score += 1

                        if (!best || score > best.score) {
                            best = { el, text, score }
                        }
                    }

                    if (!best) {
                        return { clicked: false, labels }
                    }

                    best.el.click()
                    return { clicked: true, label: best.text || "<empty>", score: best.score, labels }
                })

                if (Array.isArray(result?.labels) && result.labels.length) {
                    snapshot.push(`${url} => ${result.labels.join(" | ")}`)
                }

                if (result?.clicked) {
                    log(`Clicked install candidate for ${scriptManagerName}: "${result.label}" at ${url}`)
                    return
                }
            } catch {
                // ignored
            }
        }

        if (snapshot.length) {
            lastSnapshot = snapshot
        }
        await sleep(350)
    }

    throw new Error(`Install button was not found for ${scriptManagerName}. Last visible buttons: ${lastSnapshot.join(" || ")}`)
}

async function switchToUsableWindow(driver) {
    const handles = await driver.getAllWindowHandles()
    if (!handles.length) {
        throw new Error("No browser windows remain after userscript installation")
    }

    for (const handle of handles) {
        try {
            await driver.switchTo().window(handle)
            const url = await driver.getCurrentUrl()
            if (!url.startsWith("moz-extension://")) {
                return
            }
        } catch {
            // ignored
        }
    }

    await driver.switchTo().window(handles[0])
}

async function saveDebugArtifacts(driver) {
    await savePageArtifacts(driver, "last-failure")
}

async function savePageArtifacts(driver, prefix) {
    await fs.mkdir(artifactsDir, { recursive: true })

    try {
        const screenshotBase64 = await driver.takeScreenshot()
        await fs.writeFile(path.join(artifactsDir, `${prefix}.png`), screenshotBase64, "base64")
    } catch {
        // ignored
    }

    try {
        const html = await driver.getPageSource()
        await fs.writeFile(path.join(artifactsDir, `${prefix}.html`), html, "utf8")
    } catch {
        // ignored
    }

    try {
        const url = await driver.getCurrentUrl()
        const readyState = await driver.executeScript("return document.readyState")
        const meta = {
            capturedAt: new Date().toISOString(),
            url,
            readyState,
            scriptManagerName,
        }
        await fs.writeFile(path.join(artifactsDir, `${prefix}.meta.json`), JSON.stringify(meta, null, 2), "utf8")
    } catch {
        // ignored
    }
}

async function waitForTargetPageComplete(driver, timeoutMs) {
    const deadline = Date.now() + timeoutMs
    let lastState = "unknown"
    let lastUrl = ""

    while (Date.now() < deadline) {
        try {
            lastUrl = await driver.getCurrentUrl()
            lastState = await driver.executeScript("return document.readyState")
            const isNotBlank = lastUrl && lastUrl !== "about:blank"
            const isExpectedOrigin = targetOrigin ? lastUrl.startsWith(targetOrigin) : true
            if (lastState === "complete" && isNotBlank && isExpectedOrigin) {
                return { complete: true, readyState: lastState, url: lastUrl }
            }
        } catch {
            // ignored
        }
        await sleep(500)
    }

    return { complete: false, readyState: lastState, url: lastUrl }
}

async function assertUserscriptOnTarget(driver) {
    log(`Opening target URL: ${targetUrl}`)
    await driver.get(targetUrl)
    const loadInfo = await waitForTargetPageComplete(driver, targetLoadTimeoutMs)
    if (!loadInfo.complete) {
        log(`Target page did not reach expected loaded state within ${targetLoadTimeoutMs}ms (last readyState=${loadInfo.readyState}, last url=${loadInfo.url || "<unknown>"})`)
    }
    await savePageArtifacts(driver, "target-loaded")
    log(`Saved target snapshot artifacts in ${artifactsDir} (target-loaded.*)`)

    await installConsoleCapture(driver)
    if (printBrowserConsole) {
        await driver.executeScript("console.info('[e2e] browser console capture is active')")
        await flushConsoleCapture(driver, "target")
    }

    const deadline = Date.now() + assertTimeoutMs
    while (Date.now() < deadline) {
        const foundElements = await driver.findElements(By.css(assertSelector))
        await flushConsoleCapture(driver, "target")
        if (foundElements.length) {
            log(`PASS: selector found on target page: ${assertSelector}`)
            return
        }
        await sleep(1000)
    }

    let markCount = -1
    let mainMarkCount = -1
    try {
        markCount = await driver.executeScript("return performance.getEntriesByName('BETTER_OSM_START').length")
    } catch {
        // ignored
    }
    try {
        mainMarkCount = await driver.executeScript("return performance.getEntriesByName('BETTER_OSM_MAIN_CALL').length")
    } catch {
        // ignored
    }

    if (!requireSelector && markCount > 0) {
        log(`PASS (fallback): selector not found (${assertSelector}), but BETTER_OSM_START marks=${markCount}, BETTER_OSM_MAIN_CALL=${mainMarkCount}`)
        return
    }

    throw new Error(`Selector not found: ${assertSelector}. BETTER_OSM_START=${markCount}, BETTER_OSM_MAIN_CALL=${mainMarkCount}, E2E_REQUIRE_SELECTOR=${requireSelector ? "1" : "0"}`)
}

async function run() {
    if (process.argv.includes("--help") || process.argv.includes("-h")) {
        printHelp()
        return
    }

    if (!scriptManagerXpi) {
        throw new Error("Set E2E_SCRIPT_MANAGER_XPI (or legacy VIOLENTMONKEY_XPI) to an absolute path of manager .xpi")
    }

    await fs.access(scriptManagerXpi)

    if (!userscriptUrlFromEnv) {
        await fs.access(userscriptPath)
    }

    const { server: userscriptServer, userscriptUrl } = await startUserscriptServer()
    const firefoxBinary = await resolveFirefoxBinary()

    const options = new firefox.Options()
    if (headless) {
        options.addArguments("-headless")
    }
    if (firefoxBinary) {
        options.setBinary(firefoxBinary)
        log(`Using Firefox binary: ${firefoxBinary}`)
    }
    options.setPreference("devtools.console.stdout.content", true)

    let driver

    try {
        let builder = new Builder().forBrowser("firefox").setFirefoxOptions(options).setCapability("pageLoadStrategy", "none")
        if (seleniumRemoteUrl) {
            builder = builder.usingServer(seleniumRemoteUrl)
            log(`Using remote Selenium server: ${seleniumRemoteUrl}`)
        } else {
            log("Using local geckodriver")
        }

        driver = await builder.build()

        log(`Installing ${scriptManagerName} addon`)
        await driver.installAddon(scriptManagerXpi, true)
        await safeFlushConsoleCapture(driver, "after-addon-install")
        await maybePause("install-addon")

        log(`Opening userscript URL: ${userscriptUrl}`)
        await driver.get(userscriptUrl)
        await safeFlushConsoleCapture(driver, "userscript-url")
        await maybePause("open-userscript-url")

        log(`Searching install confirmation UI for ${scriptManagerName}`)
        await safeFlushConsoleCapture(driver, "manager-confirm")
        await maybePause("open-manager-confirm-tab")

        await clickInstallButton(driver, installTimeoutMs)
        await safeFlushConsoleCapture(driver, "after-install-click")
        await sleep(1000)
        await maybePause("after-click-install")
        await switchToUsableWindow(driver)
        await maybePause("switch-to-target-window")

        await assertUserscriptOnTarget(driver)
    } catch (error) {
        if (driver) {
            await saveDebugArtifacts(driver)
            log(`Saved debug artifacts in ${artifactsDir}`)
        }
        throw error
    } finally {
        if (driver) {
            await driver.quit()
        }
        if (userscriptServer) {
            await new Promise(resolve => userscriptServer.close(resolve))
        }
    }
}

run().catch(error => {
    console.error(error)
    process.exit(1)
})
