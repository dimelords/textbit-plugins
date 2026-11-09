import {
  Editor,
  type Element,
  Transforms
} from 'slate'

import {
  TextbitEditor,
  TextbitElement
} from '@ttab/textbit'

const PLUGIN_NAME = 'dotvoid/codeblock'

export const actionHandler = (editor: Editor, typeName: string): void => {
  const isActive = TextbitEditor.includes(editor, typeName)

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      TextbitElement.isElement(n) &&
      n.type === PLUGIN_NAME,
    split: true
  })

  const newProperties: Partial<Element> = {
    type: isActive ? 'core/text' : `${typeName}/body`,
    properties: {}
  }

  Transforms.setNodes<Element>(editor, newProperties, {
    match: (n) => {
      return !Editor.isEditor(n) &&
        TextbitElement.isElement(n) &&
        n.class === 'text'
    }
  })

  if (!isActive) {
    Transforms.wrapNodes(editor, {
      id: crypto.randomUUID(),
      class: 'text',
      type: PLUGIN_NAME,
      children: []
    })
  }
}
