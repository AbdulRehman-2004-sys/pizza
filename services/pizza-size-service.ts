import prisma from "@/lib/prisma";
import { PizzaSizeInput } from "@/validators/pizza-config";

export async function getAllPizzaSizes(includeInactive: boolean = true) {
  let sizes = await prisma.pizzaSize.findMany({
    where: includeInactive ? undefined : { isActive: true },
    orderBy: { displayOrder: "asc" },
  });

  const hasXL = sizes.some((s) => s.name.toLowerCase() === "xl" || s.name.toLowerCase() === "extra large");

  if (sizes.length === 0 || !hasXL) {
    const defaultSizes = [
      { name: "Small", displayOrder: 1 },
      { name: "Medium", displayOrder: 2 },
      { name: "Large", displayOrder: 3 },
      { name: "XL", displayOrder: 4 },
    ];
    for (const d of defaultSizes) {
      await prisma.pizzaSize.upsert({
        where: { name: d.name },
        update: {},
        create: { name: d.name, displayOrder: d.displayOrder },
      });
    }
    sizes = await prisma.pizzaSize.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: { displayOrder: "asc" },
    });
  }

  return sizes;
}

export async function getPizzaSizeById(id: string) {
  return prisma.pizzaSize.findUnique({
    where: { id },
  });
}

export async function createPizzaSize(data: PizzaSizeInput) {
  const existing = await prisma.pizzaSize.findUnique({
    where: { name: data.name.trim() },
  });

  if (existing) {
    throw new Error(`Pizza size "${data.name}" already exists.`);
  }

  return prisma.pizzaSize.create({
    data: {
      name: data.name.trim(),
      displayOrder: data.displayOrder,
      isActive: data.isActive,
    },
  });
}

export async function updatePizzaSize(id: string, data: PizzaSizeInput) {
  const existingWithName = await prisma.pizzaSize.findFirst({
    where: {
      name: data.name.trim(),
      NOT: { id },
    },
  });

  if (existingWithName) {
    throw new Error(`Pizza size "${data.name}" is already taken.`);
  }

  return prisma.pizzaSize.update({
    where: { id },
    data: {
      name: data.name.trim(),
      displayOrder: data.displayOrder,
      isActive: data.isActive,
    },
  });
}

export async function deletePizzaSize(id: string) {
  return prisma.pizzaSize.delete({
    where: { id },
  });
}
