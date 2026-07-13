import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { verifyAdminSession } from "@/app/lib/auth";

export async function GET() {
  try {
    const adminEmail = await verifyAdminSession();
    if (!adminEmail) {
      return NextResponse.json({ error: "Unauthorized access. Invalid session." }, { status: 401 });
    }
    const entries = await prisma.timeTable.findMany({
      orderBy: { id: "asc" },
    });
    return NextResponse.json(entries);
  } catch (err) {
    console.error("Fetch timetable error:", err);
    const errMsg = err instanceof Error ? err.message : "Failed to fetch timetable.";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const adminEmail = await verifyAdminSession();
    if (!adminEmail) {
      return NextResponse.json({ error: "Unauthorized access. Invalid session." }, { status: 401 });
    }

    const body = await request.json();
    const { employeeName } = body;

    if (!employeeName) {
      return NextResponse.json({ error: "Employee Name is required." }, { status: 400 });
    }

    const newEntry = await prisma.timeTable.create({
      data: {
        employeeName,
        workingHours: 0,
      },
    });

    return NextResponse.json({ success: true, entry: newEntry });
  } catch (err) {
    console.error("Create timetable error:", err);
    const errMsg = err instanceof Error ? err.message : "Failed to create timetable entry.";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const adminEmail = await verifyAdminSession();
    if (!adminEmail) {
      return NextResponse.json({ error: "Unauthorized access. Invalid session." }, { status: 401 });
    }

    const body = await request.json();
    const { id, employeeName, ...slots } = body;

    if (!id || !employeeName) {
      return NextResponse.json(
        { error: "ID and Employee Name are required fields." },
        { status: 400 }
      );
    }

    const existing = await prisma.timeTable.findUnique({
      where: { id: parseInt(String(id), 10) },
    });

    if (!existing) {
      return NextResponse.json({ error: "TimeTable entry not found." }, { status: 404 });
    }

    // Slots keys validation and preparation
    const updateData: any = {
      employeeName,
    };

    let calculatedWorkingHours = 0;
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    
    days.forEach((day) => {
      for (let s = 1; s <= 4; s++) {
        const key = `${day}_${s}`;
        const val = slots[key] !== undefined ? (slots[key] || "Free").trim() : (existing as any)[key];
        updateData[key] = val || "Free";
        
        if (val && val.toLowerCase() !== "free" && val.trim() !== "") {
          calculatedWorkingHours += 2;
        }
      }
    });

    updateData.workingHours = calculatedWorkingHours;

    const updatedEntry = await prisma.timeTable.update({
      where: { id: parseInt(String(id), 10) },
      data: updateData,
    });

    return NextResponse.json({ success: true, entry: updatedEntry });
  } catch (err) {
    console.error("Update timetable error:", err);
    const errMsg = err instanceof Error ? err.message : "Failed to update timetable.";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}


export async function DELETE(request: Request) {
  try {
    const adminEmail = await verifyAdminSession();
    if (!adminEmail) {
      return NextResponse.json({ error: "Unauthorized access. Invalid session." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required." }, { status: 400 });
    }

    await prisma.timeTable.delete({
      where: { id: parseInt(String(id), 10) },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete timetable error:", err);
    const errMsg = err instanceof Error ? err.message : "Failed to delete timetable entry.";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
