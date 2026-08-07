"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tableSchema, TableInput } from "@/validators/table";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Table as TableIcon } from "lucide-react";

export interface TableItem {
  id: string;
  tableNumber: number;
  tableName: string;
  capacity: number;
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED";
  notes?: string | null;
}

export interface TableFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: TableItem | null;
}

export function TableFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: TableFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TableInput>({
    resolver: zodResolver(tableSchema),
    defaultValues: {
      tableNumber: 1,
      tableName: "",
      capacity: 4,
      status: "AVAILABLE",
      notes: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        tableNumber: initialData.tableNumber,
        tableName: initialData.tableName,
        capacity: initialData.capacity,
        status: initialData.status,
        notes: initialData.notes || "",
      });
    } else {
      reset({
        tableNumber: 1,
        tableName: "",
        capacity: 4,
        status: "AVAILABLE",
        notes: "",
      });
    }
  }, [initialData, reset, isOpen]);

  const onSubmit = async (data: TableInput) => {
    try {
      setIsSubmitting(true);
      const url = isEditing ? `/api/tables/${initialData.id}` : "/api/tables";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error || `Failed to ${isEditing ? "update" : "create"} table`);
        return;
      }

      toast.success(`Table ${isEditing ? "updated" : "created"} successfully!`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Table form submission error:", error);
      toast.error("Network error submitting table form");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit ${initialData.tableName}` : "Add Dining Table"}
      description="Configure table number, seating capacity, and status"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>
            {isEditing ? "Save Changes" : "Create Table"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Table Number"
            type="number"
            placeholder="1"
            error={errors.tableNumber?.message}
            {...register("tableNumber")}
          />

          <Input
            label="Seating Capacity"
            type="number"
            placeholder="4"
            error={errors.capacity?.message}
            {...register("capacity")}
          />
        </div>

        <Input
          label="Table Name / Label"
          placeholder="e.g. Table 01 (Window View)"
          error={errors.tableName?.message}
          {...register("tableName")}
        />

        <Select
          label="Status"
          options={[
            { value: "AVAILABLE", label: "Available" },
            { value: "OCCUPIED", label: "Occupied" },
            { value: "RESERVED", label: "Reserved" },
          ]}
          error={errors.status?.message}
          {...register("status")}
        />

        <Textarea
          label="Notes / Location Details"
          placeholder="Near outdoor patio door"
          error={errors.notes?.message}
          {...register("notes")}
        />
      </form>
    </Modal>
  );
}
