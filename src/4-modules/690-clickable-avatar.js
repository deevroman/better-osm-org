//<editor-fold desc="" defaultstate="collapsed">

function setupClickableAvatar() {
    const miniAvatar = document.querySelector(".user_thumbnail_tiny:not([patched-for-click])")
    if (!miniAvatar || miniAvatar.setAttribute("patched-for-click", "true")) {
        return
    }
    miniAvatar.onclick = e => {
        if (!e.isTrusted) return
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
        if (location.pathname.match(/\/user\/.+\/history/)) {
            const targetURL = document.querySelector('.dropdown-item[href^="/user/"]').getAttribute("href")
            if (e.ctrlKey || e.metaKey) {
                window.open(targetURL, "_blank")
            } else {
                window.location.pathname = targetURL
            }
            miniAvatar.click() // dirty hack for hide dropdown
        } else {
            const targetURL = document.querySelector('.dropdown-item[href^="/user/"]').getAttribute("href") + "/history"
            if (targetURL !== location.pathname) {
                if (e.ctrlKey || e.metaKey) {
                    window.open(targetURL, "_blank")
                } else {
                    try {
                        getWindow().OSM.router.route(targetURL)
                    } catch {
                        window.location.pathname = targetURL
                    }
                }
                miniAvatar.click() // dirty hack for hide dropdown
            }
        }
    }
}

//</editor-fold>
