import { getFullUrl } from '../utils/url-converter'
import { SimulatorOptions } from '../api/request-options'
import { LevelManifest } from './text-manifest-to-typescript'
import { Tags } from '../utils/HlsTags'
import { splitAttributes } from '../utils/hls-string'


const replaceTagUris = (tag: string, remoteUrl: string) => {
  if (!tag || tag.startsWith('##')) return tag

  const tagName = tag.slice(0, tag.indexOf(':') + 1)

  const tagAttributes = splitAttributes(tag.slice(tagName.length))
  if (tagAttributes) {
    const uriAttributeContent = tagAttributes.find((attribute) => attribute.startsWith('URI='))?.slice(5, -1)
    if (uriAttributeContent && !uriAttributeContent.match(/^"?data:/)) {
      const fullUri = getFullUrl(uriAttributeContent, remoteUrl)
      return (
        tagName +
        tagAttributes
          .map((attribute) =>  attribute.startsWith('URI') ? `URI="${fullUri}"` : attribute)
          .join(',')
      )
    }
  }
  return tag
}

export const proxyMaster = (originalManifest: string, simulatorOptions: SimulatorOptions): string => {
  const { sessionId, remoteUrl, dvrWindowSeconds = -1, keepVod = false } = simulatorOptions

  let urlCounter = 0
  const originalLines = originalManifest.split('\n')
  const newLines = originalLines.map((line) => {
    if (!line.startsWith('#') && line.trim().length) {
      let urlLine = `level_${urlCounter}?sessionId=${sessionId}`
      if (dvrWindowSeconds > 0) {
        urlLine += `&dvrWindowSeconds=${dvrWindowSeconds}`
      }
      if (keepVod) {
        urlLine += '&keepVod=true'
      }
      const fulllevelUrl = getFullUrl(line, remoteUrl)
      urlLine += `&url=${fulllevelUrl}`
      urlCounter = urlCounter + 1
      return urlLine
    }
    return replaceTagUris(line, remoteUrl)
  })
  return newLines.join('\n')
}

export const proxyLevel = (manifest: LevelManifest, simulatorOptions: SimulatorOptions): LevelManifest => {
  const { remoteUrl, sessionId } = simulatorOptions
  const mediaSequenceTag = manifest.headerTagLines.findTag(Tags.MediaSequence)
  let mediaSequenceOffset = 0
  if (mediaSequenceTag) {
    mediaSequenceOffset = Number(mediaSequenceTag.slice(Tags.MediaSequence.length + 1)) || 0
  }
  manifest.headerTagLines = manifest.headerTagLines.map((headerTag) => replaceTagUris(headerTag, remoteUrl))
  manifest.frags = manifest.frags.map((frag, fragIndex) => {
    const fullFragurl = getFullUrl(frag.url, remoteUrl)
    const proxyUrl = `frag_${fragIndex + mediaSequenceOffset}?sessionId=${sessionId}&url=${encodeURIComponent(
      fullFragurl
    )}`
    return {
      ...frag,
      tagLines: frag.tagLines.map((fragTag) => replaceTagUris(fragTag, remoteUrl)),
      impliedKeyLine: frag.impliedKeyLine && replaceTagUris(frag.impliedKeyLine, remoteUrl),
      url: proxyUrl,
    }
  })
  return manifest
}

export const proxycustomManifest = (manifest: LevelManifest, sessionId: string): LevelManifest => ({
  ...manifest,
  frags: manifest.frags.map((frag, fragIndex) => ({
    ...frag,
    url: `custom_frag_${fragIndex}?sessionId=${sessionId}&url=${encodeURIComponent(frag.url)}`,
  })),
})
