// import "typed-query-selector/strict"
// import "types/tampermonkey"
// import "GM_config.d.ts"

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

declare const osmAuth
// declare const GM: Tampermonkey.GM & { fetch: (url: string) => Response }
// declare const GM_info: Tampermonkey.ScriptInfo
// declare const GM_config: GM_configStruct
// declare const GM_addElement: Tampermonkey.GM_addElement
// declare const GM_getResourceURL
// declare const GM_getResourceText
// declare const GM_registerMenuCommand
declare const unsafeWindow
declare const EXIF
declare const osmtogeojson
declare const opening_hours
declare const runSnowAnimation
