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
  orderType: "DINE_IN" | "TAKEOUT" | "DELIVERY";
  selectedTable: POSTable | null;
  customer: POSCustomer | null;
  items: CartItem[];
  discount: POSDiscount;
  orderNotes: string;

  // Actions
  setOrderType: (type: "DINE_IN" | "TAKEOUT" | "DELIVERY") => void;
  setSelectedTable: (table: POSTable | null) => void;
  setCustomer: (customer: POSCustomer | null) => void;
  setDiscount: (discount: POSDiscount) => void;
  setOrderNotes: (notes: string) => void;
  addItem: (item: CartItem) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  removeItem: (cartItemId: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  orderType: "DINE_IN",
  selectedTable: null,
  customer: null,
  items: [],
  discount: { type: "PERCENT", value: 0 },
  orderNotes: "",

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
      set({ items: [...items, newItem] });
    }
  },

  updateQuantity: (cartItemId, delta) => {
    const items = get().items;
    const updated = items
      .map((item) => {
        if (item.cartItemId === cartItemId) {
          const newQty = item.quantity + delta;
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
    set({ items: get().items.filter((i) => i.cartItemId !== cartItemId) });
  },

  clearCart: () => {
    set({
      items: [],
      selectedTable: null,
      customer: null,
      discount: { type: "PERCENT", value: 0 },
      orderNotes: "",
    });
  },
}));
