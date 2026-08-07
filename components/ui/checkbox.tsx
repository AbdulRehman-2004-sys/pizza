import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, checked, ...props }, ref) => {
    const checkboxId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <label htmlFor={checkboxId} className="inline-flex items-start gap-2.5 cursor-pointer select-none">
        <div className="relative flex items-center mt-0.5">
          <input
            id={checkboxId}
            type="checkbox"
            ref={ref}
            checked={checked}
            className={cn(
              "peer h-4 w-4 rounded-md border border-slate-300 bg-white transition-all checked:border-pizza-500 checked:bg-pizza-500 focus:outline-none focus:ring-2 focus:ring-pizza-500/20 disabled:opacity-50",
              className
            )}
            {...props}
          />
          <Check className="absolute top-0.5 left-0.5 h-3 w-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
        </div>
        {(label || description) && (
          <div>
            {label && <span className="text-sm font-semibold text-slate-800">{label}</span>}
            {description && <p className="text-xs text-slate-500">{description}</p>}
          </div>
        )}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";
