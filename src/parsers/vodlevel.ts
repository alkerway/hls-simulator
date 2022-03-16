import { getExtInfDuration } from "../utils/hls-string"
import { possiblePlaylistTags } from "../utils/HlsTags"


export const vodToLive = (vodManifest: string, time: number, remoteLevelUrl: string, sessionId: string) => {
    const liveLines = []
    const lines = vodManifest.split('\n')
    let pastManifestTime = 0

    let fragCounter = 0
    let lineIdx = 0
    let stopAddingHeaderTags = false
    while (true) {
        const line = lines[lineIdx]
        if (line.startsWith('##')) {
            // line is comment
            liveLines.push(line)
        } else if (line.startsWith('#')) {
            const isEndlist = line.startsWith('#EXT-X-ENDLIST')
            const isHeaderTag = possiblePlaylistTags.find(tag => line.startsWith(tag))
            if (!isEndlist) {
                if (isHeaderTag) {
                    if (!stopAddingHeaderTags) {
                        liveLines.push(line)
                    }
                } else {
                    if (line.startsWith('#EXTINF:')) {
                        const duration = getExtInfDuration(line)
                        pastManifestTime += duration
                        if (pastManifestTime > time) {
                            // remove lines until we get to the last frag, then stop
                            let lastLine = liveLines[liveLines.length - 1]
                            while (lastLine?.startsWith('#') || lastLine?.trim() === '') {
                                lastLine = liveLines.pop()
                            }
                            break
                        }
                    }
                    liveLines.push(line)
                }
            }
        } else if (line.trim()) {
            if (remoteLevelUrl) {
                const lineBase = `frag_${fragCounter}.ts?sessionId=${sessionId}`
                fragCounter++
                // convert to full url
                if (line.startsWith('http')) {
                    liveLines.push(`${lineBase}&url=${line}`)
                } else {
                    const pathParts = remoteLevelUrl
                        .split('?')[0]
                        .split('/')
                        .slice(0, line.startsWith('/') ? 3 : -1)
                        .join('/')
                    const fullFragUrl = `${pathParts}/${line}`
                    liveLines.push(`${lineBase}&url=${fullFragUrl}`)
                }
            } else {
                liveLines.push(line)
            }
        }
        lineIdx = (lineIdx + 1) % lines.length
        if (lineIdx === 0 && fragCounter !== 0) {
            liveLines.push('#EXT-X-DISCONTINUITY ')
            stopAddingHeaderTags = true
        }
    }
    return liveLines.join('\n') + '\n'
}