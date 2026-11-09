import { cva } from "class-variance-authority"
import { GripHorizontal, GripVertical } from "lucide-react"
import { type CSSProperties, useCallback, useEffect, useState } from "react"
import { cn } from "../../cn"

export const DragHandle = ({ side, offset, opposite, onChange, size }: {
  side: 'top' | 'right' | 'bottom' | 'left'
  onChange: (offset: number) => void
  offset: number // Offset from the given side of the dimmed area as a part (0-1.0) of the image container
  opposite: number // Offset of the opposite side, used to calculate restrictions
  size: number // Original width of image container width or height depending on which side
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(0)
  const [initialOffset, setInitialOffset] = useState(0)

  const dimmer = cva(
    'absolute bg-black opacity-50 pointer-events-none',
    {
      variants: {
        side: {
          top: 'top-0 h-2 w-full',
          right: 'top-0 bottom-0 right-0 w-2',
          bottom: 'bottom-0 left-0 w-full h-2',
          left: 'top-0 bottom-0 w-2'
        }
      }
    }
  )

  const handleContainer = cva(
    'absolute flex overflow-visible',
    {
      variants: {
        side: {
          top: 'top-0 left-0 w-full justify-center',
          right: 'top-0 bottom-0 right-0 items-center',
          bottom: 'bottom-0 left-0 right-0 justify-center',
          left: 'top-0 bottom-0 items-center'
        }
      }
    }
  )

  const handleWidth = 22
  const handle = cva(
    'flex justify-center items-center bg-black opacity-50 hover:opacity-80 cursor-grab active:cursor-grabbing touch-none',
    {
      variants: {
        side: {
          top: `w-10 h-[22px] rounded-b-md`,
          right: `w-[22px] h-10 -ml-[22px] rounded-l-lg`,
          bottom: `w-10 h-[22px] -mt-[22px] rounded-t-lg`,
          left: `w-[22px] h-10 rounded-r-lg`
        }
      }
    }
  )

  let offsetInPx = 0
  if (offset > 0) {
    // We don't allow cropping out the full image, keep handles visible
    offsetInPx = (offset * handleWidth > size)
      ? size - handleWidth
      : offset * size
  }

  const handleStyle: CSSProperties = {}
  if (side === 'top') {
    handleStyle.marginTop = offsetInPx
  } else if (side === 'right') {
    handleStyle.marginLeft = -(offsetInPx + handleWidth)
  } else if (side === 'bottom') {
    handleStyle.marginTop = -(offsetInPx + handleWidth)
  } else {
    handleStyle.marginLeft = offsetInPx
  }

  const dimmerStyle = (['top', 'bottom'].includes(side))
    ? { height: `${offsetInPx}px` }
    : { width: `${offsetInPx}px` }

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    setInitialOffset(offset)

    if (side === 'top' || side === 'bottom') {
      setDragStart(e.clientY)
    } else {
      setDragStart(e.clientX)
    }
  }, [offset, side])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return

    let delta: number
    if (side === 'top' || side === 'bottom') {
      delta = e.clientY - dragStart
    } else {
      delta = e.clientX - dragStart
    }

    // For bottom and right sides, reverse the delta direction
    if (side === 'bottom' || side === 'right') {
      delta = -delta
    }

    const newOffset = Math.max(0, Math.min(1, initialOffset + delta / size))
    onChange(Math.min(
      newOffset,
      1 - opposite - (handleWidth * 2 / size)
    ))
    // TODO: add 'opposite' to the deps, or say here why it stays out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging, dragStart, initialOffset, side, size, onChange])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    setInitialOffset(offset)

    const touch = e.touches[0]
    if (side === 'top' || side === 'bottom') {
      setDragStart(touch.clientY)
    } else {
      setDragStart(touch.clientX)
    }
  }, [offset, side])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return
    e.preventDefault()

    const touch = e.touches[0]
    let delta: number
    if (side === 'top' || side === 'bottom') {
      delta = touch.clientY - dragStart
    } else {
      delta = touch.clientX - dragStart
    }

    // For bottom and right sides, reverse the delta direction
    if (side === 'bottom' || side === 'right') {
      delta = -delta
    }

    const newOffset = Math.max(0, Math.min(1, initialOffset + delta / size))
    onChange(Math.min(
      newOffset,
      1 - opposite - (handleWidth * 2 / size)
    ))
    // TODO: add 'opposite' to the deps, or say here why it stays out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging, dragStart, initialOffset, side, size, onChange])

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Add global event listeners for mouse/touch events when dragging
  useEffect(() => {
    if (!isDragging) return

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])

  return (
    <>
      <div className={cn(dimmer({side}))} style={dimmerStyle} />
      <div className={cn(handleContainer({side}))}>
        <div
          className={cn(handle({side}))}
          style={handleStyle}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {side === 'top' && <GripHorizontal size={20} className='text-white -mt-0.5'/>}
          {side === 'right' && <GripVertical size={20} className='text-white ml-0.5'/>}
          {side === 'bottom' && <GripHorizontal size={20} className='text-white mt-0.5'/>}
          {side === 'left' && <GripVertical size={20} className='text-white -ml-0.5'/>}
        </div>
      </div>
    </>
  )
}
