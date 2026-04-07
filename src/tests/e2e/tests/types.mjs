/**
 * Test descriptor discovered from exported `test*` functions.
 * @typedef {Object} DiscoveredTestCase
 * @property {string} id Stable test id used in logs/artifacts.
 * @property {string} description Human-readable description shown in logs.
 * @property {(testRuntime: TestRuntime) => Promise<void>|void} run Test entrypoint.
 */

/**
 * Runtime API passed to each discovered test function.
 * @typedef {Object} TestRuntime
 * @property {import("selenium-webdriver").WebDriver} driver Current Selenium driver instance.
 * @property {DiscoveredTestCase} testCase Current test metadata.
 * @property {string} slug Artifact-friendly test identifier.
 * @property {(message: string) => void} log Prefixed logger bound to current test.
 * @property {(selector: string, timeoutMs?: number) => Promise<boolean>} waitForSelectorWithConsole Waits for selector while flushing browser console.
 * @property {(markName: string) => Promise<number>} getPerformanceMarkCount Returns count for performance marks by name.
 * @property {(markName: string, timeoutMs?: number) => Promise<number>} waitForPerformanceMark Waits for mark appearance and returns latest count.
 * @property {(prefix: string) => Promise<void>} savePageArtifacts Saves screenshot/html/meta artifacts with prefix.
 */

/**
 * Orchestrator dependencies provided by the browser runner.
 * @typedef {Object} TargetRunnerContext
 * @property {string} targetUrl
 * @property {number} targetLoadTimeoutMs
 * @property {number} assertTimeoutMs
 * @property {string} artifactsDir
 * @property {(message: string) => void} log
 * @property {(driver: import("selenium-webdriver").WebDriver, timeoutMs: number) => Promise<{complete: boolean, readyState: string, url: string}>} waitForTargetPageComplete
 * @property {(driver: import("selenium-webdriver").WebDriver, prefix: string) => Promise<void>} savePageArtifacts
 * @property {(driver: import("selenium-webdriver").WebDriver) => Promise<void>} installConsoleCapture
 * @property {(driver: import("selenium-webdriver").WebDriver, label: string) => Promise<void>} flushConsoleCapture
 * @property {(ms: number) => Promise<void>} sleep
 */

export {}
