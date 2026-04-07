import type { TBComponentProps } from '@ttab/textbit'
import { useEffect, useRef, useState } from 'react'
import { Element, Transforms } from 'slate'
import { CropDialog } from '../../components/CropDialog/CropDialog'
import { parseCropString, parseFocusString } from '../../components/CropDialog/softcrop-lib'
import { VisualCrop } from '../../components/CropDialog/VisualCrop'
import { VisualFocus } from '../../components/CropDialog/VisualFocus'

export const FigureImage = ({ editor, children, rootNode, options }: TBComponentProps) => {
  const { properties = {} } = Element.isElement(rootNode) ? rootNode : {}
  const enableCrop: boolean = options?.enableCrop as boolean ?? true

  const getImageSrc = options?.getImageSrc as
    ((properties: Record<string, unknown>) => string | Promise<string>) | undefined

  const src = (properties?.src as string) ?? undefined
  const uploadId = (properties?.uploadId as string) ?? undefined
  const propertiesRef = useRef(properties)
  propertiesRef.current = properties
  const [resolvedSrc, setResolvedSrc] = useState<string | undefined>()

  useEffect(() => {
    if (!getImageSrc) {
      setResolvedSrc(src)
      return
    }

    const result = getImageSrc(propertiesRef.current)
    if (typeof result === 'string') {
      setResolvedSrc(result)
    } else {
      result.then(setResolvedSrc).catch(() => setResolvedSrc(''))
    }
    // UploadId added as a dep for indirect re-fire when properties change
  }, [src, uploadId, getImageSrc])

  const focusStr = properties?.focus as string || undefined
  const cropStr = properties?.crop as string || undefined
  const imgContainerRef = useRef<HTMLDivElement>(null)

  const crop = parseCropString(cropStr)
  const focus = parseFocusString(focusStr)

  return (
    <div contentEditable={false}>
      <div ref={imgContainerRef} className='relative rounded rounded-xs overflow-hidden'>
        {/* Full image */}
        <img width='100%' src={resolvedSrc} />

        {enableCrop && resolvedSrc && (
          <>
            {/* Overlay with cutout for crop area */}
            {crop && <VisualCrop crop={crop}/>}

            {/* Focus point indicator */}
            {focus && <VisualFocus focus={focus}/>}

            <CropDialog
              src={resolvedSrc}
              area={crop}
              point={focus}
              onChange={({crop, focus}) => {
                const n = editor.children.findIndex((child) => child.id === rootNode?.id)
                if (n < 0) {
                  return
                }

                // Convert back to string format for storage
                const cropString = crop ? `${crop.x} ${crop.y} ${crop.w} ${crop.h}` : undefined
                const focusString = focus ? `${focus.x} ${focus.y}` : undefined

                Transforms.setNodes(
                  editor,
                  {
                    properties: {
                      // @ts-expect-error TODO: overhaul of typings
                      ...rootNode.properties,
                      crop: cropString,
                      focus: focusString
                    }
                  },
                  { at: [n] }
                )
              }}
            />
          </>
        )}
      </div>

      {children}
    </div>
  )
}
