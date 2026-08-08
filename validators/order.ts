import { z } from "zod";
import { OrderStatus, OrderType } from "@prisma/client";

export const orderQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  type: z.nativeEnum(OrderType).optional().or(z.literal("ALL")),
  status: z.nativeEnum(OrderStatus).optional().or(z.literal("ALL")),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortBy: z.enum(["createdAt", "totalAmount", "orderNumber", "status"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  activeOnly: z.coerce.boolean().optional(),
  completedOnly: z.coerce.boolean().optional(),
});

export const cancelOrderSchema = z.object({
  orderId: z.string().uuid("Invalid order ID"),
  reason: z.string().min(3, "Cancellation reason must be at least 3 characters").max(500, "Reason too long"),
});

export type OrderQueryParams = z.infer<typeof orderQuerySchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;

export const posCustomerSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  phone: z.string().min(1, "Customer phone number is required"),
  address: z.string().optional(),
});

export const orderItemSchema = z.object({
  productId: z.string().optional(),
  productName: z.string(),
  sizeId: z.string().optional(),
  sizeName: z.string().optional(),
  extraCheese: z.boolean().default(false),
  cheesePrice: z.number().default(0),
  selectedToppings: z.any().optional(),
  itemNotes: z.string().optional(),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
  totalPrice: z.number().min(0),
});

export const createOrderSchema = z.object({
  orderId: z.string().optional().nullable(),
  type: z.nativeEnum(OrderType),
  tableId: z.string().optional().nullable(),
  tableNumber: z.number().optional().nullable(),
  customerId: z.string().optional().nullable(),
  customerName: z.string().optional().nullable(),
  customerPhone: z.string().optional().nullable(),
  customerAddress: z.string().optional().nullable(),
  customer: z
    .object({
      name: z.string(),
      phone: z.string(),
      address: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
  subtotal: z.number().optional(),
  taxAmount: z.number().optional(),
  discountAmount: z.number().optional().default(0),
  discount: z
    .object({
      type: z.enum(["PERCENT", "FIXED"]),
      value: z.number(),
    })
    .optional()
    .nullable(),
  totalAmount: z.number().optional(),
  customerNotes: z.string().optional().nullable(),
  items: z.array(orderItemSchema).min(1, "Cart must contain at least one item"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

