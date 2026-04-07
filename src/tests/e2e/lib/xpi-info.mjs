import fs from "node:fs/promises"
import zlib from "node:zlib"

/**
 * Finds end-of-central-directory offset in ZIP buffer.
 * @param {Buffer} buffer
 * @returns {number}
 */
function findZipEocdOffset(buffer) {
    const minLen = 22
    if (!Buffer.isBuffer(buffer) || buffer.length < minLen) {
        return -1
    }

    const signature = 0x06054b50
    const maxCommentLen = 0xffff
    const start = Math.max(0, buffer.length - (minLen + maxCommentLen))

    for (let offset = buffer.length - minLen; offset >= start; offset -= 1) {
        if (buffer.readUInt32LE(offset) === signature) {
            return offset
        }
    }
    return -1
}

/**
 * Reads UTF-8 text content of specific ZIP entry.
 * @param {Buffer} zipBuffer
 * @param {string} requestedName
 * @returns {string|null}
 */
function readZipEntryUtf8(zipBuffer, requestedName) {
    const eocdOffset = findZipEocdOffset(zipBuffer)
    if (eocdOffset === -1) {
        return null
    }

    const centralDirSize = zipBuffer.readUInt32LE(eocdOffset + 12)
    const centralDirOffset = zipBuffer.readUInt32LE(eocdOffset + 16)
    const centralDirEnd = centralDirOffset + centralDirSize
    const centralSignature = 0x02014b50
    const localSignature = 0x04034b50

    let ptr = centralDirOffset
    while (ptr < centralDirEnd) {
        if (zipBuffer.readUInt32LE(ptr) !== centralSignature) {
            break
        }

        const compressionMethod = zipBuffer.readUInt16LE(ptr + 10)
        const compressedSize = zipBuffer.readUInt32LE(ptr + 20)
        const fileNameLen = zipBuffer.readUInt16LE(ptr + 28)
        const extraLen = zipBuffer.readUInt16LE(ptr + 30)
        const commentLen = zipBuffer.readUInt16LE(ptr + 32)
        const localHeaderOffset = zipBuffer.readUInt32LE(ptr + 42)
        const fileName = zipBuffer.subarray(ptr + 46, ptr + 46 + fileNameLen).toString("utf8")
        const isRequested = fileName === requestedName || fileName.endsWith(`/${requestedName}`)

        if (isRequested) {
            if (zipBuffer.readUInt32LE(localHeaderOffset) !== localSignature) {
                return null
            }

            const localNameLen = zipBuffer.readUInt16LE(localHeaderOffset + 26)
            const localExtraLen = zipBuffer.readUInt16LE(localHeaderOffset + 28)
            const dataStart = localHeaderOffset + 30 + localNameLen + localExtraLen
            const compressedData = zipBuffer.subarray(dataStart, dataStart + compressedSize)

            if (compressionMethod === 0) {
                return compressedData.toString("utf8")
            }
            if (compressionMethod === 8) {
                return zlib.inflateRawSync(compressedData).toString("utf8")
            }
            return null
        }

        ptr += 46 + fileNameLen + extraLen + commentLen
    }

    return null
}

/**
 * Reads extension name/version from manager XPI manifest.
 * @param {string} xpiPath
 * @returns {Promise<{name: string|null, version: string|null}|null>}
 */
export async function readManagerXpiInfo(xpiPath) {
    try {
        const zipBuffer = await fs.readFile(xpiPath)
        const manifestText = readZipEntryUtf8(zipBuffer, "manifest.json")
        if (!manifestText) {
            return null
        }

        const manifest = JSON.parse(manifestText)
        const info = {
            name: typeof manifest?.name === "string" ? manifest.name : null,
            version: typeof manifest?.version === "string" ? manifest.version : null,
        }
        return info
    } catch {
        return null
    }
}
