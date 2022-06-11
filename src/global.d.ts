import { Tags } from './utils/HlsTags'

export {}

declare global {
  interface Array<T> {
    findTag(tag: Tags): Tags
  }

  interface String {
    isTag(tag: Tags): boolean
  }
}
