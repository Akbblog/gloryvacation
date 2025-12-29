import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";

// Default settings
const defaultSettings = {
  general: {
    siteName: "Glory Vacation Homes",
    tagline: "Your Perfect Holiday Awaits",
    contactEmail: "info@gloryvacation.com",
    contactPhone: "+971 50 350 5752",
    whatsappNumber: "+92 345 2140314",
    address: "Business Bay, Dubai, UAE",
    currency: "AED",
  },
  branding: {
    primaryColor: "#0F9690",
    secondaryColor: "#F5A623",
    logo: "",
    favicon: "",
  },
  notifications: {
    newBooking: true,
    bookingCancellation: true,
    newUserRegistration: true,
    propertyInquiries: true,
    reviewNotifications: true,
    paymentAlerts: true,
  },
  email: {
    smtpHost: "",
    smtpPort: "587",
    smtpUsername: "",
    smtpPassword: "",
    fromEmail: "noreply@gloryvacation.com",
  },
  seo: {
    metaTitle: "Glory Vacation - Premium Holiday Homes in Dubai",
    metaDescription: "Discover luxury holiday homes and vacation rentals in Dubai. DTCM licensed properties with premium amenities and exceptional service.",
    metaKeywords: "holiday homes dubai, vacation rentals, dubai apartments, luxury villa dubai",
    googleAnalyticsId: "",
  },
  security: {
    emailVerification: true,
    adminApproval: true,
    twoFactorAuth: false,
    rateLimiting: true,
    maintenanceMode: false,
  },
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    // Get settings from database, or use defaults if not found
    const settings = await db.collection("settings").findOne({ type: "site" });

    if (!settings) {
      // Insert default settings
      await db.collection("settings").insertOne({
        type: "site",
        ...defaultSettings,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return NextResponse.json(defaultSettings);
    }

    // Remove database fields and return only settings
    const { _id, type, createdAt, updatedAt, ...settingsData } = settings;
    return NextResponse.json(settingsData);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    // Update settings in database
    await db.collection("settings").updateOne(
      { type: "site" },
      {
        $set: {
          ...body,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, message: "Settings updated successfully" });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}