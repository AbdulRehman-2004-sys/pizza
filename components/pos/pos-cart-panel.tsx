"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/use-cart-store";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { ThermalKOT } from "@/components/pos/thermal-kot";
import { PaymentModal } from "@/components/billing/payment-modal";
import { ThermalReceipt } from "@/components/billing/thermal-receipt";
import {
  Utensils,
  ShoppingBag,
  Truck,
  Plus,
  Minus,
  Trash2,
  Tag,
  CheckCircle2,
  User,
  Phone,
  MapPin,
  Grid2X2,
  Pizza,
  ChefHat,
  Receipt,
} from "lucide-react";
import { toast } from "sonner";

export interface POSTableWithStatus {
  id: string;
  tableNumber: number;
  tableName: string;
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED";
}

export function POSCartPanel() {
  const router = useRouter();
  const {
    activeOrderId,
    activeOrderNumber,
    orderType,
    selectedTable,
    customer,
    items,
    discount,
    orderNotes,
    setActiveOrder,
    setOrderType,
    setSelectedTable,
    setCustomer,
    setDiscount,
    setOrderNotes,
    updateQuantity,
    removeItem,
    markItemsAsSent,
    clearCart,
  } = useCartStore();

  const [availableTables, setAvailableTables] = useState<POSTableWithStatus[]>([]);
  const [taxPercentage, setTaxPercentage] = useState(16.0);
  const [isSubmittingKOT, setIsSubmittingKOT] = useState(false);
  const [isSubmittingBill, setIsSubmittingBill] = useState(false);

  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);

  // KOT Print Modal State
  const [activeKotTicket, setActiveKotTicket] = useState<any | null>(null);

  // Billing Modal & Thermal Receipt States
  const [orderForPayment, setOrderForPayment] = useState<any | null>(null);
  const [activeFinalReceipt, setActiveFinalReceipt] = useState<any | null>(null);

  // Discount Form Local State
  const [discountType, setDiscountType] = useState<"PERCENT" | "FIXED">("PERCENT");
  const [discountValue, setDiscountValue] = useState(0);

  // Delivery Customer Input Local State
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custAddress, setCustAddress] = useState("");
  const [isSearchingCust, setIsSearchingCust] = useState(false);

  // Load available tables & store settings
  const fetchPOSInitData = async () => {
    try {
      const [tablesRes, settingsRes] = await Promise.all([
        fetch("/api/pos/tables"),
        fetch("/api/settings"),
      ]);

      const [tablesJson, settingsJson] = await Promise.all([
        tablesRes.json(),
        settingsRes.json(),
      ]);

      if (tablesRes.ok && tablesJson.success) {
        setAvailableTables(tablesJson.data);
      }
      if (settingsRes.ok && settingsJson.success && settingsJson.data) {
        setTaxPercentage(settingsJson.data.taxPercentage ?? 16.0);
      }
    } catch (error) {
      console.error("Failed to load POS init data:", error);
    }
  };

  useEffect(() => {
    fetchPOSInitData();

    const handleSettingsUpdate = () => fetchPOSInitData();
    window.addEventListener("settings-updated", handleSettingsUpdate);
    return () => window.removeEventListener("settings-updated", handleSettingsUpdate);
  }, []);

  // Customer Phone Auto-Search
  const handlePhoneBlur = async () => {
    if (!custPhone || custPhone.trim().length < 5) return;
    try {
      setIsSearchingCust(true);
      const res = await fetch(`/api/customers?phone=${encodeURIComponent(custPhone.trim())}`);
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        setCustName(json.data.name);
        if (json.data.address) setCustAddress(json.data.address);
        toast.info(`Found existing customer: ${json.data.name}`);
      }
    } catch (error) {
      console.error("Customer search error:", error);
    } finally {
      setIsSearchingCust(false);
    }
  };

  // Keep customer store synced when on Delivery mode
  useEffect(() => {
    if (orderType === "DELIVERY") {
      setCustomer({
        name: custName,
        phone: custPhone,
        address: custAddress,
      });
    }
  }, [orderType, custName, custPhone, custAddress, setCustomer]);

  // Financial Calculations
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

  let discountAmount = 0;
  if (discount.value > 0) {
    if (discount.type === "PERCENT") {
      discountAmount = (subtotal * discount.value) / 100;
    } else {
      discountAmount = discount.value;
    }
  }
  discountAmount = Math.min(discountAmount, subtotal);
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = (taxableAmount * taxPercentage) / 100;
  const grandTotal = taxableAmount + taxAmount;

  // Build Payload
  const getOrderPayload = () => {
    return {
      orderId: activeOrderId || undefined,
      type: orderType,
      tableId: orderType === "DINE_IN" ? selectedTable?.id : undefined,
      tableNumber: orderType === "DINE_IN" ? selectedTable?.tableNumber : undefined,
      customer:
        orderType === "DELIVERY"
          ? {
              name: custName.trim(),
              phone: custPhone.trim(),
              address: custAddress.trim(),
            }
          : undefined,
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount: grandTotal,
      items: items.map((item) => ({
        productId: item.productId,
        productName: item.name,
        sizeId: item.size?.id,
        sizeName: item.size?.name,
        extraCheese: item.extraCheese || false,
        cheesePrice: item.cheesePrice || 0,
        selectedToppings: item.toppings || undefined,
        itemNotes: item.itemNotes,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
      discount: discount.value > 0 ? discount : undefined,
      customerNotes: orderNotes.trim() || undefined,
    };
  };

  // Validation Check
  const validateOrderInputs = () => {
    if (items.length === 0) {
      toast.error("Cart is empty! Add items before proceeding.");
      return false;
    }

    if (orderType === "DINE_IN" && !selectedTable) {
      toast.error("Please select an available dining table for Dine-In orders!");
      return false;
    }

    if (orderType === "DELIVERY") {
      if (!custName.trim() || !custPhone.trim() || !custAddress.trim()) {
        toast.error("Please enter Customer Name, Phone, and Delivery Address!");
        return false;
      }
    }
    return true;
  };

  // 1. HANDLE KOT BUTTON CLICK
  const handleKOT = async () => {
    if (!validateOrderInputs()) return;

    try {
      setIsSubmittingKOT(true);
      const payload = getOrderPayload();

      const res = await fetch("/api/pos/kot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: activeOrderId || undefined,
          orderData: payload,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error || "Failed to generate KOT");
        return;
      }

      const kotData = json.data;
      toast.success(`🍳 KOT #${kotData.kotNumber} generated for kitchen! POS ready for next order.`);

      // Show Thermal KOT preview & auto-trigger browser window.print()
      setActiveKotTicket({
        restaurantName: kotData.restaurantName || "SliceMaster Pizzeria",
        kotNumber: kotData.kotNumber,
        orderNumber: kotData.order.orderNumber,
        createdAt: kotData.createdAt,
        orderType: kotData.order.type,
        tableNumber: kotData.order.tableNumber,
        customerName: kotData.order.customer?.name,
        customerPhone: kotData.order.customer?.phone,
        customerNotes: kotData.order.customerNotes,
        items: kotData.items,
      });

      // Clear POS cart terminal for the next customer
      clearCart();
      setCustName("");
      setCustPhone("");
      setCustAddress("");
      fetchPOSInitData(); // Refresh tables status

      // Redirect admin to Order Management page
      router.push("/orders");
    } catch (error) {
      console.error("KOT creation error:", error);
      toast.error("Network error generating KOT");
    } finally {
      setIsSubmittingKOT(false);
    }
  };

  // 2. HANDLE FINAL BILL BUTTON CLICK
  const handleFinalBill = async () => {
    if (!validateOrderInputs()) return;

    try {
      setIsSubmittingBill(true);
      const payload = getOrderPayload();

      // Ensure order is saved/updated in database first
      const res = await fetch("/api/pos/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error || "Failed to prepare order for billing");
        return;
      }

      const savedOrder = json.data;
      setActiveOrder(savedOrder.id, savedOrder.orderNumber);

      // Open Payment Modal
      setOrderForPayment({
        id: savedOrder.id,
        orderNumber: savedOrder.orderNumber,
        totalAmount: savedOrder.totalAmount,
        subtotal: savedOrder.subtotal,
        taxAmount: savedOrder.taxAmount,
        discountAmount: savedOrder.discountAmount,
        type: savedOrder.type,
        tableNumber: savedOrder.tableNumber,
        customer: savedOrder.customer,
      });
    } catch (error) {
      console.error("Final Bill error:", error);
      toast.error("Network error preparing final bill");
    } finally {
      setIsSubmittingBill(false);
    }
  };

  // Handle Payment Confirmation Success
  const handlePaymentSuccess = async (paymentResult: any) => {
    try {
      // Fetch full order data for thermal receipt printing
      const res = await fetch(`/api/orders/${paymentResult.orderId}`);
      const json = await res.json();
      const settingsRes = await fetch("/api/settings");
      const settingsJson = await settingsRes.json();

      if (res.ok && json.success) {
        setActiveFinalReceipt({
          settings: settingsJson.data || {
            restaurantName: "SliceMaster Pizzeria",
            address: "Main Boulevard, Gulberg III, Lahore, Pakistan",
            phone: "+92 42 111 749 922",
            receiptFooter: "Thank you for dining with SliceMaster!",
          },
          order: json.data,
        });
      }
    } catch (error) {
      console.error("Fetch receipt detail error:", error);
    }

    // Clear active POS cart after successful payment
    clearCart();
    setCustName("");
    setCustPhone("");
    setCustAddress("");
    fetchPOSInitData();
  };

  return (
    <div className="flex h-full flex-col bg-white border-l border-slate-200 shadow-soft">
      {/* 1. Order Type Selector Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
            {activeOrderNumber ? `Active Order: ${activeOrderNumber}` : "New POS Order"}
          </span>
          {activeOrderId && (
            <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
              KOT Sent
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-200/60 rounded-2xl">
          <button
            onClick={() => setOrderType("DINE_IN")}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              orderType === "DINE_IN"
                ? "bg-white text-pizza-600 shadow-md shadow-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Utensils className="h-4 w-4" />
            <span>Dine In</span>
          </button>

          <button
            onClick={() => setOrderType("TAKEOUT")}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              orderType === "TAKEOUT"
                ? "bg-white text-pizza-600 shadow-md shadow-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Take Away</span>
          </button>

          <button
            onClick={() => setOrderType("DELIVERY")}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              orderType === "DELIVERY"
                ? "bg-white text-pizza-600 shadow-md shadow-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Truck className="h-4 w-4" />
            <span>Delivery</span>
          </button>
        </div>
      </div>

      {/* 2. Dynamic Input Context Section */}
      <div className="p-4 border-b border-slate-100 bg-white space-y-3">
        {orderType === "DINE_IN" && (
          <div>
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Grid2X2 className="h-3.5 w-3.5 text-pizza-500" />
              Select Table Location & Status
            </label>
            <select
              value={selectedTable?.id || ""}
              onChange={(e) => {
                const found = availableTables.find((t) => t.id === e.target.value);
                if (found?.status === "OCCUPIED" && found.id !== selectedTable?.id) {
                  toast.error(`Table #${found.tableNumber} is currently occupied!`);
                  return;
                }
                setSelectedTable(found ? { id: found.id, tableNumber: found.tableNumber, tableName: found.tableName } : null);
              }}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pizza-500"
            >
              <option value="">-- Select Dining Table --</option>
              {availableTables.map((t) => (
                <option key={t.id} value={t.id} disabled={t.status === "OCCUPIED" && t.id !== selectedTable?.id}>
                  Table #{t.tableNumber} - {t.tableName} ({t.status})
                </option>
              ))}
            </select>
          </div>
        )}

        {orderType === "DELIVERY" && (
          <div className="space-y-2">
            <Input
              placeholder="Phone Number (Auto Lookup)"
              value={custPhone}
              onChange={(e) => setCustPhone(e.target.value)}
              onBlur={handlePhoneBlur}
              leftIcon={<Phone className="h-3.5 w-3.5" />}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Customer Name"
                value={custName}
                onChange={(e) => setCustName(e.target.value)}
                leftIcon={<User className="h-3.5 w-3.5" />}
              />
              <Input
                placeholder="Delivery Address"
                value={custAddress}
                onChange={(e) => setCustAddress(e.target.value)}
                leftIcon={<MapPin className="h-3.5 w-3.5" />}
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Cart Items Scroll List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400">
            <Pizza className="h-10 w-10 text-slate-300 mb-2" />
            <p className="text-xs font-bold">Cart is empty</p>
            <p className="text-[11px] text-slate-400">Click menu items to start building order</p>
          </div>
        ) : (
          items.map((item) => {
            const sentQty = item.sentQuantity || 0;
            const unsentQty = Math.max(0, item.quantity - sentQty);

            return (
              <div
                key={item.cartItemId}
                className="rounded-2xl bg-slate-50 p-3 border border-slate-200/80 space-y-2 relative group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">{item.name}</h4>
                      {sentQty > 0 && (
                        <span className="text-[9px] font-extrabold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                          Sent: {sentQty}
                        </span>
                      )}
                      {unsentQty > 0 && (
                        <span className="text-[9px] font-extrabold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                          New: {unsentQty}
                        </span>
                      )}
                    </div>
                    {item.size && (
                      <span className="inline-block mt-0.5 text-[10px] font-bold text-pizza-600 bg-pizza-50 px-2 py-0.5 rounded-md">
                        {item.size.name}
                      </span>
                    )}
                  </div>

                  {sentQty === 0 && (
                    <button
                      onClick={() => removeItem(item.cartItemId)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Customizations summary */}
                {(item.extraCheese || (item.toppings && item.toppings.length > 0) || item.itemDiscount || item.itemNotes) && (
                  <div className="text-[10px] text-slate-500 space-y-0.5 pl-1 border-l-2 border-pizza-200">
                    {item.extraCheese && <p className="font-semibold text-amber-700">+ Extra Cheese</p>}
                    {item.toppings && item.toppings.length > 0 && (
                      <p className="truncate">+ {item.toppings.map((t) => t.name).join(", ")}</p>
                    )}
                    {item.itemDiscount && item.itemDiscount.value > 0 && (
                      <p className="font-bold text-emerald-600">
                        Discount: -{item.itemDiscount.value}{item.itemDiscount.type === "PERCENT" ? "%" : " Rs"}
                      </p>
                    )}
                    {item.itemNotes && <p className="italic text-slate-400">"{item.itemNotes}"</p>}
                  </div>
                )}

                {/* Quantity Stepper & Subtotal */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                  <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-xl border border-slate-200">
                    <button
                      onClick={() => updateQuantity(item.cartItemId, -1)}
                      className="text-slate-500 hover:text-slate-900 font-bold disabled:opacity-30"
                      disabled={item.quantity <= (item.sentQuantity || 0)}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-xs font-black text-slate-900 w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.cartItemId, 1)}
                      className="text-slate-500 hover:text-slate-900 font-bold"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <span className="text-xs font-black text-slate-900">{formatCurrency(item.totalPrice)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. Discount & Order Notes Bar */}
      <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2">
        <button
          onClick={() => setIsDiscountModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <Tag className="h-3.5 w-3.5 text-pizza-500" />
          <span>Discount: {discount.value > 0 ? `${discount.value}${discount.type === "PERCENT" ? "%" : " Rs"}` : "None"}</span>
        </button>

        <Input
          placeholder="General order notes..."
          value={orderNotes}
          onChange={(e) => setOrderNotes(e.target.value)}
          className="h-8 text-xs bg-white"
        />
      </div>

      {/* 5. Totals & Dual Action Buttons Panel */}
      <div className="p-4 border-t border-slate-200 bg-slate-900 text-white space-y-3">
        <div className="space-y-1 text-xs text-slate-300">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span className="font-bold text-white">{formatCurrency(subtotal)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex items-center justify-between text-emerald-400">
              <span>Discount</span>
              <span className="font-bold">-{formatCurrency(discountAmount)}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span>Sales Tax ({taxPercentage}%)</span>
            <span className="font-bold text-white">{formatCurrency(taxAmount)}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold uppercase text-slate-400">Grand Total</span>
          <span className="text-2xl font-black text-pizza-400">{formatCurrency(grandTotal)}</span>
        </div>

        {/* KOT ACTION BUTTON */}
        <div className="pt-1">
          <Button
            size="lg"
            onClick={handleKOT}
            isLoading={isSubmittingKOT}
            disabled={items.length === 0}
            className="w-full h-12 text-sm font-black bg-pizza-500 hover:bg-pizza-600 text-white shadow-lg shadow-pizza-500/25 active:scale-[0.98]"
            leftIcon={<ChefHat className="h-5 w-5" />}
          >
            Send KOT to Kitchen ({formatCurrency(grandTotal)})
          </Button>
        </div>
      </div>

      {/* Discount Modal */}
      <Modal
        isOpen={isDiscountModalOpen}
        onClose={() => setIsDiscountModalOpen(false)}
        title="Apply Order Discount"
        description="Choose percentage or fixed amount discount"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsDiscountModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setDiscount({ type: discountType, value: Number(discountValue) });
                setIsDiscountModalOpen(false);
                toast.success("Discount applied!");
              }}
            >
              Apply Discount
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setDiscountType("PERCENT")}
              className={`p-3 rounded-2xl border text-xs font-bold ${
                discountType === "PERCENT"
                  ? "bg-pizza-500 text-white border-pizza-500"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              Percentage (%)
            </button>
            <button
              onClick={() => setDiscountType("FIXED")}
              className={`p-3 rounded-2xl border text-xs font-bold ${
                discountType === "FIXED"
                  ? "bg-pizza-500 text-white border-pizza-500"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              Fixed Amount (Rs.)
            </button>
          </div>

          <Input
            label={`Discount Value (${discountType === "PERCENT" ? "%" : "Rs."})`}
            type="number"
            value={discountValue}
            onChange={(e) => setDiscountValue(Number(e.target.value))}
          />
        </div>
      </Modal>

      {/* 80mm Thermal KOT Print Preview Modal */}
      {activeKotTicket && (
        <ThermalKOT
          restaurantName={activeKotTicket.restaurantName}
          kotNumber={activeKotTicket.kotNumber}
          orderNumber={activeKotTicket.orderNumber}
          createdAt={activeKotTicket.createdAt}
          orderType={activeKotTicket.orderType}
          tableNumber={activeKotTicket.tableNumber}
          customerName={activeKotTicket.customerName}
          customerPhone={activeKotTicket.customerPhone}
          customerNotes={activeKotTicket.customerNotes}
          items={activeKotTicket.items}
          onClose={() => setActiveKotTicket(null)}
        />
      )}

      {/* Payment Processing Modal */}
      {orderForPayment && (
        <PaymentModal
          isOpen={!!orderForPayment}
          onClose={() => setOrderForPayment(null)}
          onSuccess={handlePaymentSuccess}
          order={orderForPayment}
        />
      )}

      {/* Final Customer Thermal Receipt Modal */}
      {activeFinalReceipt && (
        <ThermalReceipt
          data={activeFinalReceipt}
          onClose={() => setActiveFinalReceipt(null)}
        />
      )}
    </div>
  );
}
