import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, otp, newPassword } = body;

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: "Email address, OTP verification code, and new password are required." },
        { status: 400 }
      );
    }

    const allowedAdmins = ["webstrixx@gmail.com", "office.hsga@gmail.com"];
    const targetEmail = email.toLowerCase().trim();
    if (!allowedAdmins.includes(targetEmail)) {
      return NextResponse.json(
        { error: "This email address is not registered as an administrator on this system." },
        { status: 401 }
      );
    }

    // Retrieve admin record from database
    const admin = await prisma.admin.findUnique({
      where: { email: targetEmail },
    });

    if (!admin || !admin.otp) {
      return NextResponse.json(
        { error: "Session config not found. Please request a new verification code." },
        { status: 400 }
      );
    }

    if (otp.trim() !== admin.otp.trim()) {
      return NextResponse.json(
        { error: "Invalid verification code. Please request a new code and try again." },
        { status: 400 }
      );
    }

    // Update password and clear OTP block in PostgreSQL
    await prisma.admin.update({
      where: { email: targetEmail },
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
    console.error("reset-password error:", err);
    const errMsg = err instanceof Error ? err.message : "Failed to reset password.";
    return NextResponse.json(
      { error: errMsg },
      { status: 500 }
    );
  }
}
