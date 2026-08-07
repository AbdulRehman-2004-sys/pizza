"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Bell,
  LogOut,
  User,
  Shield,
  Menu,
  CheckCircle2,
  Utensils,
  ShoppingBag,
  Truck,
  Pizza,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export function Header() {
  const { user, logout } = useAuth();
  const [readyOrders, setReadyOrders] = useState<any[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Poll active READY orders every 5 seconds for live cashier alerts
  useEffect(() => {
    const fetchReadyNotifications = async () => {
      try {
        const res = await fetch("/api/kitchen/ready-notifications");
        const json = await res.json();
        if (res.ok && json.success) {
          const prevCount = readyOrders.length;
          setReadyOrders(json.data);

          // Toast alert if new ready order arrived
          if (json.data.length > prevCount && prevCount > 0) {
            const newest = json.data[0];
            toast.success(`🔔 Order #${newest.order.orderNumber} is READY!`, {
              description: `Type: ${newest.order.type} ${
                newest.order.tableNumber ? `(Table #${newest.order.tableNumber})` : ""
              }`,
              duration: 6000,
            });
          }
        }
      } catch (error) {
        console.error("Ready notification error:", error);
      }
    };

    fetchReadyNotifications();
    const interval = setInterval(fetchReadyNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-4 sm:px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden rounded-xl p-2 text-slate-500 hover:bg-slate-100"
          title="Open Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="hidden sm:inline font-bold text-slate-900">
            {process.env.NEXT_PUBLIC_APP_NAME || "SliceMaster POS"}
          </span>
          <span className="hidden sm:inline text-slate-300">•</span>
          <span className="text-pizza-600 font-bold bg-pizza-50 px-2.5 py-0.5 rounded-full border border-pizza-200">
            Terminal Active
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Ready Notification Bell & Popover */}
        <div className="relative">
          <button
            onClick={() => setIsPopoverOpen(!isPopoverOpen)}
            className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            title="Ready Orders Notification"
          >
            <Bell className="h-5 w-5" />
            {readyOrders.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-black text-white shadow-md animate-pulse">
                {readyOrders.length}
              </span>
            )}
          </button>

          {/* Notifications Popover */}
          {isPopoverOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-3xl bg-white p-4 shadow-2xl border border-slate-200 z-50 animate-in fade-in zoom-in-95 duration-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-900">Orders Ready for Serve</span>
                </div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  {readyOrders.length} Ready
                </span>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2">
                {readyOrders.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No ready orders right now</p>
                ) : (
                  readyOrders.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900">
                          {item.order.orderNumber} ({item.kotNumber})
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                          READY
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-600">
                        {item.order.type === "DINE_IN" && `Table #${item.order.tableNumber}`}
                        {item.order.type === "TAKEOUT" && "Take Away Customer"}
                        {item.order.type === "DELIVERY" && `Delivery: ${item.order.customer?.name}`}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <Link
                  href="/kitchen"
                  onClick={() => setIsPopoverOpen(false)}
                  className="text-xs font-bold text-pizza-600 hover:text-pizza-700"
                >
                  Go to Kitchen Display →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Info Badge */}
        <div className="hidden sm:flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-1.5 border border-slate-200">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-pizza-500 text-white text-xs font-bold">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div className="text-left leading-none">
            <p className="text-xs font-bold text-slate-900">{user?.name || "Cashier"}</p>
            <p className="text-[10px] text-slate-500 font-semibold uppercase">{user?.role || "CASHIER"}</p>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className="rounded-xl border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
          leftIcon={<LogOut className="h-4 w-4" />}
        >
          <span className="hidden sm:inline">Sign Out</span>
        </Button>
      </div>
    </header>
  );
}
