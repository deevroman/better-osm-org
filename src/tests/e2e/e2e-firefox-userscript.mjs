#!/usr/bin/env node

import "geckodriver"
import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { runTargetTests } from "./tests/target-tests.mjs"
import { createPause, log, resolveLocaleConfig, sleep } from "./lib/runtime-utils.mjs"
import { readManagerXpiInfo } from "./lib/xpi-info.mjs"
import { installConsoleCapture, flushConsoleCapture, safeFlushConsoleCapture } from "./lib/console-capture.mjs"
import { startUserscriptServer } from "./lib/userscript-server.mjs"
import { clickInstallButton, switchToUsableWindow } from "./lib/install-flow.mjs"
import { saveDebugArtifacts, savePageArtifacts, waitForTargetPageComplete } from "./lib/artifacts.mjs"
import {
    applyViewportSize,
    createFirefoxBuilder,
    createFirefoxOptions,
    resolveFirefoxBinary,
} from "./lib/firefox-runner.mjs"

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
const locale = resolveLocaleConfig(process.env.E2E_LOCALE || "en")
const viewportWidth = Number.parseInt(process.env.E2E_VIEWPORT_WIDTH || "", 10)
const viewportHeight = Number.parseInt(process.env.E2E_VIEWPORT_HEIGHT || "", 10)
const userAgentOverride = (process.env.E2E_USER_AGENT || "").trim()

const installTimeoutMs = Number.parseInt(process.env.E2E_INSTALL_TIMEOUT_MS || "45000", 10)
const assertTimeoutMs = Number.parseInt(process.env.E2E_ASSERT_TIMEOUT_MS || "30000", 10)
const targetLoadTimeoutMs = Number.parseInt(process.env.E2E_TARGET_LOAD_TIMEOUT_MS || "45000", 10)

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
  E2E_VIEWPORT_WIDTH=390
  E2E_VIEWPORT_HEIGHT=844
  E2E_USER_AGENT=Mozilla/5.0 (...)
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

async function run() {
    if (process.argv.includes("--help") || process.argv.includes("-h")) {
        printHelp()
        return
    }

    if (!scriptManagerXpi) {
        throw new Error("Set E2E_SCRIPT_MANAGER_XPI (or legacy VIOLENTMONKEY_XPI) to an absolute path of manager .xpi")
    }

    await fs.access(scriptManagerXpi)
    const managerXpiInfo = await readManagerXpiInfo(scriptManagerXpi)
    if (managerXpiInfo?.version) {
        log(`Using manager package from .xpi: ${managerXpiInfo.name || scriptManagerName} v${managerXpiInfo.version}`)
    } else {
        log(`Using manager package from .xpi: ${scriptManagerName} (version unknown)`)
    }

    if (!userscriptUrlFromEnv) {
        await fs.access(userscriptPath)
    }

    const maybePause = createPause(stepPauseMs, log)
    const artifactsContext = {
        artifactsDir,
        scriptManagerName,
        managerXpiInfo,
        locale,
    }

    const { server: userscriptServer, userscriptUrl } = await startUserscriptServer({
        userscriptUrlFromEnv,
        userscriptPath,
        scriptServerHost,
        scriptServerPort,
        logFn: log,
    })

    const firefoxBinary = await resolveFirefoxBinary(firefoxBinaryFromEnv)
    const options = createFirefoxOptions({
        headless,
        firefoxBinary,
        locale,
        userAgentOverride,
        logFn: log,
    })
    const builder = createFirefoxBuilder({
        options,
        seleniumRemoteUrl,
        logFn: log,
    })

    let driver

    try {
        driver = await builder.build()

        log(`Installing ${scriptManagerName} addon`)
        await driver.installAddon(scriptManagerXpi, true)
        await safeFlushConsoleCapture(driver, "after-addon-install", log)
        await maybePause("install-addon")

        log(`Opening userscript URL: ${userscriptUrl}`)
        await driver.get(userscriptUrl)
        await safeFlushConsoleCapture(driver, "userscript-url", log)
        await maybePause("open-userscript-url")

        log(`Searching install confirmation UI for ${scriptManagerName}`)
        await safeFlushConsoleCapture(driver, "manager-confirm", log)
        await maybePause("open-manager-confirm-tab")

        await clickInstallButton(driver, {
            timeoutMs: installTimeoutMs,
            scriptManagerName,
            sleepFn: sleep,
            logFn: log,
        })
        await safeFlushConsoleCapture(driver, "after-install-click", log)
        await sleep(1000)
        await maybePause("after-click-install")
        await switchToUsableWindow(driver)
        await maybePause("switch-to-target-window")
        await applyViewportSize(driver, {
            width: viewportWidth,
            height: viewportHeight,
            logFn: log,
        })

        await runTargetTests(driver, {
            targetUrl,
            targetLoadTimeoutMs,
            assertTimeoutMs,
            artifactsDir,
            log,
            waitForTargetPageComplete: async (testDriver, timeoutMs) =>
                waitForTargetPageComplete(testDriver, {
                    timeoutMs,
                    targetOrigin,
                    sleepFn: sleep,
                }),
            savePageArtifacts: async (testDriver, prefix) => savePageArtifacts(testDriver, prefix, artifactsContext),
            installConsoleCapture,
            flushConsoleCapture: async (testDriver, label) => flushConsoleCapture(testDriver, label, log),
            sleep,
        })
    } catch (error) {
        if (driver) {
            await saveDebugArtifacts(driver, artifactsContext)
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
