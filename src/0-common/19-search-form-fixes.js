//<editor-fold desc="search-form-fixes" defaultstate="collapsed">

function showSearchForm() {
    document.querySelector("#sidebar .search_forms")?.removeAttribute("hidden")
    document.querySelector("#sidebar .search_forms")?.style?.removeProperty("display") // quick fix
}

function hideSearchForm() {
    if (location.pathname.startsWith("/search") || location.pathname.startsWith("/directions")) return
    if (!document.querySelector("#sidebar .search_forms")?.hasAttribute("hidden")) {
        document.querySelector("#sidebar .search_forms")?.setAttribute("hidden", "true")
        document.querySelector("#sidebar .search_forms")?.style?.setProperty("display", "none", "important") // quick fix
    }

    document.querySelector(".sidebar-close-controls .btn-close:not(.hotkeyed)")?.addEventListener("click", () => {
        showSearchForm()
        cleanAllObjects()
    })
    document.querySelector(".sidebar-close-controls .btn-close:not(.hotkeyed)")?.classList?.add("hotkeyed")
    document.querySelector("h1 .icon-link:not(.hotkeyed)")?.addEventListener("click", () => {
        showSearchForm()
        cleanAllObjects()
    })
    document.querySelector("h1 .icon-link:not(.hotkeyed)")?.classList?.add("hotkeyed")
}

function blurSearchField() {
    if (document.querySelector("#sidebar #query") && !document.querySelector("#sidebar #query").getAttribute("blured")) {
        document.querySelector("#sidebar #query").setAttribute("blured", "true")
        document.querySelector("#sidebar #query").removeAttribute("autofocus")
        if (document.activeElement?.nodeName === "INPUT") {
            document.activeElement?.blur()
        }
        // dirty hack. If your one multiple tabs focus would reseted only on active tab
        // In the case of Safari, this is generally a necessity.
        // Sometimes it still doesn't help
        ;[50, 100, 250, 500].forEach(ms => {
            setTimeout(() => {
                if (document.activeElement?.nodeName === "INPUT") {
                    document.activeElement?.blur()
                }
            }, ms)
        })
    }
}

function resetSearchFormFocus() {
    if (!GM_config.get("ResetSearchFormFocus")) {
        return
    }
    blurSearchField()
}

//</editor-fold>
