import { supabaseAdmin } from "@/lib/supabase/server";
import { KIT_SLOTS } from "@/lib/admin/kit-form";
import type { KitProductOption, KitValues } from "./kit-form";

/** Every product that can go into a kit (drafts included, trashed excluded). */
export async function kitProductOptions(): Promise<KitProductOption[]> {
  const { data } = await supabaseAdmin().from("products").select("slug, name, category_slug, price_ngn, published").is("deleted_at", null).order("name");
  return (data ?? []).map((p) => ({ slug: p.slug, name: p.name, category: p.category_slug, priceNgn: Number(p.price_ngn), published: p.published }));
}

export function emptyKitValues(): KitValues {
  return {
    slug: "",
    name: "",
    capacityLabel: "",
    tag: "",
    summary: "",
    applications: "",
    outline: "",
    imageUrl: "",
    imageAlt: "",
    imagePosition: "",
    purchasable: false,
    accessories: ["DC cables", "AC cables", "DC breakers", "AC breakers", "Surge protection", "Panel mounting accessories"].join("\n"),
    accessoriesPrice: "",
    installationNote: "",
    published: false,
    sortOrder: "0",
    slots: Object.fromEntries(KIT_SLOTS.map((d) => [d.key, { on: false, label: d.label, choices: [], qmin: "1", qdef: "1", qmax: "1" }])),
    addons: [{ label: "Professional installation & commissioning", description: "Quoted after a site survey — it depends on your location, roof and cable runs.", price: "" }],
  };
}

/** A saved kit, shaped for the form. */
export async function kitValues(slug: string): Promise<KitValues | null> {
  const { data: k } = await supabaseAdmin()
    .from("solar_kits")
    .select("*, kit_slots(key, label, qty_default, qty_min, qty_max, kit_slot_choices(product_slug, sort_order)), kit_accessories(name, detail, sort_order), kit_addons(label, description, price_ngn)")
    .eq("slug", slug)
    .maybeSingle();
  if (!k) return null;
  const base = emptyKitValues();
  const slots = { ...base.slots };
  for (const s of k.kit_slots as { key: string; label: string; qty_default: number; qty_min: number; qty_max: number; kit_slot_choices: { product_slug: string; sort_order: number }[] }[]) {
    if (!(s.key in slots)) continue;
    slots[s.key] = {
      on: true,
      label: s.label,
      choices: [...s.kit_slot_choices].sort((a, b) => a.sort_order - b.sort_order).map((c) => c.product_slug),
      qmin: String(s.qty_min),
      qdef: String(s.qty_default),
      qmax: String(s.qty_max),
    };
  }
  const acc = [...(k.kit_accessories as { name: string; detail: string | null; sort_order: number }[])].sort((a, b) => a.sort_order - b.sort_order);
  return {
    slug: k.slug,
    name: k.name,
    capacityLabel: k.capacity_label,
    tag: k.tag ?? "",
    summary: k.summary,
    applications: (k.applications ?? []).join("\n"),
    outline: (k.outline ?? []).join("\n"),
    imageUrl: k.image_url ?? "",
    imageAlt: k.image_alt ?? "",
    imagePosition: k.image_position ?? "",
    purchasable: k.purchasable,
    accessories: acc.map((a) => (a.detail ? `${a.name} — ${a.detail}` : a.name)).join("\n"),
    accessoriesPrice: k.accessories_price_ngn === null ? "" : String(k.accessories_price_ngn),
    installationNote: k.installation_note ?? "",
    published: k.published,
    sortOrder: String(k.sort_order),
    slots,
    addons: (k.kit_addons as { label: string; description: string | null; price_ngn: number | null }[]).map((a) => ({ label: a.label, description: a.description ?? "", price: a.price_ngn === null ? "" : String(a.price_ngn) })),
  };
}
