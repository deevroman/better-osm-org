//<editor-fold desc="swipes" defaultstate="collapsed">

let startTouch = null
let touchMove = null
let touchEnd = null

function addSwipes() {
    if (!GM_config.get("Swipes")) {
        return
    }
    let startX = 0
    let startY = 0
    let direction = null
    const sidebar = document.querySelector("#sidebar_content")
    sidebar.style.transform = "translateX(var(--touch-diff, 0px))"

    if (!location.pathname.startsWith("/changeset/")) {
        sidebar.removeEventListener("touchstart", startTouch)
        sidebar.removeEventListener("touchmove", touchMove)
        sidebar.removeEventListener("touchend", touchEnd)
        startTouch = null
        touchMove = null
        touchEnd = null
    } else {
        if (startTouch !== null) return
        startTouch = e => {
            startX = e.touches[0].clientX
            startY = e.touches[0].clientY
        }

        touchMove = e => {
            const diffY = e.changedTouches[0].clientY - startY
            const diffX = e.changedTouches[0].clientX - startX
            if (direction == null) {
                if (diffY >= 10 || diffY <= -10) {
                    direction = "v"
                } else if (diffX >= 10 || diffX <= -10) {
                    direction = "h"
                    startX = e.touches[0].clientX
                }
            } else if (direction === "h") {
                e.preventDefault()
                sidebar.style.setProperty("--touch-diff", `${diffX}px`)
            }
        }

        touchEnd = e => {
            const diffX = startX - e.changedTouches[0].clientX

            sidebar.style.removeProperty("--touch-diff")
            if (direction === "h") {
                if (diffX > sidebar.offsetWidth / 3) {
                    const navigationLinks = document.querySelectorAll("div.secondary-actions")[1]?.querySelectorAll("a")
                    if (navigationLinks && Array.from(navigationLinks).at(-1).href.includes("/changeset/")) {
                        getAbortController().abort(ABORT_ERROR_PREV)
                        Array.from(navigationLinks).at(-1).click()
                    }
                } else if (diffX < -sidebar.offsetWidth / 3) {
                    const navigationLinks = document.querySelectorAll("div.secondary-actions")[1]?.querySelectorAll("a")
                    if (navigationLinks && navigationLinks[0].href.includes("/changeset/")) {
                        getAbortController().abort(ABORT_ERROR_NEXT)
                        navigationLinks[0].click()
                    }
                }
            }
            direction = null
        }

        sidebar.addEventListener("touchstart", startTouch)
        sidebar.addEventListener("touchmove", touchMove)
        sidebar.addEventListener("touchend", touchEnd)
    }
}

//</editor-fold>
