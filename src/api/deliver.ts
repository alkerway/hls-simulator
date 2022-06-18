import { Request, Response } from 'express'
import { Messages } from '../sessions/messages'
import SessionState from '../sessions/session-state'

export const deliver = async (req: Request, res: Response) => {
  const message = String(req.query.msg) as Messages
  const sessionId = String(req.query.sessionId)

  if (!SessionState.sessionExists(sessionId)) {
    return res.status(400).send('No session found for id ' + sessionId)
  }

  const sessionTimeOfRequest = SessionState.getSessionTime(sessionId)

  let messageIsValid = true
  switch (message) {
    case Messages.ALL_LEVEL_STALL:
      SessionState.setMessageAllLevelStall(sessionId, sessionTimeOfRequest, '')
      break
    case Messages.ONE_LEVEL_STALL:
      SessionState.setMessageOneLevelStall(sessionId, sessionTimeOfRequest, '', '')
      break
    case Messages.FAIL_ONE_LEVEL:
      SessionState.setMessageFailOneLevel(sessionId, '')
      break
    case Messages.FAIL_FRAGS_AT_ONE_LEVEL:
      SessionState.setMessageFailFragsAtOneLevel(sessionId, '', new Set())
      break
    case Messages.SERVER_RESPONSE:
      const queryStatus = Number(req.query.status)
      const status = !isNaN(queryStatus) && queryStatus >= 400 && queryStatus < 600 ? queryStatus : 404
      const applyTo = String(req.query.applyTo) === 'level' ? 'level' : 'frag'
      const applyOnce = req.query.once ? String(req.query.once) === 'true' || String(req.query.once) === '1' : false
      SessionState.setMessageServerResponse(sessionId, status, applyTo, applyOnce)
      break
    case Messages.NETWORK_FAULT:
      const queryFault = String(req.query.fault)
      const fault = ['timeout', 'shortDelay', 'longDelay'].includes(queryFault)
        ? (queryFault as 'timeout' | 'shortDelay' | 'longDelay')
        : 'timeout'
      const networkApplyTo = String(req.query.applyTo) === 'level' ? 'level' : 'frag'
      const networkApplyOnce = req.query.once
        ? String(req.query.once) === 'true' || String(req.query.once) === '1'
        : false
      SessionState.setMessageNetworkFault(sessionId, fault, networkApplyTo, networkApplyOnce)
      break
    case Messages.STREAM_END:
      SessionState.setMessageStreamEnd(sessionId, sessionTimeOfRequest)
      break
    case Messages.RESET:
      SessionState.reset(sessionId)
      break
    default:
      messageIsValid = false
      break
  }
  if (messageIsValid) {
    res.status(200).send(SessionState.getMessageValues(sessionId))
  } else {
    res.status(400).send('Invalid or missing message passed in query params')
  }
}
