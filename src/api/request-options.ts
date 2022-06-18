export type SimulatorOptions = {
  keepVod?: boolean
  dvrWindowSeconds?: number
  sessionId: string
  remoteUrl: string
  sessionTimerOverride?: number
  endManifest?: boolean
}
