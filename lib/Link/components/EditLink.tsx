import { useState, useRef } from 'react'
import { Editor, Element, Transforms } from 'slate'
import {
  type TBToolComponentProps,
  TextbitElement
} from '@ttab/textbit'
import { Link2OffIcon, LinkIcon, UnlinkIcon } from 'lucide-react'
import { isValidLink, sanitizeLink } from '../../shared/isValidLink'
import { ReactEditor, useSlateStatic } from 'slate-react'

export const EditLink = ({ entry }: TBToolComponentProps) => {
  const editor = useSlateStatic()
  const [node, path] = entry || []

  const [url, seturl] = useState<string>(TextbitElement.isElement(node) && typeof node?.properties?.url === 'string' ? node.properties.url : '')
  const inputRef = useRef<HTMLInputElement>(null)
  const [hasFocused, setHasFocused] = useState(false)

  if (!TextbitElement.isElement(node)) {
    return <></>
  }

  return <div className="flex -ml-1 select-none content-center gap-x-1">
    <div
      className="p-2 w-8 h-8 select-none flex place-items-center rounded border border-white hover:bg-gray-100 hover:border-gray-200 pointer data-[state='active']:bg-gray-100 data-[state='active']:border-gray-200 dark:border-gray-900 dark:hover:bg-slate-800 dark:hover:border-slate-700 dark:data-[state='active']:bg-gray-800 dark:data-[state='active']:border-slate-800 dark:hover:data-[state='active']:border-slate-700"
      onMouseDown={(e) => {
        e.preventDefault()
        deleteLink(editor)
      }}
    >
      <Link2OffIcon />
    </div>

    <input
      className="pl-2 pr-8 text-sm border justify-center select-none rounded bg-slate-50 dark:bg-slate-800 dark:border-slate-700"
      id={node.id}
      ref={inputRef}
      type="text"
      value={url}
      onFocus={() => {
        setHasFocused(true)
      }}
      onMouseDownCapture={(e) => {
        e.stopPropagation()
        e.preventDefault()
        e.currentTarget.focus()
      }}
      onChange={(e) => {
        seturl(e.target.value)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape' || e.key === 'Enter') {
          e.preventDefault()
          e.stopPropagation()

          ReactEditor.focus(editor)
        }
      }}
      onBlur={() => {
        if (!hasFocused) {
          return
        }

        const trimmedUrl = sanitizeLink(url)
        if (trimmedUrl === '') {
          deleteLink(editor)
        } else {
          Transforms.setNodes(
            editor,
            { properties: { ...node.properties, url: trimmedUrl } },
            { at: path }
          )
        }
      }}
    />

    {isValidLink(url, true)
      ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 w-8 h-8 -ml-9 select-none flex place-items-center"
        >
          <LinkIcon className="text-green-600" />
        </a>)
      : (
        <div
          className="p-2 w-8 h-8 -ml-9 select-none flex place-items-center"
          onMouseDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
        >
          <UnlinkIcon className="text-red-600" />
        </div>
      )}
  </div >
}


const deleteLink = (editor: Editor): void => {
  Transforms.unwrapNodes(editor, {
    match: n => !Editor.isEditor(n) && Element.isElement(n) && n.type === 'core/link'
  })
}
