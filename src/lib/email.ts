import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

export interface EmailConfig {
    to: string;
    subject: string;
    html: string;
    text?: string;
    replyTo?: string;
    bcc?: string;
}

function parseRecipients(raw?: string): string[] {
    if (!raw) return [];
    return raw
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email.length > 0);
}

function uniqueRecipients(recipients: string[]): string[] {
    const seen = new Set<string>();
    const result: string[] = [];

    for (const recipient of recipients) {
        const normalized = recipient.toLowerCase();
        if (seen.has(normalized)) continue;
        seen.add(normalized);
        result.push(recipient);
    }

    return result;
}

function getNotificationRecipients(...rawLists: Array<string | undefined>): string[] {
    return uniqueRecipients(rawLists.flatMap((raw) => parseRecipients(raw)));
}

function escapeHtml(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&#39;");
}

function cleanSubjectPart(value: string, fallback: string = "Notification"): string {
    const cleaned = value.replace(/\s+/g, " ").trim();
    return cleaned.length > 0 ? cleaned.slice(0, 90) : fallback;
}

function inferSmtpHeloName(): string | undefined {
    const explicit = process.env.SMTP_HELO?.trim();
    if (explicit) return explicit;

    const siteDomain = process.env.SITE_DOMAIN?.trim();
    if (!siteDomain) return undefined;

    try {
        return new URL(siteDomain).hostname;
    } catch {
        return undefined;
    }
}

// Create reusable transporter
function createTransporter() {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpTlsServername = process.env.SMTP_TLS_SERVERNAME?.trim();
    const smtpHeloName = inferSmtpHeloName();

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
        return null;
    }

    const transportConfig: SMTPTransport.Options = {
        host: smtpHost,
        port: Number(smtpPort),
        secure: Number(smtpPort) === 465,
        auth: { user: smtpUser, pass: smtpPass },
    };

    if (smtpHeloName) {
        transportConfig.name = smtpHeloName;
    }

    if (smtpTlsServername) {
        transportConfig.tls = { servername: smtpTlsServername };
    }

    return nodemailer.createTransport(transportConfig);
}

export async function sendEmail(config: EmailConfig): Promise<boolean> {
    try {
        const transporter = createTransporter();
        if (!transporter) {
            console.warn("Email not configured - SMTP settings missing");
            return false;
        }

        const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER;
        const fromName = process.env.FROM_NAME || "Glory Vacation";
        const toRecipients = uniqueRecipients(parseRecipients(config.to));
        if (toRecipients.length === 0) {
            console.warn("No recipients provided to sendEmail");
            return false;
        }

        const globalBccRecipients = uniqueRecipients([
            ...parseRecipients(config.bcc),
            ...parseRecipients(process.env.NOTIFICATION_BCC),
        ]);

        let allSent = true;

        for (const recipient of toRecipients) {
            const bccRecipients = globalBccRecipients.filter(
                (bcc) => bcc.toLowerCase() !== recipient.toLowerCase()
            );

            const info = await transporter.sendMail({
                from: `"${fromName}" <${fromEmail}>`,
                to: recipient,
                bcc: bccRecipients.length > 0 ? bccRecipients.join(", ") : undefined,
                subject: config.subject,
                html: config.html,
                text: config.text,
                replyTo: config.replyTo,
            });

            const accepted = Array.isArray(info.accepted) ? info.accepted : [];
            const rejected = Array.isArray(info.rejected) ? info.rejected : [];

            if (rejected.length > 0) {
                console.warn("Email rejected by SMTP server", {
                    rejected,
                    to: recipient,
                    bcc: bccRecipients,
                    messageId: info.messageId,
                });
                allSent = false;
            }

            if (accepted.length === 0) {
                console.warn("SMTP server did not accept any recipients", {
                    to: recipient,
                    bcc: bccRecipients,
                    messageId: info.messageId,
                });
                allSent = false;
            }
        }

        return allSent;
    } catch (error) {
        console.error("Failed to send email:", error);
        return false;
    }
}

