"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { settingsSchema, SettingsInput } from "@/validators/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import { useAuth } from "@/hooks/use-auth";
import { Store, Save, ShieldAlert, Percent, Phone } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      restaurantName: "SliceMaster Pizzeria",
      logoUrl: null,
      address: "Main Boulevard, Gulberg III, Lahore, Pakistan",
      phone: "+92 42 111 749 922",
      receiptFooter: "Thank you for dining with SliceMaster! Visit again.",
      currency: "PKR",
      timezone: "Asia/Karachi",
      taxPercentage: 16.0,
    },
  });

  const logoUrlValue = watch("logoUrl");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/settings");
        const json = await res.json();
        if (res.ok && json.success && json.data) {
          reset({
            restaurantName: json.data.restaurantName || "SliceMaster Pizzeria",
            logoUrl: json.data.logoUrl || null,
            address: json.data.address || "",
            phone: json.data.phone || "",
            receiptFooter: json.data.receiptFooter || "",
            currency: json.data.currency || "PKR",
            timezone: json.data.timezone || "Asia/Karachi",
            taxPercentage: json.data.taxPercentage ?? 16.0,
          });
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
        toast.error("Failed to load restaurant settings");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [reset]);

  const onSubmit = async (data: SettingsInput) => {
    if (!isAdmin) {
      toast.error("Forbidden: Cashiers cannot modify restaurant settings");
      return;
    }
    try {
      setIsSaving(true);
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error || "Failed to save restaurant settings");
        return;
      }

      toast.success("Restaurant settings saved successfully!");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("settings-updated"));
      }
    } catch (error) {
      console.error("Save settings error:", error);
      toast.error("Network error saving settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-20 w-full rounded-3xl" />
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-pizza-50 p-3 text-pizza-500">
            <Store className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Restaurant Settings</h1>
            <p className="text-xs text-slate-500">Configure restaurant profile, receipt footer, and tax settings</p>
          </div>
        </div>

        {!isAdmin && (
          <div className="flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 border border-amber-200">
            <ShieldAlert className="h-4 w-4" />
            <span>Read-Only View (Cashier)</span>
          </div>
        )}
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-soft space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3">
            Branding & Contact Info
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Input
                label="Restaurant Name"
                placeholder="SliceMaster Pizzeria"
                leftIcon={<Store className="h-4 w-4" />}
                disabled={!isAdmin}
                error={errors.restaurantName?.message}
                {...register("restaurantName")}
              />

              <Input
                label="Phone Number"
                placeholder="+92 42 111 749 922"
                leftIcon={<Phone className="h-4 w-4" />}
                disabled={!isAdmin}
                error={errors.phone?.message}
                {...register("phone")}
              />
            </div>

            <ImageUpload
              label="Restaurant Logo"
              folder="restaurant"
              value={logoUrlValue}
              onChange={(url) => setValue("logoUrl", url)}
            />
          </div>

          <Textarea
            label="Address"
            placeholder="Main Boulevard, Gulberg III, Lahore, Pakistan"
            disabled={!isAdmin}
            error={errors.address?.message}
            {...register("address")}
          />
        </div>

        {/* Financial & Tax Settings */}
        <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-soft space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3">
            Receipt & Tax Parameters
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Currency"
              value="PKR (Rs.)"
              disabled
              helperText="Formatted as Rs. across system"
            />

            <Input
              label="Timezone"
              value="Asia/Karachi"
              disabled
              helperText="Pakistan Standard Time"
            />

            <Input
              label="Sales Tax Percentage (%)"
              type="number"
              step="0.1"
              leftIcon={<Percent className="h-4 w-4" />}
              disabled={!isAdmin}
              error={errors.taxPercentage?.message}
              {...register("taxPercentage")}
            />
          </div>

          <Textarea
            label="Thermal Receipt Footer Message"
            placeholder="Thank you for dining with SliceMaster! Visit again."
            disabled={!isAdmin}
            error={errors.receiptFooter?.message}
            {...register("receiptFooter")}
          />
        </div>

        {isAdmin && (
          <div className="flex justify-end">
            <Button
              type="submit"
              size="lg"
              isLoading={isSaving}
              leftIcon={<Save className="h-5 w-5" />}
            >
              Save Restaurant Settings
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
