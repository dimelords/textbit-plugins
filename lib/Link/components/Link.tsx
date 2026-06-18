import { useState } from 'react'
import type { TBComponentProps } from '@ttab/textbit'
import { isValidLink } from '../../shared/isValidLink'

export const Link = ({ children, element }: TBComponentProps) => {
  const url: string = element.properties?.url as string || ''
  const [isHovering, setIsHovering] = useState<boolean>(false)

  return (
    <a
      className={`underline decoration-2 underline-offset-4 ${isValidLink(url) ? 'decoration-blue-300' : 'decoration-wavy decoration-red-400'}`}
      href={url}
      onClick={(event) => {
        event.preventDefault()
        window.open(url, '_blank', 'noopener,noreferrer')
      }}
      onMouseEnter={() => {
        setIsHovering(true)
      }}
      onMouseLeave={() => {
        setIsHovering(false)
      }}
      title={`${element.properties?.title || ''}`}
      style={{
        textDecorationStyle: isValidLink(url) ? 'solid' : 'wavy',
        cursor: isHovering ? 'pointer' : 'auto'
      }}
    >
      {children}
    </a>
  )
}