// Base email template
function baseTemplate(content: string, preheader: string = ""): string {
    const siteDomain = process.env.SITE_DOMAIN || "https://gloryvacation.com";
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Glory Vacation</title>
    <!--[if mso]>
    <style type="text/css">
        table { border-collapse: collapse; }
        .fallback-font { font-family: Arial, sans-serif; }
    </style>
    <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f7; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <!-- Preheader text -->
    <div style="display: none; max-height: 0px; overflow: hidden;">${preheader}</div>
    
    <!-- Main container -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f7;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <!-- Email wrapper -->
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%;">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px 40px; border-radius: 16px 16px 0 0; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Glory Vacation</h1>
                            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Your Premium Holiday Rental Partner</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="background-color: #ffffff; padding: 40px;">
                            ${content}
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 30px 40px; border-radius: 0 0 16px 16px; border-top: 1px solid #e2e8f0;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td style="text-align: center;">
                                        <p style="margin: 0 0 15px; color: #64748b; font-size: 14px;">
                                            Need help? Contact us at 
                                            <a href="mailto:support@gloryvacation.com" style="color: #2563eb; text-decoration: none;">support@gloryvacation.com</a>
                                        </p>
                                        <p style="margin: 0 0 15px; color: #94a3b8; font-size: 12px;">
                                            Glory Vacation<br>
                                            Dubai, United Arab Emirates
                                        </p>
                                        <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                                            <a href="${siteDomain}" style="color: #2563eb; text-decoration: none;">Visit our website</a>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}

// Status badge styles
const statusStyles: Record<string, { bg: string; color: string; label: string }> = {
    pending: { bg: "#fef3c7", color: "#92400e", label: "Pending Review" },
    contacted: { bg: "#dbeafe", color: "#1e40af", label: "Contacted" },
    approved: { bg: "#dcfce7", color: "#166534", label: "Approved" },
    confirmed: { bg: "#d1fae5", color: "#065f46", label: "Confirmed" },
    rejected: { bg: "#fee2e2", color: "#991b1b", label: "Declined" },
    cancelled: { bg: "#f3f4f6", color: "#374151", label: "Cancelled" },
};

interface ReservationEmailData {
    guestName: string;
    guestEmail: string;
    propertyTitle: string;
    propertyId: string;
    checkIn: string;
    checkOut?: string;
    guests: number;
    reservationId: string;
    status: string;
    adminNote?: string;
    totalAmount?: number;
    currency?: string;
}

interface UserSignupEmailData {
    userId: string;
    name: string;
    email: string;
    role: string;
}

interface PropertyListedEmailData {
    propertyId: string;
    propertyTitle: string;
    hostName: string;
    hostEmail?: string;
    propertyType?: string;
    location?: string;
    bedrooms?: number;
}

interface PropertySubmissionEmailData {
    inquiryId: string;
    ownerName: string;
    email: string;
    phone: string;
    propertyType: string;
    bedrooms: string;
    location: string;
    message?: string;
}

interface BookingNotificationEmailData {
    bookingId: string;
    guestName: string;
    guestEmail: string;
    guestPhone?: string;
    propertyTitle: string;
    propertyId: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    totalPrice?: number;
    status: string;
}

interface ContactMessageEmailData {
    messageId: string;
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    propertyTitle?: string;
    propertyId?: string;
}

