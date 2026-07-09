//<editor-fold desc="colors" defaultstate="collapsed">

// prettier-ignore
const colorsPalette = {
    "#ff00e3": "#ff00e3",
    "#0022ff": "#0022ff",

    "rgba(17, 238, 9, 0.6).history-diff-new-tag": "rgba(17, 238, 9, 0.6)",
    "rgba(223, 238, 9, 0.6).history-diff-modified-tag": "rgba(223, 238, 9, 0.6)",
    "rgba(238, 51, 9, 0.6).history-diff-deleted-tag": "rgba(238, 51, 9, 0.6)",

    "rgba(17, 238, 9, 0.6).quick-look-new-tag.background": "rgba(17, 238, 9, 0.6)",
    "rgba(223, 238, 9, 0.6).quick-look-modified-tag.background": "rgba(223, 238, 9, 0.6)",
    "rgba(238, 51, 9, 0.6).quick-look-deleted-tag.background": "rgba(238, 51, 9, 0.6)",
    "#000.quick-look-deleted-tag.color": "#000",
    "#fff.quick-look-deleted-tag.color": "#fff",

    "rgba(25, 223, 25, 0.6).new-letter": "rgba(25, 223, 25, 0.6)",
    "rgba(255, 144, 144, 0.6).deleted-letter": "rgba(255, 144, 144, 0.6)",

    "rgba(17, 238, 9, 0.3).quick-look-new-tag.background.dark": "rgba(17, 238, 9, 0.3)",
    "rgba(238, 51, 9, 0.4).quick-look-deleted-tag.background.dark": "rgba(238, 51, 9, 0.4)",
    "rgba(25, 223, 25, 0.9).new-letter.dark": "rgba(25, 223, 25, 0.9)",
    "rgba(253, 83, 83, 0.8).deleted-letter.dark": "rgba(253, 83, 83, 0.8)",

    "rgba(0, 128, 0, 0.6).first-way-version": "rgba(0, 128, 0, 0.6)",
    "rgba(120, 238, 9, 0.6).restored-way": "rgba(120, 238, 9, 0.6)",
    "#ff0000.deleted-way-geom": "#ff0000",

    "#00a500.first-node-version": "#00a500",
    "rgba(89, 170, 9, 0.6).restored-node-version": "#00a500",
    "#ff0000.deleted-node-geom": "#ff0000",

    "rgba(17, 238, 9, 0.3).members-changed-flag.dark": "rgba(17, 238, 9, 0.3)",
    "rgba(101, 238, 9, 0.6).members-changed-flag": "rgba(101, 238, 9, 0.6)",
    "rgba(238, 51, 9, 0.4).members-changed-flag.dark": "rgba(238, 51, 9, 0.4)",
    "rgba(238, 9, 9, 0.42).members-changed-flag": "rgba(238, 9, 9, 0.42)",

    "rgba(17, 238, 9, 0.6).members-changed-row": "rgba(17, 238, 9, 0.6)",
    "rgba(238, 51, 9, 0.6).members-changed-row": "rgba(238, 51, 9, 0.6)",

    "rgba(17, 238, 9, 0.3).nodes-changed-flag.dark": "rgba(17, 238, 9, 0.3)",
    "rgba(101, 238, 9, 0.6).nodes-changed-flag": "rgba(101, 238, 9, 0.6)",
    "rgba(238, 51, 9, 0.4).nodes-changed-flag.dark": "rgba(238, 51, 9, 0.4)",
    "rgba(238, 9, 9, 0.42).nodes-changed-flag": "rgba(238, 9, 9, 0.42)",

    "rgba(17, 238, 9, 0.6).nodes-changed-row": "rgba(17, 238, 9, 0.6)",
    "rgba(238, 51, 9, 0.6).nodes-changed-row": "rgba(238, 51, 9, 0.6)",

    "rgba(4, 123, 0, 0.6).history-diff-new-tag" : "rgba(4, 123, 0, 0.6)",
    "rgba(238, 51, 9, 0.4).history-diff-deleted-tag": "rgba(238, 51, 9, 0.4)"
}

