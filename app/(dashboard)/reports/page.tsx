"use client";

import React, { useEffect, useState, useCallback } from "react";
import { ReportFiltersBar } from "@/components/reports/report-filters-bar";
import { DailySalesView } from "@/components/reports/daily-sales-view";
import { MonthlySalesView } from "@/components/reports/monthly-sales-view";
import { TopItemsView } from "@/components/reports/top-items-view";
import { PaymentMethodView } from "@/components/reports/payment-method-view";
import { PrintableReportPDF } from "@/components/reports/printable-report-pdf";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Award,
  CreditCard,
  Printer,
  Download,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export default function ReportsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "OVERVIEW" | "DAILY" | "MONTHLY" | "TOP_ITEMS" | "PAYMENTS"
  >("OVERVIEW");

  // Filters State
  const [shortcut, setShortcut] = useState("TODAY");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [orderType, setOrderType] = useState("ALL");
  const [paymentMethod, setPaymentMethod] = useState("ALL");

  // Dashboard Overview Summary Data
  const [summaryData, setSummaryData] = useState<any | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);

  // PDF Export Modal State
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const fetchSummary = useCallback(async () => {
    try {
      setIsLoadingSummary(true);
      const params = new URLSearchParams();
      params.set("shortcut", shortcut);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      if (orderType !== "ALL") params.set("orderType", orderType);
      if (paymentMethod !== "ALL") params.set("paymentMethod", paymentMethod);

      const res = await fetch(`/api/reports/dashboard?${params.toString()}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setSummaryData(json.data);
      } else {
        toast.error(json.error || "Failed to load reports summary");
      }
    } catch (error) {
      console.error("Fetch reports summary error:", error);
      toast.error("Network error loading report summary");
    } finally {
      setIsLoadingSummary(false);
    }
  }, [shortcut, startDate, endDate, orderType, paymentMethod]);

  useEffect(() => {
    if (user?.role === "ADMIN") {
      fetchSummary();
    }
  }, [fetchSummary, user]);

  const handleResetFilters = () => {
    setShortcut("TODAY");
    setStartDate("");
    setEndDate("");
    setOrderType("ALL");
    setPaymentMethod("ALL");
  };

  const handleDownloadCSV = () => {
    const type = activeTab === "PAYMENTS" ? "payments" : "orders";
    window.open(`/api/reports/export/csv?type=${type}`, "_blank");
  };

  // RBAC Access Control Check
  if (user && user.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center space-y-3">
        <div className="rounded-full bg-rose-50 p-4 text-rose-600">
          <XCircle className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
        <p className="text-xs text-slate-500 max-w-md">
          Financial reporting and business analytics are restricted to Admin accounts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-pizza-50 p-3 text-pizza-600">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Reports & Business Analytics</h1>
            <p className="text-xs text-slate-500">
              Audit revenue, sales trends, top-selling pizzas, and payment method reconciliations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPdfModalOpen(true)}
            className="text-slate-700 border-slate-200 hover:bg-slate-50 font-bold"
            leftIcon={<Printer className="h-4 w-4 text-pizza-500" />}
          >
            Export PDF Report
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadCSV}
            className="text-emerald-700 border-emerald-200 hover:bg-emerald-50 font-bold"
            leftIcon={<Download className="h-4 w-4 text-emerald-600" />}
          >
            Export Excel / CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchSummary}
            isLoading={isLoadingSummary}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: "OVERVIEW", label: "Overview Dashboard", icon: BarChart3 },
          { id: "DAILY", label: "Daily Sales", icon: Clock },
          { id: "MONTHLY", label: "Monthly Sales", icon: TrendingUp },
          { id: "TOP_ITEMS", label: "Top Selling Items", icon: Award },
          { id: "PAYMENTS", label: "Payment Methods", icon: CreditCard },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-pizza-400" : "text-slate-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter Control Bar */}
      <ReportFiltersBar
        shortcut={shortcut}
        onShortcutChange={setShortcut}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        orderType={orderType}
        onOrderTypeChange={setOrderType}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
        onReset={handleResetFilters}
      />

      {/* Tab View Switcher */}
      {activeTab === "OVERVIEW" && (
        <div className="space-y-6">
          {isLoadingSummary ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-3xl" />
              ))}
            </div>
          ) : summaryData ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Total Sales */}
              <div className="col-span-2 sm:col-span-2 lg:col-span-2 rounded-3xl bg-slate-900 p-5 text-white shadow-lg space-y-1">
                <p className="text-xs font-bold uppercase text-slate-400">Total Net Revenue</p>
                <p className="text-3xl font-black text-pizza-400">{formatCurrency(summaryData.totalSales)}</p>
                <p className="text-[10px] text-slate-400 font-semibold">Completed Orders Revenue</p>
              </div>

              {/* Total Orders */}
              <div className="rounded-3xl bg-white p-4 border border-slate-200 shadow-soft space-y-1">
                <p className="text-xs font-bold uppercase text-slate-500">Total Orders</p>
                <p className="text-2xl font-black text-slate-900">{summaryData.totalOrders}</p>
                <p className="text-[10px] text-slate-400">All registered orders</p>
              </div>

              {/* Completed Orders */}
              <div className="rounded-3xl bg-emerald-50 p-4 border border-emerald-200 text-emerald-950 space-y-1">
                <p className="text-xs font-bold uppercase text-emerald-800">Completed Orders</p>
                <p className="text-2xl font-black text-emerald-900">{summaryData.completedOrders}</p>
                <p className="text-[10px] text-emerald-700 font-bold">100% Paid & Delivered</p>
              </div>

              {/* Cancelled Orders */}
              <div className="rounded-3xl bg-rose-50 p-4 border border-rose-200 text-rose-950 space-y-1">
                <p className="text-xs font-bold uppercase text-rose-800">Cancelled Orders</p>
                <p className="text-2xl font-black text-rose-900">{summaryData.cancelledOrders}</p>
                <p className="text-[10px] text-rose-700 font-bold">Excluded from revenue</p>
              </div>

              {/* Average Order Value */}
              <div className="rounded-3xl bg-white p-4 border border-slate-200 shadow-soft space-y-1">
                <p className="text-xs font-bold uppercase text-slate-500">Average Order Value</p>
                <p className="text-xl font-black text-slate-900">{formatCurrency(summaryData.averageOrderValue)}</p>
                <p className="text-[10px] text-slate-400">Per ticket AOV</p>
              </div>
            </div>
          ) : null}

          {/* Render Daily Sales View below Overview */}
          <DailySalesView shortcut={shortcut} startDate={startDate} endDate={endDate} />
        </div>
      )}

      {activeTab === "DAILY" && (
        <DailySalesView shortcut={shortcut} startDate={startDate} endDate={endDate} />
      )}

      {activeTab === "MONTHLY" && <MonthlySalesView />}

      {activeTab === "TOP_ITEMS" && (
        <TopItemsView shortcut={shortcut} startDate={startDate} endDate={endDate} />
      )}

      {activeTab === "PAYMENTS" && (
        <PaymentMethodView shortcut={shortcut} startDate={startDate} endDate={endDate} />
      )}

      {/* PDF Export Modal */}
      {isPdfModalOpen && summaryData && (
        <PrintableReportPDF
          title={`Reports Summary - ${activeTab}`}
          shortcut={shortcut}
          startDate={startDate}
          endDate={endDate}
          summary={summaryData}
          onClose={() => setIsPdfModalOpen(false)}
        />
      )}
    </div>
  );
}
