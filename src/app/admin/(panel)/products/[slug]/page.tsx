import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminHeader, NoAccess, ghostButtonClass } from "@/components/admin/admin-ui";
import { can, getStaff } from "@/lib/admin/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { ProductForm } from "../product-form";
import { productFormData } from "../data";
import { scanAvailable } from "@/lib/admin/product-scan";
import { trashProduct } from "../actions";

export const metadata = { title: "Edit product" };

const str = (v: unknown) => (v === null || v === undefined ? "" : String(v));

export default async function EditProductPage(props: PageProps<"/admin/products/[slug]">) {
  const { staff } = await getStaff();
  if (!can(staff, "products.manage")) return <NoAccess reason="permission" />;
  const { slug } = await props.params;
  const { saved } = await props.searchParams;

  const { data: p } = await supabaseAdmin().from("products").select("*, product_images(media_id, sort_order)").eq("slug", slug).maybeSingle();
  if (!p) notFound();
  const { categories, brands, library } = await productFormData();
  const spec = (p.inverter_spec ?? {}) as { batteryV?: number; maxPvV?: number; mpptMinV?: number };
  const images = [...((p.product_images ?? []) as { media_id: string; sort_order: number }[])].sort((a, b) => a.sort_order - b.sort_order).map((i) => i.media_id);

  return (
    <>
      <AdminHeader
        title={p.name}
        intro={
          <span className="flex flex-wrap gap-x-3">
            <Link href="/admin/products" className="font-semibold text-blue hover:underline">
              ← All products
            </Link>
            {p.deleted_at ? <span className="font-semibold text-red-dark">In the trash — hidden from the shop</span> : p.published ? <span className="text-[#17733b]">Live in the shop</span> : <span>Draft</span>}
          </span>
        }
        actions={
          !p.deleted_at && (
            <div className="flex gap-2">
              {p.published && (
                <Link href={`/product/${p.slug}`} target="_blank" className={ghostButtonClass}>
                  View in shop ↗
                </Link>
              )}
              <form action={trashProduct}>
                <input type="hidden" name="slug" value={p.slug} />
                <button type="submit" className={`${ghostButtonClass} hover:border-red hover:text-red`}>
                  Move to trash
                </button>
              </form>
            </div>
          )
        }
      />
      {saved === "1" && <p role="status" className="mb-4 rounded-xl border border-[#bfe4cd] bg-[#effaf3] px-4 py-3 text-[0.88rem] font-semibold text-[#17733b]">Saved — the shop shows the changes now.</p>}
      <ProductForm
        mode="edit"
        isSample={p.is_sample}
        categories={categories}
        brands={brands}
        library={library}
        canScan={scanAvailable()}
        initial={{
          slug: p.slug,
          name: p.name,
          brand: str(p.brand),
          model: str(p.model),
          sku: str(p.sku),
          barcode: str(p.barcode),
          category: p.category_slug,
          price: str(p.price_ngn),
          compareAt: str(p.compare_at_price_ngn),
          availability: str(p.availability),
          stock: str(p.stock_quantity),
          specs: (p.specs ?? []).join(", "),
          attributes: p.attributes ?? {},
          description: str(p.description),
          seoTitle: str(p.seo_title),
          seoDescription: str(p.seo_description),
          invBatteryV: str(spec.batteryV),
          invMaxPv: str(spec.maxPvV),
          invMpptMin: str(spec.mpptMinV),
          featured: p.featured,
          published: p.published,
          imageIds: images,
        }}
      />
    </>
  );
}
