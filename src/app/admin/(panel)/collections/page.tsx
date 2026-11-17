import Link from "next/link";
import { AdminCard, AdminHeader, NoAccess, buttonClass, ghostButtonClass, inputClass } from "@/components/admin/admin-ui";
import { can, getStaff } from "@/lib/admin/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/data/products";
import { COLLECTIONS, MAX_COLLECTION } from "@/lib/admin/collections";
import { addToCollection, moveInCollection, removeFromCollection } from "./actions";

export const metadata = { title: "Collections" };

export default async function CollectionsPage(props: PageProps<"/admin/collections">) {
  const { staff } = await getStaff();
  if (!can(staff, "catalog.manage")) return <NoAccess reason="permission" />;
  const { notice } = await props.searchParams;
  const admin = supabaseAdmin();
  const [{ data: items }, { data: products }] = await Promise.all([
    admin.from("collection_items").select("collection, product_slug, sort_order").order("sort_order"),
    admin.from("products").select("slug, name, price_ngn, compare_at_price_ngn, published, featured").is("deleted_at", null).order("name"),
  ]);
  const bySlug = new Map((products ?? []).map((p) => [p.slug, p]));
  const featured = (products ?? []).filter((p) => p.featured && p.published);
  const onSale = (products ?? []).filter((p) => p.published && p.compare_at_price_ngn !== null && Number(p.compare_at_price_ngn) > Number(p.price_ngn));

  return (
    <>
      <AdminHeader title="Collections" intro="The product rows on the shop page. Choose which products appear in each row and in what order." />
      {typeof notice === "string" && (
        <p role="status" className="mb-4 rounded-xl border border-hair bg-white px-4 py-3 text-[0.88rem] text-ink">
          {notice.slice(0, 200)}
        </p>
      )}
      <div className="grid items-start gap-4 xl:grid-cols-2">
        {COLLECTIONS.map((c) => {
          const list = (items ?? []).filter((i) => i.collection === c.key).map((i) => i.product_slug);
          const available = (products ?? []).filter((p) => !list.includes(p.slug));
          return (
            <AdminCard key={c.key} title={`${c.title} (${list.length}/${MAX_COLLECTION})`}>
              <p className="-mt-1 mb-3 text-[0.82rem] text-slate">{c.intro}</p>
              {list.length > 0 && (
                <ol className="mb-3 divide-y divide-hair rounded-xl border border-hair">
                  {list.map((slug, i) => {
                    const p = bySlug.get(slug);
                    return (
                      <li key={slug} className="flex flex-wrap items-center gap-2 px-3 py-2 text-[0.86rem]">
                        <span className="w-5 text-slate-light tabular-nums">{i + 1}</span>
                        <span className="min-w-0 grow">
                          <Link href={`/admin/products/${slug}`} className="font-semibold text-ink hover:text-blue">
                            {p?.name ?? slug}
                          </Link>
                          {p && <span className="text-slate"> · {formatNaira(Number(p.price_ngn))}</span>}
                          {p && !p.published && <span className="ml-1.5 text-[0.74rem] font-semibold text-red-dark">hidden — not shown</span>}
                        </span>
                        {(["up", "down"] as const).map((dir) => (
                          <form key={dir} action={moveInCollection}>
                            <input type="hidden" name="collection" value={c.key} />
                            <input type="hidden" name="slug" value={slug} />
                            <input type="hidden" name="dir" value={dir} />
                            <button disabled={dir === "up" ? i === 0 : i === list.length - 1} aria-label={`Move ${p?.name ?? slug} ${dir}`} className="grid size-8 place-items-center rounded-lg text-slate hover:bg-field disabled:opacity-30">
                              {dir === "up" ? "↑" : "↓"}
                            </button>
                          </form>
                        ))}
                        <form action={removeFromCollection}>
                          <input type="hidden" name="collection" value={c.key} />
                          <input type="hidden" name="slug" value={slug} />
                          <button aria-label={`Remove ${p?.name ?? slug} from ${c.title}`} className="text-[0.78rem] font-semibold text-slate hover:text-red">
                            Remove
                          </button>
                        </form>
                      </li>
                    );
                  })}
                </ol>
              )}
              {list.length < MAX_COLLECTION && (
                <form action={addToCollection} className="flex gap-2">
                  <input type="hidden" name="collection" value={c.key} />
                  <select name="slug" required defaultValue="" aria-label={`Product to add to ${c.title}`} className={inputClass}>
                    <option value="" disabled>
                      Choose a product…
                    </option>
                    {available.map((p) => (
                      <option key={p.slug} value={p.slug}>
                        {p.name}
                        {p.published ? "" : " (hidden)"}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className={buttonClass}>
                    Add
                  </button>
                </form>
              )}
            </AdminCard>
          );
        })}

        <AdminCard title={`Featured (${featured.length})`}>
          <p className="-mt-1 mb-3 text-[0.82rem] text-slate">Shown on the homepage. Tick “Featured” on a product to add it here.</p>
          {featured.length ? (
            <ul className="space-y-1 text-[0.86rem]">
              {featured.map((p) => (
                <li key={p.slug}>
                  <Link href={`/admin/products/${p.slug}`} className="font-semibold text-blue hover:underline">
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[0.86rem] text-slate">No featured products.</p>
          )}
        </AdminCard>

        <AdminCard title={`Sale & Deals (${onSale.length})`}>
          <p className="-mt-1 mb-3 text-[0.82rem] text-slate">Automatic: every published product with a genuine previous price. Set “Previous price” on a product to add it.</p>
          {onSale.length ? (
            <ul className="space-y-1 text-[0.86rem]">
              {onSale.map((p) => (
                <li key={p.slug}>
                  <Link href={`/admin/products/${p.slug}`} className="font-semibold text-blue hover:underline">
                    {p.name}
                  </Link>{" "}
                  <span className="text-slate">
                    <s>{formatNaira(Number(p.compare_at_price_ngn))}</s> {formatNaira(Number(p.price_ngn))}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[0.86rem] text-slate">No products on sale.</p>
          )}
          <Link href="/admin/products" className={`${ghostButtonClass} mt-3`}>
            Go to products
          </Link>
        </AdminCard>
      </div>
    </>
  );
}
