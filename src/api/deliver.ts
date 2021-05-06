import { Request, Response } from 'express'
import MessageState from '../messages/message-state'
import { Messages } from '../messages'

export const deliver = async(req: Request, res: Response) => {
    const message = String(req.query.msg)
    if (message in MessageState.vals) {
        MessageState.vals[message] = true
        res.status(200).send('ok')
    } else if (message === Messages.RESET) {
        MessageState.reset()
        res.status(200).send('ok')
    } else {
        res.status(400).send('Invalid or missing message passed in query params')
    }
}