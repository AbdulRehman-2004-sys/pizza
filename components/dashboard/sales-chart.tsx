"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { SalesChartData, CategorySalesData } from "@/types/dashboard";
import { TrendingUp, PieChart as PieIcon } from "lucide-react";

export interface SalesChartProps {
  salesTrend: SalesChartData[];
  categoryBreakdown: CategorySalesData[];
}

export function SalesChart({ salesTrend = [], categoryBreakdown = [] }: SalesChartProps) {
  const defaultSalesTrend = salesTrend.length > 0 ? salesTrend : [
    { time: "10:00 AM", sales: 0, orders: 0 },
    { time: "12:00 PM", sales: 0, orders: 0 },
    { time: "02:00 PM", sales: 0, orders: 0 },
    { time: "04:00 PM", sales: 0, orders: 0 },
    { time: "06:00 PM", sales: 0, orders: 0 },
    { time: "08:00 PM", sales: 0, orders: 0 },
    { time: "10:00 PM", sales: 0, orders: 0 },
  ];

  const defaultCategoryBreakdown = categoryBreakdown.length > 0 ? categoryBreakdown : [
    { name: "Pizzas", value: 68, color: "#f97316" },
    { name: "Sides & Wings", value: 16, color: "#e11d48" },
    { name: "Beverages", value: 10, color: "#3b82f6" },
    { name: "Desserts", value: 6, color: "#10b981" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Hourly Sales Trend AreaChart */}
      <div className="lg:col-span-2 rounded-2xl bg-white p-5 border border-slate-200/80 shadow-soft flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-pizza-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Hourly Sales Overview</h3>
          </div>
          <span className="text-xs font-semibold text-pizza-600 bg-pizza-50 px-2.5 py-1 rounded-full border border-pizza-100">
            Live Today
          </span>
        </div>

        <div className="h-64 min-h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={defaultSalesTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#1e293b",
                  borderRadius: "12px",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#f97316"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#salesGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown BarChart */}
      <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-soft flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PieIcon className="h-4 w-4 text-pizza-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Sales By Category</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">% Share</span>
        </div>

        <div className="h-64 min-h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={defaultCategoryBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#64748b" }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#1e293b",
                  borderRadius: "12px",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {defaultCategoryBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
