"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { PropertyForm } from "@/components/properties/PropertyForm";

export default function AdminEditListingPage() {
    const router = useRouter();
    const params = useParams();
    const id = (params as any)?.id;
    const [loading, setLoading] = useState(true);
    const [initial, setInitial] = useState<any>(null);

    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                const res = await fetch(`/api/admin/properties/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setInitial(data);
                } else {
                    const err = await res.json();
                    alert(err.message || 'Failed to load property');
                    router.back();
                }
            } catch (e) {
                console.error(e);
                alert('Failed to load property');
                router.back();
            } finally {
                setLoading(false);
            }
        })();
    }, [id, router]);

    if (loading) return <div className="p-6">Loading...</div>;
    if (!initial) return null;

    return (
        <div className="p-6">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold mb-4">Edit Property</h1>
                <PropertyForm
                    onCancel={() => router.push('/admin/listings')}
                    onSuccess={() => router.push('/admin/listings')}
                    isAdmin
                    initial={initial}
                    submitUrl="/api/admin/properties/update"
                    submitMethod="POST"
                    mutateKey="/api/properties?all=1"
                />
            </div>
        </div>
    );
}
