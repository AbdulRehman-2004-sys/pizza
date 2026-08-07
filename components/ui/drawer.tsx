"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  side?: "left" | "right";
}

export function Drawer({ isOpen, onClose, title, children, side = "right" }: DrawerProps) {
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

  const sideClasses = {
    left: "left-0 animate-in slide-in-from-left duration-300",
    right: "right-0 animate-in slide-in-from-right duration-300",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      <div className={cn("fixed inset-y-0 flex max-w-full z-10", side === "right" ? "pl-10" : "pr-10")}>
        <div className={cn("w-screen max-w-md bg-white shadow-2xl flex flex-col", sideClasses[side])}>
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-900 text-white">
            <h2 className="text-lg font-bold tracking-tight">{title || "Navigation"}</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5">{children}</div>
        </div>
      </div>
    </div>
  );
}
