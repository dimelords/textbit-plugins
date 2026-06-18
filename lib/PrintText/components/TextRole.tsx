import type { PropsWithChildren } from "react"

export const TextRole = ({ children }: PropsWithChildren) => {
  return (
    <div className='border-t flex items-center py-2 text-sm'>
      <label className='text-sm opacity-70 w-14' contentEditable={false}>Roll</label>
      <div>{children}</div>
    </div>
  )
}
