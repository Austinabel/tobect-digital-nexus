import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AdminCard, AdminHeader, NoAccess, buttonClass, ghostButtonClass, inputClass } from "@/components/admin/admin-ui";
import { can, getStaff } from "@/lib/admin/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/data/products";
import { deleteProductForever, restoreProduct, trashAllSamples } from "./actions";

export const metadata = { title: "Products" };

const TABS = [
  { key: "", label: "All" },
  { key: "live", label: "Live" },
  { key: "draft", label: "Drafts" },
  { key: "sample", label: "Samples" },
  { key: "trash", label: "Trash" },
] as const;

interface Row {
  slug: string;
  name: string;
  brand: string | null;
  category_slug: string;
  price_ngn: number;
  availability: string | null;
  stock_quantity: number | null;
  published: boolean;
  is_sample: boolean;
  deleted_at: string | null;
  updated_at: string;
  product_images: { sort_order: number; media_assets: { public_url: string } | null }[];
}

export default async function ProductsAdminPage(props: PageProps<"/admin/products">) {
  const { staff } = await getStaff();
  if (!can(staff, "products.manage")) return <NoAccess reason="permission" />;
  const sp = await props.searchParams;
  const status = typeof sp.status === "string" ? sp.status : "";
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 80) : "";
  const cat = typeof sp.category === "string" ? sp.category : "";
  const notice = typeof sp.notice === "string" ? sp.notice.slice(0, 300) : null;

  const admin = supabaseAdmin();
  let query = admin.from("products").select("slug, name, brand, category_slug, price_ngn, availability, stock_quantity, published, is_sample, deleted_at, updated_at, product_images(sort_order, media_assets(public_url))").order("updated_at", { ascending: false }).limit(500);
  query = status === "trash" ? query.not("deleted_at", "is", null) : query.is("deleted_at", null);
  if (status === "live") query = query.eq("published", true);
  if (status === "draft") query = query.eq("published", false);
  if (status === "sample") query = query.eq("is_sample", true);
  if (cat) query = query.eq("category_slug", cat);
  if (q) {
    const t = q.replace(/[%,()]/g, " ");
    query = query.or(`name.ilike.%${t}%,brand.ilike.%${t}%,model.ilike.%${t}%,sku.ilike.%${t}%,barcode.ilike.%${t.replace(/\D/g, "") || t}%`);
  }
  const [{ data }, { data: cats }, { count: sampleCount }] = await Promise.all([
    query,
    admin.from("categories").select("slug, name").order("sort_order"),
    admin.from("products").select("slug", { count: "exact", head: true }).eq("is_sample", true).is("deleted_at", null),
  ]);
  const rows = (data ?? []) as unknown as Row[];
  const catName = new Map((cats ?? []).map((c) => [c.slug, c.name]));
  const tabHref = (key: string) => `/admin/products${key ? `?status=${key}` : ""}`;

  return (
    <>
      <AdminHeader
        title="Products"
        intro="Everything in the shop. Changes appear on the website as soon as you save."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/products/import" className={`${ghostButtonClass} h-10`}>
              Bulk import (Excel / CSV)
            </Link>
            <Link href="/admin/products/new" className={buttonClass}>
              + Add product
            </Link>
          </div>
        }
      />
      {notice && <p role="status" className="mb-4 rounded-xl border border-hair bg-white px-4 py-3 text-[0.88rem] text-ink">{notice}</p>}

      {(sampleCount ?? 0) > 0 && status !== "trash" && (
        <AdminCard className="mb-4 border-gold/40 bg-[#fffaf0]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[0.88rem] text-ink">
              <strong>{sampleCount} sample product{sampleCount === 1 ? "" : "s"}</strong> from the starter catalogue {sampleCount === 1 ? "is" : "are"} still in the shop. While any remain, the shop shows an &ldquo;indicative prices&rdquo; notice.
            </p>
            <form action={trashAllSamples} className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-[0.8rem] text-slate">
                <input type="checkbox" name="confirm" value="yes" required className="accent-[var(--color-red)]" /> I&rsquo;m sure
              </label>
              <button type="submit" className={`${ghostButtonClass} hover:border-red hover:text-red`}>
                Move all samples to trash
              </button>
            </form>
          </div>
        </AdminCard>
      )}

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Product status" className="flex flex-wrap gap-1.5">
          {TABS.map((t) => (
            <Link key={t.key} href={tabHref(t.key)} aria-current={status === t.key ? "page" : undefined} className={cn("rounded-full border px-3.5 py-1.5 text-[0.82rem] font-semibold", status === t.key ? "border-blue bg-blue text-white" : "border-hair bg-white text-slate hover:border-blue")}>
              {t.label}
            </Link>
          ))}
        </nav>
        <form className="flex gap-2" action="/admin/products">
          {status && <input type="hidden" name="status" value={status} />}
          <select name="category" defaultValue={cat} aria-label="Category" className={`${inputClass} h-9 w-auto`}>
            <option value="">All categories</option>
            {(cats ?? []).map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <input name="q" defaultValue={q} placeholder="Search name, brand, model" aria-label="Search products" className={`${inputClass} h-9 w-[220px]`} />
          <button type="submit" className={ghostButtonClass}>
            Filter
          </button>
        </form>
      </div>

      <AdminCard className="p-0">
        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-[0.88rem]">
              <thead className="border-b border-hair text-[0.72rem] uppercase tracking-[0.08em] text-slate">
                <tr>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 text-right font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Stock</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">{status === "trash" ? "" : "Updated"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hair">
                {rows.map((r) => {
                  const img = [...r.product_images].sort((a, b) => a.sort_order - b.sort_order)[0]?.media_assets?.public_url;
                  return (
                    <tr key={r.slug} className="hover:bg-field/60">
                      <td className="px-4 py-2.5">
                        <Link href={`/admin/products/${r.slug}`} className="flex items-center gap-3">
                          <span className="relative size-11 shrink-0 overflow-hidden rounded-lg border border-hair bg-field">
                            {img && <Image src={img} alt="" fill sizes="44px" className="object-cover" />}
                          </span>
                          <span className="min-w-0">
                            <span className="block font-semibold text-ink hover:text-blue">{r.name}</span>
                            <span className="block text-[0.76rem] text-slate">{r.brand ?? "—"}</span>
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-slate">{catName.get(r.category_slug) ?? r.category_slug}</td>
                      <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-ink">{formatNaira(Number(r.price_ngn))}</td>
                      <td className="px-4 py-2.5 text-slate">{r.stock_quantity !== null ? `${r.stock_quantity} units` : r.availability ? r.availability.replace("-", " ") : "Not tracked"}</td>
                      <td className="px-4 py-2.5">
                        <span className="flex flex-wrap gap-1">
                          {r.deleted_at ? (
                            <span className="rounded-md bg-red/10 px-2 py-0.5 text-[0.72rem] font-bold text-red-dark">Trash</span>
                          ) : r.published ? (
                            <span className="rounded-md bg-whatsapp/15 px-2 py-0.5 text-[0.72rem] font-bold text-[#17733b]">Live</span>
                          ) : (
                            <span className="rounded-md bg-field px-2 py-0.5 text-[0.72rem] font-bold text-slate">Draft</span>
                          )}
                          {r.is_sample && <span className="rounded-md bg-gold/20 px-2 py-0.5 text-[0.72rem] font-bold text-ink">Sample</span>}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-[0.8rem] text-slate">
                        {r.deleted_at ? (
                          <span className="flex gap-1.5">
                            <form action={restoreProduct}>
                              <input type="hidden" name="slug" value={r.slug} />
                              <button type="submit" className={ghostButtonClass}>
                                Restore
                              </button>
                            </form>
                            <form action={deleteProductForever}>
                              <input type="hidden" name="slug" value={r.slug} />
                              <button type="submit" className={`${ghostButtonClass} hover:border-red hover:text-red`}>
                                Delete forever
                              </button>
                            </form>
                          </span>
                        ) : (
                          new Date(r.updated_at).toLocaleDateString("en-NG", { day: "numeric", month: "short" })
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-5 text-slate">{status === "trash" ? "The trash is empty." : q || cat ? "No products match these filters." : "No products yet — add your first one."}</p>
        )}
      </AdminCard>
    </>
  );
}
