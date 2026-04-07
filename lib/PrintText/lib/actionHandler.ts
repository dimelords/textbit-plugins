import { TextbitEditor } from '@ttab/textbit'
import { type Editor, Transforms, type Descendant } from 'slate'

export const actionHandler = ({ editor }: { editor: Editor }): void => {
  const node: Descendant[] = [{
    id: crypto.randomUUID(),
    class: 'block',
    type: 'tt/print-text',
    children: [
      {
        id: crypto.randomUUID(),
        class: 'text',
        type: 'tt/print-text/text',
        children: [{ text: '' }]
      },
      {
        id: crypto.randomUUID(),
        class: 'text',
        type: 'tt/print-text/role',
        children: [{ text: '' }]
      }
    ]
  }]


  if (editor.selection) {
    Transforms.insertNodes(editor, node, { at: editor.selection });
    return
  } else {
    console.warn('No selection found when inserting')
  }

  const position = TextbitEditor.position(editor) + 1

  Transforms.select(editor, {
    anchor: { offset: 0, path: [position, 0, 0] },
    focus: { offset: 0, path: [position, 0, 0] }
  })
}
