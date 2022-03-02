import { vodAtTime } from '../utils'
import SessionState  from '../sessions/session-state'

class LiveManifestServer {
    public lastLiveLevel = ''

    public getLiveLevel = (sessionId: string, vodLevel: string, remoteLevelUrl: string, dvrWindowSeconds: number) => {
        const curTime = SessionState.getSessionTime(sessionId)
        if (curTime < 0) {
            return vodLevel
        }
        this.lastLiveLevel = vodAtTime(vodLevel, curTime, remoteLevelUrl, dvrWindowSeconds)
        return this.lastLiveLevel
    }
}

export default new LiveManifestServer()