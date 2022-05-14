import { CustomManifest } from '../sessions/session-state'
import { Frag, LevelManifest } from './text-manifest-to-typescript'

const injectText = (
  originalManifest: LevelManifest,
  newText: CustomManifest,
  maxManifestDuration: number
): LevelManifest => {
  const { startTime: customManifestStartTime, manifest } = newText
  const customFrags = manifest.frags.map((frag) => ({ ...frag, tagLines: [...frag.tagLines] }))

  const newFrags: Frag[] = []

  let amountInjectedTextIsAhead = 0
  let appendingcustomManifest = false

  let currentFrag
  if (customManifestStartTime === 0 && customFrags.length) {
    currentFrag = customFrags.shift()
    appendingcustomManifest = true
    amountInjectedTextIsAhead = currentFrag.duration
  } else {
    currentFrag = originalManifest.frags.shift()
  }
  let currentParseTime = currentFrag.duration

  while (currentFrag && currentParseTime <= maxManifestDuration) {
    newFrags.push(currentFrag)

    if (appendingcustomManifest) {
      // add custom frags until we're out of custom frags or
      // while loop stops cause we went overtime
      currentFrag = customFrags.shift()
      if (currentFrag) {
        amountInjectedTextIsAhead += currentFrag.duration
        currentParseTime += currentFrag.duration
      } else {
        appendingcustomManifest = false
        currentFrag = originalManifest.frags.shift()
        // no more left to add, remove appropriate
        while (currentFrag && amountInjectedTextIsAhead > currentFrag.duration) {
          amountInjectedTextIsAhead -= currentFrag.duration
          currentFrag = originalManifest.frags.shift()
        }
        currentParseTime += currentFrag.duration
        if (!currentFrag.tagLines.find((line) => line.startsWith('#EXT-X-DISCONTINUITY'))) {
          currentFrag.tagLines.unshift('#EXT-X-DISCONTINUITY')
        }
      }
    } else {
      if (currentParseTime >= customManifestStartTime && customFrags.length) {
        currentFrag = customFrags.shift()
        if (!currentFrag.tagLines.find((line) => line.startsWith('#EXT-X-DISCONTINUITY'))) {
          currentFrag.tagLines.unshift('#EXT-X-DISCONTINUITY')
        }
        appendingcustomManifest = true
      } else {
        currentFrag = originalManifest.frags.shift()
      }
      currentParseTime += currentFrag?.duration || 0
    }
  }
  originalManifest.frags = newFrags
  return originalManifest
}

export const addCustomManifests = (
  manifest: LevelManifest,
  allCustomManifests: CustomManifest[],
  maxManifestDuration: number
) => {
  return allCustomManifests.reduce(
    (currentManifest, injection) => injectText(currentManifest, injection, maxManifestDuration),
    manifest
  )
}
