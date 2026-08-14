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

const blurSearchTimers = new Set()

function blurSearchField() {
    const queryField = document.querySelector("#sidebar #query")
    if (!queryField || queryField.getAttribute("blured")) {
        return
    }
    queryField.setAttribute("blured", "true")
    queryField.removeAttribute("autofocus")
    if (document.activeElement?.nodeName === "INPUT") {
        document.activeElement?.blur()
    }
    ;[50, 100, 250, 500].forEach(ms => {
        const timerId = setTimeout(() => {
            if (document.activeElement?.nodeName === "INPUT" && document.activeElement.getAttribute("type") !== "radio") {
                document.activeElement?.blur()
            }
            blurSearchTimers.delete(timerId)
        }, ms)
        blurSearchTimers.add(timerId)
    })
    queryField.addEventListener(
        "click",
        () => {
            blurSearchTimers.forEach(t => clearTimeout(t))
            blurSearchTimers.clear()
        },
        { once: true },
    )
}

function resetSearchFormFocus() {
    if (!GM_config.get("ResetSearchFormFocus")) {
        return
    }
    blurSearchField()
}

//</editor-fold>
