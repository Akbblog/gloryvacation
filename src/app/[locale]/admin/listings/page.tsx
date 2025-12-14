"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Plus, Home, MapPin, DollarSign, Star } from "lucide-react";
import Image from "next/image";

interface Property {
    _id: string;
    title: string;
    location: {
        address: string;
        city: string;
    };
    pricePerNight: number;
    images: string[];
    rating?: number;
    isActive: boolean;
}

export default function ListingsPage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            const res = await fetch("/api/properties");
            if (res.ok) {
                const data = await res.json();
                setProperties(data);
            }
        } catch (error) {
            console.error("Failed to fetch properties", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Property Listings</h1>
                <Link
                    href="/admin/listings/add"
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Add Property
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                    <div
                        key={property._id}
                        className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
                    >
                        <div className="relative h-48 bg-slate-100">
                            {property.images && property.images.length > 0 ? (
                                <Image
                                    src={property.images[0]}
                                    alt={property.title}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-400">
                                    <Home className="w-10 h-10" />
                                </div>
                            )}
                            <div className="absolute top-2 right-2">
                                <span
                                    className={`px-2 py-1 rounded-md text-xs font-bold ${property.isActive
                                            ? "bg-green-500/90 text-white"
                                            : "bg-red-500/90 text-white"
                                        }`}
                                >
                                    {property.isActive ? "Active" : "Inactive"}
                                </span>
                            </div>
                        </div>

                        <div className="p-4">
                            <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
                                {property.title}
                            </h3>
                            <div className="flex items-center text-slate-500 text-sm mb-3">
                                <MapPin className="w-4 h-4 mr-1" />
                                <span className="truncate">
                                    {property.location.address}, {property.location.city}
                                </span>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                <div className="flex items-center font-bold text-primary">
                                    <DollarSign className="w-4 h-4" />
                                    {property.pricePerNight}
                                    <span className="text-slate-400 font-normal text-xs ml-1">
                                        /night
                                    </span>
                                </div>
                                <div className="flex items-center text-amber-500 text-sm font-medium">
                                    <Star className="w-4 h-4 fill-current mr-1" />
                                    {property.rating || "New"}
                                </div>
                            </div>
                            <div className="mt-3 flex gap-2">
                                {!property.isActive && (
                                    <button
                                        onClick={async () => {
                                            try {
                                                const res = await fetch('/api/admin/properties/approve', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ propertyId: property._id }),
                                                });
                                                if (res.ok) {
                                                    setProperties((prev) => prev.map((p) => p._id === property._id ? { ...p, isActive: true } : p));
                                                } else {
                                                    const data = await res.json();
                                                    console.error('Approve failed', data);
                                                    alert('Failed to approve property: ' + (data?.message || res.status));
                                                }
                                            } catch (e) {
                                                console.error(e);
                                                alert('Failed to approve property');
                                            }
                                        }}
                                        className="px-3 py-1 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700"
                                    >
                                        Approve
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {properties.length === 0 && (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
                    <Home className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-slate-900">No properties found</h3>
                    <p className="text-slate-500 mb-6">Get started by creating your first listing</p>
                    <Link
                        href="/admin/listings/add"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add New Property
                    </Link>
                </div>
            )}
        </div>
    );
}
