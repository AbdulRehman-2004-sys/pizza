import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: [
      {
        emit: "event",
        level: "error",
      },
    ],
  });

// Filter harmless Neon serverless idle disconnect notices (code 57P01)
if ("$on" in prisma) {
  (prisma as any).$on("error", (e: any) => {
    if (e.message && e.message.includes("57P01")) {
      // Ignore Neon serverless idle connection termination
      return;
    }
    console.error("Prisma Database Error:", e.message || e);
  });
}

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
