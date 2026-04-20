import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-sans font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dourado-vintage focus-visible:ring-offset-2 focus-visible:ring-offset-verde-floresta disabled:pointer-events-none disabled:opacity-50 active:scale-95 min-h-[48px]',
  {
    variants: {
      variant: {
        default: 'bg-dourado-vintage text-preto-quente hover:bg-madeira-clara',
        secondary: 'border border-dourado-vintage text-dourado-vintage hover:bg-dourado-vintage/10',
        ghost: 'text-creme-papel hover:bg-verde-musgo/40',
        destructive: 'bg-red-800 text-white hover:bg-red-700',
      },
      size: {
        default: 'px-6 py-3 text-base',
        sm: 'px-4 py-2 text-sm min-h-[40px]',
        lg: 'px-8 py-4 text-lg min-h-[56px]',
        icon: 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants }
