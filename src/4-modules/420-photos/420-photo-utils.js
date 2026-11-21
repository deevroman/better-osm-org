//<editor-fold desc="photo-tags" defaultstate="collapsed">

function appendTitleLine(elem, text) {
    if (!text) {
        return
    }
    if (elem.title && elem.title.length !== 0) {
        elem.title += "\n"
    }
    elem.title += text
}

//</editor-fold>
