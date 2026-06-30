import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email address is required." },
        { status: 400 }
      );
    }

    // Restrict reset workflow specifically to the admin email webstrixx@gmail.com
    if (email.toLowerCase().trim() !== "webstrixx@gmail.com") {
      return NextResponse.json(
        { error: "This email address is not registered as an administrator on this system." },
        { status: 404 }
      );
    }

    // Generate random 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to PostgreSQL Admin record
    await prisma.admin.upsert({
      where: { email: "webstrixx@gmail.com" },
      update: { otp },
      create: {
        email: "webstrixx@gmail.com",
        password: "password123",
        name: "State Admin",
        designation: "State Commissioner",
        phone: "+91 99999 99999",
        otp,
      },
    });

    // Setup Gmail SMTP Transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // true for port 465 (SSL)
      auth: {
        user: "help.ckrdatapoint@gmail.com",
        pass: "hikoocstcepohzdk", // App Password without spaces
      },
    });

    const mailOptions = {
      from: '"HSGA Telangana Admin Portal" <help.ckrdatapoint@gmail.com>',
      to: "webstrixx@gmail.com",
      subject: "HSGA Telangana Admin Portal - Verification Code (OTP)",
      html: `
        <div style="font-family: sans-serif; padding: 25px; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
          <h2 style="color: #002f6c; margin-top: 0; font-size: 20px; border-bottom: 2px solid #f0f4f8; padding-bottom: 12px;">Admin Verification Code</h2>
          <p style="font-size: 14px; color: #334155; line-height: 1.5;">Hello Admin,</p>
          <p style="font-size: 14px; color: #334155; line-height: 1.5;">A password reset request was initiated for your HSGA Telangana administrator portal account. Please verify your email with the following verification code.</p>
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 18px; border-radius: 6px; margin: 24px 0; text-align: center;">
            <span style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600; display: block; margin-bottom: 6px; tracking-wider: 1px;">One-Time Verification Code (OTP):</span>
            <strong style="font-size: 32px; color: #800020; font-family: monospace; letter-spacing: 5px;">${otp}</strong>
          </div>
          <p style="font-size: 13px; color: #64748b; line-height: 1.5;">Please enter this 6-digit OTP code on the verification screen to reset your password and create a new set of credentials.</p>
          <hr style="border: 0; border-top: 1px solid #f0f4f8; margin: 24px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">Hindustan Scouts & Guides Association — Telangana</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: "One-Time Password (OTP) sent successfully. Please check webstrixx@gmail.com.",
    });
  } catch (err) {
    console.error("Nodemailer forgot-password handler error:", err);
    const errMsg = err instanceof Error ? err.message : "Failed to process forgot-password request.";
    return NextResponse.json(
      { error: errMsg },
      { status: 500 }
    );
  }
}
