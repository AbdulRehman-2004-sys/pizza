import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";

export function formatDateTime(date: Date | string | number, pattern: string = "MMM dd, yyyy HH:mm"): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return format(d, pattern);
}

export function formatRelativeTime(date: Date | string | number): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function getFriendlyDateLabel(date: Date | string | number): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  if (isToday(d)) return `Today at ${format(d, "HH:mm")}`;
  if (isYesterday(d)) return `Yesterday at ${format(d, "HH:mm")}`;
  return format(d, "MMM dd, yyyy HH:mm");
}
