import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username } = body;

    if (!username) {
      return NextResponse.json(
        { error: "Employee ID or Email address is required." },
        { status: 400 }
      );
    }

    const searchStr = username.trim();

    // Query employee record by ID or unique email address
    const employee = await prisma.employee.findFirst({
      where: {
        OR: [
          { id: searchStr },
          { email: { equals: searchStr.toLowerCase(), mode: "insensitive" } }
        ]
      }
    });

    if (!employee) {
      return NextResponse.json(
        { error: "No registered employee profile found matching those credentials." },
        { status: 404 }
      );
    }

    // Generate random 6-digit verification code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Update the employee record with the generated OTP
    await prisma.employee.update({
      where: { id: employee.id },
      data: { otp },
    });

    // Setup nodemailer SMTP transporter using the configured Gmail app credentials
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "help.ckrdatapoint@gmail.com",
        pass: "hikoocstcepohzdk",
      },
    });

    // Helper method to mask email address for security display (e.g. j***n@domain.com)
    const maskEmail = (emailStr: string) => {
      const parts = emailStr.split("@");
      if (parts.length !== 2) return emailStr;
      const name = parts[0];
      const domain = parts[1];
      if (name.length <= 2) return `${name.charAt(0)}***@${domain}`;
      return `${name.charAt(0)}***${name.charAt(name.length - 1)}@${domain}`;
    };

    const mailOptions = {
      from: '"HSGA Telangana Employee Portal" <help.ckrdatapoint@gmail.com>',
      to: employee.email,
      subject: "HSGA Telangana Employee Portal - Verification Code (OTP)",
      html: `
        <div style="font-family: sans-serif; padding: 25px; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
          <h2 style="color: #002f6c; margin-top: 0; font-size: 20px; border-bottom: 2px solid #f0f4f8; padding-bottom: 12px;">Employee Portal Verification</h2>
          <p style="font-size: 14px; color: #334155; line-height: 1.5;">Hello ${employee.name},</p>
          <p style="font-size: 14px; color: #334155; line-height: 1.5;">A password reset request was initiated for your HSGA Telangana employee portal account. Please verify your identity using the following verification code.</p>
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
      email: employee.email,
      maskedEmail: maskEmail(employee.email),
      message: `Verification code sent successfully to your registered email address.`,
    });
  } catch (err) {
    console.error("Nodemailer employee forgot-password handler error:", err);
    const errMsg = err instanceof Error ? err.message : "Failed to process employee forgot-password request.";
    return NextResponse.json(
      { error: errMsg },
      { status: 500 }
    );
  }
}
