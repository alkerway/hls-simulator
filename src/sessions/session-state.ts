import { LevelManifest } from '../parsers/text-manifest-to-typescript'
import { Messages } from './messages'

type MessageState = {
  [Messages.ALL_LEVEL_STALL]: { active: boolean; lastLiveLevel: string; stallTime: number }
  [Messages.ONE_LEVEL_STALL]: { active: boolean; lastLiveLevel: string; remoteLevelUrl: string; stallTime: number }
  [Messages.FAIL_ONE_LEVEL]: { active: boolean; remoteLevelUrl: string }
  [Messages.FAIL_FRAGS_AT_ONE_LEVEL]: { active: boolean; remoteLevelUrl: string; failFragRemoteUrls: Set<string> }
  [Messages.SERVER_RESPONSE]: { active: boolean; status: number; applyTo: 'frag' | 'level'; once: boolean }
  [Messages.NETWORK_FAULT]: {
    active: boolean
    fault: 'timeout' | 'shortDelay' | 'longDelay'
    applyTo: 'frag' | 'level'
    once: boolean
  }
  [Messages.STREAM_END]: { active: boolean; endTime: number }
  [Messages.RESET]: { active: boolean }
}

export type CustomManifest = {
  startTimeOrMediaSequence: number
  fallbackStartTime: number
  manifest: LevelManifest
}

export type Session = {
  startTimeSeconds: number
  messageState: MessageState
  injections: CustomManifest[]
  lastLevel: string
  deleteTimer: NodeJS.Timeout | null
}

type SessionStore = Record<string, Session>

class SessionState {
  private originalMessages: MessageState = {
    [Messages.ALL_LEVEL_STALL]: { active: false, stallTime: -1, lastLiveLevel: '' },
    [Messages.ONE_LEVEL_STALL]: { active: false, stallTime: -1, lastLiveLevel: '', remoteLevelUrl: '' },
    [Messages.FAIL_ONE_LEVEL]: { active: false, remoteLevelUrl: '' },
    [Messages.FAIL_FRAGS_AT_ONE_LEVEL]: { active: false, remoteLevelUrl: '', failFragRemoteUrls: new Set() },
    [Messages.SERVER_RESPONSE]: { active: false, status: -1, applyTo: 'frag', once: false },
    [Messages.NETWORK_FAULT]: {
      active: false,
      fault: 'timeout',
      applyTo: 'frag',
      once: false,
    },
    [Messages.STREAM_END]: { active: false, endTime: -1 },
    [Messages.RESET]: { active: false },
  }

  private sessions: SessionStore = {}

  public isValidMessage = (message: Messages) => {
    return message in this.originalMessages
  }

  public isMessageActive = (sessionId: string, message: Messages): boolean => {
    return !!this.sessions[sessionId]?.messageState[message]
  }

  public getMessageValues = (sessionId: string): MessageState | undefined => {
    return structuredClone(this.sessions[sessionId]?.messageState)
  }

  public sessionExists = (sessionId: string) => {
    return !!this.sessions[sessionId]
  }

  public startSession = (
    sessionId: string | undefined,
    startOffset: number
  ): { sessionStartTime: number; sessionId: string } => {
    if (!sessionId) sessionId = this.generateSessionId()
    const sessionStartTime = Math.floor(Date.now() / 1000 - Math.max(startOffset, 0))
    if (this.sessions[sessionId]) {
      // restart but do not reset
      this.sessions[sessionId].startTimeSeconds = sessionStartTime
    } else {
      this.sessions[sessionId] = {
        startTimeSeconds: sessionStartTime,
        messageState: structuredClone(this.originalMessages),
        injections: [],
        lastLevel: '',
        deleteTimer: null,
      }
    }
    this.setupSessionClear(sessionId)
    return { sessionStartTime, sessionId }
  }

  public getSessionTime = (sessionId: string) => {
    return this.sessions[sessionId] ? Date.now() / 1000 - this.sessions[sessionId].startTimeSeconds : -1
  }

  public setMessageAllLevelStall = (sessionId: string, stallTime: number, lastLiveLevel: string) => {
    if (!this.sessions[sessionId]) return
    this.sessions[sessionId].messageState[Messages.ALL_LEVEL_STALL] = { active: true, stallTime, lastLiveLevel }
  }

