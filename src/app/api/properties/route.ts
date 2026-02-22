import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Property } from "@/models/Property";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NotificationService } from "@/lib/notifications/NotificationService";
import { sendNewPropertyListedNotification } from "@/lib/email";

const VALID_IMAGE_URL_PATTERN = /^(https?:\/\/|\/)/i;

function isValidImageUrl(url: string): boolean {
    const trimmed = url.trim();
    if (!trimmed.length) return false;
    if (trimmed.startsWith("blob:") || trimmed.startsWith("data:")) return false;
    return VALID_IMAGE_URL_PATTERN.test(trimmed);
}

function sanitizeImageUrls(images: unknown): string[] {
    if (!Array.isArray(images)) return [];
    return images
        .map((value) => (typeof value === "string" ? value.trim() : ""))
        .filter((url) => url.length > 0 && isValidImageUrl(url));
}

// Force dynamic to prevent Next.js from caching API responses
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const hostId = searchParams.get("hostId");
        const all = searchParams.get("all");

        // New filter parameters
        const area = searchParams.get("area");
        const propertyType = searchParams.get("type");
        const bedrooms = searchParams.get("bedrooms");
        const priceRange = searchParams.get("price");
        const guests = searchParams.get("guests");
        const sortBy = searchParams.get("sort");
        const search = searchParams.get("search");
        const amenities = searchParams.get("amenities")?.split(",") || [];
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "12");

        // If client requests a host's properties, require the requester to be the host or an admin.
        const session = await getServerSession(authOptions);

        let query: any = {};
        if (hostId) {
            if (!session || !session.user) {
                return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
            }
            const isAdmin = session.user.role === "admin";
            const isSelf = session.user.id === hostId;
            if (!isAdmin && !isSelf) {
                return NextResponse.json({ message: "Forbidden" }, { status: 403 });
            }
            query = { host: hostId };
        } else if (all === "1") {
            // Admin-only path to fetch all listings (active + inactive)
            // Allow main admins or sub-admins with listing permission (web-admins)
            const isAdmin = session?.user?.role === "admin";
            const isWebAdmin = session?.user?.role === "sub-admin" && session?.user?.permissions?.canManageListings;
            if (!session || !(isAdmin || isWebAdmin)) {
                return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
            }
            query = {}; // no isActive filter
        } else {
            // Public listing endpoint - return active and approved properties
            // Also include properties that don't have isApprovedByAdmin field (backward compatibility)
            query = {
                isActive: true,
                $or: [
                    { isApprovedByAdmin: true },
                    { isApprovedByAdmin: { $exists: false } }
                ]
            };
        }

        // Apply filters
        if (area && area !== "Any Area") {
            query["location.area"] = { $regex: area, $options: "i" };
        }

        if (propertyType) {
            query.propertyType = propertyType;
        }

        if (bedrooms) {
            const bedroomNum = parseInt(bedrooms);
            if (bedroomNum === 4) {
                query.bedrooms = { $gte: 4 };
            } else {
                query.bedrooms = bedroomNum;
            }
        }

        if (priceRange) {
            const [min, max] = priceRange.split("-").map(Number);
            if (max && max < 99999) {
                query.pricePerNight = { $gte: min, $lte: max };
            } else {
                query.pricePerNight = { $gte: min };
            }
        }

        if (guests) {
            query.guests = { $gte: parseInt(guests) };
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { "location.area": { $regex: search, $options: "i" } },
                { "location.city": { $regex: search, $options: "i" } },
            ];
        }

        if (amenities.length > 0) {
            query.amenities = { $in: amenities };
        }

        // Build sort options
        let sortOptions: any = { createdAt: -1 }; // default sort
        switch (sortBy) {
            case "price-asc":
                sortOptions = { pricePerNight: 1 };
                break;
            case "price-desc":
                sortOptions = { pricePerNight: -1 };
                break;
            case "newest":
                sortOptions = { createdAt: -1 };
                break;
            case "rating":
                sortOptions = { rating: -1, reviewCount: -1 };
                break;
            case "featured":
            default:
                sortOptions = { isFeatured: -1, createdAt: -1 };
                break;
        }

        // Get total count for pagination
        const totalCount = await Property.countDocuments(query);
        const totalPages = Math.ceil(totalCount / limit);
        const skip = (page - 1) * limit;

        // Fetch properties with pagination
        const properties = await Property.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(limit)
            .populate({ path: 'host', select: 'name' });

        return NextResponse.json({
            properties,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error("Error fetching properties:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        // Basic validation (price is optional — platform hides pricing until contact)
        if (!body.title || !body.description) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const rawImages = sanitizeImageUrls(body.images);
        if (Array.isArray(body.images) && body.images.length > 0 && rawImages.length === 0) {
            return NextResponse.json({
                message: "Please provide valid image URLs (no blob or data URIs).",
            }, { status: 400 });
        }

        await connectDB();

        // Create property with current user as host
        // Properties are active immediately for testing
        // Only include pricePerNight if provided (avoid forcing 0 when empty)
        const toCreate: any = { ...body, host: session.user.id, isActive: true, isApprovedByAdmin: true };
        if (typeof body.pricePerNight !== 'undefined' && body.pricePerNight !== null) {
            toCreate.pricePerNight = body.pricePerNight;
        }

        if (rawImages.length > 0) {
            toCreate.images = rawImages;
        }

        const property = await Property.create(toCreate) as any;

        // Notify all admins about new property listing
        try {
            const host = await User.findById(session.user.id);
            const admins = await User.find({ role: "admin" });
            for (const admin of admins) {
                await NotificationService.notifyNewPropertyListing(
                    admin._id.toString(),
                    property.title,
                    host?.name || "Property Owner"
                );
            }
        } catch (notificationError) {
            console.error("Error sending new property listing notification:", notificationError);
            // Don't fail property creation if notification fails
        }

        // Send SMTP email notification to admins about new property listing
        void sendNewPropertyListedNotification({
            propertyId: property._id.toString(),
            propertyTitle: property.title || "Property",
            hostName: session.user.name || "Property Owner",
            hostEmail: session.user.email || "",
            propertyType: property.propertyType,
            bedrooms: property.bedrooms,
            location: [property?.location?.area, property?.location?.city].filter(Boolean).join(", "),
        });

        return NextResponse.json(property, { status: 201 });
    } catch (error) {
        console.error("Error creating property:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
