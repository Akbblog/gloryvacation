"use client";

import { useRouter, useParams } from "next/navigation";
import { PropertyForm } from "@/components/properties/PropertyForm";

export default function AddPropertyPage() {
    const router = useRouter();
    const params = useParams() as { locale?: string } | null;
    const locale = params?.locale ?? "en";
    const base = `/${locale}/admin/listings`;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Add New Property</h1>
            </div>

            <PropertyForm
                onCancel={() => router.push(base)}
                onSuccess={() => {
                    router.push(base);
                    router.refresh();
                }}
                isAdmin={true}
            />
        </div>
    );
}
