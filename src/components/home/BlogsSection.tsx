"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

const BLOGS = [
    {
        id: "romantic-escapes",
        key: "1",
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=2025&auto=format&fit=crop",
        date: "Dec 10, 2024",
    },
    {
        id: "family-rentals",
        key: "2",
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop",
        date: "Dec 8, 2024",
    },
    {
        id: "al-barsha-apartments",
        key: "3",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop",
        date: "Dec 5, 2024",
    },
];

export function BlogsSection() {
    const t = useTranslations('Blogs');

    return (
        <section className="py-12 md:py-20 bg-white">
            <div className="container mx-auto px-4 md:px-6 lg:px-[50px] xl:px-[70px] max-w-[1440px]">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl md:text-2xl font-bold text-[#1C1C1C]">
                        {t('title')}
                    </h2>
                    <Link
                        href="/blogs"
                        className="text-teal-600 font-semibold hover:underline transition-colors"
                    >
                        {t('seeMore')}
                    </Link>
                </div>

                {/* Blog Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {BLOGS.map((blog) => (
                        <Link
                            key={blog.id}
                            href={`/blogs/${blog.id}`}
                            className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-[0px_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0px_8px_24px_rgba(0,0,0,0.1)] transition-all duration-300"
                        >
                            {/* Image */}
                            <div className="relative h-[180px] md:h-[200px] overflow-hidden">
                                <Image
                                    src={blog.image}
                                    alt={t(`${blog.key}.title`)}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                {/* Badge */}
                                <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4">
                                    <span className="bg-gradient-to-r from-teal-500 to-teal-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                                        {t('badge')}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5">
                                <p className="text-xs text-[#7E7E7E] mb-2">{blog.date}</p>
                                <h3 className="text-base font-semibold text-[#1C1C1C] line-clamp-2 mb-2 group-hover:text-teal-600 transition-colors">
                                    {t(`${blog.key}.title`)}
                                </h3>
                                <p className="text-sm text-[#7E7E7E] line-clamp-2">
                                    {t(`${blog.key}.excerpt`)}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
