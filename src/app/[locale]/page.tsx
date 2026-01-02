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
// MobileAppSection (coming soon) removed from homepage per request
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { useState, useMemo } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useProperties } from "@/lib/hooks/useProperties";
import { SpinnerGap } from "@phosphor-icons/react";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const t = useTranslations('Properties');
  const tListing = useTranslations('Listing');

  // Fetch real properties from the database API
  const { properties, isLoading, isError } = useProperties();

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleFilterClick = () => {
    console.log("Filter clicked");
  };

  // Filter properties based on selected category
  const filteredProperties = useMemo(() => {
    const safeProperties = Array.isArray(properties) ? properties : [];
    return safeProperties.filter((property) => {
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
  }, [properties, selectedCategory]);

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
      <section className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-[50px] xl:px-[70px] py-6 md:py-12 max-w-[1440px]">
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <SpinnerGap weight="bold" className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        )}
        {!isLoading && filteredProperties.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-5">
              {filteredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  id={property.id}
                  slug={property.slug}
                  title={property.title}
                  images={property.images}
                  guests={property.guests}
                  bedrooms={property.bedrooms}
                  propertyType={property.propertyType}
                  amenities={property.amenities}
                  isNew={property.isNew}
                />
              ))}
            </div>

            {/* Load More Button */}
            <div className="mt-8 md:mt-10 text-center">
              <Link href="/listings" className="inline-block px-6 py-2.5 md:px-8 md:py-3 border border-[#1C1C1C] rounded-full text-[#1C1C1C] font-semibold hover:bg-[#1C1C1C] hover:text-white transition-colors duration-300 text-sm md:text-base active:scale-95">
                {tListing('loadMore')}
              </Link>
            </div>
          </>
        )}
        {!isLoading && filteredProperties.length === 0 && (
          <div className="text-center py-20 text-gray-600">
            <p className="text-lg">No properties available</p>
          </div>
        )}
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

      {/* 10. Mobile App - hidden (removed) */}

      {/* 11. Newsletter Subscription */}
      <NewsletterSection />

      {/* 12. Footer */}
      <Footer />
    </div>
  );
}
