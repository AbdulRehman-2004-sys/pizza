"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils";
import { Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PrintableReportPDFProps {
  title: string;
  shortcut: string;
  startDate?: string;
  endDate?: string;
  summary: {
    totalSales: number;
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    averageOrderValue: number;
    taxAmount?: number;
    discountAmount?: number;
  };
  onClose: () => void;
}

export function PrintableReportPDF({
  title,
  shortcut,
  startDate,
  endDate,
  summary,
  onClose,
}: PrintableReportPDFProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 overflow-y-auto backdrop-blur-sm select-none">
      {/* Controls Bar */}
      <div className="absolute top-4 right-4 flex items-center gap-3 print:hidden z-20">
        <Button onClick={handlePrint} size="sm" leftIcon={<Printer className="h-4 w-4" />}>
          Print PDF Report
        </Button>
        <button
          onClick={onClose}
          className="rounded-full bg-white/20 p-2 text-white hover:bg-white/30 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Printable Page Body */}
      <div
        id="printable-pdf-document"
        className="w-[210mm] min-h-[297mm] bg-white p-8 text-black font-sans text-xs shadow-2xl rounded-sm my-auto border border-slate-200 print:shadow-none print:m-0 print:border-none print:w-full print:p-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-wider text-slate-900">SliceMaster Pizzeria</h1>
            <p className="text-xs text-slate-600">Main Boulevard, Gulberg III, Lahore, Pakistan</p>
            <p className="text-xs text-slate-600">Tel: +92 42 111 749 922</p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold text-pizza-600 uppercase tracking-tight">{title}</h2>
            <p className="text-xs font-semibold text-slate-500">Generated: {new Date().toLocaleString()}</p>
            <p className="text-xs text-slate-500">Period: {shortcut} {startDate ? `(${startDate} to ${endDate || "Today"})` : ""}</p>
          </div>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="p-3 border border-slate-300 rounded-xl bg-slate-50">
            <p className="text-[10px] font-bold text-slate-500 uppercase">Total Sales Revenue</p>
            <p className="text-lg font-black text-slate-900 mt-0.5">{formatCurrency(summary.totalSales)}</p>
          </div>

          <div className="p-3 border border-slate-300 rounded-xl bg-slate-50">
            <p className="text-[10px] font-bold text-slate-500 uppercase">Completed Orders</p>
            <p className="text-lg font-black text-slate-900 mt-0.5">{summary.completedOrders}</p>
          </div>

          <div className="p-3 border border-slate-300 rounded-xl bg-slate-50">
            <p className="text-[10px] font-bold text-slate-500 uppercase">Cancelled Orders</p>
            <p className="text-lg font-black text-rose-600 mt-0.5">{summary.cancelledOrders}</p>
          </div>

          <div className="p-3 border border-slate-300 rounded-xl bg-slate-50">
            <p className="text-[10px] font-bold text-slate-500 uppercase">Avg Order Value</p>
            <p className="text-lg font-black text-slate-900 mt-0.5">{formatCurrency(summary.averageOrderValue)}</p>
          </div>
        </div>

        {/* Audit Statement */}
        <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 mb-6 text-xs text-slate-700 space-y-1">
          <p className="font-bold uppercase tracking-wider text-slate-900 text-[10px]">Report Accounting Note:</p>
          <p>This report includes persisting database completed sales records. Cancelled transactions and unpaid active orders are excluded from revenue calculation.</p>
        </div>

        {/* Printable Footer */}
        <div className="mt-12 pt-4 border-t border-slate-300 flex justify-between text-[10px] text-slate-500">
          <p>SliceMaster POS System v1.0 — Confidential Management Report</p>
          <p>Authorized Admin Signature: _______________________</p>
        </div>
      </div>
    </div>
  );
}
