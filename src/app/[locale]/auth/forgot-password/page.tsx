"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Link } from "@/i18n/navigation";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Placeholder: no backend call here — just show a success state
        setSent(true);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-1 flex items-center justify-center px-4 py-20 md:py-32">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 md:p-10">
                    <h1 className="text-2xl font-bold mb-4">Forgot Password</h1>
                    {sent ? (
                        <p className="text-green-600">If an account exists for that email, a reset link has been sent.</p>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200"
                                placeholder="your@email.com"
                            />
                            <button className="w-full bg-teal-600 text-white py-3 rounded-xl">Send reset link</button>
                        </form>
                    )}

                    <div className="mt-6 text-sm text-gray-600">
                        <Link href="/auth/signin" className="text-teal-600 hover:underline">
                            Back to sign in
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
