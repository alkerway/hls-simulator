import { boundToDvr } from '../parsers/bound-to-dvr'
import { replaceManifestUrls } from '../parsers/replace-lines'
import { vodToLive } from '../parsers/vod-to-live'
import SessionState  from '../sessions/session-state'

class ManifestServer {
    public lastLevelResponse = ''

    public getLevel = (sessionId: string, vodLevel: string, remoteLevelUrl: string, remoteIsLive: boolean, dvrWindowSeconds: number, keepVod: boolean) => {
        if (remoteIsLive) {
            this.lastLevelResponse = replaceManifestUrls(vodLevel, remoteLevelUrl, false, sessionId, 0, false)
            if (typeof dvrWindowSeconds ==='number' && dvrWindowSeconds > 0) {
                this.lastLevelResponse = boundToDvr(this.lastLevelResponse, dvrWindowSeconds)
            }
        } else if (keepVod) {
            this.lastLevelResponse = replaceManifestUrls(vodLevel, remoteLevelUrl, false, sessionId, 0, false)
        } else {
            const curTime = SessionState.getSessionTime(sessionId)
            if (curTime < 0) {
                return vodLevel
            }
            this.lastLevelResponse = vodToLive(vodLevel, curTime, remoteLevelUrl, sessionId)
            if (typeof dvrWindowSeconds ==='number' && dvrWindowSeconds > 0) {
                this.lastLevelResponse = boundToDvr(this.lastLevelResponse, dvrWindowSeconds)
            }
        }
        return this.lastLevelResponse
    }
}

export default new ManifestServer()