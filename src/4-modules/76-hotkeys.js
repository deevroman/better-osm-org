//<editor-fold desc="hotkeys">
let hotkeysConfigured = false

/**
 * @typedef {"All pages" | "Main pages" | "User pages" | "Changeset pages" | "Object pages" | "History pages" | "Search page" | "Debug"} HotkeyContext
 */

/**
 * @typedef {Object} HotkeyActionDefinition
 * @property {string} title
 * @property {string[]} defaultBindings
 * @property {HotkeyContext[]} contexts
 * @property {boolean=} preventDefault
 * @property {(e: KeyboardEvent) => boolean=} when
 * @property {(e: KeyboardEvent) => void} run
 */

/** @type {Record<string, HotkeyActionDefinition>} */
const hotkeyActions = {
    showHotkeysHelp: {
        title: "Show hotkeys help",
        defaultBindings: ["F1"],
        contexts: ["All pages"],
        preventDefault: true,
        run: actionShowHotkeysHelp,
    },
    openOverpassSearch: {
        title: "Open Overpass search",
        defaultBindings: ["Shift+Slash"],
        contexts: ["Main pages"],
        run: actionOpenOverpassSearch,
    },
    toggleMapLayersVisibility: {
        title: "Toggle map layers visibility",
        defaultBindings: ["Backquote"],
        contexts: ["Main pages"],
        run: actionToggleMapLayersVisibility,
    },
    toggleDarkMapStyle: {
        title: "Toggle dark map style",
        defaultBindings: ["Alt+Backquote"],
        contexts: ["Main pages"],
        run: actionToggleDarkMapStyle,
    },
    openYandexPanoramas: {
        title: "Open Yandex panoramas",
        defaultBindings: ["KeyY"],
        contexts: ["Main pages"],
        run: actionOpenYandexPanoramas,
    },
    copyCurrentShortLink: {
        title: "Copy current short link",
        defaultBindings: ["KeyP"],
        contexts: ["Main pages"],
        run: actionCopyCurrentShortLink,
    },
    closeUi: {
        title: "Close open UI panels",
        defaultBindings: ["KeyQ"],
        contexts: ["Main pages"],
        run: actionCloseUi,
    },
    clearActiveObjectsAndContextMenus: {
        title: "Clear active objects and context menus",
        defaultBindings: ["Escape"],
        contexts: ["Main pages"],
        run: actionClearActiveObjectsAndContextMenus,
    },
    goToUserLocation: {
        title: "Go to user location",
        defaultBindings: ["Shift+KeyL"],
        contexts: ["Main pages"],
        run: actionGoToUserLocation,
    },
    toggleSwitchableTime: {
        title: "Toggle switchable time",
        defaultBindings: ["Shift+KeyT", "Alt+KeyT"],
        contexts: ["Main pages"],
        run: actionToggleSwitchableTime,
    },
    toggleCompactTimeOrOpenTraces: {
        title: "Toggle compact time or open traces",
        defaultBindings: ["KeyT"],
        contexts: ["Main pages"],
        run: actionHandleKeyT,
    },
    openUserBlocks: {
        title: "Open user blocks",
        defaultBindings: ["KeyB"],
        contexts: ["User pages"],
        run: actionOpenUserBlocks,
    },
    toggleEditMenu: {
        title: "Toggle edit menu",
        defaultBindings: ["KeyX"],
        contexts: ["Main pages"],
        run: actionToggleEditMenu,
    },
    nextVectorLayer: {
        title: "Switch to next vector layer",
        defaultBindings: ["KeyV"],
        contexts: ["Main pages"],
        run: actionNextVectorLayer,
    },
    setCustomVectorStyle: {
        title: "Set custom vector style",
        defaultBindings: ["Shift+KeyV"],
        contexts: ["Main pages"],
        run: actionSetCustomVectorStyle,
    },
    openMessageComposer: {
        title: "Open message composer",
        defaultBindings: ["KeyM"],
        contexts: ["User pages"],
        when: () => isUserPageWithoutHistory(),
        run: actionOpenMessageComposer,
    },
    openMessageComposerForCurrentUser: {
        title: "Open message composer for current user",
        defaultBindings: ["Shift+KeyM"],
        contexts: ["Main pages", "User pages"],
        run: actionOpenMessageComposerForCurrentUser,
    },
    openCurrentPageUserProfile: {
        title: "Open current page user profile",
        defaultBindings: ["KeyU"],
        contexts: ["Main pages", "User pages"],
        run: actionOpenCurrentPageUserProfile,
    },
    openOwnUserProfile: {
        title: "Open own user profile",
        defaultBindings: ["Shift+KeyU"],
        contexts: ["Main pages", "User pages"],
        run: actionOpenOwnUserProfile,
    },
    openFiltersOrLayers: {
        title: "Open filters or layers",
        defaultBindings: ["KeyF"],
        contexts: ["Main pages"],
        run: actionOpenFiltersOrLayers,
    },
    openExternalService: {
        title: "Open external service",
        defaultBindings: ["KeyO", "Shift+KeyO"],
        contexts: ["Main pages"],
        run: actionOpenExternalService,
    },
    openUserComments: {
        title: "Open user comments",
        defaultBindings: ["KeyC"],
        contexts: ["User pages"],
        when: () => isUserPageWithoutHistory(),
        run: actionOpenUserComments,
    },
    copyMapCenterCoordinates: {
        title: "Copy map center coordinates",
        defaultBindings: ["Alt+KeyC"],
        contexts: ["Main pages"],
        when: () => !isUserPageWithoutHistory(),
        run: actionCopyMapCenterCoordinates,
    },
    openPrimaryChangeset: {
        title: "Open current changeset",
        defaultBindings: ["KeyC"],
        contexts: ["Main pages"],
        when: () => !isUserPageWithoutHistory(),
        run: actionOpenPrimaryChangeset,
    },
    openPrimaryChangesetInNewTab: {
        title: "Open current changeset in new tab",
        defaultBindings: ["Shift+KeyC"],
        contexts: ["Main pages"],
        when: () => !isUserPageWithoutHistory(),
        run: actionOpenPrimaryChangesetInNewTab,
    },
    toggleNotesLayer: {
        title: "Toggle notes layer",
        defaultBindings: ["KeyN"],
        contexts: ["Main pages"],
        when: () => !isUserPageWithoutHistory(),
        run: actionToggleNotesLayer,
    },
    toggleMapDataLayer: {
        title: "Toggle Map Data layer",
        defaultBindings: ["KeyD"],
        contexts: ["Main pages"],
        when: () => !isUserPageWithoutHistory(),
        run: actionToggleMapDataLayer,
    },
    toggleGpsTracksLayer: {
        title: "Toggle GPS tracks layer",
        defaultBindings: ["KeyG"],
        contexts: ["Main pages"],
        run: actionToggleGpsTracksLayer,
    },
    switchToSatelliteImagery: {
        title: "Switch to satellite imagery",
        defaultBindings: ["KeyS"],
        contexts: ["Main pages"],
        run: actionSwitchToSatelliteImagery,
    },
    openUserNotesPage: {
        title: "Open current user's notes",
        defaultBindings: ["KeyN", "Shift+KeyN", "Alt+KeyN"],
        contexts: ["User pages"],
        when: () => isUserPageWithoutHistory(),
        run: actionOpenUserNotesPage,
    },
    openNoteAuthorNotesInNewTab: {
        title: "Open note author's notes in new tab",
        defaultBindings: ["Alt+KeyN"],
        contexts: ["Main pages"],
        when: () => /^\/note\/\d+/.test(location.pathname),
        run: actionOpenNoteAuthorNotesInNewTab,
    },
    createNote: {
        title: "Create note",
        defaultBindings: ["Shift+KeyN"],
        contexts: ["Main pages"],
        run: actionCreateNote,
    },
    openUserDiary: {
        title: "Open current user's diary",
        defaultBindings: ["KeyD"],
        contexts: ["User pages"],
        when: () => isUserPageWithoutHistory(),
        run: actionOpenUserDiary,
    },
    appendDebugQueryFlag: {
        title: "Append debug query flag",
        defaultBindings: ["Alt+Shift+KeyD"],
        contexts: ["Debug"],
        run: actionAppendDebugQueryFlag,
    },
    triggerDebugger: {
        title: "Trigger debugger",
        defaultBindings: ["Alt+KeyD"],
        contexts: ["Debug"],
        run: actionTriggerDebugger,
    },
    openSpyGlass: {
        title: "Open Spy Glass",
        defaultBindings: ["Shift+KeyD"],
        contexts: ["Debug"],
        run: actionOpenSpyGlass,
    },
    showGpsTracksOverlay: {
        title: "Show GPS tracks overlay",
        defaultBindings: ["Shift+KeyG", "Alt+KeyG"],
        contexts: ["Main pages"],
        run: actionShowGpsTracksOverlay,
    },
    setCustomTileUrl: {
        title: "Set custom tile URL",
        defaultBindings: ["Shift+KeyS"],
        contexts: ["Main pages"],
        run: actionSetCustomTileUrl,
    },
    bypassTileCaches: {
        title: "Bypass tile caches",
        defaultBindings: ["Alt+KeyS"],
        contexts: ["Main pages"],
        run: actionBypassTileCaches,
    },
    openSelectedObjectEditTarget: {
        title: "Open selected object or tags editor",
        defaultBindings: ["Alt+KeyE"],
        contexts: ["Main pages"],
        run: actionOpenSelectedObjectEditTarget,
    },
    openAlternateEditor: {
        title: "Open alternate editor",
        defaultBindings: ["Shift+KeyE"],
        contexts: ["Main pages"],
        when: () => !/^\/user\/([^/]+)\/?$/.test(location.pathname),
        run: actionOpenAlternateEditor,
    },
    openEditMenuPrimary: {
        title: "Open primary editor",
        defaultBindings: ["KeyE"],
        contexts: ["Main pages"],
        when: () => !/^\/user\/([^/]+)\/?$/.test(location.pathname),
        run: actionOpenEditMenuPrimary,
    },
    openUserHistoryFromProfile: {
        title: "Open current user's history",
        defaultBindings: ["KeyE", "Shift+KeyE"],
        contexts: ["User pages"],
        when: () => /^\/user\/([^/]+)\/?$/.test(location.pathname),
        run: actionOpenUserHistoryFromProfile,
    },
    openUserReportForm: {
        title: "Open user report form",
        defaultBindings: ["KeyR"],
        contexts: ["User pages"],
        when: () => isUserPageWithoutHistory(),
        run: actionOpenUserReportForm,
    },
    revertCurrentChangesetSelection: {
        title: "Revert current changeset selection",
        defaultBindings: ["KeyR", "Shift+KeyR", "Alt+KeyR", "Alt+Shift+KeyR"],
        contexts: ["Changeset pages"],
        when: e => !isUserPageWithoutHistory() && (changesetObjectsSelectionModeEnabled || e.altKey),
        run: actionRevertCurrentChangesetSelection,
    },
    toggleChangesetObjectSelection: {
        title: "Toggle changeset object selection",
        defaultBindings: ["KeyR", "Shift+KeyR"],
        contexts: ["Changeset pages"],
        when: e => !isUserPageWithoutHistory() && !changesetObjectsSelectionModeEnabled && !e.altKey,
        run: actionToggleChangesetObjectSelection,
    },
    openInJosm: {
        title: "Open object in JOSM or Level0",
        defaultBindings: ["KeyJ"],
        contexts: ["Main pages"],
        run: actionOpenInJosmOrLevel0,
    },
    openInJosmOrLevel0: {
        title: "Open object in Level0",
        defaultBindings: ["Shift+KeyJ", "Alt+KeyJ", "Shift+Alt+KeyJ"],
        contexts: ["Main pages"],
        run: actionOpenInJosmOrLevel0,
    },
    openOwnHistoryPage: {
        title: "Open your history page",
        defaultBindings: ["Shift+KeyH"],
        contexts: ["Main pages", "User pages", "Changeset pages", "Object pages", "History pages"],
        run: actionOpenOwnHistoryPage,
    },
    openRelevantHistoryPage: {
        title: "Open relevant history page",
        defaultBindings: ["KeyH"],
        contexts: ["Main pages", "User pages", "Object pages"],
        when: () => isObjectPage() || isHomeOrNotePage() || isUserPageWithoutHistory(),
        run: actionOpenRelevantHistoryPage,
    },
    openChangesetAuthorHistory: {
        title: "Open changeset author's history",
        defaultBindings: ["KeyH"],
        contexts: ["Changeset pages"],
        when: () => isChangesetPage(),
        run: actionOpenChangesetAuthorHistory,
    },
    resetFilteredHistoryPage: {
        title: "Reset filtered history page",
        defaultBindings: ["KeyH"],
        contexts: ["History pages"],
        when: () => isFilteredHistoryPage(),
        run: actionResetFilteredHistoryPage,
    },
    openFirstObjectVersion: {
        title: "Open first object version",
        defaultBindings: ["Digit1"],
        contexts: ["Object pages"],
        when: () => isObjectPage(),
        run: actionOpenFirstObjectVersion,
    },
    openFirstChangesetForCurrentPageUser: {
        title: "Open first changeset for current page user",
        defaultBindings: ["Digit1"],
        contexts: ["Changeset pages"],
        when: () => location.pathname.startsWith("/changeset"),
        run: actionOpenFirstChangesetForCurrentPageUser,
    },
    openFirstChangesetPageForCurrentUserHistory: {
        title: "Open first changeset page for current user history",
        defaultBindings: ["Digit1"],
        contexts: ["History pages"],
        when: () => /\/user\/[^\\]+\/history\/?/.test(location.pathname),
        run: actionOpenFirstChangesetPageForCurrentUserHistory,
    },
    zoomOutToWorld: {
        title: "Zoom out to world",
        defaultBindings: ["Digit0"],
        contexts: ["Main pages"],
        run: actionZoomOutToWorld,
    },
    zoomToCurrentObjectHotkey: {
        title: "Zoom to current object",
        defaultBindings: ["KeyZ", "Shift+KeyZ"],
        contexts: ["Main pages"],
        run: actionZoomToCurrentObjectHotkey,
    },
    mapPositionBack: {
        title: "Previous map position",
        defaultBindings: ["Digit8"],
        contexts: ["Main pages"],
        run: actionMapPositionBack,
    },
    mapPositionForward: {
        title: "Next map position",
        defaultBindings: ["Digit9"],
        contexts: ["Main pages"],
        run: actionMapPositionForward,
    },
    zoomOutHotkey: {
        title: "Zoom out",
        defaultBindings: ["Minus", "Alt+Minus"],
        contexts: ["Main pages"],
        when: () => !defaultZoomKeysBehaviour,
        run: actionZoomOutHotkey,
    },
    zoomInHotkey: {
        title: "Zoom in",
        defaultBindings: ["Equal", "Alt+Equal"],
        contexts: ["Main pages"],
        when: () => !defaultZoomKeysBehaviour,
        run: actionZoomInHotkey,
    },
    goToPrevChangesetPage: {
        title: "Go to previous changeset page",
        defaultBindings: ["KeyK"],
        contexts: ["History pages"],
        when: () => /^(\/user\/.+)?\/history\/?$/.test(location.pathname),
        run: actionGoToPrevChangesetPage,
    },
    goToNextChangesetPage: {
        title: "Go to next changeset page",
        defaultBindings: ["KeyL"],
        contexts: ["History pages"],
        when: () => /^(\/user\/.+)?\/history\/?$/.test(location.pathname),
        run: actionGoToNextChangesetPage,
    },
    goToPrevSearchResultPage: {
        title: "Go to previous search result",
        defaultBindings: ["KeyK"],
        contexts: ["Search page"],
        when: () => isSearchPage(),
        run: actionGoToPrevSearchResultPage,
    },
    goToNextSearchResultPage: {
        title: "Go to next search result",
        defaultBindings: ["KeyL"],
        contexts: ["Search page"],
        when: () => isSearchPage(),
        run: actionGoToNextSearchResultPage,
    },
    previewChangesetGeometryDebug: {
        title: "Preview changeset geometry",
        defaultBindings: ["Alt+KeyP"],
        contexts: ["Debug", "Changeset pages"],
        when: () => isDebug() && location.pathname.startsWith("/changeset"),
        run: actionPreviewChangesetGeometryDebug,
    },
    goToPrevChangesetListPage: {
        title: "Previous changeset list page",
        defaultBindings: ["Comma"],
        contexts: ["Changeset pages"],
        when: () => isChangesetPage(),
        run: actionGoToPrevChangesetListPage,
    },
    goToNextChangesetListPage: {
        title: "Next changeset list page",
        defaultBindings: ["Period"],
        contexts: ["Changeset pages"],
        when: () => isChangesetPage(),
        run: actionGoToNextChangesetListPage,
    },
    goToPrevChangesetObjectHotkey: {
        title: "Previous changeset object",
        defaultBindings: ["KeyK"],
        contexts: ["Changeset pages"],
        when: () => isChangesetPage(),
        run: actionGoToPrevChangesetObjectHotkey,
    },
    goToNextChangesetObjectHotkey: {
        title: "Next changeset object",
        defaultBindings: ["KeyL"],
        contexts: ["Changeset pages"],
        when: e => isChangesetPage() && !e.shiftKey,
        run: actionGoToNextChangesetObjectHotkey,
    },
    goToPrevSidebarTab: {
        title: "Previous sidebar tab",
        defaultBindings: ["Comma"],
        contexts: ["Object pages"],
        when: () => isObjectPage(),
        run: actionGoToPrevSidebarTab,
    },
    goToNextSidebarTab: {
        title: "Next sidebar tab",
        defaultBindings: ["Period"],
        contexts: ["Object pages"],
        when: () => isObjectPage(),
        run: actionGoToNextSidebarTab,
    },
    goToPrevObjectVersionHotkey: {
        title: "Previous object version",
        defaultBindings: ["KeyK"],
        contexts: ["Object pages", "History pages"],
        when: () => isObjectHistoryPage(),
        run: actionGoToPrevObjectVersionHotkey,
    },
    goToNextObjectVersionHotkey: {
        title: "Next object version",
        defaultBindings: ["KeyL"],
        contexts: ["Object pages", "History pages"],
        when: e => isObjectHistoryPage() && !e.shiftKey,
        run: actionGoToNextObjectVersionHotkey,
    },
    goToPrevUserListPage: {
        title: "Previous list page",
        defaultBindings: ["Comma"],
        contexts: ["User pages"],
        when: () =>
            /user\/.+\/(traces|diary_comments|changeset_comments)/.test(location.pathname) ||
            /\/user_blocks($|\/)/.test(location.pathname) ||
            /\/blocks_by$/.test(location.pathname),
        run: () => actionGoToPrevPaginationPage('.pagination a[href*="after"]'),
    },
    goToNextUserListPage: {
        title: "Next list page",
        defaultBindings: ["Period"],
        contexts: ["User pages"],
        when: () =>
            /user\/.+\/(traces|diary_comments|changeset_comments)/.test(location.pathname) ||
            /\/user_blocks($|\/)/.test(location.pathname) ||
            /\/blocks_by$/.test(location.pathname),
        run: () => actionGoToPrevPaginationPage('.pagination a[href*="before"]'),
    },
    goToPrevUserNotesPage: {
        title: "Previous user notes page",
        defaultBindings: ["Comma"],
        contexts: ["User pages"],
        when: () => /user\/.+\/notes/.test(location.pathname),
        run: actionGoToPrevUserNotesPage,
    },
    goToNextUserNotesPage: {
        title: "Next user notes page",
        defaultBindings: ["Period"],
        contexts: ["User pages"],
        when: () => /user\/.+\/notes/.test(location.pathname),
        run: actionGoToNextUserNotesPage,
    },
}

