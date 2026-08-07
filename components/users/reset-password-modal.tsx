"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminResetPasswordSchema } from "@/validators/user";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export function ResetPasswordModal({
  isOpen,
  onClose,
  user,
}: ResetPasswordModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(adminResetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: any) => {
    if (!user) return;

    try {
      const res = await fetch(`/api/users/${user.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Password reset failed");
      }

      toast.success(`Password for ${user.name} reset successfully`);
      reset();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to reset password");
    }
  };

  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Admin Password Reset"
      description={`Set a new password for staff account: ${user.name} (${user.email})`}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
        <div className="rounded-2xl bg-amber-50 p-3.5 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
          <KeyRound className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Security Notice:</p>
            <p>
              The user will need to log in with this new password. Passwords are never stored in plain text.
            </p>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">New Password</label>
          <Input
            type="password"
            placeholder="Minimum 6 characters"
            {...register("newPassword")}
            error={errors.newPassword?.message as string}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Confirm New Password</label>
          <Input
            type="password"
            placeholder="Re-type new password"
            {...register("confirmPassword")}
            error={errors.confirmPassword?.message as string}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Reset Password
          </Button>
        </div>
      </form>
    </Modal>
  );
}
