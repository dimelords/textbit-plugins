import { describe, it, expect } from 'vitest'
import { createEditor, type Descendant, type Editor, type Element } from 'slate'
import { normalizeNode } from '../../lib/Link/lib/normalizeNode'

function makeEditor(value: Descendant[]): Editor {
  const editor = createEditor()
  editor.children = value
  editor.isInline = (n) => (n as Element).type === 'core/link'
  return editor
}

function paragraphWithLink(linkText: string): Descendant {
  return {
    id: 'p1',
    type: 'core/text',
    class: 'text',
    properties: {},
    children: [
      { text: 'before ' },
      {
        id: 'l1',
        type: 'core/link',
        class: 'inline',
        properties: { url: 'https://tt.se', title: '', target: '' },
        children: [{ text: linkText }]
      },
      { text: ' after' }
    ]
  } as Descendant
}

function hasLink(editor: Editor): boolean {
  const para = editor.children[0] as Element
  return para.children.some((c) => (c as Element).type === 'core/link')
}

describe('Link normalizeNode', () => {
  it('unwraps a link with empty text', () => {
    const editor = makeEditor([paragraphWithLink('')])
    const result = normalizeNode(editor, [(editor.children[0] as Element).children[1], [0, 1]])
    expect(result).toBe(true)
    expect(hasLink(editor)).toBe(false)
  })

  it('unwraps a link with whitespace only text', () => {
    const editor = makeEditor([paragraphWithLink('   ')])
    const result = normalizeNode(editor, [(editor.children[0] as Element).children[1], [0, 1]])
    expect(result).toBe(true)
    expect(hasLink(editor)).toBe(false)
  })

  it('leaves a link that has text alone', () => {
    const editor = makeEditor([paragraphWithLink('read more')])
    const result = normalizeNode(editor, [(editor.children[0] as Element).children[1], [0, 1]])
    expect(result).toBeUndefined()
    expect(hasLink(editor)).toBe(true)
  })
})