// Guest notification for status change
export function getStatusChangeEmailTemplate(data: ReservationEmailData): { subject: string; html: string; text: string } {
    const siteDomain = process.env.SITE_DOMAIN || "https://gloryvacation.com";
    const statusInfo = statusStyles[data.status] || statusStyles.pending;
    
    const statusMessages: Record<string, { title: string; message: string }> = {
        pending: {
            title: "Reservation Request Received",
            message: "Thank you for your reservation request! Our team is currently reviewing your booking and will get back to you shortly.",
        },
        contacted: {
            title: "We've Reached Out!",
            message: "Our team has reviewed your reservation request and has sent you additional information. Please check your inbox and respond at your earliest convenience.",
        },
        approved: {
            title: "Reservation Approved",
            message: "Great news! Your reservation has been approved. Please proceed with the confirmation to secure your booking.",
        },
        confirmed: {
            title: "Booking Confirmed",
            message: "Your booking is now confirmed! We're excited to host you and look forward to making your stay memorable.",
        },
        rejected: {
            title: "Reservation Update",
            message: "We regret to inform you that we're unable to accommodate your reservation request at this time. Please don't hesitate to explore our other available properties.",
        },
        cancelled: {
            title: "Reservation Cancelled",
            message: "Your reservation has been cancelled as requested. We hope to have the opportunity to host you in the future.",
        },
    };

    const { title, message } = statusMessages[data.status] || statusMessages.pending;

    const content = `
        <!-- Greeting -->
        <h2 style="margin: 0 0 20px; color: #1e293b; font-size: 24px; font-weight: 600;">
            Hello ${data.guestName},
        </h2>
        
        <!-- Status Badge -->
        <div style="margin-bottom: 25px;">
            <span style="display: inline-block; padding: 8px 16px; background-color: ${statusInfo.bg}; color: ${statusInfo.color}; border-radius: 20px; font-size: 14px; font-weight: 600;">
                ${statusInfo.label}
            </span>
        </div>
        
        <!-- Main Message -->
        <p style="margin: 0 0 25px; color: #475569; font-size: 16px; line-height: 1.6;">
            ${message}
        </p>
        
        ${data.adminNote ? `
        <!-- Admin Note -->
        <div style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 16px 20px; margin-bottom: 25px; border-radius: 0 8px 8px 0;">
            <p style="margin: 0 0 5px; color: #0369a1; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Message from our team:</p>
            <p style="margin: 0; color: #475569; font-size: 15px; line-height: 1.5;">${data.adminNote}</p>
        </div>
        ` : ""}
        
        <!-- Reservation Details Card -->
        <div style="background-color: #f8fafc; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
            <h3 style="margin: 0 0 20px; color: #1e293b; font-size: 18px; font-weight: 600; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px;">
                Reservation Details
            </h3>
            
            <!-- Property -->
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 15px;">
                <tr>
                    <td width="40" valign="top">
                        <div style="width: 36px; height: 36px; background-color: #dbeafe; border-radius: 8px; text-align: center; line-height: 36px; font-size: 12px; font-weight: 700; color: #1e40af;">P</div>
                    </td>
                    <td style="padding-left: 12px;">
                        <p style="margin: 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Property</p>
                        <p style="margin: 4px 0 0; color: #1e293b; font-size: 15px; font-weight: 500;">${data.propertyTitle}</p>
                    </td>
                </tr>
            </table>
            
            <!-- Dates -->
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 15px;">
                <tr>
                    <td width="40" valign="top">
                        <div style="width: 36px; height: 36px; background-color: #dcfce7; border-radius: 8px; text-align: center; line-height: 36px; font-size: 12px; font-weight: 700; color: #166534;">D</div>
                    </td>
                    <td style="padding-left: 12px;">
                        <p style="margin: 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Dates</p>
                        <p style="margin: 4px 0 0; color: #1e293b; font-size: 15px; font-weight: 500;">
                            ${data.checkIn}${data.checkOut ? ` to ${data.checkOut}` : ""}
                        </p>
                    </td>
                </tr>
            </table>
            
            <!-- Guests -->
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                    <td width="40" valign="top">
                        <div style="width: 36px; height: 36px; background-color: #fef3c7; border-radius: 8px; text-align: center; line-height: 36px; font-size: 12px; font-weight: 700; color: #92400e;">G</div>
                    </td>
                    <td style="padding-left: 12px;">
                        <p style="margin: 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Guests</p>
                        <p style="margin: 4px 0 0; color: #1e293b; font-size: 15px; font-weight: 500;">${data.guests} Guest${data.guests > 1 ? "s" : ""}</p>
                    </td>
                </tr>
            </table>
            
            ${data.totalAmount ? `
            <!-- Total Amount -->
            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px dashed #e2e8f0;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                        <td>
                            <p style="margin: 0; color: #64748b; font-size: 14px;">Total Amount</p>
                        </td>
                        <td style="text-align: right;">
                            <p style="margin: 0; color: #1e293b; font-size: 20px; font-weight: 700;">${data.currency || "AED"} ${data.totalAmount.toLocaleString()}</p>
                        </td>
                    </tr>
                </table>
            </div>
            ` : ""}
        </div>
        
        <!-- CTA Button -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
                <td align="center">
                    <a href="${siteDomain}/en/listings/${data.propertyId}" 
                       style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px;">
                        View Property
                    </a>
                </td>
            </tr>
        </table>
        
        <!-- Reference ID -->
        <p style="margin: 25px 0 0; color: #94a3b8; font-size: 12px; text-align: center;">
            Reference ID: ${data.reservationId}
        </p>
    `;

    const text = `
${title}

Hello ${data.guestName},

${message}

${data.adminNote ? `Message from our team: ${data.adminNote}\n` : ""}

Reservation Details:
- Property: ${data.propertyTitle}
- Check-in: ${data.checkIn}
- Check-out: ${data.checkOut || "N/A"}
- Guests: ${data.guests}
${data.totalAmount ? `- Total: ${data.currency || "AED"} ${data.totalAmount}` : ""}

Reference ID: ${data.reservationId}

View Property: ${siteDomain}/en/listings/${data.propertyId}

---
Glory Vacation
Dubai, United Arab Emirates
${siteDomain}
    `.trim();

    return {
        subject: `Glory Vacation: ${title} - ${cleanSubjectPart(data.propertyTitle, "Reservation")}`,
        html: baseTemplate(content, message.slice(0, 100)),
        text,
    };
}

