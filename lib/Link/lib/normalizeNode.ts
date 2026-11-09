import { type Editor, type NodeEntry, Element, Node, Transforms } from 'slate'
import { TextbitElement } from '@ttab/textbit'

/**
 * Unwrap an empty link. A core/link that holds no text, or only whitespace, is
 * left behind when the linked text is deleted and nothing else removes it.
 * Unwrapping drops the anchor and keeps whatever (here empty) content remained.
 * Links with text but an empty url are left alone (handled on blur in EditLink).
 */
export const normalizeNode = (editor: Editor, nodeEntry: NodeEntry): boolean | void => {
  const [node, path] = nodeEntry

  if (!Element.isElement(node) || !TextbitElement.isOfType(node, 'core/link')) {
    return
  }

  if (Node.string(node).trim() === '') {
    Transforms.unwrapNodes(editor, {
      at: path,
      match: (n) => Element.isElement(n) && TextbitElement.isOfType(n, 'core/link')
    })
    return true
  }
}
