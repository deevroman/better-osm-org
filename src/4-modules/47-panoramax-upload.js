//<editor-fold desc="panoramax-upload" defaultstate="collapsed">

async function getPanoramaxToken() {
    try {
        const res = await externalFetch({
            url: `${panoramaxInstance}/api/users/me/tokens`,
            responseType: "json",
        })
        const res1 = await externalFetch({
            url: res.response[0].links[0].href,
            responseType: "json",
        })
        console.log("Panoramax token obtained")
        return res1.response.jwt_token
    } catch (e) {
        alert("Please, login to Panoramax")
        window.open(panoramaxInstance, "_blank")
        throw e
    }
}

async function createUploadSet(apiUrl, token) {
    const response = await externalFetch({
        url: `${apiUrl}/api/upload_sets`,
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": `better osm.org v${GM_info.script.version}`,
        },
        data: JSON.stringify({
            title: "Upload from better-osm-org",
            estimated_nb_files: 1,
        }),
        responseType: "json",
    })

    if (response.status !== 200) {
        throw new Error(`Failed to create upload set: HTTP ${response.status}\n\n${response.response?.details?.error}`)
    }

    const data = await response.response
    return data.id || data.upload_set_id
}

async function uploadPhotoToSet(apiUrl, token, uploadSetId, file) {
    const formData = new FormData()
    formData.append("file", file)

    const response = await externalFetch({
        url: `${apiUrl}/api/upload_sets/${uploadSetId}/files`,
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        responseType: "json",
        data: formData,
    })

    if (response.status < 200 || response.status >= 300) {
        console.error(response)
        throw new Error(`Photo upload failed, HTTP ${response.status}:\n\n${response.response?.details?.error}\n\nFull log in browser console (F12)`)
    }

    return await response.response
}

async function completeUploadSet(apiUrl, token, uploadSetId) {
    const response = await externalFetch({
        url: `${apiUrl}/api/upload_sets/${uploadSetId}/complete`,
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        responseType: "json",
    })

    if (response.status !== 200) {
        throw new Error("Failed to complete upload set: " + response.status)
    }

    return await response.response
}

let panoramaxInstance = "https://panoramax.openstreetmap.fr"

GM.getValue("panoramaxInstance").then(res => {
    panoramaxInstance = res ?? "https://panoramax.openstreetmap.fr"
})

async function uploadImage(token, file) {
    const uploadSetId = await createUploadSet(panoramaxInstance, token)
    console.log("Upload set created:", uploadSetId)

    const uploadRes = await uploadPhotoToSet(panoramaxInstance, token, uploadSetId, file)
    console.log("Uploaded file:", uploadRes)

    try {
        const completeRes = await completeUploadSet(panoramaxInstance, token, uploadSetId)
        console.log("Upload set completed:", completeRes)
    } catch (e) {}

    return uploadRes.picture_id
}

async function openOsmChangeset(comment) {
    const changesetTags = {
        created_by: `better osm.org v${GM_info.script.version}`,
        comment: comment,
    }

    const changesetPayload = document.implementation.createDocument(null, "osm")
    const cs = changesetPayload.createElement("changeset")
    changesetPayload.documentElement.appendChild(cs)
    tagsToXml(changesetPayload, cs, changesetTags)
    const chPayloadStr = new XMLSerializer().serializeToString(changesetPayload)

    const changesetId = await osmEditAuth
        .fetch(osm_server.apiBase + "changeset/create", {
            method: "PUT",
            prefix: false,
            body: chPayloadStr,
        })
        .then(res => {
            if (res.ok) return res.text()
            throw new Error(res)
        })
    console.log("Open changeset", changesetId)
    return changesetId
}

