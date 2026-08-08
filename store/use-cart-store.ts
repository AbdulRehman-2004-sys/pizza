import { create } from "zustand";

export interface SelectedTopping {
  id: string;
  name: string;
  price: number;
}

export interface SelectedSize {
  id: string;
  name: string;
  price: number;
}

export interface ItemDiscount {
  type: "PERCENT" | "FIXED";
  value: number;
}

export interface CartItem {
  cartItemId: string; // Hash of productId + sizeId + cheese + toppings + discount
  productId: string;
  name: string;
  image?: string | null;
  basePrice: number;
  size?: SelectedSize | null;
  extraCheese?: boolean;
  cheesePrice?: number;
  toppings?: SelectedTopping[];
  itemNotes?: string;
  itemDiscount?: ItemDiscount | null;
  unitPrice: number;
  quantity: number;
  sentQuantity?: number;
  totalPrice: number;
}

export interface POSCustomer {
  id?: string;
  name: string;
  phone: string;
  address?: string;
}

export interface POSTable {
  id: string;
  tableNumber: number;
  tableName: string;
}

export interface POSDiscount {
  type: "PERCENT" | "FIXED";
  value: number;
}

interface CartState {
  activeOrderId: string | null;
  activeOrderNumber: string | null;
  orderType: "DINE_IN" | "TAKEOUT" | "DELIVERY";
  selectedTable: POSTable | null;
  customer: POSCustomer | null;
  items: CartItem[];
  discount: POSDiscount;
  orderNotes: string;

  // Actions
  setActiveOrder: (orderId: string | null, orderNumber?: string | null) => void;
  setOrderType: (type: "DINE_IN" | "TAKEOUT" | "DELIVERY") => void;
  setSelectedTable: (table: POSTable | null) => void;
  setCustomer: (customer: POSCustomer | null) => void;
  setDiscount: (discount: POSDiscount) => void;
  setOrderNotes: (notes: string) => void;
  addItem: (item: CartItem) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  removeItem: (cartItemId: string) => void;
  markItemsAsSent: () => void;
  clearCart: () => void;
  loadOrderIntoCart: (order: any) => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  activeOrderId: null,
  activeOrderNumber: null,
  orderType: "DINE_IN",
  selectedTable: null,
  customer: null,
  items: [],
  discount: { type: "PERCENT", value: 0 },
  orderNotes: "",

  setActiveOrder: (activeOrderId, activeOrderNumber = null) => set({ activeOrderId, activeOrderNumber }),
  setOrderType: (orderType) => set({ orderType }),
  setSelectedTable: (selectedTable) => set({ selectedTable }),
  setCustomer: (customer) => set({ customer }),
  setDiscount: (discount) => set({ discount }),
  setOrderNotes: (orderNotes) => set({ orderNotes }),

  addItem: (newItem) => {
    const items = get().items;
    const existingIndex = items.findIndex((i) => i.cartItemId === newItem.cartItemId);

    if (existingIndex > -1) {
      const updated = [...items];
      const existing = updated[existingIndex];
      const newQty = existing.quantity + newItem.quantity;
      updated[existingIndex] = {
        ...existing,
        quantity: newQty,
        totalPrice: existing.unitPrice * newQty,
      };
      set({ items: updated });
    } else {
      set({ items: [...items, { ...newItem, sentQuantity: newItem.sentQuantity || 0 }] });
    }
  },

  updateQuantity: (cartItemId, delta) => {
    const items = get().items;
    const updated = items
      .map((item) => {
        if (item.cartItemId === cartItemId) {
          const newQty = item.quantity + delta;
          // Do not allow reducing quantity below sentQuantity if already sent
          const minQty = item.sentQuantity || 0;
          if (newQty < minQty) return null;
          if (newQty <= 0) return null;
          return {
            ...item,
            quantity: newQty,
            totalPrice: item.unitPrice * newQty,
          };
        }
        return item;
      })
      .filter(Boolean) as CartItem[];

    set({ items: updated });
  },

  removeItem: (cartItemId) => {
    const item = get().items.find((i) => i.cartItemId === cartItemId);
    if (item && (item.sentQuantity || 0) > 0) {
      // Do not delete items already sent to kitchen from cart unless authorized, but allow if total cart reset
      return;
    }
    set({ items: get().items.filter((i) => i.cartItemId !== cartItemId) });
  },

  markItemsAsSent: () => {
    const updated = get().items.map((i) => ({
      ...i,
      sentQuantity: i.quantity,
    }));
    set({ items: updated });
  },

  clearCart: () => {
    set({
      activeOrderId: null,
      activeOrderNumber: null,
      items: [],
      selectedTable: null,
      customer: null,
      discount: { type: "PERCENT", value: 0 },
      orderNotes: "",
    });
  },

  loadOrderIntoCart: (order: any) => {
    const cartItems: CartItem[] = (order.items || []).map((item: any) => {
      let toppings: any[] = [];
      if (Array.isArray(item.selectedToppings)) {
        toppings = item.selectedToppings;
      } else if (typeof item.selectedToppings === "string") {
        try {
          toppings = JSON.parse(item.selectedToppings);
        } catch (e) {}
      }

      return {
        cartItemId: item.id || `${item.productId}_${item.sizeId || "nosize"}`,
        productId: item.productId,
        name: item.productName,
        basePrice: item.unitPrice,
        size: item.sizeName ? { id: item.sizeId || "", name: item.sizeName, price: item.unitPrice } : null,
        extraCheese: !!item.extraCheese,
        cheesePrice: item.cheesePrice || 0,
        toppings: toppings,
        itemNotes: item.itemNotes || "",
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        sentQuantity: item.sentQuantity || item.quantity,
        totalPrice: item.totalPrice,
      };
    });

    set({
      activeOrderId: order.id,
      activeOrderNumber: order.orderNumber,
      orderType: order.type || "DINE_IN",
      selectedTable: order.table
        ? { id: order.table.id, tableNumber: order.table.tableNumber, tableName: order.table.tableName || `Table ${order.table.tableNumber}` }
        : order.tableNumber
        ? { id: order.tableId || "", tableNumber: order.tableNumber, tableName: `Table ${order.tableNumber}` }
        : null,
      customer: order.customer
        ? { id: order.customer.id, name: order.customer.name, phone: order.customer.phone || "", address: order.customer.address || "" }
        : null,
      items: cartItems,
      discount: { type: "PERCENT", value: 0 },
      orderNotes: order.customerNotes || "",
    });
  },
}));
