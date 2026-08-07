"use client";

import React, { useState } from "react";
import Image from "next/image";
import { UploadCloud, X, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  folder?: "menu-items" | "restaurant";
  label?: string;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  folder = "menu-items",
  label = "Upload Image",
  className,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5MB");
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error || "Failed to upload image");
        return;
      }

      toast.success("Image uploaded successfully!");
      onChange(json.data.url);
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Network error uploading image");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {label && <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">{label}</label>}

      {value ? (
        <div className="relative h-40 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 group">
          <Image src={value} alt="Uploaded Image" fill className="object-cover" />
          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={() => onChange(null)}
              className="rounded-full bg-rose-600 p-2 text-white shadow-lg hover:bg-rose-700 transition-transform active:scale-95"
              title="Remove Image"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : (
        <label className="flex h-36 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-100/60 transition-colors">
          <div className="flex flex-col items-center justify-center gap-1.5 p-4 text-center">
            {isUploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-pizza-500" />
            ) : (
              <div className="rounded-full bg-pizza-50 p-3 text-pizza-500">
                <UploadCloud className="h-6 w-6" />
              </div>
            )}
            <p className="text-xs font-bold text-slate-800">
              {isUploading ? "Uploading image..." : "Click or drag image to upload"}
            </p>
            <p className="text-[11px] text-slate-400">PNG, JPG, WEBP up to 5MB</p>
          </div>
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp, image/svg+xml"
            onChange={handleFileChange}
            disabled={isUploading}
            className="sr-only"
          />
        </label>
      )}
    </div>
  );
}
