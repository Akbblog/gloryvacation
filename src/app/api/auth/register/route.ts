import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import connectDB from "@/lib/mongodb";
import { User } from "@/models/User";
import { NotificationService } from "@/lib/notifications/NotificationService";
import { sendNewUserSignupNotification } from "@/lib/email";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, password, role } = body;

        if (!name || !email || !password) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        await connectDB();

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return NextResponse.json(
                { message: "User already exists" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || "guest",
            isApproved: true,
        });

        // Notify all admins about new user registration
        try {
            const admins = await User.find({ role: "admin" });
            for (const admin of admins) {
                await NotificationService.notifyNewUserRegistration(
                    admin._id.toString(),
                    user.name
                );
            }
        } catch (notificationError) {
            console.error("Error sending new user registration notification:", notificationError);
            // Don't fail registration if notification fails
        }

        // Send SMTP email notification to admins about new signup.
        // Await here so the request lifecycle does not end before send completion.
        try {
            const signupMailSent = await sendNewUserSignupNotification({
                userId: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
            });
            if (!signupMailSent) {
                console.warn(`Signup email notification was not sent for user ${user._id}`);
            }
        } catch (smtpError) {
            console.error("Error sending signup SMTP notification:", smtpError);
        }

        return NextResponse.json(
            { message: "User created successfully", user: { id: user._id, name: user.name, email: user.email, role: user.role } },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
