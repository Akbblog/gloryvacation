"use client";

import { useState } from "react";

export default function ContactBox({ propertyId }: { propertyId?: string }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !message) {
            alert("Please fill in required fields");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, phone, message, subject: `Inquiry for property ${propertyId || 'N/A'}`, propertyId }),
            });

            if (res.ok) {
                setSuccess("Thank you — your message was sent. Our team will contact you shortly.");
                setName(""); setEmail(""); setPhone(""); setMessage("");
            } else {
                const body = await res.json();
                alert(body?.message || "Failed to send message");
            }
        } catch (err) {
            console.error(err);
            alert("Failed to send message");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-6 border border-gray-100 rounded-lg p-4 bg-white">
            <h4 className="font-semibold mb-2">Contact about this property</h4>
            {success ? (
                <div className="text-sm text-green-600">{success}</div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                    <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full px-3 py-2 border rounded" />
                    <input required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full px-3 py-2 border rounded" />
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="w-full px-3 py-2 border rounded" />
                    <textarea required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message" rows={4} className="w-full px-3 py-2 border rounded" />
                    <button type="submit" disabled={loading} className="w-full py-2 bg-primary text-white rounded">{loading ? 'Sending...' : 'Send Message'}</button>
                </form>
            )}
        </div>
    );
}
