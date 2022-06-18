import { getFullUrl } from '../utils/url-converter'

export const getFragUrls = (levelManifestText: string, levelRemoteUrl: string) => {
  return levelManifestText.split('\n').reduce((fragUrls, line) => {
    if (!line.startsWith('#') && line) {
      fragUrls.add(getFullUrl(line, levelRemoteUrl))
    }
    return fragUrls
  }, new Set<string>())
}
