"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Check, Upload, Home, DollarSign, Shield, Users } from "lucide-react";

const BENEFITS = [
    {
        icon: <DollarSign className="w-6 h-6" />,
        title: "Maximize Your Earnings",
        description: "Our dynamic pricing strategy ensures you get the best rates for your property.",
    },
    {
        icon: <Shield className="w-6 h-6" />,
        title: "Verified Guests Only",
        description: "We thoroughly vet all guests to protect your property and peace of mind.",
    },
    {
        icon: <Users className="w-6 h-6" />,
        title: "Full Property Management",
        description: "From cleaning to maintenance, we handle everything for you.",
    },
    {
        icon: <Home className="w-6 h-6" />,
        title: "DTCM Licensed",
        description: "We operate fully licensed under Dubai Tourism, ensuring compliance.",
    },
];

export default function ListYourPropertyPage() {
    const [formData, setFormData] = useState({
        ownerName: "",
        email: "",
        phone: "",
        propertyType: "",
        bedrooms: "",
        location: "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Here you would submit to MongoDB
        console.log("Form submitted:", formData);

        setIsSubmitting(false);
        setIsSubmitted(true);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen flex flex-col bg-white">
                <Navbar />
                <main className="flex-1 flex items-center justify-center px-4 py-20">
                    <div className="text-center max-w-md">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="w-10 h-10 text-green-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-[#1C1C1C] mb-4">Thank You!</h1>
                        <p className="text-[#7E7E7E] mb-8">
                            Your property listing request has been submitted successfully. Our team will contact you within 24 hours.
                        </p>
                        <a
                            href="/"
                            className="inline-block bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors"
                        >
                            Back to Home
                        </a>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />

            {/* Hero Section */}
            <section className="relative py-20 md:py-28 bg-gradient-to-br from-primary/10 to-[#F5A623]/10">
                <div className="container mx-auto px-4 md:px-6 max-w-[1440px]">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1C1C1C] mb-6">
                            List Your Property with{" "}
                            <span className="text-primary">Glory Vacation</span>
                        </h1>
                        <p className="text-lg md:text-xl text-[#7E7E7E] mb-8">
                            Turn your empty property into a steady income stream. We handle everything from listing to guest management.
                        </p>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 md:px-6 max-w-[1440px]">
                    <h2 className="text-2xl md:text-3xl font-bold text-center text-[#1C1C1C] mb-12">
                        Why Host with Glory Vacation?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {BENEFITS.map((benefit, idx) => (
                            <div key={idx} className="text-center p-6 rounded-2xl bg-[#FAFAFA] hover:shadow-lg transition-shadow">
                                <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                    {benefit.icon}
                                </div>
                                <h3 className="text-lg font-semibold text-[#1C1C1C] mb-2">{benefit.title}</h3>
                                <p className="text-sm text-[#7E7E7E]">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Form Section */}
            <section className="py-16 bg-[#FAFAFA]">
                <div className="container mx-auto px-4 md:px-6 max-w-[800px]">
                    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg">
                        <h2 className="text-2xl md:text-3xl font-bold text-[#1C1C1C] mb-2 text-center">
                            Get Started Today
                        </h2>
                        <p className="text-[#7E7E7E] text-center mb-8">
                            Fill out the form below and our team will get back to you within 24 hours.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-[#1C1C1C] mb-2">
                                        Your Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="ownerName"
                                        value={formData.ownerName}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#1C1C1C] mb-2">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-[#1C1C1C] mb-2">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        placeholder="+971 50 350 5752"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#1C1C1C] mb-2">
                                        Property Type *
                                    </label>
                                    <select
                                        name="propertyType"
                                        value={formData.propertyType}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white"
                                    >
                                        <option value="">Select type</option>
                                        <option value="studio">Studio</option>
                                        <option value="apartment">Apartment</option>
                                        <option value="villa">Villa</option>
                                        <option value="townhouse">Townhouse</option>
                                        <option value="penthouse">Penthouse</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-[#1C1C1C] mb-2">
                                        Number of Bedrooms *
                                    </label>
                                    <select
                                        name="bedrooms"
                                        value={formData.bedrooms}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white"
                                    >
                                        <option value="">Select</option>
                                        <option value="studio">Studio</option>
                                        <option value="1">1 Bedroom</option>
                                        <option value="2">2 Bedrooms</option>
                                        <option value="3">3 Bedrooms</option>
                                        <option value="4">4+ Bedrooms</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#1C1C1C] mb-2">
                                        Location *
                                    </label>
                                    <select
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white"
                                    >
                                        <option value="">Select location</option>
                                        <option value="dubai-marina">Dubai Marina</option>
                                        <option value="downtown">Downtown Dubai</option>
                                        <option value="palm-jumeirah">Palm Jumeirah</option>
                                        <option value="jbr">JBR</option>
                                        <option value="business-bay">Business Bay</option>
                                        <option value="jvc">JVC</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#1C1C1C] mb-2">
                                    Additional Information
                                </label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                                    placeholder="Tell us more about your property..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white py-4 rounded-full font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-5 h-5" />
                                        Submit Your Property
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
