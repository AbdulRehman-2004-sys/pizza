"use client";

import React, { useEffect, useState } from "react";
import { SalesCards } from "@/components/dashboard/sales-cards";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { RecentOrdersTable } from "@/components/dashboard/recent-orders-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { Store, Calendar, RefreshCw, Layers, UtensilsCrossed, Grid2X2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/dashboard/stats");
      const json = await res.json();
      if (res.ok && json.success) {
        setStats(json.data);
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
      toast.error("Failed to refresh dashboard stats");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Overview Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-3xl text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-pizza-400" />
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Restaurant Terminal Dashboard
            </h1>
          </div>
          <p className="text-xs text-slate-300">
            Welcome back, <span className="font-bold text-white">{user?.name || "Operator"}</span> ({user?.role || "CASHIER"}) • Ready for operations
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="hidden md:flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">
            <Calendar className="h-3.5 w-3.5 text-pizza-400" />
            <span>{new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchStats}
            isLoading={isLoading}
            className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Sales Cards */}
      {isLoading || !stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <SalesCards
          todaySales={stats.todaySales}
          todaySalesChange={stats.todaySalesChange}
          todayOrdersCount={stats.todayOrdersCount}
          pendingKitchenCount={stats.pendingKitchenCount}
          completedOrdersCount={stats.completedOrdersCount}
        />
      )}

      {/* Phase 2 Master Data Overview Bar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link href="/categories" className="rounded-2xl bg-white p-4 border border-slate-200 shadow-soft hover:shadow-md transition-all flex items-center justify-between group">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">Categories</p>
              <p className="text-xl font-black text-slate-900 mt-0.5">{stats.totalCategories}</p>
            </div>
            <div className="rounded-xl p-2.5 bg-pizza-50 text-pizza-600 group-hover:scale-110 transition-transform">
              <Layers className="h-5 w-5" />
            </div>
          </Link>

          <Link href="/menu" className="rounded-2xl bg-white p-4 border border-slate-200 shadow-soft hover:shadow-md transition-all flex items-center justify-between group">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">Menu Items</p>
              <p className="text-xl font-black text-slate-900 mt-0.5">{stats.totalMenuItems}</p>
            </div>
            <div className="rounded-xl p-2.5 bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
          </Link>

          <Link href="/tables" className="rounded-2xl bg-white p-4 border border-slate-200 shadow-soft hover:shadow-md transition-all flex items-center justify-between group">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">Total Tables</p>
              <p className="text-xl font-black text-slate-900 mt-0.5">{stats.totalTables}</p>
            </div>
            <div className="rounded-xl p-2.5 bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
              <Grid2X2 className="h-5 w-5" />
            </div>
          </Link>

          <Link href="/tables" className="rounded-2xl bg-white p-4 border border-slate-200 shadow-soft hover:shadow-md transition-all flex items-center justify-between group">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">Available Tables</p>
              <p className="text-xl font-black text-emerald-700 mt-0.5">{stats.availableTables}</p>
            </div>
            <div className="rounded-xl p-2.5 bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </Link>
        </div>
      )}

      {/* Quick Operational Shortcuts */}
      <QuickActions />

      {/* Recharts Data Analytics */}
      {isLoading || !stats ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Skeleton className="lg:col-span-2 h-72 w-full rounded-2xl" />
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
      ) : (
        <SalesChart salesTrend={stats.salesTrend} categoryBreakdown={stats.categoryBreakdown} />
      )}

      {/* Recent Orders Feed */}
      <RecentOrdersTable orders={stats?.recentOrders || []} isLoading={isLoading} />
    </div>
  );
}
