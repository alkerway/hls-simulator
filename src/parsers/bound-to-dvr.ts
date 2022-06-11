import { Tags } from '../utils/HlsTags'
import { LevelManifest } from './text-manifest-to-typescript'

export const boundToDvr = (manifest: LevelManifest, dvrWindowSeconds: number): LevelManifest => {
  if (dvrWindowSeconds < 1) return manifest

  let secondsIntoWindowSoFar = 0
  let numFragsRemoved = 0
  let numDiscontinuitiesRemoved = 0

  manifest.frags = manifest.frags
    .slice()
    .reverse()
    .filter((frag) => {
      if (secondsIntoWindowSoFar + frag.duration > dvrWindowSeconds) {
        numFragsRemoved += 1
        if (frag.tagLines.findTag(Tags.Discontinuity)) {
          numDiscontinuitiesRemoved += 1
        }
        // set seconds to high number so no short frags make the cut
        secondsIntoWindowSoFar = Infinity
        return false
      } else {
        secondsIntoWindowSoFar += frag.duration
        return true
      }
    })
    .reverse()

  // If we need a key, add the implied one to the first frag
  const firstFrag = manifest.frags[0]
  if (firstFrag?.impliedKeyLine && !firstFrag.tagLines.findTag(Tags.Key)) {
    firstFrag.tagLines.unshift(firstFrag.impliedKeyLine)
  }
  // If had a previous pdt, add the implied one to the first frag
  if (firstFrag?.impliedPDTLine && !firstFrag.tagLines.findTag(Tags.Pdt)) {
    firstFrag.tagLines.unshift(firstFrag.impliedPDTLine)
  }
  if (firstFrag && firstFrag.tagLines.findTag(Tags.Discontinuity)) {
    // remove redundant discontinuity tag on first frag
    firstFrag.tagLines = firstFrag.tagLines.filter((line) => !line.isTag(Tags.Discontinuity))
    // also increment disco sequence if we remove
    numDiscontinuitiesRemoved += 1
  }

  // update media and pdt sequences and remove playlist type header, if they exist
  manifest.headerTagLines = manifest.headerTagLines
    .map((line) => {
      if (line.isTag(Tags.PlaylistType)) {
        return ''
      } else if (line.isTag(Tags.MediaSequence)) {
        const foundMediaSequenceValue = Number(line.slice(Tags.MediaSequence.length)) || 0
        // add it back later
        return `${Tags.MediaSequence}:${foundMediaSequenceValue + numFragsRemoved}`
      } else if (line.isTag(Tags.DiscontinuitySequence)) {
        const foundDiscoSequence = Number(line.slice(Tags.DiscontinuitySequence.length)) || 0
        return `${Tags.DiscontinuitySequence}:${foundDiscoSequence + numDiscontinuitiesRemoved}`
      }
      return line
    })
    .filter((line) => line)

  // add media sequence if it doesn't exist
  if (!manifest.headerTagLines.findTag(Tags.MediaSequence)) {
    manifest.headerTagLines.splice(2, 0, `${Tags.MediaSequence}:${numFragsRemoved}`)
  }
  return manifest
}
