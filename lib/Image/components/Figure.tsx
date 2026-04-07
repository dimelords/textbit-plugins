import type { TBComponentProps } from '@ttab/textbit'
import { Block } from '../../components/FocusBlock'

export const Figure = ({ children, editor, element, options }: TBComponentProps) => {
  const removable = options?.removable as boolean ?? false

  return (
    <Block className='my-2' editor={editor} element={element} removable={removable}>
      <figure className="flex gap-1 flex-col min-h-10 rounded-sm">
        {children}
      </figure>
    </Block>
  )
}
