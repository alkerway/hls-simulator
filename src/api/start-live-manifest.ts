import { Request, Response } from 'express'
import LiveManifestServer from '../controllers/live-manifest-server'

export const startLiveManifest = async(req: Request, res: Response) => {
    LiveManifestServer.startLiveManifest()
    return res.status(200).send('Ok')
}
