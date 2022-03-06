import { replaceManifestUrls } from '../parsers/replace-lines'
import { vodToLive } from '../parsers/vodlevel'
import SessionState  from '../sessions/session-state'

class ManifestServer {
    public lastLiveLevel = ''

    public getLiveLevel = (sessionId: string, vodLevel: string, remoteLevelUrl: string, dvrWindowSeconds: number, remoteIsLive: boolean) => {
        if (remoteIsLive) {
            this.lastLiveLevel = replaceManifestUrls(vodLevel, remoteLevelUrl, false, sessionId)
        } else {
            const curTime = SessionState.getSessionTime(sessionId)
            if (curTime < 0) {
                return vodLevel
            }
            this.lastLiveLevel = vodToLive(vodLevel, curTime, remoteLevelUrl, dvrWindowSeconds, sessionId)
        }
        return this.lastLiveLevel
    }
}

export default new ManifestServer()