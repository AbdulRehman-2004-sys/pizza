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
    if (
      e.message &&
      (e.message.includes("57P01") ||
        e.message.includes("Transaction API error") ||
        e.message.includes("closed transaction"))
    ) {
      // Ignore Neon serverless idle connection termination notices
      return;
    }
    console.error("Prisma Database Error:", e.message || e);
  });
}

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Bulletproof database query wrapper with automatic retries for Neon PostgreSQL serverless compute wakes & idle connection drops.
 */
export async function safeDbQuery<T>(
  fn: () => Promise<T>,
  retries = 2,
  fallback?: T
): Promise<T> {
  let attempt = 0;
  while (attempt <= retries) {
    try {
      return await fn();
    } catch (error: any) {
      attempt++;
      const msg = error?.message || String(error);
      const isRetryable =
        msg.includes("57P01") ||
        msg.includes("Transaction API error") ||
        msg.includes("Transaction not found") ||
        msg.includes("closed transaction") ||
        msg.includes("Can't reach database server") ||
        msg.includes("connection limit") ||
        msg.includes("prepared statement") ||
        msg.includes("socket");

      if (isRetryable && attempt <= retries) {
        console.warn(
          `[Prisma SafeQuery] Retryable DB error (attempt ${attempt}/${retries}). Retrying in 500ms...`,
          msg
        );
        await new Promise((resolve) => setTimeout(resolve, 500));
        continue;
      }

      if (fallback !== undefined) {
        console.error(
          `[Prisma SafeQuery] DB query failed after retries. Returning fallback. Error:`,
          msg
        );
        return fallback;
      }

      throw error;
    }
  }

  if (fallback !== undefined) return fallback;
  throw new Error("Database query failed after maximum retries.");
}

export default prisma;
