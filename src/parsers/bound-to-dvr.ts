import { getExtInfDuration } from "../utils/hls-string"
import { possiblePlaylistTags } from "../utils/HlsTags"

export const boundToDvr = (manifestText: string, dvrWindowSeconds: number): string => {
    if (dvrWindowSeconds < 1) return manifestText

    const manifestLines = manifestText.split('\n')
    let secondsIntoWindowSoFar = 0
    let numFragsRemoved = 0
    let foundMediaSequenceValue = 0
    const dvrLines = manifestLines.slice().reverse().filter((line) => {
        const isHeaderTag = possiblePlaylistTags.find(tag => line.startsWith(tag))
        if (isHeaderTag) {
            if (line.startsWith('#EXT-X-MEDIA-SEQUENCE')) {
                foundMediaSequenceValue = Number(line.slice('#EXT-X-MEDIA-SEQUENCE:'.length)) || 0
                // add modified media sequence back later
                return false
            }
            return true
        }
        if (secondsIntoWindowSoFar >= dvrWindowSeconds) {
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