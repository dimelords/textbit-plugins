import type { TBComponentProps } from '@ttab/textbit'
import { Element, Transforms } from 'slate'
import { parseCropString, parseFocusString } from '../../components/CropDialog/softcrop-lib'
import { useRef } from 'react'
import { VisualCrop } from '../../components/CropDialog/VisualCrop'
import { VisualFocus } from '../../components/CropDialog/VisualFocus'
import { CropDialog } from '../../components/CropDialog/CropDialog'

export const TTVisualImage = ({ editor, children, rootNode, options }: TBComponentProps) => {
  const { properties = { href: '' } } = Element.isElement(rootNode) ? rootNode : {}
  const href = properties.href as string

  const focusStr = properties?.focus as string || undefined
  const cropStr = properties?.crop as string || undefined
  const imgContainerRef = useRef<HTMLDivElement>(null)

  const crop = parseCropString(cropStr)
  const focus = parseFocusString(focusStr)

  // Property added either when adding a tt/visual or when transforming
  // This volatile and will only be added to the collaborative state, _not_ persisted.
  const proxy = properties.proxy as string

  return (
    <div contentEditable={false}>
      <div
        ref={imgContainerRef}
        draggable={true}
        className='relative rounded rounded-xs overflow-hidden'
      >
        <img width='100%' src={proxy || href} />

        {!!options?.enableCrop &&
          <>
            {/* Overlay with cutout for crop area */}
            {crop && <VisualCrop crop={crop}/>}

            {/* Focus point indicator */}
            {focus && <VisualFocus focus={focus}/>}

            <CropDialog
              src={proxy || href}
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
        }
      </div>
      {children}
    </div>
  )
}
