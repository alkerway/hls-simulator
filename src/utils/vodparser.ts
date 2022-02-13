import { possiblePlaylistTags } from "./HlsTags"

export const vodAtTime = (vodManifest: string, time: number, remoteLevelUrl?: string) => {
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
                        const durationRegex = /EXTINF\:(.+),/
                        const match = durationRegex.exec(line)
                        if (match && match[1]) {
                            pastManifestTime += Number(match[1])
                            if (pastManifestTime > time) {
                                break
                            }
                        }
                    }
                    liveLines.push(line)
                }
            }
        } else if (line.trim()) {
            if (remoteLevelUrl) {
                const lineBase = `frag_${fragCounter}.ts`
                fragCounter++
                // convert to full url
                if (line.startsWith('http')) {
                    liveLines.push(`${lineBase}?url=${line}`)
                } else {
                    const pathParts = remoteLevelUrl
                        .split('?')[0]
                        .split('/')
                        .slice(0, line.startsWith('/') ? 3 : -1)
                        .join('/')
                    const fullFragUrl = `${pathParts}/${line}`
                    liveLines.push(`${lineBase}?url=${fullFragUrl}`)
                }
            } else {
                liveLines.push(line)
            }
        }
        lineIdx = (lineIdx + 1) % lines.length
        if (lineIdx === 0 && fragCounter !== 0) {
            // TODO if (notRollingDvr option) break else add endlist
            liveLines.push('#EXT-X-DISCONTINUITY ')
            stopAddingHeaderTags = true
        }
    }
    // liveLines.splice(2, 0, '#EXT-X-PLAYLIST-TYPE:EVENT')
    return liveLines.join('\n') + '\n'
}