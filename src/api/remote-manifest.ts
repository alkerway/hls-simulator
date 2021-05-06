import { Request, Response } from 'express'
import { OutgoingHttpHeaders, get } from 'http'
import path from 'path'
import request from 'request'
import LiveManifestServer from '../controllers/live-manifest-server'
import Botcher from '../controllers/request-botcher'

export const remoteManifest = async(req: Request, res: Response) => {
    const extension = path.extname(req.url)
    const reqIsFrag = extension.toLowerCase() === '.ts'
    const reqIsManifest = extension.toLowerCase() === '.m3u8'

    const remoteUrl = String(req.query.url)
    if (!remoteUrl || remoteUrl.indexOf('http') !== 0) {
        return res.status(400).send('Invalid or missing remote level url in query parameters')
    }
    if (reqIsManifest) {
        const headers: OutgoingHttpHeaders = {}
        headers.MimeType = 'application/x-mpegURL'
        res.set(headers)

        const isSafe = Botcher.botchLevel(req, res, LiveManifestServer.lastLiveLevel)

        if (isSafe) {
            request(remoteUrl, (err, remoteResponse, body) => {
                if (err) {
                    return res.status(502).send('Error requesting remote level url')
                } else {
                    if (remoteResponse.statusCode >= 400) {
                        return res.status(remoteResponse.statusCode).send(body)
                    }
                    const vodText = body
                    const liveText = LiveManifestServer.getLiveLevel(vodText, remoteUrl)
                    res.status(200).send(liveText)
                }
            })
        }
    } else if (reqIsFrag) {
        const isSafe = Botcher.botchFrag(req, res)

        if (isSafe) {
            res.redirect(remoteUrl)
        }
    }
}
