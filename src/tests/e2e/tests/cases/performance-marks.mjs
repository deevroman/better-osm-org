import { runtime } from "../runtime.mjs"

export async function testPerformanceStartEndMarks() {
    const startCount = await runtime.waitForPerformanceMark("BETTER_OSM_START")
    if (startCount <= 0) {
        throw new Error(`BETTER_OSM_START mark was not found. count=${startCount}`)
    }

    const endCount = await runtime.waitForPerformanceMark("BETTER_OSM_END")
    if (endCount <= 0) {
        throw new Error(`BETTER_OSM_END mark was not found. count=${endCount}`)
    }

    runtime.log(`PASS: performance marks found. BETTER_OSM_START=${startCount}, BETTER_OSM_END=${endCount}`)
}
