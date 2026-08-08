"use client";

import React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Printer, X } from "lucide-react";

export interface ThermalKOTItem {
  id?: string;
  productName: string;
  sizeName?: string | null;
  extraCheese?: boolean;
  selectedToppings?: any;
  itemNotes?: string | null;
  quantity: number;
}

export interface ThermalKOTProps {
  restaurantName?: string;
  kotNumber: string;
  orderNumber: string;
  createdAt?: string | Date;
  orderType: "DINE_IN" | "TAKEOUT" | "DELIVERY";
  tableNumber?: number | null;
  customerName?: string | null;
  customerPhone?: string | null;
  customerNotes?: string | null;
  items: ThermalKOTItem[];
  onClose?: () => void;
}

export function ThermalKOT({
  restaurantName = "SliceMaster Pizzeria",
  kotNumber,
  orderNumber,
  createdAt = new Date(),
  orderType,
  tableNumber,
  customerName,
  customerPhone,
  customerNotes,
  items,
  onClose,
}: ThermalKOTProps) {
  const handlePrint = () => {
    window.print();
  };

  const parsedDate = typeof createdAt === "string" ? new Date(createdAt) : createdAt;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Modal Container */}
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="h-5 w-5 text-pizza-500" />
            <h3 className="font-extrabold text-slate-900 text-sm">Kitchen Ticket ({kotNumber})</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handlePrint} leftIcon={<Printer className="h-4 w-4" />}>
              Print KOT
            </Button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* 80mm Thermal KOT Printable Layout Area */}
        <div className="flex-1 overflow-y-auto p-2 bg-slate-50 rounded-2xl print:bg-white print:p-0 print:overflow-visible">
          <div
            id="kot-print-area"
            className="kot-ticket bg-white p-4 mx-auto border border-dashed border-slate-300 rounded-xl shadow-sm text-slate-900 font-mono text-xs max-w-[80mm] print:max-w-none print:w-full print:border-none print:shadow-none print:p-0"
          >
            {/* Header */}
            <div className="text-center pb-2 border-b-2 border-slate-900 space-y-1">
              <h2 className="font-black text-lg uppercase tracking-wider text-slate-900">{restaurantName}</h2>
              <div className="inline-block bg-slate-900 text-white px-3 py-1 rounded font-extrabold text-sm uppercase">
                *** KITCHEN ORDER TICKET ***
              </div>
              <div className="flex justify-between items-center text-[11px] font-bold pt-1">
                <span>KOT: {kotNumber}</span>
                <span>ORD: {orderNumber}</span>
              </div>
              <div className="text-[10px] text-slate-600 font-sans">
                {format(parsedDate, "dd-MMM-yyyy hh:mm a")}
              </div>
            </div>

            {/* Order Metadata / Context */}
            <div className="py-2 border-b border-slate-300 text-xs font-bold space-y-1 bg-slate-50 p-2 my-2 rounded print:bg-transparent">
              <div className="flex justify-between uppercase">
                <span>Order Type:</span>
                <span className="font-black underline">{orderType.replace("_", " ")}</span>
              </div>
              {orderType === "DINE_IN" && tableNumber && (
                <div className="flex justify-between text-sm font-black text-pizza-600">
                  <span>TABLE:</span>
                  <span className="bg-slate-900 text-white px-2 py-0.5 rounded">T-{tableNumber}</span>
                </div>
              )}
              {customerName && (
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span>{customerName}</span>
                </div>
              )}
              {customerPhone && (
                <div className="flex justify-between">
                  <span>Phone:</span>
                  <span>{customerPhone}</span>
                </div>
              )}
            </div>

            {/* Kitchen Items List */}
            <div className="py-2 space-y-3">
              <div className="border-b border-slate-900 font-extrabold pb-1 uppercase flex justify-between">
                <span>QTY & ITEM</span>
                <span>DETAILS</span>
              </div>

              {items.map((item, idx) => {
                let parsedToppings: any[] = [];
                if (item.selectedToppings) {
                  try {
                    parsedToppings = typeof item.selectedToppings === "string"
                      ? JSON.parse(item.selectedToppings)
                      : item.selectedToppings;
                  } catch {
                    parsedToppings = [];
                  }
                }

                return (
                  <div key={idx} className="border-b border-slate-200 pb-2 space-y-0.5">
                    <div className="flex items-start justify-between font-black text-sm">
                      <span>
                        <span className="text-base font-black px-1.5 py-0.5 bg-slate-900 text-white rounded mr-1">
                          {item.quantity}x
                        </span>{" "}
                        {item.productName}
                      </span>
                      {item.sizeName && (
                        <span className="text-xs uppercase bg-slate-200 px-1 py-0.5 rounded font-bold">
                          {item.sizeName}
                        </span>
                      )}
                    </div>

                    {item.extraCheese && (
                      <p className="text-[11px] font-bold text-amber-800 pl-6">
                        + EXTRA CHEESE
                      </p>
                    )}

                    {parsedToppings.length > 0 && (
                      <p className="text-[10px] text-slate-700 font-medium pl-6">
                        + {parsedToppings.map((t: any) => t.name).join(", ")}
                      </p>
                    )}

                    {item.itemNotes && (
                      <p className="text-[10px] font-bold italic text-rose-700 bg-rose-50 p-1 rounded mt-0.5 pl-2 border-l-2 border-rose-600">
                        Note: "{item.itemNotes}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Special Instructions Header */}
            {customerNotes && (
              <div className="mt-2 pt-2 border-t-2 border-slate-900 bg-amber-50 p-2 rounded">
                <p className="text-[10px] font-extrabold uppercase text-amber-900">SPECIAL INSTRUCTIONS:</p>
                <p className="text-xs font-bold text-slate-900 mt-0.5">"{customerNotes}"</p>
              </div>
            )}

            {/* Thermal Footer */}
            <div className="mt-4 pt-2 border-t border-slate-300 text-center text-[9px] text-slate-500 font-sans">
              - END OF KITCHEN SLIP -
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
