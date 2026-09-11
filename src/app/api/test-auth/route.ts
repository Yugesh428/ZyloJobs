export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { Admin } from "@/lib/models/Admin";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    return NextResponse.json({ 
      success: true, 
      admin: { id: admin.id, name: admin.name, email: admin.email } 
    });
  } catch (error) {
    console.error("❌ Test auth error:", error);
    return NextResponse.json({ 
      error: "Auth test failed", 
      details: String(error) 
    }, { status: 500 });
  }
}
