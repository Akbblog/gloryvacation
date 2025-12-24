"use client";

import { useState } from "react";
import { mutate } from 'swr';
import { useRouter } from "next/navigation";
import { Check, X, Plus, Save } from "lucide-react";
import ImageUploader from "@/components/properties/ImageUploader";

const PROPERTY_TYPES = ["studio", "apartment", "villa", "townhouse", "penthouse"];
const AMENITIES_LIST = [
    "Wifi", "Pool", "Gym", "Parking", "Kitchen", "AC", "TV", "Washer",
    "Dryer", "Iron", "Hair dryer", "Essentials", "Shampoo", "Hangers"
];

interface PropertyFormProps {
    onCancel: () => void;
    onSuccess: () => void;
    isAdmin?: boolean;
}

export function PropertyForm({ onCancel, onSuccess, isAdmin }: PropertyFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        description: "",
        propertyType: "apartment",
        bedrooms: 1,
        bathrooms: 1,
        guests: 2,
        pricePerNight: "",
        location: {
            address: "",
            area: "",
            city: "Dubai",
            country: "UAE",
        },
        images: [""],
        amenities: [] as string[],
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name.includes(".")) {
            const [parent, child] = name.split(".");
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent as keyof typeof prev] as object,
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        // Auto-generate slug from title
        if (name === "title") {
            const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
            setFormData(prev => ({ ...prev, slug }));
        }
    };

    const handleImageChange = (index: number, value: string) => {
        const newImages = [...formData.images];
        newImages[index] = value;
        setFormData(prev => ({ ...prev, images: newImages }));
    };

    const addImageField = () => {
        setFormData(prev => ({ ...prev, images: [...prev.images, ""] }));
    };

    const removeImageField = (index: number) => {
        const newImages = formData.images.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, images: newImages }));
    };

    const toggleAmenity = (amenity: string) => {
        setFormData(prev => {
            const amenities = prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity];
            return { ...prev, amenities };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const images = formData.images.filter(img => img.trim() !== "");
            const cleanData: any = { ...formData, images };
            if (formData.pricePerNight !== "" && formData.pricePerNight != null) {
                cleanData.pricePerNight = Number(formData.pricePerNight);
            } else {
                delete cleanData.pricePerNight;
            }

            const res = await fetch("/api/properties", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(cleanData),
            });

            if (res.ok) {
                // revalidate properties list
                await mutate('/api/properties');
                onSuccess();
            } else {
                const error = await res.json();
                alert(error.message || "Failed to create property");
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-8">
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-gray-900 bg-white"
                            placeholder="Luxury Villa with Sea View"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                        <input
                            type="text"
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-gray-900"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                        <select
                            name="propertyType"
                            value={formData.propertyType}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-gray-900 bg-white"
                        >
                            {PROPERTY_TYPES.map(type => (
                                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-gray-900 bg-white"
                        placeholder="Describe the property..."
                    />
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Property Details</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price / Night (optional)</label>
                        <input
                            type="number"
                            name="pricePerNight"
                            value={formData.pricePerNight}
                            onChange={handleChange}
                            min="0"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-gray-900 bg-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                        <input
                            type="number"
                            name="bedrooms"
                            value={formData.bedrooms}
                            onChange={handleChange}
                            required
                            min="0"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-gray-900 bg-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                        <input
                            type="number"
                            name="bathrooms"
                            value={formData.bathrooms}
                            onChange={handleChange}
                            required
                            min="1"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-gray-900 bg-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
                        <input
                            type="number"
                            name="guests"
                            value={formData.guests}
                            onChange={handleChange}
                            required
                            min="1"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-gray-900 bg-white"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Location</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <input
                            type="text"
                            name="location.address"
                            value={formData.location.address}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-gray-900 bg-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                        <input
                            type="text"
                            name="location.area"
                            value={formData.location.area}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-gray-900 bg-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input
                            type="text"
                            name="location.city"
                            value={formData.location.city}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-gray-900 bg-white"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Images</h2>
                <div className="space-y-3">
                    {/* ImageUploader handles uploads and returns URLs via onChange */}
                    <ImageUploader initial={formData.images} onChange={(urls) => setFormData(prev => ({ ...prev, images: urls }))} />
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {AMENITIES_LIST.map((amenity) => (
                        <label key={amenity} className="flex items-center gap-2 cursor-pointer group">
                            <div className={`w-5 h-5 border rounded flex items-center justify-center transition-colors ${formData.amenities.includes(amenity) ? "bg-teal-600 border-teal-600" : "border-gray-300 group-hover:border-teal-500"}`}>
                                {formData.amenities.includes(amenity) && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <input
                                type="checkbox"
                                checked={formData.amenities.includes(amenity)}
                                onChange={() => toggleAmenity(amenity)}
                                className="hidden"
                            />
                            <span className="text-gray-700 group-hover:text-teal-600 transition-colors">{amenity}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="flex justify-end pt-6 border-t gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg shadow-teal-500/30 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                >
                    {loading ? "Saving..." : (
                        <>
                            <Save className="w-5 h-5" />
                            Save Property
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
