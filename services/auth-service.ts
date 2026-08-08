import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { signJWT } from "@/lib/auth";
import { LoginInput } from "@/validators/auth";
import { UserSession } from "@/types/auth";

export async function authenticateUser(credentials: LoginInput): Promise<{ user: UserSession; token: string } | null> {
  const normalizedEmail = credentials.email.toLowerCase().trim();
  
  let user = null;
  try {
    user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
  } catch (dbError) {
    // Retry once if Neon serverless DB was waking up from cold sleep
    console.warn("Database cold start detected, retrying authentication query...");
    await new Promise((res) => setTimeout(res, 1000));
    user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
  }

  if (!user || !user.isActive) {
    return null;
  }

  const isValidPassword = await bcrypt.compare(credentials.password, user.password);
  if (!isValidPassword) {
    return null;
  }

  const sessionPayload: UserSession = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };

  const token = await signJWT(sessionPayload);

  return {
    user: sessionPayload,
    token,
  };
}
