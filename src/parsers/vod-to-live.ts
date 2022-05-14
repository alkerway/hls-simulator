import { Frag, LevelManifest } from './text-manifest-to-typescript'

export const vodToLive = (manifest: LevelManifest, maxLevelDuration: number): LevelManifest => {
  if (maxLevelDuration <= 0) return manifest

  const newFrags: Frag[] = []

  let currentFragIdx = 0
  let currentFrag = manifest.frags[currentFragIdx]
  let totalLevelDuration = currentFrag.duration
  let fragCounter = 0
  while (totalLevelDuration < maxLevelDuration) {
    if (currentFragIdx === 0 && fragCounter !== 0) {
      currentFrag.tagLines.unshift('#EXT-X-DISCONTINUITY')
    }
    newFrags.push(currentFrag)

    // reassign before check not after
    currentFragIdx = (currentFragIdx + 1) % manifest.frags.length
    currentFrag = manifest.frags[currentFragIdx]
    totalLevelDuration += currentFrag.duration
    fragCounter += 1
    if (fragCounter > 600_000) {
      console.log('break loop')
      break
    }
  }
  manifest.frags = newFrags
  manifest.isLive = true
  manifest.headerTagLines = manifest.headerTagLines.map((line) => {
    if (line.startsWith('#EXT-X-PLAYLIST-TYPE')) {
      return '#EXT-X-PLAYLIST-TYPE:EVENT'
    }
    return line
  })
  return manifest
}
