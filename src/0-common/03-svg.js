//<editor-fold desc="svg" defaultstate="collapsed">

// prettier-ignore
const filterIconSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-funnel-icon lucide-funnel">' +
    '<path d="M 10 20 a 1 1 0 0 0 0.553 0.895 l 2 1 A 1 1 0 0 0 14 21 v -8 a 2 3 0 0 1 1 -2 L 21.74 4.67 A 1 1 0 0 0 21 3 H 3 a 1 1 0 0 0 -0.742 1.67 l 6.742 6.33 A 2 3 0 0 1 10 13 z"/>' +
    '</svg>'

// prettier-ignore
const tagSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="0.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-tag-icon lucide-tag">' +
    '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/>' +
    '<circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>' +
    '</svg>'

const osmchaLikeSvg =
    "data:image/svg+xml;base64," +
    btoa(
        '<svg width="100" height="99" viewBox="0 0 100 99" xmlns="http://www.w3.org/2000/svg">' +
            '<g fill="#39DBC0" fill-rule="evenodd">' +
            '<path d="M41.817 42H8.65a8 8 0 0 0-7.862 9.483l6.981 37A8 8 0 0 0 15.632 95H92a8 8 0 0 0 ' +
            "8-8V50a8 8 0 0 0-8-8H64.814c.034-.66.012-1.334-.072-2.013L61.086 10.21C60.312 3.906 " +
            '54.574-.576 48.27.198c-6.303.774-10.786 6.511-10.012 12.815z" fill-opacity=".3"/>' +
            '<rect fill-opacity=".9" x="76" y="37" width="24" height="62" rx="8"/></g></svg>',
    )

// todo is equal with rotate and color
const osmchaDislikeSvg =
    "data:image/svg+xml;base64," +
    btoa(
        '<svg width="100" height="99" viewBox="0 0 100 99" xmlns="http://www.w3.org/2000/svg">' +
            '<g transform="rotate(-180 50 49.5)" fill="#CC2C47" fill-rule="evenodd">' +
            '<path d="M41.817 42H8.65a8 8 0 0 0-7.862 9.483l6.981 37A8 8 0 0 0 15.632 95H92a8 8 0 0 0 ' +
            "8-8V50a8 8 0 0 0-8-8H64.814c.034-.66.012-1.334-.072-2.013L61.086 10.21C60.312 3.906 " +
            '54.574-.576 48.27.198c-6.303.774-10.786 6.511-10.012 12.815z" fill-opacity=".3"/>' +
            '<rect fill-opacity=".9" x="76" y="37" width="24" height="62" rx="8"/></g></svg>',
    )

const osmchaSvgLogo =
    '<svg viewBox="2.5 2.5 13 13" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M2.5 2.5l1 4-1 2 1 3-1 3h1l4-4c-.6-.8-1-1.9-1-3 0-1.9 1.1-3.5 2.6-4.4l-.6-.6-3 1-3-1zM15 11c-.9.9-2.2 1.5-3.5 1.5-1.1 0-2.2-.4-3-1l-4 4h2l2-1 2 1 4-1 1-3-.5-.5z"></path>' +
    '<path d="M15 7.5c0 1.9-1.6 3.5-3.5 3.5S8 9.4 8 7.5 9.6 4 11.5 4 15 5.6 15 7.5"></path></svg>'

// prettier-ignore
const commentSvg =
    '<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">' +
    '<path d="M2.678 11.894a1 1 0 0 1 .287.801 11 11 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 ' +
    '.71-.074A8 8 0 0 0 8 14c3.996 0 7-2.807 7-6s-3.004-6-7-6-7 2.808-7 6c0 1.468.617 2.83 1.678 3.894m-.493 ' +
    '3.905a22 22 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a10 10 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 ' +
    '11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105">' +
    '</path>' +
    "</svg>"

// prettier-ignore
const diffSvg =
    '<svg class="lucide lucide-diff better-diff-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" ' +
    'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M12 3v14"/><path d="M5 10h14"/>' +
    '<path d="M5 21h14"/>' +
    '</svg>'

