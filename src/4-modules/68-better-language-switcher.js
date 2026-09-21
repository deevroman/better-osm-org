//<editor-fold desc="" defaultstate="collapsed">

function setupLanguageSwitcher() {
    const langSwitch = document.querySelector("#header-nav .bi-translate").parentElement
    if (!langSwitch || langSwitch.classList.contains("better-lang-switch")) {
        return
    }
    langSwitch.classList.add("better-lang-switch")
    langSwitch.addEventListener("click", e => {
        if (e.ctrlKey || e.metaKey) {
            setTimeout(() => {
                document.querySelector('[href*="locale=en"]').click()
            }, 1000)
        }
    })
}

//</editor-fold>
