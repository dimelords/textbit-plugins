import type { TBComponentProps } from '@ttab/textbit'
import { Block } from '../../components/FocusBlock'

export const OembedWrapper = ({ children, editor, element }: TBComponentProps) => {
  return (
    <Block editor={editor} element={element}>
      <div className="flex gap-1 flex-col py-2 min-h-10 rounded-sm">
        {children}
      </div>
    </Block>
  )
}
