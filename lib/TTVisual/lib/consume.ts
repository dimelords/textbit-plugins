import type { TBConsumeFunction, TBResource } from '@ttab/textbit'
import type { VisualPropertiesInterface } from '../types'
import { parseImageId, parseJSON } from './parseImageId'

export const consume: TBConsumeFunction = async ({ input }) => {
  if (Array.isArray(input)) {
    throw new Error('VisualEx plugin expected string for consumation, not a list/array')
  }

  if (typeof input.data !== 'string') {
    throw new Error('VisualEx plugin expected string for consumation')
  }


  return createTTVisualNode(input)
}

const createTTVisualNode = async (input: TBResource): Promise<TBResource> => {
  const props = await createVisualProperties(input)

  return {
    ...input,
    data: {
      id: crypto.randomUUID(),
      class: 'block',
      type: 'tt/visual',
      properties: {
        href: props.href,
        proxy: props.proxy,
        uri: `http://tt.se${parseImageId(props.href)}`,
        rel: props.rel || 'self',
        text: props.text,
        byline: props.byline,
        width: props.width,
        height: props.height,
        type: 'tt/picture'
      },
      children: [
        {
          type: 'tt/visual/image',
          class: 'void',
          children: [{ text: props.href }]
        },
        {
          type: 'tt/visual/text',
          class: 'text',
          children: [{ text: props.text }]
        },
        {
          type: 'tt/visual/byline',
          class: 'text',
          children: [{ text: props.byline }]
        }
      ]
    }
  }
}

/**
* Get image resolution without downloading the image.
*
* Rejects after 15s if neither onload nor onerror fires (e.g. CORS preflight
* stall, DNS hang). Without this, `consume()` could hang indefinitely and
* leave a phantom loader in the editor.
*
* @param {string} url
* @returns {Promise<{ width: number, height: number } | null>}
* @throws {Error}
*/
const IMAGE_RESOLUTION_TIMEOUT_MS = 15_000

const getImageResolution = async (url: string): Promise<{ width: number, height: number } | null> => {
  return await new Promise((resolve, reject) => {
    const img = new Image()
    const timer = setTimeout(() => {
      reject(new Error(`Timed out loading image after ${IMAGE_RESOLUTION_TIMEOUT_MS}ms`))
    }, IMAGE_RESOLUTION_TIMEOUT_MS)

    img.onload = () => {
      clearTimeout(timer)
      resolve({ width: img.width, height: img.height })
    }

    img.onerror = () => {
      clearTimeout(timer)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}

/**
* Create visual properties depending on input
* @param {Plugin.Resource} input
* @returns {Promise<VisualPropertiesInterface>}
* @throws {Error}
*/
const createVisualProperties = async (input: TBResource): Promise<VisualPropertiesInterface> => {
  if (typeof input.data !== 'string') {
    throw new Error('VisualEx plugin expected string for consumation')
  }

  const json = parseJSON(input.data)

  if (json) {
    return json
  }

  const id = parseImageId(input.data)

  const res = await getImageResolution(`https://tt.se/media/image/${id}_WatermarkPreview.jpg`)

  if (!res) {
    throw new Error('Failed to get image resolution')
  }

  const { width, height } = res

  return {
    type: 'tt/picture',
    href: `http://tt.se/media/image/${id}_WatermarkPreview.jpg`,
    uri: `http://tt.se/media/image/${id}`,
    byline: '',
    text: '',
    width,
    height
  }
}
