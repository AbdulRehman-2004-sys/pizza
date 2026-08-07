import { z } from "zod";

export const settingsSchema = z.object({
  restaurantName: z.string().min(2, "Restaurant name must be at least 2 characters"),
  logoUrl: z.string().nullable().optional(),
  address: z.string().min(5, "Address must be at least 5 characters"),
  phone: z.string().min(5, "Phone number must be at least 5 characters"),
  receiptFooter: z.string().min(3, "Receipt footer message is required"),
  currency: z.string().default("PKR"),
  timezone: z.string().default("Asia/Karachi"),
  taxPercentage: z.coerce.number().min(0, "Tax percentage cannot be negative").max(100, "Tax percentage cannot exceed 100%"),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
