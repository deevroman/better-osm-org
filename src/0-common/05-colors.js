//<editor-fold desc="colors" defaultstate="collapsed">

// prettier-ignore
const colorsPalette = {
    "#ff00e3" : "#ff00e3",
    "#0022ff": "#0022ff",

    "rgba(17, 238, 9, 0.6)": "rgba(17, 238, 9, 0.6)",              // .quick-look-new-tag
    "rgba(223, 238, 9, 0.6)": "rgba(223, 238, 9, 0.6)",            // .quick-look-modified-tag
    "rgba(238, 51, 9, 0.6)": "rgba(238, 51, 9, 0.6)",              // .quick-look-deleted-tag
    "#000.quick-look-deleted-tag": "#000",                   // color.quick-look-deleted-tag
    "#fff.quick-look-deleted-tag": "#fff",                   // color.quick-look-deleted-tag
    "rgba(25, 223, 25, 0.6)": "rgba(25, 223, 25, 0.6)",      // .new-letter
    "rgba(255, 144, 144, 0.6)": "rgba(255, 144, 144, 0.6)",  // .deleted-letter

    "rgba(17, 238, 9, 0.3)": "rgba(17, 238, 9, 0.3)",              // dark.quick-look-new-tag
    "rgba(238, 51, 9, 0.4)": "rgba(238, 51, 9, 0.4)",              // dark.quick-look-deleted-tag
    "rgba(25, 223, 25, 0.9)": "rgba(25, 223, 25, 0.9)",      // dark.new-letter
    "rgba(253, 83, 83, 0.8)": "rgba(253, 83, 83, 0.8)",      // dark.deleted-letter

    "rgba(0, 128, 0, 0.6)": "rgba(0, 128, 0, 0.6)",                // displayWay for version 1
    "rgba(120, 238, 9, 0.6)": "rgba(120, 238, 9, 0.6)",            // displayWay for restored way
    "#ff0000.deleted-way-geom": "#ff0000",                   // displayWay for deleted

    "#00a500.first-node-version": "#00a500",                 // showNodeMarker for version 1
    "rgba(89, 170, 9, 0.6).restored-node-version": "#00a500",   // showNodeMarker for version 1
    "#ff0000.deleted-node-geom": "#ff0000",                  // showNodeMarker for deleted

    "rgba(17, 238, 9, 0.3).members-changed-flag": "rgba(17, 238, 9, 0.3)",  // dark
    "rgba(101, 238, 9, 0.6).members-changed-flag": "rgba(101, 238, 9, 0.6)",
    "rgba(238, 51, 9, 0.4).members-changed-flag": "rgba(238, 51, 9, 0.4)",  // dark
    "rgba(238, 9, 9, 0.42).members-changed-flag": "rgba(238, 9, 9, 0.42)",

    "rgba(17, 238, 9, 0.6).members-changed-row": "rgba(17, 238, 9, 0.6)",
    "rgba(238, 51, 9, 0.6).members-changed-row": "rgba(238, 51, 9, 0.6)",

    "rgba(17, 238, 9, 0.3).nodes-changed-flag": "rgba(17, 238, 9, 0.3)",  // dark
    "rgba(101, 238, 9, 0.6).nodes-changed-flag": "rgba(101, 238, 9, 0.6)",
    "rgba(238, 51, 9, 0.4).nodes-changed-flag": "rgba(238, 51, 9, 0.4)",  // dark
    "rgba(238, 9, 9, 0.42).nodes-changed-flag": "rgba(238, 9, 9, 0.42)",

    "rgba(17, 238, 9, 0.6).nodes-changed-row": "rgba(17, 238, 9, 0.6)",
    "rgba(238, 51, 9, 0.6).nodes-changed-row": "rgba(238, 51, 9, 0.6)",

    "rgba(4, 123, 0, 0.6).history-diff-new-tag" : "rgba(4, 123, 0, 0.6)",
    "rgba(238, 51, 9, 0.4).history-diff-deleted-tag": "rgba(238, 51, 9, 0.4)"
}

// prettier-ignore
const colorblindFriendlyPalette = {
    "rgba(17, 238, 9, 0.6)": "#0074FF75",            // .quick-look-new-tag
    "rgba(238, 51, 9, 0.6)": "#F80000",              // .quick-look-deleted-tag
    "#000.quick-look-deleted-tag": "#fff",           // color.quick-look-deleted-tag

    "rgba(25, 223, 25, 0.6)": "#8EA5FFC4",           // .new-letter
    "rgba(255, 144, 144, 0.6)": "#FFB7B7",           // .deleted-letter

    "rgba(25, 223, 25, 0.9)": "#8EA5FFC4",           // dark.new-letter
    "rgba(253, 83, 83, 0.8)": "#FFB7B7",             // dark.deleted-letter

    "rgba(17, 238, 9, 0.3)": "#1A385C",              // dark.quick-look-new-tag
    "rgba(238, 51, 9, 0.4)": "#732a1d",              // dark.quick-look-deleted-tag

    "rgba(0, 128, 0, 0.6)": "#0074FF75",                     // displayWay for version 1
    "rgba(120, 238, 9, 0.6)": "rgba(64,152,255,0.46)",       // displayWay for restored way
    "#ff0000.deleted-way-geom": "#f34c4c",                   // displayWay for deleted

    "#00a500.first-node-version": "#0074FF75",                                // showNodeMarker for version 1
    "rgba(89, 170, 9, 0.6).restored-node-version": "rgba(64,152,255,0.46)",   // showNodeMarker for version 1
    "#ff0000.deleted-node-geom": "#f34c4c",                                   // showNodeMarker for deleted

    "rgba(17, 238, 9, 0.3).members-changed-flag": "#0074FF75",   // dark
    "rgba(101, 238, 9, 0.6).members-changed-flag": "#0074FF75",
    "rgba(238, 51, 9, 0.4).members-changed-flag": "#f34c4c",     // dark
    "rgba(238, 9, 9, 0.42).members-changed-flag": "rgb(242, 0, 0)",

    "rgba(17, 238, 9, 0.6).members-changed-row": "#0074FF75",
    "rgba(238, 51, 9, 0.6).members-changed-row": "rgb(242, 0, 0)",

    "rgba(17, 238, 9, 0.3).nodes-changed-flag": "#0074FF75",       // dark
    "rgba(101, 238, 9, 0.6).nodes-changed-flag": "#0074FF75",
    "rgba(238, 51, 9, 0.4).nodes-changed-flag": "rgb(242, 0, 0)",  // dark
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
