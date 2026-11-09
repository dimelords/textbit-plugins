import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import {
  type SoftcropArea,
  type SoftcropPoint,
  type ImageDimensions,
  type Position,
  clickToFocusPoint,
  calculateFocusPointScreenPosition,
  constrainFocusPointToVisibleArea,
  updateConstrainedFocusPoint,
  wheelEventToZoomFactor,
  decomposeCropArea
} from './softcrop-lib'
import { FocusIcon } from 'lucide-react'
import { DragHandle } from './DragHandle'

export interface SoftcropRef {
  getCropArea: () => SoftcropArea | null
  getFocusPoint: () => SoftcropPoint | null
  getCropOffsets: () => { top: number; right: number; bottom: number; left: number }
  setCropArea: (x: number, y: number, w: number, h: number) => void
  setFocusPoint: (x: number, y: number) => void
  setCropOffsets: (offsets: { top: number; right: number; bottom: number; left: number }) => void
  zoomIn: () => void
  zoomOut: () => void
  reset: () => void
}

interface SoftcropProps {
  src: string
  children?: React.ReactNode
  maxZoom?: number
  zoomSensitivity?: number
  onChange?: (cropArea: SoftcropArea | null, focusPoint: SoftcropPoint | null) => void
  onReady?: () => void
  enableFocusPoint?: boolean
  enableDragHandles?: boolean
  enablePanAndZoom?: boolean
}

