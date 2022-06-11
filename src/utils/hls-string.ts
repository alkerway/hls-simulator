import { Tags } from './HlsTags'

export const getExtInfDuration = (infLine: string): number => {
  const durationRegex = /EXTINF\:(.+),/
  const match = durationRegex.exec(infLine)
  if (match && match[1]) {
    return Number(match[1])
  }
  return 0
}

export const pdtTagToUnix = (tag: string): number | null => {
  const isoString = tag.slice('#EXT-X-PROGRAM-DATE-TIME:'.length)
  try {
    const unixTime = new Date(isoString).getTime()
    return unixTime
  } catch (err) {
    console.warn('Error converting pdt string to unix', err)
  }
  return null
}

export const unixToPdtTag = (unixTime: number) => {
  const isoString = new Date(unixTime).toISOString()
  return `${Tags.Pdt}:${isoString}`
}

export const addMsToPdtLine = (line: string, ms: number) => {
  const prevTime = pdtTagToUnix(line)
  const newTime = prevTime + ms
  return unixToPdtTag(newTime)
}
