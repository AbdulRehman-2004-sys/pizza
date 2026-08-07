import prisma from "@/lib/prisma";
import { ExtraToppingInput } from "@/validators/pizza-config";

export async function getAllExtraToppings() {
  return prisma.extraTopping.findMany({
    orderBy: { displayOrder: "asc" },
  });
}

export async function getExtraToppingById(id: string) {
  return prisma.extraTopping.findUnique({
    where: { id },
  });
}

export async function createExtraTopping(data: ExtraToppingInput) {
  const existing = await prisma.extraTopping.findUnique({
    where: { name: data.name.trim() },
  });

  if (existing) {
    throw new Error(`Topping "${data.name}" already exists.`);
  }

  return prisma.extraTopping.create({
    data: {
      name: data.name.trim(),
      price: data.price,
      displayOrder: data.displayOrder,
      isAvailable: data.isAvailable,
    },
  });
}

export async function updateExtraTopping(id: string, data: ExtraToppingInput) {
  const existingWithName = await prisma.extraTopping.findFirst({
    where: {
      name: data.name.trim(),
      NOT: { id },
    },
  });

  if (existingWithName) {
    throw new Error(`Topping name "${data.name}" is already taken.`);
  }

  return prisma.extraTopping.update({
    where: { id },
    data: {
      name: data.name.trim(),
      price: data.price,
      displayOrder: data.displayOrder,
      isAvailable: data.isAvailable,
    },
  });
}

export async function deleteExtraTopping(id: string) {
  return prisma.extraTopping.delete({
    where: { id },
  });
}
