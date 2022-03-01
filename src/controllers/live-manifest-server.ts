import { vodAtTime } from '../utils'

class LiveManifestServer {
    private sessionStart = -1
    public lastLiveLevel = ''

    private getSessionTime = () => {
        if (this.sessionStart < 0) return 0
        return Math.floor(Date.now() / 1000) - this.sessionStart
    }

    public getLiveLevel = (vodLevel: string, remoteLevelUrl: string, dvrWindowSeconds: number) => {
        // if (this.sessionStart < 0) {
        //     return vodLevel
        // }
        const curTime = this.getSessionTime()
        this.lastLiveLevel = vodAtTime(vodLevel, curTime, remoteLevelUrl, dvrWindowSeconds)
        return this.lastLiveLevel
    }

    public startLiveManifest = () => {
        this.sessionStart = Math.floor(Date.now() / 1000)
    }
}

export default new LiveManifestServer()