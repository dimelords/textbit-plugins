import { type Editor, type Descendant } from 'slate'
import { TextbitEditor } from '@ttab/textbit'
import { ALL_FIELDS, buildPlaceholderChildren } from '../fields'

export const actionHandler = ({ editor }: { editor: Editor }): void => {
  const text = TextbitEditor.getSelectedText(editor)
  const position = TextbitEditor.position(editor) + (text ? 0 : 1)

  const placeholder: Descendant = {
    id: crypto.randomUUID(),
    class: 'block',
    type: 'tt/tv-listing',
    properties: {
      uninitialized: true
    },
    children: buildPlaceholderChildren(ALL_FIELDS)
  }

  TextbitEditor.insertAt(editor, position, [placeholder])
}