// Admin notification for new reservation
export function getNewReservationEmailTemplate(data: ReservationEmailData): { subject: string; html: string; text: string } {
    const siteDomain = process.env.SITE_DOMAIN || "https://gloryvacation.com";
    
    const content = `
        <!-- Alert Header -->
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); margin: -40px -40px 30px; padding: 25px 40px; text-align: center;">
            <h2 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 600;">
                New Reservation Request
            </h2>
        </div>
        
        <!-- Quick Stats -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 25px;">
            <tr>
                <td width="50%" style="padding-right: 10px;">
                    <div style="background-color: #fef3c7; padding: 15px; border-radius: 10px; text-align: center;">
                        <p style="margin: 0; color: #92400e; font-size: 12px; text-transform: uppercase;">Status</p>
                        <p style="margin: 5px 0 0; color: #78350f; font-size: 16px; font-weight: 700;">Pending Review</p>
                    </div>
                </td>
                <td width="50%" style="padding-left: 10px;">
                    <div style="background-color: #dbeafe; padding: 15px; border-radius: 10px; text-align: center;">
                        <p style="margin: 0; color: #1e40af; font-size: 12px; text-transform: uppercase;">Guests</p>
                        <p style="margin: 5px 0 0; color: #1e3a8a; font-size: 16px; font-weight: 700;">${data.guests}</p>
                    </div>
                </td>
            </tr>
        </table>
        
        <!-- Guest Information -->
        <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 15px; color: #1e293b; font-size: 16px; font-weight: 600;">Guest Information</h3>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="5">
                <tr>
                    <td width="100" style="color: #64748b; font-size: 14px;">Name:</td>
                    <td style="color: #1e293b; font-size: 14px; font-weight: 500;">${data.guestName}</td>
                </tr>
                <tr>
                    <td style="color: #64748b; font-size: 14px;">Email:</td>
                    <td style="color: #1e293b; font-size: 14px;"><a href="mailto:${data.guestEmail}" style="color: #2563eb;">${data.guestEmail}</a></td>
                </tr>
            </table>
        </div>
        
        <!-- Property & Dates -->
        <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
            <h3 style="margin: 0 0 15px; color: #1e293b; font-size: 16px; font-weight: 600;">Reservation Details</h3>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="5">
                <tr>
                    <td width="100" style="color: #64748b; font-size: 14px;">Property:</td>
                    <td style="color: #1e293b; font-size: 14px; font-weight: 500;">${data.propertyTitle}</td>
                </tr>
                <tr>
                    <td style="color: #64748b; font-size: 14px;">Check-in:</td>
                    <td style="color: #1e293b; font-size: 14px;">${data.checkIn}</td>
                </tr>
                <tr>
                    <td style="color: #64748b; font-size: 14px;">Check-out:</td>
                    <td style="color: #1e293b; font-size: 14px;">${data.checkOut || "Not specified"}</td>
                </tr>
            </table>
        </div>
        
        <!-- CTA -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
                <td align="center">
                    <a href="${siteDomain}/en/admin/reservations" 
                       style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px;">
                        View in Admin Panel
                    </a>
                </td>
            </tr>
        </table>
        
        <p style="margin: 25px 0 0; color: #94a3b8; font-size: 12px; text-align: center;">
            Reservation ID: ${data.reservationId}
        </p>
    `;

    const text = `
New Reservation Request

Guest Information:
- Name: ${data.guestName}
- Email: ${data.guestEmail}

Reservation Details:
- Property: ${data.propertyTitle}
- Check-in: ${data.checkIn}
- Check-out: ${data.checkOut || "Not specified"}
- Guests: ${data.guests}

View in Admin Panel: ${siteDomain}/en/admin/reservations

Reservation ID: ${data.reservationId}
    `.trim();

    return {
        subject: `Glory Vacation: New reservation request - ${cleanSubjectPart(data.propertyTitle, "Property")}`,
        html: baseTemplate(content, `New reservation from ${data.guestName}`),
        text,
    };
}

