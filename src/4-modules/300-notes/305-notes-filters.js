//<editor-fold desc="notes-filters" defaultstate="collapsed">

let updateNotesLayer = null

function addAltClickHandlerForNotes() {
    getMap()?.noteLayer?.on(
        "click",
        intoPageWithFun(e => {
            if (!e.originalEvent.altKey) {
                return
            }
            console.log("removing current note", e.layer.id)
            getWindow().notesIDsFilter.add(e.layer.id)
            try {
                e.propagatedFrom.getElement().style.display = "none"
            } catch (err) {
                console.error(err, "when e.propagatedFrom.getElement()")
            }
            getMap().fire("moveend")
            const match = location.pathname.match(/note\/(\d+)/)
            if (match && parseInt(match[1]) === e.layer.id) {
                console.log("removing also current note layer")
                getMap()._objectLayer.remove()
            }
        }),
    )
    getMap()?._objectLayer?.on(
        "click",
        intoPageWithFun(e => {
            if (!e.originalEvent.altKey) {
                return
            }
            console.log("removing current note", getMap()._object.id)
            e.originalEvent.stopPropagation()
            e.originalEvent.stopImmediatePropagation()
            getWindow().notesIDsFilter.add(getMap()._object.id)
            try {
                getMap()._objectLayer.remove()
                getMap().noteLayer?.eachLayer(l => {
                    if (l.id === getMap()._object.id) {
                        l.remove()
                    }
                })
            } catch (err) {
                console.error(err, "when click for _objectLayer ")
            }
            getMap().fire("moveend")
        }),
    )
}

function registerNotesFiltersStyles() {
    registerOSMStyle(
        "notes-filters",
        () => `
            .wait-fetch {
                cursor: progress !important;
            }

            label:has(:not(:checked)) + #download-notes {
              display: none;
            }
        `,
    )
}

