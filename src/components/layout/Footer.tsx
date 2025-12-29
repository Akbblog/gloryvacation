"use client";

import { Link } from "@/i18n/navigation";
import { Facebook, Instagram, Youtube, Camera, MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

const SOCIAL_LINKS = [
    { name: "Facebook", icon: Facebook, href: "https://web.facebook.com/gloryvacationhomes" },
    { name: "Instagram", icon: Instagram, href: "https://www.instagram.com/gloryvacationhomes" },
    { name: "YouTube", icon: Youtube, href: "https://www.youtube.com/@gloryvacationhomes" },
    { name: "Snapchat", icon: Camera, href: "https://www.snapchat.com/@gloryvacation" },
];

export function Footer() {
    const t = useTranslations('Footer');
    const { data: settings } = useSWR('/api/settings', fetcher);

    const FOOTER_LINKS: Record<string, { title: string; links: Array<{ name: string; href: string; external?: boolean }> }> = {
        explore: {
            title: t('explore'),
            links: [
                { name: t('becomeHost'), href: "/list-your-property" },
                { name: t('ownersPortal'), href: "/profile" },
                { name: t('trustSafety'), href: "/trust-and-safety" },
                { name: t('blogs'), href: "/blogs" },
                { name: t('newsletter'), href: "#newsletter" },
            ],
        },
        company: {
            title: t('company'),
            links: [
                { name: t('about'), href: "/about" },
                { name: t('terms'), href: "/terms-and-conditions" },
                { name: t('privacy'), href: "/privacy-policy" },
                { name: t('cancellation'), href: "/cancellation-policy" },
            ],
        },
        support: {
            title: t('support'),
            links: [
                { name: t('faq'), href: "/faq" },
                { name: t('contact'), href: "/contact" },
            ],
        },
    };

    return (
        <footer className="bg-white border-t border-gray-200">
            {/* Main Footer */}
            <div className="container mx-auto px-4 md:px-6 lg:px-[50px] xl:px-[70px] max-w-[1440px] py-8 md:py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8 lg:gap-12">
                    {/* Brand Column */}
                    <div className="col-span-2">
                        <Link href="/" className="inline-block mb-4 md:mb-6">
                            <span className="text-xl md:text-2xl font-bold text-teal-600">Glory Vacation Homes</span>
                        </Link>
                        <p className="text-[#7E7E7E] text-xs md:text-sm leading-relaxed mb-4 md:mb-6 max-w-[280px] md:max-w-[320px]">
                            {t('description')}
                        </p>

                        {/* Contact Info */}
                        <div className="space-y-2 md:space-y-3 text-xs md:text-sm text-[#7E7E7E]">
                            <a href="mailto:info@gloryvacation.com" className="flex items-center gap-2 hover:text-teal-600 transition-colors">
                                <Mail className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                                <span className="dir-ltr truncate">info@gloryvacation.com</span>
                            </a>
                            <a href="tel:+971503505752" className="flex items-center gap-2 hover:text-teal-600 transition-colors">
                                <Phone className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                                <span className="dir-ltr">+971 50 350 5752</span>
                            </a>
                            <a href={`https://wa.me/${(settings?.general?.whatsappNumber || "+92 345 2140314").replace(/\s+/g, '').replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-teal-600 transition-colors">
                                <MessageCircle className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                                <span className="dir-ltr">{settings?.general?.whatsappNumber || "+92 345 2140314"}</span>
                            </a>
                            <div className="flex items-start gap-2">
                                <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 mt-0.5 shrink-0" />
                                <span>{t('dubai')}</span>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="flex items-center gap-2 md:gap-3 mt-4 md:mt-6">
                            {SOCIAL_LINKS.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#F5A623] hover:bg-[#E09615] text-white flex items-center justify-center transition-colors"
                                    aria-label={social.name}
                                >
                                    <social.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link Columns - Stack on mobile */}
                    {Object.entries(FOOTER_LINKS).map(([key, section]) => (
                        <div key={key} className="col-span-1">
                            <h3 className="font-semibold text-[#1C1C1C] mb-3 md:mb-4 text-xs md:text-sm">
                                {section.title}
                            </h3>
                            <ul className="space-y-2 md:space-y-3">
                                {section.links.map((link) => (
                                    <li key={link.name}>
                                        {link.external ? (
                                            <a
                                                href={link.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[#7E7E7E] hover:text-teal-600 transition-colors text-xs md:text-sm"
                                            >
                                                {link.name}
                                            </a>
                                        ) : (
                                            <Link
                                                href={link.href}
                                                className="text-[#7E7E7E] hover:text-teal-600 transition-colors text-xs md:text-sm"
                                            >
                                                {link.name}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-200">
                <div className="container mx-auto px-4 md:px-6 lg:px-[50px] xl:px-[70px] max-w-[1440px] py-3 md:py-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-2 md:gap-4 text-[10px] md:text-sm text-[#7E7E7E]">
                        <p className="text-center md:text-left">© {new Date().getFullYear()} Glory Vacation Homes. {t('rights')}</p>
                        <div className="flex items-center gap-3 md:gap-4">
                            <span>{t('licensed')}</span>
                            <span>|</span>
                            <span>4.6★ {t('rated')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
