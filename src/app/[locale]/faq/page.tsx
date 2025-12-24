"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQ_CATEGORIES = [
    { id: "booking", name: "Booking & Reservations" },
    { id: "payment", name: "Payments & Pricing" },
    { id: "checkin", name: "Check-in & Check-out" },
    { id: "property", name: "Property & Amenities" },
    { id: "cancellation", name: "Cancellation & Refunds" },
    { id: "hosting", name: "Hosting with EasyGo" },
];

const FAQS = [
    {
        category: "booking",
        question: "How do I book a holiday home?",
        answer: "Booking is easy! Browse our properties, select your dates, and click 'Book Now'. You'll receive instant confirmation via email. You can also contact our team directly for assistance with your booking.",
    },
    {
        category: "booking",
        question: "Can I request an early check-in or late check-out?",
        answer: "Yes, early check-in and late check-out can be arranged subject to availability. Please contact our team at least 24 hours before your stay, and we'll do our best to accommodate your request.",
    },
    {
        category: "booking",
        question: "Is there a minimum stay requirement?",
        answer: "Minimum stay requirements vary by property and season. Most properties have a minimum stay of 2-3 nights. During peak seasons (Dec-Jan, Easter), some properties may require longer minimum stays.",
    },
    {
        category: "payment",
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards (Visa, Mastercard, American Express), debit cards, and bank transfers. Payment is secured through our encrypted payment system.",
    },
    {
        category: "payment",
        question: "Is there a security deposit?",
        answer: "Yes, a security deposit is required for all bookings. The amount varies by property (typically AED 1,000-5,000). This is refunded within 7 days after check-out, provided there's no damage.",
    },
    {
        category: "payment",
        question: "Are there any additional fees?",
        answer: "Our prices are transparent. Additional fees may include: Tourism Dirham (AED 10-20 per room per night as per DTCM regulations), cleaning fee (if applicable), and security deposit. All fees are clearly shown before booking.",
    },
    {
        category: "checkin",
        question: "What time is check-in and check-out?",
        answer: "Standard check-in time is 3:00 PM and check-out is 12:00 PM. We can arrange early check-in (from 10:00 AM) or late check-out (until 6:00 PM) subject to availability and additional charges.",
    },
    {
        category: "checkin",
        question: "How do I access the property?",
        answer: "You'll receive detailed access instructions 24 hours before your arrival, including building entry codes, parking information, and WiFi details. Our team is available 24/7 if you need assistance.",
    },
    {
        category: "property",
        question: "What amenities are included?",
        answer: "All properties include essential amenities: fully equipped kitchen, WiFi, air conditioning, TV, fresh linens, and towels. Many properties also feature pool access, gym facilities, and parking. Specific amenities are listed on each property page.",
    },
    {
        category: "property",
        question: "Are pets allowed?",
        answer: "Pet policies vary by property. Some properties welcome pets with an additional pet fee, while others are pet-free. Check the specific property listing or contact us for pet-friendly options.",
    },
    {
        category: "cancellation",
        question: "What is your cancellation policy?",
        answer: "Our standard cancellation policy: Full refund if cancelled 7+ days before check-in. 50% refund if cancelled 3-7 days before check-in. No refund for cancellations within 72 hours of check-in. Some properties may have different policies.",
    },
    {
        category: "cancellation",
        question: "Can I modify my booking?",
        answer: "Yes, you can modify your booking dates subject to availability. Contact us at least 48 hours before your original check-in date. Date changes may result in price adjustments based on current rates.",
    },
    {
        category: "hosting",
        question: "How do I list my property with EasyGo?",
        answer: "Visit our 'List Your Property' page and fill out the inquiry form. Our team will contact you within 24 hours to discuss next steps, including property assessment, photography, and listing setup.",
    },
    {
        category: "hosting",
        question: "What services does EasyGo provide for property owners?",
        answer: "We offer complete property management: professional photography, listing optimization, dynamic pricing, guest screening, 24/7 guest support, professional cleaning, maintenance coordination, and financial reporting.",
    },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-gray-200">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-5 flex items-center justify-between text-left"
            >
                <span className="text-[#1C1C1C] font-medium pr-4">{question}</span>
                <ChevronDown
                    className={cn("w-5 h-5 text-[#7E7E7E] shrink-0 transition-transform", isOpen && "rotate-180")}
                />
            </button>
            <div className={cn("overflow-hidden transition-all", isOpen ? "max-h-96 pb-5" : "max-h-0")}>
                <p className="text-[#7E7E7E] leading-relaxed">{answer}</p>
            </div>
        </div>
    );
}

export default function FAQPage() {
    const [activeCategory, setActiveCategory] = useState("booking");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredFAQs = FAQS.filter((faq) => {
        const matchesCategory = faq.category === activeCategory;
        const matchesSearch = searchQuery === "" ||
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />

            {/* Hero */}
            <section className="py-16 md:py-24 bg-gradient-to-br from-teal-50 to-amber-50">
                <div className="container mx-auto px-4 md:px-6 max-w-[1440px]">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-[#1C1C1C] mb-4">
                            Frequently Asked <span className="text-teal-600">Questions</span>
                        </h1>
                        <p className="text-lg text-[#7E7E7E] mb-8">
                            Find answers to common questions about booking, payments, and more.
                        </p>

                        {/* Search */}
                        <div className="relative max-w-md mx-auto">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7E7E7E]" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search FAQs..."
                                className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-200 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQs */}
            <section className="py-12 md:py-16">
                <div className="container mx-auto px-4 md:px-6 max-w-[1000px]">
                    {/* Categories */}
                    <div className="flex flex-wrap gap-3 justify-center mb-10">
                        {FAQ_CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={cn(
                                    "px-5 py-2 rounded-full text-sm font-medium transition-all",
                                    activeCategory === cat.id
                                        ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white"
                                        : "bg-[#F5F5F5] text-[#7E7E7E] hover:bg-gray-200"
                                )}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* FAQ List */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
                        {filteredFAQs.length > 0 ? (
                            filteredFAQs.map((faq, idx) => (
                                <FAQItem key={idx} question={faq.question} answer={faq.answer} />
                            ))
                        ) : (
                            <p className="text-center text-[#7E7E7E] py-8">No FAQs found matching your search.</p>
                        )}
                    </div>

                    {/* Contact CTA */}
                    <div className="mt-12 text-center">
                        <p className="text-[#7E7E7E] mb-4">Still have questions?</p>
                        <a
                            href="/contact"
                            className="inline-block bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-8 py-3 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl"
                        >
                            Contact Us
                        </a>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
