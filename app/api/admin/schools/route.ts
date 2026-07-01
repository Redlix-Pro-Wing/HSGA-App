import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
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
    const body = await request.json();
    
    // Strict validation list of all fields that must be filled
    const stringFields = [
      "name", "address", "district", "principalName", "principalPhone",
      "scoutInchargeName", "scoutInchargePhone", "petName", "petPhone",
      "scoutingStarted", "scoutMasterName", "praveshikaExamDate", 
      "komalPadhExamDate", "dhruvPadhExamDate", "guruPadhExamDate", 
      "rajyaPuraskar"
    ];

    const intFields = [
      "uniformsDistributed", "scarfsDistributed", "praveshikaRegisteredStudents",
      "komalPadhRegisteredStudents", "dhruvPadhRegisteredStudents", "guruPadhRegisteredStudents"
    ];

    // Check string fields
    for (const field of stringFields) {
      if (!body[field] || typeof body[field] !== "string" || body[field].trim() === "") {
        return NextResponse.json(
          { error: `Field '${field}' is required and cannot be empty.` },
          { status: 400 }
        );
      }
    }

    // Check integer fields
    const parsedData: Record<string, any> = {};
    for (const field of intFields) {
      const val = body[field];
      if (val === undefined || val === null || val === "") {
        return NextResponse.json(
          { error: `Field '${field}' is required.` },
          { status: 400 }
        );
      }
      const parsed = parseInt(String(val), 10);
      if (isNaN(parsed) || parsed < 0) {
        return NextResponse.json(
          { error: `Field '${field}' must be a valid non-negative number.` },
          { status: 400 }
        );
      }
      parsedData[field] = parsed;
    }

    // Prepare complete data payload
    const dataPayload: any = {};
    stringFields.forEach((field) => {
      dataPayload[field] = body[field].trim();
    });
    intFields.forEach((field) => {
      dataPayload[field] = parsedData[field];
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
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required to update a school." }, { status: 400 });
    }
    
    // Strict validation list of all fields that must be filled
    const stringFields = [
      "name", "address", "district", "principalName", "principalPhone",
      "scoutInchargeName", "scoutInchargePhone", "petName", "petPhone",
      "scoutingStarted", "scoutMasterName", "praveshikaExamDate", 
      "komalPadhExamDate", "dhruvPadhExamDate", "guruPadhExamDate", 
      "rajyaPuraskar"
    ];

    const intFields = [
      "uniformsDistributed", "scarfsDistributed", "praveshikaRegisteredStudents",
      "komalPadhRegisteredStudents", "dhruvPadhRegisteredStudents", "guruPadhRegisteredStudents"
    ];

    // Check string fields
    for (const field of stringFields) {
      if (!body[field] || typeof body[field] !== "string" || body[field].trim() === "") {
        return NextResponse.json(
          { error: `Field '${field}' is required and cannot be empty.` },
          { status: 400 }
        );
      }
    }

    // Check integer fields
    const parsedData: Record<string, any> = {};
    for (const field of intFields) {
      const val = body[field];
      if (val === undefined || val === null || val === "") {
        return NextResponse.json(
          { error: `Field '${field}' is required.` },
          { status: 400 }
        );
      }
      const parsed = parseInt(String(val), 10);
      if (isNaN(parsed) || parsed < 0) {
        return NextResponse.json(
          { error: `Field '${field}' must be a valid non-negative number.` },
          { status: 400 }
        );
      }
      parsedData[field] = parsed;
    }

    // Prepare complete data payload
    const dataPayload: any = {};
    stringFields.forEach((field) => {
      dataPayload[field] = body[field].trim();
    });
    intFields.forEach((field) => {
      dataPayload[field] = parsedData[field];
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

