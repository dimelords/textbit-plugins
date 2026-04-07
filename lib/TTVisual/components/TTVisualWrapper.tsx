import React from 'react'
import type { TBComponentProps } from '@ttab/textbit'
import { Block } from '../../components/FocusBlock'

type Child = React.ReactElement & {
  props: { children: { props: { element: { type: string } } } }
}

export const TTVisualWrapper = ({ children, element, editor, options }: TBComponentProps) => {
  const removable = options?.removable as boolean ?? true

  const getType = (child: Child): string => {
    if (child?.props?.children?.props?.element?.type) {
      return child.props.children.props.element.type
    }
    return ''
  }

  const textNode: React.ReactNode[] = []
  const bylineNode: React.ReactNode[] = []
  const imageNode: React.ReactNode[] = []

  const childArray = React.Children.toArray(children) as Child[]
  childArray.forEach((child: Child) => {
    const type: string = getType(child)
    if (type.includes('text')) {
      textNode.push(child)
    } else if (type.includes('byline')) {
      bylineNode.push(child)
    } else {
      imageNode.push(child)
    }
  })

  return (
    <Block className='my-2' editor={editor} element={element} removable={removable}>
      <figure className='relative flex gap-1 flex-col min-h-10'>
        {imageNode}

        {textNode.map((child, index) => (
          <div key={index}>
            {child}
          </div>
        ))}
        {bylineNode.map((child, index) => (
          <div key={index}>
            {child}
          </div>
        ))}
      </figure>
    </Block>
  )
}
