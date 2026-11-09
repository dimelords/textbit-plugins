import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { consume } from '../../lib/Image/lib/consume'
import type { Editor } from 'slate'

describe('Image consume', () => {
  const editor = {} as Editor

  it('consumeJSON returns 3 children including byline', async () => {
    const input = {
      source: 'drop',
      type: 'core/image',
      data: JSON.stringify({
        href: 'https://example.com/image.jpg',
        proxy: 'https://proxy.example.com/image.jpg',
        text: 'Caption',
        byline: 'Photo Credit',
        width: 800,
        height: 600
      })
    }

    const result = await consume({ input, editor })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = result?.data as any

    expect(data.type).toBe('core/image')
    expect(data.children).toHaveLength(3)
    expect(data.children[0].type).toBe('core/image/image')
    expect(data.children[0].class).toBe('void')
    expect(data.children[1].type).toBe('core/image/text')
    expect(data.children[1].children[0].text).toBe('Caption')
    expect(data.children[2].type).toBe('core/image/byline')
    expect(data.children[2].children[0].text).toBe('Photo Credit')
  })

  describe('consumeFile', () => {
    const originalFileReader = globalThis.FileReader
    const originalImage = globalThis.Image

    beforeEach(() => {
      vi.useFakeTimers()

      class FileReaderMock {
        result: string | null = null
        private loadHandler: (() => void) | null = null
        addEventListener(event: string, handler: () => void) {
          if (event === 'load') this.loadHandler = handler
        }
        readAsDataURL() {
          this.result = 'data:image/png;base64,AAA'
          this.loadHandler?.()
        }
      }

      class ImageMock {
        onload: (() => void) | null = null
        width = 800
        height = 600
        private _src = ''
        set src(v: string) {
          this._src = v
          queueMicrotask(() => this.onload?.())
        }
        get src() { return this._src }
      }

      globalThis.FileReader = FileReaderMock as unknown as typeof FileReader
      globalThis.Image = ImageMock as unknown as typeof Image
    })

    afterEach(() => {
      globalThis.FileReader = originalFileReader
      globalThis.Image = originalImage
      vi.useRealTimers()
    })

    it('returns 3 children including byline', async () => {
      const file = new File(['pixels'], 'photo.png', { type: 'image/png' })
      const input = { source: '', type: 'file', data: file }

      const promise = consume({ input, editor })

      // Flush microtasks for ImageMock.onload, then advance timer for window.setTimeout(resolve, 1000)
      await vi.advanceTimersByTimeAsync(1100)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = (await promise)?.data as any

      expect(data.type).toBe('core/image')
      expect(data.children).toHaveLength(3)
      expect(data.children[0].type).toBe('core/image/image')
      expect(data.children[0].class).toBe('void')
      expect(data.children[1].type).toBe('core/image/text')
      expect(data.children[1].class).toBe('text')
      expect(data.children[2].type).toBe('core/image/byline')
      expect(data.children[2].class).toBe('text')
    })
  })

  it('throws on array input', async () => {
    await expect(consume({ input: [], editor })).rejects.toThrow(/not a list/)
  })

  it('throws on non-file non-string input', async () => {
    const input = { source: '', type: 'file', data: 123 }
    await expect(consume({ input, editor })).rejects.toThrow(/expected File or string/)
  })
})
