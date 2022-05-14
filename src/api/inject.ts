import { Request, Response } from 'express'
import SessionState from '../sessions/session-state'

export const addInjectedText = async(req: Request, res: Response) => {
    const sessionId = req.query.sessionId && String(req.query.sessionId)
    const injectedTextStart = SessionState.getSessionTime(sessionId)

    if (!SessionState.sessionExists(sessionId) || injectedTextStart < 0) {
        return res.status(400).send('No session found for id ' + sessionId + ' \n')
    }

    let errorMessage = ''
    if (!req.body) {
        errorMessage = 'No body on request'
    } else if (typeof(req.body) !== 'string') {
        errorMessage = 'Invalid request body type, expected a string'
    } else if (!req.body.trim()) {
        errorMessage = 'Empty request body'
    } else {
        const lines = req.body.split('\n')
        if (lines.find(line => line.trim() && !line.startsWith('#') && !line.startsWith('http'))) {
            errorMessage = 'Frag paths must be absolute'
        }
    }
    if (errorMessage) {
        return res.status(400).send(errorMessage + '\n')
    }

    SessionState.addInjectedText(sessionId, req.body, injectedTextStart)
    return res.status(200).send('ok\n')
}