export function getNewUserSignupEmailTemplate(data: UserSignupEmailData): { subject: string; html: string; text: string } {
    const siteDomain = process.env.SITE_DOMAIN || "https://gloryvacation.com";

    const safeName = escapeHtml(data.name);
    const safeEmail = escapeHtml(data.email);
    const safeRole = escapeHtml(data.role);
    const safeUserId = escapeHtml(data.userId);

    const content = `
        <h2 style="margin: 0 0 18px; color: #1e293b; font-size: 22px; font-weight: 600;">New User Registration</h2>
        <p style="margin: 0 0 20px; color: #475569; font-size: 15px; line-height: 1.6;">
            A new user account was created on Glory Vacation. Review the account details below.
        </p>
        <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px;">
            <p style="margin: 0 0 8px; color: #334155; font-size: 14px;"><strong>Name:</strong> ${safeName}</p>
            <p style="margin: 0 0 8px; color: #334155; font-size: 14px;"><strong>Email:</strong> ${safeEmail}</p>
            <p style="margin: 0 0 8px; color: #334155; font-size: 14px;"><strong>Role:</strong> ${safeRole}</p>
            <p style="margin: 0; color: #334155; font-size: 14px;"><strong>User ID:</strong> ${safeUserId}</p>
        </div>
        <p style="margin: 20px 0 0; color: #64748b; font-size: 13px;">
            Admin panel: ${siteDomain}/en/admin/users
        </p>
    `;

    const text = `
New User Registration

A new user account was created on Glory Vacation. Review the account details below.

Name: ${data.name}
Email: ${data.email}
Role: ${data.role}
User ID: ${data.userId}

Admin panel: ${siteDomain}/en/admin/users
    `.trim();

    return {
        subject: `Glory Vacation: New user registration - ${cleanSubjectPart(data.name, "User")}`,
        html: baseTemplate(content, "New user registration"),
        text,
    };
}

export function getNewPropertyListedEmailTemplate(data: PropertyListedEmailData): { subject: string; html: string; text: string } {
    const siteDomain = process.env.SITE_DOMAIN || "https://gloryvacation.com";

    const safePropertyTitle = escapeHtml(data.propertyTitle);
    const safeHostName = escapeHtml(data.hostName);
    const safeHostEmail = escapeHtml(data.hostEmail || "N/A");
    const safePropertyType = escapeHtml(data.propertyType || "N/A");
    const safeLocation = escapeHtml(data.location || "N/A");
    const safeBedrooms = data.bedrooms !== undefined ? String(data.bedrooms) : "N/A";
    const safePropertyId = escapeHtml(data.propertyId);

    const content = `
        <h2 style="margin: 0 0 18px; color: #1e293b; font-size: 22px; font-weight: 600;">New Property Listing</h2>
        <p style="margin: 0 0 20px; color: #475569; font-size: 15px; line-height: 1.6;">
            A host added a property listing on Glory Vacation. Review the listing details below.
        </p>
        <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px;">
            <p style="margin: 0 0 8px; color: #334155; font-size: 14px;"><strong>Property:</strong> ${safePropertyTitle}</p>
            <p style="margin: 0 0 8px; color: #334155; font-size: 14px;"><strong>Host:</strong> ${safeHostName}</p>
            <p style="margin: 0 0 8px; color: #334155; font-size: 14px;"><strong>Host Email:</strong> ${safeHostEmail}</p>
            <p style="margin: 0 0 8px; color: #334155; font-size: 14px;"><strong>Type:</strong> ${safePropertyType}</p>
            <p style="margin: 0 0 8px; color: #334155; font-size: 14px;"><strong>Bedrooms:</strong> ${safeBedrooms}</p>
            <p style="margin: 0 0 8px; color: #334155; font-size: 14px;"><strong>Location:</strong> ${safeLocation}</p>
            <p style="margin: 0; color: #334155; font-size: 14px;"><strong>Property ID:</strong> ${safePropertyId}</p>
        </div>
        <p style="margin: 20px 0 0; color: #64748b; font-size: 13px;">
            Admin panel: ${siteDomain}/en/admin/listings
        </p>
    `;

    const text = `
New Property Listing

A host added a property listing on Glory Vacation. Review the listing details below.

Property: ${data.propertyTitle}
Host: ${data.hostName}
Host Email: ${data.hostEmail || "N/A"}
Type: ${data.propertyType || "N/A"}
Bedrooms: ${data.bedrooms ?? "N/A"}
Location: ${data.location || "N/A"}
Property ID: ${data.propertyId}

Admin panel: ${siteDomain}/en/admin/listings
    `.trim();

    return {
        subject: `Glory Vacation: New property listing - ${cleanSubjectPart(data.propertyTitle, "Property")}`,
        html: baseTemplate(content, "New property listing"),
        text,
    };
}

