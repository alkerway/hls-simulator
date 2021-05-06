import { Request, Response } from 'express'

export const serveManifest = async(req: Request, res: Response) => {
    console.log(__dirname)
    return res.status(200).send('Ok')
}
