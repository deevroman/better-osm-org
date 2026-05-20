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
        init: {
            disableBetterOsmOrg: "Disable better-osm-org",
            scriptVersion: "Script version: ",
        },
        config: {
            sectionID: "iD",
            sectionViewingEdits: "Viewing edits",
            sectionWorkingWithNotes: "Working with notes",
            sectionNewActions: "New actions",
            sectionOther: "Other",
            darkModeForMap: "Invert map colors in dark mode",
            colorblindFriendlyPalette: "Colorblind-friendly palette β",
            betterTagsPaste: "Add = when pasting tags separated by spaces or tabs",
            darkModeForID:
                'Dark mode for iD (<a href="https://userstyles.world/style/15596/openstreetmap-dark-theme" target="_blank">Thanks AlexPS</a>)',
            compactChangesetsHistory: "Compact changesets history",
            versionsDiff: "Add tags diff in history",
            showPreviousTagValue: "Show previous tag value",
            fullVersionsDiff: "Add diff with intermediate versions in way history",
            changesetQuickLook: "Add QuickLook for changesets",
            showChangesetGeometry: "Show geometry of objects in changeset",
            massChangesetsActions: "Add actions for changesets list (mass revert, filtering, ...)",
            imagesAndLinksInTags: "Make some tags clickable, shorter and display photos",
            hideNoteHighlight: "Hide note highlight",
            resolveNotesButton: "Addition resolve buttons:",
            revertButton: "Revert&Osmcha changeset button",
            deletor: "Button for node deletion",
            oneClickDeletor: "Delete node without confirmation",
            changesetsTemplates: 'Changesets comments templates <a id="last-comments-link" target="_blank">(your last comments)</a>',
            hdycInProfile: "Add HDYC to user profile",
            betterProfileStat: "Add filters to profile statistics",
            navigationViaHotkeys: 'Add hotkeys <a href="https://github.com/deevroman/better-osm-org#Hotkeys" target="_blank">(List)</a>',
            newEditorsLinks: "Add new editors into Edit menu",
            resetSearchFormFocus: "Reset search form focus",
            satelliteLayers: "Add satellite layers switches",
            swipes: "Add swipes between user changesets",
            resizableSidebar: "Slider for sidebar width",
            clickableAvatar: "Click by avatar for open changesets",
            overzoomForDataLayer: "Allow overzoom when data/satellite layer enabled β",
            dragAndDropViewers: "Drag&Drop for .geojson, .jpg, .gpx, .osm",
            viewer3DInNewTab: "Open buildings 3D viewers always in new tab",
            betterTaginfo: "Add new buttons in Taginfo",
            defaultZoomKeysBehaviour: "Do not double the zoom step of the buttons +/-",
            addLocationFromNominatim: "Add location from Nominatim for changesets and notes",
            overpassInstance:
                '<a href="https://wiki.openstreetmap.org/wiki/Overpass_API#Public_Overpass_API_instances">Overpass API server</a>',
            panoramaxUploader: "Add form for uploading photos into Panoramax",
            routersTimestamps: "Add routing data date",
            debugMode: "Enable debug and experimental features",
        },
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
            errorPleaseReport: "Error :( Please report this page in better-osm-org GitHub repo",
            someNodesHidden: "Some nodes was hidden by moderators",
            reloadAndReport: "Please try reload page.\nIf the error persists, a message about it in the better-osm-org repository",
            someNodesHiddenSad: "Some nodes was hidden by moderators :\\",
            filterIntermediateChanges: "Filter for intermediate changes",
            downloadAllVersionsWithIntermediate: "Download all versions (with intermediate versions)",
            someMembersHidden: "Some members was hidden by moderators",
            downloadAllVersions: "Download all versions",
            toggleCompactTagsDiff: "Toggle between full and compact tags diff.\nYou can also use the T key.",
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
            listWayNodesChanged: "List of way nodes has been changed",
            nodesReversed: "Nodes of the way were reversed",
            relationMembersChanged: "List of relation members has been changed.\nClick to see more details",
            showRelationMembers: "Show list of relation members",
            relationMembersReversed: "Members of the relation were reversed",
            pinRelationOnMap: "Pin relation on map",
            unpinRelationFromMap: "Unpin relation from map",
            nodeCoordinatesChanged: "Coordinates of node has been changed",
            downloadThisRelation: "Download this relation",
            shiftClickZoomVia: 'Click with Shift for zoom to "via" members',
            unableDisplaySomeData: "better-osm-org was unable to display some data",
        },
        editMenuLinks: {
            moreLinks: "more links",
            editLinksList: "edit links list",
            editLink: "edit link",
            pinThisLink: "pin this link",
            moveUpLink: "move up link",
            moveDownLink: "move down link",
            removeLink: "remove link",
            saveLink: "save link",
            openPlaceExternalWebsite: "Open place in external website",
        },
        routers: {
            routingDataTimeFor: "Routing data time for {name}: {time}",
            openDebugMap: "Open Debug Map",
        },
        satellite: {
            setupCustomStyleJson: "Setup custom style.json for MapLibre.js",
            setupCustomMapLayers: "Setup custom map layers",
            duplicateStyleAndEdit: "duplicate style and edit it",
            openMapStyleHomePage: "Open map style home page",
            openMapLayerHomePage: "Open map layer home page",
            switchMapAndSatellite: "Switch between map and satellite images",
            setCustomLayer: "Set custom layer (Shift + S)\nbetter-osm-org feature",
            setCustomVectorStyle: "Set custom vector style (Shift + V)",
        },
        geojson: {
            metainfo: "metainfo",
            needUpdateBetterOsmOrg: "Need update better-osm-org",
            switchTableAndRawEditor: "Switch between table and raw editor",
        },
        links: {
            webArchive: "WebArchive",
        },
        hotkeys: {
            availableCommands: "Available commands",
            recent: "Recent",
            noHotkeysMatchSearch: "No hotkeys match this search.",
            noCatalogedCommandsMatchPage: "No cataloged commands match this page.",
        },
        objectVersionPage: {
            length: "Length: {value}",
            area: "Area: {value}",
            pinRestrictionSign: "Pin restriction sign on map.\nYou can hide all the objects that better-osm-org adds by pressing ` or ~",
            hideRestrictionSign: "Hide restriction sign",
            selectCoordinatesFormat: "Select coordinates format for copy.\nTo copy just click by coordinates",
            setDefaultCopyFormat: "Set as default for copy, when you click by coordinates",
            defaultCopyFormat: "It's default format, when your click by coordinates",
            openExternalRelationViewer: "Click for open external relation viewer.\nOr use key O",
        },
        userProfile: {
            allEditors: "All editors",
            editorContributions: ({ editor, count }) => ` ${editor} (${count} contribution${count === 1 ? "" : "s"})`,
            osmcha: " [OSMCha] ",
            usernames: "Usernames: ",
            findingBlocks: " Finding blocks... ",
            copyIds: "Copy IDs",
            copyIdsCount: "Copy {count} IDs",
            noComment: "No comment",
            pastUsernames: "Past usernames: ",
            userIdLabel: "ID: ",
            disableTrackingProtection: "Please disable tracking protection so that the HDYC account login works",
            goToHdyc: "Go to https://www.hdyc.neis-one.org/",
            pleaseWaitUserChangesetsLoading: "Please wait while user changesets loading",
            openSelectedChangesetsOnePage: "Alt + O for open selected changesets on one page",
            regexSearchNotCaseSensitive: "Not case-sensitive regex search",
            viaWhosthat: "via whosthat.osmz.ru",
            viaOverpassApi: "via Overpass API",
        },
        changesetsHistory: {
            copyIds: "Copy IDs",
            copyIdsCount: "Copy {count} IDs",
            displayedCount: " Displayed {displayed}/{total}",
            hideBigChangesets: "Hide big changesets",
            hideChangesetsFrom: "🔄Hide changesets from ",
            showChangesetsFrom: "🔄Show changesets from ",
            hideChangesetsWith: "🔄Hide changesets with ",
            showChangesetsWith: "🔄Show changesets with ",
            loadMore: "Load {count}",
            displayOnOneMapAll: "Display on one map\nif nothing is checked, all uploaded non hidden changesets will open",
            displayOnOneMap: "Display on one map",
            addCheckboxesMassActions: "Add checkboxes for mass actions with changesets",
            clickHideUserChangesets: "Click for hide this user changesets",
            filterViaBetterOsmOrg: "Changesets filter via better-osm-org",
            filterBySubstringInComments: "Filter by substring in changesets comments",
            clickCopyChangesetId: "Click for copy changeset id",
        },
        measurer: {
            measureFromHere: "Measure from here",
            endMeasure: "End measure",
            cleanMeasurements: "Clean measurements",
            clickToSwitchUnits: "Click to switch units of measurement",
            orPressEscapeTwice: "Or press Escape twice",
        },
        panoramax: {
            blurFaces: "Blur faces",
        },
        idEditor: {
            findOffsets: "Find offsets",
        },
        changesetPage: {
            selectObjects: "Select objects",
            revertViaOsmRevert: "Revert via osm-revert",
            openInEditor: "Open in {editor}",
            openInLevel0: "Open in Level0",
            openInLevel0WithWaysGeometry: "Open in Level0 with ways geometry",
            openChangesetInOsmcha: "Open changeset in OSMCha (or press O)\n(shift + O for open Achavi)",
            partialRevertOrEdit: "to partial revert or edit in JOSM/Level0",
            hotkeyR: "Hotkey: R",
            hotkeyJ: "Hotkey: J",
            hotkeyAltJ: "Hotkey: Alt + J",
            hotkeyShiftAltJ: "Hotkey: Shift + Alt + J",
        },
        nodeMover: {
            moveNodeToHere: "Move node to here",
        },
        scriptMenu: {
            settings: "Settings",
            checkScriptUpdates: "Check script updates",
            checkDevScriptUpdates: "Check dev script updates",
            listOfHotkeys: "List of hotkeys",
        },
        actions: {
            remove: "remove",
        },
        copying: {
            clickForCopy: "Click for copy",
        },
        betterOsmOrg: {
            addedByBetterOsmOrg: "added by better-osm-org",
            experimentalFeature: "better-osm-org experimental feature",
        },
        osmcha: {
            openProfileInOsmcha: "Open profile in OSMCha",
        },
        selection: {
            shiftClickSelectRange: "Shift + click for select a range of empty checkboxes",
            clickForInvert: "Click for invert",
        },
        deletedUsers: {
            tryFindDeletedUser: "Try find deleted user",
        },
        findUserInDiff: {
            clickForCopyUserId: "Click for copy user ID",
        },
        changesetPageFixes: {
            osmchaReviewTag: "OSMCha review tag. Right click to change\n",
            totalUserChangesets: "how many changesets does the user have in total",
            showHiddenTags: "Show hidden tags",
            clickForViewMore: "Click for view more",
            mapperRequestedReview: "Mapper requested changeset review\n\nClick to filter changesets with review_requested=yes",
        },
        hashtags: {
            searchInOsmcha: "Search this hashtags in OSMCha",
            filterNotesByHashtag:
                "Click for filter notes by this hashtag.\nClick with CTLR or Shift for search this hashtags in osm-note-viewer",
            clickToCopyName: "Click to copy name",
            clickToCopyType: "Click to copy type",
        },
        userBadges: {
            userModerator: "This user is a moderator",
            userImporter: "This user is a importer",
            userBanned: "The user was banned",
            userNewbie: "At the time of creating the changeset/note, the user had been editing OpenStreetMap for less than a month",
            followingUser: "You are following this user",
        },
        notes: {
            openMapStateSnapshot: "Open the map state at the time of map snapshot",
            openMapStateNoteCreation: "Open the map state at the time of note creation",
            commaSeparatedSubstrings: "comma-separated substrings\nfilter also works by comments",
            commaSeparatedUsernames: "comma-separated usernames",
        },
        spyGlass: {
            activateSpyGlass: "Activate SpyGlass imitation mode (better-osm-org experiment)",
        },
        gpxFilter: {
            clickToZoomTrack: "click to zoom\nTip: press 8-9 to navigate between previous/next map position",
            showGpxTracks: "Show GPX tracks in current map view",
        },
        objectPage: {
            gpsTrackerPosition: "Blue — position from GPS tracker\nOrange — estimated real position",
            roofOrientationAcrossAlong: 'roof:orientation must be either "across" or "along"',
            conditionalMustContainAt: ":conditional tag value must be contain @",
            emptyPartAfterAt: "empty part after @",
            emptyPartBeforeAt: "empty part before @",
            emptyPartBetweenAt: "empty part between @",
            observationNotFound: "Observation not found in iNaturalist API",
            noErrorsOpeningHours: "no errors were found by opening_hours.js 👍",
            phoneMustStartPlus: "phone number must start with +",
            easterEgg: "better-osm-org easter egg",
            needRoofOrientation: "it seems to need to be changed to roof:orientation",
            clickShowEmbedded3d: "Click for show embedded 3D Viewer.\nIn userscript setting you can set open in OSM page by default",
            setAsDefaultForClick: "Set as default for click",
            defaultViewer: "It's default viewer",
            keyTooShort: "The key is too short",
            suspiciousCapitalKey: "Suspicious key starting with a capital letter",
            openObjectHistory: "Click for open object history page\nOr press key H",
        },
        taginfo: {
            searchWithOverpass: "search with Overpass",
        },
        relationVersionPage: {
            loadViaOverpass: "Load relation version via Overpass API",
        },
    },
    ru: {
        init: {
            disableBetterOsmOrg: "Отключите better-osm-org",
            scriptVersion: "Версия скрипта: ",
        },
        config: {
            sectionID: "iD",
            sectionViewingEdits: "Просмотр правок",
            sectionWorkingWithNotes: "Работа с заметками",
            sectionNewActions: "Новые действия",
            sectionOther: "Прочее",
            darkModeForMap: "Инвертировать цвета карты в тёмной теме",
            colorblindFriendlyPalette: "Палитра для дальтоников β",
            betterTagsPaste: "Добавлять = при вставке тегов, разделённых пробелами или табами",
            darkModeForID:
                'Тёмная тема для iD (<a href="https://userstyles.world/style/15596/openstreetmap-dark-theme" target="_blank">Спасибо AlexPS</a>)',
            compactChangesetsHistory: "Компактная история пакетов правок",
            versionsDiff: "Цветной дифф тегов в истории",
            showPreviousTagValue: "Показывать предыдущее значение тега",
            fullVersionsDiff: "Показывать промежуточные версии в истории линий",
            changesetQuickLook: "QuickLook для пакетов правок",
            showChangesetGeometry: "Показывать геометрию объектов в пакете правок",
            massChangesetsActions: "Добавить действия для списка пакетов правок (массовый откат, фильтрация, ...)",
            imagesAndLinksInTags: "Сделать некоторые теги кликабельными, короче и показывать фотографии",
            hideNoteHighlight: "Скрывать подсветку заметки",
            resolveNotesButton: "Дополнительные кнопки закрытия заметок:",
            revertButton: "Кнопки отката и открытия OSMCha для пакета правок",
            deletor: "Кнопка удаления узла",
            oneClickDeletor: "Удалять узел без подтверждения",
            changesetsTemplates: 'Шаблоны комментариев к правкам <a id="last-comments-link" target="_blank">(ваши последние комментарии)</a>',
            hdycInProfile: "Добавить HDYC в профиль пользователя",
            betterProfileStat: "Добавить фильтры в статистику профиля",
            navigationViaHotkeys:
                'Включить горячие клавиши <a href="https://github.com/deevroman/better-osm-org#Hotkeys" target="_blank">(список)</a>',
            newEditorsLinks: "Больше ссылок в меню Правка",
            resetSearchFormFocus: "Сбрасывать фокус с формы поиска",
            satelliteLayers: "Добавить переключатели спутникового слоя",
            swipes: "Добавить свайпы между страницами правок пользователя",
            resizableSidebar: "Разрешить изменять ширину боковой панели",
            clickableAvatar: "Открывать пакеты правок по клику на аватар",
            overzoomForDataLayer: "Разрешить оверзум при включённом слое данные или подложке β",
            dragAndDropViewers: "Drag&Drop для .geojson, .jpg, .gpx, .osm",
            viewer3DInNewTab: "Открывать 3D-просмотрщики зданий в новой вкладке",
            betterTaginfo: "Добавить новые кнопки в Taginfo",
            defaultZoomKeysBehaviour: "Не удваивать шаг зума для кнопок +/-",
            addLocationFromNominatim: "Отображать адрес из Nominatim для правок и заметок",
            overpassInstance:
                '<a href="https://wiki.openstreetmap.org/wiki/Overpass_API#Public_Overpass_API_instances">Сервер Overpass API</a>',
            panoramaxUploader: "Добавить форму загрузки фотографий в Panoramax",
            routersTimestamps: "Показывать дату данных для GraphHopper, OSRM, Valhalla",
            debugMode: "Включить отладочные и экспериментальные фичи",
        },
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
            errorPleaseReport: "Ошибка :( Пожалуйста, сообщите об этом в GitHub-репозитории better-osm-org",
            someNodesHidden: "Некоторые точки были скрыты модераторами",
            reloadAndReport: "Попробуйте перезагрузить страницу.\nЕсли ошибка сохраняется, напишите об этом в репозитории better-osm-org",
            someNodesHiddenSad: "Некоторые точки были скрыты модераторами :\\",
            filterIntermediateChanges: "Фильтр промежуточных изменений",
            downloadAllVersionsWithIntermediate: "Скачать все версии (включая промежуточные)",
            someMembersHidden: "Некоторые участники были скрыты модераторами",
            downloadAllVersions: "Скачать все версии",
            toggleCompactTagsDiff: "Переключить между полным и компактным diff тегов.\nТакже можно использовать клавишу T.",
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
            listWayNodesChanged: "Список точек линии был изменён",
            nodesReversed: "Точки линии были развернуты",
            relationMembersChanged: "Список участников отношения был изменён.\nНажмите, чтобы увидеть подробности",
            showRelationMembers: "Показать список участников отношения",
            relationMembersReversed: "Участники отношения были развернуты",
            pinRelationOnMap: "Закрепить отношение на карте",
            unpinRelationFromMap: "Убрать отношение с карты",
            nodeCoordinatesChanged: "Координаты точки были изменены",
            downloadThisRelation: "Скачать это отношение",
            shiftClickZoomVia: "Нажмите с Shift, чтобы приблизить участников с ролью «via»",
            unableDisplaySomeData: "better-osm-org не смог отобразить некоторые данные",
        },
        editMenuLinks: {
            moreLinks: "больше ссылок",
            editLinksList: "редактировать список",
            editLink: "редактировать ссылку",
            pinThisLink: "закрепить эту ссылку",
            moveUpLink: "переместить ссылку вверх",
            moveDownLink: "переместить ссылку вниз",
            removeLink: "удалить ссылку",
            saveLink: "сохранить ссылку",
            openPlaceExternalWebsite: "Открыть место на внешнем сайте",
        },
        routers: {
            routingDataTimeFor: "Время данных роутинга для {name}: {time}",
            openDebugMap: "Открыть Debug Map",
        },
        satellite: {
            setupCustomStyleJson: "Настройка своего стиля векторной карты",
            setupCustomMapLayers: "Настройка подложки карты",
            duplicateStyleAndEdit: "дублировать стиль и отредактировать его",
            openMapStyleHomePage: "Открыть домашнюю страницу стиля карты",
            openMapLayerHomePage: "Открыть домашнюю страницу слоя карты",
            switchMapAndSatellite: "Переключение между картой и спутниковыми снимками",
            setCustomLayer: "Задать свой слой (Shift + S)\nфича better-osm-org",
            setCustomVectorStyle: "Задать свой векторный стиль (Shift + V)",
        },
        geojson: {
            metainfo: "метаинформация",
            needUpdateBetterOsmOrg: "Нужно обновить better-osm-org",
            switchTableAndRawEditor: "Переключить между таблицей и сырым редактором",
        },
        links: {
            webArchive: "WebArchive",
        },
        hotkeys: {
            availableCommands: "Доступные команды",
            recent: "Недавние",
            noHotkeysMatchSearch: "Нет подходящих горячих клавиш.",
            noCatalogedCommandsMatchPage: "Для этой страницы нет подходящих команд.",
        },
        objectVersionPage: {
            length: "Длина: {value}",
            area: "Площадь: {value}",
            pinRestrictionSign:
                "Закрепить знак restriction на карте.\nВы можете скрыть все объекты, которые добавляет better-osm-org, нажав ` или ~",
            hideRestrictionSign: "Скрыть знак restriction",
            selectCoordinatesFormat: "Выберите формат координат для копирования.\nЧтобы скопировать, просто нажмите по координатам",
            setDefaultCopyFormat: "Сделать форматом копирования по умолчанию при клике по координатам",
            defaultCopyFormat: "Это формат по умолчанию при клике по координатам",
            openExternalRelationViewer: "Нажмите, чтобы открыть внешний просмотрщик отношений.\nИли используйте клавишу O",
        },
        userProfile: {
            allEditors: "Все редакторы",
            editorContributions: ({ editor, count }) => ` ${editor} (${count} вклад${count === 1 ? "" : count < 5 ? "а" : "ов"})`,
            osmcha: " [OSMCha] ",
            usernames: "Имена пользователей: ",
            findingBlocks: " Ищем блокировки... ",
            copyIds: "Скопировать ID",
            copyIdsCount: "Скопировать {count} ID",
            noComment: "Без комментария",
            pastUsernames: "Прошлые имена: ",
            userIdLabel: "ID: ",
            disableTrackingProtection: "Отключите защиту от отслеживания, чтобы заработал показ информации с сайта HDYC",
            goToHdyc: "Открыть https://www.hdyc.neis-one.org/",
            pleaseWaitUserChangesetsLoading: "Подождите, пока загружаются пакеты правок пользователя",
            openSelectedChangesetsOnePage: "Alt + O для открытия выбранных пакетов правок на одной странице",
            regexSearchNotCaseSensitive: "Регулярное выражение без учёта регистра",
            viaWhosthat: "через whosthat.osmz.ru",
            viaOverpassApi: "через Overpass API",
        },
        changesetsHistory: {
            copyIds: "Скопировать ID",
            copyIdsCount: "Скопировать {count} ID",
            displayedCount: " Показано {displayed}/{total}",
            hideBigChangesets: "Скрывать большие пакеты правок",
            hideChangesetsFrom: "🔄Скрывать правки от ",
            showChangesetsFrom: "🔄Показывать правки от ",
            hideChangesetsWith: "🔄Скрывать правки с ",
            showChangesetsWith: "🔄Только правки с ",
            loadMore: "Загрузить {count}",
            displayOnOneMapAll: "Показать на одной карте\nесли ничего не отмечено, откроются все загруженные и не скрытые пакеты правок",
            displayOnOneMap: "Показать на одной карте",
            addCheckboxesMassActions: "Добавить чекбоксы для массовых действий с пакетами правок",
            clickHideUserChangesets: "Нажмите, чтобы скрыть пакеты правок этого пользователя",
            filterViaBetterOsmOrg: "Фильтр пакетов правок через better-osm-org",
            filterBySubstringInComments: "Фильтр по подстроке в комментариях пакетов правок",
            clickCopyChangesetId: "Нажмите, чтобы скопировать ID пакета правок",
        },
        measurer: {
            measureFromHere: "Измерить отсюда",
            endMeasure: "Закончить измерение",
            cleanMeasurements: "Очистить измерения",
            clickToSwitchUnits: "Нажмите, чтобы переключить единицы измерения",
            orPressEscapeTwice: "Или нажмите Escape дважды",
        },
        panoramax: {
            blurFaces: "Размыть лица",
        },
        idEditor: {
            findOffsets: "Найти смещения",
        },
        changesetPage: {
            selectObjects: "Выбрать объекты",
            revertViaOsmRevert: "Откатить через osm-revert",
            openInEditor: "Открыть в {editor}",
            openInLevel0: "Открыть в Level0",
            openInLevel0WithWaysGeometry: "Открыть в Level0 с геометрией линий",
            openChangesetInOsmcha: "Открыть пакет правок в OSMCha (или нажмите O)\n(Shift + O для открытия Achavi)",
            partialRevertOrEdit: "для частичного отката или редактирования в JOSM/Level0",
            hotkeyR: "Горячая клавиша: R",
            hotkeyJ: "Горячая клавиша: J",
            hotkeyAltJ: "Горячая клавиша: Alt + J",
            hotkeyShiftAltJ: "Горячая клавиша: Shift + Alt + J",
        },
        nodeMover: {
            moveNodeToHere: "Переместить точку сюда",
        },
        scriptMenu: {
            settings: "Настройки",
            checkScriptUpdates: "Проверить обновления скрипта",
            checkDevScriptUpdates: "Проверить обновления dev-версии скрипта",
            listOfHotkeys: "Список горячих клавиш",
        },
        actions: {
            remove: "удалить",
        },
        copying: {
            clickForCopy: "Нажмите, чтобы скопировать",
        },
        betterOsmOrg: {
            addedByBetterOsmOrg: "добавлено better-osm-org",
            experimentalFeature: "экспериментальная фича better-osm-org",
        },
        osmcha: {
            openProfileInOsmcha: "Открыть профиль в OSMCha",
        },
        selection: {
            shiftClickSelectRange: "Shift + click для выбора диапазона пустых чекбоксов",
            clickForInvert: "Нажмите, чтобы инвертировать",
        },
        deletedUsers: {
            tryFindDeletedUser: "Попробовать найти удалённого пользователя",
        },
        findUserInDiff: {
            clickForCopyUserId: "Нажмите, чтобы скопировать ID пользователя",
        },
        changesetPageFixes: {
            osmchaReviewTag: "Тег проверки OSMCha. Правая кнопка мыши для изменения\n",
            totalUserChangesets: "сколько всего пакетов правок у пользователя",
            showHiddenTags: "Показать скрытые теги",
            clickForViewMore: "Нажмите, чтобы показать больше",
            mapperRequestedReview:
                "Маппер запросил проверку пакета правок\n\nНажмите, чтобы отфильтровать пакеты правок с review_requested=yes",
        },
        hashtags: {
            searchInOsmcha: "Искать этот хэштег в OSMCha",
            filterNotesByHashtag:
                "Нажмите, чтобы фильтровать заметки по этому хэштегу.\nНажмите с CTLR или Shift, чтобы искать этот хэштег в osm-note-viewer",
            clickToCopyName: "Нажмите, чтобы скопировать имя",
            clickToCopyType: "Нажмите, чтобы скопировать тип",
        },
        userBadges: {
            userModerator: "Этот пользователь является модератором",
            userImporter: "Этот пользователь является импортёром",
            userBanned: "Пользователь был заблокирован",
            userNewbie: "На момент создания пакета правок или заметки пользователь редактировал OpenStreetMap меньше месяца",
            followingUser: "Вы подписаны на этого пользователя",
        },
        notes: {
            openMapStateSnapshot: "Открыть состояние карты на момент снимка",
            openMapStateNoteCreation: "Открыть состояние карты на момент создания заметки",
            commaSeparatedSubstrings: "подстроки через запятую\nфильтр также работает по комментариям",
            commaSeparatedUsernames: "имена пользователей через запятую",
        },
        spyGlass: {
            activateSpyGlass: "Включить режим SpyGlass (эксперимент better-osm-org)",
        },
        gpxFilter: {
            clickToZoomTrack: "нажмите для приближения\nПодсказка: нажимайте 8-9 для перехода между предыдущим и следующим положением карты",
            showGpxTracks: "Показать GPX-треки в текущем окне карты",
        },
        objectPage: {
            gpsTrackerPosition: "Синий — позиция по GPS-трекеру\nОранжевый — предполагаемая реальная позиция",
            roofOrientationAcrossAlong: "roof:orientation должен быть либо «across», либо «along»",
            conditionalMustContainAt: "значение тега :conditional должно содержать @",
            emptyPartAfterAt: "пустая часть после @",
            emptyPartBeforeAt: "пустая часть перед @",
            emptyPartBetweenAt: "пустая часть между @",
            observationNotFound: "Наблюдение не найдено в API iNaturalist",
            noErrorsOpeningHours: "opening_hours.js не нашёл ошибок 👍",
            phoneMustStartPlus: "номер телефона должен начинаться с +",
            easterEgg: "пасхалка от better-osm-org",
            needRoofOrientation: "похоже, это нужно заменить на roof:orientation",
            clickShowEmbedded3d:
                "Нажмите, чтобы показать встроенный 3D Viewer.\nВ настройках userscript можно задать открытие на странице OSM по умолчанию",
            setAsDefaultForClick: "Установить по умолчанию для клика",
            defaultViewer: "Это просмотрщик по умолчанию",
            keyTooShort: "Ключ слишком короткий",
            suspiciousCapitalKey: "Подозрительный ключ, начинающийся с заглавной буквы",
            openObjectHistory: "Нажмите, чтобы открыть страницу истории объекта\nИли нажмите клавишу H",
        },
        taginfo: {
            searchWithOverpass: "Поиск через Overpass",
        },
        relationVersionPage: {
            loadViaOverpass: "Загрузить версию отношения через Overpass API",
        },
    },
    uk: {
        init: {
            disableBetterOsmOrg: "Вимкніть better-osm-org",
            scriptVersion: "Версія скрипта: ",
        },
        config: {
            sectionID: "iD",
            sectionViewingEdits: "Перегляд редагувань",
            sectionWorkingWithNotes: "Робота із замітками",
            sectionNewActions: "Нові дії",
            sectionOther: "Інше",
            darkModeForMap: "Інвертувати кольори мапи в темній темі",
            colorblindFriendlyPalette: "Палітра для людей із порушенням сприйняття кольорів β",
            betterTagsPaste: "Додавати = під час вставлення тегів, розділених пробілами або табуляцією",
            darkModeForID:
                'Темна тема для iD (<a href="https://userstyles.world/style/15596/openstreetmap-dark-theme" target="_blank">Дякуємо AlexPS</a>)',
            compactChangesetsHistory: "Компактна історія changeset’ів",
            versionsDiff: "Додати diff тегів в історії",
            showPreviousTagValue: "Показувати попереднє значення тега",
            fullVersionsDiff: "Додати diff із проміжними версіями в історії ліній",
            changesetQuickLook: "Додати QuickLook для changeset’ів",
            showChangesetGeometry: "Показувати геометрію об’єктів у changeset’і",
            massChangesetsActions: "Додати дії для списку changeset’ів (масовий revert, фільтрація, ...)",
            imagesAndLinksInTags: "Зробити деякі теги клікабельними, коротшими та показувати фотографії",
            hideNoteHighlight: "Приховувати підсвічування замітки",
            resolveNotesButton: "Додаткові кнопки закриття заміток:",
            revertButton: "Кнопка Revert&Osmcha для changeset’а",
            deletor: "Кнопка видалення вузла",
            oneClickDeletor: "Видаляти вузол без підтвердження",
            changesetsTemplates: 'Шаблони коментарів до changeset’ів <a id="last-comments-link" target="_blank">(ваші останні коментарі)</a>',
            hdycInProfile: "Додати HDYC до профілю користувача",
            betterProfileStat: "Додати фільтри до статистики профілю",
            navigationViaHotkeys:
                'Додати гарячі клавіші <a href="https://github.com/deevroman/better-osm-org#Hotkeys" target="_blank">(список)</a>',
            newEditorsLinks: "Додати нові редактори до меню редагування",
            resetSearchFormFocus: "Скидати фокус із форми пошуку",
            satelliteLayers: "Додати перемикачі супутникових шарів",
            swipes: "Додати свайпи між changeset’ами користувача",
            resizableSidebar: "Повзунок ширини бічної панелі",
            clickableAvatar: "Відкривати changeset’и натисканням на аватар",
            overzoomForDataLayer: "Дозволити overzoom, коли ввімкнено data/satellite шар β",
            dragAndDropViewers: "Drag&Drop для .geojson, .jpg, .gpx, .osm",
            viewer3DInNewTab: "Завжди відкривати 3D-переглядачі будівель у новій вкладці",
            betterTaginfo: "Додати нові кнопки в Taginfo",
            defaultZoomKeysBehaviour: "Не подвоювати крок зуму для кнопок +/-",
            addLocationFromNominatim: "Додати місцезнаходження з Nominatim для changeset’ів і заміток",
            overpassInstance:
                '<a href="https://wiki.openstreetmap.org/wiki/Overpass_API#Public_Overpass_API_instances">Сервер Overpass API</a>',
            panoramaxUploader: "Додати форму завантаження фотографій у Panoramax",
            routersTimestamps: "Додати дату даних маршрутизації",
            debugMode: "Увімкнути налагоджувальні та експериментальні функції",
        },
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
            errorPleaseReport: "Помилка :( Будь ласка, повідомте про це в GitHub-репозиторії better-osm-org",
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
        routers: {
            routingDataTimeFor: "Час даних роутингу для {name}: {time}",
            openDebugMap: "Відкрити Debug Map",
        },
        satellite: {
            setupCustomStyleJson: "Налаштування власного стилю векторної карти",
            setupCustomMapLayers: "Налаштування підкладки карти",
        },
        geojson: {
            metainfo: "метаінформація",
            needUpdateBetterOsmOrg: "Потрібно оновити better-osm-org",
        },
        links: {
            webArchive: "WebArchive",
        },
        hotkeys: {
            availableCommands: "Доступні команди",
            recent: "Нещодавні",
            noHotkeysMatchSearch: "Немає відповідних гарячих клавіш.",
            noCatalogedCommandsMatchPage: "Для цієї сторінки немає відповідних команд.",
        },
        objectVersionPage: {
            length: "Довжина: {value}",
            area: "Площа: {value}",
        },
        userProfile: {
            allEditors: "Усі редактори",
            editorContributions: ({ editor, count }) => ` ${editor} (${count} внес${count === 1 ? "ок" : count < 5 ? "ки" : "ків"})`,
            osmcha: " [OSMCha] ",
            usernames: "Імена користувачів: ",
            findingBlocks: " Шукаємо блокування... ",
            copyIds: "Скопіювати ID",
            copyIdsCount: "Скопіювати {count} ID",
            noComment: "Без коментаря",
            pastUsernames: "Колишні імена: ",
            userIdLabel: "ID: ",
            disableTrackingProtection: "Вимкніть захист від стеження, щоб запрацював показ інформації з сайту HDYC",
            goToHdyc: "Відкрити https://www.hdyc.neis-one.org/",
        },
        changesetsHistory: {
            copyIds: "Скопіювати ID",
            copyIdsCount: "Скопіювати {count} ID",
            displayedCount: " Показано {displayed}/{total}",
            hideBigChangesets: "Приховувати великі пакети редагувань",
            hideChangesetsFrom: "🔄Приховувати редагування від ",
            showChangesetsFrom: "🔄Показувати редагування від ",
            hideChangesetsWith: "🔄Приховувати редагування з ",
            showChangesetsWith: "🔄Лише редагування з ",
            loadMore: "Завантажити {count}",
        },
        measurer: {
            measureFromHere: "Виміряти звідси",
            endMeasure: "Завершити вимірювання",
            cleanMeasurements: "Очистити вимірювання",
        },
        panoramax: {
            blurFaces: "Розмити обличчя",
        },
        idEditor: {
            findOffsets: "Знайти зміщення",
        },
        changesetPage: {
            selectObjects: "Вибрати об’єкти",
            revertViaOsmRevert: "Відкотити через osm-revert",
            openInEditor: "Відкрити в {editor}",
            openInLevel0: "Відкрити в Level0",
            openInLevel0WithWaysGeometry: "Відкрити в Level0 з геометрією ліній",
        },
        nodeMover: {
            moveNodeToHere: "Перемістити точку сюди",
        },
        scriptMenu: {
            settings: "Налаштування",
            checkScriptUpdates: "Перевірити оновлення скрипта",
            checkDevScriptUpdates: "Перевірити оновлення dev-версії скрипта",
            listOfHotkeys: "Список гарячих клавіш",
        },
    },
    fr: {
        init: {
            disableBetterOsmOrg: "Désactivez better-osm-org",
            scriptVersion: "Version du script : ",
        },
        config: {
            sectionID: "iD",
            sectionViewingEdits: "Consultation des modifications",
            sectionWorkingWithNotes: "Travail avec les notes",
            sectionNewActions: "Nouvelles actions",
            sectionOther: "Autre",
            darkModeForMap: "Inverser les couleurs de la carte en mode sombre",
            colorblindFriendlyPalette: "Palette adaptée au daltonisme β",
            betterTagsPaste: "Ajouter = lors du collage de tags séparés par des espaces ou des tabulations",
            darkModeForID:
                'Mode sombre pour iD (<a href="https://userstyles.world/style/15596/openstreetmap-dark-theme" target="_blank">Merci AlexPS</a>)',
            compactChangesetsHistory: "Historique compact des changesets",
            versionsDiff: "Ajouter le diff des tags dans l’historique",
            showPreviousTagValue: "Afficher la valeur précédente du tag",
            fullVersionsDiff: "Ajouter un diff avec les versions intermédiaires dans l’historique des lignes",
            changesetQuickLook: "Ajouter QuickLook pour les changesets",
            showChangesetGeometry: "Afficher la géométrie des objets dans le changeset",
            massChangesetsActions: "Ajouter des actions pour la liste des changesets (revert massif, filtrage, ...)",
            imagesAndLinksInTags: "Rendre certains tags cliquables, plus courts et afficher des photos",
            hideNoteHighlight: "Masquer la surbrillance des notes",
            resolveNotesButton: "Boutons supplémentaires de résolution des notes :",
            revertButton: "Bouton de changeset Revert&Osmcha",
            deletor: "Bouton de suppression de nœud",
            oneClickDeletor: "Supprimer le nœud sans confirmation",
            changesetsTemplates:
                'Modèles de commentaires de changesets <a id="last-comments-link" target="_blank">(vos derniers commentaires)</a>',
            hdycInProfile: "Ajouter HDYC au profil utilisateur",
            betterProfileStat: "Ajouter des filtres aux statistiques du profil",
            navigationViaHotkeys:
                'Ajouter des raccourcis clavier <a href="https://github.com/deevroman/better-osm-org#Hotkeys" target="_blank">(liste)</a>',
            newEditorsLinks: "Ajouter de nouveaux éditeurs au menu d’édition",
            resetSearchFormFocus: "Réinitialiser le focus du formulaire de recherche",
            satelliteLayers: "Ajouter des commutateurs de couches satellite",
            swipes: "Ajouter des balayages entre les changesets de l’utilisateur",
            resizableSidebar: "Curseur pour la largeur de la barre latérale",
            clickableAvatar: "Cliquer sur l’avatar pour ouvrir les changesets",
            overzoomForDataLayer: "Autoriser le sur-zoom quand la couche data/satellite est activée β",
            dragAndDropViewers: "Glisser-déposer pour .geojson, .jpg, .gpx, .osm",
            viewer3DInNewTab: "Toujours ouvrir les visionneuses 3D des bâtiments dans un nouvel onglet",
            betterTaginfo: "Ajouter de nouveaux boutons dans Taginfo",
            defaultZoomKeysBehaviour: "Ne pas doubler le pas de zoom des boutons +/-",
            addLocationFromNominatim: "Ajouter l’emplacement depuis Nominatim pour les changesets et les notes",
            overpassInstance:
                '<a href="https://wiki.openstreetmap.org/wiki/Overpass_API#Public_Overpass_API_instances">Serveur Overpass API</a>',
            panoramaxUploader: "Ajouter un formulaire pour téléverser des photos dans Panoramax",
            routersTimestamps: "Ajouter la date des données de routage",
            debugMode: "Activer les fonctionnalités de débogage et expérimentales",
        },
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
            errorPleaseReport: "Erreur :( Merci de signaler cela dans le dépôt GitHub de better-osm-org",
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
        routers: {
            routingDataTimeFor: "Date des données de routage pour {name} : {time}",
            openDebugMap: "Ouvrir Debug Map",
        },
        satellite: {
            setupCustomStyleJson: "Configurer votre propre style de carte vectorielle",
            setupCustomMapLayers: "Configurer le fond de carte",
        },
        geojson: {
            metainfo: "métainformations",
            needUpdateBetterOsmOrg: "Il faut mettre à jour better-osm-org",
        },
        links: {
            webArchive: "WebArchive",
        },
        hotkeys: {
            availableCommands: "Commandes disponibles",
            recent: "Récentes",
            noHotkeysMatchSearch: "Aucun raccourci correspondant.",
            noCatalogedCommandsMatchPage: "Aucune commande adaptée à cette page.",
        },
        objectVersionPage: {
            length: "Longueur : {value}",
            area: "Surface : {value}",
        },
        userProfile: {
            allEditors: "Tous les éditeurs",
            editorContributions: ({ editor, count }) => ` ${editor} (${count} contribution${count > 1 ? "s" : ""})`,
            osmcha: " [OSMCha] ",
            usernames: "Noms d’utilisateur : ",
            findingBlocks: " Recherche des blocages... ",
            copyIds: "Copier les ID",
            copyIdsCount: "Copier {count} ID",
            noComment: "Sans commentaire",
            pastUsernames: "Anciens noms : ",
            userIdLabel: "ID : ",
            disableTrackingProtection:
                "Désactivez la protection contre le pistage pour que l’affichage des informations du site HDYC fonctionne",
            goToHdyc: "Ouvrir https://www.hdyc.neis-one.org/",
        },
        changesetsHistory: {
            copyIds: "Copier les ID",
            copyIdsCount: "Copier {count} ID",
            displayedCount: " Affichés {displayed}/{total}",
            hideBigChangesets: "Masquer les gros lots de modifications",
            hideChangesetsFrom: "🔄Masquer les modifications de ",
            showChangesetsFrom: "🔄Afficher les modifications de ",
            hideChangesetsWith: "🔄Masquer les modifications avec ",
            showChangesetsWith: "🔄Uniquement les modifications avec ",
            loadMore: "Charger {count}",
        },
        measurer: {
            measureFromHere: "Mesurer à partir d’ici",
            endMeasure: "Terminer la mesure",
            cleanMeasurements: "Effacer les mesures",
        },
        panoramax: {
            blurFaces: "Flouter les visages",
        },
        idEditor: {
            findOffsets: "Trouver les décalages",
        },
        changesetPage: {
            selectObjects: "Sélectionner les objets",
            revertViaOsmRevert: "Annuler via osm-revert",
            openInEditor: "Ouvrir dans {editor}",
            openInLevel0: "Ouvrir dans Level0",
            openInLevel0WithWaysGeometry: "Ouvrir dans Level0 avec la géométrie des lignes",
        },
        nodeMover: {
            moveNodeToHere: "Déplacer le point ici",
        },
        scriptMenu: {
            settings: "Paramètres",
            checkScriptUpdates: "Vérifier les mises à jour du script",
            checkDevScriptUpdates: "Vérifier les mises à jour de la version dev du script",
            listOfHotkeys: "Liste des raccourcis clavier",
        },
    },
    de: {
        init: {
            disableBetterOsmOrg: "Deaktivieren Sie better-osm-org",
            scriptVersion: "Skriptversion: ",
        },
        config: {
            sectionID: "iD",
            sectionViewingEdits: "Bearbeitungen anzeigen",
            sectionWorkingWithNotes: "Arbeiten mit Notizen",
            sectionNewActions: "Neue Aktionen",
            sectionOther: "Sonstiges",
            darkModeForMap: "Kartenfarben im Dunkelmodus invertieren",
            colorblindFriendlyPalette: "Farbenblindfreundliche Palette β",
            betterTagsPaste: "= hinzufügen, wenn durch Leerzeichen oder Tabs getrennte Tags eingefügt werden",
            darkModeForID:
                'Dunkelmodus für iD (<a href="https://userstyles.world/style/15596/openstreetmap-dark-theme" target="_blank">Danke AlexPS</a>)',
            compactChangesetsHistory: "Kompakte Changeset-Historie",
            versionsDiff: "Tag-Diff in der Historie hinzufügen",
            showPreviousTagValue: "Vorherigen Tag-Wert anzeigen",
            fullVersionsDiff: "Diff mit Zwischenversionen in der Linienhistorie hinzufügen",
            changesetQuickLook: "QuickLook für Changesets hinzufügen",
            showChangesetGeometry: "Geometrie von Objekten im Changeset anzeigen",
            massChangesetsActions: "Aktionen für die Changeset-Liste hinzufügen (Massen-Revert, Filterung, ...)",
            imagesAndLinksInTags: "Einige Tags anklickbar und kürzer machen und Fotos anzeigen",
            hideNoteHighlight: "Notizhervorhebung ausblenden",
            resolveNotesButton: "Zusätzliche Schließen-Schaltflächen für Notizen:",
            revertButton: "Revert&Osmcha-Changeset-Schaltfläche",
            deletor: "Schaltfläche zum Löschen von Knoten",
            oneClickDeletor: "Knoten ohne Bestätigung löschen",
            changesetsTemplates:
                'Vorlagen für Changeset-Kommentare <a id="last-comments-link" target="_blank">(deine letzten Kommentare)</a>',
            hdycInProfile: "HDYC zum Benutzerprofil hinzufügen",
            betterProfileStat: "Filter zur Profilstatistik hinzufügen",
            navigationViaHotkeys:
                'Tastenkürzel hinzufügen <a href="https://github.com/deevroman/better-osm-org#Hotkeys" target="_blank">(Liste)</a>',
            newEditorsLinks: "Neue Editoren zum Bearbeitungsmenü hinzufügen",
            resetSearchFormFocus: "Fokus des Suchformulars zurücksetzen",
            satelliteLayers: "Schalter für Satellitenebenen hinzufügen",
            swipes: "Wischgesten zwischen Benutzer-Changesets hinzufügen",
            resizableSidebar: "Schieberegler für die Breite der Seitenleiste",
            clickableAvatar: "Per Klick auf den Avatar Changesets öffnen",
            overzoomForDataLayer: "Overzoom erlauben, wenn Daten-/Satellitenebene aktiviert ist β",
            dragAndDropViewers: "Drag&Drop für .geojson, .jpg, .gpx, .osm",
            viewer3DInNewTab: "3D-Gebäude-Viewer immer in neuem Tab öffnen",
            betterTaginfo: "Neue Schaltflächen in Taginfo hinzufügen",
            defaultZoomKeysBehaviour: "Zoomschritt der +/- Schaltflächen nicht verdoppeln",
            addLocationFromNominatim: "Standort aus Nominatim für Changesets und Notizen hinzufügen",
            overpassInstance:
                '<a href="https://wiki.openstreetmap.org/wiki/Overpass_API#Public_Overpass_API_instances">Overpass-API-Server</a>',
            panoramaxUploader: "Formular zum Hochladen von Fotos nach Panoramax hinzufügen",
            routersTimestamps: "Datum der Routing-Daten hinzufügen",
            debugMode: "Debug- und experimentelle Funktionen aktivieren",
        },
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
            errorPleaseReport: "Fehler :( Bitte melden Sie das im GitHub-Repository von better-osm-org",
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
        routers: {
            routingDataTimeFor: "Routing-Datenzeit für {name}: {time}",
            openDebugMap: "Debug Map öffnen",
        },
        satellite: {
            setupCustomStyleJson: "Eigenen Stil der Vektorkarte einrichten",
            setupCustomMapLayers: "Kartenhintergrund einrichten",
        },
        geojson: {
            metainfo: "Metainformationen",
            needUpdateBetterOsmOrg: "better-osm-org muss aktualisiert werden",
        },
        links: {
            webArchive: "WebArchive",
        },
        hotkeys: {
            availableCommands: "Verfügbare Befehle",
            recent: "Zuletzt verwendet",
            noHotkeysMatchSearch: "Keine passenden Tastenkürzel gefunden.",
            noCatalogedCommandsMatchPage: "Für diese Seite gibt es keine passenden Befehle.",
        },
        objectVersionPage: {
            length: "Länge: {value}",
            area: "Fläche: {value}",
        },
        userProfile: {
            allEditors: "Alle Editoren",
            editorContributions: ({ editor, count }) => ` ${editor} (${count} Beitrag${count === 1 ? "" : "e"})`,
            osmcha: " [OSMCha] ",
            usernames: "Benutzernamen: ",
            findingBlocks: " Sperren werden gesucht... ",
            copyIds: "IDs kopieren",
            copyIdsCount: "{count} IDs kopieren",
            noComment: "Kein Kommentar",
            pastUsernames: "Frühere Namen: ",
            userIdLabel: "ID: ",
            disableTrackingProtection:
                "Deaktivieren Sie den Tracking-Schutz, damit die Anzeige der Informationen von der HDYC-Website funktioniert",
            goToHdyc: "https://www.hdyc.neis-one.org/ öffnen",
        },
        changesetsHistory: {
            copyIds: "IDs kopieren",
            copyIdsCount: "{count} IDs kopieren",
            displayedCount: " Angezeigt {displayed}/{total}",
            hideBigChangesets: "Große Änderungspakete ausblenden",
            hideChangesetsFrom: "🔄Änderungen ausblenden von ",
            showChangesetsFrom: "🔄Änderungen anzeigen von ",
            hideChangesetsWith: "🔄Änderungen ausblenden mit ",
            showChangesetsWith: "🔄Nur Änderungen mit ",
            loadMore: "{count} laden",
        },
        measurer: {
            measureFromHere: "Von hier messen",
            endMeasure: "Messung beenden",
            cleanMeasurements: "Messungen löschen",
        },
        panoramax: {
            blurFaces: "Gesichter verwischen",
        },
        idEditor: {
            findOffsets: "Verschiebungen finden",
        },
        changesetPage: {
            selectObjects: "Objekte auswählen",
            revertViaOsmRevert: "Über osm-revert zurücksetzen",
            openInEditor: "In {editor} öffnen",
            openInLevel0: "In Level0 öffnen",
            openInLevel0WithWaysGeometry: "In Level0 mit Liniengeometrie öffnen",
        },
        nodeMover: {
            moveNodeToHere: "Punkt hierhin verschieben",
        },
        scriptMenu: {
            settings: "Einstellungen",
            checkScriptUpdates: "Nach Script-Updates suchen",
            checkDevScriptUpdates: "Nach Updates der Dev-Version des Scripts suchen",
            listOfHotkeys: "Liste der Tastenkürzel",
        },
    },
    hr: {
        init: {
            disableBetterOsmOrg: "Onemogućite better-osm-org",
            scriptVersion: "Verzija skripte: ",
        },
        config: {
            sectionID: "iD",
            sectionViewingEdits: "Pregled uređivanja",
            sectionWorkingWithNotes: "Rad s bilješkama",
            sectionNewActions: "Nove radnje",
            sectionOther: "Ostalo",
            darkModeForMap: "Invertiraj boje karte u tamnom načinu",
            colorblindFriendlyPalette: "Paleta prilagođena daltonizmu β",
            betterTagsPaste: "Dodaj = pri lijepljenju oznaka odvojenih razmacima ili tabovima",
            darkModeForID:
                'Tamni način za iD (<a href="https://userstyles.world/style/15596/openstreetmap-dark-theme" target="_blank">Hvala AlexPS</a>)',
            compactChangesetsHistory: "Kompaktna povijest changeseta",
            versionsDiff: "Dodaj diff oznaka u povijesti",
            showPreviousTagValue: "Prikaži prethodnu vrijednost oznake",
            fullVersionsDiff: "Dodaj diff s međuverzijama u povijesti linija",
            changesetQuickLook: "Dodaj QuickLook za changesete",
            showChangesetGeometry: "Prikaži geometriju objekata u changesetu",
            massChangesetsActions: "Dodaj radnje za popis changeseta (masovni revert, filtriranje, ...)",
            imagesAndLinksInTags: "Učini neke oznake klikabilnima, kraćima i prikaži fotografije",
            hideNoteHighlight: "Sakrij isticanje bilješke",
            resolveNotesButton: "Dodatni gumbi za zatvaranje bilješki:",
            revertButton: "Gumb Revert&Osmcha za changeset",
            deletor: "Gumb za brisanje čvora",
            oneClickDeletor: "Izbriši čvor bez potvrde",
            changesetsTemplates: 'Predlošci komentara za changesete <a id="last-comments-link" target="_blank">(vaši zadnji komentari)</a>',
            hdycInProfile: "Dodaj HDYC u korisnički profil",
            betterProfileStat: "Dodaj filtre u statistiku profila",
            navigationViaHotkeys:
                'Dodaj tipkovne prečace <a href="https://github.com/deevroman/better-osm-org#Hotkeys" target="_blank">(popis)</a>',
            newEditorsLinks: "Dodaj nove uređivače u izbornik uređivanja",
            resetSearchFormFocus: "Resetiraj fokus obrasca za pretraživanje",
            satelliteLayers: "Dodaj prekidače satelitskih slojeva",
            swipes: "Dodaj swipe prijelaze između korisničkih changeseta",
            resizableSidebar: "Klizač širine bočne trake",
            clickableAvatar: "Otvori changesete klikom na avatar",
            overzoomForDataLayer: "Dopusti overzoom kada je uključen data/satellite sloj β",
            dragAndDropViewers: "Drag&Drop za .geojson, .jpg, .gpx, .osm",
            viewer3DInNewTab: "Uvijek otvori 3D preglednike zgrada u novoj kartici",
            betterTaginfo: "Dodaj nove gumbe u Taginfo",
            defaultZoomKeysBehaviour: "Nemoj udvostručiti korak zumiranja gumba +/-",
            addLocationFromNominatim: "Dodaj lokaciju iz Nominatima za changesete i bilješke",
            overpassInstance:
                '<a href="https://wiki.openstreetmap.org/wiki/Overpass_API#Public_Overpass_API_instances">Overpass API poslužitelj</a>',
            panoramaxUploader: "Dodaj obrazac za učitavanje fotografija u Panoramax",
            routersTimestamps: "Dodaj datum podataka rutiranja",
            debugMode: "Omogući debug i eksperimentalne značajke",
        },
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
            errorPleaseReport: "Greška :( Molimo prijavite ovo u GitHub repozitoriju better-osm-org",
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
        routers: {
            routingDataTimeFor: "Vrijeme podataka rutiranja za {name}: {time}",
            openDebugMap: "Otvori Debug Map",
        },
        satellite: {
            setupCustomStyleJson: "Postavljanje vlastitog stila vektorske karte",
            setupCustomMapLayers: "Postavljanje pozadinske karte",
        },
        geojson: {
            metainfo: "metapodaci",
            needUpdateBetterOsmOrg: "Treba ažurirati better-osm-org",
        },
        links: {
            webArchive: "WebArchive",
        },
        hotkeys: {
            availableCommands: "Dostupne naredbe",
            recent: "Nedavno",
            noHotkeysMatchSearch: "Nema odgovarajućih prečaca.",
            noCatalogedCommandsMatchPage: "Za ovu stranicu nema odgovarajućih naredbi.",
        },
        objectVersionPage: {
            length: "Duljina: {value}",
            area: "Površina: {value}",
        },
        userProfile: {
            allEditors: "Svi uređivači",
            editorContributions: ({ editor, count }) => ` ${editor} (${count} doprinos${count === 1 ? "" : count < 5 ? "a" : "a"})`,
            osmcha: " [OSMCha] ",
            usernames: "Korisnička imena: ",
            findingBlocks: " Traženje blokada... ",
            copyIds: "Kopiraj ID",
            copyIdsCount: "Kopiraj {count} ID",
            noComment: "Bez komentara",
            pastUsernames: "Prijašnja imena: ",
            userIdLabel: "ID: ",
            disableTrackingProtection: "Onemogućite zaštitu od praćenja kako bi radio prikaz informacija sa stranice HDYC",
            goToHdyc: "Otvori https://www.hdyc.neis-one.org/",
        },
        changesetsHistory: {
            copyIds: "Kopiraj ID",
            copyIdsCount: "Kopiraj {count} ID",
            displayedCount: " Prikazano {displayed}/{total}",
            hideBigChangesets: "Sakrij velike pakete izmjena",
            hideChangesetsFrom: "🔄Sakrij izmjene od ",
            showChangesetsFrom: "🔄Prikaži izmjene od ",
            hideChangesetsWith: "🔄Sakrij izmjene s ",
            showChangesetsWith: "🔄Samo izmjene s ",
            loadMore: "Učitaj {count}",
        },
        measurer: {
            measureFromHere: "Mjeri odavde",
            endMeasure: "Završi mjerenje",
            cleanMeasurements: "Očisti mjerenja",
        },
        panoramax: {
            blurFaces: "Zamuti lica",
        },
        idEditor: {
            findOffsets: "Pronađi pomake",
        },
        changesetPage: {
            selectObjects: "Odaberi objekte",
            revertViaOsmRevert: "Vrati putem osm-revert",
            openInEditor: "Otvori u {editor}",
            openInLevel0: "Otvori u Level0",
            openInLevel0WithWaysGeometry: "Otvori u Level0 s geometrijom linija",
        },
        nodeMover: {
            moveNodeToHere: "Premjesti točku ovdje",
        },
        scriptMenu: {
            settings: "Postavke",
            checkScriptUpdates: "Provjeri ažuriranja skripte",
            checkDevScriptUpdates: "Provjeri ažuriranja dev-verzije skripte",
            listOfHotkeys: "Popis tipkovnih prečaca",
        },
    },
}

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
