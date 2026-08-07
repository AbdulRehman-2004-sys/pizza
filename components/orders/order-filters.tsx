"use client";

import React from "react";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { Filter, RotateCcw, Calendar, ArrowUpDown } from "lucide-react";

interface OrderFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  dateRangeShortcut: string;
  onDateRangeShortcutChange: (shortcut: string) => void;
  startDate: string;
  onStartDateChange: (date: string) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
  sortOrder: string;
  onSortOrderChange: (order: string) => void;
  onResetFilters: () => void;
}

export function OrderFilters({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedStatus,
  onStatusChange,
  dateRangeShortcut,
  onDateRangeShortcutChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  onResetFilters,
}: OrderFiltersProps) {
  const isFiltered =
    searchQuery ||
    selectedType !== "ALL" ||
    selectedStatus !== "ALL" ||
    dateRangeShortcut !== "ALL" ||
    startDate ||
    endDate;

  return (
    <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-soft space-y-3">
      {/* Top Bar: Search & Shortcuts */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="w-full lg:w-80">
          <SearchInput
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onClear={() => onSearchChange("")}
            placeholder="Search order #, invoice #, customer name/phone..."
          />
        </div>

        {/* Date Shortcuts Pill Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 text-xs font-bold">
          {[
            { id: "ALL", label: "All Dates" },
            { id: "TODAY", label: "Today" },
            { id: "YESTERDAY", label: "Yesterday" },
            { id: "7DAYS", label: "Last 7 Days" },
            { id: "CUSTOM", label: "Custom Range" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onDateRangeShortcutChange(item.id)}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                dateRangeShortcut === item.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Secondary Controls: Custom Date Range, Select Filters, Reset */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 border-t border-slate-100 items-center">
        {/* Order Type Dropdown */}
        <div>
          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
            Order Type
          </label>
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:border-pizza-500 focus:outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="DINE_IN">Dine In</option>
            <option value="TAKEOUT">Take Away</option>
            <option value="DELIVERY">Delivery</option>
          </select>
        </div>

        {/* Status Dropdown */}
        <div>
          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
            Order Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:border-pizza-500 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="KITCHEN">Preparing (Kitchen)</option>
            <option value="READY">Ready</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Sort By Dropdown */}
        <div>
          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
            Sort Field
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:border-pizza-500 focus:outline-none"
          >
            <option value="createdAt">Date / Time</option>
            <option value="totalAmount">Total Amount</option>
            <option value="orderNumber">Order Number</option>
            <option value="status">Status</option>
          </select>
        </div>

        {/* Sort Direction */}
        <div>
          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
            Direction
          </label>
          <select
            value={sortOrder}
            onChange={(e) => onSortOrderChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:border-pizza-500 focus:outline-none"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>

        {/* Custom Date Range Picker inputs (Visible if CUSTOM is selected) */}
        {dateRangeShortcut === "CUSTOM" && (
          <>
            <div>
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-2 py-1 text-xs text-slate-800 focus:border-pizza-500 focus:outline-none"
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
                className="w-full rounded-xl border border-slate-200 px-2 py-1 text-xs text-slate-800 focus:border-pizza-500 focus:outline-none"
              />
            </div>
          </>
        )}

        {/* Reset Button */}
        {isFiltered && (
          <div className="col-span-2 sm:col-span-1 flex items-end">
            <Button
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              className="w-full text-slate-600 border-slate-200 hover:bg-slate-100 font-bold"
              leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
            >
              Reset
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
