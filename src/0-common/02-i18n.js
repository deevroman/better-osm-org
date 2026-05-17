//<editor-fold desc="i18n" defaultstate="collapsed">

// WARN: work on i18n in progress. Notify me before start translation on your language

/** @typedef {"ru"|"en"} Langs */
/** @type {Langs} */
const currentLocale = ["ru-RU", "ru"].includes(navigator.language) ? "ru" : "en"

/** @typedef {string | ((params: Object) => string)} Translation */
/** @typedef {Record<string, Record<string, Translation>>} Translations */
/** @type {Record<Langs, Translations>} */
const _translations = {
    en: {
        objectEditor: {
            delete: "Delete",
        },
        historyDiff: {
            intermediateWayVersion: "Intermediate version",
            intermediateWayVersionTitle:
                "There have been changes to the tags or coordinates of nodes in the way that have not increased the way version",
            intermediateRelationVersion: "Intermediate version",
            intermediateRelationVersionTitle:
                "There have been changes to the tags or coordinates of nodes in the relation that have not increased the relation version",
            allVersions: "All versions",
            withGeometryChanges: "With geometry changes",
            withoutIntermediate: "Without intermediate",
            viewUnredactedHistory: "View Unredacted History β",
            tagsCount: ({ count }) => `${count} tag${count === 1 ? "" : "s"}`,
        },
        changesetQuicklook: {
            lineWasReversed: "ⓘ The line has been reversed",
            objectDeletedByAuthor: " ⓘ The object is now deleted by author",
            objectDeleted: " ⓘ The object is now deleted",
            objectDeletedTitle: "{user} deleted this object",
            objectRestored: " ⓘ The object is now restored",
            objectRestoredByAuthor: " ⓘ The object is now restored by author",
            objectRestoredTitle: "{user} restored this object",
        },
        editMenuLinks: {
            moreLinks: "more links",
            editLinksList: "edit links list",
        },
    },
    ru: {
        objectEditor: {
            delete: "Выпилить!",
        },
        historyDiff: {
            intermediateWayVersion: "Промежуточная версия",
            intermediateWayVersionTitle: "Произошли изменения тегов или координат точек в линии,\nкоторые не увеличили версию линии",
            intermediateRelationVersion: "Промежуточная версия",
            intermediateRelationVersionTitle:
                "Произошли изменения тегов или координат точек в отношении,\nкоторые не увеличили версию отношении",
            allVersions: "Все версии",
            withGeometryChanges: "Все изменения геометрии",
            withoutIntermediate: "Без промежуточных",
            viewUnredactedHistory: "Просмотр неотредактированной истории β",
            tagsCount: ({ count }) => {
                if (count === 1) {
                    return `${count} тег`
                }
                if ((count < 10 || count > 20) && [2, 3, 4].includes(count % 10)) {
                    return `${count} тега`
                }
                return `${count} тегов`
            },
        },
        changesetQuicklook: {
            lineWasReversed: " ⓘ Линию перевернули",
            objectDeletedByAuthor: " ⓘ Автор уже удалил объект",
            objectDeleted: " ⓘ Объект уже удалён",
            objectDeletedTitle: "{user} удалил этот объект",
            objectRestored: " ⓘ Объект сейчас восстановлен",
            objectRestoredByAuthor: " ⓘ Автор уже восстановил объект",
            objectRestoredTitle: "{user} восстановил этот объект",
        },
        editMenuLinks: {
            moreLinks: "больше ссылок",
            editLinksList: "редактировать список",
        },
    },
}

/**
 * @param {Translations} translations
 * @return {{[p: string]: unknown}}
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
    console.error(`missing translations in ${currentLocale} locale`)
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
