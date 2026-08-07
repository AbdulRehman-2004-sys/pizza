"use client";

import React, { useEffect } from "react";
import { AlertOctagon, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 text-center">
      <div className="max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
          <AlertOctagon className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900">Something Went Wrong</h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {error.message || "An unexpected application error occurred on the server terminal."}
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={() => reset()} leftIcon={<RefreshCw className="h-4 w-4" />}>
            Try Again
          </Button>
          <Link href="/dashboard">
            <Button size="sm" leftIcon={<Home className="h-4 w-4" />}>
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
