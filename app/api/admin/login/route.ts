import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email address and password are required." },
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

    // Load admin config from database, or upsert defaults if empty
    const admin = await prisma.admin.upsert({
      where: { email: targetEmail },
      update: {},
      create: {
        email: targetEmail,
        password: "password123",
        name: targetEmail === "webstrixx@gmail.com" ? "State Admin" : "Office Admin",
        designation: "State Commissioner",
        phone: "+91 99999 99999",
      },
    });

    if (password !== admin.password) {
      return NextResponse.json(
        { error: "Invalid administrator password. If you reset your password, please use the passcode sent to your email." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        email: targetEmail,
      },
    });
  } catch (err) {
    console.error("Login route error:", err);
    const errMsg = err instanceof Error ? err.message : "Failed to authenticate credentials.";
    return NextResponse.json(
      { error: errMsg },
      { status: 500 }
    );
  }
}
