"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog Content */}
      <div
        className={cn(
          "relative w-full my-auto flex flex-col max-h-[85vh] rounded-3xl bg-white p-6 shadow-2xl transition-all animate-in zoom-in-95 duration-200 border border-slate-100 z-10 overflow-hidden",
          sizeClasses[size]
        )}
      >
        {/* Header - Fixed Top */}
        <div className="flex-shrink-0 flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="pr-4">
            {title && <h3 className="text-lg font-bold text-slate-900 leading-snug">{title}</h3>}
            {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors border border-slate-100"
            title="Close Modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body - Scrollable Container */}
        <div className="flex-1 overflow-y-auto py-4 text-sm text-slate-700 pr-1.5 space-y-4">
          {children}
        </div>

        {/* Footer - Fixed Bottom */}
        {footer && (
          <div className="flex-shrink-0 pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-white">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
