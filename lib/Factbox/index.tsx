import { Editor, Element, Transforms } from 'slate'
import type { TBPluginInitFunction } from '@ttab/textbit'
import {
  Factbox as FactboxComponent,
  FactboxTitle
} from './components'
import { normalizeFactbox } from './lib/normalizeFactbox'
import { consumes } from './lib/consumes'
import { consume } from './lib/consume'
import { FactboxBody } from './components/FactboxBody'
import { actionHandler } from './lib/actionHandler'
import { BoxIcon } from 'lucide-react'

export const Factbox: TBPluginInitFunction = (options) => {
  return {
    class: 'block',
    name: 'core/factbox',
    options,
    consumer: {
      consumes,
      consume
    },
    actions: [
      {
        name: 'core/factbox',
        title: options?.addSingleLabel as string ?? 'Insert factbox',
        tool: () => <BoxIcon style={{ width: '1em', height: '1em' }} />,
        handler: actionHandler,
        visibility: () => [
          false, //  visible
          true, //   enabled
          false //   active
        ]
      },
      {
        name: 'edit-factbox',
        handler: ({ editor, args }): void => {
          const matches = Array.from(Editor.nodes(editor, {
            at: [],
            mode: 'highest',
            match: n => {
              return (!Editor.isEditor(n) && Element.isElement(n)) ? n.id === args?.id : false
            }
          }))
          const [, path] = (matches?.length === 1) ? matches[0] : [undefined, undefined]
          Transforms.setNodes(
            editor,
            {
              properties: {
                editable: args?.editable as boolean || false,
                id: args?.id as string,
                original_updated: args?.original_updated as string,
                original_version: args?.original_version as string,
                locally_changed: args?.locally_changed as string,
                original_id: args?.original_id as string,
                unSaved: args?.unSaved as boolean || false
              }
            },
            { at: path }
          )
        }
      }
    ],
    componentEntry: {
      class: 'block',
      component: FactboxComponent,
      constraints: {
        normalizeNode: normalizeFactbox
      },
      children: [
        {
          type: 'title',
          class: 'text',
          component: FactboxTitle,
          constraints: {
            allowBreak: false
          }
        },
        {
          type: 'body',
          class: 'block',
          component: FactboxBody
        }
      ]
    }
  }
}
