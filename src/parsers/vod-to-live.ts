import { Tags } from '../utils/HlsTags'
import { addMsToPdtLine, pdtTagToUnix } from '../utils/hls-string'
import { Frag, LevelManifest } from './text-manifest-to-typescript'

export const vodToLive = (manifest: LevelManifest, maxLevelDuration: number): LevelManifest => {
  if (maxLevelDuration <= 0) return manifest

  const newFrags: Frag[] = []

  const originalNumFrags = manifest.frags.length
  let currentFragIdx = 0
  let currentFrag = structuredClone(manifest.frags[currentFragIdx])
  let totalLevelDuration = currentFrag.duration
  const startMediaSequenceTag = manifest.headerTagLines.findTag(Tags.MediaSequence) || ''
  const startMediaSequence = Number(startMediaSequenceTag.slice(Tags.MediaSequence.length + 1)) || 0
  let currentMediaSequence = startMediaSequence
  let pdtOffsetMs = 0
  while (totalLevelDuration < maxLevelDuration) {
    if (currentFragIdx === 0 && currentMediaSequence !== startMediaSequence) {
      if (currentFrag.impliedKeyLine && !currentFrag.tagLines.findTag(Tags.Key)) {
        const newKeyLine = currentFrag.impliedKeyLine
        currentFrag.tagLines.unshift(newKeyLine)
      }
      currentFrag.tagLines.unshift(Tags.Discontinuity)
      // get last frag pdt and set as offset
      const lastFrag = newFrags[newFrags.length - 1]
      const lastFragPdtLine = lastFrag.tagLines.findTag(Tags.Pdt) || lastFrag.impliedPDTLine
      if (lastFragPdtLine) {
        pdtOffsetMs = newFrags.reduce((total, curFrag) => total + curFrag.duration, 0) * 1000
      }
    }
    // apply pdt offset to all frags on looped manifest
    if (pdtOffsetMs) {
      if (currentFrag.impliedPDTLine) {
        currentFrag.impliedPDTLine = addMsToPdtLine(currentFrag.impliedPDTLine, pdtOffsetMs)
      }
      if (currentFrag.tagLines.findTag(Tags.Pdt)) {
        currentFrag.tagLines = currentFrag.tagLines.map((line) => {
          if (line.isTag(Tags.Pdt)) {
            return addMsToPdtLine(line, pdtOffsetMs)
          }
          return line
        })
      }
    }

    // make sure IV matches up
    if (currentFrag.originalMediaSequence !== currentMediaSequence && currentFrag.impliedKeyLine) {
      const existingKeyTag = currentFrag.tagLines.findTag(Tags.Key)
      const hasIV = existingKeyTag?.includes('IV=')
      if (existingKeyTag) {
        if (!hasIV) {
          currentFrag.tagLines = currentFrag.tagLines.map(line =>
            line.isTag(Tags.Key)
              ? `${line},${currentFrag.impliedIVString}`
              : line)
        }
      } else if (currentFrag.impliedIVString) {
        currentFrag.tagLines.unshift(`${currentFrag.impliedKeyLine},${currentFrag.impliedIVString}`)
      }
    }


    newFrags.push(currentFrag)

    // reassign before check not after
    currentFragIdx = (currentFragIdx + 1) % manifest.frags.length
    currentFrag = structuredClone(manifest.frags[currentFragIdx])
    totalLevelDuration += currentFrag.duration
    currentMediaSequence += 1
  }
  manifest.frags = newFrags
  manifest.isLive = true
  manifest.headerTagLines = manifest.headerTagLines.map((line) => {
    if (line.isTag(Tags.PlaylistType)) {
      return `${Tags.PlaylistType}:EVENT`
    }
    return line
  })
  return manifest
}
