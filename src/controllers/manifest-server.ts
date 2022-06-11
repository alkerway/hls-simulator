import { addCustomManifests } from '../parsers/inject-text'
import { boundToDvr } from '../parsers/bound-to-dvr'
import { vodToLive } from '../parsers/vod-to-live'
import SessionState from '../sessions/session-state'
import { SimulatorOptions } from '../api/request-options'
import { proxyMaster, proxyLevel } from '../parsers/proxy-manifest'
import { textToTypescript } from '../parsers/text-manifest-to-typescript'
import { typescriptToText } from '../parsers/typescript-manifest-to-text'

class ManifestServer {
  public getMaster = (remoteText: string, requestOptions: SimulatorOptions) => {
    return proxyMaster(remoteText, requestOptions)
  }

  public getLevel = (remoteText: string, remoteIsLive: boolean, simulatorOptions: SimulatorOptions) => {
    const { sessionId, dvrWindowSeconds = -1, keepVod = false } = simulatorOptions
    const injections = SessionState.getInjections(sessionId)
    const liveManifestMaxLength = SessionState.getSessionTime(sessionId)

    let manifestObject = textToTypescript(remoteText)
    if (remoteIsLive) {
      // live to live
      manifestObject = proxyLevel(manifestObject, simulatorOptions)
      manifestObject = addCustomManifests(manifestObject, injections, -1, true)
      manifestObject = boundToDvr(manifestObject, dvrWindowSeconds)
    } else if (keepVod) {
      // vod to vod
      manifestObject = proxyLevel(manifestObject, simulatorOptions)
      manifestObject = addCustomManifests(manifestObject, injections, -1)
    } else {
      // vod to live
      manifestObject = proxyLevel(manifestObject, simulatorOptions)
      manifestObject = vodToLive(manifestObject, liveManifestMaxLength)
      manifestObject = addCustomManifests(manifestObject, injections, liveManifestMaxLength)
      manifestObject = boundToDvr(manifestObject, dvrWindowSeconds)
    }
    const levelResponse = typescriptToText(manifestObject)
    SessionState.setLastLevel(sessionId, levelResponse)
    return levelResponse
  }
}

export default new ManifestServer()
