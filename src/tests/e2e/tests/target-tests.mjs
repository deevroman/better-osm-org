import { By } from "selenium-webdriver"
import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
/** @typedef {import("./types.mjs").DiscoveredTestCase} DiscoveredTestCase */
/** @typedef {import("./types.mjs").TargetRunnerContext} TargetRunnerContext */

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const casesDir = path.join(__dirname, "cases")

/**
 * Recursively collects case files from `tests/cases`.
 * @param {string} dir
 * @returns {Promise<string[]>}
 */
async function collectCaseFiles(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    let files = []

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()) {
            files = files.concat(await collectCaseFiles(fullPath))
            continue
        }
        if (!entry.isFile()) {
            continue
        }
        if (!entry.name.endsWith(".mjs")) {
            continue
        }
        files.push(fullPath)
    }

    files.sort()
    return files
}

function toTestId(filePath, exportName) {
    const relPath = path.relative(casesDir, filePath).replaceAll(path.sep, "/")
    return `${relPath}#${exportName}`
}

/**
 * Discovers tests exported as functions with names starting with `test`.
 * @returns {Promise<DiscoveredTestCase[]>}
 */
async function discoverTargetTests() {
    const files = await collectCaseFiles(casesDir)
    const tests = []

    for (const filePath of files) {
        const moduleUrl = pathToFileURL(filePath).href
        const moduleExports = await import(moduleUrl)
        for (const [exportName, exportedValue] of Object.entries(moduleExports)) {
            if (typeof exportedValue !== "function") {
                continue
            }
            if (!exportName.startsWith("test")) {
                continue
            }
            tests.push({
                id: toTestId(filePath, exportName),
                description: `Discovered test function ${exportName} from ${path.relative(casesDir, filePath)}`,
                run: exportedValue,
            })
        }
    }

    tests.sort((a, b) => a.id.localeCompare(b.id))
    return tests
}

function toArtifactSlug(value) {
    return (
        (value || "test")
            .toLowerCase()
            .replace(/[^a-z0-9_-]+/g, "-")
            .replace(/^-+|-+$/g, "") || "test"
    )
}

/**
 * Executes one discovered test with prepared runtime helpers.
 * @param {import("selenium-webdriver").WebDriver} driver
 * @param {DiscoveredTestCase} testCase
 * @param {number} testIndex
 * @param {TargetRunnerContext} context
 * @returns {Promise<void>}
 */
async function runTargetTest(driver, testCase, testIndex, context) {
    const {
        targetUrl,
        targetLoadTimeoutMs,
        assertTimeoutMs,
        artifactsDir,
        log,
        waitForTargetPageComplete,
        savePageArtifacts,
        installConsoleCapture,
        flushConsoleCapture,
        sleep,
    } = context

    const slug = toArtifactSlug(testCase.id || `test-${testIndex + 1}`)

    log(`[test:${slug}] Opening target URL: ${targetUrl}`)
    await driver.get(targetUrl)
    const loadInfo = await waitForTargetPageComplete(driver, targetLoadTimeoutMs)
    if (!loadInfo.complete) {
        log(
            `[test:${slug}] Target page did not reach expected loaded state within ${targetLoadTimeoutMs}ms (last readyState=${loadInfo.readyState}, last url=${loadInfo.url || "<unknown>"})`,
        )
    }
    await savePageArtifacts(driver, `target-loaded-${slug}`)
    if (testIndex === 0) {
        await savePageArtifacts(driver, "target-loaded")
    }
    log(`[test:${slug}] Saved target snapshot artifacts in ${artifactsDir}`)

    await installConsoleCapture(driver)
    await driver.executeScript("console.info('[e2e] browser console capture is active')")
    await flushConsoleCapture(driver, `target:${slug}`)
    const waitForSelectorWithConsole = async (selector, timeoutMs = assertTimeoutMs) => {
        const deadline = Date.now() + timeoutMs
        while (Date.now() < deadline) {
            const foundElements = await driver.findElements(By.css(selector))
            await flushConsoleCapture(driver, `target:${slug}`)
            if (foundElements.length) {
                return true
            }
            await sleep(1000)
        }
        return false
    }

    const getPerformanceMarkCount = async markName => {
        try {
            return await driver.executeScript("return performance.getEntriesByName(arguments[0]).length", markName)
        } catch {
            return -1
        }
    }

    const waitForPerformanceMark = async (markName, timeoutMs = assertTimeoutMs) => {
        const deadline = Date.now() + timeoutMs
        let lastCount = -1
        while (Date.now() < deadline) {
            lastCount = await getPerformanceMarkCount(markName)
            await flushConsoleCapture(driver, `target:${slug}`)
            if (lastCount > 0) {
                return lastCount
            }
            await sleep(500)
        }
        return lastCount
    }

    const testRuntime = {
        driver,
        testCase,
        slug,
        log: message => log(`[test:${slug}] ${message}`),
        waitForSelectorWithConsole,
        getPerformanceMarkCount,
        waitForPerformanceMark,
        savePageArtifacts: prefix => savePageArtifacts(driver, prefix),
    }
    await testCase.run(testRuntime)
}

/**
 * Discovers and executes all target tests sequentially.
 * @param {import("selenium-webdriver").WebDriver} driver
 * @param {TargetRunnerContext} context
 * @returns {Promise<void>}
 */
export async function runTargetTests(driver, context) {
    const targetTests = await discoverTargetTests()
    if (!targetTests.length) {
        throw new Error("No target tests configured")
    }

    const { log } = context
    for (const [index, testCase] of targetTests.entries()) {
        log(`[test:${testCase.id}] START: ${testCase.description}`)
        if (typeof testCase.run !== "function") {
            throw new Error(`Test "${testCase.id}" must provide run(testRuntime) function`)
        }
        await runTargetTest(driver, testCase, index, context)
        log(`[test:${testCase.id}] DONE`)
    }
}