function getHotkeyBaseCode(e) {
    if (/^[0-9]$/.test(e.key)) {
        return `Digit${e.key}`
    }
    if (["Slash", "Backslash", "NumpadDivide"].includes(e.code) || e.key === "/") {
        return "Slash"
    }
    if (["Backquote", "Quote"].includes(e.code) || e.key === "`" || e.key === "~") {
        return "Backquote"
    }
    return e.code || e.key
}

function getHotkeyCombo(e) {
    const parts = []
    if (e.ctrlKey) parts.push("Ctrl")
    if (e.altKey) parts.push("Alt")
    if (e.shiftKey) parts.push("Shift")
    if (e.metaKey) parts.push("Meta")
    parts.push(getHotkeyBaseCode(e))
    return parts.join("+")
}

function getHotkeyActionIdForEvent(e) {
    const combo = getHotkeyCombo(e)
    return (
        Object.entries(hotkeyActions).find(([, action]) => action.defaultBindings.includes(combo) && (!action.when || action.when(e)))?.[0] ??
        null
    )
}

function runHotkeyAction(actionId, e) {
    const action = hotkeyActions[actionId]
    if (!action) {
        console.warn(`Unknown hotkey action: ${actionId}`)
        return false
    }
    if (action.preventDefault) {
        e.preventDefault?.()
        e.stopPropagation?.()
        e.stopImmediatePropagation?.()
    }
    action.run(e)
    void rememberRecentHotkeyAction(actionId)
    return true
}

