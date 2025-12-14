"use client";

import { useRouter } from "next/navigation";
import { PropertyForm } from "@/components/properties/PropertyForm";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function UserAddPropertyPage() {
    const router = useRouter();
    const { data: session, status } = useSession();

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
                    onSuccess={() => {
                        router.push("/profile");
                        router.refresh(); // Ideally show a success message or redirect to the new listing
                    }}
                />
            </main>
            <Footer />
        </div>
    );
}
