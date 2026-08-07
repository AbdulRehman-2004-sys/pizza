import prisma from "@/lib/prisma";
import { ExtraCheeseInput } from "@/validators/pizza-config";

export async function getExtraCheeseConfig() {
  let cheese = await prisma.extraCheese.findFirst();
  if (!cheese) {
    cheese = await prisma.extraCheese.create({
      data: {
        name: "Extra Mozzarella Cheese",
        extraPrice: 250,
        isAvailable: true,
      },
    });
  }
  return cheese;
}

export async function updateExtraCheeseConfig(id: string, data: ExtraCheeseInput) {
  return prisma.extraCheese.update({
    where: { id },
    data: {
      name: data.name.trim(),
      extraPrice: data.extraPrice,
      isAvailable: data.isAvailable,
    },
  });
}
