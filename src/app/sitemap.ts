import type { MetadataRoute } from "next";
import { getSiteLinks } from "@/lib/site-server";
import { getCatalog } from "@/lib/catalog-server";
import { getPolicy } from "@/lib/content-server";
import { SOLUTIONS } from "@/lib/data/solutions";

/** Rebuilt at most hourly, so products, kits and categories added in the admin reach search engines without a redeploy. */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { SITE } = await getSiteLinks();
  const { categories: CATEGORIES, products: PRODUCTS, kits: KITS } = await getCatalog();
  const url = (path: string) => `${SITE.url}${path}`;
  const now = new Date();

  const staticPages: [string, number][] = [
    ["/", 1],
    ["/shop", 0.9],
    ["/solutions", 0.8],
    ["/quote", 0.8],
    ["/solar-calculator", 0.9],
    ["/bulk-quote", 0.7],
    ["/installation", 0.7],
    ["/about", 0.6],
    ["/support", 0.6],
    ["/contact", 0.6],
    ["/warranty", 0.4],
    ["/terms", 0.2],
    ["/privacy", 0.2],
    ["/faq", 0.5],
    ...((await getPolicy("returns")).body.trim() ? [["/returns", 0.4] as [string, number]] : []),
    ...((await getPolicy("delivery")).body.trim() ? [["/delivery", 0.4] as [string, number]] : []),
  ];

  return [
    ...staticPages.map(([path, priority]) => ({ url: url(path), lastModified: now, priority })),
    ...SOLUTIONS.map((s) => ({ url: url(`/solutions/${s.slug}`), lastModified: now, priority: 0.7 })),
    ...CATEGORIES.map((c) => ({ url: url(`/shop/${c.slug}`), lastModified: now, priority: 0.8 })),
    ...PRODUCTS.map((p) => ({ url: url(`/product/${p.slug}`), lastModified: now, priority: 0.7 })),
    ...KITS.map((k) => ({ url: url(`/shop/installation-kits/${k.slug}`), lastModified: now, priority: 0.7 })),
  ];
}