const defaultColorsPalette = { ...colorsPalette }

// prettier-ignore
const colorblindFriendlyPalette = {
    "rgba(17, 238, 9, 0.6).history-diff-new-tag": "#0074FF75",
    "rgba(238, 51, 9, 0.6).history-diff-deleted-tag": "#F80000",

    "rgba(17, 238, 9, 0.6).quick-look-new-tag.background": "#0074FF75",
    "rgba(238, 51, 9, 0.6).quick-look-deleted-tag.background": "#F80000",
    "#000.quick-look-deleted-tag.color": "#fff",

    "rgba(25, 223, 25, 0.6).new-letter": "#8EA5FFC4",
    "rgba(255, 144, 144, 0.6).deleted-letter": "#FFB7B7",

    "rgba(25, 223, 25, 0.9).new-letter.dark": "#8EA5FFC4",
    "rgba(253, 83, 83, 0.8).deleted-letter.dark": "#FFB7B7",

    "rgba(17, 238, 9, 0.3).quick-look-new-tag.background.dark": "#1A385C",
    "rgba(238, 51, 9, 0.4).quick-look-deleted-tag.background.dark": "#732a1d",

    "rgba(0, 128, 0, 0.6).first-way-version": "#0074FF75",
    "rgba(120, 238, 9, 0.6).restored-way": "rgba(64,152,255,0.46)",
    "#ff0000.deleted-way-geom": "#f34c4c",

    "#00a500.first-node-version": "#0074FF75",
    "rgba(89, 170, 9, 0.6).restored-node-version": "rgba(64,152,255,0.46)",
    "#ff0000.deleted-node-geom": "#f34c4c",

    "rgba(17, 238, 9, 0.3).members-changed-flag.dark": "#0074FF75",
    "rgba(101, 238, 9, 0.6).members-changed-flag": "#0074FF75",
    "rgba(238, 51, 9, 0.4).members-changed-flag.dark": "#f34c4c",
    "rgba(238, 9, 9, 0.42).members-changed-flag": "rgb(242, 0, 0)",

    "rgba(17, 238, 9, 0.6).members-changed-row": "#0074FF75",
    "rgba(238, 51, 9, 0.6).members-changed-row": "rgb(242, 0, 0)",

    "rgba(17, 238, 9, 0.3).nodes-changed-flag.dark": "#0074FF75",
    "rgba(101, 238, 9, 0.6).nodes-changed-flag": "#0074FF75",
    "rgba(238, 51, 9, 0.4).nodes-changed-flag.dark": "rgb(242, 0, 0)",
    "rgba(238, 9, 9, 0.42).nodes-changed-flag": "rgb(242, 0, 0)",

    "rgba(17, 238, 9, 0.6).nodes-changed-row": "#0074FF75",
    "rgba(238, 51, 9, 0.6).nodes-changed-row": "rgb(242, 0, 0)",

    "rgba(4, 123, 0, 0.6).history-diff-new-tag" : "#1A385C",
    "rgba(238, 51, 9, 0.4).history-diff-deleted-tag": "#732a1d"
}

function setColorblindFriendlyPalette() {
    Object.entries(colorblindFriendlyPalette).forEach(([k, v]) => {
        colorsPalette[k] = v
    })
}

function setCustomPalette() {
    try {
        const { enabled, colors } = parseColorPaletteSetting(GM_config.get("ColorPalette"))
        if (!enabled) {
            return
        }
        Object.entries(colors).forEach(([k, v]) => {
            if (!defaultColorsPalette[k]) {
                debug_alert(`color ${k} not found in default palette`)
            }
            colorsPalette[k] = v
        })
    } catch (e) {
        console.log(e)
    }
}

/**
 * @param color {string}
 * @param context {string}
 * @return {string}
 */
function c(color, context = "") {
    const res = colorsPalette[color + context]
    if (res) {
        return res
    }
    debug_alert(`color ${color + context} not found in palette`)
    return color
}

//</editor-fold>
