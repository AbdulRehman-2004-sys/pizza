import prisma, { safeDbQuery } from "@/lib/prisma";
import { SettingsInput } from "@/validators/settings";

const DEFAULT_SETTINGS = {
  id: "default-settings",
  restaurantName: "SliceMaster Pizzeria",
  logoUrl: null,
  address: "Main Boulevard, Gulberg III, Lahore, Pakistan",
  phone: "+92 42 111 749 922",
  receiptFooter: "Thank you for dining with SliceMaster! Visit again.",
  currency: "PKR",
  timezone: "Asia/Karachi",
  taxPercentage: 16.0,
};

export async function getRestaurantSettings() {
  return safeDbQuery(
    async () => {
      let settings = await prisma.restaurantSettings.findFirst();
      if (!settings) {
        settings = await prisma.restaurantSettings.create({
          data: {
            restaurantName: DEFAULT_SETTINGS.restaurantName,
            address: DEFAULT_SETTINGS.address,
            phone: DEFAULT_SETTINGS.phone,
            receiptFooter: DEFAULT_SETTINGS.receiptFooter,
            currency: DEFAULT_SETTINGS.currency,
            timezone: DEFAULT_SETTINGS.timezone,
            taxPercentage: DEFAULT_SETTINGS.taxPercentage,
          },
        });
      }
      return settings;
    },
    2,
    DEFAULT_SETTINGS as any
  );
}

export async function updateRestaurantSettings(data: SettingsInput) {
  return safeDbQuery(async () => {
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
  });
}
