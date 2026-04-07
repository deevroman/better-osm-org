export const runtime = {
    log: null,
    waitForSelectorWithConsole: null,
    getPerformanceMarkCount: null,
    waitForPerformanceMark: null,
    savePageArtifacts: null,
}

export function setTestRuntime(value) {
    Object.assign(runtime, value)
}

export function clearTestRuntime() {
    runtime.log = null
    runtime.waitForSelectorWithConsole = null
    runtime.getPerformanceMarkCount = null
    runtime.waitForPerformanceMark = null
    runtime.savePageArtifacts = null
}
