export const possibleFragTags = [
  '#EXTINF',
  '#EXT-X-BYTERANGE',
  '#EXT-X-DISCONTINUITY',
  '#EXT-X-KEY',
  '#EXT-X-MAP',
  '#EXT-X-PROGRAM-DATE-TIME',
  '#EXT-X-DATERANGE',
]

export const possiblePlaylistTags = [
  '#EXTM3U',
  '#EXT-X-VERSION',
  '#EXT-X-TARGETDURATION',
  '#EXT-X-MEDIA-SEQUENCE',
  '#EXT-X-DISCONTINUITY-SEQUENCE',
  '#EXT-X-ENDLIST',
  '#EXT-X-PLAYLIST-TYPE',
  '#EXT-X-I-FRAMES-ONLY',
  '#EXT-X-INDEPENDENT-SEGMENTS',
  '#EXT-X-START',
]

export enum Tags {
  Inf = '#EXTINF',
  Discontinuity = '#EXT-X-DISCONTINUITY',
  Pdt = '#EXT-X-PROGRAM-DATE-TIME',
  Key = '#EXT-X-KEY',
  MediaSequence = '#EXT-X-MEDIA-SEQUENCE',
  DiscontinuitySequence = '#EXT-X-DISCONTINUITY-SEQUENCE',
  PlaylistType = '#EXT-X-PLAYLIST-TYPE',
  End = '#EXT-X-ENDLIST',
}

String.prototype.isTag = function (tag: Tags) {
  return this.startsWith(tag)
}

Array.prototype.findTag = function (tag: Tags) {
  return this.find((line: string) => line.isTag(tag))
}
