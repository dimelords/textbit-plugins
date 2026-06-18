import type { TBPluginInitFunction } from '@ttab/textbit'
import { TableIcon } from 'lucide-react'
import { actionHandler } from './lib/actionHandler'
import { buildComponentEntry } from './componentEntry'

export const TVListing: TBPluginInitFunction = (options) => {
  return {
    class: 'block',
    name: 'tt/tv-listing',
    options,
    actions: [
      {
        name: 'tt/tv-listing',
        title: 'Tablåinfo',
        tool: () => <TableIcon style={{ width: '1em', height: '1em' }} />,
        handler: actionHandler,
        visibility: () => {
          return [
            true,
            true,
            false
          ]
        }
      }
    ],
    componentEntry: buildComponentEntry()
  }
}
