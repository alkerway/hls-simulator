import { Request, Response } from 'express'
import { baseHtmlPage } from '../utils/errorstrings'
import { Messages } from '../sessions/messages'
import SessionState from '../sessions/session-state'
import { sleep } from '../utils/promisify'

class Botcher {
  public botchLevel = async (req: Request, res: Response, sessionId: string): Promise<boolean> => {
    const messageState = SessionState.getMessageValues(sessionId)
    if (!messageState) return true

    const networkFault = messageState[Messages.NETWORK_FAULT]
    if (networkFault.active && networkFault.applyTo === 'level') {
      if (networkFault.once) {
        SessionState.resetMessage(sessionId, Messages.NETWORK_FAULT)
      }
      if (networkFault.fault === 'timeout') {
        return false
      } else if (networkFault.fault === 'shortDelay') {
        const delayTimeSeconds = Math.random() * 5 + 1
        await sleep(delayTimeSeconds * 1000)
      } else if (networkFault.fault === 'longDelay') {
        const delayTimeSeconds = Math.random() * 10 + 10
        await sleep(delayTimeSeconds * 1000)
      }
    }

    const serverResponse = messageState[Messages.SERVER_RESPONSE]
    if (serverResponse.active && serverResponse.applyTo === 'level') {
      if (serverResponse.once) {
        SessionState.resetMessage(sessionId, Messages.SERVER_RESPONSE)
      }
      const errorPageWithStatus = baseHtmlPage.replace(/%%status%%/g, String(serverResponse.status))
      res.status(serverResponse.status).send(errorPageWithStatus)
      return false
    }
    // if (SessionState.isMessageActive(sessionId, Messages.LEVEL_STALL)) {
    //   res.status(200).send(SessionState.getLastLevel(sessionId))
    //   return false
    // }
    return true
  }

  public botchFrag = async (req: Request, res: Response, sessionId: string, remoteUrl: string): Promise<boolean> => {
    const messageState = SessionState.getMessageValues(sessionId)
    if (!messageState) return true

    const networkFault = messageState[Messages.NETWORK_FAULT]
    if (networkFault?.active && networkFault.applyTo === 'frag') {
      if (networkFault.once) {
        SessionState.resetMessage(sessionId, Messages.NETWORK_FAULT)
      }
      if (networkFault.fault === 'timeout') {
        return false
      } else if (networkFault.fault === 'shortDelay') {
        const delayTimeSeconds = Math.random() * 5 + 1
        await sleep(delayTimeSeconds * 1000)
      } else if (networkFault.fault === 'longDelay') {
        const delayTimeSeconds = Math.random() * 10 + 10
        await sleep(delayTimeSeconds * 1000)
      }
    }

    const serverResponse = messageState[Messages.SERVER_RESPONSE]
    if (serverResponse.active && serverResponse.applyTo === 'frag') {
      if (serverResponse.once) {
        SessionState.resetMessage(sessionId, Messages.SERVER_RESPONSE)
      }
      const errorPageWithStatus = baseHtmlPage.replace(/%%status%%/g, String(serverResponse.status))
      res.status(serverResponse.status).send(errorPageWithStatus)
      return false
    }
    return true
  }
}

export default new Botcher()
