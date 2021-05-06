
export const vodAtTime = (vodManifest: string, time: number) => {
    const liveLines = []
    const lines = vodManifest.split('\n')
    let pastManifestTime = 0
    let onNewFrag = true
    for (const line of lines) {
        if (line.startsWith('##')) {
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
            liveLines.push(line)
            if (pastManifestTime > time) {
                break
            }
        }
    }
    return liveLines.join('\n')
}