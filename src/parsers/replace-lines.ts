export const replaceManifestUrls = (originalManifest: string,
    remoteUrl: string,
    isMaster: boolean,
    sessionId: string,
    dvrWindowSeconds: number,
    keepVod: boolean): string => {

    let urlCounter = 0
    const originalLines = originalManifest.split('\n')
    const newLines = originalLines.map((line) => {
        if (!line.startsWith('#') && line.length) {
            let urlLine = isMaster ? 'level' : 'frag'
            urlLine = `${urlLine}_${urlCounter}?sessionId=${sessionId}`
            if (isMaster && dvrWindowSeconds > 0) {
                urlLine = `${urlLine}&dvrWindowSeconds=${dvrWindowSeconds}`
            }
            if (isMaster && keepVod) {
                urlLine = `${urlLine}&keepVod=true`
            }
            if (line.startsWith('http')) {
                 urlLine = `${urlLine}&url=${line}`
            } else  {
                const pathParts = remoteUrl
                    .split('?')[0]
                    .split('/')
                    .slice(0, line.startsWith('/') ? 3 : -1)
                    .join('/')
                const fullLevelUrl = `${pathParts}/${line}`
                urlLine = `${urlLine}&url=${fullLevelUrl}`
            }
            urlCounter = urlCounter + 1
            return urlLine
        }
        return line
    })
    return newLines.join('\n')
}