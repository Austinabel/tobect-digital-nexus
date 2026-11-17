import { supabaseAdmin } from "@/lib/supabase/server";
import type { LibraryImage } from "./product-form";
import type { ExistingProduct } from "@/lib/admin/product-dedupe";

/** Categories, existing brand names and media-library images for the product form. */
export async function productFormData() {
  const admin = supabaseAdmin();
  const [{ data: cats }, { data: brandRows }, { data: media }] = await Promise.all([
    admin.from("categories").select("slug, name, parent_slug").order("sort_order"),
    admin.from("products").select("brand").not("brand", "is", null),
    admin.from("media_assets").select("id, public_url, alt, filename").is("deleted_at", null).order("created_at", { ascending: false }).limit(300),
  ]);
  const library: LibraryImage[] = (media ?? []).map((m) => ({ id: m.id, url: m.public_url, alt: m.alt, filename: m.filename }));
  const brands = [...new Set((brandRows ?? []).map((b) => b.brand as string))].sort();
  return { categories: cats ?? [], brands, library };
}

/** Every product (trash included) in the shape the duplicate check needs. Server-only helper — not an action. */
export async function existingProducts(): Promise<ExistingProduct[]> {
  const { data } = await supabaseAdmin().from("products").select("slug, name, brand, model, sku, barcode, deleted_at, published");
  return (data ?? []).map((p) => ({ slug: p.slug, name: p.name, brand: p.brand, model: p.model, sku: p.sku, barcode: p.barcode, deleted: Boolean(p.deleted_at), published: p.published }));
}
