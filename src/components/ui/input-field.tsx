import * as React from "react"
import { Input } from "./input"
import { Label } from "./label"
import { cn } from "@/lib/utils"

export interface InputFieldProps
  extends React.ComponentPropsWithoutRef<typeof Input> {
  label?: string
  error?: string
  description?: string
  icon?: React.ElementType
}

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
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
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          )}
          <Input
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
InputField.displayName = "InputField"

export { InputField }
