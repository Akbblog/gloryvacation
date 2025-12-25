import type { NextConfig } from "next";

import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // allow images proxied through the deployed hostname
      {
        protocol: "https",
        hostname: "easygoholidayhomes.com",
      },
      // allow original external image host
      {
        protocol: "http",
        hostname: "img.crs.itsolutions.es",
      },
      // allow freeimage.host image host (used by external uploads)
      {
        protocol: "https",
        hostname: "freeimage.host",
      },
      {
        protocol: "http",
        hostname: "freeimage.host",
      },
      // allow iili.io image host (used by external uploads)
      {
        protocol: "https",
        hostname: "iili.io",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
