"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { CategoryItemEditModal } from "@/components/categories/category-item-edit-modal";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { formatCurrency } from "@/lib/utils";
import { Edit2, Trash2, UtensilsCrossed, Plus } from "lucide-react";
import { toast } from "sonner";

export interface CategoryItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: any | null;
  isAdmin?: boolean;
}

export function CategoryItemsModal({
  isOpen,
  onClose,
  category,
  isAdmin = true,
}: CategoryItemsModalProps) {
  const [categoryData, setCategoryData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategoryDetails = async () => {
    if (!category?.id) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/categories/${category.id}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setCategoryData(json.data);
      }
    } catch (error) {
      console.error("Failed to fetch category detail:", error);
      toast.error("Failed to load category items");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCategoryDetails();
    }
  }, [isOpen, category?.id]);

  const handleDeleteItem = async () => {
    if (!deletingItemId) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/menu-items/${deletingItemId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error || "Failed to delete item");
        return;
      }

      toast.success("Item deleted successfully!");
      setDeletingItemId(null);
      fetchCategoryDetails();
    } catch (error) {
      console.error("Delete item error:", error);
      toast.error("Network error deleting item");
    } finally {
      setIsDeleting(false);
    }
  };

  const isPizzaCategory =
    categoryData?.categoryType === "PIZZA" ||
    category?.categoryType === "PIZZA" ||
    category?.name?.toLowerCase().includes("pizza");

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Category: ${category?.name || ""}`}
        description={
          isPizzaCategory
            ? "Manage pizza items, size variations, and prices"
            : "Manage menu items belonging to this category"
        }
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            {isAdmin ? (
              <Button
                size="sm"
                onClick={() => setIsAddingItem(true)}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Add Item to Category
              </Button>
            ) : <div />}
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        }
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-2xl" />
              ))}
            </div>
          ) : categoryData?.menuItems && categoryData.menuItems.length > 0 ? (
            <div className="space-y-3">
              {categoryData.menuItems.map((item: any) => {
                const smallPrice = item.itemPrices?.find(
                  (p: any) => p.size?.name?.toLowerCase() === "small"
                )?.price;
                const mediumPrice = item.itemPrices?.find(
                  (p: any) => p.size?.name?.toLowerCase() === "medium"
                )?.price;
                const largePrice = item.itemPrices?.find(
                  (p: any) => p.size?.name?.toLowerCase() === "large"
                )?.price;
                const xlPrice = item.itemPrices?.find(
                  (p: any) => {
                    const n = p.size?.name?.toLowerCase() || "";
                    return n === "xl" || n === "extra large";
                  }
                )?.price;

                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-soft hover:border-slate-300 transition-all"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-slate-900 text-sm">{item.name}</h4>
                        {!item.isAvailable && (
                          <Badge variant="danger">Sold Out</Badge>
                        )}
                        {isPizzaCategory && (
                          <Badge variant="primary">Pizza</Badge>
                        )}
                      </div>

                      {item.description && (
                        <p className="text-xs text-slate-500 line-clamp-1">{item.description}</p>
                      )}

                      {/* Pricing Display */}
                      {isPizzaCategory ? (
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                          <span className="font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-lg">
                            Small: <strong className="text-pizza-600 font-extrabold">{smallPrice ? formatCurrency(smallPrice) : "N/A"}</strong>
                          </span>
                          <span className="font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-lg">
                            Medium: <strong className="text-pizza-600 font-extrabold">{mediumPrice ? formatCurrency(mediumPrice) : "N/A"}</strong>
                          </span>
                          <span className="font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-lg">
                            Large: <strong className="text-pizza-600 font-extrabold">{largePrice ? formatCurrency(largePrice) : "N/A"}</strong>
                          </span>
                          <span className="font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-lg">
                            XL: <strong className="text-pizza-600 font-extrabold">{xlPrice ? formatCurrency(xlPrice) : "N/A"}</strong>
                          </span>
                        </div>
                      ) : (
                        <div className="pt-1 text-xs font-black text-pizza-600">
                          Price: {formatCurrency(item.basePrice)}
                        </div>
                      )}
                    </div>

                    {isAdmin && (
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingItem(item)}
                          leftIcon={<Edit2 className="h-3.5 w-3.5" />}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setDeletingItemId(item.id)}
                          leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No items in this category"
              description="Add new menu items to populate this category."
              icon={UtensilsCrossed}
            />
          )}
        </div>
      </Modal>

      {/* Edit Item Modal */}
      {editingItem && (
        <CategoryItemEditModal
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          onSuccess={() => {
            fetchCategoryDetails();
          }}
          item={editingItem}
          isPizzaCategory={isPizzaCategory}
        />
      )}

      {/* Add New Item Modal */}
      {isAddingItem && (
        <CategoryItemEditModal
          isOpen={isAddingItem}
          onClose={() => setIsAddingItem(false)}
          onSuccess={() => {
            fetchCategoryDetails();
          }}
          categoryId={category?.id}
          isPizzaCategory={isPizzaCategory}
        />
      )}

      {/* Delete Item Confirmation */}
      <ConfirmationDialog
        isOpen={!!deletingItemId}
        onClose={() => setDeletingItemId(null)}
        onConfirm={handleDeleteItem}
        title="Delete Item"
        description="Are you sure you want to delete this menu item? This action cannot be undone."
        isLoading={isDeleting}
      />
    </>
  );
}
