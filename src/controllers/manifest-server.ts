import { vodAtTime } from '../parsers/vodlevel'
import SessionState  from '../sessions/session-state'

class ManifestServer {
    public lastLiveLevel = ''

    public getLiveLevel = (sessionId: string, vodLevel: string, remoteLevelUrl: string, dvrWindowSeconds: number, remoteIsLive: boolean) => {
        if (remoteIsLive) {
            this.lastLiveLevel = 'TODO'
        } else {
            const curTime = SessionState.getSessionTime(sessionId)
            if (curTime < 0) {
                return vodLevel
            }
            this.lastLiveLevel = vodAtTime(vodLevel, curTime, remoteLevelUrl, dvrWindowSeconds, sessionId)
        }
        return this.lastLiveLevel
    }
}

export default new ManifestServer()