import type { TBConsumeFunction, TBResource } from '@ttab/textbit'
import { parseImageJSON } from './parseImageJSON'

/**
 * Consume a File or JSON string and produce a core/image object
 */
export const consume: TBConsumeFunction = async ({ input }) => {
  if (Array.isArray(input)) {
    throw new Error('Image plugin expected single input, not a list/array')
  }

  // Handle JSON string drops (e.g. from image search)
  if (typeof input.data === 'string') {
    return consumeJSON(input)
  }

  // Handle file drops
  if (!(input.data instanceof File)) {
    throw new Error('Image plugin expected File or string for consumation')
  }

  return consumeFile(input)
}

function consumeJSON(input: TBResource): TBResource {
  const parsed = parseImageJSON(input.data as string)
  if (!parsed) {
    throw new Error('Image plugin could not parse JSON data')
  }

  return {
    ...input,
    data: {
      id: crypto.randomUUID(),
      class: 'block',
      type: 'core/image',
      properties: {
        src: parsed.proxy || parsed.href,
        href: parsed.href,
        ...(parsed.rel && { rel: parsed.rel }),
        ...(parsed.type && { type: parsed.type }),
        ...(parsed.uri && { uri: parsed.uri }),
        text: parsed.text || '',
        credit: parsed.byline || '',
        width: parsed.width,
        height: parsed.height
      },
      children: [
        {
          type: 'core/image/image',
          class: 'void',
          children: [{ text: '' }]
        },
        {
          type: 'core/image/text',
          class: 'text',
          children: [{ text: parsed.text || '' }]
        },
        {
          type: 'core/image/byline',
          class: 'text',
          children: [{ text: parsed.byline || '' }]
        }
      ]
    }
  }
}

async function consumeFile(input: TBResource): Promise<TBResource> {
  const { name, type, size } = input.data as File

  return new Promise<TBResource>((resolve, reject) => {
    const reader = new FileReader()

    reader.addEventListener('load', () => {
      if (typeof reader.result !== 'string') {
        reject(new Error(`Error when image dropped, resulted in ${typeof reader.result}`))
        return
      }

      const tmpImage = new window.Image()
      tmpImage.src = reader.result
      tmpImage.onload = () => {
        window.setTimeout(() => {
          resolve({
            ...input,
            data: {
              id: crypto.randomUUID(),
              class: 'block',
              type: 'core/image',
              properties: {
                type,
                src: tmpImage.src,
                title: name,
                size,
                width: tmpImage.width,
                height: tmpImage.height
              },
              children: [
                {
                  type: 'core/image/image',
                  class: 'void',
                  children: [{ text: '' }]
                },
                {
                  type: 'core/image/text',
                  class: 'text',
                  children: [{ text: '' }]
                },
                {
                  type: 'core/image/byline',
                  class: 'text',
                  children: [{ text: '' }]
                }
              ]
            }
          })
        }, 1000)
      }
    }, false)

    reader.readAsDataURL(input.data as Blob)
  })
}