function runHotkeyActionForEvent(e) {
    const actionId = getHotkeyActionIdForEvent(e)
    if (!actionId) {
        return false
    }
    return runHotkeyAction(actionId, e)
}

function hotkeyKeydownHandler(e) {
    if (e.repeat && !["KeyK", "KeyL"].includes(e.code)) return
    if (shouldSkipHotkeyForActiveElement(e)) return
    if (handleRelationViewerHotkeys(e)) return
    if (handleMeasuringHotkeys(e)) return
    console.log("Key: ", e.key)
    console.log("Key code: ", e.code)
    if (e.code !== "KeyZ" && e.code !== "KeyD" && e.code !== "KeyS" && e.code !== "KeyS") {
        resetZoomClicks()
    }
    if (e.metaKey || e.ctrlKey) {
        return
    }
    runHotkeyActionForEvent(e)
}

function addButtonIntoRightButtonsList(linksMenuClickHandler) {
    setTimeout(async () => {
        for (let i = 0; i < 40; i++) {
            await sleep(30)
            if (document.querySelector("#open-external-panel-btn")) {
                break
            }
            const linksBtn2 = document.querySelector(".control-query").cloneNode(true)
            linksBtn2.id = "open-external-panel-btn"
            linksBtn2.querySelector("a").innerHTML = toolsIconSvg
            linksBtn2.querySelector("svg").setAttribute("stroke-width", "1.75")
            linksBtn2.querySelector("svg").setAttribute("width", 20)
            linksBtn2.querySelector("svg").setAttribute("height", 20)
            linksBtn2.addEventListener("click", linksMenuClickHandler)
            document.querySelector(".control-query").after(linksBtn2)
        }
    })
}

function setupNavigationViaHotkeys() {
    if ("/id" === location.pathname || document.querySelector("#id-embed")) return
    updateCurrentObjectMetadata()
    if (hotkeysConfigured) return
    hotkeysConfigured = true

    runPositionTracker()

    defaultZoomKeysBehaviour = GM_config.get("DefaultZoomKeysBehaviour")

    document.addEventListener("keydown", hotkeyKeydownHandler, false)
    if (isMobile) {
        addButtonIntoRightButtonsList(hotkeyCommandsPopupClickHandler)
    }
}

function setupOverzoomForDataLayer() {
    if (location.hash.includes("D") && location.hash.includes("layers")) {
        enableOverzoom()
    }
}

//</editor-fold>
