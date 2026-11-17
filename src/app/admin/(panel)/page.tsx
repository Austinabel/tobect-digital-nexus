import Link from "next/link";
import { AdminCard, AdminHeader } from "@/components/admin/admin-ui";
import { can, getStaff } from "@/lib/admin/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { setupChecklist } from "@/lib/admin/setup-checklist";

export const metadata = { title: "Dashboard" };

interface CountFilter {
  eq?: Record<string, string | boolean>;
  neq?: Record<string, string>;
  in?: Record<string, string[]>;
  isNull?: string;
}

async function count(table: string, f: CountFilter = {}) {
  let q = supabaseAdmin().from(table).select("*", { count: "exact", head: true });
  for (const [k, v] of Object.entries(f.eq ?? {})) q = q.eq(k, v);
  for (const [k, v] of Object.entries(f.neq ?? {})) q = q.neq(k, v);
  for (const [k, v] of Object.entries(f.in ?? {})) q = q.in(k, v);
  if (f.isNull) q = q.is(f.isNull, null);
  const { count: n } = await q;
  return n ?? 0;
}

export default async function AdminDashboard() {
  const { staff } = await getStaff();
  if (!staff) return null;

  // Each figure is shown only to roles allowed to see that area.
  const tiles: { label: string; value: number; note: string; show: boolean }[] = [
    { label: "New orders", value: can(staff, "orders.view") ? await count("orders", { eq: { status: "new" } }) : 0, note: "Waiting for confirmation", show: can(staff, "orders.view") },
    { label: "Unpaid orders", value: can(staff, "orders.view") ? await count("orders", { in: { payment_status: ["unpaid", "pending"] }, neq: { status: "cancelled" } }) : 0, note: "Not yet paid", show: can(staff, "orders.view") },
    { label: "Quote requests", value: can(staff, "quotes.manage") ? await count("quote_requests", { eq: { status: "new" } }) : 0, note: "New", show: can(staff, "quotes.manage") },
    { label: "Live products", value: can(staff, "products.manage") ? await count("products", { eq: { published: true } }) : 0, note: "Published in the shop", show: can(staff, "products.manage") },
    { label: "Sample items", value: can(staff, "products.manage") ? await count("products", { eq: { is_sample: true } }) : 0, note: "Starter products to replace", show: can(staff, "products.manage") },
    { label: "Media files", value: can(staff, "media.manage") ? await count("media_assets", { isNull: "deleted_at" }) : 0, note: "In the media library", show: can(staff, "media.manage") },
  ];

  // The setup checklist is for the people who run the site (owner / admin).
  const steps = can(staff, "settings.manage") ? await setupChecklist() : null;
  const required = (steps ?? []).filter((s) => !s.optional);

  const { data: activity } = can(staff, "activity.view")
    ? await supabaseAdmin().from("admin_activity").select("id, actor_email, summary, created_at").order("created_at", { ascending: false }).limit(8)
    : { data: null };

  return (
    <>
      <AdminHeader title={`Welcome back`} intro={`Signed in as ${staff.email} · ${staff.roleLabel}`} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {tiles
          .filter((t) => t.show)
          .map((t) => (
            <div key={t.label} className="rounded-2xl border border-hair bg-white p-4">
              <p className="font-heading text-[0.68rem] font-bold uppercase tracking-[0.12em] text-slate">{t.label}</p>
              <p className="mt-1 font-heading text-[1.8rem] font-extrabold tabular-nums text-ink">{t.value}</p>
              <p className="text-[0.76rem] text-slate-light">{t.note}</p>
            </div>
          ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_360px]">
        <AdminCard title="Recent activity">
          {activity && activity.length > 0 ? (
            <ul className="divide-y divide-hair">
              {activity.map((a) => (
                <li key={a.id} className="flex flex-wrap justify-between gap-2 py-2.5 text-[0.88rem]">
                  <span className="text-ink">{a.summary}</span>
                  <span className="text-[0.78rem] text-slate-light">
                    {a.actor_email ?? "system"} · {new Date(a.created_at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[0.9rem] text-slate">{can(staff, "activity.view") ? "No admin changes yet." : "Your role doesn't include the activity log."}</p>
          )}
          {can(staff, "activity.view") && (
            <Link href="/admin/activity" className="mt-3 inline-block text-[0.84rem] font-semibold text-blue hover:underline">
              Full activity log →
            </Link>
          )}
        </AdminCard>
        {steps ? (
          <AdminCard title={required.every((s) => s.done) ? "Setup complete" : `Getting started · ${required.filter((s) => s.done).length} of ${required.length} done`}>
            <ol className="space-y-2.5">
              {steps.map((s) => (
                <li key={s.key} className="flex gap-2.5 text-[0.86rem]">
                  <span aria-hidden className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-[0.7rem] font-bold ${s.done ? "bg-[#e6f6ec] text-[#17733b]" : "border border-hair text-slate-light"}`}>{s.done ? "✓" : ""}</span>
                  <span className="min-w-0">
                    <Link href={s.href} className={`font-semibold hover:underline ${s.done ? "text-slate line-through decoration-slate-light" : "text-blue"}`}>
                      {s.label}
                    </Link>
                    {s.optional && <span className="ml-1.5 text-[0.7rem] text-slate-light">optional</span>}
                    <span className="sr-only">{s.done ? " (done)" : " (to do)"}</span>
                    {!s.done && <span className="block text-[0.76rem] text-slate">{s.detail}</span>}
                  </span>
                </li>
              ))}
            </ol>
          </AdminCard>
        ) : (
          <AdminCard title="Your access">
            <p className="text-[0.88rem] text-slate">The menu shows the sections your role ({staff.roleLabel}) can use. Ask the site owner if you need more.</p>
          </AdminCard>
        )}
      </div>
    </>
  );
}
