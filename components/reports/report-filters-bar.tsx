"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface ReportFiltersBarProps {
  shortcut: string;
  onShortcutChange: (shortcut: string) => void;
  startDate: string;
  onStartDateChange: (date: string) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
  orderType: string;
  onOrderTypeChange: (type: string) => void;
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  onReset: () => void;
}

export function ReportFiltersBar({
  shortcut,
  onShortcutChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  orderType,
  onOrderTypeChange,
  paymentMethod,
  onPaymentMethodChange,
  onReset,
}: ReportFiltersBarProps) {
  const isFiltered =
    shortcut !== "TODAY" ||
    orderType !== "ALL" ||
    paymentMethod !== "ALL" ||
    startDate ||
    endDate;

  return (
    <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-soft space-y-3 print:hidden">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Date Shortcut Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 text-xs font-bold">
          {[
            { id: "TODAY", label: "Today" },
            { id: "YESTERDAY", label: "Yesterday" },
            { id: "THIS_WEEK", label: "This Week" },
            { id: "THIS_MONTH", label: "This Month" },
            { id: "CUSTOM", label: "Custom Range" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onShortcutChange(item.id)}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                shortcut === item.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 items-center">
          <div>
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
              Order Type
            </label>
            <select
              value={orderType}
              onChange={(e) => onOrderTypeChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:border-pizza-500 focus:outline-none"
            >
              <option value="ALL">All Types</option>
              <option value="DINE_IN">Dine In</option>
              <option value="TAKEOUT">Take Away</option>
              <option value="DELIVERY">Delivery</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => onPaymentMethodChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:border-pizza-500 focus:outline-none"
            >
              <option value="ALL">All Methods</option>
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="JAZZCASH">JazzCash</option>
              <option value="EASYPAISA">Easypaisa</option>
            </select>
          </div>

          {isFiltered && (
            <div className="flex items-end col-span-2 sm:col-span-1">
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                className="w-full text-slate-600 border-slate-200 hover:bg-slate-100 font-bold"
                leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
              >
                Reset
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Custom Date Pickers */}
      {shortcut === "CUSTOM" && (
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-2 py-1.5 text-xs text-slate-800 focus:border-pizza-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-2 py-1.5 text-xs text-slate-800 focus:border-pizza-500 focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
