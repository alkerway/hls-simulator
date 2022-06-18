import { Request, Response } from 'express'
import { getHtmlErrorPage } from '../utils/errorstrings'
import { Messages } from '../sessions/messages'
import SessionState from '../sessions/session-state'
import { sleep } from '../utils/promisify'
import { getFragUrls } from '../parsers/get-frag-urls'

class Botcher {
  public botchLevel = async (
    res: Response,
    sessionId: string,
    remoteUrl: string,
    levelManifestText: string
  ): Promise<boolean> => {
    const messageState = SessionState.getMessageValues(sessionId)
    if (!messageState) return true

    // easier var names
    const {
      [Messages.NETWORK_FAULT]: networkFault,
      [Messages.SERVER_RESPONSE]: serverResponse,
      [Messages.FAIL_ONE_LEVEL]: failOneLevel,
      [Messages.FAIL_FRAGS_AT_ONE_LEVEL]: failFragsOneLevel,
    } = messageState

    if (failFragsOneLevel.active) {
      // set frag urls to fail then fail when the frags are requested in botchFrag
      if (!failFragsOneLevel.remoteLevelUrl) {
        SessionState.setMessageFailFragsAtOneLevel(sessionId, remoteUrl, new Set())
      }
      if (failFragsOneLevel.remoteLevelUrl === remoteUrl) {
        const remoteFragUrls = getFragUrls(levelManifestText, remoteUrl)
        SessionState.setMessageFailFragsAtOneLevel(sessionId, remoteUrl, remoteFragUrls)
      }
    }

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

    if (serverResponse.active && serverResponse.applyTo === 'level') {
      if (serverResponse.once) {
        SessionState.resetMessage(sessionId, Messages.SERVER_RESPONSE)
      }
      res.status(serverResponse.status).send(getHtmlErrorPage(serverResponse.status))
      return false
    }

    if (failOneLevel.active) {
      if (!failOneLevel.remoteLevelUrl) {
        SessionState.setMessageFailOneLevel(sessionId, remoteUrl)
      }

      if (failOneLevel.remoteLevelUrl === remoteUrl) {
        res.status(500).send(getHtmlErrorPage(500))
        return false
      }
    }

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
      res.status(serverResponse.status).send(getHtmlErrorPage(serverResponse.status))
      return false
    }

    const failFrags = messageState[Messages.FAIL_FRAGS_AT_ONE_LEVEL]
    if (failFrags.active && failFrags.failFragRemoteUrls.has(remoteUrl)) {
      res.status(500).send(getHtmlErrorPage(500))
      return false
    }

    return true
  }
}

export default new Botcher()
