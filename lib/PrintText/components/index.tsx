import type { TBComponentProps } from '@ttab/textbit'
import type { TBElement } from '@ttab/textbit'
import { XIcon, FileTypeCornerIcon } from 'lucide-react'
import type { PropsWithChildren } from 'react'
import { Transforms } from 'slate'
import { cn } from '../../cn'

export const PrintText = ({ children, editor, element }: TBComponentProps & PropsWithChildren) => {
  const isFirst = !!editor && !!element && (editor.children as TBElement[])[0]?.id === element.id

  return (
    <div className={cn('border rounded', !isFirst && 'mt-3')}>
      <div
        contentEditable={false}
        draggable={true}
        className='flex items-center justify-between bg-slate-300 dark:bg-slate-900 p-2 cursor-grab'
      >
        <div className='flex items-end gap-2'>
          <FileTypeCornerIcon size={15} />
          <span className='text-xs font-semibold'>Print-text</span>
        </div>
        <div
          className='hover:cursor-pointer hover:bg-slate-200 dark:hover:bg-gray-700 p-1 -my-1 rounded'
          onMouseDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
            const n = editor.children.findIndex((child) => (child as TBElement).id === element.id)

            if (n > -1) {
              Transforms.removeNodes(editor, { at: [n] })
            }
          }}
        >
          <XIcon size={15} />
        </div>
      </div>
      <div className='px-2'>
        {children}
      </div>
    </div>
  )
}
