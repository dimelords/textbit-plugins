export const formatDate = (date?: string, locale?: string): string => {
  if (!date) {
    return ''
  }

  const dateObject: number = Number(new Date(date))
  const secondsDiff = Math.round((dateObject - Date.now()) / 1000)
  const unitsInSec = [60, 3600, 86400, 86400 * 7, 86400 * 30, 86400 * 365, Infinity]
  const units: string[] = ['second', 'minute', 'hour', 'day', 'week', 'month', 'year']
  const unitIndex = unitsInSec.findIndex((cutoff) => cutoff > Math.abs(secondsDiff))
  const divisor = unitIndex ? unitsInSec[unitIndex - 1] : 1
  const rtf = new Intl.RelativeTimeFormat(locale || 'en', { numeric: 'auto' })
  // @ts-expect-error time format should work without typing
  const relativeTime = rtf.format(Math.floor(secondsDiff / divisor), units[unitIndex])
  return relativeTime
}

export const formatDateShort = (date?: string): string => {
  if (!date) {
    return ''
  }

  const d = new Date(date)
  if (isNaN(d.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat('sv-SE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d)
}
