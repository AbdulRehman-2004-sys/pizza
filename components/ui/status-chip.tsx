import React from "react";
import { OrderStatusType } from "@/types/dashboard";
import { Badge } from "./badge";
import { Clock, ChefHat, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export interface StatusChipProps {
  status: OrderStatusType;
  showIcon?: boolean;
}

export function StatusChip({ status, showIcon = true }: StatusChipProps) {
  const configs: Record<
    OrderStatusType,
    { label: string; variant: "warning" | "info" | "success" | "default" | "danger"; icon: React.ReactNode }
  > = {
    PENDING: {
      label: "Pending",
      variant: "warning",
      icon: <Clock className="h-3 w-3 mr-1" />,
    },
    KITCHEN: {
      label: "In Kitchen",
      variant: "info",
      icon: <ChefHat className="h-3 w-3 mr-1" />,
    },
    READY: {
      label: "Ready for Pickup",
      variant: "success",
      icon: <CheckCircle2 className="h-3 w-3 mr-1" />,
    },
    COMPLETED: {
      label: "Completed",
      variant: "default",
      icon: <CheckCircle2 className="h-3 w-3 mr-1 text-slate-500" />,
    },
    CANCELLED: {
      label: "Cancelled",
      variant: "danger",
      icon: <XCircle className="h-3 w-3 mr-1" />,
    },
  };

  const config = configs[status] || {
    label: status,
    variant: "default",
    icon: <AlertCircle className="h-3 w-3 mr-1" />,
  };

  return (
    <Badge variant={config.variant}>
      {showIcon && config.icon}
      <span>{config.label}</span>
    </Badge>
  );
}
