import { Crop, ZoomIn, ZoomOut, Undo2, Check } from 'lucide-react'
import { MenuOption } from './MenuOption'
import { useEffect } from 'react'

export const CropDialogMenu = ({onToggle, onZoom, onReset, active }: {
  onToggle: (newState: boolean) => void
  onZoom: (direction: 'in' | 'out') => void
  onReset: () => void
  active: boolean
}) => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!active || !['Escape', 'Enter', '+', '-'].includes(e.key)) {
        return
      }

      switch(e.key) {
        case 'Escape':
          onReset()
          break

        case 'Enter':
          onToggle(false)
          break

        case '+':
          onZoom('in')
          break

        case '-':
          onZoom('out')
          break
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
    }
    // TODO: add 'onZoom' and 'onReset' to the deps, or say here why they stay out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, onToggle])

  return (
    <div
      contentEditable={false}
      className='absolute bottom-5 right-5 flex flex-col gap-1 items-center'
    >
      {active
        && (
          <>
            <MenuOption onPress={() => onZoom('in')}>
              <ZoomIn size={20} strokeWidth={1.75} className="text-white ml-[2px] mt-[2px]"/>
            </MenuOption>

            <MenuOption onPress={() => onZoom('out')}>
              <ZoomOut size={20} strokeWidth={1.75} className="text-white ml-[2px] mt-[2px]"/>
            </MenuOption>

            <MenuOption onPress={() => onReset()}>
              <Undo2 size={20} strokeWidth={1.75} className="text-white ml-[1px]"/>
            </MenuOption>
          </>
        )
      }

      <MenuOption onPress={() => {onToggle(!active)}}>
        {!active
          ? <Crop size={20} strokeWidth={2.75} className="text-white"/>
          : <Check size={20} strokeWidth={2.75} className="text-white "/>
        }
      </MenuOption>
    </div>
  )
}
