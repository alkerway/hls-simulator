import { Request, Response } from 'express'

export const deliver = async(req: Request, res: Response) => {
    const message = req.query.msg
    console.log(message)
    res.status(200).send(message)
}