export function getPropertySubmissionEmailTemplate(data: PropertySubmissionEmailData): { subject: string; html: string; text: string } {
    const siteDomain = process.env.SITE_DOMAIN || "https://gloryvacation.com";

    const safeOwnerName = escapeHtml(data.ownerName);
    const safeEmail = escapeHtml(data.email);
    const safePhone = escapeHtml(data.phone);
    const safePropertyType = escapeHtml(data.propertyType);
    const safeBedrooms = escapeHtml(data.bedrooms);
    const safeLocation = escapeHtml(data.location);
    const safeMessage = data.message ? escapeHtml(data.message) : "";
    const safeInquiryId = escapeHtml(data.inquiryId);

    const content = `
        <h2 style="margin: 0 0 18px; color: #1e293b; font-size: 22px; font-weight: 600;">New Property Inquiry</h2>
        <p style="margin: 0 0 20px; color: #475569; font-size: 15px; line-height: 1.6;">
            A property owner submitted the "List Your Property" form. Follow up using the contact details below.
        </p>
        <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px;">
            <p style="margin: 0 0 8px; color: #334155; font-size: 14px;"><strong>Owner Name:</strong> ${safeOwnerName}</p>
            <p style="margin: 0 0 8px; color: #334155; font-size: 14px;"><strong>Email:</strong> ${safeEmail}</p>
            <p style="margin: 0 0 8px; color: #334155; font-size: 14px;"><strong>Phone:</strong> ${safePhone}</p>
            <p style="margin: 0 0 8px; color: #334155; font-size: 14px;"><strong>Property Type:</strong> ${safePropertyType}</p>
            <p style="margin: 0 0 8px; color: #334155; font-size: 14px;"><strong>Bedrooms:</strong> ${safeBedrooms}</p>
            <p style="margin: 0 0 8px; color: #334155; font-size: 14px;"><strong>Location:</strong> ${safeLocation}</p>
            ${safeMessage ? `<p style="margin: 0 0 8px; color: #334155; font-size: 14px;"><strong>Message:</strong> ${safeMessage}</p>` : ""}
            <p style="margin: 0; color: #334155; font-size: 14px;"><strong>Inquiry ID:</strong> ${safeInquiryId}</p>
        </div>
        <p style="margin: 20px 0 0; color: #64748b; font-size: 13px;">
            Admin panel: ${siteDomain}/en/admin/messages
        </p>
    `;

    const text = `
New Property Inquiry

A property owner submitted the "List Your Property" form. Follow up using the contact details below.

Owner Name: ${data.ownerName}
Email: ${data.email}
Phone: ${data.phone}
Property Type: ${data.propertyType}
Bedrooms: ${data.bedrooms}
Location: ${data.location}
${data.message ? `Message: ${data.message}\n` : ""}Inquiry ID: ${data.inquiryId}

Admin panel: ${siteDomain}/en/admin/messages
    `.trim();

    return {
        subject: `Glory Vacation: New property inquiry - ${cleanSubjectPart(data.ownerName, "Owner")}`,
        html: baseTemplate(content, "New property inquiry"),
        text,
    };
}

export function getNewBookingEmailTemplate(data: BookingNotificationEmailData): { subject: string; html: string; text: string } {
    const siteDomain = process.env.SITE_DOMAIN || "https://gloryvacation.com";

    const safeGuestName = escapeHtml(data.guestName);
    const safeGuestEmail = escapeHtml(data.guestEmail);
    const safeGuestPhone = escapeHtml(data.guestPhone || "N/A");
    const safePropertyTitle = escapeHtml(data.propertyTitle);
    const safePropertyId = escapeHtml(data.propertyId);
    const safeBookingId = escapeHtml(data.bookingId);
    const safeCheckIn = escapeHtml(data.checkIn);
    const safeCheckOut = escapeHtml(data.checkOut);
    const safeStatus = escapeHtml(data.status);
    const totalPrice = typeof data.totalPrice === "number" ? `AED ${data.totalPrice.toLocaleString()}` : "N/A";

    const content = `
        <h2 style="margin: 0 0 18px; color: #1e293b; font-size: 22px; font-weight: 600;">New Booking Request</h2>
        <p style="margin: 0 0 20px; color: #475569; font-size: 15px; line-height: 1.6;">
            A guest submitted a booking request on Glory Vacation. Review the stay details and contact the guest if needed.
        </p>
        <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px;">
            <p style="margin: 0 0 8px; color: #334155; font-size: 14px;"><strong>Guest:</strong> ${safeGuestName}</p>
            <p style="margin: 0 0 8px; color: #334155; font-size: 14px;"><strong>Email:</strong> ${safeGuestEmail}</p>
            <p style="margin: 0 0 8px; color: #334155; font-size: 14px;"><strong>Phone:</strong> ${safeGuestPhone}</p>
            <p style="margin: 0 0 8px; color: #334155; font-size: 14px;"><strong>Property:</strong> ${safePropertyTitle}</p>
            <p style="margin: 0 0 8px; color: #334155; font-size: 14px;"><strong>Check-in:</strong> ${safeCheckIn}</p>
            <p style="margin: 0 0 8px; color: #334155; font-size: 14px;"><strong>Check-out:</strong> ${safeCheckOut}</p>
            <p style="margin: 0 0 8px; color: #334155; font-size: 14px;"><strong>Guests:</strong> ${data.guests}</p>
            <p style="margin: 0 0 8px; color: #334155; font-size: 14px;"><strong>Total:</strong> ${totalPrice}</p>
            <p style="margin: 0 0 8px; color: #334155; font-size: 14px;"><strong>Status:</strong> ${safeStatus}</p>
            <p style="margin: 0 0 8px; color: #334155; font-size: 14px;"><strong>Property ID:</strong> ${safePropertyId}</p>
            <p style="margin: 0; color: #334155; font-size: 14px;"><strong>Booking ID:</strong> ${safeBookingId}</p>
        </div>
        <p style="margin: 20px 0 0; color: #64748b; font-size: 13px;">
            Admin panel: ${siteDomain}/en/admin/bookings
        </p>
    `;

    const text = `
New Booking Request

A guest submitted a booking request on Glory Vacation. Review the stay details and contact the guest if needed.

Guest: ${data.guestName}
Email: ${data.guestEmail}
Phone: ${data.guestPhone || "N/A"}
Property: ${data.propertyTitle}
Check-in: ${data.checkIn}
Check-out: ${data.checkOut}
Guests: ${data.guests}
Total: ${totalPrice}
Status: ${data.status}
Property ID: ${data.propertyId}
Booking ID: ${data.bookingId}

Admin panel: ${siteDomain}/en/admin/bookings
    `.trim();

    return {
        subject: `Glory Vacation: New booking request - ${cleanSubjectPart(data.propertyTitle, "Property")}`,
        html: baseTemplate(content, "New booking request"),
        text,
    };
}

