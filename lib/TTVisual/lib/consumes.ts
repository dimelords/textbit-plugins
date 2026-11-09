import type { TBConsumesFunction } from '@ttab/textbit'
import { parseImageId } from './parseImageId'

export const consumes: TBConsumesFunction = ({ input }) => {
  const { type, data } = input

  // If data is not a string abort
  if (typeof data !== 'string') {
    return [false]
  }

  // If supported type and has a parseable image ID
  const types = ['tt/visual', 'text/uri-list', 'text/plain']
  if (types.includes(type) && parseImageId(data)) {
    return [
      true,
      'tt/visual'
    ]
  }

  return [false]
}
