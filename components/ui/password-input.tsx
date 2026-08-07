"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Input, InputProps } from "./input";

export type PasswordInputProps = Omit<InputProps, "type" | "rightIcon">;

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ placeholder = "••••••••", leftIcon = <Lock className="h-4 w-4" />, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <Input
        ref={ref}
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        leftIcon={leftIcon}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="pointer-events-auto rounded-md p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
        {...props}
      />
    );
  }
);

PasswordInput.displayName = "PasswordInput";
