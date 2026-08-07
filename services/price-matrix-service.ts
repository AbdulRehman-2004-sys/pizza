import prisma from "@/lib/prisma";
import { MenuItemCustomizationInput } from "@/validators/pizza-config";

export async function getMenuItemCustomization(menuItemId: string) {
  const menuItem = await prisma.menuItem.findUnique({
    where: { id: menuItemId },
    include: {
      itemPrices: {
        include: {
          size: true,
        },
      },
    },
  });

  return menuItem;
}

export async function saveMenuItemCustomization(menuItemId: string, input: MenuItemCustomizationInput) {
  // Update boolean customization flags
  const updatedItem = await prisma.menuItem.update({
    where: { id: menuItemId },
    data: {
      isCustomizable: input.isCustomizable,
      allowSizes: input.allowSizes,
      allowExtraCheese: input.allowExtraCheese,
      allowExtraToppings: input.allowExtraToppings,
      allowNotes: input.allowNotes,
      maxNotesLength: input.maxNotesLength,
      notesPlaceholder: input.notesPlaceholder,
    },
  });

  // Upsert size prices if provided
  if (input.prices && input.prices.length > 0) {
    for (const itemPrice of input.prices) {
      await prisma.menuItemPrice.upsert({
        where: {
          menuItemId_sizeId: {
            menuItemId,
            sizeId: itemPrice.sizeId,
          },
        },
        update: {
          price: itemPrice.price,
        },
        create: {
          menuItemId,
          sizeId: itemPrice.sizeId,
          price: itemPrice.price,
        },
      });
    }
  }

  return getMenuItemCustomization(menuItemId);
}
