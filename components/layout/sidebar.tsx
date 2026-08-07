"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  ShoppingCart,
  ChefHat,
  Receipt,
  FileSpreadsheet,
  UtensilsCrossed,
  Layers,
  Pizza,
  Grid2X2,
  Settings,
  Users,
  BarChart3,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

export const navigationItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "POS Order Terminal",
    href: "/pos",
    icon: ShoppingCart,
  },
  {
    title: "Kitchen Display",
    href: "/kitchen",
    icon: ChefHat,
  },
  {
    title: "Billing & Payments",
    href: "/billing",
    icon: Receipt,
  },
  {
    title: "Order Management",
    href: "/orders",
    icon: FileSpreadsheet,
  },
  {
    title: "Menu & Items",
    href: "/menu",
    icon: UtensilsCrossed,
  },
  {
    title: "Categories",
    href: "/categories",
    icon: Layers,
  },
  {
    title: "Pizza Config",
    href: "/pizza-config",
    icon: Pizza,
  },
  {
    title: "Tables & Seating",
    href: "/tables",
    icon: Grid2X2,
  },
  {
    title: "Reports & Analytics",
    href: "/reports",
    icon: BarChart3,
    adminOnly: true,
  },
  {
    title: "User Management",
    href: "/admin/users",
    icon: Users,
    adminOnly: true,
  },
  {
    title: "Store Settings",
    href: "/settings",
    icon: Settings,
    adminOnly: true,
  },
];

export function SidebarContent() {
  const pathname = usePathname();
  const { user } = useAuth();

  const filteredNav = navigationItems.filter(
    (item) => !item.adminOnly || user?.role === "ADMIN"
  );

  return (
    <div className="flex flex-col h-screen max-h-screen bg-slate-900 text-white w-64 justify-between select-none">
      {/* Brand Header - Fixed Top */}
      <div className="shrink-0 p-4 border-b border-slate-800">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-pizza-500 text-white shadow-lg shadow-pizza-500/30">
            <Pizza className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-black text-sm tracking-wide text-white leading-tight">
              SliceMaster Pizza
            </h1>
            <span className="text-[10px] text-pizza-400 font-bold tracking-wider uppercase">
              POS System v1.0
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Section - Scrollable Middle */}
      <div className="flex-1 overflow-y-auto px-4 py-3 sidebar-scrollbar">
        <nav className="space-y-1">
          <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">
            Main Navigation
          </p>

          {filteredNav.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                  isActive
                    ? "bg-pizza-500 text-white shadow-lg shadow-pizza-500/25"
                    : "text-slate-400 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                      isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                    }`}
                  />
                  <span>{item.title}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Session Footer - Fixed Bottom */}
      {user && (
        <div className="shrink-0 p-4 border-t border-slate-800 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-pizza-400 font-black text-xs border border-slate-700">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 truncate">
            <p className="text-xs font-bold text-white truncate">{user.name}</p>
            <p className="text-[10px] text-slate-500 font-semibold uppercase">{user.role}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden lg:flex h-screen sticky top-0 z-40">
      <SidebarContent />
    </aside>
  );
}
