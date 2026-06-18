import type { TBPluginInitFunction } from '@ttab/textbit'

import { consume } from './lib/consume'
import { consumes } from './lib/consumes'
import {
  TTVisualWrapper,
  TTVisualImage,
  TTVisualByline,
  TTVisualText
} from './components'
import { normalizeTTVisual } from './lib/normalizeTTVisual'

export const TTVisual: TBPluginInitFunction = (options) => {
  return {
    class: 'block',
    name: 'tt/visual',
    consumer: {
      consumes,
      consume
    },
    options,
    componentEntry: {
      component: TTVisualWrapper,
      constraints: {
        normalizeNode: normalizeTTVisual
      },
      class: 'block',
      children: [
        {
          type: 'image',
          class: 'void',
          component: TTVisualImage,
          constraints: {
            min: 1,
            max: 1
          }
        },
        {
          type: 'text',
          class: 'text',
          component: TTVisualText,
          constraints: {
            allowBreak: false,
            min: 1,
            max: 1
          }
        },
        {
          type: 'byline',
          class: 'text',
          component: TTVisualByline,
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
