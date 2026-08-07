import { z } from "zod";
import { PaymentMethod } from "@prisma/client";

export const processPaymentSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  paymentMethod: z.nativeEnum(PaymentMethod),
  amountPaid: z.coerce.number().min(0, "Amount paid must be non-negative"),
  changeGiven: z.coerce.number().min(0).optional(),
});

export type ProcessPaymentInput = z.infer<typeof processPaymentSchema>;
