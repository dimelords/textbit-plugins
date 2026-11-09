import { describe, it, expect } from 'vitest'
import { consume } from '../../lib/Factbox/lib/consume'
import type { TBResource } from '@ttab/textbit'
import type { Editor } from 'slate'

describe('Factbox consume', () => {
  const validInput: TBResource = {
    data: JSON.stringify({
      text: 'Factbox line 1\nFactbox line 2',
      title: 'Factbox Title',
      modified: '2024-01-01T00:00:00Z',
      id: 'factbox-123',
      original_version: 1,
      original_updated: '2024-01-01T00:00:00Z',
      locally_changed: false
    }),
    type: 'core/factbox',
    source: ''
  }

  it('throws if input is an array', async () => {
    await expect(consume({ input: [validInput], editor: {} as Editor })).rejects.toThrow(
      /expected string for consumation, not a list/
    )
  })

  it('throws if input.data is not a string', async () => {
    await expect(consume({ input: { ...validInput, data: 123 }, editor: {} as Editor })).rejects.toThrow(
      /expected string for consumation/
    )
  })

  it('returns a valid factbox node', async () => {
    const result = await consume({ input: validInput, editor: {} as Editor })
    if (!result?.data) {
      throw new Error('No data returned from consume')
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = result.data as any

    expect(data).toBeDefined()
    expect(result.type).toBe('core/factbox')
    expect(data.class).toBe('block')
    expect(data.properties.title).toBe('Factbox Title')
    expect(data.properties.text).toBe('Factbox line 1\nFactbox line 2')
    expect(data.children[0].type).toBe('core/factbox/title')
    expect(data.children[1].type).toBe('core/factbox/body')
    expect(data.children[1].children.length).toBe(2)
    expect(data.children[1].children[0].children[0].text).toBe('Factbox line 1')
    expect(data.children[1].children[1].children[0].text).toBe('Factbox line 2')
  })
})
