import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { createdAt: "desc" },
    });
    
    // Return employees with passwords omitted for overview security
    const safeEmployees = employees.map((emp: any) => ({
      id: emp.id,
      name: emp.name,
      email: emp.email,
      gender: emp.gender,
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
    // Female: HSGA/TG/GC/00053
    const isMale = gender.toLowerCase() === "male";
    const prefix = isMale ? "HSGA/TG/SM" : "HSGA/TG/GC/";

    // Find all employees that match this prefix
    const matchingEmployees = await prisma.employee.findMany({
      where: {
        id: {
          startsWith: prefix,
        },
      },
    });

    // Find max counter
    let maxCounter = 52; // default starting point (next will be 53)
    matchingEmployees.forEach((emp: any) => {
      const numPart = emp.id.substring(prefix.length);
      const num = parseInt(numPart, 10);
      if (!isNaN(num) && num > maxCounter) {
        maxCounter = num;
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
