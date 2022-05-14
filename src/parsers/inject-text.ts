import { CustomManifest } from '../sessions/session-state'
import { Frag, LevelManifest } from './text-manifest-to-typescript'

const injectTextLiveToLive = (originalManifest: LevelManifest, newText: CustomManifest): LevelManifest => {
  const customFrags = newText.manifest.frags.map((frag) => ({ ...frag, tagLines: [...frag.tagLines] }))

  const customFragMsMap: Record<number, Frag> = {}

  customFrags.forEach((frag, index) => {
    customFragMsMap[newText.startTimeOrMediaSequence + index] = frag
  })

  const mediaSequenceTag = originalManifest.headerTagLines.find((tag) => tag.startsWith('#EXT-X-MEDIA-SEQUENCE:'))
  const initialMediaSequence = Number(mediaSequenceTag.slice('#EXT-X-MEDIA-SEQUENCE:'.length)) || 0

  originalManifest.frags = originalManifest.frags.map((frag, fragIndex) => {
    const currentMediaSequence = initialMediaSequence + fragIndex
    const customFragSub = customFragMsMap[currentMediaSequence]
    const manifestFrag = customFragMsMap[currentMediaSequence] || frag
    if (
      currentMediaSequence === newText.startTimeOrMediaSequence ||
      currentMediaSequence === newText.startTimeOrMediaSequence + newText.manifest.frags.length
    ) {
      manifestFrag.tagLines.unshift('#EXT-X-DISCONTINUITY')
    }
    return manifestFrag
  })

  return originalManifest
}

const injectText = (
  originalManifest: LevelManifest,
  newText: CustomManifest,
  sessionTime: number,
  isLiveToLive?: boolean
): LevelManifest => {
  const { fallbackStartTime, startTimeOrMediaSequence, manifest } = newText
  const customManifestStartTime = startTimeOrMediaSequence ?? fallbackStartTime

  // set a media sequence to keep track if one isn't set
  if (isLiveToLive) {
    if (!startTimeOrMediaSequence) {
      const mediaSequenceTag = originalManifest.headerTagLines.find((tag) => tag.startsWith('#EXT-X-MEDIA-SEQUENCE:'))
      const startingMediaSequenceValue = Number(mediaSequenceTag.slice('#EXT-X-MEDIA-SEQUENCE:'.length)) || 0
      newText.startTimeOrMediaSequence = startingMediaSequenceValue + originalManifest.frags.length
    }
    return injectTextLiveToLive(originalManifest, newText)
  }

  const customFrags = manifest.frags.map((frag) => ({ ...frag, tagLines: [...frag.tagLines] }))

  const newFrags: Frag[] = []
  const oldManifestDuration = originalManifest.frags.reduce((dur, frag) => frag.duration + dur, 0)

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

  while (currentFrag && (currentParseTime <= sessionTime || sessionTime < 0)) {
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
  maxManifestDuration: number,
  isLiveToLive?: boolean
) => {
  return allCustomManifests.reduce(
    (currentManifest, injection) => injectText(currentManifest, injection, maxManifestDuration, isLiveToLive),
    manifest
  )
}