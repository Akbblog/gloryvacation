"use client";

import { useMemo, useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useRouter, Link } from "@/i18n/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Lock, Mail, AlertCircle } from "lucide-react";
import { useLocale } from "next-intl";

function SignInContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const locale = useLocale();
    const callbackUrl = searchParams.get("callbackUrl") || "/";

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const normalizedCallback = useMemo(() => {
        const decoded = (() => {
            try {
                return decodeURIComponent(callbackUrl);
            } catch {
                return callbackUrl;
            }
        })();

        if (!decoded.startsWith("/")) return decoded;
        if (decoded === `/${locale}`) return "/";
        if (decoded.startsWith(`/${locale}/`)) return decoded.slice(locale.length + 1);
        return decoded;
    }, [callbackUrl, locale]);

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
                router.push(normalizedCallback || "/");
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
                        <input type="checkbox" className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-gray-300" />
                        <span className="text-[#7E7E7E]">Remember me</span>
                    </label>
                    <Link href="/auth/forgot-password" className="text-teal-600 hover:underline font-medium">
                        Forgot password?
                    </Link>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg disabled:hover:scale-100 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Signing in...
                        </span>
                    ) : "Sign In"}
                </button>
            </form>

            <div className="mt-8 text-center text-sm text-[#7E7E7E]">
                Don't have an account?{" "}
                <Link href="/auth/register" className="text-teal-600 font-semibold hover:underline">
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
