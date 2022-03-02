import { Messages } from "."

type MessageState = {[key in Messages]?: boolean}

type SessionStore = Record<string, {
    startTimeSeconds: number
    messageState: MessageState
}>

class SessionState {
    private originalMessages: MessageState = {
        [Messages.NEXT_FRAG_403]: false,
        [Messages.NEXT_FRAG_TIMEOUT]: false,
        [Messages.ALL_FRAG_403]: false,
        [Messages.ALL_FRAG_DELAY]: false,

        [Messages.NEXT_LEVEL_403]: false,
        [Messages.NEXT_LEVEL_TIMEOUT]: false,
        [Messages.ALL_LEVEL_403]: false,
        [Messages.LEVEL_STALL]: false,

        [Messages.STREAM_END]: false
    }

    private sessions: SessionStore = {}

    constructor() {
        // clear two day old sessions every two days so
        // things don't get out of hand
        const twoDaysInSeconds = 60 * 60 * 24 * 2
        setInterval(() => {
            const currentTime = Date.now() / 1000
            Object.keys(this.sessions).forEach((sessionId) => {
                if (currentTime - this.sessions[sessionId].startTimeSeconds > twoDaysInSeconds) {
                    delete this.sessions[sessionId]
                }
            })
        }, twoDaysInSeconds * 1000)
    }

    public isValidMessage = (message: Messages) => {
        return message in this.originalMessages
    }

    public isMessageActive = (sessionId: string, message: Messages): boolean => {
        return this.sessions[sessionId]?.messageState[message]
    }

    public sessionExists = (sessionId: string) => {
        return !!this.sessions[sessionId]
    }

    public startSession = (sessionId?: string): {sessionStartTime: number, sessionId: string} => {
        if (!sessionId) sessionId = this.generateSessionId()
        const sessionStartTime = Math.floor(Date.now() / 1000)
        if (this.sessions[sessionId]) {
            // restart but do not reset
            this.sessions[sessionId].startTimeSeconds = sessionStartTime
        } else {
            this.sessions[sessionId] = {
                startTimeSeconds: sessionStartTime,
                messageState: Object.assign({}, this.originalMessages)
            }
        }
        return {sessionStartTime, sessionId}
    }

    public getSessionTime = (sessionId: string) => {
        return this.sessions[sessionId] ? (Date.now() / 1000 -  this.sessions[sessionId].startTimeSeconds) : -1
    }

    public setMessageValue = (sessionId: string, messageKey: Messages, messageVal: boolean) => {
       if (this.sessions[sessionId]) {
            this.sessions[sessionId].messageState[messageKey] = messageVal
        }
    }

    public reset = (sessionId: string) => {
        if (this.sessions[sessionId]) {
            this.sessions[sessionId].messageState = Object.assign({}, this.originalMessages)
        }
    }

    private generateSessionId = (): string => {
        const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        const idLength = 3
        let id = ''
        for (const key of Array(3)) {
            id += letters[Math.floor(Math.random() * letters.length)]
        }
        return id
    }
}

export default new SessionState()