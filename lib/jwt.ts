import { SignJWT, jwtVerify } from "jose";
import { UserSession } from "@/types/auth";
import { JWT_EXPIRATION } from "./constants";

const JWT_SECRET = process.env.JWT_SECRET || "pizza_shop_pos_jwt_secret_key_2026_super_secure_32_chars!";
const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function signToken(payload: UserSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRATION)
    .sign(secretKey);
}

export async function verifyToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as UserSession["role"],
    };
  } catch {
    return null;
  }
}
