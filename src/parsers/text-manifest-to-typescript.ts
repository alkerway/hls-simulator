import { getExtInfDuration, pdtTagToUnix } from '../utils/hls-string'
import { possiblePlaylistTags, Tags } from '../utils/HlsTags'

export type Frag = {
  tagLines: string[]
  url: string
  impliedKeyLine: string | null
  impliedPDTLine: string | null
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
  let currentKeyLine: string | null = null // '#EXT-X-KEY:METHOD=NONE'
  let lastPdtUnix: number | null = null
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
      const isEndlist = line.isTag(Tags.End)
      const isHeaderTag = possiblePlaylistTags.find((tag) => line.startsWith(tag))
      if (isEndlist) {
        isLive = false
      } else if (isHeaderTag) {
        manifestHaderTagLines.push(line)
      } else {
        if (line.isTag(Tags.Inf)) {
          currentFragDuration = getExtInfDuration(line)
        } else if (line.isTag(Tags.Key)) {
          currentKeyLine = line
        } else if (line.isTag(Tags.Pdt)) {
          lastPdtUnix = pdtTagToUnix(line) || lastPdtUnix
        }
        currentFragHeaderTags.push(line)
      }
    } else if (line) {
      // line is frag, wrap up and push full object

      let impliedPDTLine = null
      if (lastPdtUnix && !currentFragHeaderTags.findTag(Tags.Pdt)) {
        // calculate implied pdt and set if no pdt tag on frag
        const fragPdtUnix = currentFragDuration * 1000 + lastPdtUnix
        impliedPDTLine = `#EXT-X-PROGRAM-DATE-TIME:${new Date(fragPdtUnix).toISOString()}`
        lastPdtUnix = fragPdtUnix
      }

      frags.push({
        tagLines: currentFragHeaderTags,
        url: line,
        impliedKeyLine: currentKeyLine,
        impliedPDTLine,
        duration: currentFragDuration,
      })
      currentFragDuration = -1
      currentFragHeaderTags = []
    }
  })
  return {
    frags,
    headerTagLines: manifestHaderTagLines,
    isLive,
  }
}
