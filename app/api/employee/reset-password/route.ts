import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, otp, newPassword } = body;

    if (!username || !otp || !newPassword) {
      return NextResponse.json(
        { error: "Employee ID/Email, OTP verification code, and new password are required." },
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
        { error: "Session config not found. Please request a new verification code." },
        { status: 400 }
      );
    }

    if (otp.trim() !== employee.otp.trim()) {
      return NextResponse.json(
        { error: "Invalid verification code. Please request a new code and try again." },
        { status: 400 }
      );
    }

    // Update password and clear OTP block in PostgreSQL
    await prisma.employee.update({
      where: { id: employee.id },
      data: {
        password: newPassword,
        otp: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Password updated successfully. Please log in with your new password.",
    });
  } catch (err) {
    console.error("employee reset-password error:", err);
    const errMsg = err instanceof Error ? err.message : "Failed to reset password.";
    return NextResponse.json(
      { error: errMsg },
      { status: 500 }
    );
  }
}
