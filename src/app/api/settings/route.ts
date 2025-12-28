import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";

// Default public settings
const defaultPublicSettings = {
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
  },
};

export async function GET() {
  try {
    await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json(defaultPublicSettings);
    }

    // Get settings from database
    const settings = await db.collection("settings").findOne({ type: "site" });

    if (!settings) {
      return NextResponse.json(defaultPublicSettings);
    }

    // Return only public fields
    const publicSettings = {
      general: {
        siteName: settings.general?.siteName || defaultPublicSettings.general.siteName,
        tagline: settings.general?.tagline || defaultPublicSettings.general.tagline,
        contactEmail: settings.general?.contactEmail || defaultPublicSettings.general.contactEmail,
        contactPhone: settings.general?.contactPhone || defaultPublicSettings.general.contactPhone,
        whatsappNumber: settings.general?.whatsappNumber || defaultPublicSettings.general.whatsappNumber,
        address: settings.general?.address || defaultPublicSettings.general.address,
        currency: settings.general?.currency || defaultPublicSettings.general.currency,
      },
      branding: {
        primaryColor: settings.branding?.primaryColor || defaultPublicSettings.branding.primaryColor,
        secondaryColor: settings.branding?.secondaryColor || defaultPublicSettings.branding.secondaryColor,
      },
    };

    return NextResponse.json(publicSettings);
  } catch (error) {
    console.error("Error fetching public settings:", error);
    return NextResponse.json(defaultPublicSettings);
  }
}