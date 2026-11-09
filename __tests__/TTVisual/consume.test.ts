import { describe, it, expect } from 'vitest'
import { consume } from '../../lib/TTVisual/lib/consume'
import type { TBResource } from '@ttab/textbit'
import type { Editor } from 'slate'

// A JSON input lets us test consume() end-to-end without going through the
// network-dependent `new Image()` image-resolution path.
const jsonInput: TBResource = {
  data: JSON.stringify({
    type: 'tt/picture',
    href: 'https://tt.se/media/image/sdlABCDEF123_WatermarkPreview.jpg',
    uri: 'http://tt.se/media/image/sdlABCDEF123',
    byline: 'Photographer',
    text: 'Caption',
    width: 800,
    height: 600
  }),
  type: 'tt/visual',
  source: ''
}

describe('TTVisual consume', () => {
  it('throws if input is an array', async () => {
    await expect(consume({ input: [jsonInput], editor: {} as Editor })).rejects.toThrow(
      /expected string for consumation, not a list/
    )
  })

  it('throws if input.data is not a string', async () => {
    await expect(consume({ input: { ...jsonInput, data: 123 } as unknown as TBResource, editor: {} as Editor })).rejects.toThrow(
      /expected string for consumation/
    )
  })

  it('returns a valid tt/visual node', async () => {
    const result = await consume({ input: jsonInput, editor: {} as Editor })
    expect(result?.data).toBeDefined()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = result!.data as any
    expect(data.class).toBe('block')
    expect(data.type).toBe('tt/visual')
    expect(typeof data.id).toBe('string')
    expect(data.properties.href).toBe('https://tt.se/media/image/sdlABCDEF123_WatermarkPreview.jpg')
    expect(data.properties.text).toBe('Caption')
    expect(data.properties.byline).toBe('Photographer')
  })

  it('produces the image child with class: void (must match plugin declaration)', async () => {
    // Regression test for the bug where consume() emitted the image child as
    // class: 'block' while the plugin registered it as class: 'void'. The
    // mismatch caused normalizeTTVisual to unwrap the image element on every
    // drop, corrupting the structure under the visible href-driven render.
    const result = await consume({ input: jsonInput, editor: {} as Editor })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = result!.data as any

    expect(data.children).toHaveLength(3)
    expect(data.children[0].type).toBe('tt/visual/image')
    expect(data.children[0].class).toBe('void')
    expect(data.children[1].type).toBe('tt/visual/text')
    expect(data.children[1].class).toBe('text')
    expect(data.children[2].type).toBe('tt/visual/byline')
    expect(data.children[2].class).toBe('text')
  })
})
