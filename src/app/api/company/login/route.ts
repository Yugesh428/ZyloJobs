import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Company } from "@/backend/features/companyCreation/companyModel";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Email and password are required",
          },
        },
        { status: 400 }
      );
    }

    // Find company by email
    const company = await Company.findOne({ where: { email } });

    if (!company) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password",
          },
        },
        { status: 401 }
      );
    }

    // Check if company is active
    if (company.status !== "active") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ACCOUNT_NOT_ACTIVE",
            message: `Your account is ${company.status}. Please contact support.`,
          },
        },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, company.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password",
          },
        },
        { status: 401 }
      );
    }

    // Return company data (without password)
    return NextResponse.json({
      success: true,
      data: company.toSafeJSON(),
      message: "Login successful",
    });
  } catch (error) {
    console.error("Company login error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred during login",
        },
      },
      { status: 500 }
    );
  }
}
