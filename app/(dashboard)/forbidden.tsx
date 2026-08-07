import React from "react";
import Link from "next/link";
import { Lock, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center select-none animate-in fade-in duration-300">
      <div className="max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-soft space-y-6">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-200">
          <Lock className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-slate-900">403 — Access Restricted</h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            You do not have permission to view this section. Financial reports, user management, and system settings require an Administrator account.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link href="/dashboard">
            <Button leftIcon={<Home className="h-4 w-4" />}>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
