import { Request, Response } from 'express'
import { OutgoingHttpHeaders, get } from 'http'
import request from 'request'
import LiveManifestServer from '../controllers/livemanifestserver'

export const remoteManifest = async(req: Request, res: Response) => {
    const remoteUrl = String(req.query.url)
    if (!remoteUrl || remoteUrl.indexOf('http') !== 0) {
        return res.status(400).send('Invalid or missing remote level url in query parameters')
    }

    const headers: OutgoingHttpHeaders = {}
    headers.MimeType = 'application/x-mpegURL'

    request(remoteUrl, (err, remoteResponse, body) => {
        if (err) {
            return res.status(502).send('Error requesting remote level url')
        } else {
            if (remoteResponse.statusCode >= 400) {
                return res.status(remoteResponse.statusCode).send(body)
            }
            const vodText = body
            const liveText = LiveManifestServer.getLiveLevel(vodText, remoteUrl)
            res.set(headers).status(200).send(liveText)
        }
    });
}
