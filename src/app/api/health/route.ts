export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { sequelize } from "@/lib/db";

export async function GET() {
  try {
    await sequelize.authenticate();
    return NextResponse.json({ 
      status: "ok", 
      db: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ 
      status: "error", 
      db: "failed",
      error: String(error),
    }, { status: 500 });
  }
}
