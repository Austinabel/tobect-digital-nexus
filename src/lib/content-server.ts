import { cache } from "react";
import { supabasePublic } from "@/lib/supabase/server";
import { readContent, type ContentKey } from "@/lib/content";
import type { Testimonial } from "@/lib/data/testimonials";
import type { Project } from "@/lib/data/projects";
import { slugify } from "@/lib/admin/product-form";
import { APPLIANCE_LIBRARY, type ApplianceTemplate } from "@/lib/calculator";

/** Every saved page, read once per request. Missing pages use the launch content. */
const allContent = cache(async (): Promise<Map<string, unknown>> => {
  const { data, error } = await supabasePublic().from("page_content").select("key, data");
  if (error) console.error("Page content unavailable:", error.message);
  return new Map((data ?? []).map((r) => [r.key, r.data]));
});

export async function getContent(key: ContentKey): Promise<Record<string, unknown>> {
  return readContent(key, (await allContent()).get(key));
}

export interface PolicyContent {
  title: string;
  summary: string;
  body: string;
}
export async function getPolicy(key: "warranty" | "terms" | "privacy" | "returns" | "delivery"): Promise<PolicyContent> {
  return (await getContent(key)) as unknown as PolicyContent;
}

export interface AboutContent {
  founded: string;
  experience: string;
  cacNumber: string;
  story: string[];
  mission: string;
  vision: string;
  stats: { value: string; label: string }[];
  milestones: { year: string; title: string; text: string }[];
  certifications: { name: string; detail: string }[];
  team: { name: string; role: string; bio: string; photo: string }[];
}
export async function getAbout(): Promise<AboutContent> {
  const c = await getContent("about");
  return { ...(c as unknown as AboutContent), story: String(c.story ?? "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean) };
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const items = (await getContent("testimonials")).items as (Testimonial & { rating: number | null })[];
  return items.map((t) => ({ ...t, rating: t.rating ?? undefined }));
}

export async function getProjects(): Promise<Project[]> {
  const items = (await getContent("projects")).items as Project[];
  const seen = new Set<string>();
  return items.map((p, i) => {
    let slug = slugify(p.title) || `project-${i + 1}`;
    while (seen.has(slug)) slug = `${slug}-${i + 1}`;
    seen.add(slug);
    return { ...p, slug, image: p.image || undefined };
  });
}

export async function getFaqs(): Promise<{ q: string; a: string }[]> {
  return (await getContent("faqs")).items as { q: string; a: string }[];
}

/** The calculators' appliance list (Admin → Calculator settings). */
export async function getAppliances(): Promise<ApplianceTemplate[]> {
  const rows = (await getContent("calculator")).appliances as { id: string; name: string; watts: number; hoursPerDay: number; nightHours: number | null; surge: boolean }[];
  if (!rows?.length) return APPLIANCE_LIBRARY;
  return rows.map((r) => ({ id: r.id, name: r.name, watts: r.watts, hoursPerDay: r.hoursPerDay, ...(r.nightHours !== null ? { nightHours: r.nightHours } : {}), ...(r.surge ? { surge: true } : {}) }));
}
