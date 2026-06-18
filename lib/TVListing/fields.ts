import type { Descendant } from 'slate'
import { Channel, Day, EndTime, Time, Title } from './components'

export type TVLField = 'title' | 'channel' | 'day' | 'time' | 'end_time'

export const ALL_FIELDS: readonly TVLField[] = ['title', 'channel', 'day', 'time', 'end_time']

export const MANDATORY_FIELDS: readonly TVLField[] = ['channel']

const FIELD_COMPONENT = {
  title: Title,
  channel: Channel,
  day: Day,
  time: Time,
  end_time: EndTime
} as const

export const getFieldComponent = (field: TVLField) => FIELD_COMPONENT[field]

export const buildPlaceholderChildren = (fields: readonly TVLField[]): Descendant[] =>
  fields.map((field) => ({
    id: crypto.randomUUID(),
    class: 'text',
    type: `tt/tv-listing/${field}`,
    children: [{ text: '' }]
  }))
