import { formatDate } from "../lib/formatDate"

interface Modified {
  modified?: string | undefined | boolean | number
  modifiedLabel?: string
  locale?: string
}

export const FactboxModified = ({ modified = '', modifiedLabel, locale = 'en' }: Modified) => {
  if (modified) {
    const formatted = formatDate(modified as string, locale)
    return (
      <div className='opacity-70 font-semibold text-xs flex justify-between items-center gap-1'>
        <div>{modifiedLabel ?? 'Original is from...'}</div>
        <div>{formatted}</div>
      </div>
    )
  }
  return <></>
}
