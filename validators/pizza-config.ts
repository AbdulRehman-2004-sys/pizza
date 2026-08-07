import { z } from "zod";

export const pizzaSizeSchema = z.object({
  name: z.string().min(2, "Size name must be at least 2 characters"),
  displayOrder: z.coerce.number().int().min(0, "Display order must be a non-negative integer"),
  isActive: z.boolean().default(true),
});

export type PizzaSizeInput = z.infer<typeof pizzaSizeSchema>;

export const extraToppingSchema = z.object({
  name: z.string().min(2, "Topping name must be at least 2 characters"),
  price: z.coerce.number().min(0, "Topping price must be non-negative"),
  displayOrder: z.coerce.number().int().min(0, "Display order must be a non-negative integer"),
  isAvailable: z.boolean().default(true),
});

export type ExtraToppingInput = z.infer<typeof extraToppingSchema>;

export const extraCheeseSchema = z.object({
  name: z.string().min(2, "Cheese name must be at least 2 characters"),
  extraPrice: z.coerce.number().min(0, "Extra cheese price must be non-negative"),
  isAvailable: z.boolean().default(true),
});

export type ExtraCheeseInput = z.infer<typeof extraCheeseSchema>;

export const sizePriceItemSchema = z.object({
  sizeId: z.string().min(1, "Size ID is required"),
  price: z.coerce.number().min(0, "Price must be non-negative"),
});

export const menuItemCustomizationSchema = z.object({
  isCustomizable: z.boolean().default(false),
  allowSizes: z.boolean().default(false),
  allowExtraCheese: z.boolean().default(false),
  allowExtraToppings: z.boolean().default(false),
  allowNotes: z.boolean().default(true),
  maxNotesLength: z.coerce.number().int().default(200),
  notesPlaceholder: z.string().default("e.g. No onions, extra crispy, cut into 8 slices"),
  prices: z.array(sizePriceItemSchema).optional(),
});

export type MenuItemCustomizationInput = z.infer<typeof menuItemCustomizationSchema>;
