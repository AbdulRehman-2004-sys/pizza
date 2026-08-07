"use client";

import React, { useEffect, useState } from "react";
import { SearchInput } from "@/components/ui/search-input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { KOTCard } from "@/components/kitchen/kot-card";
import { ChefHat, Clock, CheckCircle2, RefreshCw, Flame, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function KitchenPage() {
  const [queue, setQueue] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");

  const fetchKitchenData = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const [queueRes, statsRes] = await Promise.all([
        fetch(`/api/kitchen/queue?status=${selectedStatus}&type=${selectedType}&search=${encodeURIComponent(searchQuery)}`),
        fetch("/api/kitchen/stats"),
      ]);

      const [queueJson, statsJson] = await Promise.all([
        queueRes.json(),
        statsRes.json(),
      ]);

      if (queueRes.ok && queueJson.success) setQueue(queueJson.data);
      if (statsRes.ok && statsJson.success) setStats(statsJson.data);
    } catch (error) {
      console.error("Failed to load kitchen data:", error);
      if (!silent) toast.error("Failed to load kitchen queue");
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKitchenData();

    // Real-Time 5-Second Interval Polling for Back-of-House Displays
    const interval = setInterval(() => {
      fetchKitchenData(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedStatus, selectedType, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-3xl text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-pizza-500 p-3 text-white shadow-lg shadow-pizza-500/40">
            <ChefHat className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">Kitchen Display System (KDS)</h1>
            <p className="text-xs text-slate-400">Live order queue and ticket preparation manager</p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="flex items-center gap-2 rounded-2xl bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-300 border border-slate-700">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span>Live Auto-Sync (5s)</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchKitchenData(false)}
            isLoading={isLoading}
            className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Live Stats Overview Bar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-2xl bg-amber-50 p-4 border border-amber-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-800 uppercase">Pending Tickets</p>
              <p className="text-2xl font-black text-amber-900 mt-0.5">{stats.pendingCount}</p>
            </div>
            <div className="rounded-xl p-2.5 bg-amber-200/60 text-amber-800">
              <Clock className="h-6 w-6" />
            </div>
          </div>

          <div className="rounded-2xl bg-pizza-50 p-4 border border-pizza-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-pizza-800 uppercase">Preparing in Oven</p>
              <p className="text-2xl font-black text-pizza-900 mt-0.5">{stats.preparingCount}</p>
            </div>
            <div className="rounded-xl p-2.5 bg-pizza-200/60 text-pizza-800">
              <Flame className="h-6 w-6" />
            </div>
          </div>

          <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-800 uppercase">Ready for Pickup</p>
              <p className="text-2xl font-black text-emerald-900 mt-0.5">{stats.readyCount}</p>
            </div>
            <div className="rounded-xl p-2.5 bg-emerald-200/60 text-emerald-800">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>

          <div className="rounded-2xl bg-slate-100 p-4 border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-700 uppercase">Completed Today</p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">{stats.completedTodayCount}</p>
            </div>
            <div className="rounded-xl p-2.5 bg-slate-200 text-slate-700">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>
        </div>
      )}

      {/* Control Bar: Status Tabs, Type Selector, & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedStatus("ALL")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedStatus === "ALL"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Tickets
          </button>
          <button
            onClick={() => setSelectedStatus("PENDING")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedStatus === "PENDING"
                ? "bg-amber-500 text-white shadow-sm"
                : "bg-amber-50 text-amber-700 hover:bg-amber-100"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setSelectedStatus("KITCHEN")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedStatus === "KITCHEN"
                ? "bg-pizza-500 text-white shadow-sm"
                : "bg-pizza-50 text-pizza-700 hover:bg-pizza-100"
            }`}
          >
            Preparing
          </button>
          <button
            onClick={() => setSelectedStatus("READY")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedStatus === "READY"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            Ready
          </button>
          <button
            onClick={() => setSelectedStatus("COMPLETED")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedStatus === "COMPLETED"
                ? "bg-slate-700 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Completed
          </button>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pizza-500"
          >
            <option value="ALL">All Order Types</option>
            <option value="DINE_IN">Dine In Only</option>
            <option value="TAKEOUT">Take Away Only</option>
            <option value="DELIVERY">Delivery Only</option>
          </select>

          <div className="w-full md:w-64">
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery("")}
              placeholder="Search KOT # or Order #..."
            />
          </div>
        </div>
      </div>

      {/* KOT Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-3xl" />
          ))}
        </div>
      ) : queue.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {queue.map((kot) => (
            <KOTCard key={kot.id} kot={kot} onStatusUpdate={() => fetchKitchenData(true)} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No active kitchen tickets"
          description="New orders created on the POS terminal will appear here automatically."
          icon={ChefHat}
        />
      )}
    </div>
  );
}
