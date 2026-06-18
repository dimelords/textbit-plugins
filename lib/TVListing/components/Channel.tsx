import type { TBComponentProps } from '@ttab/textbit'
import type { PropsWithChildren } from 'react'
import { FieldRow } from './FieldRow'

export const Channel = ({ editor, element, options }: TBComponentProps) => {
  const ChannelComponent = options?.channelComponent as React.ComponentType<PropsWithChildren> | undefined

  return (
    <FieldRow editor={editor} element={element} label='Kanal' mandatory>
      {ChannelComponent && <ChannelComponent />}
    </FieldRow>
  )
}
