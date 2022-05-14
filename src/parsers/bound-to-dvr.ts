import { getExtInfDuration } from '../utils/hls-string'
import { possiblePlaylistTags } from '../utils/HlsTags'
import { LevelManifest } from './text-manifest-to-typescript'

export const boundToDvr = (manifest: LevelManifest, dvrWindowSeconds: number): LevelManifest => {
  if (dvrWindowSeconds < 1) return manifest

  let secondsIntoWindowSoFar = 0
  let numFragsRemoved = 0

  manifest.frags = manifest.frags
    .slice()
    .reverse()
    .filter((frag) => {
      if (secondsIntoWindowSoFar >= dvrWindowSeconds) {
        numFragsRemoved += 1
        return false
      } else {
        secondsIntoWindowSoFar += frag.duration
        return true
      }
    })
    .reverse()

  // update media sequence and remove playlist type header, if they exist
  manifest.headerTagLines = manifest.headerTagLines
    .map((line) => {
      if (line.startsWith('#EXT-X-PLAYLIST-TYPE')) {
        return ''
      } else if (line.startsWith('#EXT-X-MEDIA-SEQUENCE')) {
        const foundMediaSequenceValue = Number(line.slice('#EXT-X-MEDIA-SEQUENCE:'.length)) || 0
        // add it back later
        return `#EXT-X-MEDIA-SEQUENCE:${foundMediaSequenceValue + numFragsRemoved}`
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