export function getNewContactMessageEmailTemplate(data: ContactMessageEmailData): { subject: string; html: string; text: string } {
    const siteDomain = process.env.SITE_DOMAIN || "https://gloryvacation.com";

    const safeName = escapeHtml(data.name);
    const safeEmail = escapeHtml(data.email);
    const safePhone = escapeHtml(data.phone || "N/A");
    const safeSubject = escapeHtml(data.subject);
    const safeMessage = escapeHtml(data.message);
    const safeMessageId = escapeHtml(data.messageId);
    const safePropertyTitle = data.propertyTitle ? escapeHtml(data.propertyTitle) : "";
    const safePropertyId = data.propertyId ? escapeHtml(data.propertyId) : "";

    const content = `
        <h2 style="margin: 0 0 18px; color: #1e293b; font-size: 22px; font-weight: 600;">New Contact Message</h2>
        <p style="margin: 0 0 20px; color: #475569; font-size: 15px; line-height: 1.6;">
            A visitor submitted a contact message on Glory Vacation. Reply directly to this email or review it in the admin panel.
        </p>
        <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px;">
            <p style="margin: 0 0 8px; color: #334155; font-size: 14px;"><strong>Name:</strong> ${safeName}</p>
            <p style="margin: 0 0 8px; color: #334155; font-size: 14px;"><strong>Email:</strong> ${safeEmail}</p>
            <p style="margin: 0 0 8px; color: #334155; font-size: 14px;"><strong>Phone:</strong> ${safePhone}</p>
            <p style="margin: 0 0 8px; color: #334155; font-size: 14px;"><strong>Subject:</strong> ${safeSubject}</p>
            ${safePropertyTitle ? `<p style="margin: 0 0 8px; color: #334155; font-size: 14px;"><strong>Property:</strong> ${safePropertyTitle}</p>` : ""}
            ${safePropertyId ? `<p style="margin: 0 0 8px; color: #334155; font-size: 14px;"><strong>Property ID:</strong> ${safePropertyId}</p>` : ""}
            <p style="margin: 0 0 8px; color: #334155; font-size: 14px;"><strong>Message:</strong></p>
            <p style="margin: 0 0 8px; color: #334155; font-size: 14px; white-space: pre-wrap;">${safeMessage}</p>
            <p style="margin: 0; color: #334155; font-size: 14px;"><strong>Message ID:</strong> ${safeMessageId}</p>
        </div>
        <p style="margin: 20px 0 0; color: #64748b; font-size: 13px;">
            Admin panel: ${siteDomain}/en/admin/messages
        </p>
    `;

    const text = `
New Contact Message

A visitor submitted a contact message on Glory Vacation. Reply directly to this email or review it in the admin panel.

Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone || "N/A"}
Subject: ${data.subject}
${data.propertyTitle ? `Property: ${data.propertyTitle}\n` : ""}${data.propertyId ? `Property ID: ${data.propertyId}\n` : ""}Message: ${data.message}
Message ID: ${data.messageId}

Admin panel: ${siteDomain}/en/admin/messages
    `.trim();

    return {
        subject: `Glory Vacation: New message - ${cleanSubjectPart(data.subject, "Contact form")}`,
        html: baseTemplate(content, "New contact message"),
        text,
    };
}