  public setMessageOneLevelStall = (
    sessionId: string,
    stallTime: number,
    remoteLevelUrl: string,
    lastLiveLevel: string
  ) => {
    if (!this.sessions[sessionId]) return
    this.sessions[sessionId].messageState[Messages.ONE_LEVEL_STALL] = {
      active: true,
      stallTime,
      lastLiveLevel,
      remoteLevelUrl,
    }
  }

  public setMessageFailOneLevel = (sessionId: string, remoteLevelUrl: string) => {
    if (!this.sessions[sessionId]) return
    this.sessions[sessionId].messageState[Messages.FAIL_ONE_LEVEL] = { active: true, remoteLevelUrl }
  }

  public setMessageFailFragsAtOneLevel = (
    sessionId: string,
    remoteLevelUrl: string,
    failFragRemoteUrls: Set<string>
  ) => {
    if (!this.sessions[sessionId]) return
    const unionOldAndNew = this.sessions[sessionId].messageState[Messages.FAIL_FRAGS_AT_ONE_LEVEL].failFragRemoteUrls
    failFragRemoteUrls.forEach((url) => unionOldAndNew.add(url))
    this.sessions[sessionId].messageState[Messages.FAIL_FRAGS_AT_ONE_LEVEL] = {
      active: true,
      remoteLevelUrl,
      failFragRemoteUrls: unionOldAndNew,
    }
  }

  public setMessageServerResponse = (sessionId: string, status: number, applyTo: 'frag' | 'level', once: boolean) => {
    if (!this.sessions[sessionId]) return
    this.sessions[sessionId].messageState[Messages.SERVER_RESPONSE] = { active: true, status, applyTo, once }
  }

  public setMessageNetworkFault = (
    sessionId: string,
    fault: 'timeout' | 'shortDelay' | 'longDelay',
    applyTo: 'frag' | 'level',
    once: boolean
  ) => {
    if (!this.sessions[sessionId]) return
    this.sessions[sessionId].messageState[Messages.NETWORK_FAULT] = { active: true, fault, applyTo, once }
  }

  public setMessageStreamEnd = (sessionId: string, endTime: number) => {
    if (!this.sessions[sessionId]) return
    this.sessions[sessionId].messageState[Messages.STREAM_END] = { active: true, endTime }
  }

  public resetMessage = (sessionId: string, message: Messages) => {
    if (!this.sessions[sessionId]) return
    this.sessions[sessionId].messageState[message] = structuredClone(this.originalMessages)[message] as any
  }

  public addInjectedManifest = (sessionId: string, manifest: LevelManifest, startPositionFromQuery: number) => {
    if (this.sessions[sessionId]) {
      this.sessions[sessionId].injections.push({
        startTimeOrMediaSequence: isNaN(startPositionFromQuery) ? -1 : startPositionFromQuery,
        fallbackStartTime: this.getSessionTime(sessionId),
        manifest,
      })
    }
  }

  public clearInjectedManifests = (sessionId: string) => {
    if (this.sessions[sessionId]) {
      this.sessions[sessionId].injections = []
    }
  }

  public getInjections = (sessionId: string): CustomManifest[] => {
    return this.sessions[sessionId].injections
  }

  public reset = (sessionId: string) => {
    if (this.sessions[sessionId]) {
      this.sessions[sessionId].messageState = structuredClone(this.originalMessages)
    }
  }

  public setupSessionClear = (sessionId: string) => {
    if (this.sessions[sessionId]) {
      const { deleteTimer } = this.sessions[sessionId]
      if (deleteTimer) {
        clearTimeout(deleteTimer)
      }
      this.sessions[sessionId].deleteTimer = setTimeout(() => {
        // clear session after a day
        delete this.sessions[sessionId]
      }, 24 * 60 * 60 * 1000)
    }
  }

  private generateSessionId = (): string => {
    const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let id = ''
    for (const key of Array(3)) {
      id += letters[Math.floor(Math.random() * letters.length)]
    }
    return id
  }
}

export default new SessionState()
