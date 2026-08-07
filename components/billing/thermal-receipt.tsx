"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils";
import { Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ThermalReceiptProps {
  data: {
    settings: {
      restaurantName: string;
      address: string;
      phone: string;
      receiptFooter: string;
    };
    order: {
      orderNumber: string;
      createdAt: string;
      type: string;
      tableNumber?: number | null;
      customerNotes?: string | null;
      subtotal: number;
      taxAmount: number;
      discountAmount: number;
      totalAmount: number;
      cashier: { name: string };
      customer?: { name: string; phone: string; address?: string | null } | null;
      invoice?: {
        invoiceNumber: string;
        createdAt: string;
        payment?: {
          method: string;
          amount: number;
          paidAt: string;
        } | null;
      } | null;
      items: Array<{
        id: string;
        productName: string;
        sizeName?: string | null;
        extraCheese: boolean;
        selectedToppings?: any;
        itemNotes?: string | null;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
      }>;
    };
  };
  onClose: () => void;
}

export function ThermalReceipt({ data, onClose }: ThermalReceiptProps) {
  const { settings, order } = data;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 overflow-y-auto backdrop-blur-sm">
      {/* Controls Container (Hidden during thermal printing) */}
      <div className="absolute top-4 right-4 flex items-center gap-3 print:hidden z-20">
        <Button onClick={handlePrint} size="sm" leftIcon={<Printer className="h-4 w-4" />}>
          Print Receipt (80mm)
        </Button>
        <button
          onClick={onClose}
          className="rounded-full bg-white/20 p-2 text-white hover:bg-white/30 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* 80mm Thermal Receipt Layout Paper */}
      <div
        id="thermal-receipt-paper"
        className="w-[80mm] max-w-[80mm] bg-white p-4 text-black font-mono text-xs shadow-2xl rounded-sm my-auto border border-slate-200 select-none print:shadow-none print:m-0 print:border-none"
      >
        {/* Header */}
        <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-400">
          <h2 className="text-base font-black uppercase tracking-wider">{settings.restaurantName}</h2>
          <p className="text-[10px] leading-tight">{settings.address}</p>
          <p className="text-[10px]">Tel: {settings.phone}</p>
        </div>

        {/* Invoice & Order Info */}
        <div className="py-2.5 space-y-1 text-[11px] border-b border-dashed border-slate-400">
          <div className="flex justify-between font-bold">
            <span>INVOICE #:</span>
            <span>{order.invoice?.invoiceNumber || "INV-TEMP"}</span>
          </div>
          <div className="flex justify-between">
            <span>ORDER #:</span>
            <span>{order.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>DATE/TIME:</span>
            <span>{new Date(order.createdAt).toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" })}</span>
          </div>
          <div className="flex justify-between">
            <span>CASHIER:</span>
            <span>{order.cashier?.name}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>TYPE:</span>
            <span>
              {order.type === "DINE_IN" && `DINE IN (Table #${order.tableNumber || 1})`}
              {order.type === "TAKEOUT" && "TAKE AWAY"}
              {order.type === "DELIVERY" && `DELIVERY (${order.customer?.name || "Customer"})`}
            </span>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="py-3 border-b border-dashed border-slate-400 space-y-2">
          <div className="flex justify-between font-extrabold text-[11px] border-b border-slate-300 pb-1">
            <span className="w-1/2">ITEM</span>
            <span className="w-1/4 text-center">QTY</span>
            <span className="w-1/4 text-right">TOTAL</span>
          </div>

          {order.items.map((item) => {
            let toppingsList: any[] = [];
            if (Array.isArray(item.selectedToppings)) {
              toppingsList = item.selectedToppings;
            } else if (typeof item.selectedToppings === "string") {
              try {
                toppingsList = JSON.parse(item.selectedToppings);
              } catch (e) {}
            }

            return (
              <div key={item.id} className="space-y-0.5 text-[11px]">
                <div className="flex justify-between font-bold">
                  <span className="w-1/2 leading-tight">{item.productName}</span>
                  <span className="w-1/4 text-center">{item.quantity}</span>
                  <span className="w-1/4 text-right">{formatCurrency(item.totalPrice)}</span>
                </div>

                {/* Modifiers */}
                <div className="text-[10px] text-slate-600 pl-2">
                  {item.sizeName && <p>Size: {item.sizeName}</p>}
                  {item.extraCheese && <p>+ Extra Cheese</p>}
                  {toppingsList.length > 0 && <p>+ {toppingsList.map((t) => t.name).join(", ")}</p>}
                  {item.itemNotes && <p>Note: {item.itemNotes}</p>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Financial Summary */}
        <div className="py-2.5 space-y-1 text-[11px] border-b border-dashed border-slate-400">
          <div className="flex justify-between">
            <span>SUBTOTAL:</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between font-semibold">
              <span>DISCOUNT:</span>
              <span>-{formatCurrency(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>TAX (16%):</span>
            <span>{formatCurrency(order.taxAmount)}</span>
          </div>
          <div className="flex justify-between text-sm font-black pt-1 border-t border-slate-300">
            <span>GRAND TOTAL:</span>
            <span>{formatCurrency(order.totalAmount)}</span>
          </div>
          {order.invoice?.payment && (
            <div className="flex justify-between font-bold text-slate-800 pt-1">
              <span>PAID VIA:</span>
              <span>{order.invoice.payment.method}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center pt-3 space-y-1 text-[10px]">
          <p className="font-bold">{settings.receiptFooter}</p>
          <p className="text-slate-400">*** Software by SliceMaster POS ***</p>
        </div>
      </div>
    </div>
  );
}
