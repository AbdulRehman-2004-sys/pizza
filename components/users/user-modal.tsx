"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema, updateUserSchema } from "@/validators/user";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Role } from "@prisma/client";
import { toast } from "sonner";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userToEdit?: {
    id: string;
    name: string;
    email: string;
    role: Role;
    isActive: boolean;
  } | null;
}

export function UserModal({
  isOpen,
  onClose,
  onSuccess,
  userToEdit,
}: UserModalProps) {
  const isEditing = !!userToEdit;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: zodResolver(isEditing ? updateUserSchema : createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: Role.CASHIER,
      isActive: true,
    },
  });

  useEffect(() => {
    if (userToEdit) {
      reset({
        name: userToEdit.name,
        email: userToEdit.email,
        role: userToEdit.role,
        isActive: userToEdit.isActive,
        password: "",
        confirmPassword: "",
      });
    } else {
      reset({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: Role.CASHIER,
        isActive: true,
      });
    }
  }, [userToEdit, reset, isOpen]);

  const onSubmit = async (data: any) => {
    try {
      const url = isEditing ? `/api/users/${userToEdit.id}` : "/api/users";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Operation failed");
      }

      toast.success(isEditing ? "User updated successfully" : "User created successfully");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to save user");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit User Account" : "Create New User Account"}
      description={
        isEditing
          ? "Update user details, role permissions, or active status."
          : "Add a new staff member or administrator to the POS system."
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
          <Input
            placeholder="e.g. John Doe"
            {...register("name")}
            error={errors.name?.message as string}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Email / Username</label>
          <Input
            type="email"
            placeholder="e.g. cashier@pizzapos.com"
            {...register("email")}
            error={errors.email?.message as string}
          />
        </div>

        {!isEditing && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                {...register("password")}
                error={errors.password?.message as string}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Confirm Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                {...register("confirmPassword")}
                error={errors.confirmPassword?.message as string}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Role Permission</label>
            <select
              {...register("role")}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-pizza-500 focus:outline-none"
            >
              <option value={Role.CASHIER}>CASHIER (Front Desk)</option>
              <option value={Role.ADMIN}>ADMIN (Full System Access)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Account Status</label>
            <select
              {...register("isActive", {
                setValueAs: (v) => v === "true" || v === true,
              })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-pizza-500 focus:outline-none"
            >
              <option value="true">Active (Can Login)</option>
              <option value="false">Inactive (Login Blocked)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEditing ? "Save Changes" : "Create Account"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
