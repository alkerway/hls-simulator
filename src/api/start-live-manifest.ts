import { Request, Response } from 'express'
import SessionState from '../sessions/session-state'

export const startLiveManifest = async (req: Request, res: Response) => {
  const reqSessionId = req.query.sessionId && String(req.query.sessionId)
  const startOffset = (req.query.offset && Number(req.query.offset)) || 0
  const { sessionStartTime, sessionId, error } = SessionState.startSession(reqSessionId, startOffset)
  if (error) {
    return res.status(500).send('Could not create new session, try again later')
  } else {
    return res.status(200).send({ sessionStartTime, sessionId })
  }
}
