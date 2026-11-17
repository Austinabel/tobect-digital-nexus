import Link from "next/link";
import { cn } from "@/lib/utils";
import { AdminCard, AdminHeader, NoAccess } from "@/components/admin/admin-ui";
import { can, getStaff } from "@/lib/admin/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { QUOTE_BADGE, QUOTE_STATUSES } from "@/lib/admin/quotes";

export const metadata = { title: "Quote requests" };

export default async function QuotesPage(props: PageProps<"/admin/quotes">) {
  const { staff } = await getStaff();
  if (!can(staff, "quotes.manage")) return <NoAccess reason="permission" />;
  const sp = await props.searchParams;
  const status = typeof sp.status === "string" && (QUOTE_STATUSES as readonly string[]).includes(sp.status) ? sp.status : "";
  const kind = sp.kind === "bulk" || sp.kind === "standard" ? sp.kind : "";

  const admin = supabaseAdmin();
  let q = admin.from("quote_requests").select("id, reference, kind, name, business_name, phone, delivery_location, status, created_at, quote_request_items(id)").order("created_at", { ascending: false }).limit(300);
  q = status ? q.eq("status", status) : q.neq("status", "spam");
  if (kind) q = q.eq("kind", kind);
  const [{ data: rows }, { data: all }] = await Promise.all([q, admin.from("quote_requests").select("status")]);
  const counts = new Map<string, number>();
  for (const r of all ?? []) counts.set(r.status, (counts.get(r.status) ?? 0) + 1);
  const href = (s: string, k = kind) => `/admin/quotes?${new URLSearchParams({ ...(s ? { status: s } : {}), ...(k ? { kind: k } : {}) })}`;

  return (
    <>
      <AdminHeader title="Quote requests" intro="Every quote and bulk-quote request from the website, including the ones customers also sent on WhatsApp." />
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Quote status" className="flex flex-wrap gap-1.5">
          {["", ...QUOTE_STATUSES].map((s) => (
            <Link key={s || "all"} href={href(s)} aria-current={status === s ? "page" : undefined} className={cn("rounded-full border px-3 py-1.5 text-[0.8rem] font-semibold capitalize", status === s ? "border-blue bg-blue text-white" : "border-hair bg-white text-slate hover:border-blue")}>
              {s || "All"}
              {s && counts.get(s) ? <span className="ml-1 opacity-70">{counts.get(s)}</span> : null}
            </Link>
          ))}
        </nav>
        <nav aria-label="Request type" className="flex gap-1.5">
          {[
            ["", "All types"],
            ["standard", "Quotes"],
            ["bulk", "Bulk"],
          ].map(([k, label]) => (
            <Link key={k || "all"} href={href(status, k)} aria-current={kind === k ? "page" : undefined} className={cn("rounded-full border px-3 py-1.5 text-[0.8rem] font-semibold", kind === k ? "border-ink bg-ink text-white" : "border-hair bg-white text-slate hover:border-ink")}>
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <AdminCard className="p-0">
        {rows?.length ? (
          <ul className="divide-y divide-hair">
            {rows.map((r) => (
              <li key={r.id}>
                <Link href={`/admin/quotes/${r.id}`} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 hover:bg-field/60">
                  <span className="min-w-0">
                    <span className="font-heading font-bold text-blue">{r.reference}</span>{" "}
                    <span className="font-semibold text-ink">{r.business_name ? `${r.business_name} (${r.name})` : r.name}</span>
                    <span className="block text-[0.78rem] text-slate">
                      {r.kind === "bulk" ? `Bulk · ${r.quote_request_items.length} product line${r.quote_request_items.length === 1 ? "" : "s"}` : "Quote request"} · {r.delivery_location} · {r.phone}
                    </span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className={cn("rounded-md px-2 py-0.5 text-[0.72rem] font-bold capitalize", QUOTE_BADGE[r.status])}>{r.status}</span>
                    <span className="text-[0.76rem] text-slate-light">{new Date(r.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-5 text-slate">{status || kind ? "No requests match." : "No quote requests yet. They appear here when customers use the quote or bulk-quote forms."}</p>
        )}
      </AdminCard>
    </>
  );
}
