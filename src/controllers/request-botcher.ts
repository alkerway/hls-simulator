import { Request, Response } from 'express'
import { getHtmlErrorPage } from '../utils/errorstrings'
import { Messages } from '../sessions/messages'
import SessionState from '../sessions/session-state'
import { sleep } from '../utils/promisify'
import { getFragUrls } from '../parsers/get-frag-urls'

export type LevelBotchResponse = {
  isSafe: boolean
  timerOverride?: number
  endManifest?: boolean
}

class Botcher {
  public botchLevel = async (
    res: Response,
    sessionId: string,
    remoteUrl: string,
    levelManifestText: string,
    remoteIsLive: boolean
  ): Promise<LevelBotchResponse> => {
    const botchResponse = {
      isSafe: true,
    }
    const messageState = SessionState.getMessageValues(sessionId)
    if (!messageState) return botchResponse

    // easier var names
    const {
      [Messages.NETWORK_FAULT]: networkFault,
      [Messages.SERVER_RESPONSE]: serverResponse,
      [Messages.FAIL_ONE_LEVEL]: failOneLevel,
      [Messages.FAIL_FRAGS_AT_ONE_LEVEL]: failFragsOneLevel,
      [Messages.ALL_LEVEL_STALL]: allLevelStall,
      [Messages.ONE_LEVEL_STALL]: oneLevelStall,
    } = messageState

    if (failFragsOneLevel.active) {
      let firstRequest = false
      // set frag urls to fail then fail when the frags are requested in botchFrag
      if (!failFragsOneLevel.remoteLevelUrl) {
        SessionState.setMessageFailFragsAtOneLevel(sessionId, remoteUrl, new Set())
        firstRequest = true
      }
      if (failFragsOneLevel.remoteLevelUrl === remoteUrl || firstRequest) {
        const remoteFragUrls = getFragUrls(levelManifestText, remoteUrl)
        SessionState.setMessageFailFragsAtOneLevel(sessionId, remoteUrl, remoteFragUrls)
      }
    }

    if (networkFault.active && networkFault.applyTo === 'level') {
      if (networkFault.once) {
        SessionState.resetMessage(sessionId, Messages.NETWORK_FAULT)
      }
      if (networkFault.fault === 'timeout') {
        return { ...botchResponse, isSafe: false }
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
      return { ...botchResponse, isSafe: false }
    }

    if (failOneLevel.active) {
      let firstRequest = false
      if (!failOneLevel.remoteLevelUrl) {
        SessionState.setMessageFailOneLevel(sessionId, remoteUrl)
        firstRequest = true
      }

      if (failOneLevel.remoteLevelUrl === remoteUrl || firstRequest) {
        res.status(500).send(getHtmlErrorPage(500))
        return { ...botchResponse, isSafe: false }
      }
    }

    if (allLevelStall.active) {
      if (remoteIsLive) {
        if (!allLevelStall.lastLiveLevel) {
          SessionState.setMessageAllLevelStall(sessionId, allLevelStall.stallTime, levelManifestText)
        }
        res.status(200).send(allLevelStall.lastLiveLevel || levelManifestText)
        return { ...botchResponse, isSafe: false }
      } else {
        return { ...botchResponse, timerOverride: allLevelStall.stallTime }
      }
    }

    if (oneLevelStall.active) {
      if (remoteIsLive) {
        if (!oneLevelStall.lastLiveLevel || !oneLevelStall.remoteLevelUrl) {
          SessionState.setMessageOneLevelStall(sessionId, oneLevelStall.stallTime, remoteUrl, levelManifestText)
        }
        if (oneLevelStall.remoteLevelUrl === remoteUrl && oneLevelStall.lastLiveLevel) {
          res.status(200).send(oneLevelStall.lastLiveLevel)
          return { ...botchResponse, isSafe: false }
        }
      } else {
        if (!oneLevelStall.remoteLevelUrl) {
          SessionState.setMessageOneLevelStall(sessionId, oneLevelStall.stallTime, remoteUrl, '')
        }
        if (oneLevelStall.remoteLevelUrl === remoteUrl) {
          return { ...botchResponse, timerOverride: oneLevelStall.stallTime }
        }
      }
    }

    return botchResponse
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
