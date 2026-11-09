import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { FigureText } from '../../lib/Image/components/FigureText'
import { FigureByline } from '../../lib/Image/components/FigureByline'
import type { TBComponentProps } from '@ttab/textbit'
import type { Editor } from 'slate'

const makeProps = (children: string): TBComponentProps => ({
  editor: {} as Editor,
  children: [children],
  element: {
    type: 'core/image/text',
    id: '00000000-0000-0000-0000-000000000000',
    class: 'text',
    children: [{ text: children }]
  }
})

const wrapper = (container: HTMLElement) => {
  const el = container.firstElementChild
  if (!(el instanceof HTMLElement)) throw new Error('expected wrapper element')
  return el
}

const LAYOUT_PATTERNS = [
  /^-?(p|px|py|pt|pr|pb|pl|ps|pe|m|mx|my|mt|mr|mb|ml|ms|me)-/,
  /^(flex|grid|items|justify|content|self|place|order|gap)(-|$)/,
  /^(grow|shrink|basis)(-|$)/,
  /^space-[xy]-/,
  /^rounded(-|$)/,
  /^text-/
]

const layoutClasses = (el: HTMLElement) =>
  Array.from(el.classList).filter((c) => LAYOUT_PATTERNS.some((re) => re.test(c))).sort()

const classList = (el: Element) => Array.from(el.classList).sort()

describe('Image plugin: Text and Foto rows align', () => {
  it('Text and Foto wrappers share the same horizontal/vertical layout classes', () => {
    const text = render(<FigureText {...makeProps('caption body')} options={{}} />)
    const byline = render(<FigureByline {...makeProps('byline body')} options={{}} />)

    expect(layoutClasses(wrapper(text.container))).toEqual(layoutClasses(wrapper(byline.container)))
  })

  it('Text and Foto labels render identically', () => {
    const text = render(<FigureText {...makeProps('x')} options={{}} />)
    const byline = render(<FigureByline {...makeProps('x')} options={{}} />)

    const textLabel = text.container.querySelector('label')
    const bylineLabel = byline.container.querySelector('label')
    if (!textLabel) throw new Error('FigureText has no label')
    if (!bylineLabel) throw new Error('FigureByline has no label')

    expect(classList(textLabel)).toEqual(classList(bylineLabel))
    expect(textLabel.getAttribute('contenteditable')).toBe('false')
    expect(bylineLabel.getAttribute('contenteditable')).toBe('false')
  })

  it('Text and Foto figcaptions render identically', () => {
    const text = render(<FigureText {...makeProps('x')} options={{}} />)
    const byline = render(<FigureByline {...makeProps('x')} options={{}} />)

    const textCap = text.container.querySelector('figcaption')
    const bylineCap = byline.container.querySelector('figcaption')
    if (!textCap) throw new Error('FigureText has no figcaption')
    if (!bylineCap) throw new Error('FigureByline has no figcaption')

    expect(classList(textCap)).toEqual(classList(bylineCap))
  })

  it('Foto row honours bylineLabel, defaulting to "Photo:"', () => {
    const def = render(<FigureByline {...makeProps('x')} options={{}} />)
    expect(def.container.textContent).toContain('Photo:')

    const custom = render(<FigureByline {...makeProps('x')} options={{ bylineLabel: 'Foto' }} />)
    expect(custom.container.textContent).toContain('Foto:')
  })

  it('Text row honours captionLabel, defaulting to "Text:"', () => {
    const def = render(<FigureText {...makeProps('x')} options={{}} />)
    expect(def.container.textContent).toContain('Text:')

    const custom = render(<FigureText {...makeProps('x')} options={{ captionLabel: 'Bildtext' }} />)
    expect(custom.container.textContent).toContain('Bildtext:')
  })
})
