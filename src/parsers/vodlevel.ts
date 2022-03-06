import { possiblePlaylistTags } from "../utils/HlsTags"

const getExtInfDuration = (infLine: string): number => {
    const durationRegex = /EXTINF\:(.+),/
    const match = durationRegex.exec(infLine)
    if (match && match[1]) {
        return Number(match[1])
    }
    return 0
}

export const vodAtTime = (vodManifest: string, time: number, remoteLevelUrl: string, dvrWindowSeconds: number, sessionId: string) => {
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
    if (typeof dvrWindowSeconds ==='number' && dvrWindowSeconds > 0) {
        let secondsIntoWindowSoFar = 0
        let numFragsRemoved = 0
        let foundMediaSequenceValue = 0
        const dvrLines = liveLines.slice().reverse().filter((line) => {
            const isHeaderTag = possiblePlaylistTags.find(tag => line.startsWith(tag))
            if (isHeaderTag) {
                if (line.startsWith('#EXT-X-MEDIA-SEQUENCE')) {
                    foundMediaSequenceValue = Number(line.slice('#EXT-X-MEDIA-SEQUENCE:'.length)) || 0
                    // add modified media sequence back later
                    return false
                }
                return true
            }
            if (secondsIntoWindowSoFar > dvrWindowSeconds) {
                if (line.trim() && !line.startsWith('#')) {
                    numFragsRemoved += 1
                }
                return false
            }
            if (line.startsWith('#EXTINF:')) {
                const duration = getExtInfDuration(line)
                secondsIntoWindowSoFar += duration
            }
            return true
        })
        dvrLines.reverse()
        const newMediaSequence = `#EXT-X-MEDIA-SEQUENCE:${foundMediaSequenceValue + numFragsRemoved}`
        dvrLines.splice(2, 0, newMediaSequence)
        return dvrLines.join('\n') + '\n'
    }
    return liveLines.join('\n') + '\n'
}