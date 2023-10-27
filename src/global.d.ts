import { Tags } from './utils/HlsTags'

export {}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Array<T> {
    findTag(tag: Tags): Tags | undefined
  }

  interface String {
    isTag(tag: Tags): boolean
  }
}
