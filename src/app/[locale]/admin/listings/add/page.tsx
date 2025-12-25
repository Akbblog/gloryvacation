"use client";

import { useRouter } from "next/navigation";
import { PropertyForm } from "@/components/properties/PropertyForm";

export default function AdminAddListingPage() {
    const router = useRouter();

    return (
        <div className="p-6">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold mb-4">Add New Property</h1>
                <PropertyForm
                    onCancel={() => router.push('/en/admin/listings')}
                    onSuccess={() => router.push('/en/admin/listings')}
                    isAdmin
                />
            </div>
        </div>
    );
}
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