// prettier-ignore
const fitToObjectSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">\n' +
    '  <path d="M3 7V3H7" stroke-width="2" stroke-linecap="round"/>\n' +
    '  <path d="M17 3H21V7" stroke-width="2" stroke-linecap="round"/>\n' +
    '  <path d="M21 17V21H17" stroke-width="2" stroke-linecap="round"/>\n' +
    '  <path d="M7 21H3V17" stroke-width="2" stroke-linecap="round"/>\n' + "</svg>\n"

// prettier-ignore
const externalLinkSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" ' +
    'class="lucide lucide-external-link-icon lucide-external-link" width="16" height="16">' +
    '<path d="M15 3h6v6"></path><path d="M10 14 21 3"></path>' +
    '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>' +
    '</svg>'

// prettier-ignore
const pencilLinkSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" ' +
    'stroke-linejoin="round" class="lucide lucide-pencil-icon lucide-pencil">' +
    '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>' +
    '<path d="m15 5 4 4"/>' +
    '</svg>'

// prettier-ignore
const compactModeSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" height="17" width="17" viewBox="0 0 17 17">' +
    '<path d="M15 12 l-5-4  5-4"></path><path d="M2 12 l 5-4 -5-4"></path>' +
    '</svg>'

// prettier-ignore
const expandModeSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" height="17" width="17" viewBox="0 0 17 17">' +
    '<path d="M7 12 l-5-4  5-4"></path>' +
    '<path d="M10 12 l 5-4 -5-4"></path>' +
    '</svg>'

// prettier-ignore
const copyBtnSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" ' +
    'class="lucide lucide-file-icon lucide-file">' +
    '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>' +
    '<path d="M14 2v4a2 2 0 0 0 2 2h4"/>' +
    '</svg>'

// TODO without encode
const nodeIcon =
    "data:image/svg+xml;base64," +
    btoa(
        '<svg xmlns="http://www.w3.org/2000/svg" height="256" width="256">' +
            '<rect width="242" height="242" fill="#fff" ry="32" x="7" y="7"/>' +
            '<circle cx="128" cy="128" r="24" fill="#bee6be" stroke="#000" stroke-width="10"/>' +
            '<rect width="242" height="242" stroke="#000" fill="none" stroke-width="12" ry="32" x="7" y="7"/></svg>',
    )

const wayIcon =
    "data:image/svg+xml;base64," +
    btoa(
        '<svg xmlns="http://www.w3.org/2000/svg" height="256" width="256">' +
            '<rect width="242" height="242" fill="#fff" ry="32" x="7" y="7"/>' +
            '<path stroke="#ccc" fill="none" stroke-width="16" d="M169 58 57 145l138 54"/>' +
            '<circle cx="169" cy="58" r="24"/>' +
            '<circle cx="57" cy="145" r="24"/>' +
            '<circle cx="195" cy="199" r="24"/>' +
            '<rect width="242" height="242" stroke="#000" fill="none" stroke-width="12" ry="32" x="7" y="7"/></svg>',
    )

const relationIcon =
    "data:image/svg+xml;base64," +
    btoa(
        '<svg xmlns="http://www.w3.org/2000/svg" height="256" width="256" viewBox="0 0 256 256">' +
            '<rect width="242" height="242" stroke="#000" fill="#f0f0f0" stroke-width="12" ry="32" x="7" y="7"/>' +
            '<path d="m68 68 128-6M68 68l128 74M68 68l-6 128" stroke-width="16" stroke="#ccc"/>' +
            '<circle cx="196" cy="62" r="24"/><circle cx="196" cy="142" r="24"/>' +
            '<circle cx="62" cy="196" r="24"/>' +
            '<path d="m68 68 74 128" stroke-width="16" stroke="#ccc"/>' +
            '<circle cx="142" cy="196" r="24"/>' +
            '<circle cx="72" cy="72" r="32" fill="#bee6be" stroke="#000" stroke-width="8"/></svg>',
    )

//</editor-fold>
