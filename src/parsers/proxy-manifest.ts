import { getFullUrl } from '../utils/url-converter'
import { SimulatorOptions } from '../api/request-options'
import { LevelManifest } from './text-manifest-to-typescript'

const replaceTagUris = (tag: string, remoteUrl: string) => {
  if (!tag || tag.startsWith('##')) return tag
  const tagName = tag.slice(0, tag.indexOf(':') + 1)
  const tagAttributes = tag.slice(tagName.length).match(/("[^"]*")|[^,]+/g)
  const uriAttribute = tagAttributes.find((attribute) => attribute.startsWith('URI='))
  if (uriAttribute) {
    const fullUri = getFullUrl(uriAttribute.slice(5, -1), remoteUrl)
    return (
      tagName +
      tagAttributes
        .map((attribute) => {
          return attribute.startsWith('URI') ? `URI="${fullUri}"` : attribute
        })
        .join(',')
    )
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
  const mediaSequenceTag = manifest.headerTagLines.find((tag) => tag.startsWith('#EXT-X-MEDIA-SEQUENCE:'))
  let mediaSequenceOffset = 0
  if (mediaSequenceTag) {
    mediaSequenceOffset = Number(mediaSequenceTag.slice('#EXT-X-MEDIA-SEQUENCE:'.length)) || 0
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
      impliedKeyLine: replaceTagUris(frag.impliedKeyLine, remoteUrl),
      url: proxyUrl,
    }
  })
  return manifest
}

export const proxycustomManifest = (manifest: LevelManifest, sessionId: string): LevelManifest => ({
  ...manifest,
  frags: manifest.frags.map((frag, fragIndex) => ({
    ...frag,
    url: `custom_frag_${fragIndex}?sessionId=${sessionId}&url=${frag.url}`,
  })),
})
