import { describe, it, expect } from 'vitest'
import { parseImageId, parseJSON } from '../../lib/TTVisual/lib/parseImageId'

describe('parseImageId', () => {
  it('matches an SDL id in a tt.se image URL', () => {
    expect(parseImageId('https://tt.se/bild/o/xyzsdlAbC123')).toBe(
      'https://tt.se/bild/o/xyzsdlAbC123'
    )
  })

  it('prefers the url query parameter over the URL itself', () => {
    const inner = 'https://tt.se/media/image/sdlFoo_NormalPreview'
    expect(parseImageId(`https://example.se/a?url=${encodeURIComponent(inner)}`)).toBe(
      '/media/image/sdlFoo'
    )
  })

  it('follows href when handed JSON rather than a URL', () => {
    expect(parseImageId(JSON.stringify({ href: 'https://tt.se/bild/o/sdlJson1' }))).toBe(
      'https://tt.se/bild/o/sdlJson1'
    )
  })

  it('returns undefined when nothing matches', () => {
    expect(parseImageId('not-an-id')).toBeUndefined()
    expect(parseImageId('https://tt.se/bild/o/plain-image')).toBeUndefined()
    expect(parseImageId('https://example.se/media/image/sdlFoo')).toBeUndefined()
  })
})

describe('parseJSON', () => {
  it('parses valid JSON', () => {
    expect(parseJSON('{"href":"x"}')).toEqual({ href: 'x' })
  })

  it('returns false on malformed JSON', () => {
    expect(parseJSON('{oops')).toBe(false)
  })
})
