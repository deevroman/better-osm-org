// garbage collection for cached infos (user info, changeset history)
async function runGC() {
    if (Math.random() > 0.5) return
    if (!location.pathname.includes("/history") && !location.pathname.includes("/note")) return
    const lastGC = await GM.getValue("last-garbage-collection-time")
    console.debug("last-garbage-collection-time", new Date(lastGC))
    if (lastGC && new Date(lastGC).getTime() + 1000 * 60 * 60 * 24 * 2 > Date.now()) return
    await GM.setValue("last-garbage-collection-time", Date.now())

    const keys = GM_listValues()
    for (const i of keys) {
        if (i.startsWith("userinfo-")) {
            try {
                const userinfo = JSON.parse(await GM.getValue(i))
                if (userinfo.cacheTime && new Date(userinfo.cacheTime).getTime() + 1000 * 60 * 60 * 24 * 14 < Date.now()) {
                    await GM_deleteValue(i)
                }
            } catch {
                /* empty */
            }
        } else if (i.startsWith("useridinfo-")) {
            try {
                const userIDInfo = JSON.parse(await GM.getValue(i))
                if (userIDInfo.cacheTime && new Date(userIDInfo.cacheTime).getTime() + 1000 * 60 * 60 * 24 * 14 < Date.now()) {
                    await GM_deleteValue(i)
                }
            } catch {
                /* empty */
            }
        }
    }
    console.log("Old cache cleaned")
}
setTimeout(runGC, 1000 * 12)
