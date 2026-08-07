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
import { toast } from "sonner";

export interface CategoryItem {
  id: string;
  name: string;
  description?: string | null;
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
      displayOrder: 1,
      isActive: true,
    },
  });

  const isActiveValue = watch("isActive");

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        description: initialData.description || "",
        displayOrder: initialData.displayOrder,
        isActive: initialData.isActive,
      });
    } else {
      reset({
        name: "",
        description: "",
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

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
      description="Define menu category name, order sequence, and status"
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
          placeholder="e.g. Signature Pizzas"
          error={errors.name?.message}
          {...register("name")}
        />

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
          placeholder="Woodfired pizzas made with authentic Italian ingredients"
          error={errors.description?.message}
          {...register("description")}
        />

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
