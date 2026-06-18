import type { TBConsumeFunction } from '@ttab/textbit'
import { type BaseRange, Editor, Node, Path, Text, Transforms } from 'slate'

const LOCALIZED_QUOTES: Record<string, string[]>  = {
  sv: [
    '’', '’',
    '”', '”'],
  fi: [
    '’', '’',
    '”', '”'],
  hu: [
    '’', '’',
    '„', '”'],
  pl: [
    '‚', '’',
    '„', '”'],
  no: [
    '‹', '›',
    '«', '»'],
  nb: [
    '‹', '›',
    '«', '»'],
  nn: [
    '‹', '›',
    '«', '»'],
  en: [
    '‘', '’',
    '“', '”'],
  da: [
    '„', '“',
    '„', '“'],
  de: [
    '‚', '‘',
    '„', '“'],
  fr: [
    '‹ ', ' ›',
    '« ', '»'
  ]
}

const LOCALIZED_DASH_PREFIX: Record<string, string> = {
  sv: '–'
}

const KEY_CODES = [
  9, // tab
  32, // space
  60, // non breaking space
  33, // !
  40, // (
  41, // )
  43, // +
  44, // ,
  45, // -
  46, // .
  47, // /
  58, // :
  59, // ;
  60, // <
  61, // =
  62, // >
  63 // ?
]

export const consume: TBConsumeFunction = async ({ editor, input }) => {
  const { selection } = editor
  const lang = editor.lang.substring(0, 2).toLowerCase()

  if (Array.isArray(input) || typeof input.data !== 'string') {
    return
  }

  if (!selection || selection.anchor.path.length < 2) {
    return
  }

  const { data } = input

  // If input in the first position is a dash and we have replacement rule for dash in current lang
  if (data[0] === '-' && LOCALIZED_DASH_PREFIX[lang]) {
    if (isFirstCharacterOfFirstChild(editor, selection)) {
      return {
        ...input,
        data: LOCALIZED_DASH_PREFIX[lang] + data.slice(1)
      }
    }
  }

  // If input is a dash immediately following a preceding dash, turn them into a long dash
  if (data[0] === '-') {
    const { anchor } = selection

    // Find the previous character regardless of nesting
    const before = Editor.before(editor, anchor, { unit: 'character' })

    if (before) {
      const [node] = Editor.node(editor, before.path) // Get the node at that position

      if (Text.isText(node)) {
        const text = node.text
        const charBefore = text[before.offset] // Get the actual character before the cursor

        if (charBefore === '-') {
          Transforms.delete(editor, { at: before }) // Remove the previous dash
          return {
            ...input,
            data: '–' // Replace both dashes with a long dash
          }
        }
      }
    }
  }


  // Iterate the sibling text leaves of the current text node. The current
  // text node lives at selection.anchor.path; its parent block is the path
  // with the last index dropped. Hard-coding depth 2 here fails when the
  // text is nested deeper, e.g. inside a factbox embedded in an article.
  const parentPath = Path.parent(selection.anchor.path)
  const startIndex = selection.anchor.path[selection.anchor.path.length - 1]
  let firstOffset = selection.anchor.offset // Start text offset in first node
  let point // We will store the point of found quote, then traverse 2 more chars
  let prevChar: string = '' // We will keep track of the char that comes after the current char

  // From anchor inline node and backwards
  for (let pos = startIndex; pos >= 0; pos--) {
    const [node, path] = Editor.node(editor, [...parentPath, pos])
    if (!Text.isText(node)) {
      continue
    }

    // From firstOffset in first text node then from end of each text node and backwards
    for (let offset = firstOffset || node.text.length - 1; offset >= 0; offset--) {
      if (point) {
        // If the first char before an inch/foot mark is a number and the character
        // after is a some kind of whitespace or puncuation we interpret this as an
        // actual foot or inch and just leave things be.
        const char = node.text[offset]
        if (!isNaN(parseInt(char)) && (KEY_CODES.includes(prevChar.charCodeAt(0)))) {
          // We have established that a quote is preceded by a number and followed by a whitespace/punctuation
          // This looks like it is actually used as inch or foot mark. We're done.
          return input
        }

        // We have found a matching inch/foot and want to convert them to a citation
        pos = -1 // Set pos to -1 to exit outer loop
        break
      }

      if (node.text[offset] === data) {
        point = { path, offset }
      } else {
        prevChar = node.text[offset]
      }
    }

    firstOffset = 0
  }

  if (!point) {
    return input
  }

  //
  // Get quotation marks from editor, or rather, the document language
  // TODO: Now we use the documents language, should it instead use the language from the current element?
  //
  const q = LOCALIZED_QUOTES[lang] || LOCALIZED_QUOTES.en

  // Which are the typographic quote we want for the char?
  let quotes: string[] = []
  if (data === "'") {
    quotes = [q[0], q[1]]
  } else if (data === '"') {
    quotes = [q[2], q[3]]
  } else {
    return input // This should never happen if the matcher is alrighty
  }

  // Transform the previous found inch/foot mark to beginning typographic quotation mark
  Transforms.delete(editor, {
    at: point
  })

  Transforms.insertText(editor, quotes[0], {
    at: point
  })

  // Return the ending typographic quotation mark to be handled in normal flow
  return {
    ...input,
    data: quotes[1]
  }
}


function isFirstCharacterOfFirstChild(editor: Editor, selection: BaseRange): boolean {
  const { anchor } = selection

  // Ensure the selection is within the editor
  if (anchor.path.length < 2) {
    return false
  }

  // Find the first text descendant of the block containing the cursor.
  // The block is the parent of the current text node; walking up from
  // selection.anchor.path keeps this correct at any nesting depth.
  const blockPath = Path.parent(anchor.path)
  const firstTextEntry = Node.first(editor, blockPath)
  if (!firstTextEntry) {
    return false
  }

  const [firstTextNode, firstTextPath] = firstTextEntry

  // Ensure it's a text node
  if (!Text.isText(firstTextNode)) {
    return false
  }

  // Check if selection starts at the first character of this text node
  return Path.equals(anchor.path, firstTextPath) && anchor.offset === 0
}
