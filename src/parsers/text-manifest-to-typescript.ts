import { getExtInfDuration, pdtTagToUnix } from '../utils/hls-string'
import { possiblePlaylistTags, Tags } from '../utils/HlsTags'

export type Frag = {
  tagLines: string[]
  url: string
  impliedKeyLine: string | null
  impliedIVString: string | null
  impliedPDTLine: string | null
  impliedMapLine: string | null
  duration: number
  originalMediaSequence: number
}

export type LevelManifest = {
  frags: Frag[]
  headerTagLines: string[]
  isLive: boolean
}

export const textToTypescript = (levelManifest: string): LevelManifest => {
  const frags: Frag[] = []
  const manifestHeaderTagLines: string[] = []
  let currentFragHeaderTags: string[] = []
  let currentFragDuration = -1
  let currentFragMediaSequence = 0
  let isLive = true
  let currentKeyLine: string | null = null // '#EXT-X-KEY:METHOD=NONE'
  let lastPdtUnix: number | null = null
  let lastMapTagEncountered: string | null = null
  levelManifest.split('\n').forEach((line) => {
    if (line.startsWith('##') || !line) {
      // line is comment or blank
      if (frags.length || currentFragHeaderTags.length) {
        currentFragHeaderTags.push(line)
      } else {
        manifestHeaderTagLines.push(line)
      }
    } else if (line.startsWith('#')) {
      // line is tag
      const isEndlist = line.isTag(Tags.End)
      const isHeaderTag = possiblePlaylistTags.find((tag) => line.startsWith(tag))
      if (isEndlist) {
        isLive = false
      } else if (isHeaderTag) {
        const isMediaSeq = line.isTag(Tags.MediaSequence)
        if (isMediaSeq) {
          currentFragMediaSequence = Number(line.slice(Tags.MediaSequence.length + 1)) || 0
        }
        manifestHeaderTagLines.push(line)
      } else {
        if (line.isTag(Tags.Inf)) {
          currentFragDuration = getExtInfDuration(line)
        } else if (line.isTag(Tags.Key)) {
          currentKeyLine = line
        } else if (line.isTag(Tags.Pdt)) {
          lastPdtUnix = pdtTagToUnix(line) || lastPdtUnix
        } else if (line.isTag(Tags.Map)) {
          lastMapTagEncountered = line
        }
        currentFragHeaderTags.push(line)
      }
    } else if (line) {
      // line is frag, wrap up and push full object

      let impliedPDTLine = null
      if (lastPdtUnix && !currentFragHeaderTags.findTag(Tags.Pdt)) {
        // calculate implied pdt and set if no pdt tag on frag
        const fragPdtUnix = currentFragDuration * 1000 + lastPdtUnix
        impliedPDTLine = `${Tags.Pdt}:${new Date(fragPdtUnix).toISOString()}`
        lastPdtUnix = fragPdtUnix
      }

      let impliedIVString = null
      if (currentKeyLine) {
        const keyAttributes = currentKeyLine
          .slice(Tags.Key.length + 1)
          .match(/("[^"]*")|[^,]+/g)
          ?.reduce((attributeMap, attribute) => {
            const [key, val] = attribute.split(/=(.*)/)
            return { ...attributeMap, [key]: val }
          }, {} as Record<string, string>)

        if (keyAttributes && keyAttributes.METHOD !== 'NONE' && !keyAttributes.IV) {
          impliedIVString = `IV=0x${currentFragMediaSequence.toString(16).toUpperCase().padStart(32, '0')}`
        }
      }

      frags.push({
        tagLines: currentFragHeaderTags,
        url: line,
        impliedKeyLine: currentKeyLine,
        impliedPDTLine,
        impliedIVString,
        impliedMapLine: lastMapTagEncountered,
        originalMediaSequence: currentFragMediaSequence,
        duration: currentFragDuration,
      })
      currentFragMediaSequence += 1
      currentFragDuration = -1
      currentFragHeaderTags = []
    }
  })
  return {
    frags,
    headerTagLines: manifestHeaderTagLines,
    isLive,
  }
}
