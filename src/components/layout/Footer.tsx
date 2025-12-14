"use client";

import Link from "next/link";
import { Facebook, Instagram, Linkedin, Youtube, Twitter, MapPin, Phone, Mail } from "lucide-react";
import { useTranslations } from "next-intl";

const SOCIAL_LINKS = [
    { name: "Facebook", icon: Facebook, href: "https://facebook.com" },
    { name: "Instagram", icon: Instagram, href: "https://instagram.com" },
    { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com" },
    { name: "YouTube", icon: Youtube, href: "https://youtube.com" },
    { name: "Twitter", icon: Twitter, href: "https://twitter.com" },
];

export function Footer() {
    const t = useTranslations('Footer');

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
            <div className="container mx-auto px-4 md:px-6 lg:px-[50px] xl:px-[70px] max-w-[1440px] py-12 md:py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
                    {/* Brand Column */}
                    <div className="col-span-2 md:col-span-4 lg:col-span-2">
                        <Link href="/" className="inline-block mb-6">
                            <span className="text-2xl font-bold text-primary">Glory Vacation</span>
                        </Link>
                        <p className="text-[#7E7E7E] text-sm leading-relaxed mb-6 max-w-[320px]">
                            {t('description')}
                        </p>

                        {/* Contact Info */}
                        <div className="space-y-3 text-sm text-[#7E7E7E]">
                            <a href="mailto:info@gloryvacation.com" className="flex items-center gap-2 hover:text-primary transition-colors">
                                <Mail className="w-4 h-4" />
                                <span className={/* Use dir="ltr" for email/phone if mostly latin */ "dir-ltr"}>info@gloryvacation.com</span>
                            </a>
                            <a href="tel:+971503505752" className="flex items-center gap-2 hover:text-primary transition-colors">
                                <Phone className="w-4 h-4" />
                                <span className="dir-ltr">+971 50 350 5752</span>
                            </a>
                            <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>{t('dubai')}</span>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="flex items-center gap-3 mt-6">
                            {SOCIAL_LINKS.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full bg-[#F5A623] hover:bg-[#E09615] text-white flex items-center justify-center transition-colors"
                                    aria-label={social.name}
                                >
                                    <social.icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link Columns */}
                    {Object.entries(FOOTER_LINKS).map(([key, section]) => (
                        <div key={key}>
                            <h3 className="font-semibold text-[#1C1C1C] mb-4 text-sm">
                                {section.title}
                            </h3>
                            <ul className="space-y-3">
                                {section.links.map((link) => (
                                    <li key={link.name}>
                                        {link.external ? (
                                            <a
                                                href={link.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[#7E7E7E] hover:text-primary transition-colors text-sm"
                                            >
                                                {link.name}
                                            </a>
                                        ) : (
                                            <Link
                                                href={link.href}
                                                className="text-[#7E7E7E] hover:text-primary transition-colors text-sm"
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
                <div className="container mx-auto px-4 md:px-6 lg:px-[50px] xl:px-[70px] max-w-[1440px] py-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#7E7E7E]">
                        <p>© {new Date().getFullYear()} Glory Vacation. {t('rights')}</p>
                        <div className="flex items-center gap-4">
                            {/* Payment Methods / Certifications could go here */}
                            <span className="text-xs">{t('licensed')}</span>
                            <span className="text-xs">|</span>
                            <span className="text-xs">4.6★ {t('rated')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
