import type { TBComponentProps, TBElement } from '@ttab/textbit'
import { Rows4Icon, XIcon } from 'lucide-react'
import { Transforms, type Descendant } from 'slate'
import { createPortal } from 'react-dom'
import { TVLInitDialog } from './TVLInitDialog'
import { cn } from '../../cn'

export const TVLWrapper = ({ editor, children, element, options }: TBComponentProps) => {
  const isFirst = !!editor && !!element && (editor.children as TBElement[])[0]?.id === element.id
  const inDialog = !!options?.inDialog
  const uninitialized = !!(element as TBElement | undefined)?.properties?.uninitialized

  if (uninitialized) {
    const findIdx = () => editor.children.findIndex((c) => (c as TBElement).id === element.id)

    const handleConfirm = (block: Descendant) => {
      const idx = findIdx()
      if (idx < 0) return
      Transforms.removeNodes(editor, { at: [idx] })
      Transforms.insertNodes(editor, block, { at: [idx] })
      Transforms.select(editor, {
        anchor: { offset: 0, path: [idx, 0, 0] },
        focus: { offset: 0, path: [idx, 0, 0] }
      })
    }

    const handleCancel = () => {
      const idx = findIdx()
      if (idx < 0) return
      Transforms.removeNodes(editor, { at: [idx] })
    }

    return (
      <>
        <span style={{ display: 'none' }}>{children}</span>
        {createPortal(
          <TVLInitDialog options={options} onConfirm={handleConfirm} onCancel={handleCancel} />,
          document.body
        )}
      </>
    )
  }

  return (
    <div className={cn('border rounded', !isFirst && !inDialog && 'mt-3')}>
      <div
        contentEditable={false}
        draggable={!inDialog}
        className={cn(
          'flex flex-nowrap justify-between items-center basis-full p-2 bg-slate-300 dark:bg-slate-900',
          !inDialog && 'cursor-grab'
        )}
      >
        <div className='flex items-end gap-2'>
          <Rows4Icon size={15} />
          <span className='text-xs font-semibold'>Tablåinformation</span>
        </div>
        {!inDialog && (
          <div
            className='hover:cursor-pointer hover:bg-slate-200 dark:hover:bg-gray-700 p-1 rounded -my-1'
            onMouseDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
              const n = editor.children.findIndex((child) => (child as TBElement).id === element.id)

              if (n > -1) {
                Transforms.removeNodes(editor, { at: [n] })
              }
            }}
          >
            <XIcon size={15} className='text-black dark:text-white' />
          </div>
        )}
      </div>
      <div className='px-2'>
        {children}
      </div>
    </div>
  )
}
