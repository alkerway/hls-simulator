import { Request, Response } from 'express'
import { OutgoingHttpHeaders } from 'http'
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

  const extension = path.extname(remoteUrl.split('?')[0])
  const reqIsFrag = ['.ts', '.mp4', '.fmp4'].includes(extension.toLowerCase())
  const reqIsManifest = ['.m3u8', '.vtt'].includes(extension.toLowerCase())

  const sessionId = String(req.query.sessionId)

  if (!SessionState.sessionExists(sessionId)) {
    return res.status(400).send('No session found for id ' + sessionId)
  }

  if (reqIsManifest) {
    const headers: OutgoingHttpHeaders = {}
    headers.MimeType = 'application/x-mpegURL'
    res.set(headers)

    request(remoteUrl, async (err, remoteResponse, body) => {
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
        let manifestText = body
        let manifestType = whatIsThisManifest(body)
        if (manifestType === 'notamanifest') {
          try {
            const decodedResponse = Buffer.from(body, 'base64').toString()
            if (whatIsThisManifest(decodedResponse) !== 'notamanifest') {
              manifestType = whatIsThisManifest(decodedResponse)
              manifestText = decodedResponse
            }
            // eslint-disable-next-line no-empty
          } catch (err) {}
        }
        const simulatorOptions: SimulatorOptions = {
          keepVod: req.query.keepVod === 'true',
          dvrWindowSeconds: Number(req.query.dvrWindowSeconds) || 0,
          remoteUrl,
          sessionId,
        }
        switch (manifestType) {
          case 'master':
            responseStatus = 200
            responseBody = ManifestServer.getMaster(manifestText, simulatorOptions)
            break
          case 'vodlevel':
          case 'livelevel': {
            const { isSafe, timerOverride, endManifest } = await Botcher.botchLevel(
              res,
              sessionId,
              remoteUrl,
              manifestText,
              manifestType === 'livelevel',
            )
            if (isSafe) {
              if (timerOverride) simulatorOptions.sessionTimerOverride = timerOverride
              if (endManifest) simulatorOptions.endManifest = endManifest

              const remoteManifestText = manifestText
              responseStatus = 200
              responseBody = ManifestServer.getLevel(remoteManifestText, manifestType === 'livelevel', simulatorOptions)
            } else {
              shouldSendResponse = false
            }
            break
          }
          case 'webvtt':
            responseStatus = 200
            shouldSendResponse = false
            res.redirect(remoteUrl)
            break
          case 'notamanifest':
          default:
            responseStatus = 400
            responseBody = 'Error parsing remote response - not a valid HLS manifest'
            break
        }
      }
      if (shouldSendResponse) {
        res.set('Content-type', 'application/vnd.apple.mpegurl')
        res.status(responseStatus).send(responseBody)
      }
    })
  } else if (reqIsFrag) {
    const isSafe = await Botcher.botchFrag(req, res, sessionId, remoteUrl)
    if (isSafe) {
      res.redirect(remoteUrl)
    }
  } else {
    res.status(400).send('Request is not for manifest or fragment\n')
  }
}
