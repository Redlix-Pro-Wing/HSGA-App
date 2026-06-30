import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, otp } = body;

    if (!username || !otp) {
      return NextResponse.json(
        { error: "Employee ID/Email and OTP verification code are required." },
        { status: 400 }
      );
    }

    const searchStr = username.trim();

    const employee = await prisma.employee.findFirst({
      where: {
        OR: [
          { id: searchStr },
          { email: { equals: searchStr.toLowerCase(), mode: "insensitive" } }
        ]
      }
    });

    if (!employee) {
      return NextResponse.json(
        { error: "No registered employee profile found matching those credentials." },
        { status: 404 }
      );
    }

    if (!employee.otp) {
      return NextResponse.json(
        { error: "No active verification request found. Please request a new verification code." },
        { status: 400 }
      );
    }

    if (otp.trim() !== employee.otp.trim()) {
      return NextResponse.json(
        { error: "Invalid verification code. Please check your email and try again." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Email verification successful.",
    });
  } catch (err) {
    console.error("employee verify-otp error:", err);
    const errMsg = err instanceof Error ? err.message : "Failed to verify verification code.";
    return NextResponse.json(
      { error: errMsg },
      { status: 500 }
    );
  }
}
