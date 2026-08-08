"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export interface CategoryItemEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item?: any | null;
  categoryId?: string;
  isPizzaCategory?: boolean;
}

export function CategoryItemEditModal({
  isOpen,
  onClose,
  onSuccess,
  item,
  categoryId,
  isPizzaCategory = false,
}: CategoryItemEditModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState<number | string>("");
  const [smallPrice, setSmallPrice] = useState<number | string>("");
  const [mediumPrice, setMediumPrice] = useState<number | string>("");
  const [largePrice, setLargePrice] = useState<number | string>("");
  const [xlPrice, setXlPrice] = useState<number | string>("");
  const [isAvailable, setIsAvailable] = useState(true);

  const isEditing = !!item?.id;

  useEffect(() => {
    if (item) {
      setName(item.name || "");
      setDescription(item.description || "");
      setBasePrice(item.basePrice ?? "");
      setIsAvailable(item.isAvailable ?? true);

      if (item.itemPrices && Array.isArray(item.itemPrices)) {
        const small = item.itemPrices.find((p: any) => p.size?.name?.toLowerCase() === "small");
        const medium = item.itemPrices.find((p: any) => p.size?.name?.toLowerCase() === "medium");
        const large = item.itemPrices.find((p: any) => p.size?.name?.toLowerCase() === "large");
        const xl = item.itemPrices.find((p: any) => {
          const n = p.size?.name?.toLowerCase() || "";
          return n === "xl" || n === "extra large";
        });

        setSmallPrice(small ? small.price : "");
        setMediumPrice(medium ? medium.price : "");
        setLargePrice(large ? large.price : "");
        setXlPrice(xl ? xl.price : "");
      } else {
        setSmallPrice("");
        setMediumPrice("");
        setLargePrice("");
        setXlPrice("");
      }
    } else {
      setName("");
      setDescription("");
      setBasePrice("");
      setSmallPrice("");
      setMediumPrice("");
      setLargePrice("");
      setXlPrice("");
      setIsAvailable(true);
    }
  }, [item, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Item name is required!");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: any = {
        categoryId: item?.categoryId || categoryId,
        name: name.trim(),
        description: description.trim() || null,
        isAvailable,
        basePrice: Number(basePrice) || 0,
      };

      if (isPizzaCategory) {
        payload.isCustomizable = true;
        payload.allowSizes = true;
        if (smallPrice !== "") payload.smallPrice = Number(smallPrice);
        if (mediumPrice !== "") payload.mediumPrice = Number(mediumPrice);
        if (largePrice !== "") payload.largePrice = Number(largePrice);
        if (xlPrice !== "") payload.xlPrice = Number(xlPrice);
      }

      const url = isEditing ? `/api/menu-items/${item.id}` : "/api/menu-items";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        const errorMsg = Array.isArray(json.details)
          ? json.details.map((d: any) => `${d.path?.join(".")}: ${d.message}`).join(", ")
          : json.error || `Failed to ${isEditing ? "update" : "create"} item`;
        toast.error(errorMsg);
        return;
      }

      toast.success(`${isEditing ? "Updated" : "Added"} ${name} successfully!`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Item form error:", error);
      toast.error("Network error submitting item");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Item: ${item?.name || ""}` : "Add Item to Category"}
      description="Update pricing, size options, and item availability"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} isLoading={isSubmitting}>
            {isEditing ? "Save Changes" : "Add Item"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Item Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Chicken Fajita"
        />

        {isPizzaCategory ? (
          <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <p className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              Pizza Size Prices (PKR)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Input
                label="Small Price"
                type="number"
                placeholder="800"
                value={smallPrice}
                onChange={(e) => setSmallPrice(e.target.value)}
              />
              <Input
                label="Medium Price"
                type="number"
                placeholder="1000"
                value={mediumPrice}
                onChange={(e) => setMediumPrice(e.target.value)}
              />
              <Input
                label="Large Price"
                type="number"
                placeholder="1300"
                value={largePrice}
                onChange={(e) => setLargePrice(e.target.value)}
              />
              <Input
                label="XL Price"
                type="number"
                placeholder="1600"
                value={xlPrice}
                onChange={(e) => setXlPrice(e.target.value)}
              />
            </div>
          </div>
        ) : (
          <Input
            label="Price (PKR)"
            type="number"
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
            placeholder="150"
          />
        )}

        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Product details..."
        />

        <div className="pt-2">
          <Switch
            label="Item Available for Ordering"
            checked={isAvailable}
            onChange={(e) => setIsAvailable(e.target.checked)}
          />
        </div>
      </form>
    </Modal>
  );
}
