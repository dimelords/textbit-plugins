import type { TBComponentProps } from '@ttab/textbit'
import { FieldRow } from './FieldRow'

export const Title = ({ editor, element, children }: TBComponentProps) => (
  <FieldRow editor={editor} element={element} label='Titel' align='start'>
    {children}
  </FieldRow>
)
