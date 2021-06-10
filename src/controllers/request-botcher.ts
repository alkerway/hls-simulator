import { Request, Response } from 'express'
import { html403 } from '../utils'
import { Messages } from '../messages'
import MessageState from '../messages/message-state'

class Botcher {
    public botchLevel = (req: Request, res: Response, lastLiveLevel: string): boolean => {
        if (MessageState.vals[Messages.ALL_LEVEL_403]) {
            res.status(403).send(html403)
            return false
        }
        if (MessageState.vals[Messages.NEXT_LEVEL_403]) {
            res.status(403).send(html403)
            MessageState.vals[Messages.NEXT_LEVEL_403] = false
            return false
        }
        if (MessageState.vals[Messages.NEXT_LEVEL_TIMEOUT]) {
            MessageState.vals[Messages.NEXT_LEVEL_TIMEOUT] = false
            return false
        }
        if (MessageState.vals[Messages.LEVEL_STALL]) {
            res.status(200).send(lastLiveLevel)
            return false
        }
        return true
    }

    public botchFrag = (req: Request, res: Response, remoteUrl: string): boolean => {
        if (MessageState.vals[Messages.ALL_FRAG_403]) {
            res.status(403).send(html403)
            return false
        }
        if (MessageState.vals[Messages.NEXT_FRAG_403]) {
            res.status(403).send(html403)
            MessageState.vals[Messages.NEXT_FRAG_403] = false
            return false
        }
        if (MessageState.vals[Messages.NEXT_FRAG_TIMEOUT]) {
            MessageState.vals[Messages.NEXT_FRAG_TIMEOUT] = false
            return false
        }
        if (MessageState.vals[Messages.ALL_FRAG_DELAY]) {
            setTimeout(() => res.redirect(remoteUrl), 10000)
            return false
        }
        return true
    }
}

export default new Botcher()