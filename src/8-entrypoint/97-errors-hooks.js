/* const unhandledExceptions = []

const globalWarn = "<a class='global-report' title='Open browser console'>⚠️ </a>"

window.addEventListener("error", function (message, file, line, col, error) {
    if (isDebug()) {
        unhandledExceptions.push(error)
        setAttributionPrefix(globalWarn)
    }
    return false
})

getWindow().addEventListener(
    "error",
    intoPageWithFun(function (message, file, line, col, error) {
        if (isDebug()) {
            unhandledExceptions.push(error)
            setAttributionPrefix(globalWarn)
        }
        return false
    }),
)

getWindow().addEventListener(
    "unhandledrejection",
    intoPageWithFun(e => {
        if (isDebug()) {
            unhandledExceptions.push(e)
            setAttributionPrefix(globalWarn)
        }
        return false
    }),
)

injectJSIntoPage(`
// window.$(".global-report")
//     .on(
//         "click",
//         intoPageWithFun(() => {
//             alert(1)
//         }),
//     )
// `)
 */
performance.mark("BETTER_OSM_END")
