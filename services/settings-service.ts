import prisma from "@/lib/prisma";
import { SettingsInput } from "@/validators/settings";

export async function getRestaurantSettings() {
  let settings = await prisma.restaurantSettings.findFirst();
  if (!settings) {
    settings = await prisma.restaurantSettings.create({
      data: {
        restaurantName: "SliceMaster Pizzeria",
        address: "Main Boulevard, Gulberg III, Lahore, Pakistan",
        phone: "+92 42 111 749 922",
        receiptFooter: "Thank you for dining with SliceMaster! Visit again.",
        currency: "PKR",
        timezone: "Asia/Karachi",
        taxPercentage: 16.0,
      },
    });
  }
  return settings;
}

export async function updateRestaurantSettings(data: SettingsInput) {
  const existing = await prisma.restaurantSettings.findFirst();
  const payload = {
    restaurantName: data.restaurantName,
    logoUrl: data.logoUrl || null,
    address: data.address,
    phone: data.phone,
    receiptFooter: data.receiptFooter,
    currency: data.currency || "PKR",
    timezone: data.timezone || "Asia/Karachi",
    taxPercentage: Number(data.taxPercentage),
  };

  if (existing) {
    return prisma.restaurantSettings.update({
      where: { id: existing.id },
      data: payload,
    });
  }
  return prisma.restaurantSettings.create({
    data: payload,
  });
}
