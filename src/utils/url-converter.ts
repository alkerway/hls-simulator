export const getFullUrl = (manifestLine: string, remoteUrl: string): string => {
    let fullUrl;
    if (manifestLine.startsWith('http')) {
        fullUrl = manifestLine
    } else {
        const pathParts = remoteUrl
            .split('?')[0]
            .split('/')
            .slice(0, manifestLine.startsWith('/') ? 3 : -1)
            .join('/')
        fullUrl = `${pathParts}/${manifestLine}`
    }
    return fullUrl
}