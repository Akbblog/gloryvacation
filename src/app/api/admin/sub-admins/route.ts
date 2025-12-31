import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from "bcryptjs";

// GET - List all sub-admins
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.email !== "akb@tool.com") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const subAdmins = await User.find({ role: "sub-admin" })
            .select("-password")
            .sort({ createdAt: -1 });

        // Ensure permissions are set for all sub-admins
        const subAdminsWithPermissions = subAdmins.map(subAdmin => {
            const data = subAdmin.toObject();
            if (!data.permissions) {
                data.permissions = {
                    canApproveUsers: false,
                    canDeleteUsers: false,
                    canManageListings: false,
                    canViewBookings: false,
                    canManageSettings: false,
                    canAccessMaintenance: false,
                    canPermanentDelete: false,
                };
            }
            return data;
        });

        return NextResponse.json(subAdminsWithPermissions);
    } catch (error) {
        console.error("Error fetching sub-admins:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

// POST - Create new sub-admin
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.email !== "akb@tool.com") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { email, password, name, phone, permissions } = await req.json();

        console.log("Received data:", { email, password: password ? "***" : null, name, phone, permissions });

        if (!email || !password || !name) {
            return NextResponse.json({ message: "Email, password, and name are required" }, { status: 400 });
        }

        await connectDB();

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ message: "User with this email already exists" }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create sub-admin
        const subAdmin = new User({
            email,
            password: hashedPassword,
            name,
            phone,
            role: "sub-admin",
            // permissions: {
            //     canApproveUsers: permissions?.canApproveUsers || false,
            //     canDeleteUsers: permissions?.canDeleteUsers || false,
            //     canManageListings: permissions?.canManageListings || false,
            //     canViewBookings: permissions?.canViewBookings || false,
            //     canManageSettings: permissions?.canManageSettings || false,
            //     canAccessMaintenance: false, // Never allow maintenance access
            //     canPermanentDelete: false, // Never allow permanent delete
            // },
            isApproved: true,
            emailVerified: new Date(),
        });

        console.log("Creating sub-admin:", email, name);

        try {
            await subAdmin.save();
            console.log("Sub-admin saved successfully:", subAdmin._id);
        } catch (saveError) {
            console.error("Error saving sub-admin:", saveError);
            const errMsg = saveError instanceof Error ? saveError.message : String(saveError);
            return NextResponse.json({ message: "Failed to save sub-admin", error: errMsg }, { status: 500 });
        }

        console.log("Sub-admin created successfully:", subAdmin._id);

        // Return without password
        const { password: _, ...subAdminData } = subAdmin.toObject();
        return NextResponse.json(subAdminData);
    } catch (error) {
        console.error("Error creating sub-admin:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}