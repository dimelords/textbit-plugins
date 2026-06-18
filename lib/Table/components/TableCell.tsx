import type { TBComponentProps } from '@ttab/textbit'

export const TableCell = ({ element, children, attributes }: TBComponentProps<HTMLTableCellElement>) => {
  const { colspan, rowspan } = element?.properties || {}

  return (
    <td
      {...attributes}
      className="py-2 px-2 border"
      colSpan={colspan ? Number(colspan) : undefined}
      rowSpan={rowspan ? Number(rowspan) : undefined}
    >
      {children}
    </td>
  )
}

TableCell.displayName = 'TableCell'
