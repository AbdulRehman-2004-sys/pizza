"use client";

import React, { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Banknote, CreditCard, Smartphone } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface PaymentMethodViewProps {
  shortcut: string;
  startDate: string;
  endDate: string;
}

export function PaymentMethodView({ shortcut, startDate, endDate }: PaymentMethodViewProps) {
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

        const res = await fetch(`/api/reports/payments?${params.toString()}`);
        const json = await res.json();
        if (res.ok && json.success) {
          setData(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch payment report:", error);
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

  const COLORS = {
    CASH: "#10B981",
    CARD: "#3B82F6",
    JAZZCASH: "#E11D48",
    EASYPAISA: "#059669",
  };

  const chartData = data.methods.map((m: any) => ({
    name: m.method,
    value: m.amount,
    count: m.count,
    percentage: m.percentage,
    color: COLORS[m.method as keyof typeof COLORS] || "#64748B",
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 4 Payment Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.methods.map((item: any) => {
          let Icon = Banknote;
          let cardBg = "bg-emerald-50 border-emerald-200 text-emerald-950";
          let iconBg = "bg-emerald-200/80 text-emerald-800";

          if (item.method === "CARD") {
            Icon = CreditCard;
            cardBg = "bg-blue-50 border-blue-200 text-blue-950";
            iconBg = "bg-blue-200/80 text-blue-800";
          } else if (item.method === "JAZZCASH") {
            Icon = Smartphone;
            cardBg = "bg-rose-50 border-rose-200 text-rose-950";
            iconBg = "bg-rose-200/80 text-rose-800";
          } else if (item.method === "EASYPAISA") {
            Icon = Smartphone;
            cardBg = "bg-emerald-50 border-emerald-300 text-emerald-950";
            iconBg = "bg-emerald-300/80 text-emerald-900";
          }

          return (
            <div key={item.method} className={`rounded-3xl p-5 border shadow-soft space-y-3 ${cardBg}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider">{item.method}</span>
                <div className={`p-2 rounded-xl ${iconBg}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <div>
                <p className="text-2xl font-black">{formatCurrency(item.amount)}</p>
                <div className="flex items-center justify-between text-xs font-semibold mt-1">
                  <span>{item.count} Transactions</span>
                  <span className="font-extrabold">{item.percentage}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recharts Pie Chart & Summary Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <div className="lg:col-span-1 rounded-3xl bg-white p-5 border border-slate-200 shadow-soft space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
            Payment Share Pie Chart
          </h3>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val)), "Revenue"]}
                  contentStyle={{ backgroundColor: "#0F172A", borderRadius: "12px", color: "#FFF", fontSize: "12px" }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Breakdown Table */}
        <div className="lg:col-span-2 rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-soft">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Detailed Payment Method Reconciliation
            </h3>
            <span className="text-xs font-bold text-slate-500">
              Total Recorded Revenue: <strong className="text-pizza-600 font-black">{formatCurrency(data.grandTotalAmount)}</strong>
            </span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 font-extrabold text-slate-500 border-b border-slate-200 uppercase text-[10px]">
              <tr>
                <th className="p-4">Payment Method</th>
                <th className="p-4 text-center">Transactions Count</th>
                <th className="p-4 text-center">Revenue Share (%)</th>
                <th className="p-4 text-right">Total Collected (PKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {data.methods.map((item: any) => (
                <tr key={item.method} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4 font-bold text-slate-900">{item.method}</td>
                  <td className="p-4 text-center font-extrabold">{item.count}</td>
                  <td className="p-4 text-center">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 font-black text-slate-800 text-[11px]">
                      {item.percentage}%
                    </span>
                  </td>
                  <td className="p-4 text-right font-black text-pizza-600 font-mono text-sm">
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
