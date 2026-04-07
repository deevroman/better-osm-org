#!/usr/bin/env node

import "geckodriver"
import { Builder, By } from "selenium-webdriver"
import firefox from "selenium-webdriver/firefox.js"
import fs from "node:fs/promises"
import http from "node:http"
import path from "node:path"
import { fileURLToPath } from "node:url"
import zlib from "node:zlib"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, "../../..")
const artifactsDir = path.join(__dirname, "artifacts")

const DEFAULT_TARGET_URL = "https://master.apis.dev.openstreetmap.org"
const targetUrl = process.env.E2E_TARGET_URL || DEFAULT_TARGET_URL
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
const localeInput = process.env.E2E_LOCALE || "en"
const targetTests = [
    {
        id: "main-map-ui",
        description: "Userscript injects controls on target page",
        assertSelector: ".turn-on-satellite-from-pane",
        allowMarkFallback: true,
    },
]

const installTimeoutMs = Number.parseInt(process.env.E2E_INSTALL_TIMEOUT_MS || "45000", 10)
const assertTimeoutMs = Number.parseInt(process.env.E2E_ASSERT_TIMEOUT_MS || "30000", 10)
const targetLoadTimeoutMs = Number.parseInt(process.env.E2E_TARGET_LOAD_TIMEOUT_MS || "45000", 10)
let managerXpiInfo = null

