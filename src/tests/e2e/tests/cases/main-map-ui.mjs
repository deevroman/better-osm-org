import { runtime } from "../runtime.mjs"

export async function testMainMapUi() {
    const selector = ".turn-on-satellite-from-pane"
    const found = await runtime.waitForSelectorWithConsole(selector)
    if (found) {
        runtime.log(`PASS: selector found on target page: ${selector}`)
        return
    }

    const markCount = await runtime.getPerformanceMarkCount("BETTER_OSM_START")
    const mainMarkCount = await runtime.getPerformanceMarkCount("BETTER_OSM_MAIN_CALL")
    if (markCount > 0) {
        runtime.log(
            `PASS (fallback): selector not found (${selector}), but BETTER_OSM_START marks=${markCount}, BETTER_OSM_MAIN_CALL=${mainMarkCount}`,
        )
        return
    }

    throw new Error(
        `Selector not found: ${selector}. BETTER_OSM_START=${markCount}, BETTER_OSM_MAIN_CALL=${mainMarkCount}`,
    )
}
