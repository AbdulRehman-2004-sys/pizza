import prisma from "@/lib/prisma";
import { CategoryInput } from "@/validators/category";
import { createMenuItem } from "@/services/menu-item-service";

export async function getAllCategories(includeInactive: boolean = true) {
  return prisma.category.findMany({
    where: includeInactive ? undefined : { isActive: true },
    orderBy: { displayOrder: "asc" },
    include: {
      _count: {
        select: { menuItems: true },
      },
    },
  });
}

export async function getCategoryById(id: string) {
  return prisma.category.findUnique({
    where: { id },
    include: {
      menuItems: {
        include: {
          itemPrices: {
            include: {
              size: true,
            },
          },
        },
        orderBy: { name: "asc" },
      },
    },
  });
}

export async function createCategory(data: CategoryInput) {
  const existing = await prisma.category.findUnique({
    where: { name: data.name.trim() },
  });

  if (existing) {
    throw new Error(`Category "${data.name}" already exists.`);
  }

  const { items, ...categoryData } = data;

  const category = await prisma.category.create({
    data: {
      ...categoryData,
      name: data.name.trim(),
    },
  });

  // Create attached menu items if provided
  if (Array.isArray(items) && items.length > 0) {
    for (const itemData of items) {
      if (!itemData.name || !itemData.name.trim()) continue;
      await createMenuItem({
        categoryId: category.id,
        name: itemData.name.trim(),
        basePrice: itemData.basePrice ?? 0,
        isCustomizable: categoryData.categoryType === "PIZZA",
        allowSizes: categoryData.categoryType === "PIZZA",
        smallPrice: itemData.smallPrice,
        mediumPrice: itemData.mediumPrice,
        largePrice: itemData.largePrice,
      });
    }
  }

  return category;
}

export async function updateCategory(id: string, data: CategoryInput) {
  const existingWithName = await prisma.category.findFirst({
    where: {
      name: data.name.trim(),
      NOT: { id },
    },
  });

  if (existingWithName) {
    throw new Error(`Category name "${data.name}" is already taken.`);
  }

  const { items, ...categoryData } = data;

  return prisma.category.update({
    where: { id },
    data: {
      ...categoryData,
      name: data.name.trim(),
    },
  });
}

export async function deleteCategory(id: string) {
  const itemsCount = await prisma.menuItem.count({
    where: { categoryId: id },
  });

  if (itemsCount > 0) {
    throw new Error(`Cannot delete category because it contains ${itemsCount} menu item(s). Reassign or delete the items first.`);
  }

  return prisma.category.delete({
    where: { id },
  });
}
