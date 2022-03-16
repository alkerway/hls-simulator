export const getExtInfDuration = (infLine: string): number => {
    const durationRegex = /EXTINF\:(.+),/
    const match = durationRegex.exec(infLine)
    if (match && match[1]) {
        return Number(match[1])
    }
    return 0
}