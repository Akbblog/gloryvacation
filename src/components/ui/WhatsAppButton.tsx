"use client";

import { MessageCircle } from "lucide-react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

export function WhatsAppButton() {
  const { data: settings } = useSWR('/api/settings', fetcher);

  const whatsappNumber = settings?.general?.whatsappNumber || "+92 345 2140314";
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\s+/g, '').replace(/\+/g, '')}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white p-3 md:p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-green-300 group"
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
      <div className="absolute bottom-full right-0 mb-2 px-2 md:px-3 py-1 bg-gray-800 text-white text-xs md:text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
        Chat with us on WhatsApp
      </div>
    </a>
  );
}