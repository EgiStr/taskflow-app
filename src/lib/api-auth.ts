import { NextResponse } from "next/server";

/**
 * Validates the API key from the request header.
 * Returns a 401 NextResponse if invalid, or null if valid.
 */
export function validateApiKey(request: Request): NextResponse | null {
  const apiKey = request.headers.get("x-api-key");
  const expectedKey = process.env.N8N_API_KEY;

  if (!expectedKey) {
    console.error("[API Auth] N8N_API_KEY is not configured in environment variables.");
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "API key not configured on server." },
      },
      { status: 500 }
    );
  }

  if (!apiKey || apiKey !== expectedKey) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "UNAUTHORIZED", message: "Invalid or missing API key." },
      },
      { status: 401 }
    );
  }

  return null; // valid
}
