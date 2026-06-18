import type { TBComponentProps } from '@ttab/textbit'

export const TableRow = ({ children, attributes }: TBComponentProps<HTMLTableRowElement>) => (
  <tr {...attributes}>{children}</tr>
)

TableRow.displayName = 'TableRow'
