"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pizza, KeyRound, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Invalid reset token URL");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword, confirmPassword }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to reset password");
      }

      setIsSuccess(true);
      toast.success("Password reset successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <div className="rounded-full bg-rose-50 p-4 text-rose-600 inline-block">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-base font-bold text-slate-900">Missing Reset Token</h2>
        <p className="text-xs text-slate-500">
          This password reset link is invalid or incomplete.
        </p>
        <Link href="/forgot-password" className="text-xs font-bold text-pizza-600 hover:underline block pt-2">
          Request a new password reset link
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-4">
        <div className="rounded-full bg-emerald-50 p-4 text-emerald-600 inline-block">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="text-base font-bold text-slate-900">Password Reset Complete</h2>
        <p className="text-xs text-slate-500">
          Your password has been updated. You may now log in with your new credentials.
        </p>
        <Button onClick={() => router.push("/login")} className="w-full">
          Go to Staff Login
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs font-bold text-slate-700 block mb-1">New Password</label>
        <Input
          type="password"
          placeholder="Minimum 6 characters"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="text-xs font-bold text-slate-700 block mb-1">Confirm New Password</label>
        <Input
          type="password"
          placeholder="Re-type new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      <Button type="submit" className="w-full" isLoading={isLoading}>
        Update Password
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 px-4 py-12 select-none">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pizza-500 text-white shadow-lg shadow-pizza-500/30">
            <Pizza className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">SliceMaster Pizza</h1>
          <p className="text-xs font-semibold text-slate-400">Set New Account Password</p>
        </div>

        {/* Form Card */}
        <div className="rounded-3xl bg-white p-8 shadow-xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-pizza-500" />
              Reset Password
            </h2>
            <p className="text-xs text-slate-500">
              Enter your new secure password below to complete account recovery.
            </p>
          </div>

          <Suspense fallback={<p className="text-xs text-slate-500 text-center">Loading...</p>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
