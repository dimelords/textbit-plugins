import type { TBComponentProps } from '@ttab/textbit'
import { Block } from '../../components/FocusBlock'

export const Table = ({ editor, element, children }: TBComponentProps) => {
  return (
    <Block editor={editor} element={element}>
      <table className='w-full border table-fixed border-separate rounded border-spacing-0 m-0 p-0'>
        <tbody>
          {children}
        </tbody>
      </table>
    </Block>
  )
}
