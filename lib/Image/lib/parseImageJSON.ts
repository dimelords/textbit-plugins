export interface ImageDropData {
  uri?: string
  rel?: string
  type?: string
  byline: string
  text: string
  href: string
  proxy: string
  width: number
  height: number
}

export function parseImageJSON(data: string): ImageDropData | undefined {
  try {
    const parsed = JSON.parse(data)
    if (
      typeof parsed === 'object'
      && parsed !== null
      && typeof parsed.href === 'string'
      && parsed.href !== ''
    ) {
      return parsed as ImageDropData
    }
  } catch {
    // Not valid JSON
  }
  return undefined
}
