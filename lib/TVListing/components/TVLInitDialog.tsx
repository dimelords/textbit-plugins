import { useEffect, useMemo, type ReactNode } from 'react'
import { Textbit, type TBPluginDefinition, type TBPluginOptions, type TBElement } from '@ttab/textbit'
import { type Descendant } from 'slate'
import { useSlate } from 'slate-react'
import { buildComponentEntry } from '../componentEntry'
import { ALL_FIELDS, buildPlaceholderChildren } from '../fields'
import { isBlockValid } from '../lib/isBlockValid'

/** Elements that give Enter a meaning of their own, ie the channel combobox and the buttons. */
const OWNS_ENTER = 'button, input, textarea, select, [role="combobox"], [role="option"]'

interface TVLInitDialogProps {
  options?: TBPluginOptions
  onConfirm: (block: Descendant) => void
  onCancel: () => void
}

const buildInitialValue = (): Descendant[] => [{
  id: crypto.randomUUID(),
  class: 'block',
  type: 'tt/tv-listing',
  properties: {},
  children: buildPlaceholderChildren(ALL_FIELDS)
}]

export const TVLInitDialog = ({ options, onConfirm, onCancel }: TVLInitDialogProps) => {
  const initialValue = useMemo(buildInitialValue, [])

  const plugins = useMemo<TBPluginDefinition[]>(() => [{
    class: 'block',
    name: 'tt/tv-listing',
    options: { ...options, inDialog: true },
    componentEntry: buildComponentEntry()
  }], [options])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCancel()
      }
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [onCancel])

  return (
    <DialogShell onCancel={onCancel}>
      <Textbit.Root value={initialValue} plugins={plugins} debounce={1}>
        <Textbit.Editable autoFocus='start' className='outline-none' />
        <Footer onConfirm={onConfirm} onCancel={onCancel} />
      </Textbit.Root>
    </DialogShell>
  )
}

const DialogShell = ({ onCancel, children }: { onCancel: () => void, children: ReactNode }) => (
  <div
    className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'
    onMouseDown={onCancel}
  >
    <div
      className='bg-white dark:bg-slate-900 text-black dark:text-white rounded shadow-lg w-[480px] max-w-full'
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className='p-3 border-b dark:border-slate-700'>
        <h2 className='text-sm font-semibold'>Lägg till tablåinformation</h2>
      </div>
      <div className='p-3 space-y-3'>
        {children}
      </div>
    </div>
  </div>
)

const Footer = ({
  onConfirm,
  onCancel
}: {
  onConfirm: (block: Descendant) => void
  onCancel: () => void
}) => {
  const editor = useSlate()
  const block = editor.children[0] as TBElement | undefined
  const isValid = isBlockValid(block)

  // Confirm on Enter from anywhere in the form, on the same condition that enables the button.
  // Capture phase so the keystroke never reaches the nested editor.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) {
        return
      }

      if (e.target instanceof HTMLElement && e.target.closest(OWNS_ENTER)) {
        return
      }

      if (!isValid || !block) {
        return
      }

      e.preventDefault()
      e.stopPropagation()
      onConfirm(block)
    }

    document.addEventListener('keydown', onKeyDown, true)
    return () => document.removeEventListener('keydown', onKeyDown, true)
  }, [isValid, block, onConfirm])

  return (
    <div className='flex justify-end gap-2 pt-2'>
      <button
        type='button'
        onClick={onCancel}
        className='px-3 py-1 text-sm border rounded hover:bg-slate-100 dark:hover:bg-slate-800 dark:border-slate-700'
      >
        Avbryt
      </button>
      <button
        type='button'
        disabled={!isValid || !block}
        onClick={() => block && onConfirm(block)}
        className='px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed'
      >
        Lägg till
      </button>
    </div>
  )
}
