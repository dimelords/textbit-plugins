import { useEffect, useMemo, type ReactNode } from 'react'
import { Textbit, type TBPluginDefinition, type TBPluginOptions, type TBElement } from '@ttab/textbit'
import { Node, type Descendant } from 'slate'
import { useSlate } from 'slate-react'
import { buildComponentEntry } from '../componentEntry'
import { ALL_FIELDS, buildPlaceholderChildren, MANDATORY_FIELDS, type TVLField } from '../fields'

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

const isBlockValid = (block: TBElement | undefined): boolean => {
  if (!block || block.type !== 'tt/tv-listing') return false
  const children = (block.children as TBElement[] | undefined) ?? []
  if (children.length === 0) return false

  const presentFields = new Set(
    children.map((c) => c.type.replace('tt/tv-listing/', '') as TVLField)
  )
  if (!MANDATORY_FIELDS.every((f) => presentFields.has(f))) return false

  return children.every((child) => {
    const field = child.type.replace('tt/tv-listing/', '') as TVLField
    if (field === 'channel') {
      const name = (block.properties?.channel as string | undefined)?.trim() ?? ''
      const uri = (block.properties?.uri as string | undefined)?.trim() ?? ''
      return !!name && !!uri
    }
    return Node.string(child).trim().length > 0
  })
}
