import fs from "node:fs/promises"
import path from "node:path"
import { sleep as defaultSleep } from "./runtime-utils.mjs"

export async function savePageArtifacts(driver, prefix, context) {
    const { artifactsDir, scriptManagerName, managerXpiInfo, locale } = context
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

export async function saveDebugArtifacts(driver, context) {
    await savePageArtifacts(driver, "last-failure", context)
}

export async function waitForTargetPageComplete(driver, { timeoutMs, targetOrigin = "", sleepFn = defaultSleep }) {
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
        await sleepFn(500)
    }

    return { complete: false, readyState: lastState, url: lastUrl }
}
