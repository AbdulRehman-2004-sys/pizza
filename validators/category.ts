import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  description: z.string().optional().nullable(),
  displayOrder: z.coerce.number().int().min(0, "Display order must be a non-negative integer"),
  isActive: z.boolean().default(true),
});

export type CategoryInput = z.infer<typeof categorySchema>;
