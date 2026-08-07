import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      leftIcon,
      rightIcon,
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pizza-500/20 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none disabled:transform-none select-none";

    const variants = {
      primary: "bg-pizza-500 hover:bg-pizza-600 text-white shadow-sm shadow-pizza-500/30",
      secondary: "bg-slate-100 hover:bg-slate-200 text-slate-800",
      danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/30",
      outline: "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm",
      ghost: "hover:bg-slate-100 text-slate-700",
    };

    const sizes = {
      sm: "text-xs px-3 py-1.5 min-h-[36px] gap-1.5",
      md: "text-sm px-4 py-2.5 min-h-[44px] gap-2",
      lg: "text-base px-6 py-3 min-h-[52px] gap-2.5 font-semibold",
      icon: "h-11 w-11 p-0 flex items-center justify-center rounded-xl",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-current" />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
