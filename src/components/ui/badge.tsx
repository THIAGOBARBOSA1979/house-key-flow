import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-sem-sm hover:scale-[1.02] cursor-default",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/90 shadow-sem-md",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 shadow-sem-md",
        outline: "text-foreground border-border bg-background hover:bg-accent",
        success: "border-transparent bg-status-complete/10 text-status-complete border-status-complete/20",
        warning: "border-transparent bg-status-pending/10 text-status-pending border-status-pending/20",
        info: "border-transparent bg-status-progress/10 text-status-progress border-status-progress/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
