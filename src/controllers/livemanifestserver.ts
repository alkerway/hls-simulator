import { vodAtTime } from '../utils'

class LiveManifestServer {
    private sessionStart = -1

    private getSessionTime = () => {
        return Math.floor(Date.now() / 1000) - this.sessionStart
    }

    public getLiveLevel = (vodLevel: string, remoteLevelUrl?: string) => {
        if (this.sessionStart < 0) {
            return vodLevel
        }
        const curTime = this.getSessionTime()
        return vodAtTime(vodLevel, curTime, remoteLevelUrl)
    }

    public startLiveManifest = () => {
        this.sessionStart = Math.floor(Date.now() / 1000)
    }
}

export default new LiveManifestServer()