import { type VisualPropertiesInterface } from '../types'

export function parseImageId(data: string): string | undefined {
  // Is it a URL?
  if (URL.canParse(data)) {
    const url = new URL(data)

    // Does it have a url parameter?
    const urlParam = url.searchParams.get('url')

    // Value to parse ID from
    const value = urlParam || url.toString()
    return idMatcher(value)
  }

  // Is it JSON? Use the href
  const json = parseJSON(data)
  if (json) {
    return parseImageId(json.href)
  }
}

function idMatcher(value: string): string | undefined {
  // Regex to match SDL ID
  const matchers = [
    /\/media\/(image|graphic)\/(sdl[A-Za-z0-9%_-]+(?=_(Normal|Watermark)Preview))/i,
    /https:\/\/tt\.se\/bild\/o\/[A-Za-z0-9-%_]*(sdl[A-Za-z0-9%_-]+)$/i
  ]

  return matchers.reduce((prev: undefined | string, curr: RegExp): string | undefined => {
    return prev || value.match(curr)?.[0]
  }, undefined)
}

export function parseJSON(value: string): VisualPropertiesInterface | false {
  try {
    return JSON.parse(value)
  } catch {
    return false
  }
}