function addNotesFiltersButtons() {
    if (document.getElementById("notes-filter")) {
        return
    }
    const noteLabel = Array.from(document.querySelectorAll(".overlay-layers label"))[0]
    if (!noteLabel) {
        return
    }
    if (!getWindow().fetchIntercepterScriptInited) {
        return
    }
    const checkbox = noteLabel.querySelector("input")
    const filters = document.createElement("div")

    function updateNotesFilters() {
        if (checkbox.checked) {
            filters.style.display = ""
            getWindow().notesDisplayName = filterByUsername.value
            getWindow().invertDisplayName = inverterForFilterByUsername.checked
            getWindow().notesQFilter = filterByString.value
            getWindow().invertQ = inverterForFilterByString.checked
            getWindow().notesClosedFilter = filterByClosed.value
            getWindow().notesCommentsFilter = filterByComment.value
        } else {
            filters.style.display = "none"
            getWindow().notesDisplayName = ""
            getWindow().invertDisplayName = ""
            getWindow().notesQFilter = ""
            getWindow().invertQ = ""
            getWindow().notesClosedFilter = ""
            getWindow().notesCommentsFilter = ""
        }
        if (filterByComment.value === "") {
            filterByComment.style.color = "gray"
        } else {
            filterByComment.style.removeProperty("color")
        }
    }

    updateNotesLayer = function () {
        updateNotesFilters()
        getMap().fire("moveend")
    }

    checkbox.onchange = updateNotesFilters
    filters.id = "notes-filter"
    filters.style.display = "none"
    filters.style.paddingTop = "4px"

    const filterByString = document.createElement("input")
    const inverterForFilterByString = document.createElement("span")

    function makeFilterByStringWrapper() {
        filterByString.type = "input"
        filterByString.id = "filter-notes-by-string"
        filterByString.style.width = "100%"
        filterByString.placeholder = t("notes.wordInNotesPlaceholder")
        filterByString.title = t("notes.commaSeparatedSubstrings")
        filterByString.addEventListener("keypress", function (event) {
            if (event.key === "Enter") {
                filterByString.classList?.add("wait-fetch")
                updateNotesLayer()
            }
        })

        inverterForFilterByString.textContent = "🚫"
        const hideWithWordTitle = "Click to hide notes with this word"
        const onlyWithWordTitle = "Click to show notes only with this word"
        inverterForFilterByString.title = hideWithWordTitle
        inverterForFilterByString.style.filter = "grayscale(1)"
        inverterForFilterByString.style.position = "absolute"
        inverterForFilterByString.style.cursor = "pointer"
        inverterForFilterByString.style.marginLeft = "-1.5em"
        inverterForFilterByString.onclick = () => {
            inverterForFilterByString.checked = !inverterForFilterByString.checked
            if (inverterForFilterByString.checked) {
                inverterForFilterByString.style.filter = ""
                inverterForFilterByString.title = onlyWithWordTitle
            } else {
                inverterForFilterByString.style.filter = "grayscale(1)"
                inverterForFilterByString.title = hideWithWordTitle
            }
            inverterForFilterByString.classList?.add("wait-fetch")
            updateNotesLayer()
        }

        const resetFilter = document.createElement("button")
        resetFilter.style.all = "unset"
        resetFilter.textContent = "✖"
        resetFilter.style.position = "absolute"
        resetFilter.style.right = "20px"
        resetFilter.style.cursor = "pointer"
        resetFilter.tabIndex = -1
        resetFilter.onclick = () => {
            filterByString.value = ""
            updateNotesLayer()
        }

        const datalistInstances = document.createElement("datalist")
        datalistInstances.id = "words-in-notes-filter"
        ;[
            // prettier-ignore
            "StreetComplete",
            "never exist",
            "photo",
            "#EveryDoor",
        ].forEach(i => {
            const opt = document.createElement("option")
            opt.value = i
            datalistInstances.appendChild(opt)
        })
        filterByString.setAttribute("list", "words-in-notes-filter")

        const wrapper = document.createElement("div")
        wrapper.style.display = "flex"
        wrapper.style.alignItems = "center"
        wrapper.style.marginBottom = "2px"
        wrapper.appendChild(inverterForFilterByString)
        wrapper.appendChild(filterByString)
        wrapper.appendChild(resetFilter)
        // wrapper.appendChild(datalistInstances) // TODO

        return wrapper
    }

    const filterByUsername = document.createElement("input")
    const inverterForFilterByUsername = document.createElement("span")

    function makeFilterByUsernameWrapper() {
        const currentUser = getCurrentUser()
        const datalist = document.createElement("datalist")
        datalist.id = "usernames-in-notes-filter"
        {
            const option = document.createElement("option")
            option.value = "anon"
            datalist.appendChild(option)
        }
        if (currentUser) {
            const option = document.createElement("option")
            option.value = currentUser
            datalist.appendChild(option)
        }

        filterByUsername.type = "input"
        filterByUsername.placeholder = t("notes.usernamePlaceholder")
        filterByUsername.title = t("notes.commaSeparatedUsernames")
        filterByUsername.id = "filter-notes-by-username"
        filterByUsername.setAttribute("list", datalist.id)
        filterByUsername.style.width = "100%"
        filterByUsername.addEventListener("keypress", function (event) {
            if (event.key === "Enter") {
                filterByUsername.classList?.add("wait-fetch")
                updateNotesLayer()
            }
        })

        inverterForFilterByUsername.textContent = "🚫"
        const hideFromUserTitle = "Click to hide notes from this user"
        const onlyFromUserTitle = "Click to show notes only from this user"
        inverterForFilterByUsername.title = hideFromUserTitle
        inverterForFilterByUsername.style.filter = "grayscale(1)"
        inverterForFilterByUsername.style.position = "absolute"
        inverterForFilterByUsername.style.cursor = "pointer"
        inverterForFilterByUsername.style.marginLeft = "-1.5em"
        inverterForFilterByUsername.checked = false
        inverterForFilterByUsername.onclick = () => {
            inverterForFilterByUsername.checked = !inverterForFilterByUsername.checked
            if (inverterForFilterByUsername.checked) {
                inverterForFilterByUsername.style.filter = ""
                inverterForFilterByUsername.title = onlyFromUserTitle
            } else {
                inverterForFilterByUsername.style.filter = "grayscale(1)"
                inverterForFilterByUsername.title = hideFromUserTitle
            }
            inverterForFilterByUsername?.classList?.add("wait-fetch")
            updateNotesLayer()
        }

        const resetFilter = document.createElement("button")
        resetFilter.textContent = "✖"
        resetFilter.style.all = "unset"
        resetFilter.style.position = "absolute"
        resetFilter.style.right = "20px"
        resetFilter.style.cursor = "pointer"
        resetFilter.tabIndex = -1
        resetFilter.onclick = () => {
            filterByUsername.value = ""
            updateNotesLayer()
        }

        const wrapper = document.createElement("div")
        wrapper.style.display = "flex"
        wrapper.style.alignItems = "center"
        wrapper.style.marginBottom = "2px"
        wrapper.appendChild(inverterForFilterByUsername)
        wrapper.appendChild(filterByUsername)
        wrapper.appendChild(resetFilter)
        wrapper.appendChild(datalist)

        return wrapper
    }

    const filterByClosed = document.createElement("select")

    function makeFilterByClosedWrapper() {
        filterByClosed.id = "filter-notes-by-comments"
        filterByClosed.style.width = "100%"
        filterByClosed.addEventListener("input", function () {
            filterByClosed.classList?.add("wait-fetch")
            updateNotesLayer()
        })
        ;[
            ["❌ + ✅ at 1 days ago", 1],
            ["❌ + ✅ at 7 days ago", 7],
            ["❌ + ✅ at 30 days ago", 30],
            ["❌ + ✅ at 365 days ago", 365],
            ["created 7 days ago", -7],
            ["created 30 days ago", -30],
            ["created > 3 years ago", -365 * 3],
            ["only opened", 0],
            ["all notes", -1],
        ].forEach(([title, value]) => {
            const option = document.createElement("option")
            option.textContent = title
            option.value = value
            if (value === 7) {
                option.selected = "selected"
            }
            filterByClosed.appendChild(option)
        })

        const wrapper = document.createElement("div")
        wrapper.style.marginBottom = "2px"
        wrapper.appendChild(filterByClosed)

        return wrapper
    }

    const filterByComment = document.createElement("select")

    function makeFilterByCommentsWrapper() {
        filterByComment.id = "filter-notes-by-closed"
        filterByComment.placeholder = t("notes.wordInCommentsPlaceholder")
        filterByComment.style.width = "100%"
        filterByComment.style.color = "gray"
        filterByComment.setAttribute("list", "comments-filters")
        filterByComment.addEventListener("click", function (e) {
            if (e.isTrusted) {
                filterByComment.click()
            }
        })
        filterByComment.addEventListener("input", function () {
            filterByComment.classList?.add("wait-fetch")
            updateNotesLayer()
        })
        ;[
            ["comments filters", ""],
            ["only with comments", "only with comments"],
            ["only with my comments", "only with my comments"],
            ["without comments", "without comments"],
            ["without my comments", "without my comments"],
            ["commented by other users", "commented by other users"],
        ].forEach(([title, value]) => {
            const option = document.createElement("option")
            option.textContent = title
            option.value = value
            filterByComment.appendChild(option)
        })

        const wrapperForFilterByClosed = document.createElement("div")
        wrapperForFilterByClosed.appendChild(filterByComment)

        return wrapperForFilterByClosed
    }

    filters.appendChild(makeFilterByStringWrapper())
    filters.appendChild(makeFilterByUsernameWrapper())
    filters.appendChild(makeFilterByClosedWrapper())
    filters.appendChild(makeFilterByCommentsWrapper())

    noteLabel.after(filters)
    updateNotesFilters()
    addAltClickHandlerForNotes()
    document.querySelector(".overlay-layers p").style.display = "none"
    document.querySelector(".layers-ui :is(h2,h4)").style.fontSize = "20px"

    const downloadNotes = document.createElement("span")
    downloadNotes.id = "download-notes"
    downloadNotes.title = t("notes.downloadVisibleNotesAsKmlTitle")
    insertSvg(downloadNotes, "download")
    downloadNotes.querySelector("svg").style.marginTop = "-3px"
    downloadNotes.style.opacity = "0.5"
    downloadNotes.style.cursor = "pointer"
    downloadNotes.style.paddingLeft = "5px"
    noteLabel.after(downloadNotes)
    downloadNotes.onclick = downloadVisibleNotesAsKml
}

function setupNotesFiltersButtons() {
    if (document.getElementById("map")) {
        tryApplyModule(addNotesFiltersButtons, 200, 5000)
    }
}

//</editor-fold>
