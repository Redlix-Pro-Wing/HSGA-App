import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// GET /api/employee/profile?id=HSGA/TG/SM00053
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Employee ID is required." }, { status: 400 });
    }

    const employee = await prisma.employee.findUnique({ where: { id } });
    if (!employee) {
      return NextResponse.json({ error: "Employee not found." }, { status: 404 });
    }

    return NextResponse.json({
      id: employee.id,
      name: employee.name,
      email: employee.email,
      gender: employee.gender,
      designation: employee.designation ?? "",
      district: employee.district ?? "",
      phone: employee.phone ?? "",
      assignedSchool: employee.assignedSchool ?? "",
      address: employee.address ?? "",
      imageUrl: employee.imageUrl ?? "",
    });
  } catch (err) {
    console.error("Employee profile GET error:", err);
    return NextResponse.json({ error: "Failed to fetch profile." }, { status: 500 });
  }
}

// PATCH /api/employee/profile
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, designation, district, phone, assignedSchool, address, imageUrl } = body;

    if (!id) {
      return NextResponse.json({ error: "Employee ID is required." }, { status: 400 });
    }

    const existing = await prisma.employee.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Employee not found." }, { status: 404 });
    }

    const updated = await prisma.employee.update({
      where: { id },
      data: {
        designation: designation !== undefined ? designation : existing.designation,
        district: district !== undefined ? district : existing.district,
        phone: phone !== undefined ? phone : existing.phone,
        assignedSchool: assignedSchool !== undefined ? assignedSchool : existing.assignedSchool,
        address: address !== undefined ? address : existing.address,
        imageUrl: imageUrl !== undefined ? imageUrl : existing.imageUrl,
      },
    });

    return NextResponse.json({
      success: true,
      profile: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        gender: updated.gender,
        designation: updated.designation ?? "",
        district: updated.district ?? "",
        phone: updated.phone ?? "",
        assignedSchool: updated.assignedSchool ?? "",
        address: updated.address ?? "",
        imageUrl: updated.imageUrl ?? "",
      },
    });
  } catch (err) {
    console.error("Employee profile PATCH error:", err);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}
