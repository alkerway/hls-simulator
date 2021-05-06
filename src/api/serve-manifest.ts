import { Request, Response } from 'express'
import LiveManifestServer from '../controllers/livemanifestserver'

export const serveManifest = async(req: Request, res: Response) => {
    LiveManifestServer.startLiveManifest()
    return res.status(200).send('Ok')
}