const Softcrop = forwardRef<SoftcropRef, SoftcropProps>(({
  src,
  children,
  maxZoom = 5,
  zoomSensitivity = 0.02,
  onChange,
  onReady,
  enableFocusPoint = true,
  enableDragHandles = true,
  enablePanAndZoom = true
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const focusPointRef = useRef<HTMLDivElement>(null)

  // Basic state
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions>({ width: 0, height: 0 })
  const [containerSize, setContainerSize] = useState<ImageDimensions>({ width: 0, height: 0 })
  const [focusPoint, setFocusPoint] = useState<SoftcropPoint | null>(null)

  // Interaction state
  const [isPressed, setIsPressed] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 })

  // CLEAN STATE: Only base crop and drag handle offsets
  const [baseCrop, setBaseCrop] = useState<SoftcropArea>({ x: 0, y: 0, w: 1, h: 1 })
  const [dragOffsets, setDragOffsets] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  })

  // Calculate image display dimensions
  const displayDimensions = useCallback((): ImageDimensions => {
    const imageDisplayWidth = containerSize.width
    const imageDisplayHeight = imageDimensions.width > 0
      ? containerSize.width * (imageDimensions.height / imageDimensions.width)
      : 0
    return { width: imageDisplayWidth, height: imageDisplayHeight }
  }, [containerSize.width, imageDimensions])

  const isReady = imageLoaded
    && containerSize.width > 0
    && containerSize.height > 0
    && imageDimensions.width > 0
    && imageDimensions.height > 0

  // Calculate scale and position from base crop (for display only)
  const getDisplayTransform = useCallback(() => {
    if (!isReady) return { scale: 1, position: { x: 0, y: 0 } }

    const display = displayDimensions()

    // Calculate scale to show the base crop area filling the container
    const scaleX = containerSize.width / (baseCrop.w * display.width)
    const scaleY = containerSize.height / (baseCrop.h * display.height)
    const scale = Math.min(scaleX, scaleY)

    // Calculate position to center the base crop area
    const scaledCropWidth = baseCrop.w * display.width * scale
    const scaledCropHeight = baseCrop.h * display.height * scale

    const position = {
      x: (containerSize.width - scaledCropWidth) / 2 - (baseCrop.x * display.width * scale),
      y: (containerSize.height - scaledCropHeight) / 2 - (baseCrop.y * display.height * scale)
    }

    return { scale, position }
  }, [isReady, baseCrop, containerSize, displayDimensions])

  // Combine base crop with drag handle offsets
  const getCombinedCropArea = useCallback((): SoftcropArea | null => {
    if (!isReady) return null

    // Apply drag handle offsets to the base crop
    const combinedCrop: SoftcropArea = {
      x: baseCrop.x + (baseCrop.w * dragOffsets.left),
      y: baseCrop.y + (baseCrop.h * dragOffsets.top),
      w: baseCrop.w * (1 - dragOffsets.left - dragOffsets.right),
      h: baseCrop.h * (1 - dragOffsets.top - dragOffsets.bottom)
    }

    // Ensure valid crop area
    if (combinedCrop.w <= 0 || combinedCrop.h <= 0) return null

    // Clamp to bounds
    combinedCrop.x = Math.max(0, Math.min(1, combinedCrop.x))
    combinedCrop.y = Math.max(0, Math.min(1, combinedCrop.y))
    combinedCrop.w = Math.max(0, Math.min(1 - combinedCrop.x, combinedCrop.w))
    combinedCrop.h = Math.max(0, Math.min(1 - combinedCrop.y, combinedCrop.h))

    // Round all values to 5 decimal places
    return {
      x: Number(combinedCrop.x.toFixed(5)),
      y: Number(combinedCrop.y.toFixed(5)),
      w: Number(combinedCrop.w.toFixed(5)),
      h: Number(combinedCrop.h.toFixed(5))
    }
  }, [baseCrop, dragOffsets, isReady])

  // Handle image load
  const handleImageLoad = useCallback(() => {
    if (!imageRef.current) return

    const dimensions = {
      width: imageRef.current.naturalWidth,
      height: imageRef.current.naturalHeight
    }

    setImageDimensions(dimensions)
    setImageLoaded(true)
  }, [])

  // Fire onReady when component becomes ready
  useEffect(() => {
    if (isReady) {
      setTimeout(() => onReady?.(), 0)
    }
  }, [isReady, onReady])

  // Handle container resize
  useEffect(() => {
    if (!containerRef.current || !wrapperRef.current) return

    const updateSize = () => {
      if (!containerRef.current || !wrapperRef.current) return

      const containerWidth = containerRef.current.offsetWidth
      const containerHeight = containerRef.current.offsetHeight

      setContainerSize({
        width: containerWidth,
        height: containerHeight
      })

      wrapperRef.current.style.height = containerHeight + 'px'
    }

    updateSize()
    const resizeObserver = new ResizeObserver(updateSize)
    resizeObserver.observe(containerRef.current)

    return () => resizeObserver.disconnect()
  }, [])

  // Set wrapper height based on image aspect ratio if needed
  useEffect(() => {
    if (!imageLoaded || containerSize.width === 0 || !wrapperRef.current) return

    if (containerSize.height === 0 && imageDimensions.width > 0) {
      const aspectRatio = imageDimensions.height / imageDimensions.width
      const calculatedHeight = containerSize.width * aspectRatio
      wrapperRef.current.style.height = calculatedHeight + 'px'

      setContainerSize(prev => ({
        ...prev,
        height: calculatedHeight
      }))
    }
  }, [imageLoaded, containerSize.width, containerSize.height, imageDimensions])

  // Wheel zoom - directly modify base crop
  useEffect(() => {
    if (!wrapperRef.current) return

    const handleWheelEvent = (e: WheelEvent) => {
      if (!enablePanAndZoom) return

      e.preventDefault()
      e.stopPropagation()

      const factor = wheelEventToZoomFactor(e.deltaY, zoomSensitivity)

      // Get mouse position relative to container (0-1 range)
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      const mouseX = (e.clientX - rect.left) / containerSize.width
      const mouseY = (e.clientY - rect.top) / containerSize.height

      setBaseCrop(prev => {
        // Calculate new crop dimensions
        let newW = prev.w / factor
        let newH = prev.h / factor

        // Apply zoom limits
        const minCrop = 1 / maxZoom
        const maxCrop = 1
        newW = Math.max(minCrop, Math.min(maxCrop, newW))
        newH = Math.max(minCrop, Math.min(maxCrop, newH))

        // Calculate new position to zoom towards mouse
        const newX = prev.x + (prev.w - newW) * mouseX
        const newY = prev.y + (prev.h - newH) * mouseY

        // Ensure crop stays within bounds
        const finalX = Math.max(0, Math.min(1 - newW, newX))
        const finalY = Math.max(0, Math.min(1 - newH, newY))

        return { x: finalX, y: finalY, w: newW, h: newH }
      })
    }

    const wrapper = wrapperRef.current
    wrapper.addEventListener('wheel', handleWheelEvent, { passive: false })

    return () => {
      wrapper.removeEventListener('wheel', handleWheelEvent)
    }
    // TODO: add 'enablePanAndZoom' to the deps, or say here why it stays out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerSize, maxZoom, zoomSensitivity])

  // Mouse/touch handlers for pan - directly modify base crop
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsPressed(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPressed || !enablePanAndZoom) return

    e.preventDefault()
    setIsDragging(true)

    const deltaX = e.clientX - dragStart.x
    const deltaY = e.clientY - dragStart.y

    // Convert pixel movement to base crop movement
    const display = displayDimensions()
    const { scale } = getDisplayTransform()

    const cropDeltaX = -deltaX / (display.width * scale)
    const cropDeltaY = -deltaY / (display.height * scale)

    setBaseCrop(prev => {
      const newX = Math.max(0, Math.min(1 - prev.w, prev.x + cropDeltaX))
      const newY = Math.max(0, Math.min(1 - prev.h, prev.y + cropDeltaY))
      return { ...prev, x: newX, y: newY }
    })

    // Update drag start for continuous movement
    setDragStart({ x: e.clientX, y: e.clientY })
    // TODO: add 'enablePanAndZoom' to the deps, or say here why it stays out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPressed, dragStart, displayDimensions, getDisplayTransform])

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    setIsPressed(false)

    // Handle focus point click (only if no drag occurred)
    if (!isDragging) {
      const deltaX = e.clientX - dragStart.x
      const deltaY = e.clientY - dragStart.y
      if (!containerRef.current || Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) return

      const rect = containerRef.current.getBoundingClientRect()
      const { scale, position } = getDisplayTransform()

      const newFocusPoint = clickToFocusPoint(
        { x: e.clientX, y: e.clientY },
        rect,
        scale,
        position,
        displayDimensions()
      )

      if (newFocusPoint) {
        setFocusPoint({
          x: Number(newFocusPoint.x.toFixed(5)),
          y: Number(newFocusPoint.y.toFixed(5))
        })
      }
    }

    setIsDragging(false)
    // TODO: add 'isDragging' to the deps, or say here why it stays out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragStart, getDisplayTransform, displayDimensions])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) return

    const touches = e.touches
    e.preventDefault()
    setIsPressed(true)
    setDragStart({ x: touches[0].clientX, y: touches[0].clientY })
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!enablePanAndZoom || !isPressed) return
    setIsDragging(true)

    e.preventDefault()

    const deltaX = e.touches[0].clientX - dragStart.x
    const deltaY = e.touches[0].clientY - dragStart.y

    // Convert pixel movement to base crop movement
    const display = displayDimensions()
    const { scale } = getDisplayTransform()

    const cropDeltaX = -deltaX / (display.width * scale)
    const cropDeltaY = -deltaY / (display.height * scale)

    setBaseCrop(prev => {
      const newX = Math.max(0, Math.min(1 - prev.w, prev.x + cropDeltaX))
      const newY = Math.max(0, Math.min(1 - prev.h, prev.y + cropDeltaY))
      return { ...prev, x: newX, y: newY }
    })

    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY })
    // TODO: add 'enablePanAndZoom' to the deps, or say here why it stays out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPressed, dragStart, displayDimensions, getDisplayTransform])

  const handleTouchEnd = useCallback(() => {
    setIsPressed(false)

    // Allow all calculations to be done in this event loop
    // before stopping dragging state, or else some zoom/pan
    // movements will not be finished.
    setTimeout(() => {
      setIsDragging(false)
    }, 0)
  }, [])

  // Calculate focus point display position
  const focusPointDisplay = focusPoint ? (() => {
    const { scale, position } = getDisplayTransform()
    const screenPos = calculateFocusPointScreenPosition(focusPoint, scale, position, displayDimensions())
    const constrainedPos = constrainFocusPointToVisibleArea(screenPos, containerSize, 40)

    // Update focus point if it was constrained
    if (screenPos.x !== constrainedPos.x || screenPos.y !== constrainedPos.y) {
      const updatedPoint = updateConstrainedFocusPoint(constrainedPos, scale, position, displayDimensions())
      setTimeout(() => {
        setFocusPoint({
          x: Number(updatedPoint.x.toFixed(5)),
          y: Number(updatedPoint.y.toFixed(5))
        })
      }, 0)
    }

    return constrainedPos
  })() : null

  const isValid = (v: number): boolean => {
    return typeof v === 'number' && v >= 0 && v <= 1 && isFinite(v)
  }

  // Drag handle updates
  const updateDragHandle = useCallback((side: 'top' | 'right' | 'bottom' | 'left', offset: number) => {
    setDragOffsets(prev => ({ ...prev, [side]: offset }))
  }, [])

  // Convert drag offsets to handle positions
  const getDragHandleOffset = useCallback((side: 'top' | 'right' | 'bottom' | 'left'): number => {
    return dragOffsets[side]
  }, [dragOffsets])

  const getDragHandleOpposite = useCallback((side: 'top' | 'right' | 'bottom' | 'left'): number => {
    switch (side) {
      case 'top': return dragOffsets.bottom
      case 'right': return dragOffsets.left
      case 'bottom': return dragOffsets.top
      case 'left': return dragOffsets.right
    }
  }, [dragOffsets])

  // Convert to legacy offset format
  const getCropOffsets = useCallback(() => dragOffsets, [dragOffsets])

  // onChange effect
  useEffect(() => {
    if (!onChange || !isReady) return
    onChange(
      getCombinedCropArea(),
      enableFocusPoint ? focusPoint : null
    )
    // TODO: add 'enableFocusPoint' to the deps, or say here why it stays out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseCrop, dragOffsets, focusPoint, onChange, isReady, getCombinedCropArea])

  // Get current display transform
  const { scale, position } = getDisplayTransform()

  // Imperative handle
  useImperativeHandle(ref, () => ({
    getCropArea: () => getCombinedCropArea(),
    getFocusPoint: () => enableFocusPoint ? focusPoint : null,
    getCropOffsets,

    setCropArea: (x: number, y: number, w: number, h: number) => {
      if (!isValid(x) || !isValid(y) || !isValid(w) || !isValid(h)) {
        console.warn('Invalid crop area coordinates', { x, y, w, h })
        return
      }

      const targetCrop = { x, y, w, h }
      // Decompose incoming crop area into base crop + drag offsets
      const decomposed = decomposeCropArea(containerSize, targetCrop)


      setBaseCrop(decomposed.baseCrop)
      setDragOffsets(decomposed.dragOffsets)
    },

    setFocusPoint: (x: number, y: number) => {
      if (!isValid(x) || !isValid(y)) {
        console.warn('Invalid focus point coordinates', { x, y })
        return
      }

      setFocusPoint({
        x: Number(x.toFixed(5)),
        y: Number(y.toFixed(5))
      })

      if (focusPointRef.current) {
        focusPointRef.current.style.display = 'flex'
      }
    },

    setCropOffsets: (offsets) => setDragOffsets(offsets),

    zoomIn: () => {
      const factor = Math.pow(1 + zoomSensitivity, 3)
      setBaseCrop(prev => {
        const newW = Math.max(1 / maxZoom, prev.w / factor)
        const newH = Math.max(1 / maxZoom, prev.h / factor)
        const newX = Math.max(0, Math.min(1 - newW, prev.x + (prev.w - newW) / 2))
        const newY = Math.max(0, Math.min(1 - newH, prev.y + (prev.h - newH) / 2))
        return { x: newX, y: newY, w: newW, h: newH }
      })
    },

    zoomOut: () => {
      const factor = Math.pow(1 + zoomSensitivity, -3)
      setBaseCrop(prev => {
        const newW = Math.min(1, prev.w / factor)
        const newH = Math.min(1, prev.h / factor)
        const newX = Math.max(0, Math.min(1 - newW, prev.x + (prev.w - newW) / 2))
        const newY = Math.max(0, Math.min(1 - newH, prev.y + (prev.h - newH) / 2))
        return { x: newX, y: newY, w: newW, h: newH }
      })
    },

    reset: () => {
      setBaseCrop({ x: 0, y: 0, w: 1, h: 1 })
      setDragOffsets({ top: 0, right: 0, bottom: 0, left: 0 })
      setFocusPoint(null)
      if (focusPointRef.current) {
        focusPointRef.current.style.display = 'none'
      }
    }
    // TODO: add 'enableFocusPoint' to the deps, or say here why it stays out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [baseCrop, dragOffsets, focusPoint, getCombinedCropArea, getCropOffsets, zoomSensitivity, maxZoom, containerSize])

  return (
    <div
      ref={containerRef}
      contentEditable={false}
      className="absolute top-0 left-0 w-full h-full rounded-lg overflow-hidden"
    >
      <div
        ref={wrapperRef}
        className="relative overflow-hidden w-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setIsDragging(false)
          setIsPressed(false)
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'none' }}
      >
        <img
          ref={imageRef}
          src={src}
          onLoad={handleImageLoad}
          className="block absolute select-none"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            width: displayDimensions().width || 'auto',
            height: displayDimensions().height || 'auto'
          }}
        />

        {/* Focus Point */}
        {focusPointDisplay && enableFocusPoint && (
          <div
            ref={focusPointRef}
            className="absolute top-0 left-0 w-[40px] h-[40px] rounded-[12px] pointer-events-none"
            style={{
              transform: `translate(${focusPointDisplay.x - 20}px, ${focusPointDisplay.y - 20}px)`,
              boxShadow: 'rgba(0, 0, 0, 0.35) 0px 0px 20px 0px',
              borderRadius: '12px',
              backgroundColor: 'rgba(0, 0, 0, 0.15)',
              display: 'flex'
            }}
          >
            <FocusIcon
              color='rgba(255, 255, 255, 0.9)'
              className="w-[40px] h-[40px] rounded-[12px] flex items-center justify-center"
            />
          </div>
        )}
      </div>

      {/* Drag handles */}
      {enableDragHandles &&
        <>
          <DragHandle
            side="top"
            offset={getDragHandleOffset('top')}
            opposite={getDragHandleOpposite('top')}
            onChange={(offset) => updateDragHandle('top', offset)}
            size={containerSize.height}
          />
          <DragHandle
            side="right"
            offset={getDragHandleOffset('right')}
            opposite={getDragHandleOpposite('right')}
            onChange={(offset) => updateDragHandle('right', offset)}
            size={containerSize.width}
          />
          <DragHandle
            side="bottom"
            offset={getDragHandleOffset('bottom')}
            opposite={getDragHandleOpposite('bottom')}
            onChange={(offset) => updateDragHandle('bottom', offset)}
            size={containerSize.height}
          />
          <DragHandle
            side="left"
            offset={getDragHandleOffset('left')}
            opposite={getDragHandleOpposite('left')}
            onChange={(offset) => updateDragHandle('left', offset)}
            size={containerSize.width}
          />
        </>
      }

      {/* Render children (Grid, etc.) */}
      {children}
    </div>
  )
})

Softcrop.displayName = 'Softcrop'
export { Softcrop }
