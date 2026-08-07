import React from "react";
import { Pizza, ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/forms/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-pizza-500/20 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-crust/20 blur-3xl" />

      <div className="w-full max-w-md space-y-8 z-10">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-pizza-500 text-white shadow-xl shadow-pizza-500/40 transform hover:scale-105 transition-transform">
            <Pizza className="h-10 w-10" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              SliceMaster <span className="text-pizza-500">POS</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Pizzeria Terminal & Management Suite
            </p>
          </div>
        </div>

        {/* Login Form Container */}
        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100">
          <div className="mb-6 pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Operator Sign In</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your staff credentials to open register
            </p>
          </div>

          <LoginForm />
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Encrypted Session • HttpOnly Cookies • Role Access</span>
        </div>
      </div>
    </div>
  );
}
