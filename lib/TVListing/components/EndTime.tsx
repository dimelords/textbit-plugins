import type { TBComponentProps } from '@ttab/textbit'
import { FieldRow } from './FieldRow'

export const EndTime = ({ editor, element, children }: TBComponentProps) => (
  <FieldRow editor={editor} element={element} label='Sluttid'>
    {children}
  </FieldRow>
)
