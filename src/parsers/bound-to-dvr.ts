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
        if (frag.tagLines.find((line) => line.startsWith('#EXT-X-DISCONTINUITY'))) {
          numDiscontinuitiesRemoved += 1
        }
        return false
      } else {
        secondsIntoWindowSoFar += frag.duration
        return true
      }
    })
    .reverse()

  // add back key if we removed it
  const firstFrag = manifest.frags[0]
  if (firstFrag && firstFrag.impliedKeyLine && !firstFrag.tagLines.find((tag) => tag.startsWith('#EXT-X-KEY'))) {
    firstFrag.tagLines.unshift(firstFrag.impliedKeyLine)
  }
  if (firstFrag && firstFrag.tagLines.find((line) => line.startsWith('#EXT-X-DISCONTINUITY'))) {
    // remove redundant discontinuity tag on first frag
    firstFrag.tagLines = firstFrag.tagLines.filter((line) => !line.startsWith('#EXT-X-DISCONTINUITY'))
    // also increment disco sequence if we remove
    numDiscontinuitiesRemoved += 1
  }

  // update media sequence and remove playlist type header, if they exist
  manifest.headerTagLines = manifest.headerTagLines
    .map((line) => {
      if (line.startsWith('#EXT-X-PLAYLIST-TYPE')) {
        return ''
      } else if (line.startsWith('#EXT-X-MEDIA-SEQUENCE')) {
        const foundMediaSequenceValue = Number(line.slice('#EXT-X-MEDIA-SEQUENCE:'.length)) || 0
        // add it back later
        return `#EXT-X-MEDIA-SEQUENCE:${foundMediaSequenceValue + numFragsRemoved}`
      } else if (line.startsWith('#EXT-X-DISCONTINUITY-SEQUENCE')) {
        const foundDiscoSequence = Number(line.slice('#EXT-X-DISCONTINUITY-SEQUENCE:'.length)) || 0
        return `#EXT-X-DISCONTINUITY-SEQUENCE:${foundDiscoSequence + numDiscontinuitiesRemoved}`
      }
      return line
    })
    .filter((line) => line)

  // add media sequence if it doesn't exist
  if (!manifest.headerTagLines.find((line) => line.startsWith('#EXT-X-MEDIA-SEQUENCE'))) {
    manifest.headerTagLines.splice(2, 0, `#EXT-X-MEDIA-SEQUENCE:${numFragsRemoved}`)
  }
  return manifest
}
