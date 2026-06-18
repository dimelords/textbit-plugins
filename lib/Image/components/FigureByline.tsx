import type { TBComponentProps } from '@ttab/textbit'

export const FigureByline = ({ children, options }: TBComponentProps) => {
  const { bylineLabel } = options as { bylineLabel?: string }

  return (
    <div className='p-2 flex rounded-xs text-sm bg-slate-100 dark:bg-slate-700'>
      <label className='shrink-0 w-16 opacity-70' contentEditable={false}>
        {`${bylineLabel ?? 'Photo'}:`}
      </label>
      <figcaption className='grow'>{children}</figcaption>
    </div>
  )
}
