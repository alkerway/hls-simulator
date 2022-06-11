import { Tags } from '../utils/HlsTags'
import { CustomManifest } from '../sessions/session-state'
import { Frag, LevelManifest } from './text-manifest-to-typescript'

const injectTextLiveToLive = (originalManifest: LevelManifest, newText: CustomManifest): LevelManifest => {
  const customFrags = structuredClone(newText.manifest.frags)

  const customFragMsMap: Record<number, Frag> = {}

  customFrags.forEach((frag, index) => {
    customFragMsMap[newText.startTimeOrMediaSequence + index] = frag
  })

  const mediaSequenceTag = originalManifest.headerTagLines?.findTag(Tags.MediaSequence)
  const initialMediaSequence = Number(mediaSequenceTag.slice(Tags.MediaSequence.length)) || 0

  originalManifest.frags = originalManifest.frags.map((frag, fragIndex) => {
    const currentMediaSequence = initialMediaSequence + fragIndex
    const manifestFrag = customFragMsMap[currentMediaSequence] || frag
    if (currentMediaSequence === newText.startTimeOrMediaSequence) {
      // start inject
      const lastFragHadKey = originalManifest.frags[fragIndex - 1]?.impliedKeyLine
      if (lastFragHadKey) {
        manifestFrag.tagLines.unshift(manifestFrag.impliedKeyLine || '#EXT-X-KEY:METHOD=NONE')
      }
      if (!manifestFrag.tagLines.findTag(Tags.Discontinuity)) {
        manifestFrag.tagLines.unshift(Tags.Discontinuity)
      }
    } else if (currentMediaSequence === newText.startTimeOrMediaSequence + newText.manifest.frags.length) {
      // stop inject
      const lastFragHadKey = originalManifest.frags[fragIndex - 1]?.impliedKeyLine
      if (lastFragHadKey || manifestFrag.impliedKeyLine) {
        // always set key file on content if exists
        manifestFrag.tagLines.unshift(manifestFrag.impliedKeyLine || '#EXT-X-KEY:METHOD=NONE')
      }
      if (!manifestFrag.tagLines.findTag(Tags.Discontinuity)) {
        manifestFrag.tagLines.unshift(Tags.Discontinuity)
      }
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

  if (isLiveToLive) {
    if (!startTimeOrMediaSequence) {
      // set a media sequence to keep track if one isn't set
      const mediaSequenceTag = originalManifest.headerTagLines.findTag(Tags.MediaSequence)
      const startingMediaSequenceValue = Number(mediaSequenceTag.slice(Tags.MediaSequence.length)) || 0
      newText.startTimeOrMediaSequence = startingMediaSequenceValue + originalManifest.frags.length
    }
    return injectTextLiveToLive(originalManifest, newText)
  }

  const customFrags = structuredClone(manifest.frags)
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
        // no more left to add, skip over appropriate number of content frags
        appendingcustomManifest = false
        currentFrag = originalManifest.frags.shift()
        while (currentFrag && amountInjectedTextIsAhead > currentFrag.duration) {
          amountInjectedTextIsAhead -= currentFrag.duration
          currentFrag = originalManifest.frags.shift()
        }
        currentParseTime += currentFrag.duration
        // transition to original content
        if (
          (currentFrag.impliedKeyLine || newFrags[newFrags.length - 1]?.impliedKeyLine) &&
          !currentFrag.tagLines.findTag(Tags.Key)
        ) {
          currentFrag.tagLines.unshift(currentFrag.impliedKeyLine || '#EXT-X-KEY:METHOD=NONE')
        }
        if (!currentFrag.tagLines.findTag(Tags.Discontinuity)) {
          currentFrag.tagLines.unshift(Tags.Discontinuity)
        }
      }
    } else {
      if (currentParseTime >= customManifestStartTime && customFrags.length) {
        const hadKeyLine = currentFrag.impliedKeyLine
        // transition to injected content
        currentFrag = customFrags.shift()
        if (hadKeyLine) {
          currentFrag.tagLines.unshift(currentFrag.impliedKeyLine || '#EXT-X-KEY:METHOD=NONE')
        }
        if (!currentFrag.tagLines.findTag(Tags.Discontinuity)) {
          currentFrag.tagLines.unshift(Tags.Discontinuity)
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
