//<editor-fold desc="osm-website" defaultstate="collapsed">

// Модули должны стать классами
// - поддерживается всеми браузерами, в которых есть TM.
// - изоляция функций и глобальных переменных
// - для модулей, которые внедряются через setInterval можно сохранить таймер, чтобы предотвратить дублирование вызовов
// - возможность сохранить результат внедрения

/***@type {((function(string): Promise<void>|void))[]}*/
// prettier-ignore
const modules = [
    setupDarkModeForMap,
    setupHDYCInProfile,
    setupBetterProfileStat,
    setupCompactChangesetsHistory,
    setupMassChangesetsActions,
    setupRevertButton,
    setupResolveNotesButton,
    setupDeletor,
    setupHideNoteHighlight,
    setupSatelliteLayers,
    setupVersionsDiff,
    setupChangesetQuickLook,
    setupNewEditorsLinks,
    setupNavigationViaHotkeys,
    setupClickableAvatar,
    setupOverzoomForDataLayer,
    setupDragAndDropViewers,
    setupBetterTagsPaste
];
// prettier-ignore
const alwaysEnabledModules = [
    setupRelationVersionViewer,
    setupMakeVersionPageBetter,
    setupNotesFiltersButtons,
    setupGPXFiltersButtons,
    setupSpyGlassButtons,
    setupNewContextMenuItems,
    setupPrometheusLink
]

function setupOSMWebsite() {
    if (location.pathname === "/id") {
        setupIDframe()
        return
    }

    setTimeout(async () => {
        if (location.pathname.includes("/user/") && !location.pathname.includes("/history")) return
        if (getWindow && !getWindow().mapIntercepted) {
            console.log("map not intercepted after 900ms")
            document.querySelector(".control-share a").click()
            document.querySelector(".control-share a").click()
            await interceptMapManually()
        }
    }, 900)

    resetSearchFormFocus()
    if (isOHMServer()) {
        overpass_server = OHM_OVERPASS_INSTANCE
    } else if (GM_config.get("OverpassInstance") === MAILRU_OVERPASS_INSTANCE.name) {
        overpass_server = MAILRU_OVERPASS_INSTANCE
    } else if (GM_config.get("OverpassInstance") === PRIVATECOFFEE_OVERPASS_INSTANCE.name) {
        overpass_server = PRIVATECOFFEE_OVERPASS_INSTANCE
    } else {
        overpass_server = MAIN_OVERPASS_INSTANCE
    }
    let lastPath = ""
    new MutationObserver(
        (function mainObserverHandler() {
            const path = location.pathname
            if (path === lastPath) return
            try {
                shiftKeyZClicks = 0
                abortPrevControllers(ABORT_ERROR_WHEN_PAGE_CHANGED)
                tracksCounter = 0
                cleanAllObjects()
                getMap()?.attributionControl?.setPrefix("")
                addSwipes()
                document.querySelector("#fixed-rss-feed")?.remove()
                buildingViewerIframe?.remove()
                buildingViewerIframe = null
                historyPagePaginationDeletingObserver?.disconnect()
                historyPagePaginationDeletingObserver = null
                paginationInHistoryStepObserver?.disconnect()
                paginationInHistoryStepObserver = null
                removePOIMoverMenu()
                // prettier-ignore
                if (!path.startsWith("/changeset") && !path.startsWith("/history") &&
                    !path.startsWith("/node") && !path.startsWith("/way") && path !== "/relation" &&
                    !path.startsWith("/note")) {
                    showSearchForm()
                }
            } catch {
                /* empty */
            }
            lastPath = path
            for (const module of modules.filter(module => GM_config.get(module.name.slice("setup".length)))) {
                queueMicrotask(() => {
                    // console.log(module.name)
                    module(path)
                })
            }
            for (const module of alwaysEnabledModules) {
                queueMicrotask(() => {
                    // console.log(module.name)
                    void module(path)
                })
            }
            return mainObserverHandler
        })(),
    ).observe(document, { subtree: true, childList: true })
    if (location.pathname.startsWith("/dashboard") || location.pathname.startsWith("/user/")) {
        setTimeout(loadFriends, 4000)
    }
    setTimeout(() => {
        if (GM_config.get("CompactChangesetsHistory")) {
            document.querySelector('.nav-link[href^="/history"]')?.addEventListener(
                "click",
                () => {
                    addCompactSidebarStyle()
                },
                { once: true },
            )
        }
    })
}

//</editor-fold>
