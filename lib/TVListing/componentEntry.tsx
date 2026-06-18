import type { TBComponentEntry } from '@ttab/textbit'
import { TVLWrapper } from './components'
import { ALL_FIELDS, getFieldComponent } from './fields'

export const buildComponentEntry = (): TBComponentEntry => ({
  class: 'block',
  component: TVLWrapper,
  children: ALL_FIELDS.map((field) => ({
    type: field,
    class: 'text',
    component: getFieldComponent(field),
    constraints: { allowBreak: false, allowSoftBreak: false }
  }))
})
