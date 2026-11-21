//<editor-fold desc="wikimedia-commons" defaultstate="collapsed">

function attachWikimediaHoverCaptureHandler(a, res) {
    a.onmouseenter = () => wikimediaMouseEnter(res)
    try {
        const author = res["query"]["pages"]["-1"]["imageinfo"][0]["extmetadata"]["Artist"]["value"]
        if (author) {
            // отдавать HTML придумал гений, блять
            const fixedAuthor = author.endsWith("</a>") ? (author.match(/">(.*)<\/a>$/)[1] ?? author) : author
            appendTitleLine(a, t("objectPage.photoBy", { author: fixedAuthor }))
        }
    } catch (err) {
        console.error(err)
    }
    try {
        const date = res["query"]["pages"]["-1"]["imageinfo"][0]["extmetadata"]["DateTimeOriginal"]["value"]
        if (date) {
            appendTitleLine(a, date)
        }
    } catch (err) {
        console.error(err)
    }
    const license = res["query"]["pages"]["-1"]["imageinfo"][0]["extmetadata"]["LicenseShortName"]["value"]
    if (license) {
        appendTitleLine(a, license)
    }
}

function wikimediaMouseEnter(info) {
    try {
        const lat = info["query"]["pages"]["-1"]["imageinfo"][0]["extmetadata"]["GPSLatitude"]["value"]
        const lon = info["query"]["pages"]["-1"]["imageinfo"][0]["extmetadata"]["GPSLongitude"]["value"]

        showActiveNodeMarker(lat, lon, "#0022ff", true)
    } catch (err) {
        console.log(err)
    }
}

async function downloadWikimediaInfo(filename) {
    const response = (
        await externalFetchRetry({
            url:
                `https://commons.wikimedia.org/w/api.php?` +
                new URLSearchParams({
                    action: "query",
                    iiprop: "url|extmetadata",
                    iiurlwidth: "300",
                    prop: "imageinfo",
                    titles: filename,
                    format: "json",
                }).toString(),
            responseType: "json",
        })
    ).response
    const firstPage = Object.values(response?.query?.pages ?? {})?.[0]
    if (!firstPage) {
        return response
    }
    return { query: { pages: { "-1": firstPage } } }
}

async function downloadWikimediaCategoryInfo(categoryName, limit = 8) {
    return (
        await externalFetchRetry({
            url:
                `https://commons.wikimedia.org/w/api.php?` +
                new URLSearchParams({
                    action: "query",
                    list: "categorymembers",
                    cmtitle: categoryName,
                    cmtype: "file",
                    cmlimit: limit,
                    format: "json",
                }).toString(),
            responseType: "json",
        })
    ).response
}

function makeWikimediaCommonsValue(elem, isVersionPage) {
    if (!GM_config.get("ImagesAndLinksInTags")) return
    const items = isVersionPage ? elem.querySelectorAll('a[href^="https://commons.wikimedia.org/wiki/"]:not(.preview-img-link)') : [elem]
    items.forEach(a => {
        if (a.classList.contains("preview-img-link")) {
            return
        }
        a.classList.add("preview-img-link")
        setTimeout(async () => {
            for (let item of a.textContent.split(";")) {
                if (item.startsWith("Category:")) {
                    const categoryResponse = await downloadWikimediaCategoryInfo(item)
                    const fileTitles = categoryResponse?.query?.categorymembers?.map(file => file.title) ?? []
                    if (fileTitles.length === 0) {
                        return
                    }
                    const previewsWrap = document.createElement("div")
                    Object.assign(previewsWrap.style, {
                        display: "grid",
                        gridTemplateColumns: "repeat(1, 1fr)",
                        gap: "2px",
                    })
                    a.after(previewsWrap)
                    for (const fileTitle of fileTitles) {
                        const wikimediaResponse = await downloadWikimediaInfo(fileTitle)
                        const imageInfo = wikimediaResponse?.query?.pages?.["-1"]?.imageinfo?.[0]
                        if (!imageInfo?.thumburl) {
                            continue
                        }
                        const previewLink = document.createElement("a")
                        previewLink.href = `https://commons.wikimedia.org/wiki/${fileTitle.replaceAll(" ", "_")}`
                        previewLink.target = "_blank"
                        previewLink.rel = "noreferrer"
                        previewLink.classList.add("preview-img-link")
                        previewLink.style.display = "block"
                        const img = GM_addElement("img", {
                            src: imageInfo["thumburl"],
                            // crossorigin: "anonymous"
                        })
                        Object.assign(img.style, {
                            width: "100%",
                            aspectRatio: "1 / 1",
                            objectFit: "cover",
                        })
                        previewLink.appendChild(img)
                        previewsWrap.appendChild(previewLink)
                        attachWikimediaHoverCaptureHandler(previewLink, wikimediaResponse)
                    }
                    return
                }
                const wikimediaResponse = await downloadWikimediaInfo(item)
                const img = GM_addElement("img", {
                    src: wikimediaResponse["query"]["pages"]["-1"]["imageinfo"][0]["thumburl"],
                    // crossorigin: "anonymous"
                })
                img.style.width = "100%"
                a.appendChild(img)
                attachWikimediaHoverCaptureHandler(img, wikimediaResponse)
            }
        })
    })
}

//</editor-fold>
