import {
  type Editor,
  type NodeEntry,
  Node,
  Transforms
} from 'slate'
import { TextbitElement } from '@ttab/textbit'

export const normalizeImage = (editor: Editor, nodeEntry: NodeEntry): boolean | undefined => {
  const [, path] = nodeEntry

  for (const [child, childPath] of Node.children(editor, path)) {
    if (TextbitElement.isBlock(child)) {
      // Unwrap block node children (move text element children upwards in tree)
      Transforms.unwrapNodes(editor, {
        at: childPath,
        split: true
      })
      return true
    }
  }
}
