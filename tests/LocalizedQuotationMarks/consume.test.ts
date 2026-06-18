import { describe, it, expect } from 'vitest'
import { createEditor, type Editor, type Descendant, type Path, Node } from 'slate'
import { consume } from '../../lib/LocalizedQuotationMarks/lib/consume'

// Build a minimal editor shaped enough for the consume function. It only
// reads `editor.lang` plus standard Slate APIs, so a plain createEditor()
// with the lang field tacked on is sufficient.
function makeEditor(content: Descendant[], lang = 'en'): Editor & { lang: string } {
  const editor = createEditor() as Editor & { lang: string }
  editor.lang = lang
  editor.children = content
  return editor
}

function textAt(editor: Editor, path: Path): string {
  const node = Node.get(editor, path)
  return 'text' in node ? node.text : ''
}

const quoteInput = { type: 'text/plain', data: '"', source: '' }

// Slate's TypeScript types are augmented by @ttab/textbit at runtime
// (CustomTypes), but the tests construct minimal element shapes that
// don't carry every required field. The casts keep these focused on
// behaviour rather than typing.
type AnyNode = Descendant

function leaf(text: string): AnyNode {
  return { text } as AnyNode
}

function textBlock(children: AnyNode[]): AnyNode {
  return { type: 'core/text', class: 'text', children } as AnyNode
}

function factbox(title: string, body: AnyNode[]): AnyNode {
  return {
    type: 'core/factbox',
    class: 'block',
    children: [
      { type: 'core/factbox/title', class: 'text', children: [leaf(title)] } as AnyNode,
      { type: 'core/factbox/body', class: 'block', children: body } as AnyNode
    ]
  } as AnyNode
}

describe('LocalizedQuotationMarks consume - quote conversion at varying depths', () => {
  it('depth 2: paragraph in an article', async () => {
    // [0]: paragraph
    //   [0, 0]: text leaf "a \"quote here"
    const editor = makeEditor([
      textBlock([leaf('a "quote here')])
    ])
    editor.selection = {
      anchor: { path: [0, 0], offset: 13 },
      focus: { path: [0, 0], offset: 13 }
    }

    const result = await consume({ editor, input: quoteInput })

    expect(textAt(editor, [0, 0])).toBe('a “quote here')
    expect(result).toEqual({ type: 'text/plain', data: '”', source: '' })
  })

  it('depth 4: factbox embedded in an article - regression', async () => {
    // [0]: factbox
    //   [0, 0]: title
    //   [0, 1]: body
    //     [0, 1, 0]: paragraph
    //       [0, 1, 0, 0]: text leaf "a \"quote in factbox"
    const editor = makeEditor([
      factbox('Title', [textBlock([leaf('a "quote in factbox')])])
    ])
    editor.selection = {
      anchor: { path: [0, 1, 0, 0], offset: 19 },
      focus: { path: [0, 1, 0, 0], offset: 19 }
    }

    const result = await consume({ editor, input: quoteInput })

    expect(textAt(editor, [0, 1, 0, 0])).toBe('a “quote in factbox')
    expect(result).toEqual({ type: 'text/plain', data: '”', source: '' })
  })

  it('depth 6: hypothetical deeper nesting still resolves siblings correctly', async () => {
    // Wrap the factbox-body paragraph in two extra block layers, putting
    // the text leaf at path length 6. The matcher should still find the
    // earlier straight quote by walking the parent block's siblings.
    const outerWrapper = {
      type: 'wrapper/outer',
      class: 'block',
      children: [
        {
          type: 'wrapper/inner',
          class: 'block',
          children: [
            factbox('Title', [textBlock([leaf('a "quote deeper still')])])
          ]
        } as AnyNode
      ]
    } as AnyNode

    const editor = makeEditor([outerWrapper])
    // path: [0=outer, 0=inner, 0=factbox, 1=body, 0=paragraph, 0=leaf]
    editor.selection = {
      anchor: { path: [0, 0, 0, 1, 0, 0], offset: 21 },
      focus: { path: [0, 0, 0, 1, 0, 0], offset: 21 }
    }

    const result = await consume({ editor, input: quoteInput })

    expect(textAt(editor, [0, 0, 0, 1, 0, 0])).toBe('a “quote deeper still')
    expect(result).toEqual({ type: 'text/plain', data: '”', source: '' })
  })
})
