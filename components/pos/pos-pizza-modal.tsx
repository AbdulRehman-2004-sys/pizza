"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/lib/utils";
import { useCartStore, CartItem, SelectedSize, SelectedTopping, ItemDiscount } from "@/store/use-cart-store";
import { Pizza, Sparkles, Plus, Minus, Tag, Percent, Loader2 } from "lucide-react";
import { toast } from "sonner";

export interface POSPizzaModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    description?: string | null;
    basePrice: number;
    image?: string | null;
    allowSizes: boolean;
    allowExtraCheese: boolean;
    allowExtraToppings: boolean;
    allowNotes: boolean;
    notesPlaceholder?: string;
  } | null;
}

export function POSPizzaModal({ isOpen, onClose, product }: POSPizzaModalProps) {
  const addItem = useCartStore((state) => state.addItem);

  const [sizes, setSizes] = useState<SelectedSize[]>([]);
  const [toppings, setToppings] = useState<SelectedTopping[]>([]);
  const [cheeseConfig, setCheeseConfig] = useState<{ name: string; price: number; isAvailable: boolean }>({
    name: "Extra Cheese",
    price: 250,
    isAvailable: true,
  });

  const [selectedSize, setSelectedSize] = useState<SelectedSize | null>(null);
  const [extraCheese, setExtraCheese] = useState(false);
  const [selectedToppings, setSelectedToppings] = useState<SelectedTopping[]>([]);
  const [itemNotes, setItemNotes] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Item Level Discount State
  const [discountType, setDiscountType] = useState<"PERCENT" | "FIXED">("PERCENT");
  const [discountValue, setDiscountValue] = useState<number>(0);

  useEffect(() => {
    if (!product || !isOpen) return;

    const loadCustomizationOptions = async () => {
      try {
        setIsLoading(true);
        setSelectedToppings([]);
        setExtraCheese(false);
        setItemNotes("");
        setQuantity(1);
        setDiscountValue(0);

        const [itemRes, toppingsRes, cheeseRes] = await Promise.all([
          fetch(`/api/menu-items/${product.id}/customization`),
          fetch("/api/pizza-config/toppings"),
          fetch("/api/pizza-config/cheese"),
        ]);

        const [itemJson, toppingsJson, cheeseJson] = await Promise.all([
          itemRes.json(),
          toppingsRes.json(),
          cheeseRes.json(),
        ]);

        if (cheeseRes.ok && cheeseJson.success) {
          setCheeseConfig({
            name: cheeseJson.data.name || "Extra Cheese",
            price: cheeseJson.data.extraPrice || 250,
            isAvailable: cheeseJson.data.isAvailable ?? true,
          });
        }

        if (toppingsRes.ok && toppingsJson.success) {
          const availableToppings = toppingsJson.data
            .filter((t: any) => t.isAvailable)
            .map((t: any) => ({
              id: t.id,
              name: t.name,
              price: t.price,
            }));
          setToppings(availableToppings);
        }

        if (itemRes.ok && itemJson.success && itemJson.data) {
          const itemPrices = itemJson.data.itemPrices || [];

          // Deduplicate size entries to prevent duplicate Small/Medium/Large/XL buttons
          const sizeMap = new Map<string, SelectedSize>();
          const orderRank: Record<string, number> = {
            small: 1,
            medium: 2,
            large: 3,
            xl: 4,
          };

          for (const ip of itemPrices) {
            if (!ip.size || !ip.size.isActive) continue;
            const rawName = ip.size.name || "";
            let cleanName = rawName.split("(")[0].trim();
            const lower = cleanName.toLowerCase();

            if (lower.includes("small")) cleanName = "Small";
            else if (lower.includes("medium")) cleanName = "Medium";
            else if (lower.includes("large") && !lower.includes("xl")) cleanName = "Large";
            else if (lower.includes("xl") || lower.includes("extra large") || lower.includes("family")) cleanName = "XL";

            if (!sizeMap.has(cleanName)) {
              sizeMap.set(cleanName, {
                id: ip.size.id,
                name: cleanName,
                price: ip.price,
              });
            }
          }

          const activeSizes = Array.from(sizeMap.values()).sort((a, b) => {
            const rankA = orderRank[a.name.toLowerCase()] || 99;
            const rankB = orderRank[b.name.toLowerCase()] || 99;
            return rankA - rankB;
          });

          setSizes(activeSizes);
          if (activeSizes.length > 0) {
            setSelectedSize(activeSizes[0]);
          } else {
            setSelectedSize(null);
          }
        }
      } catch (error) {
        console.error("Failed to load POS customization options:", error);
        toast.error("Failed to load size and topping choices");
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomizationOptions();
  }, [product, isOpen]);

  if (!product) return null;

  // Calculate Prices
  const baseSizePrice = selectedSize ? selectedSize.price : product.basePrice;
  const cheeseAddition = extraCheese ? cheeseConfig.price : 0;
  const toppingsAddition = selectedToppings.reduce((sum, t) => sum + t.price, 0);
  const grossUnitPrice = baseSizePrice + cheeseAddition + toppingsAddition;

  // Calculate Item Discount Deduction
  let itemDiscountDeduction = 0;
  if (discountValue > 0) {
    if (discountType === "PERCENT") {
      itemDiscountDeduction = (grossUnitPrice * discountValue) / 100;
    } else {
      itemDiscountDeduction = discountValue;
    }
  }
  itemDiscountDeduction = Math.min(itemDiscountDeduction, grossUnitPrice);
  const finalUnitPrice = Math.max(0, grossUnitPrice - itemDiscountDeduction);
  const totalPrice = finalUnitPrice * quantity;

  const toggleTopping = (topping: SelectedTopping) => {
    setSelectedToppings((prev) => {
      const exists = prev.some((t) => t.id === topping.id);
      if (exists) {
        return prev.filter((t) => t.id !== topping.id);
      } else {
        return [...prev, topping];
      }
    });
  };

  const handleAddToCart = () => {
    const toppingIds = selectedToppings.map((t) => t.id).sort().join("-");
    const cartItemId = `${product.id}_${selectedSize?.id || "nosize"}_${extraCheese ? "cheese" : "nocheese"}_${toppingIds}_${discountType}_${discountValue}_${itemNotes.trim()}`;

    const itemDiscountObj: ItemDiscount | null =
      discountValue > 0 ? { type: discountType, value: discountValue } : null;

    const cartItem: CartItem = {
      cartItemId,
      productId: product.id,
      name: product.name,
      image: product.image,
      basePrice: product.basePrice,
      size: selectedSize,
      extraCheese,
      cheesePrice: cheeseAddition,
      toppings: selectedToppings,
      itemNotes: itemNotes.trim() || undefined,
      itemDiscount: itemDiscountObj,
      unitPrice: finalUnitPrice,
      quantity,
      totalPrice,
    };

    addItem(cartItem);
    toast.success(`Added ${quantity}x ${product.name} to cart!`);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Customize: ${product.name}`}
      description="Select size, extra cheese, toppings, item discount, and notes"
      size="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          {/* Quantity Stepper */}
          <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="h-8 w-8 rounded-xl bg-white flex items-center justify-center font-bold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="font-extrabold text-sm text-slate-900 w-6 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="h-8 w-8 rounded-xl bg-white flex items-center justify-center font-bold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-slate-400">Total Price</p>
              <div className="flex items-center gap-1.5">
                {discountValue > 0 && (
                  <span className="text-xs font-bold text-slate-400 line-through">
                    {formatCurrency(grossUnitPrice * quantity)}
                  </span>
                )}
                <p className="text-lg font-black text-pizza-600">{formatCurrency(totalPrice)}</p>
              </div>
            </div>
            <Button size="lg" onClick={handleAddToCart} leftIcon={<Pizza className="h-5 w-5" />}>
              Add to Cart
            </Button>
          </div>
        </div>
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-pizza-500" />
        </div>
      ) : (
        <div className="space-y-5">
          {/* 1. Size Selection Grid */}
          {product.allowSizes && sizes.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                1. Select Pizza Size
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {sizes.map((sz) => {
                  const isSelected = selectedSize?.id === sz.id;
                  return (
                    <button
                      key={sz.id}
                      onClick={() => setSelectedSize(sz)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? "border-pizza-500 bg-pizza-50 text-pizza-900 shadow-sm ring-2 ring-pizza-500/20"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <p className="text-xs font-bold truncate">{sz.name}</p>
                      <p className="text-xs font-extrabold text-pizza-600 mt-1">{formatCurrency(sz.price)}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Extra Cheese Toggle */}
          {cheeseConfig.isAvailable && (
            <div className="rounded-2xl bg-amber-50/60 p-3.5 border border-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-5 w-5 text-amber-600" />
                <div>
                  <h5 className="text-xs font-bold text-slate-900">{cheeseConfig.name}</h5>
                  <p className="text-[11px] text-slate-500">Melted mozzarella topping</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-extrabold text-amber-700">+{formatCurrency(cheeseConfig.price)}</span>
                <Switch checked={extraCheese} onChange={(e) => setExtraCheese(e.target.checked)} />
              </div>
            </div>
          )}

          {/* 3. Extra Toppings Selection Grid */}
          {toppings.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                2. Select Extra Toppings
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {toppings.map((top) => {
                  const isChecked = selectedToppings.some((t) => t.id === top.id);
                  return (
                    <label
                      key={top.id}
                      onClick={() => toggleTopping(top)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                        isChecked
                          ? "border-pizza-500 bg-pizza-50/50 text-pizza-900 font-bold"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Checkbox checked={isChecked} onChange={() => {}} />
                        <span className="text-xs truncate">{top.name}</span>
                      </div>
                      <span className="text-[11px] font-extrabold text-pizza-600 ml-1">+{formatCurrency(top.price)}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. Item-Level Discount Option */}
          <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="h-4 w-4 text-pizza-500" />
                Item Discount / Price Adjustment
              </span>
              <div className="flex items-center gap-1 bg-white p-0.5 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setDiscountType("PERCENT")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    discountType === "PERCENT"
                      ? "bg-pizza-500 text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  %
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType("FIXED")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    discountType === "FIXED"
                      ? "bg-pizza-500 text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Rs.
                </button>
              </div>
            </div>

            <Input
              type="number"
              placeholder={`Enter item discount in ${discountType === "PERCENT" ? "%" : "Rs."}...`}
              value={discountValue || ""}
              onChange={(e) => setDiscountValue(Number(e.target.value))}
            />
          </div>

          {/* 5. Special Order Note */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Special Instructions
            </label>
            <Input
              placeholder={product.notesPlaceholder || "e.g. No onions, extra crispy, cut into 8 slices"}
              value={itemNotes}
              onChange={(e) => setItemNotes(e.target.value)}
            />
          </div>
        </div>
      )}
    </Modal>
  );
}
