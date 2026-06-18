import type { TBComponentProps } from '@ttab/textbit'
import type { TBElement } from '@ttab/textbit'
import { cn } from '../../cn'

export const CodeBlock = ({ children, editor, element }: TBComponentProps) => {
  const isFirst = !!editor && !!element && (editor.children as TBElement[])[0]?.id === element.id

  return <div className={cn('py-2 p-4 font-monospace text-sm border', !isFirst && 'mt-3')}>
    {children}
  </div>
}
