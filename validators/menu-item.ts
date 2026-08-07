import { z } from "zod";

export const menuItemSchema = z.object({
  categoryId: z.string().min(1, "Please select a category"),
  name: z.string().min(2, "Menu item name must be at least 2 characters"),
  description: z.string().optional().nullable(),
  basePrice: z.coerce.number().min(0, "Base price must be greater than or equal to 0"),
  image: z.string().optional().nullable(),
  isAvailable: z.boolean().default(true),
});

export type MenuItemInput = z.infer<typeof menuItemSchema>;
