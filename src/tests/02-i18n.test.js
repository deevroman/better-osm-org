import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const i18nPath = path.resolve(__dirname, "../0-common/02-i18n.js")
const i18nSource = fs.readFileSync(i18nPath, "utf8")

const { _translations, flatTranslations, t } = new Function(
    i18nSource + "return { _translations, flatTranslations, t }",
)()

test("check t() with one arg", () => {
    assert.equal(t("objectEditor.delete"), "Delete")
})

test("check t() with two args", () => {
    assert.equal(t("historyDiff.tagsCount", { count: 5 }), "5 tags")
})

test("check that all translated for ru", () => {
    const flattenTranslationsEn = flatTranslations(_translations["en"])
    const flattenTranslationsRu = flatTranslations(_translations["ru"])

    assert.deepEqual(Object.keys(flattenTranslationsEn), Object.keys(flattenTranslationsRu))
})

// test("check that all translated", () => {
//     const flattenTranslationsEn = flatTranslations(_translations["en"])
//
//     Object.keys(_translations).forEach(lang => {
//         assert.deepEqual(Object.keys(flattenTranslationsEn), Object.keys(flatTranslations(_translations[lang])))
//     })
// })
