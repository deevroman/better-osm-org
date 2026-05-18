//<editor-fold desc="i18n" defaultstate="collapsed">

// WARN: work on i18n in progress. Notify me before start translation on your language

const localeMap = {
    ru: ["ru-RU", "ru"],
    uk: ["uk-UA", "uk"],
    fr: ["fr-FR", "fr"],
    de: ["de-DE", "de"],
    hr: ["hr-HR", "hr"],
}

/** @typedef {"ru"|"en"|"uk"|"fr"|"de"|"hr"} Langs */
/** @type {Langs} */
const currentLocale = Object.entries(localeMap).find(([, locales]) => locales.includes(navigator.language))?.[0] ?? "en"

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
    uk: {
        objectEditor: {
            delete: "Видалити",
        },
        historyDiff: {
            intermediateWayVersion: "Проміжна версія",
            intermediateWayVersionTitle: "Відбулися зміни тегів або координат точок у лінії,\nякі не збільшили версію лінії",
            intermediateRelationVersion: "Проміжна версія",
            intermediateRelationVersionTitle: "Відбулися зміни тегів або координат точок у відношенні,\nякі не збільшили версію відношення",
            allVersions: "Усі версії",
            withGeometryChanges: "Усі зміни геометрії",
            withoutIntermediate: "Без проміжних",
            viewUnredactedHistory: "Перегляд неретушованої історії β",
            tagsCount: ({ count }) => {
                if (count === 1) {
                    return `${count} тег`
                }
                if ((count < 10 || count > 20) && [2, 3, 4].includes(count % 10)) {
                    return `${count} теги`
                }
                return `${count} тегів`
            },
        },
        changesetQuicklook: {
            lineWasReversed: " ⓘ Лінію перевернули",
            objectDeletedByAuthor: " ⓘ Автор уже видалив об’єкт",
            objectDeleted: " ⓘ Об’єкт уже видалено",
            objectDeletedTitle: "{user} видалив цей об’єкт",
            objectRestored: " ⓘ Об’єкт зараз відновлено",
            objectRestoredByAuthor: " ⓘ Автор уже відновив об’єкт",
            objectRestoredTitle: "{user} відновив цей об’єкт",
        },
        editMenuLinks: {
            moreLinks: "більше посилань",
            editLinksList: "редагувати список",
        },
    },
    fr: {
        objectEditor: {
            delete: "Supprimer",
        },
        historyDiff: {
            intermediateWayVersion: "Version intermédiaire",
            intermediateWayVersionTitle:
                "Des modifications des tags ou des coordonnées des nœuds de la ligne\nn'ont pas augmenté la version de la ligne",
            intermediateRelationVersion: "Version intermédiaire",
            intermediateRelationVersionTitle:
                "Des modifications des tags ou des coordonnées des nœuds de la relation\nn'ont pas augmenté la version de la relation",
            allVersions: "Toutes les versions",
            withGeometryChanges: "Avec modifications géométriques",
            withoutIntermediate: "Sans intermédiaires",
            viewUnredactedHistory: "Voir l’historique non censuré β",
            tagsCount: ({ count }) => `${count} tag${count > 1 ? "s" : ""}`,
        },
        changesetQuicklook: {
            lineWasReversed: " ⓘ La ligne a été inversée",
            objectDeletedByAuthor: " ⓘ L’objet est maintenant supprimé par l’auteur",
            objectDeleted: " ⓘ L’objet est maintenant supprimé",
            objectDeletedTitle: "{user} a supprimé cet objet",
            objectRestored: " ⓘ L’objet est maintenant restauré",
            objectRestoredByAuthor: " ⓘ L’auteur a restauré l’objet",
            objectRestoredTitle: "{user} a restauré cet objet",
        },
        editMenuLinks: {
            moreLinks: "plus de liens",
            editLinksList: "modifier la liste",
        },
    },
    de: {
        objectEditor: {
            delete: "Löschen",
        },
        historyDiff: {
            intermediateWayVersion: "Zwischenversion",
            intermediateWayVersionTitle:
                "Es gab Änderungen an Tags oder Knotenkoordinaten der Linie,\ndie die Versionsnummer der Linie nicht erhöht haben",
            intermediateRelationVersion: "Zwischenversion",
            intermediateRelationVersionTitle:
                "Es gab Änderungen an Tags oder Knotenkoordinaten der Relation,\ndie die Versionsnummer der Relation nicht erhöht haben",
            allVersions: "Alle Versionen",
            withGeometryChanges: "Mit Geometrieänderungen",
            withoutIntermediate: "Ohne Zwischenversionen",
            viewUnredactedHistory: "Unzensierte Versionsgeschichte anzeigen β",
            tagsCount: ({ count }) => `${count} Tag${count === 1 ? "" : "s"}`,
        },
        changesetQuicklook: {
            lineWasReversed: " ⓘ Die Linie wurde umgedreht",
            objectDeletedByAuthor: " ⓘ Das Objekt wurde bereits vom Autor gelöscht",
            objectDeleted: " ⓘ Das Objekt wurde bereits gelöscht",
            objectDeletedTitle: "{user} hat dieses Objekt gelöscht",
            objectRestored: " ⓘ Das Objekt wurde wiederhergestellt",
            objectRestoredByAuthor: " ⓘ Der Autor hat das Objekt bereits wiederhergestellt",
            objectRestoredTitle: "{user} hat dieses Objekt wiederhergestellt",
        },
        editMenuLinks: {
            moreLinks: "mehr Links",
            editLinksList: "Linkliste bearbeiten",
        },
    },
    hr: {
        objectEditor: {
            delete: "Izbriši",
        },
        historyDiff: {
            intermediateWayVersion: "Međuverzija",
            intermediateWayVersionTitle: "Došlo je do promjena oznaka ili koordinata čvorova na liniji,\nkoje nisu povećale verziju linije",
            intermediateRelationVersion: "Međuverzija",
            intermediateRelationVersionTitle:
                "Došlo je do promjena oznaka ili koordinata čvorova u relaciji,\nkoje nisu povećale verziju relacije",
            allVersions: "Sve verzije",
            withGeometryChanges: "Sa promjenama geometrije",
            withoutIntermediate: "Bez međuverzija",
            viewUnredactedHistory: "Prikaži necenzuriranu povijest β",
            tagsCount: ({ count }) => `${count} oznaka${count % 10 >= 2 && count % 10 <= 4 && (count < 10 || count > 20) ? "e" : ""}`,
        },
        changesetQuicklook: {
            lineWasReversed: " ⓘ Linija je obrnuta",
            objectDeletedByAuthor: " ⓘ Autor je već izbrisao objekt",
            objectDeleted: " ⓘ Objekt je već izbrisan",
            objectDeletedTitle: "{user} je izbrisao ovaj objekt",
            objectRestored: " ⓘ Objekt je sada vraćen",
            objectRestoredByAuthor: " ⓘ Autor je već vratio objekt",
            objectRestoredTitle: "{user} je vratio ovaj objekt",
        },
        editMenuLinks: {
            moreLinks: "više poveznica",
            editLinksList: "uredi popis poveznica",
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
