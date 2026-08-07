import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return `Rs. ${Math.round(amount)}`;
}

export function formatDate(date: Date | string | number, formatPattern: string = "MMM dd, yyyy HH:mm"): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return format(d, formatPattern);
}
