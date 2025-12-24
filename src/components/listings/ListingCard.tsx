import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Star, MapPin, Bed, Bath, Users } from "lucide-react";

interface ListingCardProps {
    id: string;
    title: string;
    location: string;
    price: number;
    rating?: number;
    image: string;
    bedrooms: number;
    bathrooms: number;
    guests: number;
}

export function ListingCard({
    id,
    title,
    location,
    price,
    rating,
    image,
    bedrooms,
    bathrooms,
    guests,
}: ListingCardProps) {
    return (
        <Link href={`/listings/${id}`} className="group block">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {rating && (
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                            <Star className="w-4 h-4 text-[#F5A623] fill-current" />
                            <span className="text-sm font-medium text-[#1C1C1C]">{rating.toFixed(1)}</span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4">
                    <h3 className="font-semibold text-[#1C1C1C] text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                        {title}
                    </h3>
                    <div className="flex items-center gap-1 text-[#7E7E7E] text-sm mb-3">
                        <MapPin className="w-4 h-4" />
                        <span className="line-clamp-1">{location}</span>
                    </div>

                    {/* Amenities */}
                    <div className="flex items-center gap-4 text-[#7E7E7E] text-sm mb-4">
                        <div className="flex items-center gap-1">
                            <Bed className="w-4 h-4" />
                            <span>{bedrooms}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Bath className="w-4 h-4" />
                            <span>{bathrooms}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{guests}</span>
                        </div>
                    </div>

                    {/* Price hidden - contact to request pricing */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div>
                            <span className="text-sm text-gray-500">Contact to request pricing</span>
                        </div>
                        <span className="text-sm text-primary font-medium group-hover:underline">
                            View Details
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
