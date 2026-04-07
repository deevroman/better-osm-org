// garbage collection for cached infos (user info, changeset history)
async function runGC() {
    const USERINFO_PREFIXES = ["userinfo-", "ohm-userinfo-", "ogf-userinfo-", "dev-userinfo-"]
    const USER_ID_INFO_PREFIXES = ["useridinfo-", "ohm-useridinfo-", "ogf-useridinfo-", "dev-useridinfo-"]
    const USER_CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 14

    async function deleteIfExpiredCache(key) {
        try {
            const cacheData = JSON.parse(await GM.getValue(key))
            if (!cacheData.cacheTime) return

            const cacheTime = new Date(cacheData.cacheTime).getTime()
            if (isNaN(cacheTime) || cacheTime + USER_CACHE_TTL_MS < Date.now()) {
                await GM.deleteValue(key)
            }
        } catch {
            /* empty */
        }
    }

    if (Math.random() > 0.5) return
    if (!location.pathname.includes("/history") && !location.pathname.includes("/note") && !location.pathname.includes("/user")) return
    const lastGC = await GM.getValue("last-garbage-collection-time")
    console.debug("last-garbage-collection-time", new Date(lastGC))
    if (lastGC && new Date(lastGC).getTime() + 1000 * 60 * 60 * 24 * 2 > Date.now()) return
    await GM.setValue("last-garbage-collection-time", Date.now())

    const keys = await GM.listValues()
    for (const i of keys) {
        if ([...USERINFO_PREFIXES, ...USER_ID_INFO_PREFIXES].some(prefix => i.startsWith(prefix))) {
            await deleteIfExpiredCache(i)
        }
    }
    console.log("Old cache cleaned")
}
setTimeout(runGC, 1000 * 12)

performance.mark("BETTER_OSM_END")
