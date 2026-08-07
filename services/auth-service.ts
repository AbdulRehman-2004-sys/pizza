import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { signJWT } from "@/lib/auth";
import { LoginInput } from "@/validators/auth";
import { UserSession } from "@/types/auth";

export async function authenticateUser(credentials: LoginInput): Promise<{ user: UserSession; token: string } | null> {
  const user = await prisma.user.findUnique({
    where: { email: credentials.email.toLowerCase().trim() },
  });

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
