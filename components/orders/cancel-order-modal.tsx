"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { AlertTriangle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  orderNumber: string;
  isPaid?: boolean;
}

export function CancelOrderModal({
  isOpen,
  onClose,
  onConfirm,
  orderNumber,
  isPaid = false,
}: CancelOrderModalProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("Please enter a reason for cancelling this order.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onConfirm(reason.trim());
      setReason("");
      onClose();
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Cancel Order #${orderNumber}`}
      description="This action will mark the order as CANCELLED and update kitchen records."
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Back
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
            leftIcon={<XCircle className="h-4 w-4" />}
          >
            Confirm Cancellation
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {isPaid && (
          <div className="rounded-2xl bg-amber-50 p-3.5 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Notice: Order Has Recorded Payment</p>
              <p className="text-amber-800 text-[11px] mt-0.5">
                This order has already been paid. Payment audit records will remain stored for financial compliance.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Cancellation Reason <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Customer requested cancellation, wrong items entered, kitchen delay..."
            className="w-full rounded-2xl border border-slate-200 p-3 text-xs text-slate-900 focus:border-pizza-500 focus:outline-none focus:ring-2 focus:ring-pizza-500/20"
          />
        </div>
      </form>
    </Modal>
  );
}
