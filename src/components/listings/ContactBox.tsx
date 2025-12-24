"use client";

import { useState } from "react";
import { MessageSquare, CheckCircle, Send } from "lucide-react";

export default function ContactBox({ propertyId }: { propertyId?: string }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        
        if (!name.trim()) newErrors.name = "Name is required";
        if (!email.trim()) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid";
        if (!message.trim()) newErrors.message = "Message is required";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) return;

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
                setErrors({});
                setTimeout(() => setSuccess(null), 5000);
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

    const quickMessages = [
        "I'm interested in booking this property. Could you provide more details?",
        "Is this property available for the dates I'm looking for?",
        "Could you tell me more about the amenities and nearby attractions?",
        "I'd like to schedule a viewing of this property."
    ];

    const applyQuickMessage = (template: string) => {
        setMessage(template);
    };

    return (
        <div className="w-full bg-gradient-to-br from-slate-50 to-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white">
                    <MessageSquare className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Contact Host</h4>
            </div>

            {success ? (
                <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl animate-pulse">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-emerald-900">{success}</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Quick Message Templates */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Quick Messages</label>
                        <div className="grid grid-cols-2 gap-2">
                            {quickMessages.map((template, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => applyQuickMessage(template)}
                                    className="text-xs text-left p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
                                >
                                    {template.slice(0, 40)}...
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Name Field with Floating Label */}
                    <div className="relative">
                        <input
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder=" "
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-500 peer ${
                                errors.name ? 'border-red-500' : 'border-slate-300'
                            }`}
                        />
                        <label className="absolute left-4 top-3 text-gray-500 transition-all duration-300 peer-focus:top-1 peer-focus:text-xs peer-focus:text-teal-600 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500">
                            Full name *
                        </label>
                        {errors.name && <span className="text-red-500 text-xs mt-1">{errors.name}</span>}
                    </div>

                    {/* Email Field with Floating Label */}
                    <div className="relative">
                        <input
                            required
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder=" "
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-500 peer ${
                                errors.email ? 'border-red-500' : 'border-slate-300'
                            }`}
                        />
                        <label className="absolute left-4 top-3 text-gray-500 transition-all duration-300 peer-focus:top-1 peer-focus:text-xs peer-focus:text-teal-600 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500">
                            Email *
                        </label>
                        {errors.email && <span className="text-red-500 text-xs mt-1">{errors.email}</span>}
                    </div>

                    {/* Phone Field with Floating Label */}
                    <div className="relative">
                        <input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder=" "
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-500 peer"
                        />
                        <label className="absolute left-4 top-3 text-gray-500 transition-all duration-300 peer-focus:top-1 peer-focus:text-xs peer-focus:text-teal-600 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500">
                            Phone
                        </label>
                    </div>

                    {/* Message Field with Floating Label */}
                    <div className="relative">
                        <textarea
                            required
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder=" "
                            rows={4}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-500 peer resize-none ${
                                errors.message ? 'border-red-500' : 'border-slate-300'
                            }`}
                        />
                        <label className="absolute left-4 top-3 text-gray-500 transition-all duration-300 peer-focus:top-1 peer-focus:text-xs peer-focus:text-teal-600 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500">
                            Message *
                        </label>
                        {errors.message && <span className="text-red-500 text-xs mt-1">{errors.message}</span>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                Send Message
                            </>
                        )}
                    </button>
                    <p className="text-xs text-gray-500 text-center">The host will respond within 24 hours</p>
                </form>
            )}
        </div>
    );
}
