import { Request, Response } from 'express'
import { OutgoingHttpHeaders } from 'http'
import path from 'path'
import fs from 'fs'
import { html404 } from '../utils'
import LiveManifestServer from '../controllers/livemanifestserver'

export const staticManifest = async(req: Request, res: Response) => {
    const moduleDir = path.parse(__dirname)
    const extension = path.extname(req.url)
    const reqIsFrag = extension.toLowerCase() === '.ts'
    const reqIsManifest = extension.toLowerCase() === '.m3u8'
    const headers: OutgoingHttpHeaders = {}
    if (reqIsFrag || reqIsManifest) {
        headers.MimeType = extension === '.ts' ? 'video/MP2T' : 'application/x-mpegURL'
    }
    if (reqIsManifest) {
        try {
            const vodText = fs.readFileSync(moduleDir.dir + req.url, 'utf-8')
            const liveText = LiveManifestServer.getLiveLevel(vodText)
            res.set(headers).status(200).send(liveText)
        } catch (err) {
            res.status(404).write(html404)
            res.end()
        }
    } else {
        const fileOptions = {
            root: moduleDir.dir,
            headers
        }
        return res.sendFile(req.url, fileOptions, (err: Error) => {
            if (err) {
                console.log('asdf', err)
                res.status(404).write(html404)
                res.end()
            }
        })
    }
}
