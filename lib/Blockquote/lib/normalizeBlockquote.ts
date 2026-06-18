import {
  Transforms,
  Node,
  type Editor,
  type NodeEntry
} from 'slate'
import { TextbitElement } from '@ttab/textbit'

export const normalizeBlockquote = (editor: Editor, nodeEntry: NodeEntry): boolean | undefined => {
  const [, path] = nodeEntry
  const children = Array.from(Node.children(editor, path))

  for (const [child, childPath] of children) {
    if (TextbitElement.isBlock(child)) {
      // Unwrap block node children (move text element children upwards in tree)
      Transforms.unwrapNodes(editor, {
        at: childPath,
        split: true
      })
      return true
    }

    // Coerce unknown text elements into body so they fold into the blockquote
    // structure rather than getting stripped by the cardinality enforcement.
    if (
      TextbitElement.isText(child)
      && !TextbitElement.isOfType(child, 'core/blockquote/body')
      && !TextbitElement.isOfType(child, 'core/blockquote/caption')
    ) {
      Transforms.setNodes(
        editor,
        { type: 'core/blockquote/body' },
        { at: childPath }
      )
      return true
    }
  }
}
