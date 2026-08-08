import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "pizza_shop_pos_jwt_secret_key_2026_super_secure_32_chars!";
const secretKey = new TextEncoder().encode(JWT_SECRET);

const PUBLIC_ROUTES = [
  "/login",
  "/api/auth/login",
  "/forgot-password",
  "/reset-password",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
];
const ADMIN_ONLY_ROUTES = ["/reports", "/settings", "/users", "/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const tokenCookie = request.cookies.get("token")?.value;

  // Static assets & uploads bypass
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/icon") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".png") ||
    pathname.startsWith("/uploads")
  ) {
    return NextResponse.next();
  }

  let userPayload: { id: string; email: string; name: string; role: string } | null = null;

  if (tokenCookie) {
    try {
      const { payload } = await jwtVerify(tokenCookie, secretKey);
      userPayload = {
        id: payload.id as string,
        email: payload.email as string,
        name: payload.name as string,
        role: payload.role as string,
      };
    } catch {
      userPayload = null;
    }
  }

  // If user is authenticated and navigating to / or /login, redirect to /dashboard
  if (userPayload && (pathname === "/" || pathname === "/login")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If unauthenticated trying to access protected routes
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  if (!userPayload && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Role Protection check for Admin-only routes
  if (userPayload && ADMIN_ONLY_ROUTES.some((route) => pathname.startsWith(route))) {
    if (userPayload.role !== "ADMIN") {
      // Redirect forbidden cashier to dashboard
      return NextResponse.redirect(new URL("/dashboard?forbidden=1", request.url));
    }
  }

  // Handle root route redirection for unauthenticated
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|favicon.svg|.*\\.svg|.*\\.ico).*)"],
};
