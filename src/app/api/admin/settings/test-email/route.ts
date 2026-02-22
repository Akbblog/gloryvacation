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

    const body = await request.json() as {
      smtpHost?: string;
      smtpPort?: string;
      smtpUsername?: string;
      smtpPassword?: string;
      fromEmail?: string;
      testEmail?: string;
    };

    const smtpHost = body.smtpHost?.trim();
    const smtpPort = body.smtpPort?.trim();
    const smtpUsername = body.smtpUsername?.trim();
    const smtpPassword = body.smtpPassword?.trim();
    const fromEmail = body.fromEmail?.trim();
    const testEmail = body.testEmail?.trim();

    if (!smtpHost || !smtpPort || !smtpUsername || !smtpPassword || !fromEmail) {
      return NextResponse.json({ error: "All SMTP settings are required" }, { status: 400 });
    }

    const recipientEmail = testEmail || session.user.email || fromEmail;

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort, 10),
      secure: smtpPort === "465", // true for 465, false for other ports
      auth: {
        user: smtpUsername,
        pass: smtpPassword,
      },
    });

    // Verify connection
    await transporter.verify();

    const bccSet = new Set<string>();
    const bccSources = [process.env.NOTIFICATION_BCC, fromEmail];
    for (const source of bccSources) {
      if (!source) continue;
      for (const email of source.split(",")) {
        const trimmed = email.trim();
        if (trimmed.length > 0) {
          bccSet.add(trimmed);
        }
      }
    }
    const bccRecipients = Array.from(bccSet);

    // Send test email
    const mailOptions = {
      from: fromEmail,
      to: recipientEmail,
      bcc: bccRecipients.length > 0 ? bccRecipients.join(", ") : undefined,
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
      message: `Test email sent successfully to ${recipientEmail}!`,
      bcc: bccRecipients
    });

  } catch (error) {
    console.error("Error sending test email:", error);
    const message = error instanceof Error
      ? error.message
      : "Failed to send test email. Please check your SMTP settings.";

    return NextResponse.json({
      error: message
    }, { status: 500 });
  }
}
