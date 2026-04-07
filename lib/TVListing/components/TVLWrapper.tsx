import type { TBComponentProps } from '@ttab/textbit'
import { XIcon } from 'lucide-react'
import { type Descendant, Transforms } from 'slate'

export const TVLWrapper = ({ editor, children, element }: TBComponentProps) => {
  return (
    <div className='border rounded'>
      <div className='flex flex-nowrap justify-between items-center basis-full p-1 bg-slate-300 dark:bg-slate-900 cursor-grab'
        draggable={true}
        contentEditable={false}
      >
        <span className='text-xs' contentEditable={false}>Tablåinformation</span>
        <div
          className='hover:cursor-pointer hover:bg-slate-200 dark:hover:bg-gray-700 p-1 rounded'
          onMouseDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
            const n = editor.children.findIndex((child: Descendant) => child.id === element.id)

            if (n > -1) {
              Transforms.removeNodes(editor, { at: [n] })
            }
          }}
        >
          <XIcon size={15} className='text-black dark:text-white' />
        </div>

      </div>
      <div className='p-2'>
        {children}
      </div>
    </div>
  )
}
