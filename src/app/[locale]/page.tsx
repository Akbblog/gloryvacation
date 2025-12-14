"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { CategoriesBar } from "@/components/home/CategoriesBar";
import { PropertyCard } from "@/components/listings/PropertyCard";
import { MapSection } from "@/components/home/MapSection";
import { DestinationsCarousel } from "@/components/home/DestinationsCarousel";
import { OurServicesSection } from "@/components/home/OurServicesSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { HostCTASection } from "@/components/home/HostCTASection";
import { BlogsSection } from "@/components/home/BlogsSection";
import { MobileAppSection } from "@/components/home/MobileAppSection";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

// Mock property data matching EasyGo's style exactly
const MOCK_PROPERTIES = [
  {
    id: "1",
    title: "Cozy Studio Stay in Meydan",
    pricePerNight: 291,
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1980&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop",
    ],
    guests: 2,
    bedrooms: 0,
    propertyType: "studio" as const,
    amenities: ["Pool", "Gym", "WiFi"],
    isNew: true,
  },
  {
    id: "2",
    title: "Modern 1BR with Balcony & City View",
    pricePerNight: 323,
    images: [
      "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1980&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=2074&auto=format&fit=crop",
    ],
    guests: 2,
    bedrooms: 1,
    propertyType: "apartment" as const,
    amenities: ["Pool", "Parking", "WiFi"],
    isNew: true,
  },
  {
    id: "3",
    title: "Elegant 1-Bedroom Apartment with Balcony",
    pricePerNight: 334,
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop",
    ],
    guests: 2,
    bedrooms: 1,
    propertyType: "apartment" as const,
    amenities: ["Pool", "Gym", "Balcony"],
    isNew: true,
  },
  {
    id: "4",
    title: "Luxury 3BR+M with Dubai Eye View, JBR",
    pricePerNight: 1250,
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop",
    ],
    guests: 8,
    bedrooms: 3,
    propertyType: "apartment" as const,
    amenities: ["Pool", "Beach Access", "Gym"],
    isNew: true,
  },
  {
    id: "5",
    title: "Chic Studio Escape in Dubai Sports City",
    pricePerNight: 275,
    images: [
      "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?q=80&w=2070&auto=format&fit=crop",
    ],
    guests: 2,
    bedrooms: 0,
    propertyType: "studio" as const,
    amenities: ["Pool", "Gym", "Sports Facilities"],
    isNew: true,
  },
  {
    id: "6",
    title: "Chic 2-Bedroom with Dubai Skyline View",
    pricePerNight: 580,
    images: [
      "https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop",
    ],
    guests: 4,
    bedrooms: 2,
    propertyType: "apartment" as const,
    amenities: ["Pool", "Skyline View", "Balcony"],
    isNew: true,
  },
  {
    id: "7",
    title: "Stylish Studio with Dubai Skyline View",
    pricePerNight: 295,
    images: [
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop",
    ],
    guests: 2,
    bedrooms: 0,
    propertyType: "studio" as const,
    amenities: ["Pool", "Gym", "City View"],
    isNew: true,
  },
  {
    id: "8",
    title: "Stylish 2BR w/ City View in Sobha Creek",
    pricePerNight: 620,
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1980&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop",
    ],
    guests: 4,
    bedrooms: 2,
    propertyType: "apartment" as const,
    amenities: ["Pool", "Creek View", "Parking"],
    isNew: true,
  },
  {
    id: "9",
    title: "Luxury 5BR Villa on Palm Jumeirah",
    pricePerNight: 2500,
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?q=80&w=1974&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop",
    ],
    guests: 10,
    bedrooms: 5,
    propertyType: "villa" as const,
    amenities: ["Pool", "Beach Access", "Private Garden"],
    isNew: true,
  },
  {
    id: "10",
    title: "Modern 3BR Townhouse in Arabian Ranches",
    pricePerNight: 450,
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2070&auto=format&fit=crop",
    ],
    guests: 6,
    bedrooms: 3,
    propertyType: "townhouse" as const,
    amenities: ["Pool", "Garden", "Parking"],
    isNew: false,
  },
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const t = useTranslations('Properties');
  const tListing = useTranslations('Listing');

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleFilterClick = () => {
    console.log("Filter clicked");
  };

  const filteredProperties = MOCK_PROPERTIES.filter((property) => {
    if (selectedCategory === "all") return true;

    // Bedroom filters
    if (selectedCategory === "1br") return property.bedrooms === 1;
    if (selectedCategory === "2br") return property.bedrooms === 2;
    if (selectedCategory === "3br") return property.bedrooms >= 3;

    // Property Type filters
    if (selectedCategory === "studio") return property.propertyType === "studio";
    if (selectedCategory === "villa") return property.propertyType === "villa";
    if (selectedCategory === "townhouse") return property.propertyType === "townhouse";

    // Amenity filters
    if (selectedCategory === "pool") return property.amenities.some(a => a.toLowerCase().includes("pool"));

    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar variant="home" />

      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Categories Bar */}
      <CategoriesBar
        onCategoryChange={handleCategoryChange}
        onFilterClick={handleFilterClick}
      />

      {/* 3. Property Grid */}
      <section className="container mx-auto px-4 md:px-6 lg:px-[50px] xl:px-[70px] py-8 md:py-12 max-w-[1440px]">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              {...property}
              title={t(`${property.id}.title`)}
            />
          ))}
        </div>

        {/* Load More Button */}
        <div className="mt-10 text-center">
          <Link href="/listings" className="inline-block px-8 py-3 border border-[#1C1C1C] rounded-full text-[#1C1C1C] font-semibold hover:bg-[#1C1C1C] hover:text-white transition-colors duration-300">
            {tListing('loadMore')}
          </Link>
        </div>
      </section>

      {/* 4. Map Section - "63+ Properties worth packing for!" */}
      {/* <MapSection /> */}

      {/* 5. Destinations Carousel - "Explore Destinations in Dubai" */}
      <DestinationsCarousel />

      {/* 6. Our Services - Orange circular icons */}
      <OurServicesSection />

      {/* 7. Testimonials - "EasyGo - Clean and Convenient" */}
      <TestimonialsSection />

      {/* 8. Host CTA - "Empty space? We make it pay!" */}
      <HostCTASection />

      {/* 9. Blogs Section */}
      <BlogsSection />

      {/* 10. Mobile App - "Full control coming soon!" */}
      <MobileAppSection />

      {/* 11. Newsletter Subscription */}
      <NewsletterSection />

      {/* 12. Footer */}
      <Footer />
    </div>
  );
}
