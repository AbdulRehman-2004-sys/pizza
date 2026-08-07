"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaymentMethod } from "@prisma/client";
import { formatCurrency } from "@/lib/utils";
import {
  Banknote,
  CreditCard,
  Smartphone,
  CheckCircle2,
  DollarSign,
  Calculator,
} from "lucide-react";
import { toast } from "sonner";

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (invoiceData: any) => void;
  order: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    type: string;
    tableNumber?: number | null;
    customer?: { name: string; phone: string } | null;
  } | null;
}

export function PaymentModal({ isOpen, onClose, onSuccess, order }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!order) return null;

  const totalAmount = order.totalAmount;
  const changeGiven = paymentMethod === "CASH" ? Math.max(0, cashTendered - totalAmount) : 0;

  const handleConfirmPayment = async () => {
    if (paymentMethod === "CASH" && cashTendered > 0 && cashTendered < totalAmount) {
      toast.error(`Insufficient cash tendered. Total is ${formatCurrency(totalAmount)}`);
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        orderId: order.id,
        paymentMethod,
        amountPaid: paymentMethod === "CASH" && cashTendered > 0 ? cashTendered : totalAmount,
        changeGiven,
      };

      const res = await fetch("/api/billing/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error || "Failed to process payment");
        return;
      }

      toast.success(`🎉 Payment recorded via ${paymentMethod}! Order #${order.orderNumber} completed.`);
      onSuccess(json.data);
      onClose();
    } catch (error) {
      console.error("Payment submission error:", error);
      toast.error("Network error processing payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Process Payment: Order #${order.orderNumber}`}
      description="Select payment method and confirm billing transaction"
      size="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            size="lg"
            onClick={handleConfirmPayment}
            isLoading={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700 font-black text-sm"
            leftIcon={<CheckCircle2 className="h-5 w-5" />}
          >
            Confirm Payment ({formatCurrency(totalAmount)})
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Grand Total Summary Box */}
        <div className="rounded-3xl bg-slate-900 p-5 text-white flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs uppercase font-bold text-slate-400">Total Amount Due</p>
            <p className="text-3xl font-black text-pizza-400 mt-0.5">{formatCurrency(totalAmount)}</p>
          </div>
          <div className="text-right text-xs text-slate-300 space-y-0.5">
            <p>Subtotal: {formatCurrency(order.subtotal)}</p>
            {order.discountAmount > 0 && <p className="text-emerald-400">Discount: -{formatCurrency(order.discountAmount)}</p>}
            <p>Tax: {formatCurrency(order.taxAmount)}</p>
          </div>
        </div>

        {/* Payment Method Selector Grid */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Select Payment Method
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* CASH */}
            <button
              type="button"
              onClick={() => setPaymentMethod("CASH")}
              className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${
                paymentMethod === "CASH"
                  ? "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-md ring-2 ring-emerald-500/20 font-bold"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              <Banknote className="h-6 w-6 text-emerald-600" />
              <span className="text-xs">Cash</span>
            </button>

            {/* CARD */}
            <button
              type="button"
              onClick={() => setPaymentMethod("CARD")}
              className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${
                paymentMethod === "CARD"
                  ? "border-blue-500 bg-blue-50 text-blue-900 shadow-md ring-2 ring-blue-500/20 font-bold"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              <CreditCard className="h-6 w-6 text-blue-600" />
              <span className="text-xs">Card</span>
            </button>

            {/* JAZZCASH */}
            <button
              type="button"
              onClick={() => setPaymentMethod("JAZZCASH")}
              className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${
                paymentMethod === "JAZZCASH"
                  ? "border-rose-500 bg-rose-50 text-rose-900 shadow-md ring-2 ring-rose-500/20 font-bold"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              <Smartphone className="h-6 w-6 text-rose-600" />
              <span className="text-xs">JazzCash</span>
            </button>

            {/* EASYPAISA */}
            <button
              type="button"
              onClick={() => setPaymentMethod("EASYPAISA")}
              className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${
                paymentMethod === "EASYPAISA"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-950 shadow-md ring-2 ring-emerald-600/20 font-bold"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              <Smartphone className="h-6 w-6 text-emerald-600" />
              <span className="text-xs">Easypaisa</span>
            </button>
          </div>
        </div>

        {/* Cash Tendered Calculator (Cash Mode Only) */}
        {paymentMethod === "CASH" && (
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                <Calculator className="h-4 w-4 text-emerald-600" />
                Cash Change Calculator
              </span>
              <span className="text-xs font-bold text-emerald-700">
                Change Due: {formatCurrency(changeGiven)}
              </span>
            </div>

            <Input
              type="number"
              placeholder={`Enter cash received (e.g. ${totalAmount + 500})...`}
              value={cashTendered || ""}
              onChange={(e) => setCashTendered(Number(e.target.value))}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
