import { Text, Transforms, type Editor, type NodeEntry } from "slate"

export const normalizePrintText = (editor: Editor, nodeEntry: NodeEntry): boolean | undefined => {
  const [node, path] = nodeEntry

  if (!('type' in node) || node?.type !== 'tt/print-text' || !Array.isArray(node.children)) {
    return
  }

  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i]
    const childPath = path.concat(i)

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
