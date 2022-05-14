import { injectText } from '../parsers/inject-text'
import { boundToDvr } from '../parsers/bound-to-dvr'
import { vodToLive } from '../parsers/vod-to-live'
import SessionState from '../sessions/session-state'
import { SimulatorOptions } from '../api/request-options'
import { proxyMaster } from '../parsers/proxy-master'
import { textToTypescript } from '../parsers/text-manifest-to-typescript'
import { typescriptToText } from '../parsers/typescript-manifest-to-text'
import { proxyLevel } from '../parsers/proxy-level'

class ManifestServer {
    public getMaster = (remoteText: string, requestOptions: SimulatorOptions) => {
        return proxyMaster(remoteText, requestOptions)
    }

    public getLevel = (remoteText: string, remoteIsLive: boolean, simulatorOptions: SimulatorOptions) => {
        const { sessionId, remoteUrl, dvrWindowSeconds = -1, keepVod = false } = simulatorOptions
        let manifestObject = textToTypescript(remoteText)
        manifestObject = proxyLevel(manifestObject, simulatorOptions)
        if (remoteIsLive) {
            // live to live
            manifestObject = boundToDvr(manifestObject, dvrWindowSeconds)
        } else if (keepVod) {
            // vod to vod
            // levelResponse = replaceManifestUrls(remoteText, remoteUrl, false, sessionId, 0, false)
        } else {
            // vod to live
            const liveManifestMaxLength = SessionState.getSessionTime(sessionId)
            manifestObject = vodToLive(manifestObject, liveManifestMaxLength)
            manifestObject = boundToDvr(manifestObject, dvrWindowSeconds)
            // levelResponse = remoteText
            // const injections = SessionState.getInjections(sessionId)
            // injections.forEach((injection) => {
            //     levelResponse = injectText(levelResponse, injection)
            // })
        }
        const levelResponse = typescriptToText(manifestObject)
        SessionState.setLastLevel(sessionId, levelResponse)
        return levelResponse
    }
}

export default new ManifestServer()