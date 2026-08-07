import React from "react";
import { OrderStatus } from "@prisma/client";
import { Clock, ChefHat, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface OrderStatusBadgeProps {
  status: OrderStatus | string;
  size?: "sm" | "md" | "lg";
}

export function OrderStatusBadge({ status, size = "md" }: OrderStatusBadgeProps) {
  let badgeStyle = "bg-slate-100 text-slate-700 border-slate-200";
  let label = status;
  let Icon = AlertCircle;

  switch (status) {
    case "PENDING":
      badgeStyle = "bg-amber-50 text-amber-800 border-amber-200/80";
      label = "Pending";
      Icon = Clock;
      break;
    case "KITCHEN":
      badgeStyle = "bg-blue-50 text-blue-800 border-blue-200/80 animate-pulse";
      label = "Preparing (Kitchen)";
      Icon = ChefHat;
      break;
    case "READY":
      badgeStyle = "bg-emerald-50 text-emerald-800 border-emerald-300";
      label = "Ready";
      Icon = CheckCircle2;
      break;
    case "COMPLETED":
      badgeStyle = "bg-emerald-600 text-white border-emerald-600 shadow-xs";
      label = "Completed";
      Icon = CheckCircle2;
      break;
    case "CANCELLED":
      badgeStyle = "bg-rose-50 text-rose-800 border-rose-200/80";
      label = "Cancelled";
      Icon = XCircle;
      break;
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3 py-1.5 text-xs font-extrabold gap-2",
  }[size];

  return (
    <span
      className={`inline-flex items-center font-bold rounded-xl border transition-all ${sizeClasses} ${badgeStyle}`}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      <span>{label}</span>
    </span>
  );
}
