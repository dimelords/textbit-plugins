import { formatDate, formatDateShort } from "../lib/formatDate"

interface Modified {
  modified?: string | undefined | boolean | number
  modifiedLabel?: string
  locale?: string
  absolute?: boolean
}

export const FactboxModified = ({ modified = '', modifiedLabel, locale = 'en', absolute = false }: Modified) => {
  if (modified) {
    const formatted = absolute
      ? formatDateShort(modified as string)
      : formatDate(modified as string, locale)

    return (
      <div className='opacity-70 font-semibold text-[11px] flex justify-between items-center gap-1 w-full'>
        <div>{`${modifiedLabel ?? 'Original is from'} ${formatted}`}</div>
      </div>
    )
  }
  return <></>
}
