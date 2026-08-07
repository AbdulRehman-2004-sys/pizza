"use client";

import React, { useState, useEffect } from "react";
import { useUI } from "@/hooks/use-ui";
import { Breadcrumb } from "./breadcrumb";
import { UserNav } from "./user-nav";
import { Drawer } from "@/components/ui/drawer";
import { SidebarContent } from "./sidebar";
import { Button } from "@/components/ui/button";
import { Menu, Bell, Clock, ShoppingCart, CheckCircle2, Utensils } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export function Navbar() {
  const { isSidebarOpen, setSidebarOpen } = useUI();
  const [timeString, setTimeString] = useState<string>("");
  const [readyOrders, setReadyOrders] = useState<any[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);

  // Clock Timer
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Poll Active READY Orders for Cashier Header Bell
  useEffect(() => {
    const fetchReadyNotifications = async () => {
      try {
        const res = await fetch("/api/kitchen/ready-notifications");
        const json = await res.json();
        if (res.ok && json.success) {
          const newOrders = json.data || [];

          // Trigger toast alert if new ready order arrives
          if (newOrders.length > readyOrders.length && readyOrders.length > 0) {
            const newest = newOrders[0];
            toast.success(`🔔 Order #${newest.order.orderNumber} is READY!`, {
              description: `Type: ${newest.order.type} ${
                newest.order.tableNumber ? `(Table #${newest.order.tableNumber})` : ""
              }`,
              duration: 6000,
            });
          }
          setReadyOrders(newOrders);
        }
      } catch (error) {
        console.error("Failed to fetch ready notifications:", error);
      }
    };

    fetchReadyNotifications();
    const interval = setInterval(fetchReadyNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 sm:px-6 backdrop-blur-md shadow-card">
      {/* Left section: Drawer Toggle + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden transition-colors"
          aria-label="Open Mobile Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:block">
          <Breadcrumb />
        </div>
      </div>

      {/* Right section: Quick Actions, Clock, Notifications & User Dropdown */}
      <div className="flex items-center gap-3">
        {/* Clock Indicator */}
        <div className="hidden md:flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700">
          <Clock className="h-3.5 w-3.5 text-pizza-500" />
          <span>{timeString || "12:00:00 PM"}</span>
        </div>

        {/* Quick Order Button */}
        <Link href="/pos">
          <Button size="sm" className="hidden sm:inline-flex" leftIcon={<ShoppingCart className="h-4 w-4" />}>
            New Order
          </Button>
        </Link>

        {/* Dynamic Ready Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setIsPopoverOpen(!isPopoverOpen)}
            className="relative rounded-xl border border-slate-200/80 bg-white p-2 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {readyOrders.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-black text-white shadow-md animate-pulse px-1">
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
                  <span className="text-xs font-bold text-slate-900">Orders Ready to Serve</span>
                </div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  {readyOrders.length} Ready
                </span>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2">
                {readyOrders.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No orders currently ready</p>
                ) : (
                  readyOrders.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1"
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

        {/* User Nav */}
        <UserNav />
      </div>

      {/* Mobile Drawer */}
      <Drawer
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        title="SliceMaster POS"
        side="left"
      >
        <SidebarContent />
      </Drawer>
    </header>
  );
}
