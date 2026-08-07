"use client";

import React, { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, TrendingUp } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function MonthlySalesView() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/reports/monthly?month=${selectedMonth}&year=${selectedYear}`);
        const json = await res.json();
        if (res.ok && json.success) {
          setData(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch monthly sales:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth, selectedYear]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Month & Year Selection Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-soft">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-pizza-500" />
          <h3 className="text-sm font-bold text-slate-900">Select Monthly Reporting Period</h3>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Month Selector */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-pizza-500"
          >
            {[
              { m: 1, name: "January" },
              { m: 2, name: "February" },
              { m: 3, name: "March" },
              { m: 4, name: "April" },
              { m: 5, name: "May" },
              { m: 6, name: "June" },
              { m: 7, name: "July" },
              { m: 8, name: "August" },
              { m: 9, name: "September" },
              { m: 10, name: "October" },
              { m: 11, name: "November" },
              { m: 12, name: "December" },
            ].map((item) => (
              <option key={item.m} value={item.m}>
                {item.name}
              </option>
            ))}
          </select>

          {/* Year Selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-pizza-500"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-3xl" />
            ))}
          </div>
          <Skeleton className="h-72 w-full rounded-3xl" />
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Monthly KPI Overview Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-3xl bg-slate-900 p-5 text-white shadow-lg space-y-1">
              <p className="text-xs font-bold uppercase text-slate-400">Monthly Net Revenue</p>
              <p className="text-2xl font-black text-pizza-400">{formatCurrency(data.metrics.totalSales)}</p>
              <p className="text-[10px] text-slate-400 font-semibold">Completed Orders Only</p>
            </div>

            <div className="rounded-3xl bg-white p-5 border border-slate-200 shadow-soft space-y-1">
              <p className="text-xs font-bold uppercase text-slate-500">Monthly Completed Orders</p>
              <p className="text-2xl font-black text-slate-900">{data.metrics.completedOrders}</p>
              <p className="text-[10px] text-slate-400 font-semibold">{data.metrics.cancelledOrders} Cancelled</p>
            </div>

            <div className="rounded-3xl bg-white p-5 border border-slate-200 shadow-soft space-y-1">
              <p className="text-xs font-bold uppercase text-slate-500">Average Ticket Size</p>
              <p className="text-2xl font-black text-slate-900">{formatCurrency(data.metrics.averageOrderValue)}</p>
              <p className="text-[10px] text-slate-400 font-semibold">Per completed order</p>
            </div>

            <div className="rounded-3xl bg-white p-5 border border-slate-200 shadow-soft space-y-1">
              <p className="text-xs font-bold uppercase text-slate-500">Tax Collected (16%)</p>
              <p className="text-2xl font-black text-emerald-600">{formatCurrency(data.metrics.taxAmount)}</p>
              <p className="text-[10px] text-emerald-700 font-bold">Discounts: -{formatCurrency(data.metrics.discountAmount)}</p>
            </div>
          </div>

          {/* Daily Sales Trend Chart */}
          <div className="rounded-3xl bg-white p-5 border border-slate-200 shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-pizza-500" />
                Daily Sales Revenue Trend
              </h3>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.dailyTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F97316" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fontWeight: 700 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(val: any) => [formatCurrency(Number(val)), "Daily Revenue"]}
                    contentStyle={{ backgroundColor: "#0F172A", borderRadius: "12px", color: "#FFF", fontSize: "12px" }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#F97316" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
