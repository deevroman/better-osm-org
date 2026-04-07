export async function testMainMapUi({ waitForSelectorWithConsole, getPerformanceMarkCount, log }) {
    const selector = ".turn-on-satellite-from-pane"
    const found = await waitForSelectorWithConsole(selector)
    if (found) {
        log(`PASS: selector found on target page: ${selector}`)
        return
    }

    const markCount = await getPerformanceMarkCount("BETTER_OSM_START")
    const mainMarkCount = await getPerformanceMarkCount("BETTER_OSM_MAIN_CALL")
    if (markCount > 0) {
        log(
            `PASS (fallback): selector not found (${selector}), but BETTER_OSM_START marks=${markCount}, BETTER_OSM_MAIN_CALL=${mainMarkCount}`,
        )
        return
    }

    throw new Error(
        `Selector not found: ${selector}. BETTER_OSM_START=${markCount}, BETTER_OSM_MAIN_CALL=${mainMarkCount}`,
    )
}
