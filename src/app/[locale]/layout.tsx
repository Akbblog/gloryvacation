import type { Metadata } from "next";
import "../globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import SWRProvider from '@/components/providers/SWRProvider';
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import MaintenanceWrapper from "@/components/MaintenanceWrapper";

export const metadata: Metadata = {
  title: "Glory Vacation Homes | Luxury Vacation Rentals in Dubai",
  description: "Book your dream holiday home with Glory Vacation Homes. Experience luxury, comfort, and unforgettable memories.",
  icons: {
    icon: '/glory-icon.svg',
  },
};

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!['en', 'ar'].includes(locale)) {
    notFound();
  }

  const messages = await getMessages();
  const isRtl = locale === 'ar';

  return (
    <html lang={locale} dir={isRtl ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Google+Sans:400,500,700|Google+Sans+Text:400,500,700&display=swap"
        />
      </head>
      <body
        className={`antialiased bg-background text-foreground`}
        style={{ fontFamily: isRtl ? "'Tahoma', 'Arial', sans-serif" : "'Google Sans', 'Roboto', sans-serif" }}
        suppressHydrationWarning
      >
        <SWRProvider>
          <NextIntlClientProvider messages={messages}>
            <AuthProvider>
              <MaintenanceWrapper>
                {children}
                <WhatsAppButton />
              </MaintenanceWrapper>
            </AuthProvider>
          </NextIntlClientProvider>
        </SWRProvider>
      </body>
    </html>
  );
}
