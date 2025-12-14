"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Lock, Mail, AlertCircle } from "lucide-react";

function SignInContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await signIn("credentials", {
                redirect: false,
                email: formData.email,
                password: formData.password,
            });

            if (res?.error) {
                setError("Invalid email or password");
            } else {
                router.push(callbackUrl);
            }
        } catch (err) {
            setError("An error occurred during sign in");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 md:p-10">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-[#1C1C1C] mb-2">Welcome Back</h1>
                <p className="text-[#7E7E7E]">Sign in to your Glory Vacation account</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 rounded-xl flex items-center gap-3 text-red-600 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-[#1C1C1C] mb-2">Email</label>
                    <div className="relative">
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-gray-900 bg-white"
                            placeholder="your@email.com"
                        />
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-[#1C1C1C] mb-2">Password</label>
                    <div className="relative">
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-gray-900 bg-white"
                            placeholder="••••••••"
                        />
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300" />
                        <span className="text-[#7E7E7E]">Remember me</span>
                    </label>
                    <Link href="/auth/forgot-password" className="text-primary hover:underline font-medium">
                        Forgot password?
                    </Link>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white py-3.5 rounded-full font-semibold transition-all shadow-lg shadow-primary/20"
                >
                    {isLoading ? "Signing in..." : "Sign In"}
                </button>
            </form>

            <div className="mt-8 text-center text-sm text-[#7E7E7E]">
                Don't have an account?{" "}
                <Link href="/auth/register" className="text-primary font-semibold hover:underline">
                    Sign up
                </Link>
            </div>
        </div>
    );
}

export default function SignInPage() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-1 flex items-center justify-center px-4 py-20 md:py-32">
                <Suspense fallback={<div className="text-center">Loading...</div>}>
                    <SignInContent />
                </Suspense>
            </main>
            <Footer />
        </div>
    );
}
