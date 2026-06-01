//<editor-fold desc="i18n-begin" defaultstate="collapsed">

const localeMap = {
    ru: ["ru-RU", "ru"],
    uk: ["uk-UA", "uk"],
    fr: ["fr-FR", "fr"],
    de: ["de-DE", "de"],
    hr: ["hr-HR", "hr"],
    tr: ["tr-TR", "tr"],
}

/** @typedef {"ru"|"en"|"uk"|"fr"|"de"|"hr"|"tr"} Langs */
/** @type {Langs} */
const currentLocale = Object.entries(localeMap).find(([, locales]) => locales.includes(navigator.language))?.[0] ?? "en"

/** @typedef {string | ((params: Object) => string)} Translation */
/** @typedef {Record<string, Record<string, Translation>>} Translations */
const _translations = /** @type {Record<Langs, Translations>} */ {}
