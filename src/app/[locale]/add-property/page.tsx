"use client";

import { useRouter } from "next/navigation";
import { PropertyForm } from "@/components/properties/PropertyForm";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function UserAddPropertyPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin?callbackUrl=/add-property");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!session) return null;

    if (isSubmitted) {
        return (
            <div className="min-h-screen flex flex-col bg-white">
                <Navbar />
                <main className="flex-1 flex items-center justify-center px-4 py-20">
                    <div className="text-center max-w-md bg-white p-8 rounded-3xl shadow-xl">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-[#1C1C1C] mb-4">Property Submitted!</h1>
                        <p className="text-[#7E7E7E] mb-8">
                            Your property listing has been submitted successfully and is pending approval.
                            It will be live within 24 hours after verification by our team.
                        </p>
                        <button
                            onClick={() => router.push("/profile")}
                            className="bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors"
                        >
                            Back to Profile
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-4xl">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900">List Your Property</h1>
                    <p className="text-gray-600 mt-2">Fill in the details below to publish your listing.</p>
                </div>

                <PropertyForm
                    onCancel={() => router.push("/profile")}
                    onSuccess={() => setIsSubmitted(true)}
                />
            </main>
            <Footer />
        </div>
    );
}
