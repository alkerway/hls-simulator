import { Tags } from '../utils/HlsTags'
import { addMsToPdtLine, pdtTagToUnix } from '../utils/hls-string'
import { Frag, LevelManifest } from './text-manifest-to-typescript'

export const vodToLive = (manifest: LevelManifest, maxLevelDuration: number): LevelManifest => {
  if (maxLevelDuration <= 0) return manifest

  const newFrags: Frag[] = []

  let currentFragIdx = 0
  let currentFrag = structuredClone(manifest.frags[currentFragIdx])
  let totalLevelDuration = currentFrag.duration
  let fragCounter = 0
  let pdtOffsetMs = 0
  while (totalLevelDuration < maxLevelDuration) {
    if (currentFragIdx === 0 && fragCounter !== 0) {
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
    newFrags.push(currentFrag)

    // reassign before check not after
    currentFragIdx = (currentFragIdx + 1) % manifest.frags.length
    currentFrag = structuredClone(manifest.frags[currentFragIdx])
    totalLevelDuration += currentFrag.duration
    fragCounter += 1
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
