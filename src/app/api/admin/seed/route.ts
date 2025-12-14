import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import connectDB from "@/lib/mongodb";
import { User } from "@/models/User";

export async function GET() {
    try {
        await connectDB();

        const email = process.env.ADMIN_EMAIL || "akb@tool.com";
        const password = process.env.ADMIN_PASSWORD || "tool.com";
        const name = "Admin User";

        // Check if admin exists
        const existingAdmin = await User.findOne({ email });

        if (existingAdmin) {
            // Update password if needed, or just return
            const hashedPassword = await bcrypt.hash(password, 10);
            existingAdmin.password = hashedPassword;
            existingAdmin.role = "admin";
            existingAdmin.isApproved = true;
            await existingAdmin.save();

            return NextResponse.json({ message: "Admin user updated successfully" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "admin",
            image: "",
            isApproved: true,
        });

        return NextResponse.json({
            message: "Admin user created successfully",
            user: { id: admin._id, email: admin.email, role: admin.role }
        });

    } catch (error: any) {
        console.error("Seeding error:", error);
        return NextResponse.json(
            { message: "Error seeding admin", error: error.message },
            { status: 500 }
        );
    }
}
