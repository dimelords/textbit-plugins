import type { TBPluginInitFunction } from '@ttab/textbit'
import {
  TableCell,
  Table as TableComponent,
  TableRow
} from './components'
import { consumes } from './lib/consumes'
import { consume } from './lib/consume'

export const Table: TBPluginInitFunction = () => {
  return {
    class: 'block',
    name: 'core/table',
    consumer: {
      consumes,
      consume
    },
    actions: [],
    componentEntry: {
      class: 'block',
      component: TableComponent,
      children: [
        {
          type: 'row',
          class: 'block',
          component: TableRow,
          asOwnElement: true,
          children: [
            {
              type: 'cell',
              class: 'text',
              constraints: {
                allowBreak: false
              },
              component: TableCell,
              asOwnElement: true
            }
          ]
        }
      ]
    }
  }
}
