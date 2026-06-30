import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username (Employee ID / Email) and password are required." },
        { status: 400 }
      );
    }

    const targetUser = username.toLowerCase().trim();

    // Query matching employee record in PostgreSQL via Prisma
    const matchedEmployee = await prisma.employee.findFirst({
      where: {
        OR: [
          { id: { equals: targetUser, mode: "insensitive" } },
          { email: { equals: targetUser, mode: "insensitive" } },
        ],
      },
    });

    if (!matchedEmployee) {
      return NextResponse.json(
        { error: "Invalid credentials. Please verify your Employee ID/Email and password." },
        { status: 401 }
      );
    }

    if (matchedEmployee.password !== password) {
      return NextResponse.json(
        { error: "Invalid credentials. Please verify your Employee ID/Email and password." },
        { status: 401 }
      );
    }

    // Return success response with employee profile details
    return NextResponse.json({
      success: true,
      employee: {
        id: matchedEmployee.id,
        name: matchedEmployee.name,
        email: matchedEmployee.email,
        gender: matchedEmployee.gender,
        designation: matchedEmployee.designation ?? "",
        district: matchedEmployee.district ?? "",
        phone: matchedEmployee.phone ?? "",
        assignedSchool: matchedEmployee.assignedSchool ?? "",
        address: matchedEmployee.address ?? "",
        imageUrl: matchedEmployee.imageUrl ?? "",
      },
    });
  } catch (err) {
    console.error("Employee login API error:", err);
    const errMsg = err instanceof Error ? err.message : "Failed to authenticate credentials.";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
