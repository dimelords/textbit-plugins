import { describe, it, expect } from 'vitest'
import { consumes } from '../../lib/Image/lib/consumes'

describe('Image plugin consumer', () => {
  it('should consume image/jpg', () => {
    const resource = {
      input: {
        source: '',
        type: 'file',
        data: new File(['...'], 'image.jpg', { type: 'image/jpg' })
      }
    }

    expect(consumes(resource)).toEqual([true, 'core/image', false])
  })

  it('should consume tt/visual', () => {
    const resource = {
      input: {
        source: 'drop',
        type: 'tt/visual',
        data: '{"byline":"Name Name","text":"Description","href":"https://tt.se/media/image/sdl0BUs0sNDpXw_WatermarkPreview.jpg","width":3320,"height":2213}'
      }
    }

    expect(consumes(resource)).toEqual([false])
  })

  it('should consume text/uri-list', () => {
    const resource = {
      input: {
        source: 'drop',
        type: 'text/uri-list',
        data: 'https://tt.se/bild/_next/image?url=https%3A%2F%2Fbeta.tt.se%2Fmedia%2Fimage%2Fsdlv_113kUboR0_NormalPreview.jpg%3w=1080&q=75'
      }
    }

    expect(consumes(resource)).toEqual([false])
  })

  it('should consume text/plain', () => {
    const resource = {
      input: {
        source: 'text',
        type: 'text/plain',
        data: 'https://tt.se/bild/o/wimbledon-businesses-embrace-tennis-tournament-spirit-with-decorative-displays--jun-2024--sdlv_113kUboR0'
      }
    }

    expect(consumes(resource)).toEqual([false])
  })

  it('should not consume text/text', () => {
    const resource = {
      input: {
        source: '',
        type: 'file',
        data: new File(['...'], 'doc.txt', { type: 'text/text' })
      }
    }

    expect(consumes(resource)).toEqual([false])
  })
})
