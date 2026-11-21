//<editor-fold desc="drop-kml" defaultstate="collapsed">

async function displayDroppedKml(file) {
    displayKMLTrack(await file.text())
}

async function displayDroppedKmz(file) {
    const { entries } = await unzipit.unzip(await file.arrayBuffer())
    displayKMLTrack(
        await Object.entries(entries)
            .find(i => i[0].endsWith(".kml"))[1]
            .text(),
    )
}

//</editor-fold>
