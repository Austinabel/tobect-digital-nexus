import { supabaseAdmin } from "@/lib/supabase/server";
import { onlinePaymentEnabled } from "@/lib/payments/paystack";
import { readContent } from "@/lib/content";

export interface SetupStep {
  key: string;
  label: string;
  detail: string;
  href: string;
  done: boolean;
  /** optional steps don't count against "ready" */
  optional?: boolean;
}

/**
 * What a new owner still has to do before the website is truly theirs —
 * worked out from the database, so it is always current. Shown on the
 * dashboard until every required step is done.
 */
export async function setupChecklist(): Promise<SetupStep[]> {
  const admin = supabaseAdmin();
  const count = async (table: string, build: (q: ReturnType<ReturnType<typeof admin.from>["select"]>) => unknown) => {
    const { count: n } = (await build(admin.from(table).select("*", { count: "exact", head: true }))) as { count: number | null };
    return n ?? 0;
  };
  const [settings, pages, realProducts, sampleProducts, sampleSlides, staff] = await Promise.all([
    admin.from("site_settings").select("data").eq("id", 1).maybeSingle(),
    admin.from("page_content").select("key, data"),
    count("products", (q) => q.eq("published", true).eq("is_sample", false).is("deleted_at", null)),
    count("products", (q) => q.eq("published", true).eq("is_sample", true).is("deleted_at", null)),
    count("hero_slides", (q) => q.eq("active", true).eq("is_sample", true)),
    count("staff_members", (q) => q.eq("active", true)),
  ]);
  const saved = new Map((pages.data ?? []).map((p) => [p.key, p.data]));
  const data = (settings.data?.data ?? {}) as Record<string, unknown>;
  const about = readContent("about", saved.get("about"));
  const returns = readContent("returns", saved.get("returns"));

  return [
    { key: "settings", label: "Check your business details", detail: "Name, phone, WhatsApp, email, address and logo text.", href: "/admin/settings", done: Object.keys(data).length > 0 },
    { key: "products", label: "List your real products", detail: "Add products with your own prices and photos.", href: "/admin/products/new", done: realProducts > 0 },
    { key: "samples", label: "Remove the sample products", detail: `${sampleProducts} sample product${sampleProducts === 1 ? " is" : "s are"} still in the shop with indicative prices.`, href: "/admin/products?status=sample", done: sampleProducts === 0 },
    { key: "slides", label: "Use your own homepage photos", detail: sampleSlides ? `${sampleSlides} stock photo${sampleSlides === 1 ? "" : "s"} still in the homepage slideshow.` : "Your own photos are in the slideshow.", href: "/admin/banners/home-slides", done: sampleSlides === 0, optional: true },
    { key: "returns", label: "Write your returns policy", detail: "The shop promises returns — publish the conditions.", href: "/admin/pages/returns", done: Boolean(String(returns.body ?? "").trim()) },
    { key: "terms", label: "Review terms & privacy", detail: "Have the legal pages checked and saved.", href: "/admin/pages", done: saved.has("terms") && saved.has("privacy") },
    { key: "about", label: "Tell your story", detail: "Add your story, team and figures to the About page.", href: "/admin/pages/about", done: Boolean(String(about.story ?? "").trim()), optional: true },
    { key: "payments", label: "Turn on card payments", detail: "Add your Paystack secret key to the server settings (see ADMIN.md).", href: "/admin", done: onlinePaymentEnabled(), optional: true },
    { key: "team", label: "Add your team", detail: "Give staff their own logins and roles.", href: "/admin/team", done: staff > 1, optional: true },
  ];
}
