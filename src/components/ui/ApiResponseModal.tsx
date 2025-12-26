"use client";

import { useEffect, useState } from "react";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function ApiResponseModal() {
    const [open, setOpen] = useState(false);
    const [payload, setPayload] = useState<any>(null);

    useEffect(() => {
        try {
            if (typeof window === 'undefined') return;
            const raw = sessionStorage.getItem('propertyUpdateResponse');
            if (!raw) return;
            const data = JSON.parse(raw);
            setPayload(data);
            setOpen(true);
            // Clear after reading so it only shows once
            sessionStorage.removeItem('propertyUpdateResponse');
        } catch (e) {
            console.warn('ApiResponseModal read error', e);
        }
    }, []);

    if (!payload) return null;

    const pretty = typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);

    return (
        <ConfirmModal
            open={open}
            title={payload?.message || 'API Response'}
            message={
                <pre className="max-h-60 overflow-auto text-xs whitespace-pre-wrap break-words bg-gray-50 p-3 rounded">{pretty}</pre>
            }
            confirmLabel="Close"
            cancelLabel=""
            onCancel={() => setOpen(false)}
            onConfirm={() => setOpen(false)}
        />
    );
}
