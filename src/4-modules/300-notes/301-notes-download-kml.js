//<editor-fold desc="notes-download-kml" defaultstate="collapsed">

const kmlXmlNamespace = "http://www.opengis.net/kml/2.2"
const streetCompletePhotoUrlRegex = /^(https:\/\/streetcomplete\.app\/|https:\/\/westnordost\.de\/).+\.jpg$/

function makeCommentKmlHtml(text) {
    return text
        .split("\n")
        .map(line => {
            const html = escapeHtml(line)
            const url = line.trim()
            if (!streetCompletePhotoUrlRegex.test(url)) {
                return html
            }
            return `${html}<br><img width="100%" src="${escapeHtml(url)}">`
        })
        .join("<br>")
}

function makeNoteKmlDescription(note) {
    const { comments, date_created, id, status } = note.properties ?? {}
    const url = `${osm_server.url}/note/${id}`
    const noteText = note.properties?.comments?.[0]?.text ?? ""
    const author = comments?.[0]?.user
    const commentsHtml = (comments ?? [])
        .slice(1)
        .map(comment => {
            const user = comment.user ? ` by ${comment.user}` : ""
            return [
                "<p>",
                `<b>${escapeHtml(comment.action ?? "comment")}${escapeHtml(user)}</b>`,
                comment.date ? ` <small>${escapeHtml(comment.date)}</small>` : "",
                "<br>",
                makeCommentKmlHtml(comment.text),
            ].join("")
        })
        .join("")

    return [
        noteText ? `<p>${makeCommentKmlHtml(noteText)}</p>` : "",
        url ? `<b>OSM note: </b><a href="${escapeHtml(url)}">${escapeHtml(String(id))}</a><br>` : "",
        author ? `<b>Author:</b> ${escapeHtml(author)}<br>` : "",
        status === "closed" ? `<b>Status:</b> ${escapeHtml(status)}<br>` : "",
        date_created ? `<b>Created:</b> ${escapeHtml(date_created)}` : "",
        "</p>",
        commentsHtml,
    ].join("")
}

function makeNotesKml(notes) {
    const ns = kmlXmlNamespace
    const doc = document.implementation.createDocument(ns, "kml")

    function appendKmlTextElement(parent, name, value) {
        const element = doc.createElementNS(kmlXmlNamespace, name)
        element.textContent = value
        parent.appendChild(element)
    }

    const documentElement = doc.createElementNS(ns, "Document")
    doc.documentElement.appendChild(documentElement)
    appendKmlTextElement(documentElement, "name", "OpenStreetMap notes")

    const style = doc.createElementNS(ns, "Style")
    style.setAttribute("id", "placemark-blue")
    const iconStyle = doc.createElementNS(ns, "IconStyle")
    const icon = doc.createElementNS(ns, "Icon")
    appendKmlTextElement(icon, "href", "https://omaps.app/placemarks/placemark-blue.png")
    iconStyle.appendChild(icon)
    style.appendChild(iconStyle)
    documentElement.appendChild(style)

    notes.forEach(note => {
        if (note.geometry?.type !== "Point") {
            return
        }

        const props = note.properties ?? {}
        const placemark = doc.createElementNS(ns, "Placemark")
        placemark.setAttribute("id", `note-${props.id}`)
        documentElement.appendChild(placemark)

        const shortText = (note.properties?.comments?.[0]?.text ?? "")
            .replace(/\s+/g, " ")
            .trim()
            .replace(/A user of .*$/, "")
            .replace(/A CoMaps user .*$/, "")
            .replace(/OSM snapshot date.*$/, "")
            .replace(/via StreetComplete \d+\.\d+/im, "#StreetComplete")
            .replace(/via StreetComplete_ee \d+\.\d+/im, "#StreetComplete_ee")
            .replace(/Attached photo.*$/im, "+ photo")
            .replace(/https?:\/\/(www.)?.*$/i, "")
        const title = shortText.length > 70 ? shortText.slice(0, 67).trim() + "..." : shortText
        appendKmlTextElement(placemark, "name", title)

        appendKmlTextElement(placemark, "styleUrl", "#placemark-blue")
        appendKmlTextElement(placemark, "description", makeNoteKmlDescription(note))

        const extendedData = doc.createElementNS(ns, "ExtendedData")
        ;["id", "url", "date_created", "status"].forEach(key => {
            if (props[key] == null) {
                return
            }
            const data = doc.createElementNS(ns, "Data")
            data.setAttribute("name", key)
            appendKmlTextElement(data, "value", props[key])
            extendedData.appendChild(data)
        })
        if (props.comments) {
            const data = doc.createElementNS(ns, "Data")
            data.setAttribute("name", "comments_count")
            appendKmlTextElement(data, "value", props.comments.length)
            extendedData.appendChild(data)
        }
        placemark.appendChild(extendedData)

        const point = doc.createElementNS(ns, "Point")
        const coordinates = note.geometry?.coordinates
        appendKmlTextElement(point, "coordinates", `${coordinates[0]},${coordinates[1]},0`)
        placemark.appendChild(point)
    })

    return `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(doc)}\n`
}

function downloadTextFile(filename, text, mimeType) {
    const link = document.createElement("a")
    link.href = URL.createObjectURL(new Blob([text], { type: mimeType }))
    link.download = filename
    link.style.display = "none"
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(link.href))
}

function downloadVisibleNotesAsKml() {
    const notes = structuredClone(getWindow().visibleNotes ?? [])
    if (notes.length === 0) {
        alert("No visible notes to download")
        return
    }

    const filenameDate = new Date()
        .toISOString()
        .replaceAll(":", "-")
        .replace(/\.\d{3}Z$/, "Z")
    downloadTextFile(`osm-notes-${filenameDate}.kml`, makeNotesKml(notes), "application/vnd.google-earth.kml+xml;charset=utf-8")
}

//</editor-fold>
