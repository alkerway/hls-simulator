import { getFullUrl } from '../utils/url-converter'
import { SimulatorOptions } from '../api/request-options'
import { LevelManifest } from './text-manifest-to-typescript'

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
