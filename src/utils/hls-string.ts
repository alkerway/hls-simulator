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
