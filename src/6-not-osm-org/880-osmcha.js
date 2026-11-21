//<editor-fold desc="osmcha" defaultstate="collapsed">

async function extractOsmchaToken() {
    function _extractOsmchaToken() {
        let token = localStorage.getItem("token")
        if (!token) {
            token = JSON.parse(localStorage.getItem("auth"))["state"]["token"]
        }
        return token
    }

    try {
        return _extractOsmchaToken()
    } catch (e) {
        console.error(e)
        await sleep(3000)
        return _extractOsmchaToken()
    }
}

async function storeOsmchaTokenWithOwner(origin, token, STORAGE_KEY) {
    const userinfo = await fetch(`${origin}/api/v1/users`, { headers: { Authorization: `Token ${token}` } }).then(res => res.json())
    if (!userinfo.uid) {
        return
    }
    const prev = await GM.getValue(STORAGE_KEY, {})
    await GM.setValue(STORAGE_KEY, {
        ...prev,
        [userinfo.uid]: token,
    })
    console.log("stored osmcha token", origin, userinfo.uid, token.slice(0, 5) + "...")
}

function setupOsmcha() {
    setTimeout(async () => {
        const token = await extractOsmchaToken()
        await GM.setValue("OSMCHA_TOKEN", token)
        await storeOsmchaTokenWithOwner("https://osmcha.org", token, "OSMCHA_TOKENS")
    }, 1000)
}

function setupOhmOsmcha() {
    setTimeout(async () => {
        const token = await extractOsmchaToken()
        await GM.setValue("OHM_OSMCHA_TOKEN", token)
        await storeOsmchaTokenWithOwner("https://osmcha.openhistoricalmap.org", token, "OHM_OSMCHA_TOKENS")
    }, 1000)
}

//</editor-fold>
