declare function exportFunction<T extends Function>(
    func: T,
    targetScope: object,
    options?: {
        defineAs?: string
        allowCallbacks?: boolean
        allowCrossOriginArguments?: boolean
    },
): T

declare function cloneInto<T>(
    obj: T,
    targetScope: object,
    options?: {
        cloneFunctions?: boolean
        wrapReflectors?: boolean
    },
): T

import "typed-query-selector/strict"

declare const osmAuth
declare const GM
declare const GM_info
declare const GM_config
declare const GM_addElement
declare const GM_listValues
declare const GM_deleteValue
declare const GM_getResourceURL
declare const GM_getResourceText
declare const GM_registerMenuCommand
declare const unsafeWindow
declare const EXIF
declare const osmtogeojson
declare const opening_hours
declare const runSnowAnimation
