"use client";

import React, { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Utensils, Award, ArrowUpDown } from "lucide-react";
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

interface TopItemsViewProps {
  shortcut: string;
  startDate: string;
  endDate: string;
}

export function TopItemsView({ shortcut, startDate, endDate }: TopItemsViewProps) {
  const [topLimit, setTopLimit] = useState<number>(10);
  const [sortBy, setSortBy] = useState<"quantity" | "revenue">("quantity");
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        params.set("shortcut", shortcut);
        params.set("topLimit", topLimit.toString());
        params.set("sortBy", sortBy);
        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);

        const res = await fetch(`/api/reports/top-items?${params.toString()}`);
        const json = await res.json();
        if (res.ok && json.success) {
          setItems(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch top items data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [shortcut, startDate, endDate, topLimit, sortBy]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-soft">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-pizza-500" />
          <h3 className="text-sm font-bold text-slate-900">Top Selling Products Analytics</h3>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Top Count Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
            {[10, 20, 50].map((limit) => (
              <button
                key={limit}
                onClick={() => setTopLimit(limit)}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  topLimit === limit
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Top {limit}
              </button>
            ))}
          </div>

          {/* Sort By Toggle */}
          <button
            onClick={() => setSortBy(sortBy === "quantity" ? "revenue" : "quantity")}
            className="px-3.5 py-2 rounded-2xl border border-slate-200 text-xs font-extrabold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <ArrowUpDown className="h-3.5 w-3.5 text-pizza-500" />
            <span>Sort: {sortBy === "quantity" ? "Quantity Sold" : "Revenue"}</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-3xl" />
          <Skeleton className="h-48 w-full rounded-3xl" />
        </div>
      ) : items.length > 0 ? (
        <div className="space-y-6">
          {/* Recharts Chart */}
          <div className="rounded-3xl bg-white p-5 border border-slate-200 shadow-soft space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
              Top Products Graph ({sortBy === "quantity" ? "Items Sold" : "Revenue in PKR"})
            </h3>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={items.slice(0, 10)}
                  margin={{ top: 10, right: 30, left: 40, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fontWeight: 700 }} width={120} />
                  <Tooltip
                    formatter={(val: any) => [
                      sortBy === "quantity" ? `${val} units` : formatCurrency(Number(val)),
                      sortBy === "quantity" ? "Quantity Sold" : "Total Revenue",
                    ]}
                    contentStyle={{ backgroundColor: "#0F172A", borderRadius: "12px", color: "#FFF", fontSize: "12px" }}
                  />
                  <Bar dataKey={sortBy === "quantity" ? "quantity" : "revenue"} fill="#F97316" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-soft">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 font-extrabold text-slate-500 border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="p-4">Rank & Product Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4 text-center">Quantity Sold</th>
                  <th className="p-4 text-right">Total Revenue (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {items.map((item, index) => (
                  <tr key={item.name} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 font-bold text-slate-900 flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white font-black text-[10px]">
                        #{index + 1}
                      </span>
                      <span>{item.name}</span>
                    </td>
                    <td className="p-4 text-slate-500 font-medium">{item.category}</td>
                    <td className="p-4 text-center font-extrabold text-slate-900">{item.quantity}</td>
                    <td className="p-4 text-right font-black text-pizza-600 font-mono text-sm">
                      {formatCurrency(item.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <Utensils className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-800">No completed product sales found</p>
          <p className="text-xs text-slate-400">Completed order sales will appear here.</p>
        </div>
      )}
    </div>
  );
}
