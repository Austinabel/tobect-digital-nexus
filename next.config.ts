import type { NextConfig } from "next";

// Images uploaded through the admin live in Supabase Storage on this host.
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHost ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }] : [],
  },
  experimental: {
    // Admin photo uploads (validated server-side to ≤ 5 MB per image).
    serverActions: { bodySizeLimit: "6mb" },
  },
  // Addresses from the previous website, so old links and search results land on the matching new page.
  async redirects() {
    return [
      { source: "/products", destination: "/shop", permanent: true },
      { source: "/services", destination: "/solutions", permanent: true },
      { source: "/portfolio", destination: "/projects", permanent: true },
      { source: "/get-quote", destination: "/quote", permanent: true },
      { source: "/privacy-policy", destination: "/privacy", permanent: true },
      { source: "/cookies", destination: "/privacy", permanent: true },
      { source: "/signup", destination: "/account/register", permanent: true },
      { source: "/testimonials", destination: "/about", permanent: true },
      { source: "/careers", destination: "/contact", permanent: true },
      { source: "/blog", destination: "/", permanent: true },
      { source: "/blog/:id", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
