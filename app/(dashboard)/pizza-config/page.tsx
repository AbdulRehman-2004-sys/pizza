"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { PizzaCustomizationModal } from "@/components/menu/pizza-customization-modal";
import { formatCurrency } from "@/lib/utils";
import {
  Pizza,
  Layers,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Sparkles,
  UtensilsCrossed,
  Settings2,
} from "lucide-react";
import { toast } from "sonner";

export default function PizzaConfigPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [activeTab, setActiveTab] = useState<"sizes" | "toppings" | "cheese" | "matrix">("sizes");

  // State
  const [sizes, setSizes] = useState<any[]>([]);
  const [toppings, setToppings] = useState<any[]>([]);
  const [cheeseConfig, setCheeseConfig] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Size Modal State
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
  const [editingSize, setEditingSize] = useState<any | null>(null);
  const [sizeName, setSizeName] = useState("");
  const [sizeOrder, setSizeOrder] = useState(1);
  const [sizeActive, setSizeActive] = useState(true);

  // Topping Modal State
  const [isToppingModalOpen, setIsToppingModalOpen] = useState(false);
  const [editingTopping, setEditingTopping] = useState<any | null>(null);
  const [toppingName, setToppingName] = useState("");
  const [toppingPrice, setToppingPrice] = useState(200);
  const [toppingOrder, setToppingOrder] = useState(1);
  const [toppingAvailable, setToppingAvailable] = useState(true);

  // Cheese Form State
  const [cheesePrice, setCheesePrice] = useState(250);
  const [cheeseAvailable, setCheeseAvailable] = useState(true);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<{ type: "size" | "topping"; id: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Customization Modal State
  const [selectedMenuItem, setSelectedMenuItem] = useState<any | null>(null);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const [sizesRes, toppingsRes, cheeseRes, itemsRes] = await Promise.all([
        fetch("/api/pizza-config/sizes"),
        fetch("/api/pizza-config/toppings"),
        fetch("/api/pizza-config/cheese"),
        fetch("/api/menu-items"),
      ]);

      const [sizesJson, toppingsJson, cheeseJson, itemsJson] = await Promise.all([
        sizesRes.json(),
        toppingsRes.json(),
        cheeseRes.json(),
        itemsRes.json(),
      ]);

      if (sizesRes.ok && sizesJson.success) setSizes(sizesJson.data);
      if (toppingsRes.ok && toppingsJson.success) setToppings(toppingsJson.data);
      if (cheeseRes.ok && cheeseJson.success) {
        setCheeseConfig(cheeseJson.data);
        setCheesePrice(cheeseJson.data.extraPrice);
        setCheeseAvailable(cheeseJson.data.isAvailable);
      }
      if (itemsRes.ok && itemsJson.success) setMenuItems(itemsJson.data);
    } catch (error) {
      console.error("Failed to load pizza config data:", error);
      toast.error("Failed to load pizza configuration");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Size Form Handler
  const handleSaveSize = async () => {
    if (!sizeName.trim()) {
      toast.error("Please enter a size name");
      return;
    }
    try {
      const url = editingSize ? `/api/pizza-config/sizes/${editingSize.id}` : "/api/pizza-config/sizes";
      const method = editingSize ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: sizeName.trim(),
          displayOrder: Number(sizeOrder),
          isActive: sizeActive,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error || "Failed to save pizza size");
        return;
      }

      toast.success(`Pizza size ${editingSize ? "updated" : "created"} successfully!`);
      setIsSizeModalOpen(false);
      fetchAllData();
    } catch (error) {
      console.error("Save size error:", error);
      toast.error("Network error saving pizza size");
    }
  };

  // Topping Form Handler
  const handleSaveTopping = async () => {
    if (!toppingName.trim()) {
      toast.error("Please enter a topping name");
      return;
    }
    try {
      const url = editingTopping ? `/api/pizza-config/toppings/${editingTopping.id}` : "/api/pizza-config/toppings";
      const method = editingTopping ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: toppingName.trim(),
          price: Number(toppingPrice),
          displayOrder: Number(toppingOrder),
          isAvailable: toppingAvailable,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error || "Failed to save extra topping");
        return;
      }

      toast.success(`Extra topping ${editingTopping ? "updated" : "created"} successfully!`);
      setIsToppingModalOpen(false);
      fetchAllData();
    } catch (error) {
      console.error("Save topping error:", error);
      toast.error("Network error saving topping");
    }
  };

  // Cheese Form Handler
  const handleSaveCheese = async () => {
    try {
      const res = await fetch("/api/pizza-config/cheese", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Extra Mozzarella Cheese",
          extraPrice: Number(cheesePrice),
          isAvailable: cheeseAvailable,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error || "Failed to save extra cheese config");
        return;
      }

      toast.success("Extra cheese settings saved successfully!");
      fetchAllData();
    } catch (error) {
      console.error("Save cheese error:", error);
      toast.error("Network error saving extra cheese settings");
    }
  };

  // Delete Handler
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      const endpoint = deleteTarget.type === "size" ? `/api/pizza-config/sizes/${deleteTarget.id}` : `/api/pizza-config/toppings/${deleteTarget.id}`;
      const res = await fetch(endpoint, { method: "DELETE" });
      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error || `Failed to delete ${deleteTarget.type}`);
        return;
      }

      toast.success(`${deleteTarget.type === "size" ? "Pizza size" : "Topping"} deleted successfully!`);
      setDeleteTarget(null);
      fetchAllData();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Network error deleting item");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-pizza-50 p-3 text-pizza-500">
            <Pizza className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Pizza Configuration Engine</h1>
            <p className="text-xs text-slate-500">Manage pizza sizes, extra toppings, cheese settings, and relational pricing matrices</p>
          </div>
        </div>
      </div>

      {/* Tabs Control */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-soft overflow-x-auto">
        <button
          onClick={() => setActiveTab("sizes")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "sizes" ? "bg-pizza-500 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Pizza Sizes ({sizes.length})
        </button>

        <button
          onClick={() => setActiveTab("toppings")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "toppings" ? "bg-pizza-500 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Extra Toppings ({toppings.length})
        </button>

        <button
          onClick={() => setActiveTab("cheese")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "cheese" ? "bg-pizza-500 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Extra Cheese Option
        </button>

        <button
          onClick={() => setActiveTab("matrix")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "matrix" ? "bg-pizza-500 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Item Customization & Prices ({menuItems.length})
        </button>
      </div>

      {/* Tab 1: Pizza Sizes */}
      {activeTab === "sizes" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Configured Sizes</h3>
            {isAdmin && (
              <Button
                size="sm"
                onClick={() => {
                  setEditingSize(null);
                  setSizeName("");
                  setSizeOrder(sizes.length + 1);
                  setSizeActive(true);
                  setIsSizeModalOpen(true);
                }}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Add Pizza Size
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sizes.map((sz) => (
              <div key={sz.id} className="rounded-2xl bg-white p-5 border border-slate-200 shadow-soft flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-xs font-mono bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                      Order #{sz.displayOrder}
                    </span>
                    <Badge variant={sz.isActive ? "success" : "default"}>{sz.isActive ? "Active" : "Disabled"}</Badge>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">{sz.name}</h4>
                </div>

                {isAdmin && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-1">
                    <button
                      onClick={() => {
                        setEditingSize(sz);
                        setSizeName(sz.name);
                        setSizeOrder(sz.displayOrder);
                        setSizeActive(sz.isActive);
                        setIsSizeModalOpen(true);
                      }}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget({ type: "size", id: sz.id })}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Extra Toppings */}
      {activeTab === "toppings" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Extra Toppings Catalog</h3>
            {isAdmin && (
              <Button
                size="sm"
                onClick={() => {
                  setEditingTopping(null);
                  setToppingName("");
                  setToppingPrice(200);
                  setToppingOrder(toppings.length + 1);
                  setToppingAvailable(true);
                  setIsToppingModalOpen(true);
                }}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Add Extra Topping
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {toppings.map((top) => (
              <div key={top.id} className="rounded-2xl bg-white p-5 border border-slate-200 shadow-soft flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-xs font-mono bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                      Order #{top.displayOrder}
                    </span>
                    <Badge variant={top.isAvailable ? "success" : "danger"}>{top.isAvailable ? "Available" : "Sold Out"}</Badge>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">{top.name}</h4>
                  <p className="text-sm font-extrabold text-pizza-600 mt-1">{formatCurrency(top.price)}</p>
                </div>

                {isAdmin && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-1">
                    <button
                      onClick={() => {
                        setEditingTopping(top);
                        setToppingName(top.name);
                        setToppingPrice(top.price);
                        setToppingOrder(top.displayOrder);
                        setToppingAvailable(top.isAvailable);
                        setIsToppingModalOpen(true);
                      }}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget({ type: "topping", id: top.id })}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Extra Cheese */}
      {activeTab === "cheese" && (
        <div className="max-w-2xl bg-white p-6 rounded-3xl border border-slate-200 shadow-soft space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <Sparkles className="h-6 w-6 text-pizza-500" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Extra Cheese Global Configuration</h3>
              <p className="text-xs text-slate-500">Configure extra cheese add-on price and availability</p>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label="Extra Cheese Add-on Price (Rs.)"
              type="number"
              value={cheesePrice}
              onChange={(e) => setCheesePrice(Number(e.target.value))}
              disabled={!isAdmin}
            />

            <Switch
              label="Extra Cheese Available for Orders"
              checked={cheeseAvailable}
              onChange={(e) => setCheeseAvailable(e.target.checked)}
              disabled={!isAdmin}
            />

            {isAdmin && (
              <div className="pt-2 flex justify-end">
                <Button onClick={handleSaveCheese}>Save Cheese Config</Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Customization & Price Matrix */}
      {activeTab === "matrix" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Item Customization Matrix</h3>
            <span className="text-xs text-slate-500">Click configure to set size prices & toppings</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map((item) => (
              <div key={item.id} className="rounded-2xl bg-white p-5 border border-slate-200 shadow-soft flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase text-pizza-600 bg-pizza-50 px-2 py-0.5 rounded-md">
                      {item.category?.name || "Product"}
                    </span>
                    <Badge variant={item.isCustomizable ? "primary" : "default"}>
                      {item.isCustomizable ? "Customizable Pizza" : "Standard Product"}
                    </Badge>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">{item.name}</h4>
                  <p className="text-xs font-semibold text-slate-500 mt-1">Base Price: {formatCurrency(item.basePrice)}</p>
                </div>

                {isAdmin && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedMenuItem(item)}
                      leftIcon={<Settings2 className="h-3.5 w-3.5" />}
                    >
                      Configure Prices & Options
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pizza Size Modal */}
      <Modal
        isOpen={isSizeModalOpen}
        onClose={() => setIsSizeModalOpen(false)}
        title={editingSize ? "Edit Pizza Size" : "Add Pizza Size"}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsSizeModalOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSaveSize}>Save Size</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Size Name (e.g. Medium 12 inch)" value={sizeName} onChange={(e) => setSizeName(e.target.value)} />
          <Input label="Display Order" type="number" value={sizeOrder} onChange={(e) => setSizeOrder(Number(e.target.value))} />
          <Switch label="Active Size" checked={sizeActive} onChange={(e) => setSizeActive(e.target.checked)} />
        </div>
      </Modal>

      {/* Extra Topping Modal */}
      <Modal
        isOpen={isToppingModalOpen}
        onClose={() => setIsToppingModalOpen(false)}
        title={editingTopping ? "Edit Extra Topping" : "Add Extra Topping"}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsToppingModalOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSaveTopping}>Save Topping</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Topping Name (e.g. Grilled Chicken)" value={toppingName} onChange={(e) => setToppingName(e.target.value)} />
          <Input label="Price (Rs.)" type="number" value={toppingPrice} onChange={(e) => setToppingPrice(Number(e.target.value))} />
          <Input label="Display Order" type="number" value={toppingOrder} onChange={(e) => setToppingOrder(Number(e.target.value))} />
          <Switch label="Available for Orders" checked={toppingAvailable} onChange={(e) => setToppingAvailable(e.target.checked)} />
        </div>
      </Modal>

      {/* Item Price Matrix Modal */}
      {selectedMenuItem && (
        <PizzaCustomizationModal
          isOpen={!!selectedMenuItem}
          onClose={() => setSelectedMenuItem(null)}
          onSuccess={fetchAllData}
          menuItem={selectedMenuItem}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete ${deleteTarget?.type === "size" ? "Pizza Size" : "Extra Topping"}`}
        description="Are you sure you want to delete this configuration item?"
        isLoading={isDeleting}
      />
    </div>
  );
}
