import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { createdAt: "desc" },
    });
    
    // Return employees with passwords included so admin can view demo credentials
    const safeEmployees = employees.map((emp: any) => ({
      id: emp.id,
      name: emp.name,
      email: emp.email,
      gender: emp.gender,
      password: emp.password,
    }));
    
    return NextResponse.json(safeEmployees);
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Failed to load employees.";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, gender } = body;

    if (!name || !email || !gender) {
      return NextResponse.json(
        { error: "Name, email address, and gender are required fields." },
        { status: 400 }
      );
    }

    // Check if email already exists in SQL database
    const emailExists = await prisma.employee.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    
    if (emailExists) {
      return NextResponse.json(
        { error: "An employee with this email address already exists." },
        { status: 400 }
      );
    }

    // Determine ID prefix:
    // Male: HSGA/TG/SM00053
    // Female: HSGA/TG/GC00053
    const isMale = gender.toLowerCase() === "male";
    const prefix = isMale ? "HSGA/TG/SM" : "HSGA/TG/GC";

    // Find all employees that match this prefix
    const matchingEmployees = await prisma.employee.findMany({
      where: {
        id: {
          startsWith: prefix,
        },
      },
    });

    // Find max counter
    let maxCounter = isMale ? 59 : 53; 
    matchingEmployees.forEach((emp: any) => {
      const match = emp.id.match(/\d+$/);
      if (match) {
        const num = parseInt(match[0], 10);
        if (!isNaN(num) && num > maxCounter) {
          maxCounter = num;
        }
      }
    });

    const nextCounter = maxCounter + 1;
    const paddedCounter = String(nextCounter).padStart(5, "0");
    const generatedId = prefix + paddedCounter;

    // Generate demo password (TG@ followed by 4 random digits)
    const randomDigits = Math.floor(1000 + Math.random() * 9000).toString();
    const demoPassword = `TG@${randomDigits}`;

    const newEmployee = await prisma.employee.create({
      data: {
        id: generatedId,
        name,
        email: email.toLowerCase().trim(),
        gender,
        password: demoPassword,
      },
    });

    return NextResponse.json({
      success: true,
      employee: newEmployee,
    });
  } catch (err) {
    console.error("Add employee route error:", err);
    const errMsg = err instanceof Error ? err.message : "Failed to add employee.";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, email, gender } = body;

    if (!id || !name || !email || !gender) {
      return NextResponse.json(
        { error: "ID, Name, Email, and Gender are required fields." },
        { status: 400 }
      );
    }

    // Check if email conflicts with another employee
    const emailConflict = await prisma.employee.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        NOT: { id },
      },
    });

    if (emailConflict) {
      return NextResponse.json(
        { error: "An employee with this email address already exists." },
        { status: 400 }
      );
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: {
        name,
        email: email.toLowerCase().trim(),
        gender,
      },
    });

    return NextResponse.json({ success: true, employee: updatedEmployee });
  } catch (err) {
    console.error("Update employee error:", err);
    const errMsg = err instanceof Error ? err.message : "Failed to update employee.";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required." }, { status: 400 });
    }

    await prisma.employee.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete employee error:", err);
    const errMsg = err instanceof Error ? err.message : "Failed to delete employee.";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

