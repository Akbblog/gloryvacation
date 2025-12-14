"use client";

import { useEffect, useRef, useState } from "react";

// Property locations in Dubai for map markers
const PROPERTY_LOCATIONS = [
    { lat: 25.0657, lng: 55.1713, name: "Dubai Marina" },
    { lat: 25.1972, lng: 55.2744, name: "Downtown Dubai" },
    { lat: 25.1124, lng: 55.139, name: "Palm Jumeirah" },
    { lat: 25.0797, lng: 55.1419, name: "JBR" },
    { lat: 25.1881, lng: 55.2621, name: "Business Bay" },
    { lat: 25.0951, lng: 55.1547, name: "Dubai Hills" },
    { lat: 25.0735, lng: 55.1365, name: "JVC" },
    { lat: 25.2048, lng: 55.2708, name: "DIFC" },
    { lat: 25.2285, lng: 55.2859, name: "Creek Harbour" },
    { lat: 25.1124, lng: 55.202, name: "Al Barsha" },
    { lat: 25.1683, lng: 55.2496, name: "Meydan" },
    { lat: 25.0558, lng: 55.1844, name: "Discovery Gardens" },
];

export function MapSection() {
    const mapRef = useRef<HTMLDivElement>(null);
    const [propertyCount] = useState(63);
    const [loadError, setLoadError] = useState(false);

    useEffect(() => {
        // Load Google Maps script dynamically
        const loadGoogleMaps = () => {
            const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
            if (!apiKey) {
                console.error("Google Maps API key is missing. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment.");
                setLoadError(true);
                return;
            }

            if (typeof window !== "undefined" && !window.google) {
                const script = document.createElement("script");
                script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker`;
                script.async = true;
                script.defer = true;
                script.onload = () => initMap();
                script.onerror = () => {
                    console.error("Failed to load Google Maps script.");
                    setLoadError(true);
                };
                document.head.appendChild(script);
            } else if (typeof window !== "undefined" && (window as any).google) {
                initMap();
            }
        };

        const initMap = () => {
            if (mapRef.current && (window as any).google && !loadError) {
                const map = new window.google.maps.Map(mapRef.current, {
                    center: { lat: 25.12, lng: 55.20 },
                    zoom: 11,
                    styles: [
                        {
                            featureType: "water",
                            elementType: "geometry.fill",
                            stylers: [{ color: "#8ECAE6" }],
                        },
                        {
                            featureType: "landscape",
                            elementType: "geometry.fill",
                            stylers: [{ color: "#F5F5F5" }],
                        },
                    ],
                    disableDefaultUI: true,
                    zoomControl: true,
                });

                // Add markers
                PROPERTY_LOCATIONS.forEach((location) => {
                    const marker = new window.google.maps.Marker({
                        position: { lat: location.lat, lng: location.lng },
                        map,
                        icon: {
                            path: window.google.maps.SymbolPath.CIRCLE,
                            scale: 12,
                            fillColor: "#F5A623",
                            fillOpacity: 1,
                            strokeColor: "#FFFFFF",
                            strokeWeight: 2,
                        },
                        title: location.name,
                    });
                });
            }
        };

        loadGoogleMaps();
    }, []);

    return (
        <section className="py-12 md:py-20 bg-white">
            <div className="container mx-auto px-4 md:px-6">
                {/* Header */}
                <div className="text-center mb-8 md:mb-12">
                    <h2 className="text-4xl md:text-6xl font-bold text-[#F5A623] mb-2">
                        {propertyCount}+
                    </h2>
                    <p className="text-xl md:text-2xl font-medium text-[#1C1C1C]">
                        Properties worth packing for!
                    </p>
                </div>

                {/* Map Container */}
                <div className="relative w-full h-[300px] md:h-[450px] rounded-2xl overflow-hidden shadow-lg">
                    {/* Fallback static map image when Google Maps API is not available */}
                    <div
                        ref={mapRef}
                        className="w-full h-full bg-gradient-to-b from-[#8ECAE6] to-[#F5F5F5]"
                    >
                        {/* Static map fallback with CSS styling */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative w-full h-full">
                                {/* Water area on the left */}
                                <div className="absolute left-0 top-0 w-1/3 h-full bg-[#8ECAE6]" />

                                {/* Land area */}
                                <div className="absolute right-0 top-0 w-2/3 h-full bg-[#E8E5DB]">
                                    {/* Simulated markers */}
                                    {PROPERTY_LOCATIONS.map((loc, idx) => (
                                        <div
                                            key={idx}
                                            className="absolute w-6 h-6 rounded-full bg-[#F5A623] border-2 border-white shadow-md flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                                            style={{
                                                left: `${20 + (idx % 4) * 20}%`,
                                                top: `${15 + Math.floor(idx / 4) * 25}%`,
                                            }}
                                            title={loc.name}
                                        >
                                            <div className="w-2 h-2 rounded-full bg-white" />
                                        </div>
                                    ))}
                                </div>

                                {/* Google branding */}
                                <div className="absolute bottom-2 left-2 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
                                    Google
                                </div>

                                {/* Keyboard shortcuts link */}
                                <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded">
                                    Keyboard shortcuts · Map data ©2025 · Terms
                                </div>

                                {/* Zoom controls */}
                                <div className="absolute top-4 right-4 flex flex-col gap-0.5">
                                    <button className="w-8 h-8 bg-white border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 rounded-t">
                                        +
                                    </button>
                                    <button className="w-8 h-8 bg-white border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 rounded-b">
                                        −
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
