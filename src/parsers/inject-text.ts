import { getExtInfDuration } from "../utils/hls-string";
import { CustomText } from "../sessions/session-state";
import { possibleFragTags } from "../utils/HlsTags";

const getEmptyInfo = (): {tags: string[], duration: number, url: string, startTime: number} => {
    return Object.assign({}, {
        tags: [],
        duration: 0,
        url: '',
        startTime: 0
    })
}

export const injectText = (manifestText: string, newText: CustomText): string => {
    let currentManifestTime = 0
    let amountInjectedTextIsAhead = 0
    let idx = 0

    const unmodManifestLines = manifestText.split('\n')
    const modManifestLines: string[] = []
    const injectLines = newText.text.split('\n')
    const injectStartMin = newText.startTime
    let hasInjected = false

    let curFragInfo = getEmptyInfo()

    while (true) {
        const line = unmodManifestLines[idx]
        if (line === undefined) break

        if (line.startsWith('##') || !line.trim()) {
            curFragInfo.tags.push(line)
        } else if (line.startsWith('#')) {
            if (possibleFragTags.find(tag => line.startsWith(tag))) {
                if (line.startsWith('#EXTINF')) {
                    const fragDuration = getExtInfDuration(line)
                    curFragInfo.duration = fragDuration
                    curFragInfo.startTime = currentManifestTime
                    currentManifestTime += fragDuration
                }
                curFragInfo.tags.push(line)
            } else {
                // header tag
                modManifestLines.push(line)
            }
        } else {
            curFragInfo.url = line


            console.log('should insert frag', amountInjectedTextIsAhead, curFragInfo.duration)
            if (amountInjectedTextIsAhead > curFragInfo.duration) {
                // skip the frag, adjust text is ahead time
                amountInjectedTextIsAhead -= curFragInfo.duration
            } else {
                if (amountInjectedTextIsAhead > 0) {
                    modManifestLines.push('#EXT-X-DISCONTINUITY')
                }
                // insert original manifest frag
                curFragInfo.tags.forEach((tag) => modManifestLines.push(tag))
                modManifestLines.push(curFragInfo.url)

                amountInjectedTextIsAhead = 0
            }

            console.log('parsing url line', line)
            if (currentManifestTime >= injectStartMin && !hasInjected) {
                let injectFragInfo = getEmptyInfo()
                for (const injectLine of injectLines) {
                    if (injectLine.startsWith('##') || !injectLine.trim()) {
                        if (!injectLine.trim()) {
                            injectFragInfo.tags.push(injectLine)
                        }
                    } else if (injectLine.startsWith('#')) {
                        if (possibleFragTags.find(tag => injectLine.startsWith(tag))) {
                            if (injectLine.startsWith('#EXTINF')) {
                                const fragDuration = getExtInfDuration(injectLine)
                                injectFragInfo.startTime = currentManifestTime + amountInjectedTextIsAhead
                                amountInjectedTextIsAhead += fragDuration
                            }
                            injectFragInfo.tags.push(injectLine)
                        }
                    } else {
                        injectFragInfo.url = injectLine
                        // frag url
                        console.log('pushing tags', injectFragInfo.tags)
                        if (!hasInjected) {
                            modManifestLines.push('#EXT-X-DISCONTINUITY')
                        }
                        injectFragInfo.tags.forEach((tag) => modManifestLines.push(tag))
                        modManifestLines.push(injectFragInfo.url)
                        hasInjected = true

                        injectFragInfo = getEmptyInfo()
                    }
                }
            }


            curFragInfo = getEmptyInfo()
            // fragment, if og duration is > start time
            // start injecting until injectDuration is max but less than next frag duration + og duration
            // if live request, store media sequence on next live manifest request and use that.
        }

        idx += 1
    }
    return modManifestLines.join('\n') + '\n'
}