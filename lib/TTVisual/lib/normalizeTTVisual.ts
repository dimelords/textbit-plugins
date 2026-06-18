import {
  type Editor,
  Element,
  type NodeEntry,
  Node,
  Transforms
} from 'slate'
import { TextbitElement } from '@ttab/textbit'

// Schema-defined children of tt/visual. Anything else nested here (e.g. an
// unrelated block dropped/pasted in) gets unwrapped to keep the structure flat.
const SCHEMA_CHILD_TYPES = new Set([
  'tt/visual/image',
  'tt/visual/text',
  'tt/visual/byline'
])

export const normalizeTTVisual = (editor: Editor, nodeEntry: NodeEntry): boolean | undefined => {
  const [, path] = nodeEntry

  for (const [child, childPath] of Node.children(editor, path)) {
    if (
      Element.isElement(child)
      && TextbitElement.isBlock(child)
      && !SCHEMA_CHILD_TYPES.has(child.type)
    ) {
      Transforms.unwrapNodes(editor, {
        at: childPath,
        split: true
      })
      return true
    }
  }
}
