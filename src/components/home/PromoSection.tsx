"use client";

import Image from "next/image";
import Link from "next/link";

export function PromoSection() {
    return (
        <section className="py-12 md:py-20 bg-white">
            <div className="container mx-auto px-4 md:px-6 lg:px-[50px] xl:px-[70px] max-w-[1440px]">
                <div className="relative rounded-[24px] md:rounded-[32px] overflow-hidden bg-black text-white min-h-[320px] md:min-h-[400px] flex items-center">
                    {/* Background Image */}
                    <div className="absolute inset-0">
                        <Image
                            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop"
                            alt="Luxury Interior"
                            fill
                            className="object-cover opacity-60"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 max-w-xl px-6 md:px-12 lg:px-16 py-10 md:py-12">
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 leading-tight">
                            Unlock the Potential of Your Property
                        </h2>
                        <p className="text-base md:text-lg text-neutral-200 mb-6 md:mb-8 leading-relaxed">
                            List your home with EasyGo and enjoy seamless management, verified guests, and maximize your earnings with our premium holiday home network.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                            <Link href="/list-your-property">
                                <button className="bg-primary hover:bg-primary/90 text-white border-none rounded-full px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold shadow-lg transition-all duration-300 hover:scale-105">
                                    List Your Property
                                </button>
                            </Link>
                            <Link href="/about">
                                <button className="bg-transparent border-2 border-white text-white hover:bg-white/10 rounded-full px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold transition-all duration-300">
                                    Learn More
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
