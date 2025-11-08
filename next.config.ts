//import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//  /* config options here */
// };
//
//export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,      // otkriva potencijalne probleme u React komponentama
  swcMinify: true,            // koristi brži SWC minifier
  poweredByHeader: false,     // uklanja "x-powered-by: Next.js" iz headera radi sigurnosti
  compress: true,             // omogućava gzip kompresiju

  images: {
    domains: [
      "images.unsplash.com",
      "cdn.pixabay.com",
      "res.cloudinary.com",
    ],
  },

  eslint: {
    ignoreDuringBuilds: true,  // build prolazi čak i ako postoje ESLint greške
  },

  typescript: {
    ignoreBuildErrors: false,  // build pada ako postoje TypeScript greške
  },

  // Ukloni experimental.optimizeCss jer uzrokuje probleme sa critters
  // experimental: {
  //   optimizeCss: true,         // ❌ Ovo uzrokuje critters error
  // }
};

export default nextConfig;