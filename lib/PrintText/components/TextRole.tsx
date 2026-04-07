import type { PropsWithChildren } from "react"

export const TextRole = ({ children }: PropsWithChildren) => {
  return (
    <div className='border-t flex items-center pt-1'>
      <span className='text-xs italic text-gray-600 pr-2 pl-1 py-1' contentEditable={false}>Roll:</span>
      <span className='text-xs italic text-gray-600'>
        {children}
      </span>
    </div>
  )
}
