global.structuredClone = jest.fn((val) => {
  return JSON.parse(JSON.stringify(val))
})

const injectedManifestMock = jest.fn()
const getInjectionsMock = jest.fn(() => [])
const getSessionTimeMock = jest.fn(() => 302)
jest.mock('../src/sessions/session-state.ts', () => ({
  getInjections: getInjectionsMock,
  getSessionTime: getSessionTimeMock,
  sessionExists: jest.fn((id) => id === '9FY'),
  addInjectedManifest: injectedManifestMock,
}))

import ManifestServer from '../src/controllers/manifest-server'
import { addInjectedText } from '../src/api/add-custom-text'
import {
  remoteVodLevelAES,
  proxyVodLevelAES,
  injectedTwoFrags,
  remoteVodLevelAESUrl,
  proxyVodToVodInjectedText,
  proxyVodToLiveInjectedText,
  remoteMaster,
  proxyMaster,
  remoteVodLevel,
  proxyVodLevel,
} from './manifests'

describe('Test Master Proxy', () => {
  test('Proxy Master Manifest', () => {
    const result = ManifestServer.getMaster(remoteMaster, {
      sessionId: '9FY',
      remoteUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    })
    expect(result).toBe(proxyMaster)
  })
})

describe('Test Level Proxy', () => {
  test('Proxy, vod to live', () => {
    getSessionTimeMock.mockImplementationOnce(() => 212)
    const result = ManifestServer.getLevel(remoteVodLevel, false, {
      sessionId: '9FY',
      remoteUrl: 'https://playertest.longtailvideo.com/adaptive/captions/playlist.m3u8',
    })
    expect(result).toBe(proxyVodLevel)
  })
  test('Proxy, vod to live, dvr, AES encryption', () => {
    const result = ManifestServer.getLevel(remoteVodLevelAES, false, {
      dvrWindowSeconds: 30,
      sessionId: '9FY',
      remoteUrl: remoteVodLevelAESUrl,
    })
    expect(result).toBe(proxyVodLevelAES)
  })
  test('Injected Text Parsed Successfully', () => {
    addInjectedText(
      {
        query: {
          sessionId: '9FY',
          startAfter: '20',
        },
        body: injectedTwoFrags,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      {
        status: () => ({
          send: () => {},
        }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any  
      } as any
    )
    expect(injectedManifestMock).toHaveBeenCalledWith(
      '9FY',
      expect.objectContaining({
        frags: expect.arrayContaining([
          expect.objectContaining({
            url: 'custom_frag_0?sessionId=9FY&url=https%3A%2F%2Ftest-streams.mux.dev%2Ftest_001%2Fstream_800k_48k_640x360_000.ts',
          }),
        ]),
      }),
      20
    )
  })
  test('VOD to VOD Injected Text', () => {
    const customManifestLastInjected = injectedManifestMock.mock.calls[0][1]
    getInjectionsMock.mockImplementation(() => {
      return [
        {
          fallbackStartTime: 302,
          startTimeOrMediaSequence: 20,
          manifest: customManifestLastInjected,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ] as any
    })
    const result = ManifestServer.getLevel(remoteVodLevelAES, false, {
      keepVod: true,
      sessionId: '9FY',
      remoteUrl: remoteVodLevelAESUrl,
    })
    expect(result).toBe(proxyVodToVodInjectedText)
  })
  test('VOD to Live Injected Text', () => {
    const customManifestLastInjected = injectedManifestMock.mock.calls[0][1]
    getInjectionsMock.mockImplementation(() => {
      return [
        {
          fallbackStartTime: 260,
          startTimeOrMediaSequence: 260,
          manifest: customManifestLastInjected,
        },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ] as any
    })
    const result = ManifestServer.getLevel(remoteVodLevelAES, false, {
      keepVod: false,
      dvrWindowSeconds: 60,
      sessionId: '9FY',
      remoteUrl: remoteVodLevelAESUrl,
    })
    expect(result).toBe(proxyVodToLiveInjectedText)
  })
})
