function yetAnotherWizard(s) {
    // const [k, v] = s.split("=")
    if (!s) return 'nwr[""];'
    if (s === "*") return "nwr;"
    if (s[0] === "~" && !s.slice(1).includes("~")) {
        if (!s.includes('"') && s.includes("|")) {
            return `nwr[~"${s.slice(1)}"~".*"];`
        }
        return `nwr[${s}~".*"];`
    } else if (s[0] === "[") {
        return `nwr${s};`
    } else if (s.match(/^(node|way|rel|nwr|nw|nr|wr)/)) {
        return `${s}` + (s.slice(-1) === ";" ? "" : ";")
    } else {
        // name ~ пятёрочка, i
        // https://github.com/drolbr/Overpass-API/issues/751
        const kv_match = s.match(
            /^(?<prefix>[~!]?)(?<key>[a-zA-Z0-9_\p{L}^$:.*+]+)\s*(?<op>(=|~|!=|!~))\s*(?<value>[a-zA-Z0-9_\p{L}^$.*+]+)(?<suffix>\s*,\s*i)?$/u,
        )?.groups
        if (kv_match) {
            return `nwr[${kv_match["prefix"] ?? ""}"${kv_match["key"]}"${kv_match["op"]}"${kv_match["value"]}"${kv_match["suffix"] ?? ""}];`
        } else {
            if (s.match(/^[a-zA-Z0-9_:.]+$/)) {
                return `nwr["${s}"];`
            } else {
                if (s.match(/^[a-zA-Z0-9_:.|]+$/)) {
                    return (
                        "(\n" +
                        s
                            .split("|")
                            .map(k => `nwr["${k}"];`)
                            .join("\n") +
                        ");"
                    )
                }
                return `nwr[${s}];`
            }
        }
    }
}

function buildOverpassSearchQuery(query, bound, date = "", raw = false) {
    query = query.trim()
    if (raw) return query
    const bboxString = [
        bound.getSouthWest().wrap().lat,
        bound.getSouthWest().wrap().lng,
        bound.getNorthEast().wrap().lat,
        bound.getNorthEast().wrap().lng,
    ].map(coordinate => coordinate.toFixed(7))
    const bboxExpr = query.endsWith("!") ? "" : "[bbox:" + bboxString + "]"
    if (query.endsWith("!")) query = query.slice(0, -1)
    query = query.replace("{{bbox}}", bboxString.join(","))
    const dateExpr = date ? `[date:"${date}T00:00:00Z"]` : ""
    return `${dateExpr}[out:xml][maxsize:64Mi]${bboxExpr};
${yetAnotherWizard(query)}
//(._;>;);
out geom;
`
}
