import { Request, Response } from 'express'
import SessionState from '../sessions/session-state'

export const startLiveManifest = async(req: Request, res: Response) => {
    const reqSessionId = req.query.sessionId && String(req.query.sessionId)
    const { sessionStartTime, sessionId } = SessionState.startSession(reqSessionId)
    return res.status(200).send({sessionStartTime, sessionId})
}
