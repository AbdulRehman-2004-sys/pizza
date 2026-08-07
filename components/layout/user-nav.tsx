"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { User, LogOut, ShieldCheck, UserCheck, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function UserNav() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const isAdminRole = user.role === "ADMIN";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 hover:bg-slate-50 transition-all shadow-sm"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pizza-500 text-white font-bold text-sm shadow-sm">
          {user.name.charAt(0)}
        </div>
        <div className="hidden text-left md:block">
          <p className="text-xs font-bold text-slate-900 leading-tight">{user.name}</p>
          <p className="text-[10px] text-slate-500 font-medium">{user.email}</p>
        </div>
        <Badge variant={isAdminRole ? "primary" : "info"} size="sm" className="hidden lg:inline-flex">
          {user.role}
        </Badge>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-2 shadow-xl border border-slate-100 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-slate-100 mb-1">
            <p className="text-xs font-bold text-slate-900">{user.name}</p>
            <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
            <div className="mt-1.5">
              <Badge variant={isAdminRole ? "primary" : "info"} size="sm">
                {isAdminRole ? <ShieldCheck className="h-3 w-3 mr-1" /> : <UserCheck className="h-3 w-3 mr-1" />}
                Role: {user.role}
              </Badge>
            </div>
          </div>

          <button
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign out</span>
          </button>
        </div>
      )}
    </div>
  );
}
