import type { TBComponentProps } from '@ttab/textbit'

export const TTVisualText = ({ children, options }: TBComponentProps) => {
  const { captionLabel } = options as { captionLabel?: string }

  return (
    <div className='p-2 flex rounded-xs text-sm bg-slate-200 dark:bg-slate-800'>
      <label className='shrink-0 w-16 opacity-70' contentEditable={false}>
        {`${captionLabel ?? 'Text'}:`}
      </label>
      <figcaption className='grow'>{children}</figcaption>
    </div>
  )
}
