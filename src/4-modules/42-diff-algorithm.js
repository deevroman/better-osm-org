//<editor-fold desc="diff-algorithm" defaultstate="collapsed">

/**
 * Get editorial prescription via modified Levenshtein distance finding algorithm
 * @template T
 * @param {T[]} arg_a
 * @param {T[]} arg_b
 * @param {number} one_replace_cost
 * @return {[T, T][]}
 */
function arraysDiff(arg_a, arg_b, one_replace_cost = 2) {
    const isRelation = arg_a.length && Object.prototype.hasOwnProperty.call(arg_a[0], "role")

    const groupedPairStarters = new Set([" ", ";"])

    const tokenizeCharArray = arr => {
        const tokens = []
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] === "h") {
                const matchedPrefixToken = ["https://", "http://"].find(token => i + token.length <= arr.length && arr.slice(i, i + token.length).join("") === token)
                if (matchedPrefixToken) {
                    tokens.push(matchedPrefixToken)
                    i += matchedPrefixToken.length - 1
                    continue
                }
            }
            if (i + 1 < arr.length && groupedPairStarters.has(arr[i]) && arr[i] === arr[i + 1]) {
                tokens.push(arr[i] + arr[i + 1])
                i += 1
                continue
            }
            tokens.push(arr[i])
        }
        return tokens
    }
    const detokenizeDiff = diff => {
        if (isRelation) {
            return diff
        }
        const expanded = []
        for (const pair of diff) {
            const left = pair[0]
            const right = pair[1]
            if (left === null && typeof right === "string" && right.length > 1) {
                for (const ch of Array.from(right)) {
                    expanded.push([null, ch])
                }
                continue
            }
            if (right === null && typeof left === "string" && left.length > 1) {
                for (const ch of Array.from(left)) {
                    expanded.push([ch, null])
                }
                continue
            }
            if (typeof left === "string" && typeof right === "string" && (left.length > 1 || right.length > 1)) {
                const leftChars = Array.from(left)
                const rightChars = Array.from(right)
                const maxLen = Math.max(leftChars.length, rightChars.length)
                for (let k = 0; k < maxLen; k++) {
                    expanded.push([leftChars[k] ?? null, rightChars[k] ?? null])
                }
                continue
            }
            expanded.push(pair)
        }
        return expanded
    }

    let a = (isRelation ? arg_a : tokenizeCharArray(arg_a)).map(i => JSON.stringify(i))
    let b = (isRelation ? arg_b : tokenizeCharArray(arg_b)).map(i => JSON.stringify(i))
    const dp = []
    for (let i = 0; i < a.length + 1; i++) {
        dp[i] = new Uint32Array(b.length + 1)
    }

    for (let i = 0; i <= a.length; i++) {
        dp[i][0] = i
    }

    for (let i = 0; i <= b.length; i++) {
        dp[0][i] = i
    }

    const min = Math.min // fuck Tampermonkey
    // for some fucking reason every math.min call goes through TM wrapper code
    // that is not optimized by the JIT compiler
    if (isRelation) {
        for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
                const del_cost = dp[i - 1][j]
                const ins_cost = dp[i][j - 1]
                const replace_cost = dp[i - 1][j - 1] + (a[i - 1] !== b[j - 1]) * one_replace_cost // replacement is not very desirable
                const replace_role_cost = dp[i - 1][j - 1] + (!(arg_a[i - 1].type === arg_b[j - 1].type && arg_a[i - 1].ref === arg_b[j - 1].ref) || arg_a[i - 1].role === arg_b[j - 1].role) * one_replace_cost
                dp[i][j] = min(min(del_cost, ins_cost) + 1, min(replace_cost, replace_role_cost))
            }
        }
    } else {
        for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
                const del_cost = dp[i - 1][j]
                const ins_cost = dp[i][j - 1]
                const replace_cost = dp[i - 1][j - 1] + (a[i - 1] !== b[j - 1]) * one_replace_cost // replacement is not very desirable
                dp[i][j] = min(min(del_cost, ins_cost) + 1, replace_cost)
            }
        }
    }

    a = a.map(i => JSON.parse(i))
    b = b.map(i => JSON.parse(i))

    const answer = []
    let i = a.length
    let j = b.length

    while (true) {
        if (i === 0 || j === 0) {
            if (i === 0 && j === 0) {
                break
            } else if (i === 0) {
                answer.push([null, b[j - 1]])
                j = j - 1
                continue
            } else {
                answer.push([a[i - 1], null])
                i = i - 1
                continue
            }
        }

        const del_cost = dp[i - 1][j]
        const ins_cost = dp[i][j - 1]
        let replace_cost = dp[i - 1][j - 1] + (JSON.stringify(a[i - 1]) !== JSON.stringify(b[j - 1])) * one_replace_cost
        if (isRelation) {
            replace_cost = min(replace_cost, dp[i - 1][j - 1] + (!(a[i - 1].type === b[j - 1].type && a[i - 1].ref === b[j - 1].ref) || a[i - 1].role === b[j - 1].role) * one_replace_cost)
        }

        if (del_cost <= ins_cost && del_cost + 1 <= replace_cost) {
            answer.push([a[i - 1], null])
            i = i - 1
        } else if (ins_cost <= del_cost && ins_cost + 1 <= replace_cost) {
            answer.push([null, b[j - 1]])
            j = j - 1
        } else {
            answer.push([a[i - 1], b[j - 1]])
            i = i - 1
            j = j - 1
        }
    }
    return detokenizeDiff(answer.toReversed())
}

//</editor-fold>
