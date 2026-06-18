import type { TBComponentProps } from '@ttab/textbit'
import { FieldRow } from './FieldRow'

export const Time = ({ editor, element, children }: TBComponentProps) => (
  <FieldRow editor={editor} element={element} label='Starttid'>
    {children}
  </FieldRow>
)
