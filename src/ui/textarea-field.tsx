import * as React from "react"
import { Textarea } from "./textarea"
import { Label } from "./label"
import { cn } from "@/lib/utils"

export interface TextareaFieldProps
  extends React.ComponentPropsWithoutRef<typeof Textarea> {
  label?: string
  error?: string
  description?: string
  icon?: React.ElementType
}

const TextareaField = React.forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ label, error, description, icon: Icon, className, id, ...props }, ref) => {
    const generatedId = React.useId()
    const inputId = id || generatedId

    return (
      <div className="space-y-2 w-full">
        {label && (
          <Label htmlFor={inputId} className={cn(error && "text-destructive")}>
            {label}
          </Label>
        )}
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          )}
          <Textarea
            id={inputId}
            ref={ref}
            className={cn(Icon && "pl-9", error && "border-destructive focus-visible:ring-destructive", className)}
            {...props}
          />
        </div>
        {description && !error && (
          <p className="text-[0.8rem] text-muted-foreground">{description}</p>
        )}
        {error && (
          <p className="text-[0.8rem] font-medium text-destructive">{error}</p>
        )}
      </div>
    )
  }
)
TextareaField.displayName = "TextareaField"

export { TextareaField }
