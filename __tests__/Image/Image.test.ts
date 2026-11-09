import { describe, it, expect, vi } from 'vitest'
import { Image } from '../../lib/Image'
import type { TBConsumeFunction, TBConsumesFunction } from '@ttab/textbit'

describe('Image plugin', () => {
  it('uses built-in consume/consumes with no options', () => {
    const plugin = Image()

    expect(plugin.name).toBe('core/image')
    expect('consumer' in plugin).toBe(true)
    if ('consumer' in plugin) {
      expect(plugin.consumer?.consumes).toBeTypeOf('function')
      expect(plugin.consumer?.consume).toBeTypeOf('function')
    }
  })

  it('uses custom consume override when provided', () => {
    const customConsume: TBConsumeFunction = vi.fn()
    const plugin = Image({ consume: customConsume })

    if ('consumer' in plugin) {
      expect(plugin.consumer?.consume).toBe(customConsume)
    }
  })

  it('uses custom consumes override when provided', () => {
    const customConsumes: TBConsumesFunction = vi.fn()
    const plugin = Image({ consumes: customConsumes })

    if ('consumer' in plugin) {
      expect(plugin.consumer?.consumes).toBe(customConsumes)
    }
  })

  it('passes options through to components', () => {
    const plugin = Image({
      removable: true,
      enableCrop: false,
      captionLabel: 'Bildtext',
      bylineLabel: 'Foto'
    })

    expect(plugin.options).toMatchObject({
      removable: true,
      enableCrop: false,
      captionLabel: 'Bildtext',
      bylineLabel: 'Foto'
    })
  })

  it('has 3 child component entries (image, text, byline)', () => {
    const plugin = Image()
    const children = plugin.componentEntry?.children

    expect(children).toHaveLength(3)
    expect(children?.[0].type).toBe('image')
    expect(children?.[1].type).toBe('text')
    expect(children?.[2].type).toBe('byline')
  })
})
