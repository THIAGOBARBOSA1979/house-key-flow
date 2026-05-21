import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-lg text-sem-label font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:interactive-disabled interactive-active [&_svg]:pointer-events-none [&_svg]:size-4.5 [&_svg]:shrink-0 active:scale-95 shadow-sem-sm",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sem-md hover:bg-primary/90 hover:shadow-sem-lg hover:-translate-y-0.5 interactive-hover",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sem-md hover:bg-destructive/90 hover:shadow-sem-lg hover:-translate-y-0.5 interactive-hover",
        outline:
          "border-2 border-input bg-background shadow-sem-sm hover:bg-accent hover:border-accent hover:text-accent-foreground hover:-translate-y-0.5 interactive-hover",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sem-sm hover:bg-secondary/80 interactive-hover",
        ghost: "hover:bg-accent hover:text-accent-foreground interactive-hover shadow-none",
        glass: "bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 text-foreground shadow-sem-md interactive-hover",
        link: "text-primary underline-offset-4 hover:underline interactive-hover shadow-none",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-md px-3 text-sem-body-sm",
        lg: "h-14 rounded-xl px-8 text-sem-body-lg",
        icon: "h-11 w-11",
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
