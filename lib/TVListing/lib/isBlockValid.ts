import type { TBElement } from '@ttab/textbit'
import { Node } from 'slate'
import { MANDATORY_FIELDS, type TVLField } from '../fields'

export const isBlockValid = (block: TBElement | undefined): boolean => {
  if (!block || block.type !== 'tt/tv-listing') {
    return false
  }

  const children = (block.children as TBElement[] | undefined) ?? []

  if (children.length === 0) {
    return false
  }

  const presentFields = new Set(
    children.map((c) => c.type.replace('tt/tv-listing/', '') as TVLField)
  )

  if (!MANDATORY_FIELDS.every((f) => presentFields.has(f))) {
    return false
  }

  return children.every((child) => {
    const field = child.type.replace('tt/tv-listing/', '') as TVLField

    if (field === 'channel') {
      const name = (block.properties?.channel as string | undefined)?.trim() ?? ''
      const uri = (block.properties?.uri as string | undefined)?.trim() ?? ''
      return !!name && !!uri
    }

    return Node.string(child).trim().length > 0
  })
}
