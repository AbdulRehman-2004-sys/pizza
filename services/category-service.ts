import prisma from "@/lib/prisma";
import { CategoryInput } from "@/validators/category";

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
      menuItems: true,
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

  return prisma.category.create({
    data: {
      ...data,
      name: data.name.trim(),
    },
  });
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

  return prisma.category.update({
    where: { id },
    data: {
      ...data,
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
