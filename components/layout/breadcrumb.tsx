"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
      <Link href="/dashboard" className="flex items-center hover:text-pizza-500 transition-colors">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {segments.map((segment, index) => {
        const url = `/${segments.slice(0, index + 1).join("/")}`;
        const isLast = index === segments.length - 1;
        const formattedSegment = segment.charAt(0).toUpperCase() + segment.slice(1);

        return (
          <React.Fragment key={url}>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            {isLast ? (
              <span className="font-semibold text-slate-900">{formattedSegment}</span>
            ) : (
              <Link href={url} className="hover:text-pizza-500 transition-colors">
                {formattedSegment}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
