import type { TBPluginInitFunction } from '@ttab/textbit'
import { PrintText as PrintTextComponent } from './components'
import { actionHandler } from './lib/actionHandler'
import { FileTypeCornerIcon } from 'lucide-react'
import { TextRole } from './components/TextRole'
import { Text as TextComponent } from './components/Text'
import { normalizePrintText } from './lib/normalizePrintText'

export const PrintText: TBPluginInitFunction = (options) => {
  return {
    class: 'block',
    name: 'tt/print-text',
    options,

    actions: [
      {
        name: 'tt/print-text',
        title: 'Print-text',
        tool: () => <FileTypeCornerIcon style={{ width: '1em', height: '1em' }} />,
        handler: actionHandler,
        visibility: () => [true, true, false]
      }
    ],
    componentEntry: {
      class: 'block',
      component: PrintTextComponent,
      constraints: {
        normalizeNode: normalizePrintText
      },
      children: [
        {
          type: 'text',
          class: 'text',
          component: TextComponent,
          constraints: {
            min: 1,
            max: 1
          }
        },
        {
          type: 'role',
          class: 'text',
          component: TextRole,
          constraints: {
            min: 1,
            max: 1
          }
        }
      ]
    }
  }
}
