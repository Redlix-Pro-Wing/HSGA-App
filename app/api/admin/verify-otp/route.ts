import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email address and OTP are required." },
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

    // Retrieve the admin record from the database
    const admin = await prisma.admin.findUnique({
      where: { email: targetEmail },
    });

    if (!admin || !admin.otp) {
      return NextResponse.json(
        { error: "No active verification request found. Please request a new verification code." },
        { status: 400 }
      );
    }

    if (otp.trim() !== admin.otp.trim()) {
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
    console.error("verify-otp error:", err);
    const errMsg = err instanceof Error ? err.message : "Failed to verify verification code.";
    return NextResponse.json(
      { error: errMsg },
      { status: 500 }
    );
  }
}
