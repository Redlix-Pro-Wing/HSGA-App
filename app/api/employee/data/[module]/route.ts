import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ module: string }> }
) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const { module } = await params;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    let data: any[] = [];
    if (module === "visits") {
      data = await prisma.schoolVisit.findMany({
        where: { employeeEmail: email },
        orderBy: { createdAt: "desc" },
      });
    } else if (module === "registers") {
      data = await prisma.dailyRegister.findMany({
        where: { employeeEmail: email },
        orderBy: { createdAt: "desc" },
      });
    } else if (module === "enrolments") {
      data = await prisma.studentEnrolment.findMany({
        where: { employeeEmail: email },
        orderBy: { createdAt: "desc" },
      });
    } else if (module === "distributions") {
      data = await prisma.uniformDistribution.findMany({
        where: { employeeEmail: email },
        orderBy: { createdAt: "desc" },
      });
    } else if (module === "mou") {
      data = await prisma.mou.findMany({
        where: { employeeEmail: email },
        orderBy: { createdAt: "desc" },
      });
    } else if (module === "officecalls") {
      data = await prisma.officeCall.findMany({
        where: { employeeEmail: email },
        orderBy: { createdAt: "desc" },
      });
    } else if (module === "homecalls") {
      data = await prisma.homeCall.findMany({
        where: { employeeEmail: email },
        orderBy: { createdAt: "desc" },
      });
    } else if (module === "pr") {
      data = await prisma.publicRelation.findMany({
        where: { employeeEmail: email },
        orderBy: { createdAt: "desc" },
      });
    } else if (module === "videos") {
      data = await prisma.studentVideo.findMany({
        where: { employeeEmail: email },
        orderBy: { createdAt: "desc" },
      });
    } else if (module === "finance") {
      data = await prisma.financialRecord.findMany({
        where: { employeeEmail: email },
        orderBy: { createdAt: "desc" },
      });
    } else if (module === "problems") {
      data = await prisma.problemRecord.findMany({
        where: { employeeEmail: email },
        orderBy: { createdAt: "desc" },
      });
    } else if (module === "documents") {
      data = await prisma.documentRecord.findMany({
        where: { employeeEmail: email },
        orderBy: { createdAt: "desc" },
      });
    } else if (module === "social") {
      data = await prisma.socialMediaReport.findMany({
        where: { employeeEmail: email },
        orderBy: { createdAt: "desc" },
      });
    } else {
      return NextResponse.json({ error: "Invalid module" }, { status: 400 });
    }

    // Map DB numeric ids to string ids for UI compatibility if needed
    const formatted = data.map((item) => ({
      ...item,
      id: item.id.toString(),
    }));

    return NextResponse.json(formatted);
  } catch (err: any) {
    console.error("GET module error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ module: string }> }
) {
  try {
    const body = await req.json();
    const email = body.employeeEmail;
    const { module } = await params;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    let record: any;
    if (module === "visits") {
      record = await prisma.schoolVisit.create({
        data: {
          employeeEmail: email,
          schoolName: body.schoolName,
          district: body.district,
          demonstration: !!body.demonstration,
          visited: !!body.visited,
          principalName: body.principalName,
          phone: body.phone,
          address: body.address,
        },
      });
    } else if (module === "registers") {
      record = await prisma.dailyRegister.create({
        data: {
          employeeEmail: email,
          schoolName: body.schoolName,
          date: body.date,
          topicCovered: body.topicCovered,
          attendanceCount: parseInt(body.attendanceCount, 10) || 0,
        },
      });
    } else if (module === "enrolments") {
      record = await prisma.studentEnrolment.create({
        data: {
          employeeEmail: email,
          studentName: body.studentName,
          age: parseInt(body.age, 10) || 0,
          schoolName: body.schoolName,
          validId: body.validId,
        },
      });
    } else if (module === "distributions") {
      record = await prisma.uniformDistribution.create({
        data: {
          employeeEmail: email,
          schoolName: body.schoolName,
          distributionType: body.distributionType,
          maleCount: body.maleCount !== undefined ? parseInt(body.maleCount, 10) : null,
          femaleCount: body.femaleCount !== undefined ? parseInt(body.femaleCount, 10) : null,
          studentName: body.studentName,
          class: body.class,
          gender: body.gender,
          amount: parseFloat(body.amount) || 0,
        },
      });
    } else if (module === "mou") {
      record = await prisma.mou.create({
        data: {
          employeeEmail: email,
          school: body.school,
          principal: body.principal,
          dateInitiated: body.dateInitiated,
          studentStrength: parseInt(body.studentStrength, 10) || 0,
          status: body.status,
          signedDate: body.signedDate,
          nextFollowUp: body.nextFollowUp,
          staff: body.staff,
        },
      });
    } else if (module === "officecalls") {
      record = await prisma.officeCall.create({
        data: {
          employeeEmail: email,
          date: body.date,
          school: body.school,
          principal: body.principal,
          phone: body.phone,
          purpose: body.purpose,
          response: body.response,
          meetingFixed: !!body.meetingFixed,
          followUpReq: !!body.followUpReq,
        },
      });
    } else if (module === "homecalls") {
      record = await prisma.homeCall.create({
        data: {
          employeeEmail: email,
          date: body.date,
          school: body.school,
          personContacted: body.personContacted,
          purpose: body.purpose,
          response: body.response,
          followUp: !!body.followUp,
          staff: body.staff,
        },
      });
    } else if (module === "pr") {
      record = await prisma.publicRelation.create({
        data: {
          employeeEmail: email,
          date: body.date,
          personBodyMet: body.personBodyMet,
          category: body.category,
          purpose: body.purpose,
          outcome: body.outcome,
          staff: body.staff,
        },
      });
    } else if (module === "videos") {
      record = await prisma.studentVideo.create({
        data: {
          employeeEmail: email,
          date: body.date,
          school: body.school,
          title: body.title,
          platform: body.platform,
          views: parseInt(body.views, 10) || 0,
          likes: parseInt(body.likes, 10) || 0,
          link: body.link,
        },
      });
    } else if (module === "finance") {
      record = await prisma.financialRecord.create({
        data: {
          employeeEmail: email,
          date: body.date,
          head: body.head,
          type: body.type,
          amount: parseFloat(body.amount) || 0,
          billUrl: body.billUrl,
          remarks: body.remarks,
        },
      });
    } else if (module === "problems") {
      record = await prisma.problemRecord.create({
        data: {
          employeeEmail: email,
          date: body.date,
          category: body.category,
          description: body.description,
          supportRequired: body.supportRequired,
          status: body.status,
          raisedBy: body.raisedBy,
        },
      });
    } else if (module === "documents") {
      record = await prisma.documentRecord.create({
        data: {
          employeeEmail: email,
          date: body.date,
          title: body.title,
          category: body.category,
          link: body.link,
          uploadedBy: body.uploadedBy,
        },
      });
    } else if (module === "social") {
      record = await prisma.socialMediaReport.create({
        data: {
          employeeEmail: email,
          date: body.date,
          platform: body.platform,
          postTitle: body.postTitle,
          reach: parseInt(body.reach, 10) || 0,
          likes: parseInt(body.likes, 10) || 0,
          link: body.link,
        },
      });
    } else {
      return NextResponse.json({ error: "Invalid module" }, { status: 400 });
    }

    const formatted = {
      ...record,
      id: record.id.toString(),
    };

    return NextResponse.json(formatted);
  } catch (err: any) {
    console.error("POST module error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ module: string }> }
) {
  try {
    const { searchParams } = new URL(req.url);
    const id = parseInt(searchParams.get("id") || "", 10);
    const { module } = await params;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    if (module === "visits") {
      await prisma.schoolVisit.delete({ where: { id } });
    } else if (module === "registers") {
      await prisma.dailyRegister.delete({ where: { id } });
    } else if (module === "enrolments") {
      await prisma.studentEnrolment.delete({ where: { id } });
    } else if (module === "distributions") {
      await prisma.uniformDistribution.delete({ where: { id } });
    } else if (module === "mou") {
      await prisma.mou.delete({ where: { id } });
    } else if (module === "officecalls") {
      await prisma.officeCall.delete({ where: { id } });
    } else if (module === "homecalls") {
      await prisma.homeCall.delete({ where: { id } });
    } else if (module === "pr") {
      await prisma.publicRelation.delete({ where: { id } });
    } else if (module === "videos") {
      await prisma.studentVideo.delete({ where: { id } });
    } else if (module === "finance") {
      await prisma.financialRecord.delete({ where: { id } });
    } else if (module === "problems") {
      await prisma.problemRecord.delete({ where: { id } });
    } else if (module === "documents") {
      await prisma.documentRecord.delete({ where: { id } });
    } else if (module === "social") {
      await prisma.socialMediaReport.delete({ where: { id } });
    } else {
      return NextResponse.json({ error: "Invalid module" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ module: string }> }
) {
  try {
    const { searchParams } = new URL(req.url);
    const id = parseInt(searchParams.get("id") || "", 10);
    const { module } = await params;
    const body = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    let record: any;
    if (module === "registers") {
      record = await prisma.dailyRegister.update({
        where: { id },
        data: {
          attendanceCount: parseInt(body.attendanceCount, 10) || 0,
        },
      });
    } else {
      return NextResponse.json({ error: "Invalid module or method" }, { status: 400 });
    }

    const formatted = {
      ...record,
      id: record.id.toString(),
    };

    return NextResponse.json(formatted);
  } catch (err: any) {
    console.error("PATCH error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
