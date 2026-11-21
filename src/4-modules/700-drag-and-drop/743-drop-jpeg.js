//<editor-fold desc="drop-jpeg" defaultstate="collapsed">

let imagesLayerBbox = null

async function displayDroppedJpeg(file) {
    const metadata = EXIF.readFromBinaryFile(await file.arrayBuffer())
    console.log(metadata)
    console.log(metadata.GPSLatitude, metadata.GPSLongitude)
    let lat = parseFloat(metadata.GPSLatitude[0]) + parseFloat(metadata.GPSLatitude[1]) / 60 + parseFloat(metadata.GPSLatitude[2]) / 3600
    let lon = parseFloat(metadata.GPSLongitude[0]) + parseFloat(metadata.GPSLongitude[1]) / 60 + parseFloat(metadata.GPSLongitude[2]) / 3600

    if (metadata.GPSLatitudeRef === "S") {
        lat = parseFloat(lat) * -1
    }

    if (metadata.GPSLongitudeRef === "W") {
        lon = parseFloat(lon) * -1
    }

    imagesLayerBbox = combineBBOXes([
        imagesLayerBbox,
        {
            min_lat: lat,
            min_lon: lon,
            max_lat: lat,
            max_lon: lon,
        },
    ])

    const marker = getWindow().L.circleMarker(
        getWindow().L.latLng(lat, lon),
        // intoPage({
        //     maxWidth: mapWidth,
        //     maxHeight: mapHeight,
        //     className: "map-img-preview-popup",
        // }),
    )
    const img = document.createElement("img")
    img.classList.add("geotagged-img")
    img.setAttribute("width", "100%")
    const fr = new FileReader()
    fr.onload = function () {
        img.src = fr.result
        marker.bindPopup(img.outerHTML)
    }
    fr.readAsDataURL(file)
    marker.addTo(getMap())
}

//</editor-fold>
