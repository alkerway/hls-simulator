import { Request, Response } from 'express'
import MessageState from '../messages/message-state'
import { Messages } from '../messages'

export const listMessages  = async(req: Request, res: Response) => {
    const vals = Object.values(Messages)
    res.status(200).send(vals.join('\n'))
}