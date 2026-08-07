import prisma from "@/lib/prisma";
import { TableInput } from "@/validators/table";

export async function getAllTables() {
  return prisma.table.findMany({
    orderBy: { tableNumber: "asc" },
  });
}

export async function getTableById(id: string) {
  return prisma.table.findUnique({
    where: { id },
  });
}

export async function createTable(data: TableInput) {
  const existing = await prisma.table.findUnique({
    where: { tableNumber: data.tableNumber },
  });

  if (existing) {
    throw new Error(`Table number ${data.tableNumber} already exists.`);
  }

  return prisma.table.create({
    data,
  });
}

export async function updateTable(id: string, data: TableInput) {
  const existingWithNumber = await prisma.table.findFirst({
    where: {
      tableNumber: data.tableNumber,
      NOT: { id },
    },
  });

  if (existingWithNumber) {
    throw new Error(`Table number ${data.tableNumber} is used by another table.`);
  }

  return prisma.table.update({
    where: { id },
    data,
  });
}

export async function deleteTable(id: string) {
  return prisma.table.delete({
    where: { id },
  });
}
