import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AdminCard, AdminHeader, NoAccess, buttonClass, ghostButtonClass } from "@/components/admin/admin-ui";
import { can, getStaff } from "@/lib/admin/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { mapKit, KIT_SELECT } from "@/lib/catalog-server";
import { formatNaira } from "@/lib/data/products";
import { defaultKitConfig, priceKit, type KitCatalogueProduct } from "@/lib/shop/kits";
import { deleteKit } from "./actions";

export const metadata = { title: "Solar kits" };

export default async function KitsPage(props: PageProps<"/admin/kits">) {
  const { staff } = await getStaff();
  if (!can(staff, "catalog.manage")) return <NoAccess reason="permission" />;
  const { notice } = await props.searchParams;
  const admin = supabaseAdmin();
  const [{ data: rows }, { data: prods }] = await Promise.all([
    admin.from("solar_kits").select(KIT_SELECT).order("sort_order").order("name"),
    admin.from("products").select("slug, name, price_ngn, availability, published, deleted_at"),
  ]);
  // what the shop can actually sell: published, not trashed
  const live = new Map<string, KitCatalogueProduct>((prods ?? []).filter((p) => p.published && !p.deleted_at).map((p) => [p.slug, { slug: p.slug, name: p.name, priceNgn: Number(p.price_ngn), availability: p.availability ?? undefined }]));

  return (
    <>
      <AdminHeader
        title="Solar kits"
        intro="Complete packages shown in the shop. Prices add up automatically from the component products, so they change when product prices change."
        actions={
          <Link href="/admin/kits/new" className={buttonClass}>
            + New kit
          </Link>
        }
      />
      {typeof notice === "string" && (
        <p role="status" className="mb-4 rounded-xl border border-hair bg-white px-4 py-3 text-[0.88rem] text-ink">
          {notice.slice(0, 200)}
        </p>
      )}
      <AdminCard className="p-0">
        {rows?.length ? (
          <ul className="divide-y divide-hair">
            {(rows as unknown as (Parameters<typeof mapKit>[0] & { published: boolean; is_sample: boolean })[]).map((r) => {
              const kit = mapKit(r);
              const missing = kit.slots.filter((s) => !s.choices.some((c) => live.has(c)));
              const sells = kit.purchasable && kit.slots.length > 0 && !missing.length;
              const price = sells ? priceKit(kit, defaultKitConfig(kit), (s) => live.get(s)) : null;
              const status = !r.published ? ["Hidden", "bg-field text-slate"] : sells ? ["Sold online", "bg-[#e6f6ec] text-[#17733b]"] : ["Quote only", "bg-mist text-blue"];
              return (
                <li key={kit.slug} className="flex flex-wrap items-center gap-3 px-4 py-3 sm:flex-nowrap">
                  <span className="relative block h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-[linear-gradient(115deg,#0b1930_0%,#10306b_60%,#1556d9_130%)]">
                    {kit.photo && <Image src={kit.photo} alt="" fill sizes="80px" className="object-cover" />}
                  </span>
                  <span className="min-w-0 grow">
                    <Link href={`/admin/kits/${kit.slug}`} className="font-semibold text-blue hover:underline">
                      {kit.name}
                    </Link>
                    <span className="block text-[0.76rem] text-slate">
                      {kit.capacityLabel}
                      {price && ` · from ${formatNaira(price.totalNgn)}${price.hasUnpricedParts ? " + accessories/extras agreed per order" : ""}`}
                      {kit.purchasable && missing.length > 0 && ` · can't sell online: no published product for ${missing.map((m) => m.label.toLowerCase()).join(", ")}`}
                      {r.is_sample && " · sample"}
                    </span>
                  </span>
                  <span className={cn("rounded-md px-2 py-0.5 text-[0.72rem] font-bold", status[1])}>{status[0]}</span>
                  {!r.published && (
                    <form action={deleteKit}>
                      <input type="hidden" name="slug" value={kit.slug} />
                      <button className={`${ghostButtonClass} hover:border-red hover:text-red`} aria-label={`Delete ${kit.name}`}>
                        Delete
                      </button>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="p-5 text-slate">No kits yet.</p>
        )}
      </AdminCard>
    </>
  );
}
