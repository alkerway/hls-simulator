import { getFullUrl } from '../utils/url-converter'
import { SimulatorOptions } from '../api/request-options'
import { LevelManifest } from './text-manifest-to-typescript'

export const proxyMaster = (originalManifest: string, simulatorOptions: SimulatorOptions): string => {
  const { sessionId, remoteUrl, dvrWindowSeconds = -1, keepVod = false } = simulatorOptions

  let urlCounter = 0
  const originalLines = originalManifest.split('\n')
  const newLines = originalLines.map((line) => {
    if (!line.startsWith('#') && line.length) {
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
    return line
  })
  return newLines.join('\n')
}

export const proxyLevel = (manifest: LevelManifest, simulatorOptions: SimulatorOptions): LevelManifest => {
  const { remoteUrl, sessionId } = simulatorOptions
  manifest.frags = manifest.frags.map((frag, fragIndex) => {
    const fullFragurl = getFullUrl(frag.url, remoteUrl)
    const proxyUrl = `frag_${fragIndex}?sessionId=${sessionId}&url=${fullFragurl}`
    return {
      ...frag,
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
