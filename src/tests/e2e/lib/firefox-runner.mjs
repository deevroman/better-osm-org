import fs from "node:fs/promises"
import { Builder } from "selenium-webdriver"
import firefox from "selenium-webdriver/firefox.js"
import { log as defaultLog } from "./runtime-utils.mjs"

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

export function createFirefoxOptions({ headless, firefoxBinary, locale, logFn = defaultLog }) {
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
    logFn(`Using locale: ${locale.id} (browser=${locale.browserLocale}, accept-language=${locale.acceptLanguage})`)
    return options
}

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
