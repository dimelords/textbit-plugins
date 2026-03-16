
import { ListOrderedIcon } from 'lucide-react'
import { List, ListItem } from './components'
import { actionHandler } from './lib/actionHandler'
import { normalizeNode } from './lib/normalizeNode'
import type { Editor, NodeEntry } from 'slate'
import type { TBPluginDefinition } from '@ttab/textbit'

export const OrderedList: (options?: { title?: string }) => TBPluginDefinition = (options) => {

  return {
    class: 'text',
    name: 'core/ordered-list',
    actions: [
      {
        name: 'add-ordered-list',
        title: options?.title || 'Number list',
        tool: () => <ListOrderedIcon style={{ width: '1em', height: '1em' }} />,
        hotkey: 'mod+shift+7',
        handler: ({ editor }): void => {
          actionHandler(editor, 'core/ordered-list')
        },
        visibility: (element, innerElement) => {
          const cursorElement = innerElement ?? element
          return [
            ['core/ordered-list', 'core/unordered-list', 'core/text',
              'core/ordered-list/list-item', 'core/unordered-list/list-item'].includes(cursorElement.type),
            true,
            cursorElement.type === 'core/ordered-list'
              || cursorElement.type === 'core/ordered-list/list-item'
          ]
        }
      }
    ],
    componentEntry: {
      class: 'text',
      component: List,
      constraints: {
        normalizeNode: (editor: Editor, nodeEntry: NodeEntry) => {
          return normalizeNode(editor, nodeEntry, 'core/ordered-list')
        }
      },
      children: [
        {
          type: 'list-item',
          class: 'text',
          component: ListItem
        }
      ]
    }
  }
}
