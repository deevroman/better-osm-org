import { sleep as defaultSleep, log as defaultLog } from "./runtime-utils.mjs"

export async function clickInstallButton(
    driver,
    { timeoutMs, scriptManagerName, sleepFn = defaultSleep, logFn = defaultLog },
) {
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
                    logFn(`Clicked install candidate for ${scriptManagerName}: "${result.label}" at ${url}`)
                    return
                }
            } catch {
                // ignored
            }
        }

        if (snapshot.length) {
            lastSnapshot = snapshot
        }
        await sleepFn(350)
    }

    throw new Error(
        `Install button was not found for ${scriptManagerName}. Last visible buttons: ${lastSnapshot.join(" || ")}`,
    )
}

export async function switchToUsableWindow(driver) {
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
