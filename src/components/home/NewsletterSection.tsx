"use client";

import { useState } from "react";
import { Mail, CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export function NewsletterSection() {
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            // Here you would handle the newsletter subscription
            setIsSubmitted(true);
            setTimeout(() => {
                setIsSubmitted(false);
                setEmail("");
            }, 3000);
        }
    };

    const t = useTranslations('Newsletter');

    return (
        <section className="py-12 md:py-16 bg-[#1C1C1C]">
            <div className="container mx-auto px-4 md:px-6 lg:px-[50px] xl:px-[70px] max-w-[1440px]">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    {/* Left Content */}
                    <div className="text-center md:text-left">
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                            {t('title')}
                        </h2>
                        <p className="text-white/70 text-base max-w-md">
                            {t('description')}
                        </p>
                    </div>

                    {/* Right - Form */}
                    <form onSubmit={handleSubmit} className="w-full md:w-auto">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7E7E7E] rtl:left-auto rtl:right-4" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t('placeholder')}
                                    className="w-full sm:w-[300px] pl-12 pr-4 rtl:pl-4 rtl:pr-12 py-4 rounded-full bg-white text-[#1C1C1C] placeholder:text-[#7E7E7E] outline-none focus:ring-2 focus:ring-primary transition-all"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitted}
                                className="bg-primary hover:bg-primary/90 disabled:bg-green-500 text-white rounded-full px-8 py-4 font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                {isSubmitted ? (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        {t('subscribed')}
                                    </>
                                ) : (
                                    t('subscribe')
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
}
