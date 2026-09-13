/**
 * AppError — structured API error with HTTP status and error code.
 * errorResponse — converts any thrown value into a NextResponse JSON error.
 *
 * Usage:
 *   throw new AppError("Not found.", 404, "NOT_FOUND");
 *
 *   return errorResponse(error);   // in catch blocks
 */

import { NextResponse } from "next/server";

// ── AppError ──────────────────────────────────────────────────────────────────

export class AppError extends Error {
  /** HTTP status code, e.g. 400, 404, 500 */
  readonly status: number;
  /** Machine-readable error code, e.g. "NOT_FOUND", "VALIDATION_ERROR" */
  readonly code: string;

  constructor(message: string, status = 500, code = "INTERNAL_ERROR") {
    super(message);
    this.name    = "AppError";
    this.status  = status;
    this.code    = code;
    // Maintains proper prototype chain in transpiled code
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ── errorResponse ─────────────────────────────────────────────────────────────

/**
 * Converts a caught value into a consistent JSON error response.
 *
 * - AppError  → use its status + code + message
 * - Any Error → 500 INTERNAL_ERROR with the message
 * - Unknown   → 500 INTERNAL_ERROR with a generic message
 */
export function errorResponse(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code:    error.code,
          message: error.message,
        },
      },
      { status: error.status },
    );
  }

  const message =
    error instanceof Error ? error.message : "An unexpected error occurred.";

  return NextResponse.json(
    {
      success: false,
      error: {
        code:    "INTERNAL_ERROR",
        message,
      },
    },
    { status: 500 },
  );
}
