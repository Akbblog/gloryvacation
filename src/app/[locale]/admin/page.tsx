import { Link } from "@/i18n/navigation";
import { Users, Home, Calendar, DollarSign, TrendingUp, ArrowUpRight, PlusCircle, Eye, Settings } from "lucide-react";
import connectDB from "@/lib/mongodb";
import { Property } from "@/models/Property";
import { User } from "@/models/User";
import { Booking } from "@/models/Booking";

async function getStats() {
    await connectDB();

    const [totalListings, totalUsers, bookings] = await Promise.all([
        Property.countDocuments(),
        User.countDocuments(),
        Booking.find().sort({ createdAt: -1 }).limit(5).populate("property").populate("guest").lean(),
    ]);

    // Calculate revenue from confirmed bookings
    const confirmedBookings = await Booking.find({ status: "confirmed" });
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const activeBookings = await Booking.countDocuments({ status: { $in: ["pending", "confirmed"] } });

    return {
        totalListings,
        totalUsers,
        totalRevenue,
        activeBookings,
        recentBookings: JSON.parse(JSON.stringify(bookings)),
    };
}

async function getTopProperties() {
    await connectDB();
    const properties = await Property.find().sort({ reviewCount: -1 }).limit(4).lean();
    return JSON.parse(JSON.stringify(properties));
}

export default async function AdminDashboard() {
    const stats = await getStats();
    const topProperties = await getTopProperties();

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-[#1C1C1C]">Dashboard Overview</h1>
                    <p className="text-[#7E7E7E] mt-1">Welcome back! Here's what's happening with your properties.</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/admin/listings/add"
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                    >
                        <PlusCircle className="w-4 h-4" />
                        Add Property
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Revenue"
                    value={`AED ${stats.totalRevenue.toLocaleString()}`}
                    icon={DollarSign}
                    color="primary"
                />
                <StatsCard
                    title="Active Bookings"
                    value={stats.activeBookings.toString()}
                    icon={Calendar}
                    color="amber"
                />
                <StatsCard
                    title="Total Listings"
                    value={stats.totalListings.toString()}
                    icon={Home}
                    color="emerald"
                />
                <StatsCard
                    title="Total Users"
                    value={stats.totalUsers.toString()}
                    icon={Users}
                    color="blue"
                />
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-[#1C1C1C] mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <Link href="/admin/listings/add" className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors group">
                            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                <PlusCircle className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium text-[#1C1C1C]">Add New Property</p>
                                <p className="text-xs text-[#7E7E7E]">List a new vacation home</p>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-primary ml-auto" />
                        </Link>
                        <Link href="/admin/bookings" className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors group">
                            <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
                                <Calendar className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="font-medium text-[#1C1C1C]">View Bookings</p>
                                <p className="text-xs text-[#7E7E7E]">Manage reservations</p>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-amber-600 ml-auto" />
                        </Link>
                        <Link href="/admin/users" className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors group">
                            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="font-medium text-[#1C1C1C]">Manage Users</p>
                                <p className="text-xs text-[#7E7E7E]">Approve new hosts</p>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-blue-600 ml-auto" />
                        </Link>
                        <Link href="/admin/settings" className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group">
                            <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                                <Settings className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                                <p className="font-medium text-[#1C1C1C]">Settings</p>
                                <p className="text-xs text-[#7E7E7E]">Customize your platform</p>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-gray-600 ml-auto" />
                        </Link>
                    </div>
                </div>

                {/* Recent Bookings */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-[#1C1C1C]">Recent Bookings</h3>
                        <Link href="/admin/bookings" className="text-sm text-primary font-medium hover:underline">
                            View All
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="pb-3 font-medium text-[#7E7E7E]">Property</th>
                                    <th className="pb-3 font-medium text-[#7E7E7E]">Guest</th>
                                    <th className="pb-3 font-medium text-[#7E7E7E]">Amount</th>
                                    <th className="pb-3 font-medium text-[#7E7E7E]">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {stats.recentBookings.length > 0 ? (
                                    stats.recentBookings.map((booking: any) => (
                                        <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-3 font-medium text-[#1C1C1C]">{booking.property?.title || "Property"}</td>
                                            <td className="py-3 text-[#7E7E7E]">{booking.guest?.name || booking.guestDetails?.name || "Guest"}</td>
                                            <td className="py-3 text-[#7E7E7E]">AED {booking.totalPrice?.toLocaleString()}</td>
                                            <td className="py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${booking.status === "confirmed"
                                                        ? "bg-green-100 text-green-700"
                                                        : booking.status === "pending"
                                                            ? "bg-amber-100 text-amber-700"
                                                            : "bg-red-100 text-red-700"
                                                    }`}>
                                                    {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-[#7E7E7E]">
                                            No bookings yet
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Performance Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart Placeholder */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-[#1C1C1C]">Revenue Overview</h3>
                        <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white outline-none focus:border-primary">
                            <option>Last 7 days</option>
                            <option>Last 30 days</option>
                            <option>Last 90 days</option>
                        </select>
                    </div>
                    <div className="h-[250px] flex items-center justify-center bg-gradient-to-br from-primary/5 to-transparent rounded-xl border-2 border-dashed border-gray-200">
                        <div className="text-center">
                            <TrendingUp className="w-12 h-12 text-primary/30 mx-auto mb-2" />
                            <p className="text-[#7E7E7E] text-sm">Revenue chart coming soon</p>
                        </div>
                    </div>
                </div>

                {/* Top Properties */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-[#1C1C1C]">Top Properties</h3>
                        <Link href="/admin/listings" className="text-sm text-primary font-medium hover:underline">
                            View All
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {topProperties.length > 0 ? (
                            topProperties.map((property: any, idx: number) => (
                                <div key={property._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold">
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-[#1C1C1C]">{property.title}</p>
                                        <p className="text-xs text-[#7E7E7E]">{property.reviewCount || 0} reviews</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-[#7E7E7E]">
                                        <Eye className="w-4 h-4" />
                                        {property.rating || "New"}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center text-[#7E7E7E]">
                                <Home className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                <p>No properties yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatsCard({
    title,
    value,
    icon: Icon,
    color
}: {
    title: string;
    value: string;
    icon: any;
    color: "primary" | "amber" | "emerald" | "blue";
}) {
    const colorClasses = {
        primary: "bg-primary/10 text-primary",
        amber: "bg-amber-100 text-amber-600",
        emerald: "bg-emerald-100 text-emerald-600",
        blue: "bg-blue-100 text-blue-600",
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <div>
                <p className="text-2xl font-bold text-[#1C1C1C]">{value}</p>
                <p className="text-sm text-[#7E7E7E] mt-1">{title}</p>
            </div>
        </div>
    );
}
