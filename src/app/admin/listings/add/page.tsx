"use client";

import { useRouter } from "next/navigation";
import { PropertyForm } from "@/components/properties/PropertyForm";

export default function AddPropertyPage() {
    const router = useRouter();

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Add New Property</h1>
            </div>

            <PropertyForm
                onCancel={() => router.push("/admin/listings")}
                onSuccess={() => {
                    router.push("/admin/listings");
                    router.refresh();
                }}
                isAdmin={true}
            />
        </div>
    );
}
