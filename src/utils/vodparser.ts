
export const vodAtTime = (vodManifest: string, time: number, remoteLevelUrl?: string) => {
    const liveLines = []
    const lines = vodManifest.split('\n')
    let pastManifestTime = 0
    let onNewFrag = true
    for (const line of lines) {
        if (line.startsWith('##') || !line.trim()) {
            // line is comment
            liveLines.push(line)
        } else if (line.startsWith('#')) {
            onNewFrag = false
            liveLines.push(line)
            if (line.indexOf('EXTINF:') > -1) {
                const durationRegex = /EXTINF\:(.+),/
                const match = durationRegex.exec(line)
                if (match && match[1]) {
                    pastManifestTime += Number(match[1])
                }
            }
        } else {
            if (remoteLevelUrl) {
                // convert to full url
                if (line.startsWith('http')) {
                    liveLines.push(line)
                } else {
                    const pathParts = remoteLevelUrl
                        .split('?')[0]
                        .split('/')
                        .slice(0, line.startsWith('/') ? 3 : -1)
                        .join('/')
                    const fullFragUrl = `${pathParts}/${line}`
                    liveLines.push(fullFragUrl)
                }
            } else {
                liveLines.push(line)
            }
            if (pastManifestTime > time) {
                break
            }
        }
    }
    // liveLines.splice(2, 0, '#EXT-X-PLAYLIST-TYPE:EVENT')
    return liveLines.join('\n')
}