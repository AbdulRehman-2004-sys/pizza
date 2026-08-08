"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PlusCircle, ChefHat, UserPlus, FileText, Sparkles } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

export function QuickActions() {
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const actions = [
    {
      title: "New POS Order",
      description: "Open checkout touch panel",
      href: "/pos",
      icon: <PlusCircle className="h-5 w-5 text-white" />,
      bg: "bg-pizza-500 hover:bg-pizza-600 shadow-md shadow-pizza-500/20 text-white",
    },
    {
      title: "Order Management",
      description: "Active orders & history",
      href: "/orders",
      icon: <ChefHat className="h-5 w-5 text-blue-600" />,
      bg: "bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200",
    },
    {
      title: "Add Customer",
      description: "Create loyalty profile",
      onClick: () => setIsCustomerModalOpen(true),
      icon: <UserPlus className="h-5 w-5 text-emerald-600" />,
      bg: "bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200",
    },
    {
      title: "Daily Report",
      description: "Print end of day summary",
      onClick: () => setIsReportModalOpen(true),
      icon: <FileText className="h-5 w-5 text-amber-600" />,
      bg: "bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200",
    },
  ];

  return (
    <>
      <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-pizza-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Quick Actions</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">Fast touch targets</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {actions.map((action, index) =>
            action.href ? (
              <Link
                key={index}
                href={action.href}
                className={`flex items-center gap-3.5 rounded-xl p-3.5 font-semibold transition-all duration-200 active:scale-[0.98] ${action.bg}`}
              >
                <div className="rounded-lg p-2 bg-white/20">{action.icon}</div>
                <div>
                  <p className="text-sm font-bold leading-tight">{action.title}</p>
                  <p className="text-[11px] opacity-80 font-normal">{action.description}</p>
                </div>
              </Link>
            ) : (
              <button
                key={index}
                onClick={action.onClick}
                className={`flex items-center gap-3.5 rounded-xl p-3.5 font-semibold transition-all duration-200 text-left active:scale-[0.98] ${action.bg}`}
              >
                <div className="rounded-lg p-2 bg-white/20">{action.icon}</div>
                <div>
                  <p className="text-sm font-bold leading-tight">{action.title}</p>
                  <p className="text-[11px] opacity-80 font-normal">{action.description}</p>
                </div>
              </button>
            )
          )}
        </div>
      </div>

      {/* Add Customer Modal */}
      <Modal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        title="Quick Customer Registration"
        description="Register a new customer profile for phone orders or loyalty points."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsCustomerModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                toast.success("Customer profile saved successfully!");
                setIsCustomerModalOpen(false);
              }}
            >
              Save Customer
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Customer Name</label>
            <input
              type="text"
              placeholder="e.g. Maria Rossi"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-pizza-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number</label>
            <input
              type="tel"
              placeholder="e.g. +92 300 1234567"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-pizza-500 focus:outline-none"
            />
          </div>
        </div>
      </Modal>

      {/* Daily Report Modal */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Generate Daily Sales Report"
        description="Compile register totals, tax breakdown, and cashier balancing report."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsReportModalOpen(false)}>
              Close
            </Button>
            <Button
              size="sm"
              onClick={() => {
                toast.success("Daily report exported & sent to printer!");
                setIsReportModalOpen(false);
              }}
            >
              Print Report
            </Button>
          </>
        }
      >
        <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-2 text-xs">
          <div className="flex justify-between border-b border-slate-200 pb-1">
            <span className="font-semibold text-slate-600">Register ID:</span>
            <span className="font-bold text-slate-900">POS-TERMINAL-01</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-1">
            <span className="font-semibold text-slate-600">Date:</span>
            <span className="font-bold text-slate-900">{new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-1">
            <span className="font-semibold text-slate-600">Gross Sales:</span>
            <span className="font-bold text-slate-900">{formatCurrency(1854.20)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-slate-600">Total Tax Collected:</span>
            <span className="font-bold text-slate-900">{formatCurrency(148.33)}</span>
          </div>
        </div>
      </Modal>
    </>
  );
}
