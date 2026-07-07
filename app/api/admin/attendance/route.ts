import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const date = searchParams.get("date");
    const status = searchParams.get("status");

    const where: any = {};
    if (email) where.employeeEmail = email;
    if (date) where.date = date;
    if (status) where.status = status;

    const logs = await prisma.attendanceLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const formatted = logs.map((log) => ({
      ...log,
      id: log.id.toString(),
    }));

    return NextResponse.json(formatted);
  } catch (err: any) {
    console.error("GET admin attendance error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
