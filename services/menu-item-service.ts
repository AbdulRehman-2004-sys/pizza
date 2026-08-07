import prisma from "@/lib/prisma";
import { MenuItemInput } from "@/validators/menu-item";

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
        select: { id: true, name: true },
      },
    },
  });
}

export async function getMenuItemById(id: string) {
  return prisma.menuItem.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });
}

export async function createMenuItem(data: MenuItemInput) {
  return prisma.menuItem.create({
    data: {
      categoryId: data.categoryId,
      name: data.name.trim(),
      description: data.description,
      basePrice: data.basePrice,
      image: data.image,
      isAvailable: data.isAvailable,
    },
  });
}

export async function updateMenuItem(id: string, data: MenuItemInput) {
  return prisma.menuItem.update({
    where: { id },
    data: {
      categoryId: data.categoryId,
      name: data.name.trim(),
      description: data.description,
      basePrice: data.basePrice,
      image: data.image,
      isAvailable: data.isAvailable,
    },
  });
}

export async function deleteMenuItem(id: string) {
  return prisma.menuItem.delete({
    where: { id },
  });
}
