import { describe, it, expect } from 'vitest'
import { createEditor, type Descendant, type Editor } from 'slate'
import { normalizeTTVisual } from '../../lib/TTVisual/lib/normalizeTTVisual'

function makeEditor(value: Descendant[]): Editor {
  const editor = createEditor()
  editor.children = value
  return editor
}

const canonicalVisual: Descendant = {
  id: 'visual-1',
  class: 'block',
  type: 'tt/visual',
  properties: { href: 'http://tt.se/media/image/sdlX_WatermarkPreview.jpg' },
  children: [
    {
      id: 'visual-1-image',
      type: 'tt/visual/image',
      class: 'void',
      children: [{ text: 'http://tt.se/media/image/sdlX_WatermarkPreview.jpg' }]
    },
    {
      id: 'visual-1-text',
      type: 'tt/visual/text',
      class: 'text',
      properties: {},
      children: [{ text: 'Caption' }]
    },
    {
      id: 'visual-1-byline',
      type: 'tt/visual/byline',
      class: 'text',
      properties: {},
      children: [{ text: 'Photographer' }]
    }
  ]
}

describe('normalizeTTVisual', () => {
  it('is a no-op on a canonical tt/visual node', () => {
    const editor = makeEditor([structuredClone(canonicalVisual)])
    const result = normalizeTTVisual(editor, [editor.children[0], [0]])
    expect(result).toBeUndefined()
    // children untouched
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const node = editor.children[0] as any
    expect(node.children).toHaveLength(3)
    expect(node.children[0].type).toBe('tt/visual/image')
    expect(node.children[0].class).toBe('void')
  })

  it('unwraps a foreign block child nested inside tt/visual', () => {
    const visual = structuredClone(canonicalVisual) as Descendant & { children: Descendant[] }
    // Insert an unexpected block-class child (e.g. dropped/pasted)
    visual.children.push({
      id: 'foreign-block',
      type: 'core/image',
      class: 'block',
      children: [{ text: 'stray' }]
    })

    const editor = makeEditor([visual])
    const result = normalizeTTVisual(editor, [editor.children[0], [0]])
    expect(result).toBe(true)

    // The foreign block element is unwrapped: its element wrapper is removed
    // and its text leaf is hoisted into the parent's children array.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const node = editor.children[0] as any
    const stillHasForeign = node.children.some(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (c: any) => c.type === 'core/image'
    )
    expect(stillHasForeign).toBe(false)
  })

  it('does not unwrap the tt/visual/image schema child even if class is mislabeled', () => {
    // Defensive: protect against legacy data where the image child might
    // have been persisted with class: 'block' (the previous bug). The
    // schema-type-aware rule should leave it alone rather than destroy it.
    const visual = structuredClone(canonicalVisual) as Descendant & { children: Descendant[] }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(visual.children[0] as any).class = 'block'

    const editor = makeEditor([visual])
    const result = normalizeTTVisual(editor, [editor.children[0], [0]])
    expect(result).toBeUndefined()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const node = editor.children[0] as any
    expect(node.children[0].type).toBe('tt/visual/image')
  })
})