// Send status change notification to guest
export async function sendReservationStatusEmail(data: ReservationEmailData): Promise<boolean> {
    const { subject, html, text } = getStatusChangeEmailTemplate(data);
    return sendEmail({
        to: data.guestEmail,
        subject,
        html,
        text,
    });
}

// Send new reservation notification to admin
export async function sendNewReservationNotification(data: ReservationEmailData): Promise<boolean> {
    const recipients = getNotificationRecipients(
        process.env.RESERVATION_NOTIFY_TO,
        process.env.NOTIFICATION_EMAILS,
        process.env.ADMIN_EMAIL
    );
    if (recipients.length === 0) {
        console.warn("No admin email configured for reservation notifications");
        return false;
    }

    const { subject, html, text } = getNewReservationEmailTemplate(data);
    return sendEmail({
        to: recipients.join(", "),
        subject,
        html,
        text,
        replyTo: data.guestEmail,
    });
}

export async function sendNewUserSignupNotification(data: UserSignupEmailData): Promise<boolean> {
    const recipients = getNotificationRecipients(
        process.env.SIGNUP_NOTIFY_TO,
        process.env.NOTIFICATION_EMAILS,
        process.env.ADMIN_EMAIL
    );

    if (recipients.length === 0) {
        console.warn("No admin email configured for signup notifications");
        return false;
    }

    const { subject, html, text } = getNewUserSignupEmailTemplate(data);
    return sendEmail({
        to: recipients.join(", "),
        subject,
        html,
        text,
        replyTo: data.email,
    });
}

export async function sendNewPropertyListedNotification(data: PropertyListedEmailData): Promise<boolean> {
    const recipients = getNotificationRecipients(
        process.env.PROPERTY_NOTIFY_TO,
        process.env.NOTIFICATION_EMAILS,
        process.env.ADMIN_EMAIL
    );

    if (recipients.length === 0) {
        console.warn("No admin email configured for property listing notifications");
        return false;
    }

    const { subject, html, text } = getNewPropertyListedEmailTemplate(data);
    return sendEmail({
        to: recipients.join(", "),
        subject,
        html,
        text,
        replyTo: data.hostEmail,
    });
}

export async function sendPropertySubmissionNotification(data: PropertySubmissionEmailData): Promise<boolean> {
    const recipients = getNotificationRecipients(
        process.env.PROPERTY_SUBMISSION_NOTIFY_TO,
        process.env.PROPERTY_NOTIFY_TO,
        process.env.NOTIFICATION_EMAILS,
        process.env.ADMIN_EMAIL
    );

    if (recipients.length === 0) {
        console.warn("No admin email configured for property submission notifications");
        return false;
    }

    const { subject, html, text } = getPropertySubmissionEmailTemplate(data);
    return sendEmail({
        to: recipients.join(", "),
        subject,
        html,
        text,
        replyTo: data.email,
    });
}

export async function sendNewBookingNotification(data: BookingNotificationEmailData): Promise<boolean> {
    const recipients = getNotificationRecipients(
        process.env.BOOKING_NOTIFY_TO,
        process.env.RESERVATION_NOTIFY_TO,
        process.env.NOTIFICATION_EMAILS,
        process.env.ADMIN_EMAIL
    );

    if (recipients.length === 0) {
        console.warn("No admin email configured for booking notifications");
        return false;
    }

    const { subject, html, text } = getNewBookingEmailTemplate(data);
    return sendEmail({
        to: recipients.join(", "),
        subject,
        html,
        text,
        replyTo: data.guestEmail,
    });
}

export async function sendNewContactMessageNotification(data: ContactMessageEmailData): Promise<boolean> {
    const recipients = getNotificationRecipients(
        process.env.CONTACT_NOTIFY_TO,
        process.env.NOTIFICATION_EMAILS,
        process.env.ADMIN_EMAIL
    );

    if (recipients.length === 0) {
        console.warn("No admin email configured for contact message notifications");
        return false;
    }

    const { subject, html, text } = getNewContactMessageEmailTemplate(data);
    return sendEmail({
        to: recipients.join(", "),
        subject,
        html,
        text,
        replyTo: data.email,
    });
}
