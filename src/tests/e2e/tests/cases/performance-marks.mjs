/**
 * Verifies that userscript start/end performance marks were emitted.
 * @param {import("../types.mjs").TestRuntime} testRuntime
 * @returns {Promise<void>}
 */
export async function testPerformanceStartEndMarks(testRuntime) {
    const { waitForPerformanceMark, log } = testRuntime
    const startCount = await waitForPerformanceMark("BETTER_OSM_START")
    if (startCount <= 0) {
        throw new Error(`BETTER_OSM_START mark was not found. count=${startCount}`)
    }

    const endCount = await waitForPerformanceMark("BETTER_OSM_END")
    if (endCount <= 0) {
        throw new Error(`BETTER_OSM_END mark was not found. count=${endCount}`)
    }

    log(`PASS: performance marks found. BETTER_OSM_START=${startCount}, BETTER_OSM_END=${endCount}`)
}
