import { getExtInfDuration } from "../utils/hls-string"
import { possiblePlaylistTags } from "../utils/HlsTags"

export type Frag = {
    tagLines: string[]
    url: string
    duration: number
}

export type LevelManifest = {
    frags: Frag[]
    headerTagLines: string[]
    isLive: boolean
}

export const textToTypescript = (levelManifest: string): LevelManifest => {
    const frags: Frag[] = []
    const manifestHaderTagLines: string[] = []
    let currentFragHeaderTags: string[] = []
    let currentFragDuration = -1
    let isLive = true
    levelManifest.split('\n').forEach((line) => {
        if (line.startsWith('##') || !line) {
            // line is comment or blank
            if (frags.length || currentFragHeaderTags.length) {
                currentFragHeaderTags.push(line)
            } else {
                manifestHaderTagLines.push(line)
            }
        } else if (line.startsWith('#')) {
            // line is tag
            const isEndlist = line.startsWith('#EXT-X-ENDLIST')
            const isHeaderTag = possiblePlaylistTags.find(tag => line.startsWith(tag))
            if (isEndlist) {
                isLive = false
            } else if (isHeaderTag) {
                manifestHaderTagLines.push(line)
            } else {
                if (line.startsWith('#EXTINF:')) {
                    currentFragDuration = getExtInfDuration(line)
                }
                currentFragHeaderTags.push(line)
            }
        } else if (line) {
            // line is frag
            frags.push({
                tagLines: currentFragHeaderTags,
                url: line,
                duration: currentFragDuration
            })
            currentFragDuration = -1
            currentFragHeaderTags = []
        }
    })
    return {
        frags,
        headerTagLines: manifestHaderTagLines,
        isLive
    }

}