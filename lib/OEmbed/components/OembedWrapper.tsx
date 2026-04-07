import type { TBComponentProps } from '@ttab/textbit'
import { Block } from '../../components/FocusBlock'

export const OembedWrapper = ({ children }: TBComponentProps) => {
  return (
    <Block className='my-2'>
      <div className="flex gap-1 flex-col py-2 min-h-10 rounded-sm">
        {children}
      </div>
    </Block>
  )
}
