"use client";

import Image from "next/image";
import { Smartphone } from "lucide-react";
import { useTranslations } from "next-intl";

export function MobileAppSection() {
    const t = useTranslations('MobileApp');

    return (
        <section className="py-12 md:py-20 bg-gradient-to-br from-primary/5 to-[#F5A623]/5">
            <div className="container mx-auto px-4 md:px-6 lg:px-[50px] xl:px-[70px] max-w-[1440px]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    {/* Left - Phone Mockup */}
                    <div className="relative flex justify-center lg:justify-start">
                        <div className="relative w-[280px] h-[500px] md:w-[320px] md:h-[580px]">
                            {/* Phone Frame */}
                            <div className="absolute inset-0 bg-[#1C1C1C] rounded-[40px] p-3 shadow-2xl">
                                <div className="w-full h-full bg-white rounded-[32px] overflow-hidden relative">
                                    {/* App Screen Content */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-primary to-primary/80 flex flex-col items-center justify-center text-white p-8">
                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6">
                                            <span className="text-primary text-2xl font-bold">{t('logoText')}</span>
                                        </div>
                                        <h3 className="text-xl font-bold mb-2 text-center">{t('appName')}</h3>
                                        <p className="text-white/80 text-sm text-center">{t('slogan')}</p>
                                    </div>
                                </div>
                            </div>
                            {/* Notch */}
                            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#1C1C1C] rounded-full z-10" />
                        </div>
                    </div>

                    {/* Right Content */}
                    <div className="text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                            <Smartphone className="w-4 h-4" />
                            {t('badge')}
                        </div>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1C1C1C] mb-4 leading-tight">
                            {t('title1')}
                            <br />
                            <span className="text-primary">{t('title2')}</span>
                        </h2>
                        <p className="text-lg text-[#7E7E7E] mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                            {t('description')}
                        </p>

                        {/* App Store Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <button className="bg-[#1C1C1C] text-white rounded-xl px-6 py-3 flex items-center justify-center gap-3 hover:bg-black transition-colors">
                                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.19 2.31-.89 3.57-.84 1.51.07 2.65.59 3.4 1.49-3.11 1.83-2.37 5.88.65 7 .5 1.39-1.19 2.81-2.7 4.52zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                                </svg>
                                <div className="text-left">
                                    <div className="text-[10px] opacity-80">{t('download')}</div>
                                    <div className="text-sm font-semibold">{t('appStore')}</div>
                                </div>
                            </button>
                            <button className="bg-[#1C1C1C] text-white rounded-xl px-6 py-3 flex items-center justify-center gap-3 hover:bg-black transition-colors">
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M3 20.5V3.5C3 2.91 3.34 2.39 3.84 2.15L13.69 12L3.84 21.85C3.34 21.6 3 21.09 3 20.5ZM16.81 15.12L6.05 21.34L14.54 12.85L16.81 15.12ZM20.16 10.81C20.5 11.08 20.75 11.5 20.75 12C20.75 12.5 20.53 12.9 20.18 13.18L17.89 14.5L15.39 12L17.89 9.5L20.16 10.81ZM6.05 2.66L16.81 8.88L14.54 11.15L6.05 2.66Z" />
                                </svg>
                                <div className="text-left">
                                    <div className="text-[10px] opacity-80">{t('getIt')}</div>
                                    <div className="text-sm font-semibold">{t('googlePlay')}</div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
