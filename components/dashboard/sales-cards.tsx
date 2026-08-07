import React from "react";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, ShoppingBag, ChefHat, CheckCircle2, TrendingUp } from "lucide-react";

export interface SalesCardsProps {
  todaySales: number;
  todaySalesChange: string;
  todayOrdersCount: number;
  pendingKitchenCount: number;
  completedOrdersCount: number;
}

export function SalesCards({
  todaySales,
  todaySalesChange,
  todayOrdersCount,
  pendingKitchenCount,
  completedOrdersCount,
}: SalesCardsProps) {
  const cards = [
    {
      title: "Today's Sales",
      value: formatCurrency(todaySales),
      badge: todaySalesChange,
      badgeType: "positive",
      description: "vs. yesterday",
      icon: <DollarSign className="h-6 w-6 text-pizza-500" />,
      bgColor: "bg-pizza-50",
      borderColor: "border-pizza-100",
    },
    {
      title: "Today's Orders",
      value: todayOrdersCount,
      description: "Total tickets processed",
      icon: <ShoppingBag className="h-6 w-6 text-blue-600" />,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
    },
    {
      title: "Pending Kitchen Orders",
      value: pendingKitchenCount,
      description: "Active in queue",
      icon: <ChefHat className="h-6 w-6 text-amber-600" />,
      bgColor: "bg-amber-50",
      borderColor: "border-amber-100",
    },
    {
      title: "Completed Orders",
      value: completedOrdersCount,
      description: "Fulfilled & served",
      icon: <CheckCircle2 className="h-6 w-6 text-emerald-600" />,
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className="relative overflow-hidden rounded-2xl bg-white p-5 border border-slate-200/80 shadow-soft transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{card.title}</span>
            <div className={`rounded-xl p-2.5 ${card.bgColor} ${card.borderColor} border`}>{card.icon}</div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{card.value}</span>
            {card.badge && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                <TrendingUp className="h-3 w-3" />
                {card.badge}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500 font-medium">{card.description}</p>
        </div>
      ))}
    </div>
  );
}
