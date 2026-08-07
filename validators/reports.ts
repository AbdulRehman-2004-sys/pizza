import { z } from "zod";
import { OrderType, PaymentMethod } from "@prisma/client";

export const reportFilterSchema = z.object({
  shortcut: z.enum(["TODAY", "YESTERDAY", "THIS_WEEK", "THIS_MONTH", "CUSTOM", "ALL"]).default("TODAY"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  orderType: z.nativeEnum(OrderType).optional().or(z.literal("ALL")),
  paymentMethod: z.nativeEnum(PaymentMethod).optional().or(z.literal("ALL")),
  status: z.enum(["COMPLETED", "CANCELLED", "ALL"]).default("COMPLETED"),
});

export const topItemsQuerySchema = z.object({
  shortcut: z.enum(["TODAY", "YESTERDAY", "THIS_WEEK", "THIS_MONTH", "CUSTOM", "ALL"]).default("THIS_MONTH"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  topLimit: z.coerce.number().min(1).max(100).default(10),
  sortBy: z.enum(["quantity", "revenue"]).default("quantity"),
});

export const monthlyQuerySchema = z.object({
  month: z.coerce.number().min(1).max(12).default(() => new Date().getMonth() + 1),
  year: z.coerce.number().min(2020).max(2035).default(() => new Date().getFullYear()),
});

export type ReportFilterParams = z.infer<typeof reportFilterSchema>;
export type TopItemsQueryParams = z.infer<typeof topItemsQuerySchema>;
export type MonthlyQueryParams = z.infer<typeof monthlyQuerySchema>;
