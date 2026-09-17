export const runtime = "nodejs";

import { handlers } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Wrap handlers to catch initialization errors and ensure JSON responses
export async function GET(req: NextRequest) {
  try {
    const response = await handlers.GET(req as any);
    return response;
  } catch (error) {
    console.error("❌ NextAuth GET error:", error);
    return NextResponse.json(
      { 
        error: "Authentication service error", 
        message: error instanceof Error ? error.message : String(error)
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const response = await handlers.POST(req as any);
    return response;
  } catch (error) {
    console.error("❌ NextAuth POST error:", error);
    return NextResponse.json(
      { 
        error: "Authentication service error", 
        message: error instanceof Error ? error.message : String(error)
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
}
