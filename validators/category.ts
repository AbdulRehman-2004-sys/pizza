import { z } from "zod";

export const categoryItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  basePrice: z.coerce.number().min(0).optional(),
  smallPrice: z.coerce.number().optional(),
  mediumPrice: z.coerce.number().optional(),
  largePrice: z.coerce.number().optional(),
  xlPrice: z.coerce.number().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  description: z.string().optional().nullable(),
  categoryType: z.enum(["STANDARD", "PIZZA"]).default("STANDARD"),
  displayOrder: z.coerce.number().int().min(0, "Display order must be a non-negative integer"),
  isActive: z.boolean().default(true),
  items: z.array(categoryItemSchema).optional(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
