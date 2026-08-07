import { NextResponse } from "next/server";

export function successResponse<T>(data: T, message?: string, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}

export function errorResponse(error: string, status: number = 400, details?: unknown) {
  return NextResponse.json(
    {
      success: false,
      error,
      details,
    },
    { status }
  );
}
