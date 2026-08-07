import { NextResponse } from "next/server";
import { loginSchema } from "@/validators/auth";
import { authenticateUser } from "@/services/auth-service";
import { setAuthCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validationResult = loginSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const authResult = await authenticateUser(validationResult.data);

    if (!authResult) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    // Set HttpOnly Cookie
    await setAuthCookie(authResult.token);

    return NextResponse.json({
      success: true,
      data: {
        user: authResult.user,
      },
      message: "Successfully logged in",
    });
  } catch (error) {
    console.error("Login Route Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