function resolveLocaleConfig(input) {
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

const locale = resolveLocaleConfig(localeInput)

function printHelp() {
    console.log(
        `
Firefox userscript manager E2E runner

Required env:
  E2E_SCRIPT_MANAGER_XPI=/absolute/path/to/manager.xpi
  (legacy alias: VIOLENTMONKEY_XPI=...)

Optional env:
  E2E_SCRIPT_MANAGER_NAME=Violentmonkey|Tampermonkey|Firemonkey
  E2E_TARGET_URL=https://master.apis.dev.openstreetmap.org
  E2E_USER_SCRIPT_PATH=/absolute/path/to/better-osm-org.user.js
  E2E_USER_SCRIPT_URL=http://127.0.0.1:17321/better-osm-org.user.js
  E2E_SCRIPT_HOST=127.0.0.1
  E2E_SCRIPT_PORT=17321
  E2E_FIREFOX_BINARY=/Applications/Firefox.app/Contents/MacOS/firefox
  E2E_HEADLESS=1|0
  E2E_STEP_PAUSE_MS=0
  E2E_LOCALE=en|ru
  SELENIUM_REMOTE_URL=http://127.0.0.1:4444/wd/hub
  E2E_INSTALL_TIMEOUT_MS=45000
  E2E_ASSERT_TIMEOUT_MS=30000
  E2E_TARGET_LOAD_TIMEOUT_MS=45000

Example:
  npm run build
  E2E_SCRIPT_MANAGER_NAME=Violentmonkey E2E_SCRIPT_MANAGER_XPI=/tmp/violentmonkey.xpi npm run e2e:run
`.trim(),
    )
}

function log(message) {
    const ts = new Date().toISOString()
    console.log(`[${ts}] ${message}`)
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function findZipEocdOffset(buffer) {
    const minLen = 22
    if (!Buffer.isBuffer(buffer) || buffer.length < minLen) {
        return -1
    }

    const signature = 0x06054b50
    const maxCommentLen = 0xffff
    const start = Math.max(0, buffer.length - (minLen + maxCommentLen))

    for (let offset = buffer.length - minLen; offset >= start; offset -= 1) {
        if (buffer.readUInt32LE(offset) === signature) {
            return offset
        }
    }
    return -1
}

function readZipEntryUtf8(zipBuffer, requestedName) {
    const eocdOffset = findZipEocdOffset(zipBuffer)
    if (eocdOffset === -1) {
        return null
    }

    const centralDirSize = zipBuffer.readUInt32LE(eocdOffset + 12)
    const centralDirOffset = zipBuffer.readUInt32LE(eocdOffset + 16)
    const centralDirEnd = centralDirOffset + centralDirSize
    const centralSignature = 0x02014b50
    const localSignature = 0x04034b50

    let ptr = centralDirOffset
    while (ptr < centralDirEnd) {
        if (zipBuffer.readUInt32LE(ptr) !== centralSignature) {
            break
        }

        const compressionMethod = zipBuffer.readUInt16LE(ptr + 10)
        const compressedSize = zipBuffer.readUInt32LE(ptr + 20)
        const fileNameLen = zipBuffer.readUInt16LE(ptr + 28)
        const extraLen = zipBuffer.readUInt16LE(ptr + 30)
        const commentLen = zipBuffer.readUInt16LE(ptr + 32)
        const localHeaderOffset = zipBuffer.readUInt32LE(ptr + 42)
        const fileName = zipBuffer.subarray(ptr + 46, ptr + 46 + fileNameLen).toString("utf8")
        const isRequested = fileName === requestedName || fileName.endsWith(`/${requestedName}`)

        if (isRequested) {
            if (zipBuffer.readUInt32LE(localHeaderOffset) !== localSignature) {
                return null
            }

            const localNameLen = zipBuffer.readUInt16LE(localHeaderOffset + 26)
            const localExtraLen = zipBuffer.readUInt16LE(localHeaderOffset + 28)
            const dataStart = localHeaderOffset + 30 + localNameLen + localExtraLen
            const compressedData = zipBuffer.subarray(dataStart, dataStart + compressedSize)

            if (compressionMethod === 0) {
                return compressedData.toString("utf8")
            }
            if (compressionMethod === 8) {
                return zlib.inflateRawSync(compressedData).toString("utf8")
            }
            return null
        }

        ptr += 46 + fileNameLen + extraLen + commentLen
    }

    return null
}

async function readManagerXpiInfo(xpiPath) {
    try {
        const zipBuffer = await fs.readFile(xpiPath)
        const manifestText = readZipEntryUtf8(zipBuffer, "manifest.json")
        if (!manifestText) {
            return null
        }

        const manifest = JSON.parse(manifestText)
        const info = {
            name: typeof manifest?.name === "string" ? manifest.name : null,
            version: typeof manifest?.version === "string" ? manifest.version : null,
        }
        return info
    } catch {
        return null
    }
}

async function maybePause(stage) {
    if (!Number.isFinite(stepPauseMs) || stepPauseMs <= 0) {
        return
    }
    log(`Pause ${stepPauseMs}ms after step: ${stage}`)
    await sleep(stepPauseMs)
}

async function installConsoleCapture(driver) {
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

async function flushConsoleCapture(driver, label) {
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
                    const positive =
                        /(install|confirm|save|track|enable|yes|ok|установ|подтверд|сохран|добав|включ|принять)/i
                    const negative = /(close|cancel|later|dismiss|skip|закры|отмен|позже|пропус|назад)/i
                    const preferInstall = /(install|установ)/i

                    const candidates = Array.from(
                        document.querySelectorAll(
                            'button, [role="button"], input[type="button"], input[type="submit"]',
                        ),
                    )
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

                        const text = normalize(
                            el.innerText || el.textContent || el.value || el.getAttribute("aria-label") || el.title,
                        )
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

    throw new Error(
        `Install button was not found for ${scriptManagerName}. Last visible buttons: ${lastSnapshot.join(" || ")}`,
    )
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
            managerPackageName: managerXpiInfo?.name || null,
            managerPackageVersion: managerXpiInfo?.version || null,
            locale: locale.id,
            browserLocale: locale.browserLocale,
            acceptLanguage: locale.acceptLanguage,
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

function toArtifactSlug(value) {
    return (
        (value || "test")
            .toLowerCase()
            .replace(/[^a-z0-9_-]+/g, "-")
            .replace(/^-+|-+$/g, "") || "test"
    )
}

async function runTargetTest(driver, testCase, testIndex) {
    const slug = toArtifactSlug(testCase.id || `test-${testIndex + 1}`)

    log(`[test:${slug}] Opening target URL: ${targetUrl}`)
    await driver.get(targetUrl)
    const loadInfo = await waitForTargetPageComplete(driver, targetLoadTimeoutMs)
    if (!loadInfo.complete) {
        log(
            `[test:${slug}] Target page did not reach expected loaded state within ${targetLoadTimeoutMs}ms (last readyState=${loadInfo.readyState}, last url=${loadInfo.url || "<unknown>"})`,
        )
    }
    await savePageArtifacts(driver, `target-loaded-${slug}`)
    if (testIndex === 0) {
        await savePageArtifacts(driver, "target-loaded")
    }
    log(`[test:${slug}] Saved target snapshot artifacts in ${artifactsDir}`)

    await installConsoleCapture(driver)
    await driver.executeScript("console.info('[e2e] browser console capture is active')")
    await flushConsoleCapture(driver, `target:${slug}`)

    const deadline = Date.now() + assertTimeoutMs
    while (Date.now() < deadline) {
        const foundElements = await driver.findElements(By.css(testCase.assertSelector))
        await flushConsoleCapture(driver, `target:${slug}`)
        if (foundElements.length) {
            log(`[test:${slug}] PASS: selector found on target page: ${testCase.assertSelector}`)
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

    if (testCase.allowMarkFallback && markCount > 0) {
        log(
            `[test:${slug}] PASS (fallback): selector not found (${testCase.assertSelector}), but BETTER_OSM_START marks=${markCount}, BETTER_OSM_MAIN_CALL=${mainMarkCount}`,
        )
        return
    }

    throw new Error(
        `[test:${slug}] Selector not found: ${testCase.assertSelector}. BETTER_OSM_START=${markCount}, BETTER_OSM_MAIN_CALL=${mainMarkCount}, allowMarkFallback=${testCase.allowMarkFallback ? "true" : "false"}`,
    )
}

async function runTargetTests(driver) {
    if (!targetTests.length) {
        throw new Error("No target tests configured")
    }

    for (const [index, testCase] of targetTests.entries()) {
        log(`[test:${testCase.id}] START: ${testCase.description}`)
        await runTargetTest(driver, testCase, index)
        log(`[test:${testCase.id}] DONE`)
    }
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
    managerXpiInfo = await readManagerXpiInfo(scriptManagerXpi)
    if (managerXpiInfo?.version) {
        log(`Using manager package from .xpi: ${managerXpiInfo.name || scriptManagerName} v${managerXpiInfo.version}`)
    } else {
        log(`Using manager package from .xpi: ${scriptManagerName} (version unknown)`)
    }

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
    options.setPreference("intl.locale.requested", locale.browserLocale)
    options.setPreference("intl.accept_languages", locale.acceptLanguage)
    log(`Using locale: ${locale.id} (browser=${locale.browserLocale}, accept-language=${locale.acceptLanguage})`)

    let driver

    try {
        let builder = new Builder()
            .forBrowser("firefox")
            .setFirefoxOptions(options)
            .setCapability("pageLoadStrategy", "none")
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

        await runTargetTests(driver)
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
