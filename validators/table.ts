import { z } from "zod";

export const tableSchema = z.object({
  tableNumber: z.coerce.number().int().min(1, "Table number must be at least 1"),
  tableName: z.string().min(2, "Table name must be at least 2 characters"),
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1 seat"),
  status: z.enum(["AVAILABLE", "OCCUPIED", "RESERVED"]).default("AVAILABLE"),
  notes: z.string().optional().nullable(),
});

export type TableInput = z.infer<typeof tableSchema>;
