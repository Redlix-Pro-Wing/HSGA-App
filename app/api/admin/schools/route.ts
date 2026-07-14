import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { verifyAdminSession } from "@/app/lib/auth";

export async function GET() {
  try {
    const adminEmail = await verifyAdminSession();
    if (!adminEmail) {
      return NextResponse.json({ error: "Unauthorized access. Invalid session." }, { status: 401 });
    }
    const schools = await prisma.school.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(schools);
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Failed to load schools.";
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
    
    // Strict validation only for name and district
    if (!body.name || typeof body.name !== "string" || body.name.trim() === "") {
      return NextResponse.json({ error: "Field 'name' is required." }, { status: 400 });
    }
    if (!body.district || typeof body.district !== "string" || body.district.trim() === "") {
      return NextResponse.json({ error: "Field 'district' is required." }, { status: 400 });
    }

    const stringFields = [
      "name", "address", "district", "principalName", "principalPhone",
      "scoutInchargeName", "scoutInchargePhone", "petName", "petPhone",
      "scoutingStarted", "scoutMasterName", "praveshikaExamDate", 
      "komalPadhExamDate", "dhruvPadhExamDate", "guruPadhExamDate", 
      "rajyaPuraskar", "state", "districtCode", "collegeSchoolCode", "year",
      "studentUniqueCode", "schoolCode"
    ];

    const intFields = [
      "uniformsDistributed", "scarfsDistributed", "praveshikaRegisteredStudents",
      "komalPadhRegisteredStudents", "dhruvPadhRegisteredStudents", "guruPadhRegisteredStudents"
    ];

    const dataPayload: any = {};
    stringFields.forEach((field) => {
      dataPayload[field] = typeof body[field] === "string" ? body[field].trim() : (body[field] || "");
    });

    intFields.forEach((field) => {
      const val = body[field];
      if (val === undefined || val === null || val === "") {
        dataPayload[field] = 0;
      } else {
        const parsed = parseInt(String(val), 10);
        dataPayload[field] = isNaN(parsed) ? 0 : parsed;
      }
    });

    const newSchool = await prisma.school.create({
      data: dataPayload,
    });

    return NextResponse.json({
      success: true,
      school: newSchool,
    });
  } catch (err) {
    console.error("Add school route error:", err);
    const errMsg = err instanceof Error ? err.message : "Failed to add school.";
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
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required to update a school." }, { status: 400 });
    }

    if (!body.name || typeof body.name !== "string" || body.name.trim() === "") {
      return NextResponse.json({ error: "Field 'name' is required." }, { status: 400 });
    }
    if (!body.district || typeof body.district !== "string" || body.district.trim() === "") {
      return NextResponse.json({ error: "Field 'district' is required." }, { status: 400 });
    }
    
    const stringFields = [
      "name", "address", "district", "principalName", "principalPhone",
      "scoutInchargeName", "scoutInchargePhone", "petName", "petPhone",
      "scoutingStarted", "scoutMasterName", "praveshikaExamDate", 
      "komalPadhExamDate", "dhruvPadhExamDate", "guruPadhExamDate", 
      "rajyaPuraskar", "state", "districtCode", "collegeSchoolCode", "year",
      "studentUniqueCode", "schoolCode"
    ];

    const intFields = [
      "uniformsDistributed", "scarfsDistributed", "praveshikaRegisteredStudents",
      "komalPadhRegisteredStudents", "dhruvPadhRegisteredStudents", "guruPadhRegisteredStudents"
    ];

    const dataPayload: any = {};
    stringFields.forEach((field) => {
      dataPayload[field] = typeof body[field] === "string" ? body[field].trim() : (body[field] || "");
    });

    intFields.forEach((field) => {
      const val = body[field];
      if (val === undefined || val === null || val === "") {
        dataPayload[field] = 0;
      } else {
        const parsed = parseInt(String(val), 10);
        dataPayload[field] = isNaN(parsed) ? 0 : parsed;
      }
    });

    const updatedSchool = await prisma.school.update({
      where: { id: parseInt(String(id), 10) },
      data: dataPayload,
    });

    return NextResponse.json({
      success: true,
      school: updatedSchool,
    });
  } catch (err) {
    console.error("Update school route error:", err);
    const errMsg = err instanceof Error ? err.message : "Failed to update school.";
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
      return NextResponse.json({ error: "ID is required to delete a school." }, { status: 400 });
    }

    await prisma.school.delete({
      where: { id: parseInt(String(id), 10) },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete school error:", err);
    const errMsg = err instanceof Error ? err.message : "Failed to delete school.";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

