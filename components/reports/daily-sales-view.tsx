"use client";

import React, { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign,
  ShoppingBag,
  Utensils,
  Truck,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Receipt,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface DailySalesViewProps {
  shortcut: string;
  startDate: string;
  endDate: string;
}

export function DailySalesView({ shortcut, startDate, endDate }: DailySalesViewProps) {
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        params.set("shortcut", shortcut);
        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);

        const res = await fetch(`/api/reports/daily?${params.toString()}`);
        const json = await res.json();
        if (res.ok && json.success) {
          setData(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch daily sales data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [shortcut, startDate, endDate]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-3xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  if (!data) return null;

  const { metrics, orderTypes } = data;

  const chartData = [
    { name: "Dine In", amount: orderTypes.dineIn.amount, count: orderTypes.dineIn.count, fill: "#F59E0B" },
    { name: "Take Away", amount: orderTypes.takeout.amount, count: orderTypes.takeout.count, fill: "#3B82F6" },
    { name: "Delivery", amount: orderTypes.delivery.amount, count: orderTypes.delivery.count, fill: "#A855F7" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* KPI Overview Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="rounded-3xl bg-slate-900 p-5 text-white shadow-lg space-y-1">
          <p className="text-xs font-bold uppercase text-slate-400">Total Net Revenue</p>
          <p className="text-2xl font-black text-pizza-400">{formatCurrency(metrics.totalSales)}</p>
          <p className="text-[10px] text-slate-400 font-semibold">Completed Orders Only</p>
        </div>

        {/* Total Orders */}
        <div className="rounded-3xl bg-white p-5 border border-slate-200 shadow-soft space-y-1">
          <p className="text-xs font-bold uppercase text-slate-500">Total Orders</p>
          <p className="text-2xl font-black text-slate-900">{metrics.totalOrders}</p>
          <p className="text-[10px] text-emerald-600 font-bold">{metrics.completedOrders} Completed | {metrics.cancelledOrders} Cancelled</p>
        </div>

        {/* Average Order Value */}
        <div className="rounded-3xl bg-white p-5 border border-slate-200 shadow-soft space-y-1">
          <p className="text-xs font-bold uppercase text-slate-500">Average Order Value</p>
          <p className="text-2xl font-black text-slate-900">{formatCurrency(metrics.averageOrderValue)}</p>
          <p className="text-[10px] text-slate-400 font-semibold">Per completed ticket</p>
        </div>

        {/* Tax Collected */}
        <div className="rounded-3xl bg-white p-5 border border-slate-200 shadow-soft space-y-1">
          <p className="text-xs font-bold uppercase text-slate-500">Sales Tax (16%)</p>
          <p className="text-2xl font-black text-emerald-600">{formatCurrency(metrics.taxAmount)}</p>
          <p className="text-[10px] text-slate-400 font-semibold">Subtotal: {formatCurrency(metrics.subtotal)}</p>
        </div>
      </div>

      {/* Order Type Breakdown Cards & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Type Cards */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
            Sales Breakdown by Order Type
          </h3>

          {/* Dine In */}
          <div className="rounded-2xl bg-amber-50 p-4 border border-amber-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-200/80 p-2.5 text-amber-800">
                <Utensils className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-950">Dine In</p>
                <p className="text-xs text-amber-800 font-semibold">{orderTypes.dineIn.count} orders</p>
              </div>
            </div>
            <span className="text-base font-black text-amber-950">{formatCurrency(orderTypes.dineIn.amount)}</span>
          </div>

          {/* Take Away */}
          <div className="rounded-2xl bg-blue-50 p-4 border border-blue-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-200/80 p-2.5 text-blue-800">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-950">Take Away</p>
                <p className="text-xs text-blue-800 font-semibold">{orderTypes.takeout.count} orders</p>
              </div>
            </div>
            <span className="text-base font-black text-blue-950">{formatCurrency(orderTypes.takeout.amount)}</span>
          </div>

          {/* Delivery */}
          <div className="rounded-2xl bg-purple-50 p-4 border border-purple-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-purple-200/80 p-2.5 text-purple-800">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-purple-950">Delivery</p>
                <p className="text-xs text-purple-800 font-semibold">{orderTypes.delivery.count} orders</p>
              </div>
            </div>
            <span className="text-base font-black text-purple-950">{formatCurrency(orderTypes.delivery.amount)}</span>
          </div>
        </div>

        {/* Recharts Bar Chart */}
        <div className="lg:col-span-2 rounded-3xl bg-white p-5 border border-slate-200 shadow-soft space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
            Revenue Comparison (PKR)
          </h3>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val)), "Revenue"]}
                  contentStyle={{ backgroundColor: "#0F172A", borderRadius: "12px", color: "#FFF", fontSize: "12px" }}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
