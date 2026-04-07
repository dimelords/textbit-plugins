import { Text, Transforms, type Editor, type NodeEntry, Node } from "slate"

export const normalizePrintText = (editor: Editor, nodeEntry: NodeEntry): boolean | undefined => {
  const [node, path] = nodeEntry

  if ('type' in node && node?.type === 'tt/print-text' && Array.isArray(node.children)) {
    const children = Array.from(Node.children(editor, path))

    if (children.length < 2) {
      let hasRole = false

      for (const [child] of children) {
        if (child.type === 'tt/print-text/role') hasRole = true
      }

      // text is always at index 0, role at index 1
      const [addType, atPos] = !hasRole
        ? ['tt/print-text/role', 1]
        : ['tt/print-text/text', 0]

      Transforms.insertNodes(
        editor,
        {
          id: crypto.randomUUID(),
          class: 'text',
          type: addType,
          children: [{ text: '' }]
        },
        { at: [...path, atPos] }
      )
      return true
    }

    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i]
      const childPath = path.concat(i)

      // Look specifically for the role child node
      if (child.type === 'tt/print-text/role' && Array.isArray(child.children)) {
        for (let j = 0; j < child.children.length; j++) {
          const textNode = child.children[j]
          const textPath = childPath.concat(j)

          if (Text.isText(textNode)) {
            const originalText = textNode.text
            // Only allow lowercase alphanumerical, for now
            const filteredText = originalText.replace(/[^a-z0-9-]/g, '')

            if (filteredText !== originalText) {
              Transforms.insertText(editor, filteredText, { at: textPath })
              return true
            }
          }
        }
      }
    }
  }
}
