"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema, CategoryInput } from "@/validators/category";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Utensils } from "lucide-react";
import { toast } from "sonner";

export interface CategoryItem {
  id: string;
  name: string;
  description?: string | null;
  categoryType?: string;
  displayOrder: number;
  isActive: boolean;
  _count?: { menuItems: number };
}

export interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: CategoryItem | null;
}

export function CategoryFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: CategoryFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!initialData;
  const [itemsList, setItemsList] = useState<
    Array<{ name: string; basePrice: string; smallPrice: string; mediumPrice: string; largePrice: string; xlPrice: string }>
  >([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      categoryType: "STANDARD",
      displayOrder: 1,
      isActive: true,
    },
  });

  const isActiveValue = watch("isActive");
  const categoryTypeValue = watch("categoryType");

  useEffect(() => {
    setItemsList([]);
    if (initialData) {
      reset({
        name: initialData.name,
        description: initialData.description || "",
        categoryType: (initialData.categoryType as any) || "STANDARD",
        displayOrder: initialData.displayOrder,
        isActive: initialData.isActive,
      });
    } else {
      reset({
        name: "",
        description: "",
        categoryType: "STANDARD",
        displayOrder: 1,
        isActive: true,
      });
    }
  }, [initialData, reset, isOpen]);

  const onSubmit = async (data: CategoryInput) => {
    try {
      setIsSubmitting(true);
      const url = isEditing ? `/api/categories/${initialData.id}` : "/api/categories";
      const method = isEditing ? "PUT" : "POST";

      const payload = {
        ...data,
        items: itemsList
          .filter((i) => i.name.trim().length > 0)
          .map((i) => ({
            name: i.name.trim(),
            basePrice: i.basePrice !== "" ? Number(i.basePrice) : 0,
            smallPrice: i.smallPrice !== "" ? Number(i.smallPrice) : undefined,
            mediumPrice: i.mediumPrice !== "" ? Number(i.mediumPrice) : undefined,
            largePrice: i.largePrice !== "" ? Number(i.largePrice) : undefined,
            xlPrice: i.xlPrice !== "" ? Number(i.xlPrice) : undefined,
          })),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error || `Failed to ${isEditing ? "update" : "create"} category`);
        return;
      }

      toast.success(`Category ${isEditing ? "updated" : "created"} successfully!`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Category form submission error:", error);
      toast.error("Network error submitting category form");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Category: ${initialData.name}` : "Add New Category"}
      description="Define menu category name, type, sequence, and status"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>
            {isEditing ? "Save Changes" : "Create Category"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Category Name"
          placeholder="e.g. Pizza, Burgers, Drinks"
          error={errors.name?.message}
          {...register("name")}
        />

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Configuration Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setValue("categoryType", "STANDARD")}
              className={`p-3 rounded-2xl border text-xs font-bold transition-all ${
                categoryTypeValue === "STANDARD"
                  ? "bg-pizza-500 text-white border-pizza-500 shadow-sm"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
              }`}
            >
              Standard Category
            </button>
            <button
              type="button"
              onClick={() => setValue("categoryType", "PIZZA")}
              className={`p-3 rounded-2xl border text-xs font-bold transition-all ${
                categoryTypeValue === "PIZZA"
                  ? "bg-pizza-500 text-white border-pizza-500 shadow-sm"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
              }`}
            >
              Pizza Category (S/M/L Sizes)
            </button>
          </div>
        </div>

        <Input
          label="Display Order / Priority"
          type="number"
          placeholder="1"
          helperText="Lower numbers appear first on POS tab bar"
          error={errors.displayOrder?.message}
          {...register("displayOrder")}
        />

        <Textarea
          label="Description"
          placeholder="Category description..."
          error={errors.description?.message}
          {...register("description")}
        />

        {/* Inline Items Quick Add (When creating new category) */}
        {!isEditing && (
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Utensils className="h-3.5 w-3.5 text-pizza-500" />
                  <span>Category Items (Optional Quick Add)</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Add items to this category right now
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() =>
                  setItemsList([
                    ...itemsList,
                    { name: "", basePrice: "", smallPrice: "", mediumPrice: "", largePrice: "", xlPrice: "" },
                  ])
                }
              >
                Add Item
              </Button>
            </div>

            {itemsList.length > 0 && (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {itemsList.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Item #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => setItemsList(itemsList.filter((_, i) => i !== idx))}
                        className="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-100 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <Input
                      placeholder="Item Name (e.g. Pepperoni Feast)"
                      value={item.name}
                      onChange={(e) => {
                        const updated = [...itemsList];
                        updated[idx].name = e.target.value;
                        setItemsList(updated);
                      }}
                    />

                    {categoryTypeValue === "PIZZA" ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <Input
                          placeholder="Small (PKR)"
                          type="number"
                          value={item.smallPrice}
                          onChange={(e) => {
                            const updated = [...itemsList];
                            updated[idx].smallPrice = e.target.value;
                            setItemsList(updated);
                          }}
                        />
                        <Input
                          placeholder="Medium (PKR)"
                          type="number"
                          value={item.mediumPrice}
                          onChange={(e) => {
                            const updated = [...itemsList];
                            updated[idx].mediumPrice = e.target.value;
                            setItemsList(updated);
                          }}
                        />
                        <Input
                          placeholder="Large (PKR)"
                          type="number"
                          value={item.largePrice}
                          onChange={(e) => {
                            const updated = [...itemsList];
                            updated[idx].largePrice = e.target.value;
                            setItemsList(updated);
                          }}
                        />
                        <Input
                          placeholder="XL (PKR)"
                          type="number"
                          value={item.xlPrice}
                          onChange={(e) => {
                            const updated = [...itemsList];
                            updated[idx].xlPrice = e.target.value;
                            setItemsList(updated);
                          }}
                        />
                      </div>
                    ) : (
                      <Input
                        placeholder="Price (PKR)"
                        type="number"
                        value={item.basePrice}
                        onChange={(e) => {
                          const updated = [...itemsList];
                          updated[idx].basePrice = e.target.value;
                          setItemsList(updated);
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="pt-2">
          <Switch
            label="Active Category (Visible on POS menu)"
            checked={isActiveValue}
            onChange={(e) => setValue("isActive", e.target.checked)}
          />
        </div>
      </form>
    </Modal>
  );
}
