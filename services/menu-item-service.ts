import prisma from "@/lib/prisma";

export async function getAllMenuItems(categoryId?: string, search?: string) {
  return prisma.menuItem.findMany({
    where: {
      categoryId: categoryId || undefined,
      name: search
        ? {
            contains: search,
            mode: "insensitive",
          }
        : undefined,
    },
    orderBy: { createdAt: "desc" },
    include: {
      category: {
        select: { id: true, name: true, categoryType: true },
      },
      itemPrices: {
        include: {
          size: true,
        },
      },
    },
  });
}

export async function getMenuItemById(id: string) {
  return prisma.menuItem.findUnique({
    where: { id },
    include: {
      category: true,
      itemPrices: {
        include: {
          size: true,
        },
      },
    },
  });
}

export async function createMenuItem(data: any) {
  const isPizza =
    data.isCustomizable ||
    data.allowSizes ||
    data.smallPrice !== undefined ||
    data.mediumPrice !== undefined ||
    data.largePrice !== undefined ||
    data.xlPrice !== undefined;

  const item = await prisma.menuItem.create({
    data: {
      categoryId: data.categoryId,
      name: data.name.trim(),
      description: data.description || null,
      basePrice: Number(data.basePrice) || 0,
      isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
      isCustomizable: isPizza ? true : (data.isCustomizable || false),
      allowSizes: isPizza ? true : (data.allowSizes || false),
      allowExtraCheese: isPizza ? true : (data.allowExtraCheese || false),
      allowExtraToppings: isPizza ? true : (data.allowExtraToppings || false),
      allowNotes: isPizza ? true : (data.allowNotes !== undefined ? data.allowNotes : true),
    },
  });

  // Handle Pizza sizes if provided
  if (data.smallPrice !== undefined || data.mediumPrice !== undefined || data.largePrice !== undefined || data.xlPrice !== undefined) {
    const sizesMap: { [key: string]: number | undefined } = {
      Small: data.smallPrice !== undefined ? Number(data.smallPrice) : undefined,
      Medium: data.mediumPrice !== undefined ? Number(data.mediumPrice) : undefined,
      Large: data.largePrice !== undefined ? Number(data.largePrice) : undefined,
      XL: data.xlPrice !== undefined ? Number(data.xlPrice) : undefined,
    };

    for (const [sizeName, priceVal] of Object.entries(sizesMap)) {
      if (priceVal !== undefined && priceVal > 0) {
        let sizeObj = await prisma.pizzaSize.findFirst({ where: { name: sizeName } });
        if (!sizeObj) {
          sizeObj = await prisma.pizzaSize.create({ data: { name: sizeName } });
        }
        await prisma.menuItemPrice.create({
          data: {
            menuItemId: item.id,
            sizeId: sizeObj.id,
            price: priceVal,
          },
        });
      }
    }
  }

  return item;
}

export async function updateMenuItem(id: string, data: any) {
  const isPizza =
    data.isCustomizable ||
    data.allowSizes ||
    data.smallPrice !== undefined ||
    data.mediumPrice !== undefined ||
    data.largePrice !== undefined ||
    data.xlPrice !== undefined;

  const updateData: any = {
    categoryId: data.categoryId ? data.categoryId : undefined,
    name: data.name ? data.name.trim() : undefined,
    description: data.description !== undefined ? data.description : undefined,
    basePrice: data.basePrice !== undefined ? Number(data.basePrice) : undefined,
    isAvailable: data.isAvailable !== undefined ? data.isAvailable : undefined,
  };

  if (isPizza) {
    updateData.isCustomizable = true;
    updateData.allowSizes = true;
    updateData.allowExtraCheese = true;
    updateData.allowExtraToppings = true;
    updateData.allowNotes = true;
  }

  const updated = await prisma.menuItem.update({
    where: { id },
    data: updateData,
  });

  // Handle Small, Medium, Large, XL prices if provided
  if (data.smallPrice !== undefined || data.mediumPrice !== undefined || data.largePrice !== undefined || data.xlPrice !== undefined) {
    const sizesMap: { [key: string]: number | undefined } = {
      Small: data.smallPrice !== undefined ? Number(data.smallPrice) : undefined,
      Medium: data.mediumPrice !== undefined ? Number(data.mediumPrice) : undefined,
      Large: data.largePrice !== undefined ? Number(data.largePrice) : undefined,
      XL: data.xlPrice !== undefined ? Number(data.xlPrice) : undefined,
    };

    for (const [sizeName, priceVal] of Object.entries(sizesMap)) {
      if (priceVal !== undefined && priceVal >= 0) {
        let sizeObj = await prisma.pizzaSize.findFirst({ where: { name: sizeName } });
        if (!sizeObj) {
          sizeObj = await prisma.pizzaSize.create({ data: { name: sizeName } });
        }
        await prisma.menuItemPrice.upsert({
          where: {
            menuItemId_sizeId: {
              menuItemId: id,
              sizeId: sizeObj.id,
            },
          },
          update: { price: priceVal },
          create: {
            menuItemId: id,
            sizeId: sizeObj.id,
            price: priceVal,
          },
        });
      }
    }
  }

  return updated;
}

export async function deleteMenuItem(id: string) {
  return prisma.menuItem.delete({
    where: { id },
  });
}
