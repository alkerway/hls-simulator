import { Request, Response } from 'express'
import { html403 } from '../utils/errorstrings'
import { Messages } from '../sessions/messages'
import SessionState from '../sessions/session-state'
import { sleep } from '../utils/promisify'

class Botcher {
  public botchLevel = async (req: Request, res: Response, sessionId: string): Promise<boolean> => {
    const messageState = SessionState.getMessageValues(sessionId)
    if (!messageState) return true

    const networkFault = messageState[Messages.NETWORK_FAULT]
    if (networkFault?.active && networkFault.applyTo === 'level') {
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
    // if (SessionState.isMessageActive(sessionId, Messages.ALL_LEVEL_403)) {
    //   res.status(403).send(html403)
    //   return false
    // }
    // if (SessionState.isMessageActive(sessionId, Messages.NEXT_LEVEL_403)) {
    //   res.status(403).send(html403)
    //   SessionState.setMessageValue(sessionId, Messages.NEXT_LEVEL_403, false)
    //   return false
    // }
    // if (SessionState.isMessageActive(sessionId, Messages.NEXT_LEVEL_TIMEOUT)) {
    //   SessionState.setMessageValue(sessionId, Messages.NEXT_LEVEL_TIMEOUT, false)
    //   return false
    // }
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
    // if (SessionState.isMessageActive(sessionId, Messages.ALL_FRAG_403)) {
    //   res.status(403).send(html403)
    //   return false
    // }
    // if (SessionState.isMessageActive(sessionId, Messages.NEXT_FRAG_403)) {
    //   res.status(403).send(html403)
    //   SessionState.setMessageValue(sessionId, Messages.NEXT_FRAG_403, false)
    //   return false
    // }
    // if (SessionState.isMessageActive(sessionId, Messages.NEXT_FRAG_TIMEOUT)) {
    //   SessionState.setMessageValue(sessionId, Messages.NEXT_FRAG_TIMEOUT, false)
    //   return false
    // }
    // if (SessionState.isMessageActive(sessionId, Messages.ALL_FRAG_DELAY)) {
    //   // random delay time between 1 and 21 seconds
    //   const delayTimeSeconds = Math.random() * 20 + 1
    //   setTimeout(() => res.redirect(remoteUrl), 1000 * delayTimeSeconds)
    //   return false
    // }
    return true
  }
}

export default new Botcher()
