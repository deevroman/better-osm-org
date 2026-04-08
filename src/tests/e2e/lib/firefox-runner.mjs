import fs from "node:fs/promises"
import { Builder } from "selenium-webdriver"
import firefox from "selenium-webdriver/firefox.js"
import { log as defaultLog } from "./runtime-utils.mjs"

/**
 * Resolves Firefox binary path for local macOS runs.
 * @param {string|undefined} firefoxBinaryFromEnv
 * @returns {Promise<string|null>}
 */
export async function resolveFirefoxBinary(firefoxBinaryFromEnv) {
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

/**
 * Creates Firefox options used by Selenium.
 * @param {{
 *   headless: boolean,
 *   firefoxBinary: string|null,
 *   locale: {id: string, browserLocale: string, acceptLanguage: string},
 *   userAgentOverride?: string,
 *   logFn?: (message: string) => void
 * }} config
 * @returns {import("selenium-webdriver/firefox.js").Options}
 */
export function createFirefoxOptions({ headless, firefoxBinary, locale, userAgentOverride = "", logFn = defaultLog }) {
    const options = new firefox.Options()
    if (headless) {
        options.addArguments("-headless")
    }
    if (firefoxBinary) {
        options.setBinary(firefoxBinary)
        logFn(`Using Firefox binary: ${firefoxBinary}`)
    }
    options.setPreference("devtools.console.stdout.content", true)
    options.setPreference("intl.locale.requested", locale.browserLocale)
    options.setPreference("intl.accept_languages", locale.acceptLanguage)
    if (userAgentOverride) {
        options.setPreference("general.useragent.override", userAgentOverride)
        logFn(`Using user-agent override: ${userAgentOverride}`)
    }
    logFn(`Using locale: ${locale.id} (browser=${locale.browserLocale}, accept-language=${locale.acceptLanguage})`)
    return options
}

/**
 * Creates Selenium builder configured for local geckodriver or remote Selenium.
 * @param {{
 *   options: import("selenium-webdriver/firefox.js").Options,
 *   seleniumRemoteUrl?: string,
 *   logFn?: (message: string) => void
 * }} config
 * @returns {Builder}
 */
export function createFirefoxBuilder({ options, seleniumRemoteUrl, logFn = defaultLog }) {
    let builder = new Builder()
        .forBrowser("firefox")
        .setFirefoxOptions(options)
        .setCapability("pageLoadStrategy", "none")
    if (seleniumRemoteUrl) {
        builder = builder.usingServer(seleniumRemoteUrl)
        logFn(`Using remote Selenium server: ${seleniumRemoteUrl}`)
    } else {
        logFn("Using local geckodriver")
    }
    return builder
}

/**
 * Applies browser window size for viewport-sensitive scenarios.
 * @param {import("selenium-webdriver").WebDriver} driver
 * @param {{
 *   width?: number,
 *   height?: number,
 *   logFn?: (message: string) => void
 * }} config
 * @returns {Promise<void>}
 */
export async function applyViewportSize(driver, { width, height, logFn = defaultLog }) {
    if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) {
        return
    }
    await driver
        .manage()
        .window()
        .setRect({
            width: Number(width),
            height: Number(height),
        })
    logFn(`Using viewport size: ${Number(width)}x${Number(height)}`)
}
