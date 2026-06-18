import {
  type Descendant,
  Transforms
} from 'slate'
import { TextbitEditor } from '@ttab/textbit'
import type { TBActionHandlerArgs } from '@ttab/textbit'

export const actionHandler = ({ editor, options }: TBActionHandlerArgs) => {
  const text = TextbitEditor.getSelectedText(editor)
  const titleText = `${options?.factboxNewTitle as string ?? 'Facts'}:`
  const id = crypto.randomUUID()

  const node: Descendant[] = [{
    id,
    class: 'block',
    type: 'core/factbox',
    properties: {
      original_id: id,
      original_updated: new Date().toISOString(),
      created: new Date().toISOString()
    },
    children: [
      {
        id: crypto.randomUUID(),
        class: 'text',
        type: 'core/factbox/title',
        children: [{ text: titleText }]
      },
      {
        id: crypto.randomUUID(),
        class: 'block',
        type: 'core/factbox/body',
        children: [
          {
            id: crypto.randomUUID(),
            class: 'text',
            type: 'core/text',
            children: [{ text: '' }]
          }
        ]
      }
    ]
  }]

  const position = TextbitEditor.position(editor) + (text ? 0 : 1)
  TextbitEditor.insertAt(editor, position, node)

  Transforms.select(editor, {
    anchor: { offset: titleText.length, path: [position, 0, 0] },
    focus: { offset: titleText.length, path: [position, 0, 0] }
  })
}
