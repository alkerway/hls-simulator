import { Request, Response } from 'express'
import { html403 } from '../utils'
import { Messages } from '../messages'
import SessionState from '../messages/session-state'

class Botcher {
    public botchLevel = (req: Request, res: Response, sessionId: string, lastLiveLevel: string): boolean => {
        if (SessionState.isMessageActive(sessionId, Messages.ALL_LEVEL_403)) {
            res.status(403).send(html403)
            return false
        }
        if (SessionState.isMessageActive(sessionId, Messages.NEXT_LEVEL_403)) {
            res.status(403).send(html403)
           SessionState.setMessageValue(sessionId, Messages.NEXT_LEVEL_403, false)
            return false
        }
        if (SessionState.isMessageActive(sessionId, Messages.NEXT_LEVEL_TIMEOUT)) {
           SessionState.setMessageValue(sessionId, Messages.NEXT_LEVEL_TIMEOUT, false)
            return false
        }
        if (SessionState.isMessageActive(sessionId, Messages.LEVEL_STALL)) {
            res.status(200).send(lastLiveLevel)
            return false
        }
        if (SessionState.isMessageActive(sessionId, Messages.STREAM_END)) {
            res.status(200).send(lastLiveLevel + '#EXT-X-ENDLIST\n')
            return false
        }
        return true
    }

    public botchFrag = (req: Request, res: Response, sessionId: string, remoteUrl: string): boolean => {
        if (SessionState.isMessageActive(sessionId, Messages.ALL_FRAG_403)) {
            res.status(403).send(html403)
            return false
        }
        if (SessionState.isMessageActive(sessionId, Messages.NEXT_FRAG_403)) {
            res.status(403).send(html403)
           SessionState.setMessageValue(sessionId, Messages.NEXT_FRAG_403, false)
            return false
        }
        if (SessionState.isMessageActive(sessionId, Messages.NEXT_FRAG_TIMEOUT)) {
           SessionState.setMessageValue(sessionId, Messages.NEXT_FRAG_TIMEOUT, false)
            return false
        }
        if (SessionState.isMessageActive(sessionId, Messages.ALL_FRAG_DELAY)) {
            // random delay time between 1 and 21 seconds
            const delayTimeSeconds = Math.random() * 20 + 1
            setTimeout(() => res.redirect(remoteUrl), 1000 * delayTimeSeconds)
            return false
        }
        return true
    }
}

export default new Botcher()