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
    options.setPreference("extensions.webextensions.userScripts.enabled", true)
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
        builder = builder.setFirefoxService(new firefox.ServiceBuilder().addArguments("--allow-system-access"))
        logFn("Using local geckodriver with --allow-system-access")
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

/**
 * Grants optional Firefox WebExtension permissions to an installed extension.
 * This is used for Firefox's extension-specific userscript permission in
 * addition to the global extensions.webextensions.userScripts.enabled pref.
 *
 * @param {import("selenium-webdriver/firefox.js").Driver} driver
 * @param {string} extensionId
 * @param {{
 *   permissions?: string[],
 *   origins?: string[],
 *   logFn?: (message: string) => void
 * }} config
 * @returns {Promise<void>}
 */
export async function grantFirefoxExtensionPermissions(
    driver,
    extensionId,
    { permissions = [], origins = [], logFn = defaultLog } = {},
) {
    if (!extensionId) {
        throw new Error("Cannot grant Firefox extension permissions: missing extension id")
    }
    if (!permissions.length && !origins.length) {
        return
    }
    if (typeof driver.setContext !== "function") {
        throw new Error("Cannot grant Firefox extension permissions: Selenium Firefox chrome context is unavailable")
    }

    const previousContext =
        typeof driver.getContext === "function" ? await driver.getContext() : firefox.Context.CONTENT

    try {
        await driver.setContext(firefox.Context.CHROME)
        const result = await driver.executeAsyncScript(
            `
const [extensionId, permissions, origins, done] = arguments

;(async () => {
    let ExtensionPermissions
    try {
        ;({ ExtensionPermissions } = ChromeUtils.importESModule(
            "resource://gre/modules/ExtensionPermissions.sys.mjs",
        ))
    } catch {
        ;({ ExtensionPermissions } = ChromeUtils.import(
            "resource://gre/modules/ExtensionPermissions.jsm",
        ))
    }

    await ExtensionPermissions.add(extensionId, { permissions, origins })
    const granted = await ExtensionPermissions.get(extensionId)
    done({ granted })
})().catch(error => {
    done({
        error: String(error?.message || error),
        stack: String(error?.stack || ""),
    })
})
`,
            extensionId,
            permissions,
            origins,
        )

        if (result?.error) {
            throw new Error(
                `Failed to grant Firefox extension permissions to ${extensionId}: ${result.error}\n${result.stack}`,
            )
        }

        const grantedPermissions = result?.granted?.permissions || []
        const missingPermissions = permissions.filter(permission => !grantedPermissions.includes(permission))
        if (missingPermissions.length) {
            throw new Error(
                `Failed to grant Firefox extension permissions to ${extensionId}: missing ${missingPermissions.join(", ")}`,
            )
        }

        logFn(`Granted Firefox extension permission(s) to ${extensionId}: ${permissions.join(", ")}`)
    } finally {
        await driver.setContext(previousContext)
    }
}
