import { Request, Response } from 'express'
import { Messages } from '../sessions/messages'
import SessionState from '../sessions/session-state'

export const deliver = async(req: Request, res: Response) => {
    const message = String(req.query.msg) as Messages
    const sessionId = String(req.query.sessionId)

    if (!SessionState.sessionExists(sessionId)) {
        return res.status(400).send('No session found for id ' + sessionId)
    }

    if (SessionState.isValidMessage(message)) {
        SessionState.setMessageValue(sessionId, message, true)
        res.status(200).send('ok')
    } else if (message === Messages.RESET) {
        SessionState.reset(sessionId)
        res.status(200).send('ok')
    } else {
        res.status(400).send('Invalid or missing message passed in query params')
    }
}