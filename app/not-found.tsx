import React from "react";
import Link from "next/link";
import { Pizza, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 text-center">
      <div className="max-w-md space-y-6">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-pizza-500/20 text-pizza-500 border border-pizza-500/30">
          <Pizza className="h-10 w-10 animate-bounce" />
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-black text-white tracking-tighter">404</h1>
          <h2 className="text-xl font-bold text-slate-200">Slice Not Found</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            The page or order ticket you are looking for has been moved, eaten, or does not exist.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link href="/dashboard">
            <Button leftIcon={<Home className="h-4 w-4" />}>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
