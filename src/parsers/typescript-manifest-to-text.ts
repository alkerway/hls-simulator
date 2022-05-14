import { LevelManifest } from "./text-manifest-to-typescript";

export const typescriptToText = (manifest: LevelManifest): string => {
    const manifestLines: string[] = [];
    manifest.headerTagLines.forEach((line) => manifestLines.push(line))
    manifest.frags.forEach((frag) => {
        frag.tagLines.forEach((line) => manifestLines.push(line))
        manifestLines.push(frag.url)
    })
    if (!manifest.isLive) manifestLines.push('#EXT-X-ENDLIST')
    return manifestLines.join('\n')
}