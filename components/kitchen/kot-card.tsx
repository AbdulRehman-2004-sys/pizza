"use client";

import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrderStatus } from "@prisma/client";
import {
  ChefHat,
  Clock,
  CheckCircle2,
  Utensils,
  ShoppingBag,
  Truck,
  Sparkles,
  AlertTriangle,
  Play,
} from "lucide-react";
import { toast } from "sonner";

export interface KOTCardProps {
  kot: {
    id: string;
    kotNumber: string;
    status: OrderStatus;
    createdAt: string;
    startedAt?: string | null;
    readyAt?: string | null;
    completedAt?: string | null;
    order: {
      id: string;
      orderNumber: string;
      type: "DINE_IN" | "TAKEOUT" | "DELIVERY";
      tableNumber?: number | null;
      customerNotes?: string | null;
      customer?: { name: string; phone: string } | null;
      items: Array<{
        id: string;
        productName: string;
        sizeName?: string | null;
        extraCheese: boolean;
        selectedToppings?: any;
        itemNotes?: string | null;
        quantity: number;
      }>;
    };
  };
  onStatusUpdate: () => void;
}

export function KOTCard({ kot, onStatusUpdate }: KOTCardProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  // Live Stopwatch counting every second
  useEffect(() => {
    const updateElapsed = () => {
      const createdTime = new Date(kot.createdAt).getTime();
      const now = new Date().getTime();
      const diffSec = Math.max(0, Math.floor((now - createdTime) / 1000));
      setElapsedSeconds(diffSec);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [kot.createdAt]);

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const timeFormatted = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  // Color Coding for Overdue Timers
  let timerBgClass = "bg-emerald-500 text-white"; // < 10 mins
  if (minutes >= 10 && minutes < 20) {
    timerBgClass = "bg-amber-500 text-white animate-pulse"; // 10-20 mins
  } else if (minutes >= 20) {
    timerBgClass = "bg-rose-600 text-white animate-bounce"; // 20+ mins overdue
  }

  const handleUpdateStatus = async (nextStatus: OrderStatus) => {
    try {
      setIsUpdating(true);
      const res = await fetch(`/api/kitchen/orders/${kot.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error || "Failed to update status");
        return;
      }

      toast.success(`KOT #${kot.kotNumber} updated to ${nextStatus}!`);
      onStatusUpdate();
    } catch (error) {
      console.error("Update KOT status error:", error);
      toast.error("Network error updating status");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className={`rounded-3xl bg-white border-2 shadow-md transition-all flex flex-col justify-between overflow-hidden ${
        kot.status === "PENDING"
          ? "border-amber-400/80 shadow-amber-100"
          : kot.status === "KITCHEN"
          ? "border-pizza-500 shadow-pizza-100"
          : kot.status === "READY"
          ? "border-emerald-500 shadow-emerald-100"
          : "border-slate-200 opacity-75"
      }`}
    >
      <div>
        {/* Card Header Bar */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base tracking-wider text-pizza-400">
              {kot.kotNumber}
            </span>
            <span className="text-xs text-slate-400 font-semibold">({kot.order.orderNumber})</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Order Type Badge */}
            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-white border border-slate-700">
              {kot.order.type === "DINE_IN" && (
                <>
                  <Utensils className="h-3 w-3 text-amber-400" />
                  Table #{kot.order.tableNumber || 1}
                </>
              )}
              {kot.order.type === "TAKEOUT" && (
                <>
                  <ShoppingBag className="h-3 w-3 text-blue-400" />
                  Take Away
                </>
              )}
              {kot.order.type === "DELIVERY" && (
                <>
                  <Truck className="h-3 w-3 text-purple-400" />
                  {kot.order.customer?.name || "Delivery"}
                </>
              )}
            </span>

            {/* Live Stopwatch Prep Timer Badge */}
            <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-extrabold shadow-sm ${timerBgClass}`}>
              <Clock className="h-3 w-3" />
              ⏱ {timeFormatted}
            </span>
          </div>
        </div>

        {/* Order Notes Banner if present */}
        {kot.order.customerNotes && (
          <div className="bg-amber-50 px-4 py-2 border-b border-amber-200 flex items-center gap-2 text-xs font-bold text-amber-900">
            <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
            <span className="line-clamp-1">Order Note: "{kot.order.customerNotes}"</span>
          </div>
        )}

        {/* Itemized Specifications List */}
        <div className="p-4 space-y-3">
          {kot.order.items.map((item) => {
            let toppingsList: any[] = [];
            if (Array.isArray(item.selectedToppings)) {
              toppingsList = item.selectedToppings;
            } else if (typeof item.selectedToppings === "string") {
              try {
                toppingsList = JSON.parse(item.selectedToppings);
              } catch (e) {}
            }

            return (
              <div key={item.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-900 text-white font-extrabold text-xs">
                      {item.quantity}x
                    </span>
                    <span className="text-sm font-black text-slate-900 leading-tight">
                      {item.productName}
                    </span>
                  </div>

                  {item.sizeName && (
                    <span className="inline-block text-[11px] font-extrabold text-pizza-600 bg-pizza-50 border border-pizza-200 px-2 py-0.5 rounded-md">
                      {item.sizeName}
                    </span>
                  )}
                </div>

                {/* Toppings & Cheese Spec Badges */}
                {(item.extraCheese || toppingsList.length > 0 || item.itemNotes) && (
                  <div className="space-y-1 pl-9 pt-1 border-l-2 border-pizza-300">
                    {item.extraCheese && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md mr-1.5">
                        <Sparkles className="h-3 w-3" /> Extra Mozzarella Cheese
                      </span>
                    )}

                    {toppingsList.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {toppingsList.map((t: any, idx: number) => (
                          <span
                            key={idx}
                            className="text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-md"
                          >
                            + {t.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {item.itemNotes && (
                      <p className="text-xs font-bold text-rose-600 italic">
                        Note: "{item.itemNotes}"
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Footer Buttons */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        {kot.status === "PENDING" && (
          <Button
            size="lg"
            onClick={() => handleUpdateStatus("KITCHEN")}
            isLoading={isUpdating}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold shadow-md shadow-amber-500/20 h-12 text-sm"
            leftIcon={<Play className="h-5 w-5" />}
          >
            Start Preparing (KITCHEN)
          </Button>
        )}

        {kot.status === "KITCHEN" && (
          <Button
            size="lg"
            onClick={() => handleUpdateStatus("READY")}
            isLoading={isUpdating}
            className="w-full bg-pizza-500 hover:bg-pizza-600 text-white font-extrabold shadow-md shadow-pizza-500/20 h-12 text-sm"
            leftIcon={<ChefHat className="h-5 w-5" />}
          >
            Mark Order Ready (READY)
          </Button>
        )}

        {kot.status === "READY" && (
          <Button
            size="lg"
            onClick={() => handleUpdateStatus("COMPLETED")}
            isLoading={isUpdating}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-md shadow-emerald-600/20 h-12 text-sm"
            leftIcon={<CheckCircle2 className="h-5 w-5" />}
          >
            Hand Over / Complete (COMPLETED)
          </Button>
        )}

        {kot.status === "COMPLETED" && (
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 py-2.5 rounded-2xl border border-emerald-200">
            <CheckCircle2 className="h-4 w-4" />
            <span>Order Prepared & Handed Over</span>
          </div>
        )}
      </div>
    </div>
  );
}
