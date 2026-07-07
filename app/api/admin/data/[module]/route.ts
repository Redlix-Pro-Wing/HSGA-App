import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ module: string }> }
) {
  try {
    const { module } = await params;
    let data: any[] = [];
    if (module === "visits") {
      data = await prisma.schoolVisit.findMany({
        orderBy: { createdAt: "desc" },
      });
    } else if (module === "registers") {
      data = await prisma.dailyRegister.findMany({
        orderBy: { createdAt: "desc" },
      });
    } else if (module === "enrolments") {
      data = await prisma.studentEnrolment.findMany({
        orderBy: { createdAt: "desc" },
      });
    } else if (module === "distributions") {
      data = await prisma.uniformDistribution.findMany({
        orderBy: { createdAt: "desc" },
      });
    } else if (module === "mou") {
      data = await prisma.mou.findMany({
        orderBy: { createdAt: "desc" },
      });
    } else if (module === "officecalls") {
      data = await prisma.officeCall.findMany({
        orderBy: { createdAt: "desc" },
      });
    } else if (module === "homecalls") {
      data = await prisma.homeCall.findMany({
        orderBy: { createdAt: "desc" },
      });
    } else if (module === "pr") {
      data = await prisma.publicRelation.findMany({
        orderBy: { createdAt: "desc" },
      });
    } else if (module === "videos") {
      data = await prisma.studentVideo.findMany({
        orderBy: { createdAt: "desc" },
      });
    } else if (module === "finance") {
      data = await prisma.financialRecord.findMany({
        orderBy: { createdAt: "desc" },
      });
    } else if (module === "problems") {
      data = await prisma.problemRecord.findMany({
        orderBy: { createdAt: "desc" },
      });
    } else if (module === "documents") {
      data = await prisma.documentRecord.findMany({
        orderBy: { createdAt: "desc" },
      });
    } else if (module === "social") {
      data = await prisma.socialMediaReport.findMany({
        orderBy: { createdAt: "desc" },
      });
    } else {
      return NextResponse.json({ error: "Invalid module" }, { status: 400 });
    }

    const formatted = data.map((item) => ({
      ...item,
      id: item.id.toString(),
    }));

    return NextResponse.json(formatted);
  } catch (err: any) {
    console.error("GET admin data error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
