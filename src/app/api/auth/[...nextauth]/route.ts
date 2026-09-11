export const runtime = "nodejs";

import { handlers } from "@/auth";
import { NextResponse } from "next/server";

// Wrap handlers to catch initialization errors
export async function GET(req: Request) {
  try {
    return await handlers.GET(req);
  } catch (error) {
    console.error("❌ NextAuth GET error:", error);
    return NextResponse.json(
      { error: "Authentication service error", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    return await handlers.POST(req);
  } catch (error) {
    console.error("❌ NextAuth POST error:", error);
    return NextResponse.json(
      { error: "Authentication service error", details: String(error) },
      { status: 500 }
    );
  }
}
