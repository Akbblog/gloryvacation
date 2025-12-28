"use client";

import Image from "next/image";
import { Smartphone } from "lucide-react";
import { useTranslations } from "next-intl";

export function MobileAppSection() {
    const t = useTranslations('MobileApp');

    return (
        <section className="py-12 md:py-20 bg-gradient-to-br from-teal-50 to-amber-50">
            <div className="container mx-auto px-4 md:px-6 lg:px-[50px] xl:px-[70px] max-w-[1440px]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    {/* Left - Phone Mockup */}
                    <div className="relative flex justify-center lg:justify-start">
                        <div className="relative w-[280px] h-[500px] md:w-[320px] md:h-[580px]">
                            {/* Phone Frame */}
                            <div className="absolute inset-0 bg-[#1C1C1C] rounded-[40px] p-3 shadow-2xl">
                                <div className="w-full h-full bg-white rounded-[32px] overflow-hidden relative">
                                    {/* App Screen Content */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-teal-500 to-teal-600 flex flex-col items-center justify-center text-white p-8">
                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6">
                                            <svg
                                                className="w-8 h-8 text-teal-600"
                                                viewBox="0 0 31.63 16.74"
                                                fill="currentColor"
                                            >
                                                <path d="M23.78,16.73c0,.23.21.34.37.46A3.1,3.1,0,0,1,25.53,20c0,1.19,0,2.37,0,3.55a3.13,3.13,0,0,1-1.26,2.52,3,3,0,0,1-1.78.61A23.74,23.74,0,0,1,20,26.62a2.84,2.84,0,0,1-2-1.18,3.13,3.13,0,0,1-.69-2c0-1.17,0-2.33,0-3.5a3.22,3.22,0,0,1,1-2.29,3.71,3.71,0,0,1,.54-.51c.24-.17.25-.31,0-.5s-.61-.48-.91-.72c-1.17-.92-2.34-1.82-3.49-2.76a.81.81,0,0,0-1.2,0C11.63,14.45,10,15.74,8.32,17L6.57,18.39l-1.21,1a1.08,1.08,0,0,0-.39.94c0,1.62,0,3.25,0,4.87a1.41,1.41,0,0,1-.47,1.13,1.39,1.39,0,0,1-2.24-.61A2.58,2.58,0,0,1,2.19,25c0-1.68,0-3.36,0-5a8.73,8.73,0,0,1,.11-1,2,2,0,0,1,.59-1.16c.33-.32.67-.62,1-.91l3.19-2.53,2.56-2,2.16-1.7a3.38,3.38,0,0,1,4.25.2c.65.62,1.41,1.12,2.11,1.68l2.94,2.33a1.34,1.34,0,0,0,.27.17c.18.08.29,0,.46-.13A15,15,0,0,1,24,13.06a3.05,3.05,0,0,1,3.61.3c.94.72,1.87,1.44,2.8,2.18s1.54,1.23,2.3,1.86a3,3,0,0,1,1.11,2.32c0,1.8,0,3.6,0,5.4a1.5,1.5,0,0,1-.57,1.26,1.43,1.43,0,0,1-2.19-.72,3.39,3.39,0,0,1-.1-.84c0-1.45,0-2.9,0-4.35a1.42,1.42,0,0,0-.69-1.37,18.7,18.7,0,0,1-1.57-1.25L27,16.55c-.37-.29-.72-.58-1.09-.84s-.46-.26-.8,0Zm-1.11,4.95h0V20.15a.8.8,0,0,0-.23-.68c-.3-.25-.61-.49-.91-.72a.29.29,0,0,0-.43,0,9.82,9.82,0,0,0-.77.81.92.92,0,0,0-.19.53c0,1.07,0,2.15,0,3.22,0,.38.14.51.52.52s.92,0,1.38,0,.63-.13.64-.68S22.67,22.18,22.67,21.68Z" transform="translate(-2.19 -9.95)"/>
                                                <path d="M15.24,23.14c0,.48,0,1,0,1.43s-.19.75-.78.76-.88,0-1.32,0-.73-.19-.74-.75c0-.95,0-1.91,0-2.86a1.43,1.43,0,0,1,1.89-1.34,1.46,1.46,0,0,1,1,1.29c0,.49,0,1,0,1.48Z" transform="translate(-2.19 -9.95)"/>
                                            </svg>
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
                        <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
                            <Smartphone className="w-4 h-4" />
                            {t('badge')}
                        </div>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1C1C1C] mb-4 leading-tight">
                            {t('title1')}
                            <br />
                            <span className="text-teal-600">{t('title2')}</span>
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
