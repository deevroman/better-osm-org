//<editor-fold desc="osc-viewer" defaultstate="collapsed">

function makeChangesetSidebar(changesetID) {
    addCompactSidebarStyle()
    addQuickLookStyles()

    const sidebar_content = document.querySelector("#sidebar_content")
    sidebar_content.replaceChildren()

    if (changesetID !== 0) {
        const h2 = document.createElement("h2")
        h2.textContent = `Changeset: ${changesetID}`
        h2.classList.add("me-4", "text-break")
        sidebar_content.appendChild(h2)
    }

    const wrapper = document.createElement("div")
    wrapper.classList.add("mb-3", "border-bottom", "border-secondary-subtle", "pb-3")
    sidebar_content.appendChild(wrapper)
    ;["way", "relation", "node"].forEach(type => {
        const turbo_frame = document.createElement("turbo-frame")
        turbo_frame.id = `changeset_${type}s`
        turbo_frame.setAttribute("changeset-id", changesetID)

        const h4 = document.createElement("h4")
        h4.classList.add("fs-5")
        h4.style.textTransform = "capitalize"
        h4.textContent = `${type}s\xA0`
        turbo_frame.appendChild(h4)

        const badge = document.createElement("span")
        badge.classList.add("badge", "count-number")
        h4.appendChild(badge)

        const pagination = document.createElement("div")
        pagination.classList.add("numbered_pagination")
        turbo_frame.appendChild(pagination)

        const fake_link = document.createElement("a")
        fake_link.href = `?${type}_page`
        fake_link.classList.add("page-link")
        pagination.appendChild(fake_link)

        const ul = document.createElement("ul")
        ul.classList.add("list-unstyled", "browse-element-list")
        turbo_frame.appendChild(ul)

        wrapper.appendChild(turbo_frame)
    })
    document.querySelector(".overlay-sidebar").classList.remove("overlay-sidebar")
}

async function displayOsc(xml) {
    // Какие .osc бывают
    // .osc одного пакета правок — done
    // .osc диффа с несколькими правками
    // .osc незагруженной правки
    const changesetsSet = new Set()
    xml.querySelectorAll(":is(node[changeset],way[changeset],relation[changeset])").forEach(i => {
        changesetsSet.add(parseInt(i.getAttribute("changeset")))
    })
    const changesets = Array.from(changesetsSet)
    if (changesetsSet.size === 0 || changesetsSet.size === 1) {
        const changesetID = changesets.size === 0 ? 0 : changesets[0]
        makeChangesetSidebar(changesetID)
        changesetsCache[changesetID] = {
            data: xml,
            nodesWithParentWays: new Set(Array.from(xml.querySelectorAll("way > nd")).map(i => parseInt(i.getAttribute("ref")))),
            nodesWithOldParentWays: new Set(
                Array.from(xml.querySelectorAll("way:not([version='1']) > nd")).map(i => parseInt(i.getAttribute("ref"))),
            ),
        }
        await processQuickLookInSidebar(changesetID)
        return
    }

    makeChangesetSidebar(changesets[0])

    function extractChangesetData(xml, id) {
        const res = xml.cloneNode(true)
        res.querySelectorAll(":is(node,way,relation)").forEach(i => {
            if (parseInt(i.getAttribute("changeset")) !== id) {
                i.remove()
            }
        })
        return res
    }

    for (const changesetID of changesets) {
        const data = extractChangesetData(xml, changesetID)
        changesetsCache[changesetID] = {
            data: data,
            nodesWithParentWays: new Set(Array.from(data.querySelectorAll("way > nd")).map(i => parseInt(i.getAttribute("ref")))),
            nodesWithOldParentWays: new Set(
                Array.from(data.querySelectorAll("way:not([version='1']) > nd")).map(i => parseInt(i.getAttribute("ref"))),
            ),
        }
    }
    await processQuickLookForCombinedChangesets(changesets[0], changesets)
}

//</editor-fold>
