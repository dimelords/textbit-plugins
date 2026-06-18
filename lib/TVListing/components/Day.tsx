import type { TBComponentProps } from '@ttab/textbit'
import { FieldRow } from './FieldRow'

export const Day = ({ editor, element, children }: TBComponentProps) => (
  <FieldRow editor={editor} element={element} label='Dag'>
    {children}
  </FieldRow>
)
