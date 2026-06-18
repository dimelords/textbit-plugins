import type { TBConsumeFunction, TBResource } from '@ttab/textbit'

export const consume: TBConsumeFunction = async ({ input }) => {
  if (Array.isArray(input)) {
    throw new Error('Factbox plugin expected string for consumation, not a list/array')
  }

  if (typeof input.data !== 'string') {
    throw new Error('Factbox plugin expected string for consumation')
  }

  return createFactboxNode(input)
}

/**
* Create a Factbox node
* @param {Plugin.Resource} input
* @returns {Plugin.Resource}
*/
const createFactboxNode = (input: TBResource): TBResource => {
  const {
    text,
    title,
    created,
    modified,
    id,
    original_version,
    original_updated,
    locally_changed
  } = JSON.parse(input.data as string)

  const body = {
    type: 'core/factbox/body',
    class: 'block',
    children: text
      .split('\n')
      .map((t: string) => ({
       type: 'core/text',
       class: 'text',
       children: [{ text: t }]
     }))
    }

  return {
    ...input,
    data: {
      id: crypto.randomUUID(),
      class: 'block',
      type: 'core/factbox',
      properties: {
        title,
        text,
        created,
        modified,
        id,
        original_id: id,
        original_updated,
        original_version,
        locally_changed,
        rel: 'factbox',
        type: 'core/factbox'
      },
      children: [
        {
          type: 'core/factbox/title',
          class: 'text',
          children: [{ text: title }]
        },
        body
      ]
    }
  }
}
