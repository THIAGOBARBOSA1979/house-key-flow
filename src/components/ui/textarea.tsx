import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  customProp?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[120px] w-full rounded-2xl border border-input bg-background/80 px-5 py-4 text-sem-body-base ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10 focus-visible:border-primary transition-all disabled:interactive-disabled shadow-sem-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }