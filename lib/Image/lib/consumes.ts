import type { TBConsumesFunction } from '@ttab/textbit'
import { CONFIG } from '../config'
import { parseImageJSON } from './parseImageJSON'

export const consumes: TBConsumesFunction = ({ input }) => {
  // Handle JSON string drops (e.g. from image search)
  if (input.type === 'core/image' && typeof input.data === 'string') {
    const parsed = parseImageJSON(input.data)
    if (parsed) {
      return [true, 'core/image']
    }
  }

  // Handle file drops
  if (!(input.data instanceof File)) {
    return [false]
  }
  const { size, type } = input.data

  if (!['image/png', 'image/jpg', 'image/jpeg', 'image/gif'].includes(type)) {
    return [false]
  }

  // Hardcoded limit on 50 MB
  if (size / 1024 / 1024 > CONFIG.maxSizeInMb) {
    console.warn(`Image is too large, ${size / 1024 / 1024}, max ${CONFIG.maxSizeInMb} Mb allowed`)
    return [false]
  }

  return [true, 'core/image', false]
}
