import type { TBPluginInitFunction, TBConsumeFunction, TBConsumesFunction, TBAction } from '@ttab/textbit'
import { ImageIcon } from 'lucide-react'

import {
  Figure,
  FigureImage,
  FigureText,
  FigureByline
} from './components'
import { consume } from './lib/consume'
import { consumes } from './lib/consumes'
import { normalizeImage } from './lib/normalizeImage'
import { actionHandler } from './lib/actionHandler'

export const Image: TBPluginInitFunction = (options) => {
  return {
    class: 'block',
    name: 'core/image',
    options,
    consumer: {
      consumes: (options?.consumes as TBConsumesFunction) ?? consumes,
      consume: (options?.consume as TBConsumeFunction) ?? consume
    },
    actions: [{
          name: 'insert-image',
          title: 'Image',
          tool: () => <ImageIcon style={{ width: '1em', height: '1em' }} />,
          handler: actionHandler,
          visibility: (options?.visibility as TBAction['visibility']) ?? (() => {
            return [
              true, // Always visible
              true, // Always enabled
              false // Never active
            ]
          })
      }],
    componentEntry: {
      class: 'block',
      component: Figure,
      constraints: {
        normalizeNode: normalizeImage
      },
      children: [
        {
          type: 'image',
          class: 'void',
          component: FigureImage,
          constraints: {
            min: 1,
            max: 1
          }
        },
        {
          type: 'text',
          class: 'text',
          component: FigureText,
          constraints: {
            allowBreak: false,
            min: 1,
            max: 1
          }
        },
        {
          type: 'byline',
          class: 'text',
          component: FigureByline,
          constraints: {
            allowBreak: false,
            min: 1,
            max: 1
          }
        }
      ]
    }
  }
}
