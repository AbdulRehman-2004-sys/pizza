"use client";

import React from "react";
import { Modal } from "./modal";
import { Button } from "./button";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary";
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center p-2 space-y-3">
        <div
          className={`rounded-full p-3 ${
            variant === "danger"
              ? "bg-rose-50 text-rose-600"
              : "bg-pizza-50 text-pizza-600"
          }`}
        >
          <AlertTriangle className="h-6 w-6" />
        </div>

        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500">{description}</p>

        <div className="flex items-center gap-3 w-full pt-4 border-t border-slate-100">
          <Button variant="outline" className="w-full" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            className="w-full"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
