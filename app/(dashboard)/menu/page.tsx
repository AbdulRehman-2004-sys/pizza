"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Badge } from "@/components/ui/badge";
import { MenuItemFormModal, MenuItemData } from "@/components/menu/menu-item-form-modal";
import { CategoryItem } from "@/components/categories/category-form-modal";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/lib/utils";
import { UtensilsCrossed, Plus, Edit2, Trash2, Pizza, Tag } from "lucide-react";
import { toast } from "sonner";

export interface MenuItemWithCat extends MenuItemData {
  category: { id: string; name: string };
}

export default function MenuPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [menuItems, setMenuItems] = useState<MenuItemWithCat[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemWithCat | null>(null);

  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [itemsRes, catRes] = await Promise.all([
        fetch("/api/menu-items"),
        fetch("/api/categories"),
      ]);

      const itemsJson = await itemsRes.json();
      const catJson = await catRes.json();

      if (itemsRes.ok && itemsJson.success) {
        setMenuItems(itemsJson.data);
      }
      if (catRes.ok && catJson.success) {
        setCategories(catJson.data);
      }
    } catch (error) {
      console.error("Failed to fetch menu items data:", error);
      toast.error("Failed to load menu items");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async () => {
    if (!deletingItemId) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/menu-items/${deletingItemId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error || "Failed to delete menu item");
        return;
      }

      toast.success("Menu item deleted successfully!");
      setDeletingItemId(null);
      fetchData();
    } catch (error) {
      console.error("Delete menu item error:", error);
      toast.error("Network error deleting menu item");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "ALL" || item.categoryId === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-pizza-50 p-3 text-pizza-500">
            <UtensilsCrossed className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Menu & Item Catalog</h1>
            <p className="text-xs text-slate-500">Manage pizzeria dishes, pricing, and availability</p>
          </div>
        </div>

        {isAdmin && (
          <Button
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Add Menu Item
          </Button>
        )}
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === "ALL"
                ? "bg-pizza-500 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Items ({menuItems.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? "bg-pizza-500 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72">
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery("")}
            placeholder="Search menu items..."
          />
        </div>
      </div>

      {/* Menu Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-3xl" />
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl bg-white border border-slate-200 shadow-soft hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Image Thumbnail */}
                <div className="relative h-44 w-full bg-slate-100 flex items-center justify-center overflow-hidden">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-300">
                      <Pizza className="h-12 w-12" />
                      <span className="text-[10px] uppercase font-bold mt-1 text-slate-400">No Image</span>
                    </div>
                  )}

                  {/* Availability Badge */}
                  <div className="absolute top-3 right-3">
                    <Badge variant={item.isAvailable ? "success" : "danger"}>
                      {item.isAvailable ? "Available" : "Sold Out"}
                    </Badge>
                  </div>

                  {/* Category Pill */}
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
                      <Tag className="h-3 w-3 text-pizza-400" />
                      {item.category?.name}
                    </span>
                  </div>
                </div>

                {/* Content info */}
                <div className="p-5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-slate-900 leading-tight">{item.name}</h3>
                    <span className="text-base font-extrabold text-pizza-600 whitespace-nowrap">
                      {formatCurrency(item.basePrice)}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>
                  )}
                </div>
              </div>

              {/* Admin Actions */}
              {isAdmin && (
                <div className="px-5 pb-4 pt-0 flex items-center justify-end gap-2 border-t border-slate-100 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingItem(item);
                      setIsModalOpen(true);
                    }}
                    leftIcon={<Edit2 className="h-3.5 w-3.5" />}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setDeletingItemId(item.id)}
                    leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No menu items found"
          description="Try selecting another category tab or adjusting your search query."
          icon={UtensilsCrossed}
        />
      )}

      {/* Menu Item Form Modal */}
      <MenuItemFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
        initialData={editingItem}
        categories={categories}
      />

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!deletingItemId}
        onClose={() => setDeletingItemId(null)}
        onConfirm={handleDelete}
        title="Delete Menu Item"
        description="Are you sure you want to delete this menu item? This action cannot be undone."
        isLoading={isDeleting}
      />
    </div>
  );
}
