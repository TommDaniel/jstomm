import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-12 w-full rounded-lg border border-madeira-clara/30 bg-verde-musgo/30 px-4 py-2 text-base text-creme-papel placeholder:text-creme-papel/40 focus:outline-none focus:ring-2 focus:ring-dourado-vintage focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = 'Input'

export { Input }
