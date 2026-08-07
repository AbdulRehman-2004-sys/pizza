"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Pizza, Layers, DollarSign, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export interface PizzaSizeItem {
  id: string;
  name: string;
  displayOrder: number;
  isActive: boolean;
}

export interface MenuItemCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  menuItem: {
    id: string;
    name: string;
    basePrice: number;
    isCustomizable: boolean;
    allowSizes: boolean;
    allowExtraCheese: boolean;
    allowExtraToppings: boolean;
    allowNotes: boolean;
    maxNotesLength?: number;
    notesPlaceholder?: string;
  } | null;
}

export function PizzaCustomizationModal({
  isOpen,
  onClose,
  onSuccess,
  menuItem,
}: MenuItemCustomizationModalProps) {
  const [sizes, setSizes] = useState<PizzaSizeItem[]>([]);
  const [sizePrices, setSizePrices] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State Flags
  const [isCustomizable, setIsCustomizable] = useState(false);
  const [allowSizes, setAllowSizes] = useState(false);
  const [allowExtraCheese, setAllowExtraCheese] = useState(false);
  const [allowExtraToppings, setAllowExtraToppings] = useState(false);
  const [allowNotes, setAllowNotes] = useState(true);
  const [notesPlaceholder, setNotesPlaceholder] = useState("e.g. No onions, extra crispy, cut into 8 slices");

  useEffect(() => {
    if (!menuItem || !isOpen) return;

    const loadData = async () => {
      try {
        setIsLoading(true);

        // Fetch sizes and current item customization
        const [sizesRes, itemRes] = await Promise.all([
          fetch("/api/pizza-config/sizes"),
          fetch(`/api/menu-items/${menuItem.id}/customization`),
        ]);

        const sizesJson = await sizesRes.json();
        const itemJson = await itemRes.json();

        if (sizesRes.ok && sizesJson.success) {
          const activeSizes = sizesJson.data.filter((s: PizzaSizeItem) => s.isActive);
          setSizes(activeSizes);

          // Populate current customization flags
          if (itemRes.ok && itemJson.success && itemJson.data) {
            const data = itemJson.data;
            setIsCustomizable(data.isCustomizable);
            setAllowSizes(data.allowSizes);
            setAllowExtraCheese(data.allowExtraCheese);
            setAllowExtraToppings(data.allowExtraToppings);
            setAllowNotes(data.allowNotes ?? true);
            setNotesPlaceholder(data.notesPlaceholder || "e.g. No onions, extra crispy, cut into 8 slices");

            // Populate price matrix map
            const priceMap: Record<string, number> = {};
            activeSizes.forEach((sz: PizzaSizeItem) => {
              const match = data.itemPrices?.find((ip: any) => ip.sizeId === sz.id);
              priceMap[sz.id] = match ? match.price : menuItem.basePrice;
            });
            setSizePrices(priceMap);
          }
        }
      } catch (error) {
        console.error("Failed to load customization data:", error);
        toast.error("Failed to load item price matrix");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [menuItem, isOpen]);

  const handlePriceChange = (sizeId: string, price: number) => {
    setSizePrices((prev) => ({
      ...prev,
      [sizeId]: price,
    }));
  };

  const handleSave = async () => {
    if (!menuItem) return;

    try {
      setIsSubmitting(true);

      const pricesArray = sizes.map((sz) => ({
        sizeId: sz.id,
        price: sizePrices[sz.id] ?? menuItem.basePrice,
      }));

      const payload = {
        isCustomizable,
        allowSizes,
        allowExtraCheese,
        allowExtraToppings,
        allowNotes,
        maxNotesLength: 200,
        notesPlaceholder,
        prices: pricesArray,
      };

      const res = await fetch(`/api/menu-items/${menuItem.id}/customization`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error || "Failed to save pizza customization settings");
        return;
      }

      toast.success("Pizza customization & price matrix saved successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Save customization error:", error);
      toast.error("Network error saving customization settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!menuItem) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Configure Customization: ${menuItem.name}`}
      description="Enable sizes, toppings, and configure price matrix by size"
      size="xl"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} isLoading={isSubmitting}>
            Save Customization & Prices
          </Button>
        </>
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-pizza-500" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Customization Master Toggle */}
          <div className="rounded-2xl bg-pizza-50 p-4 border border-pizza-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Pizza className="h-6 w-6 text-pizza-500" />
              <div>
                <h4 className="text-sm font-bold text-pizza-900">Enable Pizza Customization</h4>
                <p className="text-xs text-pizza-700">
                  Allow customers and cashiers to select sizes, extra toppings, and extra cheese.
                </p>
              </div>
            </div>
            <Switch
              checked={isCustomizable}
              onChange={(e) => {
                const checked = e.target.checked;
                setIsCustomizable(checked);
                setAllowSizes(checked);
                setAllowExtraCheese(checked);
                setAllowExtraToppings(checked);
              }}
            />
          </div>

          {/* Individual Customization Options */}
          {isCustomizable && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-2xl bg-slate-50 p-4 border border-slate-200">
              <Switch
                label="Allow Multiple Sizes"
                checked={allowSizes}
                onChange={(e) => setAllowSizes(e.target.checked)}
              />
              <Switch
                label="Allow Extra Cheese"
                checked={allowExtraCheese}
                onChange={(e) => setAllowExtraCheese(e.target.checked)}
              />
              <Switch
                label="Allow Extra Toppings"
                checked={allowExtraToppings}
                onChange={(e) => setAllowExtraToppings(e.target.checked)}
              />
            </div>
          )}

          {/* Relational Size Price Matrix */}
          {isCustomizable && allowSizes && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Relational Size Price Matrix (Rs.)
                </h4>
                <span className="text-[11px] text-slate-500">Base Price: {formatCurrency(menuItem.basePrice)}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sizes.map((sz) => (
                  <div
                    key={sz.id}
                    className="flex items-center justify-between rounded-xl bg-white p-3 border border-slate-200 shadow-sm"
                  >
                    <span className="text-sm font-bold text-slate-900">{sz.name}</span>
                    <div className="w-36">
                      <Input
                        type="number"
                        placeholder="Price"
                        value={sizePrices[sz.id] ?? menuItem.basePrice}
                        onChange={(e) => handlePriceChange(sz.id, Number(e.target.value))}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Special Instructions Configuration */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Special Instructions Config</h4>
                <p className="text-[11px] text-slate-500">Allow kitchen order notes for this item</p>
              </div>
              <Switch
                checked={allowNotes}
                onChange={(e) => setAllowNotes(e.target.checked)}
              />
            </div>

            {allowNotes && (
              <Input
                label="Note Placeholder Text"
                value={notesPlaceholder}
                onChange={(e) => setNotesPlaceholder(e.target.value)}
                placeholder="e.g. No onions, extra crispy, cut into 8 slices"
              />
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
