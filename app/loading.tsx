import React from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <LoadingSpinner size="lg" label="Loading SliceMaster POS Terminal..." />
    </div>
  );
}
