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

    let a = arg_a.map(i => JSON.stringify(i))
    let b = arg_b.map(i => JSON.stringify(i))
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
                const replace_role_cost =
                    dp[i - 1][j - 1] +
                    (!(arg_a[i - 1].type === arg_b[j - 1].type && arg_a[i - 1].ref === arg_b[j - 1].ref) ||
                        arg_a[i - 1].role === arg_b[j - 1].role) *
                        one_replace_cost
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
            replace_cost = min(
                replace_cost,
                dp[i - 1][j - 1] +
                    (!(a[i - 1].type === b[j - 1].type && a[i - 1].ref === b[j - 1].ref) || a[i - 1].role === b[j - 1].role) *
                        one_replace_cost,
            )
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
    const result = answer.toReversed()
    if (isRelation) {
        return result
    }

    function insideArray(i) {
        return i >= 0 && i < result.length
    }

    let step = -1

    for (let iter = 0; iter < 2; iter++) {
        step *= -1
        for (let i = step > 0 ? 0 : result.length - 1; step > 0 ? i < result.length : i >= 0; i += step) {
            if (result[i][0] === result[i][1]) {
                continue
            }
            if (result[i][0] !== null && result[i][1] !== null) {
                continue
            }
            const a_or_b = result[i][0] === null ? 0 : 1
            const opposite = 1 - a_or_b
            let j = i
            let was_merged = false
            while (true) {
                while (insideArray(j) && result[j][a_or_b] === null) {
                    j += step
                }
                if (!insideArray(j)) {
                    break
                }

                let try_i = i
                let try_j = j
                while (
                    insideArray(try_j) &&
                    result[try_i][opposite] === result[try_j][opposite] &&
                    result[try_j][a_or_b] === result[try_j][opposite]
                ) {
                    try_i += step
                    try_j += step
                }
                if (!insideArray(try_j) || result[try_j][a_or_b] === null) {
                    was_merged = true
                    while (insideArray(j) && result[i][opposite] === result[j][opposite] && result[j][a_or_b] === result[j][opposite]) {
                        result[i][a_or_b] = result[j][a_or_b]
                        result[j][a_or_b] = null
                        i += step
                        j += step
                    }
                } else {
                    break
                }
            }
            i = j - step
        }
    }
    return result
}

/**
 * @param {string} a
 * @param {string} b
 * @param {number} one_replace_cost
 * @return {[string,string][]}
 */
function stringsDiff(a, b, one_replace_cost = 2) {
    return arraysDiff(Array.from(a), Array.from(b), one_replace_cost)
}

//</editor-fold>
