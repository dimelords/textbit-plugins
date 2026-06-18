import type { TBComponentProps } from '@ttab/textbit'
import { Block } from '../../components/FocusBlock'

export const Blockquote = ({ children, editor, element }: TBComponentProps) => {
  return (
    <Block editor={editor} element={element}>
      <div className='px-6 py-4 border-l-8 border-l-slate-200 group-data-[state="active"]:rounded'>
        {children}
      </div>
    </Block>
  )
}
