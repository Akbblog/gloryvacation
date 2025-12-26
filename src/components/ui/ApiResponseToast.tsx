"use client";

import { useEffect, useState } from "react";

export default function ApiResponseToast() {
    const [payload, setPayload] = useState<any>(null);
    const [visible, setVisible] = useState(false);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        try {
            if (typeof window === 'undefined') return;
            const raw = sessionStorage.getItem('propertyUpdateResponse');
            if (!raw) return;
            const data = JSON.parse(raw);
            setPayload(data);
            setVisible(true);
            sessionStorage.removeItem('propertyUpdateResponse');

            // Auto-hide after 6s
            const hideTimer = setTimeout(() => setVisible(false), 6000);

            // If we have a property id, scroll to and highlight the card
            const propertyId = (data && (data.property?._id || data.property?.id || data.propertyId || data.id));
            if (propertyId) {
                // Slight delay so page can render
                setTimeout(() => {
                    const el = document.querySelector(`[data-property-id="${propertyId}"]`);
                    if (el) {
                        try {
                            (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
                            el.classList.add('ring-4', 'ring-teal-300', 'rounded-lg');
                            // remove highlight after 4s
                            setTimeout(() => el.classList.remove('ring-4', 'ring-teal-300', 'rounded-lg'), 4000);
                        } catch (e) {
                            // ignore
                        }
                    }
                }, 300);
            }

            return () => clearTimeout(hideTimer);
        } catch (e) {
            console.warn('ApiResponseToast read error', e);
        }
    }, []);

    if (!payload) return null;
    if (!visible) return null;

    const message = payload?.message || 'Update result';
    const details = payload?.property ? JSON.stringify(payload.property, null, 2) : JSON.stringify(payload, null, 2);

    return (
        <div className="fixed top-6 right-6 z-50 w-96">
            <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-lg border p-3">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        ✓
                    </div>
                    <div className="flex-1">
                        <div className="text-sm text-emerald-700 font-semibold">{message}</div>
                        <div className="text-xs text-gray-500 mt-1">Saved successfully</div>
                        {expanded && (
                            <pre className="text-xs text-gray-600 max-h-40 overflow-auto mt-2 bg-gray-50 p-2 rounded">{details}</pre>
                        )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <button onClick={() => setExpanded(prev => !prev)} className="text-xs text-primary/90 underline">{expanded ? 'Hide details' : 'Show details'}</button>
                        <button onClick={() => setVisible(false)} className="text-sm text-gray-500 px-2 py-1">Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
