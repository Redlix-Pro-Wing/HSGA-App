import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const schools = await prisma.school.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        district: true,
        schoolCode: true,
        districtCode: true,
      },
    });
    return NextResponse.json(schools);
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Failed to load schools.";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
