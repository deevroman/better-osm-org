//<editor-fold desc="direction-render" defaultstate="collapsed">

/**
 *
 * @param {float} lat
 * @param {float} lon
 * @param {string} values
 * @param {string} color
 */
function renderDirectionTag(lat, lon, values, color = c("#ff00e3")) {
    const cardinalToAngle = {
        N: 0.0,
        north: 0.0,
        NNE: 22.0,
        NE: 45.0,
        ENE: 67.0,
        E: 90.0,
        east: 90.0,
        ESE: 112.0,
        SE: 135.0,
        SSE: 157.0,
        S: 180.0,
        south: 180.0,
        SSW: 202.0,
        SW: 225.0,
        WSW: 247.0,
        W: 270.0,
        west: 270.0,
        WNW: 292.0,
        NW: 315.0,
        NNW: 337.0,
    }
    values.split(";").forEach(angleStr => {
        if (angleStr.slice(1).includes("-")) {
            if (angleStr === "0-360") {
                return
            }
            const [firstAngleStr, remAngleStr] = angleStr.split("-")
            const firstAngle = cardinalToAngle[firstAngleStr] !== undefined ? cardinalToAngle[firstAngleStr] : parseFloat(firstAngleStr)
            const remAngle = cardinalToAngle[remAngleStr] !== undefined ? cardinalToAngle[remAngleStr] : parseFloat(remAngleStr)
            if (!isNaN(firstAngle) && !isNaN(remAngle)) {
                drawRay(lat, lon, firstAngle, color)
                drawRay(lat, lon, remAngle, color)
            }
        } else {
            const angle = cardinalToAngle[angleStr] !== undefined ? cardinalToAngle[angleStr] : parseFloat(angleStr)
            if (!isNaN(angle)) {
                drawRay(lat, lon, angle - 30, color)
                drawRay(lat, lon, angle + 30, color)
            }
        }
    })
}

//</editor-fold>
