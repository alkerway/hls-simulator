import { replaceManifestUrls } from '../parsers/replace-lines'
import { vodToLive } from '../parsers/vodlevel'
import SessionState  from '../sessions/session-state'

class ManifestServer {
    public lastLevelResponse = ''

    public getLevel = (sessionId: string, vodLevel: string, remoteLevelUrl: string, remoteIsLive: boolean, dvrWindowSeconds: number, keepVod: boolean) => {
        if (remoteIsLive) {
            this.lastLevelResponse = replaceManifestUrls(vodLevel, remoteLevelUrl, false, sessionId, 0, false)
        } else if (keepVod) {
            this.lastLevelResponse = replaceManifestUrls(vodLevel, remoteLevelUrl, false, sessionId, 0, false)
        } else {
            const curTime = SessionState.getSessionTime(sessionId)
            if (curTime < 0) {
                return vodLevel
            }
            this.lastLevelResponse = vodToLive(vodLevel, curTime, remoteLevelUrl, dvrWindowSeconds, sessionId)
        }
        return this.lastLevelResponse
    }
}

export default new ManifestServer()