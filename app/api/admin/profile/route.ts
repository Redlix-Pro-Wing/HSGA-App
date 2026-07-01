import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email")?.toLowerCase().trim() || "webstrixx@gmail.com";

    const admin = await prisma.admin.upsert({
      where: { email },
      update: {},
      create: {
        email,
        password: "password123",
        name: email === "webstrixx@gmail.com" ? "State Admin" : "Office Admin",
        designation: "State Commissioner",
        phone: "+91 99999 99999",
      },
    });

    return NextResponse.json({
      name: admin.name,
      designation: admin.designation,
      phone: admin.phone,
      email: admin.email,
    });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Failed to load admin profile.";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, designation, phone, currentPassword, newPassword, email } = body;
    const targetEmail = email?.toLowerCase().trim() || "webstrixx@gmail.com";

    const admin = await prisma.admin.findUnique({
      where: { email: targetEmail },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Admin account not found in database." },
        { status: 404 }
      );
    }

    const updateData: {
      name?: string;
      designation?: string;
      phone?: string;
      password?: string;
    } = {
      name,
      designation,
      phone,
    };

    // If password change is requested, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required to set a new password." },
          { status: 400 }
        );
      }
      
      if (currentPassword !== admin.password) {
        return NextResponse.json(
          { error: "Incorrect current password." },
          { status: 400 }
        );
      }
      updateData.password = newPassword;
    }

    await prisma.admin.update({
      where: { email: targetEmail },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Admin profile updated successfully.",
    });
  } catch (err) {
    console.error("Update admin profile error:", err);
    const errMsg = err instanceof Error ? err.message : "Failed to update profile.";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
