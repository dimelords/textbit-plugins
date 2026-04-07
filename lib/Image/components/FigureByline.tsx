import type { TBComponentProps } from '@ttab/textbit'

export const FigureByline = ({ children, options }: TBComponentProps) => {
  const { bylineLabel } = options as { bylineLabel?: string }

  return (
    <div className='flex items-center ps-6 bg-slate-100 dark:bg-slate-800 text-sm py-0.5'>
      <label contentEditable={false} className='w-12 opacity-60'>
        {`${bylineLabel ?? 'Photo'}:`}
      </label>

      <figcaption className='p-1'>
        {children}
      </figcaption>
    </div>
  )
}
