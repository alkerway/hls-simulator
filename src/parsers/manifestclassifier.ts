export const whatIsThisManifest = (manifestText: string): 'master' | 'livelevel' | 'vodlevel' | 'notamanifest' => {
    if (!manifestText.includes('#EXTM3U')) {
        return 'notamanifest'
    } else if (manifestText.includes('#EXT-X-ENDLIST')) {
        return 'vodlevel'
    } else if (manifestText.includes('#EXTINF:')) {
        return 'livelevel'
    } else if (manifestText.includes('#EXT-X-STREAM-INF:')) {
        return 'master'
    }
    return 'notamanifest'
}