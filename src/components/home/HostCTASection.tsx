"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export function HostCTASection() {
    const t = useTranslations('HostCTA');

    return (
        <section className="py-12 md:py-20 bg-white">
            <div className="container mx-auto px-4 md:px-6 lg:px-[50px] xl:px-[70px] max-w-[1440px]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    {/* Left Content */}
                    <div className="order-2 lg:order-1">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1C1C1C] mb-4 leading-tight">
                            {t('title1')}
                            <br />
                            <span className="text-teal-600">{t('title2')}</span>
                        </h2>
                        <p className="text-lg text-[#7E7E7E] mb-8 max-w-lg leading-relaxed">
                            {t('description')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/list-your-property">
                                <button className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-full px-8 py-4 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                                    {t('listProperty')}
                                </button>
                            </Link>
                            <Link href="https://app.easygoholidayhomes.com" target="_blank">
                                <button className="bg-white border-2 border-[#1C1C1C] text-[#1C1C1C] hover:bg-gray-50 rounded-full px-8 py-4 text-base font-semibold transition-all duration-300">
                                    {t('manageProperty')}
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Right Image */}
                    <div className="order-1 lg:order-2 relative">
                        <div className="relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden">
                            <Image
                                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop"
                                alt="Luxury Property"
                                fill
                                className="object-cover"
                            />
                            {/* Decorative elements */}
                            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-teal-500/20 rounded-full blur-2xl" />
                            <div className="absolute -top-4 -left-4 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
