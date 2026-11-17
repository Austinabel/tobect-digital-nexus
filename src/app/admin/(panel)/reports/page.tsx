import Link from "next/link";
import { cn } from "@/lib/utils";
import { AdminCard, AdminHeader, NoAccess, ghostButtonClass } from "@/components/admin/admin-ui";
import { can, getStaff } from "@/lib/admin/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/data/products";
import { PAYMENT_METHOD } from "@/lib/shop/order-labels";
import { RANGES, bucket, buildSalesReport, rangeStart, type RangeDays, type ReportItem, type ReportOrder } from "@/lib/admin/reports";
import { SalesChart } from "./sales-chart";

export const metadata = { title: "Reports" };

const RANGE_LABEL: Record<RangeDays, string> = { 7: "7 days", 30: "30 days", 90: "90 days", 365: "12 months" };

function Tile({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-2xl border border-hair bg-white p-4">
      <p className="font-heading text-[0.68rem] font-bold uppercase tracking-[0.12em] text-slate">{label}</p>
      <p className="mt-1 font-heading text-[1.5rem] font-extrabold tabular-nums text-ink">{value}</p>
      <p className="text-[0.74rem] text-slate-light">{note}</p>
    </div>
  );
}

export default async function ReportsPage(props: PageProps<"/admin/reports">) {
  const { staff } = await getStaff();
  if (!can(staff, "orders.view")) return <NoAccess reason="permission" />;
  const sp = await props.searchParams;
  const days = (RANGES as readonly number[]).includes(Number(sp.days)) ? (Number(sp.days) as RangeDays) : 30;
  const now = new Date();
  const from = rangeStart(now, days);

  const admin = supabaseAdmin();
  const [{ data: orders }, { data: quotes }] = await Promise.all([
    admin.from("orders").select("id, created_at, subtotal_ngn, status, payment_status, payment_method").gte("created_at", from).order("created_at"),
    can(staff, "quotes.manage") ? admin.from("quote_requests").select("status, kind").gte("created_at", from) : Promise.resolve({ data: null }),
  ]);
  const ids = (orders ?? []).map((o) => o.id);
  const { data: items } = ids.length
    ? await admin.from("order_items").select("order_id, kind, item_slug, name, quantity, line_total_ngn").in("order_id", ids)
    : { data: [] as ReportItem[] };
  const r = buildSalesReport((orders ?? []) as ReportOrder[], (items ?? []) as ReportItem[], now, days);
  const weekly = days > 90;
  const points = bucket(r.daily, weekly ? 7 : 1);
  const quoteCounts = new Map<string, number>();
  for (const q of quotes ?? []) quoteCounts.set(q.status, (quoteCounts.get(q.status) ?? 0) + 1);
  const decided = (quoteCounts.get("won") ?? 0) + (quoteCounts.get("lost") ?? 0);

  return (
    <>
      <AdminHeader
        title="Reports"
        intro="Sales are orders your team has confirmed (not cancelled or returned). Days follow Nigerian time."
        actions={
          <a href={`/admin/reports/orders.csv?days=${days}`} className={ghostButtonClass} download>
            Download orders (CSV)
          </a>
        }
      />
      <nav aria-label="Report period" className="mb-4 flex flex-wrap gap-1.5">
        {RANGES.map((d) => (
          <Link key={d} href={`/admin/reports?days=${d}`} aria-current={d === days ? "page" : undefined} className={cn("rounded-full border px-3 py-1.5 text-[0.82rem] font-semibold", d === days ? "border-blue bg-blue text-white" : "border-hair bg-white text-slate hover:border-blue")}>
            Last {RANGE_LABEL[d]}
          </Link>
        ))}
      </nav>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Tile label="Sales" value={formatNaira(r.salesValue)} note={`${r.salesCount} confirmed order${r.salesCount === 1 ? "" : "s"}`} />
        <Tile label="Paid" value={formatNaira(r.paidValue)} note="Payment recorded" />
        <Tile label="Average sale" value={r.averageSale === null ? "—" : formatNaira(r.averageSale)} note="Per confirmed order" />
        <Tile label="Orders placed" value={String(r.ordersPlaced)} note="All orders, any status" />
        <Tile label="Awaiting confirmation" value={String(r.awaitingConfirmation)} note="Still “new”" />
        <Tile label="Cancelled / returned" value={String(r.cancelledOrReturned)} note="In this period" />
      </div>

      <div className="mt-4 grid items-start gap-4 xl:grid-cols-[1fr_380px]">
        <AdminCard title={`Sales over the last ${RANGE_LABEL[days]}`}>
          {r.salesCount ? <SalesChart points={points} unit={weekly ? "week" : "day"} /> : <p className="py-8 text-center text-[0.9rem] text-slate">No confirmed sales in this period yet.</p>}
        </AdminCard>
        <div className="space-y-4">
          <AdminCard title="Top sellers">
            {r.topProducts.length ? (
              <ol className="space-y-2 text-[0.86rem]">
                {r.topProducts.map((t, i) => (
                  <li key={t.key} className="flex items-baseline justify-between gap-3">
                    <span className="min-w-0">
                      <span className="mr-1.5 text-slate-light tabular-nums">{i + 1}.</span>
                      {t.kind === "product" ? (
                        <Link href={`/admin/products/${t.slug}`} className="font-semibold text-ink hover:text-blue">
                          {t.name}
                        </Link>
                      ) : (
                        <span className="font-semibold text-ink">{t.name}</span>
                      )}
                      <span className="block pl-5 text-[0.74rem] text-slate">
                        {t.quantity} sold{t.kind === "kit" ? " · solar kit" : ""}
                      </span>
                    </span>
                    <span className="shrink-0 font-semibold tabular-nums">{formatNaira(t.revenue)}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-[0.86rem] text-slate">Appears once orders are confirmed.</p>
            )}
            <p className="mt-3 text-[0.74rem] text-slate">Use this to fill the shop&rsquo;s “Popular Products” row in Collections.</p>
          </AdminCard>
          {r.byPaymentMethod.length > 0 && (
            <AdminCard title="How customers paid">
              <ul className="space-y-1.5 text-[0.86rem]">
                {r.byPaymentMethod.map((m) => (
                  <li key={m.method} className="flex justify-between gap-3">
                    <span>
                      {PAYMENT_METHOD[m.method] ?? m.method} <span className="text-slate">· {m.count}</span>
                    </span>
                    <span className="font-semibold tabular-nums">{formatNaira(m.value)}</span>
                  </li>
                ))}
              </ul>
            </AdminCard>
          )}
          {quotes && (
            <AdminCard title="Quote requests">
              <p className="text-[0.86rem] text-ink">
                <strong className="tabular-nums">{quotes.length}</strong> received ·{" "}
                {["new", "reviewing", "quoted", "won", "lost"].map((s) => `${quoteCounts.get(s) ?? 0} ${s}`).join(" · ")}
              </p>
              <p className="mt-1 text-[0.8rem] text-slate">{decided ? `Win rate: ${Math.round(((quoteCounts.get("won") ?? 0) / decided) * 100)}% of decided quotes.` : "Mark quotes Won or Lost to see your win rate."}</p>
            </AdminCard>
          )}
        </div>
      </div>
    </>
  );
}
