import { Request, Response } from 'express'
import { Messages } from '../sessions/messages'

export const listMessages = async (req: Request, res: Response) => {
  const vals = Object.values(Messages)
  res.status(200).send(vals.join('\n') + '\n')
}
