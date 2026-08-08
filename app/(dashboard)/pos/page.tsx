"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { SearchInput } from "@/components/ui/search-input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/lib/utils";
import { useCartStore, CartItem } from "@/store/use-cart-store";
import { POSPizzaModal } from "@/components/pos/pos-pizza-modal";
import { POSCartPanel } from "@/components/pos/pos-cart-panel";
import { UtensilsCrossed, Pizza, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function POSPage() {
  const addItem = useCartStore((state) => state.addItem);

  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Customization Modal State
  const [selectedPizzaItem, setSelectedPizzaItem] = useState<any | null>(null);

  const fetchPOSData = async () => {
    try {
      setIsLoading(true);
      const [itemsRes, catRes] = await Promise.all([
        fetch("/api/menu-items"),
        fetch("/api/categories"),
      ]);

      const [itemsJson, catJson] = await Promise.all([
        itemsRes.json(),
        catRes.json(),
      ]);

      if (itemsRes.ok && itemsJson.success) setMenuItems(itemsJson.data);
      if (catRes.ok && catJson.success) {
        setCategories(catJson.data.filter((c: any) => c.isActive));
      }
    } catch (error) {
      console.error("Failed to load POS data:", error);
      toast.error("Failed to load POS menu items");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPOSData();
  }, []);

  const handleProductClick = (product: any) => {
    if (!product.isAvailable) {
      toast.error(`${product.name} is currently sold out!`);
      return;
    }

    if (product.isCustomizable) {
      setSelectedPizzaItem(product);
    } else {
      // Add standard non-customizable product directly to cart
      const cartItemId = `${product.id}_standard`;
      const cartItem: CartItem = {
        cartItemId,
        productId: product.id,
        name: product.name,
        image: product.image,
        basePrice: product.basePrice,
        unitPrice: product.basePrice,
        quantity: 1,
        totalPrice: product.basePrice,
      };

      addItem(cartItem);
      toast.success(`Added 1x ${product.name} to cart!`);
    }
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category?.name && item.category.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "ALL" || item.categoryId === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] -m-4 sm:-m-6 overflow-hidden animate-in fade-in duration-300">
      {/* LEFT PANEL: Product Grid & Category Filter */}
      <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden border-r border-slate-200">
        {/* Header Search & Controls */}
        <div className="p-4 bg-white border-b border-slate-200 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-pizza-50 p-2 text-pizza-500">
                <UtensilsCrossed className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-base font-extrabold text-slate-900 leading-tight">POS Terminal</h1>
                <p className="text-[11px] text-slate-500">Fast touchscreen ordering interface</p>
              </div>
            </div>

            <div className="w-64 sm:w-80">
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery("")}
                placeholder="Search items or category..."
              />
            </div>
          </div>

          {/* Category Tabs Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
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
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full rounded-2xl" />
              ))}
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {filteredItems.map((product) => {
                const isPizza =
                  product.isCustomizable ||
                  product.category?.categoryType === "PIZZA" ||
                  product.category?.name?.toLowerCase().includes("pizza");

                // Get min price for pizza or basePrice
                let displayPrice = product.basePrice;
                if (isPizza && product.itemPrices && product.itemPrices.length > 0) {
                  const prices = product.itemPrices.map((p: any) => p.price);
                  displayPrice = Math.min(...prices);
                }

                return (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                    className={`group relative rounded-2xl bg-white p-4 border border-slate-200 shadow-soft hover:shadow-md hover:border-pizza-400 transition-all cursor-pointer flex flex-col justify-between overflow-hidden select-none active:scale-[0.98] ${
                      !product.isAvailable ? "opacity-60 cursor-not-allowed bg-slate-50" : ""
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 truncate">
                          {product.category?.name || "Menu"}
                        </span>
                        {isPizza ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-pizza-50 px-2 py-0.5 text-[9px] font-extrabold text-pizza-600">
                            <Sparkles className="h-2.5 w-2.5" />
                            Customizable
                          </span>
                        ) : !product.isAvailable ? (
                          <span className="text-[9px] font-bold text-white uppercase bg-rose-600 px-1.5 py-0.5 rounded">
                            Sold Out
                          </span>
                        ) : null}
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-pizza-600 transition-colors">
                        {product.name}
                      </h3>

                      {product.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight font-normal">
                          {product.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        {isPizza && (
                          <span className="text-[10px] font-medium text-slate-400 block leading-none">From</span>
                        )}
                        <span className="text-xs font-black text-pizza-600">
                          {formatCurrency(displayPrice)}
                        </span>
                      </div>
                      <span className="h-8 w-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-pizza-500 group-hover:text-white transition-all shadow-sm">
                        <Plus className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No items found"
              description="Try adjusting your search query or selecting another category."
              icon={UtensilsCrossed}
            />
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Shopping Cart Terminal */}
      <div className="w-full lg:w-96 h-full flex-shrink-0">
        <POSCartPanel />
      </div>

      {/* POS Pizza Customization Dialog */}
      {selectedPizzaItem && (
        <POSPizzaModal
          isOpen={!!selectedPizzaItem}
          onClose={() => setSelectedPizzaItem(null)}
          product={selectedPizzaItem}
        />
      )}
    </div>
  );
}
