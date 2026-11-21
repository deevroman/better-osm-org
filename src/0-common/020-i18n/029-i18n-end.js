/**
 * @param {Translations} translations
 * @return {Object.<string, Translation>}
 */
function flatTranslations(translations) {
    return Object.fromEntries(
        Object.entries(translations).flatMap(([k1, value]) => {
            return Object.entries(value).map(([k2, v]) => [`${k1}.${k2}`, v])
        }),
    )
}

const flattenTranslations = flatTranslations(_translations[currentLocale])
const flattenTranslationsEn = currentLocale === "en" ? flattenTranslations : flatTranslations(_translations["en"])

if (Object.keys(flattenTranslations).length !== Object.keys(flattenTranslationsEn).length) {
    console.error(`⚠️missing translations in ${currentLocale} locale`)
}

/**
 * @param {Translation} translation
 * @param {Object|null} params
 * @return {string}
 */
function formatTranslation(translation, params = null) {
    if (typeof translation === "string") {
        if (params === null) {
            return translation
        }
        return translation.replaceAll(/\{(\w+)}/g, (match, key) => String(params[key] ?? match))
    }
    if (typeof translation === "function") {
        return translation(params)
    }
    console.error(`Invalid translation value: ${translation}`)
    return translation
}

/**
 * @param {string} key
 * @param {Object|null} params
 * @return {string}
 */
function t(key, params = null) {
    return formatTranslation(flattenTranslations[key] ?? flattenTranslationsEn[key] ?? key, params)
}

//</editor-fold>
