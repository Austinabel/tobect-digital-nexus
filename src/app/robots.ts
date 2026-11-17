import type { MetadataRoute } from "next";
import { getSiteLinks } from "@/lib/site-server";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { SITE } = await getSiteLinks();
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/cart", "/search"] },
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
