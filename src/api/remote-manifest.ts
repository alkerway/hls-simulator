import { Request, response, Response } from 'express'
import { OutgoingHttpHeaders, get } from 'http'
import path from 'path'
import request from 'request'
import { whatIsThisManifest } from '../parsers/manifestclassifier'
import ManifestServer from '../controllers/manifest-server'
import Botcher from '../controllers/request-botcher'
import SessionState from '../sessions/session-state'
import { SimulatorOptions } from './request-options'

export const remoteManifest = async (req: Request, res: Response) => {
  const remoteUrl = String(req.query.url)
  if (!remoteUrl || remoteUrl.indexOf('http') !== 0) {
    return res.status(400).send('Invalid or missing remote level url in query parameters\n')
  }

  const extension = path.extname(remoteUrl)
  const reqIsFrag = ['.ts', '.mp4', '.fmp4'].includes(extension.toLowerCase())
  const reqIsManifest = extension.toLowerCase() === '.m3u8'

  const sessionId = String(req.query.sessionId)

  if (!SessionState.sessionExists(sessionId)) {
    return res.status(400).send('No session found for id ' + sessionId)
  }

  if (reqIsManifest) {
    const headers: OutgoingHttpHeaders = {}
    headers.MimeType = 'application/x-mpegURL'
    res.set(headers)

    request(remoteUrl, (err, remoteResponse, body) => {
      let responseStatus = 200
      let responseBody = ''
      let shouldSendResponse = true
      if (err) {
        responseStatus = 502
        responseBody = 'Error requesting remote manifest url'
      } else if (remoteResponse.statusCode >= 400) {
        responseStatus = remoteResponse.statusCode
        responseBody = body
      } else {
        const manifestType = whatIsThisManifest(body)
        const simulatorOptions: SimulatorOptions = {
          keepVod: req.query.keepVod === 'true',
          dvrWindowSeconds: Number(req.query.dvrWindowSeconds) ?? 0,
          remoteUrl,
          sessionId,
        }
        switch (manifestType) {
          case 'master':
            responseStatus = 200
            responseBody = ManifestServer.getMaster(body, simulatorOptions)
            break
          case 'vodlevel':
          case 'livelevel':
            const isSafe = Botcher.botchLevel(req, res, sessionId)
            if (isSafe) {
              const remoteManifestText = body
              responseStatus = 200
              responseBody = ManifestServer.getLevel(remoteManifestText, manifestType === 'livelevel', simulatorOptions)
            } else {
              shouldSendResponse = false
            }
            break
          case 'notamanifest':
          default:
            responseStatus = 400
            responseBody = 'Error parsing remote response - not a valid HLS manifest'
            break
        }
      }
      if (shouldSendResponse) {
        res.status(responseStatus).send(responseBody)
      }
    })
  } else if (reqIsFrag) {
    const isSafe = Botcher.botchFrag(req, res, sessionId, remoteUrl)
    if (isSafe) {
      res.redirect(remoteUrl)
    }
  } else {
    res.status(400).send('Request is not for manifest or fragment\n')
  }
}