async function addPanoramaxTag(pictureId) {
    const [, object_type, object_id] = location.pathname.match(/\/(node|way|relation)\/([0-9]+)/)
    const rawObjectInfo = await (
        await osmEditAuth.fetch(osm_server.apiBase + object_type + "/" + object_id, {
            method: "GET",
            prefix: false,
        })
    ).text()
    const objectInfo = new DOMParser().parseFromString(rawObjectInfo, "text/xml")
    const newTag = objectInfo.createElement("tag")
    newTag.setAttribute("k", "panoramax")
    newTag.setAttribute("v", pictureId)
    objectInfo.querySelector("tag").after(newTag)

    const changesetId = await openOsmChangeset("Add Panoramax image")
    try {
        objectInfo.children[0].children[0].setAttribute("changeset", changesetId)

        const objectInfoStr = new XMLSerializer().serializeToString(objectInfo).replace(/xmlns="[^"]+"/, "")
        console.log(objectInfoStr)
        await osmEditAuth
            .fetch(osm_server.apiBase + object_type + "/" + object_id, {
                method: "PUT",
                prefix: false,
                body: objectInfoStr,
            })
            .then(async res => {
                const text = await res.text()
                if (res.ok) return text
                alert(text)
                throw new Error(text)
            })
    } finally {
        await osmEditAuth.fetch(osm_server.apiBase + "changeset/" + changesetId + "/close", {
            method: "PUT",
            prefix: false,
        })
    }
}

function addUploadPanoramaxBtn() {
    if (!isDebug()) return
    if (!location.pathname.match(/\/(node|way|relation)\/[0-9]+\/?$/)) {
        return
    }
    if (document.querySelector(".upload-to-panoramax")) {
        return
    }
    if (
        !document.querySelector(
            ':where(a[href^="https://wiki.openstreetmap.org/wiki/Key:shop"], a[href^="https://wiki.openstreetmap.org/wiki/Key:amenity"], a[href^="https://wiki.openstreetmap.org/wiki/Key:tourism"])',
        )
    ) {
        return
    }
    if (document.querySelector('a[href^="https://wiki.openstreetmap.org/wiki/Key:panoramax"]')) {
        return
    }
    const wrapper = document.createElement("div")
    wrapper.style.setProperty("padding-bottom", "1px", "important")
    const firstBlock = document.createElement("div")
    const secondBlock = document.createElement("div")
    secondBlock.style.paddingTop = "5px"
    wrapper.appendChild(firstBlock)
    wrapper.appendChild(secondBlock)

    firstBlock.appendChild(document.createTextNode("Upload photo to Panoramax"))

    const fileInput = document.createElement("input")
    fileInput.type = "file"
    fileInput.accept = "image/*"
    fileInput.onchange = () => {
        uploadImgBtn.style.removeProperty("display")
        instanceInput.style.removeProperty("display")
        instanceInput.value = panoramaxInstance
    }
    firstBlock.appendChild(fileInput)

    const uploadImgBtn = document.createElement("button")
    uploadImgBtn.style.all = "unset"
    uploadImgBtn.style.cursor = "pointer"
    uploadImgBtn.classList.add("upload-to-panoramax", "bi", "bi-upload")
    uploadImgBtn.style.display = "none"
    uploadImgBtn.style.paddingLeft = "5px"
    uploadImgBtn.onclick = async () => {
        if (osmEditAuth === null) {
            osmEditAuth = makeAuth()
        }
        new URL(instanceInput.value)
        void GM.setValue("panoramaxInstance", panoramaxInstance = instanceInput.value)
        if (!fileInput.files.length) {
            return alert("Select file")
        }
        wrapper.classList.add("is-loading")
        uploadImgBtn.style.display = "none"
        const file = fileInput.files[0]
        // TODO add client side validation
        try {
            const token = await getPanoramaxToken()
            await addPanoramaxTag(await uploadImage(token, file))
            await sleep(1000)
            location.reload()
        } catch (err) {
            console.error(err)
            alert("Error: " + err.message)
        } finally {
            wrapper.classList.remove("is-loading")
        }
    }

    document.querySelector("#sidebar_content").appendChild(wrapper)

    const instanceInput = document.createElement("input")
    instanceInput.type = "url"
    instanceInput.style.display = "none"
    instanceInput.style.width = "300px"
    secondBlock.appendChild(instanceInput)
    secondBlock.appendChild(uploadImgBtn)
}

//</editor-fold>
