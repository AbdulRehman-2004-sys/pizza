"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pizza, KeyRound, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const json = await res.json();
      setSubmitted(true);

      if (json.data?.rawToken) {
        setDevToken(json.data.rawToken);
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 px-4 py-12 select-none">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pizza-500 text-white shadow-lg shadow-pizza-500/30">
            <Pizza className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">SliceMaster Pizza</h1>
          <p className="text-xs font-semibold text-slate-400">POS Staff Password Recovery</p>
        </div>

        {/* Form Card */}
        <div className="rounded-3xl bg-white p-8 shadow-xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-pizza-500" />
              Forgot Password?
            </h2>
            <p className="text-xs text-slate-500">
              Enter your registered email address to receive password reset instructions.
            </p>
          </div>

          {submitted ? (
            <div className="space-y-4">
              <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-200 text-emerald-900 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-950 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  Reset Token Generated
                </div>
                <p>
                  If an account with email <strong>{email}</strong> exists, password reset instructions have been generated.
                </p>
              </div>

              {/* Development helper link */}
              {devToken && (
                <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-xs space-y-1">
                  <p className="text-[10px] font-extrabold uppercase text-slate-500">Dev Testing Direct Link:</p>
                  <Link
                    href={`/reset-password?token=${devToken}`}
                    className="text-pizza-600 font-bold hover:underline break-all block"
                  >
                    Open Reset Password Form (/reset-password?token={devToken.substring(0, 10)}...)
                  </Link>
                </div>
              )}

              <Link
                href="/login"
                className="block text-center text-xs font-bold text-pizza-600 hover:underline pt-2"
              >
                Back to Staff Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                <Input
                  type="email"
                  placeholder="admin@pizzapos.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" isLoading={isLoading}>
                Request Reset Token
              </Button>

              <div className="pt-2 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
