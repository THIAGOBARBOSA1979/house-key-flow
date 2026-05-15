import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-xl text-label font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:interactive-disabled interactive-active [&_svg]:pointer-events-none [&_svg]:size-4.5 [&_svg]:shrink-0 active:scale-95 shadow-sem-sm",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sem-md hover:bg-primary/90 hover:shadow-sem-lg interactive-hover",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sem-md hover:bg-destructive/90 hover:shadow-sem-lg interactive-hover",
        outline:
          "border-2 border-input bg-background shadow-sem-sm hover:bg-accent hover:border-accent hover:text-accent-foreground interactive-hover",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sem-sm hover:bg-secondary/80 interactive-hover",
        ghost: "hover:bg-accent hover:text-accent-foreground interactive-hover shadow-none",
        link: "text-primary underline-offset-4 hover:underline interactive-hover shadow-none",
      },
      size: {
        default: "h-12 px-6 py-2",
        sm: "h-10 rounded-lg px-4 text-xs",
        lg: "h-14 rounded-2xl px-10 text-base",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
