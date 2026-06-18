import type { ReactNode } from 'react'
import type { Editor, Element } from 'slate'
import { Transforms } from 'slate'
import { ReactEditor } from 'slate-react'
import { XIcon } from 'lucide-react'
import { cn } from '../../cn'

interface FieldRowProps {
  editor: Editor
  element: Element
  label: string
  align?: 'start' | 'center'
  mandatory?: boolean
  children: ReactNode
  onRemove?: () => void
}

export const FieldRow = ({
  editor,
  element,
  label,
  align = 'center',
  mandatory = false,
  children,
  onRemove
}: FieldRowProps) => {
  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onRemove) {
      onRemove()
      return
    }
    try {
      const path = ReactEditor.findPath(editor, element)
      Transforms.removeNodes(editor, { at: path })
    } catch {
      /* element no longer in tree */
    }
  }

  return (
    <div
      className={cn(
        'group border-b flex gap-3 text-sm py-2',
        align === 'start' ? 'items-start' : 'items-center'
      )}
    >
      <label contentEditable={false} className='w-14 text-sm opacity-70'>{label}</label>
      <div className='flex-1 min-w-0'>{children}</div>
      {!mandatory && (
        <button
          contentEditable={false}
          type='button'
          onMouseDown={handleRemove}
          title={`Ta bort ${label.toLowerCase()}`}
          className='opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:bg-slate-200 dark:hover:bg-gray-700 p-1 rounded transition-opacity'
        >
          <XIcon size={14} className='text-black dark:text-white' />
        </button>
      )}
    </div>
  )
}
