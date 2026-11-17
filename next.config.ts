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
};

export default nextConfig;
