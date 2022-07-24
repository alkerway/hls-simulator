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
  return prevTime ? unixToPdtTag(prevTime + ms) : line
}

export const splitAttributes = (attributeList: string) => {
  const attributes = []
  let currentAttribute = ''
  let withinQuotes = false

  let canEscapeNextChar = false
  attributeList.split('').forEach((char) => {
    const isEscapingCurrentChar = canEscapeNextChar && char === '"'

    if (char === ',' && !withinQuotes) {
      attributes.push(currentAttribute)
      currentAttribute = ''
    } else {
      if (char === '"' && !isEscapingCurrentChar) {
        withinQuotes = !withinQuotes
      }
      currentAttribute += char
    }

    // escape next if character is backslash and backslash hasn't been escaped
    // by the last time looping
    canEscapeNextChar = (char === '\\' && !canEscapeNextChar)
  })
  attributes.push(currentAttribute)
  return attributes
}
