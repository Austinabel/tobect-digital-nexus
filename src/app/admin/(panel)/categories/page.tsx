import Link from "next/link";
import { cn } from "@/lib/utils";
import { AdminCard, AdminHeader, NoAccess, buttonClass, ghostButtonClass, inputClass } from "@/components/admin/admin-ui";
import { can, getStaff } from "@/lib/admin/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { categoryGlyphs } from "@/components/icons";
import { deleteCategory, saveCategory } from "./actions";

export const metadata = { title: "Categories & brands" };

const GLYPHS = Object.keys(categoryGlyphs).filter((g) => g !== "all" && g !== "kit");

interface Cat {
  slug: string;
  name: string;
  glyph: string;
  sort_order: number;
  parent_slug: string | null;
}

export default async function CategoriesPage(props: PageProps<"/admin/categories">) {
  const { staff } = await getStaff();
  if (!can(staff, "catalog.manage")) return <NoAccess reason="permission" />;
  const { notice } = await props.searchParams;
  const admin = supabaseAdmin();
  const [{ data: catRows }, { data: prods }] = await Promise.all([
    admin.from("categories").select("slug, name, glyph, sort_order, parent_slug").order("sort_order").order("name"),
    admin.from("products").select("category_slug, brand, deleted_at"),
  ]);
  const cats = (catRows ?? []) as Cat[];
  const top = cats.filter((c) => !c.parent_slug);
  const childrenOf = (slug: string) => cats.filter((c) => c.parent_slug === slug);
  const counts = new Map<string, number>();
  const brands = new Map<string, number>();
  for (const p of prods ?? []) {
    if (p.deleted_at) continue;
    counts.set(p.category_slug, (counts.get(p.category_slug) ?? 0) + 1);
    if (p.brand) brands.set(p.brand, (brands.get(p.brand) ?? 0) + 1);
  }
  const total = (slug: string) => (counts.get(slug) ?? 0) + childrenOf(slug).reduce((n, c) => n + (counts.get(c.slug) ?? 0), 0);

  const Row = ({ c, sub }: { c: Cat; sub?: boolean }) => {
    const kids = childrenOf(c.slug);
    const own = counts.get(c.slug) ?? 0;
    return (
      <li className={cn("py-3", sub && "ml-6 border-l-2 border-mist pl-4 sm:ml-10")}>
        <form action={saveCategory} className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="existing_slug" value={c.slug} />
          <span aria-hidden className="mb-1 grid size-9 shrink-0 place-items-center rounded-lg bg-mist text-blue [&>svg]:size-5">
            {categoryGlyphs[c.glyph as keyof typeof categoryGlyphs] ?? categoryGlyphs.panel}
          </span>
          <label className="min-w-[150px] grow">
            <span className="text-[0.72rem] font-semibold text-slate">{sub ? "Subcategory" : "Category"}</span>
            <input name="name" defaultValue={c.name} required className={`${inputClass} h-9`} />
          </label>
          <label>
            <span className="text-[0.72rem] font-semibold text-slate">Under</span>
            <select name="parent_slug" defaultValue={c.parent_slug ?? ""} disabled={kids.length > 0} title={kids.length ? "Has its own subcategories" : undefined} className={`${inputClass} h-9 w-auto max-w-[170px]`}>
              <option value="">— Main category —</option>
              {top
                .filter((t) => t.slug !== c.slug)
                .map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.name}
                  </option>
                ))}
            </select>
          </label>
          <label>
            <span className="text-[0.72rem] font-semibold text-slate">Icon</span>
            <select name="glyph" defaultValue={c.glyph} className={`${inputClass} h-9 w-auto`}>
              {GLYPHS.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </label>
          <label className="w-[68px]">
            <span className="text-[0.72rem] font-semibold text-slate">Order</span>
            <input name="sort_order" type="number" min={0} max={999} defaultValue={c.sort_order} className={`${inputClass} h-9`} />
          </label>
          <button type="submit" className={ghostButtonClass}>
            Save
          </button>
          <Link href={`/shop/${c.slug}`} target="_blank" className="mb-2 text-[0.78rem] font-semibold text-blue hover:underline">
            {sub ? own : total(c.slug)} products ↗
          </Link>
        </form>
        {own === 0 && kids.length === 0 && (
          <form action={deleteCategory} className="mt-1.5">
            <input type="hidden" name="slug" value={c.slug} />
            <button type="submit" className="text-[0.76rem] font-semibold text-slate hover:text-red">
              Delete this empty {sub ? "subcategory" : "category"}
            </button>
          </form>
        )}
        {kids.length > 0 && (
          <ul className="mt-1">
            {kids.map((k) => (
              <Row key={k.slug} c={k} sub />
            ))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <>
      <AdminHeader
        title="Categories & brands"
        intro="Categories organise the shop menu, filters and homepage. Add subcategories (e.g. Inverters → Hybrid inverters) to split a big category; a main category's page shows all of its subcategories' products too."
      />
      {typeof notice === "string" && <p role="status" className="mb-4 rounded-xl border border-hair bg-white px-4 py-3 text-[0.88rem] text-ink">{notice.slice(0, 300)}</p>}

      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <AdminCard title={`Categories (${top.length} main · ${cats.length - top.length} sub)`}>
          <ul className="divide-y divide-hair">
            {top.map((c) => (
              <Row key={c.slug} c={c} />
            ))}
          </ul>
        </AdminCard>

        <div className="space-y-4">
          <AdminCard title="Add a category or subcategory">
            <form action={saveCategory} className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-[0.8rem] font-semibold text-ink">Name</span>
                <input name="name" required maxLength={60} placeholder="e.g. Hybrid Inverters" className={inputClass} />
              </label>
              <label className="block">
                <span className="mb-1 block text-[0.8rem] font-semibold text-ink">Put it under</span>
                <select name="parent_slug" defaultValue="" className={inputClass}>
                  <option value="">Nothing — it&rsquo;s a main category</option>
                  {top.map((t) => (
                    <option key={t.slug} value={t.slug}>
                      {t.name} (as a subcategory)
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-[0.8rem] font-semibold text-ink">Web address (optional)</span>
                <input name="slug" placeholder="hybrid-inverters" className={inputClass} />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="mb-1 block text-[0.8rem] font-semibold text-ink">Icon</span>
                  <select name="glyph" defaultValue="inverter" className={inputClass}>
                    {GLYPHS.map((g) => (
                      <option key={g}>{g}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-[0.8rem] font-semibold text-ink">Order</span>
                  <input name="sort_order" type="number" min={0} max={999} defaultValue={cats.length + 1} className={inputClass} />
                </label>
              </div>
              <button type="submit" className={`${buttonClass} w-full`}>
                Add
              </button>
            </form>
          </AdminCard>

          <AdminCard title="Brands">
            <p className="mb-2 text-[0.8rem] text-slate">Brands come from the products themselves — type the brand on a product and it appears in the shop&rsquo;s brand filter.</p>
            <ul className="flex flex-wrap gap-1.5">
              {[...brands.entries()].sort().map(([b, n]) => (
                <li key={b} className="rounded-full bg-mist px-2.5 py-1 text-[0.78rem] font-semibold text-blue-deep">
                  {b} · {n}
                </li>
              ))}
            </ul>
          </AdminCard>
        </div>
      </div>
    </>
  );
}
