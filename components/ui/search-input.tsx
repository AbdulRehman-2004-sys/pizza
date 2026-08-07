import React from "react";
import { Search, X } from "lucide-react";
import { Input, InputProps } from "./input";

export interface SearchInputProps extends Omit<InputProps, "leftIcon" | "rightIcon"> {
  onClear?: () => void;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onChange, onClear, placeholder = "Search orders, products...", ...props }, ref) => {
    const showClear = value !== undefined && value !== "" && value !== null;

    return (
      <Input
        ref={ref}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        leftIcon={<Search className="h-4 w-4 text-slate-400" />}
        rightIcon={
          showClear ? (
            <button
              type="button"
              onClick={onClear}
              className="pointer-events-auto rounded-md p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : undefined
        }
        {...props}
      />
    );
  }
);

SearchInput.displayName = "SearchInput";
