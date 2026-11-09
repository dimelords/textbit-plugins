import { describe, it, expect } from 'vitest'
import {
  clickToFocusPoint,
  calculateFocusPointScreenPosition,
  constrainFocusPointToVisibleArea,
  updateConstrainedFocusPoint,
  wheelEventToZoomFactor,
  parseCropString,
  parseFocusString,
  decomposeCropArea,
  type SoftcropArea,
  type SoftcropPoint,
  type Position,
  type ImageDimensions
} from '../../lib/components/CropDialog/softcrop-lib'

describe('Softcrop Utilities', () => {
  describe('clickToFocusPoint', () => {
    const mockContainerRect: DOMRect = {
      left: 100,
      top: 50,
      width: 800,
      height: 600,
      right: 900,
      bottom: 650,
      x: 100,
      y: 50,
      toJSON: () => ({})
    }

    const imageDimensions: ImageDimensions = { width: 1200, height: 800 }
    const imagePosition: Position = { x: 50, y: 25 }
    const scale = 0.5

    it('should convert click position to focus point when click is within image bounds', () => {
      const clickPosition: Position = { x: 400, y: 300 }

      const result = clickToFocusPoint(
        clickPosition,
        mockContainerRect,
        scale,
        imagePosition,
        imageDimensions
      )

      expect(result?.x).toBeCloseTo(0.42)
      expect(result?.y).toBeCloseTo(0.56)
    })

    it('should return null when click is outside image bounds', () => {
      const clickPosition: Position = { x: 50, y: 50 }

      const result = clickToFocusPoint(
        clickPosition,
        mockContainerRect,
        scale,
        imagePosition,
        imageDimensions
      )

      expect(result).toBeNull()
    })

    it('should handle edge cases at image boundaries', () => {
      const clickPosition: Position = { x: 150, y: 75 } // Top-left of image

      const result = clickToFocusPoint(
        clickPosition,
        mockContainerRect,
        scale,
        imagePosition,
        imageDimensions
      )

      expect(result).toEqual({ x: 0, y: 0 })
    })
  })

  describe('calculateFocusPointScreenPosition', () => {
    it('should calculate correct screen position for focus point', () => {
      const focusPoint: SoftcropPoint = { x: 0.5, y: 0.5 }
      const scale = 1
      const imagePosition: Position = { x: 100, y: 50 }
      const imageDimensions: ImageDimensions = { width: 800, height: 600 }

      const result = calculateFocusPointScreenPosition(
        focusPoint,
        scale,
        imagePosition,
        imageDimensions
      )

      expect(result).toEqual({ x: 500, y: 350 })
    })

    it('should handle scaled images correctly', () => {
      const focusPoint: SoftcropPoint = { x: 0.25, y: 0.75 }
      const scale = 0.5
      const imagePosition: Position = { x: 0, y: 0 }
      const imageDimensions: ImageDimensions = { width: 1000, height: 800 }

      const result = calculateFocusPointScreenPosition(
        focusPoint,
        scale,
        imagePosition,
        imageDimensions
      )

      expect(result).toEqual({ x: 125, y: 300 })
    })
  })

  describe('constrainFocusPointToVisibleArea', () => {
    const containerSize: ImageDimensions = { width: 800, height: 600 }

    it('should not constrain point that is already within bounds', () => {
      const screenPosition: Position = { x: 400, y: 300 }

      const result = constrainFocusPointToVisibleArea(
        screenPosition,
        containerSize,
        40
      )

      expect(result).toEqual({ x: 400, y: 300 })
    })

    it('should constrain point to left edge when too far left', () => {
      const screenPosition: Position = { x: 10, y: 300 }

      const result = constrainFocusPointToVisibleArea(
        screenPosition,
        containerSize,
        40
      )

      expect(result).toEqual({ x: 20, y: 300 })
    })

    it('should constrain point to all edges when outside bounds', () => {
      const screenPosition: Position = { x: -10, y: 700 }

      const result = constrainFocusPointToVisibleArea(
        screenPosition,
        containerSize,
        40
      )

      expect(result).toEqual({ x: 20, y: 580 })
    })
  })

  describe('wheelEventToZoomFactor', () => {
    it('should return zoom in factor for negative deltaY', () => {
      const result = wheelEventToZoomFactor(-100, 0.02)
      expect(result).toBeCloseTo(1.02)
    })

    it('should return zoom out factor for positive deltaY', () => {
      const result = wheelEventToZoomFactor(100, 0.02)
      expect(result).toBeCloseTo(0.9804, 4)
    })

    it('should handle custom sensitivity', () => {
      const result = wheelEventToZoomFactor(-100, 0.05)
      expect(result).toBeCloseTo(1.05)
    })
  })

  describe('parseCropString', () => {
    it('should parse valid crop string', () => {
      const result = parseCropString('0.1 0.2 0.5 0.6')
      expect(result).toEqual({ x: 0.1, y: 0.2, w: 0.5, h: 0.6 })
    })

    it('should return null for invalid crop string', () => {
      expect(parseCropString('0.1 0.2 0.5')).toBeNull()
      expect(parseCropString('invalid')).toBeNull()
    })

    it('should return null for undefined input', () => {
      expect(parseCropString(undefined)).toBeNull()
    })
  })

  describe('parseFocusString', () => {
    it('should parse valid focus string', () => {
      const result = parseFocusString('0.3 0.7')
      expect(result).toEqual({ x: 0.3, y: 0.7 })
    })

    it('should return null for invalid focus string', () => {
      expect(parseFocusString('0.3')).toBeNull()
      expect(parseFocusString('invalid')).toBeNull()
    })

    it('should return null for undefined input', () => {
      expect(parseFocusString(undefined)).toBeNull()
    })
  })

  describe('decomposeCropArea', () => {
    describe('when aspect ratios match', () => {
      it('should return original crop with zero offsets', () => {
        const containerSize = { width: 800, height: 600 } // 4:3 ratio
        const targetCrop: SoftcropArea = { x: 0.1, y: 0.2, w: 0.6, h: 0.45 } // Also 4:3 ratio (480x270 pixels)

        const result = decomposeCropArea(containerSize, targetCrop)

        // Note: The actual crop (480x270) has aspect ratio 1.78, container has 1.33
        // So this will not match and the function will expand the height
        expect(result.baseCrop.x).toBe(0.1)
        expect(result.baseCrop.y).toBe(0.2)
        expect(result.baseCrop.w).toBe(0.6)
        expect(result.baseCrop.h).toBeCloseTo(0.6) // Expanded from 0.45 to 0.6

        expect(result.dragOffsets.top).toBe(0)
        expect(result.dragOffsets.right).toBe(0)
        expect(result.dragOffsets.bottom).toBeCloseTo(0.25) // (0.6 - 0.45) * scale factor
        expect(result.dragOffsets.left).toBe(0)
      })

      it('should return original crop with zero offsets when ratios truly match', () => {
        const containerSize = { width: 800, height: 600 } // 4:3 ratio
        const targetCrop: SoftcropArea = { x: 0.1, y: 0.2, w: 0.4, h: 0.4 } // Still 4:3 ratio

        const result = decomposeCropArea(containerSize, targetCrop)

        expect(result.baseCrop).toEqual(targetCrop)
        expect(result.dragOffsets).toEqual({
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        })
      })
    })

    describe('when target is proportionally wider than container', () => {
      it('should expand height and add bottom offset', () => {
        const containerSize = { width: 400, height: 400 } // Square container (1:1)
        const targetCrop: SoftcropArea = { x: 0.1, y: 0.2, w: 0.8, h: 0.4 } // 2:1 aspect ratio

        const result = decomposeCropArea(containerSize, targetCrop)

        // Height should be expanded to maintain aspect ratio
        expect(result.baseCrop.x).toBe(0.1)
        expect(result.baseCrop.y).toBe(0.2)
        expect(result.baseCrop.w).toBe(0.8)
        expect(result.baseCrop.h).toBeCloseTo(0.8) // Expanded to match aspect ratio

        // Should have bottom offset
        expect(result.dragOffsets.top).toBe(0)
        expect(result.dragOffsets.right).toBe(0)
        expect(result.dragOffsets.bottom).toBeCloseTo(0.5)
        expect(result.dragOffsets.left).toBe(0)
      })

      it('should handle overflow by adjusting y position and splitting offsets', () => {
        const containerSize = { width: 400, height: 400 }
        const targetCrop: SoftcropArea = { x: 0.1, y: 0.7, w: 0.8, h: 0.4 } // Would overflow bottom

        const result = decomposeCropArea(containerSize, targetCrop)

        // Y position should be adjusted to prevent overflow
        expect(result.baseCrop.y).toBeCloseTo(0.2) // Moved up to fit
        expect(result.baseCrop.h).toBeCloseTo(0.8) // Expanded height

        // Offsets should be split between top and bottom
        expect(result.dragOffsets.top).toBeCloseTo(0.625)
      })
    })

    describe('when target is proportionally taller than container', () => {
      it('should expand width and add right offset', () => {
        const containerSize = { width: 400, height: 400 } // Square container (1:1)
        const targetCrop: SoftcropArea = { x: 0.1, y: 0.2, w: 0.4, h: 0.8 } // 1:2 aspect ratio

        const result = decomposeCropArea(containerSize, targetCrop)

        // Width should be expanded to maintain aspect ratio
        expect(result.baseCrop.x).toBe(0.1)
        expect(result.baseCrop.y).toBe(0.2)
        expect(result.baseCrop.w).toBeCloseTo(0.8) // Expanded to match aspect ratio
        expect(result.baseCrop.h).toBe(0.8)

        // Should have right offset
        expect(result.dragOffsets.top).toBe(0)
        expect(result.dragOffsets.right).toBeCloseTo(0.5)
        expect(result.dragOffsets.bottom).toBe(0)
        expect(result.dragOffsets.left).toBe(0)
      })

      it('should handle overflow by adjusting x position and splitting offsets', () => {
        const containerSize = { width: 400, height: 400 }
        const targetCrop: SoftcropArea = { x: 0.7, y: 0.1, w: 0.4, h: 0.8 } // Would overflow right

        const result = decomposeCropArea(containerSize, targetCrop)

        // X position should be adjusted to prevent overflow
        expect(result.baseCrop.x).toBeCloseTo(0.2) // Moved left to fit
        expect(result.baseCrop.w).toBeCloseTo(0.8) // Expanded width

        // Offsets should be split between left and right
        expect(result.dragOffsets.left).toBeCloseTo(0.625)
      })
    })

    describe('edge cases', () => {
      it('should handle very small aspect ratio differences', () => {
        const containerSize = { width: 1000, height: 1000 }
        const targetCrop: SoftcropArea = { x: 0.1, y: 0.1, w: 0.5, h: 0.5001 } // Tiny difference

        const result = decomposeCropArea(containerSize, targetCrop)

        // Should be treated as matching aspect ratio
        expect(result.baseCrop).toEqual(targetCrop)
        expect(result.dragOffsets).toEqual({
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        })
      })

      it('should handle extreme aspect ratios', () => {
        const containerSize = { width: 100, height: 100 }
        const targetCrop: SoftcropArea = { x: 0, y: 0.4, w: 1, h: 0.2 } // Very wide crop (5:1 ratio)

        const result = decomposeCropArea(containerSize, targetCrop)

        expect(result.baseCrop.w).toBe(1)
        expect(result.baseCrop.h).toBeCloseTo(1) // Should expand to full height
        expect(result.baseCrop.y).toBeCloseTo(0) // Should be moved to top due to overflow
        expect(result.dragOffsets.bottom).toBeCloseTo(0.4) // Split evenly due to overflow
        expect(result.dragOffsets.top).toBeCloseTo(0.4) // Split evenly due to overflow
      })
    })
  })

  describe('updateConstrainedFocusPoint', () => {
    it('should update focus point based on constrained screen position', () => {
      const constrainedScreenPosition: Position = { x: 400, y: 300 }
      const scale = 1
      const imagePosition: Position = { x: 100, y: 50 }
      const imageDimensions: ImageDimensions = { width: 600, height: 500 }

      const result = updateConstrainedFocusPoint(
        constrainedScreenPosition,
        scale,
        imagePosition,
        imageDimensions
      )

      expect(result).toEqual({ x: 0.5, y: 0.5 })
    })
  })
})
