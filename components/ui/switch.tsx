import React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, id, checked, ...props }, ref) => {
    const switchId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <label htmlFor={switchId} className="inline-flex items-center gap-3 cursor-pointer select-none">
        <div className="relative">
          <input
            id={switchId}
            type="checkbox"
            ref={ref}
            checked={checked}
            className="sr-only peer"
            {...props}
          />
          <div
            className={cn(
              "h-6 w-11 rounded-full bg-slate-200 peer-checked:bg-pizza-500 transition-colors duration-200 peer-focus:ring-2 peer-focus:ring-pizza-500/20",
              className
            )}
          />
          <div className="absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform duration-200 peer-checked:translate-x-5 shadow-sm" />
        </div>
        {label && <span className="text-xs font-semibold text-slate-700">{label}</span>}
      </label>
    );
  }
);

Switch.displayName = "Switch";
