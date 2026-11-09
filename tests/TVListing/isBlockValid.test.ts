import { describe, it, expect } from 'vitest'
import type { TBElement } from '@ttab/textbit'
import { isBlockValid } from '../../lib/TVListing/lib/isBlockValid'
import { ALL_FIELDS, buildPlaceholderChildren, type TVLField } from '../../lib/TVListing/fields'

const CHANNEL_PROPERTIES = {
  channel: 'SVT1',
  uri: 'tt/channel/svt1'
}

const FILLED_TEXT: Record<Exclude<TVLField, 'channel'>, string> = {
  title: 'Aktuellt',
  day: 'måndag',
  time: '21:00',
  end_time: '21:30'
}

const buildBlock = ({
  fields = ALL_FIELDS,
  properties = CHANNEL_PROPERTIES,
  emptyFields = []
}: {
  fields?: readonly TVLField[]
  properties?: TBElement['properties']
  emptyFields?: readonly TVLField[]
} = {}): TBElement => ({
  id: 'block-1',
  class: 'block',
  type: 'tt/tv-listing',
  properties,
  children: buildPlaceholderChildren(fields).map((child) => {
    const element = child as TBElement
    const field = element.type.replace('tt/tv-listing/', '') as TVLField

    if (field === 'channel' || emptyFields.includes(field)) {
      return element
    }

    return {
      ...element,
      children: [{ text: FILLED_TEXT[field] }]
    }
  })
})

describe('isBlockValid', () => {
  it('accepts a block where every present field is filled', () => {
    expect(isBlockValid(buildBlock())).toBe(true)
  })

  it('accepts a block where the optional fields have been removed', () => {
    expect(isBlockValid(buildBlock({ fields: ['channel'] }))).toBe(true)
  })

  it('rejects an undefined block', () => {
    expect(isBlockValid(undefined)).toBe(false)
  })

  it('rejects a block of another type', () => {
    expect(isBlockValid({ ...buildBlock(), type: 'core/text' })).toBe(false)
  })

  it('rejects a block without children', () => {
    expect(isBlockValid({ ...buildBlock(), children: [] })).toBe(false)
  })

  it('rejects a block without the mandatory channel field', () => {
    expect(isBlockValid(buildBlock({ fields: ['title', 'day', 'time', 'end_time'] }))).toBe(false)
  })

  it.each([
    ['no channel properties at all', {}],
    ['a missing uri', { channel: 'SVT1' }],
    ['a missing channel name', { uri: 'tt/channel/svt1' }],
    ['a whitespace only channel name', { channel: '  ', uri: 'tt/channel/svt1' }],
    ['a whitespace only uri', { channel: 'SVT1', uri: '  ' }]
  ])('rejects a block with %s', (_label, properties) => {
    expect(isBlockValid(buildBlock({ properties }))).toBe(false)
  })

  it.each(['title', 'day', 'time', 'end_time'] as const)(
    'rejects a block where the %s field is left empty',
    (field) => {
      expect(isBlockValid(buildBlock({ emptyFields: [field] }))).toBe(false)
    }
  )

  it('rejects a block where a field only contains whitespace', () => {
    const block = buildBlock()
    const children = block.children as TBElement[]

    expect(isBlockValid({
      ...block,
      children: children.map((child) => (
        child.type === 'tt/tv-listing/title'
          ? { ...child, children: [{ text: '   ' }] }
          : child
      ))
    })).toBe(false)
  })
})
