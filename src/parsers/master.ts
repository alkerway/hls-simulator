export const rewriteMaster = (originalManifest: string, remoteUrl: string, sessionId: string, dvrWindowSeconds: number): string => {
    let levelCounter = 1
    const originalLines = originalManifest.split('\n')
    const newLines = originalLines.map((line) => {
        if (!line.startsWith('#') && line.length) {
            let levelLine = `/remote/level?sessionId=${sessionId}`
            if (dvrWindowSeconds > 0) {
                levelLine = `${levelLine}&dvrWindowSeconds=${dvrWindowSeconds}`
            }
            if (line.startsWith('http')) {
                 levelLine = `${levelLine}&url=${line}`
            } else  {
                const pathParts = remoteUrl
                    .split('?')[0]
                    .split('/')
                    .slice(0, line.startsWith('/') ? 3 : -1)
                    .join('/')
                const fullLevelUrl = `${pathParts}/${line}`
                levelLine = `${levelLine}&url=${fullLevelUrl}`
            }
            levelCounter = levelCounter + 1
            return levelLine
        }
        return line
    })
    return newLines.join('\n')
}