import {
  type Editor,
  type NodeEntry,
  Transforms,
  Node
} from 'slate'

import {
  TextbitEditor,
  TextbitElement
} from '@ttab/textbit'

export const normalizeNode = (editor: Editor, nodeEntry: NodeEntry, listType: string): boolean | undefined => {
  const [, path] = nodeEntry
  const children = Array.from(Node.children(editor, path))

  let n = 0
  for (const [child, childPath] of children) {
    if (TextbitElement.isBlock(child)) {
      // Unwrap block node children (move text element children upwards in tree)
      Transforms.unwrapNodes(editor, {
        at: childPath,
        split: true
      })
      return true
    }

    if (n < children.length && TextbitElement.isText(child) && !TextbitElement.isOfType(child, `${listType}/list-item`)) {
      // Turn unknown text elements to core/ordered-list/list-item or core/unordered-list/list-item
      Transforms.setNodes(
        editor,
        { type: `${listType}/list-item` },
        { at: childPath }
      )
      return true
    }

    // If the two last elements are empty, remove last node and then convert
    // the remaining last node to normal text. This gives the appearance that
    // <enter> on a last empty list item converts it to a text node.
    if (n === children.length - 1 && children.length > 1 && TextbitElement.isOfType(child, `${listType}/list-item`)) {
      if (!TextbitEditor.hasText([children[n - 1], children[n]])) {
        const removePath = [...path, n - 1]
        const liftPath = [...path, n]

        Transforms.setNodes(
          editor,
          { type: 'core/text', properties: {} },
          { at: liftPath }
        )
        Transforms.liftNodes(
          editor,
          { at: liftPath }
        )

        Transforms.removeNodes(
          editor,
          { at: removePath }
        )

        return true
      }
    }

    n++
  }
}
