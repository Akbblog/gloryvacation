import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { smtpHost, smtpPort, smtpUsername, smtpPassword, fromEmail, testEmail } = body;

    if (!smtpHost || !smtpPort || !smtpUsername || !smtpPassword || !fromEmail || !testEmail) {
      return NextResponse.json({ error: "All email settings are required" }, { status: 400 });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: smtpPort === "465", // true for 465, false for other ports
      auth: {
        user: smtpUsername,
        pass: smtpPassword,
      },
    });

    // Verify connection
    await transporter.verify();

    // Send test email
    const mailOptions = {
      from: fromEmail,
      to: testEmail,
      subject: "Glory Vacation - Email Test",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0F9690;">Email Configuration Test</h2>
          <p>Hi there!</p>
          <p>This is a test email to verify your SMTP configuration is working correctly.</p>
          <p>If you received this email, your email settings are properly configured.</p>
          <br>
          <p>Best regards,<br>Glory Vacation Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully!"
    });

  } catch (error: any) {
    console.error("Error sending test email:", error);
    return NextResponse.json({
      error: error.message || "Failed to send test email. Please check your SMTP settings."
    }, { status: 500 });
  }
}