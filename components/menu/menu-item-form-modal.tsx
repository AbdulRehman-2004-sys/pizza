"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { menuItemSchema, MenuItemInput } from "@/validators/menu-item";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/ui/image-upload";
import { toast } from "sonner";
import { CategoryItem } from "@/components/categories/category-form-modal";

export interface MenuItemData {
  id: string;
  categoryId: string;
  name: string;
  description?: string | null;
  basePrice: number;
  image?: string | null;
  isAvailable: boolean;
}

export interface MenuItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: MenuItemData | null;
  categories: CategoryItem[];
}

export function MenuItemFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  categories,
}: MenuItemFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MenuItemInput>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      categoryId: categories[0]?.id || "",
      name: "",
      description: "",
      basePrice: 1000,
      image: null,
      isAvailable: true,
    },
  });

  const isAvailableValue = watch("isAvailable");

  useEffect(() => {
    if (initialData) {
      reset({
        categoryId: initialData.categoryId,
        name: initialData.name,
        description: initialData.description || "",
        basePrice: initialData.basePrice,
        image: null,
        isAvailable: initialData.isAvailable,
      });
    } else {
      reset({
        categoryId: categories[0]?.id || "",
        name: "",
        description: "",
        basePrice: 1000,
        image: null,
        isAvailable: true,
      });
    }
  }, [initialData, categories, reset, isOpen]);

  const onSubmit = async (data: MenuItemInput) => {
    try {
      setIsSubmitting(true);
      const url = isEditing ? `/api/menu-items/${initialData.id}` : "/api/menu-items";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error || `Failed to ${isEditing ? "update" : "create"} menu item`);
        return;
      }

      toast.success(`Menu item ${isEditing ? "updated" : "created"} successfully!`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Menu item form submission error:", error);
      toast.error("Network error submitting menu item form");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit ${initialData.name}` : "Add New Menu Item"}
      description="Configure product details, category, pricing, and availability"
      size="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>
            {isEditing ? "Save Changes" : "Create Menu Item"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Item Name"
            placeholder="e.g. Pepperoni Supreme"
            error={errors.name?.message}
            {...register("name")}
          />

          <Select
            label="Category"
            options={categoryOptions}
            error={errors.categoryId?.message}
            {...register("categoryId")}
          />
        </div>

        <Input
          label="Base Price (Rs.)"
          type="number"
          placeholder="1000"
          error={errors.basePrice?.message}
          {...register("basePrice")}
        />

        <Textarea
          label="Description"
          placeholder="Double pepperoni, mozzarella cheese, and rich marinara sauce"
          error={errors.description?.message}
          {...register("description")}
        />

        <div className="pt-2">
          <Switch
            label="Item Available for Ordering"
            checked={isAvailableValue}
            onChange={(e) => setValue("isAvailable", e.target.checked)}
          />
        </div>
      </form>
    </Modal>
  );
}
