"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Badge } from "@/components/ui/badge";
import { CategoryFormModal, CategoryItem } from "@/components/categories/category-form-modal";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { UtensilsCrossed, Plus, Edit2, Trash2, Layers, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function CategoriesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/categories");
      const json = await res.json();
      if (res.ok && json.success) {
        setCategories(json.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async () => {
    if (!deletingCategoryId) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/categories/${deletingCategoryId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error || "Failed to delete category");
        return;
      }

      toast.success("Category deleted successfully!");
      setDeletingCategoryId(null);
      fetchCategories();
    } catch (error) {
      console.error("Delete category error:", error);
      toast.error("Network error deleting category");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-pizza-50 p-3 text-pizza-500">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Category Management</h1>
            <p className="text-xs text-slate-500">Organize menu items into display categories</p>
          </div>
        </div>

        {isAdmin && (
          <Button
            onClick={() => {
              setEditingCategory(null);
              setIsModalOpen(true);
            }}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Add Category
          </Button>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Total Categories ({categories.length})
        </div>
        <div className="w-full sm:w-72">
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery("")}
            placeholder="Search category name..."
          />
        </div>
      </div>

      {/* List / Table Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-2xl" />
          ))}
        </div>
      ) : filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="rounded-2xl bg-white p-5 border border-slate-200 shadow-soft hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-extrabold text-slate-900 text-xs font-mono bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                    Order #{cat.displayOrder}
                  </span>
                  <Badge variant={cat.isActive ? "success" : "default"}>
                    {cat.isActive ? "Active" : "Disabled"}
                  </Badge>
                </div>

                <h3 className="text-base font-bold text-slate-900">{cat.name}</h3>
                {cat.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{cat.description}</p>}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">
                  {cat._count?.menuItems ?? 0} item(s)
                </span>

                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingCategory(cat);
                        setIsModalOpen(true);
                      }}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeletingCategoryId(cat.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No categories found"
          description="Try adjusting your search query."
          icon={Layers}
        />
      )}

      {/* Category Modal Form */}
      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchCategories}
        initialData={editingCategory}
      />

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!deletingCategoryId}
        onClose={() => setDeletingCategoryId(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        description="Are you sure you want to delete this category? (Note: Categories containing items cannot be deleted until items are removed)."
        isLoading={isDeleting}
      />
    </div>
  );
}
