// ==UserScript==
// @name         OSM Better Changeset Preview
// @namespace    http://tampermonkey.net/
// @version      2.9
// @description  Persistent iframe preview for /changeset/, /node/, /way/, /relation/, /wiki/ links on openstreetmap.org, skipping /api/, with layout cleanup for ?better-preview=1 in iframe context. Caches iframes, preloads next hovered link (not current), logs loading, and doesn't block link access or hover targets.
// @author       You
// @match        https://www.openstreetmap.org/*
// @grant        GM_addElement
// ==/UserScript==
/* global GM_addElement */

(function () {
    if (location.search.includes("better-preview=1")) {
        document.querySelector("header")?.style?.setProperty('display', 'none', 'important');
        document.querySelector("#content")?.style?.setProperty('top', '0px', 'important');
    }

    GM_addElement('style', {
        textContent: `
            .link-preview-frame {
                position: fixed;
                height: 100vh;
                z-index: 99999;
                display: none;
                background: white;
                box-shadow: 0 0 10px rgba(0,0,0,0.5);
                pointer-events: auto;
            }
        `
    });

    const iframes = new Map();
    let currentHref = null;
    let fixedLeft = null;

    function addParamForIframe(href) {
        const url = new URL(href, window.location.href);
        url.searchParams.set("better-preview", "1");
        return url.toString();
    }

    function isPreviewableLink(href) {
        return !href.includes('/api/');
    }

    function showIframeForLink(a) {
        const originalHref = a.href;
        if (!isPreviewableLink(originalHref)) return;

        const previewHref = addParamForIframe(originalHref);

        let iframe = iframes.get(originalHref);
        if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.className = 'link-preview-frame';
            iframe.style.display = 'none';

            iframe.addEventListener('load', () => {
                console.log("[preview] Finished:", previewHref);
                if (iframe.dataset.shouldShow === 'true') {
                    iframe.style.display = 'block';
                }
            });

            console.log("[preview] Starting:", previewHref);
            document.body.appendChild(iframe);
            iframes.set(originalHref, iframe);
        }

        for (const [key, frame] of iframes.entries()) {
            if (key !== originalHref) {
                frame.style.display = 'none';
                frame.dataset.shouldShow = 'false';
            }
        }

        const rect = a.getBoundingClientRect();
        const linkRightEdge = rect.right;

        if (fixedLeft === null) {
            fixedLeft = Math.max(450, linkRightEdge);
        }

        iframe.style.left = `${fixedLeft}px`;
        iframe.style.width = `${Math.max(300, window.innerWidth - fixedLeft)}px`;
        iframe.dataset.shouldShow = 'true';

        if (iframe.src !== previewHref) {
            iframe.style.display = 'none';
            iframe.src = previewHref;
        } else {
            iframe.style.display = 'block';
        }

        currentHref = originalHref;
    }

    const linksSelector = 'a[href*="/changeset/"], a[href*="/node/"], a[href*="/way/"], a[href*="/relation/"], a[href*="/wiki/"]';
    document.addEventListener('mouseover', (e) => {
        if (!e.altKey) return
        const a = e.target.closest(linksSelector);
        if (!a || !isPreviewableLink(a.href)) return;

        if (currentHref !== a.href) {
            showIframeForLink(a);
        }
    });

    document.addEventListener('click', (e) => {
        const clickedLink = e.target.closest(linksSelector);
        const clickedIframe = [...iframes.values()].some(frame => frame === e.target || frame.contains(e.target));

        if (!clickedLink && !clickedIframe) {
            for (const iframe of iframes.values()) {
                iframe.style.display = 'none';
                iframe.dataset.shouldShow = 'false';
            }
            currentHref = null;
        }
    });
})();
